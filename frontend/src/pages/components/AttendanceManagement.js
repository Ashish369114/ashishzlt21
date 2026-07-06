import React, { useState, useEffect } from 'react';
import { attendanceService, studentService, classService } from '../../services/api';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    date: '',
    status: 'Present',
    remarks: '',
  });

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchClasses();
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

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAll();
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to fetch attendance');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.mark(formData);
      setFormData({
        student: '',
        class: '',
        date: '',
        status: 'Present',
        remarks: '',
      });
      setShowForm(false);
      fetchAttendance();
    } catch (err) {
      setError('Failed to mark attendance');
    }
  };

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const visibleAttendance = attendance.filter((record) => {
    if (!selectedClassId) return true;
    const recordClassId = record.class?._id || record.class || record.classId;
    return String(recordClassId) === String(selectedClassId);
  });

  const sectionStudents = selectedClassId
    ? students.filter((student) => {
      const studentClassId = student.class?._id || student.class || student.classId;
      return String(studentClassId) === String(selectedClassId);
    })
    : [];

  const selectedDate = formData.date || new Date().toISOString().slice(0, 10);

  const getAttendanceRecord = (studentId) => {
    return visibleAttendance.find((record) => {
      const recordStudentId = record.student?._id || record.student;
      const recordDate = record.date ? new Date(record.date).toISOString().slice(0, 10) : '';
      return String(recordStudentId) === String(studentId) && recordDate === selectedDate;
    });
  };

  const handleQuickAttendance = async (studentId, status) => {
    if (!selectedClassId) {
      setError('Select a class before marking attendance.');
      return;
    }

    const payload = {
      student: studentId,
      class: selectedClassId,
      date: selectedDate,
      status,
      remarks: '',
    };

    try {
      const existing = getAttendanceRecord(studentId);
      if (existing) {
        await attendanceService.update(existing._id, payload);
      } else {
        await attendanceService.mark(payload);
      }
      fetchAttendance();
    } catch (err) {
      setError(`Failed to mark ${status.toLowerCase()} for student.`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Attendance Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <h3>Filter attendance by class</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Grade</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!sectionsForGrade.length}>
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Mark Attendance</h3>
          <form onSubmit={handleMarkAttendance}>
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
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} required>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Half-day">Half-day</option>
                </select>
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="textarea"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Mark Attendance</button>
          </form>
        </div>
      )}

      {selectedClassId && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Quick Attendance</h3>
          <p>Click Present or Absent to submit attendance immediately for the selected class and date.</p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Status for {selectedDate}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sectionStudents.map((student) => {
                  const studentId = student.userId?._id || student.userId;
                  const existing = getAttendanceRecord(studentId);
                  return (
                    <tr key={student._id}>
                      <td>{student.userId?.firstName} {student.userId?.lastName}</td>
                      <td>{student.rollNumber || '-'}</td>
                      <td>{existing ? existing.status : 'Not marked'}</td>
                      <td>
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => handleQuickAttendance(studentId, 'Present')}
                          style={{ marginRight: '8px' }}
                        >
                          Present
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleQuickAttendance(studentId, 'Absent')}
                        >
                          Absent
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

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {visibleAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>{record.student?.firstName} {record.student?.lastName}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: record.status === 'Present' ? '#d1fae5' : '#fee2e2',
                        color: record.status === 'Present' ? '#065f46' : '#991b1b',
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '➕ Mark Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
