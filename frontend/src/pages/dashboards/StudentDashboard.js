import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { marksService, attendanceService, homeworkService, studentService, feeService } from '../../services/api';
import StudentMarks from '../components/StudentMarks';
import StudentAttendance from '../components/StudentAttendance';
import StudentHomework from '../components/StudentHomework';
import StudentAssignments from '../components/StudentAssignments';
import StudentClasses from '../components/StudentClasses';
import StudentNotifications from '../components/StudentNotifications';
import StudentSyllabus from '../components/StudentSyllabus';
import StudentDownloadsEnhanced from '../components/StudentDownloadsEnhanced';
import StudentCommunication from '../components/StudentCommunication';
import StudentHomePage from './StudentHomePage';
import EventList from '../components/EventList';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const userIdentifier = user?.userId || user?.id || user?._id;
      if (!userIdentifier) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentRes = await studentService.getByUserId(userIdentifier);
        const studentData = studentRes.data || {};
        setStudent(studentData);

        const studentId = studentData.userId?._id || studentData.userId || studentData._id || userIdentifier;
        const [marksRes, attendanceRes, homeworkRes, feeRes] = await Promise.all([
          marksService.getByStudent(studentId),
          attendanceService.getByStudent(studentId),
          homeworkService.getByStudent(studentId),
          feeService.getByStudent(studentId),
        ]);

        const marks = marksRes.data || [];
        const attendance = attendanceRes.data || [];
        const homework = homeworkRes.data || [];
        const fees = feeRes.data || [];

        const averageMarks = marks.length
          ? (marks.reduce((sum, item) => sum + Number(item.marks || 0), 0) / marks.length).toFixed(2)
          : 0;
        const attendancePercent = attendance.length
          ? ((attendance.filter((record) => record.status === 'Present').length / attendance.length) * 100).toFixed(2)
          : 0;
        const pendingHomework = homework.filter((item) => {
          const dueDate = item.dueDate ? new Date(item.dueDate) : null;
          return !item.submissions?.some((submission) => submission.student?._id?.toString?.() === studentId?.toString?.() || submission.student?.toString?.() === studentId?.toString?.()) && (!dueDate || dueDate >= new Date());
        }).length;
        const dueFees = fees.filter((fee) => !fee.isPaid).reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

        setStats({
          averageMarks,
          attendancePercent,
          homeworkAssignments: homework.length,
          pendingHomework,
          totalMarks: marks.length,
          attendanceRecords: attendance.length,
          totalPendingFees: dueFees,
        });
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

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
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/marks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📝 Marks
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/attendance" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              ✅ Attendance
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/homework" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📖 Homework
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/assignments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🗂️ Assignments
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/classes" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🏫 Class
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/syllabus" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📚 Syllabus
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/notifications" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🔔 Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/downloads" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📥 Downloads
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/communication" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              💬 Communication
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/exams" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📋 Exams
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/events" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🎉 Events
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/remarks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              💬 Remarks
            </NavLink>
          </li>
          <li>
            <NavLink to="/change-password" className="nav-link">
              🔒 Change Password
            </NavLink>
          </li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1>Student Dashboard</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Welcome back, {user?.firstName || 'Learner'}.</p>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.95rem' }}>{new Date().toLocaleDateString()}</div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <Routes>
            <Route index element={<StudentHomePage user={user} student={student} stats={stats} />} />
            <Route path="marks" element={<StudentMarks userId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} />} />
            <Route path="attendance" element={<StudentAttendance userId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} />} />
            <Route path="homework" element={<StudentHomework userId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} />} />
            <Route path="assignments" element={<StudentAssignments userId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} />} />
            <Route path="classes" element={<StudentClasses userId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} />} />
            <Route path="syllabus" element={<StudentSyllabus />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="downloads" element={<StudentDownloadsEnhanced />} />
            <Route path="communication" element={<StudentCommunication />} />
            <Route path="exams" element={<ExamList studentId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} showActions={false} />} />
            <Route path="events" element={<EventList showActions={false} />} />
            <Route path="remarks" element={<RemarkList studentId={student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId} showActions={false} />} />
            <Route path="*" element={<StudentHomePage user={user} student={student} stats={stats} />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
