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
  submitFeedback
} = require('../controllers/userController');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getUserSuggestions);
router.post('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);
router.put('/change-password', protect, changePassword);
router.post('/feedback', protect, submitFeedback);
router.route('/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
  
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

module.exports = router;
