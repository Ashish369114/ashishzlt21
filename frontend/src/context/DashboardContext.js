import React, { createContext, useContext, useMemo, useState } from 'react';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo(() => ({
    activeView,
    setActiveView,
    sidebarCollapsed,
    setSidebarCollapsed,
  }), [activeView, sidebarCollapsed]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
