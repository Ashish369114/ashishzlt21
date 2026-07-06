const express = require('express');
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, hostelController.getHostels);
router.get('/:id', authMiddleware, hostelController.getHostelById);
router.get('/school/:schoolId/hostels', authMiddleware, hostelController.getHostelBySchool);
router.get('/school/:schoolId/available-rooms', authMiddleware, hostelController.getAvailableRooms);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), hostelController.addHostel);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), hostelController.updateHostel);
router.post('/:hostelId/allocate-student', authMiddleware, roleMiddleware(['super_admin', 'principal', 'hostel_warden']), hostelController.allocateStudentToRoom);
router.post('/:hostelId/remove-student', authMiddleware, roleMiddleware(['super_admin', 'principal', 'hostel_warden']), hostelController.removeStudentFromRoom);
router.post('/:hostelId/complaint', authMiddleware, hostelController.registerComplaint);
router.post('/:hostelId/complaint/:complaintId/resolve', authMiddleware, roleMiddleware(['super_admin', 'principal', 'hostel_warden']), hostelController.resolveComplaint);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), hostelController.deleteHostel);

module.exports = router;
