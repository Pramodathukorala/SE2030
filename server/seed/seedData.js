require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bankdb');
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});

    const users = await User.create([
      { firstName: 'Cus', lastName: 'One', email: 'customer@bankdemo.com', password: 'Password123!', role: 'CUSTOMER' },
      { firstName: 'Cus', lastName: 'Two', email: 'customer2@bankdemo.com', password: 'Password123!', role: 'CUSTOMER' },
      { firstName: 'Officer', lastName: 'One', email: 'officer@bankdemo.com', password: 'Password123!', role: 'CUSTOMER_SERVICE_OFFICER' },
      { firstName: 'Manager', lastName: 'One', email: 'manager@bankdemo.com', password: 'Password123!', role: 'BANK_MANAGER' },
      { firstName: 'Admin', lastName: 'One', email: 'admin@bankdemo.com', password: 'Password123!', role: 'SYSTEM_ADMIN' }
    ]);

    const accounts = await Account.create([
      { accountNumber: 'ACC100001', user: users[0]._id, accountType: 'SAVINGS', balance: 100000 },
      { accountNumber: 'ACC100002', user: users[1]._id, accountType: 'SAVINGS', balance: 50000 }
    ]);

    await Transaction.create([
      { referenceNumber: 'TXN-20260925-000001', senderAccount: accounts[0]._id, receiverAccount: accounts[1]._id, amount: 1000, description: 'Test 1', status: 'SUCCESSFUL' },
      { referenceNumber: 'TXN-20260925-000002', senderAccount: accounts[1]._id, receiverAccount: accounts[0]._id, amount: 500, description: 'Test 2', status: 'SUCCESSFUL' },
      { referenceNumber: 'TXN-20260925-000003', senderAccount: accounts[0]._id, receiverAccount: accounts[1]._id, amount: 200, description: 'Test 3', status: 'SUCCESSFUL' },
      { referenceNumber: 'TXN-20260925-000004', senderAccount: accounts[0]._id, receiverAccount: accounts[1]._id, amount: 5000, description: 'Pending transfer', status: 'PENDING' },
      { referenceNumber: 'TXN-20260925-000005', senderAccount: accounts[0]._id, receiverAccount: accounts[1]._id, amount: 999999, description: 'Failed transfer', status: 'FAILED', failureReason: 'Insufficient balance' }
    ]);

    await Complaint.create([
      { complaintNumber: 'CMP-2026-000001', customer: users[0]._id, title: 'App crash', description: 'App crashed on login', status: 'OPEN' },
      { complaintNumber: 'CMP-2026-000002', customer: users[1]._id, title: 'Late transfer', description: 'Transfer not received', status: 'ASSIGNED', assignedOfficer: users[2]._id },
      { complaintNumber: 'CMP-2026-000003', customer: users[0]._id, title: 'Rude staff', description: 'Staff was rude', status: 'ESCALATED', assignedOfficer: users[2]._id, escalatedAt: new Date() }
    ]);

    await Notification.create([
      { user: users[0]._id, title: 'Welcome', message: 'Welcome to bank demo', type: 'SYSTEM' }
    ]);

    console.log('Seed Data Created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error: ', error);
    process.exit(1);
  }
};

seedDB();
