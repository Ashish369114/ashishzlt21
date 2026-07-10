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
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';

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

  const plan = (localStorage.getItem('subscriptionPlan') || user?.subscriptionPlan || 'silver').toLowerCase();
  const isGoldOrBetter = plan === 'gold' || plan.startsWith('platinum');
  const isPlatinum = plan.startsWith('platinum');

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
          <Route path="schools" element={isPlatinum ? <SchoolManagement /> : <PlanUpgradeRequired featureName="Schools Management" requiredPlan="Platinum" />} />
          <Route path="users" element={isPlatinum ? <UserManagement /> : <PlanUpgradeRequired featureName="User Management" requiredPlan="Platinum" />} />
          <Route path="academics" element={<AcademicManagement />} />
          <Route path="admissions" element={isPlatinum ? <AdmissionManagement /> : <PlanUpgradeRequired featureName="Admissions" requiredPlan="Platinum" />} />
          <Route path="employees" element={isGoldOrBetter ? <EmployeeManagement /> : <PlanUpgradeRequired featureName="Employees" requiredPlan="Gold" />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={isGoldOrBetter ? <TeacherManagement /> : <PlanUpgradeRequired featureName="Teachers" requiredPlan="Gold" />} />
          <Route path="fees" element={isGoldOrBetter ? <FeeManagement /> : <PlanUpgradeRequired featureName="Fees Management" requiredPlan="Gold" />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="marks" element={isGoldOrBetter ? <MarksManagement /> : <PlanUpgradeRequired featureName="Marks Management" requiredPlan="Gold" />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="homework" element={isGoldOrBetter ? <HomeworkManagement /> : <PlanUpgradeRequired featureName="Homework" requiredPlan="Gold" />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="library" element={isPlatinum ? <LibraryManagement /> : <PlanUpgradeRequired featureName="Library" requiredPlan="Platinum" />} />
          <Route path="transport" element={isPlatinum ? <TransportManagement /> : <PlanUpgradeRequired featureName="Transport" requiredPlan="Platinum" />} />
          <Route path="hostel" element={isPlatinum ? <HostelManagement /> : <PlanUpgradeRequired featureName="Hostel" requiredPlan="Platinum" />} />
          <Route path="reports" element={isPlatinum ? <ReportManagement /> : <PlanUpgradeRequired featureName="Reports & Analytics" requiredPlan="Platinum" />} />
          <Route path="settings" element={isPlatinum ? <SettingsManagement /> : <PlanUpgradeRequired featureName="System Settings" requiredPlan="Platinum" />} />
          <Route path="events" element={<EventList />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
