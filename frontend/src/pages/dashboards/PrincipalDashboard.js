import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, teacherService, feeService, attendanceService, examService } from '../../services/api';
import StudentManagement from '../components/StudentManagement';
import TeacherManagement from '../components/TeacherManagement';
import DashboardHome from '../components/DashboardHome';
import PrincipalAttendance from '../components/PrincipalAttendance';
import PrincipalPerformance from '../components/PrincipalPerformance';
import PrincipalExamManagement from '../components/PrincipalExamManagement';
import PrincipalTeacherManagement from '../components/PrincipalTeacherManagement';
import PrincipalFinanceReport from '../components/PrincipalFinanceReport';
import PrincipalComprehensiveReports from '../components/PrincipalComprehensiveReports';
import PrincipalLeaveManagement from '../components/PrincipalLeaveManagement';
import PrincipalPendingFees from '../components/PrincipalPendingFees';
import PrincipalConcessionGrant from '../components/PrincipalConcessionGrant';
import PrincipalPayrollManagement from '../components/PrincipalPayrollManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';


const PrincipalDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

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

      // Calculate today's metrics
      const today = new Date().toDateString();
      const todayAttendance = attendanceData.filter(a => 
        new Date(a.date).toDateString() === today
      ).length;
      const todayFees = feeData.filter(f => 
        f.paymentDate && new Date(f.paymentDate).toDateString() === today
      ).length;

      // Count upcoming exams
      const upcomingExams = examData.filter(e => 
        new Date(e.date) > new Date()
      ).length;

      // Count pending fees
      const pendingFees = feeData.filter(f => !f.isPaid).length;

      // Generate notifications
      const notifs = [];
      if (pendingFees > 10) notifs.push({ type: 'warning', message: `${pendingFees} fees are pending` });
      if (upcomingExams > 0) notifs.push({ type: 'info', message: `${upcomingExams} exams coming up` });
      if (todayAttendance === 0) notifs.push({ type: 'warning', message: 'No attendance recorded today' });

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
      setNotifications(notifs);
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

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>👔 Principal</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            MANAGEMENT
          </li>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>
          <li><Link to="/dashboard/exams">📝 Exams</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            OPERATIONS
          </li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/performance">📈 Performance</Link></li>
          <li><Link to="/dashboard/pending">⏳ Fee Overview</Link></li>
          <li><Link to="/dashboard/concessions">🎁 Concessions</Link></li>
          <li><Link to="/dashboard/payroll">💼 Teacher Payroll</Link></li>
          <li><Link to="/dashboard/leaves">🗓️ Leave Requests</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          
          <li style={{ marginTop: '20px', fontSize: '0.85em', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', paddingLeft: '15px' }}>
            REPORTS & ANALYTICS
          </li>
          <li><Link to="/dashboard/finance">💼 Finance Overview</Link></li>
          <li><Link to="/dashboard/reports">📊 Comprehensive Reports</Link></li>
          
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Principal Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              background: plan.startsWith('platinum') ? 'linear-gradient(135deg, #06b6d4, #0891b2)' :
                          plan === 'gold' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                          'linear-gradient(135deg, #64748b, #475569)',
              color: '#fff',
              textTransform: 'uppercase',
            }}>
              {plan === 'platinum_with_ocr' ? '⭐ Platinum + OCR' :
               plan === 'platinum_without_ocr' || plan === 'platinum' ? '⭐ Platinum' :
               plan === 'gold' ? '🏆 Gold' : '🥈 Silver'} Plan
            </span>
            <span style={{ fontSize: '0.9em', color: '#6b7280' }}>{new Date().toLocaleDateString()}</span>
          </div>
          {notifications.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              backgroundColor: '#fffbeb',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #fcd34d'
            }}>
              <span style={{ fontSize: '1.2em' }}>🔔</span>
              <div>
                <strong style={{ color: '#92400e' }}>Notifications</strong>
                <div style={{ fontSize: '0.85em', color: '#b45309' }}>
                  {notifications.map((n, i) => (
                    <div key={i}>• {n.message}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={isGoldOrBetter ? <PrincipalTeacherManagement /> : <PlanUpgradeRequired featureName="Teachers Management" requiredPlan="Gold" />} />
          <Route path="exams" element={<PrincipalExamManagement />} />
          <Route path="attendance" element={<PrincipalAttendance />} />
          <Route path="performance" element={<PrincipalPerformance />} />
          <Route path="pending" element={isGoldOrBetter ? <PrincipalPendingFees /> : <PlanUpgradeRequired featureName="Fee Overview" requiredPlan="Gold" />} />
          <Route path="concessions" element={isGoldOrBetter ? <PrincipalConcessionGrant /> : <PlanUpgradeRequired featureName="Concessions Granting" requiredPlan="Gold" />} />
          <Route path="payroll" element={isGoldOrBetter ? <PrincipalPayrollManagement /> : <PlanUpgradeRequired featureName="Teacher Payroll" requiredPlan="Gold" />} />
          <Route path="finance" element={isPlatinum ? <PrincipalFinanceReport /> : <PlanUpgradeRequired featureName="Finance Overview" requiredPlan="Platinum" />} />
          <Route path="reports" element={isPlatinum ? <PrincipalComprehensiveReports /> : <PlanUpgradeRequired featureName="Comprehensive Reports" requiredPlan="Platinum" />} />
          <Route path="leaves" element={isPlatinum ? <PrincipalLeaveManagement /> : <PlanUpgradeRequired featureName="Leave Management" requiredPlan="Platinum" />} />
          <Route path="fees" element={<PrincipalFinanceReport />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
