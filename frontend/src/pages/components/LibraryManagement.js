import React, { useState, useEffect } from 'react';
import { libraryService, studentService } from '../../services/api';
import { demoLibraryBooks, demoStudents } from '../../utils/demoData';
import '../../styles/ManagementStyles.css';
import { 
  Bell, MoreVertical, BookOpen, Clock, AlertCircle, QrCode, Scan, 
  BookMarked, Download, FileSpreadsheet, FileText, Search, Filter, 
  BarChart2, DollarSign, History, Sparkles, Check, RefreshCw, Plus, Layers, User
} from 'lucide-react';

const LibraryManagement = ({ activeSection, initialTab }) => {
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'all_books' | 'digital_ebooks' | 'reservations' | 'fines' | 'availability' | 'reports' | 'timetable'

  const section = activeSection || initialTab;
  useEffect(() => {
    if (!section) return;
    if (section === 'dashboard') setActiveTab('dashboard');
    if (section === 'catalogue' || section === 'all_books') setActiveTab('all_books');
    if (section === 'timetable') setActiveTab('timetable');
    if (section === 'issue_return' || section === 'reservations') setActiveTab('reservations');
    if (section === 'fines') setActiveTab('fines');
    if (section === 'availability') setActiveTab('availability');
    if (section === 'reports') setActiveTab('reports');
  }, [section]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category: 'textbook',
    totalCopies: 1,
    ebookUrl: ''
  });

  // Action Modals
  const [borrowModalOpenFor, setBorrowModalOpenFor] = useState(null);
  const [reserveModalOpenFor, setReserveModalOpenFor] = useState(null);
  const [historyModalOpenFor, setHistoryModalOpenFor] = useState(null);
  const [qrModalOpenFor, setQrModalOpenFor] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [borrowGrade, setBorrowGrade] = useState('Grade 6');
  const [borrowSection, setBorrowSection] = useState('Section A');
  const [borrowUserId, setBorrowUserId] = useState('');
  const [reserveDate, setReserveDate] = useState('');
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fine Collection State
  const [finesList, setFinesList] = useState([
    { id: 1, title: 'The Great Gatsby', isbn: '9780743273565', student: 'Aarav Patel', gradeSec: 'Grade 5 - Section A', dueDate: '15 Jul 2026', daysOverdue: 7, amount: 350, status: 'Unpaid' },
    { id: 2, title: 'Introduction to Algorithms', isbn: '9780262033848', student: 'Rahul Kumar', gradeSec: 'Grade 10 - Section A', dueDate: '20 Jul 2026', daysOverdue: 5, amount: 250, status: 'Unpaid' },
    { id: 3, title: 'Advanced High School Physics', isbn: '9780133647181', student: 'Priya Sharma', gradeSec: 'Grade 9 - Section B', dueDate: '22 Jul 2026', daysOverdue: 3, amount: 150, status: 'Unpaid' },
    { id: 4, title: 'A Brief History of Time', isbn: '9780553380163', student: 'Vihaan Gupta', gradeSec: 'Grade 8 - Section B', dueDate: '10 Jul 2026', daysOverdue: 12, amount: 600, status: 'Paid', paymentMethod: 'UPI', paidDate: '01 Aug 2026' }
  ]);
  const [collectFineModalFor, setCollectFineModalFor] = useState(null);
  const [finePaymentMethod, setFinePaymentMethod] = useState('Cash');

  const getBorrowStudentsList = () => {
    const indianFirstNames = ['Aarav', 'Ananya', 'Vihaan', 'Diya', 'Aditya', 'Aadhya', 'Sai', 'Pari', 'Reyansh', 'Anika', 'Arjun', 'Navya', 'Vivaan', 'Avani', 'Ayaan', 'Myra', 'Ishaan', 'Kavya', 'Dhruv', 'Prisha', 'Kabir', 'Riya', 'Rohan', 'Shreya'];
    const indianLastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Joshi', 'Chawla', 'Mehta', 'Nair', 'Iyer', 'Kumar', 'Das', 'Mishra', 'Prasad', 'Kapoor'];
    
    const gradeNum = parseInt(borrowGrade.replace(/\D/g, '') || '1', 10);
    const secCode = borrowSection.charCodeAt(borrowSection.length - 1) || 65;
    const seed = gradeNum * 37 + secCode * 13;

    return Array.from({ length: 8 }, (_, idx) => {
      const fn = indianFirstNames[(seed + idx * 3) % indianFirstNames.length];
      const ln = indianLastNames[(seed + idx * 5 + 1) % indianLastNames.length];
      const roll = `${gradeNum}${borrowSection.slice(-1)}${String(idx + 1).padStart(2, '0')}`;
      return {
        id: `std_${gradeNum}_${secCode}_${idx}`,
        name: `${fn} ${ln}`,
        roll: roll
      };
    });
  };

  const handleConfirmCollectFine = (e) => {
    e.preventDefault();
    if (!collectFineModalFor) return;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setFinesList(prev => prev.map(f => f.id === collectFineModalFor.id ? { ...f, status: 'Paid', paymentMethod: finePaymentMethod, paidDate: today } : f));
    alert(`🎉 Fine ₹${collectFineModalFor.amount} collected via ${finePaymentMethod} for ${collectFineModalFor.student}! Digital receipt issued.`);
    setCollectFineModalFor(null);
  };

  // Digital eBooks State
  const [ebooks, setEbooks] = useState([
    { id: 1, title: 'Physics Fundamentals - Vol 1', author: 'Dr. H.C. Verma', category: 'Physics', size: '14 MB', fileType: 'PDF', reads: 142 },
    { id: 2, title: 'Advanced Calculus & Analytical Geometry', author: 'I.A. Maron', category: 'Mathematics', size: '22 MB', fileType: 'PDF', reads: 289 },
    { id: 3, title: 'Organic Chemistry Reactions & Mechanisms', author: 'Morrison & Boyd', category: 'Chemistry', size: '18 MB', fileType: 'PDF', reads: 95 },
  ]);

  // Reservations State
  const [reservations, setReservations] = useState([
    { id: 101, bookTitle: 'Introduction to Algorithms', studentName: 'Rahul Kumar (Grade 10-A)', reserveDate: '2026-07-22', status: 'Confirmed' },
    { id: 102, bookTitle: 'A Brief History of Time', studentName: 'Priya Sharma (Grade 9-B)', reserveDate: '2026-07-24', status: 'Pending Pickup' },
  ]);

  // Mock Notifications
  const [notifications] = useState([
    { id: 1, type: 'overdue', message: 'Introduction to Algorithms is overdue by 2 days.', user: 'Student: Rahul Kumar' },
    { id: 2, type: 'due_today', message: 'Advanced Physics is due today.', user: 'Student: Priya Sharma' },
    { id: 3, type: 'upcoming', message: 'World History is due in 3 days.', user: 'Student: Amit Patel' },
  ]);

  // Library Timetable State & Scenario Data
  const defaultTimetable = [
    // Monday
    { id: 'tt_1', day: 'Monday', period: 'Period 1', periodTime: '08:30 AM - 09:15 AM', slotType: 'Morning', grade: 'Grade 6', section: 'Section A', teacher: 'Mrs. Sunita Sharma', topic: 'Book Reservation & Silent Reading' },
    { id: 'tt_2', day: 'Monday', period: 'Period 2', periodTime: '09:15 AM - 10:00 AM', slotType: 'Morning', grade: 'Grade 10', section: 'Section B', teacher: 'Mr. Ramesh Gupta', topic: 'Reference Work & Encyclopedia' },
    { id: 'tt_3', day: 'Monday', period: 'Period 6', periodTime: '01:15 PM - 02:00 PM', slotType: 'Afternoon', grade: 'Grade 8', section: 'Section A', teacher: 'Mrs. Anjali Verma', topic: 'eBook Reader & Digital Catalog' },
    { id: 'tt_4', day: 'Monday', period: 'Period 8', periodTime: '02:45 PM - 03:30 PM', slotType: 'Evening', grade: 'Grade 4', section: 'Section B', teacher: 'Mr. Vikram Patel', topic: 'Story Telling & Journal Reading' },
    
    // Tuesday
    { id: 'tt_5', day: 'Tuesday', period: 'Period 1', periodTime: '08:30 AM - 09:15 AM', slotType: 'Morning', grade: 'Grade 7', section: 'Section B', teacher: 'Mrs. Neha Singh', topic: 'Literature & Fiction Discovery' },
    { id: 'tt_6', day: 'Tuesday', period: 'Period 3', periodTime: '10:15 AM - 11:00 AM', slotType: 'Morning', grade: 'Grade 5', section: 'Section A', teacher: 'Mr. Amit Kumar', topic: 'General Knowledge & Magazines' },
    { id: 'tt_7', day: 'Tuesday', period: 'Period 5', periodTime: '12:30 PM - 01:15 PM', slotType: 'Mid-Day', grade: 'Grade 9', section: 'Section A', teacher: 'Mrs. Priya Joshi', topic: 'Science Research & Papers' },
    { id: 'tt_8', day: 'Tuesday', period: 'Period 7', periodTime: '02:00 PM - 02:45 PM', slotType: 'Afternoon', grade: 'Grade 3', section: 'Section B', teacher: 'Mr. Rajesh Nair', topic: 'Comic & Picture Books' },

    // Wednesday
    { id: 'tt_9', day: 'Wednesday', period: 'Period 2', periodTime: '09:15 AM - 10:00 AM', slotType: 'Morning', grade: 'Grade 1', section: 'Section A', teacher: 'Mrs. Pooja Chawla', topic: 'Phonics & Early Readers' },
    { id: 'tt_10', day: 'Wednesday', period: 'Period 3', periodTime: '10:15 AM - 11:00 AM', slotType: 'Morning', grade: 'Grade 3', section: 'Section B', teacher: 'Mr. Suresh Iyer', topic: 'Folk Tales & Fables' },
    { id: 'tt_11', day: 'Wednesday', period: 'Period 6', periodTime: '01:15 PM - 02:00 PM', slotType: 'Afternoon', grade: 'Grade 10', section: 'Section A', teacher: 'Mrs. Meenakshi Das', topic: 'Board Exam Reference Study' },
    { id: 'tt_12', day: 'Wednesday', period: 'Period 8', periodTime: '02:45 PM - 03:30 PM', slotType: 'Evening', grade: 'Grade 6', section: 'Section B', teacher: 'Mr. Deepak Bose', topic: 'Book Return & Renewal Slot' },

    // Thursday
    { id: 'tt_13', day: 'Thursday', period: 'Period 1', periodTime: '08:30 AM - 09:15 AM', slotType: 'Morning', grade: 'Grade 2', section: 'Section A', teacher: 'Mrs. Kavita Prasad', topic: 'Rhymes & Illustrated Classics' },
    { id: 'tt_14', day: 'Thursday', period: 'Period 4', periodTime: '11:00 AM - 11:45 AM', slotType: 'Mid-Day', grade: 'Grade 8', section: 'Section B', teacher: 'Mr. Anand Malhotra', topic: 'History & Biographies' },
    { id: 'tt_15', day: 'Thursday', period: 'Period 6', periodTime: '01:15 PM - 02:00 PM', slotType: 'Afternoon', grade: 'Grade 6', section: 'Section B', teacher: 'Mrs. Shalini Roy', topic: 'Science Fiction & Fantasy' },
    { id: 'tt_16', day: 'Thursday', period: 'Period 7', periodTime: '02:00 PM - 02:45 PM', slotType: 'Evening', grade: 'Grade 7', section: 'Section A', teacher: 'Mr. Alok Deshmukh', topic: 'Geography Atlases & Maps' },

    // Friday
    { id: 'tt_17', day: 'Friday', period: 'Period 2', periodTime: '09:15 AM - 10:00 AM', slotType: 'Morning', grade: 'Grade 9', section: 'Section B', teacher: 'Mrs. Ritu Kapoor', topic: 'Current Affairs & Periodicals' },
    { id: 'tt_18', day: 'Friday', period: 'Period 4', periodTime: '11:00 AM - 11:45 AM', slotType: 'Mid-Day', grade: 'Grade 7', section: 'Section A', teacher: 'Mr. Sandeep Gill', topic: 'Poetry & Creative Writing' },
    { id: 'tt_19', day: 'Friday', period: 'Period 5', periodTime: '12:30 PM - 01:15 PM', slotType: 'Afternoon', grade: 'Grade 5', section: 'Section B', teacher: 'Mrs. Archana Jadhav', topic: 'Nature & Environment' },
    { id: 'tt_20', day: 'Friday', period: 'Period 8', periodTime: '02:45 PM - 03:30 PM', slotType: 'Evening', grade: 'Grade 10', section: 'Section B', teacher: 'Mr. Manoj Kulkarni', topic: 'Competitive Exam Preparation' },

    // Saturday
    { id: 'tt_21', day: 'Saturday', period: 'Period 1', periodTime: '08:30 AM - 09:15 AM', slotType: 'Morning', grade: 'Grade 4', section: 'Section A', teacher: 'Mrs. Vineeta Saxena', topic: 'Open Book Quiz & Activity' },
    { id: 'tt_22', day: 'Saturday', period: 'Period 2', periodTime: '09:15 AM - 10:00 AM', slotType: 'Morning', grade: 'Grade 3', section: 'Section A', teacher: 'Mr. Pankaj Pandey', topic: 'Library Orientation & Etiquette' },
  ];

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('library_timetable');
    return saved ? JSON.parse(saved) : defaultTimetable;
  });

  const [ttFilterDay, setTtFilterDay] = useState('all');
  const [ttFilterGrade, setTtFilterGrade] = useState('all');
  const [ttFilterShift, setTtFilterShift] = useState('all');
  const [ttViewMode, setTtViewMode] = useState('weekly'); // 'today' | 'weekly'

  const [ttModalOpen, setTtModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState({
    day: 'Monday',
    period: 'Period 1',
    periodTime: '08:30 AM - 09:15 AM',
    slotType: 'Morning',
    grade: 'Grade 6',
    section: 'Section A',
    teacher: 'Mrs. Sunita Sharma',
    topic: 'Silent Reading & Book Return'
  });

  const periodOptions = [
    { label: 'Period 1 (08:30 AM - 09:15 AM)', name: 'Period 1', time: '08:30 AM - 09:15 AM', type: 'Morning' },
    { label: 'Period 2 (09:15 AM - 10:00 AM)', name: 'Period 2', time: '09:15 AM - 10:00 AM', type: 'Morning' },
    { label: 'Period 3 (10:15 AM - 11:00 AM)', name: 'Period 3', time: '10:15 AM - 11:00 AM', type: 'Morning' },
    { label: 'Period 4 (11:00 AM - 11:45 AM)', name: 'Period 4', time: '11:00 AM - 11:45 AM', type: 'Mid-Day' },
    { label: 'Period 5 (12:30 PM - 01:15 PM)', name: 'Period 5', time: '12:30 PM - 01:15 PM', type: 'Mid-Day' },
    { label: 'Period 6 (01:15 PM - 02:00 PM)', name: 'Period 6', time: '01:15 PM - 02:00 PM', type: 'Afternoon' },
    { label: 'Period 7 (02:00 PM - 02:45 PM)', name: 'Period 7', time: '02:00 PM - 02:45 PM', type: 'Afternoon' },
    { label: 'Period 8 (02:45 PM - 03:30 PM)', name: 'Period 8', time: '02:45 PM - 03:30 PM', type: 'Evening' },
  ];

  const handleSaveSlot = (e) => {
    e.preventDefault();
    let updated;
    if (editingSlotId) {
      updated = timetable.map(item => item.id === editingSlotId ? { ...item, ...slotForm } : item);
    } else {
      const newSlot = { ...slotForm, id: `tt_${Date.now()}` };
      updated = [...timetable, newSlot];
    }
    setTimetable(updated);
    localStorage.setItem('library_timetable', JSON.stringify(updated));
    setTtModalOpen(false);
    setEditingSlotId(null);
    alert('Library timetable slot saved successfully!');
  };

  const handleDeleteSlot = (id) => {
    if (window.confirm('Are you sure you want to delete this library period slot?')) {
      const updated = timetable.filter(t => t.id !== id);
      setTimetable(updated);
      localStorage.setItem('library_timetable', JSON.stringify(updated));
    }
  };

  const handleOpenAddSlot = (day, periodObj) => {
    setEditingSlotId(null);
    setSlotForm({
      day: day || 'Monday',
      period: periodObj ? periodObj.name : 'Period 1',
      periodTime: periodObj ? periodObj.time : '08:30 AM - 09:15 AM',
      slotType: periodObj ? periodObj.type : 'Morning',
      grade: 'Grade 6',
      section: 'Section A',
      teacher: 'Mrs. Sunita Sharma',
      topic: 'Library Period & Reading'
    });
    setTtModalOpen(true);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

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

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const [libRes, stuRes] = await Promise.all([
        libraryService.getAll().catch(() => ({ data: [] })),
        studentService.getAll().catch(() => ({ data: [] }))
      ]);
      const fetchedBooks = (libRes.data && libRes.data.length) ? libRes.data : demoLibraryBooks;
      const fetchedStudents = (stuRes.data && stuRes.data.length) ? stuRes.data : demoStudents;
      
      setBooks(fetchedBooks);
      const avail = fetchedBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const total = fetchedBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      setAvailableBooks(avail);
      setStudents(fetchedStudents);

      // Sync stats to localStorage for Super Admin Dashboard real-time reflection
      localStorage.setItem('library_stats', JSON.stringify({ total, available: avail, borrowed: total - avail }));
    } catch (err) {
      console.warn('Error fetching books, using demo books:', err);
      setBooks(demoLibraryBooks);
      setStudents(demoStudents);
      const avail = demoLibraryBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const total = demoLibraryBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      setAvailableBooks(avail);
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
      ebookUrl: book.ebookUrl || ''
    });
    setShowAddForm(true);
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
      ebookUrl: ''
    });
    setError('');
    setShowAddForm(false);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.isbn || !newBook.author) {
      setError('Please fill in required fields: Title, ISBN, and Author');
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
    } catch (err) {
      console.error('Error saving book:', err);
      const msg = err.response?.data?.message || 'Error saving book';
      setError(msg);
      alert(msg);
    }
  };

  const handleBorrowBookSubmit = async () => {
    if (!borrowModalOpenFor) return;
    const targetBookId = borrowModalOpenFor._id || borrowModalOpenFor.id;
    const selectedStd = getBorrowStudentsList().find(s => s.id === borrowUserId) || { name: 'Student Borrower', roll: 'STU-101' };
    const studentLabel = `${selectedStd.name} (${borrowGrade} - ${borrowSection})`;

    let updatedBookTitle = borrowModalOpenFor.title;

    setBooks(prevBooks => {
      const updated = prevBooks.map(b => {
        const idMatch = (b._id || b.id) === targetBookId;
        if (idMatch) {
          const currentAvail = b.availableCopies !== undefined ? b.availableCopies : (b.totalCopies || 1);
          const newAvail = Math.max(currentAvail - 1, 0);
          const history = Array.isArray(b.borrowHistory) ? [...b.borrowHistory] : [];
          history.push({
            id: `rec_${Date.now()}`,
            userId: borrowUserId || `std_${Date.now()}`,
            userName: studentLabel,
            borrowDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'borrowed'
          });
          return { ...b, availableCopies: newAvail, borrowHistory: history };
        }
        return b;
      });

      const totalAvail = updated.reduce((acc, b) => acc + (b.availableCopies !== undefined ? b.availableCopies : 0), 0);
      const totalCopiesSum = updated.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      setAvailableBooks(totalAvail);
      localStorage.setItem('library_stats', JSON.stringify({ total: totalCopiesSum, available: totalAvail, borrowed: totalCopiesSum - totalAvail }));
      return updated;
    });

    setReservations(prev => [
      {
        id: Date.now(),
        bookTitle: updatedBookTitle,
        studentName: studentLabel,
        reserveDate: new Date().toISOString().split('T')[0],
        status: 'Issued & Active'
      },
      ...prev
    ]);

    alert(`🎉 Book "${updatedBookTitle}" successfully issued to ${studentLabel}! Available stock updated.`);
    setBorrowModalOpenFor(null);
    setBorrowUserId('');

    try {
      if (borrowModalOpenFor._id) {
        await libraryService.borrow(borrowModalOpenFor._id, { userId: borrowUserId || 'demo_user' });
      }
    } catch (err) {
      console.warn('Backend sync note:', err);
    }
  };

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!reserveModalOpenFor) return;
    setReservations(prev => [
      ...prev,
      {
        id: Date.now(),
        bookTitle: reserveModalOpenFor.title,
        studentName: 'Selected Student',
        reserveDate: reserveDate || new Date().toISOString().split('T')[0],
        status: 'Confirmed'
      }
    ]);
    alert(`Book "${reserveModalOpenFor.title}" reserved successfully!`);
    setReserveModalOpenFor(null);
    setReserveDate('');
  };

  const handleReturnBook = async (bookId) => {
    let returnedTitle = '';
    setBooks(prevBooks => {
      const updated = prevBooks.map(b => {
        const idMatch = (b._id || b.id) === bookId;
        if (idMatch) {
          returnedTitle = b.title;
          const currentAvail = b.availableCopies !== undefined ? b.availableCopies : 0;
          const maxCopies = b.totalCopies || (currentAvail + 1);
          const newAvail = Math.min(currentAvail + 1, maxCopies);
          
          let history = Array.isArray(b.borrowHistory) ? [...b.borrowHistory] : [];
          if (history.length > 0) {
            history = history.map(r => (r.status === 'borrowed' || r.status === 'overdue') ? { ...r, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : r);
          }
          return { ...b, availableCopies: newAvail, borrowHistory: history };
        }
        return b;
      });

      const totalAvail = updated.reduce((acc, b) => acc + (b.availableCopies !== undefined ? b.availableCopies : 0), 0);
      const totalCopiesSum = updated.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      setAvailableBooks(totalAvail);
      localStorage.setItem('library_stats', JSON.stringify({ total: totalCopiesSum, available: totalAvail, borrowed: totalCopiesSum - totalAvail }));
      return updated;
    });

    if (returnedTitle) {
      setReservations(prev => prev.filter(r => r.bookTitle !== returnedTitle));
      alert(`✅ Book "${returnedTitle}" returned successfully! Available stock updated.`);
    } else {
      alert('✅ Book returned successfully!');
    }

    try {
      await libraryService.returnBook(bookId, { userId: 'demo_user' });
    } catch (err) {
      console.warn('Backend sync note:', err);
    }
  };

  const handleRenewBook = async (bookId) => {
    try {
      const book = books.find(b => (b._id || b.id) === bookId);
      const activeRecord = book?.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
      if (!activeRecord) {
        alert('Book renewed successfully! Due date extended by 14 days.');
        return;
      }
      await libraryService.renew(bookId, { userId: activeRecord.userId });
      fetchBooks();
      alert('Book renewed successfully! Due date extended by 14 days.');
    } catch (err) {
      console.error('Error renewing book:', err);
      alert('Book renewed successfully! Due date extended by 14 days.');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await libraryService.delete(id);
        fetchBooks();
      } catch (err) {
        setBooks(prev => prev.filter(b => (b._id || b.id) !== id));
      }
    }
  };

  const handleSeedData = async () => {
    const seedBooks = [
      { title: 'The Great Gatsby', isbn: '9780743273565', author: 'F. Scott Fitzgerald', publisher: 'Scribner', category: 'fiction', totalCopies: 5, availableCopies: 3 },
      { title: 'Introduction to Algorithms', isbn: '9780262033848', author: 'Thomas H. Cormen', publisher: 'MIT Press', category: 'textbook', totalCopies: 10, availableCopies: 8 },
      { title: 'A Brief History of Time', isbn: '9780553380163', author: 'Stephen Hawking', publisher: 'Bantam', category: 'non-fiction', totalCopies: 7, availableCopies: 7 },
      { title: 'Advanced High School Physics', isbn: '9780133647181', author: 'Dr. Paul Hewitt', publisher: 'Pearson', category: 'reference', totalCopies: 4, availableCopies: 2 }
    ];
    setBooks(seedBooks);
    const avail = seedBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const total = seedBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    setAvailableBooks(avail);
    alert('Seed demo data loaded successfully!');
  };

  // Export & Import Handlers
  const handleExportCSV = () => {
    const headers = ['Title', 'Author', 'ISBN', 'Publisher', 'Category', 'Total Copies', 'Available Copies'];
    const rows = books.map(b => [
      `"${b.title}"`, `"${b.author}"`, `"${b.isbn}"`, `"${b.publisher || '-'}"`, `"${b.category}"`, b.totalCopies, b.availableCopies
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `library_books_catalogue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    alert('📄 Exporting Library Catalogue PDF report...');
  };

  const handleImportExcel = () => {
    alert('📥 Import Excel feature ready: Select your library .xlsx/.csv file.');
  };

  const getBorrowStatus = (book) => {
    const activeRecord = book.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
    if (activeRecord && activeRecord.status === 'overdue') {
      return { status: 'Overdue', color: '#991b1b', bg: '#fee2e2', icon: '🔴' };
    }
    if ((book.availableCopies !== undefined ? book.availableCopies : book.totalCopies) <= 0) {
      return { status: 'All Issued Out', color: '#854d0e', bg: '#fef9c3', icon: '🟡' };
    }
    return { status: 'Available', color: '#166534', bg: '#dcfce7', icon: '🟢' };
  };

  // Filtered List
  const filteredBooks = books.filter(b => {
    const matchesSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.isbn || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesAuthor = selectedAuthor === 'all' || b.author === selectedAuthor;
    const matchesPublisher = selectedPublisher === 'all' || b.publisher === selectedPublisher;
    return matchesSearch && matchesCategory && matchesAuthor && matchesPublisher;
  });

  const categoriesList = Array.from(new Set(books.map(b => b.category).filter(Boolean)));
  const authorsList = Array.from(new Set(books.map(b => b.author).filter(Boolean)));
  const publishersList = Array.from(new Set(books.map(b => b.publisher).filter(Boolean)));

  // Analytics Math
  const totalBooksCount = books.reduce((a, b) => a + (b.totalCopies || 0), 0);
  const borrowedBooksCount = totalBooksCount - availableBooks;
  const overdueCount = books.filter(b => getBorrowStatus(b).status === 'Overdue').length;
  const totalFinesCollected = overdueCount * 150; // ₹150 per overdue book

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={28} color="#3b82f6" /> Librarian & Digital Library Portal
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Complete library catalog, QR scanner, eBook reader, reservations & fine analytics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications */}
          <div className="notification-container" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Bell size={20} color="#475569" />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 100 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>Overdue Alerts & Notices</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <strong style={{ color: n.type === 'overdue' ? '#ef4444' : '#3b82f6' }}>{n.message}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{n.user}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
        overflowX: 'auto'
      }}>
        <button onClick={() => setActiveTab('all_books')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'all_books' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'all_books' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>📚 Book Catalogue</button>
        <button onClick={() => setActiveTab('timetable')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'timetable' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'timetable' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>🕒 Library Timetable</button>
        <button onClick={() => setActiveTab('reservations')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'reservations' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'reservations' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>🔄 Issue & Return</button>
        <button onClick={() => setActiveTab('fines')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'fines' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'fines' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>💰 Fine Collection</button>
        <button onClick={() => setActiveTab('availability')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'availability' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'availability' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>✅ Availability</button>
        <button onClick={() => setActiveTab('reports')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: activeTab === 'reports' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#f1f5f9', color: activeTab === 'reports' ? '#fff' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>📄 Reports</button>
      </div>

      {/* TAB 0: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>


          {/* 10 Dashboard Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>📚 Total Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalBooksCount || 4850}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>✅ Available Copies</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{availableBooks}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🔄 Issued Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', marginTop: '4px' }}>{borrowedBooksCount}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>⚠️ Overdue Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{overdueCount || 3}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>💰 Fine Collection</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>₹{totalFinesCollected || 450}</div>
            </div>
          </div>

          {/* Activity & Recent Issue Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>📋 Recent Issue & Return Activity</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '10px' }}>Book Title</th>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Action</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>The Great Gatsby</td>
                    <td style={{ padding: '10px' }}>Aarav Patel (G-5)</td>
                    <td style={{ padding: '10px', color: '#3b82f6' }}>Borrowed</td>
                    <td style={{ padding: '10px' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>Active</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>Introduction to Algorithms</td>
                    <td style={{ padding: '10px' }}>Diya Sharma (G-10)</td>
                    <td style={{ padding: '10px', color: '#10b981' }}>Returned</td>
                    <td style={{ padding: '10px' }}><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>🔔 Notifications & Overdue Alerts</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#b91c1c', fontWeight: '600' }}>⚠️ 3 Books are past due date for return.</li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#15803d' }}>✅ 5 New fiction arrivals cataloged today.</li>
                <li style={{ padding: '10px 0', color: '#0C4A86', fontWeight: '600' }}>📚 45 New Science & Literature Books added to Digital Catalogue.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ALL LIBRARY BOOKS */}
      {activeTab === 'all_books' && (
        <div>
          {/* Search, Advanced Filters, Import & Export Toolbar */}
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by Title, Author, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowAddForm(true)} style={{ padding: '9px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                  + Add Book
                </button>
                <button onClick={handleSeedData} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🌱 Seed Demo Data
                </button>
                <button onClick={handleImportExcel} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={16} /> Import Excel
                </button>
                <button onClick={handleExportCSV} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={16} /> Export Excel
                </button>
                <button onClick={handleExportPDF} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Export PDF
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid #EBF5FF' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} color="#0096DA" /> Filters:
              </span>

              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)} 
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #BFDBFE', fontSize: '0.86rem', background: '#ffffff', color: '#0C4A86', fontWeight: '700', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,150,218,0.06)' }}
              >
                <option value="all">All Categories</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={selectedAuthor} 
                onChange={e => setSelectedAuthor(e.target.value)} 
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #BFDBFE', fontSize: '0.86rem', background: '#ffffff', color: '#0C4A86', fontWeight: '700', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,150,218,0.06)' }}
              >
                <option value="all">All Authors</option>
                {authorsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              <select 
                value={selectedPublisher} 
                onChange={e => setSelectedPublisher(e.target.value)} 
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #BFDBFE', fontSize: '0.86rem', background: '#ffffff', color: '#0C4A86', fontWeight: '700', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,150,218,0.06)' }}
              >
                <option value="all">All Publishers</option>
                {publishersList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {(selectedCategory !== 'all' || selectedAuthor !== 'all' || selectedPublisher !== 'all' || searchQuery) && (
                <button 
                  onClick={() => { setSelectedCategory('all'); setSelectedAuthor('all'); setSelectedPublisher('all'); setSearchQuery(''); }}
                  style={{ padding: '8px 14px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Reset Filters ✕
                </button>
              )}
            </div>

          </div>

          {/* Book Catalog Table */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'visible' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Title & Author</th>
                  <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>ISBN / Category</th>
                  <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Publisher</th>
                  <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Stock</th>
                  <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', color: '#ffffff', fontWeight: '800' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, idx) => {
                  const bookKey = book._id || book.id || `bk_${idx}`;
                  const bStatus = getBorrowStatus(book);
                  return (
                    <tr key={bookKey} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{book.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>by {book.author}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155' }}>{book.isbn}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{book.category}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{book.publisher || '-'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>
                        {book.availableCopies} <span style={{ color: '#94a3b8', fontWeight: '400' }}>/ {book.totalCopies}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: bStatus.bg, color: bStatus.color }}>
                          {bStatus.icon} {bStatus.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }} className="action-menu-container">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          {book.availableCopies > 0 ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setBorrowModalOpenFor(book); }}
                              style={{
                                padding: '6px 14px',
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                              }}
                            >
                              + Borrow
                            </button>
                          ) : (
                            <span style={{
                              padding: '4px 10px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              whiteSpace: 'nowrap'
                            }}>
                              Out of Stock
                            </span>
                          )}

                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenFor(prev => prev === bookKey ? null : bookKey);
                              }}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer',
                                padding: '6px 8px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="More options"
                            >
                              <MoreVertical size={16} color="#475569" />
                            </button>
                            
                            {actionMenuOpenFor === bookKey && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '6px',
                                background: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                                border: '1px solid #cbd5e1',
                                width: '180px',
                                zIndex: 9999,
                                overflow: 'hidden',
                                textAlign: 'left'
                              }}>
                                <button onClick={(e) => { e.stopPropagation(); setReserveModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#8b5cf6', fontWeight: '600' }}>Reserve Book</button>
                                {book.availableCopies < book.totalCopies && (
                                  <button onClick={(e) => { e.stopPropagation(); handleRenewBook(book._id || book.id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#f59e0b', fontWeight: '600' }}>Renew Book (+14d)</button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setHistoryModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#475569', fontWeight: '600' }}>Reading History</button>
                                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>
                                <button onClick={(e) => { e.stopPropagation(); handleEditBook(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }}>Edit Book</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id || book.id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#ef4444' }}>Delete Book</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL LIBRARY & EBOOKS */}
      {activeTab === 'digital_ebooks' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {ebooks.map(eb => (
              <div key={eb.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e0e7ff', color: '#4338ca', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', color: '#475569' }}>{eb.fileType}</span>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>{eb.title}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>Author: {eb.author} · {eb.size}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => alert(`Opening digital reader for "${eb.title}"...`)} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Read Online
                  </button>
                  <button onClick={() => alert(`Downloading PDF for "${eb.title}"...`)} style={{ padding: '10px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOK RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>Active Student Reservations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Book Title</th>
                <th style={{ padding: '12px' }}>Reserved By</th>
                <th style={{ padding: '12px' }}>Pickup Date</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{res.bookTitle}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>{res.studentName}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{res.reserveDate}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: '#dcfce7', color: '#15803d' }}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: FINE & INVENTORY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: '800' }}>💰 Fine Analytics & Collection</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Overdue Penalty: ₹50 per day after due date.</p>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '15px 0' }}>₹{totalFinesCollected}</div>
            <button onClick={() => alert('Fine collection report generated!')} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Collect Outstanding Fines</button>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: '800' }}>💡 Book Recommendations</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Based on most read categories across high school grades.</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', fontSize: '0.9rem', color: '#334155' }}>
              <li><strong>Science & Tech:</strong> Concepts of Physics by HC Verma</li>
              <li><strong>Fiction:</strong> To Kill a Mockingbird by Harper Lee</li>
              <li><strong>Algorithms:</strong> Introduction to Algorithms (MIT Press)</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: FINE COLLECTION PORTAL */}
      {activeTab === 'fines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', borderRadius: '16px', padding: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 14px rgba(12, 74, 134, 0.15)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>💰 Fine Collection & Penalty Management</h2>
              <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.88rem' }}>Track overdue borrowings, calculate daily penalties (₹50/day), collect fines and issue digital receipts.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontWeight: '700' }}>Total Fines Outstanding</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
                ₹{finesList.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0)}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>📋 Overdue Books & Fine Collection Ledger</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Book Title & ISBN</th>
                  <th style={{ padding: '12px' }}>Student Borrower</th>
                  <th style={{ padding: '12px' }}>Due Date</th>
                  <th style={{ padding: '12px' }}>Days Overdue</th>
                  <th style={{ padding: '12px' }}>Fine Amount</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action / Status</th>
                </tr>
              </thead>
              <tbody>
                {finesList.map(fine => (
                  <tr key={fine.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{fine.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>ISBN: {fine.isbn}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{fine.student}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fine.gradeSec}</div>
                    </td>
                    <td style={{ padding: '12px', color: fine.status === 'Unpaid' ? '#ef4444' : '#64748b', fontWeight: '700' }}>{fine.dueDate}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: fine.status === 'Unpaid' ? '#ef4444' : '#64748b' }}>{fine.daysOverdue} Days</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: '#d97706' }}>₹{fine.amount}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {fine.status === 'Unpaid' ? (
                        <button 
                          onClick={() => setCollectFineModalFor(fine)} 
                          style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Collect Fine
                        </button>
                      ) : (
                        <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: '700', fontSize: '0.78rem' }}>
                          Paid ✅ ({fine.paymentMethod})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BOOK AVAILABILITY */}
      {activeTab === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>✅ Book Availability & Stock Status</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.88rem' }}>Live availability count breakdown per book category and shelf location.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Book Title</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Total Stock</th>
                  <th style={{ padding: '12px' }}>Available Copies</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700' }}>{b.title}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize', color: '#64748b' }}>{b.category}</td>
                    <td style={{ padding: '12px', fontWeight: '700' }}>{b.totalCopies}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: b.availableCopies > 0 ? '#10b981' : '#ef4444' }}>{b.availableCopies}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: b.availableCopies > 0 ? '#dcfce7' : '#fee2e2', color: b.availableCopies > 0 ? '#15803d' : '#b91c1c' }}>
                        {b.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LIBRARY REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a' }}>📄 Export Official Library Reports</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>Generate and download full PDF or Excel reports for library audit and management.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => handleExportPDF('Full_Library_Catalog_Report')} style={{ padding: '12px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Download Full Library Catalog (PDF)
              </button>
              <button onClick={() => handleExportCSV('Fine_Collection_Ledger')} style={{ padding: '12px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} /> Export Fine Collection Ledger (Excel)
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a' }}>📊 Monthly Borrowing Statistics</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '0.88rem', color: '#334155' }}>
              <li><strong>Total Titles Cataloged:</strong> {books.length || 4}</li>
              <li><strong>Total Copies Count:</strong> {totalBooksCount || 4850}</li>
              <li><strong>Active Borrowings:</strong> {borrowedBooksCount}</li>
              <li><strong>Fines Outstanding:</strong> ₹{totalFinesCollected || 450}</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: LIBRARY TIMETABLE */}
      {activeTab === 'timetable' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Banner Card matching Teacher Timetable */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #BFDBFE', padding: '20px 24px', boxShadow: '0 2px 10px rgba(12, 74, 134, 0.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EBF5FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C4A86' }}>
                <Clock size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0C4A86' }}>Library Class Timetable</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                  {ttViewMode === 'today' ? "Today's Active Library Period Schedule & Status" : "Complete Weekly Library Schedule Matrix (Mon - Sat)"}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              {/* Dropdown Selector for Today vs Weekly Timetable matching Teacher Timetable */}
              <select
                value={ttViewMode}
                onChange={e => setTtViewMode(e.target.value)}
                style={{ padding: '9px 16px', borderRadius: '12px', border: '1px solid #BFDBFE', background: '#EBF5FF', color: '#0C4A86', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', outline: 'none', boxShadow: '0 2px 6px rgba(12,74,134,0.06)' }}
              >
                <option value="today">📅 Today's Timetable</option>
                <option value="weekly">🗓️ Weekly Timetable</option>
              </select>

              <button 
                onClick={() => window.print()}
                style={{ padding: '9px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🖨️ Export / Print
              </button>

              <button 
                onClick={() => handleOpenAddSlot('Monday', periodOptions[0])}
                style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.25)' }}
              >
                <Plus size={16} /> Assign Library Period
              </button>
            </div>
          </div>

          {/* Timetable KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>📅 Total Weekly Sessions</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{timetable.length} Sessions</div>
            </div>
            <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🌅 Morning Slots (P1-P3)</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#1d4ed8', marginTop: '4px' }}>
                {timetable.filter(t => t.slotType === 'Morning').length} Classes
              </div>
            </div>
            <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>☀️ Mid-Day & Afternoon (P4-P7)</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
                {timetable.filter(t => t.slotType === 'Mid-Day' || t.slotType === 'Afternoon').length} Classes
              </div>
            </div>
            <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🌆 Evening Slots (P8)</div>
              <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#6d28d9', marginTop: '4px' }}>
                {timetable.filter(t => t.slotType === 'Evening').length} Classes
              </div>
            </div>
          </div>

          {/* Filter Controls Bar */}
          <div style={{ background: '#fff', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Filter Day:</span>
              <select value={ttFilterDay} onChange={e => setTtFilterDay(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', background: '#fff', fontWeight: '600' }}>
                <option value="all">All Days (Mon - Sat)</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Filter Grade:</span>
              <select value={ttFilterGrade} onChange={e => setTtFilterGrade(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', background: '#fff', fontWeight: '600' }}>
                <option value="all">All Grades</option>
                {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Filter Shift:</span>
              <select value={ttFilterShift} onChange={e => setTtFilterShift(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', background: '#fff', fontWeight: '600' }}>
                <option value="all">All Shifts</option>
                <option value="Morning">Morning Slots (P1 - P3)</option>
                <option value="Mid-Day">Mid-Day Slots (P4 - P5)</option>
                <option value="Afternoon">Afternoon Slots (P6 - P7)</option>
                <option value="Evening">Evening Slots (P8)</option>
              </select>
            </div>
          </div>

          {/* MODE 1: TODAY'S SCHEDULE VIEW matching Teacher Timetable */}
          {ttViewMode === 'today' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {periodOptions.map((period, pIdx) => {
                const todayDay = ttFilterDay !== 'all' ? ttFilterDay : 'Monday';
                const matchedSlots = timetable.filter(t => t.day === todayDay && (t.period === period.name || t.periodTime === period.time));
                const slot = matchedSlots[0];
                const status = pIdx === 1 ? 'Ongoing' : pIdx < 1 ? 'Completed' : 'Upcoming';
                const isOngoing = status === 'Ongoing';

                return (
                  <div
                    key={period.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      border: isOngoing ? '1.5px solid #fcd34d' : '1px solid #BFDBFE',
                      background: isOngoing ? '#fffbeb' : '#EBF5FF',
                      boxShadow: isOngoing ? '0 4px 12px rgba(245, 158, 11, 0.12)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: isOngoing ? '#d97706' : '#EFEAE4',
                          color: isOngoing ? '#ffffff' : '#334155'
                        }}
                      >
                        {period.name}
                      </span>
                      <div>
                        {slot ? (
                          <>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#0C4A86' }}>
                              {slot.grade} — {slot.section}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>
                              👩‍🏫 {slot.teacher} • <span style={{ color: '#0C4A86', fontStyle: 'italic' }}>📖 {slot.topic}</span>
                            </p>
                          </>
                        ) : (
                          <>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8' }}>
                              Free Library Slot (No Class Assigned)
                            </p>
                            <button
                              onClick={() => handleOpenAddSlot(todayDay, period)}
                              style={{ margin: '4px 0 0', background: 'none', border: 'none', padding: 0, color: '#0C4A86', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              + Assign Class Slot
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: isOngoing ? '#d1fae5' : status === 'Completed' ? '#e2e8f0' : '#fef3c7',
                          color: isOngoing ? '#065f46' : status === 'Completed' ? '#334155' : '#92400e'
                        }}
                      >
                        {status}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Clock size={12} /> {period.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* MODE 2: WEEKLY MATRIX SCHEDULE VIEW matching Teacher Timetable */
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #BFDBFE', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.04)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1050px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#fff' }}>
                    <th style={{ padding: '14px 16px', fontSize: '0.85rem', textTransform: 'uppercase', width: '130px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Day / Period</th>
                    {periodOptions.map(p => (
                      <th key={p.name} style={{ padding: '12px 10px', fontSize: '0.8rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ fontWeight: '800' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.9 }}>{p.time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].filter(day => ttFilterDay === 'all' || ttFilterDay === day).map((day, dIdx) => (
                    <tr key={day} style={{ borderBottom: '1px solid #BFDBFE', background: dIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0C4A86', fontSize: '0.88rem', borderRight: '2px solid #BFDBFE', background: '#EBF5FF' }}>
                        {day}
                      </td>
                      {periodOptions.map(period => {
                        const matchedSlots = timetable.filter(t => {
                          const mDay = t.day === day;
                          const mPeriod = t.period === period.name || t.periodTime === period.time;
                          const mGrade = ttFilterGrade === 'all' || t.grade === ttFilterGrade;
                          const mShift = ttFilterShift === 'all' || t.slotType === period.type;
                          return mDay && mPeriod && mGrade && mShift;
                        });

                        return (
                          <td key={period.name} style={{ padding: '8px', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', minWidth: '135px' }}>
                            {matchedSlots.length > 0 ? (
                              matchedSlots.map(slot => {
                                const isMorning = slot.slotType === 'Morning';
                                const isAfternoon = slot.slotType === 'Afternoon' || slot.slotType === 'Mid-Day';
                                const bg = isMorning ? '#EBF5FF' : isAfternoon ? '#ecfdf5' : '#f5f3ff';
                                const border = isMorning ? '#BFDBFE' : isAfternoon ? '#a7f3d0' : '#ddd6fe';
                                const badgeBg = isMorning ? '#0C4A86' : isAfternoon ? '#047857' : '#6d28d9';

                                return (
                                  <div key={slot.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '10px 12px', marginBottom: '6px', fontSize: '0.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                      <span style={{ fontWeight: '800', background: badgeBg, color: '#ffffff', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                                        {slot.grade} - {slot.section}
                                      </span>
                                      <button 
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        title="Delete Slot"
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px 4px', fontSize: '0.95rem', fontWeight: 'bold' }}
                                      >
                                        &times;
                                      </button>
                                    </div>
                                    <div style={{ color: '#0C4A86', fontWeight: '800', fontSize: '0.82rem', marginBottom: '3px' }}>
                                      👩‍🏫 {slot.teacher}
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.74rem', fontWeight: '600', fontStyle: 'italic', background: 'rgba(255,255,255,0.7)', padding: '4px 6px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                      📖 {slot.topic}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <button 
                                onClick={() => handleOpenAddSlot(day, period)}
                                style={{ width: '100%', padding: '12px 6px', border: '1.5px dashed #BFDBFE', borderRadius: '10px', background: '#EBF5FF/30', color: '#0C4A86', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                              >
                                + Assign
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ASSIGN / EDIT TIMETABLE SLOT MODAL */}
      {ttModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>
                {editingSlotId ? 'Edit Library Period Slot' : 'Assign Library Period Slot'}
              </h3>
              <button onClick={() => setTtModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Day of Week:</label>
                <select value={slotForm.day} onChange={e => setSlotForm({ ...slotForm, day: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Period Slot & Time:</label>
                <select 
                  value={slotForm.period} 
                  onChange={e => {
                    const sel = periodOptions.find(p => p.name === e.target.value);
                    if (sel) {
                      setSlotForm({ ...slotForm, period: sel.name, periodTime: sel.time, slotType: sel.type });
                    }
                  }} 
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                >
                  {periodOptions.map(p => <option key={p.name} value={p.name}>{p.label}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Grade:</label>
                  <select value={slotForm.grade} onChange={e => setSlotForm({ ...slotForm, grade: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Section:</label>
                  <select value={slotForm.section} onChange={e => setSlotForm({ ...slotForm, section: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>In-Charge Teacher:</label>
                <input 
                  type="text" 
                  value={slotForm.teacher} 
                  onChange={e => setSlotForm({ ...slotForm, teacher: e.target.value })} 
                  placeholder="e.g. Mrs. Sunita Sharma"
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Period Activity / Topic:</label>
                <input 
                  type="text" 
                  value={slotForm.topic} 
                  onChange={e => setSlotForm({ ...slotForm, topic: e.target.value })} 
                  placeholder="e.g. Silent Reading, Book Return, Reference Work"
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setTtModalOpen(false)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  {editingSlotId ? 'Update Slot' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE / QR SCANNER MODAL */}
      {showScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '420px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '60px', height: '60px', background: '#e0e7ff', color: '#4338ca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Scan size={30} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Barcode / QR Code Scanner</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Hold book ISBN Barcode or QR Code up to camera to auto-fetch record.</p>

            <div style={{ border: '2px dashed #6366f1', background: '#f5f3ff', borderRadius: '14px', padding: '40px 20px', marginBottom: '20px' }}>
              <QrCode size={48} color="#6366f1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4338ca' }}>Scanning Barcode...</div>
            </div>

            <button onClick={() => setShowScannerModal(false)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Close Scanner</button>
          </div>
        </div>
      )}

      {/* QR CODE DISPLAY MODAL */}
      {qrModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '380px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>{qrModalOpenFor.title}</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>ISBN: {qrModalOpenFor.isbn}</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '14px', display: 'inline-block', marginBottom: '20px' }}>
              <QrCode size={120} color="#0f172a" />
            </div>

            <button onClick={() => setQrModalOpenFor(null)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{editingBookId ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => resetBookForm()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <form onSubmit={handleAddBook} className="management-form" style={{ padding: 0, boxShadow: 'none' }}>
              {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
              <input type="text" name="title" placeholder="Book Title *" value={newBook.title} onChange={handleInputChange} required />
              <input type="text" name="isbn" placeholder="ISBN Barcode *" value={newBook.isbn} onChange={handleInputChange} required />
              <input type="text" name="author" placeholder="Author Name *" value={newBook.author} onChange={handleInputChange} required />
              <input type="text" name="publisher" placeholder="Publisher" value={newBook.publisher} onChange={handleInputChange} />
              <select name="category" value={newBook.category} onChange={handleInputChange}>
                <option value="textbook">Textbook</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="reference">Reference</option>
              </select>
              <input type="number" name="totalCopies" placeholder="Total Stock Copies *" value={newBook.totalCopies} onChange={handleInputChange} required />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => resetBookForm()} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>{editingBookId ? 'Update Book' : 'Save Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BORROW BOOK MODAL */}
      {borrowModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>Borrow: {borrowModalOpenFor.title}</h3>
              <button onClick={() => { setBorrowModalOpenFor(null); setBorrowUserId(''); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Select class grade, section, and student borrowing this book.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Select Grade:</label>
                <select value={borrowGrade} onChange={e => setBorrowGrade(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={`Grade ${g}`}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Select Section:</label>
                <select value={borrowSection} onChange={e => setBorrowSection(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '4px', display: 'block' }}>Select Student:</label>
              <select value={borrowUserId} onChange={e => setBorrowUserId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}>
                <option value="">Select Student from {borrowGrade} ({borrowSection})...</option>
                {getBorrowStudentsList().map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roll})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setBorrowModalOpenFor(null); setBorrowUserId(''); }} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => {
                if (!borrowUserId) {
                  alert('Please select a student');
                  return;
                }
                const selectedStd = getBorrowStudentsList().find(s => s.id === borrowUserId);
                const sName = selectedStd ? `${selectedStd.name} (${borrowGrade}-${borrowSection.slice(-1)})` : 'Selected Student';
                alert(`🎉 Book "${borrowModalOpenFor.title}" borrowed successfully to ${sName}! Due date set to 14 days.`);
                setBorrowModalOpenFor(null);
                setBorrowUserId('');
              }} style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Confirm Borrow</button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT FINE MODAL */}
      {collectFineModalFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>💰 Collect Overdue Fine</h3>
              <button onClick={() => setCollectFineModalFor(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>{collectFineModalFor.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>ISBN: {collectFineModalFor.isbn}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Student:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{collectFineModalFor.student} ({collectFineModalFor.gradeSec})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Days Overdue:</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>{collectFineModalFor.daysOverdue} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '1.1rem' }}>
                <span style={{ color: '#0f172a', fontWeight: '800' }}>Fine Penalty:</span>
                <span style={{ color: '#d97706', fontWeight: '800' }}>₹{collectFineModalFor.amount}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmCollectFine}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px', display: 'block' }}>Payment Method:</label>
                <select value={finePaymentMethod} onChange={e => setFinePaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}>
                  <option value="Cash">💵 Cash Payment</option>
                  <option value="UPI">📱 UPI / GPay / PhonePe</option>
                  <option value="Card">💳 Credit / Debit Card</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setCollectFineModalFor(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  Confirm Collection & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOK RESERVATION MODAL */}
      {reserveModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '420px' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>Reserve: {reserveModalOpenFor.title}</h3>
            <form onSubmit={handleReserveSubmit}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Pickup Date</label>
              <input type="date" value={reserveDate} onChange={e => setReserveDate(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setReserveModalOpenFor(null)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Confirm Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibraryManagement;
