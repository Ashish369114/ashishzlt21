import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, UserPlus, Package, Building, Wrench, Users, Bus, 
  BarChart2, Search, Filter, Plus, FileSpreadsheet, FileText, Printer, 
  Check, X, AlertTriangle, Download, Eye, Edit3, Trash2, Clock, 
  Shirt, BookOpen, Home, Bell, Calendar, TrendingUp, Upload, ArrowUpDown, 
  CheckCircle, RefreshCw, ChevronLeft, ChevronRight, Layers, Tag
} from 'lucide-react';

// CBSE Subject Mapping by Class
const CBSE_SUBJECTS_BY_GRADE = {
  'Grade 1': ['English', 'Mathematics', 'EVS', 'Hindi'],
  'Grade 2': ['English', 'Mathematics', 'EVS', 'Hindi'],
  'Grade 3': ['English', 'Mathematics', 'EVS', 'Hindi', 'Computer'],
  'Grade 4': ['English', 'Mathematics', 'EVS', 'Hindi', 'Computer'],
  'Grade 5': ['English', 'Mathematics', 'EVS', 'Hindi', 'Computer'],
  'Grade 6': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
  'Grade 7': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
  'Grade 8': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer'],
  'Grade 9': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
  'Grade 10': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
  'Grade 11': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics'],
  'Grade 12': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics']
};

