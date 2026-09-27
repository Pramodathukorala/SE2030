const express = require('express');
const { getMyAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/my-account', protect, authorize('CUSTOMER'), getMyAccount);

module.exports = router;
