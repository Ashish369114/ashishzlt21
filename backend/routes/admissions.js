const express = require('express');
const admissionController = require('../controllers/admissionController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, admissionController.getAdmissions);
router.get('/:id', authMiddleware, admissionController.getAdmissionById);
router.get('/school/:schoolId', authMiddleware, admissionController.getAdmissionsBySchool);
router.get('/school/:schoolId/status/:status', authMiddleware, admissionController.getAdmissionsByStatus);
router.post('/', authMiddleware, admissionController.applyForAdmission);
router.put('/:id', authMiddleware, admissionController.updateAdmission);
router.post('/:id/approve', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), admissionController.approveAdmission);
router.post('/:id/reject', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), admissionController.rejectAdmission);

module.exports = router;
