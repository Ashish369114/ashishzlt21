import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { formatCurrency } from '../utils/currencyFormatter';

const useRealtimeUpdates = (userId, schoolId, role) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [realtimeData, setRealtimeData] = useState({
    attendance: [],
    marks: [],
    fees: [],
    homework: [],
    exams: [],
    transport: [],
    hostel: [],
    admissions: [],
    library: [],
    messages: [],
  });

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      newSocket.emit('user:authenticate', {
        userId,
        schoolId,
        role,
        name: localStorage.getItem('userName'),
      });
    });

    // Attendance Updates
    newSocket.on('attendance:updated', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        attendance: [...prev.attendance, data],
      }));
      addNotification('Attendance Updated', `New attendance record: ${data.studentName}`);
    });

    // Marks Updates
    newSocket.on('marks:updated', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        marks: [...prev.marks, data],
      }));
      addNotification('Marks Updated', `New marks posted in ${data.subject}`);
    });

    newSocket.on('marks:newEntry', (data) => {
      addNotification('Your Marks Posted', `Your marks have been posted in ${data.subject}`);
    });

    // Fee Notifications
    newSocket.on('fee:received', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        fees: [...prev.fees, data],
      }));
      addNotification('Fee Received', `Fee payment received from ${data.studentName}`);
    });

    newSocket.on('fee:pending', (data) => {
      addNotification('Pending Fee', `You have pending fees of ${formatCurrency(data.amount)}`);
    });

    newSocket.on('fee:confirmation', (data) => {
      addNotification('Fee Paid', `Your fee payment of ${formatCurrency(data.amount)} has been confirmed`);
    });

    // Homework Updates
    newSocket.on('homework:new', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        homework: [...prev.homework, data],
      }));
      addNotification('Homework Assigned', `New homework in ${data.subject}`);
    });

    newSocket.on('homework:assigned', (data) => {
      addNotification('New Homework', `You have new homework in ${data.subject}`);
    });

    newSocket.on('homework:received', (data) => {
      addNotification('Homework Received', `Homework submitted by ${data.studentName}`);
    });

    // Exam Updates
    newSocket.on('exam:new', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        exams: [...prev.exams, data],
      }));
      addNotification('Exam Scheduled', `New exam scheduled: ${data.examName}`);
    });

    newSocket.on('exam:results', (data) => {
      addNotification('Exam Results Published', `Your results for ${data.examName} are now available`);
    });

    // Transport Tracking
    newSocket.on('transport:tracking', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        transport: [...prev.transport, data],
      }));
    });

    newSocket.on('transport:assigned', (data) => {
      addNotification('Transport Assigned', `You have been assigned to route ${data.routeName}`);
    });

    newSocket.on('transport:update', (data) => {
      addNotification('Transport Update', data.message);
    });

    // Hostel Updates
    newSocket.on('complaint:new', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        hostel: [...prev.hostel, data],
      }));
      addNotification('New Complaint', `Complaint received: ${data.complaintType}`);
    });

    newSocket.on('complaint:resolved', (data) => {
      addNotification('Complaint Resolved', `Your complaint has been resolved`);
    });

    newSocket.on('hostel:visitor', (data) => {
      addNotification('Visitor Entry', `Visitor ${data.visitorName} entered hostel`);
    });

    // Admission Updates
    newSocket.on('admission:new', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        admissions: [...prev.admissions, data],
      }));
      addNotification('New Admission', `New admission application from ${data.studentName}`);
    });

    newSocket.on('admission:status', (data) => {
      addNotification('Admission Status', data.message);
    });

    // Library Updates
    newSocket.on('library:borrowed', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        library: [...prev.library, data],
      }));
      addNotification('Book Borrowed', `You have borrowed "${data.bookTitle}"`);
    });

    newSocket.on('library:dueSoon', (data) => {
      addNotification('Book Due Soon', `"${data.book.title}" is due in ${data.daysLeft} days`);
    });

    // General Notifications
    newSocket.on('notification:received', (data) => {
      addNotification(data.title, data.message);
    });

    // Messages
    newSocket.on('message:received', (data) => {
      setRealtimeData(prev => ({
        ...prev,
        messages: [...prev.messages, data],
      }));
      addNotification('New Message', `Message from ${data.senderName}`);
    });

    // User Connect/Disconnect
    newSocket.on('user:connected', (data) => {
      console.log(`${data.name} connected`);
    });

    newSocket.on('user:disconnected', (data) => {
      console.log(`${data.name} disconnected`);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, schoolId, role]);

  const addNotification = useCallback((title, message) => {
    const notification = {
      id: Date.now(),
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const emitEvent = useCallback((event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  return {
    socket,
    notifications,
    realtimeData,
    addNotification,
    clearNotification,
    emitEvent,
  };
};

export default useRealtimeUpdates;

