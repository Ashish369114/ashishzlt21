import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { feeService, studentService, marksService, attendanceService } from '../../services/api';
import ParentMarks from '../components/ParentMarks';
import ParentAttendance from '../components/ParentAttendance';
import ParentFees from '../components/ParentFees';
import ParentHomework from '../components/ParentHomework';
import ParentStudentProfile from '../components/ParentStudentProfile';
import ParentExams from '../components/ParentExams';
import ParentResults from '../components/ParentResults';
import ParentTimetable from '../components/ParentTimetable';
import ParentNotices from '../components/ParentNotices';
import ParentCommunication from '../components/ParentCommunication';
import ParentDownloads from '../components/ParentDownloads';
import ParentProfileSettings from '../components/ParentProfileSettings';
import ParentHomePage from './ParentHomePage';
import RemarkList from '../components/RemarkList';

const ParentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentDashboard = async () => {
      const userIdentifier = user?.userId || user?.id || user?._id;
      if (!userIdentifier) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentResponse = await studentService.getByParent();
        const studentList = studentResponse.data || [];
        const studentIds = studentList
          .map((student) => student.userId?._id || student.userId || student._id)
          .filter(Boolean);

        const [feeResponse, ...childData] = await Promise.all([
          feeService.getByParent(),
          Promise.all(studentIds.map((id) => marksService.getByStudent(id))),
          Promise.all(studentIds.map((id) => attendanceService.getByStudent(id))),
        ]);

        const fees = feeResponse.data || [];
        const allMarks = childData[0].flatMap((response) => response.data || []);
        const allAttendance = childData[1].flatMap((response) => response.data || []);

        const totalAmount = fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
        const totalPaidAmount = fees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);
        const totalPendingAmount = fees.reduce(
          (sum, fee) => sum + Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0),
          0,
        );
        const averageMarks = allMarks.length
          ? (allMarks.reduce((sum, item) => sum + Number(item.marks || 0), 0) / allMarks.length).toFixed(2)
          : 0;
        const averageAttendance = allAttendance.length
          ? ((allAttendance.filter((item) => item.status === 'Present').length / allAttendance.length) * 100).toFixed(2)
          : 0;

        const feeMap = fees.reduce((map, fee) => {
          const id = fee.student?._id || fee.student;
          if (!id) return map;
          const pending = !fee.isPaid ? Number(fee.amount || 0) : 0;
          map[id] = (map[id] || 0) + pending;
          return map;
        }, {});

        const studentListWithPending = studentList.map((student) => {
          const id = student.userId?._id || student.userId || student._id;
          return {
            ...student,
            pendingFeeAmount: feeMap[id] || 0,
          };
        });

        setStudents(studentListWithPending);
        setStats({
          totalStudents: studentList.length,
          totalFees: fees.length,
          totalFeeAmount: totalAmount,
          totalPaidAmount,
          totalPendingAmount,
          averageMarks,
          averageAttendance,
          totalChildren: studentList.length,
        });
      } catch (error) {
        console.error('Error fetching parent dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentDashboard();
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍👩‍👧 Parent</h2>
          <p>{user?.firstName} {user?.lastName}</p>
          {students.length > 0 && (
            <p style={{ marginTop: '8px', fontSize: '0.95rem', color: '#cbd5e1' }}>
              Linked Student: {students[0].userId?.firstName} {students[0].userId?.lastName}
            </p>
          )}
        </div>
        <ul className="nav-menu">
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/student" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              👩‍🎓 Student Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/marks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📝 Marks
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/results" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🏆 Results
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
            <NavLink to="/dashboard/fees" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              💰 Fees
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/exams" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📋 Exams
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/remarks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              💬 Remarks
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/timetable" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🕒 Timetable
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/notices" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📰 Notices
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/communication" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              💬 Communication
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/downloads" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📥 Downloads
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/settings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              ⚙️ Profile Settings
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
            <h1>Parent Dashboard</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Welcome back, {user?.firstName || 'Parent'}.</p>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.95rem' }}>{new Date().toLocaleDateString()}</div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <Routes>
            <Route index element={<ParentHomePage user={user} students={students} stats={stats} />} />
            <Route path="student" element={<ParentStudentProfile students={students} />} />
            <Route path="marks" element={<ParentMarks />} />
            <Route path="results" element={<ParentResults />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="homework" element={<ParentHomework />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="exams" element={<ParentExams />} />
            <Route path="remarks" element={<RemarkList />} />
            <Route path="timetable" element={<ParentTimetable />} />
            <Route path="notices" element={<ParentNotices />} />
            <Route path="communication" element={<ParentCommunication />} />
            <Route path="downloads" element={<ParentDownloads />} />
            <Route path="settings" element={<ParentProfileSettings />} />
            <Route path="*" element={<ParentHomePage user={user} students={students} stats={stats} />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
