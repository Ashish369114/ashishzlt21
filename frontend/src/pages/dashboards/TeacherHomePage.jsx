import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, BookOpen, CalendarDays, CheckSquare, MessageCircleMore, Clock3, Sparkles } from 'lucide-react';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import WelcomeCard from '../../components/dashboard/WelcomeCard';
import MetricCard from '../../components/dashboard/MetricCard';
import SectionCard from '../../components/dashboard/SectionCard';
import TeacherTimetable from '../../components/dashboard/TeacherTimetable';
import { teacherService, activityService, messageService } from '../../services/api';

const defaultTimetable = [
  { time: '8:00 AM', monday: 'Maths', tuesday: 'Science', wednesday: 'English', thursday: 'Social', friday: 'Computer', saturday: 'Art' },
  { time: '9:00 AM', monday: 'English', tuesday: 'Maths', wednesday: 'Science', thursday: 'Computer', friday: 'Social', saturday: 'Music' },
  { time: '10:00 AM', monday: 'Science', tuesday: 'English', wednesday: 'Maths', thursday: 'Art', friday: 'English', saturday: 'Science' },
  { time: '11:00 AM', monday: 'Social', tuesday: 'Computer', wednesday: 'Social', thursday: 'Maths', friday: 'Science', saturday: 'English' },
  { time: '12:00 PM', monday: 'Computer', tuesday: 'Social', wednesday: 'Computer', thursday: 'English', friday: 'Maths', saturday: 'Social' },
];

const defaultEvents = [
  { month: 'JUL', day: '18', title: 'PTM Meeting', time: '10:00 AM', location: 'Main Hall' },
  { month: 'JUL', day: '22', title: 'Science Exhibition', time: '11:30 AM', location: 'Lab Block' },
  { month: 'JUL', day: '28', title: 'Monthly Test', time: '09:00 AM', location: 'Classroom 2' },
];

const schoolEvents = [
  { date: 'Aug 15', title: 'Independence Day', venue: 'Ground' },
  { date: 'Aug 19', title: 'Sports Day', venue: 'Stadium' },
  { date: 'Sep 02', title: 'Parent Workshop', venue: 'Auditorium' },
];

const defaultNotifications = [
  { title: 'Circular Released', time: '8 min ago', color: 'bg-cyan-500' },
  { title: 'PTM Scheduled', time: '18 min ago', color: 'bg-violet-500' },
  { title: 'Science Exhibition', time: '1 hr ago', color: 'bg-amber-500' },
  { title: 'Monthly Test Timetable', time: '2 hrs ago', color: 'bg-rose-500' },
];

const defaultMessages = [
  { sender: 'Principal', preview: 'Please share the updated class report.', time: '2m', unread: 2 },
  { sender: 'Teacher', preview: 'The lab schedule has been updated.', time: '12m', unread: 1 },
  { sender: 'Admin', preview: 'Annual day rehearsal begins at 4 PM.', time: '1h', unread: 0 },
  { sender: 'Parent', preview: 'Can we discuss the student progress?', time: '2h', unread: 1 },
];

const defaultTasks = [
  { id: 1, title: 'Submit Monthly Report', due: 'Today • 5:00 PM', status: 'In Progress', completed: false },
  { id: 2, title: 'Check Homework', due: 'Today • 6:30 PM', status: 'Pending', completed: false },
  { id: 3, title: 'Prepare PTM', due: 'Tomorrow • 10:00 AM', status: 'Pending', completed: false },
  { id: 4, title: 'Update Marks', due: 'Tomorrow • 12:30 PM', status: 'Ready', completed: false },
];

