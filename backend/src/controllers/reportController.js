const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { reportedUser, reportedPost, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }
    
    if (!reportedUser && !reportedPost) {
      return res.status(400).json({ message: 'Must report either a user or a post' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser: reportedUser || null,
      reportedPost: reportedPost || null,
      reason,
      description
    });
    
    await ActivityLog.create({
      action: 'NEW_REPORT',
      details: `New report submitted by ${req.user.name}`,
      performedBy: req.user._id
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's own reports (optional, if they want to see status)
// @route   GET /api/reports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report (e.g. user edits description) - usually admin resolves it
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    report.description = req.body.description || report.description;
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getMyReports, updateReport };
