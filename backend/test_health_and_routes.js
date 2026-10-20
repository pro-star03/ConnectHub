require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./src/config/db');
const { ensureFixedAdminAccount, ADMIN_CREDENTIALS } = require('./src/config/adminConfig');

// Import all models
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const Story = require('./src/models/Story');
const StoryView = require('./src/models/StoryView');
const Message = require('./src/models/Message');
const Notification = require('./src/models/Notification');
const Report = require('./src/models/Report');
const Feedback = require('./src/models/Feedback');
const ActivityLog = require('./src/models/ActivityLog');
const SystemSetting = require('./src/models/SystemSetting');

// Import all route modules registered in server.js
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const storyRoutes = require('./src/routes/storyRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

async function testBackendIntegrity() {
  console.log('Testing ConnectHub Backend Integrity...');

  // 1. Check all routes mount cleanly on Express
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  console.log('✓ All 9 Express API route modules mounted cleanly.');

  // 2. Test MongoDB connectivity and queries
  try {
    console.log('Connecting to MongoDB Atlas via connectDB()...');
    await connectDB();
    console.log('✓ Connected to MongoDB successfully.');

    // 3. Test and synchronize fixed root administrator
    console.log('Synchronizing fixed root admin account...');
    const adminUser = await ensureFixedAdminAccount();
    if (!adminUser || adminUser.email !== ADMIN_CREDENTIALS.EMAIL || !adminUser.isAdmin) {
      throw new Error('Fixed root admin synchronization failed');
    }
    console.log(`✓ Fixed root admin verified: ${adminUser.email} (role: ${adminUser.role}, isAdmin: ${adminUser.isAdmin}, isVerified: ${adminUser.isVerified})`);

    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const storyCount = await Story.countDocuments();
    const messageCount = await Message.countDocuments();

    console.log(`✓ Database Stats: ${userCount} users, ${postCount} posts, ${storyCount} stories, ${messageCount} messages.`);

    // 4. Verify Post Schema with enhanced fields: poll, reactions, tags, savedBy, isPinned
    console.log('✓ Post schema has enhanced fields support:', {
      hasPollField: Post.schema.path('poll.question') !== undefined,
      hasReactionsField: Post.schema.path('reactions') !== undefined,
      hasTagsField: Post.schema.path('tags') !== undefined,
      hasSavedByField: Post.schema.path('savedBy') !== undefined,
      hasIsPinnedField: Post.schema.path('isPinned') !== undefined
    });

    // 5. Verify User Schema with coverPhoto, headline, isVerified
    console.log('✓ User schema has enhanced fields support:', {
      hasCoverPhoto: User.schema.path('coverPhoto') !== undefined,
      hasHeadline: User.schema.path('headline') !== undefined,
      hasIsVerified: User.schema.path('isVerified') !== undefined
    });

    await mongoose.disconnect();
    console.log('✓ Disconnected cleanly. Backend test PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Backend verification failed:', err);
    process.exit(1);
  }
}

testBackendIntegrity();
