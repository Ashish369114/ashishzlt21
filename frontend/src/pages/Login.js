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
      localStorage.setItem('subscriptionPlan', response.data.user.subscriptionPlan || 'silver');
      
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
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div className="brand-name">Zayn Levi Technologies</div>
              <div className="brand-tag">School Operating System</div>
            </div>
          </div>

          <h1 className="headline">Welcome Back</h1>
          <p className="subline">Sign in to access your school dashboard and modules.</p>

          {/* Region / Currency Selector */}
          <div className="country-bar">
            <label htmlFor="csel">
              <i className="fa-solid fa-earth-asia"></i> Region / Currency
            </label>
            <select
              id="csel"
              className="country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {Object.entries(currencies).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name} ({val.symbol})
                </option>
              ))}
            </select>
          </div>

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
            <Link to="/" className="link">
              Back to Home
            </Link>
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
                  <li><i className="fa-solid fa-circle-check"></i> Core Academics Module</li>
                  <li><i className="fa-solid fa-circle-check"></i> Student Directory</li>
                  <li><i className="fa-solid fa-circle-check"></i> Daily Attendance Logs</li>
                  <li><i className="fa-solid fa-circle-check"></i> Basic Exam Schedules</li>
                </ul>
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
              </div>

              {/* Platinum Card */}
              <div className="plan-card plan-platinum">
                <div className="plan-header">
                  <span className="plan-name">Platinum ({activeCurrency.symbol})</span>
                  <span className="plan-badge badge-platinum">Elite</span>
                </div>

                <ul className="plan-features">
                  <li><i className="fa-solid fa-circle-check"></i> Custom APIs &amp; Integrations</li>
                  <li><i className="fa-solid fa-circle-check"></i> Multi-branch Operations</li>
                  <li><i className="fa-solid fa-circle-check"></i> Advanced Role Access Control</li>
                  <li><i className="fa-solid fa-circle-check"></i> Dedicated Account Support</li>
                </ul>
              </div>
            </div>

            {/* Quick Login Pills */}
            <div>
              <div className="plans-hdr" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Quick Login
              </div>

              {/* Platform Admin */}
              <div className="tier-group tier-platinum">
                <div className="tier-header">
                  <span className="tier-name">👑 School Super Admin</span>
                  <span className="tier-badge badge-platinum">Elite</span>
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

              {/* Branch Roles */}
              <div className="tier-group tier-gold">
                <div className="tier-header">
                  <span className="tier-name">🏫 School Branch Staff</span>
                  <span className="tier-badge badge-gold">Standard</span>
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
                    Teacher
                  </div>
                </div>
              </div>

              {/* Users */}
              <div className="tier-group tier-silver">
                <div className="tier-header">
                  <span className="tier-name">👥 Students &amp; Parents</span>
                  <span className="tier-badge badge-silver">Core</span>
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
    </div>
  );
};

export default Login;
