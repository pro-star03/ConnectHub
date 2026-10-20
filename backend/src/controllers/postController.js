const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const socket = require('../socket');

const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, image, poll } = req.body;
    
    if (!content && !image && !poll) {
      return res.status(400).json({ message: 'Post must have content, image, or a poll' });
    }

    const tags = extractHashtags(content);

    let pollData = undefined;
    if (poll && poll.question && Array.isArray(poll.options) && poll.options.length >= 2) {
      pollData = {
        question: poll.question.trim(),
        options: poll.options.map(opt => ({
          text: typeof opt === 'string' ? opt.trim() : (opt.text || '').trim(),
          votes: []
        })).filter(opt => opt.text.length > 0)
      };
    }

    let post = await Post.create({
      user: req.user._id,
      content: content || '',
      image: image || '',
      tags,
      poll: pollData
    });

    post = await post.populate('user', 'name username profilePicture headline');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const { feed, tag, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (tag) {
      query.tags = tag.toLowerCase().replace(/^#/, '');
    } else if (search) {
      query.content = { $regex: search, $options: 'i' };
    } else if (feed === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id).select('following');
      const allowedUsers = [req.user._id, ...(currentUser?.following || [])];
      query.user = { $in: allowedUsers };
    }

    let posts = await Post.find(query)
      .populate('user', 'name username profilePicture headline isVerified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePicture isVerified' }
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    if (feed === 'trending') {
      posts.sort((a, b) => {
        const scoreA = (a.likes?.length || 0) + (a.comments?.length || 0) * 2;
        const scoreB = (b.likes?.length || 0) + (b.comments?.length || 0) * 2;
        return scoreB - scoreA;
      });
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username profilePicture headline isVerified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePicture isVerified' }
      });
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    if (req.body.content !== undefined) {
      post.content = req.body.content;
      post.tags = extractHashtags(req.body.content);
    }
    if (req.body.image !== undefined) {
      post.image = req.body.image;
    }
    
    const updatedPost = await post.save();
    await updatedPost.populate('user', 'name username profilePicture headline');
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    const postId = post._id;
    await post.deleteOne();

    // Cascading deletions
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ post: postId });
    await Notification.deleteMany({ relatedPost: postId });
    await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } });

    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some(id => id.toString() === userIdStr);

    if (!alreadyLiked) {
      post.likes.push(req.user._id);
      if (!post.reactions.some(r => r.user.toString() === userIdStr)) {
        post.reactions.push({ user: req.user._id, type: 'like' });
      }
      await post.save();
      
      // Notify post owner
      if (post.user.toString() !== userIdStr) {
        const targetUser = await User.findById(post.user);
        if (targetUser && targetUser.notificationSettings !== false) {
          const currentUser = await User.findById(req.user._id);
          
          const existingNotification = await Notification.findOne({
            recipient: post.user,
            sender: currentUser._id,
            type: 'like',
            relatedPost: post._id
          });

          if (!existingNotification) {
            const notification = await Notification.create({
              recipient: post.user,
              sender: currentUser._id,
              type: 'like',
              relatedPost: post._id,
              message: `${currentUser.name} liked your post.`
            });

            socket.emitToUser(post.user, 'notification', {
              _id: notification._id,
              sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
              type: 'like',
              message: notification.message,
              relatedPost: post._id,
              createdAt: notification.createdAt
            });
          }
        }
      }

      res.json({ message: 'Post liked successfully', likesCount: post.likes.length, reactions: post.reactions });
    } else {
      res.status(400).json({ message: 'Post already liked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some(id => id.toString() === userIdStr);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
      post.reactions = post.reactions.filter(r => r.user.toString() !== userIdStr);
      await post.save();
      res.json({ message: 'Post unliked successfully', likesCount: post.likes.length, reactions: post.reactions });
    } else {
      res.status(400).json({ message: 'Post has not been liked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    React with specific emotion (like, love, fire, celebrate, laugh, insightful)
// @route   POST /api/posts/:id/react
// @access  Private
const reactPost = async (req, res) => {
  try {
    const { type = 'like' } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userIdStr = req.user._id.toString();
    const existingIndex = post.reactions.findIndex(r => r.user.toString() === userIdStr);

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === type) {
        // Toggle off reaction
        post.reactions.splice(existingIndex, 1);
        post.likes = post.likes.filter(id => id.toString() !== userIdStr);
      } else {
        // Switch reaction type
        post.reactions[existingIndex].type = type;
      }
    } else {
      post.reactions.push({ user: req.user._id, type });
      if (!post.likes.some(id => id.toString() === userIdStr)) {
        post.likes.push(req.user._id);
      }

      // Notification on new reaction
      if (post.user.toString() !== userIdStr) {
        const targetUser = await User.findById(post.user);
        if (targetUser && targetUser.notificationSettings !== false) {
          const currentUser = await User.findById(req.user._id);
          const notification = await Notification.create({
            recipient: post.user,
            sender: currentUser._id,
            type: 'like',
            relatedPost: post._id,
            message: `${currentUser.name} reacted ${type} to your post.`
          });
          socket.emitToUser(post.user, 'notification', {
            _id: notification._id,
            sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
            type: 'like',
            message: notification.message,
            relatedPost: post._id,
            createdAt: notification.createdAt
          });
        }
      }
    }

    await post.save();
    res.json({ message: 'Reaction updated', reactions: post.reactions, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote in post poll
// @route   POST /api/posts/:id/poll/vote
// @access  Private
const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.poll || !post.poll.options || post.poll.options[optionIndex] === undefined) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyVoted = post.poll.options.some(opt =>
      opt.votes.some(v => v.toString() === userIdStr)
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();
    res.json(post.poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Unsave a post
// @route   POST /api/posts/:id/save
// @access  Private
const savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const postIdStr = post._id.toString();
    const userIdStr = req.user._id.toString();

    const isSaved = (user.savedPosts || []).some(id => id.toString() === postIdStr);

    if (!isSaved) {
      user.savedPosts.push(post._id);
      if (!post.savedBy.some(id => id.toString() === userIdStr)) {
        post.savedBy.push(req.user._id);
        await post.save();
      }
      await user.save();
      res.json({ message: 'Post saved', isSaved: true });
    } else {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postIdStr);
      post.savedBy = post.savedBy.filter(id => id.toString() !== userIdStr);
      await user.save();
      await post.save();
      res.json({ message: 'Post unsaved', isSaved: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saved posts for current user
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({
      $or: [
        { _id: { $in: user.savedPosts || [] } },
        { savedBy: req.user._id }
      ]
    })
      .populate('user', 'name username profilePicture headline')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending hashtags
// @route   GET /api/posts/trending-tags
// @access  Private
const getTrendingTags = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];
    const tags = await Post.aggregate(pipeline);
    res.json(tags.map(t => ({ tag: t._id, count: t.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active system announcement
// @route   GET /api/posts/announcement
// @access  Public
const getSystemAnnouncement = async (req, res) => {
  try {
    const SystemSetting = require('../models/SystemSetting');
    const setting = await SystemSetting.findOne({ key: 'announcementBanner' });
    if (setting && setting.value && setting.value.active && setting.value.text) {
      return res.json({ announcement: setting.value.text });
    }
    res.json({ announcement: null });
  } catch (error) {
    res.json({ announcement: null });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  reactPost,
  votePoll,
  savePost,
  getSavedPosts,
  getTrendingTags,
  getSystemAnnouncement
};
