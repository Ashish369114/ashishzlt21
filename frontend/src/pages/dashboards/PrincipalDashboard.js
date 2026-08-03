import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, CheckCircle2, Camera,
  LayoutDashboard, Calendar, MessageSquare, GraduationCap, Users, 
  FileText, BookOpen, Bell, FileSpreadsheet, BarChart2, LogOut, ShieldCheck
} from 'lucide-react';
import { studentService, teacherService, feeService, attendanceService, examService } from '../../services/api';
import { subscribeToDataChanges } from '../../services/syncService';
import StudentManagement from '../components/StudentManagement';
import PrincipalDashboardHome from '../components/PrincipalDashboardHome';
import PrincipalAttendance from '../components/PrincipalAttendance';
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
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        {/* Examiner-style clean brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid #BFDBFE', marginBottom: '20px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)', flexShrink: 0 }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0C4A86', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Principal</div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#0096DA', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>PORTAL DASHBOARD</div>
          </div>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><LayoutDashboard size={18} /> Dashboard</Link></li>
          <li><Link to="/dashboard/communications" className={isActive('/dashboard/communications') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={18} /> Communications</Link></li>
          <li><Link to="/dashboard/school-calendar" className={isActive('/dashboard/school-calendar') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={18} /> School Calendar</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><GraduationCap size={18} /> Student Management</Link></li>
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} /> Staff & Employees</Link></li>
          <li><Link to="/dashboard/leaves" className={isActive('/dashboard/leaves') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} /> Staff Leave Approvals</Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} /> Attendance</Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={18} /> Exams & Marks</Link></li>
          <li><Link to="/dashboard/lesson-plans" className={isActive('/dashboard/lesson-plans') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={18} /> Lesson Plans</Link></li>
          <li><Link to="/dashboard/notices" className={isActive('/dashboard/notices') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Bell size={18} /> Circulars & Notices</Link></li>
          <li><Link to="/dashboard/meeting-moms" className={isActive('/dashboard/meeting-moms') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileSpreadsheet size={18} /> Meeting MOMs</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BarChart2 size={18} /> Executive Reports</Link></li>

          <li style={{ marginTop: '20px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '10px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogOut size={16} /> Logout
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
          <Route path="attendance" element={<PrincipalAttendance />} />
          <Route path="finance" element={<PrincipalFinanceAndFees isPlatinum={true} />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="leaves" element={<PrincipalLeaveManagement />} />
          <Route path="lesson-plans" element={<PrincipalLessonPlanManagement />} />
          <Route path="notices" element={<NoticeManagement />} />
          <Route path="meeting-moms" element={<MeetingMomManagement />} />
          <Route path="complaints" element={<PrincipalTeacherComplaints />} />
          <Route path="*" element={<PrincipalDashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalDashboard;

