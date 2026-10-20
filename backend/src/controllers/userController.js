const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const socket = require('../socket');
const { isRootAdmin } = require('../config/adminConfig');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userQuery = User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name username profilePicture headline')
      .populate('following', 'name username profilePicture headline');

    // If viewing own profile, populate savedPosts
    if (req.user && req.user._id.toString() === req.params.id) {
      userQuery.populate('savedPosts', 'content image createdAt likes comments');
    }

    const user = await userQuery;
      
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
    user.headline = req.body.headline !== undefined ? req.body.headline : user.headline;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    user.coverPhoto = req.body.coverPhoto !== undefined ? req.body.coverPhoto : user.coverPhoto;
    if (req.body.notificationSettings !== undefined) user.notificationSettings = req.body.notificationSettings;
    if (req.body.themePreference !== undefined) user.themePreference = req.body.themePreference;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      bio: updatedUser.bio,
      headline: updatedUser.headline,
      profilePicture: updatedUser.profilePicture,
      coverPhoto: updatedUser.coverPhoto,
      isVerified: updatedUser.isVerified || false,
      notificationSettings: updatedUser.notificationSettings,
      themePreference: updatedUser.themePreference
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    const targetIdStr = targetUser._id.toString();
    const currentIdStr = currentUser._id.toString();

    const isAlreadyFollowing = currentUser.following.some(id => id.toString() === targetIdStr);

    if (!isAlreadyFollowing) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      
      await currentUser.save();
      await targetUser.save();
      
      // Create notification only if target user has notifications enabled
      if (targetUser.notificationSettings !== false) {
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

          socket.emitToUser(targetUser._id, 'notification', {
            _id: notification._id,
            sender: { _id: currentUser._id, name: currentUser.name, profilePicture: currentUser.profilePicture },
            type: 'follow',
            message: notification.message,
            createdAt: notification.createdAt
          });
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

    const targetIdStr = targetUser._id.toString();
    const currentIdStr = currentUser._id.toString();

    const isFollowing = currentUser.following.some(id => id.toString() === targetIdStr);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetIdStr);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentIdStr);
      
      await currentUser.save();
      await targetUser.save();
      
      // Remove follow notification
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
    const followingSet = new Set((currentUser?.following || []).map(id => id.toString()));
    followingSet.add(req.user._id.toString());

    // Find users not in followingSet, sorted by follower count
    const users = await User.find({
      _id: { $nin: Array.from(followingSet) },
      isActive: true
    })
      .select('name username profilePicture coverPhoto headline bio followers')
      .limit(20);

    // Sort by most popular (followers count)
    users.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));

    res.json(users.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) {
      return res.json([]);
    }

    const keyword = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };
    
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id }, isActive: true })
      .select('name username profilePicture headline bio followers')
      .limit(30);

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
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The fixed root administrator account is protected and cannot be deleted.' });
    }

    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const Story = require('../models/Story');
    const Message = require('../models/Message');

    await Post.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await Story.deleteMany({ user: userId });
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });
    await User.updateMany({ followers: userId }, { $pull: { followers: userId } });
    await User.updateMany({ following: userId }, { $pull: { following: userId } });
    await User.findByIdAndDelete(userId);

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

    if (isRootAdmin(user.email)) {
      return res.status(403).json({ message: 'The root administrator password is fixed to 1234567890 by system configuration.' });
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
      message: message.trim()
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
