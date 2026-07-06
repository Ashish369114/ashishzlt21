import React, { useState, useEffect } from 'react';
import { studentService, marksService, attendanceService, feeService } from '../../services/api';

const PrincipalComprehensiveReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [topStudents, setTopStudents] = useState([]);
  const [weakStudents, setWeakStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [studentsRes, marksRes, attendanceRes, feesRes] = await Promise.all([
        studentService.getAll(),
        marksService.getAll(),
        attendanceService.getAll(),
        feeService.getAll(),
      ]);

      const students = studentsRes.data || [];
      const marks = marksRes.data || [];
      const attendance = attendanceRes.data || [];
      const fees = feesRes.data || [];

      // Calculate top performers
      const studentMarks = {};
      marks.forEach(mark => {
        const studentId = mark.student?._id;
        const studentName = mark.student?.userId?.firstName + ' ' + mark.student?.userId?.lastName || 'Unknown';
        if (!studentMarks[studentId]) {
          studentMarks[studentId] = { name: studentName, total: 0, count: 0, marks: [] };
        }
        studentMarks[studentId].total += mark.marks;
        studentMarks[studentId].count += 1;
        studentMarks[studentId].marks.push(mark.marks);
      });

      const top = Object.values(studentMarks)
        .map(s => ({
          name: s.name,
          average: (s.total / s.count).toFixed(1),
          subjects: s.count,
          maxMarks: Math.max(...s.marks),
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      const weak = Object.values(studentMarks)
        .map(s => ({
          name: s.name,
          average: (s.total / s.count).toFixed(1),
          subjects: s.count,
          minMarks: Math.min(...s.marks),
        }))
        .sort((a, b) => a.average - b.average)
        .slice(0, 10);

      // Calculate attendance stats
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const absentCount = attendance.filter(a => a.status === 'Absent').length;
      const totalAttendance = attendance.length;

      // Calculate fee stats
      const totalFeeAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
      const collectedAmount = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      const pendingAmount = totalFeeAmount - collectedAmount;

      setTopStudents(top);
      setWeakStudents(weak);
      setAttendanceStats({
        present: presentCount,
        absent: absentCount,
        total: totalAttendance,
        presentPercentage: totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0,
      });

      setStats({
        totalStudents: students.length,
        totalMarks: marks.length,
        totalAttendance: totalAttendance,
        totalFees: fees.length,
        collectionPercentage: totalFeeAmount > 0 ? ((collectedAmount / totalFeeAmount) * 100).toFixed(1) : 0,
        totalFeeAmount,
        collectedAmount,
        pendingAmount,
      });
    } catch (err) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Total Students</h3>
              <div className="value">{stats?.totalStudents || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Marks Recorded</h3>
              <div className="value">{stats?.totalMarks || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Attendance Rate</h3>
              <div className="value" style={{ color: '#10b981' }}>{attendanceStats?.presentPercentage}%</div>
            </div>
            <div className="stat-card">
              <h3>Fee Collection</h3>
              <div className="value" style={{ color: '#3b82f6' }}>{stats?.collectionPercentage}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', overflowX: 'auto' }}>
            <button
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`btn ${activeTab === 'top' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('top')}
            >
              ⭐ Top Students
            </button>
            <button
              className={`btn ${activeTab === 'weak' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('weak')}
            >
              📉 Needs Attention
            </button>
            <button
              className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('attendance')}
            >
              ✅ Attendance Report
            </button>
            <button
              className={`btn ${activeTab === 'finance' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('finance')}
            >
              💰 Finance Summary
            </button>
          </div>

          {activeTab === 'overview' && (
            <div>
              <div className="card">
                <div className="card-header">
                  <h2>📊 School Performance Overview</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                    <strong style={{ color: '#1e3a8a' }}>Total Students Enrolled</strong>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', marginTop: '10px' }}>
                      {stats?.totalStudents || 0}
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <strong style={{ color: '#15803d' }}>Average Attendance</strong>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginTop: '10px' }}>
                      {attendanceStats?.presentPercentage}%
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#4b5563', marginTop: '5px' }}>
                      {attendanceStats?.present} Present, {attendanceStats?.absent} Absent
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                    <strong style={{ color: '#92400e' }}>Fee Collection Rate</strong>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#b45309', marginTop: '10px' }}>
                      {stats?.collectionPercentage}%
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#4b5563', marginTop: '5px' }}>
                      Collected: ₹{(stats?.collectedAmount / 100000).toFixed(2)}L
                    </div>
                  </div>
                  <div style={{ padding: '15px', backgroundColor: '#fce7f3', borderRadius: '8px' }}>
                    <strong style={{ color: '#831843' }}>Academic Performance</strong>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#be185d', marginTop: '10px' }}>
                      {topStudents.length > 0 ? topStudents[0].average : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#4b5563', marginTop: '5px' }}>
                      Top performer average
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <h2>🎯 Key Metrics</h2>
                </div>
                <ul style={{ lineHeight: '2.2', paddingLeft: '20px', color: '#374151' }}>
                  <li>📚 Total marks recorded: <strong>{stats?.totalMarks}</strong></li>
                  <li>📋 Total attendance records: <strong>{stats?.totalAttendance}</strong></li>
                  <li>💳 Total fees processed: <strong>{stats?.totalFees}</strong></li>
                  <li>💰 Total fee amount: <strong>₹{(stats?.totalFeeAmount / 100000).toFixed(2)}L</strong></li>
                  <li>⏳ Pending amount: <strong>₹{(stats?.pendingAmount / 100000).toFixed(2)}L</strong></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'top' && (
            <div className="card">
              <div className="card-header">
                <h2>⭐ Top 10 Performing Students</h2>
              </div>
              {topStudents.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Rank</th>
                        <th>Student Name</th>
                        <th>Average Marks</th>
                        <th>Subjects</th>
                        <th>Best Score</th>
                        <th>Achievement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((student, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index >= 3 && `#${index + 1}`}
                          </td>
                          <td>{student.name}</td>
                          <td style={{ fontWeight: 'bold', color: '#10b981' }}>{student.average}/100</td>
                          <td>{student.subjects} subjects</td>
                          <td>{student.maxMarks}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              Excellent
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No performance data available.
                </p>
              )}
            </div>
          )}

          {activeTab === 'weak' && (
            <div className="card">
              <div className="card-header">
                <h2>📉 Students Needing Attention</h2>
              </div>
              {weakStudents.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Priority</th>
                        <th>Student Name</th>
                        <th>Average Marks</th>
                        <th>Subjects</th>
                        <th>Lowest Score</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weakStudents.map((student, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 'bold', color: index < 3 ? '#ef4444' : '#f59e0b' }}>
                            {index === 0 && '🔴'}
                            {index === 1 && '🟠'}
                            {index >= 2 && '🟡'}
                          </td>
                          <td>{student.name}</td>
                          <td style={{ fontWeight: 'bold', color: '#ef4444' }}>{student.average}/100</td>
                          <td>{student.subjects} subjects</td>
                          <td>{student.minMarks}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              Tutoring
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  All students are performing well! 🎉
                </p>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-header">
                <h2>✅ Attendance Statistics</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#15803d', marginBottom: '5px' }}>Present</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                    {attendanceStats?.present}
                  </div>
                  <div style={{ fontSize: '0.75em', color: '#4b5563', marginTop: '5px' }}>
                    {attendanceStats?.presentPercentage}%
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#991b1b', marginBottom: '5px' }}>Absent</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                    {attendanceStats?.absent}
                  </div>
                  <div style={{ fontSize: '0.75em', color: '#4b5563', marginTop: '5px' }}>
                    {((attendanceStats?.absent / attendanceStats?.total) * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#1e40af', marginBottom: '5px' }}>Total Records</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                    {attendanceStats?.total}
                  </div>
                </div>
              </div>
              <div style={{
                padding: '15px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <strong>Attendance Trend</strong>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    flex: 1,
                    height: '20px',
                    backgroundColor: '#e0e7ff',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${attendanceStats?.presentPercentage}%`,
                      height: '100%',
                      backgroundColor: '#10b981'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{attendanceStats?.presentPercentage}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="card">
              <div className="card-header">
                <h2>💰 Finance Summary</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#1e40af', marginBottom: '5px' }}>Total Amount Due</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
                    ₹{(stats?.totalFeeAmount / 100000).toFixed(2)}L
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#15803d', marginBottom: '5px' }}>Amount Collected</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                    ₹{(stats?.collectedAmount / 100000).toFixed(2)}L
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85em', color: '#991b1b', marginBottom: '5px' }}>Amount Pending</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
                    ₹{(stats?.pendingAmount / 100000).toFixed(2)}L
                  </div>
                </div>
              </div>
              <div style={{
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px'
              }}>
                <strong>Collection Rate</strong>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    flex: 1,
                    height: '20px',
                    backgroundColor: '#fcd34d',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${stats?.collectionPercentage}%`,
                      height: '100%',
                      backgroundColor: '#10b981'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{stats?.collectionPercentage}%</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalComprehensiveReports;
