import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, BookOpen, CalendarDays, Award, AlertCircle, Check, Filter } from 'lucide-react';

const initialStudentNotifications = [
  {
    id: 'n1',
    category: 'Exams',
    title: 'Unit Test 2 Datesheet & Syllabus Confirmed',
    message: 'Mathematics Unit Test 2 will be held on May 29, 2026 at 09:30 AM in Room 104. Topics: Quadratic Equations & Probability.',
    timestamp: '2 hours ago',
    date: 'May 27, 2026',
    isRead: false,
  },
  {
    id: 'n2',
    category: 'Homework',
    title: 'New Physics Homework Assigned',
    message: 'Mr. Ramesh Sharma posted Chapter 4 Numerical Exercises. Due date: May 30, 2026.',
    timestamp: '5 hours ago',
    date: 'May 27, 2026',
    isRead: false,
  },
  {
    id: 'n3',
    category: 'Assignments',
    title: 'Science Term Project Guidelines Published',
    message: 'Upload your Solar Energy Model project PDF report before June 05, 2026.',
    timestamp: '1 day ago',
    date: 'May 26, 2026',
    isRead: false,
  },
  {
    id: 'n4',
    category: 'Results',
    title: 'Quarterly Examination Marks Published',
    message: 'Your Quarterly Examination report card has been generated. Overall percentage: 88.5% (Grade A).',
    timestamp: '2 days ago',
    date: 'May 25, 2026',
    isRead: true,
  },
  {
    id: 'n5',
    category: 'Announcements',
    title: 'School Sports Day & Track Meet Registration',
    message: 'Registrations are open for 100m sprint, relay, and basketball tournament. Contact Sports Dept.',
    timestamp: '3 days ago',
    date: 'May 24, 2026',
    isRead: true,
  },
];

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('student_notifications_list');
    return saved ? JSON.parse(saved) : initialStudentNotifications;
  });

  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Unread', 'Homework', 'Exams', 'Announcements'

  useEffect(() => {
    localStorage.setItem('student_notifications_list', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'Homework') return n.category === 'Homework' || n.category === 'Assignments';
    if (activeFilter === 'Exams') return n.category === 'Exams' || n.category === 'Results';
    if (activeFilter === 'Announcements') return n.category === 'Announcements';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Exams':
        return <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Exam</span>;
      case 'Homework':
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Homework</span>;
      case 'Assignments':
        return <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Assignment</span>;
      case 'Results':
        return <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 flex items-center gap-1"><Award className="h-3 w-3" /> Results</span>;
      default:
        return <span className="rounded-md bg-[#0C4A86]/20 px-2 py-0.5 text-[11px] font-bold text-[#0C4A86] flex items-center gap-1"><Bell className="h-3 w-3" /> Announcement</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-bold text-[#736B63] border border-[#BFDBFE] mb-2">
            <Bell className="h-3.5 w-3.5 text-[#0C4A86]" /> Notifications & Broadcasts
          </div>
          <h1 className="text-2xl font-black text-[#0C4A86]">Notifications Center</h1>
          <p className="text-xs font-semibold text-[#736B63]">
            Stay updated with homework postings, exam schedules, result publications, and principal notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-black transition self-start md:self-auto"
          >
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Unread', 'Homework', 'Exams', 'Announcements'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeFilter === tab
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'bg-[#EBF5FF] text-[#334155] hover:bg-[#EFEAE4]'
            }`}
          >
            {tab} {tab === 'Unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-[#736B63] space-y-2">
            <Bell className="h-8 w-8 text-[#0C4A86] mx-auto opacity-50" />
            <p>No notifications match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-[#BFDBFE]">
            {filteredNotifications.map((note) => (
              <div
                key={note.id}
                className={`pt-3 first:pt-0 p-4 rounded-2xl transition-all border ${
                  !note.isRead
                    ? 'bg-[#EBF5FF] border-[#0C4A86]/40 shadow-xs'
                    : 'bg-white border-[#BFDBFE]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(note.category)}
                      {!note.isRead && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                      )}
                      <span className="text-[11px] font-semibold text-[#736B63] flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock className="h-3 w-3" /> {note.timestamp} ({note.date})
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-[#0C4A86]">{note.title}</h3>
                    <p className="text-xs font-semibold text-[#334155] leading-relaxed">{note.message}</p>
                  </div>

                  {!note.isRead && (
                    <button
                      onClick={() => markAsRead(note.id)}
                      className="shrink-0 flex items-center gap-1 rounded-xl bg-white border border-[#BFDBFE] px-3 py-1.5 text-xs font-extrabold text-[#0C4A86] hover:bg-[#EBF5FF] transition"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
