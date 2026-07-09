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

const UpgradeRequired = ({ requiredPlan = 'Gold' }) => (
  <div className="card" style={{ padding: '40px', textAlign: 'center', margin: '20px auto', maxWidth: '600px' }}>
    <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🔒</div>
    <h2>Plan Upgrade Required</h2>
    <p style={{ marginTop: '10px', color: '#6b7280', lineHeight: '1.6' }}>
      This module is not included in your current active plan. Please upgrade to the <strong>{requiredPlan} Plan</strong> or above to unlock this feature.
    </p>
    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>
      View Subscription Plans
    </button>
  </div>
);

const AccountantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const plan = localStorage.getItem('subscriptionPlan') || 'silver';

  const isModuleAllowed = (moduleKey) => {
    const normalizedPlan = String(plan).toLowerCase();
    
    // Silver Plan restrictions
    if (normalizedPlan === 'silver') {
      const allowedInSilver = ['dashboard', 'students', 'teachers', 'change-password'];
      return allowedInSilver.includes(moduleKey);
    }
    
    return true;
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

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💼 {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'principal' ? 'Principal' : 'Accountant'}</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          {isModuleAllowed('students') && <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>}
          {isModuleAllowed('teachers') && <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>}
          {isModuleAllowed('collections') && <li><Link to="/dashboard/collections">💰 Collections</Link></li>}
          {isModuleAllowed('fees') && <li><Link to="/dashboard/fees">🧾 Fee Management</Link></li>}
          {isModuleAllowed('pending') && <li><Link to="/dashboard/pending">⏳ Pending Fees</Link></li>}
          {isModuleAllowed('payments') && <li><Link to="/dashboard/payments">💳 Payments</Link></li>}
          {isModuleAllowed('reports') && <li><Link to="/dashboard/reports">📊 Reports</Link></li>}
          {isModuleAllowed('expenses') && <li><Link to="/dashboard/expenses">📉 Expenses</Link></li>}
          {isModuleAllowed('salary') && <li><Link to="/dashboard/salary">💵 Payroll</Link></li>}
          {isModuleAllowed('concessions') && <li><Link to="/dashboard/concessions">✍ Concessions</Link></li>}
          <li><Link to="/change-password">🔒 Change Password</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Accountant & Admin Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="students" element={isModuleAllowed('students') ? <StudentManagement /> : <UpgradeRequired requiredPlan="Silver" />} />
          <Route path="teachers" element={isModuleAllowed('teachers') ? <AccountantTeachers /> : <UpgradeRequired requiredPlan="Silver" />} />
          <Route path="collections" element={isModuleAllowed('collections') ? <AccountantCollections /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="fees" element={isModuleAllowed('fees') ? <FeeManagement /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="pending" element={isModuleAllowed('pending') ? <AccountantPendingFees /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="payments" element={isModuleAllowed('payments') ? <AccountantPayments /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="reports" element={isModuleAllowed('reports') ? <AccountantReports /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="expenses" element={isModuleAllowed('expenses') ? <AccountantExpenses /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="salary" element={isModuleAllowed('salary') ? <AccountantPayroll /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="concessions" element={isModuleAllowed('concessions') ? <ConcessionManagement /> : <UpgradeRequired requiredPlan="Gold" />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;
