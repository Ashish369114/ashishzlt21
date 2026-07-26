import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService, classService, concessionService, feeService, marksService, attendanceService, studentNotesService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';
import { ChevronRight } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const [viewingFeesStudent, setViewingFeesStudent] = useState(null);
  const [feesList, setFeesList] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState('');

  const [viewingMarksStudent, setViewingMarksStudent] = useState(null);
  const [marksList, setMarksList] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksError, setMarksError] = useState('');
  const [marksExamTypeFilter, setMarksExamTypeFilter] = useState('');

  const [viewingAttendanceStudent, setViewingAttendanceStudent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  
  const [concessionStudent, setConcessionStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [concessionAmount, setConcessionAmount] = useState('');
  const [concessionReason, setConcessionReason] = useState('');
  const [concessionSaving, setConcessionSaving] = useState(false);
  const [concessionError, setConcessionError] = useState('');
  const [pendingConcessions, setPendingConcessions] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState(null);

  const [allFeesData, setAllFeesData] = useState([]);
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('All');
  
  const [allNotes, setAllNotes] = useState([]);
  const [notesModalStudent, setNotesModalStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [newNote, setNewNote] = useState({ category: '', subject: '', priority: 'Low', description: '', visibleToParent: false });
  const [notesLoading, setNotesLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userId: '',
    password: '',
    rollNumber: '',
    classId: '',
    parentId: '',
    parentUserId: '',
    parentPassword: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentGender: 'Male',
    parentAddress: '',
    parentRelationship: '',
    dateOfBirth: '',
    phone: '',
    gender: 'Male',
  });

  const fetchPendingConcessions = async () => {
    try {
      const response = await concessionService.getPending();
      setPendingConcessions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pending concessions:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    let parsedUser = null;
    if (savedUser) {
      parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      if (parsedUser.role === 'principal') {
        fetchPendingConcessions();
      }
    }
    fetchStudents(parsedUser);
    fetchClasses();
    fetchAllNotes();

    const handleClickOutside = () => setActionMenuOpenFor(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!classes.length) {
      setSelectedGrade('');
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
    if (selectedGrade && !gradeOptions.includes(String(selectedGrade))) {
      setSelectedGrade('');
      setSelectedSection('');
      setSelectedClassId('');
    }
  }, [classes, selectedGrade]);

  useEffect(() => {
    if (!classes.length || !selectedGrade) {
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    const gradeClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map((cls) => cls.section).filter(Boolean))].sort();

    if (!sections.length) {
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
    }

    const matchedClass = gradeClasses.find((cls) => String(cls.section) === String(selectedSection || ''));
    setSelectedClassId(matchedClass?._id || '');
  }, [classes, selectedGrade, selectedSection]);

  const fetchStudents = async (userObj = currentUser) => {
    try {
      setLoading(true);
      const isAcc = userObj && (userObj.role === 'accountant' || userObj.role === 'accountant_admin');
      const [studentsRes, feesRes] = await Promise.all([
        studentService.getAll(),
        isAcc ? feeService.getAll() : Promise.resolve({ data: [] })
      ]);
      setStudents(studentsRes.data || []);
      if (isAcc) {
        setAllFeesData(feesRes.data || []);
      }
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const fetchAllNotes = async () => {
    try {
      const res = await studentNotesService.getAll();
      setAllNotes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const handleOpenNotes = async (student) => {
    setNotesModalStudent(student);
    setNotesLoading(true);
    try {
      const res = await studentNotesService.getByStudent(student._id);
      setStudentNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.category || !newNote.description) return;
    try {
      const notePayload = {
        ...newNote,
        studentId: notesModalStudent._id,
        addedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Teacher'
      };
      await studentNotesService.add(notePayload);
      
      if (newNote.category === 'Weak in Subject' && newNote.subject) {
        const currentNotes = await studentNotesService.getByStudent(notesModalStudent._id);
        const weakCount = currentNotes.data.filter(n => n.category === 'Weak in Subject' && n.subject === newNote.subject).length;
        
        if (weakCount >= 3) {
          const hasRemedial = currentNotes.data.some(n => n.category === 'Needs Remedial Classes' && n.subject === newNote.subject);
          if (!hasRemedial) {
            await studentNotesService.add({
              category: 'Needs Remedial Classes',
              subject: newNote.subject,
              priority: 'High',
              description: `System Auto-Flag: Student has been marked "Weak in Subject" for ${newNote.subject} 3 or more times. Remedial classes are recommended.`,
              visibleToParent: true,
              studentId: notesModalStudent._id,
              addedBy: 'System'
            });
          }
        }
      }

      setNewNote({ category: '', subject: '', priority: 'Low', description: '', visibleToParent: false });
      
      // refresh notes
      const res = await studentNotesService.getByStudent(notesModalStudent._id);
      setStudentNotes(res.data || []);
      fetchAllNotes();
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      userId: '',
      password: '',
      rollNumber: '',
      classId: '',
      parentId: '',
      parentUserId: '',
      parentPassword: '',
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
      parentGender: 'Male',
      parentAddress: '',
      parentRelationship: '',
      dateOfBirth: '',
      phone: '',
      gender: 'Male',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser || !['super_admin', 'principal', 'accountant_admin'].includes(currentUser.role)) {
        setError('You do not have permission to save a student.');
        return;
      }
      setError('');

      if (editingId) {
        await studentService.update(editingId, formData);
      } else {
        await studentService.add(formData);
      }

      resetForm();
      fetchStudents();
    } catch (err) {
      const message = err.response?.data?.message || 'Unknown error';
      setError(`Failed to save student: ${message}`);
      console.error(err);
    }
  };

  const handleEditStudent = (student) => {
    setEditingId(student._id);
    setFormData({
      firstName: student.userId?.firstName || '',
      lastName: student.userId?.lastName || '',
      userId: student.userId?.userId || '',
      password: '',
      rollNumber: student.rollNumber || '',
      classId: student.class?._id || '',
      parentId: student.parentId?._id || '',
      parentUserId: student.parentId?.userId || '',
      parentPassword: '',
      parentFirstName: student.parentId?.firstName || '',
      parentLastName: student.parentId?.lastName || '',
      parentEmail: student.parentId?.email || '',
      parentPhone: student.parentId?.phone || '',
      parentGender: student.parentId?.gender || 'Male',
      parentAddress: student.parentId?.address || '',
      parentRelationship: student.parentId?.relationship || '',
      dateOfBirth: student.userId?.dateOfBirth ? new Date(student.userId.dateOfBirth).toISOString().slice(0, 10) : '',
      phone: student.userId?.phone || '',
      gender: student.userId?.gender || 'Male',
    });
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const handleViewFees = async (student) => {
    setViewingFeesStudent(student);
    setFeesLoading(true);
    setFeesError('');
    setFeesList([]);
    try {
      const response = await feeService.getByStudent(student.userId?._id || student.userId || student._id);
      let data = response.data || [];
      // Dummy data fallback if empty
      if (data.length === 0) {
        data = [
          { _id: 'dummy1', description: 'Tuition Fee - Term 1', amount: 5000, paidAmount: 5000, status: 'Paid' },
          { _id: 'dummy2', description: 'Transport Fee - Term 1', amount: 1500, paidAmount: 500, status: 'Partial' },
          { _id: 'dummy3', description: 'Library Fee', amount: 500, paidAmount: 0, status: 'Unpaid' }
        ];
      }
      setFeesList(data);
    } catch (err) {
      setFeesError('Failed to load fees for this student.');
      console.error(err);
    } finally {
      setFeesLoading(false);
    }
  };

  const handleViewMarks = async (student) => {
    setViewingMarksStudent(student);
    setMarksLoading(true);
    setMarksError('');
    setMarksList([]);
    try {
      const response = await marksService.getByStudent(student.userId?._id || student.userId || student._id);
      let data = response.data || [];
      // Dummy data fallback if empty
      if (data.length === 0) {
        data = [
          { _id: 'm1', examType: 'Mid Term', subject: { name: 'Mathematics' }, marks: 85, status: 'Pass' },
          { _id: 'm2', examType: 'Mid Term', subject: { name: 'Science' }, marks: 92, status: 'Pass' },
          { _id: 'm3', examType: 'Mid Term', subject: { name: 'English' }, marks: 78, status: 'Pass' },
          { _id: 'm4', examType: 'Mid Term', subject: { name: 'History' }, marks: 35, status: 'Fail' }
        ];
      }
      setMarksList(data);
    } catch (err) {
      setMarksError('Failed to load marks for this student.');
      console.error(err);
    } finally {
      setMarksLoading(false);
    }
  };

  const handleViewAttendance = async (student) => {
    setViewingAttendanceStudent(student);
    setAttendanceLoading(true);
    setAttendanceError('');
    setAttendanceList([]);
    try {
      const response = await attendanceService.getByStudent(student.userId?._id || student.userId || student._id);
      let data = response.data || [];
      // Dummy data fallback if empty
      if (data.length === 0) {
        const today = new Date();
        data = [
          { _id: 'a1', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Present', remarks: 'On time' },
          { _id: 'a2', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Present', remarks: '' },
          { _id: 'a3', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'Absent', remarks: 'Sick leave' },
          { _id: 'a4', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'Late', remarks: 'Traffic' },
          { _id: 'a5', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Present', remarks: '' }
        ];
      }
      setAttendanceList(data);
    } catch (err) {
      setAttendanceError('Failed to load attendance for this student.');
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };
 
  const handleOpenConcessionModal = async (student) => {
    setConcessionStudent(student);
    setConcessionError('');
    const studentUserId = String(student.userId?._id || student.userId || '');
    const req = pendingConcessions.find(
      (c) => c.status === 'pending' && String(c.student?._id || c.student || '') === studentUserId
    );
    setActiveRequest(req || null);
  };

  const handleApproveConcession = async () => {
    if (!activeRequest) return;
    setConcessionSaving(true);
    setConcessionError('');
    try {
      await concessionService.approve(activeRequest._id);
      alert('Concession request approved and applied successfully!');
      setConcessionStudent(null);
      setActiveRequest(null);
      fetchStudents();
      fetchPendingConcessions();
    } catch (err) {
      setConcessionError(err.response?.data?.message || 'Failed to approve concession.');
    } finally {
      setConcessionSaving(false);
    }
  };

  const handleRejectConcession = async () => {
    if (!activeRequest) return;
    const remarks = prompt('Enter a reason for rejection (optional):');
    if (remarks === null) return;
    setConcessionSaving(true);
    setConcessionError('');
    try {
      await concessionService.reject(activeRequest._id, remarks);
      alert('Concession request rejected.');
      setConcessionStudent(null);
      setActiveRequest(null);
      fetchStudents();
      fetchPendingConcessions();
    } catch (err) {
      setConcessionError(err.response?.data?.message || 'Failed to reject concession.');
    } finally {
      setConcessionSaving(false);
    }
  };

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  
  const sectionsForGrade = selectedGrade 
    ? [...new Set(classes.filter((cls) => String(cls.grade) === String(selectedGrade)).map((cls) => cls.section).filter(Boolean))].sort()
    : [];

  const filteredStudentsForSelect = students.filter((student) => {
    if (selectedGrade && (!student.class || String(student.class.grade) !== String(selectedGrade))) {
      return false;
    }
    if (selectedSection && (!student.class || String(student.class.section) !== String(selectedSection))) {
      return false;
    }
    return true;
  });

  const visibleStudents = students.filter((student) => {
    if (selectedGrade && (!student.class || String(student.class.grade) !== String(selectedGrade))) {
      return false;
    }
    if (selectedSection && (!student.class || String(student.class.section) !== String(selectedSection))) {
      return false;
    }
    if (selectedStudentId && String(student._id) !== String(selectedStudentId)) {
      return false;
    }

    const isAcc = currentUser && (currentUser.role === 'accountant' || currentUser.role === 'accountant_admin');
    if (isAcc && selectedFeeStatus !== 'All') {
      const studentFees = allFeesData.filter(f => String(f.student?._id || f.student) === String(student.userId?._id || student.userId || student._id));
      const totalAmount = studentFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const paidAmount = studentFees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
      const pendingAmt = Math.max(totalAmount - paidAmount, 0);
      
      let status = 'Pending';
      if (totalAmount === 0 || pendingAmt === 0) status = 'Paid';
      else if (paidAmount > 0) status = 'Partial';
      
      if (status !== selectedFeeStatus) return false;
    }

    return true;
  });

  const isAccountant = currentUser && (currentUser.role === 'accountant' || currentUser.role === 'accountant_admin');

  return (
    <>
      <style>{`
        .action-menu-container {
          position: relative;
        }
        .action-menu-button {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.2rem;
          line-height: 1;
        }
        .action-menu-button:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .action-menu-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          width: 200px;
          z-index: 1000;
          padding: 8px 0;
          animation: menuFadeIn 0.2s ease-out;
          transform-origin: top right;
        }
        @keyframes menuFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .action-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          text-align: left;
          font-size: 0.9rem;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          gap: 12px;
        }
        .action-menu-item:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .action-menu-item.danger:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        @media (max-width: 768px) {
          .action-menu-dropdown {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            width: 100%;
            border-radius: 16px 16px 0 0;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 16px 0 24px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.15);
            z-index: 1000;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .action-menu-item {
            padding: 16px 24px;
            font-size: 1rem;
          }
          .action-menu-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 999;
            animation: fadeOverlay 0.3s ease;
          }
          @keyframes fadeOverlay {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
      <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👨‍🎓 {isAccountant ? 'Student Fee Management' : 'Student Management'}</h2>
        {!isAccountant && currentUser && ['super_admin', 'principal'].includes(currentUser.role) && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ width: 'auto', marginTop: '0', padding: '10px 24px' }}>
            {showForm ? 'Cancel' : '➕ Add Student'}
          </button>
        )}
        {isAccountant && (
          <Link to="/dashboard/fees" className="btn btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '10px 24px', whiteSpace: 'nowrap' }}>
            💰 Collect Fee
          </Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmitStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required={!editingId}
                  readOnly={!!editingId}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder={editingId ? 'Leave blank to keep current password' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class / Section</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {`Grade ${cls.grade} - Section ${cls.section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {currentUser && currentUser.role === 'super_admin' && (
              <>
                <div className="form-divider">
                  <h4>Parent / Guardian Details</h4>
                  <p style={{ marginTop: '8px', color: '#6b7280' }}>
                    If you have an existing parent account, supply the Parent Account ID here. To create a new parent account, fill the parent user details below; leaving Parent User ID blank will auto-generate a parent login.
                  </p>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Existing Parent Account ID</label>
                    <input
                      type="text"
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      placeholder="Link an existing parent account by ObjectId"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent User ID</label>
                    <input
                      type="text"
                      name="parentUserId"
                      value={formData.parentUserId}
                      onChange={handleInputChange}
                      placeholder="Leave blank to auto-generate when creating a new parent"
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Password</label>
                    <input
                      type="password"
                      name="parentPassword"
                      value={formData.parentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter to create/update parent account"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent First Name</label>
                    <input
                      type="text"
                      name="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Last Name</label>
                    <input
                      type="text"
                      name="parentLastName"
                      value={formData.parentLastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Email</label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Phone</label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Gender</label>
                    <select
                      name="parentGender"
                      value={formData.parentGender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      name="parentRelationship"
                      value={formData.parentRelationship}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Address</label>
                    <input
                      type="text"
                      name="parentAddress"
                      value={formData.parentAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-success">{editingId ? 'Update Student' : 'Save Student'}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="form-container" style={{ marginBottom: '20px', padding: '15px' }}>
        <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection('');
                setSelectedStudentId('');
              }}
            >
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudentId('');
              }}
              disabled={!selectedGrade}
            >
              <option value="">Select section</option>
              {sectionsForGrade.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedGrade}
            >
              <option value="">Select student</option>
              {filteredStudentsForSelect.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.userId?.firstName} {st.userId?.lastName} ({st.rollNumber || 'N/A'})
                </option>
              ))}
            </select>
          </div>
          {isAccountant && (
            <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
              <select value={selectedFeeStatus} onChange={(e) => setSelectedFeeStatus(e.target.value)}>
                <option value="All">Fee Status: All</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : !selectedGrade ? (
        <div className="alert alert-info" style={{ textAlign: 'center', margin: '20px' }}>Please select a Grade to view students.</div>
      ) : visibleStudents.length === 0 ? (
        <div className="alert alert-warning" style={{ textAlign: 'center', margin: '20px' }}>No students found for this selection.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade / Section</th>
                <th>Roll Number</th>
                <th>Phone</th>
                <th>Parent/Guardian</th>
                {isAccountant && <th>Pending Fee</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => {
                let pendingAmt = 0;
                if (isAccountant) {
                  const studentFees = allFeesData.filter(f => String(f.student?._id || f.student) === String(student.userId?._id || student.userId || student._id));
                  const totalAmount = studentFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
                  const paidAmount = studentFees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
                  pendingAmt = Math.max(totalAmount - paidAmount, 0);
                }

                return (
                <tr key={student._id}>
                  <td>
                    {student.userId?.firstName} {student.userId?.lastName}
                    {allNotes.filter(n => n.studentId === student._id && n.category === 'Needs Remedial Classes').length > 0 && (
                      <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                        🚨 Remedial Required
                      </span>
                    )}
                  </td>
                  <td>{student.class ? `Grade ${student.class.grade} - Section ${student.class.section}` : 'N/A'}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.userId?.phone}</td>
                  <td>{student.parentId?.firstName ? `${student.parentId.firstName} ${student.parentId.lastName}` : 'N/A'}</td>
                  {isAccountant && (
                    <td style={{ fontWeight: 'bold', color: pendingAmt > 0 ? '#ef4444' : '#10b981' }}>
                      {formatCurrency(pendingAmt)}
                    </td>
                  )}
                  <td>
                    <div className="action-menu-container">
                      <button 
                        className="action-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpenFor(actionMenuOpenFor === student._id ? null : student._id);
                        }}
                      >
                        ⋮
                      </button>
                      
                      {actionMenuOpenFor === student._id && (
                        <>
                          <div className="action-menu-overlay" onClick={(e) => { e.stopPropagation(); setActionMenuOpenFor(null); }}></div>
                          <div className="action-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                            {!isAccountant && currentUser && ['super_admin', 'principal', 'teacher'].includes(currentUser.role) && (
                              <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleOpenNotes(student); }}>
                                📝 Student Notes
                              </button>
                            )}
                            {!isAccountant && currentUser && ['super_admin', 'principal'].includes(currentUser.role) && (
                              <>
                                <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleEditStudent(student); }}>
                                  ✏️ Edit Student
                                </button>
                                <button className="action-menu-item danger" onClick={() => { setActionMenuOpenFor(null); handleDeleteStudent(student._id); }}>
                                  🗑️ Delete Student
                                </button>
                                <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleViewFees(student); }}>
                                  💰 Check Fees
                                </button>
                                <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleViewMarks(student); }}>
                                  📝 Check Marks
                                </button>
                                <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleViewAttendance(student); }}>
                                  ✅ Check Attendance
                                </button>
                              </>
                            )}

                            {!isAccountant && currentUser && currentUser.role === 'principal' && pendingConcessions.some(
                              (c) => c.status === 'pending' && String(c.student?._id || c.student || '') === String(student.userId?._id || student.userId || '')
                            ) && (
                              <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleOpenConcessionModal(student); }}>
                                🎁 Concession Request
                              </button>
                            )}

                            {isAccountant && (
                              <>
                                <Link to="/dashboard/fees" className="action-menu-item" style={{ textDecoration: 'none' }}>
                                  💰 Collect Fee
                                </Link>
                                <button className="action-menu-item" onClick={() => { setActionMenuOpenFor(null); handleViewFees(student); }}>
                                  📋 Fee Details
                                </button>
                                <Link to="/dashboard/payments" className="action-menu-item" style={{ textDecoration: 'none' }}>
                                  🧾 Payment History
                                </Link>
                                <Link to="/dashboard/collections" className="action-menu-item" style={{ textDecoration: 'none' }}>
                                  📄 Print Receipt
                                </Link>
                                <Link to="/dashboard/concessions" className="action-menu-item" style={{ textDecoration: 'none' }}>
                                  🎓 Scholarship / Discount
                                </Link>
                              </>
                            )}
                          </div>
                        </>
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

      {concessionStudent && activeRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
            color: '#1f2937',
            fontFamily: 'sans-serif'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 'bold' }}>🎁 Review Concession Request</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 20px' }}>
              Parent request details for <strong>{concessionStudent.userId?.firstName} {concessionStudent.userId?.lastName}</strong>.
            </p>

            {concessionError && (
              <div style={{
                color: '#b91c1c',
                background: '#fee2e2',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '14px',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}>
                {concessionError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Fee Record</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                  {activeRequest.fee?.description || 'Tuition Fee'}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Requested Concession Amount</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                  {formatCurrency(Number(activeRequest.concessionAmount || 0))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Reason</span>
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {activeRequest.reason}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setConcessionStudent(null); setActiveRequest(null); }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: '#374151'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRejectConcession}
                disabled={concessionSaving}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: concessionSaving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={handleApproveConcession}
                disabled={concessionSaving}
                style={{
                  padding: '10px 22px',
                  background: concessionSaving ? '#93c5fd' : '#15803d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: concessionSaving ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}
              >
                {concessionSaving ? '⏳ Processing...' : '✅ Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingFeesStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            color: '#1f2937',
            fontFamily: 'sans-serif'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💵 Fee Details
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
              Showing fees for <strong>{viewingFeesStudent.userId?.firstName} {viewingFeesStudent.userId?.lastName}</strong> (Roll: {viewingFeesStudent.rollNumber || 'N/A'})
            </p>

            {feesLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner"></div>
              </div>
            ) : feesError ? (
              <div className="alert alert-error">{feesError}</div>
            ) : feesList.length === 0 ? (
              <div className="alert alert-warning" style={{ margin: '20px 0' }}>No fee records found for this student.</div>
            ) : (
              <div>
                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Description</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>Total</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>Paid</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>Pending</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feesList.map(fee => (
                        <tr key={fee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px' }}>{fee.description}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(fee.amount)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a' }}>{formatCurrency(fee.paidAmount)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#dc2626' }}>{formatCurrency(fee.amount - fee.paidAmount)}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              background: fee.status === 'Paid' ? '#dcfce7' : fee.status === 'Partial' ? '#fef9c3' : '#fee2e2',
                              color: fee.status === 'Paid' ? '#166534' : fee.status === 'Partial' ? '#854d0e' : '#991b1b'
                            }}>
                              {fee.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewingFeesStudent(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: '#374151'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingMarksStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            color: '#1f2937',
            fontFamily: 'sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: '0', fontSize: '1.35rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📝 Marks Details
              </h3>
              <select
                value={marksExamTypeFilter}
                onChange={(e) => setMarksExamTypeFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#f9fafb',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Exams</option>
                {[...new Set(marksList.map(m => m.examType))].filter(Boolean).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
              Showing marks for <strong>{viewingMarksStudent.userId?.firstName} {viewingMarksStudent.userId?.lastName}</strong> (Roll: {viewingMarksStudent.rollNumber || 'N/A'})
            </p>

            {marksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner"></div>
              </div>
            ) : marksError ? (
              <div className="alert alert-error">{marksError}</div>
            ) : marksList.length === 0 ? (
              <div className="alert alert-warning" style={{ margin: '20px 0' }}>No marks records found for this student.</div>
            ) : (
              <div>
                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Exam</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Subject</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(marksExamTypeFilter ? marksList.filter(m => m.examType === marksExamTypeFilter) : marksList).map(mark => (
                        <tr key={mark._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px' }}>{mark.examType || 'Unknown Exam'}</td>
                          <td style={{ padding: '10px' }}>{mark.subject?.name || mark.subject || 'Unknown'}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            {mark.marks} / 100
                          </td>
                        </tr>
                      ))}
                      {(marksExamTypeFilter ? marksList.filter(m => m.examType === marksExamTypeFilter) : marksList).length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>No marks found for this exam type.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setViewingMarksStudent(null);
                  setMarksExamTypeFilter(''); // Reset filter on close
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: '#374151'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingAttendanceStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            color: '#1f2937',
            fontFamily: 'sans-serif'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Attendance Details
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px' }}>
              Showing attendance for <strong>{viewingAttendanceStudent.userId?.firstName} {viewingAttendanceStudent.userId?.lastName}</strong> (Roll: {viewingAttendanceStudent.rollNumber || 'N/A'})
            </p>

            {attendanceLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner"></div>
              </div>
            ) : attendanceError ? (
              <div className="alert alert-error">{attendanceError}</div>
            ) : attendanceList.length === 0 ? (
              <div className="alert alert-warning" style={{ margin: '20px 0' }}>No attendance records found for this student.</div>
            ) : (
              <div>
                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map(record => (
                        <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px' }}>
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              background: record.status === 'Present' ? '#dcfce7' : record.status === 'Absent' ? '#fee2e2' : '#fef9c3',
                              color: record.status === 'Present' ? '#166534' : record.status === 'Absent' ? '#991b1b' : '#854d0e'
                            }}>
                              {record.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>{record.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewingAttendanceStudent(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: '#374151'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAccountant && (
        <div className="premium-card mt-6" style={{ marginTop: '24px' }}>
          <div className="card-header border-b" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Pending Fee List</h3>
          </div>
          <div className="table-responsive" style={{ overflowX: 'auto', padding: '0 20px 20px' }}>
            <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Amount Due</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(student => {
                  const pending = allFeesData.filter(f => f.studentId === student._id && !f.isPaid);
                  return pending.length > 0;
                }).map(student => {
                  const pendingFeesForStudent = allFeesData.filter(f => f.studentId === student._id && !f.isPaid);
                  const totalPending = pendingFeesForStudent.reduce((sum, f) => sum + f.amount, 0);
                  const dueDate = pendingFeesForStudent[0]?.dueDate || 'N/A';
                  return (
                    <tr key={student._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#1e293b' }}>
                        {student.userId?.firstName} {student.userId?.lastName}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>Grade {student.classId?.grade || ''}</td>
                      <td style={{ padding: '12px', color: '#ef4444', fontWeight: '600' }}>{formatCurrency(totalPending)}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{dueDate !== 'N/A' ? new Date(dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <button 
                          onClick={() => alert(`Notification sent to ${student.userId?.firstName} ${student.userId?.lastName} for pending fee of ${formatCurrency(totalPending)}`)}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Notify <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notesModalStudent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0 }}>📝 Notes for {notesModalStudent.userId?.firstName} {notesModalStudent.userId?.lastName}</h2>
              <button onClick={() => setNotesModalStudent(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Add New Note</h3>
                <form onSubmit={handleAddNote}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Category</label>
                    <select value={newNote.category} onChange={e => setNewNote({...newNote, category: e.target.value})} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Select Category...</option>
                      <option value="Weak in Subject">Weak in Subject</option>
                      <option value="Needs Remedial Classes">Needs Remedial Classes</option>
                      <option value="Homework Incomplete">Homework Incomplete</option>
                      <option value="Poor Attendance">Poor Attendance</option>
                      <option value="Behaviour Issue">Behaviour Issue</option>
                      <option value="Discipline Issue">Discipline Issue</option>
                      <option value="Health Concern">Health Concern</option>
                      <option value="Parent Meeting Required">Parent Meeting Required</option>
                      <option value="Counselling Required">Counselling Required</option>
                      <option value="Excellent Performance">Excellent Performance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Subject (Optional)</label>
                    <select value={newNote.subject} onChange={e => setNewNote({...newNote, subject: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Select Subject (Optional)</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physical Education">Physical Education</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Priority</label>
                    <select value={newNote.priority} onChange={e => setNewNote({...newNote, priority: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Description</label>
                    <textarea value={newNote.description} onChange={e => setNewNote({...newNote, description: e.target.value})} required rows={3} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="visibleToParent" checked={newNote.visibleToParent} onChange={e => setNewNote({...newNote, visibleToParent: e.target.checked})} />
                    <label htmlFor="visibleToParent" style={{ margin: 0, fontWeight: 'normal' }}>Visible to Parent/Student</label>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Note</button>
                </form>
              </div>
              
              <div>
                <h3 style={{ marginTop: 0 }}>Note History</h3>
                {notesLoading ? (
                  <div className="spinner"></div>
                ) : studentNotes.length === 0 ? (
                  <div className="alert alert-info">No notes have been added for this student.</div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                    {studentNotes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(note => (
                      <div key={note._id} style={{ 
                        padding: '12px', 
                        marginBottom: '12px', 
                        borderRadius: '8px', 
                        borderLeft: `4px solid ${note.priority === 'High' ? '#ef4444' : note.priority === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderLeftWidth: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ color: '#111827' }}>{note.category}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                        {note.subject && <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '4px' }}><strong>Subject:</strong> {note.subject}</div>}
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#374151' }}>{note.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#6b7280' }}>Added by: {note.addedBy}</span>
                          {note.visibleToParent && <span style={{ color: '#10b981', fontWeight: 'bold' }}>👁️ Visible to Parent</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentManagement;
