const Account = require('../models/Account');

// @desc    Get my account
// @route   GET /api/accounts/my-account
// @access  Private/Customer
const getMyAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user._id }).populate('user', 'firstName lastName email');
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({
      success: true,
      message: 'Account fetched successfully',
      data: account
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyAccount
};
