const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addComment,
  getPostComments,
  replyToComment,
  deleteComment
} = require('../controllers/commentController');

router.route('/')
  .post(protect, addComment);

router.get('/:postId', protect, getPostComments);
router.post('/:id/reply', protect, replyToComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
