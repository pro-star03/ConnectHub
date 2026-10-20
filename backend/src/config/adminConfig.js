/**
 * ConnectHub Dedicated Administrator Configuration
 * 
 * Fixed Admin Credentials:
 * Email: alok@gmail.com
 * Password: 1234567890
 * 
 * This file guarantees the root administrator credentials remain fixed, secure,
 * and automatically provisioned/synchronized in the database on server startup.
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_CREDENTIALS = Object.freeze({
  EMAIL: 'alok@gmail.com',
  PASSWORD: '1234567890',
  NAME: 'Alok (System Administrator)',
  USERNAME: 'alok_admin',
  ROLE: 'admin',
  IS_ADMIN: true
});

/**
 * Ensures the fixed root administrator account exists in the database
 * with the exact required credentials and elevated privileges.
 */
const ensureFixedAdminAccount = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.PASSWORD, salt);

    let adminUser = await User.findOne({
      $or: [
        { email: ADMIN_CREDENTIALS.EMAIL },
        { username: ADMIN_CREDENTIALS.USERNAME }
      ]
    });

    if (adminUser) {
      let modified = false;
      if (adminUser.email !== ADMIN_CREDENTIALS.EMAIL) {
        adminUser.email = ADMIN_CREDENTIALS.EMAIL;
        modified = true;
      }
      if (adminUser.role !== 'admin' || !adminUser.isAdmin) {
        adminUser.role = 'admin';
        adminUser.isAdmin = true;
        modified = true;
      }
      if (!adminUser.isActive) {
        adminUser.isActive = true;
        modified = true;
      }
      if (!adminUser.isVerified) {
        adminUser.isVerified = true;
        modified = true;
      }

      // Check if password hash matches fixed password
      const isMatch = await bcrypt.compare(ADMIN_CREDENTIALS.PASSWORD, adminUser.password);
      if (!isMatch) {
        adminUser.password = hashedPassword;
        modified = true;
      }

      if (modified) {
        await adminUser.save();
        console.log(`[AdminConfig] Fixed admin account (${ADMIN_CREDENTIALS.EMAIL}) synchronized successfully.`);
      }
      return adminUser;
    } else {
      adminUser = await User.create({
        name: ADMIN_CREDENTIALS.NAME,
        username: ADMIN_CREDENTIALS.USERNAME,
        email: ADMIN_CREDENTIALS.EMAIL,
        password: hashedPassword,
        role: 'admin',
        isAdmin: true,
        isActive: true,
        isVerified: true,
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        headline: 'Lead Platform Administrator',
        bio: 'Official platform administrator for ConnectHub. Contact for platform assistance & system inquiries.'
      });
      console.log(`[AdminConfig] Fixed admin account (${ADMIN_CREDENTIALS.EMAIL}) created successfully.`);
      return adminUser;
    }
  } catch (error) {
    console.error('[AdminConfig] Failed to synchronize fixed admin account:', error.message);
  }
};

/**
 * Checks whether an email address is the protected root admin email.
 */
const isRootAdmin = (email) => {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_CREDENTIALS.EMAIL.toLowerCase();
};

module.exports = {
  ADMIN_CREDENTIALS,
  ensureFixedAdminAccount,
  isRootAdmin
};
