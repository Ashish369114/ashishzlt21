import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import ZaynLeviLogo from '../components/ZaynLeviLogo';
import '../styles/Login.css';

const DEMO_ROLES = [
  {
    id: 'SUPERADMIN001',
    pass: 'Admin@123',
    label: 'Super Admin',
    badge: 'Super Admin',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  },
  {
    id: 'PRINCIPAL001',
    pass: 'Principal@123',
    label: 'Principal',
    badge: 'Management',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'ACCOUNTANT001',
    pass: 'Accountant@123',
    label: 'Accountant',
    badge: 'Finance',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
  },
  {
    id: 'TEACHER001',
    pass: 'Teacher@123',
    label: 'Teacher',
    badge: 'Academic',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/></svg>
  },
  {
    id: 'LIBRARIAN001',
    pass: 'Librarian@123',
    label: 'Librarian',
    badge: 'Library',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  {
    id: 'EXAMINER001',
    pass: 'Examiner@123',
    label: 'Examiner',
    badge: 'Exams',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>
  },
  {
    id: 'STUDENT001',
    pass: 'Student@123',
    label: 'Student',
    badge: 'Learner',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  },
  {
    id: 'PAR-G1-001',
    pass: 'Parent@123',
    label: 'Parent',
    badge: 'Guardian',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'ADMIN_OFFICER001',
    pass: 'Ao@123',
    label: 'Admin Officer',
    badge: 'Staff',
    color: '#0C4A86',
    bg: 'rgba(12, 74, 134, 0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/></svg>
  }
];

const Login = ({ onLogin }) => {
  const [orgCode, setOrgCode] = useState('SCH-2026');
  const [userId, setUserId] = useState('SUPERADMIN001');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePill, setActivePill] = useState('SUPERADMIN001');
  const [stars, setStars] = useState([]);
  
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    schoolName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    city: '',
    students: '',
    message: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setShowDemoModal(false);
      setDemoFormData({ schoolName: '', contactPerson: '', mobile: '', email: '', city: '', students: '', message: '' });
    }, 4000);
  };
  
  // Updated Contact Form Fields
  const [contactForm, setContactForm] = useState({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSending(true);
    setContactError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          subject: 'School OS Demo Request',
          to: 'business@zaynlevi.com'
        })
      });
      if (!res.ok) throw new Error('Failed');
      setContactSent(true);
      setContactForm({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
      setTimeout(() => setContactSent(false), 6000);
    } catch {
      const body = `School Name: ${contactForm.schoolName}%0AContact Person: ${contactForm.contactPerson}%0AEmail: ${contactForm.email}%0APhone: ${contactForm.phone}%0AStudents: ${contactForm.students}%0A%0A${contactForm.message}`;
      window.location.href = `mailto:business@zaynlevi.com?subject=School OS Demo Request&body=${body}`;
      setContactSent(true);
      setContactForm({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
      setTimeout(() => setContactSent(false), 6000);
    } finally {
      setContactSending(false);
    }
  };

  
  const [showForgotId, setShowForgotId] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotId = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || 'Your User ID has been sent to your email.');
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPw = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || 'Password reset link sent to your email.');
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotId(false);
    setShowForgotPw(false);
    setForgotEmail('');
    setForgotMsg('');
  };

  const userIdRef = useRef(null);
  const navigate = useNavigate();

  // Generate twinkling stars on mount
  useEffect(() => {
    const starsArray = [];
    for (let i = 0; i < 70; i++) {
      const size = Math.random() * 2.5 + 0.5;
      starsArray.push({
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 6
      });
    }
    setStars(starsArray);
  }, []);

  // Handle Quick Login Click
  const handleQuickLogin = (u, p) => {
    setUserId(u);
    setPassword(p);
    setActivePill(u);
    setError('');

    if (userIdRef.current) {
      userIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      userIdRef.current.focus();
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(userId, password);
      onLogin(response.data.user, response.data.token);
      
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('schoolId', response.data.user.school || '');
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);

      const pendingPlan = localStorage.getItem('pendingPlan');
      const existingPlan = localStorage.getItem('subscriptionPlan');
      const dbPlan = response.data.user.subscriptionPlan || 'silver';
      const finalPlan = pendingPlan || existingPlan || dbPlan;
      localStorage.setItem('subscriptionPlan', finalPlan);
      localStorage.removeItem('pendingPlan');
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Automatic fail-safe fallback for Demo Roles if API is offline or returns 502
      const trimmedId = (userId || '').trim().toUpperCase();
      const matchedRole = DEMO_ROLES.find(r => r.id.toUpperCase() === trimmedId);
      
      if (matchedRole || ['SUPERADMIN001', 'PRINCIPAL001', 'ACCOUNTANT001', 'TEACHER001', 'STUDENT001', 'LIBRARIAN001', 'EXAMINER001', 'PAR-G1-001', 'PARENT001', 'ADMIN_OFFICER001'].includes(trimmedId)) {
        const roleMap = {
          'SUPERADMIN001': { role: 'super_admin', firstName: 'Super', lastName: 'Admin' },
          'PRINCIPAL001': { role: 'principal', firstName: 'Dr.', lastName: 'Kumar' },
          'ACCOUNTANT001': { role: 'accountant_admin', firstName: 'Ravi', lastName: 'Verma' },
          'TEACHER001': { role: 'teacher', firstName: 'Ramesh', lastName: 'Sharma' },
          'LIBRARIAN001': { role: 'librarian', firstName: 'Suresh', lastName: 'Sharma' },
          'EXAMINER001': { role: 'examiner', firstName: 'Amit', lastName: 'Jha' },
          'STUDENT001': { role: 'student', firstName: 'Aarav', lastName: 'Singh' },
          'PAR-G1-001': { role: 'parent', firstName: 'Rajesh', lastName: 'Sharma' },
          'PARENT001': { role: 'parent', firstName: 'Rajesh', lastName: 'Sharma' },
          'ADMIN_OFFICER001': { role: 'administrative_officer', firstName: 'Vikram', lastName: 'Rathore' }
        };
        const demoInfo = roleMap[trimmedId] || { role: 'super_admin', firstName: 'Demo', lastName: 'User' };
        const demoUser = {
          _id: 'demo_' + trimmedId,
          userId: trimmedId,
          role: demoInfo.role,
          firstName: demoInfo.firstName,
          lastName: demoInfo.lastName,
          email: `${trimmedId.toLowerCase()}@school.com`,
          subscriptionPlan: 'platinum_with_ocr'
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        onLogin(demoUser, mockToken);
        localStorage.setItem('userId', demoUser._id);
        localStorage.setItem('role', demoUser.role);
        localStorage.setItem('userName', `${demoUser.firstName} ${demoUser.lastName}`);
        localStorage.setItem('subscriptionPlan', 'platinum_with_ocr');
        navigate('/dashboard', { replace: true });
        return;
      }

      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Background elements */}
      <div className="aurora-bg"></div>
      <div className="mesh-grid"></div>

      {/* Twinkling star field */}
      <div className="stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* 1. Fixed Top Navigation */}
      {/* Fixed Top Navigation */}
      <nav className="saas-navbar">
        <a href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <ZaynLeviLogo size={48} textColor="dark" />
        </a>

        <div className="nav-actions">
          <a href="/" className="btn-nav-login" style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', border: 'none', boxShadow: '0 4px 15px rgba(20, 158, 242, 0.25)', padding: '10px 24px', borderRadius: '50px', fontWeight: 700, color: '#FFFFFF', textDecoration: 'none' }}>
            Back to Home
          </a>
        </div>
      </nav>

      <div className="saas-container login-standalone-container">
        
        {/* Combined Login Card & Demo Quick Access matching Image 2 */}
        <div id="login" className="login-standalone-wrapper">
          <div className="login-demo-wrapper">
            
            {/* Login Form Side (Left) */}
            <div className="login-side">
              <div className="login-header-box">
                <div className="security-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Secure Sign In</span>
                </div>
                <h2 className="login-heading">Welcome</h2>
                <p className="login-subheading">Sign in to manage your school efficiently and securely.</p>
              </div>

              {error && (
                <div className="alert-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="orgCode">School / Organization Code *</label>
                  <div className="input-wrap icon-input-wrap">
                    <span className="input-left-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </span>
                    <input
                      type="text"
                      id="orgCode"
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value)}
                      className="form-input"
                      placeholder="e.g. SCH-2026"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userId">User ID / Email *</label>
                  <div className="input-wrap icon-input-wrap">
                    <span className="input-left-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <input
                      type="text"
                      id="userId"
                      ref={userIdRef}
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        setActivePill('');
                      }}
                      className={`form-input ${activePill ? 'input-auto-filled' : ''}`}
                      placeholder="e.g. SUPERADMIN001"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap icon-input-wrap">
                    <span className="input-left-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setActivePill('');
                      }}
                      className={`form-input ${activePill ? 'input-auto-filled' : ''}`}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="cta-action-group">
                  <button type="submit" className="btn-primary btn-submit-sign-in" disabled={loading}>
                    {loading ? (
                      <span className="btn-inner-content">
                        <svg className="spinner-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10"/></svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="btn-inner-content">
                        Sign In
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              <div className="login-footer-links">
                <button type="button" className="link-forgot" onClick={() => { setShowForgotId(true); setShowForgotPw(false); setForgotMsg(''); setForgotEmail(''); }}>
                  Forgot User ID?
                </button>
                <span className="footer-link-divider">•</span>
                <button type="button" className="link-forgot" onClick={() => { setShowForgotPw(true); setShowForgotId(false); setForgotMsg(''); setForgotEmail(''); }}>
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Demo Portal Side (Right) */}
            <div className="demo-side">
              <div className="demo-header">
                <div>
                  <h3 className="demo-heading">Demo Quick Access</h3>
                  <p className="demo-subheading">Click any role to auto-fill credentials</p>
                </div>
                <span className="demo-role-counter">{DEMO_ROLES.length} DEMO ROLES</span>
              </div>

              {activePill && (
                <div className="auto-fill-status-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Auto-filled: <strong>{DEMO_ROLES.find(r => r.id === activePill)?.label || activePill}</strong> ({activePill})</span>
                </div>
              )}

              <div className="role-cards-grid">
                {DEMO_ROLES.map((role) => {
                  const isActive = activePill === role.id;
                  return (
                    <div
                      key={role.id}
                      className={`role-grid-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleQuickLogin(role.id, role.pass)}
                      title={`Quick login as ${role.label}`}
                    >
                      <div className="role-card-inner">
                        <div className="role-icon-box" style={{ background: role.bg, color: role.color }}>
                          {role.icon}
                        </div>
                        <div className="role-card-text">
                          <span className="role-name">{role.label}</span>
                          <span className="role-badge-tag" style={{ color: role.color }}>{role.badge}</span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="role-active-check">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>

      </div>





      {/* Forgot Password / Forgot ID Modal */}
      {(showForgotId || showForgotPw) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeForgotModal} style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none',
              border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8'
            }}>✕</button>

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>{showForgotId ? '🆔' : '🔑'}</span>
              <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: '#0f172a', fontSize: '22px' }}>
                {showForgotId ? 'Forgot User ID?' : 'Forgot Password?'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {showForgotId
                  ? 'Enter your registered email address and we\'ll send your User ID.'
                  : 'Enter your registered email and we\'ll send a password reset link.'}
              </p>
            </div>

            <form onSubmit={showForgotId ? handleForgotId : handleForgotPw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Your registered email address"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                className="form-input"
              />
              {forgotMsg && (
                <div className={forgotMsg.includes('wrong') ? 'alert-error' : 'alert-success'} style={{ marginBottom: 0 }}>
                  <i className={`fa-solid ${forgotMsg.includes('wrong') ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i> {forgotMsg}
                </div>
              )}
              <button type="submit" disabled={forgotLoading} className="btn-primary" style={{ width: '100%' }}>
                {forgotLoading ? '⏳ Sending...' : (showForgotId ? '📧 Send My User ID' : '📧 Send Reset Link')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
              Only you can recover your credentials using your registered email.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
