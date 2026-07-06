const express = require('express');
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, libraryController.getBooks);
router.get('/:id', authMiddleware, libraryController.getBookById);
router.get('/school/:schoolId/available', authMiddleware, libraryController.getAvailableBooks);
router.get('/school/:schoolId/category/:category', authMiddleware, libraryController.getBooksByCategory);
router.get('/user/:userId/history', authMiddleware, libraryController.getBorrowHistory);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal', 'librarian']), libraryController.addBook);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal', 'librarian']), libraryController.updateBook);
router.post('/:id/borrow', authMiddleware, libraryController.borrowBook);
router.post('/:id/return', authMiddleware, libraryController.returnBook);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal', 'librarian']), libraryController.deleteBook);

module.exports = router;
