import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/api';

const PrincipalTeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attendance');
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response.data || []);
      
      // Simulate leaves data (in real implementation, this would come from an API)
      setLeaves([
        { id: 1, teacher: 'John Doe', type: 'Sick Leave', fromDate: '2024-07-10', toDate: '2024-07-12', status: 'Pending', reason: 'Medical checkup' },
        { id: 2, teacher: 'Jane Smith', type: 'Casual Leave', fromDate: '2024-07-15', toDate: '2024-07-15', status: 'Pending', reason: 'Personal work' },
        { id: 3, teacher: 'Mike Johnson', type: 'Earned Leave', fromDate: '2024-07-20', toDate: '2024-07-25', status: 'Approved', reason: 'Vacation' },
      ]);
    } catch (err) {
      setError('Failed to load teacher data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = (id) => {
    setLeaves(leaves.map(leave =>
      leave.id === id ? { ...leave, status: 'Approved' } : leave
    ));
  };

  const handleRejectLeave = (id) => {
    setLeaves(leaves.map(leave =>
      leave.id === id ? { ...leave, status: 'Rejected' } : leave
    ));
  };

  const getAttendanceStats = () => {
    // Simulate attendance data
    const total = teachers.length;
    const present = Math.floor(total * 0.9);
    const absent = total - present;
    return { total, present, absent, percentage: ((present / total) * 100).toFixed(1) };
  };

  const stats = getAttendanceStats();
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Teachers</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <div className="value" style={{ color: '#10b981' }}>{stats.present}</div>
        </div>
        <div className="stat-card">
          <h3>Absent Today</h3>
          <div className="value" style={{ color: '#ef4444' }}>{stats.absent}</div>
        </div>
        <div className="stat-card">
          <h3>Attendance Rate</h3>
          <div className="value" style={{ color: '#3b82f6' }}>{stats.percentage}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('attendance')}
        >
          ✅ Attendance
        </button>
        <button
          className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('leaves')}
        >
          📋 Leave Approval ({pendingLeaves.length})
        </button>
        <button
          className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('performance')}
        >
          📊 Performance
        </button>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-header">
                <h2>✅ Teacher Attendance Report</h2>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Teacher Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status Today</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <tr key={teacher._id}>
                        <td>{teacher.userId?.firstName} {teacher.userId?.lastName}</td>
                        <td>{teacher.userId?.email || 'N/A'}</td>
                        <td>{teacher.userId?.phone || 'N/A'}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '3px',
                            backgroundColor: index % 3 === 0 ? '#d1fae5' : '#fee2e2',
                            color: index % 3 === 0 ? '#065f46' : '#991b1b',
                            fontSize: '0.85em',
                            fontWeight: 'bold'
                          }}>
                            {index % 3 === 0 ? '✓ Present' : '✗ Absent'}
                          </span>
                        </td>
                        <td>{teacher.department || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="card">
              <div className="card-header">
                <h2>📋 Leave Approval Requests</h2>
              </div>
              {leaves.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Teacher Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Leave Type</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>From Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>To Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map(leave => (
                        <tr key={leave.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>{leave.teacher}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: leave.type === 'Sick Leave' ? '#dbeafe' :
                                             leave.type === 'Casual Leave' ? '#fce7f3' : '#f0fdf4',
                              fontSize: '0.85em'
                            }}>
                              {leave.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{new Date(leave.fromDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>{new Date(leave.toDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>{leave.reason}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: leave.status === 'Pending' ? '#fef3c7' :
                                             leave.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                              color: leave.status === 'Pending' ? '#92400e' :
                                    leave.status === 'Approved' ? '#15803d' : '#991b1b',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              {leave.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {leave.status === 'Pending' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-success"
                                  style={{ padding: '6px 12px', fontSize: '0.85em' }}
                                  onClick={() => handleApproveLeave(leave.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '6px 12px', fontSize: '0.85em' }}
                                  onClick={() => handleRejectLeave(leave.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {leave.status !== 'Pending' && (
                              <span style={{ color: '#6b7280', fontSize: '0.85em' }}>No action</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No leave requests to review.
                </p>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="card">
              <div className="card-header">
                <h2>📊 Teacher Performance Metrics</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {teachers.slice(0, 4).map(teacher => (
                  <div key={teacher._id} style={{
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{teacher.userId?.firstName} {teacher.userId?.lastName}</h4>
                    <div style={{ fontSize: '0.9em', lineHeight: '1.8' }}>
                      <div>✓ Classes: <strong>25</strong></div>
                      <div>✓ Students: <strong>120</strong></div>
                      <div>✓ Rating: <strong>4.5/5</strong></div>
                      <div>✓ Subjects: <strong>3</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalTeacherManagement;
