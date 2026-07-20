import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../../components/dashboard/SectionCard';
import { teacherService } from '../../services/api';

const TeacherSettingsPage = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherId = user?._id || user?.id || user?.userId;
        if (!teacherId) return;
        const response = await teacherService.getDashboard(teacherId);
        setDashboardData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [user]);

  const teacherProfile = useMemo(() => ({
    name: dashboardData?.teacher?.name || 'Anjali Sharma',
    subject: dashboardData?.teacher?.subject?.name || dashboardData?.teacher?.subject || 'Mathematics',
    status: dashboardData?.teacher?.status || 'Online',
    email: dashboardData?.teacher?.email || 'teacher@school.com',
    classes: dashboardData?.classes?.length ? dashboardData.classes.length : 3,
  }), [dashboardData]);

  return (
    <div className="space-y-6">
      <SectionCard title="Settings" subtitle="Profile preferences" action={<button onClick={() => navigate('/dashboard')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Back Home</button>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-lg font-semibold text-slate-900">Teacher Profile</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Display name: {teacherProfile.name}</p>
              <p>Subject: {teacherProfile.subject}</p>
              <p>Status: {teacherProfile.status}</p>
              <p>Email: {teacherProfile.email}</p>
              <p>Assigned classes: {teacherProfile.classes}</p>
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-lg font-semibold text-slate-900">Preferences</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Notifications: Enabled</p>
              <p>Theme: Light</p>
              <p>Language: English</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default TeacherSettingsPage;
