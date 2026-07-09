import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, feeService, teacherService, expenseService } from '../../services/api';
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

const AccountantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [students, pendingFees, allFees, teachers, expenses] = await Promise.all([
        studentService.getAll(),
        feeService.getPending(),
        feeService.getAll(),
        teacherService.getAll(),
        expenseService.getAll(),
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
        pendingFees: pendingFees.data.length,
        pendingAmount: pendingFees.data.reduce((sum, fee) => sum + Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0), 0),
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
          <h2>💼 Accountant</h2>
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
          <li><Link to="/dashboard/salary">💵 Payroll</Link></li>
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
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<AccountantTeachers />} />
          <Route path="collections" element={<AccountantCollections />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="pending" element={<AccountantPendingFees />} />
          <Route path="payments" element={<AccountantPayments />} />
          <Route path="reports" element={<AccountantReports />} />
          <Route path="expenses" element={<AccountantExpenses />} />
          <Route path="salary" element={<AccountantPayroll />} />
          <Route path="*" element={<DashboardHome stats={stats} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;
