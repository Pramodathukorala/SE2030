const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['TRANSACTION_ISSUE', 'ACCOUNT_ISSUE', 'SERVICE_REQUEST', 'TECHNICAL_ISSUE', 'OTHER'], 
    default: 'OTHER' 
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffNotes: { type: String },
  managerNotes: { type: String },
  escalatedAt: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
