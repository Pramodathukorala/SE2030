const Account = require('../models/Account');

const generateAccountNumber = async () => {
  try {
    // Sort by accountNumber descending to get the highest account number
    const lastAccount = await Account.findOne({ accountNumber: /^ACC\d+$/ }).sort({ accountNumber: -1 });
    let nextNumber = 100001;
    if (lastAccount && lastAccount.accountNumber) {
      const numPart = lastAccount.accountNumber.replace('ACC', '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }

    let candidate = `ACC${nextNumber}`;
    // Guarantee uniqueness
    while (await Account.findOne({ accountNumber: candidate })) {
      nextNumber++;
      candidate = `ACC${nextNumber}`;
    }
    return candidate;
  } catch (err) {
    return `ACC${Date.now().toString().slice(-6)}`;
  }
};

module.exports = generateAccountNumber;