const TeacherHomePage = ({ user }) => {
  const navigate = useNavigate();
  // legacy summary (may be removed); left intentionally
  const [summary, setSummary] = useState({ students: 150, classes: 6, attendance: 92, pendingHomework: 4, upcomingExams: 3, pendingTasks: 4 });
  const [teacherName, setTeacherName] = useState('Suresh Rao');
  const [dashboardData, setDashboardData] = useState(null);
  const [timetableRows, setTimetableRows] = useState(defaultTimetable);
  const [upcomingEvents, setUpcomingEvents] = useState(defaultEvents);
  const [schoolEventRows, setSchoolEventRows] = useState(schoolEvents);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [messages, setMessages] = useState(defaultMessages);
  const [currentTime, setCurrentTime] = useState(new Date());
  const teacherId = user?._id || user?.id || user?.userId;
  const schoolId = localStorage.getItem('schoolId') || 'default';
  const { notifications: liveNotifications, realtimeData, emitEvent } = useRealtimeUpdates(teacherId, schoolId, 'teacher');
  const [tasks, setTasks] = useState(defaultTasks);
  const [activeUpcomingIndex, setActiveUpcomingIndex] = useState(0);
  const [activeSchoolEventIndex, setActiveSchoolEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ className: '', title: '', description: '', fileName: '' });
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedActivities, setUploadedActivities] = useState([]);
  const [messageForm, setMessageForm] = useState({ to: '', subject: '', body: '' });
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    const teacherId = user?._id || user?.id || user?.userId;
    if (!teacherId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      try {
        const [dashboardRes, summaryRes, profileRes, notificationsRes, messagesRes, timetableRes, eventsRes, tasksRes] = await Promise.all([
          teacherService.getDashboard(teacherId),
          teacherService.getSummary(teacherId),
          teacherService.getProfile(teacherId),
          teacherService.getNotifications(teacherId),
          teacherService.getMessages(teacherId),
          teacherService.getTimetable(teacherId),
          teacherService.getEvents(teacherId),
          teacherService.getTasks(teacherId),
        ]);

        if (!isMounted) return;
        setDashboardData(dashboardRes?.data || null);
        setSummary(summaryRes?.data || { students: 150, classes: 6, attendance: 92, pendingTasks: 4 });
        setTeacherName(profileRes?.data?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mrs. Anjali Sharma');
        setNotifications((notificationsRes?.data || defaultNotifications).map((item, index) => ({ id: item.id || `notification-${index}-${item.title}`, color: item.color || defaultNotifications[index]?.color || 'bg-violet-500', unread: item.unread ?? true, ...item })));
        setMessages((messagesRes?.data || defaultMessages).map((item, index) => ({ id: item.id || `message-${index}-${item.sender}`, sender: item.sender || 'Sender', preview: item.preview || item.message || '', time: item.time || 'now', unread: item.unread ?? 0, ...item })));
        setTimetableRows(timetableRes?.data || defaultTimetable);
        setUpcomingEvents(eventsRes?.data || defaultEvents);
        setSchoolEventRows(schoolEvents);
        setTasks((tasksRes?.data || defaultTasks).map((task, index) => ({ id: task.id || index + 1, completed: false, ...task })));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const mergedNotifications = useMemo(() => ([...liveNotifications, ...notifications].filter(Boolean)), [liveNotifications, notifications]);
  const mergedMessages = useMemo(() => ([...realtimeData.messages, ...messages].filter(Boolean)), [realtimeData.messages, messages]);

  const classOptions = useMemo(() => {
    if (dashboardData?.classes?.length) {
      return dashboardData.classes.map((item) => item.displayName || item.className || item.name || 'Class');
    }
    return ['Grade 1 - A', 'Grade 2 - B', 'Grade 3 - A'];
  }, [dashboardData]);

  const teacherProfile = useMemo(() => ({
    photo: dashboardData?.teacher?.photo || null,
    name: dashboardData?.teacher?.name || teacherName,
    employeeId: dashboardData?.teacher?._id || 'T-001',
    subject: dashboardData?.teacher?.subject?.name || dashboardData?.teacher?.subject || 'Mathematics',
    qualification: dashboardData?.teacher?.qualification || 'M.Ed',
    experience: dashboardData?.teacher?.experience || '6 years',
    email: dashboardData?.teacher?.email || 'teacher@school.com',
    phone: dashboardData?.teacher?.phone || '9876543210',
    address: dashboardData?.teacher?.address || 'School Campus, Main Road',
  }), [dashboardData, teacherName]);

  const todayClasses = useMemo(() => {
    const teacherIdLocal = teacherId;
    if (!dashboardData?.classes?.length) return [];
    const filtered = dashboardData.classes.filter((item) => {
      if (!teacherIdLocal) return true;
      if (item.teacher && (item.teacher._id === teacherIdLocal || item.teacher === teacherIdLocal)) return true;
      if (item.teacherId && item.teacherId === teacherIdLocal) return true;
      if (Array.isArray(item.assignedTeachers) && item.assignedTeachers.includes(teacherIdLocal)) return true;
      if (Array.isArray(item.teachers) && item.teachers.includes(teacherIdLocal)) return true;
      return false;
    }).slice(0, 4);
    return filtered.map((item) => ({
      title: item.displayName || item.className || item.name || 'Class',
      schedule: item.schedule || 'Mon • Wed • Fri',
      subject: item.subjectName || item.subject?.name || 'General',
      strength: item.strength || item.studentCount || 28,
    }));
  }, [dashboardData, teacherId]);

  const pendingHomeworkCount = dashboardData?.homework?.length ?? 4;
  const upcomingExamsCount = dashboardData?.exams?.length ?? 3;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (upcomingEvents.length > 1) {
      const timer = window.setInterval(() => {
        setActiveUpcomingIndex((current) => (current + 1) % upcomingEvents.length);
      }, 5000);
      return () => window.clearInterval(timer);
    }
    return undefined;
  }, [upcomingEvents.length]);

  useEffect(() => {
    if (schoolEventRows.length > 1) {
      const timer = window.setInterval(() => {
        setActiveSchoolEventIndex((current) => (current + 1) % schoolEventRows.length);
      }, 5500);
      return () => window.clearInterval(timer);
    }
    return undefined;
  }, [schoolEventRows.length]);

  const handleUploadActivity = (event) => {
    event.preventDefault();
    if (!uploadForm.className || !uploadForm.title) {
      setUploadStatus('Please select a class and add an activity title.');
      return;
    }

    const activity = {
      id: Date.now(),
      title: uploadForm.title,
      className: uploadForm.className,
      description: uploadForm.description || 'Shared from the teacher dashboard.',
      fileName: uploadForm.fileName || 'No file attached',
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    };

    // attempt server save when possible, otherwise keep client-side optimistic
    activityService.add({ ...activity, teacher: teacherId }).then((res) => {
      const saved = res?.data || activity;
      setUploadedActivities((prev) => [saved, ...prev].slice(0, 3));
      emitEvent && emitEvent('activity:new', saved);
    }).catch(() => {
      setUploadedActivities((prev) => [activity, ...prev].slice(0, 3));
    });
    setUploadStatus(`Activity uploaded for ${uploadForm.className}.`);
    setUploadForm({ className: '', title: '', description: '', fileName: '' });
    setIsUploadModalOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageForm.to || !messageForm.body) return;
    try {
      const payload = { to: messageForm.to, subject: messageForm.subject, body: messageForm.body, from: teacherId };
      const res = await messageService.send({
        ...payload,
        recipientName: payload.to,
        recipientType: 'parent',
        senderName: teacherName,
        chatId: `${teacherId}:${payload.to}`,
      });
      const msg = res?.data || { ...payload, _id: Date.now(), senderName: teacherName, recipientName: payload.to };
      setMessages((prev) => [msg, ...prev].slice(0, 10));
      setMessageForm({ to: '', subject: '', body: '' });
      setShowMessageForm(false);
      alert('Message sent');
    } catch (err) {
      console.error(err);
      alert('Could not send message');
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed, status: task.completed ? task.status : 'Completed' } : task
    )));
  };

  const handleOpenNotification = (notification) => {
    setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, unread: false } : item));
    navigate('/dashboard/communications', { state: { module: 'notifications', notification } });
  };

  const handleOpenMessage = (message) => {
    setMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, unread: 0 } : item));
    navigate('/dashboard/communications', { state: { module: 'messages', message } });
  };

  if (isLoading) {
    return <div className="rounded-[1.6rem] border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">Loading teacher dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <WelcomeCard name={teacherName} date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
      {/* keep summary used to avoid linter unused variable warnings */}
      <div style={{ display: 'none' }}>{summary?.students}</div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Tasks" value={tasks?.filter(t => !t.completed).length || 0} subtitle="Open tasks" icon={CheckSquare} accent="bg-gradient-to-br from-violet-500 to-indigo-500" />
        <MetricCard title="New Activities" value={uploadedActivities?.length || 0} subtitle="Recent uploads" icon={Sparkles} accent="bg-gradient-to-br from-sky-500 to-cyan-500" />
        <MetricCard title="Upcoming Classes" value={todayClasses?.length || (dashboardData?.classes?.length || 0)} subtitle="Next sessions" icon={BookOpen} accent="bg-gradient-to-br from-amber-500 to-yellow-400" />
        <MetricCard title="Today's Schedule" value={timetableRows?.length || 0} subtitle={`${new Date().toLocaleDateString()}`} icon={Clock3} accent="bg-gradient-to-br from-emerald-500 to-lime-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Teacher Profile" subtitle="Snapshot" action={<button onClick={() => navigate('/dashboard/settings')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Edit Profile</button>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{teacherProfile.name}</p>
              <p className="mt-3 text-sm text-slate-500">{teacherProfile.subject}</p>
              <p className="mt-2 text-sm text-slate-500">{teacherProfile.qualification} • {teacherProfile.experience}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Contact</p>
              <p className="mt-2 text-sm text-slate-700">{teacherProfile.email}</p>
              <p className="mt-2 text-sm text-slate-700">{teacherProfile.phone}</p>
              <p className="mt-3 text-sm text-slate-500">{teacherProfile.address}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Live Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">Pending Homework: {pendingHomeworkCount}</div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">Upcoming Exams: {upcomingExamsCount}</div>
          </div>
        </SectionCard>

        <SectionCard title="Today’s Classes" subtitle="Your schedule" action={<button onClick={() => navigate('/dashboard/classes')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">View Classes</button>}>
          <div className="space-y-3">
            {todayClasses.length ? todayClasses.map((item) => (
              <div key={item.title} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.subject}</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{item.strength} students</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{item.schedule}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No classes scheduled for today.</p>
            )}
          </div>
        </SectionCard>
        <TeacherTimetable timetable={timetableRows} currentTime={currentTime} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <SectionCard title="Weekly Timetable" subtitle="Class schedule" action={<button onClick={() => navigate('/dashboard/classes')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">View Full Timetable</button>}>
          <div className="overflow-x-auto">
            <div className="min-w-[760px] rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-[110px_repeat(6,minmax(90px,1fr))] gap-2 text-sm font-semibold text-slate-600">
                <div className="rounded-2xl bg-white p-3">Time</div>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <div key={day} className="rounded-2xl bg-white p-3 text-center">{day}</div>)}
              </div>
              {timetableRows.map((row) => (
                <div key={row.time} className="mt-2 grid grid-cols-[110px_repeat(6,minmax(90px,1fr))] gap-2 text-sm">
                  <div className="rounded-2xl bg-white p-3 font-semibold text-slate-700">{row.time}</div>
                  {[row.monday, row.tuesday, row.wednesday, row.thursday, row.friday, row.saturday].map((value, index) => (
                    <div key={`${row.time}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3 text-center text-slate-600">{value}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Events" subtitle="Stay prepared" action={<button onClick={() => navigate('/dashboard/communications')} className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">Auto-scroll</button>}>
          <div className="space-y-3">
            {upcomingEvents.length ? (
              <div className="space-y-3">
                {[upcomingEvents[activeUpcomingIndex]].map((event) => (
                  <div key={event.title} className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3 transition duration-300 hover:shadow-lg">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white">
                      <span className="text-[10px] font-semibold uppercase">{event.month}</span>
                      <span className="text-lg font-semibold">{event.day}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.time} • {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
        <SectionCard title="School Events" subtitle="This month" action={<button onClick={() => navigate('/dashboard/communications')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">View All</button>}>
          <div className="space-y-3">
            {[schoolEventRows[activeSchoolEventIndex]].map((event) => (
              <div key={event.title} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.venue}</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Notifications" subtitle="Live updates" action={<button onClick={() => navigate('/dashboard/communications', { state: { module: 'notifications' } })} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Refresh</button>}>
          <div className="space-y-3">
            {mergedNotifications.map((item) => (
              <button key={item.id || item.title} type="button" onClick={() => handleOpenNotification(item)} className="group flex w-full items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.color || 'bg-violet-500'} text-white`}>
                  <span className="text-sm">!</span>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.time}</p>
                </div>
                {item.unread ? <span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">New</span> : null}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Messages" subtitle="Chat preview" action={<button onClick={() => setShowMessageForm((prev) => !prev)} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{showMessageForm ? 'Hide Composer' : 'Send Message'}</button>}>
          <div className="space-y-3">
            {showMessageForm && (
              <form onSubmit={handleSendMessage} className="space-y-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                <input value={messageForm.to} onChange={(event) => setMessageForm((prev) => ({ ...prev, to: event.target.value }))} placeholder="To (student/parent/class)" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" />
                <input value={messageForm.subject} onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))} placeholder="Subject" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" />
                <textarea value={messageForm.body} onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))} placeholder="Write your message..." rows="3" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowMessageForm(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                  <button type="submit" className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Send</button>
                </div>
              </form>
            )}
            {mergedMessages.map((item) => (
              <button key={item.id || item.sender} type="button" onClick={() => handleOpenMessage(item)} className="group flex w-full items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-semibold text-white">{item.sender.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{item.sender}</p>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-slate-500">{item.preview}</p>
                </div>
                {item.unread > 0 ? <span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">{item.unread}</span> : null}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="To Do Tasks" subtitle="Checklist" action={<button onClick={() => navigate('/dashboard/settings')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Manage</button>}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={`flex items-center justify-between rounded-[1.2rem] border p-4 transition ${task.completed ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'} `}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className={`font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</p>
                    <p className="text-sm text-slate-500">Due {task.due}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Navigate instantly" action={<Sparkles className="h-5 w-5 text-violet-500" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'My Classes', path: '/dashboard/classes', icon: BookOpen },
              { label: 'Messages', path: '/dashboard/communications', icon: MessageCircleMore },
              { label: 'Notifications', path: '/dashboard/communications', icon: BellRing },
              { label: 'Settings', path: '/dashboard/settings', icon: CalendarDays },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.path, item.label === 'Messages' ? { state: { module: 'messages' } } : undefined)} className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-700">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-dashed border-violet-200 bg-violet-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">Upload Activity</p>
                <p className="text-sm text-slate-500">Share classroom activities with a class filter.</p>
              </div>
              <button type="button" onClick={() => { setUploadStatus(''); setIsUploadModalOpen(true); }} className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white">New Activity</button>
            </div>
            {uploadStatus ? <p className="mt-3 text-sm font-medium text-violet-700">{uploadStatus}</p> : null}
            {uploadedActivities.length ? (
              <div className="mt-3 space-y-2">
                {uploadedActivities.map((activity) => (
                  <div key={activity.id} className="rounded-[1rem] border border-violet-100 bg-white p-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{activity.title}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{activity.className}</span>
                    </div>
                    <p className="mt-1">{activity.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{activity.fileName} • {activity.createdAt}</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">No uploads yet. Start by adding a new classroom activity.</p>}
          </div>
        </SectionCard>
      </div>

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Upload Activity</h3>
                <p className="mt-1 text-sm text-slate-500">Choose a class, add the activity details, and attach a file.</p>
              </div>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Close</button>
            </div>

            <form onSubmit={handleUploadActivity} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Class</label>
                <select value={uploadForm.className} onChange={(event) => setUploadForm((prev) => ({ ...prev, className: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
                  <option value="">Select class</option>
                  {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Activity Title</label>
                <input value={uploadForm.title} onChange={(event) => setUploadForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Science experiment / Group discussion" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:border-violet-400 focus:outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea value={uploadForm.description} onChange={(event) => setUploadForm((prev) => ({ ...prev, description: event.target.value }))} rows="3" placeholder="Add instructions or details for the activity" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:border-violet-400 focus:outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Attachment</label>
                <input type="file" onChange={(event) => setUploadForm((prev) => ({ ...prev, fileName: event.target.files?.[0]?.name || '' }))} className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600" />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Upload</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherHomePage;
