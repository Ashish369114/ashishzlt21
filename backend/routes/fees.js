const express = require('express');
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, feeController.getFees);
router.get('/parent', authMiddleware, feeController.getFeesByParent);
router.get('/pending', authMiddleware, feeController.getPendingFees);
router.get('/student/:studentId', authMiddleware, feeController.getFeesByStudent);
router.post('/', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal']), feeController.addFee);
router.post('/pay', authMiddleware, feeController.payFee);
router.put('/:id', authMiddleware, roleMiddleware(['accountant_admin', 'super_admin', 'principal']), feeController.updateFee);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), feeController.deleteFee);

module.exports = router;
