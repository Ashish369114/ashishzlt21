const express = require('express');
const transportController = require('../controllers/transportController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, transportController.getRoutes);
router.get('/:id', authMiddleware, transportController.getRouteById);
router.get('/school/:schoolId/routes', authMiddleware, transportController.getRoutesBySchool);
router.get('/:id/tracking', authMiddleware, transportController.getVehicleTracking);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), transportController.addRoute);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), transportController.updateRoute);
router.post('/:id/assign-student', authMiddleware, roleMiddleware(['super_admin', 'principal', 'transport_coordinator']), transportController.assignStudentToRoute);
router.post('/:id/remove-student', authMiddleware, roleMiddleware(['super_admin', 'principal', 'transport_coordinator']), transportController.removeStudentFromRoute);
router.post('/:id/update-location', authMiddleware, transportController.updateVehicleLocation);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), transportController.deleteRoute);

module.exports = router;
