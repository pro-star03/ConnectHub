const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes here are protected and require admin privileges
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/activity', getUserActivity);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/posts/:id', adminDeletePost);
router.get('/feedback', getFeedback);
router.put('/feedback/:id/resolve', resolveFeedback);

module.exports = router;
