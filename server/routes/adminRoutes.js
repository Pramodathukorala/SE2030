const express = require('express');
const { 
  getAllUsers, getUserById, createStaffUser, updateUser, updateUserRole, updateUserStatus 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SYSTEM_ADMIN'));

router.get('/users', getAllUsers);
router.post('/users', createStaffUser);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
