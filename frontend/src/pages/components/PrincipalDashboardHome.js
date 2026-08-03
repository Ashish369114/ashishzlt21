import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/api';
import TopBar from '../../components/dashboard/TopBar';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import { 
  Users, UserCheck, GraduationCap, Clock, 
  Calendar, FileText, Bell, CheckCircle, XCircle, 
  ChevronRight, PlusCircle, PenTool, Send, UserPlus, FileBarChart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import './PrincipalPremium.css';

const PrincipalDashboardHome = ({ stats, user }) => {
  const navigate = useNavigate();
  // --- Refs & State ---
  const eventsScrollRef = useRef(null);
  const [isEventsHovered, setIsEventsHovered] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [leaveFilter, setLeaveFilter] = useState('all');

  // --- Mock Data ---
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const attendanceTrend = [
    { name: 'Mon', attendance: 92 },
    { name: 'Tue', attendance: 94 },
    { name: 'Wed', attendance: 91 },
    { name: 'Thu', attendance: 95 },
    { name: 'Fri', attendance: 96 },
  ];

  const monthlyAttendance = [
    { name: 'Jan', students: 95, teachers: 98 },
    { name: 'Feb', students: 94, teachers: 97 },
    { name: 'Mar', students: 96, teachers: 99 },
    { name: 'Apr', students: 93, teachers: 96 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual Mathematics Olympiad & Speed Quiz',
      date: 'August 5, 2026',
      time: '09:30 AM - 12:30 PM',
      category: 'Annual Day',
      location: 'Main Auditorium',
      badgeColor: 'bg-[#0C4A86] text-white',
      description: 'Inter-house mathematics competition for Grade 8 to 10.'
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting (PTM)',
      date: 'August 12, 2026',
      time: '10:00 AM - 01:00 PM',
      category: 'Parent-Teacher Meetings',
      location: 'School Classrooms',
      badgeColor: 'bg-[#0096DA] text-white',
      description: 'Academic progress discussion between teachers & parents.'
    },
    {
      id: 3,
      title: 'Independence Day Holiday & Cultural Fest',
      date: 'August 15, 2026',
      time: '08:30 AM - 11:30 AM',
      category: 'Holidays',
      location: 'Flag Hoisting Ground',
      badgeColor: 'bg-purple-600 text-white',
      description: 'Flag hoisting ceremony & student patriotic performances.'
    },
    {
      id: 4,
      title: 'Inter-School Sports Track Championship',
      date: 'August 18, 2026',
      time: '08:00 AM - 04:00 PM',
      category: 'School Events',
      location: 'Sports Grounds',
      badgeColor: 'bg-emerald-600 text-white',
      description: 'Track and field events including 100m sprint, relay & long jump.'
    },
    {
      id: 5,
      title: 'Mid-Term Half Yearly Examinations',
      date: 'August 25, 2026',
      time: '09:00 AM - 12:00 PM',
      category: 'Exams',
      location: 'Exam Halls 1-4',
      badgeColor: 'bg-rose-600 text-white',
      description: 'Mid-Term 1 Evaluation for Grade 9 & 10 students.'
    }
  ];
  const scrollingEvents = [...upcomingEvents, ...upcomingEvents];

  const recentActivity = [
    { id: 1, type: 'admission', title: 'New Student Admission', desc: 'Aarav Sharma enrolled in Grade 5', time: '2 hours ago', icon: UserCheck, color: 'blue' },
    { id: 2, type: 'exam', title: 'Mid-Term Results Published', desc: 'Grade 10 results are now live', time: '4 hours ago', icon: FileText, color: 'green' },
    { id: 3, type: 'leave', title: 'Leave Approved', desc: 'Ms. Sarah Smith (Sick Leave)', time: '5 hours ago', icon: CheckCircle, color: 'purple' },
    { id: 4, type: 'notice', title: 'New Notice Broadcast', desc: 'Holiday schedule updated', time: '1 day ago', icon: Send, color: 'orange' },
  ];

  const notices = [
    { id: 1, title: 'Staff Meeting at 4PM', desc: 'Mandatory meeting for all high school teachers.', priority: 'high' },
    { id: 2, title: 'Fire Drill Tomorrow', desc: 'Please ensure all students are aware of the exits.', priority: 'medium' },
    { id: 3, title: 'Library New Arrivals', desc: 'New science journals have been added.', priority: 'low' },
  ];

  const [leaves, setLeaves] = useState([]);
  
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await leaveService.getAll();
        const allLeaves = Array.isArray(res.data) ? res.data : [];
        const staffLeaves = allLeaves.filter(l => l.applicantRole === 'teacher' || l.applicantRole === 'staff');
        setLeaves(staffLeaves);
      } catch (err) {
        console.error('Failed to fetch leaves:', err);
      }
    };
    fetchLeaves();
  }, []);
  
  const filteredLeaves = leaveFilter === 'all' ? leaves : leaves.filter(l => l.status === leaveFilter);

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const isThisMonth = (d) => {
    if (!d) return false;
    const date = new Date(d);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };
  const approvedThisMonthCount = leaves.filter(l => l.status === 'approved' && isThisMonth(l.updatedAt || l.createdAt)).length;

  const handleApprove = async (id) => {
    try {
      await leaveService.approve(id, 'Approved');
      setLeaves(leaves.map(l => l._id === id ? { ...l, status: 'approved' } : l));
    } catch (err) {
      console.error(err);
      alert('Failed to approve leave request.');
    }
  };

  const handleReject = async (id) => {
    const remarks = window.prompt("Enter rejection reason:");
    if (remarks === null) return;
    if (!remarks.trim()) {
      alert("A rejection reason is required.");
      return;
    }
    try {
      await leaveService.reject(id, remarks);
      setLeaves(leaves.map(l => l._id === id ? { ...l, status: 'rejected' } : l));
    } catch (err) {
      console.error(err);
      alert('Failed to reject leave request.');
    }
  };

  // --- Auto-Scrolling Logic ---
  useEffect(() => {
    const el = eventsScrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (!isEventsHovered && el) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ top: 110, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isEventsHovered]);

  return (
    <div className="principal-dashboard-container">
      <div style={{ position: 'sticky', top: 0, zIndex: 20, marginBottom: '20px' }}>
        <TopBar
          userName={[user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Dr. Anita Roy'}
          subject="School Principal"
          user={user}
        />
      </div>
      
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="hero-greeting">
            <h1>
              Good Morning, {
                [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() && [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() !== 'Dr.'
                  ? [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
                  : 'Dr. Anita Roy'
              } 👋
            </h1>
            <div className="hero-date">{todayDate}</div>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="principal-kpi-grid">
        <div className="principal-kpi-card">
          <div className="kpi-top">
            <div className="kpi-info">
              <h3>Total Students</h3>
              <div className="kpi-value">{stats?.totalStudents || 1240}</div>
            </div>
            <div className="kpi-icon-container" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="principal-kpi-card">
          <div className="kpi-top">
            <div className="kpi-info">
              <h3>Teaching Staff</h3>
              <div className="kpi-value">{stats?.totalTeachers || 85}</div>
            </div>
            <div className="kpi-icon-container" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="principal-kpi-card">
          <div className="kpi-top">
            <div className="kpi-info">
              <h3>Non-Teaching Staff</h3>
              <div className="kpi-value">24</div>
            </div>
            <div className="kpi-icon-container" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Users size={22} />
            </div>
          </div>
        </div>



        <div className="principal-kpi-card">
          <div className="kpi-top">
            <div className="kpi-info">
              <h3>Pending Leave Requests</h3>
              <div className="kpi-value">{pendingCount}</div>
            </div>
            <div className="kpi-icon-container" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        <div className="principal-kpi-card">
          <div className="kpi-top">
            <div className="kpi-info">
              <h3>Upcoming Exams</h3>
              <div className="kpi-value">3</div>
            </div>
            <div className="kpi-icon-container" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <FileText size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-bar">
          <button className="action-btn" onClick={() => navigate('/dashboard/students')}><PlusCircle size={18} className="action-icon" /> Add Student</button>
          <button className="action-btn" onClick={() => navigate('/dashboard/exams')}><PenTool size={18} className="action-icon" /> Schedule Exam</button>
          <button className="action-btn" onClick={() => alert('Publish Notice feature coming soon!')}><Send size={18} className="action-icon" /> Publish Notice</button>
          <button className="action-btn" onClick={() => navigate('/dashboard/employees')}><UserPlus size={18} className="action-icon" /> Assign Teacher</button>
          <button className="action-btn" onClick={() => navigate('/dashboard/reports')}><FileBarChart size={18} className="action-icon" /> Generate Report</button>
        </div>
      </div>

      {/* 4. 2-Column Calendar & Auto-Scrolling Upcoming Events Grid (Teacher Portal Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'stretch' }}>
        {/* Monthly Calendar View */}
        <div style={{ gridColumn: 'span 7', maxHeight: '560px', overflowY: 'auto', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <InteractiveGoogleCalendar
            hideCreateEvent={true}
            hideViewToggle={true}
            assignedClassesOnly={false}
          />
        </div>

        {/* Auto-scrolling Upcoming Events Card */}
        <div style={{ gridColumn: 'span 5', borderRadius: '24px', border: '1px solid #cbd5e1', background: '#fff', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '560px' }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0C4A86' }}>Upcoming Events</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>Important school functions, exams & holidays</p>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '4px 8px', background: '#EBF5FF', color: '#0C4A86', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
              ⚡ Auto-Scrolling
            </span>
          </div>

          <div 
            className="events-scroller"
            ref={eventsScrollRef}
            onMouseEnter={() => setIsEventsHovered(true)}
            onMouseLeave={() => setIsEventsHovered(false)}
            style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {scrollingEvents.map((evt, idx) => (
              <div key={`${evt.id}-${idx}`} style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '14px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={evt.badgeColor || 'bg-[#0C4A86] text-white'} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800' }}>
                    {evt.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {evt.date}
                  </span>
                </div>

                <h4 style={{ margin: '4px 0 2px', fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{evt.title}</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>{evt.description}</p>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#0096DA" /> {evt.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: '700' }}>
                    📍 {evt.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Main Grid: Leave Management, Notice Board & Recent Activity */}
      <div className="dashboard-grid-main">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Leave Management</h3>
              <button className="card-action" onClick={() => navigate('/dashboard/leaves')}>View All</button>
            </div>
            <div className="card-body">
              <div className="leave-summary-grid">
                <div className="leave-summary-card pending" onClick={() => setLeaveFilter(leaveFilter === 'pending' ? 'all' : 'pending')}>
                  <div className="leave-value">{pendingCount}</div>
                  <div className="leave-label">Pending Requests</div>
                  <div className="leave-progress-bg"><div className="leave-progress-fill" style={{ width: '45%' }}></div></div>
                </div>
                <div className="leave-summary-card approved" onClick={() => setLeaveFilter(leaveFilter === 'approved' ? 'all' : 'approved')}>
                  <div className="leave-value">{approvedThisMonthCount}</div>
                  <div className="leave-label">Approved This Month</div>
                  <div className="leave-progress-bg"><div className="leave-progress-fill" style={{ width: '85%' }}></div></div>
                </div>
              </div>
              <div className="leave-list">
                {filteredLeaves.map(leave => (
                  <div key={leave._id} className="leave-item">
                    <div className="leave-avatar">{(leave.applicantName || 'U').charAt(0).toUpperCase()}</div>
                    <div className="leave-info">
                      <h4>{leave.applicantName || '—'}</h4>
                      <p>{leave.applicantRole} • {leave.leaveType} ({leave.leaveDays || '1'} days)</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {leave.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(leave._id)} style={{ padding: '4px 8px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Approve</button>
                          <button onClick={() => handleReject(leave._id)} style={{ padding: '4px 8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Reject</button>
                        </>
                      ) : leave.status === 'approved' ? (
                        <CheckCircle size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#ef4444" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Notice Board</h3>
              <button className="card-action" onClick={() => navigate('/dashboard/notices')}>Manage Notices</button>
            </div>
            <div className="card-body p-0">
              <ul className="list-group">
                {notices.map(notice => (
                  <li key={notice.id} className="list-item">
                    <div className="item-content">
                      <h4>{notice.title}</h4>
                      <p>{notice.desc}</p>
                      <div className="item-meta">
                        <span className={`priority-badge priority-${notice.priority}`}>{notice.priority}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-body p-0">
              <ul className="list-group">
                {recentActivity.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <li key={activity.id} className="list-item">
                      <div className={`item-icon ${activity.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="item-content">
                        <h4>{activity.title}</h4>
                        <p>{activity.desc}</p>
                        <div className="item-meta">
                          <Clock size={12} /> {activity.time}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PrincipalDashboardHome;
