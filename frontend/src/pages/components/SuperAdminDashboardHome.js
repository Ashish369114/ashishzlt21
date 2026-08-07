import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/dashboard/TopBar';
import { 
  Users, UserCheck, Briefcase, GraduationCap, 
  CreditCard, AlertCircle, Clock, TrendingUp,
  PlusCircle, BookOpen, Send, Calendar,
  Activity, Bell, Gift, FileText, CheckCircle,
  MoreVertical, ChevronRight, PieChart as PieChartIcon, Bus, Home, Archive
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import CalendarAndEventsSection from '../../components/common/CalendarAndEventsSection';
import './SuperAdminPremium.css';

const SuperAdminDashboardHome = ({ stats }) => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Mock Data for Charts & Analytics
  const admissionTrendData = [
    { month: 'Jan', students: 45 },
    { month: 'Feb', students: 52 },
    { month: 'Mar', students: 85 },
    { month: 'Apr', students: 120 },
    { month: 'May', students: 90 },
    { month: 'Jun', students: 110 },
  ];

  const feeCollectionData = [
    { name: 'Week 1', amount: 4000 },
    { name: 'Week 2', amount: 3000 },
    { name: 'Week 3', amount: 2000 },
    { name: 'Week 4', amount: 2780 },
  ];

  const studentAttendanceData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 15 },
  ];

  const staffAttendanceData = [
    { name: 'Present', value: 92 },
    { name: 'Absent', value: 8 },
  ];

  const incomeVsExpenseData = [
    { month: 'Jan', income: 4000, expense: 2400 },
    { month: 'Feb', income: 3000, expense: 1398 },
    { month: 'Mar', income: 2000, expense: 9800 },
    { month: 'Apr', income: 2780, expense: 3908 },
    { month: 'May', income: 1890, expense: 4800 },
    { month: 'Jun', income: 2390, expense: 3800 },
  ];

  const recentActivities = [
    { id: 1, title: 'New student admitted', desc: 'Rahul Kumar (Grade 10)', time: '2 mins ago', type: 'admission' },
    { id: 2, title: 'Fee payment received', desc: `${formatCurrency(450)} from John Doe`, time: '1 hour ago', type: 'fee' },
    { id: 3, title: 'Teacher added', desc: 'Sarah Smith (Mathematics)', time: '3 hours ago', type: 'teacher' },
    { id: 4, title: 'Library book issued', desc: 'Advanced Physics to Mike', time: '5 hours ago', type: 'library' },
    { id: 5, title: 'Exam schedule created', desc: 'Mid-term examinations', time: '1 day ago', type: 'exam' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Mid-Term Examinations', date: 'Oct 15 - Oct 25', type: 'exam' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Oct 28', type: 'meeting' },
    { id: 3, title: 'Diwali Holidays', date: 'Nov 1 - Nov 5', type: 'holiday' },
    { id: 4, title: 'Annual Sports Day', date: 'Nov 15', type: 'event' },
  ];

  const scrollingEvents = [...upcomingEvents, ...upcomingEvents];

  useEffect(() => {
    let interval;
    if (!isHovered && scrollRef.current) {
      interval = setInterval(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;
        
        const itemHeight = scroller.querySelector('.event-item')?.offsetHeight || 72;
        scroller.scrollBy({ top: itemHeight, behavior: 'smooth' });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScroll = (e) => {
    const scroller = e.target;
    const itemHeight = scroller.querySelector('.event-item')?.offsetHeight || 72;
    const originalHeight = upcomingEvents.length * itemHeight;

    if (scroller.scrollTop >= originalHeight) {
      scroller.scrollTop = scroller.scrollTop - originalHeight;
    } else if (scroller.scrollTop === 0 && e.nativeEvent.deltaY < 0) {
      // Optional: Handle scrolling up past the top seamlessly
      scroller.scrollTop = originalHeight;
    }

    const index = Math.round(scroller.scrollTop / itemHeight);
    setActiveIndex(index % upcomingEvents.length);
  };

  const recentAdmissions = [
    { id: '1001', name: 'Aarav Sharma', grade: 'Grade 5', date: '2026-07-12', status: 'Confirmed' },
    { id: '1002', name: 'Riya Patel', grade: 'Grade 8', date: '2026-07-11', status: 'Pending' },
    { id: '1003', name: 'Kabir Singh', grade: 'Grade 10', date: '2026-07-10', status: 'Confirmed' },
    { id: '1004', name: 'Ananya Gupta', grade: 'Grade 3', date: '2026-07-09', status: 'Confirmed' },
  ];

  const pendingFees = [
    { id: '1002', name: 'Riya Patel', grade: 'Grade 8', amount: formatCurrency(450), dueDate: '2026-07-15' },
    { id: '1005', name: 'Arjun Das', grade: 'Grade 6', amount: formatCurrency(300), dueDate: '2026-07-10' },
    { id: '1008', name: 'Meera Reddy', grade: 'Grade 9', amount: formatCurrency(550), dueDate: '2026-07-12' },
  ];

  // Helper component for KPI Cards
  const KPICard = ({ title, value, icon: Icon, trend, trendUp, color, link }) => (
    <Link to={link || '#'} style={{ textDecoration: 'none', color: 'inherit' }} className="premium-kpi-card group">
      <div className="kpi-header">
        <div>
          <p className="kpi-title">{title}</p>
          <h3 className="kpi-value">{value}</h3>
        </div>
        <div className={`kpi-icon-wrapper`} style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div className="kpi-footer">
        <span className={`kpi-trend ${trendUp ? 'trend-up' : 'trend-down'}`} style={{ color: trendUp ? '#10b981' : '#ef4444' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="kpi-trend-text">vs last month</span>
      </div>
    </Link>
  );

  const getInventoryCount = () => {
    try {
      const saved = localStorage.getItem('inventory_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        const totalAvail = parsed.reduce((acc, i) => acc + (i.totalStock - i.issuedQuantity), 0);
        return `${totalAvail} Items`;
      }
    } catch (e) {}
    return '40 Items';
  };

  return (
    <div className="saas-dashboard-container">
      <div style={{ position: 'sticky', top: 0, zIndex: 20, marginBottom: '20px' }}>
        <TopBar
          userName="Super Administrator"
          subject="System Control Panel"
        />
      </div>

      {/* 2. KPI Cards */}
      <div className="kpi-grid">
        {/* KPI Cards */}
        <KPICard title="Total Students" value={stats?.totalStudents || '300'} icon={Users} trend="12%" trendUp={true} color="#0C4A86" />
        <KPICard title="Teaching Staff" value={stats?.totalTeachers || '30'} icon={UserCheck} trend="4%" trendUp={true} color="#0C4A86" />
        <KPICard title="Non-Teaching Staff" value={'28'} icon={Users} trend="1%" trendUp={true} color="#0C4A86" />
        <KPICard title="Fees (Collected / Pending)" value={`${stats?.collectedFees ? formatCurrency(stats.collectedFees * 100) : formatCurrency(45200)} / ${stats?.pendingFees ? formatCurrency(stats.pendingFees * 100) : formatCurrency(12400)}`} icon={CreditCard} trend="8%" trendUp={true} color="#10b981" />
        <KPICard title="Today's Exams" value="4 Scheduled" icon={FileText} trend="Active" trendUp={true} color="#0C4A86" link="/dashboard/exams" />
      </div>

      {/* 5. Quick Actions */}
      <div className="section-title" style={{ color: '#0C4A86', fontSize: '1.1rem', fontWeight: '700', margin: '24px 0 16px' }}>Quick Actions</div>
      <div className="quick-actions-grid">
        <Link to="/dashboard/students" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}><PlusCircle className="action-icon" size={20} /> Add Student</Link>
        <Link to="/dashboard/employees" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}><Briefcase className="action-icon" size={20} /> Add Employee</Link>
        <Link to="/dashboard/exams" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}><BookOpen className="action-icon" size={20} /> Create Exam</Link>
        <Link to="/dashboard/hostel" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}><Home className="action-icon" size={20} /> Add Hostel</Link>
      </div>

      {/* 6. Calendar & Upcoming Events Section */}
      <CalendarAndEventsSection />      {/* 7. Activity & Notices Section */}
      <div className="dashboard-grid-1 mt-6 mb-8" style={{ display: 'block' }}>
        
        {/* Recent Activities */}
        <div className="premium-card" style={{ width: '100%' }}>
          <div className="card-header border-b">
            <h3 className="card-title">Recent Activities</h3>
            <button className="text-blue" style={{ color: '#0C4A86' }}>View All</button>
          </div>
          <div className="card-body p-0">
            <ul className="activity-list">
              {recentActivities.map(act => (
                <li key={act.id} className="activity-item">
                  <div className={`activity-icon-container ${act.type}`}>
                    {act.type === 'admission' && <UserCheck size={16} />}
                    {act.type === 'fee' && <CreditCard size={16} />}
                    {act.type === 'teacher' && <Briefcase size={16} />}
                    {act.type === 'library' && <BookOpen size={16} />}
                    {act.type === 'exam' && <FileText size={16} />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{act.title}</p>
                    <p className="activity-desc">{act.desc}</p>
                  </div>
                  <span className="activity-time">{act.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboardHome;
