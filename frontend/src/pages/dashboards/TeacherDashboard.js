import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, homeworkService, attendanceService, marksService } from '../../services/api';
import MarksManagement from '../components/MarksManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import HomeworkManagement from '../components/HomeworkManagement';
import DashboardHome from '../components/DashboardHome';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';
import TeacherClasses from '../components/TeacherClasses';
import TeacherAssignmentManagement from '../components/TeacherAssignmentManagement';
import TeacherCommunication from '../components/TeacherCommunication';
import TeacherLeaveManagement from '../components/TeacherLeaveManagement';
import TeacherClassTimetable from '../components/TeacherClassTimetable';
import StudentManagement from '../components/StudentManagement';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [students, homework, attendance, marks] = await Promise.all([
        studentService.getAll(),
        homeworkService.getAll(),
        attendanceService.getAll(),
        marksService.getAll(),
      ]);

      const studentData = students.data || [];
      const homeworkData = homework.data || [];
      const attendanceData = attendance.data || [];
      const marksData = marks.data || [];

      // Get today's classes (simulated)
      const todayClasses = 3;
      
      // Count pending assignments (not submitted)
      const pendingAssignments = homeworkData.filter(h => {
        const submissions = h.submissions || [];
        return submissions.length < studentData.length;
      }).length;

      // Count pending marks submissions
      const pendingMarks = marksData.filter(m => !m.approved).length;

      // Generate notifications
      const notifs = [];
      if (pendingAssignments > 0) notifs.push({ type: 'warning', message: `${pendingAssignments} assignments pending submissions` });
      if (pendingMarks > 5) notifs.push({ type: 'info', message: `${pendingMarks} marks awaiting approval` });
      if (todayClasses > 0) notifs.push({ type: 'success', message: `${todayClasses} classes scheduled today` });

      setStats({
        totalStudents: studentData.length,
        todayClasses,
        pendingAssignments,
        pendingMarks,
        totalHomework: homeworkData.length,
        totalMarks: marksData.length,
        attendanceRecords: attendanceData.length,
      });
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍🏫 Teacher</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            CLASS MANAGEMENT
          </li>
          <li><Link to="/dashboard/classes">📚 My Classes</Link></li>
          <li><Link to="/dashboard/students">👩‍🎓 Students</Link></li>
          <li><Link to="/dashboard/timetable">📅 Timetable</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            ACADEMIC
          </li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/assignments">📋 Assignments</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            COMMUNICATION
          </li>
          <li><Link to="/dashboard/communication">💬 Notices & Chat</Link></li>
          <li><Link to="/dashboard/remarks">💭 Remarks</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            ADMINISTRATION
          </li>
          <li><Link to="/dashboard/leave">🏖️ Leave</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div>
            <h1>Teacher Dashboard</h1>
            <div style={{ fontSize: '0.9em', color: '#6b7280' }}>{new Date().toLocaleDateString()}</div>
          </div>
          {notifications.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              backgroundColor: '#fffbeb',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #fcd34d'
            }}>
              <span style={{ fontSize: '1.2em' }}>🔔</span>
              <div>
                <strong style={{ color: '#92400e' }}>Today</strong>
                <div style={{ fontSize: '0.85em', color: '#b45309' }}>
                  {notifications.map((n, i) => (
                    <div key={i}>• {n.message}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Routes>
          <Route index element={<TeacherDashboardHome stats={stats} user={user} />} />
          <Route path="marks" element={<MarksManagement teacherUserId={user?._id || user?.id || user?.userId} />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="homework" element={<HomeworkManagement />} />
          <Route path="assignments" element={<TeacherAssignmentManagement teacherId={user?._id || user?.id || user?.userId} />} />
          <Route path="exams" element={<ExamList teacherUserId={user?._id || user?.id || user?.userId} />} />
          <Route path="remarks" element={<RemarkList teacherUserId={user?._id || user?.id || user?.userId} />} />
          <Route path="classes" element={<TeacherClasses teacherId={user?._id || user?.id || user?.userId} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="communication" element={<TeacherCommunication teacherId={user?._id || user?.id || user?.userId} user={user} />} />
          <Route path="leave" element={<TeacherLeaveManagement teacherId={user?._id || user?.id || user?.userId} user={user} />} />
          <Route path="timetable" element={<TeacherClassTimetable teacherId={user?._id || user?.id || user?.userId} user={user} />} />
          <Route path="performance" element={<TeacherDashboardHome stats={stats} user={user} />} />
          <Route path="*" element={<TeacherDashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

// Teacher-specific dashboard home page
const TeacherDashboardHome = ({ stats, user }) => {
  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="value">{stats?.totalStudents || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Today's Classes</h3>
          <div className="value" style={{ color: '#8b5cf6' }}>{stats?.todayClasses || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Assignments</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats?.pendingAssignments || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Marks Approval</h3>
          <div className="value" style={{ color: '#ef4444' }}>{stats?.pendingMarks || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h2>📅 Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <Link to="/dashboard/attendance" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              ✅ Mark Attendance
            </Link>
            <Link to="/dashboard/marks" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📝 Enter Marks
            </Link>
            <Link to="/dashboard/assignments" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📋 Create Assignment
            </Link>
            <Link to="/dashboard/homework" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📖 Set Homework
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>⏰ Today's Schedule</h2>
          </div>
          <div style={{ padding: '15px 0', lineHeight: '2.2', color: '#374151' }}>
            <div>🕘 09:00 - 10:00 • Class 10A</div>
            <div>🕙 10:00 - 11:00 • Class 10B</div>
            <div>🕐 12:00 - 13:00 • Class 9A</div>
            <Link to="/dashboard/timetable" style={{ color: '#8b5cf6', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
              View Full Timetable →
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>📊 Academic Overview</h2>
          </div>
          <div style={{ padding: '15px 0', lineHeight: '2.2', color: '#374151' }}>
            <div>📚 Total Homework: <strong>{stats?.totalHomework || 0}</strong></div>
            <div>📝 Total Marks Recorded: <strong>{stats?.totalMarks || 0}</strong></div>
            <div>✅ Attendance Records: <strong>{stats?.attendanceRecords || 0}</strong></div>
            <Link to="/dashboard/performance" style={{ color: '#8b5cf6', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
              View Analytics →
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>🎯 Features Available</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong style={{ color: '#1f2937' }}>📚 Class Management</strong>
            <ul style={{ fontSize: '0.9em', lineHeight: '1.8', marginTop: '8px', paddingLeft: '20px', color: '#374151' }}>
              <li>View My Classes</li>
              <li>Class Timetable</li>
              <li>Subject Allocation</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>📝 Academic Tasks</strong>
            <ul style={{ fontSize: '0.9em', lineHeight: '1.8', marginTop: '8px', paddingLeft: '20px', color: '#374151' }}>
              <li>Mark Attendance</li>
              <li>Enter & Update Marks</li>
              <li>Grade Students</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>📋 Assignments</strong>
            <ul style={{ fontSize: '0.9em', lineHeight: '1.8', marginTop: '8px', paddingLeft: '20px', color: '#374151' }}>
              <li>Create Assignments</li>
              <li>Review Submissions</li>
              <li>Assign Marks</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>💬 Communication</strong>
            <ul style={{ fontSize: '0.9em', lineHeight: '1.8', marginTop: '8px', paddingLeft: '20px', color: '#374151' }}>
              <li>Send Notices</li>
              <li>Chat with Students</li>
              <li>Chat with Parents</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#1f2937' }}>🏖️ Administration</strong>
            <ul style={{ fontSize: '0.9em', lineHeight: '1.8', marginTop: '8px', paddingLeft: '20px', color: '#374151' }}>
              <li>Apply for Leave</li>
              <li>View Leave History</li>
              <li>Track Leave Balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
