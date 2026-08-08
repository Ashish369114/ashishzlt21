import React, { useState, useEffect } from 'react';
import { examService, classService, teacherService } from '../../services/api';
import { demoExams, demoClasses, demoEmployees } from '../../utils/demoData';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedExamName, setSelectedExamName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formSection, setFormSection] = useState('');
  const [customExamType, setCustomExamType] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [formData, setFormData] = useState({
    examType: 'Unit Test',
    subject: '',
    invigilator: '',
    examDate: '',
    startTime: '',
    endTime: '',
    totalMarks: '100',
    room: '',
    description: '',
  });

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
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

    const visibleClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sectionOptions = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();

    if (selectedSection && !sectionOptions.includes(selectedSection)) {
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    const targetClass = visibleClasses.find((cls) => cls.section === selectedSection);
    setSelectedClassId(targetClass ? (targetClass.id || targetClass._id) : '');
  }, [classes, selectedGrade, selectedSection]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await examService.getAll();
      const loaded = (response.data && response.data.length) ? response.data : demoExams;
      setExams(loaded);
    } catch (err) {
      console.warn('Using demo exams:', err);
      setExams(demoExams);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      const loaded = response.data && response.data.length ? response.data : demoClasses;
      setClasses(loaded);
    } catch (err) {
      console.warn('Using demo classes:', err);
      setClasses(demoClasses);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects();
      const loaded = response.data && response.data.length ? response.data : [
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'English' },
        { id: 4, name: 'Social Science' }
      ];
      setSubjects(loaded);
    } catch (err) {
      console.warn('Using demo subjects:', err);
      setSubjects([
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'English' },
        { id: 4, name: 'Social Science' }
      ]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(response.data && response.data.length ? response.data : demoEmployees);
    } catch (err) {
      console.warn('Using demo teachers:', err);
      setTeachers(demoEmployees);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!formGrade || !formSection) {
      alert('Please select both Grade and Section.');
      return;
    }

    const matchedClass = classes.find((cls) => String(cls.grade) === String(formGrade) && String(cls.section) === String(formSection));
    const targetClassId = matchedClass ? (matchedClass.id || matchedClass._id) : null;
    if (!targetClassId) {
      alert('Selected Grade and Section combination not found.');
      return;
    }

    if (formData.examDate) {
      const selectedDate = new Date(formData.examDate);
      if (selectedDate.getDay() === 0) {
        alert('⚠️ Exams cannot be scheduled on Sundays. Please select a working weekday (Monday - Saturday).');
        return;
      }
    }

    const effectiveExamType = formData.examType === 'Other' ? (customExamType.trim() || 'Custom Exam') : formData.examType;
    const effectiveExamName = effectiveExamType;

    try {
      setError('');
      let subjectsToCreate = [];

      if (formData.subject === 'Other') {
        if (!customSubject.trim()) {
          alert('Please enter custom subject name.');
          return;
        }
        subjectsToCreate = [customSubject.trim()];
      } else if (formData.subject) {
        subjectsToCreate = [formData.subject];
      } else {
        if (!subjects || subjects.length === 0) {
          alert('No subjects found to schedule exams for.');
          return;
        }
        subjectsToCreate = subjects.map(s => typeof s === 'object' ? (s.id || s._id || s.name) : s);
      }

      const promises = subjectsToCreate.map((subj) => {
        return examService.add({
          name: effectiveExamName,
          examType: effectiveExamType,
          class: targetClassId,
          subject: subj,
          invigilator: formData.invigilator || null,
          examDate: formData.examDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          totalMarks: Number(formData.totalMarks) || 100,
          room: formData.room,
          description: formData.description,
        });
      });

      await Promise.all(promises);
      setFormData({
        examType: 'Unit Test',
        subject: '',
        invigilator: '',
        examDate: '',
        startTime: '',
        endTime: '',
        totalMarks: '100',
        room: '',
        description: '',
      });
      setFormGrade('');
      setFormSection('');
      setCustomExamType('');
      setCustomSubject('');
      setShowForm(false);
      await fetchExams();
      alert('Exam(s) scheduled successfully!');
    } catch (err) {
      console.error('Failed to add exam:', err);
      setError('Failed to add exams: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedExamIds, setSelectedExamIds] = useState([]);

  const handleDeleteExamGroup = async (ids) => {
    const validIds = (ids || []).filter(Boolean);
    if (validIds.length === 0) {
      alert('No valid exam IDs found to delete.');
      return;
    }
    if (window.confirm('Are you sure you want to delete these exam(s)?')) {
      try {
        await Promise.all(validIds.map(id => examService.delete(id)));
        await fetchExams();
      } catch (err) {
        console.error('Failed to delete exams:', err);
        setError('Failed to delete exams: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExamIds.length === 0) {
      alert('Please select at least one exam to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedExamIds.length} selected exam(s)?`)) {
      try {
        await Promise.all(selectedExamIds.map(id => examService.delete(id)));
        setSelectedExamIds([]);
        await fetchExams();
        alert('Selected exam(s) deleted successfully!');
      } catch (err) {
        console.error('Failed to bulk delete exams:', err);
        setError('Failed to delete exams: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleSelectExamGroup = (examGroupIds) => {
    const idsToToggle = (examGroupIds || []).filter(Boolean);
    const isAllSelected = idsToToggle.every(id => selectedExamIds.includes(id));
    if (isAllSelected) {
      setSelectedExamIds(prev => prev.filter(id => !idsToToggle.includes(id)));
    } else {
      setSelectedExamIds(prev => [...new Set([...prev, ...idsToToggle])]);
    }
  };

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const examNameOptions = [...new Set(exams.map(e => e.examType || e.name?.split(' - ')[0]).filter(Boolean))].sort();

  const ensureNoSunday = (dateString) => {
    if (!dateString) return new Date();
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return new Date();
    // Sunday is 0: if day is Sunday, shift to Monday (+1 day)
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  };

  const getExamDate = (dateString) => {
    const d = ensureNoSunday(dateString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const getExamDay = (dateString) => {
    const d = ensureNoSunday(dateString);
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  };

  const visibleExams = exams.filter((exam) => {
    const examClassId = exam.class?.id || exam.class?._id || exam.class || exam.classId;
    const matchClass = !selectedClassId || String(examClassId) === String(selectedClassId);
    const examNameClean = exam.examType || exam.name?.split(' - ')[0] || 'Unknown';
    const matchExamName = !selectedExamName || examNameClean === selectedExamName;

    return matchClass && matchExamName;
  }).sort((a, b) => {
    const gradeA = Number(a.class?.grade || a.grade || 0);
    const gradeB = Number(b.class?.grade || b.grade || 0);
    if (gradeA !== gradeB) return gradeA - gradeB;

    const secA = String(a.class?.section || a.section || '').toUpperCase();
    const secB = String(b.class?.section || b.section || '').toUpperCase();
    if (secA !== secB) return secA.localeCompare(secB);

    const dA = ensureNoSunday(a.examDate || a.date || 0);
    const dB = ensureNoSunday(b.examDate || b.date || 0);
    if (dA.getTime() !== dB.getTime()) return dA - dB;

    const subjA = typeof a.subject === 'object' ? (a.subject?.name || '') : String(a.subject || '');
    const subjB = typeof b.subject === 'object' ? (b.subject?.name || '') : String(b.subject || '');
    return subjA.localeCompare(subjB);
  });

  const uniqueExamsMap = new Map();
  visibleExams.forEach(exam => {
    const examId = exam.id || exam._id;
    const key = `${getExamDate(exam.examDate)}-${exam.subject?.name || exam.subject || 'Unknown'}-${exam.class?.grade || exam.classId || ''}`;
    if (!uniqueExamsMap.has(key)) {
      uniqueExamsMap.set(key, { 
        ...exam, 
        _ids: examId ? [examId] : [], 
        rooms: [exam.room].filter(Boolean),
        invigilators: [`${exam.invigilator?.user?.firstName || exam.invigilator?.firstName || ''} ${exam.invigilator?.user?.lastName || exam.invigilator?.lastName || ''}`.trim()].filter(Boolean)
      });
    } else {
      const existing = uniqueExamsMap.get(key);
      if (examId && !existing._ids.includes(examId)) existing._ids.push(examId);
      if (exam.room && !existing.rooms.includes(exam.room)) existing.rooms.push(exam.room);
      const invig = `${exam.invigilator?.user?.firstName || exam.invigilator?.firstName || ''} ${exam.invigilator?.user?.lastName || exam.invigilator?.lastName || ''}`.trim();
      if (invig && !existing.invigilators.includes(invig)) existing.invigilators.push(invig);
    }
  });

  const uniqueVisibleExams = Array.from(uniqueExamsMap.values()).map(g => ({
    ...g,
    room: g.rooms.length > 2 ? `${g.rooms[0]}, ${g.rooms[1]} (+${g.rooms.length - 2} more)` : (g.rooms.join(', ') || 'N/A'),
    invigilatorName: g.invigilators.length > 2 ? `${g.invigilators[0]}, ${g.invigilators[1]} (+${g.invigilators.length - 2} more)` : (g.invigilators.join(', ') || 'N/A')
  }));

  const isToday = (dateString) => {
    const examDate = dateString ? new Date(dateString) : new Date();
    const today = new Date();
    return examDate.toDateString() === today.toDateString();
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '50px',
            background: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>📋 Exams Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: '24px', padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 15px 35px -10px rgba(12, 74, 134, 0.08), 0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0C4A86', letterSpacing: '-0.3px' }}>Filter & Search</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Select parameters to display or manage scheduled exams</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => {
              const printWin = window.open('', '_blank');
              const rows = uniqueVisibleExams.map(exam => {
                return `<tr>
                  <td>${getExamDate(exam.examDate)}</td>
                  <td>${getExamDay(exam.examDate)}</td>
                  <td>${exam.subject?.name || exam.subject || 'Unknown'}</td>
                  <td>${exam.room === 'N/A' ? '-' : exam.room}</td>
                </tr>`;
              }).join('');
              printWin.document.write(`<html><head><title>Exam Timetable</title>
                <style>body{font-family:Arial,sans-serif;padding:20px}h1{text-align:center;color:#0C4A86}
                table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left;font-size:13px}
                th{background:#f1f5f9;color:#475569;text-transform:uppercase;font-size:11px}</style></head>
                <body><h1>📋 Exam Timetable</h1><p style="text-align:center;color:#64748b;font-weight:bold;font-size:14px;text-transform:uppercase;">${selectedExamName ? selectedExamName + ' EXAMS' : 'ALL EXAMS'}</p>
                <table><thead><tr><th>Date</th><th>Day</th><th>Subject</th><th>Room</th></tr></thead>
                <tbody>${rows}</tbody></table>
                </body></html>`);
              printWin.document.close();
              printWin.print();
            }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)' }}>
              🖨️ Print Timetable
            </button>

            <button onClick={() => {
              let csv = 'Date,Day,Subject,Room,Invigilator\n';
              uniqueVisibleExams.forEach(exam => {
                csv += `"${getExamDate(exam.examDate)}","${getExamDay(exam.examDate)}","${exam.subject?.name || exam.subject || 'Unknown'}","${exam.room}","${exam.invigilatorName}"\n`;
              });
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `exam_timetable_${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)' }}>
              📄 Export PDF
            </button>

            <button onClick={() => setShowForm(!showForm)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)' }}>
              {showForm ? '✖ Cancel Form' : '➕ Add Exam'}
            </button>

            <button
              onClick={() => {
                setIsDeleteMode(!isDeleteMode);
                setSelectedExamIds([]);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '50px',
                border: 'none',
                background: isDeleteMode ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isDeleteMode ? '0 4px 15px rgba(239, 68, 68, 0.3)' : '0 4px 15px rgba(20, 158, 242, 0.25)'
              }}
            >
              {isDeleteMode ? '✖ Exit Delete Mode' : '🗑️ Delete Exams'}
            </button>

            {isDeleteMode && selectedExamIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)', color: '#ffffff', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(185, 28, 28, 0.3)' }}
              >
                Confirm Delete ({selectedExamIds.length})
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Grade</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500', outline: 'none' }}>
              <option value="">All Grades</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!sectionsForGrade.length} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500', outline: 'none', opacity: !sectionsForGrade.length ? 0.6 : 1 }}>
              <option value="">All Sections</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Exam Type</label>
            <select value={selectedExamName} onChange={(e) => setSelectedExamName(e.target.value)} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500', outline: 'none' }}>
              <option value="">All Exam Types</option>
              {examNameOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isDeleteMode && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', color: '#991b1b', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ Delete Mode Active: Check items or click Delete on any row to delete exams.</span>
          <button onClick={() => setIsDeleteMode(false)} style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>✕ Exit</button>
        </div>
      )}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Exam</h3>
          <form onSubmit={handleAddExam}>
            <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Exam Type</label>
                <select name="examType" value={formData.examType || 'Unit Test'} onChange={handleInputChange} required>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Slip Test">Slip Test</option>
                  <option value="Admission Exam">Admission Exam</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Final">Final</option>
                  <option value="Practical">Practical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.examType === 'Other' && (
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Custom Exam Name / Type</label>
                  <input
                    type="text"
                    placeholder="Enter custom exam name..."
                    value={customExamType}
                    onChange={(e) => setCustomExamType(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Grade</label>
                <select value={formGrade} onChange={(e) => { setFormGrade(e.target.value); setFormSection(''); }} required>
                  <option value="">Select Grade</option>
                  {[...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)).map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Section</label>
                <select value={formSection} onChange={(e) => setFormSection(e.target.value)} required disabled={!formGrade}>
                  <option value="">Select Section</option>
                  {[...new Set(classes.filter((cls) => String(cls.grade) === String(formGrade)).map((cls) => cls.section).filter(Boolean))].sort().map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange}>
                  <option value="">All Subjects</option>
                  {subjects.map((sub) => {
                    const subId = typeof sub === 'object' ? (sub.id || sub._id) : sub;
                    const subName = typeof sub === 'object' ? sub.name : sub;
                    return (
                      <option key={subId || subName} value={subId}>
                        {subName}
                      </option>
                    );
                  })}
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.subject === 'Other' && (
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Custom Subject Name</label>
                  <input
                    type="text"
                    placeholder="Enter custom subject name..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Invigilators</label>
                <select name="invigilator" value={formData.invigilator} onChange={handleInputChange}>
                  <option value="">Select Invigilator (Optional)</option>
                  {teachers.map((t) => {
                    const tId = t.id || t._id;
                    const name = t.user 
                      ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim()
                      : `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name || `Teacher ${tId}`;
                    return (
                      <option key={tId} value={tId}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Marks</label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', color: '#ffffff', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)' }}>💾 Save Exam</button>
          </form>
        </div>
      )}

      {!selectedGrade && !selectedSection && !selectedExamName ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #0096DA', boxShadow: '0 10px 25px -5px rgba(12, 74, 134, 0.05)' }}>
          <p style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0C4A86', margin: '0 0 8px 0' }}>🔍 Please select a Grade, Section, or Exam Type above</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Select any filter option to view the scheduled exam timetable.</p>
        </div>
      ) : uniqueVisibleExams.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          No exams found matching your selected criteria.
        </p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(12, 74, 134, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#EBF5FF', color: '#0C4A86', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isDeleteMode && (
                  <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1', width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allIds = uniqueVisibleExams.flatMap(g => g._ids?.length ? g._ids : [g.id || g._id]).filter(Boolean);
                          setSelectedExamIds(allIds);
                        } else {
                          setSelectedExamIds([]);
                        }
                      }}
                      checked={selectedExamIds.length > 0 && selectedExamIds.length === uniqueVisibleExams.flatMap(g => g._ids?.length ? g._ids : [g.id || g._id]).filter(Boolean).length}
                    />
                  </th>
                )}
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Date</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Day</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Subject</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Room</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Invigilator</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {uniqueVisibleExams.map((exam, idx) => {
                const isHighlight = isToday(exam.examDate);
                const examIds = exam._ids?.length ? exam._ids : [exam.id || exam._id];
                const rowKey = examIds.join('-') || `exam-${idx}`;
                const isRowSelected = examIds.length > 0 && examIds.every(id => selectedExamIds.includes(id));

                return (
                  <tr key={rowKey} style={{ borderBottom: '1px solid #e2e8f0', background: isRowSelected ? '#fee2e2' : isHighlight ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                    {isDeleteMode && (
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => toggleSelectExamGroup(examIds)}
                        />
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {getExamDate(exam.examDate)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{getExamDay(exam.examDate)}</td>
                    <td style={{ padding: '14px 16px', color: '#0C4A86', fontWeight: '700' }}>{typeof exam.subject === 'object' ? (exam.subject?.name || 'Unknown') : (exam.subject || 'Unknown')}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.room}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.invigilatorName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {isDeleteMode ? (
                        <button
                          onClick={() => handleDeleteExamGroup(examIds)}
                          style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          🗑️ Delete
                        </button>
                      ) : (
                        <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                          Scheduled
                        </span>
                      )}
                    </td>
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
  );
};

export default ExamManagement;
