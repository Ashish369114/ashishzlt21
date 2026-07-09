const express = require('express');
const homeworkController = require('../controllers/homeworkController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, homeworkController.getHomework);
router.get('/:id', authMiddleware, homeworkController.getHomeworkById);
router.get('/class/:classId', authMiddleware, homeworkController.getHomeworkByClass);
router.get('/subject/:subjectId', authMiddleware, homeworkController.getHomeworkBySubject);
router.get('/student/:studentId', authMiddleware, homeworkController.getHomeworkByStudent);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.addHomework);
router.post('/:id/submit', authMiddleware, roleMiddleware(['student']), homeworkController.submitHomework);
router.put('/:id/review', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.reviewHomework);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.updateHomework);
router.delete('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.deleteHomework);

module.exports = router;
