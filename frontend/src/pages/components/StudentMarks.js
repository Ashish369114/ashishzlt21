import React, { useState, useEffect } from 'react';
import { marksService } from '../../services/api';

const StudentMarks = ({ userId }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setMarks([]);
      setLoading(false);
      return;
    }

    const loadMarks = async () => {
      try {
        setLoading(true);
        const response = await marksService.getByStudent(userId);
        const marksData = Array.isArray(response.data) ? response.data : [];
        setMarks(marksData);
      } catch (err) {
        setError('Failed to fetch marks');
        console.error(err);
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarks();
  }, [userId]);

  const safeMarks = Array.isArray(marks) ? marks : [];

  const calculateAverage = () => {
    if (safeMarks.length === 0) return 0;
    const total = safeMarks.reduce((sum, mark) => sum + Number(mark.marks || 0), 0);
    return (total / safeMarks.length).toFixed(2);
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📝 My Marks</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Average Marks</h3>
          <div className="value">{calculateAverage()}%</div>
        </div>
        <div className="stat-card">
          <h3>Total Exams</h3>
          <div className="value">{safeMarks.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Exam Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {safeMarks.map((mark) => (
                <tr key={mark._id}>
                  <td>
                    <strong>{mark.subject?.name || 'Unknown'}</strong>
                  </td>
                  <td>{mark.marks ?? '-'} / 100</td>
                  <td>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: 'bold',
                      }}
                    >
                      {getGrade(mark.marks ?? 0)}
                    </span>
                  </td>
                  <td>{mark.examType || '-'}</td>
                  <td>{mark.examDate ? new Date(mark.examDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
