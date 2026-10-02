const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image
    });

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
    const posts = await Post.find()
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: -1 });
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
      .populate('user', 'name username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name username profilePicture' }
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

    post.content = req.body.content || post.content;
    post.image = req.body.image !== undefined ? req.body.image : post.image;
    
    const updatedPost = await post.save();
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

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require('../models/Notification');
const socket = require('../socket');

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      await post.save();
      
      // Notify post owner
      if (post.user.toString() !== req.user._id.toString()) {
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

            const targetSocketId = socket.getSocketId(post.user);
            if (targetSocketId) {
              socket.getIO().to(targetSocketId).emit('notification', {
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
      }

      res.json({ message: 'Post liked successfully' });
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

    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      await post.save();
      res.json({ message: 'Post unliked successfully' });
    } else {
      res.status(400).json({ message: 'Post has not been liked' });
    }
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

    if (!user.savedPosts.includes(post._id)) {
      user.savedPosts.push(post._id);
      await user.save();
      res.json({ message: 'Post saved' });
    } else {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
      await user.save();
      res.json({ message: 'Post unsaved' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  savePost
};
