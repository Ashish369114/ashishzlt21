import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AoManagement from '../components/AoManagement';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import { 
  LayoutDashboard, Building, UserPlus, Package, Wrench, Shield, Users, DoorOpen, Bus, BarChart2, LogOut 
} from 'lucide-react';

const AoDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const plan = (localStorage.getItem('subscriptionPlan') || user?.subscriptionPlan || 'platinum').toLowerCase();
  const planLabel = plan.includes('ocr') ? '⭐ PLATINUM + OCR' : '⭐ PLATINUM';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admissions', label: 'Admissions', icon: UserPlus },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'accommodation', label: 'Accommodation Management', icon: Building },
    { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench },
    { id: 'visitors', label: 'Visitor Register', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  ];

  return (
    <div className="dashboard-layout" style={{ background: '#F7F6F3', minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar - Luxe Ivory Palette (#EFE9E1) */}
      <div className="sidebar" style={{ width: '270px', background: '#EFE9E1', borderRight: '1px solid #D9D8D9', padding: '24px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-header" style={{ borderBottom: '1px solid #D9D8D9', paddingBottom: '20px' }}>
            <h2 style={{ color: '#322029', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #AC968D, #8E786F)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(172,150,141,0.3)' }}>
                <Building size={20} />
              </div>
              Admin Officer
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
                      color: isActive ? '#ffffff' : '#5C4E46',
                      background: isActive ? '#AC968D' : 'transparent',
                      padding: '11px 16px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(172,150,141,0.25)' : 'none'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#ffffff' : '#5C4E46'} /> {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ marginTop: 'auto', padding: '0 4px', marginBottom: '16px' }}>
          <DailyInsightWidget />
        </div>

        <div style={{ borderTop: '1px solid #D9D8D9', paddingTop: '16px' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#F7F6F3', color: '#322029', border: '1px solid #AC968D', padding: '10px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
            <LogOut size={16} color="#AC968D" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="main-content" style={{ flex: 1, background: '#F7F6F3', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <div style={{
          background: '#ffffff',
          padding: '18px 32px',
          borderBottom: '1px solid #D9D8D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(50,32,41,0.03)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#322029' }}>
              Welcome back, {user?.firstName || 'Vikram'} 👋
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#6B5B54' }}>
              Administrative Officer Operations Dashboard
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#322029' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B5B54' }}>Administrative Officer</div>
              </div>
              <div style={{ width: '36px', height: '36px', background: '#EFE9E1', color: '#322029', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '1px solid #AC968D' }}>
                {user?.firstName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>

        {/* AO Management Component Body */}
        <div style={{ padding: '10px' }}>
          <AoManagement activeSection={activeTab} />
        </div>

      </div>

    </div>
  );
};

export default AoDashboard;
