const express = require('express');
const { 
  transferFunds, 
  getMyTransactions, 
  getTransactionByReference, 
  getTransactionById 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/transfer', protect, authorize('CUSTOMER'), transferFunds);
router.get('/my-transactions', protect, authorize('CUSTOMER'), getMyTransactions);
router.get('/reference/:referenceNumber', protect, getTransactionByReference);
router.get('/:id', protect, getTransactionById);

module.exports = router;
