require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const { connectDB, sequelize } = require('./config/db');
const initializeSocket = require('./config/socket');
const { ensureAdminRoles } = require('./utils/roleFixer');
require('./models'); // Loads models and associations

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
const contactRoutes = require('./routes/contact');

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true }); // Automatically sync DB only in non-production
    }

    // Security Middleware
    app.use(helmet());
    
    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // limit each IP to 200 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    app.use('/api', limiter);

    // Data Sanitization against XSS
    app.use(xss());

    // CORS Configuration
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    app.use(express.json({ limit: '10kb' })); // Limit body payload size

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
    app.use('/api/contact', contactRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running' });
    });

    await ensureAdminRoles();

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
