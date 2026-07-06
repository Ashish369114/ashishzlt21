import React, { useState, useEffect } from 'react';
import { examService, marksService } from '../../services/api';

const PrincipalExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, marksRes] = await Promise.all([
        examService.getAll(),
        marksService.getAll(),
      ]);
      setExams(examsRes.data || []);
      setMarks(marksRes.data || []);
    } catch (err) {
      setError('Failed to load exam data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    if (examDate < now) return 'Completed';
    if (examDate.toDateString() === now.toDateString()) return 'Today';
    return 'Upcoming';
  };

  const filteredExams = exams.filter(exam => {
    if (filterStatus === 'all') return true;
    return getExamStatus(exam).toLowerCase() === filterStatus.toLowerCase();
  });

  const getTopPerformers = () => {
    const studentMarks = {};
    marks.forEach(mark => {
      const studentName = mark.student?.userId?.firstName + ' ' + mark.student?.userId?.lastName || 'Unknown';
      if (!studentMarks[studentName]) {
        studentMarks[studentName] = { total: 0, count: 0 };
      }
      studentMarks[studentName].total += mark.marks;
      studentMarks[studentName].count += 1;
    });

    return Object.entries(studentMarks)
      .map(([name, { total, count }]) => ({
        name,
        average: (total / count).toFixed(1),
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  };

  const topPerformers = getTopPerformers();
  const pendingMarksCount = marks.filter(m => !m.approved).length;
  const approvedMarksCount = marks.filter(m => m.approved).length;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Exams</h3>
          <div className="value">{exams.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Marks</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{pendingMarksCount}</div>
        </div>
        <div className="stat-card">
          <h3>Approved Marks</h3>
          <div className="value" style={{ color: '#10b981' }}>{approvedMarksCount}</div>
        </div>
        <div className="stat-card">
          <h3>Total Marks Recorded</h3>
          <div className="value">{marks.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Exam Schedule
        </button>
        <button
          className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('performance')}
        >
          📈 Top Performers
        </button>
        <button
          className={`btn ${activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('marks')}
        >
          ✅ Marks Approval
        </button>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {activeTab === 'schedule' && (
            <div className="card">
              <div className="card-header">
                <h2>📅 Exam Schedule</h2>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="all">All Exams</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {filteredExams.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map(exam => (
                        <tr key={exam._id}>
                          <td>{exam.name}</td>
                          <td>Grade {exam.class?.grade} - {exam.class?.section}</td>
                          <td>{exam.subject?.name}</td>
                          <td>{new Date(exam.date).toLocaleDateString()}</td>
                          <td>{exam.time || 'N/A'}</td>
                          <td>{exam.duration} mins</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: getExamStatus(exam) === 'Completed' ? '#d1d5db' : 
                                             getExamStatus(exam) === 'Today' ? '#fbbf24' : '#a3e635',
                              color: '#000',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              {getExamStatus(exam)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No exams found matching the selected filter.
                </p>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="card">
              <div className="card-header">
                <h2>📈 Top 10 Performers</h2>
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
                          <td style={{ fontWeight: 'bold' }}>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index >= 3 && `#${index + 1}`}
                          </td>
                          <td>{student.name}</td>
                          <td style={{ fontWeight: 'bold' }}>{student.average}/100</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                width: '100px', 
                                height: '8px', 
                                backgroundColor: '#e5e7eb', 
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${student.average}%`,
                                  height: '100%',
                                  backgroundColor: student.average >= 80 ? '#10b981' : 
                                                  student.average >= 60 ? '#f59e0b' : '#ef4444'
                                }}></div>
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
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No marks data available.
                </p>
              )}
            </div>
          )}

          {activeTab === 'marks' && (
            <div className="card">
              <div className="card-header">
                <h2>✅ Marks Approval Status</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#92400e', marginBottom: '5px' }}>Pending Approval</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b45309' }}>{pendingMarksCount}</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#15803d', marginBottom: '5px' }}>Approved</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{approvedMarksCount}</div>
                </div>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.95em' }}>
                📝 Review and approve marks submissions from teachers. Approved marks will be final and visible to students and parents.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalExamManagement;
