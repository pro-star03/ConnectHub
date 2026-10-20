const Message = require('../models/Message');
const User = require('../models/User');
const socket = require('../socket');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, media } = req.body;

    if (!receiverId || (!message && !media)) {
      return res.status(400).json({ message: 'Receiver and either message text or media are required' });
    }

    const receiverUser = await User.findById(receiverId).select('blockedUsers');
    const currentUser = await User.findById(req.user._id).select('blockedUsers');

    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const isBlockedByReceiver = (receiverUser.blockedUsers || []).some(id => id.toString() === req.user._id.toString());
    const isBlockedBySender = (currentUser.blockedUsers || []).some(id => id.toString() === receiverId.toString());

    if (isBlockedByReceiver || isBlockedBySender) {
      return res.status(403).json({ message: 'Cannot send message. This user is blocked.' });
    }

    let newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message: message || '',
      media: media || ''
    });

    newMessage = await newMessage.populate([
      { path: 'sender', select: 'name username profilePicture' },
      { path: 'receiver', select: 'name username profilePicture' }
    ]);

    socket.emitToUser(receiverId, 'newMessage', {
      ...newMessage.toObject(),
      senderData: {
        _id: req.user._id,
        name: req.user.name,
        profilePicture: req.user.profilePicture
      }
    });

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
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Mark unread messages sent to me as read
    const updated = await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    if (updated.modifiedCount > 0) {
      socket.emitToUser(targetUserId, 'messagesRead', { readerId: currentUserId.toString() });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name username profilePicture')
      .populate('receiver', 'name username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markConversationRead = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    socket.emitToUser(targetUserId, 'messagesRead', { readerId: currentUserId.toString() });
    res.json({ message: 'Conversation marked as read' });
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

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username profilePicture')
      .populate('receiver', 'name username profilePicture');

    const conversationsMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;

      const isSenderMe = msg.sender._id.toString() === userId.toString();
      const otherUser = isSenderMe ? msg.receiver : msg.sender;
      if (!otherUser || !otherUser._id) continue;

      const otherUserIdStr = otherUser._id.toString();

      if (!conversationsMap.has(otherUserIdStr)) {
        conversationsMap.set(otherUserIdStr, {
          user: otherUser,
          lastMessage: msg.message || (msg.media ? '📷 Photo' : ''),
          createdAt: msg.createdAt,
          unreadCount: !isSenderMe && !msg.read ? 1 : 0
        });
      } else if (!isSenderMe && !msg.read) {
        const existing = conversationsMap.get(otherUserIdStr);
        existing.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  markConversationRead
};
