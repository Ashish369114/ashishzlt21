import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LibraryManagement from '../components/LibraryManagement';
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import TopBar from '../../components/dashboard/TopBar';
import { subscribeToDataChanges } from '../../services/syncService';
import { LayoutDashboard, BookOpen, Repeat, DollarSign, CheckCircle2, FileText, LogOut, Calendar as CalendarIcon, Camera, Clock, MessageSquare } from 'lucide-react';

const LibrarianDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('librarianProfileImage') || '');

  useEffect(() => {
    const unsubscribe = subscribeToDataChanges((data) => {
      console.log('Realtime sync in Librarian:', data);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('librarianProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const plan = (localStorage.getItem('subscriptionPlan') || user?.subscriptionPlan || 'platinum').toLowerCase();
  const planLabel = plan.includes('ocr') ? '⭐ PLATINUM + OCR' : '⭐ PLATINUM';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalogue', label: 'Book Catalogue', icon: BookOpen },
    { id: 'timetable', label: 'Library Timetable', icon: Clock },
    { id: 'issue_return', label: 'Issue & Return', icon: Repeat },
    { id: 'fines', label: 'Fine Collection', icon: DollarSign },
    { id: 'availability', label: 'Book Availability', icon: CheckCircle2 },
    { id: 'reports', label: 'Library Reports', icon: FileText },
  ];

  return (
    <div className="dashboard-layout" style={{ background: '#FAF6F0', minHeight: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #BFDBFE' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.2)', flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0C4A86', lineHeight: 1.2 }}>ABC International</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0096DA' }}>Librarian Portal</div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ marginTop: '16px', marginBottom: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0C4A86' }}>
            NAVIGATION MENU
          </span>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.id);
                  }}
                  className={isActive ? 'active' : ''}
                >
                  <Icon size={18} /> <span>{item.label}</span>
                </a>
              </li>
            );
          })}

          <li style={{ marginTop: '16px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #BFDBFE' }}>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, background: '#FAF6F0', overflowY: 'auto' }}>        {/* Top Global Header Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 28px 0', background: '#FAF6F0' }}>
          <TopBar
            userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Suresh Sharma'}
            subject="Head Librarian"
            user={user}
          />
        </div>

        {/* Welcome Header Banner */}
        <div style={{ padding: '20px 28px 0' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #BFDBFE', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0C4A86' }}>
                    Welcome Back, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Suresh Sharma'} 👋
                  </h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '800' }}>
                    Librarian
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Library Management System & Digital Catalogue • Department of Library & Media Resources
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('catalogue')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#0C4A86', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
              >
                <BookOpen size={16} /> Book Catalogue
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ padding: '28px' }}>
          {activeTab === 'dashboard' ? (
            <LibrarianDashboardHome onNavigate={(tab) => setActiveTab(tab)} />
          ) : (
            <LibraryManagement activeSection={activeTab} initialTab={activeTab} />
          )}
        </div>

      </div>
    </div>
  );
};

const upcomingEventsList = [
  {
    id: 1,
    title: 'Annual Mathematics Olympiad & Speed Quiz',
    date: 'August 5, 2026',
    time: '09:30 AM - 12:30 PM',
    category: 'Annual Day',
    badgeColor: 'bg-[#0C4A86] text-white',
    location: 'Main Auditorium',
    description: 'Inter-house mathematics competition for Grade 8 to 10.'
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting (PTM)',
    date: 'August 12, 2026',
    time: '10:00 AM - 01:00 PM',
    category: 'Parent-Teacher Meetings',
    badgeColor: 'bg-[#0096DA] text-white',
    location: 'School Classrooms',
    description: 'Academic progress discussion between teachers & parents.'
  },
  {
    id: 3,
    title: 'Independence Day Holiday & Cultural Fest',
    date: 'August 15, 2026',
    time: '08:30 AM - 11:30 AM',
    category: 'Holidays',
    badgeColor: 'bg-purple-600 text-white',
    location: 'Flag Hoisting Ground',
    description: 'Flag hoisting ceremony & student patriotic performances.'
  },
  {
    id: 4,
    title: 'Inter-School Sports Track Championship',
    date: 'August 18, 2026',
    time: '08:00 AM - 04:00 PM',
    category: 'School Events',
    badgeColor: 'bg-emerald-600 text-white',
    location: 'Sports Grounds',
    description: 'Track and field events including 100m sprint, relay & long jump.'
  },
  {
    id: 5,
    title: 'Mid-Term Half Yearly Examinations',
    date: 'August 25, 2026',
    time: '09:00 AM - 12:00 PM',
    category: 'Exams',
    badgeColor: 'bg-rose-600 text-white',
    location: 'Exam Halls 1-4',
    description: 'Mid-Term 1 Evaluation for Grade 9 & 10 students.'
  },
  {
    id: 6,
    title: 'National Book Fair & Library Reading Contest',
    date: 'September 2, 2026',
    time: '10:00 AM - 03:30 PM',
    category: 'School Events',
    badgeColor: 'bg-emerald-600 text-white',
    location: 'Central Library Hall',
    description: 'Special book exhibition, author interactions & speed reading awards.'
  }
];

