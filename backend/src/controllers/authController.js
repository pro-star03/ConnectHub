const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const regSetting = await SystemSetting.findOne({ key: 'registrationEnabled' });
    if (regSetting && regSetting.value === false) {
      return res.status(403).json({ message: 'User registration is currently disabled' });
    }

    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { username: username.trim() }
      ]
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await ActivityLog.create({
      action: 'NEW_USER_REGISTRATION',
      details: `User ${user.username} registered`,
      performedBy: user._id
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        notificationSettings: user.notificationSettings,
        themePreference: user.themePreference,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { email }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isActive === false) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }
      if (user.role === 'admin' || user.isAdmin) {
        user.lastLogin = new Date();
        await user.save();
        await ActivityLog.create({
          action: 'ADMIN_LOGIN',
          details: `Admin ${user.username} logged in`,
          performedBy: user._id
        });
      }
      res.json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        notificationSettings: user.notificationSettings,
        themePreference: user.themePreference,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
