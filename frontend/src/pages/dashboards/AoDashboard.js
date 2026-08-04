import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AoManagement from '../components/AoManagement';
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import TopBar from '../../components/dashboard/TopBar';
import { subscribeToDataChanges } from '../../services/syncService';
import { LayoutDashboard, Users, FileText, Settings, ShieldCheck, LogOut, Calendar as CalendarIcon, Camera } from 'lucide-react';
import TeacherSettingsPage from './TeacherSettingsPage';


const AoDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('aoProfileImage') || '');

  useEffect(() => {
    const unsubscribe = subscribeToDataChanges((data) => {
      console.log('Realtime sync in AO:', data);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('aoProfileImage', reader.result);
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
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'infrastructure', label: 'Infrastructure', icon: ShieldCheck },
    { id: 'inventory', label: 'Inventory & Assets', icon: FileText },
    { id: 'vendors', label: 'Vendors & Contracts', icon: Users },
    { id: 'maintenance', label: 'Maintenance Requests', icon: Settings },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <div className="dashboard-layout" style={{ background: '#FAF6F0', minHeight: '100vh', display: 'flex' }}>
      
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #BFDBFE' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(12, 74, 134, 0.2)', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0C4A86', lineHeight: 1.2 }}>ABC International</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#0096DA' }}>AO Portal</div>
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
          </ul>
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <DailyInsightWidget />
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="main-content" style={{ flex: 1, background: '#FAF6F0', overflowY: 'auto' }}>
        
        {/* Top Global Header Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 28px 0', background: '#FAF6F0' }}>
          <TopBar
            userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Ramesh Gupta'}
            subject="Administrative Officer"
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
                    Welcome Back, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Ramesh Gupta'} 👋
                  </h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '800' }}>
                    AO In-Charge
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Administrative Operations & School Infrastructure Overview • General Operations Department
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('assets')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#0C4A86', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
              >
                <ShieldCheck size={16} /> Asset Management
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Views */}
        <div style={{ padding: '28px' }}>
          {activeTab === 'google_calendar' ? (
            <InteractiveGoogleCalendar />
          ) : activeTab === 'calendar' ? (
            <SchoolCalendarManagement />
          ) : activeTab === 'settings' ? (
            <TeacherSettingsPage user={user} />
          ) : (
            <AoManagement activeSection={activeTab} activeTab={activeTab} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AoDashboard;
