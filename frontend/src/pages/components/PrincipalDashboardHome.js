import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/api';
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
    { id: 1, title: 'Annual Sports Meet', date: 'Oct 15', time: '09:00 AM', month: 'OCT', day: '15' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Oct 20', time: '10:30 AM', month: 'OCT', day: '20' },
    { id: 3, title: 'Board Exam Commences', date: 'Nov 02', time: '08:00 AM', month: 'NOV', day: '02' },
    { id: 4, title: 'Diwali Holidays Begin', date: 'Nov 12', time: 'All Day', month: 'NOV', day: '12' },
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
    let interval;
    if (!isEventsHovered && eventsScrollRef.current) {
      interval = setInterval(() => {
        const scroller = eventsScrollRef.current;
        if (!scroller) return;
        const itemHeight = scroller.querySelector('.event-card')?.offsetHeight || 72;
        scroller.scrollBy({ top: itemHeight, behavior: 'smooth' });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isEventsHovered]);

  const handleEventScroll = (e) => {
    const scroller = e.target;
    const itemHeight = scroller.querySelector('.event-card')?.offsetHeight || 72;
    const originalHeight = upcomingEvents.length * itemHeight;

    if (scroller.scrollTop >= originalHeight) {
      scroller.scrollTop = scroller.scrollTop - originalHeight;
    } else if (scroller.scrollTop === 0 && e.nativeEvent.deltaY < 0) {
      scroller.scrollTop = originalHeight;
    }
    
    const index = Math.round(scroller.scrollTop / itemHeight);
    setActiveEventIndex(index % upcomingEvents.length);
  };

  return (
    <div className="principal-dashboard-container">
      
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

      {/* 4. Main Grid: Charts & Events */}
      <div className="dashboard-grid-main">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>


          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Leave Management</h3>
              <button className="card-action">View All</button>
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
              <h3 className="card-title"><Calendar size={18} color="#3b82f6" className="icon-pulse" /> Upcoming Events</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="card-body p-0 events-scroll-container">
              <div className="fade-overlay-top"></div>
              <div 
                className="events-scroller"
                ref={eventsScrollRef}
                onMouseEnter={() => setIsEventsHovered(true)}
                onMouseLeave={() => setIsEventsHovered(false)}
                onScroll={handleEventScroll}
              >
                {scrollingEvents.map((event, idx) => (
                  <div key={`${event.id}-${idx}`} className={`event-card ${idx % upcomingEvents.length === activeEventIndex ? 'active' : ''}`}>
                    <div className="event-date-box">
                      <span className="event-month">{event.month}</span>
                      <span className="event-day">{event.day}</span>
                    </div>
                    <div className="event-details-compact">
                      <h4>{event.title}</h4>
                      <span className="event-time"><Clock size={12} /> {event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="fade-overlay-bottom"></div>
            </div>
          </div>

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
