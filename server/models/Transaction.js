const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true },
  senderAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  receiverAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['PENDING', 'SUCCESSFUL', 'FAILED'], default: 'PENDING' },
  failureReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
