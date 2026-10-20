const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { ADMIN_CREDENTIALS, isRootAdmin } = require('../config/adminConfig');

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
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      adminUsers,
      totalPosts,
      pinnedPosts,
      totalComments,
      totalStories,
      totalMessages,
      activeReports,
      resolvedReports,
      totalFeedback,
      pendingFeedback
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ $or: [{ role: 'admin' }, { isAdmin: true }] }),
      Post.countDocuments(),
      Post.countDocuments({ isPinned: true }),
      Comment.countDocuments(),
      Story.countDocuments(),
      Message.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: { $in: ['resolved', 'reviewed'] } }),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      adminUsers,
      totalPosts,
      pinnedPosts,
      totalComments,
      totalStories,
      totalMessages,
      activeReports,
      resolvedReports,
      totalFeedback,
      pendingFeedback,
      fixedAdmin: {
        email: ADMIN_CREDENTIALS.EMAIL,
        name: ADMIN_CREDENTIALS.NAME,
        username: ADMIN_CREDENTIALS.USERNAME,
        isFixed: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system health & metrics
// @route   GET /api/admin/health
// @access  Private/Admin
const getSystemHealth = async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    
    const memory = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());

    res.json({
      database: {
        status: states[mongoState] || 'Unknown',
        host: mongoose.connection.host || 'MongoDB Atlas',
        name: mongoose.connection.name || 'ConnectHub'
      },
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds,
        uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
        memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        rssMB: Math.round(memory.rss / 1024 / 1024)
      },
      adminConfig: {
        rootAdminEmail: ADMIN_CREDENTIALS.EMAIL,
        rootAdminName: ADMIN_CREDENTIALS.NAME,
        fixedCredentialsActive: true
      }
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
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle verified checkmark on a user
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    await logActivity(
      user.isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
      `${user.isVerified ? 'Verified' : 'Removed verification for'} @${user.username}`,
      req.user._id
    );

    res.json({ message: `User @${user.username} is now ${user.isVerified ? 'verified' : 'unverified'}`, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (promote/demote admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The root administrator role is permanently fixed and cannot be changed.' });
    }

    const { role } = req.body;
    const newRole = role === 'admin' ? 'admin' : 'user';
    const isAdmin = newRole === 'admin';

    user.role = newRole;
    user.isAdmin = isAdmin;
    await user.save();

    await logActivity(
      'USER_ROLE_CHANGED',
      `Changed @${user.username} role to ${newRole}`,
      req.user._id
    );

    res.json({ message: `Role for @${user.username} updated to ${newRole}`, role: newRole, isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const adminResetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The root administrator password is fixed to 1234567890 by system configuration.' });
    }

    const newPassword = req.body.password || 'password123';
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logActivity(
      'USER_PASSWORD_RESET',
      `Reset password for user @${user.username}`,
      req.user._id
    );

    res.json({ message: `Password for @${user.username} has been reset to: ${newPassword}` });
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

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The root administrator cannot be blocked.' });
    }
    
    user.isActive = false;
    await user.save();
    
    await logActivity('USER_BLOCKED', `Blocked user @${user.username}`, req.user._id);
    
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
    
    await logActivity('USER_UNBLOCKED', `Unblocked user @${user.username}`, req.user._id);

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin permanently delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const adminDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The root administrator cannot be deleted.' });
    }

    const username = user.username;

    // Full cascading cleanup
    await Post.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await Story.deleteMany({ user: userId });
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });
    await User.updateMany({ followers: userId }, { $pull: { followers: userId } });
    await User.updateMany({ following: userId }, { $pull: { following: userId } });
    await User.findByIdAndDelete(userId);

    await logActivity('USER_DELETED_BY_ADMIN', `Permanently deleted user @${username}`, req.user._id);

    res.json({ message: `User @${username} and all associated data permanently removed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts (admin view)
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name username profilePicture isVerified')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pin post on global feed
// @route   PUT /api/admin/posts/:id/pin
// @access  Private/Admin
const togglePinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.isPinned = !post.isPinned;
    await post.save();

    await logActivity(
      post.isPinned ? 'POST_PINNED' : 'POST_UNPINNED',
      `${post.isPinned ? 'Pinned' : 'Unpinned'} post ${post._id} on global feed`,
      req.user._id
    );

    res.json({ message: `Post is now ${post.isPinned ? 'pinned to top of feed' : 'unpinned'}`, isPinned: post.isPinned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const postId = post._id;
    await post.deleteOne();
    await Comment.deleteMany({ post: postId });
    await Notification.deleteMany({ relatedPost: postId });
    await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } });
    
    await logActivity('POST_REMOVED', `Removed post ${postId} by admin`, req.user._id);

    res.json({ message: 'Post deleted by admin' });
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
      .populate('reportedBy', 'name username profilePicture')
      .populate('reportedUser', 'name username profilePicture isVerified isActive')
      .populate({
        path: 'reportedPost',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark report as resolved/reviewed
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

// @desc    Dismiss a report
// @route   PUT /api/admin/reports/:id/dismiss
// @access  Private/Admin
const dismissReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = 'dismissed';
    await report.save();

    await logActivity('REPORT_DISMISSED', `Dismissed report ${report._id}`, req.user._id);

    res.json({ message: 'Report dismissed', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user activity (audit log)
// @route   GET /api/admin/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('performedBy', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .limit(60);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system feedback
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: -1 });

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

// @desc    Get admin platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getAdminSettings = async (req, res) => {
  try {
    const regSetting = await SystemSetting.findOne({ key: 'registrationEnabled' });
    const registrationEnabled = regSetting ? regSetting.value : true;

    const bannerSetting = await SystemSetting.findOne({ key: 'announcementBanner' });
    const announcementBanner = bannerSetting ? bannerSetting.value : { text: '', active: false };

    const lastLoginRecord = await ActivityLog.findOne({
      action: 'ADMIN_LOGIN',
      performedBy: req.user._id
    }).sort({ createdAt: -1 });

    const lastLogin = lastLoginRecord ? lastLoginRecord.createdAt : (req.user.lastLogin || null);

    res.json({
      registrationEnabled,
      announcementBanner,
      lastLogin,
      fixedAdmin: {
        email: ADMIN_CREDENTIALS.EMAIL,
        name: ADMIN_CREDENTIALS.NAME,
        username: ADMIN_CREDENTIALS.USERNAME,
        isFixed: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateAdminSettings = async (req, res) => {
  try {
    const { registrationEnabled, announcementBanner } = req.body;

    if (typeof registrationEnabled === 'boolean') {
      await SystemSetting.findOneAndUpdate(
        { key: 'registrationEnabled' },
        { value: registrationEnabled },
        { upsert: true, new: true }
      );
      await logActivity('SETTINGS_UPDATED', `Registration setting updated to ${registrationEnabled}`, req.user._id);
    }

    if (announcementBanner && typeof announcementBanner === 'object') {
      await SystemSetting.findOneAndUpdate(
        { key: 'announcementBanner' },
        { value: announcementBanner },
        { upsert: true, new: true }
      );
      await logActivity('SETTINGS_UPDATED', `Updated announcement banner: ${announcementBanner.active ? 'ACTIVE' : 'INACTIVE'}`, req.user._id);
    }

    res.json({ 
      message: 'Settings updated successfully', 
      registrationEnabled,
      announcementBanner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSystemHealth,
  getAllUsers,
  toggleUserVerification,
  updateUserRole,
  adminResetPassword,
  adminDeleteUser,
  blockUser,
  unblockUser,
  getAllPosts,
  togglePinPost,
  adminDeletePost,
  getAllReports,
  resolveReport,
  dismissReport,
  getUserActivity,
  getFeedback,
  resolveFeedback,
  getAdminSettings,
  updateAdminSettings
};
