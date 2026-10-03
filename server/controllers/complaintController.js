const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateComplaintNumber = require('../utils/generateComplaintNumber');
const mongoose = require('mongoose');

const getComplaintAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'SYSTEM_ADMIN', status: 'ACTIVE' })
      .select('firstName lastName').sort({ firstName: 1, lastName: 1 });
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, assignedAdmin } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    if (typeof assignedAdmin !== 'string' || !mongoose.Types.ObjectId.isValid(assignedAdmin)) {
      return res.status(400).json({ success: false, message: 'Please select a valid admin' });
    }
    const admin = await User.findOne({ _id: assignedAdmin, role: 'SYSTEM_ADMIN', status: 'ACTIVE' });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Selected admin is not available. Please select another admin.' });
    }
    const complaintNumber = await generateComplaintNumber();

    const complaint = await Complaint.create({
      complaintNumber,
      customer: req.user._id,
      title,
      description,
      category: category || 'OTHER',
      assignedAdmin: admin._id,
      status: 'ASSIGNED'
    });

    await Notification.create({
      user: req.user._id,
      title: 'Complaint Submitted',
      message: `Your complaint ${complaintNumber} has been received.`,
      type: 'COMPLAINT'
    });

    res.status(201).json({ success: true, message: 'Complaint created', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Complaints fetched', data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(id).populate('customer', 'firstName lastName email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'CUSTOMER' && complaint.customer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, message: 'Complaint fetched', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const { title, description, category } = req.body;
    if (typeof title !== 'string' || !title.trim() ||
        typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    if (!Complaint.schema.path('category').enumValues.includes(category)) {
      return res.status(400).json({ success: false, message: 'Please select a valid category' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: id, customer: req.user._id },
      { $set: { title: title.trim(), description: description.trim(), category } },
      { new: true, runValidators: true }
    );
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, message: 'Complaint updated', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedOfficer: req.user._id };
    if (status) query.status = status;

    const complaints = await Complaint.find(query).populate('customer', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, message: 'Assigned complaints fetched', data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffNotes } = req.body;
    
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = status || complaint.status;
    if (staffNotes) complaint.staffNotes = staffNotes;
    
    await complaint.save();

    await Notification.create({
      user: complaint.customer,
      title: 'Complaint Status Updated',
      message: `Your complaint ${complaint.complaintNumber} is now ${complaint.status}.`,
      type: 'COMPLAINT'
    });

    res.json({ success: true, message: 'Complaint updated', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const escalateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'ESCALATED';
    complaint.escalatedAt = new Date();
    await complaint.save();

    res.json({ success: true, message: 'Complaint escalated', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'RESOLVED';
    complaint.resolvedAt = new Date();
    await complaint.save();

    await Notification.create({
      user: complaint.customer,
      title: 'Complaint Resolved',
      message: `Your complaint ${complaint.complaintNumber} has been resolved.`,
      type: 'COMPLAINT'
    });

    res.json({ success: true, message: 'Complaint resolved', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const closeComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'CLOSED';
    complaint.closedAt = new Date();
    await complaint.save();

    res.json({ success: true, message: 'Complaint closed', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEscalatedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: 'ESCALATED' })
      .populate('customer', 'firstName lastName')
      .populate('assignedOfficer', 'firstName lastName')
      .sort({ escalatedAt: -1 });
    res.json({ success: true, message: 'Escalated complaints fetched', data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addManagerNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerNotes } = req.body;
    
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.managerNotes = managerNotes;
    await complaint.save();

    res.json({ success: true, message: 'Notes added', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }
    const complaint = await Complaint.findOneAndDelete({
      _id: req.params.id, assignedAdmin: req.user._id
    });
    if (!complaint) return res.status(404).json({ success: false, message: 'Assigned complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  deleteComplaint,
  getComplaintAdmins,
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  getAssignedComplaints,
  updateComplaintStatus,
  escalateComplaint,
  resolveComplaint,
  closeComplaint,
  getEscalatedComplaints,
  addManagerNotes
};
