const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, reportController.getReports);
router.get('/:id', authMiddleware, reportController.getReportById);
router.get('/school/:schoolId/reports', authMiddleware, reportController.getReportsBySchool);
router.post('/generate/attendance', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), reportController.generateAttendanceReport);
router.post('/generate/academic', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), reportController.generateAcademicReport);
router.post('/generate/financial', authMiddleware, roleMiddleware(['super_admin', 'principal', 'accountant_admin']), reportController.generateFinancialReport);
router.post('/generate/performance', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), reportController.generatePerformanceReport);
router.post('/schedule', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), reportController.scheduleReport);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), reportController.updateReport);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), reportController.deleteReport);

module.exports = router;
