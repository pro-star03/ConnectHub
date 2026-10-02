const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createReport, getMyReports, updateReport } = require('../controllers/reportController');

router.route('/')
  .post(protect, createReport)
  .get(protect, getMyReports);

router.put('/:id', protect, updateReport);

module.exports = router;
