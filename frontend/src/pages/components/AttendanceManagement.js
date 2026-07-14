import React, { useState, useEffect } from 'react';
import { attendanceService, studentService, classService, schoolService } from '../../services/api';

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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    date: '',
    status: 'Present',
    remarks: '',
  });

  const [school, setSchool] = useState(null);

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchClasses();
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const response = await schoolService.getAll();
      if (response.data?.length > 0) {
        setSchool(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch school:', err);
    }
  };



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
    if (String(recordClassId) !== String(selectedClassId)) return false;
    
    if (selectedMonth) {
      const recordDate = new Date(record.date);
      const recordMonthStr = String(recordDate.getMonth() + 1).padStart(2, '0');
      if (recordMonthStr !== selectedMonth) return false;
    }

    if (selectedWeek) {
      const recordDate = new Date(record.date);
      const dateNum = recordDate.getDate();
      if (selectedWeek === '1' && (dateNum < 1 || dateNum > 7)) return false;
      if (selectedWeek === '2' && (dateNum < 8 || dateNum > 14)) return false;
      if (selectedWeek === '3' && (dateNum < 15 || dateNum > 21)) return false;
      if (selectedWeek === '4' && (dateNum < 22 || dateNum > 28)) return false;
      if (selectedWeek === '5' && dateNum < 29) return false;
    }

    if (selectedStudentId) {
      const recordStudentId = record.student?._id || record.student || record.studentId;
      return String(recordStudentId) === String(selectedStudentId);
    }
    return true;
  });

  const getAttendanceSummary = () => {
    if (!selectedClassId) return null;

    let presentDays = visibleAttendance.filter(r => String(r.status).toLowerCase() === 'present').length;
    let absentDays = visibleAttendance.filter(r => String(r.status).toLowerCase() === 'absent').length;

    let totalCalendarDays = 0;
    let rangeHolidays = 0;
    let weekendCount = 0;

    const currentYear = new Date().getFullYear();
    let startDate, endDate;

    if (selectedMonth) {
      startDate = new Date(currentYear, parseInt(selectedMonth, 10) - 1, 1);
      endDate = new Date(currentYear, parseInt(selectedMonth, 10), 0);
      if (selectedWeek) {
        const startDay = selectedWeek === '1' ? 1 :
                         selectedWeek === '2' ? 8 :
                         selectedWeek === '3' ? 15 :
                         selectedWeek === '4' ? 22 : 29;
        const endDay = selectedWeek === '1' ? 7 :
                       selectedWeek === '2' ? 14 :
                       selectedWeek === '3' ? 21 :
                       selectedWeek === '4' ? 28 : endDate.getDate();
        startDate.setDate(startDay);
        endDate.setDate(endDay);
      }
    } else if (visibleAttendance.length > 0) {
      const dates = visibleAttendance.map(r => new Date(r.date));
      startDate = new Date(Math.min(...dates));
      endDate = new Date(Math.max(...dates));
    }

    if (startDate && endDate) {
      startDate.setHours(0,0,0,0);
      endDate.setHours(0,0,0,0);
      const diffTime = Math.abs(endDate - startDate);
      totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const holidaysList = school?.schoolSettings?.holidays || [];
      rangeHolidays = holidaysList.filter(hDate => {
        const d = new Date(hDate);
        d.setHours(0,0,0,0);
        const day = d.getDay();
        const isSunday = day === 0;
        const isSecondSaturday = (day === 6 && d.getDate() >= 8 && d.getDate() <= 14);
        return d >= startDate && d <= endDate && !isSunday && !isSecondSaturday;
      }).length;

      let tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        const day = tempDate.getDay();
        const isSunday = day === 0;
        const isSecondSaturday = (day === 6 && tempDate.getDate() >= 8 && tempDate.getDate() <= 14);
        if (isSunday || isSecondSaturday) {
          weekendCount++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      totalCalendarDays = visibleAttendance.length;
      rangeHolidays = 0;
    }

    const schoolWorkingDays = Math.max(0, totalCalendarDays - rangeHolidays - weekendCount);

    if (!selectedStudentId && sectionStudents.length > 0) {
      presentDays = Math.round(presentDays / sectionStudents.length);
    }
    absentDays = Math.max(0, schoolWorkingDays - presentDays);

    const attendancePercentage = schoolWorkingDays > 0 ? ((presentDays / schoolWorkingDays) * 100).toFixed(2) : '0.00';

    return {
      totalCalendarDays,
      schoolWorkingDays,
      presentDays,
      absentDays,
      attendancePercentage,
    };
  };

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

  let displayRecords = [...visibleAttendance];
  if (selectedStudentId && selectedMonth) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, parseInt(selectedMonth, 10) - 1, 1);
    const endDate = new Date(currentYear, parseInt(selectedMonth, 10), 0);
    if (selectedWeek) {
      const startDay = selectedWeek === '1' ? 1 :
                       selectedWeek === '2' ? 8 :
                       selectedWeek === '3' ? 15 :
                       selectedWeek === '4' ? 22 : 29;
      const endDay = selectedWeek === '1' ? 7 :
                     selectedWeek === '2' ? 14 :
                     selectedWeek === '3' ? 21 :
                     selectedWeek === '4' ? 28 : endDate.getDate();
      startDate.setDate(startDay);
      endDate.setDate(endDay);
    }
    const studentObj = students.find(s => String(s._id) === String(selectedStudentId));
    displayRecords = [];
    let tempDate = new Date(startDate);
    const now = new Date();
    while (tempDate <= endDate) {
      if (tempDate > now) {
        tempDate.setDate(tempDate.getDate() + 1);
        continue;
      }
      const dateString = tempDate.toISOString().slice(0, 10);
      const existingRecord = visibleAttendance.find(r => r.date && new Date(r.date).toISOString().slice(0, 10) === dateString);
      
      if (existingRecord) {
        displayRecords.push(existingRecord);
      } else {
        const day = tempDate.getDay();
        const isSunday = day === 0;
        const isSecondSaturday = (day === 6 && tempDate.getDate() >= 8 && tempDate.getDate() <= 14);
        const isHoliday = school?.schoolSettings?.holidays?.some(hDate => new Date(hDate).toISOString().slice(0, 10) === dateString);

        let status = 'Not Marked';
        let remarks = '';
        if (isSunday || isSecondSaturday) {
          status = 'Holiday';
          remarks = isSunday ? 'Sunday' : 'Second Saturday';
        } else if (isHoliday) {
          status = 'Holiday';
        }

        displayRecords.push({
          _id: `dummy-${dateString}`,
          student: studentObj ? studentObj.userId : null,
          date: tempDate.toISOString(),
          status,
          remarks
        });
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }
  displayRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Attendance Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        {!selectedClassId && (
          <div className="alert alert-info" style={{ marginBottom: '15px' }}>
            Select a class and section to view attendance.
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedClassId(''); setSelectedStudentId(''); setSelectedWeek(''); }}>
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              value={selectedSection}
              disabled={!sectionsForGrade.length}
              onChange={(e) => {
                const sec = e.target.value;
                setSelectedSection(sec);
                setSelectedStudentId('');
                setSelectedWeek('');
                if (sec) {
                  const matchedClass = classes.find(c => String(c.grade) === String(selectedGrade) && String(c.section) === String(sec));
                  setSelectedClassId(matchedClass?._id || '');
                } else {
                  setSelectedClassId('');
                }
              }}
            >
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setSelectedWeek(''); }}>
              <option value="">All months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div className="form-group">
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedClassId}>
              <option value="">All Students</option>
              {sectionStudents.map((student) => (
                <option key={student._id} value={student.userId?._id || student.userId}>
                  {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>



      {selectedClassId && (
        loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {selectedStudentId && (() => {
              const summary = getAttendanceSummary();
              if (!summary) return null;
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Days</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>{summary.totalCalendarDays}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>School Working Days</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', marginTop: '4px' }}>{summary.schoolWorkingDays}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Present Days</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857', marginTop: '4px' }}>{summary.presentDays}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Absent Days</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c', marginTop: '4px' }}>{summary.absentDays}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8', marginTop: '4px' }}>{summary.attendancePercentage}%</div>
                  </div>
                </div>
              );
            })()}

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
                {displayRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{record.student?.firstName} {record.student?.lastName}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: record.status === 'Present' ? '#d1fae5' : record.status === 'Holiday' ? '#e0f2fe' : record.status === 'Not Marked' ? '#f3f4f6' : '#fee2e2',
                        color: record.status === 'Present' ? '#065f46' : record.status === 'Holiday' ? '#0369a1' : record.status === 'Not Marked' ? '#4b5563' : '#991b1b',
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
        </>
      )
    )}
  </div>
  );
};

export default AttendanceManagement;
