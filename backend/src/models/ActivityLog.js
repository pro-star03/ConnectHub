const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin user or system
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activitySchema);
