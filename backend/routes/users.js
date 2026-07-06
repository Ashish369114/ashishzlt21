const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['super_admin', 'principal']), userController.getUsers);
router.get('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), userController.getUserById);
router.post('/', authMiddleware, roleMiddleware(['super_admin']), userController.addUser);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin']), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), userController.deleteUser);

module.exports = router;
