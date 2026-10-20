require('dotenv').config();
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Feedback = require('./src/models/Feedback');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- STARTING FEEDBACK E2E TEST ---');

  let adminToken, userToken, testUserId;

  try {
    await connectDB();
    
    const adminUser = await User.findOne({ email: 'alok@gmail.com' });
    const normalUser = await User.findOne({ role: { $ne: 'admin' }, isAdmin: { $ne: true } });
    testUserId = normalUser._id;
    
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (err) {
    console.log('[ERROR] Setup:', err.message);
  }

  const fetchApi = async (path, token, method = 'GET', body = null) => {
    return fetch(`${API_URL}${path}`, {
      method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    });
  };

  try {
    // 1. Normal user submits feedback
    const messageText = 'This is a test complaint from E2E script ' + Date.now();
    const submitRes = await fetchApi('/users/feedback', userToken, 'POST', {
      type: 'Complaint',
      message: messageText
    });
    
    if (submitRes.status === 201) {
      console.log('[PASS] Normal user successfully submitted feedback via API');
    } else {
      console.log('[FAIL] Submission failed', await submitRes.json());
    }

    // 2. Verify stored in MongoDB
    const storedFeedback = await Feedback.findOne({ message: messageText });
    if (storedFeedback && storedFeedback.status === 'Pending') {
      console.log('[PASS] Feedback successfully stored in MongoDB with Pending status');
    } else {
      console.log('[FAIL] Feedback not stored properly in MongoDB');
    }

    // 3. Admin fetches feedback
    const adminFetchRes = await fetchApi('/admin/feedback', adminToken);
    const feedbackList = await adminFetchRes.json();
    if (adminFetchRes.status === 200 && feedbackList.some(f => f._id.toString() === storedFeedback._id.toString())) {
      console.log('[PASS] Admin successfully fetched feedback list containing new submission');
    } else {
      console.log('[FAIL] Admin could not fetch the new feedback');
    }

    // 4. Admin changes status to Reviewed
    const reviewRes = await fetchApi(`/admin/feedback/${storedFeedback._id}/resolve`, adminToken, 'PUT', { status: 'Reviewed' });
    const reviewedFeedback = await Feedback.findById(storedFeedback._id);
    if (reviewRes.status === 200 && reviewedFeedback.status === 'Reviewed') {
      console.log('[PASS] Admin successfully updated status to Reviewed in MongoDB');
    } else {
      console.log('[FAIL] Admin failed to update status to Reviewed');
    }

    // 5. Admin changes status to Resolved
    const resolveRes = await fetchApi(`/admin/feedback/${storedFeedback._id}/resolve`, adminToken, 'PUT', { status: 'Resolved' });
    const resolvedFeedback = await Feedback.findById(storedFeedback._id);
    if (resolveRes.status === 200 && resolvedFeedback.status === 'Resolved') {
      console.log('[PASS] Admin successfully updated status to Resolved in MongoDB');
    } else {
      console.log('[FAIL] Admin failed to update status to Resolved');
    }

    // 6. Security Check: Normal user tries to change status
    const securityRes = await fetchApi(`/admin/feedback/${storedFeedback._id}/resolve`, userToken, 'PUT', { status: 'Pending' });
    if (securityRes.status === 403) {
      console.log('[PASS] Security: Normal user blocked from accessing Admin feedback API (403)');
    } else {
      console.log('[FAIL] Security: Normal user bypass allowed', securityRes.status);
    }

    // Cleanup test feedback
    await Feedback.findByIdAndDelete(storedFeedback._id);
    console.log('[INFO] Cleaned up test data');

  } catch (err) {
    console.log('[ERROR] Test Execution:', err.message);
  }

  process.exit(0);
};

runTests();
