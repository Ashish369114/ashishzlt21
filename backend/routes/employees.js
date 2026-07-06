const express = require('express');
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, employeeController.getEmployees);
router.get('/:id', authMiddleware, employeeController.getEmployeeById);
router.get('/school/:schoolId/department/:department', authMiddleware, employeeController.getEmployeesByDepartment);
router.get('/school/:schoolId/type/:type', authMiddleware, employeeController.getEmployeesByType);
router.get('/school/:schoolId/payroll', authMiddleware, employeeController.getEmployeePayroll);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), employeeController.addEmployee);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), employeeController.updateEmployee);
router.put('/:id/salary', authMiddleware, roleMiddleware(['super_admin', 'principal', 'admin']), employeeController.updateEmployeeSalary);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), employeeController.deleteEmployee);

module.exports = router;
