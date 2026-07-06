const Library = require('../models/Library');

const getBooks = async (req, res) => {
  try {
    const books = await Library.find()
      .populate('school');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id)
      .populate('school');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBook = async (req, res) => {
  const book = new Library({
    ...req.body,
    availableCopies: req.body.totalCopies,
  });
  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    Object.assign(book, req.body);
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const borrowBook = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }

    const borrowRecord = {
      userId: req.body.userId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'borrowed',
    };

    book.borrowHistory.push(borrowRecord);
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
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const borrowRecord = book.borrowHistory.find(
      r => r.userId.toString() === req.body.userId && r.status === 'borrowed'
    );

    if (!borrowRecord) {
      return res.status(400).json({ message: 'No active borrow record found' });
    }

    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';

    // Calculate fine if overdue
    if (borrowRecord.returnDate > borrowRecord.dueDate) {
      const daysOverdue = Math.ceil((borrowRecord.returnDate - borrowRecord.dueDate) / (24 * 60 * 60 * 1000));
      borrowRecord.fine = daysOverdue * 10; // 10 per day
    }

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
    const books = await Library.find({ 
      school: req.params.schoolId,
      category: req.params.category 
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableBooks = async (req, res) => {
  try {
    const books = await Library.find({
      school: req.params.schoolId,
      availableCopies: { $gt: 0 },
      status: 'available'
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const books = await Library.find({ school: req.params.schoolId });
    const userBorrowHistory = [];
    
    books.forEach(book => {
      const userRecords = book.borrowHistory.filter(
        record => record.userId.toString() === req.params.userId
      );
      userRecords.forEach(record => {
        userBorrowHistory.push({
          bookTitle: book.title,
          ...record.toObject ? record.toObject() : record,
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
    const book = await Library.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
};
