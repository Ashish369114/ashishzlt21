import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { feeService, studentService } from '../../services/api';
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
import DashboardHome from '../components/DashboardHome';
import RemarkList from '../components/RemarkList';

const ParentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);

  const fetchData = useCallback(async (studentList = students) => {
    try {
      const response = await feeService.getByParent();
      const fees = response.data || [];
      const paidFees = fees.filter((fee) => fee.isPaid);
      setStats({
        totalStudents: studentList.length,
        totalFees: fees.length,
        totalCollected: paidFees.reduce((sum, fee) => sum + fee.amount, 0),
        pendingCount: fees.filter((fee) => !fee.isPaid).length,
        lastPaymentMethod: paidFees.length ? paidFees[paidFees.length - 1].paymentMethod : 'N/A',
        totalChildren: studentList.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [students]);

  const fetchStudent = useCallback(async () => {
    try {
      const response = await studentService.getByParent();
      const studentList = response.data || [];
      setStudents(studentList);
      await fetchData(studentList);
    } catch (error) {
      console.error('Error fetching linked student:', error);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

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
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/student">👩‍🎓 Student Profile</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/results">🏆 Results</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/fees">💰 Fees</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/remarks">💬 Remarks</Link></li>
          <li><Link to="/dashboard/timetable">🕒 Timetable</Link></li>
          <li><Link to="/dashboard/notices">📰 Notices</Link></li>
          <li><Link to="/dashboard/communication">💬 Communication</Link></li>
          <li><Link to="/dashboard/downloads">📥 Downloads</Link></li>
          <li><Link to="/dashboard/settings">⚙️ Profile Settings</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Parent Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
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
        </Routes>
      </div>
    </div>
  );
};

export default ParentDashboard;
