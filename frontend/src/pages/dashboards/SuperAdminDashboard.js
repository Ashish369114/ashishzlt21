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
import InventoryManagement from '../components/InventoryManagement';
import SuperAdminDashboardHome from '../components/SuperAdminDashboardHome';
import UserManagement from '../components/UserManagement';
import { 
  LayoutDashboard, Users, GraduationCap, ClipboardList, 
  BookOpen, Bus, BedDouble, BarChart3, Settings, 
  Calendar as CalendarIcon, LogOut, Bell,
  ChevronDown, ChevronRight, Archive
} from 'lucide-react';
import AcademicManagement from '../components/AcademicManagement';
import SettingsManagement from '../components/SettingsManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';
import AuditLogsManagement from '../components/AuditLogsManagement';
import MeetingMomManagement from '../components/MeetingMomManagement';
import NoticeManagement from '../components/NoticeManagement';
import BackupRestoreManagement from '../components/BackupRestoreManagement';

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

  const isGoldOrBetter = true;
  const isPlatinum = true;

  return (
    <div className="dashboard-layout" style={{ background: '#F7F6F3', minHeight: '100vh' }}>
      <div className="sidebar" style={{ background: '#EFE9E1', borderRight: '1px solid #D9D8D9' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid #D9D8D9', paddingBottom: '20px' }}>
          <h2 style={{ color: '#322029', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#AC968D', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🎓</span>
            </div>
            Admin
          </h2>
        </div>
        <ul className="nav-menu" style={{ marginTop: '20px' }}>
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LayoutDashboard size={20} /> Dashboard</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><GraduationCap size={20} /> Students</Link></li>
          
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={20} /> Employees</Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Attendance</Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Exams</Link></li>
          <li><Link to="/dashboard/library" className={isActive('/dashboard/library') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BookOpen size={20} /> Library</Link></li>
          <li><Link to="/dashboard/inventory" className={isActive('/dashboard/inventory') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Archive size={20} /> Inventory</Link></li>
          <li><Link to="/dashboard/transport" className={isActive('/dashboard/transport') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Bus size={20} /> Transport</Link></li>
          <li><Link to="/dashboard/hostel" className={isActive('/dashboard/hostel') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BedDouble size={20} /> Hostel</Link></li>
          <li><Link to="/dashboard/notices" className={isActive('/dashboard/notices') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Bell size={20} /> Circulars & Notices</Link></li>
          <li><Link to="/dashboard/meeting-moms" className={isActive('/dashboard/meeting-moms') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Meeting MOMs</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart3 size={20} /> Reports</Link></li>
          <li><Link to="/dashboard/audit-logs" className={isActive('/dashboard/audit-logs') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} /> Audit Logs</Link></li>
          <li><Link to="/dashboard/backup-restore" className={isActive('/dashboard/backup-restore') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Archive size={20} /> Backup & Restore</Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} /> Settings</Link></li>

          <li style={{ marginTop: '30px', borderTop: '1px solid #D9D8D9', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              <LogOut size={18} /> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content" style={{ background: '#F7F6F3', padding: 0 }}>
        {/* Top Header */}
        <div style={{
          background: '#ffffff',
          padding: '20px 32px',
          borderBottom: '1px solid #D9D8D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#322029' }}>Good Morning, Admin 👋</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6B5B54' }}>Here's what's happening with your school today.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6B5B54', fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #D9D8D9', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#322029' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B5B54', fontWeight: '500' }}>
                  Super Admin
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', background: '#EFE9E1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#322029', fontWeight: '700' }}>
                {user?.firstName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>

        <Routes>
          <Route index element={<SuperAdminDashboardHome stats={stats} />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<EmployeeManagement />} />
          <Route path="fees" element={<FeeManagement user={user} />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="marks" element={<MarksManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="library" element={<LibraryManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="transport" element={<TransportManagement />} />
          <Route path="hostel" element={<HostelManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="notices" element={<NoticeManagement />} />
          <Route path="meeting-moms" element={<MeetingMomManagement />} />
          <Route path="audit-logs" element={<AuditLogsManagement />} />
          <Route path="backup-restore" element={<BackupRestoreManagement />} />
          <Route path="events" element={<EventList />} />
          <Route path="*" element={<SuperAdminDashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
