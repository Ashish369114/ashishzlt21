import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { marksService, attendanceService, homeworkService } from '../../services/api';
import StudentMarks from '../components/StudentMarks';
import StudentAttendance from '../components/StudentAttendance';
import StudentHomework from '../components/StudentHomework';
import StudentAssignments from '../components/StudentAssignments';
import StudentClasses from '../components/StudentClasses';
import StudentNotifications from '../components/StudentNotifications';
import StudentHallTicket from '../components/StudentHallTicket';
import StudentSyllabus from '../components/StudentSyllabus';
import StudentDownloadsEnhanced from '../components/StudentDownloadsEnhanced';
import StudentCommunication from '../components/StudentCommunication';
import DashboardHome from '../components/DashboardHome';
import EventList from '../components/EventList';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';
import StudentPocketMoney from '../components/StudentPocketMoney';
import StudentTeacherComplaints from '../components/StudentTeacherComplaints';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const studentId = user?.id || user?._id || user?.userId;

  useEffect(() => {
    const loadData = async () => {
      const resolvedStudentId = studentId;

      if (!resolvedStudentId) {
        setStats(null);
        return;
      }

      try {
        const [marks, attendance, homework] = await Promise.all([
          marksService.getByStudent(resolvedStudentId),
          attendanceService.getByStudent(resolvedStudentId),
          homeworkService.getByStudent(resolvedStudentId),
        ]);
        setStats({
          totalMarks: marks.data.length,
          attendanceRecords: attendance.data.length,
          homeworkAssignments: homework.data.length,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadData();
  }, [studentId]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍🎓 Student</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/assignments">🗂️ Assignments</Link></li>
          <li><Link to="/dashboard/classes">🏫 Class</Link></li>
          <li><Link to="/dashboard/syllabus">📚 Syllabus</Link></li>
          <li><Link to="/dashboard/notifications">🔔 Notifications</Link></li>
          <li><Link to="/dashboard/downloads">📥 Downloads</Link></li>
          <li><Link to="/dashboard/communication">💬 Communication</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/events">🎉 Events</Link></li>
          <li><Link to="/dashboard/remarks">💬 Remarks</Link></li>
          <li><Link to="/dashboard/feedback">⚠️ Teacher Feedback</Link></li>
          <li><Link to="/dashboard/pocket-money">💵 Pocket Money</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Student Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="marks" element={<StudentMarks userId={studentId} />} />
          <Route path="attendance" element={<StudentAttendance userId={studentId} />} />
          <Route path="homework" element={<StudentHomework userId={studentId} />} />
          <Route path="assignments" element={<StudentAssignments userId={studentId} />} />
          <Route path="classes" element={<StudentClasses userId={studentId} />} />
          <Route path="syllabus" element={<StudentSyllabus />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="downloads" element={<StudentDownloadsEnhanced />} />
          <Route path="communication" element={<StudentCommunication />} />
          <Route path="exams" element={<ExamList studentId={studentId} showActions={false} />} />
          <Route path="events" element={<EventList showActions={false} />} />
          <Route path="remarks" element={<RemarkList studentId={studentId} showActions={false} />} />
          <Route path="feedback" element={<StudentTeacherComplaints currentUser={user} />} />
          <Route path="pocket-money" element={<StudentPocketMoney user={user} />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
