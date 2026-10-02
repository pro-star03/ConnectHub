const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (action, details, performedBy = null) => {
  try {
    await ActivityLog.create({ action, details, performedBy });
  } catch (error) {
    console.error('Error logging activity', error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const activeReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalPosts,
      totalComments,
      activeReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all posts (admin view)
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'name username profilePicture').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name username')
      .populate('reportedUser', 'name username')
      .populate('reportedPost', 'content')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark report as resolved
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    report.status = req.body.status || 'resolved';
    await report.save();
    
    await logActivity('REPORT_RESOLVED', `Updated report ${report._id} status to ${report.status}`, req.user._id);

    res.json({ message: `Report marked as ${report.status}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user activity (latest activities)
// @route   GET /api/admin/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('performedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = false;
    await user.save();
    
    await logActivity('USER_BLOCKED', `Blocked user ${user.username}`, req.user._id);
    
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unblock a user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = true;
    await user.save();
    
    await logActivity('USER_UNBLOCKED', `Unblocked user ${user.username}`, req.user._id);

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    await post.deleteOne();
    
    await logActivity('POST_REMOVED', `Removed post ${post._id} by admin`, req.user._id);

    res.json({ message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system feedback
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name username').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark feedback as resolved
// @route   PUT /api/admin/feedback/:id/resolve
// @access  Private/Admin
const resolveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    
    feedback.status = req.body.status || 'Resolved';
    await feedback.save();
    
    await logActivity('FEEDBACK_RESOLVED', `Updated feedback ${feedback._id} status to ${feedback.status}`, req.user._id);

    res.json({ message: `Feedback marked as ${feedback.status}`, feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  getAllReports,
  getUserActivity,
  blockUser,
  unblockUser,
  adminDeletePost,
  getFeedback,
  resolveFeedback,
  resolveReport
};
