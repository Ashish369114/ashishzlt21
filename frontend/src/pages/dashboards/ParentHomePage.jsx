import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import MetricCard from '../../components/dashboard/MetricCard';
import SectionCard from '../../components/dashboard/SectionCard';
import WelcomeCard from '../../components/dashboard/WelcomeCard';

const ParentHomePage = ({ user, students = [], stats = {} }) => {
  const navigate = useNavigate();
  const parentName = `${user?.firstName || 'Parent'} ${user?.lastName || ''}`.trim();

  const cards = [
    {
      title: 'Linked Children',
      value: students.length,
      subtitle: 'Active student profiles',
      icon: Users,
      accent: 'bg-gradient-to-br from-violet-500 to-indigo-500',
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.totalPendingAmount ?? 0}`,
      subtitle: 'Outstanding payments',
      icon: DollarSign,
      accent: 'bg-gradient-to-br from-rose-500 to-orange-500',
    },
    {
      title: 'Average Score',
      value: stats.averageMarks ?? '—',
      subtitle: 'Across your children',
      icon: BookOpen,
      accent: 'bg-gradient-to-br from-sky-500 to-cyan-500',
    },
    {
      title: 'Attendance',
      value: stats.averageAttendance ? `${stats.averageAttendance}%` : '—',
      subtitle: 'Average attendance',
      icon: ShieldCheck,
      accent: 'bg-gradient-to-br from-emerald-500 to-lime-500',
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeCard
        name={parentName}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <SectionCard
          title="Child Progress"
          subtitle="Track each student at a glance"
          action={
            <button
              onClick={() => navigate('/dashboard/student')}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              View profile
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr>
                  <th className="pb-3">Child</th>
                  <th className="pb-3">Grade</th>
                  <th className="pb-3">Pending Fees</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-slate-500">No linked students found.</td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const name = `${student.userId?.firstName || student.firstName || 'Unknown'} ${student.userId?.lastName || student.lastName || ''}`.trim();
                    return (
                      <tr key={student._id || student.userId || name} className="border-t border-slate-200">
                        <td className="py-3 font-semibold text-slate-800">{name}</td>
                        <td className="py-3">{student.class?.grade ? `Grade ${student.class.grade}` : 'N/A'}{student.class?.section ? ` - ${student.class.section}` : ''}</td>
                        <td className="py-3">₹{student.pendingFeeAmount ?? '0'}</td>
                        <td className="py-3 text-slate-500">{student.isActive === false ? 'Inactive' : 'Active'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          subtitle="Manage upcoming tasks"
        >
          <div className="grid gap-3">
            {[
              { label: 'View Fees', path: '/dashboard/fees' },
              { label: 'Check Results', path: '/dashboard/results' },
              { label: 'Review Attendance', path: '/dashboard/attendance' },
              { label: 'Send Message', path: '/dashboard/communication' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <span>{action.label}</span>
                  <Sparkles className="h-4 w-4 text-violet-500" />
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="School Alerts"
        subtitle="Important updates for parents"
        action={<span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Latest</span>}
      >
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Fee due reminder</p>
            <p className="mt-2 text-sm text-slate-500">Any outstanding fees can be paid quickly via the Fees page. Please settle them before the due date.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Parent-teacher meeting</p>
            <p className="mt-2 text-sm text-slate-500">A meeting is scheduled by the school for next week. Watch for the official notice in Communications.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default ParentHomePage;
