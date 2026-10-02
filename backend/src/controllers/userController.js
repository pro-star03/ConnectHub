const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name username profilePicture')
      .populate('following', 'name username profilePicture');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to update their own profile
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    if (req.body.notificationSettings !== undefined) user.notificationSettings = req.body.notificationSettings;
    if (req.body.themePreference !== undefined) user.themePreference = req.body.themePreference;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      notificationSettings: updatedUser.notificationSettings,
      themePreference: updatedUser.themePreference
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const socket = require('../socket');

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (!currentUser.following.includes(targetUser._id)) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      
      await currentUser.save();
      await targetUser.save();
      
      // Create notification only if target user has notifications enabled
      if (targetUser.notificationSettings !== false) {
        // Prevent duplicate follow notifications
        const existingNotification = await Notification.findOne({
          recipient: targetUser._id,
          sender: currentUser._id,
          type: 'follow'
        });
        
        if (!existingNotification) {
          const notification = await Notification.create({
            recipient: targetUser._id,
            sender: currentUser._id,
            type: 'follow',
            message: `${currentUser.name} started following you.`
          });

          // Emit socket event
          const targetSocketId = socket.getSocketId(targetUser._id);
          if (targetSocketId) {
            const io = socket.getIO();
            io.to(targetSocketId).emit('notification', {
              _id: notification._id,
              sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
              type: 'follow',
              message: notification.message,
              createdAt: notification.createdAt
            });
          }
        }
      }
      
      res.json({ message: 'User followed successfully' });
    } else {
      res.status(400).json({ message: 'You already follow this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (currentUser.following.includes(targetUser._id)) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
      
      await currentUser.save();
      await targetUser.save();
      
      // Remove the follow notification
      await Notification.findOneAndDelete({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow'
      });
      
      res.json({ message: 'User unfollowed successfully' });
    } else {
      res.status(400).json({ message: 'You do not follow this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user suggestions
// @route   GET /api/users/suggestions
// @access  Private
const getUserSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $ne: currentUser._id, $nin: currentUser.following }
    }).limit(10).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q ? {
      $or: [
        { name: { $regex: req.query.q, $options: 'i' } },
        { username: { $regex: req.query.q, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate user account
// @route   POST /api/users/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = false;
    await user.save();
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account permanently
// @route   DELETE /api/users/delete
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Delete all posts, comments, stories, notifications etc related to the user could be done here
    // For now, we will simply remove the user
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback or complaint
// @route   POST /api/users/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      type: type || 'Feedback',
      message
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser, getUserSuggestions, searchUsers, deactivateAccount, deleteAccount, changePassword, submitFeedback };
