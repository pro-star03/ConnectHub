const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/postController');

router.get('/announcement', getSystemAnnouncement);

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.get('/saved', protect, getSavedPosts);
router.get('/trending-tags', protect, getTrendingTags);

router.route('/:id')
  .get(protect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.post('/:id/react', protect, reactPost);
router.post('/:id/poll/vote', protect, votePoll);
router.post('/:id/save', protect, savePost);

module.exports = router;
