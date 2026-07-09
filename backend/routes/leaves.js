const express = require('express');
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All authenticated users — controller filters results by role
router.get('/', authMiddleware, leaveController.getAll);

// Pending list — principal & super_admin only
router.get(
  '/pending',
  authMiddleware,
  roleMiddleware(['super_admin', 'principal']),
  leaveController.getPending
);

// Single record — any auth user (controller checks ownership)
router.get('/:id', authMiddleware, leaveController.getById);

// Submit a leave — any logged-in user (teacher, student, parent, staff)
router.post('/', authMiddleware, leaveController.create);

// Approve — principal & super_admin only
router.put(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['super_admin', 'principal']),
  leaveController.approve
);

// Reject — principal & super_admin only
router.put(
  '/:id/reject',
  authMiddleware,
  roleMiddleware(['super_admin', 'principal']),
  leaveController.reject
);

// Delete — principal/super_admin can delete any; others only their own pending
router.delete('/:id', authMiddleware, leaveController.remove);

module.exports = router;