const AoManagement = ({ activeSection, activeTab: activeTabProp }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'admissions' | 'inventory' | 'accommodation' | 'maintenance' | 'visitors' | 'transport' | 'reports'

  const targetSec = activeSection || activeTabProp;
  useEffect(() => {
    if (!targetSec) return;
    if (targetSec === 'hostel' || targetSec === 'accommodation' || targetSec === 'infrastructure') {
      setActiveTab('accommodation');
    } else if (targetSec === 'staff' || targetSec === 'admissions') {
      setActiveTab('admissions');
    } else if (targetSec === 'inventory' || targetSec === 'procurement' || targetSec === 'assets') {
      setActiveTab('inventory');
    } else if (targetSec === 'vendors' || targetSec === 'visitors') {
      setActiveTab('visitors');
    } else if (targetSec === 'maintenance') {
      setActiveTab('maintenance');
    } else {
      setActiveTab(targetSec);
    }
  }, [targetSec]);

  // General Filter & Pagination States
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Inventory Sub-Tab ('uniforms' | 'books' | 'general')
  const [inventoryTab, setInventoryTab] = useState('uniforms');
  const [uniformCategoryFilter, setUniformCategoryFilter] = useState('all'); // 'all' | 'Regular School Uniform' | 'Sports Uniform'

  // Books Filtering States (Type & Sub-type dropdowns)
  const [bookTypeFilter, setBookTypeFilter] = useState('all'); // 'all' | 'Long Book' | 'Short Book'
  const [bookPageFilter, setBookPageFilter] = useState('all'); // 'all' | '100 Pages' | '200 Pages' | '300 Pages'
  const [bookRuleFilter, setBookRuleFilter] = useState('all'); // 'all' | 'Ruled' | 'Plain' | 'One Side Ruled & One Side Plain' | 'Graph'
  const [shortBookCatFilter, setShortBookCatFilter] = useState('all'); // 'all' | 'Mathematics' | 'English' | ...

  // Students List for Issuance & Sales
  const [studentsList, setStudentsList] = useState([
    { id: 'STU-1001', name: 'Aarav Patel', grade: 'Grade 5', section: 'Section A', rollNo: 'G5-001' },
    { id: 'STU-1002', name: 'Diya Sharma', grade: 'Grade 1', section: 'Section B', rollNo: 'G1-014' },
    { id: 'STU-1003', name: 'Rohan Verma', grade: 'Grade 9', section: 'Section A', rollNo: 'G9-022' },
    { id: 'STU-1004', name: 'Ananya Reddy', grade: 'Grade 6', section: 'Section C', rollNo: 'G6-008' },
    { id: 'STU-1005', name: 'Kabir Mehta', grade: 'Grade 11', section: 'Section A', rollNo: 'G11-005' },
    { id: 'STU-1006', name: 'Karthik Rao', grade: 'Grade 11', section: 'Section B', rollNo: 'G11-019' },
    { id: 'STU-1007', name: 'Nisha Gupta', grade: 'Grade 12', section: 'Section A', rollNo: 'G12-003' }
  ]);

  // Student Sales & Issuance Register
  const [issuedItemsLog, setIssuedItemsLog] = useState([
    { id: 'ISS-801', studentName: 'Aarav Patel', grade: 'Grade 5 (Section A)', itemTitle: 'Shirt (Size 30)', category: 'Uniform', qty: 2, unitPrice: 450, totalAmount: 900, date: '2026-07-22', paymentStatus: 'Paid (Cash)' },
    { id: 'ISS-802', studentName: 'Rohan Verma', grade: 'Grade 9 (Section A)', itemTitle: 'Senior Mathematics Deluxe Notebook', category: 'Book', qty: 3, unitPrice: 90, totalAmount: 270, date: '2026-07-23', paymentStatus: 'Charged to Student Fee Account' }
  ]);

  // Sell / Issue Item to Student Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellTargetItem, setSellTargetItem] = useState(null);
  const [sellItemType, setSellItemType] = useState('uniform'); // 'uniform' | 'book'
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [sellForm, setSellForm] = useState({
    studentId: 'STU-1001',
    selectedSize: '30',
    quantity: 1,
    paymentMode: 'Paid (Cash)'
  });

  // 🛒 Shopping Cart / Multi-Item Student Bill State
  const [cartItems, setCartItems] = useState([]);
  const [cartStudentId, setCartStudentId] = useState('STU-1001');
  const [cartPaymentMode, setCartPaymentMode] = useState('Paid (Cash)');

  // Track selected size per uniform item
  const [selectedUniformSizes, setSelectedUniformSizes] = useState({});

  // Add Item to Cart Handler
  const handleAddToCart = (item, type, chosenSizeSpec) => {
    const spec = chosenSizeSpec || (type === 'uniform' 
      ? (selectedUniformSizes[item.id] || item.sizes?.[0]?.size || '30')
      : (item.bookType === 'Long Book' ? `${item.pageOption} (${item.ruleType})` : item.shortBookCategory));

    const cartKey = `${item.id}-${spec}`;
    const existingIndex = cartItems.findIndex(c => c.cartKey === cartKey);

    if (existingIndex > -1) {
      setCartItems(prev => prev.map((c, idx) => idx === existingIndex ? { ...c, qty: c.qty + 1 } : c));
    } else {
      const newCartItem = {
        cartKey,
        itemId: item.id,
        itemType: type,
        title: item.name || item.title,
        category: type === 'uniform' ? item.category : item.bookType,
        spec,
        unitPrice: item.sellingPrice || 0,
        qty: 1,
        rawItem: item
      };
      setCartItems(prev => [...prev, newCartItem]);
    }
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (cartKey, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(c => c.cartKey !== cartKey));
    } else {
      setCartItems(prev => prev.map(c => c.cartKey === cartKey ? { ...c, qty: newQty } : c));
    }
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(c => c.cartKey !== cartKey));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Process Multi-Item Checkout / Bill
  const handleCheckoutCart = () => {
    if (cartItems.length === 0) return;

    const targetStudent = studentsList.find(s => s.id === cartStudentId) || studentsList[0];
    const totalCartAmount = cartItems.reduce((acc, c) => acc + (c.unitPrice * c.qty), 0);
    const totalCartQty = cartItems.reduce((acc, c) => acc + c.qty, 0);

    // 1. Deduct stock for all uniform items and books in cart
    cartItems.forEach(cartItem => {
      if (cartItem.itemType === 'uniform') {
        setUniformItems(prev => prev.map(u => {
          if (u.id === cartItem.itemId) {
            const updatedSizes = u.sizes.map(s => {
              if (String(s.size) === String(cartItem.spec)) {
                return { ...s, stock: Math.max(0, s.stock - cartItem.qty) };
              }
              return s;
            });
            return { ...u, sizes: updatedSizes };
          }
          return u;
        }));
      } else {
        setBooksInventory(prev => prev.map(b => {
          if (b.id === cartItem.itemId) {
            const newQty = Math.max(0, b.quantity - cartItem.qty);
            return {
              ...b,
              quantity: newQty,
              status: newQty < 10 ? 'Low Stock' : 'In Stock'
            };
          }
          return b;
        }));
      }
    });

    // 2. Create Issuance Log Entries
    const newLogs = cartItems.map(c => ({
      id: `ISS-${Math.floor(800 + Math.random() * 100)}`,
      studentName: targetStudent.name,
      grade: `${targetStudent.grade} (${targetStudent.section})`,
      itemTitle: `${c.title} [${c.spec}]`,
      category: c.itemType === 'uniform' ? 'Uniform' : 'Book',
      qty: c.qty,
      unitPrice: c.unitPrice,
      totalAmount: c.unitPrice * c.qty,
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: cartPaymentMode
    }));

    setIssuedItemsLog(prev => [...newLogs, ...prev]);
    setCartItems([]);

    alert(`🎉 Success! Multi-Item Receipt Generated for ${targetStudent.name}.\n` +
          `Billed ${totalCartQty} items for Total ₹${totalCartAmount}.\n` +
          `Stock quantities updated across all selected items.`);
  };

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('uniform'); // 'uniform' | 'book' | 'admission' | 'accommodation'
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);

  // ----------------------------------------------------
  // DATA STATES
  // ----------------------------------------------------

  // 1. Uniform Inventory
  // Uniform Items: Regular Uniform (Shirt, Trouser, Belt, Tie, ID Card, Socks, Shoes) & Sports Uniform (Sports T-Shirt, Sports Trouser, Sports Shoes, Sports Socks)
  // Selling Price is SAME across all sizes of the same item. Stock quantity differs per size.
  const [uniformItems, setUniformItems] = useState([
    {
      id: 'UNIF-101',
      name: 'Shirt',
      category: 'Regular School Uniform',
      colour: 'Sky Blue / White Collar',
      purchasePrice: 280,
      sellingPrice: 450,
      vendor: 'Raymond School Apparel',
      purchaseDate: '2026-05-10',
      sizes: [
        { size: '28', stock: 45 },
        { size: '30', stock: 60 },
        { size: '32', stock: 18 },
        { size: '34', stock: 4 },
        { size: '36', stock: 25 },
        { size: '38', stock: 30 },
        { size: '40', stock: 15 }
      ]
    },
    {
      id: 'UNIF-102',
      name: 'Trouser',
      category: 'Regular School Uniform',
      colour: 'Navy Blue',
      purchasePrice: 380,
      sellingPrice: 600,
      vendor: 'Raymond School Apparel',
      purchaseDate: '2026-05-10',
      sizes: [
        { size: '28', stock: 30 },
        { size: '30', stock: 42 },
        { size: '32', stock: 5 },
        { size: '34', stock: 20 },
        { size: '36', stock: 15 }
      ]
    },
    {
      id: 'UNIF-103',
      name: 'Tie & Belt Set',
      category: 'Regular School Uniform',
      colour: 'Maroon & Gold Stripe',
      purchasePrice: 120,
      sellingPrice: 220,
      vendor: 'Craftline Accessories',
      purchaseDate: '2026-04-18',
      sizes: [
        { size: 'Standard (Small)', stock: 50 },
        { size: 'Standard (Medium)', stock: 80 },
        { size: 'Standard (Large)', stock: 65 }
      ]
    },
    {
      id: 'UNIF-104',
      name: 'Sports T-Shirt',
      category: 'Sports Uniform',
      colour: 'Vibrant Orange / White',
      purchasePrice: 250,
      sellingPrice: 400,
      vendor: 'Apex Athletic Gear',
      purchaseDate: '2026-06-01',
      sizes: [
        { size: 'S', stock: 40 },
        { size: 'M', stock: 55 },
        { size: 'L', stock: 8 },
        { size: 'XL', stock: 2 }
      ]
    },
    {
      id: 'UNIF-105',
      name: 'Sports Trouser',
      category: 'Sports Uniform',
      colour: 'Black with Orange Side Stripe',
      purchasePrice: 320,
      sellingPrice: 500,
      vendor: 'Apex Athletic Gear',
      purchaseDate: '2026-06-01',
      sizes: [
        { size: 'S', stock: 35 },
        { size: 'M', stock: 48 },
        { size: 'L', stock: 22 },
        { size: 'XL', stock: 12 }
      ]
    },
    {
      id: 'UNIF-106',
      name: 'Sports Shoes',
      category: 'Sports Uniform',
      colour: 'White / Orange Trim',
      purchasePrice: 450,
      sellingPrice: 750,
      vendor: 'Action Footwear',
      purchaseDate: '2026-05-20',
      sizes: [
        { size: 'UK 3', stock: 14 },
        { size: 'UK 4', stock: 20 },
        { size: 'UK 5', stock: 25 },
        { size: 'UK 6', stock: 3 },
        { size: 'UK 7', stock: 18 }
      ]
    }
  ]);

  // 2. Books Inventory
  // Long Books (Page options: 100, 200, 300 Pgs; Rule Type: Ruled, Plain, One Side Ruled & One Side Plain, Graph)
  // Short Books (Category: Mathematics, English, Broad Rule, Single Rule, Four Rule, Numbers Book, Plain, One Side Plain & One Side Ruled)
  // Includes: Class, Section, Subject (CBSEMapped), Quantity, Purchase Price, Selling Price, Publisher, Status
  const [booksInventory, setBooksInventory] = useState([
    {
      id: 'BK-201',
      bookType: 'Long Book',
      title: 'Senior Mathematics Deluxe Notebook',
      pageOption: '200 Pages',
      ruleType: 'Ruled',
      shortBookCategory: '-',
      classGrade: 'Grade 9',
      section: 'Section A',
      subject: 'Mathematics',
      quantity: 120,
      purchasePrice: 55,
      sellingPrice: 90,
      publisher: 'Classmate / ITC',
      status: 'In Stock'
    },
    {
      id: 'BK-202',
      bookType: 'Long Book',
      title: 'Physics Practical & Graph Record',
      pageOption: '100 Pages',
      ruleType: 'Graph',
      shortBookCategory: '-',
      classGrade: 'Grade 11',
      section: 'Section B',
      subject: 'Physics',
      quantity: 6,
      purchasePrice: 65,
      sellingPrice: 110,
      publisher: 'Navneet Publications',
      status: 'Low Stock'
    },
    {
      id: 'BK-203',
      bookType: 'Short Book',
      title: 'Primary English Handwriting Practice Book',
      pageOption: '-',
      ruleType: '-',
      shortBookCategory: 'Four Rule',
      classGrade: 'Grade 1',
      section: 'Section A',
      subject: 'English',
      quantity: 85,
      purchasePrice: 25,
      sellingPrice: 45,
      publisher: 'S. Chand Kids',
      status: 'In Stock'
    },
    {
      id: 'BK-204',
      bookType: 'Short Book',
      title: 'Junior Arithmetic & Numbers Book',
      pageOption: '-',
      ruleType: '-',
      shortBookCategory: 'Numbers Book',
      classGrade: 'Grade 2',
      section: 'Section C',
      subject: 'Mathematics',
      quantity: 4,
      purchasePrice: 30,
      sellingPrice: 50,
      publisher: 'Oxford University Press',
      status: 'Low Stock'
    },
    {
      id: 'BK-205',
      bookType: 'Long Book',
      title: 'EVS & Science Observation Work Journal',
      pageOption: '100 Pages',
      ruleType: 'One Side Ruled & One Side Plain',
      shortBookCategory: '-',
      classGrade: 'Grade 5',
      section: 'Section A',
      subject: 'EVS',
      quantity: 95,
      purchasePrice: 40,
      sellingPrice: 70,
      publisher: 'NCERT Official Companion',
      status: 'In Stock'
    }
  ]);

  // 3. Admissions
  const [admissions, setAdmissions] = useState([
    { id: 'ADM-2026-01', studentName: 'Aarav Patel', grade: 'Grade 5', parentName: 'Suresh Patel', phone: '9876543210', docVerified: true, status: 'Approved', appliedDate: '2026-07-01' },
    { id: 'ADM-2026-02', studentName: 'Diya Sharma', grade: 'Grade 1', parentName: 'Anita Sharma', phone: '9876543211', docVerified: false, status: 'Pending Approval', appliedDate: '2026-07-12' },
    { id: 'ADM-2026-03', studentName: 'Rohan Verma', grade: 'Grade 9', parentName: 'Karan Verma', phone: '9876543212', docVerified: true, status: 'Document Verified', appliedDate: '2026-07-14' },
    { id: 'ADM-2026-04', studentName: 'Ananya Reddy', grade: 'Grade 6', parentName: 'Prakash Reddy', phone: '9876543215', docVerified: true, status: 'Pending Approval', appliedDate: '2026-07-18' },
    { id: 'ADM-2026-05', studentName: 'Kabir Mehta', grade: 'Grade 11', parentName: 'Siddharth Mehta', phone: '9876543219', docVerified: true, status: 'Approved', appliedDate: '2026-07-20' }
  ]);

  // 4. Accommodation Management (Renamed from Hostel Allocation)
  // Types: Boys Hostel, Girls Hostel, Staff Quarters, Teaching Staff Accommodation, Non-Teaching Staff Accommodation
  // Features: Room Allocation, Room Availability, Occupancy Status, Maintenance Status
  const [accommodation, setAccommodation] = useState([
    {
      id: 'ACC-101',
      accommodationType: 'Boys Hostel',
      building: 'Block A (Tagore Hall)',
      roomNo: 'Room 101',
      bedNo: 'Bed A1',
      occupantName: 'Karthik Rao',
      occupantRole: 'Student',
      grade: 'Grade 11',
      availability: 'Occupied',
      occupancyStatus: 'Full',
      maintenanceStatus: 'Good'
    },
    {
      id: 'ACC-102',
      accommodationType: 'Girls Hostel',
      building: 'Block B (Kalpana Wing)',
      roomNo: 'Room 204',
      bedNo: 'Bed B2',
      occupantName: 'Nisha Gupta',
      occupantRole: 'Student',
      grade: 'Grade 12',
      availability: 'Occupied',
      occupancyStatus: 'Full',
      maintenanceStatus: 'Good'
    },
    {
      id: 'ACC-103',
      accommodationType: 'Staff Quarters',
      building: 'Executive Staff Suite',
      roomNo: 'Flat 302',
      bedNo: 'Master Bedroom',
      occupantName: 'Prof. Animesh Das',
      occupantRole: 'Teaching Staff',
      grade: 'Physics HOD',
      availability: 'Occupied',
      occupancyStatus: 'Full',
      maintenanceStatus: 'Good'
    },
    {
      id: 'ACC-104',
      accommodationType: 'Teaching Staff Accommodation',
      building: 'Faculty Residency A',
      roomNo: 'Room 108',
      bedNo: 'Single Suite',
      occupantName: '-',
      occupantRole: '-',
      grade: '-',
      availability: 'Available',
      occupancyStatus: 'Vacant',
      maintenanceStatus: 'Good'
    },
    {
      id: 'ACC-105',
      accommodationType: 'Non-Teaching Staff Accommodation',
      building: 'Support Quarters C',
      roomNo: 'Room 04',
      bedNo: 'Bed 2',
      occupantName: 'Ramesh Singh (Transport Admin)',
      occupantRole: 'Non-Teaching Staff',
      grade: 'Logistics Team',
      availability: 'Occupied',
      occupancyStatus: 'Partial',
      maintenanceStatus: 'Maintenance Required'
    }
  ]);

  // 5. Maintenance Requests
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: 'MNT-101', location: 'Science Lab 2', issue: 'AC Cooling Leakage', priority: 'High', assignedTo: 'Tech Services', status: 'In Progress' },
    { id: 'MNT-102', location: 'Auditorium', issue: 'Projector Bulb Replacement', priority: 'Medium', assignedTo: 'Electrical Team', status: 'Pending' },
    { id: 'MNT-103', location: 'Class 8-B', issue: 'Broken Bench Repairs', priority: 'Low', assignedTo: 'Carpentry', status: 'Completed' }
  ]);

  // 6. Visitors Log
  const [visitors, setVisitors] = useState([
    { id: 'VIS-901', name: 'Vikram Joshi', purpose: 'Parent Meeting', host: 'Dr. Kumar (Principal)', inTime: '10:15 AM', outTime: '-', passNo: 'PASS-901', status: 'Checked In' },
    { id: 'VIS-902', name: 'Meena Kapoor', purpose: 'Vendor Delivery', host: 'Inventory Manager', inTime: '09:00 AM', outTime: '09:45 AM', passNo: 'PASS-902', status: 'Checked Out' }
  ]);

  // 7. Transport Coordination
  const [transport, setTransport] = useState([
    { id: 'BUS-01', busNo: 'KA-01-EQ-1001', route: 'Route 4 (Hebbal - Indiranagar)', driver: 'Ramesh Singh', attendant: 'Sunita', studentsCount: 42, fuelStatus: '78%' },
    { id: 'BUS-02', busNo: 'KA-01-EQ-1002', route: 'Route 9 (Whitefield - Koramangala)', driver: 'Suresh Kumar', attendant: 'Lakshmi', studentsCount: 38, fuelStatus: '62%' }
  ]);

  // ----------------------------------------------------
  // FORM STATES (ADD NEW RECORDS)
  // ----------------------------------------------------
  // Uniform Form
  const [newUniform, setNewUniform] = useState({
    name: 'Shirt',
    category: 'Regular School Uniform',
    colour: '',
    purchasePrice: '',
    sellingPrice: '',
    vendor: '',
    sizes: [
      { size: '28', stock: 20 },
      { size: '30', stock: 20 },
      { size: '32', stock: 20 }
    ]
  });

  // Book Form
  const [newBook, setNewBook] = useState({
    bookType: 'Long Book',
    title: '',
    pageOption: '200 Pages',
    ruleType: 'Ruled',
    shortBookCategory: 'Mathematics',
    classGrade: 'Grade 1',
    section: 'Section A',
    subject: CBSE_SUBJECTS_BY_GRADE['Grade 1'][0],
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    publisher: ''
  });

  // Accommodation Form
  const [newAcc, setNewAcc] = useState({
    accommodationType: 'Boys Hostel',
    building: '',
    roomNo: '',
    bedNo: '',
    occupantName: '',
    occupantRole: 'Student',
    grade: 'Grade 10',
    availability: 'Available',
    occupancyStatus: 'Vacant',
    maintenanceStatus: 'Good'
  });

  // Update CBSE Subject when Class is selected in Book Form
  const handleBookClassChange = (selectedClass) => {
    const defaultSubject = CBSE_SUBJECTS_BY_GRADE[selectedClass]?.[0] || 'General';
    setNewBook(prev => ({
      ...prev,
      classGrade: selectedClass,
      subject: defaultSubject
    }));
  };

  // Handlers
  const handleApproveAdmission = (id) => {
    setAdmissions(prev =>
      prev.map(adm =>
        adm.id === id ? { ...adm, status: 'Approved', docVerified: true } : adm
      )
    );
  };

  // Handlers for Selling & Issuing Items to Students
  const handleOpenSellModal = (item, type) => {
    setSellTargetItem(item);
    setSellItemType(type);
    const defaultSpec = type === 'uniform' 
      ? (item.sizes?.[0]?.size || '30') 
      : (item.bookType === 'Long Book' ? `${item.pageOption} (${item.ruleType})` : item.shortBookCategory);

    setSellForm({
      studentId: studentsList[0]?.id || 'STU-1001',
      selectedSize: defaultSpec,
      quantity: 1,
      paymentMode: 'Paid (Cash)'
    });
    setShowSellModal(true);
  };

  const handleConfirmSale = (e) => {
    e.preventDefault();
    if (!sellTargetItem) return;

    const targetStudent = studentsList.find(s => s.id === sellForm.studentId) || studentsList[0];
    const qtyNum = Number(sellForm.quantity) || 1;
    const totalPrice = (sellTargetItem.sellingPrice || 0) * qtyNum;

    if (sellItemType === 'uniform') {
      // Deduct stock for selected size
      setUniformItems(prev => prev.map(u => {
        if (u.id === sellTargetItem.id) {
          const updatedSizes = u.sizes.map(s => {
            if (String(s.size) === String(sellForm.selectedSize)) {
              const newStock = Math.max(0, s.stock - qtyNum);
              return { ...s, stock: newStock };
            }
            return s;
          });
          return { ...u, sizes: updatedSizes };
        }
        return u;
      }));
    } else {
      // Deduct quantity for book
      setBooksInventory(prev => prev.map(b => {
        if (b.id === sellTargetItem.id) {
          const newQty = Math.max(0, b.quantity - qtyNum);
          return {
            ...b,
            quantity: newQty,
            status: newQty < 10 ? 'Low Stock' : 'In Stock'
          };
        }
        return b;
      }));
    }

    // Record in Issued Items History
    const newLog = {
      id: `ISS-${Math.floor(800 + Math.random() * 100)}`,
      studentName: targetStudent.name,
      grade: `${targetStudent.grade} (${targetStudent.section})`,
      itemTitle: `${sellTargetItem.name || sellTargetItem.title} [${sellForm.selectedSize}]`,
      category: sellItemType === 'uniform' ? 'Uniform' : 'Book',
      qty: qtyNum,
      unitPrice: sellTargetItem.sellingPrice,
      totalAmount: totalPrice,
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: sellForm.paymentMode
    };

    setIssuedItemsLog(prev => [newLog, ...prev]);
    setShowSellModal(false);
    alert(`🎉 Successfully issued ${qtyNum}x ${newLog.itemTitle} to student ${targetStudent.name}! Stock updated automatically.`);
  };

  const handleAddUniform = (e) => {
    e.preventDefault();
    const createdItem = {
      id: `UNIF-${Math.floor(100 + Math.random() * 900)}`,
      name: newUniform.name,
      category: newUniform.category,
      colour: newUniform.colour || 'Standard Multi',
      purchasePrice: Number(newUniform.purchasePrice) || 300,
      sellingPrice: Number(newUniform.sellingPrice) || 450,
      vendor: newUniform.vendor || 'Authorized Supplier',
      purchaseDate: new Date().toISOString().slice(0, 10),
      sizes: newUniform.sizes.map(s => ({ size: s.size, stock: Number(s.stock) || 0 }))
    };
    setUniformItems(prev => [createdItem, ...prev]);
    setShowAddModal(false);
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    const createdBook = {
      id: `BK-${Math.floor(200 + Math.random() * 900)}`,
      bookType: newBook.bookType,
      title: newBook.title || `${newBook.classGrade} ${newBook.subject} Book`,
      pageOption: newBook.bookType === 'Long Book' ? newBook.pageOption : '-',
      ruleType: newBook.bookType === 'Long Book' ? newBook.ruleType : '-',
      shortBookCategory: newBook.bookType === 'Short Book' ? newBook.shortBookCategory : '-',
      classGrade: newBook.classGrade,
      section: newBook.section,
      subject: newBook.subject,
      quantity: Number(newBook.quantity) || 50,
      purchasePrice: Number(newBook.purchasePrice) || 40,
      sellingPrice: Number(newBook.sellingPrice) || 75,
      publisher: newBook.publisher || 'NCERT / Standard',
      status: (Number(newBook.quantity) || 50) < 10 ? 'Low Stock' : 'In Stock'
    };
    setBooksInventory(prev => [createdBook, ...prev]);
    setShowAddModal(false);
  };

  const handleAddAcc = (e) => {
    e.preventDefault();
    const createdAcc = {
      id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      accommodationType: newAcc.accommodationType,
      building: newAcc.building || 'Campus Residence Wing',
      roomNo: newAcc.roomNo || 'Room 101',
      bedNo: newAcc.bedNo || 'Bed 1',
      occupantName: newAcc.occupantName || '-',
      occupantRole: newAcc.occupantName ? newAcc.occupantRole : '-',
      grade: newAcc.grade || '-',
      availability: newAcc.occupantName ? 'Occupied' : 'Available',
      occupancyStatus: newAcc.occupantName ? 'Full' : 'Vacant',
      maintenanceStatus: newAcc.maintenanceStatus
    };
    setAccommodation(prev => [createdAcc, ...prev]);
    setShowAddModal(false);
  };

  // Export handlers
  const handleExportExcel = (moduleName) => {
    alert(`Generating & Exporting Excel spreadsheet report for ${moduleName.toUpperCase()}...`);
  };

  const handleExportPDF = (moduleName) => {
    alert(`Generating PDF Report for ${moduleName.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateImport = () => {
    if (!importFile) {
      alert('Please select an Excel or CSV file first.');
      return;
    }
    alert(`Successfully imported data from ${importFile.name}! 12 new records integrated.`);
    setShowImportModal(false);
    setImportFile(null);
  };

  // Total stock calculation for uniforms
  const getTotalUniformStock = (item) => item.sizes.reduce((acc, curr) => acc + curr.stock, 0);

  // ----------------------------------------------------
  // EXECUTIVE DASHBOARD STATS & ALERTS
  // ----------------------------------------------------
  const totalUniformStockCount = uniformItems.reduce((acc, u) => acc + getTotalUniformStock(u), 0);
  const totalUniformValuation = uniformItems.reduce((acc, u) => acc + (getTotalUniformStock(u) * u.sellingPrice), 0);
  const totalBookStockCount = booksInventory.reduce((acc, b) => acc + b.quantity, 0);
  const totalBookValuation = booksInventory.reduce((acc, b) => acc + (b.quantity * b.sellingPrice), 0);

  const lowStockUniforms = uniformItems.filter(u => u.sizes.some(s => s.stock < 10));
  const lowStockBooks = booksInventory.filter(b => b.quantity < 10);
  const totalLowStockAlertsCount = lowStockUniforms.length + lowStockBooks.length;

  const approvedAdmissionsCount = admissions.filter(a => a.status === 'Approved').length;
  const pendingAdmissionsCount = admissions.filter(a => a.status.includes('Pending')).length;

  const occupiedAccCount = accommodation.filter(a => a.availability === 'Occupied').length;
  const totalAccCount = accommodation.length;
  const accOccupancyPercentage = Math.round((occupiedAccCount / (totalAccCount || 1)) * 100);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1360px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Module Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={28} color="#3b82f6" /> Administrative Officer Portal
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Centralized management for school inventory (uniforms & books), admissions, accommodation, maintenance, visitors, & transport.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' }}>
            <Plus size={18} /> New Record
          </button>
          <button onClick={() => setShowImportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: '#f8fafc', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            <Upload size={16} /> Import Excel
          </button>
          <button onClick={() => handleExportExcel(activeTab)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: '#f8fafc', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button onClick={() => handleExportPDF(activeTab)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: '#f8fafc', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            <FileText size={16} /> PDF
          </button>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Global Toolbar: Search & Advanced Filters */}
      <div style={{ background: '#fff', padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={`Search ${activeTab} records...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>Filter Status:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', outline: 'none' }}>
            <option value="all">All Records</option>
            <option value="pending">Pending / Low Stock</option>
            <option value="completed">Approved / In Stock</option>
          </select>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODULE 0: EXECUTIVE OVERVIEW DASHBOARD */}
      {/* ==================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Executive Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '18px', padding: '24px 30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>🏛️ Administrative Operations Dashboard</h2>
              <p style={{ margin: '6px 0 0', color: '#e0f2fe', fontSize: '0.88rem' }}>
                Real-time inventory summary (uniforms & books), admissions pipeline, accommodation occupancy, low stock alerts, & quick actions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setAddModalType('uniform'); setShowAddModal(true); }} style={{ padding: '10px 16px', background: '#ffffff', color: '#0284c7', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Quick Add Uniform
              </button>
              <button onClick={() => { setAddModalType('book'); setShowAddModal(true); }} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Quick Add Book
              </button>
            </div>
          </div>

          {/* 4 Key Summary Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            
            {/* Widget 1: Inventory Summary */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>📦 Inventory Summary</span>
                <Shirt size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                ₹{((totalUniformValuation + totalBookValuation) / 1000).toFixed(1)}k <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Valuation</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '6px' }}>
                Uniforms: <strong>{totalUniformStockCount} pcs</strong> | Books: <strong>{totalBookStockCount} copies</strong>
              </div>
            </div>

            {/* Widget 2: Low Stock Alerts */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>⚠️ Low Stock Alerts</span>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>
                {totalLowStockAlertsCount} Items <span style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px' }}>Action Needed</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                {lowStockUniforms.length} Uniform sizes & {lowStockBooks.length} Book titles below minimum threshold
              </div>
            </div>

            {/* Widget 3: Admission Summary */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🎓 Admission Summary</span>
                <UserPlus size={18} color="#15803d" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                {admissions.length} Total <span style={{ fontSize: '0.8rem', color: '#15803d' }}>({approvedAdmissionsCount} Approved)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                {pendingAdmissionsCount} Applications currently pending verification & approval
              </div>
            </div>

            {/* Widget 4: Accommodation Summary */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🏢 Accommodation Summary</span>
                <Home size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6' }}>
                {accOccupancyPercentage}% Occupied
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                {occupiedAccCount} Occupied / {totalAccCount - occupiedAccCount} Vacant rooms across Hostels & Staff Quarters
              </div>
            </div>
          </div>

          {/* Quick Actions & Daily Insights Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            
            {/* Left Box: Low Stock & Live Alerts Table */}
            <div style={{ background: '#fff', padding: '22px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#ef4444" /> Low Stock Restock Dashboard
                </h3>
                <button onClick={() => setActiveTab('inventory')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
                  View Full Inventory →
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Item Title / Detail</th>
                    <th style={{ padding: '10px' }}>Size / Category</th>
                    <th style={{ padding: '10px' }}>Stock Left</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Quick Restock</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Low Stock Uniforms */}
                  {lowStockUniforms.map(u => (
                    u.sizes.filter(s => s.stock < 10).map((sz, idx) => (
                      <tr key={`u-${u.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>Uniform</span></td>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{u.name} ({u.colour})</td>
                        <td style={{ padding: '10px' }}>Size {sz.size}</td>
                        <td style={{ padding: '10px', fontWeight: '800', color: '#ef4444' }}>{sz.stock} pcs</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button onClick={() => alert(`Restock request dispatched to ${u.vendor} for Size ${sz.size}`)} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>+ Restock</button>
                        </td>
                      </tr>
                    ))
                  ))}

                  {/* Low Stock Books */}
                  {lowStockBooks.map(b => (
                    <tr key={`b-${b.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px' }}><span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>Book</span></td>
                      <td style={{ padding: '10px', fontWeight: '700' }}>{b.title}</td>
                      <td style={{ padding: '10px' }}>{b.classGrade} ({b.subject})</td>
                      <td style={{ padding: '10px', fontWeight: '800', color: '#ef4444' }}>{b.quantity} copies</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button onClick={() => alert(`Reorder placed with publisher ${b.publisher}`)} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>+ Reorder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Box: Daily Insights, Upcoming Events & Notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Daily Insights */}
              <div style={{ background: '#fff', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#0284c7" /> Daily Operations Insights
                </h4>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.82rem', color: '#334155' }}>
                  <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                    <span>•</span> <span><strong>95% Uniform Kits</strong> assembled for upcoming Grade 1 admissions distribution.</span>
                  </li>
                  <li style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                    <span>•</span> <span><strong>3 Vacant Suites</strong> available in Teaching Staff Accommodation Block.</span>
                  </li>
                  <li style={{ padding: '6px 0', display: 'flex', gap: '8px' }}>
                    <span>•</span> <span>CBSE Textbooks for Grade 9 & 10 fully reconciled with publisher stock.</span>
                  </li>
                </ul>
              </div>

              {/* Upcoming Events */}
              <div style={{ background: '#fff', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="#8b5cf6" /> Upcoming Events
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Annual Sports Uniform Distribution</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>July 28, 2026 • Main Gymnasium</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Quarterly Inventory & Stock Audit</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>August 05, 2026 • Central Store Room</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 1: ADMISSIONS */}
      {/* ==================================================== */}
      {activeTab === 'admissions' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>Admissions & Document Verification Register</h3>
            <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '12px', fontWeight: '700' }}>{admissions.length} Applications</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>App ID & Student</th>
                <th style={{ padding: '14px 20px' }}>Target Grade</th>
                <th style={{ padding: '14px 20px' }}>Parent & Phone</th>
                <th style={{ padding: '14px 20px' }}>Doc Verification</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map(adm => (
                <tr key={adm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{adm.studentName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{adm.id}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155', fontWeight: '600' }}>{adm.grade}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div>{adm.parentName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{adm.phone}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: adm.docVerified ? '#dcfce7' : '#fef3c7', color: adm.docVerified ? '#15803d' : '#b45309' }}>
                      {adm.docVerified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700',
                      background: adm.status === 'Approved' ? '#dcfce7' : adm.status === 'Pending Approval' ? '#fef3c7' : '#e0e7ff',
                      color:      adm.status === 'Approved' ? '#15803d' : adm.status === 'Pending Approval' ? '#b45309'   : '#4338ca'
                    }}>
                      {adm.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    {adm.status !== 'Approved' ? (
                      <button
                        onClick={() => handleApproveAdmission(adm.id)}
                        style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                    ) : (
                      <span style={{ padding: '6px 14px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 2: INVENTORY MANAGEMENT (UNIFORMS & BOOKS) */}
      {/* ==================================================== */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Inventory Sub-Tabs Header */}
          <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setInventoryTab('uniforms')}
                style={{
                  padding: '9px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                  background: inventoryTab === 'uniforms' ? '#0284c7' : '#f1f5f9',
                  color: inventoryTab === 'uniforms' ? '#fff' : '#475569'
                }}
              >
                <Shirt size={16} /> Uniforms Inventory
              </button>
              <button
                onClick={() => setInventoryTab('books')}
                style={{
                  padding: '9px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                  background: inventoryTab === 'books' ? '#0284c7' : '#f1f5f9',
                  color: inventoryTab === 'books' ? '#fff' : '#475569'
                }}
              >
                <BookOpen size={16} /> Books Inventory
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {inventoryTab === 'uniforms' && (
                <select value={uniformCategoryFilter} onChange={e => setUniformCategoryFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                  <option value="all">All Uniform Categories</option>
                  <option value="Regular School Uniform">Regular School Uniform</option>
                  <option value="Sports Uniform">Sports Uniform</option>
                </select>
              )}

              {inventoryTab === 'books' && (
                <>
                  {/* Dropdown 1: Book Type Filter */}
                  <select value={bookTypeFilter} onChange={e => setBookTypeFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', fontWeight: '700', color: '#0369a1' }}>
                    <option value="all">All Book Types</option>
                    <option value="Long Book">Long Books</option>
                    <option value="Short Book">Short Books</option>
                  </select>

                  {/* Dropdowns for Long Book Specs */}
                  {(bookTypeFilter === 'Long Book' || bookTypeFilter === 'all') && (
                    <>
                      <select value={bookPageFilter} onChange={e => setBookPageFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                        <option value="all">All Pages (100 / 200 / 300 Pgs)</option>
                        <option value="100 Pages">100 Pages</option>
                        <option value="200 Pages">200 Pages</option>
                        <option value="300 Pages">300 Pages</option>
                      </select>

                      <select value={bookRuleFilter} onChange={e => setBookRuleFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                        <option value="all">All Rule Types</option>
                        <option value="Ruled">Ruled</option>
                        <option value="Plain">Plain</option>
                        <option value="One Side Ruled & One Side Plain">One Side Ruled & One Side Plain</option>
                        <option value="Graph">Graph</option>
                      </select>
                    </>
                  )}

                  {/* Dropdown for Short Book Categories */}
                  {(bookTypeFilter === 'Short Book' || bookTypeFilter === 'all') && (
                    <select value={shortBookCatFilter} onChange={e => setShortBookCatFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                      <option value="all">All Short Book Categories</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Broad Rule">Broad Rule</option>
                      <option value="Single Rule">Single Rule</option>
                      <option value="Four Rule">Four Rule</option>
                      <option value="Numbers Book">Numbers Book</option>
                      <option value="Plain">Plain</option>
                      <option value="One Side Plain & One Side Ruled">One Side Plain & One Side Ruled</option>
                    </select>
                  )}
                </>
              )}

              <button onClick={() => setShowHistoryModal(true)} style={{ padding: '7px 14px', background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📜 Student Sales History ({issuedItemsLog.length})
              </button>
              <button onClick={() => { setAddModalType(inventoryTab === 'uniforms' ? 'uniform' : 'book'); setShowAddModal(true); }} style={{ padding: '7px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={15} /> Add {inventoryTab === 'uniforms' ? 'Uniform Item' : 'Book Title'}
              </button>
            </div>
          </div>

          {/* SUB-SECTION 2A: UNIFORMS INVENTORY */}
          {inventoryTab === 'uniforms' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
                ℹ️ <strong>Pricing Policy:</strong> All sizes of the same uniform item maintain the <strong>SAME Selling Price</strong>. Stock quantity is tracked independently per size.
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Item Code & Name</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Colour / Specs</th>
                    <th style={{ padding: '14px 20px' }}>Selling Price (All Sizes)</th>
                    <th style={{ padding: '14px 20px' }}>Size Dropdown & Stock Qty</th>
                    <th style={{ padding: '14px 20px' }}>Vendor & Date</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uniformItems
                    .filter(u => uniformCategoryFilter === 'all' || u.category === uniformCategoryFilter)
                    .map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{u.id}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: u.category.includes('Sports') ? '#ffedd5' : '#e0f2fe', color: u.category.includes('Sports') ? '#c2410c' : '#0369a1' }}>
                            {u.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#334155' }}>{u.colour}</td>
                        <td style={{ padding: '14px 20px', fontWeight: '800', color: '#059669' }}>
                          ₹{u.sellingPrice} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'normal' }}>(Cost: ₹{u.purchasePrice})</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <select
                              value={selectedUniformSizes[u.id] || u.sizes?.[0]?.size || '30'}
                              onChange={e => setSelectedUniformSizes({ ...selectedUniformSizes, [u.id]: e.target.value })}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                            >
                              {u.sizes.map(s => (
                                <option key={s.size} value={s.size}>
                                  Size {s.size} — Stock: {s.stock} pcs {s.stock < 10 ? '⚠️ Low' : ''}
                                </option>
                              ))}
                            </select>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Total Stock: <strong>{getTotalUniformStock(u)} pcs</strong>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: '600' }}>{u.vendor}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.purchaseDate}</div>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleAddToCart(u, 'uniform')}
                            style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            + Add to Bill
                          </button>
                          <button onClick={() => handleOpenSellModal(u, 'uniform')} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                            🛒 Buy Single
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #0284c7' }}>
                  <tr>
                    <td colSpan="3" style={{ padding: '16px 20px', fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                      📦 TOTAL UNIFORM PACKAGE BUNDLE (If Student Buys 1 Set of All Items)
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                        Includes all {uniformItems.filter(u => uniformCategoryFilter === 'all' || u.category === uniformCategoryFilter).length} uniform items in category
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '800', color: '#059669', fontSize: '1.15rem' }}>
                      ₹{
                        uniformItems
                          .filter(u => uniformCategoryFilter === 'all' || u.category === uniformCategoryFilter)
                          .reduce((acc, u) => acc + Number(u.sellingPrice || 0), 0)
                      }
                    </td>
                    <td colSpan="2" style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8rem' }}>
                      Full Kit Student Bundle
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const activeUniforms = uniformItems.filter(u => uniformCategoryFilter === 'all' || u.category === uniformCategoryFilter);
                          const totalPrice = activeUniforms.reduce((acc, u) => acc + Number(u.sellingPrice || 0), 0);
                          const bundleItem = {
                            id: 'UNIF-BUNDLE',
                            name: `Complete Uniform Package (${activeUniforms.length} items)`,
                            category: uniformCategoryFilter === 'all' ? 'Full School Kit' : uniformCategoryFilter,
                            sellingPrice: totalPrice,
                            sizes: [{ size: 'Full Kit (All Items)', stock: 50 }]
                          };
                          handleOpenSellModal(bundleItem, 'uniform');
                        }}
                        style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(2,132,199,0.2)' }}
                      >
                        🛒 Sell Complete Uniform Kit (₹{
                          uniformItems
                            .filter(u => uniformCategoryFilter === 'all' || u.category === uniformCategoryFilter)
                            .reduce((acc, u) => acc + Number(u.sellingPrice || 0), 0)
                        })
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* SUB-SECTION 2B: BOOKS INVENTORY */}
          {inventoryTab === 'books' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  📘 <strong>Books Management:</strong> Filter by <strong>Long Books</strong> (100/200/300 Pgs & Rule Types) or <strong>Short Books</strong> (Maths, English, Four Rule, etc.) with automatic CBSE subject mapping.
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0369a1' }}>
                  Showing {
                    booksInventory.filter(b => {
                      if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                      if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                      if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                      if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                      return true;
                    }).length
                  } / {booksInventory.length} Titles
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>Book Title & Type</th>
                    <th style={{ padding: '14px 20px' }}>Class / Section</th>
                    <th style={{ padding: '14px 20px' }}>CBSE Subject</th>
                    <th style={{ padding: '14px 20px' }}>Type Specifications & Dropdown</th>
                    <th style={{ padding: '14px 20px' }}>Qty Available</th>
                    <th style={{ padding: '14px 20px' }}>Selling Price</th>
                    <th style={{ padding: '14px 20px' }}>Publisher</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {booksInventory
                    .filter(b => {
                      if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                      if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                      if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                      if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                      return true;
                    })
                    .map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{b.title}</div>
                          <span style={{ fontSize: '0.72rem', background: b.bookType === 'Long Book' ? '#e0f2fe' : '#fef3c7', color: b.bookType === 'Long Book' ? '#0369a1' : '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {b.bookType}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: '600' }}>{b.classGrade} ({b.section})</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                            {b.subject}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {b.bookType === 'Long Book' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select defaultValue={b.pageOption} onChange={e => alert(`Updated page option for ${b.title} to ${e.target.value}`)} style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', background: '#f8fafc' }}>
                                <option value="100 Pages">100 Pages</option>
                                <option value="200 Pages">200 Pages</option>
                                <option value="300 Pages">300 Pages</option>
                              </select>
                              <select defaultValue={b.ruleType} onChange={e => alert(`Updated rule type for ${b.title} to ${e.target.value}`)} style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', background: '#f8fafc' }}>
                                <option value="Ruled">Ruled</option>
                                <option value="Plain">Plain</option>
                                <option value="One Side Ruled & One Side Plain">One Side Ruled & One Side Plain</option>
                                <option value="Graph">Graph</option>
                              </select>
                            </div>
                          ) : (
                            <select defaultValue={b.shortBookCategory} onChange={e => alert(`Updated category for ${b.title} to ${e.target.value}`)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', background: '#f8fafc' }}>
                              <option value="Mathematics">Mathematics</option>
                              <option value="English">English</option>
                              <option value="Broad Rule">Broad Rule</option>
                              <option value="Single Rule">Single Rule</option>
                              <option value="Four Rule">Four Rule</option>
                              <option value="Numbers Book">Numbers Book</option>
                              <option value="Plain">Plain</option>
                              <option value="One Side Plain & One Side Ruled">One Side Plain & One Side Ruled</option>
                            </select>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: '800', color: b.quantity < 10 ? '#ef4444' : '#10b981' }}>
                          {b.quantity} copies {b.quantity < 10 && <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>Low Stock</span>}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: '800', color: '#059669' }}>
                          ₹{b.sellingPrice} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'normal' }}>(Cost: ₹{b.purchasePrice})</span>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#334155' }}>{b.publisher}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleAddToCart(b, 'book')}
                            style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            + Add to Bill
                          </button>
                          <button onClick={() => handleOpenSellModal(b, 'book')} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                            🛒 Buy Single
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #0284c7' }}>
                  <tr>
                    <td colSpan="5" style={{ padding: '16px 20px', fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                      📚 TOTAL BOOK SET BUNDLE (If Student Buys 1 Copy of All Listed Titles)
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                        Includes all {
                          booksInventory.filter(b => {
                            if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                            if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                            if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                            if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                            return true;
                          }).length
                        } book titles for selected filters
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '800', color: '#059669', fontSize: '1.15rem' }}>
                      ₹{
                        booksInventory
                          .filter(b => {
                            if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                            if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                            if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                            if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                            return true;
                          })
                          .reduce((acc, b) => acc + Number(b.sellingPrice || 0), 0)
                      }
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8rem' }}>
                      Full Academic Book Set
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const activeBooks = booksInventory.filter(b => {
                            if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                            if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                            if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                            if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                            return true;
                          });
                          const totalPrice = activeBooks.reduce((acc, b) => acc + Number(b.sellingPrice || 0), 0);
                          const bundleBook = {
                            id: 'BK-BUNDLE',
                            title: `Complete Academic Book Set (${activeBooks.length} Titles)`,
                            bookType: 'Academic Set',
                            sellingPrice: totalPrice,
                            quantity: 50,
                            pageOption: 'Full Set',
                            ruleType: 'Standard'
                          };
                          handleOpenSellModal(bundleBook, 'book');
                        }}
                        style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(2,132,199,0.2)' }}
                      >
                        🛒 Sell Complete Book Set (₹{
                          booksInventory
                            .filter(b => {
                              if (bookTypeFilter !== 'all' && b.bookType !== bookTypeFilter) return false;
                              if (bookPageFilter !== 'all' && b.pageOption !== bookPageFilter) return false;
                              if (bookRuleFilter !== 'all' && b.ruleType !== bookRuleFilter) return false;
                              if (shortBookCatFilter !== 'all' && b.shortBookCategory !== shortBookCatFilter) return false;
                              return true;
                            })
                            .reduce((acc, b) => acc + Number(b.sellingPrice || 0), 0)
                        })
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* ==================================================== */}
          {/* MULTI-ITEM STUDENT BILLING CART / POS PANEL */}
          {/* ==================================================== */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '2px solid #0284c7', padding: '24px', boxShadow: '0 10px 25px -5px rgba(2,132,199,0.1)', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛒 Student Store Billing Cart ({cartItems.length} items added)
                </h3>
                <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                  Add uniform sizes & books item-by-item according to what the student needs, review running total, and complete checkout.
                </p>
              </div>

              {cartItems.length > 0 && (
                <button onClick={handleClearCart} style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Clear Bill
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.88rem' }}>
                🛒 <strong>No items in billing cart yet.</strong> Click <strong>"+ Add to Bill"</strong> next to any uniform item or book to build a custom student bill!
              </div>
            ) : (
              <div>
                {/* Cart Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px' }}>Item & Type</th>
                      <th style={{ padding: '10px 14px' }}>Size / Spec</th>
                      <th style={{ padding: '10px 14px' }}>Unit Price</th>
                      <th style={{ padding: '10px 14px' }}>Quantity</th>
                      <th style={{ padding: '10px 14px' }}>Subtotal</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(c => (
                      <tr key={c.cartKey} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.category}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: '600' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                            {c.spec}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: '#059669' }}>₹{c.unitPrice}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => handleUpdateCartQty(c.cartKey, c.qty - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: '700', cursor: 'pointer' }}>-</button>
                            <span style={{ fontWeight: '800', width: '20px', textAlign: 'center' }}>{c.qty}</span>
                            <button onClick={() => handleUpdateCartQty(c.cartKey, c.qty + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: '700', cursor: 'pointer' }}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: '800', color: '#0f172a' }}>₹{c.unitPrice * c.qty}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button onClick={() => handleRemoveFromCart(c.cartKey)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Checkout Bar */}
                <div style={{ background: '#f8fafc', padding: '18px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>Select Student to Bill *</label>
                      <select value={cartStudentId} onChange={e => setCartStudentId(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', background: '#fff' }}>
                        {studentsList.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.grade} ({s.section})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>Payment Mode *</label>
                      <select value={cartPaymentMode} onChange={e => setCartPaymentMode(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}>
                        <option value="Paid (Cash)">Paid (Cash)</option>
                        <option value="Paid (UPI / Card)">Paid (UPI / Card)</option>
                        <option value="Charge to Student Fee Account">Charge to Student Fee Account</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>GRAND TOTAL BILL</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669' }}>
                        ₹{cartItems.reduce((acc, c) => acc + (c.unitPrice * c.qty), 0)}
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutCart}
                      style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <CheckCircle size={18} /> Checkout & Generate Bill (₹{cartItems.reduce((acc, c) => acc + (c.unitPrice * c.qty), 0)})
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 3: ACCOMMODATION MANAGEMENT (HOSTELS & QUARTERS) */}
      {/* ==================================================== */}
      {activeTab === 'accommodation' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>
                🏢 Accommodation Management Portal
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Managing Boys Hostel, Girls Hostel, Staff Quarters, Teaching Staff & Non-Teaching Staff Allocations.
              </p>
            </div>

            <button onClick={() => { setAddModalType('accommodation'); setShowAddModal(true); }} style={{ padding: '9px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Allocate Room / Suite
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px' }}>Accommodation Type</th>
                <th style={{ padding: '14px' }}>Building & Room No</th>
                <th style={{ padding: '14px' }}>Bed / Suite No</th>
                <th style={{ padding: '14px' }}>Assigned Occupant</th>
                <th style={{ padding: '14px' }}>Role / Grade</th>
                <th style={{ padding: '14px' }}>Availability</th>
                <th style={{ padding: '14px' }}>Maintenance Status</th>
              </tr>
            </thead>
            <tbody>
              {accommodation.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', background: a.accommodationType.includes('Hostel') ? '#e0f2fe' : '#f3e8ff', color: a.accommodationType.includes('Hostel') ? '#0369a1' : '#6b21a8' }}>
                      {a.accommodationType}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '700' }}>{a.roomNo}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.building}</div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: '600' }}>{a.bedNo}</td>
                  <td style={{ padding: '14px', color: '#0f172a', fontWeight: '700' }}>{a.occupantName}</td>
                  <td style={{ padding: '14px', color: '#64748b' }}>{a.occupantRole} ({a.grade})</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: a.availability === 'Occupied' ? '#dcfce7' : '#fef3c7', color: a.availability === 'Occupied' ? '#15803d' : '#b45309' }}>
                      {a.availability}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: a.maintenanceStatus === 'Good' ? '#dcfce7' : '#fee2e2', color: a.maintenanceStatus === 'Good' ? '#15803d' : '#b91c1c' }}>
                      {a.maintenanceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 4: MAINTENANCE REQUESTS */}
      {/* ==================================================== */}
      {activeTab === 'maintenance' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: '800', fontSize: '1.2rem' }}>School Maintenance & Work Orders</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.78rem', textTransform: 'uppercase', color: '#475569' }}>
                <th style={{ padding: '14px' }}>Work Order ID</th>
                <th style={{ padding: '14px' }}>Location</th>
                <th style={{ padding: '14px' }}>Reported Issue</th>
                <th style={{ padding: '14px' }}>Priority</th>
                <th style={{ padding: '14px' }}>Assigned Team</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRequests.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '700' }}>{m.id}</td>
                  <td style={{ padding: '14px', fontWeight: '600' }}>{m.location}</td>
                  <td style={{ padding: '14px' }}>{m.issue}</td>
                  <td style={{ padding: '14px', color: m.priority === 'High' ? '#ef4444' : '#f59e0b', fontWeight: '700' }}>{m.priority}</td>
                  <td style={{ padding: '14px' }}>{m.assignedTo}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: m.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: m.status === 'Completed' ? '#15803d' : '#b45309' }}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 5: VISITORS REGISTER */}
      {/* ==================================================== */}
      {activeTab === 'visitors' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: '800', fontSize: '1.2rem' }}>Visitor Security Log</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.78rem', textTransform: 'uppercase', color: '#475569' }}>
                <th style={{ padding: '14px' }}>Pass No & Name</th>
                <th style={{ padding: '14px' }}>Purpose / Reason</th>
                <th style={{ padding: '14px' }}>Host / Approver</th>
                <th style={{ padding: '14px' }}>In / Out Time</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '700' }}>{v.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{v.passNo}</div>
                  </td>
                  <td style={{ padding: '14px' }}>{v.purpose}</td>
                  <td style={{ padding: '14px' }}>{v.host}</td>
                  <td style={{ padding: '14px' }}>{v.inTime} → {v.outTime}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: v.status === 'Checked In' ? '#dcfce7' : '#e2e8f0', color: v.status === 'Checked In' ? '#15803d' : '#475569' }}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 6: TRANSPORT COORDINATION */}
      {/* ==================================================== */}
      {activeTab === 'transport' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: '800', fontSize: '1.2rem' }}>Transport Fleet & Route Allocations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.78rem', textTransform: 'uppercase', color: '#475569' }}>
                <th style={{ padding: '14px' }}>Bus Registration</th>
                <th style={{ padding: '14px' }}>Route Details</th>
                <th style={{ padding: '14px' }}>Driver & Attendant</th>
                <th style={{ padding: '14px' }}>Students Assigned</th>
                <th style={{ padding: '14px' }}>Fuel Level</th>
              </tr>
            </thead>
            <tbody>
              {transport.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: '700', fontFamily: 'monospace' }}>{t.busNo}</td>
                  <td style={{ padding: '14px', fontWeight: '600' }}>{t.route}</td>
                  <td style={{ padding: '14px' }}>
                    <div>Driver: {t.driver}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Attendant: {t.attendant}</div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: '700' }}>{t.studentsCount} Students</td>
                  <td style={{ padding: '14px', color: '#10b981', fontWeight: '700' }}>{t.fuelStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODULE 7: REPORTS & ANALYTICS (INVENTORY & ADMISSIONS ONLY) */}
      {/* ==================================================== */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Report 1: Inventory Reports */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="#0284c7" /> Inventory Reports
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Comprehensive audits for Uniforms stock (Regular & Sports) and CBSE Books inventory valuation.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '0.88rem', color: '#334155', marginBottom: '20px' }}>
              <li><strong>Total Uniform Valuation:</strong> ₹{(totalUniformValuation / 1000).toFixed(1)}k ({totalUniformStockCount} pcs)</li>
              <li><strong>Total Books Valuation:</strong> ₹{(totalBookValuation / 1000).toFixed(1)}k ({totalBookStockCount} copies)</li>
              <li><strong>Low Stock Restock Alerts:</strong> {totalLowStockAlertsCount} Items Pending Reorder</li>
            </ul>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleExportExcel('Inventory_Audit_Report')} style={{ flex: 1, padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Export Inventory Excel
              </button>
              <button onClick={() => handleExportPDF('Inventory_Audit_Report')} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Print Inventory PDF
              </button>
            </div>
          </div>

          {/* Report 2: Admission Reports */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} color="#15803d" /> Admission Reports
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Grade-wise application statistics, document verification logs, and approval pipeline summary.
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '0.88rem', color: '#334155', marginBottom: '20px' }}>
              <li><strong>Total Applications Processed:</strong> {admissions.length} Students</li>
              <li><strong>Approved & Verified:</strong> {approvedAdmissionsCount} Applications</li>
              <li><strong>Pending Approvals:</strong> {pendingAdmissionsCount} Applications</li>
            </ul>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleExportExcel('Admissions_Summary_Report')} style={{ flex: 1, padding: '10px', background: '#15803d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Export Admissions Excel
              </button>
              <button onClick={() => handleExportPDF('Admissions_Summary_Report')} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Print Admissions PDF
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD NEW RECORD (UNIFORM / BOOK / ACC) */}
      {/* ==================================================== */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '560px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.25rem' }}>
                Create New {addModalType === 'uniform' ? 'Uniform Item' : addModalType === 'book' ? 'Book Record' : 'Accommodation Allocation'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button onClick={() => setAddModalType('uniform')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: addModalType === 'uniform' ? '#fff' : 'transparent', color: addModalType === 'uniform' ? '#0284c7' : '#64748b' }}>
                👕 Uniform Item
              </button>
              <button onClick={() => setAddModalType('book')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: addModalType === 'book' ? '#fff' : 'transparent', color: addModalType === 'book' ? '#0284c7' : '#64748b' }}>
                📚 Book Record
              </button>
              <button onClick={() => setAddModalType('accommodation')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: addModalType === 'accommodation' ? '#fff' : 'transparent', color: addModalType === 'accommodation' ? '#0284c7' : '#64748b' }}>
                🏢 Accommodation
              </button>
            </div>

            {/* FORM 1: UNIFORM FORM */}
            {addModalType === 'uniform' && (
              <form onSubmit={handleAddUniform} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Uniform Category</label>
                  <select value={newUniform.category} onChange={e => setNewUniform({...newUniform, category: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="Regular School Uniform">Regular School Uniform</option>
                    <option value="Sports Uniform">Sports Uniform</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Item Name</label>
                  <select value={newUniform.name} onChange={e => setNewUniform({...newUniform, name: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {newUniform.category.includes('Sports') ? (
                      <>
                        <option value="Sports T-Shirt">Sports T-Shirt</option>
                        <option value="Sports Trouser">Sports Trouser</option>
                        <option value="Sports Shoes">Sports Shoes</option>
                        <option value="Sports Socks">Sports Socks</option>
                      </>
                    ) : (
                      <>
                        <option value="Shirt">Shirt</option>
                        <option value="Trouser">Trouser</option>
                        <option value="Belt">Belt</option>
                        <option value="Tie">Tie</option>
                        <option value="ID Card">ID Card</option>
                        <option value="Socks">Socks</option>
                        <option value="Shoes">Shoes</option>
                      </>
                    )}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Colour / Design Spec</label>
                    <input type="text" placeholder="e.g. Navy Blue / White Collar" value={newUniform.colour} onChange={e => setNewUniform({...newUniform, colour: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Vendor</label>
                    <input type="text" placeholder="e.g. Raymond School Apparel" value={newUniform.vendor} onChange={e => setNewUniform({...newUniform, vendor: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Purchase Price (₹)</label>
                    <input type="number" placeholder="Cost price per item" value={newUniform.purchasePrice} onChange={e => setNewUniform({...newUniform, purchasePrice: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Selling Price (₹) — Same for all sizes</label>
                    <input type="number" placeholder="Fixed selling price" value={newUniform.sellingPrice} onChange={e => setNewUniform({...newUniform, sellingPrice: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Stock Quantity per Size</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {newUniform.sizes.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', minWidth: '45px' }}>Size {s.size}:</span>
                        <input type="number" value={s.stock} onChange={e => {
                          const updated = [...newUniform.sizes];
                          updated[idx].stock = e.target.value;
                          setNewUniform({...newUniform, sizes: updated});
                        }} style={{ width: '100%', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Save Uniform Item</button>
                </div>
              </form>
            )}

            {/* FORM 2: BOOK FORM */}
            {addModalType === 'book' && (
              <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Book Category Type</label>
                    <select value={newBook.bookType} onChange={e => setNewBook({...newBook, bookType: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option value="Long Book">Long Book</option>
                      <option value="Short Book">Short Book</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Book Title</label>
                    <input type="text" placeholder="e.g. Mathematics Practice Notebook" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                {/* Long Book Specifications */}
                {newBook.bookType === 'Long Book' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Page Option</label>
                      <select value={newBook.pageOption} onChange={e => setNewBook({...newBook, pageOption: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="100 Pages">100 Pages</option>
                        <option value="200 Pages">200 Pages</option>
                        <option value="300 Pages">300 Pages</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Rule Type</label>
                      <select value={newBook.ruleType} onChange={e => setNewBook({...newBook, ruleType: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Ruled">Ruled</option>
                        <option value="Plain">Plain</option>
                        <option value="One Side Ruled & One Side Plain">One Side Ruled & One Side Plain</option>
                        <option value="Graph">Graph</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Short Book Specifications */
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Short Book Category</label>
                    <select value={newBook.shortBookCategory} onChange={e => setNewBook({...newBook, shortBookCategory: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Broad Rule">Broad Rule</option>
                      <option value="Single Rule">Single Rule</option>
                      <option value="Four Rule">Four Rule</option>
                      <option value="Numbers Book">Numbers Book</option>
                      <option value="Plain">Plain</option>
                      <option value="One Side Plain & One Side Ruled">One Side Plain & One Side Ruled</option>
                    </select>
                  </div>
                )}

                {/* Class, Section, & Automatic CBSE Subject Mapping */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Class</label>
                    <select value={newBook.classGrade} onChange={e => handleBookClassChange(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      {Object.keys(CBSE_SUBJECTS_BY_GRADE).map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Section</label>
                    <select value={newBook.section} onChange={e => setNewBook({...newBook, section: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                      <option value="All Sections">All Sections</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>CBSE Subject</label>
                    <select value={newBook.subject} onChange={e => setNewBook({...newBook, subject: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#0369a1' }}>
                      {(CBSE_SUBJECTS_BY_GRADE[newBook.classGrade] || []).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Quantity</label>
                    <input type="number" placeholder="Total copies" value={newBook.quantity} onChange={e => setNewBook({...newBook, quantity: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Cost Price (₹)</label>
                    <input type="number" placeholder="Purchase price" value={newBook.purchasePrice} onChange={e => setNewBook({...newBook, purchasePrice: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Selling Price (₹)</label>
                    <input type="number" placeholder="Selling price" value={newBook.sellingPrice} onChange={e => setNewBook({...newBook, sellingPrice: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Publisher</label>
                  <input type="text" placeholder="e.g. Navneet / Oxford / NCERT" value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Save Book Title</button>
                </div>
              </form>
            )}

            {/* FORM 3: ACCOMMODATION FORM */}
            {addModalType === 'accommodation' && (
              <form onSubmit={handleAddAcc} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Accommodation Type</label>
                  <select value={newAcc.accommodationType} onChange={e => setNewAcc({...newAcc, accommodationType: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                    <option value="Staff Quarters">Staff Quarters</option>
                    <option value="Teaching Staff Accommodation">Teaching Staff Accommodation</option>
                    <option value="Non-Teaching Staff Accommodation">Non-Teaching Staff Accommodation</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Building / Hall</label>
                    <input type="text" placeholder="e.g. Block A (Tagore Hall)" value={newAcc.building} onChange={e => setNewAcc({...newAcc, building: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Room / Flat No</label>
                    <input type="text" placeholder="e.g. Room 104" value={newAcc.roomNo} onChange={e => setNewAcc({...newAcc, roomNo: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Bed / Unit No</label>
                    <input type="text" placeholder="e.g. Bed A1" value={newAcc.bedNo} onChange={e => setNewAcc({...newAcc, bedNo: e.target.value})} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Occupant Name (Optional)</label>
                    <input type="text" placeholder="Leave blank if vacant" value={newAcc.occupantName} onChange={e => setNewAcc({...newAcc, occupantName: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Save Accommodation Record</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: IMPORT EXCEL MODAL */}
      {/* ==================================================== */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '440px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontWeight: '800' }}>Import Data from Excel / CSV</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Upload an Excel (.xlsx / .csv) file to batch import items into <strong>{activeTab.toUpperCase()}</strong>.
            </p>

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f8fafc', marginBottom: '18px' }}>
              <Upload size={32} color="#0284c7" style={{ marginBottom: '8px' }} />
              <input type="file" accept=".csv, .xlsx" onChange={e => setImportFile(e.target.files[0])} style={{ display: 'block', margin: '0 auto', fontSize: '0.8rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowImportModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSimulateImport} style={{ flex: 1, padding: '10px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Upload & Integrate</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: SELL / ISSUE ITEM TO STUDENT MODAL */}
      {/* ==================================================== */}
      {showSellModal && sellTargetItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '520px', maxWidth: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛒 Sell / Issue Item to Student
              </h3>
              <button onClick={() => setShowSellModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Target Item Summary Box */}
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                {sellTargetItem.name || sellTargetItem.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>Type: <strong style={{ color: '#0369a1' }}>{sellItemType === 'uniform' ? sellTargetItem.category : sellTargetItem.bookType}</strong></span>
                <span>Selling Price: <strong style={{ color: '#059669' }}>₹{sellTargetItem.sellingPrice}</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmSale} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              
              {/* Dropdown 1: Select Student */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Select Student *
                </label>
                <select
                  value={sellForm.studentId}
                  onChange={e => setSellForm({ ...sellForm, studentId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff', fontWeight: '600', color: '#0f172a' }}
                  required
                >
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.grade} ({s.section}) • Roll: {s.rollNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Size / Spec Dropdown */}
              {sellItemType === 'uniform' ? (
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Select Size *
                  </label>
                  <select
                    value={sellForm.selectedSize}
                    onChange={e => setSellForm({ ...sellForm, selectedSize: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                  >
                    {(sellTargetItem.sizes || []).map(sz => (
                      <option key={sz.size} value={sz.size}>
                        Size {sz.size} — In Stock: {sz.stock} pcs {sz.stock < 10 ? '⚠️ Low Stock' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Book Specification
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={sellTargetItem.bookType === 'Long Book' ? `${sellTargetItem.pageOption} (${sellTargetItem.ruleType})` : sellTargetItem.shortBookCategory}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#334155', fontWeight: '600' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Quantity to Issue
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sellForm.quantity}
                    onChange={e => setSellForm({ ...sellForm, quantity: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    Payment Mode / Status
                  </label>
                  <select
                    value={sellForm.paymentMode}
                    onChange={e => setSellForm({ ...sellForm, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Paid (Cash)">Paid (Cash)</option>
                    <option value="Paid (UPI / Card)">Paid (UPI / Card)</option>
                    <option value="Charge to Student Fee Account">Charge to Student Fee Account</option>
                  </select>
                </div>
              </div>

              {/* Total Payable Summary */}
              <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#065f46', fontSize: '0.88rem' }}>Total Amount Payable:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#047857' }}>
                  ₹{(sellTargetItem.sellingPrice || 0) * (Number(sellForm.quantity) || 1)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSellModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}>
                  Confirm Sale & Issue
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: STUDENT SALES & ISSUANCE HISTORY MODAL */}
      {/* ==================================================== */}
      {showHistoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '740px', maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.25rem' }}>
                  📜 Student Sales & Item Issuance History
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Log of all uniforms & books issued to students with auto stock reconciliation.
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px' }}>Issue ID & Date</th>
                  <th style={{ padding: '10px' }}>Student Name & Class</th>
                  <th style={{ padding: '10px' }}>Item Issued</th>
                  <th style={{ padding: '10px' }}>Qty</th>
                  <th style={{ padding: '10px' }}>Total Price</th>
                  <th style={{ padding: '10px' }}>Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {issuedItemsLog.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>{log.id}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.date}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{log.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.grade}</div>
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{log.itemTitle}</td>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{log.qty} pcs</td>
                    <td style={{ padding: '10px', fontWeight: '800', color: '#059669' }}>₹{log.totalAmount}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', background: log.paymentStatus.includes('Cash') ? '#dcfce7' : '#e0e7ff', color: log.paymentStatus.includes('Cash') ? '#15803d' : '#4338ca' }}>
                        {log.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowHistoryModal(false)} style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AoManagement;
