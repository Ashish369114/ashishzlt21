import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, CheckCircle2, Camera,
  LayoutDashboard, Calendar, MessageSquare, GraduationCap, Users, 
  FileText, BookOpen, Bell, FileSpreadsheet, BarChart2, LogOut, ShieldCheck, Settings, Gift
} from 'lucide-react';
import { studentService, teacherService, feeService, attendanceService, examService } from '../../services/api';
import { subscribeToDataChanges } from '../../services/syncService';
import StudentManagement from '../components/StudentManagement';
import PrincipalDashboardHome from '../components/PrincipalDashboardHome';
import AttendanceManagement from '../components/AttendanceManagement';
import PrincipalPerformance from '../components/PrincipalPerformance';
import PrincipalExamManagement from '../components/PrincipalExamManagement';
import EmployeeManagement from '../components/EmployeeManagement';
import PrincipalFinanceReport from '../components/PrincipalFinanceReport';
import PrincipalComprehensiveReports from '../components/PrincipalComprehensiveReports';
import PrincipalLeaveManagement from '../components/PrincipalLeaveManagement';
import PrincipalPendingFees from '../components/PrincipalPendingFees';
import PrincipalConcessionGrant from '../components/PrincipalConcessionGrant';
import PrincipalPayrollManagement from '../components/PrincipalPayrollManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';
import PrincipalFinanceAndFees from '../components/PrincipalFinanceAndFees';
import ReportManagement from '../components/ReportManagement';
import EventList from '../components/EventList';
import PrincipalTeacherComplaints from '../components/PrincipalTeacherComplaints';
import PrincipalLessonPlanManagement from '../components/PrincipalLessonPlanManagement';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import NoticeManagement from '../components/NoticeManagement';
import MeetingMomManagement from '../components/MeetingMomManagement';
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import MultiRoleMessagingSystem from '../../components/common/MultiRoleMessagingSystem';
import TeacherSettingsPage from './TeacherSettingsPage';

const PrincipalDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem('principalProfileImage') || '');

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToDataChanges((eventData) => {
      console.log('Realtime sync received in Principal:', eventData);
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path) => location.pathname === path;

  const fetchData = async () => {
    try {
      const [students, teachers, fees, attendance, exams] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        feeService.getAll(),
        attendanceService.getAll(),
        examService.getAll(),
      ]);

      const studentData = students.data || [];
      const teacherData = teachers.data || [];
      const feeData = fees.data || [];
      const attendanceData = attendance.data || [];
      const examData = exams.data || [];

      const today = new Date().toDateString();
      const todayAttendance = attendanceData.filter(a => new Date(a.date).toDateString() === today).length;
      const upcomingExams = examData.filter(e => new Date(e.date) > new Date()).length;
      const pendingFees = feeData.filter(f => !f.isPaid).length;

      setStats({
        totalStudents: studentData.length,
        totalTeachers: teacherData.length,
        totalParents: Math.ceil(studentData.length / 2),
        totalStaff: teacherData.length + 5,
        todayAttendance,
        todayFees: feeData.filter(f => f.isPaid).length,
        upcomingExams,
        pendingFees,
        totalFees: feeData.length,
        collectedFees: feeData.filter(f => f.isPaid).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('principalProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Horizontal top nav */}
      <div className="sidebar">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.2)', flexShrink: 0 }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0C4A86', lineHeight: 1.2 }}>ABC International</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0096DA' }}>Principal Portal</div>
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
          <li><Link to="/dashboard/communications" className={isActive('/dashboard/communications') ? 'active' : ''}><MessageSquare size={18} /> <span>Communications</span></Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''}><GraduationCap size={18} /> <span>Student Management</span></Link></li>
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''}><Users size={18} /> <span>Staff & Employees</span></Link></li>
          <li><Link to="/dashboard/leaves" className={isActive('/dashboard/leaves') ? 'active' : ''}><CheckCircle2 size={18} /> <span>Staff Leave Approvals</span></Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''}><CheckCircle2 size={18} /> <span>Attendance</span></Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''}><FileText size={18} /> <span>Exams & Marks</span></Link></li>
          <li><Link to="/dashboard/lesson-plans" className={isActive('/dashboard/lesson-plans') ? 'active' : ''}><BookOpen size={18} /> <span>Lesson Plans</span></Link></li>
          <li><Link to="/dashboard/notices" className={isActive('/dashboard/notices') ? 'active' : ''}><Bell size={18} /> <span>Circulars & Notices</span></Link></li>
          <li><Link to="/dashboard/meeting-moms" className={isActive('/dashboard/meeting-moms') ? 'active' : ''}><FileSpreadsheet size={18} /> <span>Meeting MOMs</span></Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''}><BarChart2 size={18} /> <span>Executive Reports</span></Link></li>
          <li><Link to="/dashboard/concessions" className={isActive('/dashboard/concessions') ? 'active' : ''}><Gift size={18} /> <span>Approve Concessions</span></Link></li>
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

      <div className="main-content">
        <Routes>
          <Route index element={<PrincipalDashboardHome stats={stats} user={user} />} />
          <Route path="calendar" element={<InteractiveGoogleCalendar />} />
          <Route path="communications" element={<MultiRoleMessagingSystem currentUserRole="Principal" currentUserName={`${user?.firstName || 'Dr. Anita'} ${user?.lastName || 'Roy'} (Principal)`} />} />
          <Route path="school-calendar" element={<SchoolCalendarManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="teachers" element={<EmployeeManagement />} />
          <Route path="exams" element={<PrincipalExamManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="finance" element={<PrincipalFinanceAndFees isPlatinum={true} />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="leaves" element={<PrincipalLeaveManagement />} />
          <Route path="lesson-plans" element={<PrincipalLessonPlanManagement />} />
          <Route path="notices" element={<NoticeManagement />} />
          <Route path="meeting-moms" element={<MeetingMomManagement />} />
          <Route path="complaints" element={<PrincipalTeacherComplaints />} />
          <Route path="concessions" element={<PrincipalConcessionGrant />} />
          <Route path="settings" element={<TeacherSettingsPage user={{ role: 'principal', ...user }} />} />
          <Route path="*" element={<PrincipalDashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalDashboard;

