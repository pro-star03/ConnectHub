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
  savePost
} = require('../controllers/postController');

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/:id')
  .get(protect, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.post('/:id/save', protect, savePost);

module.exports = router;
