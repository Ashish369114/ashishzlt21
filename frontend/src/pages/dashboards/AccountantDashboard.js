import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, feeService, teacherService, expenseService, classService } from '../../services/api';
import StudentManagement from '../components/StudentManagement';
import AccountantTeachers from '../components/AccountantTeachers';
import FeeManagement from '../components/FeeManagement';
import DashboardHome from '../components/DashboardHome';
import AccountantPendingFees from '../components/AccountantPendingFees';
import AccountantPayments from '../components/AccountantPayments';
import AccountantReports from '../components/AccountantReports';
import AccountantCollections from '../components/AccountantCollections';
import AccountantExpenses from '../components/AccountantExpenses';
import AccountantPayroll from '../components/AccountantPayroll';
import ConcessionManagement from '../components/ConcessionManagement';
import PlanUpgradeRequired from '../components/PlanUpgradeRequired';

// Shows a locked feature banner WITHIN a page (not a full block)
const FeatureLockBanner = ({ featureName, requiredPlan = 'Gold' }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.08))',
    border: '1.5px solid rgba(245,158,11,0.3)',
    borderRadius: '12px',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '18px',
  }}>
    <span style={{ fontSize: '1.6rem' }}>🔒</span>
    <div>
      <strong style={{ color: '#92400e' }}>{featureName} — {requiredPlan} Plan Feature</strong>
      <p style={{ margin: '4px 0 0', color: '#78350f', fontSize: '0.88rem' }}>
        This feature is available in the <strong>{requiredPlan}</strong> plan and above. 
        <a href="/" style={{ color: '#7c3aed', marginLeft: '6px', fontWeight: '600' }}>Upgrade your plan →</a>
      </p>
    </div>
  </div>
);

const AccountantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const plan = localStorage.getItem('subscriptionPlan') || 'silver';

  // All modules are always visible/accessible for all plans.
  // This function checks if a *premium feature* within a module is allowed.
  const isPremiumFeatureAllowed = (featureKey) => {
    const p = String(plan).toLowerCase();
    const isGoldOrAbove = ['gold', 'platinum', 'platinum_with_ocr', 'platinum_without_ocr'].includes(p);
    const isPlatinum = p.startsWith('platinum');
    const isOcrPlatinum = p === 'platinum_with_ocr';

    switch (featureKey) {
      case 'concessions':      return isGoldOrAbove;      // Gold+ only
      case 'payroll':          return isGoldOrAbove;      // Gold+ only
      case 'advanced_reports': return isPlatinum;         // Platinum+ only
      case 'ocr':              return isOcrPlatinum;      // Platinum with OCR only
      default:                 return true;               // Available to all plans
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [students, pendingFees, allFees, teachers, expenses, classes] = await Promise.all([
        studentService.getAll(),
        feeService.getPending(),
        feeService.getAll(),
        teacherService.getAll(),
        expenseService.getAll(),
        classService.getAll(),
      ]);

      const allPaidFees = Array.isArray(allFees.data) ? allFees.data.filter((fee) => fee.isPaid || Number(fee.paidAmount || 0) > 0) : [];
      const totalExpenses = Array.isArray(expenses.data) ? expenses.data.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) : 0;
      const today = new Date();
      const todayCollection = allPaidFees.reduce((sum, fee) => {
        if (!fee.paymentDate) return sum;
        const paidDate = new Date(fee.paymentDate);
        return paidDate.toDateString() === today.toDateString() ? sum + Number(fee.paidAmount || fee.amount || 0) : sum;
      }, 0);
      const monthlyCollection = allPaidFees.reduce((sum, fee) => {
        if (!fee.paymentDate) return sum;
        const paidDate = new Date(fee.paymentDate);
        return paidDate.getMonth() === today.getMonth() && paidDate.getFullYear() === today.getFullYear()
          ? sum + Number(fee.paidAmount || fee.amount || 0)
          : sum;
      }, 0);

      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
        totalClasses: classes.data.length,
        totalPendingAmount: pendingFees.data.reduce((sum, fee) => sum + Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0), 0),
        totalAmount: allFees.data.reduce((sum, fee) => sum + Number(fee.amount || 0), 0),
        totalExpenses,
        netIncome: allPaidFees.reduce((sum, fee) => sum + Number(fee.paidAmount || fee.amount || 0), 0) - totalExpenses,
        todayCollection,
        monthlyCollection,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const planName = String(plan).toLowerCase();
  const isGoldOrBetter = planName === 'gold' || planName.startsWith('platinum');
  const isPlatinum = planName.startsWith('platinum');

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💼 {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'principal' ? 'Principal' : 'Accountant'}</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>
          <li><Link to="/dashboard/collections">💰 Collections</Link></li>
          <li><Link to="/dashboard/fees">🧾 Fee Management</Link></li>
          <li><Link to="/dashboard/pending">⏳ Pending Fees</Link></li>
          <li><Link to="/dashboard/payments">💳 Payments</Link></li>
          <li><Link to="/dashboard/reports">📊 Reports</Link></li>
          <li><Link to="/dashboard/expenses">📉 Expenses</Link></li>
          <li><Link to="/dashboard/concessions">✍ Concessions</Link></li>
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Accountant & Admin Dashboard</h1>
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
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={isGoldOrBetter ? <AccountantTeachers /> : <PlanUpgradeRequired featureName="Teachers List" requiredPlan="Gold" />} />
          <Route path="collections" element={isGoldOrBetter ? <AccountantCollections /> : <PlanUpgradeRequired featureName="Collections Overview" requiredPlan="Gold" />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="pending" element={isGoldOrBetter ? <AccountantPendingFees /> : <PlanUpgradeRequired featureName="Pending Fees Tracking" requiredPlan="Gold" />} />
          <Route path="payments" element={isGoldOrBetter ? <AccountantPayments /> : <PlanUpgradeRequired featureName="Payments Overview" requiredPlan="Gold" />} />
          <Route path="reports" element={isPlatinum ? <AccountantReports isPremiumFeatureAllowed={isPremiumFeatureAllowed} /> : <PlanUpgradeRequired featureName="Advanced Reports" requiredPlan="Platinum" />} />
          <Route path="expenses" element={isGoldOrBetter ? <AccountantExpenses /> : <PlanUpgradeRequired featureName="Expenses Tracking" requiredPlan="Gold" />} />
          <Route path="concessions" element={isGoldOrBetter ? <ConcessionManagement /> : <PlanUpgradeRequired featureName="Fee Concession Approvals" requiredPlan="Gold" />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;
