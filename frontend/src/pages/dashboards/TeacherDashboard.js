import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import TeacherDashboardLayout from '../../layouts/TeacherDashboardLayout';
import TeacherHomePage from './TeacherHomePage';
import TeacherClassesPage from './TeacherClassesPage';
import TeacherCommunicationsPage from './TeacherCommunicationsPage';
import TeacherActivitiesPage from './TeacherActivitiesPage';
import TeacherDailySlidesPage from './TeacherDailySlidesPage';
import TeacherSettingsPage from './TeacherSettingsPage';
import TeacherStudentModule from '../components/TeacherStudentModule';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';

const TeacherDashboard = ({ user, onLogout }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TeacherDashboardLayout user={user} onLogout={onLogout}>
      <Routes>
        <Route index element={<TeacherHomePage user={user} />} />
        <Route path="students" element={<Navigate to="/dashboard/classes" replace />} />
        <Route path="classes" element={<TeacherClassesPage user={user} />} />
        <Route path="calendar" element={<Navigate to="/dashboard" replace />} />
        <Route path="communications" element={<TeacherCommunicationsPage user={user} />} />
        <Route path="activities" element={<TeacherActivitiesPage user={user} />} />
        <Route path="daily-slides" element={<TeacherDailySlidesPage user={user} />} />
        <Route path="settings" element={<TeacherSettingsPage user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </TeacherDashboardLayout>
  );
};

export default TeacherDashboard;
