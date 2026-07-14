import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { studentService, teacherService, feeService, attendanceService, examService } from '../../services/api';
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

const PrincipalDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);

  useEffect(() => {
    fetchData();
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

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const plan = (localStorage.getItem('subscriptionPlan') || user?.subscriptionPlan || 'silver').toLowerCase();
  const isGoldOrBetter = plan === 'gold' || plan.startsWith('platinum');
  const isPlatinum = plan.startsWith('platinum');

  const planLabel = plan === 'platinum_with_ocr' ? '⭐ PLATINUM + OCR' :
                    plan === 'platinum_without_ocr' || plan === 'platinum' ? '⭐ PLATINUM' :
                    plan === 'gold' ? '🏆 GOLD' : '🥈 SILVER';

  const planBg = plan.startsWith('platinum') ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' :
                 plan === 'gold' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                 'linear-gradient(135deg, #64748b, #475569)';

  return (
    <div className="dashboard-layout">
      {/* Horizontal top nav */}
      <div className="sidebar" style={{ overflowY: 'auto' }}>
        <div className="sidebar-header">
          <h2>👔 Principal</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>📊 Dashboard</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''}>👨‍🎓 Students</Link></li>
          
          <li><Link to="/dashboard/employees" className={isActive('/dashboard/employees') ? 'active' : ''}>👨‍💼 Employees</Link></li>

          <li><Link to="/dashboard/attendance" className={isActive('/dashboard/attendance') ? 'active' : ''}>✅ Attendance</Link></li>
          <li><Link to="/dashboard/exams" className={isActive('/dashboard/exams') ? 'active' : ''}>📝 Exams</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''}>📊 Reports</Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''}>⚙️ Change Password</Link></li>

          <li style={{ marginTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route index element={<PrincipalDashboardHome stats={stats} user={user} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="employees" element={isGoldOrBetter ? <EmployeeManagement /> : <PlanUpgradeRequired featureName="Employee Management" requiredPlan="Gold" />} />
          <Route path="teachers" element={isGoldOrBetter ? <EmployeeManagement /> : <PlanUpgradeRequired featureName="Employee Management" requiredPlan="Gold" />} />
          <Route path="exams" element={<PrincipalExamManagement />} />
          <Route path="attendance" element={<PrincipalAttendance />} />
          <Route path="finance" element={isGoldOrBetter ? <PrincipalFinanceAndFees isPlatinum={isPlatinum} /> : <PlanUpgradeRequired featureName="Finance Overview" requiredPlan="Gold" />} />
          <Route path="reports" element={isPlatinum ? <ReportManagement /> : <PlanUpgradeRequired featureName="Reports & Analytics" requiredPlan="Platinum" />} />
          <Route path="leaves" element={isPlatinum ? <PrincipalLeaveManagement /> : <PlanUpgradeRequired featureName="Leave Management" requiredPlan="Platinum" />} />
          <Route path="complaints" element={<PrincipalTeacherComplaints />} />
          <Route path="*" element={<PrincipalDashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
