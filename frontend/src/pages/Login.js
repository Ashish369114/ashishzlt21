import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';

const DEFAULT_CURRENCIES = {
  'IN': { name: 'India', symbol: '₹', silver: '40,000', gold: '70,000', platinum: '1,00,000', tax: 'GST' },
  'US': { name: 'United States', symbol: '$', silver: '599', gold: '899', platinum: '1,299', tax: 'Sales Tax' },
  'GB': { name: 'United Kingdom', symbol: '£', silver: '499', gold: '799', platinum: '1,099', tax: 'VAT' },
  'CA': { name: 'Canada', symbol: 'C$', silver: '799', gold: '1,199', platinum: '1,599', tax: 'HST/GST' },
  'EU': { name: 'Europe', symbol: '€', silver: '549', gold: '849', platinum: '1,149', tax: 'VAT' }
};

const Login = ({ onLogin }) => {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePill, setActivePill] = useState('');
  const [stars, setStars] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setContactSent(false), 5000);
  };
  
  const userIdRef = useRef(null);
  const loginBtnRef = useRef(null);
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

  const activeCurrency = currencies[selectedCountry] || currencies['IN'];

  // Handle Quick Login Click
  const handleQuickLogin = (u, p) => {
    setUserId(u);
    setPassword(p);
    setActivePill(u);
    setError('');

    // Smooth scroll and focus
    if (userIdRef.current) {
      userIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      userIdRef.current.focus();
    }

    // Button pulse animation
    if (loginBtnRef.current) {
      loginBtnRef.current.style.transform = 'scale(1.03)';
      setTimeout(() => {
        if (loginBtnRef.current) loginBtnRef.current.style.transform = '';
      }, 250);
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
      
      // Store additional user info for socket.io
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('schoolId', response.data.user.school || '');
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);

      // If user selected a plan from the plans page before logging in, respect that.
      // Otherwise use the plan stored in their account in the DB.
      const pendingPlan = localStorage.getItem('pendingPlan');
      const existingPlan = localStorage.getItem('subscriptionPlan');
      const dbPlan = response.data.user.subscriptionPlan || 'silver';
      // Priority: pendingPlan (just paid) > existingPlan (already chosen) > DB plan
      const finalPlan = pendingPlan || existingPlan || dbPlan;
      localStorage.setItem('subscriptionPlan', finalPlan);
      localStorage.removeItem('pendingPlan'); // always clear after use
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
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
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      
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

      {/* Main card */}
      <div className="login-wrapper">
        
        {/* Left Side: Login Form */}
        <div className="form-side">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 100 100" style={{ width: '28px', height: '28px', overflow: 'visible' }}>
                <path d="M 24 45 V 32 A 8 8 0 0 1 32 24 H 76 L 46 54" fill="none" stroke="#0b4d8c" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 76 55 V 68 A 8 8 0 0 1 68 76 H 24 L 54 46" fill="none" stroke="#00a2e8" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="brand-name">Zayn Levi Technologies</div>
              <div className="brand-tag">School Operating System</div>
            </div>
          </div>

          <h1 className="headline">Welcome Back</h1>
          <p className="subline">Sign in to access your school dashboard and modules.</p>


          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="userId">User ID / Email</label>
              <div className="input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="userId"
                  ref={userIdRef}
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setActivePill('');
                  }}
                  className="form-input"
                  placeholder="e.g. SUPERADMIN001"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActivePill('');
                  }}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              ref={loginBtnRef}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Authenticating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '8px' }}></i>Sign In to Portal
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="login-footer-links">
            <Link to="/forgot-password" className="link">
              Forgot Password?
            </Link>
            <span className="divider">•</span>
            <a href="#about" className="link" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>
              About Us
            </a>
            <span className="divider">•</span>
            <a href="#contact" className="link" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Contact Us
            </a>
          </div>
        </div>

        {/* Right Side: Plans & Quick Login */}
        <div className="plans-side">
          <div className="plans-inner">
            
            {/* Plans List */}
            <div>
              <div className="plans-hdr">
                <i className="fa-solid fa-gem"></i> Subscription Plans
              </div>

              {/* Silver Card */}
              <div className="plan-card plan-silver">
                <div className="plan-header">
                  <span className="plan-name">Silver ({activeCurrency.symbol})</span>
                  <span className="plan-badge badge-silver">Core</span>
                </div>

                <ul className="plan-features">
                  <li><i className="fa-solid fa-circle-check"></i> Class &amp; Subject Schedules</li>
                  <li><i className="fa-solid fa-circle-check"></i> Student Directory</li>
                  <li><i className="fa-solid fa-circle-check"></i> Daily Student Attendance Tracking</li>
                  <li><i className="fa-solid fa-circle-check"></i> Basic Exam Schedules</li>
                </ul>
                <button className="btn-login" style={{ marginTop: '14px', width: '100%', padding: '10px', fontSize: '0.9rem' }} onClick={() => navigate('/silver-plan')}>
                  Choose Plan
                </button>
              </div>

              {/* Gold Card */}
              <div className="plan-card plan-gold">
                <div className="plan-header">
                  <span className="plan-name">Gold ({activeCurrency.symbol})</span>
                  <span className="plan-badge badge-gold">Standard</span>
                </div>

                <ul className="plan-features">
                  <li><i className="fa-solid fa-circle-check"></i> Fee Management &amp; Receipts</li>
                  <li><i className="fa-solid fa-circle-check"></i> Homework &amp; Timetables</li>
                  <li><i className="fa-solid fa-circle-check"></i> Staff Leave &amp; Payroll</li>
                  <li><i className="fa-solid fa-circle-check"></i> Parent Communication</li>
                </ul>
                <button className="btn-login" style={{ marginTop: '14px', width: '100%', padding: '10px', fontSize: '0.9rem' }} onClick={() => navigate('/gold-plan')}>
                  Choose Plan
                </button>
              </div>

              {/* Platinum Without OCR Card */}
              <div className="plan-card plan-platinum">
                <div className="plan-header">
                  <span className="plan-name">Platinum (Without OCR)</span>
                  <span className="plan-badge badge-platinum">Elite</span>
                </div>

                <ul className="plan-features">
                  <li><i className="fa-solid fa-circle-check"></i> Advanced security and staff permissions</li>
                  <li><i className="fa-solid fa-circle-check"></i> 24/7 personal support helpline</li>
                </ul>
                <button className="btn-login" style={{ marginTop: '14px', width: '100%', padding: '10px', fontSize: '0.9rem' }} onClick={() => navigate('/platinum-plan?ocr=false')}>
                  Choose Plan
                </button>
              </div>

              {/* Platinum With OCR Card */}
              <div className="plan-card plan-platinum">
                <div className="plan-header">
                  <span className="plan-name">Platinum (With OCR)</span>
                  <span className="plan-badge badge-platinum">Elite</span>
                </div>

                <ul className="plan-features">
                  <li><i className="fa-solid fa-circle-check"></i> Advanced security and staff permissions</li>
                  <li><i className="fa-solid fa-circle-check"></i> 24/7 personal support helpline</li>
                  <li><i className="fa-solid fa-circle-check"></i> Scan and upload documents automatically</li>
                </ul>
                <button className="btn-login" style={{ marginTop: '14px', width: '100%', padding: '10px', fontSize: '0.9rem' }} onClick={() => navigate('/platinum-plan?ocr=true')}>
                  Choose Plan
                </button>
              </div>
            </div>

            {/* Quick Login Pills */}
            <div>
              <div className="plans-hdr" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Quick Login
              </div>

              {/* All roles — available in every plan */}
              <div className="tier-group tier-platinum">
                <div className="tier-header">
                  <span className="tier-name">👑 School Super Admin</span>
                </div>
                <div className="role-grid">
                  <div
                    className={`role-pill ${activePill === 'SUPERADMIN001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('SUPERADMIN001', 'Admin@123')}
                    style={{ gridColumn: 'span 3' }}
                  >
                    Super Admin (SUPERADMIN001)
                  </div>
                </div>
              </div>

              <div className="tier-group tier-gold">
                <div className="tier-header">
                  <span className="tier-name">🏫 School Branch Staff</span>
                </div>
                <div className="role-grid">
                  <div
                    className={`role-pill ${activePill === 'PRINCIPAL001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('PRINCIPAL001', 'Principal@123')}
                  >
                    Principal
                  </div>
                  <div
                    className={`role-pill ${activePill === 'ACCOUNTANT001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('ACCOUNTANT001', 'Accountant@123')}
                  >
                    Accountant
                  </div>
                  <div
                    className={`role-pill ${activePill === 'TEACHER001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('TEACHER001', 'Teacher@123')}
                  >
                    Ramesh (T001)
                  </div>
                  <div
                    className={`role-pill ${activePill === 'TEACHER002' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('TEACHER002', 'Teacher@123')}
                  >
                    Priya (T002)
                  </div>
                  <div
                    className={`role-pill ${activePill === 'TEACHER003' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('TEACHER003', 'Teacher@123')}
                  >
                    Rajesh (T003)
                  </div>
                  <div
                    className={`role-pill ${activePill === 'TEACHER004' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('TEACHER004', 'Teacher@123')}
                  >
                    Sneha (T004)
                  </div>
                  <div
                    className={`role-pill ${activePill === 'TEACHER005' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('TEACHER005', 'Teacher@123')}
                  >
                    Suresh (T005)
                  </div>
                </div>
              </div>

              <div className="tier-group tier-silver">
                <div className="tier-header">
                  <span className="tier-name">👥 Students &amp; Parents</span>
                </div>
                <div className="role-grid">
                  <div
                    className={`role-pill ${activePill === 'STUDENT001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('STUDENT001', 'Student@123')}
                    style={{ gridColumn: 'span 1.5' }}
                  >
                    Student (STUDENT001)
                  </div>
                  <div
                    className={`role-pill ${activePill === 'PAR-G1-001' ? 'role-pill-clicked' : ''}`}
                    onClick={() => handleQuickLogin('PAR-G1-001', 'Parent@123')}
                    style={{ gridColumn: 'span 1.5' }}
                  >
                    Parent (PAR-G1-001)
                  </div>
                </div>
              </div>

              <div className="pw-hint">
                Auto-fills valid seed credentials on click.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* About Us Card */}
      <div className="login-wrapper about-section-card" id="about" style={{ marginTop: '40px', padding: '40px', flexDirection: 'column', gap: '15px' }}>
        <div className="plans-hdr" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
          <i className="fa-solid fa-circle-info"></i> About Zayn Levi Technologies
        </div>
        <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
          Zayn Levi Technologies is a forward-thinking technology company dedicated to creating digital solutions that simplify complexity and unlock growth for modern organizations.
        </p>
        <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
          Our vision is to blend innovation, reliability, and user-focused design to deliver software that empowers teams, improves customer experiences, and scales with ambition. From custom platforms to intelligent automation, we build technology that turns business goals into measurable progress.
        </p>
        <div className="why-choose-us-grid" style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="why-card" style={{ padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.1)', fontWeight: '600' }}>✓ End-to-end digital transformation support</div>
          <div className="why-card" style={{ padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.1)', fontWeight: '600' }}>✓ Transparent collaboration & milestones</div>
          <div className="why-card" style={{ padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.1)', fontWeight: '600' }}>✓ Reliable post-launch maintenance</div>
          <div className="why-card" style={{ padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.1)', fontWeight: '600' }}>✓ Flexible engagement models</div>
        </div>
      </div>

      {/* Contact Us Card */}
      <div className="login-wrapper contact-section-card" id="contact" style={{ marginTop: '40px', padding: '40px', display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="plans-hdr" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
            <i className="fa-solid fa-paper-plane"></i> Contact Us
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Official Email</h4>
            <p style={{ opacity: 0.9 }}>business@zaynlevi.com</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Official Phone</h4>
            <p style={{ opacity: 0.9 }}>+91 6300854318</p>
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px' }}>Service Area</h4>
            <p style={{ opacity: 0.9 }}>Remote delivery, strategic consulting, and implementation support for growing teams.</p>
          </div>
        </div>

        <div style={{ flex: 1.2 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px' }}>Request a consultation</h3>
          {contactSent ? (
            <div className="alert alert-success" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#047857', padding: '15px', borderRadius: '12px' }}>
              <i className="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully. Our team will contact you shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" name="name" placeholder="Your Name" value={contactForm.name} onChange={handleContactChange} required className="form-input" style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="email" name="email" placeholder="Your Email" value={contactForm.email} onChange={handleContactChange} required className="form-input" style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="tel" name="phone" placeholder="Your Phone" value={contactForm.phone} onChange={handleContactChange} className="form-input" style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" name="subject" placeholder="Subject" value={contactForm.subject} onChange={handleContactChange} required className="form-input" style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea name="message" placeholder="Tell us about your project" rows="3" value={contactForm.message} onChange={handleContactChange} required className="form-input" style={{ width: '100%', resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="btn-login" style={{ width: '100%', marginTop: '5px' }}>Send Inquiry</button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

export default Login;
