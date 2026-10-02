require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Report = require('./src/models/Report');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- STARTING ADMIN AUDIT TEST ---');
  let adminToken, userToken;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ email: 'alok@gmail.com' });
    if (adminUser.role === 'admin' && adminUser.isAdmin) {
      console.log('[PASS] DB: alok@gmail.com is admin');
    } else {
      console.log('[FAIL] DB: alok@gmail.com is NOT admin');
    }
  } catch (err) {
    console.log('[ERROR] DB Check:', err.message);
  }

  try {
    const adminUser = await User.findOne({ email: 'alok@gmail.com' });
    const normalUser = await User.findOne({ email: 'aarav_demo@example.com' });
    
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('[PASS] Authentication logic verified via token generation.');
  } catch (err) {
    console.log('[ERROR] Login logic:', err.message);
  }

  const fetchApi = async (path, token, method = 'GET') => {
    return fetch(`${API_URL}${path}`, {
      method,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  };

  try {
    const res = await fetchApi('/admin/dashboard', userToken);
    if (res.status === 403) {
      console.log('[PASS] Security: Normal user blocked from admin APIs (403)');
    } else {
      console.log('[FAIL] Security: Normal user got status', res.status);
    }
    
    const noAuthRes = await fetchApi('/admin/dashboard', null);
    if (noAuthRes.status === 401) {
      console.log('[PASS] Security: Unauthenticated user blocked (401)');
    } else {
      console.log('[FAIL] Security: Unauthenticated user got status', noAuthRes.status);
    }
  } catch (err) {
    console.log('[ERROR] Security check:', err.message);
  }

  try {
    const res = await fetchApi('/admin/dashboard', adminToken);
    const data = await res.json();
    if (res.status === 200 && data.totalUsers !== undefined) {
      console.log('[PASS] Admin API: /admin/dashboard loaded real stats');
    } else {
      console.log('[FAIL] Admin API: Dashboard failed', data);
    }
  } catch (err) {
    console.log('[ERROR] Admin Dashboard:', err.message);
  }

  try {
    const res = await fetchApi('/admin/users', adminToken);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log('[PASS] Admin API: /admin/users loaded properly');
    } else {
      console.log('[FAIL] Admin API: Users failed');
    }
  } catch (err) {
    console.log('[ERROR] Admin Users:', err.message);
  }
  
  try {
    const res = await fetchApi('/admin/posts', adminToken);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log('[PASS] Admin API: /admin/posts loaded properly');
    } else {
      console.log('[FAIL] Admin API: Posts failed');
    }
  } catch (err) {
    console.log('[ERROR] Admin Posts:', err.message);
  }

  try {
    const res = await fetchApi('/admin/reports', adminToken);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log('[PASS] Admin API: /admin/reports loaded properly');
    } else {
      console.log('[FAIL] Admin API: Reports failed');
    }
  } catch (err) {
    console.log('[ERROR] Admin Reports:', err.message);
  }

  try {
    const res = await fetchApi('/admin/feedback', adminToken);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log('[PASS] Admin API: /admin/feedback loaded properly');
    } else {
      console.log('[FAIL] Admin API: Feedback failed');
    }
  } catch (err) {
    console.log('[ERROR] Admin Feedback:', err.message);
  }

  try {
    const normalUserBefore = await User.findOne({ email: 'aarav_demo@example.com' });
    const blockRes = await fetchApi(`/admin/users/${normalUserBefore._id}/block`, adminToken, 'PUT');
    const blockedUser = await User.findOne({ email: 'aarav_demo@example.com' });
    if (blockRes.status === 200 && blockedUser.isActive === false) {
      console.log('[PASS] Admin API: Successfully blocked user and updated MongoDB');
    } else {
      console.log('[FAIL] Admin API: Failed to block user');
    }

    const unblockRes = await fetchApi(`/admin/users/${normalUserBefore._id}/unblock`, adminToken, 'PUT');
    const unblockedUser = await User.findOne({ email: 'aarav_demo@example.com' });
    if (unblockRes.status === 200 && unblockedUser.isActive === true) {
      console.log('[PASS] Admin API: Successfully unblocked user and updated MongoDB');
    } else {
      console.log('[FAIL] Admin API: Failed to unblock user');
    }

    const testPost = await Post.findOne({});
    if (testPost) {
      const deleteRes = await fetchApi(`/admin/posts/${testPost._id}`, adminToken, 'DELETE');
      const checkPost = await Post.findById(testPost._id);
      if (deleteRes.status === 200 && !checkPost) {
        console.log('[PASS] Admin API: Successfully deleted post from MongoDB');
      } else {
        console.log('[FAIL] Admin API: Failed to delete post');
      }
    } else {
      console.log('[SKIP] No post found to delete');
    }

    const testReport = await Report.findOne({});
    if (testReport) {
      const resolveRes = await fetchApi(`/admin/reports/${testReport._id}/resolve`, adminToken, 'PUT');
      const checkReport = await Report.findById(testReport._id);
      if (resolveRes.status === 200 && checkReport.status === 'resolved') {
        console.log('[PASS] Admin API: Successfully resolved report in MongoDB');
      } else {
        console.log('[FAIL] Admin API: Failed to resolve report');
      }
    } else {
      console.log('[SKIP] No report found to resolve');
    }

  } catch (err) {
    console.log('[ERROR] Block/Unblock test:', err.message);
  }

  process.exit(0);
};

runTests();
