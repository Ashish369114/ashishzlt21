import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { classService, studentService } from '../../services/api';
import { subscribeToDataChanges } from '../../services/syncService';
import { demoStudents } from '../../utils/demoData';
import TopBar from '../../components/dashboard/TopBar';
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
import TeacherSettingsPage from './TeacherSettingsPage';
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
      const [classStatsRes, studentsRes] = await Promise.all([
        classService.getStats().catch(() => ({ data: {} })),
        studentService.getAll().catch(() => ({ data: [] }))
      ]);

      const apiData = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
      const fetchedStats = classStatsRes.data || {};
      const studentCount = Math.max(apiData.length, demoStudents.length, 300);

      setStats({
        ...fetchedStats,
        totalStudents: studentCount,
        totalTeachers: fetchedStats.totalTeachers || 30,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalStudents: 300,
        totalTeachers: 30,
        totalStaff: 28,
      });
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
    <div className="dashboard-layout" style={{ background: '#FAF6F0', minHeight: '100vh' }}>
      <div className="sidebar">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.2)', flexShrink: 0 }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0C4A86', lineHeight: 1.2 }}>ABC International</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0096DA' }}>Super Admin Portal</div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ marginTop: '16px', marginBottom: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0C4A86' }}>
            NAVIGATION MENU
          </span>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}><LayoutDashboard size={18} /> <span>Dashboard</span></Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''}><GraduationCap size={18} /> <span>Students</span></Link></li>

          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''}><Users size={18} /> <span>Employees</span></Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''}><ClipboardList size={18} /> <span>Attendance</span></Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''}><ClipboardList size={18} /> <span>Exams</span></Link></li>
          <li><Link to="/dashboard/library" className={isActive('/dashboard/library') ? 'active' : ''}><BookOpen size={18} /> <span>Library</span></Link></li>
          <li><Link to="/dashboard/inventory" className={isActive('/dashboard/inventory') ? 'active' : ''}><Archive size={18} /> <span>Inventory</span></Link></li>
          <li><Link to="/dashboard/hostel" className={isActive('/dashboard/hostel') ? 'active' : ''}><BedDouble size={18} /> <span>Hostel</span></Link></li>
          <li><Link to="/dashboard/notices" className={isActive('/dashboard/notices') ? 'active' : ''}><Bell size={18} /> <span>Circulars & Notices</span></Link></li>
          <li><Link to="/dashboard/meeting-moms" className={isActive('/dashboard/meeting-moms') ? 'active' : ''}><ClipboardList size={18} /> <span>Meeting MOMs</span></Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''}><BarChart3 size={18} /> <span>Reports</span></Link></li>
          <li><Link to="/dashboard/audit-logs" className={isActive('/dashboard/audit-logs') ? 'active' : ''}><Settings size={18} /> <span>Audit Logs</span></Link></li>
          <li><Link to="/dashboard/backup-restore" className={isActive('/dashboard/backup-restore') ? 'active' : ''}><Archive size={18} /> <span>Backup & Restore</span></Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''}><Settings size={18} /> <span>Settings & Profile</span></Link></li>

          <li style={{ marginTop: '16px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #BFDBFE' }}>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content" style={{
        background: 'radial-gradient(circle at top left, rgba(129, 140, 248, 0.14), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '24px 32px',
        minHeight: '100vh'
      }}>
        {/* Sticky Frosted Glass TopBar (matching Pic 2 Teacher Portal reference) */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          marginBottom: '24px',
          borderRadius: '1.6rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.85)',
          padding: '4px',
          boxShadow: '0 4px 15px -2px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}>
          <TopBar
            userName={userName}
            subject="Super Admin Panel"
            onOpenNotifications={() => navigate('/dashboard/notices')}
            onOpenMessages={() => navigate('/dashboard/notices')}
            onOpenSettings={() => navigate('/dashboard/settings')}
          />
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
          <Route path="settings" element={<TeacherSettingsPage user={{ role: 'super_admin', ...user }} />} />
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

