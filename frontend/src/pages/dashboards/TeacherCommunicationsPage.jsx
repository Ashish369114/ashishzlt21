import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SectionCard from '../../components/dashboard/SectionCard';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import { teacherService, studentService, messageService } from '../../services/api';

const defaultMessages = [
  { sender: 'Principal', preview: 'Please share the monthly report by 6 PM.', time: '2m', unread: 2 },
  { sender: 'Admin', preview: 'Annual Day rehearsal has been moved to 4 PM.', time: '14m', unread: 0 },
  { sender: 'Parent', preview: 'Can we discuss the progress of Riya?', time: '1h', unread: 1 },
];

const defaultNotifications = [
  { title: 'Circular Released', time: '8 min ago' },
  { title: 'PTM Scheduled', time: '18 min ago' },
  { title: 'Monthly Test Timetable', time: '2 hrs ago' },
];

const TeacherCommunicationsPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(defaultMessages);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [showCompose, setShowCompose] = useState(false);
  const [messageForm, setMessageForm] = useState({ recipientType: 'parent', classId: '', recipientId: '', recipientName: '', subject: '', body: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const teacherName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Teacher';
  const active = location.state?.module === 'notifications' ? 'notifications' : 'messages';
  const teacherId = user?._id || user?.id || user?.userId;
  const schoolId = localStorage.getItem('schoolId') || 'default';
  const { notifications: liveNotifications, realtimeData } = useRealtimeUpdates(teacherId, schoolId, 'teacher');

  const mergedNotifications = React.useMemo(() => ([...liveNotifications, ...notifications].filter(Boolean)), [liveNotifications, notifications]);
  const mergedMessages = React.useMemo(() => ([...realtimeData.messages, ...messages].filter(Boolean)), [realtimeData.messages, messages]);

  useEffect(() => {
    if (!teacherId) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        const [dashboardRes, notificationsRes, messagesRes] = await Promise.all([
          teacherService.getDashboard(teacherId),
          teacherService.getNotifications(teacherId),
          teacherService.getMessages(teacherId),
        ]);
        if (!isMounted) return;
        setDashboardData(dashboardRes?.data || null);
        setClassOptions(dashboardRes?.data?.classes || []);
        setNotifications((notificationsRes?.data || defaultNotifications).map((item, index) => ({ id: item.id || `notification-${index}-${item.title}`, title: item.title || 'Notification', time: item.time || 'just now', unread: item.unread ?? false, ...item })));
        setMessages((messagesRes?.data || defaultMessages).map((item, index) => ({ id: item.id || `message-${index}-${item.sender}`, sender: item.sender || 'Sender', preview: item.preview || item.message || '', time: item.time || 'now', unread: item.unread ?? 0, ...item })));
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  useEffect(() => {
    if (!messageForm.classId) {
      setStudents([]);
      return;
    }

    let canceled = false;
    studentService.getByClass(messageForm.classId).then((res) => {
      if (!canceled) {
        setStudents(res?.data || []);
      }
    }).catch((error) => {
      console.error(error);
      if (!canceled) setStudents([]);
    });

    return () => {
      canceled = true;
    };
  }, [messageForm.classId]);

  const studentOptions = React.useMemo(() => (
    students.map((student) => ({
      id: student.userId?.userId || student.userId?._id || student._id,
      label: `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim() || 'Student',
      value: student.userId?.userId || student.userId?._id || student._id,
    }))
  ), [students]);

  const parentOptions = React.useMemo(() => {
    const parents = [];
    students.forEach((student) => {
      const parentUser = student.parentId;
      if (parentUser) {
        const id = parentUser.userId || parentUser._id;
        if (!parents.some((parent) => parent.value === id)) {
          parents.push({
            id,
            label: `${parentUser.firstName || ''} ${parentUser.lastName || ''}`.trim() || 'Parent',
            value: id,
          });
        }
      }
    });
    return parents;
  }, [students]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageForm.body) {
      alert('Please write a message body');
      return;
    }

    const recipientType = messageForm.recipientType;
    const payload = {
      recipientType,
      subject: messageForm.subject,
      body: messageForm.body,
      schoolId,
      chatId: `${teacherId}:${recipientType}:${messageForm.recipientId || messageForm.classId || 'all'}`,
    };

    if (recipientType === 'all') {
      payload.recipientId = '';
      payload.recipientName = 'All';
    } else if (recipientType === 'class') {
      const selectedClass = classOptions.find((cls) => cls._id === messageForm.classId || cls.id === messageForm.classId);
      payload.recipientId = messageForm.classId;
      payload.recipientName = selectedClass?.displayName || selectedClass?.className || selectedClass?.name || 'Class';
      payload.classId = messageForm.classId;
    } else {
      payload.recipientId = messageForm.recipientId;
      payload.recipientName = messageForm.recipientName;
      payload.classId = messageForm.classId;
    }

    try {
      const res = await messageService.send(payload);
      const sentMessage = res?.data || {
        id: Date.now(),
        senderName: teacherName,
        recipientName: payload.recipientName,
        recipientType: payload.recipientType,
        subject: payload.subject,
        body: payload.body,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [sentMessage, ...prev]);
      setMessageForm({ recipientType: 'parent', classId: '', recipientId: '', recipientName: '', subject: '', body: '' });
      setShowCompose(false);
      alert('Message sent successfully');
    } catch (error) {
      console.error(error);
      alert('Unable to send message.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Communications" subtitle={active === 'notifications' ? 'Notifications center' : 'Message inbox'} action={<button onClick={() => navigate('/dashboard')} className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Back Home</button>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Messages</h4>
                <p className="text-sm text-slate-500">Chat with parents and class contacts.</p>
              </div>
              <button type="button" onClick={() => setShowCompose((prev) => !prev)} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{showCompose ? 'Hide Compose' : 'New Message'}</button>
            </div>
            {showCompose && (
              <form onSubmit={handleSendMessage} className="mt-4 space-y-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Type</label>
                    <select
                      value={messageForm.recipientType}
                      onChange={(event) => setMessageForm((prev) => ({ ...prev, recipientType: event.target.value, classId: '', recipientId: '', recipientName: '' }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <option value="parent">Parent</option>
                      <option value="student">Student</option>
                      <option value="class">Class</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  {messageForm.recipientType !== 'all' && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Class</label>
                      <select
                        value={messageForm.classId}
                        onChange={(event) => setMessageForm((prev) => ({ ...prev, classId: event.target.value, recipientId: '', recipientName: '' }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <option value="">Select class</option>
                        {classOptions.map((cls) => (
                          <option key={cls._id || cls.id || cls.name} value={cls._id || cls.id || cls.name}>
                            {cls.displayName || cls.className || cls.name || 'Class'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {(messageForm.recipientType === 'student' || messageForm.recipientType === 'parent') && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Recipient</label>
                    <select
                      value={messageForm.recipientId}
                      onChange={(event) => {
                        const selectedId = event.target.value;
                        const option = messageForm.recipientType === 'student'
                          ? studentOptions.find((item) => item.value === selectedId)
                          : parentOptions.find((item) => item.value === selectedId);
                        setMessageForm((prev) => ({ ...prev, recipientId: selectedId, recipientName: option?.label || '' }));
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <option value="">Select recipient</option>
                      {(messageForm.recipientType === 'student' ? studentOptions : parentOptions).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                  <input
                    value={messageForm.subject}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, subject: event.target.value }))}
                    placeholder="Message subject"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    value={messageForm.body}
                    onChange={(event) => setMessageForm((prev) => ({ ...prev, body: event.target.value }))}
                    rows="4"
                    placeholder="Write your message..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCompose(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                  <button type="submit" className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Send</button>
                </div>
              </form>
            )}
            <div className="mt-4 space-y-3">
              {mergedMessages.map((item) => (
                <div key={item.id || item.senderName || item.sender} className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-white p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{item.senderName || item.sender || 'Unknown'}</p>
                    <p className="text-sm text-slate-500">{item.subject ? `${item.subject} — ` : ''}{item.body || item.preview}</p>
                  </div>
                  {item.unread > 0 ? <span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">{item.unread}</span> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-lg font-semibold text-slate-900">Notifications</h4>
            <div className="mt-4 space-y-3">
              {mergedNotifications.map((item) => (
                <div key={item.id || item.title} className="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default TeacherCommunicationsPage;
