import React, { useState, useEffect } from 'react';
import { examService, classService } from '../../services/api';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedExamName, setSelectedExamName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    examType: 'Unit Test',
    class: '',
    subject: '',
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

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAll();
      setExams(response.data);
    } catch (err) {
      setError('Failed to fetch exams');
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
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects();
      setSubjects(response.data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!formData.class) {
      alert('Please select a class.');
      return;
    }
    if (subjects.length === 0) {
      alert('No subjects found to schedule exams for.');
      return;
    }
    try {
      setError('');
      // Create exam for each subject
      const promises = subjects.map((subject) => {
        return examService.add({
          name: formData.name,
          class: formData.class,
          subject: subject._id,
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
        name: '',
        class: '',
        subject: '',
        examDate: '',
        startTime: '',
        endTime: '',
        totalMarks: '100',
        room: '',
        description: '',
      });
      setShowForm(false);
      fetchExams();
      alert('Exams created for all subjects successfully!');
    } catch (err) {
      setError('Failed to add exams: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteExamGroup = async (ids) => {
    if (window.confirm('Are you sure you want to delete these exams?')) {
      try {
        await Promise.all(ids.map(id => examService.delete(id)));
        fetchExams();
      } catch (err) {
        setError('Failed to delete exams');
      }
    }
  };

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const examNameOptions = [...new Set(exams.map(e => e.examType || e.name.split(' - ')[0]).filter(Boolean))].sort();

  const visibleExams = exams.filter((exam) => {
    const matchClass = !selectedClassId || String(exam.class?._id || exam.class || exam.classId) === String(selectedClassId);
    const examNameClean = exam.examType || exam.name?.split(' - ')[0] || 'Unknown';
    const matchExamName = !selectedExamName || examNameClean === selectedExamName;

    return matchClass && matchExamName;
  }).sort((a, b) => new Date(a.examDate || new Date()) - new Date(b.examDate || new Date()));

  const getExamDate = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const getExamDay = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  };

  const uniqueExamsMap = new Map();
  visibleExams.forEach(exam => {
    const key = `${getExamDate(exam.examDate)}-${exam.subject?.name || exam.subject}`;
    if (!uniqueExamsMap.has(key)) {
      uniqueExamsMap.set(key, { 
        ...exam, 
        _ids: [exam._id], 
        rooms: [exam.room].filter(Boolean),
        invigilators: [`${exam.invigilator?.firstName || ''} ${exam.invigilator?.lastName || ''}`.trim()].filter(Boolean)
      });
    } else {
      const existing = uniqueExamsMap.get(key);
      if (exam._id) existing._ids.push(exam._id);
      if (exam.room && !existing.rooms.includes(exam.room)) existing.rooms.push(exam.room);
      const invig = `${exam.invigilator?.firstName || ''} ${exam.invigilator?.lastName || ''}`.trim();
      if (invig && !existing.invigilators.includes(invig)) existing.invigilators.push(invig);
    }
  });

  const uniqueVisibleExams = Array.from(uniqueExamsMap.values()).map(g => ({
    ...g,
    room: g.rooms.length > 2 ? `${g.rooms[0]}, ${g.rooms[1]} (+${g.rooms.length - 2} more)` : (g.rooms.join(', ') || 'N/A'),
    invigilatorName: g.invigilators.length > 2 ? `${g.invigilators[0]}, ${g.invigilators[1]} (+${g.invigilators.length - 2} more)` : (g.invigilators.join(', ') || 'N/A')
  }));



  const getStatus = (dateString) => {
    const examDate = dateString ? new Date(dateString) : new Date();
    const today = new Date();
    examDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (examDate < today) return 'Completed';
    if (examDate.getTime() === today.getTime()) return 'Ongoing';
    return 'Upcoming';
  };

  const isToday = (dateString) => {
    const examDate = dateString ? new Date(dateString) : new Date();
    const today = new Date();
    return examDate.toDateString() === today.toDateString();
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 Exams Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Filter & Search</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => {
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
                <style>body{font-family:Arial,sans-serif;padding:20px}h1{text-align:center;color:#1e293b}
                table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left;font-size:13px}
                th{background:#f1f5f9;color:#475569;text-transform:uppercase;font-size:11px}</style></head>
                <body><h1>📋 Exam Timetable</h1><p style="text-align:center;color:#64748b;font-weight:bold;font-size:14px;text-transform:uppercase;">${selectedExamName ? selectedExamName + ' EXAMS' : 'ALL EXAMS'}</p>
                <table><thead><tr><th>Date</th><th>Day</th><th>Subject</th><th>Room</th></tr></thead>
                <tbody>${rows}</tbody></table>
                </body></html>`);
              printWin.document.close();
              printWin.print();
            }} style={{ background: '#475569', borderColor: '#475569' }}>🖨️ Print Timetable</button>
            <button className="btn btn-primary" onClick={() => {
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
            }} style={{ background: '#dc2626', borderColor: '#dc2626' }}>📄 Export PDF</button>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel Form' : '➕ Add Exam'}
            </button>
          </div>
        </div>
        
        <div className="form-row" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">All Grades</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!sectionsForGrade.length} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">All Sections</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <select value={selectedExamName} onChange={(e) => setSelectedExamName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">All Exam Types</option>
              {examNameOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Exam</h3>
          <form onSubmit={handleAddExam}>
            <div className="form-row">
              <div className="form-group">
                <label>Exam Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Unit Test 1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Exam Type</label>
                <select name="examType" value={formData.examType || 'Unit Test'} onChange={handleInputChange} required>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Final</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class</label>
                <select name="class" value={formData.class} onChange={handleInputChange} required>
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
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

            <button type="submit" className="btn btn-primary">Save Exam</button>
          </form>
        </div>
      )}

      {uniqueVisibleExams.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          No exams found matching your criteria.
        </p>
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
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uniqueVisibleExams.map((exam) => {
                const status = getStatus(exam.examDate);
                const isHighlight = isToday(exam.examDate);
                
                return (
                  <tr key={exam._ids[0]} style={{ borderBottom: '1px solid #e2e8f0', background: isHighlight ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {getExamDate(exam.examDate)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{getExamDay(exam.examDate)}</td>
                    <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600' }}>{exam.subject?.name || exam.subject || 'Unknown'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.room}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.invigilatorName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleDeleteExamGroup(exam._ids)}
                        style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        Delete
                      </button>
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
