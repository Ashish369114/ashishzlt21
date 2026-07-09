require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initializeSocket = require('./config/socket');
const { ensureAdminRoles } = require('./utils/roleFixer');

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const marksRoutes = require('./routes/marks');
const attendanceRoutes = require('./routes/attendance');
const homeworkRoutes = require('./routes/homework');
const remarksRoutes = require('./routes/remarks');
const examsRoutes = require('./routes/exams');
const eventsRoutes = require('./routes/events');
const feesRoutes = require('./routes/fees');
const classesRoutes = require('./routes/classes');
const schoolRoutes = require('./routes/schools');
const admissionRoutes = require('./routes/admissions');
const employeeRoutes = require('./routes/employees');
const libraryRoutes = require('./routes/library');
const transportRoutes = require('./routes/transport');
const hostelRoutes = require('./routes/hostels');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const expensesRoutes = require('./routes/expenses');
const concessionRoutes = require('./routes/concessions');
const leaveRoutes = require('./routes/leaves');

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Sync Class model indexes to remove any stale collection index definitions.
      const Class = require('./models/Class');
      await Class.syncIndexes();
    }

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Initialize WebSocket first
    const { server, io } = initializeSocket(app);
    app.locals.io = io; // Make io accessible to routes

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/marks', marksRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/homework', homeworkRoutes);
    app.use('/api/remarks', remarksRoutes);
    app.use('/api/exams', examsRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/fees', feesRoutes);
    app.use('/api/classes', classesRoutes);
    app.use('/api/schools', schoolRoutes);
    app.use('/api/admissions', admissionRoutes);
    app.use('/api/employees', employeeRoutes);
    app.use('/api/library', libraryRoutes);
    app.use('/api/transport', transportRoutes);
    app.use('/api/hostels', hostelRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/subjects', subjectRoutes);
    app.use('/api/expenses', expensesRoutes);
    app.use('/api/concessions', concessionRoutes);
    app.use('/api/leaves', leaveRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running' });
    });

    if (isDbConnected) {
      await ensureAdminRoles();
    } else {
      console.log('Skipping syncIndexes and role check: MongoDB is offline.');
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with WebSocket support (Local Mock Mode)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