const LibrarianDashboardHome = ({ onNavigate }) => {
  const eventsScrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = eventsScrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (!isPaused && el) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ top: 90, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const recentLibraryActivities = [
    { id: 1, title: 'Grade 6-A Silent Reading & Book Reservation', grade: 'Grade 6 - Section A', date: 'Today, 08:30 AM', teacher: 'Mrs. Sunita Sharma', status: 'Completed' },
    { id: 2, title: 'Grade 10-B Encyclopedia & Reference Research', grade: 'Grade 10 - Section B', date: 'Today, 09:15 AM', teacher: 'Mr. Ramesh Gupta', status: 'In Progress' },
    { id: 3, title: 'Grade 8-A Digital eBook Reader Session', grade: 'Grade 8 - Section A', date: 'Today, 01:15 PM', teacher: 'Mrs. Anjali Verma', status: 'Scheduled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Overview Metric KPI Cards (Teacher Dashboard Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div 
          onClick={() => onNavigate('catalogue')}
          style={{ background: '#fff', borderRadius: '20px', border: '1px solid #BFDBFE', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>Total Catalog Books</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C4A86' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0C4A86', marginBottom: '4px' }}>1,245</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px' }}>
            +24 New Additions
          </span>
        </div>

        <div 
          onClick={() => onNavigate('issue_return')}
          style={{ background: '#fff', borderRadius: '20px', border: '1px solid #BFDBFE', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>Active Borrowed Books</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Repeat size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0C4A86', marginBottom: '4px' }}>312</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', background: '#e0f2fe', padding: '3px 8px', borderRadius: '12px' }}>
            25% Active Circulation
          </span>
        </div>

        <div 
          onClick={() => onNavigate('fines')}
          style={{ background: '#fff', borderRadius: '20px', border: '1px solid #BFDBFE', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>Overdue & Fines</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: '#d97706', marginBottom: '4px' }}>14 Books</div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px' }}>
            ₹1,850 Fines Pending
          </span>
        </div>
      </div>

      {/* 2. Main Dashboard Grid: Calendar & Upcoming Events (Equal Box Size & Auto-Scroll) */}
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
            ref={eventsScrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {upcomingEventsList.map((evt) => (
              <div key={evt.id} style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '14px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={evt.badgeColor} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800' }}>
                    {evt.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CalendarIcon size={13} /> {evt.date}
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

      {/* 3. Recent Library Activities & Class Sessions (Teacher Style) */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0C4A86' }}>Daily Library Activities & Scheduled Classes</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>Classroom library visits and silent reading sessions for today</p>
          </div>
          <button 
            onClick={() => onNavigate('timetable')}
            style={{ padding: '8px 14px', background: '#EBF5FF', color: '#0C4A86', border: '1px solid #BFDBFE', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
          >
            View Full Timetable →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {recentLibraryActivities.map((act) => (
            <div key={act.id} style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', background: '#0C4A86', color: '#fff', fontSize: '0.72rem', fontWeight: '800' }}>
                  {act.grade}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{act.date}</span>
              </div>
              <h4 style={{ margin: '6px 0 4px', fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{act.title}</h4>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Teacher: <strong>{act.teacher}</strong></span>
                <span style={{ color: act.status === 'Completed' ? '#166534' : '#0369a1', fontWeight: '700' }}>{act.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LibrarianDashboard;
