const express = require('express');
const { 
  getCustomerDashboard, getOfficerDashboard, getManagerDashboard, getAdminDashboard 
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/customer', protect, authorize('CUSTOMER'), getCustomerDashboard);
router.get('/officer', protect, authorize('CUSTOMER_SERVICE_OFFICER'), getOfficerDashboard);
router.get('/manager', protect, authorize('BANK_MANAGER'), getManagerDashboard);
router.get('/admin', protect, authorize('SYSTEM_ADMIN'), getAdminDashboard);

module.exports = router;
