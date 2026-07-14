import React, { useState, useEffect } from 'react';
import { libraryService } from '../../services/api';
import '../../styles/ManagementStyles.css';
import { Bell, MoreVertical, BookOpen, Clock, AlertCircle } from 'lucide-react';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category: 'textbook',
    totalCopies: 1,
  });
  const [error, setError] = useState('');
  const [editingBookId, setEditingBookId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // New States for Actions
  const [borrowModalOpenFor, setBorrowModalOpenFor] = useState(null);
  const [historyModalOpenFor, setHistoryModalOpenFor] = useState(null);
  const [borrowUserId, setBorrowUserId] = useState('');

  // Mock Notification Data
  const [notifications] = useState([
    { id: 1, type: 'overdue', message: 'Introduction to Algorithms is overdue by 2 days.', user: 'Student: Rahul Kumar' },
    { id: 2, type: 'due_today', message: 'Advanced Physics is due today.', user: 'Student: Priya Sharma' },
    { id: 3, type: 'upcoming', message: 'World History is due in 3 days.', user: 'Student: Amit Patel' },
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActionMenuOpenFor(null);
      }
      if (!e.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
      totalCopies: 1,
    });
    setError('');
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newBook.title || !newBook.isbn || !newBook.author) {
      setError('Please fill in all required fields: Title, ISBN, and Author');
      return;
    }
    
    if (newBook.totalCopies <= 0) {
      setError('Total copies must be at least 1');
      return;
    }
    
    try {
      setError('');
      if (editingBookId) {
        await libraryService.update(editingBookId, newBook);
        alert('Book updated successfully!');
      } else {
        await libraryService.add(newBook);
        alert('Book added successfully!');
      }
      fetchBooks();
      resetBookForm();
    } catch (error) {
      console.error('Error adding book:', error);
      const errorMsg = error.response?.data?.message || 'Error adding book';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleBorrowBookSubmit = async () => {
    if (!borrowUserId) {
      alert('Please enter a User ID');
      return;
    }
    try {
      await libraryService.borrow(borrowModalOpenFor._id, { userId: borrowUserId });
      fetchBooks();
      alert('Book borrowed successfully!');
      setBorrowModalOpenFor(null);
      setBorrowUserId('');
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(error.response?.data?.message || 'Error borrowing book');
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      // Find the currently active borrow record to get the userId
      const book = books.find(b => b._id === bookId);
      const activeRecord = book?.borrowHistory?.find(r => r.status === 'borrowed');
      
      if (!activeRecord) {
         alert('No active borrow record found to return');
         return;
      }
      
      await libraryService.returnBook(bookId, { userId: activeRecord.userId });
      fetchBooks();
      alert('Book returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert(error.response?.data?.message || 'Error returning book');
    }
  };

  const handleRenewBook = async (bookId) => {
    try {
      const book = books.find(b => b._id === bookId);
      const activeRecord = book?.borrowHistory?.find(r => r.status === 'borrowed');
      
      if (!activeRecord) {
         alert('No active borrow record found to renew');
         return;
      }

      await libraryService.renew(bookId, { userId: activeRecord.userId });
      fetchBooks();
      alert('Book renewed successfully (due date extended by 14 days)!');
    } catch (error) {
      console.error('Error renewing book:', error);
      alert(error.response?.data?.message || 'Error renewing book');
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

  const handleSeedData = async () => {
    const seedBooks = [
      { title: 'The Great Gatsby', isbn: '9780743273565', author: 'F. Scott Fitzgerald', publisher: 'Scribner', category: 'fiction', totalCopies: 5 },
      { title: 'Introduction to Algorithms', isbn: '9780262033848', author: 'Thomas H. Cormen', publisher: 'MIT Press', category: 'textbook', totalCopies: 3 },
      { title: 'A Brief History of Time', isbn: '9780553380163', author: 'Stephen Hawking', publisher: 'Bantam', category: 'non-fiction', totalCopies: 2 },
    ];
    try {
      for (let book of seedBooks) {
        await libraryService.add(book);
      }
      alert('Seed data added successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data');
    }
  };

  const getBorrowStatus = (book) => {
    // Look for an active borrow record in borrowHistory
    const activeRecord = book.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
    
    if (!activeRecord) {
      return { status: 'Available', color: '#166534', bg: '#dcfce7', icon: '🟢', mockDate: null, daysLeft: null, borrower: '-' };
    }
    
    const dueDate = new Date(activeRecord.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    
    return {
      status: isOverdue ? 'Overdue' : 'Borrowed',
      color: isOverdue ? '#991b1b' : '#854d0e',
      bg: isOverdue ? '#fee2e2' : '#fef9c3',
      icon: isOverdue ? '🔴' : '🟡',
      mockDate: dueDate.toLocaleDateString(),
      daysLeft: daysLeft,
      borrower: activeRecord.userId?.toString()?.substring(0, 8) || 'User' // We don't populate user name in backend right now
    };
  };

  return (
    <div className="management-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Library Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <p className="status-badge" style={{ margin: 0, display: 'inline-block' }}>Available Books: <strong>{availableBooks}</strong></p>
            <button onClick={handleSeedData} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>🌱 Seed Demo Data</button>
          </div>
        </div>
        
        {/* Notification System UI */}
        <div className="notification-container" style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <Bell size={20} color="#475569" />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
              {notifications.length}
            </span>
          </button>

          {showNotifications && (
            <div style={{ position: 'absolute', right: 0, top: '45px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 100 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Notifications</h4>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</span>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', background: notif.type === 'overdue' ? '#fef2f2' : '#fff' }}>
                    <div style={{ color: notif.type === 'overdue' ? '#ef4444' : notif.type === 'due_today' ? '#f59e0b' : '#3b82f6', marginTop: '2px' }}>
                      {notif.type === 'overdue' ? <AlertCircle size={18} /> : notif.type === 'due_today' ? <Clock size={18} /> : <BookOpen size={18} />}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>{notif.message}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{notif.user}</p>
                      <button onClick={() => alert(`Sending reminder to ${notif.user}`)} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        Send Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleAddBook} className="management-form">
        <h3>Add New Book</h3>
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
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

      <div className="books-list" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <h3 style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}>Library Books</h3>
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading books...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Title & Author</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>ISBN / Category</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Stock</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Borrowed By</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Due Date</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Status</th>
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const bStatus = getBorrowStatus(book);
                  
                  return (
                    <tr key={book._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', '&:hover': { background: '#f8fafc' } }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{book.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{book.author}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>{book.category}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '500' }}>
                        {book.availableCopies} <span style={{ color: '#9ca3af' }}>/ {book.totalCopies}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{bStatus.borrower}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {bStatus.mockDate ? (
                          <>
                            <div style={{ color: bStatus.status === 'Overdue' ? '#ef4444' : '#1e293b', fontWeight: bStatus.status === 'Overdue' ? '600' : 'normal' }}>
                              {bStatus.mockDate}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: bStatus.status === 'Overdue' ? '#ef4444' : '#64748b', marginTop: '2px' }}>
                              {bStatus.status === 'Overdue' ? `Overdue by ${Math.abs(bStatus.daysLeft)} days` : `Due in ${bStatus.daysLeft} days`}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                          background: bStatus.bg, color: bStatus.color, display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          {bStatus.icon} {bStatus.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }} className="action-menu-container">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setActionMenuOpenFor(actionMenuOpenFor === book._id ? null : book._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <MoreVertical size={18} color="#64748b" />
                          </button>
                          
                          {actionMenuOpenFor === book._id && (
                            <div style={{
                              position: 'absolute', right: '0', top: '100%', marginTop: '4px', background: '#fff',
                              borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
                              width: '160px', zIndex: 10, overflow: 'hidden', textAlign: 'left'
                            }}>
                              {book.availableCopies > 0 && (
                                <button onClick={() => { setBorrowModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#10b981' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Borrow Book</button>
                              )}
                              {book.availableCopies < book.totalCopies && (
                                <>
                                  <button onClick={() => { handleReturnBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#3b82f6' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Return Book</button>
                                  <button onClick={() => { handleRenewBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#f59e0b' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Renew Book</button>
                                  <button onClick={() => { setHistoryModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#64748b' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>View Borrow History</button>
                                </>
                              )}
                              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>
                              <button onClick={() => { handleEditBook(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Edit Book</button>
                              <button onClick={() => { handleDeleteBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#ef4444' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>Delete Book</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      {borrowModalOpenFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Borrow: {borrowModalOpenFor.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Enter the User ID of the student/staff borrowing the book.</p>
            <input 
              type="text" 
              placeholder="User ID (e.g. 64b8c9...)" 
              value={borrowUserId} 
              onChange={e => setBorrowUserId(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setBorrowModalOpenFor(null); setBorrowUserId(''); }} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleBorrowBookSubmit} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Confirm Borrow</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalOpenFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a', marginBottom: '16px' }}>Borrow History: {historyModalOpenFor.title}</h3>
            {historyModalOpenFor.borrowHistory && historyModalOpenFor.borrowHistory.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>User ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Borrow Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Due Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModalOpenFor.borrowHistory.map((record, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{record.userId?.toString()?.substring(0,8) || 'Unknown'}</td>
                      <td style={{ padding: '10px' }}>{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: record.status === 'borrowed' ? '#fef9c3' : record.status === 'returned' ? '#dcfce7' : '#fee2e2',
                          color: record.status === 'borrowed' ? '#854d0e' : record.status === 'returned' ? '#166534' : '#991b1b'
                        }}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No borrow history found for this book.</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setHistoryModalOpenFor(null)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
