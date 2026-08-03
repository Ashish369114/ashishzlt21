import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AoManagement from '../components/AoManagement';
import SchoolCalendarManagement from '../components/SchoolCalendarManagement';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import TopBar from '../../components/dashboard/TopBar';
import { subscribeToDataChanges } from '../../services/syncService';
import { LayoutDashboard, Users, FileText, Settings, ShieldCheck, LogOut, Calendar as CalendarIcon, Camera } from 'lucide-react';

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
    { id: 'google_calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'calendar', label: 'School Calendar', icon: CalendarIcon },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'infrastructure', label: 'Infrastructure', icon: ShieldCheck },
    { id: 'inventory', label: 'Inventory & Assets', icon: FileText },
    { id: 'procurement', label: 'Procurement', icon: FileText },
    { id: 'vendors', label: 'Vendors & Contracts', icon: Users },
    { id: 'maintenance', label: 'Maintenance Requests', icon: Settings },
  ];

  return (
    <div className="dashboard-layout" style={{ background: '#FAF6F0', minHeight: '100vh', display: 'flex' }}>
      
      {/* Sidebar Navigation */}
      <div className="sidebar" style={{ width: '260px', background: '#FAF6F0', borderRight: '1px solid #BFDBFE', padding: '24px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-header" style={{ borderBottom: '1px solid #BFDBFE', paddingBottom: '20px' }}>
            <h2 style={{ color: '#0C4A86', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <div style={{ width: '36px', height: '36px', background: '#0C4A86', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ShieldCheck size={20} />
              </div>
              AO Portal
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
          </ul>
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <DailyInsightWidget />
          </div>

          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#FAF6F0', color: '#0C4A86', border: '1px solid #0C4A86', padding: '10px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
            <LogOut size={16} color="#0C4A86" /> Logout
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
          ) : (
            <AoManagement activeSection={activeTab} activeTab={activeTab} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AoDashboard;
