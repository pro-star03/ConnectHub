const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessages, getConversations, markConversationRead } = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.put('/read/:userId', protect, markConversationRead);
router.get('/:userId', protect, getMessages);

module.exports = router;
