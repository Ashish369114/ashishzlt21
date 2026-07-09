const express = require('express');
const remarkController = require('../controllers/remarkController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, remarkController.getRemarks);
router.get('/student/:studentId', authMiddleware, remarkController.getRemarksByStudent);
router.get('/class/:classId', authMiddleware, remarkController.getRemarksByClass);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), remarkController.addRemark);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), remarkController.updateRemark);
router.delete('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), remarkController.deleteRemark);

module.exports = router;
