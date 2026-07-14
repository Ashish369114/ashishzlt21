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
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
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

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.delete(id);
        fetchExams();
      } catch (err) {
        setError('Failed to delete exam');
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
    const matchSubject = !searchSubject || (exam.subject?.name || exam.subject || '').toLowerCase().includes(searchSubject.toLowerCase());
    
    // Calculate simulated status for filtering
    const examDate = exam.examDate ? new Date(exam.examDate) : new Date();
    const today = new Date();
    examDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    let status = 'Upcoming';
    if (examDate < today) status = 'Completed';
    else if (examDate.getTime() === today.getTime()) status = 'Ongoing';
    
    const matchStatus = !selectedStatus || status === selectedStatus;

    return matchClass && matchExamName && matchSubject && matchStatus;
  }).sort((a, b) => new Date(a.examDate || new Date()) - new Date(b.examDate || new Date()));

  const getExamDate = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const getExamDay = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  };

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
            <button className="btn btn-primary" onClick={() => alert('Printing Timetable...')} style={{ background: '#475569', borderColor: '#475569' }}>🖨️ Print Timetable</button>
            <button className="btn btn-primary" onClick={() => alert('Exporting as PDF...')} style={{ background: '#dc2626', borderColor: '#dc2626' }}>📄 Export PDF</button>
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
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '2 1 200px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search by Subject..." 
              value={searchSubject} 
              onChange={(e) => setSearchSubject(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
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

      {visibleExams.length === 0 ? (
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
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Time</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Subject</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Exam Type</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Grade</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Section</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Room</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Invigilator</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Duration</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Status</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #cbd5e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleExams.map((exam) => {
                const status = getStatus(exam.examDate);
                const isHighlight = isToday(exam.examDate);
                
                // Calculate simulated duration if missing
                let durationStr = '120 mins';
                if (exam.startTime && exam.endTime) {
                  const start = new Date(`1970-01-01T${exam.startTime}`);
                  const end = new Date(`1970-01-01T${exam.endTime}`);
                  const diff = (end - start) / 60000;
                  if (diff > 0) durationStr = `${diff} mins`;
                }
                
                return (
                  <tr key={exam._id} style={{ borderBottom: '1px solid #e2e8f0', background: isHighlight ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {getExamDate(exam.examDate)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{getExamDay(exam.examDate)}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', whiteSpace: 'nowrap' }}>{exam.startTime ? `${exam.startTime} – ${exam.endTime}` : '09:00 – 11:00'}</td>
                    <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600' }}>{exam.subject?.name || exam.subject || 'Unknown'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.examType || exam.name?.split(' - ')[0] || 'Term Exam'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', whiteSpace: 'nowrap' }}>Grade {exam.class?.grade || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.class?.section || 'A'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.room || 'Room 21'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{exam.invigilator?.firstName || 'Ramesh'} {exam.invigilator?.lastName || 'Sharma'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{durationStr}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                        background: status === 'Completed' ? '#dcfce7' : status === 'Ongoing' ? '#fef3c7' : '#e0f2fe',
                        color: status === 'Completed' ? '#166534' : status === 'Ongoing' ? '#b45309' : '#0369a1'
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
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
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
