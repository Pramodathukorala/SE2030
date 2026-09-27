const Complaint = require('../models/Complaint');

const generateComplaintNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
  
  const lastComplaint = await Complaint.findOne({
    createdAt: { $gte: startOfYear, $lte: endOfYear }
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastComplaint && lastComplaint.complaintNumber) {
    const parts = lastComplaint.complaintNumber.split('-');
    if (parts.length === 3) {
      sequence = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedSequence = sequence.toString().padStart(6, '0');
  return `CMP-${year}-${paddedSequence}`;
};

module.exports = generateComplaintNumber;
