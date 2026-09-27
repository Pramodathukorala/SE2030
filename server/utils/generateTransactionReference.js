const Transaction = require('../models/Transaction');

const generateTransactionReference = async () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Find transactions today
  const startOfDay = new Date(today.setHours(0,0,0,0));
  const endOfDay = new Date(today.setHours(23,59,59,999));
  
  const lastTransaction = await Transaction.findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastTransaction && lastTransaction.referenceNumber) {
    const parts = lastTransaction.referenceNumber.split('-');
    if (parts.length === 3) {
      sequence = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedSequence = sequence.toString().padStart(6, '0');
  return `TXN-${dateStr}-${paddedSequence}`;
};

module.exports = generateTransactionReference;
