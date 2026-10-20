const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getUserProfile, 
  updateUserProfile, 
  followUser, 
  unfollowUser, 
  getUserSuggestions,
  searchUsers,
  deactivateAccount,
  deleteAccount,
  changePassword,
  submitFeedback,
  blockUser,
  unblockUser,
  getBlockedUsers
} = require('../controllers/userController');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getUserSuggestions);
router.get('/blocked', protect, getBlockedUsers);
router.post('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);
router.put('/change-password', protect, changePassword);
router.post('/feedback', protect, submitFeedback);

router.post('/:id/block', protect, blockUser);
router.post('/:id/unblock', protect, unblockUser);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

router.route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
