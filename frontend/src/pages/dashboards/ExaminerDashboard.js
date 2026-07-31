import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, teacherService, classService, studentService } from '../../services/api';
import { demoExams, demoEmployees, demoClasses, demoStudents } from '../../utils/demoData';
import ExamManagement from '../components/ExamManagement';
import ZaynLeviLogo from '../../components/ZaynLeviLogo';
import { exportToPDF } from '../../utils/exportUtils';
import '../../styles/ManagementStyles.css';

const ExaminerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.name || user?.username || 'Examiner';
  const [activeTab, setActiveTab] = useState('overview');
  const [exams, setExams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Shared filters state
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [availableRooms, setAvailableRooms] = useState(['Room 101', 'Room 102', 'Room 111', 'Room 112', 'Hall A', 'Hall B']);
  const [selectedSeatedGrades, setSelectedSeatedGrades] = useState(['Grade 10', 'Grade 6', 'Grade 3']);

  // Assignment Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyExam, setHistoryExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [benchRange, setBenchRange] = useState('front');
  const [showBenchAssignModal, setShowBenchAssignModal] = useState(false);
  const [benchAssignStudent, setBenchAssignStudent] = useState(null);
  const [targetBenchId, setTargetBenchId] = useState(1);
  const [benchAssignments, setBenchAssignments] = useState({});
  const [isRandomized, setIsRandomized] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);
  const [manualFixedStudents, setManualFixedStudents] = useState({});
  const [showAddManualBenchModal, setShowAddManualBenchModal] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualBenchId, setManualBenchId] = useState(1);
  const [manualGrade, setManualGrade] = useState('10');
  const [manualSection, setManualSection] = useState('A');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // View Duty Modal state
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [dutyExam, setDutyExam] = useState(null);

  // Grade-wise Paper Collection Modal state
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileExam, setReconcileExam] = useState(null);
  const [gradeBreakdowns, setGradeBreakdowns] = useState({});
  const [currentBreakdown, setCurrentBreakdown] = useState([
    { grade: 'Grade 10', total: 12, collected: 10 },
    { grade: 'Grade 6', total: 14, collected: 13 },
    { grade: 'Grade 3', total: 10, collected: 9 }
  ]);

  const openReconcileModal = (exam) => {
    setReconcileExam(exam);
    const examId = exam.id || exam._id;
    const existing = gradeBreakdowns[examId];
    if (existing && existing.length > 0) {
      setCurrentBreakdown(existing);
    } else {
      setCurrentBreakdown([
        { grade: 'Grade 10', total: 12, collected: 10 },
        { grade: 'Grade 6', total: 14, collected: 13 },
        { grade: 'Grade 3', total: 10, collected: 9 }
      ]);
    }
    setShowReconcileModal(true);
  };

  const handleSaveReconciliation = async () => {
    if (!reconcileExam) return;
    const examId = reconcileExam.id || reconcileExam._id;
    setGradeBreakdowns(prev => ({
      ...prev,
      [examId]: currentBreakdown
    }));
    if (!reconcileExam.paperCollected) {
      await toggleCollection(reconcileExam);
    } else {
      showNotification('Grade-wise paper breakdown saved successfully!');
    }
    setShowReconcileModal(false);
    setReconcileExam(null);
  };

  const handleExportInvigilatorPDF = (examsList) => {
    const columns = [
      { header: 'Room', key: 'room' },
      { header: 'Subject', key: 'subject' },
      { header: 'Date', key: 'date' },
      { header: 'Time', key: 'time' },
      { header: 'Assigned Teacher', key: 'teacher' },
      { header: 'Status', key: 'status' }
    ];

    const data = (examsList || []).map(e => {
      const invNode = e.invigilator;
      const invUser = invNode && (invNode.user || invNode.userId);
      const resolvedTeacher = invUser
        ? `${invUser.firstName || ''} ${invUser.lastName || ''}`.trim()
        : (typeof invNode === 'object' && invNode?.name ? invNode.name : getExamTeacher(e));

      const assignedTeacherName = (resolvedTeacher && resolvedTeacher !== 'Unassigned') ? resolvedTeacher : 'Unassigned';

      return {
        room: e.room || 'Room 101',
        subject: getSubjectName(e.subject, e.name),
        date: new Date(e.examDate || Date.now()).toLocaleDateString(),
        time: `${e.startTime || '09:00'} - ${e.endTime || '11:00'}`,
        teacher: assignedTeacherName,
        status: assignedTeacherName !== 'Unassigned' ? 'Assigned' : 'Pending'
      };
    });

    const filename = `Invigilation_Duty_Roster_Grade_${selectedGrade || 'All'}.pdf`;
    exportToPDF(`Invigilation Duty Roster - Grade ${selectedGrade || 'All'} (${selectedExamType || 'Exams'})`, columns, data, filename);
  };

  const handleExportPaperPDF = (examsList) => {
    const columns = [
      { header: 'Subject', key: 'subject' },
      { header: 'Room', key: 'room' },
      { header: 'Collected / Total', key: 'breakdown' },
      { header: 'Dispatch Status', key: 'distStatus' },
      { header: 'Collection Status', key: 'colStatus' }
    ];

    const data = (examsList || []).map(e => {
      const examId = e.id || e._id;
      const breakdown = gradeBreakdowns[examId] || [
        { grade: 'Grade 10', total: 12, collected: e.paperCollected ? 12 : 10 },
        { grade: 'Grade 6', total: 14, collected: e.paperCollected ? 14 : 13 },
        { grade: 'Grade 3', total: 10, collected: e.paperCollected ? 10 : 9 }
      ];
      const totalExpected = breakdown.reduce((sum, g) => sum + g.total, 0);
      const totalCollected = breakdown.reduce((sum, g) => sum + g.collected, 0);

      return {
        subject: getSubjectName(e.subject, e.name),
        room: e.room || 'Room 101',
        breakdown: `${totalCollected}/${totalExpected} Collected`,
        distStatus: e.paperDispatched ? 'Dispatched' : 'Pending',
        colStatus: e.paperCollected ? 'Collected' : 'Pending'
      };
    });

    const filename = `Exam_Paper_Logistics_Grade_${selectedGrade || 'All'}.pdf`;
    exportToPDF(`Exam Paper Logistics Summary - Grade ${selectedGrade || 'All'} (${selectedExamType || 'Exams'})`, columns, data, filename);
  };

  const handleExportSeatingPDF = (studentsList) => {
    const columns = [
      { header: 'Seat #', key: 'seat' },
      { header: 'Bench', key: 'bench' },
      { header: 'Grade', key: 'grade' },
      { header: 'Roll No', key: 'roll' },
      { header: 'Student Name', key: 'name' }
    ];

    const data = (studentsList || []).map((s, idx) => {
      const benchNum = Math.floor(idx / 2) + 1;
      const assignedGrade = ['Grade 10', 'Grade 3', 'Grade 6'][idx % 3];
      const rollPrefix = assignedGrade.replace('Grade ', 'G');
      const rollNumStr = String(s.rollNumber || idx + 1).replace(/^G\d+-/i, '');

      return {
        seat: `Seat ${idx + 1}`,
        bench: `Bench #${benchNum}`,
        grade: assignedGrade,
        roll: `${rollPrefix}-${rollNumStr.padStart(3, '0')}`,
        name: `${s.userId?.firstName || ''} ${s.userId?.lastName || ''}`.trim() || `Student #${idx + 1}`
      };
    });

    const filename = `Seating_Arrangement_Grade_${selectedGrade || 'All'}.pdf`;
    exportToPDF(`Classroom Seating Arrangement - Grade ${selectedGrade || 'All'} (${selectedRoom || 'Room 101'})`, columns, data, filename);
  };

  const updateGradeCollected = (index, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCurrentBreakdown(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, collected: Math.min(item.total, num) };
      }
      return item;
    }));
  };

  const updateGradeName = (index, val) => {
    setCurrentBreakdown(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, grade: val };
      }
      return item;
    }));
  };

  const updateGradeTotal = (index, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setCurrentBreakdown(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, total: num, collected: Math.min(item.collected, num) };
      }
      return item;
    }));
  };

  const addGradeBreakdownRow = () => {
    const nextGradeNum = (currentBreakdown.length + 1) * 2;
    setCurrentBreakdown(prev => [...prev, { grade: `Grade ${nextGradeNum}`, total: 12, collected: 12 }]);
  };

  const removeGradeBreakdownRow = (index) => {
    if (currentBreakdown.length <= 1) return;
    setCurrentBreakdown(prev => prev.filter((_, idx) => idx !== index));
  };

  // Seating Arrangement state
  const [showSeating, setShowSeating] = useState(true);
  const [seatingSearch, setSeatingSearch] = useState('');
  const [sortMethod, setSortMethod] = useState('rollNumber');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [studentsPerBench, setStudentsPerBench] = useState(2);
  const [gradeExamTypes, setGradeExamTypes] = useState({
    'Grade 10': 'Annual Exam',
    'Grade 6': 'Mid-Term Exam',
    'Grade 3': 'Quarterly Exam'
  });
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [numClassesToMix, setNumClassesToMix] = useState(3);
  const [classSlots, setClassSlots] = useState([
    'Grade 10 - Sec A',
    'Grade 6 - Sec A',
    'Grade 3 - Sec A',
    'Grade 2 - Sec A'
  ]);
  const [roomInvigilator, setRoomInvigilator] = useState('Ramesh Sharma (Mathematics)');

  // Auto-scrolling Upcoming Events state & ref
  const eventsScrollRef = useRef(null);
  const [isEventsHovered, setIsEventsHovered] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  const upcomingEventsList = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Oct 28', color: '#3B82F6' },
    { id: 2, title: 'Diwali Holidays', date: 'Nov 1 - Nov 5', color: '#10B981' },
    { id: 3, title: 'Annual Sports Day', date: 'Nov 15', color: '#F59E0B' },
    { id: 4, title: 'Mid-Term Paper Evaluation', date: 'Nov 20 - Nov 28', color: '#8B5CF6' },
    { id: 5, title: 'Winter Vacation Begins', date: 'Dec 22', color: '#EF4444' }
  ];

  const scrollingEventsList = [...upcomingEventsList, ...upcomingEventsList];

  useEffect(() => {
    let interval;
    if (!isEventsHovered && eventsScrollRef.current) {
      interval = setInterval(() => {
        const scroller = eventsScrollRef.current;
        if (!scroller) return;
        
        const itemHeight = scroller.querySelector('.examiner-event-item')?.offsetHeight || 72;
        scroller.scrollBy({ top: itemHeight, behavior: 'smooth' });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isEventsHovered]);

  const handleEventsScroll = (e) => {
    const scroller = e.target;
    const itemHeight = scroller.querySelector('.examiner-event-item')?.offsetHeight || 72;
    const originalHeight = upcomingEventsList.length * itemHeight;

    if (scroller.scrollTop >= originalHeight) {
      scroller.scrollTop = scroller.scrollTop - originalHeight;
    }
    const index = Math.round(scroller.scrollTop / itemHeight);
    setActiveEventIndex(index % upcomingEventsList.length);
  };

  useEffect(() => {
    fetchExamsAndTeachers();
  }, []);

  const fetchExamsAndTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const [examsRes, teachersRes, classesRes, studentsRes] = await Promise.all([
        examService.getAll().catch(() => ({ data: [] })),
        teacherService.getAll().catch(() => ({ data: [] })),
        classService.getAll().catch(() => ({ data: [] })),
        studentService.getAll().catch(() => ({ data: [] }))
      ]);
      const fetchedExams = (examsRes.data && examsRes.data.length) ? examsRes.data : demoExams;
      const fetchedClasses = (classesRes.data && classesRes.data.length) ? classesRes.data : demoClasses;
      const fetchedTeachers = (teachersRes.data && teachersRes.data.length) ? teachersRes.data : demoEmployees;
      const fetchedStudents = (studentsRes.data && studentsRes.data.length) ? studentsRes.data : demoStudents;
      
      setExams(fetchedExams);
      setTeachers(fetchedTeachers);
      setClasses(fetchedClasses);
      setStudents(fetchedStudents);

      setSelectedGrade('');
      setSelectedSection('');
      setSelectedExamType('');
      setError('');
    } catch (err) {
      console.warn('Using demo data for ExaminerDashboard:', err);
      setExams(demoExams);
      setTeachers(demoEmployees);
      setClasses(demoClasses);
      setStudents(demoStudents);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const plan = (localStorage.getItem('subscriptionPlan') || user?.subscriptionPlan || 'silver').toLowerCase();
  
  const planLabel = plan === 'platinum_with_ocr' ? '⭐ PLATINUM + OCR' :
                    plan === 'platinum_without_ocr' || plan === 'platinum' ? '⭐ PLATINUM' :
                    plan === 'gold' ? '🏆 GOLD' : '🥈 SILVER';

  const planBg = plan.startsWith('platinum') ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' :
                 plan === 'gold' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                 'linear-gradient(135deg, #64748b, #475569)';

  // Toggle Paper Distribution
  const toggleDispatch = async (exam) => {
    const examId = exam.id || exam._id;
    try {
      setError('');
      setSuccess('');
      const updated = await examService.update(examId, {
        paperDispatched: !exam.paperDispatched
      });
      setExams(prev => prev.map(e => (e.id || e._id) === examId ? updated.data : e));
      showNotification('Paper distribution status updated!');
    } catch (err) {
      console.error('Error updating paper status:', err);
      setError('Failed to update paper distribution status.');
    }
  };

  // Toggle Paper Collection
  const toggleCollection = async (exam) => {
    const examId = exam.id || exam._id;
    try {
      setError('');
      setSuccess('');
      const updated = await examService.update(examId, {
        paperCollected: !exam.paperCollected
      });
      setExams(prev => prev.map(e => (e.id || e._id) === examId ? updated.data : e));
      showNotification('Paper collection status updated!');
    } catch (err) {
      console.error('Error updating paper status:', err);
      setError('Failed to update paper collection status.');
    }
  };

  // Assign Invigilator
  const assignInvigilator = async (teacherId) => {
    if (!selectedExam) return;
    const examId = selectedExam.id || selectedExam._id;
    try {
      setError('');
      setSuccess('');
      const updated = await examService.update(examId, {
        invigilator: teacherId
      });
      setExams(prev => prev.map(e => (e.id || e._id) === examId ? updated.data : e));
      setShowAssignModal(false);
      setSelectedExam(null);
      showNotification('Invigilator assigned successfully!');
    } catch (err) {
      console.error('Error assigning invigilator:', err);
      setError('Failed to assign invigilator.');
    }
  };

  // Remove Invigilator
  const removeInvigilator = async (exam) => {
    const examId = exam.id || exam._id;
    try {
      setError('');
      setSuccess('');
      const updated = await examService.update(examId, {
        invigilator: null
      });
      setExams(prev => prev.map(e => (e.id || e._id) === examId ? updated.data : e));
      showNotification('Invigilator removed.');
    } catch (err) {
      console.error('Error removing invigilator:', err);
      setError('Failed to remove invigilator.');
    }
  };

  const showNotification = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const getSubjectName = (subj, fallback) => {
    if (!subj) return fallback || 'N/A';
    if (typeof subj === 'object') return subj.name || subj.title || fallback || 'N/A';
    return String(subj);
  };

  // Calculate statistics
  const todayIso = new Date().toISOString().slice(0, 10);
  const todaysExamsList = exams.filter(e => {
    if (!e.examDate && !e.date) return false;
    try {
      const dStr = new Date(e.examDate || e.date).toISOString().slice(0, 10);
      return dStr === todayIso;
    } catch (err) {
      return false;
    }
  }).sort((a, b) => {
    const gradeA = Number(a.class?.grade || a.grade || 0);
    const gradeB = Number(b.class?.grade || b.grade || 0);
    if (gradeA !== gradeB) return gradeA - gradeB;

    const secA = String(a.class?.section || a.section || '').toUpperCase();
    const secB = String(b.class?.section || b.section || '').toUpperCase();
    if (secA !== secB) return secA.localeCompare(secB);

    const subjA = getSubjectName(a.subject, a.name);
    const subjB = getSubjectName(b.subject, b.name);
    return subjA.localeCompare(subjB);
  });
  const todaysExams = todaysExamsList.length;
  const pendingInvigilator = exams.filter(e => !e.invigilator).length;
  const pendingDistribute = exams.filter(e => !e.paperDispatched).length;
  const pendingCollect = exams.filter(e => !e.paperCollected).length;

  const getExamTeacher = (exam) => {
    if (exam.invigilator) {
      const t = exam.invigilator;
      if (t.user) {
        return `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || 'Unassigned';
      }
      if (t.userId) {
        return `${t.userId.firstName || ''} ${t.userId.lastName || ''}`.trim() || 'Unassigned';
      }
    }
    if (!exam.subject) return 'Unassigned';
    const examSubjectId = (typeof exam.subject === 'object' && exam.subject !== null ? (exam.subject.id || exam.subject._id) : null) || exam.subjectId || exam.subject;
    const examClassId = (typeof exam.class === 'object' && exam.class !== null ? (exam.class.id || exam.class._id) : null) || exam.classId || exam.class;

    let t = teachers.find(t => String(t.subject?.id || t.subject?._id || t.subject) === String(examSubjectId));
    if (!t) {
      t = teachers.find(tt => {
        if (tt.isAllSubjectTeacher) return false;
        const ids = (tt.teachingSubjects || []).map(s => s.id || s._id || s);
        return ids.some(id => String(id) === String(examSubjectId));
      });
    }
    if (!t && examClassId) {
      t = teachers.find(tt => {
        const classIds = (tt.assignedClasses || []).map(c => c.id || c._id || c);
        if (!classIds.some(id => String(id) === String(examClassId))) return false;
        const subjectIds = (tt.teachingSubjects || []).map(s => s.id || s._id || s);
        return subjectIds.some(id => String(id) === String(examSubjectId)) ||
               String(tt.subject?.id || tt.subject?._id || tt.subject) === String(examSubjectId) ||
               tt.isAllSubjectTeacher;
      });
    }
    if (t) return `${t.user?.firstName || t.userId?.firstName || ''} ${t.user?.lastName || t.userId?.lastName || ''}`.trim();
    return 'Unassigned';
  };

  // Recommended Teachers (sorted by workload & subject match)
  const getRecommendedTeachers = () => {
    const defaultWorkloads = [0, 1, 2, 0, 3, 1, 4, 0, 2, 1];
    
    const targetSubjectName = selectedExam ? getSubjectName(selectedExam.subject, selectedExam.name).toLowerCase() : '';

    return [...teachers].map((t, idx) => {
      const classCount = (t.assignedClasses && t.assignedClasses.length > 0)
        ? t.assignedClasses.length
        : defaultWorkloads[idx % defaultWorkloads.length];
      
      const teacherSubj = (t.subject?.name || t.subject || '').toString().toLowerCase();
      const isMatch = Boolean(targetSubjectName && (teacherSubj.includes(targetSubjectName) || targetSubjectName.includes(teacherSubj)));

      return {
        ...t,
        calculatedWorkload: classCount,
        isSubjectMatch: isMatch
      };
    }).sort((a, b) => {
      if (a.isSubjectMatch && !b.isSubjectMatch) return -1;
      if (!a.isSubjectMatch && b.isSubjectMatch) return 1;
      return a.calculatedWorkload - b.calculatedWorkload;
    });
  };

  // Shared Filter derived options
  const gradeOptions = [...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  const sectionsForGrade = selectedGrade
    ? [...new Set(classes.filter(c => String(c.grade) === String(selectedGrade)).map(c => c.section).filter(Boolean))].sort()
    : [];

  const comprehensiveExamTypesList = [
    'Annual Exam',
    'Final Exam',
    'Half-Yearly Exam',
    'Mid-Term Exam',
    'Quarterly Exam',
    'Unit Test',
    'Periodic Test',
    'Practical Exam',
    'Pre-Board Exam',
    'Mock Exam',
    'Surprise Test',
    'Board Exam',
    'Assignment / Project',
    'Competitive / Entrance Test'
  ];

  const uniqueExamTypes = [...new Set([
    ...comprehensiveExamTypesList,
    ...exams.map(e => e.examType).filter(Boolean)
  ])].sort();

  // Get selected class
  const selectedClassObj = classes.find(c => String(c.grade) === String(selectedGrade) && c.section === selectedSection);

  // Filter exams by selected class and exam type
  const filteredExams = exams.filter(exam => {
    if (!selectedClassObj) return false;
    const examClassId = (typeof exam.class === 'object' && exam.class !== null ? (exam.class.id || exam.class._id) : null) || exam.classId || exam.class;
    const targetClassId = selectedClassObj.id || selectedClassObj._id;
    if (String(examClassId) !== String(targetClassId)) return false;
    if (selectedExamType) {
      const t1 = (exam.examType || '').toLowerCase().replace(/[\s_-]+/g, '');
      const t2 = (selectedExamType || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (t1 !== t2 && !t1.includes(t2) && !t2.includes(t1)) return false;
    }
    return true;
  }).sort((a, b) => {
    const dA = new Date(a.examDate || a.date || 0);
    const dB = new Date(b.examDate || b.date || 0);
    if (dA.getTime() !== dB.getTime()) return dA - dB;

    const subjA = getSubjectName(a.subject, a.name);
    const subjB = getSubjectName(b.subject, b.name);
    return subjA.localeCompare(subjB);
  });

  // Derived states for seating arrangement
  const [selectedExamName, setSelectedExamName] = useState('');
  const classExams = filteredExams;
  const uniqueExamNames = [...new Set(classExams.map(e => e.name).filter(Boolean))].sort();

  const classStudents = students.filter(s => {
    if (!selectedClassObj) return false;
    const cid = (typeof s.class === 'object' && s.class !== null ? (s.class.id || s.class._id) : null) || s.classId || s.class;
    const targetId = selectedClassObj.id || selectedClassObj._id;
    return String(cid) === String(targetId) || String(s.classId) === String(selectedClassObj.id);
  });

  const noSelection = !selectedGrade || !selectedSection || !selectedExamType;

  // Filter Bar Component
  const FilterBar = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)',
      padding: '16px 20px',
      borderRadius: '16px',
      border: '1.5px solid #E2E8F0',
      boxShadow: '0 4px 20px -2px rgba(12, 74, 134, 0.04)',
      flexWrap: 'wrap'
    }}>
      {/* Grade Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 140px', minWidth: '130px' }}>
        <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0C4A86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🎓 Select Grade
        </label>
        <select
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value);
            setSelectedSection('');
            setSelectedExamType('');
          }}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#0F172A',
            background: '#ffffff',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="">-- All Grades --</option>
          {gradeOptions.map(g => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
      </div>

      {/* Section Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 140px', minWidth: '130px' }}>
        <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0C4A86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🏫 Select Section
        </label>
        <select
          value={selectedSection}
          onChange={e => {
            setSelectedSection(e.target.value);
            setSelectedExamType('');
          }}
          disabled={!selectedGrade}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#0F172A',
            outline: 'none',
            cursor: !selectedGrade ? 'not-allowed' : 'pointer',
            background: !selectedGrade ? '#F1F5F9' : '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="">-- All Sections --</option>
          {sectionsForGrade.map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </div>

      {/* Exam Type Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 150px', minWidth: '140px' }}>
        <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0C4A86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          📝 Exam Type
        </label>
        <select
          value={selectedExamType}
          onChange={e => setSelectedExamType(e.target.value)}
          disabled={!selectedSection}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#0F172A',
            outline: 'none',
            cursor: !selectedSection ? 'not-allowed' : 'pointer',
            background: !selectedSection ? '#F1F5F9' : '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="">-- Exam Type --</option>
          {uniqueExamTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Assign Room Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 150px', minWidth: '140px' }}>
        <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#0C4A86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🚪 Assign Room
        </label>
        <select
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: '#0F172A',
            outline: 'none',
            cursor: 'pointer',
            background: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="">-- Assign Room --</option>
          {availableRooms.map(rm => (
            <option key={rm} value={rm}>{rm}</option>
          ))}
          <option value="Other">➕ Other (Custom Room)...</option>
        </select>
      </div>

      {/* Reset Action */}
      {(selectedGrade || selectedSection || selectedExamType || selectedRoom) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setSelectedGrade('');
              setSelectedSection('');
              setSelectedExamType('');
              setSelectedRoom('');
            }}
            style={{
              padding: '10px 18px',
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1.5px solid #FCA5A5',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
          >
            <span>🔄</span> Reset Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'linear-gradient(180deg, #F6F0E8 0%, #FAF6F0 50%, #F6F0E8 100%)', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Sidebar matching Login Page Light Theme & Quick Access Cards from Screenshot */}
      <div style={{
        width: '280px',
        minWidth: '280px',
        background: '#FAF6F0',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        borderRight: '1.5px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(11, 58, 120, 0.04)',
        boxSizing: 'border-box'
      }}>
        <div>
          {/* Examiner Portal Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '4px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="m9 14 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0C4A86', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Examiner</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#0096DA', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>PORTAL DASHBOARD</div>
            </div>
          </div>

          {/* Navigation Links matching Demo Quick Access Cards */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { 
                key: 'overview', 
                label: 'Dashboard', 
                sub: 'EXAMINER', 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                )
              },
              { 
                key: 'exams', 
                label: 'Exams Management', 
                sub: 'TIMETABLE & EXAMS', 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                )
              },
              { 
                key: 'invigilators', 
                label: 'Invigilators', 
                sub: 'DUTY ALLOCATION', 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )
              },
              { 
                key: 'papers', 
                label: 'Exam Papers', 
                sub: 'DISPATCH & COLLECTION', 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 12 3 3-3 3"/>
                  </svg>
                )
              },
              { 
                key: 'seating', 
                label: 'Seating', 
                sub: 'ARRANGEMENTS', 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/>
                  </svg>
                )
              },
            ].map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: isActive ? '1.5px solid #0096DA' : '1.5px solid #E2E8F0',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isActive ? '#EBF5FF' : '#FFFFFF',
                    boxShadow: isActive
                      ? '0 4px 14px rgba(12, 74, 134, 0.08)'
                      : '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#0096DA';
                      e.currentTarget.style.background = '#F8FAFC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '8px' }}>
                    <span style={{ color: isActive ? '#0096DA' : '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: isActive ? '#0C4A86' : '#0F172A', fontWeight: '700', fontSize: '0.92rem', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: isActive ? '#0096DA' : '#64748B', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', marginTop: '2px', whiteSpace: 'nowrap' }}>{item.sub}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Daily Insight Widget */}
        <div style={{
          background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
          borderRadius: '16px',
          padding: '16px 18px',
          marginTop: 'auto',
          marginBottom: '16px',
          color: '#FFFFFF',
          boxShadow: '0 8px 20px rgba(0, 150, 218, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: '800',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7DD3FC',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            DAILY INSIGHT
          </div>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: '600',
            lineHeight: '1.45',
            color: '#FFFFFF',
            fontStyle: 'italic'
          }}>
            "Great teachers are the ones who make learning feel like curiosity instead of duty."
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ paddingTop: '16px', borderTop: '1.5px solid #e2e8f0' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '50px',
              border: '1.5px solid #ef4444',
              background: '#ffffff',
              color: '#ef4444',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.color = '#ef4444';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ background: 'transparent', padding: '28px', minHeight: '100vh', flex: 1 }}>
        {/* Header Banner matching Login Page Theme */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '22px 30px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 15px 35px -10px rgba(12, 74, 134, 0.08), 0 4px 15px rgba(0,0,0,0.02)',
          border: '1.5px solid #e2e8f0',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(12, 74, 134, 0.08)', color: '#0C4A86', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Examiner Portal</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0C4A86', letterSpacing: '-0.5px' }}>
              Welcome back, {userName}!
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              Schedule exams, assign invigilators, and manage paper dispatches.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.88rem', color: '#0C4A86', fontWeight: '700', background: '#ebf5ff', border: '1px solid #0096DA', padding: '8px 18px', borderRadius: '50px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2xl" style={{ color: '#6366f1' }}></i>
          </div>
        )}

        {/* Tabs Content */}
        {!loading && (
          <>
            {/* OVERVIEW STATS TAB */}
            {activeTab === 'overview' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  {/* Today's Exams Card */}
                  <div
                    onClick={() => setActiveTab('exams')}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #F0F7FF 100%)',
                      border: '1px solid #BFDBFE',
                      borderRadius: '20px',
                      padding: '22px 22px 18px',
                      boxShadow: '0 10px 30px -5px rgba(12, 74, 134, 0.08), 0 4px 12px rgba(12, 74, 134, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 35px -8px rgba(12, 74, 134, 0.16)';
                      e.currentTarget.style.borderColor = '#0096DA';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(12, 74, 134, 0.08)';
                      e.currentTarget.style.borderColor = '#BFDBFE';
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0C4A86 0%, #0096DA 100%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(12, 74, 134, 0.25)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px',
                        background: todaysExams > 0 ? 'rgba(22, 163, 74, 0.1)' : '#F8FAFC',
                        color: todaysExams > 0 ? '#15803D' : '#64748B',
                        border: todaysExams > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #CBD5E1',
                        boxShadow: todaysExams > 0 ? '0 2px 8px rgba(34, 197, 94, 0.15)' : 'none'
                      }}>
                        {todaysExams > 0 ? '🟢 LIVE TODAY' : '⚪ NO EXAM TODAY'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '16px', marginBottom: '4px' }}>
                      Today's Schedule
                    </div>
                    <div style={{ fontSize: todaysExams > 0 ? '1.85rem' : '1.35rem', fontWeight: '800', color: '#0C4A86', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {todaysExams > 0 ? `${todaysExams} Exam${todaysExams > 1 ? 's' : ''}` : 'No Exams Today'}
                    </div>

                    {/* Progress Sparkline Visual */}
                    <div style={{ width: '100%', height: '5px', background: '#E0F2FE', borderRadius: '10px', marginTop: '14px', overflow: 'hidden' }}>
                      <div style={{ width: todaysExams > 0 ? '100%' : '0%', height: '100%', background: 'linear-gradient(90deg, #0C4A86 0%, #0096DA 100%)', borderRadius: '10px' }} />
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#0096DA', fontWeight: '700', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>View Exam Schedule</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>→</span>
                    </div>
                  </div>

                  {/* Exam Room Allocation Card */}
                  <div
                    onClick={() => setActiveTab('seating')}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '20px',
                      padding: '22px 22px 18px',
                      boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 35px -8px rgba(15, 23, 42, 0.14)';
                      e.currentTarget.style.borderColor = '#0C4A86';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(15, 23, 42, 0.06)';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0F172A 0%, #334155 100%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.25)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                          <path d="M9 3v18"></path>
                          <circle cx="14" cy="12" r="1"></circle>
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #94A3B8' }}>
                        🚪 {Math.round((availableRooms.length / (availableRooms.length + 2)) * 100)}% Allotted
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '16px', marginBottom: '4px' }}>
                      Room Allocation
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {availableRooms.length} / {availableRooms.length + 2}
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', marginLeft: '6px' }}>Rooms</span>
                    </div>

                    {/* Progress Bar Visual */}
                    <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '10px', marginTop: '14px', overflow: 'hidden' }}>
                      <div style={{ width: `${(availableRooms.length / (availableRooms.length + 2)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0F172A 0%, #475569 100%)', borderRadius: '10px' }} />
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#0F172A', fontWeight: '700', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Manage Seating & Rooms</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>→</span>
                    </div>
                  </div>

                  {/* Invigilators Assigned & Remaining Card */}
                  <div
                    onClick={() => setActiveTab('invigilators')}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #F0F9FF 100%)',
                      border: '1px solid #BAE6FD',
                      borderRadius: '20px',
                      padding: '22px 22px 18px',
                      boxShadow: '0 10px 30px -5px rgba(3, 105, 161, 0.08), 0 4px 12px rgba(3, 105, 161, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 35px -8px rgba(3, 105, 161, 0.16)';
                      e.currentTarget.style.borderColor = '#0EA5E9';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(3, 105, 161, 0.08)';
                      e.currentTarget.style.borderColor = '#BAE6FD';
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0369A1 0%, #0EA5E9 100%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(3, 105, 161, 0.25)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <polyline points="17 11 19 13 23 9"></polyline>
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px', background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC' }}>
                        👥 Invigilators
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '16px', marginBottom: '4px' }}>
                      Invigilator Duty
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0369A1', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {classExams.filter(e => e.invigilator).length} Assigned
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginLeft: '6px' }}>
                        ({Math.max(0, classExams.length - classExams.filter(e => e.invigilator).length)} Left)
                      </span>
                    </div>

                    {/* Progress Bar Visual */}
                    <div style={{ width: '100%', height: '5px', background: '#E0F2FE', borderRadius: '10px', marginTop: '14px', overflow: 'hidden' }}>
                      <div style={{ width: `${classExams.length > 0 ? (classExams.filter(e => e.invigilator).length / classExams.length) * 100 : 65}%`, height: '100%', background: 'linear-gradient(90deg, #0369A1 0%, #0EA5E9 100%)', borderRadius: '10px' }} />
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: '700', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Assign Invigilators Duty</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>→</span>
                    </div>
                  </div>

                  {/* Paper Collection Status Card */}
                  <div
                    onClick={() => setActiveTab('papers')}
                    style={{
                      background: 'linear-gradient(145deg, #ffffff 0%, #FAF5FF 100%)',
                      border: '1px solid #E9D5FF',
                      borderRadius: '20px',
                      padding: '22px 22px 18px',
                      boxShadow: '0 10px 30px -5px rgba(126, 34, 206, 0.08), 0 4px 12px rgba(126, 34, 206, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 35px -8px rgba(126, 34, 206, 0.16)';
                      e.currentTarget.style.borderColor = '#A855F7';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(126, 34, 206, 0.08)';
                      e.currentTarget.style.borderColor = '#E9D5FF';
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #7E22CE 0%, #A855F7 100%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(126, 34, 206, 0.25)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px', background: '#F3E8FF', color: '#7E22CE', border: '1px solid #D8B4FE' }}>
                        📦 Logistics Active
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '16px', marginBottom: '4px' }}>
                      Paper Collection
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#7E22CE', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {classExams.filter(e => e.paperDispatched).length} Distributed
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', marginLeft: '6px' }}>
                        ({classExams.filter(e => e.paperCollected).length} Collected)
                      </span>
                    </div>

                    {/* Progress Bar Visual */}
                    <div style={{ width: '100%', height: '5px', background: '#F3E8FF', borderRadius: '10px', marginTop: '14px', overflow: 'hidden' }}>
                      <div style={{ width: `${classExams.length > 0 ? (classExams.filter(e => e.paperCollected).length / classExams.length) * 100 : 50}%`, height: '100%', background: 'linear-gradient(90deg, #7E22CE 0%, #A855F7 100%)', borderRadius: '10px' }} />
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#7E22CE', fontWeight: '700', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Manage Paper Logistics</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>→</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#0C4A86', fontWeight: '800' }}>Today's Exam Schedule</h3>
                    <FilterBar />

                    {noSelection ? (
                      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #0096DA', marginTop: '16px' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📋</span>
                        <h4 style={{ margin: '0 0 4px', color: '#0C4A86', fontSize: '1.1rem', fontWeight: '700' }}>Filter Selection Required</h4>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>Please select Grade, Section, or Exam Type above to view the exam schedule.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '16px 0', padding: '8px 16px', background: '#EBF5FF', border: '1.5px solid #0096DA', borderRadius: '50px', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}>
                          <span>📍 Schedule for Grade {selectedGrade} - Section {selectedSection} ({selectedExamType})</span>
                        </div>
                        <table className="management-table compact">
                          <thead>
                            <tr style={{ background: '#EBF5FF', color: '#0C4A86' }}>
                              <th>Subject</th>
                              <th>Time</th>
                              <th>Room</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todaysExamsList.filter(e => {
                              if (selectedGrade && String(e.class?.grade || e.grade) !== String(selectedGrade)) return false;
                              if (selectedSection && String(e.class?.section || e.section) !== String(selectedSection)) return false;
                              return true;
                            }).length === 0 ? (
                              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No exams scheduled for the selected filters.</td></tr>
                            ) : todaysExamsList.filter(e => {
                              if (selectedGrade && String(e.class?.grade || e.grade) !== String(selectedGrade)) return false;
                              if (selectedSection && String(e.class?.section || e.section) !== String(selectedSection)) return false;
                              return true;
                            }).map(e => (
                              <tr key={e.id || e._id}>
                                <td style={{ fontWeight: '700', color: '#0C4A86' }}>{getSubjectName(e.subject, e.name)}</td>
                                <td>{e.startTime} - {e.endTime}</td>
                                <td>{e.room || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Recent Activities</h3>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>Paper distributed</span> for Grade 10 Math
                        </li>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Invigilator assigned</span>: John Doe to Grade 10 Math
                        </li>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                          <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Paper collected</span> from Room 101
                        </li>
                      </ul>
                    </div>

                    {/* Upcoming Events Card */}
                    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>📅</span>
                          <h3 style={{ margin: 0, color: '#0F172A', fontWeight: '800', fontSize: '1.05rem' }}>Upcoming Events</h3>
                        </div>
                      </div>

                      <div 
                        ref={eventsScrollRef}
                        onMouseEnter={() => setIsEventsHovered(true)}
                        onMouseLeave={() => setIsEventsHovered(false)}
                        onScroll={handleEventsScroll}
                        style={{
                          maxHeight: '230px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}
                      >
                        {scrollingEventsList.map((event, idx) => (
                          <div 
                            key={`${event.id}-${idx}`}
                            className="examiner-event-item"
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '12px 14px',
                              background: (idx % upcomingEventsList.length === activeEventIndex) ? '#EBF5FF' : '#F8FAFC',
                              borderRadius: '12px',
                              border: (idx % upcomingEventsList.length === activeEventIndex) ? '1.5px solid #0096DA' : '1px solid #E2E8F0',
                              transition: 'all 0.3s ease',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: event.color, marginTop: '5px', flexShrink: 0 }}></span>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>{event.title}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>{event.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EXAMS MANAGEMENT TAB */}
            {activeTab === 'exams' && (
              <ExamManagement />
            )}

            {/* INVIGILATORS TAB */}
            {activeTab === 'invigilators' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <FilterBar />

                {noSelection ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📋</span>
                    <h4 style={{ margin: '0 0 4px', color: '#334155', fontSize: '1.05rem', fontWeight: '700' }}>Filters Required</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>Please select Grade, Section, and Exam Type to view and manage allocations.</p>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No exams found for the selected filters.</p>
                ) : (
                  <>
                    {(() => {
                      // Check if all filtered exams share the exact same start & end time
                      const firstExamTime = filteredExams[0] ? `${filteredExams[0].startTime || '09:00'} - ${filteredExams[0].endTime || '11:00'}` : null;
                      const isTimeSameForAll = filteredExams.length > 0 && filteredExams.every(e => `${e.startTime || '09:00'} - ${e.endTime || '11:00'}` === firstExamTime);

                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#EBF5FF', border: '1.5px solid #0096DA', borderRadius: '50px', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}>
                              <span>📍 Invigilation Duty for Grade {selectedGrade} - Section {selectedSection} ({selectedExamType})</span>
                            </div>

                            {isTimeSameForAll && firstExamTime && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '50px', color: '#166534', fontWeight: '800', fontSize: '0.88rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>Session Time: {firstExamTime} (Uniform Shift)</span>
                              </div>
                            )}

                            <button
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                                borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem',
                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 150, 218, 0.25)', marginLeft: 'auto'
                              }}
                              onClick={() => handleExportInvigilatorPDF(filteredExams)}
                            >
                              📄 Export PDF
                            </button>
                          </div>

                          <table className="management-table compact">
                            <thead>
                              <tr style={{ background: '#EBF5FF', color: '#0C4A86' }}>
                                <th>Room</th>
                                <th>Subject</th>
                                <th>Date</th>
                                {!isTimeSameForAll && <th>Time</th>}
                                <th>Assigned Teacher</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredExams.map(exam => {
                                const invNode = exam.invigilator;
                                const invUser = invNode && (invNode.user || invNode.userId);
                                const invName = invUser
                                  ? `${invUser.firstName || ''} ${invUser.lastName || ''}`.trim() || null
                                  : null;

                                return (
                                  <tr key={exam.id || exam._id}>
                                    <td style={{ fontWeight: '800', color: '#0C4A86' }}>{exam.room || 'Room 101'}</td>
                                    <td style={{ fontWeight: '700', color: '#1E293B' }}>{getSubjectName(exam.subject, exam.name)}</td>
                                    <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                                    {!isTimeSameForAll && <td>{exam.startTime || '09:00'} - {exam.endTime || '11:00'}</td>}
                                    <td>{invName || '—'}</td>
                                    <td>
                                      {invName ? (
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a' }}>Completed</span>
                                      ) : (
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#fee2e2', color: '#dc2626' }}>Not Assigned</span>
                                      )}
                                    </td>
                                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                      <button style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '50px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 158, 242, 0.25)', whiteSpace: 'nowrap' }} onClick={() => { setSelectedExam(exam); setShowAssignModal(true); }}>
                                        {invName ? 'Change Teacher' : 'Assign Teacher'}
                                      </button>
                                      <button
                                        style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: '700', background: '#ffffff', color: '#0C4A86', border: '1.5px solid #0096DA', borderRadius: '50px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        onClick={() => { setDutyExam(exam); setShowDutyModal(true); }}
                                      >
                                        View Duty
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* PAPERS TAB */}
            {activeTab === 'papers' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', width: '100%', overflowX: 'hidden' }}>
                <h3 style={{ margin: '0 0 20px', color: '#0C4A86', fontWeight: '800' }}>Manage Exam Paper Logistics</h3>
                <FilterBar />

                {noSelection ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📋</span>
                    <h4 style={{ margin: '0 0 4px', color: '#334155', fontSize: '1.05rem', fontWeight: '700' }}>Filters Required</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>Please select Grade, Section, and Exam Type to view and manage paper logistics.</p>
                  </div>
                ) : filteredExams.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No exams found for the selected filters.</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#EBF5FF', border: '1.5px solid #0096DA', borderRadius: '50px', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}>
                        <span>📍 Paper Logistics for Grade {selectedGrade} - Section {selectedSection} ({selectedExamType})</span>
                      </div>
                      <button
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                          background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                          borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem',
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 150, 218, 0.25)'
                        }}
                        onClick={() => handleExportPaperPDF(filteredExams)}
                      >
                        📄 Export PDF
                      </button>
                    </div>
                    <table className="management-table compact" style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto', tableLayout: 'auto' }}>
                      <thead>
                        <tr style={{ background: '#EBF5FF', color: '#0C4A86' }}>
                          <th style={{ padding: '14px 14px', verticalAlign: 'middle', fontSize: '0.88rem', fontWeight: '800' }}>Subject</th>
                          <th style={{ padding: '14px 14px', verticalAlign: 'middle', fontSize: '0.88rem', fontWeight: '800' }}>Room</th>
                          <th style={{ padding: '14px 14px', verticalAlign: 'middle', fontSize: '0.88rem', fontWeight: '800' }}>Breakdown</th>
                          <th style={{ padding: '14px 14px', verticalAlign: 'middle', fontSize: '0.88rem', fontWeight: '800' }}>Status</th>
                          <th style={{ padding: '14px 14px', verticalAlign: 'middle', fontSize: '0.88rem', fontWeight: '800', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExams.map(exam => {
                          const examId = exam.id || exam._id;
                          const invNode = exam.invigilator;
                          const invUser = invNode && (invNode.user || invNode.userId);
                          const resolvedTeacher = invUser
                            ? `${invUser.firstName || ''} ${invUser.lastName || ''}`.trim()
                            : (typeof invNode === 'object' && invNode?.name ? invNode.name : getExamTeacher(exam));

                          const assignedTeacherName = (resolvedTeacher && resolvedTeacher !== 'Unassigned') ? resolvedTeacher : 'Ramesh Sharma';

                          const distBy = exam.paperDispatched ? assignedTeacherName : null;
                          const colBy = exam.paperCollected ? assignedTeacherName : null;
                          
                          const breakdown = gradeBreakdowns[examId] || [
                            { grade: 'Grade 10', total: 12, collected: exam.paperCollected ? 12 : 10 },
                            { grade: 'Grade 6', total: 14, collected: exam.paperCollected ? 14 : 13 },
                            { grade: 'Grade 3', total: 10, collected: exam.paperCollected ? 10 : 9 }
                          ];
                          const totalExpected = breakdown.reduce((sum, g) => sum + g.total, 0);
                          const totalCollected = breakdown.reduce((sum, g) => sum + g.collected, 0);
                          const totalAbsent = totalExpected - totalCollected;

                          return (
                            <tr key={exam._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                              <td style={{ padding: '16px 14px', verticalAlign: 'middle', fontWeight: '800', color: '#0C4A86', fontSize: '0.94rem', whiteSpace: 'nowrap' }}>{getSubjectName(exam.subject, exam.name)}</td>
                              <td style={{ padding: '16px 14px', verticalAlign: 'middle', fontWeight: '700', color: '#334155', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{exam.room || 'Room 101'}</td>
                              <td style={{ padding: '16px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0C4A86' }}>{totalCollected}/{totalExpected} Collected</span>
                                  {totalAbsent > 0 ? (
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#E11D48' }}>
                                      ⚠️ {totalAbsent} Absent
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#16A34A' }}>
                                      ✓ All Present
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem' }}>
                                  <div>
                                    <span style={{ fontWeight: '700', color: '#64748B' }}>Dist: </span>
                                    {exam.paperDispatched ? (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', fontWeight: '800' }}>✓ {distBy}</span>
                                    ) : (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FFEDD5', color: '#EA580C', fontWeight: '800' }}>Pending</span>
                                    )}
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: '700', color: '#64748B' }}>Coll: </span>
                                    {exam.paperCollected ? (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', fontWeight: '800' }}>✓ {colBy}</span>
                                    ) : (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FFEDD5', color: '#EA580C', fontWeight: '800' }}>Pending</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                  {!exam.paperDispatched && (
                                    <button style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '50px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 158, 242, 0.25)', whiteSpace: 'nowrap' }} onClick={() => toggleDispatch(exam)}>
                                      Distributed
                                    </button>
                                  )}
                                  <button
                                    style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', borderRadius: '50px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 158, 242, 0.25)', whiteSpace: 'nowrap' }}
                                    onClick={() => openReconcileModal(exam)}
                                  >
                                    {exam.paperCollected ? 'Breakdown' : 'Collect Papers'}
                                  </button>
                                  <button
                                    style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', background: '#ffffff', color: '#0C4A86', border: '1.5px solid #0096DA', borderRadius: '50px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    onClick={() => { setHistoryExam(exam); setShowHistoryModal(true); }}
                                  >
                                    History
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* ── SEATING ARRANGEMENT ───────────────────────────────── */}
            {activeTab === 'seating' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', width: '100%', overflowX: 'hidden' }}>
                
                {/* Executive Setup Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0F172A', fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>🏛️</span> Exam Room & Seating Arrangement Setup
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748B', fontWeight: '500' }}>
                      Configure exam hall, seated classes, exam types, and invigilator assignment in 5 easy steps.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#15803D', background: '#F0FDF4', padding: '6px 14px', borderRadius: '50px', border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#22C55E' }}></span> Anti-Cheating Interleave Active
                  </span>
                </div>

                {/* 4-Column Equal Height Grid for Steps 1, 2, 3, 4 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '20px', alignItems: 'stretch' }}>
                  
                  {/* Step 1: Select Exam Hall */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#0C4A86', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>STEP 1</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>Select Exam Hall</span>
                      </div>
                      <select
                        value={selectedRoom || 'Room 101'}
                        onChange={e => {
                          setSelectedRoom(e.target.value);
                          setShowSeating(true);
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: '#ffffff', cursor: 'pointer' }}
                      >
                        {availableRooms.map(rm => (
                          <option key={rm} value={rm}>🚪 {rm}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.74rem', color: '#64748B', fontWeight: '600' }}>
                      📍 Capacity: 30 Benches (60 Seats)
                    </div>
                  </div>

                  {/* Step 2: Pick Seated Classes */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#0096DA', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>STEP 2</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>Seated Classes</span>
                        </div>
                        <select
                          value={numClassesToMix}
                          onChange={e => {
                            const count = Number(e.target.value);
                            setNumClassesToMix(count);
                            const active = classSlots.slice(0, count).map(c => c.split(' - ')[0]).filter(Boolean);
                            if (active.length) setSelectedSeatedGrades(active);
                            setShowSeating(true);
                          }}
                          style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #94A3B8', fontSize: '0.72rem', fontWeight: '800', color: '#0C4A86', background: '#ffffff', cursor: 'pointer' }}
                        >
                          <option value={1}>1 Class</option>
                          <option value={2}>2 Classes</option>
                          <option value={3}>3 Classes</option>
                          <option value={4}>4 Classes</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array.from({ length: numClassesToMix }).map((_, idx) => {
                          const slotColors = ['#0C4A86', '#0096DA', '#10B981', '#8B5CF6'];
                          const currentVal = classSlots[idx] || `Grade ${10 - idx * 2} - Sec A`;
                          const allClassOptions = classes.length > 0
                            ? classes.map(c => `Grade ${c.grade} - Sec ${c.section || 'A'}`)
                            : ['Grade 10 - Sec A', 'Grade 10 - Sec B', 'Grade 9 - Sec A', 'Grade 8 - Sec A', 'Grade 7 - Sec A', 'Grade 6 - Sec A', 'Grade 6 - Sec B', 'Grade 5 - Sec A', 'Grade 4 - Sec A', 'Grade 3 - Sec A', 'Grade 2 - Sec A', 'Grade 1 - Sec A'];

                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ffffff', background: slotColors[idx % slotColors.length], padding: '3px 6px', borderRadius: '4px', minWidth: '48px', textAlign: 'center' }}>
                                Class {idx + 1}
                              </span>
                              <select
                                value={currentVal}
                                onChange={e => {
                                  const val = e.target.value;
                                  const updatedSlots = [...classSlots];
                                  updatedSlots[idx] = val;
                                  setClassSlots(updatedSlots);
                                  const active = updatedSlots.slice(0, numClassesToMix).map(c => c.split(' - ')[0]).filter(Boolean);
                                  if (active.length) setSelectedSeatedGrades(active);
                                  setShowSeating(true);
                                }}
                                style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: '#ffffff', cursor: 'pointer' }}
                              >
                                {allClassOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Grade Exam Types */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#10B981', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>STEP 3</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>Grade Exam Types</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedSeatedGrades.map((g) => (
                          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#334155', background: '#E2E8F0', padding: '3px 6px', borderRadius: '4px', minWidth: '54px', textAlign: 'center' }}>
                              {g}
                            </span>
                            <select
                              value={gradeExamTypes[g] || 'Annual Exam'}
                              onChange={e => setGradeExamTypes({ ...gradeExamTypes, [g]: e.target.value })}
                              style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: '#ffffff', cursor: 'pointer' }}
                            >
                              {comprehensiveExamTypesList.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Room Invigilator */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#8B5CF6', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>STEP 4</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>Room Invigilator</span>
                      </div>

                      <select
                        value={roomInvigilator}
                        onChange={e => {
                          const val = e.target.value;
                          setRoomInvigilator(val);
                          showNotification(`Assigned ${val} as Invigilator for ${selectedRoom || 'Room 101'}!`);
                        }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #8B5CF6', fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: '#ffffff', cursor: 'pointer' }}
                      >
                        {(teachers.length > 0
                          ? teachers.map(t => `${t.user?.firstName || t.userId?.firstName || 'Teacher'} ${t.user?.lastName || t.userId?.lastName || ''}`.trim())
                          : ['Ramesh Sharma (Mathematics)', 'Priya Verma (Physics)', 'Sunil Kumar (Chemistry)', 'Anjali Gupta (English)', 'Vikram Singh (Social Science)', 'Kavita Patel (Biology)']
                        ).map(tName => (
                          <option key={tName} value={tName}>👤 {tName}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '0.72rem', fontWeight: '800', color: '#15803D', background: '#DCFCE7', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #86EFAC' }}>
                      ✓ Assigned to {selectedRoom || 'Room 101'}
                    </div>
                  </div>

                </div>

                {/* Step 5: Seating Shuffle Control Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F1F5F9', padding: '12px 20px', borderRadius: '12px', border: '1px solid #CBD5E1', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#0F172A', color: '#ffffff', fontSize: '0.72rem', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>STEP 5</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>Seating Arrangement Control</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>(Click any seat below to Swap manually, OR click Smart Shuffle)</span>
                  </div>
                  <button
                    onClick={() => {
                      setShuffleTrigger(prev => prev + 1);
                      setShowSeating(true);
                      showNotification('🔀 Smart Anti-Cheating Seating Shuffled & Re-Interleaved!');
                    }}
                    style={{
                      padding: '9px 22px',
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(12, 74, 134, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🔀</span> Smart Anti-Cheating Shuffle
                  </button>
                </div>

                {(() => {
                    const selectedExam = classExams.find(e => e.name === selectedExamName);
                    const roomName = selectedExam?.room || 'N/A';
                    const examDateStr = selectedExam?.date ? new Date(selectedExam.date).toLocaleDateString() : 'N/A';
                    const examTimeStr = selectedExam?.startTime && selectedExam?.endTime ? `${selectedExam.startTime} - ${selectedExam.endTime}` : selectedExam?.time || 'N/A';
                    const teacherName = selectedExam ? getExamTeacher(selectedExam) : 'Unassigned';

                    const activeStudents = classStudents.length > 0 ? classStudents : (students.length > 0 ? students : demoExams);

                    const totalRoomCapacity = 60; // 30 benches x 2 seats
                    const assignedInRoom = Math.min(totalRoomCapacity, activeStudents.length > 0 ? activeStudents.length : 60);
                    const emptySeatsCount = Math.max(0, totalRoomCapacity - assignedInRoom);

                    // Sort students based on selected method
                    const sortedStudents = [...activeStudents].sort((a, b) => {
                      if (sortMethod === 'firstName') {
                        const nA = a.userId?.firstName || '';
                        const nB = b.userId?.firstName || '';
                        return nA.localeCompare(nB);
                      }
                      if (sortMethod === 'lastName') {
                        const nA = a.userId?.lastName || '';
                        const nB = b.userId?.lastName || '';
                        return nA.localeCompare(nB);
                      }
                      // Default to rollNumber
                      const rA = String(a.rollNumber || '');
                      const rB = String(b.rollNumber || '');
                      return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    return (
                      <div>
                        {/* Exam Seating Info Header Card */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '16px',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          marginBottom: '24px'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Exam Session Info</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              {selectedExamName || 'Annual Board Examination'} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>({selectedSeatedGrades.join(' + ')})</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Room</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0C4A86', marginTop: '4px' }}>🚪 {selectedRoom || roomName || 'Room 101'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Seated Grades</div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {selectedSeatedGrades.map(g => (
                                <span key={g} style={{ padding: '3px 10px', borderRadius: '50px', background: '#EBF5FF', color: '#0C4A86', fontSize: '0.78rem', fontWeight: '800', border: '1px solid #0096DA' }}>
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Time & Invigilator</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              ⏱ {examTimeStr !== 'N/A' ? examTimeStr : '09:00 AM - 12:00 PM'} | 👤 {roomInvigilator || (teacherName !== 'Unassigned' ? teacherName : 'Ramesh Sharma')}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Capacity Details</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              <span style={{ color: '#10b981' }}>👥 {assignedInRoom} assigned</span> / {totalRoomCapacity} seats (30 benches)
                              <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px', fontWeight: 'normal' }}>({emptySeatsCount} empty seats)</span>
                            </div>
                          </div>
                        </div>

                        {/* Search Bar for student seat locator */}
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>Seat Locator:</span>
                          <input
                            type="text"
                            placeholder="Search student by name or roll no..."
                            value={seatingSearch}
                            onChange={e => setSeatingSearch(e.target.value)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '0.9rem',
                              width: '280px',
                              outline: 'none',
                            }}
                          />
                          {seatingSearch && (
                            <button
                              onClick={() => setSeatingSearch('')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.88rem'
                              }}
                            >
                              Clear
                            </button>
                          )}
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                                borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                                cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 150, 218, 0.25)'
                              }}
                              onClick={() => setShowAddManualBenchModal(true)}
                              title="Enter student & bench details to manually assign benches"
                            >
                              ✍️ Enter Bench Details
                            </button>

                            <button
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                                borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                                cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 150, 218, 0.25)'
                              }}
                              onClick={() => {
                                setIsRandomized(true);
                                setRandomSeed(Date.now());
                                showNotification('Auto-assigned remaining students across remaining benches with anti-cheating pattern!');
                              }}
                            >
                              🎲 Auto-Fill Remaining
                            </button>

                            <button
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                                borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                                cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 150, 218, 0.25)'
                              }}
                              onClick={() => {
                                setIsRandomized(false);
                                setBenchAssignments({});
                                setManualFixedStudents({});
                                showNotification('Reset seating layout to default roll order!');
                              }}
                            >
                              🔄 Reset Layout
                            </button>

                            <button
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none',
                                borderRadius: '50px', color: '#ffffff', fontWeight: '800', fontSize: '0.82rem',
                                cursor: 'pointer', boxShadow: '0 4px 14px rgba(0, 150, 218, 0.25)'
                              }}
                              onClick={() => handleExportSeatingPDF(classStudents)}
                            >
                              📄 Export PDF
                            </button>
                          </div>
                        </div>

                        {/* ZERO-SCROLL BENCH RANGE SEGMENT TABS */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', color: '#0C4A86', fontWeight: '800', marginRight: '4px' }}>Classroom View:</span>
                          <button
                            onClick={() => setBenchRange('front')}
                            style={{
                              padding: '6px 16px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                              background: benchRange === 'front' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#ffffff',
                              color: benchRange === 'front' ? '#ffffff' : '#0C4A86',
                              border: '1.5px solid #0096DA',
                              boxShadow: benchRange === 'front' ? '0 4px 12px rgba(0, 150, 218, 0.25)' : 'none'
                            }}
                          >
                            🎯 Front Rows (#1–#10)
                          </button>
                          <button
                            onClick={() => setBenchRange('middle')}
                            style={{
                              padding: '6px 16px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                              background: benchRange === 'middle' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#ffffff',
                              color: benchRange === 'middle' ? '#ffffff' : '#0C4A86',
                              border: '1.5px solid #0096DA',
                              boxShadow: benchRange === 'middle' ? '0 4px 12px rgba(0, 150, 218, 0.25)' : 'none'
                            }}
                          >
                            🥈 Middle Rows (#11–#20)
                          </button>
                          <button
                            onClick={() => setBenchRange('back')}
                            style={{
                              padding: '6px 16px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                              background: benchRange === 'back' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#ffffff',
                              color: benchRange === 'back' ? '#ffffff' : '#0C4A86',
                              border: '1.5px solid #0096DA',
                              boxShadow: benchRange === 'back' ? '0 4px 12px rgba(0, 150, 218, 0.25)' : 'none'
                            }}
                          >
                            🥉 Back Rows (#21–#30)
                          </button>
                          <button
                            onClick={() => setBenchRange('all')}
                            style={{
                              padding: '6px 16px', borderRadius: '50px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                              background: benchRange === 'all' ? 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)' : '#ffffff',
                              color: benchRange === 'all' ? '#ffffff' : '#0C4A86',
                              border: '1.5px solid #0096DA',
                              boxShadow: benchRange === 'all' ? '0 4px 12px rgba(0, 150, 218, 0.25)' : 'none'
                            }}
                          >
                            👁️ View All (30 Benches)
                          </button>
                        </div>

                        {/* Visual Seating Plan */}
                        <div style={{
                          border: '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '20px 16px',
                          background: '#f8fafc',
                          position: 'relative'
                        }}>
                          {/* Anti-Cheating Mode Banner */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: '#F0FDF4',
                            border: '1.5px solid #86EFAC',
                            borderRadius: '50px',
                            padding: '6px 18px',
                            marginBottom: '16px',
                            color: '#166534',
                            fontSize: '0.8rem',
                            fontWeight: '800'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>Anti-Cheating Seating Active:</span>
                            <span style={{ color: '#15803D' }}>Click any student seat to manually assign or swap bench!</span>
                          </div>

                          {/* Blackboard representation */}
                          <div style={{
                            width: '50%',
                            margin: '0 auto 20px',
                            background: '#0C4A86',
                            color: '#ffffff',
                            textAlign: 'center',
                            padding: '8px',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            letterSpacing: '0.1em',
                            boxShadow: '0 4px 12px rgba(12, 74, 134, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            <span>FRONT / BLACKBOARD</span>
                          </div>

                          {/* Anti-Cheating Multi-Grade Bench-Wise Seating Lanes */}
                          {(() => {
                            const benchCapacity = studentsPerBench; // 2 or 3 students per bench
                            const gradesList = selectedSeatedGrades.length > 0 ? selectedSeatedGrades : ['Grade 10', 'Grade 6', 'Grade 3'];
                            const gradeColors = {
                              'Grade 10': { bg: '#EBF5FF', color: '#0C4A86', border: '#0096DA' },
                              'Grade 9': { bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' },
                              'Grade 8': { bg: '#E0E7FF', color: '#4338CA', border: '#A5B4FC' },
                              'Grade 7': { bg: '#FFE4E6', color: '#BE123C', border: '#FDA4AF' },
                              'Grade 6': { bg: '#F3E8FF', color: '#7E22CE', border: '#D8B4FE' },
                              'Grade 5': { bg: '#FFEDD5', color: '#C2410C', border: '#FDBA74' },
                              'Grade 4': { bg: '#ECFDF5', color: '#047857', border: '#6EE7B7' },
                              'Grade 3': { bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
                              'Grade 2': { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
                              'Grade 1': { bg: '#FDF4FF', color: '#A21CAF', border: '#F0ABFC' }
                            };

                            // Interleave students from different grades side-by-side on each bench
                            const fullClassroomStudents = [...sortedStudents];
                            // Fill up to 60 seats (30 benches) for full classroom layout visualization
                            if (fullClassroomStudents.length < 60) {
                              const existingCount = fullClassroomStudents.length;
                              for (let i = existingCount + 1; i <= 60; i++) {
                                fullClassroomStudents.push({
                                  id: `mock-std-${i}`,
                                  rollNumber: `${i}`,
                                  userId: { firstName: `Student`, lastName: `#${i}` }
                                });
                              }
                            }

                            const interleavedStudents = fullClassroomStudents.slice(0, 60).map((s, index) => {
                              const assignedGrade = gradesList[index % gradesList.length];
                              const rollPrefix = assignedGrade.replace('Grade ', 'G');
                              const rollNumStr = String(s.rollNumber || index + 1).replace(/^G\d+-/i, '');
                              return {
                                ...s,
                                seatGrade: assignedGrade,
                                displayRoll: `${rollPrefix}-${rollNumStr.padStart(3, '0')}`
                              };
                            });

                            const totalBenchesList = [];
                            for (let i = 0; i < interleavedStudents.length; i += benchCapacity) {
                              const benchNumber = Math.floor(i / benchCapacity) + 1;
                              totalBenchesList.push({
                                benchId: benchNumber,
                                students: interleavedStudents.slice(i, i + benchCapacity)
                              });
                            }

                            // Filter benches based on zero-scroll segment selection
                            const filteredBenchesList = totalBenchesList.filter(b => {
                              if (benchRange === 'front') return b.benchId <= 10;
                              if (benchRange === 'middle') return b.benchId > 10 && b.benchId <= 20;
                              if (benchRange === 'back') return b.benchId > 20 && b.benchId <= 30;
                              return true;
                            });

                            const numColumns = 4; // 4 Lanes (Lane A, Lane B, Lane C, Lane D)
                            const colLetters = ['Lane A', 'Lane B', 'Lane C', 'Lane D'];
                            const columnsData = Array.from({ length: numColumns }, () => []);

                            filteredBenchesList.forEach((benchObj, bIdx) => {
                              const colIndex = bIdx % numColumns;
                              columnsData[colIndex].push(benchObj);
                            });

                            return (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
                                gap: '18px',
                                width: '100%',
                                margin: '0 auto'
                              }}>
                                {columnsData.map((colBenches, colIdx) => {
                                  const colLetter = colLetters[colIdx] || `Lane ${colIdx + 1}`;

                                  return (
                                    <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1.5px solid #E2E8F0', minWidth: '240px' }}>
                                      {/* Column Banner */}
                                      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', borderRadius: '10px', padding: '8px 12px', fontWeight: '800', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.15)' }}>
                                        <span>📍 {colLetter} ({colBenches.length} Benches)</span>
                                      </div>

                                      {/* Benches Stacked Vertically in this Column */}
                                      {colBenches.map((bItem) => {
                                        return (
                                          <div
                                            key={bItem.benchId}
                                            style={{
                                              background: '#ffffff',
                                              border: '1.5px solid #CBD5E1',
                                              borderRadius: '14px',
                                              padding: '12px',
                                              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
                                            }}
                                          >
                                            {/* Bench Header Tag */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '6px' }}>
                                              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                                                Bench #{benchAssignments[bItem.benchId] ? `${bItem.benchId}*` : bItem.benchId}
                                              </span>
                                              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0C4A86', background: '#EBF5FF', padding: '3px 10px', borderRadius: '50px', border: '1px solid #93C5FD' }}>
                                                {bItem.students.length} Seated
                                              </span>
                                            </div>

                                            {/* Side-by-Side Interleaved Seats on this Bench */}
                                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${benchCapacity}, 1fr)`, gap: '8px' }}>
                                              {bItem.students.map((student, sIdx) => {
                                                const fullName = `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim() || 'Student';
                                                const roll = student.displayRoll || 'N/A';
                                                const gradeTag = student.seatGrade || 'Grade 10';
                                                const styleTheme = gradeColors[gradeTag] || gradeColors['Grade 10'];

                                                const matchesSearch = seatingSearch
                                                  ? fullName.toLowerCase().includes(seatingSearch.toLowerCase()) ||
                                                    roll.toLowerCase().includes(seatingSearch.toLowerCase())
                                                  : false;

                                                return (
                                                  <div
                                                    key={student._id || student.id || sIdx}
                                                    onClick={() => {
                                                      setBenchAssignStudent(student);
                                                      setTargetBenchId(bItem.benchId);
                                                      setShowBenchAssignModal(true);
                                                    }}
                                                    style={{
                                                      background: matchesSearch ? '#FEF08A' : styleTheme.bg,
                                                      border: matchesSearch ? '2px solid #EAB308' : `1.5px solid ${styleTheme.border}`,
                                                      borderRadius: '10px',
                                                      padding: '10px 8px',
                                                      textAlign: 'center',
                                                      cursor: 'pointer',
                                                      transition: 'transform 0.15s ease, boxShadow 0.15s ease',
                                                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    title="Click to assign or swap bench for this student"
                                                  >
                                                    {/* Grade Badge */}
                                                    <span style={{
                                                      display: 'inline-block',
                                                      padding: '2px 8px',
                                                      borderRadius: '50px',
                                                      fontSize: '0.68rem',
                                                      fontWeight: '800',
                                                      background: '#ffffff',
                                                      color: styleTheme.color,
                                                      border: `1px solid ${styleTheme.border}`,
                                                      marginBottom: '3px'
                                                    }}>
                                                      {gradeTag}
                                                    </span>

                                                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: styleTheme.color, display: 'block' }}>
                                                      {roll}
                                                    </span>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E293B', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                      {fullName}
                                                    </span>
                                                    <span style={{ fontSize: '0.68rem', color: '#0C4A86', fontWeight: '800', background: '#ffffff', padding: '2px 8px', borderRadius: '50px', border: '1px solid #93C5FD', display: 'inline-block', marginTop: '4px' }}>
                                                      ✏️ Swap
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* ASSIGNMENT MODAL (Recommended Teachers workload sort) */}
      {showAssignModal && selectedExam && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '640px',
            width: '92%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedExam(null);
              }}
              style={{
                position: 'absolute', top: '14px', right: '16px', background: 'none',
                border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8'
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Invigilator Duty Allocation
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Assign Teacher to: {selectedExam.name}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Class {selectedExam.class?.grade ? `Grade ${selectedExam.class.grade} - Section ${selectedExam.class.section}` : selectedExam.class?.name || 'N/A'} • {selectedExam.subject?.name || selectedExam.name || 'N/A'} • {new Date(selectedExam.examDate).toLocaleDateString()}
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#475569',
              lineHeight: '1.5'
            }}>
              💡 <strong>Workload Ranking:</strong> Teachers are sorted with the lowest teaching load first (fewest classes assigned). Recommend choosing top teachers with 0 or 1 assigned classes.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getRecommendedTeachers().map((teacher, index) => {
                const userObj = (typeof teacher.user === 'object' && teacher.user !== null)
                  ? teacher.user
                  : (typeof teacher.userId === 'object' && teacher.userId !== null)
                    ? teacher.userId
                    : null;

                const tName = userObj
                  ? `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim()
                  : teacher.name || (teacher.employeeId ? `Teacher #${teacher.employeeId}` : `Teacher #${teacher.id || teacher._id}`);

                const classCount = teacher.calculatedWorkload !== undefined ? teacher.calculatedWorkload : (teacher.assignedClasses?.length || 0);
                const teacherId = teacher.id || teacher._id;
                
                // Recommend top teachers with low workload (0 or 1 class)
                const isRecommended = classCount <= 1;

                // Color theme for workload badge
                const workloadBg = classCount === 0 ? '#DCFCE7' : classCount === 1 ? '#DCFCE7' : classCount === 2 ? '#EBF5FF' : classCount === 3 ? '#FEF3C7' : '#FEE2E2';
                const workloadColor = classCount === 0 ? '#15803D' : classCount === 1 ? '#15803D' : classCount === 2 ? '#0C4A86' : classCount === 3 ? '#B45309' : '#991B1B';

                return (
                  <div
                    key={teacherId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: isRecommended ? '1.5px solid #0096DA' : '1px solid #e2e8f0',
                      background: isRecommended ? '#F8FAFC' : '#ffffff',
                      boxShadow: isRecommended ? '0 4px 12px rgba(0, 150, 218, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.94rem', color: '#0F172A' }}>{tName}</span>
                        {isRecommended && (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '50px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            background: '#FEF3C7',
                            color: '#B45309',
                            border: '1px solid #FDE68A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#B45309"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            <span>Recommend</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>
                        Main Subject: {teacher.subject?.name || teacher.subject || 'General'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          color: workloadColor,
                          background: workloadBg,
                          padding: '4px 12px',
                          borderRadius: '50px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          Workload: {classCount} class{classCount !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <button
                        style={{
                          padding: '6px 18px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          borderRadius: '50px',
                          background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(20, 158, 242, 0.25)',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => assignInvigilator(teacherId)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW DUTY DETAILS MODAL */}
      {showDutyModal && dutyExam && (() => {
        const invNode = dutyExam.invigilator;
        const invName = invNode && (invNode.user || invNode.userId)
          ? `${invNode.user?.firstName || invNode.userId?.firstName || ''} ${invNode.user?.lastName || invNode.userId?.lastName || ''}`.trim()
          : null;
        const invEmail = invNode?.user?.email || invNode?.userId?.email || 'N/A';
        const invPhone = invNode?.user?.phone || invNode?.userId?.phone || 'N/A';

        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '20px', padding: '32px', maxWidth: '640px',
              width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              position: 'relative', border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => { setShowDutyModal(false); setDutyExam(null); }}
                style={{
                  position: 'absolute', top: '18px', right: '20px', background: '#f1f5f9',
                  border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                  fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', background: '#e0e7ff',
                  color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Invigilation Duty Slip
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                    {dutyExam.subject?.name || dutyExam.name || 'Examination Duty'}
                  </h3>
                </div>
              </div>

              {/* Duty Overview Card */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px',
                padding: '16px', marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Class & Section</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                    Grade {dutyExam.class?.grade || 'N/A'} - Section {dutyExam.class?.section || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Exam Type</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                    {dutyExam.examType || 'Mid-Term'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Exam Date</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                    {new Date(dutyExam.examDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Timing & Room</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#6366f1' }}>
                    {dutyExam.startTime || '09:00'} - {dutyExam.endTime || '11:00'} • {dutyExam.room || 'Room 101'}
                  </span>
                </div>
              </div>

              {/* Assigned Teacher Card */}
              <div style={{
                background: invName ? '#f0fdf4' : '#fff1f2',
                border: `1px solid ${invName ? '#bbf7d0' : '#fecdd3'}`,
                borderRadius: '14px', padding: '18px', marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: invName ? '#166534' : '#9f1239' }}>
                    Assigned Invigilator
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                    background: invName ? '#dcfce7' : '#ffe4e6', color: invName ? '#15803d' : '#e11d48'
                  }}>
                    {invName ? '✔ Assigned' : '⚠ Pending Assignment'}
                  </span>
                </div>
                {invName ? (
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{invName}</h4>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
                      <span>✉ {invEmail}</span>
                      <span>📞 {invPhone}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#9f1239' }}>
                    No teacher has been assigned to invigilate this exam yet. Click "Assign Teacher" below to assign one.
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '24px' }}>
                <h5 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span>Invigilator Duty Guidelines</span>
                </h5>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#64748b', lineHeight: '1.6' }}>
                  <li>Report to the Examination Control Room 20 minutes prior to exam start time.</li>
                  <li>Collect sealed question papers and official answer booklets.</li>
                  <li>Verify student ID cards and enforce strict seating arrangements.</li>
                  <li>Collect and count all answer scripts before allowing students to leave.</li>
                </ul>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  className="action-btn-secondary"
                  style={{ padding: '10px 18px', borderRadius: '10px', fontWeight: '600', fontSize: '0.88rem' }}
                  onClick={() => { setShowDutyModal(false); setDutyExam(null); }}
                >
                  Close
                </button>
                <button
                  className="action-btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem' }}
                  onClick={() => {
                    setSelectedExam(dutyExam);
                    setShowDutyModal(false);
                    setShowAssignModal(true);
                  }}
                >
                  {invName ? 'Change Teacher' : 'Assign Teacher'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PAPER LOGISTICS HISTORY AUDIT MODAL */}
      {showHistoryModal && historyExam && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '580px',
            width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            position: 'relative', border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => { setShowHistoryModal(false); setHistoryExam(null); }}
              style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '0.75rem', color: '#0096DA', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Paper Audit Trail & History
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0C4A86' }}>
                {getSubjectName(historyExam.subject, historyExam.name)} Paper Audit History
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                {historyExam.room || 'Room 101'} • Grade {selectedGrade || '10'} • {new Date(historyExam.examDate || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Event 1: Schedule Created */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0096DA', flexShrink: 0, fontWeight: '800', fontSize: '1rem' }}>
                  📋
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0C4A86' }}>Exam & Paper Serial Code Generated</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    Paper bundle #EX-{historyExam.id ? historyExam.id.toString().slice(-4) : '1084'} allocated to {historyExam.room || 'Room 101'}.
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0096DA', marginTop: '4px', fontWeight: '700' }}>08:30 AM • Control Room Logistics</div>
                </div>
              </div>

              {/* Event 2: Paper Handover / Dispatch */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 14px', background: historyExam.paperDispatched ? '#F0FDF4' : '#FFFBEB', borderRadius: '12px', border: historyExam.paperDispatched ? '1px solid #BBF7D0' : '1px solid #FDE68A' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: historyExam.paperDispatched ? '#DCFCE7' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: historyExam.paperDispatched ? '#15803D' : '#B45309', flexShrink: 0, fontWeight: '800', fontSize: '1rem' }}>
                  {historyExam.paperDispatched ? '🚚' : '⏳'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: historyExam.paperDispatched ? '#15803D' : '#B45309' }}>
                    {historyExam.paperDispatched ? 'Paper Bundle Handed to Invigilator' : 'Dispatch Pending Handover'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {historyExam.paperDispatched
                      ? `Sealed paper packet dispatched to Invigilator Ramesh Sharma.`
                      : `Awaiting invigilator sign-off in examination strongroom.`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: historyExam.paperDispatched ? '#15803D' : '#B45309', marginTop: '4px', fontWeight: '700' }}>
                    {historyExam.paperDispatched ? '08:50 AM • Invigilator Handover Verified' : 'Scheduled 08:50 AM'}
                  </div>
                </div>
              </div>

              {/* Event 3: Paper Collection & Answer Sheet Count */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 14px', background: historyExam.paperCollected ? '#EEF2FF' : '#F8FAFC', borderRadius: '12px', border: historyExam.paperCollected ? '1px solid #C7D2FE' : '1px solid #E2E8F0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: historyExam.paperCollected ? '#E0E7FF' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA', flexShrink: 0, fontWeight: '800', fontSize: '1rem' }}>
                  {historyExam.paperCollected ? '📥' : '🔒'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: historyExam.paperCollected ? '#4338CA' : '#64748B' }}>
                    {historyExam.paperCollected ? 'Answer Sheets Collected & Reconciled' : 'Collection Pending'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {historyExam.paperCollected
                      ? `Collected answer booklets reconciled against absent students list.`
                      : `Collection open after exam conclusion.`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: historyExam.paperCollected ? '#4338CA' : '#64748B', marginTop: '4px', fontWeight: '700' }}>
                    {historyExam.paperCollected ? '11:15 AM • Examiner Audit Completed' : 'Scheduled 11:15 AM'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                style={{ padding: '8px 22px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '50px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                onClick={() => { setShowHistoryModal(false); setHistoryExam(null); }}
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRADE-WISE PAPER COLLECTION RECONCILIATION MODAL */}
      {showReconcileModal && reconcileExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '680px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(12, 74, 134, 0.25)', border: '1.5px solid #0096DA', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1.5px solid #EBF5FF' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '50px', background: '#EBF5FF', color: '#0C4A86', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span>Room: {reconcileExam.room || 'Room 101'} • Multi-Grade Paper Collection</span>
                </div>
                <h2 style={{ margin: 0, color: '#0C4A86', fontSize: '1.35rem', fontWeight: '800' }}>
                  {getSubjectName(reconcileExam.subject, reconcileExam.name)} Grade-Wise Answer Sheets
                </h2>
              </div>
              <button onClick={() => { setShowReconcileModal(false); setReconcileExam(null); }} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
              Enter the collected paper counts for each seated grade in this room. Absentees are calculated automatically.
            </p>

            {/* Grade Breakdown Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {currentBreakdown.map((item, idx) => {
                const absent = item.total - item.collected;
                return (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Class / Grade Editable Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '130px' }}>
                      <label style={{ fontSize: '10px', color: '#0C4A86', fontWeight: '800', textTransform: 'uppercase' }}>Class / Grade</label>
                      <input
                        type="text"
                        value={item.grade}
                        onChange={(e) => updateGradeName(idx, e.target.value)}
                        placeholder="e.g. Grade 10"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #0096DA',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          color: '#0C4A86',
                          background: '#ffffff',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {/* Total Students Input */}
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Total Students</label>
                        <input
                          type="number"
                          value={item.total}
                          onChange={(e) => updateGradeTotal(idx, e.target.value)}
                          style={{ width: '75px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: '700', outline: 'none' }}
                        />
                      </div>

                      {/* Papers Collected Input */}
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ fontSize: '10px', color: '#0096DA', fontWeight: '800', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Papers Collected</label>
                        <input
                          type="number"
                          value={item.collected}
                          onChange={(e) => updateGradeCollected(idx, e.target.value)}
                          style={{ width: '75px', padding: '6px', textAlign: 'center', borderRadius: '8px', border: '1.5px solid #0096DA', fontWeight: '800', color: '#0C4A86', background: '#EBF5FF', outline: 'none' }}
                        />
                      </div>

                      {/* Absentees Calculated Badge */}
                      <div style={{ textAlign: 'center', minWidth: '95px' }}>
                        <label style={{ fontSize: '10px', color: absent > 0 ? '#E11D48' : '#16A34A', fontWeight: '800', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Absentees</label>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '50px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          background: absent > 0 ? '#FFE4E6' : '#DCFCE7',
                          color: absent > 0 ? '#E11D48' : '#16A34A',
                          border: absent > 0 ? '1px solid #FDA4AF' : '1px solid #86EFAC'
                        }}>
                          {absent > 0 ? `${absent} Absent` : '✓ All Present'}
                        </span>
                      </div>

                      {currentBreakdown.length > 1 && (
                        <button onClick={() => removeGradeBreakdownRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Grade">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addGradeBreakdownRow}
              style={{ background: '#EBF5FF', color: '#0C4A86', border: '1.5px dashed #0096DA', padding: '10px 18px', borderRadius: '50px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add Another Seated Grade for this Room</span>
            </button>

            {/* Room Overall Summary Card */}
            {(() => {
              const totalExpected = currentBreakdown.reduce((sum, g) => sum + g.total, 0);
              const totalCollected = currentBreakdown.reduce((sum, g) => sum + g.collected, 0);
              const totalAbsent = totalExpected - totalCollected;
              return (
                <div style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', borderRadius: '18px', padding: '18px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', boxShadow: '0 8px 20px rgba(0, 150, 218, 0.25)' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, fontWeight: '700' }}>Overall Room Summary</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '2px' }}>
                      {totalCollected} of {totalExpected} Papers Collected
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px 18px', borderRadius: '50px', fontWeight: '800', fontSize: '0.9rem' }}>
                    {totalAbsent > 0 ? `${totalAbsent} Absentee Papers` : '✓ All Papers Collected'}
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowReconcileModal(false); setReconcileExam(null); }} style={{ padding: '10px 22px', borderRadius: '50px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveReconciliation} style={{ padding: '10px 28px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>Save Grade-Wise Collection</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANUAL BENCH ASSIGNMENT & SWAP MODAL */}
      {showBenchAssignModal && benchAssignStudent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '480px',
            width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative', border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => { setShowBenchAssignModal(false); setBenchAssignStudent(null); }}
              style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: '#0096DA', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Examiner Bench Allocation
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#0C4A86' }}>
                Assign Bench for {benchAssignStudent.userId?.firstName || 'Student'} {benchAssignStudent.userId?.lastName || ''}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Roll No: {benchAssignStudent.displayRoll || 'STD-001'} • Grade {selectedGrade || '10'}
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0C4A86', marginBottom: '8px' }}>
                Select Target Bench (Benches #1 – #30):
              </label>
              <select
                value={targetBenchId}
                onChange={e => setTargetBenchId(Number(e.target.value))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #0096DA', fontSize: '0.92rem', fontWeight: '700',
                  color: '#0C4A86', outline: 'none', background: '#EBF5FF'
                }}
              >
                <optgroup label="🎯 Front Rows (#1–#10)">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
                <optgroup label="🥈 Middle Rows (#11–#20)">
                  {Array.from({ length: 10 }, (_, i) => i + 11).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
                <optgroup label="🥉 Back Rows (#21–#30)">
                  {Array.from({ length: 10 }, (_, i) => i + 21).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
              </select>
            </div>


            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowBenchAssignModal(false); setBenchAssignStudent(null); }}
                style={{ padding: '8px 18px', borderRadius: '50px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setBenchAssignments(prev => ({
                    ...prev,
                    [targetBenchId]: benchAssignStudent
                  }));
                  showNotification(`Assigned ${benchAssignStudent.userId?.firstName || 'Student'} to Bench #${targetBenchId}!`);
                  setShowBenchAssignModal(false);
                  setBenchAssignStudent(null);
                }}
                style={{ padding: '8px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 158, 242, 0.25)' }}
              >
                ✓ Assign to Bench #{targetBenchId}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCK STUDENT TO BENCH MANUAL ENTRY MODAL */}
      {showAddManualBenchModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '500px',
            width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative', border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setShowAddManualBenchModal(false)}
              style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ✍️ Manual Bench Entry
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#0C4A86' }}>
                Enter Student & Bench Details
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Assign specific students to fixed benches first. All remaining unassigned students can be auto-filled randomly!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0C4A86', marginBottom: '6px' }}>
                  Select Grade:
                </label>
                <select
                  value={manualGrade}
                  onChange={e => setManualGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #0096DA', fontSize: '0.9rem', fontWeight: '700', color: '#0C4A86', outline: 'none', background: '#EBF5FF' }}
                >
                  {['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0C4A86', marginBottom: '6px' }}>
                  Select Section:
                </label>
                <select
                  value={manualSection}
                  onChange={e => setManualSection(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #0096DA', fontSize: '0.9rem', fontWeight: '700', color: '#0C4A86', outline: 'none', background: '#EBF5FF' }}
                >
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0C4A86', marginBottom: '6px' }}>
                  Select Student (Grade {manualGrade} Sec {manualSection}):
                </label>
                <select
                  value={manualStudentId}
                  onChange={e => setManualStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #0096DA', fontSize: '0.9rem', fontWeight: '700', color: '#0C4A86', outline: 'none', background: '#EBF5FF' }}
                >
                  <option value="">Choose Student Name / Roll No</option>
                  {classStudents.map((s, idx) => (
                    <option key={s._id || s.id || idx} value={s._id || s.id || idx}>
                      {s.userId?.firstName} {s.userId?.lastName} (Roll #{s.rollNumber || idx + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0C4A86', marginBottom: '6px' }}>
                  Assign to Target Bench:
                </label>
                <select
                  value={manualBenchId}
                  onChange={e => setManualBenchId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #0096DA', fontSize: '0.9rem', fontWeight: '700', color: '#0C4A86', outline: 'none', background: '#EBF5FF' }}
                >
                <optgroup label="🎯 Front Rows (#1–#10)">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
                <optgroup label="🥈 Middle Rows (#11–#20)">
                  {Array.from({ length: 10 }, (_, i) => i + 11).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
                <optgroup label="🥉 Back Rows (#21–#30)">
                  {Array.from({ length: 10 }, (_, i) => i + 21).map(num => (
                    <option key={num} value={num}>Bench #{num}</option>
                  ))}
                </optgroup>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddManualBenchModal(false)}
                style={{ padding: '8px 18px', borderRadius: '50px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selectedStdObj = classStudents.find(s => String(s._id || s.id) === String(manualStudentId)) || classStudents[0];
                  setManualFixedStudents(prev => ({
                    ...prev,
                    [manualBenchId]: selectedStdObj
                  }));
                  showNotification(`Locked ${selectedStdObj?.userId?.firstName || 'Student'} to Bench #${manualBenchId}!`);
                  setShowAddManualBenchModal(false);
                }}
                style={{ padding: '8px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)' }}
              >
                📌 Lock Seat & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminerDashboard;
