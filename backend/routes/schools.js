const express = require('express');
const schoolController = require('../controllers/schoolController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, schoolController.getSchools);
router.get('/:id', authMiddleware, schoolController.getSchoolById);
router.get('/:id/statistics', authMiddleware, schoolController.getSchoolStatistics);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), schoolController.addSchool);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), schoolController.updateSchool);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), schoolController.deleteSchool);

module.exports = router;
