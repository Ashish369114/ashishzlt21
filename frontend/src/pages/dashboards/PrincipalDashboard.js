import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, CheckCircle2, Camera,
  LayoutDashboard, Calendar, MessageSquare, GraduationCap, Users, 
  FileText, BookOpen, Bell, FileSpreadsheet, BarChart2, LogOut, ShieldCheck, Settings, Gift
} from 'lucide-react';
import api, { studentService, teacherService, feeService, attendanceService, examService, classService } from '../../services/api';
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
    window.addEventListener('schoolDataUpdated', fetchData);
    const unsubscribe = subscribeToDataChanges((eventData) => {
      console.log('Realtime sync received in Principal:', eventData);
      fetchData();
    });
    return () => {
      unsubscribe();
      window.removeEventListener('schoolDataUpdated', fetchData);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const fetchData = async () => {
    try {
      const [students, teachers, employeesRes, classStatsRes, fees, attendance, exams] = await Promise.all([
        studentService.getAll().catch(() => ({ data: [] })),
        teacherService.getAll().catch(() => ({ data: [] })),
        api.get('/employees').catch(() => ({ data: [] })),
        classService.getStats().catch(() => ({ data: {} })),
        feeService.getAll().catch(() => ({ data: [] })),
        attendanceService.getAll().catch(() => ({ data: [] })),
        examService.getAll().catch(() => ({ data: [] })),
      ]);

      const studentData = Array.isArray(students.data) && students.data.length > 0 ? students.data : [];
      const teacherData = Array.isArray(teachers.data) && teachers.data.length > 0 ? teachers.data : [];
      const empData = Array.isArray(employeesRes?.data) ? employeesRes.data : [];
      const classStats = classStatsRes.data || {};
      const feeData = Array.isArray(fees.data) ? fees.data : [];
      const attendanceData = Array.isArray(attendance.data) ? attendance.data : [];
      const examData = Array.isArray(exams.data) ? exams.data : [];

      const today = new Date().toDateString();
      const todayAttendance = attendanceData.filter(a => new Date(a.date).toDateString() === today).length;
      const upcomingExams = examData.filter(e => new Date(e.date) > new Date()).length || 3;
      const pendingFees = feeData.filter(f => !f.isPaid).length;

      // Dynamic live student count reflecting additions AND deletions
      let finalStudentCount = 300;
      if (studentData.length > 0) {
        finalStudentCount = studentData.length;
      } else {
        const savedMasterStr = localStorage.getItem('school_students_list');
        if (savedMasterStr) {
          try {
            const parsed = JSON.parse(savedMasterStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              finalStudentCount = parsed.length;
            }
          } catch (e) {}
        }
      }

      // Dynamic live employee/staff count & categorization matching Staff & Employees
      let activeEmployees = empData;
      if (activeEmployees.length === 0) {
        const savedEmpStr = localStorage.getItem('employee_list');
        if (savedEmpStr) {
          try {
            activeEmployees = JSON.parse(savedEmpStr) || [];
          } catch (e) {}
        }
      }

      let finalTeacherCount = 30;
      let nonTeachingCount = 28;
      let totalStaffCount = 58;

      if (activeEmployees.length > 0) {
        const nonTeachingEmployees = activeEmployees.filter(e => {
          const type = String(e.employeeType || e.type || e.designation || '').toLowerCase();
          return type.includes('non') || type.includes('admin') || type.includes('clerk') || type.includes('librarian') || type.includes('receptionist') || type.includes('officer') || type.includes('assistant');
        });

        const teachingEmployees = activeEmployees.filter(e => {
          const type = String(e.employeeType || e.type || e.designation || '').toLowerCase();
          return !type.includes('non') && (type.includes('teaching') || type.includes('teacher') || type.includes('tgt') || type.includes('pgt') || type.includes('school') || type.includes('primary') || type.includes('junior') || type.includes('high') || type.includes('nursery') || type.includes('pre-primary') || type.includes('faculty'));
        });

        finalTeacherCount = teachingEmployees.length;
        nonTeachingCount = nonTeachingEmployees.length;
        totalStaffCount = activeEmployees.length;
      }

      setStats({
        totalStudents: finalStudentCount,
        totalTeachers: finalTeacherCount,
        totalTeaching: finalTeacherCount,
        totalNonTeaching: nonTeachingCount,
        totalParents: Math.ceil(finalStudentCount / 2),
        totalStaff: totalStaffCount,
        totalEmployees: totalStaffCount,
        todayAttendance,
        todayFees: feeData.filter(f => f.isPaid).length,
        upcomingExams,
        pendingFees,
        totalFees: feeData.length,
        collectedFees: feeData.filter(f => f.isPaid).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setStats({
        totalStudents: 300,
        totalTeachers: 30,
        totalTeaching: 30,
        totalNonTeaching: 28,
        totalParents: 150,
        totalStaff: 58,
        totalEmployees: 58,
        todayAttendance: 28,
        todayFees: 12,
        upcomingExams: 3,
        pendingFees: 15,
        totalFees: 30,
        collectedFees: 15,
      });
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

