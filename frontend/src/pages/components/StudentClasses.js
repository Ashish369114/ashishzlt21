import React, { useEffect, useState } from 'react';
import { classService, studentService } from '../../services/api';

const StudentClasses = ({ userId }) => {
  const [student, setStudent] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClassData = async () => {
      if (!userId) {
        setError('Student user not available.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentResponse = await studentService.getByUserId(userId);
        const studentData = studentResponse.data;
        setStudent(studentData);

        const classId = studentData.class?._id || studentData.class;
        if (classId) {
          const classResponse = await classService.getById(classId);
          setClassInfo(classResponse.data);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load class details.');
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [userId]);

  const buildTimetable = () => {
    const grade = classInfo?.grade || 'N/A';
    const baseSubjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Language'];
    const optional = grade >= 9 ? ['Physics', 'Chemistry', 'Biology'] : ['Art', 'Music', 'Physical Education'];
    const subjects = [...baseSubjects, optional[0], optional[1]].slice(0, 7);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day, index) => ({
      day,
      periods: subjects.map((subject, idx) => `${subject} (${idx + 1})`),
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🏫 Class Details</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Grade</h3>
              <div className="value">{classInfo?.grade || 'N/A'}</div>
            </div>
            <div className="stat-card">
              <h3>Section</h3>
              <div className="value">{classInfo?.section || 'N/A'}</div>
            </div>
            <div className="stat-card">
              <h3>Roll Number</h3>
              <div className="value">{student?.rollNumber || 'N/A'}</div>
            </div>
          </div>

          <div className="card-content" style={{ marginBottom: '20px' }}>
            <p><strong>Class Teacher:</strong> {classInfo?.classTeacher?.firstName ? `${classInfo.classTeacher.firstName} ${classInfo.classTeacher.lastName}` : 'Assigned by school'}</p>
            <p><strong>Subject List:</strong> {classInfo?.subjects?.map((subject) => subject.name).join(', ') || 'Standard curriculum subjects'}</p>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>🕒 Weekly Timetable</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Period 1</th>
                    <th>Period 2</th>
                    <th>Period 3</th>
                    <th>Period 4</th>
                    <th>Period 5</th>
                  </tr>
                </thead>
                <tbody>
                  {buildTimetable().map((row) => (
                    <tr key={row.day}>
                      <td>{row.day}</td>
                      {row.periods.slice(0, 5).map((period, index) => (
                        <td key={index}>{period}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentClasses;
