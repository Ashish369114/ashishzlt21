import React, { useState, useEffect } from 'react';
import { examService, marksService, teacherService, studentService, classService } from '../../services/api';
import { demoExams, demoClasses, demoStudents, demoEmployees } from '../../utils/demoData';
import {
  getUnifiedExams,
  subscribeToDataChanges,
  resolveInvigilatorName,
  getExamDateFormatted,
  getExamDayFormatted,
  ensureNoSunday
} from '../../services/syncService';

const PrincipalExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab
  const [activeTab, setActiveTab] = useState('schedule');

  // Shared filters
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedExamName, setSelectedExamName] = useState('');

  // Top Performers Filters
  const [perfGrade, setPerfGrade] = useState('');
  const [perfSection, setPerfSection] = useState('');
  const [perfSubject, setPerfSubject] = useState('');

  // Timetable show state (button-triggered)
  const [showTimetable, setShowTimetable] = useState(false);
  const [showSeating, setShowSeating] = useState(false);
  const [seatingSearch, setSeatingSearch] = useState('');

  // Exam Duty sub-tab
  const [dutySubTab, setDutySubTab] = useState('distribution');
  const [dispatchedExams, setDispatchedExams] = useState([]);
  const [collectedExams, setCollectedExams] = useState([]);

  useEffect(() => {
    fetchData();

    const unsubscribe = subscribeToDataChanges((event) => {
      if (event && (event.actionType === 'EXAM_SCHEDULE_CHANGED' || event.actionType === 'DATA_UPDATED')) {
        fetchData();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, marksRes, teachersRes, studentsRes, classesRes, subjectsRes] = await Promise.all([
        examService.getAll().catch(() => ({ data: [] })),
        marksService.getAll().catch(() => ({ data: [] })),
        teacherService.getAll().catch(() => ({ data: [] })),
        studentService.getAll().catch(() => ({ data: [] })),
        classService.getAll().catch(() => ({ data: [] })),
        classService.getSubjects().catch(() => ({ data: [] })),
      ]);
      const fetchedExams = getUnifiedExams(examsRes.data || []);
      const fetchedClasses = (classesRes.data && classesRes.data.length) ? classesRes.data : demoClasses;
      const fetchedStudents = (studentsRes.data && studentsRes.data.length) ? studentsRes.data : demoStudents;
      const fetchedTeachers = (teachersRes.data && teachersRes.data.length) ? teachersRes.data : demoEmployees;

      setExams(fetchedExams);
      setMarks(marksRes.data || []);
      setTeachers(fetchedTeachers);
      setStudents(fetchedStudents);
      setClasses(fetchedClasses);
      setSubjects((subjectsRes.data && subjectsRes.data.length) ? subjectsRes.data : ['Mathematics', 'Science', 'English', 'Social Science']);

      if (fetchedClasses.length > 0) {
        const defaultClass = fetchedClasses[0];
        setSelectedGrade(String(defaultClass.grade));
        setSelectedSection(defaultClass.section);
      }
      if (fetchedExams.length > 0) {
        const firstType = fetchedExams[0].examType || 'Annual';
        setSelectedExamType(firstType);
      }
      setError('');
    } catch (err) {
      console.warn('Using demo data for principal exam management:', err);
      setExams(getUnifiedExams([]));
      setClasses(demoClasses);
      setStudents(demoStudents);
      setTeachers(demoEmployees);
      setSubjects(['Mathematics', 'Science', 'English', 'Social Science']);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const gradeOptions = [...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  const sectionsForGrade = selectedGrade
    ? [...new Set(classes.filter(c => String(c.grade) === String(selectedGrade)).map(c => c.section).filter(Boolean))].sort()
    : [];

  const uniqueExamTypes = [...new Set(exams.map(e => e.examType).filter(Boolean))].sort();

  const selectedClassObj = classes.find(c => String(c.grade) === String(selectedGrade) && c.section === selectedSection);

  const classExams = selectedClassObj
    ? exams.filter(e => {
        const cid = (typeof e.class === 'object' && e.class !== null ? (e.class.id || e.class._id) : null) || e.classId || e.class;
        const targetId = selectedClassObj.id || selectedClassObj._id;
        return String(cid) === String(targetId) || String(e.classId) === String(selectedClassObj.id);
      })
    : [];

  const uniqueExamNames = selectedClassObj
    ? [...new Set(classExams.map(e => e.name).filter(Boolean))].sort()
    : [];

  const rawFilteredExams = (selectedExamType
    ? classExams.filter(e => {
        if (!e.examType) return false;
        const t1 = e.examType.toLowerCase().replace(/[\s_-]+/g, '');
        const t2 = selectedExamType.toLowerCase().replace(/[\s_-]+/g, '');
        return t1 === t2 || t1.includes(t2) || t2.includes(t1);
      })
    : classExams).sort((a, b) => new Date(a.date || a.examDate || new Date()) - new Date(b.date || b.examDate || new Date()));

  const classStudents = students.filter(s => {
    const cid = (typeof s.class === 'object' && s.class !== null ? (s.class.id || s.class._id) : null) || s.classId || s.class;
    const targetId = selectedClassObj ? (selectedClassObj.id || selectedClassObj._id) : null;
    return selectedClassObj && (String(cid) === String(targetId) || String(s.classId) === String(selectedClassObj.id));
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    if (examDate < now) return 'Completed';
    if (examDate.toDateString() === now.toDateString()) return 'Today';
    return 'Upcoming';
  };

  const getDuration = (exam) => {
    try {
      const [sh, sm] = exam.startTime.split(':').map(Number);
      const [eh, em] = exam.endTime.split(':').map(Number);
      if (isNaN(sh) || isNaN(eh)) return 'N/A';
      const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
      return diff > 0 ? `${diff} mins` : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  // Match teacher by primary subject first, then teachingSubjects, then class assignment
  const getExamTeacher = (exam) => {
    if (exam.invigilator) {
      const t = exam.invigilator;
      const u = t.user || t.userId;
      if (u) {
        return `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unassigned';
      }
    }
    if (!exam.subject) return 'Unassigned';
    const examSubjectId = (typeof exam.subject === 'object' && exam.subject !== null ? (exam.subject.id || exam.subject._id) : null) || exam.subjectId || exam.subject;
    const examClassId = (typeof exam.class === 'object' && exam.class !== null ? (exam.class.id || exam.class._id) : null) || exam.classId || exam.class;

    const resolveTeacherName = (t) => {
      if (!t) return null;
      const u = t.user || t.userId;
      return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || null : null;
    };

    // 1. Primary subject match
    let t = teachers.find(t => String(t.subject?.id || t.subject?._id || t.subject) === String(examSubjectId));

    // 2. teachingSubjects (non-all-subject teachers first)
    if (!t) {
      t = teachers.find(tt => {
        if (tt.isAllSubjectTeacher) return false;
        const ids = (tt.teachingSubjects || []).map(s => s.id || s._id || s);
        return ids.some(id => String(id) === String(examSubjectId));
      });
    }

    // 3. Class-assigned fallback
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

    return resolveTeacherName(t) || 'Unassigned';
  };

  const uniqueFilteredExamsMap = new Map();
  rawFilteredExams.forEach((exam, idx) => {
    const formattedDate = getExamDateFormatted(exam.examDate || exam.date);
    const key = `${formattedDate}-${exam.subject?.name || exam.subject}`;
    const invig = resolveInvigilatorName(exam, teachers, idx) || getExamTeacher(exam);
    if (!uniqueFilteredExamsMap.has(key)) {
      uniqueFilteredExamsMap.set(key, {
        ...exam,
        rooms: [exam.room].filter(Boolean),
        invigilators: [invig].filter(t => t && t !== 'Unassigned' && t !== 'N/A')
      });
    } else {
      const existing = uniqueFilteredExamsMap.get(key);
      if (exam.room && !existing.rooms.includes(exam.room)) existing.rooms.push(exam.room);
      if (invig && invig !== 'Unassigned' && invig !== 'N/A' && !existing.invigilators.includes(invig)) existing.invigilators.push(invig);
    }
  });

  const filteredExams = Array.from(uniqueFilteredExamsMap.values()).map(g => ({
    ...g,
    room: g.rooms.length > 2 ? `${g.rooms[0]}, ${g.rooms[1]} (+${g.rooms.length - 2} more)` : (g.rooms.join(', ') || 'Room 101'),
    teacherName: g.invigilators.length > 2 ? `${g.invigilators[0]}, ${g.invigilators[1]} (+${g.invigilators.length - 2} more)` : (g.invigilators.join(', ') || resolveInvigilatorName(g, teachers))
  }));

  // ── CSV Download ──────────────────────────────────────────────────────────────
  const downloadTimetableCSV = () => {
    if (!filteredExams.length) return;
    const headers = ['Subject', 'Date', 'Room', 'Teacher'];
    const rows = filteredExams.map(exam => [
      exam.subject?.name || '',
      exam.date ? new Date(exam.date).toLocaleDateString() : '',
      exam.room,
      exam.teacherName,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Timetable_Grade${selectedGrade}_Section${selectedSection}_${selectedExamType || 'All'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Top Performers ────────────────────────────────────────────────────────────
  const getTopPerformers = () => {
    const map = {};
    marks.forEach(mark => {
      if (perfGrade && String(mark.class?.grade) !== String(perfGrade)) return;
      if (perfSection && String(mark.class?.section) !== String(perfSection)) return;
      if (perfSubject && String(mark.subject?.name || mark.subject?._id || mark.subject) !== String(perfSubject)) return;

      const name = `${mark.student?.firstName || ''} ${mark.student?.lastName || ''}`.trim() || 'Unknown';
      if (!map[name]) map[name] = { total: 0, count: 0 };
      map[name].total += mark.marks;
      map[name].count += 1;
    });
    return Object.entries(map)
      .map(([name, { total, count }]) => ({ name, average: (total / count).toFixed(1) }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  };

  const topPerformers = getTopPerformers();

  const perfSections = perfGrade
    ? [...new Set(classes.filter(c => String(c.grade) === String(perfGrade)).map(c => c.section).filter(Boolean))].sort()
    : [];

  // ── Shared filter UI ──────────────────────────────────────────────────────────
  const selectStyle = (enabled = true) => ({
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: enabled ? '#fff' : '#f9fafb',
    color: enabled ? '#111827' : '#9ca3af',
    fontSize: '0.95rem', minWidth: '170px',
    cursor: enabled ? 'pointer' : 'not-allowed', outline: 'none',
  });

  const FilterBar = ({ showExamType = true }) => (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
      <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedExamType(''); setSelectedExamName(''); setShowTimetable(false); setShowSeating(false); }} style={selectStyle()}>
        <option value="">Select Grade</option>
        {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
      </select>

      <select value={selectedSection} disabled={!selectedGrade} onChange={e => { setSelectedSection(e.target.value); setSelectedExamType(''); setSelectedExamName(''); setShowTimetable(false); setShowSeating(false); }} style={selectStyle(!!selectedGrade)}>
        <option value="">Select Section</option>
        {sectionsForGrade.map(s => <option key={s} value={s}>Section {s}</option>)}
      </select>

      {showExamType && (
        <>
          <select value={selectedExamType} disabled={!selectedGrade || !selectedSection} onChange={e => { setSelectedExamType(e.target.value); setShowTimetable(false); }} style={selectStyle(!!(selectedGrade && selectedSection))}>
            <option value="">Select Exam Type</option>
            {uniqueExamTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </>
      )}
    </div>
  );

  const noSelection = !selectedGrade || !selectedSection || !selectedExamType;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { key: 'schedule', label: '📅 Exam Schedule' },
          { key: 'seating', label: '🪑 Seating Arrangement' },
          { key: 'invigilator', label: '👮 Invigilator Duty' },
          { key: 'duty', label: '📝 Exam Duty' },
          { key: 'download', label: '📥 Download Timetable' },
          { key: 'performance', label: '📈 Top Performers' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: activeTab === tab.key ? '700' : '500',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#374151',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(102,126,234,0.35)' : 'none',
              transition: 'all 0.2s ease',
              marginTop: 0, width: 'auto',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {/* ── EXAM SCHEDULE ─────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Exam Schedule</h2>
              </div>

              <FilterBar />

              {/* Get Timetable button */}
              {selectedGrade && selectedSection && selectedExamType && !showTimetable && (
                <button
                  onClick={() => setShowTimetable(true)}
                  style={{ padding: '10px 24px', borderRadius: '8px', background: '#667eea', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', marginBottom: '20px' }}
                >
                  🔍 Get Timetable
                </button>
              )}

              {noSelection ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>Select grade, section, and exam type, then click <strong>Get Timetable</strong>.</p>
              ) : !showTimetable ? null : filteredExams.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No exams found for this selection.</p>
              ) : (
                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Date</th>
                        <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Day</th>
                        <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Subject</th>
                        <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Room</th>
                        <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Invigilator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map((exam, idx) => {
                        const status = getExamStatus(exam);
                        const isHighlight = status === 'Today';
                        const examDate = getExamDateFormatted(exam.examDate || exam.date);
                        const examDay = getExamDayFormatted(exam.examDate || exam.date);
                        const invig = exam.teacherName || resolveInvigilatorName(exam, teachers, idx);
                        
                        return (
                          <tr key={exam._id || `ex_${idx}`} style={{ borderBottom: '1px solid #e2e8f0', background: isHighlight ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                            <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '500', whiteSpace: 'nowrap' }}>{examDate}</td>
                            <td style={{ padding: '14px 16px', color: '#64748b' }}>{examDay}</td>
                            <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600' }}>{typeof exam.subject === 'object' ? (exam.subject?.name || 'Unknown') : (exam.subject || 'Unknown')}</td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.room || 'Room 101'}</td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>{invig}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p style={{ marginTop: '20px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }}>
                    NOTE: - EXAMS WILL BEGIN AT 09:00 A.M. AND ENDS AT 11:00 A.M.
                  </p>
                </div>
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
                <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedExamName(''); setShowSeating(false); }} style={selectStyle()}>
                  <option value="">Select Grade</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>

                <select value={selectedSection} disabled={!selectedGrade} onChange={e => { setSelectedSection(e.target.value); setSelectedExamName(''); setShowSeating(false); }} style={selectStyle(!!selectedGrade)}>
                  <option value="">Select Section</option>
                  {sectionsForGrade.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>

                <select value={selectedExamName} disabled={!selectedGrade || !selectedSection} onChange={e => { setSelectedExamName(e.target.value); setShowSeating(false); }} style={selectStyle(!!(selectedGrade && selectedSection))}>
                  <option value="">Select Exam</option>
                  {uniqueExamNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              {/* Get Seating button */}
              {selectedGrade && selectedSection && selectedExamName && !showSeating && (
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

                  // Sort students by roll number
                  const sortedStudents = [...classStudents].sort((a, b) => {
                    const rA = String(a.rollNumber || '');
                    const rB = String(b.rollNumber || '');
                    return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
                  });

                  return (
                    <div>
                      {/* Exam Seating Info Header Card */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '24px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Exam Name</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{selectedExamName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Room</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706', marginTop: '4px' }}>🚪 {roomName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Date & Time</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                            📅 {examDateStr} <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '0.85rem' }}>({examTimeStr})</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Invigilator</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#4f46e5', marginTop: '4px' }}>👤 {teacherName}</div>
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


          {/* ── INVIGILATOR DUTY ──────────────────────────────────── */}
          {activeTab === 'invigilator' && (
            <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.2rem' }}>👮</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Invigilator Duty</h2>
              </div>
              <FilterBar />

              {noSelection ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>Select grade, section, and exam type to view invigilator assignments.</p>
              ) : filteredExams.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No exams found for this selection.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Invigilator Teacher</th>
                        <th>Room</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map(exam => (
                        <tr key={exam._id}>
                          <td>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{exam.examType || exam.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{exam.subject?.name || 'N/A'}</div>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ede9fe', color: '#5b21b6', borderRadius: '20px', padding: '5px 14px', fontSize: '0.85rem', fontWeight: '600' }}>
                              👤 {getExamTeacher(exam)}
                            </span>
                          </td>
                          <td><span style={{ color: '#b45309', fontWeight: '600' }}>🚪 {exam.room || 'N/A'}</span></td>
                          <td>{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</td>
                          <td>{exam.startTime && exam.endTime ? `${exam.startTime} - ${exam.endTime}` : exam.time || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EXAM DUTY ─────────────────────────────────────────── */}
          {activeTab === 'duty' && (
            <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Exam Duty</h2>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
                {[{ key: 'distribution', label: '📄 Paper Distribution' }, { key: 'collection', label: '📥 Paper Collection' }].map(sub => (
                  <button key={sub.key} onClick={() => setDutySubTab(sub.key)} style={{
                    padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                    background: dutySubTab === sub.key ? '#fff' : 'transparent',
                    boxShadow: dutySubTab === sub.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: dutySubTab === sub.key ? '700' : 'normal',
                    color: dutySubTab === sub.key ? '#0f172a' : '#475569',
                  }}>{sub.label}</button>
                ))}
              </div>

              <FilterBar />

              {noSelection ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>Select grade, section, and exam type to manage {dutySubTab === 'distribution' ? 'paper distribution' : 'paper collection'}.</p>
              ) : filteredExams.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No exams found for this selection.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Teacher</th>
                        <th>Room</th>
                        {dutySubTab === 'collection' && <th>Sheets</th>}
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map(exam => {
                        const isDispatched = exam.paperDispatched;
                        const isCollected = exam.paperCollected;
                        return (
                          <tr key={exam._id}>
                            <td>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>{exam.examType || exam.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{exam.subject?.name || 'N/A'}</div>
                            </td>
                            <td>{getExamTeacher(exam)}</td>
                            <td>{exam.room || 'N/A'}</td>
                            {dutySubTab === 'collection' && (
                              <td>{isCollected ? `${classStudents.length}/${classStudents.length}` : `0/${classStudents.length}`}</td>
                            )}
                            <td>
                              {dutySubTab === 'distribution' ? (
                                <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', background: isDispatched ? '#def7ec' : '#fef3c7', color: isDispatched ? '#03543f' : '#92400e' }}>
                                  {isDispatched ? 'Dispatched' : 'Pending'}
                                </span>
                              ) : (
                                <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', background: isCollected ? '#def7ec' : '#fef3c7', color: isCollected ? '#03543f' : '#92400e' }}>
                                  {isCollected ? 'Collected' : 'Pending'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── DOWNLOAD TIMETABLE ────────────────────────────────── */}
          {activeTab === 'download' && (
            <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.2rem' }}>📥</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Download Timetable</h2>
              </div>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.92rem' }}>Select grade, section, and exam name, then download the timetable as a CSV spreadsheet.</p>

              {/* Custom Filter Bar with Exam Name dropdown for Download */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedExamName(''); }} style={selectStyle()}>
                  <option value="">Select Grade</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>

                <select value={selectedSection} disabled={!selectedGrade} onChange={e => { setSelectedSection(e.target.value); setSelectedExamName(''); }} style={selectStyle(!!selectedGrade)}>
                  <option value="">Select Section</option>
                  {sectionsForGrade.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>

                <select value={selectedExamName} disabled={!selectedGrade || !selectedSection} onChange={e => setSelectedExamName(e.target.value)} style={selectStyle(!!(selectedGrade && selectedSection))}>
                  <option value="">Select Exam</option>
                  {uniqueExamNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              {(() => {
                const downloadExams = selectedClassObj
                  ? classExams.filter(e => e.name === selectedExamName)
                  : [];
                const downloadNoSelection = !selectedGrade || !selectedSection || !selectedExamName;

                return downloadNoSelection ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Please select all filters above to enable download.</p>
                ) : downloadExams.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No exams found for this selection.</p>
                ) : (
                  <>
                    <p style={{ marginBottom: '16px', color: '#374151', fontSize: '0.95rem' }}>
                      <strong>{downloadExams.length} exams</strong> found for Grade {selectedGrade}, Section {selectedSection}, {selectedExamName}.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => {
                          const headers = ['Exam Name', 'Exam Type', 'Subject', 'Date', 'Start Time', 'End Time', 'Duration', 'Room', 'Teacher', 'Status'];
                          const rows = downloadExams.map(exam => [
                            exam.name || '',
                            exam.examType || '',
                            exam.subject?.name || '',
                            exam.date ? new Date(exam.date).toLocaleDateString() : '',
                            exam.startTime || exam.time || '',
                            exam.endTime || '',
                            getDuration(exam),
                            exam.room || 'N/A',
                            getExamTeacher(exam),
                            getExamStatus(exam),
                          ]);
                          const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Timetable_Grade${selectedGrade}_Section${selectedSection}_${selectedExamName.replace(/\s+/g, '_')}.csv`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(102,126,234,0.35)' }}
                      >
                        ⬇️ CSV
                      </button>
                      <button
                        onClick={() => {
                          alert('Generating PDF... (Feature under development)');
                          window.print();
                        }}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }}
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => {
                          alert('Downloading Word Document... (Feature under development)');
                        }}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}
                      >
                        📝 Word
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ── TOP PERFORMERS ────────────────────────────────────── */}
          {activeTab === 'performance' && (
            <div className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.2rem' }}>📈</span>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Top 10 Performers</h2>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <select value={perfGrade} onChange={e => { setPerfGrade(e.target.value); setPerfSection(''); setPerfSubject(''); }} style={selectStyle()}>
                  <option value="">Select Grade</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>

                <select value={perfSection} disabled={!perfGrade} onChange={e => { setPerfSection(e.target.value); setPerfSubject(''); }} style={selectStyle(!!perfGrade)}>
                  <option value="">Select Section</option>
                  {perfSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>

                <select value={perfSubject} disabled={!perfGrade || !perfSection} onChange={e => setPerfSubject(e.target.value)} style={selectStyle(!!(perfGrade && perfSection))}>
                  <option value="">Select Subject</option>
                  {subjects.map(sub => <option key={sub._id} value={sub.name}>{sub.name}</option>)}
                </select>
              </div>

              {topPerformers.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Rank</th>
                        <th>Student Name</th>
                        <th>Average Marks</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerformers.map((student, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </td>
                          <td>{student.name}</td>
                          <td style={{ fontWeight: 'bold' }}>{student.average}/100</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '100px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${student.average}%`, height: '100%', backgroundColor: student.average >= 80 ? '#10b981' : student.average >= 60 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span style={{ fontSize: '0.85em' }}>{student.average}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>No marks data available.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalExamManagement;
