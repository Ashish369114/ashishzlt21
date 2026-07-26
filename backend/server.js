require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const authMiddleware = require('./middleware/auth');
const roleMiddleware = require('./middleware/roleMiddleware');
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
const auditLogsRoutes = require('./routes/auditLogs');
const meetingMomsRoutes = require('./routes/meetingMoms');
const noticesRoutes = require('./routes/notices');
const systemAdminRoutes = require('./routes/systemAdmin');
const lessonPlansRoutes = require('./routes/lessonPlans');

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync(); // Automatically sync DB in non-production
      try {
        const userCount = await require('./models').User.count();
        if (userCount === 0) {
          console.log('No users found in database. Seeding demo data...');
          const seedDataFn = require('./seeds/seedFn');
          await seedDataFn();
        }
      } catch (seedErr) {
        console.warn('Auto-seed check warning:', seedErr.message);
      }
    }

    // Security Middleware
    app.use(helmet());
    
    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 200 : 5000, // limit each IP to 5000 requests in dev
      message: JSON.stringify({ success: false, message: 'Too many requests from this IP, please try again later.' })
    });
    app.use('/api', limiter);

    // Data Sanitization against XSS
    app.use(xss());

    // CORS Configuration
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://dev.zltsos.com',
      'https://dev.zltsos.com'
    ].filter(Boolean);

    app.use(cors({
      origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS: ' + origin));
        }
      },
      credentials: true
    }));
    app.use(express.json({ limit: '10kb' })); // Limit body payload size
    app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

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
    app.use('/api/audit-logs', auditLogsRoutes);
    app.use('/api/meeting-moms', meetingMomsRoutes);
    app.use('/api/notices', noticesRoutes);
    app.use('/api/system-admin', systemAdminRoutes);
    app.use('/api/lesson-plans', lessonPlansRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running' });
    });

    // Sensitive Endpoints
    app.get('/api/force-seed', authMiddleware, roleMiddleware(['super_admin']), async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'This endpoint is disabled in production.' });
      }
      try {
        const seedDataFn = require('./seeds/seedFn');
        await sequelize.sync({ force: true });
        await seedDataFn();
        res.json({ success: true, message: 'Database seeded successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
      }
    });

    app.get('/api/debug-users', authMiddleware, roleMiddleware(['super_admin']), async (req, res) => {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'This endpoint is disabled in production.' });
      }
      try {
        const count = await require('./models').User.count();
        const users = await require('./models').User.findAll({ attributes: ['userId', 'email', 'role'] });
        res.json({ count, users });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
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
