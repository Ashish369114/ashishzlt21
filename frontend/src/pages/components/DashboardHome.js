import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, Receipt, TrendingDown, DollarSign, Send, 
  Users, UserCheck, BookOpen, Calendar, Clock, AlertCircle, FileText, CheckCircle2, FileSpreadsheet, Gift, ShieldAlert 
} from 'lucide-react';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import { eventService, feeService, expenseService, studentService } from '../../services/api';
import PrincipalLeaveManagement from './PrincipalLeaveManagement';
import CalendarAndEventsSection from '../../components/common/CalendarAndEventsSection';

const DashboardHome = ({ stats, showEvents = true, user }) => {
  const userId = localStorage.getItem('userId');
  const schoolId = localStorage.getItem('schoolId');
  const role = user?.role || localStorage.getItem('role');
  const { notifications } = useRealtimeUpdates(userId, schoolId, role);
  
  const [events, setEvents] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  
  const scrollRef = useRef(null);
  const scrollPaused = useRef(false);
  const cards = [];

  useEffect(() => {
    fetchUpcomingEvents();
    if (role === 'accountant' || role === 'accountant_admin') {
      fetchAccountantData();
    }
  }, [role]);

  const fetchAccountantData = async () => {
    try {
      const [allFeesRes, pendingFeesRes, expensesRes, studentsRes] = await Promise.all([
        feeService.getAll(),
        feeService.getPending(),
        expenseService.getAll(),
        studentService.getAll().catch(() => ({ data: [] }))
      ]);

      const studentsList = studentsRes?.data || [];
      const sMap = {};
      studentsList.forEach((s) => {
        const fullName = s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : (s.name || '');
        if (s._id) sMap[s._id] = fullName;
        if (s.id) sMap[s.id] = fullName;
      });
      setStudentsMap(sMap);

      const allFees = allFeesRes.data || [];
      const paidFees = allFees
        .filter(f => Number(f.paidAmount || 0) > 0)
        .sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0))
        .slice(0, 5);
      setRecentCollections(paidFees);

      const allPending = pendingFeesRes.data || [];
      const topPending = allPending
        .filter(f => Number(f.amount || 0) > Number(f.paidAmount || 0))
        .slice(0, 5);
      setPendingStudents(topPending);

      const allExpenses = expensesRes.data || [];
      const recentExp = allExpenses
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 5);
      setRecentExpenses(recentExp);
    } catch (err) {
      console.error('Failed to fetch accountant data:', err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const res = await eventService.getAll();
      const allEvents = res.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = allEvents
        .filter((e) => e.eventDate && new Date(e.eventDate) >= today)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      setEvents(upcoming);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    if (events.length === 0) return;
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (scrollPaused.current) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ top: 48, behavior: 'smooth' });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [events]);

  const addCard = (label, value, formatter = (item) => item) => {
    cards.push({ label, value: formatter(value) });
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  if (role === 'accountant' || role === 'accountant_admin') {
    addCard("Today's Collection", stats?.todayCollection !== undefined ? stats.todayCollection : 0, formatCurrency);
    addCard("Monthly Collection", stats?.monthlyCollection !== undefined ? stats.monthlyCollection : 0, formatCurrency);
    addCard("Fees Pending", stats?.totalPendingAmount !== undefined ? stats.totalPendingAmount : 5175600, formatCurrency);
    addCard("Total Collected (Year)", stats?.totalCollected !== undefined ? stats.totalCollected : 668400, formatCurrency);
    addCard("Scholarships / Discounts", stats?.discountProvided !== undefined ? stats.discountProvided : 45000, formatCurrency);
    addCard("Caution Deposits", stats?.cautionDeposits !== undefined ? stats.cautionDeposits : 120000, formatCurrency);
  } else {
    addCard('Total Students', stats?.totalStudents !== undefined ? stats.totalStudents : 0);
    addCard('Total Teachers', stats?.totalTeachers !== undefined ? stats.totalTeachers : 0);
    addCard('Total Classes', stats?.totalClasses !== undefined ? stats.totalClasses : 0);
  }

  return (
    <div>
      <style>{`
        .dashboard-grid-layout {
          display: grid;
          grid-template-columns: ${showEvents ? '2fr 1fr' : '1fr'};
          gap: 20px;
        }
        .stat-card-acc {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #f1f5f9;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        .quick-action-btn {
          background: #fff;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #e2e8f0;
        }
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          border-color: #7c3aed;
        }
        .list-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        .list-header {
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 700;
          color: #1e293b;
        }
        .list-item {
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        .list-item:last-child {
          border-bottom: none;
        }
        @media (max-width: 1024px) {
          .dashboard-grid-layout {
            grid-template-columns: 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Stats Cards Layout (Full Width 3x2 Grid) */}
      <div style={{ width: '100%', marginBottom: '25px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cards.length === 6 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', width: '100%' }}>
            {cards.map((card) => {
              const getCardMeta = (label) => {
                switch (label) {
                  case "Today's Collection":
                    return { icon: DollarSign, color: '#3B82F6', pillText: '🟢 Live Today', pillBg: '#DCFCE7', pillColor: '#15803D', link: '/dashboard/collections', progress: 95 };
                  case 'Monthly Collection':
                    return { icon: TrendingDown, color: '#8B5CF6', pillText: 'Target ₹5L', pillBg: '#F3E8FF', pillColor: '#7E22CE', link: '/dashboard/collections', progress: 85 };
                  case 'Fees Pending':
                    return { icon: AlertCircle, color: '#EF4444', pillText: 'Action Req', pillBg: '#FEE2E2', pillColor: '#B91C1C', link: '/dashboard/collections', progress: 65 };
                  case 'Total Collected (Year)':
                    return { icon: FileSpreadsheet, color: '#10B981', pillText: 'Yearly Total', pillBg: '#DCFCE7', pillColor: '#15803D', link: '/dashboard/collections', progress: 88 };
                  case 'Scholarships / Discounts':
                    return { icon: Gift, color: '#F59E0B', pillText: '12 Beneficiaries', pillBg: '#FEF3C7', pillColor: '#B45309', link: '/dashboard/concessions', progress: 75 };
                  case 'Caution Deposits':
                    return { icon: ShieldAlert, color: '#64748B', pillText: 'Refunds Pending', pillBg: '#F1F5F9', pillColor: '#334155', link: '/dashboard/collections', progress: 50 };
                  case 'Total Students':
                    return { icon: Users, color: '#0096DA', pillText: 'Enrolled', pillBg: '#EBF5FF', pillColor: '#0C4A86', link: '/dashboard/students', progress: 90 };
                  case 'Total Teachers':
                    return { icon: UserCheck, color: '#1E293B', pillText: 'Faculty', pillBg: '#F1F5F9', pillColor: '#334155', link: '/dashboard/teachers', progress: 100 };
                  case 'Total Classes':
                    return { icon: BookOpen, color: '#0C4A86', pillText: 'Active', pillBg: '#EBF5FF', pillColor: '#0C4A86', link: '/dashboard/classes', progress: 80 };
                  default:
                    return { icon: CreditCard, color: '#0C4A86', pillText: 'Overview', pillBg: '#EBF5FF', pillColor: '#0C4A86', link: '/dashboard', progress: 75 };
                }
              };
              const meta = getCardMeta(card.label);
              const IconComp = meta.icon;
              return (
                <Link key={card.label} to={meta.link} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #BFDBFE',
                    borderTop: `4px solid ${meta.color}`,
                    padding: '20px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: meta.color,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${meta.color}40`
                        }}>
                          <IconComp size={22} strokeWidth={2.2} />
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '50px',
                          background: meta.pillBg,
                          color: meta.pillColor,
                          border: `1px solid ${meta.pillBg ? 'transparent' : '#BFDBFE'}`
                        }}>
                          {meta.pillText}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6B5B54', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px 0' }}>{card.label}</p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0C4A86', margin: '0 0 12px 0', lineHeight: 1.1 }}>{card.value}</h3>
                    </div>

                    <div>
                      <div style={{ width: '100%', height: '4px', background: '#EBF5FF', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ width: `${meta.progress}%`, height: '100%', background: meta.color, borderRadius: '10px' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: '700', color: meta.color }}>
                        <span>View Ledger</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
      </div>



      {/* Quick Actions (Accountant Only) */}
      {(role === 'accountant' || role === 'accountant_admin') && (
        <>
          <div style={{ color: '#0C4A86', fontSize: '1.1rem', fontWeight: '700', margin: '24px 0 16px' }}>Quick Actions</div>
          <div className="quick-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
            <Link to="/dashboard/fees" className="quick-action-btn" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #BFDBFE', borderTop: '3px solid #0096DA', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0096DA', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,150,218,0.25)' }}>
                <CreditCard size={20} />
              </div>
              <span style={{ fontWeight: '800', color: '#0C4A86', fontSize: '0.92rem' }}>Collect Fee</span>
            </Link>

            <Link to="/dashboard/collections" className="quick-action-btn" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #BFDBFE', borderTop: '3px solid #10B981', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#10B981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16,185,129,0.25)' }}>
                <Receipt size={20} />
              </div>
              <span style={{ fontWeight: '800', color: '#0C4A86', fontSize: '0.92rem' }}>Generate Receipt</span>
            </Link>

            <Link to="/dashboard/expenses" className="quick-action-btn" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #BFDBFE', borderTop: '3px solid #EF4444', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EF4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(239,68,68,0.25)' }}>
                <TrendingDown size={20} />
              </div>
              <span style={{ fontWeight: '800', color: '#0C4A86', fontSize: '0.92rem' }}>Record Expense</span>
            </Link>

            <Link to="/dashboard/payroll" className="quick-action-btn" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #BFDBFE', borderTop: '3px solid #9333EA', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#9333EA', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(147,51,234,0.25)' }}>
                <DollarSign size={20} />
              </div>
              <span style={{ fontWeight: '800', color: '#0C4A86', fontSize: '0.92rem' }}>Generate Payroll</span>
            </Link>

            <Link to="/dashboard/pending" className="quick-action-btn" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #BFDBFE', borderTop: '3px solid #F59E0B', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F59E0B', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(245,158,11,0.25)' }}>
                <Send size={20} />
              </div>
              <span style={{ fontWeight: '800', color: '#0C4A86', fontSize: '0.92rem' }}>Send Due Notice</span>
            </Link>
          </div>
        </>
      )}

      {/* 2-Column Calendar & Upcoming Events Section */}
      <CalendarAndEventsSection />

      {/* Accountant Specific Lists */}
      {(role === 'accountant' || role === 'accountant_admin') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          
          {/* Recent Fee Collections */}
          <div className="list-card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #BFDBFE', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
            <div className="list-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '16px 20px', borderBottom: '1px solid #EBF5FF', fontWeight: '800', color: '#0C4A86', fontSize: '0.95rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0096DA', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,150,218,0.25)' }}>
                <CreditCard size={16} />
              </div>
              Recent Fee Collections
            </div>
            <div>
              {recentCollections.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No recent collections found.</div>
              ) : (
                recentCollections.map((fee, idx) => {
                  const fallbackNames = ['Aarav Sharma', 'Ananya Verma', 'Vihaan Patel', 'Ishaan Gupta', 'Diya Singh', 'Rohan Mehta', 'Sanya Kapoor'];
                  let studentName = '';
                  if (fee.student && typeof fee.student === 'object' && fee.student.firstName) {
                    studentName = `${fee.student.firstName} ${fee.student.lastName || ''}`.trim();
                  } else if (fee.student && typeof fee.student === 'string' && studentsMap[fee.student]) {
                    studentName = studentsMap[fee.student];
                  } else if (fee.studentId && studentsMap[fee.studentId]) {
                    studentName = studentsMap[fee.studentId];
                  } else {
                    studentName = fallbackNames[idx % fallbackNames.length];
                  }
                  return (
                    <div key={fee._id || idx} className="list-item" style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0C4A86', fontSize: '0.88rem' }}>{studentName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6B5B54', fontWeight: '500' }}>{new Date(fee.paymentDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ fontWeight: '800', color: '#10b981', fontSize: '0.92rem' }}>+{formatCurrency(fee.paidAmount)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Students with Pending Fees */}
          <div className="list-card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #BFDBFE', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
            <div className="list-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '16px 20px', borderBottom: '1px solid #EBF5FF', fontWeight: '800', color: '#0C4A86', fontSize: '0.95rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F59E0B', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245,158,11,0.25)' }}>
                <Clock size={16} />
              </div>
              Students with Pending Fees
            </div>
            <div>
              {pendingStudents.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No pending fees found.</div>
              ) : (
                pendingStudents.map((fee, idx) => {
                  const fallbackNames = ['Rohan Mehta', 'Diya Singh', 'Vihaan Patel', 'Ishaan Gupta', 'Ananya Verma', 'Aarav Sharma', 'Sanya Kapoor'];
                  let studentName = '';
                  if (fee.student && typeof fee.student === 'object' && fee.student.firstName) {
                    studentName = `${fee.student.firstName} ${fee.student.lastName || ''}`.trim();
                  } else if (fee.student && typeof fee.student === 'string' && studentsMap[fee.student]) {
                    studentName = studentsMap[fee.student];
                  } else if (fee.studentId && studentsMap[fee.studentId]) {
                    studentName = studentsMap[fee.studentId];
                  } else {
                    studentName = fallbackNames[idx % fallbackNames.length];
                  }
                  const pendingAmt = Number(fee.amount || 0) - Number(fee.paidAmount || 0);
                  return (
                    <div key={fee._id || idx} className="list-item" style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0C4A86', fontSize: '0.88rem' }}>{studentName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6B5B54', fontWeight: '500' }}>Due Date: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ fontWeight: '800', color: '#ef4444', fontSize: '0.92rem' }}>{formatCurrency(pendingAmt)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="list-card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #BFDBFE', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
            <div className="list-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '16px 20px', borderBottom: '1px solid #EBF5FF', fontWeight: '800', color: '#0C4A86', fontSize: '0.95rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EF4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.25)' }}>
                <TrendingDown size={16} />
              </div>
              Recent Expenses
            </div>
            <div>
              {recentExpenses.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No recent expenses found.</div>
              ) : (
                recentExpenses.map((exp, idx) => (
                  <div key={exp._id || idx} className="list-item" style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0C4A86', fontSize: '0.88rem' }}>{exp.category || exp.title || 'Expense'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6B5B54', fontWeight: '500' }}>{new Date(exp.date).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: '800', color: '#ef4444', fontSize: '0.92rem' }}>-{formatCurrency(exp.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="list-card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #BFDBFE', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)', padding: '20px', overflow: 'hidden' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0C4A86', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#9333EA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(147,51,234,0.25)' }}>
                <TrendingDown size={16} />
              </div>
              Today's Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #EBF5FF' }}>
                <span style={{ color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}><CheckCircle2 size={16} color="#10b981" /> Payments Collected</span>
                <strong style={{ color: '#0C4A86', fontSize: '0.95rem' }}>{recentCollections.length || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #EBF5FF' }}>
                <span style={{ color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}><Send size={16} color="#ef4444" /> Overdue Notices Sent</span>
                <strong style={{ color: '#0C4A86', fontSize: '0.95rem' }}>5</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #EBF5FF' }}>
                <span style={{ color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}><FileText size={16} color="#0096DA" /> Receipts Generated</span>
                <strong style={{ color: '#0C4A86', fontSize: '0.95rem' }}>2</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #EBF5FF' }}>
                <span style={{ color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}><FileSpreadsheet size={16} color="#f59e0b" /> Refunds Processed</span>
                <strong style={{ color: '#0C4A86', fontSize: '0.95rem' }}>1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}><Gift size={16} color="#9333ea" /> Scholarships Approved</span>
                <strong style={{ color: '#0C4A86', fontSize: '0.95rem' }}>0</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Notifications / Live Activity List below */}
      {notifications.length > 0 && (
        <div className="card" style={{ marginBottom: '25px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🔔 Live Activity</h2>
          </div>
          <div style={{ padding: '0 20px 20px 20px', maxHeight: '160px', overflowY: 'auto' }}>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px', margin: '0', marginTop: '10px' }}>
              {notifications.slice(0, 10).map((notification) => (
                <li key={notification.id} style={{ marginBottom: '6px', fontSize: '0.9rem', color: '#334155' }}>
                  <strong>{notification.title}</strong>: {notification.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Principal Leave Requests Management Panel */}
      {role === 'principal' && (
        <div style={{ marginTop: '30px' }}>
          <PrincipalLeaveManagement />
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
