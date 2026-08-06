import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, FileText, Calendar, Award, AlertCircle, MessageSquare, CreditCard, CheckCircle2 } from 'lucide-react';

const defaultNotificationsList = [
  {
    id: 1,
    title: 'New Homework Assigned: Algebra & Polynomials',
    category: 'Homework',
    time: '2 hours ago',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    link: '/dashboard/homework',
    read: false,
    description: 'Ramesh Sharma assigned Polynomial Practice Worksheet due on Aug 5.'
  },
  {
    id: 2,
    title: 'Mid-Term 1 Exam Schedule Published',
    category: 'Exam Schedule',
    time: '5 hours ago',
    icon: Calendar,
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    link: '/dashboard/exams',
    read: false,
    description: 'Mid-Term 1 evaluation starts from August 25. Check time table & total marks.'
  },
  {
    id: 3,
    title: 'Unit Test 1 Results Published',
    category: 'Exam Results',
    time: '1 day ago',
    icon: Award,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    link: '/dashboard/results',
    read: false,
    description: 'Mathematics Unit Test 1 marks released. Overall Score: 92% (Grade O).'
  },
  {
    id: 4,
    title: 'Fee Payment Reminder: Term 2 Tuition Fee',
    category: 'Fee Reminders',
    time: '2 days ago',
    icon: CreditCard,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    link: '/dashboard/fees',
    read: true,
    description: 'Term 2 tuition fee due date approaching on August 15, 2026.'
  },
  {
    id: 5,
    title: 'Teacher Message from Ramesh Sharma',
    category: 'Teacher Messages',
    time: '3 days ago',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    link: '/dashboard/communication',
    read: true,
    description: 'Parent-Teacher Sync meeting scheduled for next week.'
  }
];

const ParentNotifications = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Alerts & Notifications
            </span>
          </div>
          <h1 className="text-2xl font-black">Parent Notification Center</h1>
          <p className="text-sky-100 text-xs font-medium">Real-time alerts for homework, exam schedules, results, attendance, and school messages.</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {defaultNotificationsList.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              onClick={() => navigate(notif.link)}
              className={`rounded-3xl border p-5 flex items-start gap-4 cursor-pointer transition-all ${
                notif.read
                  ? 'bg-white border-slate-200 hover:border-[#0C4A86]'
                  : 'bg-[#EBF5FF]/60 border-[#BFDBFE] hover:bg-[#EBF5FF] shadow-2xs'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0C4A86] text-white shadow-xs">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${notif.color}`}>
                    {notif.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{notif.time}</span>
                </div>

                <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentNotifications;
