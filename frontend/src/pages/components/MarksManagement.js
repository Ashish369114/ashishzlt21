import React, { useState, useEffect } from 'react';
import { marksService, studentService, classService, teacherService } from '../../services/api';

const getId = (value) => value?._id?.toString?.() || value?.toString?.() || '';

const MarksManagement = ({ teacherUserId }) => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    class: '',
    marks: '',
    examType: 'Unit Test',
    examDate: '',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser) {
      setCurrentUser(parsedUser);
    }

    fetchMarks();
    fetchSubjects();
    fetchStudents();
    fetchClasses();

    const isTeacher = parsedUser?.role === 'teacher' || Boolean(teacherUserId);
    const teacherId = teacherUserId || parsedUser?._id || parsedUser?.id || parsedUser?.userId;
    if (isTeacher && teacherId) {
      fetchTeacherProfile(teacherId);
    }
  }, [teacherUserId]);

  useEffect(() => {
    if (!classes.length) {
      setSelectedGrade('');
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }
  }, [classes]);

  useEffect(() => {
    if (!classes.length || !selectedGrade) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudentId('');
      return;
    }

    const gradeClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map((cls) => cls.section).filter(Boolean))].sort();
    if (!sections.length) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudentId('');
      return;
    }

    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
    }

    const matchedClass = gradeClasses.find((cls) => String(cls.section) === String(selectedSection || ''));
    setSelectedClassId(matchedClass?._id || matchedClass?.id || '');
    setSelectedStudentId('');
    setSelectedExamType('');
  }, [classes, selectedGrade, selectedSection]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const response = await marksService.getAll();
      setMarks(response.data);
    } catch (err) {
      setError('Failed to fetch marks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchTeacherProfile = async (userId) => {
    try {
      const response = await teacherService.getByUserId(userId);
      const foundTeacher = response.data;

      if (foundTeacher?.assignedClasses?.length) {
        const assignedClassIds = new Set(foundTeacher.assignedClasses.map((cls) => getId(cls)));
        const responseStudents = await studentService.getAll();
        const filteredStudents = (responseStudents.data || []).filter((student) => {
          const studentClassId = getId(student.class);
          return assignedClassIds.has(studentClassId);
        });
        setStudents(filteredStudents);

        const responseClasses = await classService.getAll();
        const filteredClasses = (responseClasses.data || []).filter((cls) => assignedClassIds.has(getId(cls)));
        setClasses(filteredClasses);
      } else {
        const responseStudents = await studentService.getAll();
        setStudents(responseStudents.data || []);

        const responseClasses = await classService.getAll();
        setClasses(responseClasses.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch teacher profile:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized: please log in again.');
      }
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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

  const handleAddMarks = async (e) => {
    e.preventDefault();
    if (!currentUser?.id && !currentUser?._id && !currentUser?.userId) {
      setError('Could not determine current user. Please log in again.');
      return;
    }

    const payload = {
      ...formData,
      teacher: currentUser._id || currentUser.id || currentUser.userId,
    };

    if (!payload.student || !payload.subject || !payload.class || !payload.marks) {
      setError('Please select a student, class, subject, and enter marks before saving.');
      return;
    }

    try {
      await marksService.add(payload);
      setFormData({
        student: '',
        subject: '',
        class: '',
        marks: '',
        examType: 'Unit Test',
        examDate: '',
      });
      setShowForm(false);
      fetchMarks();
      setError('');
    } catch (err) {
      setError('Failed to add marks: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  const gradeOptions = Array.from({ length: 10 }, (_, index) => String(index + 1));
  const visibleClasses = selectedGrade
    ? classes.filter((cls) => String(cls.grade) === String(selectedGrade))
    : classes;
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const classStudents = students.filter((student) => {
    const studentClassId = student.class?._id || student.class;
    return String(studentClassId) === String(selectedClassId);
  });
  const visibleMarks = marks.filter((mark) => {
    if (!selectedClassId) return true;
    const markClassId = mark.class?._id || mark.class || mark.classId;
    if (String(markClassId) !== String(selectedClassId)) return false;

    if (selectedStudentId) {
      const markStudentId = mark.student?._id || mark.student || mark.studentId;
      if (String(markStudentId) !== String(selectedStudentId)) return false;
    }

    if (selectedExamType) {
      if (String(mark.examType) !== String(selectedExamType)) return false;
    }
    return true;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h2>📝 Marks Management</h2>
        {selectedClassId && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '➕ Add Marks'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <div className="form-group">
            <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedClassId(''); setSelectedStudentId(''); }}>
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!sectionsForGrade.length}>
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedClassId}>
              <option value="">All Students</option>
              {classStudents.map((student) => (
                <option key={student._id} value={student.userId?._id || student.userId}>
                  {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)} disabled={!selectedClassId}>
              <option value="">All Exams</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Mid-Term">Mid-Term</option>
              <option value="Final">Final</option>
              <option value="Practical">Practical</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add Student Marks</h3>
          <form onSubmit={handleAddMarks}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student.userId?._id || student.userId}>
                      {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                    </option>
                  ))}
                </select>
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
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Marks (0-100)</label>
                <input
                  type="number"
                  name="marks"
                  min="0"
                  max="100"
                  value={formData.marks}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam Type</label>
                <select name="examType" value={formData.examType} onChange={handleInputChange} required>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Final</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Save Marks</button>
          </form>
        </div>
      )}

      {!selectedClassId ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          Select a grade and section to view marks.
        </p>
      ) : loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Guardian</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Exam Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleMarks.map((mark) => {
                const studentName = mark.student?.firstName
                  ? `${mark.student.firstName} ${mark.student.lastName}`
                  : mark.student?.userId
                  ? `${mark.student.userId.firstName || ''} ${mark.student.userId.lastName || ''}`.trim()
                  : 'N/A';

                const guardianName = mark.student?.parentId?.firstName
                  ? `${mark.student.parentId.firstName} ${mark.student.parentId.lastName}`
                  : 'N/A';

                return (
                  <tr key={mark._id}>
                    <td>{studentName || 'N/A'}</td>
                    <td>{guardianName}</td>
                    <td>{mark.class ? `Grade ${mark.class.grade} - Section ${mark.class.section}` : 'N/A'}</td>
                    <td>{mark.subject?.name || mark.subject || 'N/A'}</td>
                    <td>{mark.marks}</td>
                    <td>{mark.examType}</td>
                    <td>{mark.examDate ? new Date(mark.examDate).toLocaleDateString() : 'N/A'}</td>
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

export default MarksManagement;
