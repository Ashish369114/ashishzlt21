import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LibraryManagement from '../components/LibraryManagement';
import DailyInsightWidget from '../../components/DailyInsightWidget';
import { LayoutDashboard, BookOpen, Repeat, DollarSign, CheckCircle2, FileText, LogOut } from 'lucide-react';

const LibrarianDashboard = ({ user, onLogout }) => {
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
    { id: 'catalogue', label: 'Book Catalogue', icon: BookOpen },
    { id: 'issue_return', label: 'Issue & Return', icon: Repeat },
    { id: 'fines', label: 'Fine Collection', icon: DollarSign },
    { id: 'availability', label: 'Book Availability', icon: CheckCircle2 },
    { id: 'reports', label: 'Library Reports', icon: FileText },
  ];

  return (
    <div className="dashboard-layout" style={{ background: '#F7F6F3', minHeight: '100vh', display: 'flex' }}>
      
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '260px', background: '#EFE9E1', borderRight: '1px solid #D9D8D9', padding: '24px 20px', flexShrink: 0 }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid #D9D8D9', paddingBottom: '20px' }}>
          <h2 style={{ color: '#322029', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <div style={{ width: '36px', height: '36px', background: '#AC968D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
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
                    color: isActive ? '#ffffff' : '#322029',
                    background: isActive ? '#AC968D' : 'transparent',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={18} color={isActive ? '#ffffff' : '#322029'} /> {item.label}
                </a>
              </li>
            );
          })}

          <li style={{ marginTop: '20px', padding: '0 4px' }}>
            <DailyInsightWidget />
          </li>

          <li style={{ marginTop: '10px', borderTop: '1px solid #D9D8D9', paddingTop: '16px' }}>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, background: '#F7F6F3', overflowY: 'auto' }}>
        
        {/* Top Sticky Header */}
        <div style={{
          background: '#ffffff',
          padding: '18px 32px',
          borderBottom: '1px solid #D9D8D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#322029' }}>
              Welcome back, {user?.firstName || 'Librarian'} 👋
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#6B5B54' }}>
              Manage book catalogue, issue & return, fine collection, and library reports.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#322029' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B5B54' }}>Head Librarian</div>
              </div>
              <div style={{ width: '36px', height: '36px', background: '#EFE9E1', color: '#322029', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                {user?.firstName?.[0] || 'L'}
              </div>
            </div>
          </div>
        </div>

        {/* Library Management Component Body */}
        <div style={{ padding: '10px' }}>
          <LibraryManagement activeSection={activeTab} />
        </div>

      </div>

    </div>
  );
};

export default LibrarianDashboard;
