const http = require('http');
const socketIo = require('socket.io');

const initializeSocket = (app) => {
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // User authentication and identification
    socket.on('user:authenticate', (userData) => {
      connectedUsers.set(socket.id, userData);
      socket.join(`user:${userData.userId}`);
      socket.join(`school:${userData.schoolId}`);
      
      if (userData.role) {
        socket.join(`role:${userData.role}`);
      }

      io.emit('user:connected', {
        userId: userData.userId,
        name: userData.name,
        role: userData.role,
      });
    });

    // Real-time Attendance Updates
    socket.on('attendance:marked', (data) => {
      io.to(`school:${data.schoolId}`).emit('attendance:updated', data);
    });

    socket.on('attendance:report', (data) => {
      io.to(`role:teacher`).emit('attendance:realtime', data);
    });

    // Real-time Marks Updates
    socket.on('marks:posted', (data) => {
      io.to(`school:${data.schoolId}`).emit('marks:updated', data);
      io.to(`user:${data.studentId}`).emit('marks:newEntry', data);
    });

    // Real-time Fee Notifications
    socket.on('fee:paid', (data) => {
      io.to(`role:accountant_admin`).emit('fee:received', data);
      io.to(`user:${data.studentId}`).emit('fee:confirmation', data);
    });

    socket.on('fee:reminder', (data) => {
      io.to(`user:${data.studentId}`).emit('fee:pending', data);
    });

    // Real-time Homework Updates
    socket.on('homework:assigned', (data) => {
      io.to(`school:${data.schoolId}`).emit('homework:new', data);
      data.studentIds.forEach(studentId => {
        io.to(`user:${studentId}`).emit('homework:assigned', data);
      });
    });

    socket.on('homework:submitted', (data) => {
      io.to(`user:${data.teacherId}`).emit('homework:received', data);
    });

    // Real-time Exam Updates
    socket.on('exam:scheduled', (data) => {
      io.to(`school:${data.schoolId}`).emit('exam:new', data);
    });

    socket.on('exam:marks:published', (data) => {
      io.to(`user:${data.studentId}`).emit('exam:results', data);
    });

    // Real-time Transport Tracking
    socket.on('transport:location:update', (data) => {
      io.to(`route:${data.routeId}`).emit('transport:tracking', {
        routeId: data.routeId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
        status: data.status,
      });
    });

    socket.on('transport:assignment', (data) => {
      io.to(`user:${data.studentId}`).emit('transport:assigned', data);
      io.to(`role:transport_coordinator`).emit('transport:update', data);
    });

    // Real-time Hostel Updates
    socket.on('hostel:complaint:registered', (data) => {
      io.to(`hostel:${data.hostelId}`).emit('complaint:new', data);
    });

    socket.on('hostel:complaint:resolved', (data) => {
      io.to(`user:${data.studentId}`).emit('complaint:resolved', data);
    });

    socket.on('hostel:visitor:entry', (data) => {
      io.to(`hostel:${data.hostelId}`).emit('hostel:visitor', data);
    });

    // Real-time Admission Updates
    socket.on('admission:submitted', (data) => {
      io.to(`role:admin`).emit('admission:new', data);
    });

    socket.on('admission:approved', (data) => {
      io.to(`user:${data.parentEmail}`).emit('admission:status', {
        status: 'approved',
        message: 'Your admission has been approved!',
      });
    });

    socket.on('admission:rejected', (data) => {
      io.to(`user:${data.parentEmail}`).emit('admission:status', {
        status: 'rejected',
        message: 'Your admission request has been rejected.',
      });
    });

    // Real-time Library Updates
    socket.on('library:book:borrowed', (data) => {
      io.to(`user:${data.userId}`).emit('library:borrowed', data);
    });

    socket.on('library:book:reminder', (data) => {
      io.to(`user:${data.userId}`).emit('library:dueSoon', {
        book: data.book,
        dueDate: data.dueDate,
        daysLeft: data.daysLeft,
      });
    });

    // Real-time Employee Updates
    socket.on('employee:salary:processed', (data) => {
      io.to(`user:${data.employeeId}`).emit('salary:credit', data);
      io.to(`role:accountant_admin`).emit('salary:processed', data);
    });

    socket.on('employee:added', (data) => {
      io.to(`school:${data.school}`).emit('employee:added', data);
      io.to(`role:super_admin`).emit('employee:added', data);
      io.to(`role:principal`).emit('employee:added', data);
      io.to(`role:admin`).emit('employee:added', data);
    });

    socket.on('employee:updated', (data) => {
      io.to(`school:${data.school}`).emit('employee:updated', data);
      io.to(`role:super_admin`).emit('employee:updated', data);
      io.to(`role:principal`).emit('employee:updated', data);
      io.to(`role:admin`).emit('employee:updated', data);
    });

    socket.on('employee:deleted', (data) => {
      io.to(`school:${data.schoolId}`).emit('employee:deleted', data);
      io.to(`role:super_admin`).emit('employee:deleted', data);
      io.to(`role:principal`).emit('employee:deleted', data);
      io.to(`role:admin`).emit('employee:deleted', data);
    });


    // Real-time Notifications
    socket.on('notification:send', (data) => {
      if (data.recipientId) {
        io.to(`user:${data.recipientId}`).emit('notification:received', data);
      } else if (data.schoolId) {
        io.to(`school:${data.schoolId}`).emit('notification:received', data);
      }
    });

    // Real-time Chat
    socket.on('message:send', (data) => {
      io.to(`chat:${data.chatId}`).emit('message:received', {
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Real-time Dashboard Updates
    socket.on('dashboard:subscribe', (data) => {
      socket.join(`dashboard:${data.schoolId}`);
      io.to(`dashboard:${data.schoolId}`).emit('dashboard:data', data);
    });

    socket.on('dashboard:stats:update', (data) => {
      io.to(`dashboard:${data.schoolId}`).emit('stats:updated', data);
    });

    // Real-time Attendance Check-in/Check-out
    socket.on('attendance:checkin', (data) => {
      io.to(`role:teacher`).emit('attendance:checkin', data);
    });

    socket.on('attendance:checkout', (data) => {
      io.to(`role:teacher`).emit('attendance:checkout', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        io.emit('user:disconnected', {
          userId: user.userId,
          name: user.name,
        });
      }
      connectedUsers.delete(socket.id);
      console.log('User disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return { server, io };
};

module.exports = initializeSocket;
