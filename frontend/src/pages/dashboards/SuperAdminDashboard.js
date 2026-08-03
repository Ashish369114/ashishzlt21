import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { classService } from '../../services/api';
import { subscribeToDataChanges } from '../../services/syncService';
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
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import { 
  LayoutDashboard, Users, GraduationCap, ClipboardList, 
  BookOpen, Bus, BedDouble, BarChart3, Settings, 
  Calendar as CalendarIcon, LogOut, Bell,
  ChevronDown, ChevronRight, Archive, Camera, ArrowLeft
} from 'lucide-react';
import AcademicManagement from '../components/AcademicManagement';
import SettingsManagement from '../components/SettingsManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';
import AuditLogsManagement from '../components/AuditLogsManagement';
import MeetingMomManagement from '../components/MeetingMomManagement';
import NoticeManagement from '../components/NoticeManagement';
import BackupRestoreManagement from '../components/BackupRestoreManagement';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const rawName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  const userName = (rawName && rawName !== 'Super Admin') ? rawName : (user?.name && user.name !== 'Super Admin') ? user.name : 'Rajesh Sharma';
  const [stats, setStats] = useState(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem('adminProfileImage') || '');

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    fetchStats();
    // Subscribe to realtime cross-portal changes (from Teacher, Parent, etc.)
    const unsubscribe = subscribeToDataChanges((eventData) => {
      console.log('Realtime sync received in SuperAdmin:', eventData);
      fetchStats();
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await classService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('adminProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <div className="sidebar" style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
          <h2 style={{ color: '#0C4A86', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0C4A86', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🎓</span>
            </div>
            Super Admin
          </h2>
        </div>
        <ul className="nav-menu" style={{ marginTop: '20px' }}>
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><LayoutDashboard size={20} /> Dashboard</Link></li>
          <li><Link to="/dashboard/calendar" className={isActive('/dashboard/calendar') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CalendarIcon size={20} /> Calendar</Link></li>
          <li><Link to="/dashboard/school-calendar" className={isActive('/dashboard/school-calendar') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CalendarIcon size={20} /> School Calendar</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><GraduationCap size={20} /> Students</Link></li>
          
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={20} /> Employees</Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Attendance</Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Exams</Link></li>
          <li><Link to="/dashboard/library" className={isActive('/dashboard/library') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BookOpen size={20} /> Library</Link></li>
          <li><Link to="/dashboard/inventory" className={isActive('/dashboard/inventory') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Archive size={20} /> Inventory</Link></li>
          <li><Link to="/dashboard/hostel" className={isActive('/dashboard/hostel') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BedDouble size={20} /> Hostel</Link></li>
          <li><Link to="/dashboard/notices" className={isActive('/dashboard/notices') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Bell size={20} /> Circulars & Notices</Link></li>
          <li><Link to="/dashboard/meeting-moms" className={isActive('/dashboard/meeting-moms') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ClipboardList size={20} /> Meeting MOMs</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart3 size={20} /> Reports</Link></li>
          <li><Link to="/dashboard/audit-logs" className={isActive('/dashboard/audit-logs') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} /> Audit Logs</Link></li>
          <li><Link to="/dashboard/backup-restore" className={isActive('/dashboard/backup-restore') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Archive size={20} /> Backup & Restore</Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} /> Settings</Link></li>

          <li style={{ marginTop: '20px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '10px', borderTop: '1px solid #BFDBFE', paddingTop: '16px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '50px', padding: '10px' }}>
              <LogOut size={18} /> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content" style={{ background: '#F8FAFC', padding: 0 }}>
        {/* Top Header */}
        <div style={{
          background: '#ffffff',
          padding: '20px 32px',
          borderBottom: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '50px',
                background: '#EBF5FF',
                color: '#0C4A86',
                border: '1.5px solid #BFDBFE',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0C4A86' }}>Good Morning, {userName} 👋</h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6B5B54' }}>Here's what's happening with your school today.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6B5B54', fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #BFDBFE', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0C4A86' }}>{userName}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B5B54', fontWeight: '500' }}>
                  Super Admin
                </div>
              </div>

              {/* Photo Upload Avatar Feature */}
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" style={{ display: 'none' }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile photo"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: '2px solid #BFDBFE',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{user?.firstName?.[0] || 'A'}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <Routes>
          <Route index element={<SuperAdminDashboardHome stats={stats} />} />
          <Route path="calendar" element={<InteractiveGoogleCalendar />} />
          <Route path="school-calendar" element={<SchoolCalendarManagement />} />
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

