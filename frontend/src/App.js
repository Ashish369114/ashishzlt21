import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import GoldPlan from './pages/GoldPlan';
import SilverPlan from './pages/SilverPlan';
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
  const [activePlan, setActivePlan] = useState(() => getStoredPlan());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const plan = parsedUser.subscriptionPlan || getStoredPlan();
      setUser({ ...parsedUser, subscriptionPlan: plan });
      setActivePlan(plan);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    const plan = userData.subscriptionPlan || getStoredPlan();
    const userWithPlan = { ...userData, subscriptionPlan: plan };
    setUser(userWithPlan);
    setActivePlan(plan);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithPlan));
  };

  const handleLogout = () => {
    setUser(null);
    setActivePlan('silver');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('subscriptionPlan');
  };

  const getDashboardComponent = () => {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
      case 'principal':
        return <PrincipalDashboard user={user} onLogout={handleLogout} />;
      case 'teacher':
        return <TeacherDashboard user={user} onLogout={handleLogout} />;
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      case 'parent':
        return <ParentDashboard user={user} onLogout={handleLogout} />;
      case 'accountant_admin':
        return <AccountantDashboard user={user} onLogout={handleLogout} />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user && canAccessGoldDashboards(user) ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/home" element={user && canAccessGoldDashboards(user) ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/silver-plan" element={<SilverPlan />} />
        <Route path="/gold-plan" element={<GoldPlan />} />
        <Route path="/login" element={user && canAccessGoldDashboards(user) ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ProfileSecurity />} />
        <Route path="/profile-security" element={<Navigate to="/change-password" replace />} />
        <Route path="/password-change" element={<Navigate to="/change-password" replace />} />
        
        {/* Protected Routes - Dashboard */}
        <Route path="/dashboard/*" element={getDashboardComponent()} />

        {/* Fallback Routes */}
        <Route path="*" element={user ? <Navigate to={canAccessGoldDashboards(user) ? getDashboardRoute(user) : '/'} replace /> : <Navigate to="/" replace />} />
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

function getStoredPlan() {
  return localStorage.getItem('subscriptionPlan') || 'silver';
}

function canAccessGoldDashboards(userData) {
  const plan = userData?.subscriptionPlan || getStoredPlan();
  return ['silver', 'gold', 'platinum'].includes(plan);
}

export default App;
