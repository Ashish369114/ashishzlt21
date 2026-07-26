import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, teacherService, classService, studentService } from '../../services/api';
import { demoExams, demoEmployees, demoClasses, demoStudents } from '../../utils/demoData';
import '../../styles/ManagementStyles.css';

const ExaminerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
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

  // Assignment Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // View Duty Modal state
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [dutyExam, setDutyExam] = useState(null);

  // Seating Arrangement state
  const [showSeating, setShowSeating] = useState(false);
  const [seatingSearch, setSeatingSearch] = useState('');
  const [sortMethod, setSortMethod] = useState('rollNumber');
  const [selectedRoom, setSelectedRoom] = useState('');

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

      if (fetchedClasses.length > 0) {
        const defaultClass = fetchedClasses.find(c => String(c.grade) === '3' && c.section === 'A') || fetchedClasses[0];
        setSelectedGrade(String(defaultClass.grade));
        setSelectedSection(defaultClass.section);
      }
      if (fetchedExams.length > 0) {
        const firstType = fetchedExams[0].examType || 'Mid-Term';
        setSelectedExamType(firstType);
      }
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

  // Recommended Teachers (sorted by ascending assignedClasses.length)
  const getRecommendedTeachers = () => {
    return [...teachers].sort((a, b) => {
      const aClasses = a.assignedClasses?.length || 0;
      const bClasses = b.assignedClasses?.length || 0;
      return aClasses - bClasses;
    });
  };

  // Shared Filter derived options
  const gradeOptions = [...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  const sectionsForGrade = selectedGrade
    ? [...new Set(classes.filter(c => String(c.grade) === String(selectedGrade)).map(c => c.section).filter(Boolean))].sort()
    : [];

  const uniqueExamTypes = [...new Set(exams.map(e => e.examType).filter(Boolean))].sort();

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
      gap: '16px',
      marginBottom: '24px',
      background: '#f8fafc',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      alignItems: 'flex-end',
      flexWrap: 'nowrap',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Select Grade</label>
        <select
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value);
            setSelectedSection('');
            setSelectedExamType('');
          }}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none' }}
        >
          <option value="">-- Grade --</option>
          {gradeOptions.map(g => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Select Section</label>
        <select
          value={selectedSection}
          onChange={e => {
            setSelectedSection(e.target.value);
            setSelectedExamType('');
          }}
          disabled={!selectedGrade}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none', background: !selectedGrade ? '#f1f5f9' : '#fff' }}
        >
          <option value="">-- Section --</option>
          {sectionsForGrade.map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Exam Type</label>
        <select
          value={selectedExamType}
          onChange={e => setSelectedExamType(e.target.value)}
          disabled={!selectedSection}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '160px', outline: 'none', background: !selectedSection ? '#f1f5f9' : '#fff' }}
        >
          <option value="">-- Exam Type --</option>
          {uniqueExamTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {(!noSelection) && (
        <button
          onClick={() => {
            setSelectedGrade('');
            setSelectedSection('');
            setSelectedExamType('');
          }}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 16px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Horizontal top nav / Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>
            <div style={{ width: '32px', height: '32px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span style={{ fontSize: '1.2rem' }}>✍️</span>
            </div>
            Examiner
          </h2>
        </div>

        <ul className="nav-menu">
          <li>
            <a href="#" className={activeTab === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className={activeTab === 'invigilators' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('invigilators'); }}>
              Invigilators
            </a>
          </li>
          <li>
            <a href="#" className={activeTab === 'papers' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('papers'); }}>
              Exam Papers
            </a>
          </li>
          <li>
            <a href="#" className={activeTab === 'seating' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('seating'); }}>
              Seating
            </a>
          </li>
          
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ background: '#f8fafc', padding: '28px' }}>
        {/* Header Banner */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 30px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
              Welcome back, Amit!
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              Assign exam paper status and distribute invigilator duties efficiently.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
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
                  <div className="stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📝</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Today's Exams</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{todaysExams}</div>
                  </div>

                  <div className="stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>👮</div>
                    <div style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: '600', textTransform: 'uppercase' }}>Pending Invigilator Assignments</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#e11d48', marginTop: '4px' }}>{pendingInvigilator}</div>
                  </div>

                  <div className="stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🚚</div>
                    <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '600', textTransform: 'uppercase' }}>Papers Yet to Distribute</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>{pendingDistribute}</div>
                  </div>

                  <div className="stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📥</div>
                    <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '600', textTransform: 'uppercase' }}>Papers Yet to Collect</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{pendingCollect}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontWeight: '800' }}>Today's Exam Schedule</h3>
                    <table className="management-table compact">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Grade</th>
                          <th>Section</th>
                          <th>Time</th>
                          <th>Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysExamsList.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No exams scheduled for today.</td></tr>
                        ) : todaysExamsList.map(e => (
                          <tr key={e.id || e._id}>
                            <td>{e.subject?.name || 'N/A'}</td>
                            <td>{e.class?.grade || 'N/A'}</td>
                            <td>{e.class?.section || 'N/A'}</td>
                            <td>{e.startTime} - {e.endTime}</td>
                            <td>{e.room || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
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
                </div>
              </div>
            )}

            {/* INVIGILATORS TAB */}
            {activeTab === 'invigilators' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontWeight: '800' }}>Manage Invigilators Duty Allocation</h3>
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
                  <table className="management-table compact">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Room</th>
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
                            <td style={{ fontWeight: '700', color: '#1e293b' }}>{exam.subject?.name || exam.name || 'N/A'}</td>
                            <td>{exam.class?.grade ? `Grade ${exam.class.grade}` : 'N/A'}</td>
                            <td>{exam.class?.section ? `Section ${exam.class.section}` : 'N/A'}</td>
                            <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                            <td>{exam.startTime || 'N/A'} - {exam.endTime || 'N/A'}</td>
                            <td>{exam.room || 'N/A'}</td>
                            <td>{invName || '—'}</td>
                            <td>
                              {invName ? (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a' }}>Completed</span>
                              ) : (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#fee2e2', color: '#dc2626' }}>Not Assigned</span>
                              )}
                            </td>
                            <td>
                              <button className="action-btn-primary" style={{ marginRight: '4px', padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => { setSelectedExam(exam); setShowAssignModal(true); }}>
                                {invName ? 'Change Teacher' : 'Assign Teacher'}
                              </button>
                              <button
                                className="action-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
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
                )}
              </div>
            )}

            {/* PAPERS TAB */}
            {activeTab === 'papers' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontWeight: '800' }}>Manage Exam Paper Logistics</h3>
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
                  <table className="management-table compact">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Exam Type</th>
                        <th>Room</th>
                        <th>Distributed By</th>
                        <th>Collected By</th>
                        <th>Distribution Status</th>
                        <th>Collection Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map(exam => {
                        const distBy = exam.paperDispatched ? (user?.firstName ? user.firstName : 'Admin') : '—';
                        const colBy = exam.paperCollected ? (user?.firstName ? user.firstName : 'Admin') : '—';
                        return (
                          <tr key={exam._id}>
                            <td style={{ fontWeight: '700', color: '#1e293b' }}>{exam.subject?.name || exam.name || 'N/A'}</td>
                            <td>{exam.class?.grade ? `Grade ${exam.class.grade}` : 'N/A'}</td>
                            <td>{exam.class?.section ? `Section ${exam.class.section}` : 'N/A'}</td>
                            <td>{exam.examType || 'N/A'}</td>
                            <td>{exam.room || 'N/A'}</td>
                            <td>{distBy}</td>
                            <td>{colBy}</td>
                            <td>
                              {exam.paperDispatched ? (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a' }}>Completed {exam.updatedAt ? new Date(exam.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                              ) : (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#ffedd5', color: '#ea580c' }}>Pending</span>
                              )}
                            </td>
                            <td>
                              {exam.paperCollected ? (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#dcfce7', color: '#16a34a' }}>Completed {exam.updatedAt ? new Date(exam.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                              ) : (
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: '#ffedd5', color: '#ea580c' }}>Pending</span>
                              )}
                            </td>
                            <td>
                              {!exam.paperDispatched && (
                                <button className="action-btn-primary" style={{ marginRight: '4px', padding: '4px 8px', fontSize: '0.75rem', background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => toggleDispatch(exam)}>Mark Distributed</button>
                              )}
                              {exam.paperDispatched && !exam.paperCollected && (
                                <button className="action-btn-primary" style={{ marginRight: '4px', padding: '4px 8px', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981' }} onClick={() => toggleCollection(exam)}>Mark Collected</button>
                              )}
                              <button className="action-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>View History</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── SEATING ARRANGEMENT ───────────────────────────────── */}
            {activeTab === 'seating' && (
              <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🪑</span>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Seating Arrangement</h2>
                </div>

                {/* Seating Filters */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedExamName(''); setShowSeating(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none' }}>
                    <option value="">Select Grade</option>
                    {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>

                  <select value={selectedSection} disabled={!selectedGrade} onChange={e => { setSelectedSection(e.target.value); setSelectedExamName(''); setShowSeating(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none', background: !selectedGrade ? '#f1f5f9' : '#fff' }}>
                    <option value="">Select Section</option>
                    {sectionsForGrade.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>

                  <select value={selectedExamName} disabled={!selectedGrade || !selectedSection} onChange={e => { setSelectedExamName(e.target.value); setShowSeating(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none', background: (!selectedGrade || !selectedSection) ? '#f1f5f9' : '#fff' }}>
                    <option value="">Select Exam</option>
                    {uniqueExamNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>

                  <select value={selectedRoom} disabled={!selectedExamName} onChange={e => { setSelectedRoom(e.target.value); setShowSeating(false); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '140px', outline: 'none', background: (!selectedExamName) ? '#f1f5f9' : '#fff' }}>
                    <option value="">Select Room</option>
                    <option value="Room 101">Room 101</option>
                    <option value="Room 102">Room 102</option>
                    <option value="Hall A">Hall A</option>
                    <option value="Hall B">Hall B</option>
                  </select>
                </div>

                {/* Get Seating button */}
                {selectedGrade && selectedSection && selectedExamName && selectedRoom && !showSeating && (
                  <button
                    onClick={() => setShowSeating(true)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: '#667eea',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      marginBottom: '20px',
                      boxShadow: '0 4px 10px rgba(102, 126, 234, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🪑 Get Seating Arrangement
                  </button>
                )}

                {!selectedGrade || !selectedSection || !selectedExamName ? (
                  <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                    Select grade, section, and exam name, then click <strong>Get Seating Arrangement</strong>.
                  </p>
                ) : !showSeating ? null : (
                  (() => {
                    const selectedExam = classExams.find(e => e.name === selectedExamName);
                    const roomName = selectedExam?.room || 'N/A';
                    const examDateStr = selectedExam?.date ? new Date(selectedExam.date).toLocaleDateString() : 'N/A';
                    const examTimeStr = selectedExam?.startTime && selectedExam?.endTime ? `${selectedExam.startTime} - ${selectedExam.endTime}` : selectedExam?.time || 'N/A';
                    const teacherName = selectedExam ? getExamTeacher(selectedExam) : 'Unassigned';

                    if (classStudents.length === 0) {
                      return <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No students found in Grade {selectedGrade} Section {selectedSection}.</p>;
                    }

                    const seatCapacity = 30; // Standard room capacity
                    const totalStudents = classStudents.length;
                    const emptySeats = Math.max(0, seatCapacity - totalStudents);

                    // Sort students based on selected method
                    const sortedStudents = [...classStudents].sort((a, b) => {
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
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Exam Info</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              {selectedExamName} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>(Grade {selectedGrade} {selectedSection})</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Room</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>🚪 {selectedRoom || roomName}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Time & Invigilator</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              ⏱ {examTimeStr} | 👤 {teacherName}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Capacity Details</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                              <span style={{color: '#10b981'}}>👥 {totalStudents} assigned</span> / {seatCapacity} total
                              <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px', fontWeight: 'normal' }}>({emptySeats} empty seats)</span>
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
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Sort By:</span>
                            <select 
                              value={sortMethod} 
                              onChange={e => setSortMethod(e.target.value)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '0.85rem',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="rollNumber">Roll Number (Default)</option>
                              <option value="firstName">First Name</option>
                              <option value="lastName">Last Name</option>
                            </select>
                          </div>
                        </div>

                        {/* Visual Seating Plan */}
                        <div style={{
                          border: '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '30px 20px',
                          background: '#f8fafc',
                          position: 'relative'
                        }}>
                          {/* Blackboard representation */}
                          <div style={{
                            width: '60%',
                            margin: '0 auto 40px',
                            background: '#1e293b',
                            color: '#fff',
                            textAlign: 'center',
                            padding: '12px',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            letterSpacing: '0.1em',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}>
                            🧑‍🏫 FRONT / BLACKBOARD
                          </div>

                          {/* Grid of desks */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '16px',
                            maxWidth: '900px',
                            margin: '0 auto'
                          }}>
                            {sortedStudents.map((student, idx) => {
                              const fullName = `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim();
                              const roll = student.rollNumber || 'N/A';
                              const matchesSearch = seatingSearch
                                ? fullName.toLowerCase().includes(seatingSearch.toLowerCase()) ||
                                  roll.toLowerCase().includes(seatingSearch.toLowerCase())
                                : false;

                              return (
                                <div
                                  key={student._id}
                                  style={{
                                    background: matchesSearch ? '#fef08a' : '#fff',
                                    border: matchesSearch ? '2px solid #eab308' : '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    textAlign: 'center',
                                    boxShadow: matchesSearch ? '0 10px 15px -3px rgba(234, 179, 8, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: matchesSearch ? 'scale(1.05)' : 'none',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: matchesSearch ? '#eab308' : '#64748b',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}>
                                    Desk {idx + 1}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>
                                    Roll No: {roll}
                                  </div>
                                  <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    marginTop: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {fullName}
                                  </div>
                                  <div style={{
                                    marginTop: '8px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    color: matchesSearch ? '#854d0e' : '#16a34a',
                                    textTransform: 'uppercase'
                                  }}>
                                    Assigned
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
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
            background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '580px',
            width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
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

                const classCount = teacher.assignedClasses?.length || 0;
                const teacherId = teacher.id || teacher._id;
                
                // Show badge for teachers with less class periods
                const isRecommended = index < 3 || classCount <= 1;

                return (
                  <div
                    key={teacherId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: isRecommended ? '#fdfdfd' : '#fcfcfc',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#1e293b' }}>{tName}</span>
                        {isRecommended && (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            background: '#fef3c7',
                            color: '#b45309',
                            display: 'inline-block'
                          }}>
                            ⭐ Recommend
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        Main Subject: {teacher.subject?.name || 'General'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: classCount > 3 ? '#991b1b' : '#475569',
                          background: classCount > 3 ? '#fee2e2' : '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          display: 'inline-block'
                        }}>
                          Workload: {classCount} class{classCount !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <button
                        className="action-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}
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
                  fontSize: '1.5rem', fontWeight: 'bold'
                }}>
                  👮
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
                <h5 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
                  📋 Invigilator Duty Guidelines
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
    </div>
  );
};

export default ExaminerDashboard;
