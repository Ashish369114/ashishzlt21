import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSecurity from './pages/ProfileSecurity';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import PrincipalDashboard from './pages/dashboards/PrincipalDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import AccountantDashboard from './pages/dashboards/AccountantDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/home" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ProfileSecurity />} />
        <Route path="/profile-security" element={<Navigate to="/change-password" replace />} />
        <Route path="/password-change" element={<Navigate to="/change-password" replace />} />
        
        {/* Protected Routes - Dashboard */}
        {user && user.role === 'super_admin' && (
          <Route path="/dashboard/*" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
        )}
        {user && user.role === 'principal' && (
          <Route path="/dashboard/*" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
        )}
        {user && user.role === 'teacher' && (
          <Route path="/dashboard/*" element={<TeacherDashboard user={user} onLogout={handleLogout} />} />
        )}
        {user && user.role === 'student' && (
          <Route path="/dashboard/*" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
        )}
        {user && user.role === 'parent' && (
          <Route path="/dashboard/*" element={<ParentDashboard user={user} onLogout={handleLogout} />} />
        )}
        {user && user.role === 'accountant_admin' && (
          <Route path="/dashboard/*" element={<AccountantDashboard user={user} onLogout={handleLogout} />} />
        )}

        {/* Fallback Routes */}
        <Route path="/dashboard" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Navigate to="/" replace />} />
        <Route path="*" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );

  function getDashboardRoute(userData) {
    if (!userData) return '/';
    const dashboardRoutes = {
      'super_admin': '/dashboard',
      'principal': '/dashboard',
      'teacher': '/dashboard',
      'student': '/dashboard',
      'parent': '/dashboard',
      'accountant_admin': '/dashboard'
    };
    return dashboardRoutes[userData.role] || '/';
  }
}

export default App;
