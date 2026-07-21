const { Library, School } = require('../models');

const getBooks = async (req, res) => {
  try {
    const books = await Library.findAll({
      include: [{ model: School, as: 'school' }]
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id, {
      include: [{ model: School, as: 'school' }]
    });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBook = async (req, res) => {
  try {
    if (!req.body.title || !req.body.isbn || !req.body.author || req.body.totalCopies === undefined || req.body.totalCopies === null) {
      return res.status(400).json({ message: 'Missing required fields: title, isbn, author, totalCopies' });
    }

    let schoolId = req.body.school;
    if (!schoolId) {
      const availableSchool = await School.findOne();
      if (!availableSchool) {
        return res.status(400).json({ message: 'No school configured in the system' });
      }
      schoolId = availableSchool.id;
    }

    const book = await Library.create({
      ...req.body,
      schoolId,
      availableCopies: req.body.totalCopies,
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (req.body.title === '' || req.body.isbn === '' || req.body.author === '' || (req.body.totalCopies !== undefined && req.body.totalCopies < 0)) {
      return res.status(400).json({ message: 'Invalid field values: title, isbn, author cannot be empty, totalCopies must be non-negative' });
    }
    
    Object.assign(book, req.body);
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const borrowBook = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const borrowHistory = [...(book.borrowHistory || [])];
    const existingBorrow = borrowHistory.find(
      r => String(r.userId) === String(userId) && r.status === 'borrowed'
    );
    
    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book. Please return it first.' });
    }

    const borrowRecord = {
      userId: userId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'borrowed',
    };

    borrowHistory.push(borrowRecord);
    book.borrowHistory = borrowHistory;
    book.availableCopies -= 1;

    await book.save();
    res.json({ 
      message: 'Book borrowed successfully',
      borrowRecord,
      availableCopies: book.availableCopies,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const borrowHistory = [...(book.borrowHistory || [])];
    const borrowIndex = borrowHistory.findIndex(
      r => String(r.userId) === String(userId) && r.status === 'borrowed'
    );

    if (borrowIndex === -1) {
      return res.status(400).json({ message: 'No active borrow record found' });
    }

    let borrowRecord = { ...borrowHistory[borrowIndex] };
    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';

    if (borrowRecord.returnDate > new Date(borrowRecord.dueDate)) {
      const daysOverdue = Math.ceil((borrowRecord.returnDate - new Date(borrowRecord.dueDate)) / (24 * 60 * 60 * 1000));
      borrowRecord.fine = daysOverdue * 10;
    }

    borrowHistory[borrowIndex] = borrowRecord;
    book.borrowHistory = borrowHistory;
    book.availableCopies += 1;
    
    await book.save();

    res.json({ 
      message: 'Book returned successfully',
      borrowRecord,
      availableCopies: book.availableCopies,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBooksByCategory = async (req, res) => {
  try {
    const books = await Library.findAll({ 
      where: {
        schoolId: req.params.schoolId,
        category: req.params.category 
      }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableBooks = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const books = await Library.findAll({
      where: {
        schoolId: req.params.schoolId,
        availableCopies: { [Op.gt]: 0 },
        status: 'available'
      }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const books = await Library.findAll({ where: { schoolId: req.params.schoolId } });
    const userBorrowHistory = [];
    
    books.forEach(book => {
      const userRecords = (book.borrowHistory || []).filter(
        record => String(record.userId) === String(req.params.userId)
      );
      userRecords.forEach(record => {
        userBorrowHistory.push({
          bookTitle: book.title,
          ...record,
        });
      });
    });

    res.json(userBorrowHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renewBook = async (req, res) => {
  try {
    const book = await Library.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required. Please login again.' });
    }

    const borrowHistory = [...(book.borrowHistory || [])];
    const borrowIndex = borrowHistory.findIndex(
      r => String(r.userId) === String(userId) && r.status === 'borrowed'
    );

    if (borrowIndex === -1) {
      return res.status(400).json({ message: 'No active borrow record found' });
    }

    let borrowRecord = { ...borrowHistory[borrowIndex] };
    borrowRecord.dueDate = new Date(new Date(borrowRecord.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000);
    
    borrowHistory[borrowIndex] = borrowRecord;
    book.borrowHistory = borrowHistory;
    
    await book.save();

    res.json({ 
      message: 'Book renewed successfully',
      borrowRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  borrowBook,
  returnBook,
  getBooksByCategory,
  getAvailableBooks,
  getBorrowHistory,
  deleteBook,
  renewBook,
};
