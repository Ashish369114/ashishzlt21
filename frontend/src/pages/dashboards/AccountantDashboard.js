import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { studentService, feeService, teacherService, expenseService, classService } from '../../services/api';
import { subscribeToDataChanges } from '../../services/syncService';
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
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';

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
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem('accountantProfileImage') || '');
  const plan = localStorage.getItem('subscriptionPlan') || 'silver';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feesDropdownOpen, setFeesDropdownOpen] = useState(false);
  const feesRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('accountantProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const isPremiumFeatureAllowed = () => true;

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
          background: #ffffff;
          color: #0C4A86;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #BFDBFE;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(12, 74, 134, 0.04);
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
            width: 100%;
            box-shadow: none;
            border: none;
            background: rgba(0,0,0,0.05);
          }
          .dropdown-item:hover, .dropdown-item.active {
            background: #0C4A86;
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
            <div style={{ width: '32px', height: '32px', background: '#0C4A86', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>💼</span>
            </div>
            {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'principal' ? 'Principal' : 'Accountant'}
          </h2>
        </div>

        <ul className="nav-menu">
          <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link></li>
          <li><Link to="/dashboard/calendar" className={isActive('/dashboard/calendar') ? 'active' : ''}>📅 Calendar</Link></li>
          <li><Link to="/dashboard/school-calendar" className={isActive('/dashboard/school-calendar') ? 'active' : ''}>📅 School Calendar</Link></li>
          <li><Link to="/dashboard/students" className={isActive('/dashboard/students') ? 'active' : ''}>Students</Link></li>

          <li>
            <div 
              onClick={() => setFeesDropdownOpen(!feesDropdownOpen)}
              style={{ padding: '12px 16px', color: '#0C4A86', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: feesDropdownOpen || isActive(['/dashboard/fees', '/dashboard/payments', '/dashboard/pending', '/dashboard/collections', '/dashboard/concessions']) ? '#FAF6F0' : 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' }}
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
          
          <li style={{ marginTop: '30px', borderTop: '1px solid #BFDBFE', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        {/* Modern Accountant Header */}
        <div className="accountant-top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '50px',
                background: '#EBF5FF',
                color: '#0C4A86',
                border: '1.5px solid #BFDBFE',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0C4A86' }}>
                Good Morning, {
                  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() && [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() !== 'Mr.'
                    ? [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
                    : 'Vikram Malhotra'
                } 👋
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ color: '#0096DA', fontWeight: '700', fontSize: '0.88rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', padding: '6px 14px', background: '#EBF5FF', color: '#0C4A86', borderRadius: '50px', border: '1px solid #BFDBFE' }}>
              Finance & Accounts
            </span>

            {/* Profile Avatar Upload Feature */}
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" style={{ display: 'none' }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700',
                border: '2px solid #BFDBFE',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Accountant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user?.firstName?.[0] || 'A'}</span>
              )}
            </button>
          </div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} user={user} />} />
          <Route path="calendar" element={<InteractiveGoogleCalendar />} />
          <Route path="school-calendar" element={<SchoolCalendarManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<AccountantTeachers />} />
          <Route path="payroll" element={<AccountantPayroll />} />
          <Route path="collections" element={<AccountantCollections />} />
          <Route path="fees" element={<FeeManagement user={user} />} />
          <Route path="pending" element={<AccountantPendingFees />} />
          <Route path="payments" element={<AccountantPayments />} />
          <Route path="concessions" element={<ConcessionManagement />} />
          <Route path="reports" element={<AccountantReports isPremiumFeatureAllowed={isPremiumFeatureAllowed} />} />
          <Route path="expenses" element={<AccountantExpenses />} />
          <Route path="*" element={<DashboardHome stats={stats} user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;
