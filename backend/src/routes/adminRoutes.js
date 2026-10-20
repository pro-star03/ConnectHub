const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(protect, admin);

// Analytics & Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/health', getSystemHealth);
router.get('/activity', getUserActivity);

// User Moderation & Management
router.get('/users', getAllUsers);
router.put('/users/:id/verify', toggleUserVerification);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/reset-password', adminResetPassword);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', adminDeleteUser);

// Content Moderation
router.get('/posts', getAllPosts);
router.put('/posts/:id/pin', togglePinPost);
router.delete('/posts/:id', adminDeletePost);

// Safety & Reports
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);
router.put('/reports/:id/dismiss', dismissReport);

// Feedback
router.get('/feedback', getFeedback);
router.put('/feedback/:id/resolve', resolveFeedback);

// Platform System Settings
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

module.exports = router;
