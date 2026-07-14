import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const plan = localStorage.getItem('subscriptionPlan') || 'silver';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feesDropdownOpen, setFeesDropdownOpen] = useState(false);
  const feesRef = useRef(null);

  // Handle click outside to close fees dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feesRef.current && !feesRef.current.contains(event.target)) {
        setFeesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setFeesDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (paths) => {
    if (typeof paths === 'string') paths = [paths];
    return paths.some(path => {
      if (path === '/dashboard' && location.pathname === '/dashboard') return true;
      if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
      return false;
    });
  };

  const isPremiumFeatureAllowed = (featureKey) => {
    const p = String(plan).toLowerCase();
    const isGoldOrAbove = ['gold', 'platinum', 'platinum_with_ocr', 'platinum_without_ocr'].includes(p);
    const isPlatinum = p.startsWith('platinum');
    const isOcrPlatinum = p === 'platinum_with_ocr';

    switch (featureKey) {
      case 'concessions':      return isGoldOrAbove;
      case 'payroll':          return isGoldOrAbove;
      case 'advanced_reports': return isPlatinum;
      case 'ocr':              return isOcrPlatinum;
      default:                 return true;
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
      <style>{`
        .accountant-top-nav {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
          z-index: 100;
          flex-shrink: 0;
        }
        .nav-brand {
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          color: #cbd5e1;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        .nav-link.active {
          color: white;
          background: rgba(124, 58, 237, 0.8);
        }
        .nav-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          min-width: 200px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 101;
        }
        .dropdown-item {
          color: #334155;
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          display: block;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: #f1f5f9;
          color: #7c3aed;
        }
        .dropdown-item.active {
          background: #ede9fe;
          color: #7c3aed;
          font-weight: 600;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }
        .logout-btn-top {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
          margin-left: 12px;
        }
        .logout-btn-top:hover {
          background: #ef4444;
          color: white;
        }
        
        @media (max-width: 1024px) {
          .nav-links {
            display: none;
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: #1e293b;
            flex-direction: column;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            align-items: stretch;
            max-height: calc(100vh - 64px);
            overflow-y: auto;
          }
          .nav-links.mobile-open {
            display: flex;
          }
          .mobile-toggle {
            display: block;
          }
          .nav-dropdown-menu {
            position: static;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: none;
            padding: 8px 16px;
            margin-top: 4px;
          }
          .dropdown-item {
            color: #cbd5e1;
          }
          .dropdown-item:hover, .dropdown-item.active {
            background: rgba(124, 58, 237, 0.3);
            color: white;
          }
          .logout-btn-top {
            margin-left: 0;
            margin-top: 12px;
            text-align: center;
          }
        }
      `}</style>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>
            <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>💼</span>
            </div>
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'principal' ? 'Principal' : 'Accountant'}
          </h2>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''}>Students</Link></li>

          <li>
            <div 
              onClick={() => setFeesDropdownOpen(!feesDropdownOpen)}
              style={{ padding: '12px 16px', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: feesDropdownOpen || isActive(['/dashboard/fees', '/dashboard/payments', '/dashboard/pending', '/dashboard/collections', '/dashboard/concessions']) ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' }}
            >
              <span>Fees</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{feesDropdownOpen ? '▲' : '▼'}</span>
            </div>
            {feesDropdownOpen && (
              <ul style={{ listStyle: 'none', padding: '8px 0 0 16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><Link to="/dashboard/fees" className={isActive('/dashboard/fees') ? 'active' : ''} style={{ fontSize: '13px', padding: '8px 12px' }}>Fees Overview</Link></li>
                <li><Link to="/dashboard/payments" className={isActive('/dashboard/payments') ? 'active' : ''} style={{ fontSize: '13px', padding: '8px 12px' }}>Collect Payment</Link></li>
                <li><Link to="/dashboard/pending" className={isActive('/dashboard/pending') ? 'active' : ''} style={{ fontSize: '13px', padding: '8px 12px' }}>Pending Dues</Link></li>
                <li><Link to="/dashboard/collections" className={isActive('/dashboard/collections') ? 'active' : ''} style={{ fontSize: '13px', padding: '8px 12px' }}>Collections</Link></li>
                {isGoldOrBetter && (
                  <li><Link to="/dashboard/concessions" className={isActive('/dashboard/concessions') ? 'active' : ''} style={{ fontSize: '13px', padding: '8px 12px' }}>Concessions</Link></li>
                )}
              </ul>
            )}
          </li>
          <li><Link to="/dashboard/payroll" className={isActive('/dashboard/payroll') ? 'active' : ''}>Payroll</Link></li>
          <li><Link to="/dashboard/expenses" className={isActive('/dashboard/expenses') ? 'active' : ''}>Expenses</Link></li>
          <li><Link to="/dashboard/reports" className={isActive('/dashboard/reports') ? 'active' : ''}>Reports</Link></li>
          <li><Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''}>Settings</Link></li>
          
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'principal' ? 'Principal' : 'Accountant'} Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <span style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              background: plan.startsWith('platinum') ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' :
                          plan === 'gold' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                          'linear-gradient(135deg, #64748b, #475569)',
              color: '#fff',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {plan === 'platinum_with_ocr' ? '⭐ Platinum + OCR' :
               plan === 'platinum_without_ocr' || plan === 'platinum' ? '⭐ Platinum' :
               plan === 'gold' ? '🏆 Gold' : '🥈 Silver'} Plan
            </span>
            <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} user={user} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={isGoldOrBetter ? <AccountantTeachers /> : <PlanUpgradeRequired featureName="Teachers List" requiredPlan="Gold" />} />
          <Route path="payroll" element={isGoldOrBetter ? <AccountantPayroll /> : <PlanUpgradeRequired featureName="Payroll" requiredPlan="Gold" />} />
          <Route path="collections" element={isGoldOrBetter ? <AccountantCollections /> : <PlanUpgradeRequired featureName="Collections Overview" requiredPlan="Gold" />} />
          <Route path="fees" element={<FeeManagement user={user} />} />
          <Route path="pending" element={isGoldOrBetter ? <AccountantPendingFees /> : <PlanUpgradeRequired featureName="Pending Fees Tracking" requiredPlan="Gold" />} />
          <Route path="payments" element={isGoldOrBetter ? <AccountantPayments /> : <PlanUpgradeRequired featureName="Payments Overview" requiredPlan="Gold" />} />
          <Route path="concessions" element={isGoldOrBetter ? <ConcessionManagement /> : <PlanUpgradeRequired featureName="Discounts" requiredPlan="Gold" />} />
          <Route path="reports" element={isPlatinum ? <AccountantReports isPremiumFeatureAllowed={isPremiumFeatureAllowed} /> : <PlanUpgradeRequired featureName="Advanced Reports" requiredPlan="Platinum" />} />
          <Route path="expenses" element={isGoldOrBetter ? <AccountantExpenses /> : <PlanUpgradeRequired featureName="Expenses Tracking" requiredPlan="Gold" />} />
          <Route path="*" element={<DashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;
