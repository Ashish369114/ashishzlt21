import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { DashboardProvider } from '../context/DashboardContext';

const TeacherDashboardLayout = ({ user, children }) => {
  const navigate = useNavigate();

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.14),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)] p-6 lg:ml-72 lg:h-screen lg:p-8">
            <div className="sticky top-0 z-20 mb-6 rounded-[1.6rem] border border-slate-200/80 bg-white/80 p-1 shadow-sm backdrop-blur">
              <TopBar
                userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Suresh Rao'}
                subject={user?.subject || 'Mathematics'}
                onOpenNotifications={() => navigate('/dashboard/communications', { state: { module: 'notifications' } })}
                onOpenMessages={() => navigate('/dashboard/communications', { state: { module: 'messages' } })}
                onOpenSettings={() => navigate('/dashboard/settings')}
              />
            </div>
            <div className="pb-8">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default TeacherDashboardLayout;
