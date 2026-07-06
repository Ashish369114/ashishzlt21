import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { classService } from '../../services/api';
import AdmissionManagement from '../components/AdmissionManagement';
import EmployeeManagement from '../components/EmployeeManagement';
import HostelManagement from '../components/HostelManagement';
import LibraryManagement from '../components/LibraryManagement';
import ReportManagement from '../components/ReportManagement';
import SchoolManagement from '../components/SchoolManagement';
import StudentManagement from '../components/StudentManagement';
import TeacherManagement from '../components/TeacherManagement';
import FeeManagement from '../components/FeeManagement';
import ClassManagement from '../components/ClassManagement';
import MarksManagement from '../components/MarksManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import HomeworkManagement from '../components/HomeworkManagement';
import ExamManagement from '../components/ExamManagement';
import EventList from '../components/EventList';
import TransportManagement from '../components/TransportManagement';
import DashboardHome from '../components/DashboardHome';
import UserManagement from '../components/UserManagement';
import AcademicManagement from '../components/AcademicManagement';
import SettingsManagement from '../components/SettingsManagement';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await classService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          <h2>👑 Super Admin</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/schools">🏫 Schools</Link></li>
          <li><Link to="/dashboard/users">👥 Users</Link></li>
          <li><Link to="/dashboard/academics">🎓 Academics</Link></li>
          <li><Link to="/dashboard/admissions">📝 Admissions</Link></li>
          <li><Link to="/dashboard/employees">👔 Employees</Link></li>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>
          <li><Link to="/dashboard/fees">💰 Fees</Link></li>
          <li><Link to="/dashboard/classes">📚 Classes</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/library">📚 Library</Link></li>
          <li><Link to="/dashboard/transport">🚌 Transport</Link></li>
          <li><Link to="/dashboard/hostel">🛌 Hostel</Link></li>
          <li><Link to="/dashboard/reports">📊 Reports</Link></li>
          <li><Link to="/dashboard/settings">⚙️ Settings</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          <li><Link to="/dashboard/events">🎉 Events</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Super Admin Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="schools" element={<SchoolManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="academics" element={<AcademicManagement />} />
          <Route path="admissions" element={<AdmissionManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="marks" element={<MarksManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="homework" element={<HomeworkManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="library" element={<LibraryManagement />} />
          <Route path="transport" element={<TransportManagement />} />
          <Route path="hostel" element={<HostelManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="events" element={<EventList />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
