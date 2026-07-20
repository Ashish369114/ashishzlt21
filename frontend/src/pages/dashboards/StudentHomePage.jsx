import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardCheck, Sparkles, CalendarDays } from 'lucide-react';
import MetricCard from '../../components/dashboard/MetricCard';
import SectionCard from '../../components/dashboard/SectionCard';
import WelcomeCard from '../../components/dashboard/WelcomeCard';

const StudentHomePage = ({ user, student, stats }) => {
  const navigate = useNavigate();
  const safeStats = stats || {};
  const studentName = `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim();
  const className = student?.class?.grade ? `Grade ${student.class.grade}` : 'Grade not assigned';
  const sectionName = student?.class?.section ? `Section ${student.class.section}` : 'Section not assigned';

  const cards = [
    {
      title: 'Average Score',
      value: safeStats.averageMarks ?? '—',
      subtitle: 'Across all exams',
      icon: CheckCircle2,
      accent: 'bg-gradient-to-br from-sky-500 to-cyan-500',
    },
    {
      title: 'Attendance',
      value: safeStats.attendancePercent ? `${safeStats.attendancePercent}%` : '—',
      subtitle: 'Attendance this term',
      icon: BookOpen,
      accent: 'bg-gradient-to-br from-emerald-500 to-lime-500',
    },
    {
      title: 'Homework',
      value: safeStats.homeworkAssignments ?? 0,
      subtitle: 'Assigned tasks',
      icon: ClipboardCheck,
      accent: 'bg-gradient-to-br from-violet-500 to-indigo-500',
    },
    {
      title: 'Exams Taken',
      value: safeStats.totalMarks ?? 0,
      subtitle: 'Recorded tests',
      icon: CalendarDays,
      accent: 'bg-gradient-to-br from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeCard
        name={studentName}
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
          title="Academic Snapshot"
          subtitle="Your learning summary"
          action={
            <button
              onClick={() => navigate('/dashboard/marks')}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              View all marks
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Class</p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{className}</p>
              <p className="mt-2 text-sm text-slate-500">{sectionName}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Focus</p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{safeStats.pendingHomework ?? 0}</p>
              <p className="mt-2 text-sm text-slate-500">pending homework submissions</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          subtitle="Jump to your most used pages"
        >
          <div className="grid gap-3">
            {[
              { label: 'Marks', path: '/dashboard/marks' },
              { label: 'Attendance', path: '/dashboard/attendance' },
              { label: 'Homework', path: '/dashboard/homework' },
              { label: 'Communication', path: '/dashboard/communication' },
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
        title="School Notes"
        subtitle="Latest updates from your classes"
        action={<span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Live feed</span>}
      >
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">New assignment posted</p>
            <p className="mt-2 text-sm text-slate-500">Your science teacher posted a new lab assignment due next week.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Exam timetable released</p>
            <p className="mt-2 text-sm text-slate-500">Check the exam schedule and download your hall ticket from the downloads section.</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Attendance milestone</p>
            <p className="mt-2 text-sm text-slate-500">Keep your attendance above 90% to maintain good academic standing.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default StudentHomePage;
