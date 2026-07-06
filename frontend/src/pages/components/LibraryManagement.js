import React, { useState, useEffect } from 'react';
import { libraryService } from '../../services/api';
import '../../styles/ManagementStyles.css';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category: 'textbook',
    totalCopies: 0,
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await libraryService.getAll();
      setBooks(response.data);
      setAvailableBooks(response.data.filter(b => b.availableCopies > 0).length);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleEditBook = (book) => {
    setEditingBookId(book._id);
    setNewBook({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      publisher: book.publisher || '',
      category: book.category || 'textbook',
      totalCopies: book.totalCopies,
    });
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setNewBook({
      title: '',
      isbn: '',
      author: '',
      publisher: '',
      category: 'textbook',
      totalCopies: 0,
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBookId) {
        await libraryService.update(editingBookId, newBook);
      } else {
        await libraryService.add(newBook);
      }
      fetchBooks();
      resetBookForm();
      alert(editingBookId ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book');
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      await libraryService.borrow(bookId, { userId: localStorage.getItem('userId') });
      fetchBooks();
      alert('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(error.response?.data?.message || 'Error borrowing book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await libraryService.delete(id);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Library Management</h1>
      <p className="status-badge">Available Books: <strong>{availableBooks}</strong></p>

      <form onSubmit={handleAddBook} className="management-form">
        <h3>Add New Book</h3>
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={newBook.title}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={newBook.isbn}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={newBook.author}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="publisher"
          placeholder="Publisher"
          value={newBook.publisher}
          onChange={handleInputChange}
        />
        <select name="category" value={newBook.category} onChange={handleInputChange}>
          <option value="textbook">Textbook</option>
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-Fiction</option>
          <option value="reference">Reference</option>
        </select>
        <input
          type="number"
          name="totalCopies"
          placeholder="Total Copies"
          value={newBook.totalCopies}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editingBookId ? 'Update Book' : 'Add Book'}</button>
        {editingBookId && (
          <button type="button" onClick={resetBookForm} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        )}
      </form>

      <div className="books-list">
        <h3>Library Books</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Available/Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>{book.availableCopies}/{book.totalCopies}</td>
                  <td>
                    {book.availableCopies > 0 && (
                      <button onClick={() => handleBorrowBook(book._id)} className="btn-borrow">
                        Borrow
                      </button>
                    )}
                    <button onClick={() => handleEditBook(book)} style={{ margin: '0 8px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteBook(book._id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LibraryManagement;
