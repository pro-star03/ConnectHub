const Message = require('../models/Message');
const User = require('../models/User');
const socket = require('../socket');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    const targetSocketId = socket.getSocketId(receiverId);
    if (targetSocketId) {
      const currentUser = await User.findById(req.user._id);
      socket.getIO().to(targetSocketId).emit('newMessage', {
        ...newMessage.toObject(),
        senderData: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture }
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 })
      .populate('sender', 'name username profilePicture')
      .populate('receiver', 'name username profilePicture');

    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determine the other user in the conversation
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      
      // Keep only the latest message for each user
      if (!conversationsMap.has(otherUser._id.toString())) {
        conversationsMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: msg.message,
          createdAt: msg.createdAt,
          isUnread: msg.receiver._id.toString() === userId.toString() && !msg.read // if you add 'read' field
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getConversations };
