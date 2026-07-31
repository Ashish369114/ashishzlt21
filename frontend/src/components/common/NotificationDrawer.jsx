import React, { useEffect, useState } from 'react';
import { Bell, Check, Clock, AlertCircle, FileText, CheckCircle2, DollarSign, MessageSquare, X } from 'lucide-react';
import { notificationService } from '../../services/api';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';

const NotificationDrawer = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?._id || user?.id || user?.userId;
  const schoolId = localStorage.getItem('schoolId') || 'default';
  const role = user?.role || 'student';

  const { notifications: socketNotifications } = useRealtimeUpdates(userId, schoolId, role);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll({ userId, role });
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, role]);

  useEffect(() => {
    if (socketNotifications && socketNotifications.length > 0) {
      setNotifications(prev => [...socketNotifications, ...prev]);
      setUnreadCount(prev => prev + socketNotifications.length);
    }
  }, [socketNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markRead({ userId, role });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'fee': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'homework':
      case 'submission':
      case 'notes': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'attendance': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No notifications right now
              </div>
            ) : (
              notifications.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3.5 flex items-start space-x-3 transition-colors ${
                    !item.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3 inline" />
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDrawer;
