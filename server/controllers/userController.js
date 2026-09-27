const User = require('../models/User');
const Account = require('../models/Account');
const generateAccountNumber = require('../utils/generateAccountNumber');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Users fetched', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User fetched', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStaffUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    if (role === 'CUSTOMER') return res.status(400).json({ success: false, message: 'Invalid role' });
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User exists' });

    const user = await User.create({ firstName, lastName, email, phone, password, role });
    res.status(201).json({ success: true, message: 'Staff created', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;
    if (req.body.status) user.status = req.body.status;
    
    await user.save();
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ success: true, message: 'Role updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = status;
    await user.save();
    res.json({ success: true, message: 'Status updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, createStaffUser, updateUser, updateUserRole, updateUserStatus };
