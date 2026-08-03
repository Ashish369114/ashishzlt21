import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import { eventService, feeService, expenseService } from '../../services/api';
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
      const [allFeesRes, pendingFeesRes, expensesRes] = await Promise.all([
        feeService.getAll(),
        feeService.getPending(),
        expenseService.getAll()
      ]);
      
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
    addCard("Today's Collection", stats?.todayCollection, formatCurrency);
    addCard("Monthly Collection", stats?.monthlyCollection, formatCurrency);
    addCard("Pending Fees", stats?.totalPendingAmount, formatCurrency);
    addCard("Outstanding Amount", stats?.totalAmount, formatCurrency);
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

      {/* 2-Column Calendar & Upcoming Events Section */}
      <CalendarAndEventsSection />

      {/* Quick Actions (Accountant Only) */}
      {(role === 'accountant' || role === 'accountant_admin') && (
        <div className="quick-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/dashboard/fees" className="quick-action-btn">
            <span style={{ fontSize: '24px', background: '#e0e7ff', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>💸</span>
            Collect Fee
          </Link>
          <Link to="/dashboard/collections" className="quick-action-btn">
            <span style={{ fontSize: '24px', background: '#dcfce7', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>🧾</span>
            Generate Receipt
          </Link>
          <Link to="/dashboard/expenses" className="quick-action-btn">
            <span style={{ fontSize: '24px', background: '#fee2e2', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>📉</span>
            Record Expense
          </Link>
          <Link to="/dashboard/payroll" className="quick-action-btn">
            <span style={{ fontSize: '24px', background: '#f3e8ff', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>💰</span>
            Generate Payroll
          </Link>
          <Link to="/dashboard/pending" className="quick-action-btn">
            <span style={{ fontSize: '24px', background: '#fff7ed', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>📢</span>
            Send Due Notice
          </Link>
        </div>
      )}

      {/* Stats Cards & Upcoming Events Layout */}
      <div className="dashboard-grid-layout" style={{ marginBottom: '25px', alignItems: 'stretch' }}>
        {/* Left Side: Stats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'stretch', flex: 1 }}>
            {cards.map((card) => {
              const getIcon = (label) => {
                switch (label) {
                  case 'Total Students': return '👨‍🎓';
                  case 'Total Teachers': return '👩‍🏫';
                  case 'Total Classes': return '🏫';
                  case 'Collected Fees': return '💰';
                  case "Today's Collection": return '💰';
                  case 'Monthly Collection': return '📅';
                  case 'Pending Fees': return '⏳';
                  case 'Outstanding Amount': return '💸';
                  case 'Total Expenses': return '📉';
                  case 'Net Income': return '⚖️';
                  default: return '📊';
                }
              };
              return (
                <div className="stat-card-acc" key={card.label}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{getIcon(card.label)}</div>
                  <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0', fontWeight: '700' }}>{card.label}</h3>
                  <div className="value" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{card.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Upcoming Events Box — only shown when showEvents=true */}
        {showEvents && (
          <div>
            {events.length > 0 ? (
              <div className="card" style={{ height: '100%', margin: 0, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem' }}>📅 Upcoming Events</h2>
                </div>
                <div
                  ref={scrollRef}
                  onMouseEnter={() => { scrollPaused.current = true; }}
                  onMouseLeave={() => { scrollPaused.current = false; }}
                  style={{
                    padding: '15px 20px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flex: 1
                  }}
                >
                  {events.map((e) => {
                    const eventDateStr = e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
                    const getEventIcon = (title = '', type = '') => {
                      const combined = `${title} ${type}`.toLowerCase();
                      if (combined.includes('exam') || combined.includes('test')) return '📝';
                      if (combined.includes('cca') || combined.includes('activity')) return '🎨';
                      if (combined.includes('ptm') || combined.includes('parent')) return '👨‍👩‍👧‍👦';
                      if (combined.includes('sports') || combined.includes('game') || combined.includes('athletic')) return '🏆';
                      if (combined.includes('meeting') || combined.includes('conference')) return '🤝';
                      if (combined.includes('holiday')) return '🏖️';
                      return '🎉';
                    };
                    return (
                      <div
                        key={e._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.3rem' }}>{getEventIcon(e.title, e.eventType || e.type)}</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{e.title}</h4>
                          </div>
                        </div>
                        <div style={{
                          padding: '3px 8px',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          {eventDateStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card" style={{ height: '100%', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                No upcoming events
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accountant Specific Lists */}
      {(role === 'accountant' || role === 'accountant_admin') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          
          {/* Recent Fee Collections */}
          <div className="list-card">
            <div className="list-header">💰 Recent Fee Collections</div>
            <div>
              {recentCollections.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No recent collections found.</div>
              ) : (
                recentCollections.map((fee, idx) => {
                  const studentName = fee.student?.firstName 
                    ? `${fee.student.firstName} ${fee.student.lastName || ''}`.trim() 
                    : 'Unknown Student';
                  return (
                    <div key={fee._id || idx} className="list-item">
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(fee.paymentDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#10b981' }}>+{formatCurrency(fee.paidAmount)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Students with Pending Fees */}
          <div className="list-card">
            <div className="list-header">⏳ Students with Pending Fees</div>
            <div>
              {pendingStudents.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No pending fees found.</div>
              ) : (
                pendingStudents.map((fee, idx) => {
                  const studentName = fee.student?.firstName 
                    ? `${fee.student.firstName} ${fee.student.lastName || ''}`.trim() 
                    : 'Unknown Student';
                  const pendingAmt = Number(fee.amount || 0) - Number(fee.paidAmount || 0);
                  return (
                    <div key={fee._id || idx} className="list-item">
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Due Date: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#ef4444' }}>{formatCurrency(pendingAmt)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="list-card">
            <div className="list-header">📉 Recent Expenses</div>
            <div>
              {recentExpenses.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No recent expenses found.</div>
              ) : (
                recentExpenses.map((exp, idx) => (
                  <div key={exp._id || idx} className="list-item">
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{exp.category || exp.title || 'Expense'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(exp.date).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#ef4444' }}>-{formatCurrency(exp.amount)}</div>
                  </div>
                ))
              )}
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
