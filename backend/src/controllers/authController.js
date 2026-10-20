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
    const cleanUsername = username.trim().toLowerCase();

    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: cleanUsername }
      ]
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`;

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: normalizedEmail,
      password: hashedPassword,
      profilePicture: defaultAvatar
    });

    await ActivityLog.create({
      action: 'NEW_USER_REGISTRATION',
      details: `User ${user.username} registered`,
      performedBy: user._id
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isVerified: false,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto || '',
      headline: user.headline || '',
      bio: user.bio || '',
      notificationSettings: user.notificationSettings,
      themePreference: user.themePreference,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const { ADMIN_CREDENTIALS, ensureFixedAdminAccount, isRootAdmin } = require('../config/adminConfig');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Guarantee fixed root admin authentication
    if (isRootAdmin(normalizedEmail) && password === ADMIN_CREDENTIALS.PASSWORD) {
      const adminUser = await ensureFixedAdminAccount();
      adminUser.lastLogin = new Date();
      adminUser.isOnline = true;
      await adminUser.save();

      await ActivityLog.create({
        action: 'ADMIN_LOGIN',
        details: `Root Administrator (${adminUser.email}) logged in successfully`,
        performedBy: adminUser._id
      });

      return res.json({
        _id: adminUser.id,
        name: adminUser.name,
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin',
        isAdmin: true,
        isVerified: true,
        profilePicture: adminUser.profilePicture,
        coverPhoto: adminUser.coverPhoto || '',
        headline: adminUser.headline || '',
        bio: adminUser.bio || '',
        notificationSettings: adminUser.notificationSettings,
        themePreference: adminUser.themePreference,
        token: generateToken(adminUser._id)
      });
    }

    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedEmail }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.isActive === false) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }
      user.lastLogin = new Date();
      user.isOnline = true;
      await user.save();

      if (user.role === 'admin' || user.isAdmin) {
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
        isVerified: user.isVerified || false,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto || '',
        headline: user.headline || '',
        bio: user.bio || '',
        notificationSettings: user.notificationSettings,
        themePreference: user.themePreference,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
