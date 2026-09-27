const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getCustomerDashboard = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const recentTransactions = await Transaction.find({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }]
    }).sort({ createdAt: -1 }).limit(5).populate('senderAccount receiverAccount', 'accountNumber');

    const totalTx = await Transaction.countDocuments({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }]
    });

    const successTx = await Transaction.countDocuments({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }],
      status: 'SUCCESSFUL'
    });

    const pendingTx = await Transaction.countDocuments({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }],
      status: 'PENDING'
    });

    const failedTx = await Transaction.countDocuments({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }],
      status: 'FAILED'
    });

    const activeComplaints = await Complaint.countDocuments({
      customer: req.user._id,
      status: { $nin: ['RESOLVED', 'CLOSED'] }
    });

    res.json({
      success: true,
      message: 'Customer dashboard data',
      data: {
        account,
        transactions: { total: totalTx, successful: successTx, pending: pendingTx, failed: failedTx },
        activeComplaints,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOfficerDashboard = async (req, res) => {
  try {
    const assigned = await Complaint.countDocuments({ assignedOfficer: req.user._id, status: 'ASSIGNED' });
    const inProgress = await Complaint.countDocuments({ assignedOfficer: req.user._id, status: 'IN_PROGRESS' });
    const escalated = await Complaint.countDocuments({ assignedOfficer: req.user._id, status: 'ESCALATED' });
    const resolved = await Complaint.countDocuments({ assignedOfficer: req.user._id, status: 'RESOLVED' });

    res.json({
      success: true,
      message: 'Officer dashboard data',
      data: { complaints: { assigned, inProgress, escalated, resolved } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getManagerDashboard = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const escalated = await Complaint.countDocuments({ status: 'ESCALATED' });
    const resolved = await Complaint.countDocuments({ status: 'RESOLVED' });

    const statuses = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      message: 'Manager dashboard data',
      data: { complaints: { total, escalated, resolved }, statuses }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'CUSTOMER' });
    const officers = await User.countDocuments({ role: 'CUSTOMER_SERVICE_OFFICER' });
    const managers = await User.countDocuments({ role: 'BANK_MANAGER' });

    const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
    const inactiveUsers = await User.countDocuments({ status: 'INACTIVE' });
    const assignedComplaints = await Complaint.find({ assignedAdmin: req.user._id })
      .populate('customer', 'firstName lastName').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Admin dashboard data',
      data: {
        assignedComplaints,
        users: { total: totalUsers, customers, officers, managers },
        status: { active: activeUsers, inactive: inactiveUsers }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomerDashboard, getOfficerDashboard, getManagerDashboard, getAdminDashboard };
