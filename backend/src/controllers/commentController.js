const Comment = require('../models/Comment');
const Post = require('../models/Post');

const Notification = require('../models/Notification');
const socket = require('../socket');
const User = require('../models/User');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    
    if (!text || !postId) {
      return res.status(400).json({ message: 'Text and postId are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text
    });

    post.comments.push(comment._id);
    await post.save();

    // Notify post owner
    if (post.user.toString() !== req.user._id.toString()) {
      const targetUser = await User.findById(post.user);
      if (targetUser && targetUser.notificationSettings !== false) {
        const currentUser = await User.findById(req.user._id);
        const notification = await Notification.create({
          recipient: post.user,
          sender: currentUser._id,
          type: 'comment',
          relatedPost: post._id,
          message: `${currentUser.name} commented on your post.`
        });

        const targetSocketId = socket.getSocketId(post.user);
        if (targetSocketId) {
          socket.getIO().to(targetSocketId).emit('notification', {
            _id: notification._id,
            sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
            type: 'comment',
            message: notification.message,
            relatedPost: post._id,
            createdAt: notification.createdAt
          });
        }
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public (or Private depending on choice, let's keep it Private for consistency)
const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
const replyToComment = async (req, res) => {
  try {
    const parentCommentId = req.params.id;
    const { text } = req.body;

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const reply = await Comment.create({
      post: parentComment.post,
      user: req.user._id,
      text,
      parentComment: parentCommentId
    });

    // Notify parent comment owner
    if (parentComment.user.toString() !== req.user._id.toString()) {
      const targetUser = await User.findById(parentComment.user);
      if (targetUser && targetUser.notificationSettings !== false) {
        const currentUser = await User.findById(req.user._id);
        const notification = await Notification.create({
          recipient: parentComment.user,
          sender: currentUser._id,
          type: 'reply',
          relatedPost: parentComment.post,
          message: `${currentUser.name} replied to your comment.`
        });

        const targetSocketId = socket.getSocketId(parentComment.user);
        if (targetSocketId) {
          socket.getIO().to(targetSocketId).emit('notification', {
            _id: notification._id,
            sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
            type: 'reply',
            message: notification.message,
            relatedPost: parentComment.post,
            createdAt: notification.createdAt
          });
        }
      }
    }

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    
    // Also remove from post
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter(id => id.toString() !== comment._id.toString());
      await post.save();
    }

    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getPostComments,
  replyToComment,
  deleteComment
};
