import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background decoration */}
      <div className="login-bg-decoration"></div>
      
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">EduManage</span>
            </div>
            <h2>School Management System</h2>
            <p>Welcome Back! Please login to your account</p>
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Logging in...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="login-footer">
            <Link to="/forgot-password" className="link">
              Forgot Password?
            </Link>
            <span className="divider">•</span>
            <Link to="/" className="link">
              Back to Home
            </Link>
          </div>

        </div>

        {/* Right Side - Features */}
        <div className="login-features">
          <div className="features-content">
            <h3>Why Choose EduManage?</h3>
            <ul className="features-list">
              <li>
                <span className="feature-icon">✅</span>
                <div>
                  <h4>Comprehensive Management</h4>
                  <p>Manage all aspects of school operations in one platform</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">⚡</span>
                <div>
                  <h4>Real-Time Updates</h4>
                  <p>Get instant notifications and live updates on all activities</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">🔒</span>
                <div>
                  <h4>Secure & Reliable</h4>
                  <p>Your data is protected with enterprise-grade security</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">📊</span>
                <div>
                  <h4>Advanced Analytics</h4>
                  <p>Get detailed reports and insights for better decision making</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">📱</span>
                <div>
                  <h4>Mobile Friendly</h4>
                  <p>Access your dashboard from any device, anywhere, anytime</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">🤝</span>
                <div>
                  <h4>24/7 Support</h4>
                  <p>Our support team is always ready to help you succeed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
