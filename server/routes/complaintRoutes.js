const express = require('express');
const { 
  createComplaint, getMyComplaints, getAssignedComplaints, getEscalatedComplaints,
  getComplaintById, updateComplaintStatus, escalateComplaint, resolveComplaint, 
  closeComplaint, addManagerNotes
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('CUSTOMER'), createComplaint);
router.get('/my-complaints', protect, authorize('CUSTOMER'), getMyComplaints);
router.get('/assigned', protect, authorize('CUSTOMER_SERVICE_OFFICER'), getAssignedComplaints);
router.get('/escalated', protect, authorize('BANK_MANAGER'), getEscalatedComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/status', protect, authorize('CUSTOMER_SERVICE_OFFICER'), updateComplaintStatus);
router.patch('/:id/escalate', protect, authorize('CUSTOMER_SERVICE_OFFICER'), escalateComplaint);
router.patch('/:id/resolve', protect, authorize('CUSTOMER_SERVICE_OFFICER'), resolveComplaint);
router.patch('/:id/close', protect, authorize('CUSTOMER_SERVICE_OFFICER'), closeComplaint);
router.patch('/:id/manager-notes', protect, authorize('BANK_MANAGER'), addManagerNotes);

module.exports = router;
