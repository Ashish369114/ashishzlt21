const express = require('express');
const concessionController = require('../controllers/concessionController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, concessionController.getAllRequests);
router.get('/pending', authMiddleware, roleMiddleware(['super_admin', 'principal']), concessionController.getPendingRequests);
router.post('/', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal', 'parent']), concessionController.createRequest);
router.put('/:id/approve', authMiddleware, roleMiddleware(['super_admin', 'principal']), concessionController.approveRequest);
router.put('/:id/reject', authMiddleware, roleMiddleware(['super_admin', 'principal']), concessionController.rejectRequest);

module.exports = router;
