const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const generateTransactionReference = require('../utils/generateTransactionReference');
const mongoose = require('mongoose');
const { toMinorUnits, formatLKR } = require('../utils/currency');

// @desc    Transfer funds
// @route   POST /api/transactions/transfer
// @access  Private/Customer
const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverAccountNumber, description } = req.body;
    const amountInCents = toMinorUnits(req.body.amount);
    const amount = amountInCents / 100;

    if (!receiverAccountNumber || amountInCents === null) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Enter a receiver account and a positive LKR amount with at most two decimal places' });
    }

    const senderAccount = await Account.findOne({ user: req.user._id }).session(session);
    if (!senderAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Sender account not found' });
    }

    if (senderAccount.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Sender account is inactive' });
    }

    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber }).session(session);
    if (!receiverAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Receiver account not found' });
    }

    if (receiverAccount.status !== 'ACTIVE') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Receiver account is inactive' });
    }

    if (senderAccount._id.toString() === receiverAccount._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
    }

    if (Math.round(senderAccount.balance * 100) < amountInCents) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const referenceNumber = await generateTransactionReference();

    const transaction = await Transaction.create([{
      referenceNumber,
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount._id,
      amount,
      description,
      status: 'PENDING'
    }], { session });

    senderAccount.balance = (Math.round(senderAccount.balance * 100) - amountInCents) / 100;
    await senderAccount.save({ session });

    receiverAccount.balance = (Math.round(receiverAccount.balance * 100) + amountInCents) / 100;
    await receiverAccount.save({ session });

    transaction[0].status = 'SUCCESSFUL';
    await transaction[0].save({ session });

    await Notification.create([{
      user: senderAccount.user,
      title: 'Transfer Successful',
      message: `You have successfully transferred ${formatLKR(amount)} to account ${receiverAccountNumber}`,
      type: 'TRANSACTION'
    }], { session });

    await Notification.create([{
      user: receiverAccount.user,
      title: 'Funds Received',
      message: `You have received ${formatLKR(amount)} from account ${senderAccount.accountNumber}`,
      type: 'TRANSACTION'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: transaction[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my transactions
// @route   GET /api/transactions/my-transactions
// @access  Private/Customer
const getMyTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const { status, type, startDate, endDate } = req.query;

    let query = {
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }]
    };

    if (status) query.status = status;
    if (type === 'sent') query.senderAccount = account._id;
    if (type === 'received') query.receiverAccount = account._id;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('senderAccount', 'accountNumber')
      .populate('receiverAccount', 'accountNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transaction by reference
// @route   GET /api/transactions/reference/:referenceNumber
// @access  Private
const getTransactionByReference = async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    const transaction = await Transaction.findOne({ referenceNumber })
      .populate('senderAccount', 'accountNumber user')
      .populate('receiverAccount', 'accountNumber user');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (req.user.role === 'CUSTOMER') {
      const isOwner = transaction.senderAccount.user.toString() === req.user._id.toString() ||
                      transaction.receiverAccount.user.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this transaction' });
      }
    }

    res.json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(id)
      .populate('senderAccount', 'accountNumber user')
      .populate('receiverAccount', 'accountNumber user');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (req.user.role === 'CUSTOMER') {
      const isOwner = transaction.senderAccount.user.toString() === req.user._id.toString() ||
                      transaction.receiverAccount.user.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this transaction' });
      }
    }

    res.json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  transferFunds,
  getMyTransactions,
  getTransactionByReference,
  getTransactionById
};
