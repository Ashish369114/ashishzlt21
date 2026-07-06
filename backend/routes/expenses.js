const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, expenseController.getExpenses);
router.get('/report/monthly', authMiddleware, expenseController.getMonthlyExpenses);
router.get('/:id', authMiddleware, expenseController.getExpenseById);
router.post('/', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal']), expenseController.addExpense);
router.put('/:id', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal']), expenseController.updateExpense);
router.delete('/:id', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal']), expenseController.deleteExpense);

module.exports = router;
