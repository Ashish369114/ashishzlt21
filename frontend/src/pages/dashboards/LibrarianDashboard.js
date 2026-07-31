import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LibraryManagement from '../components/LibraryManagement';
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import { subscribeToDataChanges } from '../../services/syncService';
import { LayoutDashboard, BookOpen, Repeat, DollarSign, CheckCircle2, FileText, LogOut, Calendar as CalendarIcon, Camera } from 'lucide-react';

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
    { id: 'calendar', label: 'School Calendar', icon: CalendarIcon },
    { id: 'catalogue', label: 'Book Catalogue', icon: BookOpen },
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
      <div className="main-content" style={{ flex: 1, background: '#FAF6F0', overflowY: 'auto' }}>
        
        {/* Top Sticky Header */}
        <div style={{
          background: '#ffffff',
          padding: '18px 32px',
          borderBottom: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
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
                Good Morning, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Suresh Sharma'} 👋
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#0C4A86' }}>
                Library Management System & Digital Catalogue
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', padding: '6px 14px', background: '#EBF5FF', color: '#0C4A86', borderRadius: '50px', border: '1px solid #BFDBFE' }}>
              {planLabel}
            </span>

            {/* Profile Avatar Upload Feature */}
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" style={{ display: 'none' }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
              style={{
                width: '38px',
                height: '38px',
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
                <img src={profileImage} alt="Librarian" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user?.firstName?.[0] || 'L'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ padding: '28px' }}>
          {activeTab === 'calendar' ? (
            <SchoolCalendarManagement />
          ) : (
            <LibraryManagement initialTab={activeTab === 'dashboard' ? 'catalogue' : activeTab} />
          )}
        </div>

      </div>
    </div>
  );
};

export default LibrarianDashboard;
