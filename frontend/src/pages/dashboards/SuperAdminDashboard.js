import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import SuperAdminDashboardHome from '../components/SuperAdminDashboardHome';
import UserManagement from '../components/UserManagement';
import { 
  LayoutDashboard, Users, GraduationCap, ClipboardList, 
  BookOpen, Bus, BedDouble, BarChart3, Settings, 
  Calendar as CalendarIcon, LogOut, Bell,
  ChevronDown, ChevronRight
} from 'lucide-react';
import AcademicManagement from '../components/AcademicManagement';
import SettingsManagement from '../components/SettingsManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

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
    <div className="dashboard-layout" style={{ background: '#0f172a' }}>
      <div className="sidebar" style={{ background: '#0f172a', borderRight: '1px solid #1e293b' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🎓</span>
            </div>
            Admin
          </h2>
        </div>
        <ul className="nav-menu" style={{ marginTop: '20px' }}>
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard') ? '#3b82f6' : '#94a3b8' }}><LayoutDashboard size={20} /> Dashboard</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/students') ? '#3b82f6' : '#94a3b8' }}><GraduationCap size={20} /> Students</Link></li>
          
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/employees') ? '#3b82f6' : '#94a3b8' }}><Users size={20} /> Employees</Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/attendance') ? '#3b82f6' : '#94a3b8' }}><ClipboardList size={20} /> Attendance</Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/exams') ? '#3b82f6' : '#94a3b8' }}><ClipboardList size={20} /> Exams</Link></li>
          <li><Link to="/dashboard/library" className={isActive('/dashboard/library') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/library') ? '#3b82f6' : '#94a3b8' }}><BookOpen size={20} /> Library</Link></li>
          <li><Link to="/dashboard/transport" className={isActive('/dashboard/transport') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/transport') ? '#3b82f6' : '#94a3b8' }}><Bus size={20} /> Transport</Link></li>
          <li><Link to="/dashboard/hostel" className={isActive('/dashboard/hostel') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/hostel') ? '#3b82f6' : '#94a3b8' }}><BedDouble size={20} /> Hostel</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/reports') ? '#3b82f6' : '#94a3b8' }}><BarChart3 size={20} /> Reports</Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isActive('/dashboard/settings') ? '#3b82f6' : '#94a3b8' }}><Settings size={20} /> Settings</Link></li>

          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              <LogOut size={18} /> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content" style={{ background: '#f8fafc', padding: 0 }}>
        {/* Top Header */}
        <div style={{
          background: '#ffffff',
          padding: '20px 32px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>Good Morning, Admin 👋</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Here's what's happening with your school today.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                  {plan === 'platinum_with_ocr' ? 'Platinum + OCR' : plan === 'platinum' ? 'Platinum' : plan === 'gold' ? 'Gold' : 'Silver'} Plan
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: '700' }}>
                {user?.firstName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>

        <Routes>
          <Route index element={<SuperAdminDashboardHome stats={stats} />} />
          <Route path="employees" element={isGoldOrBetter ? <EmployeeManagement /> : <PlanUpgradeRequired featureName="Employees" requiredPlan="Gold" />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={isGoldOrBetter ? <EmployeeManagement /> : <PlanUpgradeRequired featureName="Employees" requiredPlan="Gold" />} />
          <Route path="fees" element={<FeeManagement user={user} />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="marks" element={isGoldOrBetter ? <MarksManagement /> : <PlanUpgradeRequired featureName="Marks Management" requiredPlan="Gold" />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="library" element={isPlatinum ? <LibraryManagement /> : <PlanUpgradeRequired featureName="Library" requiredPlan="Platinum" />} />
          <Route path="transport" element={isPlatinum ? <TransportManagement /> : <PlanUpgradeRequired featureName="Transport" requiredPlan="Platinum" />} />
          <Route path="hostel" element={isPlatinum ? <HostelManagement /> : <PlanUpgradeRequired featureName="Hostel" requiredPlan="Platinum" />} />
          <Route path="reports" element={isPlatinum ? <ReportManagement /> : <PlanUpgradeRequired featureName="Reports & Analytics" requiredPlan="Platinum" />} />
          <Route path="settings" element={isPlatinum ? <SettingsManagement /> : <PlanUpgradeRequired featureName="System Settings" requiredPlan="Platinum" />} />
          <Route path="events" element={<EventList />} />
          <Route path="*" element={<SuperAdminDashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
