const express = require('express');
const router = express.Router();
const { createStory, getActiveStories, deleteStory, viewStory } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createStory);
router.get('/', protect, getActiveStories);
router.post('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
