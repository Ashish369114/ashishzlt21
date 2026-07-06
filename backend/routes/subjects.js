const express = require('express');
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, subjectController.getSubjects);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal']), subjectController.addSubject);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), subjectController.updateSubject);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), subjectController.deleteSubject);

module.exports = router;
