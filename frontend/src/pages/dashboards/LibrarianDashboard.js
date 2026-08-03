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
      <div className="sidebar" style={{ width: '260px', background: '#FAF6F0', borderRight: '1px solid #BFDBFE', padding: '24px 20px', flexShrink: 0 }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid #BFDBFE', paddingBottom: '20px' }}>
          <h2 style={{ color: '#0C4A86', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <div style={{ width: '36px', height: '36px', background: '#0C4A86', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <BookOpen size={20} />
            </div>
            Librarian
          </h2>
        </div>

        <ul className="nav-menu" style={{ marginTop: '24px', listStyle: 'none', padding: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '8px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.id);
                  }}
                  className={isActive ? 'active' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: isActive ? '#ffffff' : '#0C4A86',
                    background: isActive ? '#0C4A86' : 'transparent',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={18} color={isActive ? '#ffffff' : '#0C4A86'} /> {item.label}
                </a>
              </li>
            );
          })}

          <li style={{ marginTop: '20px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '10px', borderTop: '1px solid #BFDBFE', paddingTop: '16px' }}>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}>
              <LogOut size={16} /> Logout
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
          {activeTab === 'dashboard' || activeTab === 'google_calendar' || activeTab === 'calendar' ? (
            <LibrarianCalendarWithUpcomingEvents />
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

const LibrarianCalendarWithUpcomingEvents = () => {
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

  return (
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
  );
};

export default LibrarianDashboard;
