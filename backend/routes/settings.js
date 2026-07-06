const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/:schoolId', authMiddleware, settingsController.getSettings);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.createSettings);
router.put('/:schoolId', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateSettings);
router.put('/:schoolId/general', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateGeneralSettings);
router.put('/:schoolId/academic', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateAcademicSettings);
router.put('/:schoolId/admission', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), settingsController.updateAdmissionSettings);
router.put('/:schoolId/fees', authMiddleware, roleMiddleware(['super_admin', 'principal', 'accountant_admin']), settingsController.updateFeeSettings);
router.put('/:schoolId/notification', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateNotificationSettings);
router.put('/:schoolId/security', authMiddleware, roleMiddleware(['super_admin']), settingsController.updateSecuritySettings);
router.put('/:schoolId/backup', authMiddleware, roleMiddleware(['super_admin']), settingsController.updateBackupSettings);
router.put('/:schoolId/customization', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateCustomization);
router.put('/:schoolId/integrations', authMiddleware, roleMiddleware(['super_admin', 'principal']), settingsController.updateIntegrations);

module.exports = router;
