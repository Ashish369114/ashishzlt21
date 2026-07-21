# School Operating System - Full Stack

A comprehensive, production-level School Operating System built with React, Node.js, Express, and PostgreSQL. This system provides separate dashboards for Super Admin, Principal, Teachers, Students, Parents, and Accountant & Admin with real-time data synchronization.

## 🎯 Features

- **Multi-Role Dashboard System** - 6 separate dashboards with role-based access control
- **Complete CRUD Operations** - Manage students, teachers, classes, marks, attendance, etc.
- **Real-time Data Synchronization** - Changes in one dashboard automatically reflect in others
- **JWT Authentication** - Secure role-based authentication system
- **Fee Management** - Multiple payment methods including PhonePe, Card, Cash, Cheque
- **Academic Tracking** - Marks, attendance, homework, remarks, and exams
- **Professional UI/UX** - Modern, responsive, and beautiful design
- **Database** - PostgreSQL for robust data management

## 🏫 Dashboard Overview

### 1. Super Admin Dashboard
- Complete control over the entire system
- Access to all dashboards and data
- Manage all entities (students, teachers, parents, etc.)

### 2. Principal Dashboard
- School management and oversight
- Teacher and staff management
- Student performance tracking
- Fee and financial management

### 3. Teacher Dashboard
- Manage assigned classes
- Enter marks and remarks
- Mark attendance
- Assign homework
- Schedule exams

### 4. Student Dashboard
- View personal marks and performance
- Check attendance
- View homework and exams
- Track overall performance

### 5. Parent Dashboard
- Monitor child's academic progress
- View attendance and marks
- Pay fees online
- Check remarks and homework

### 6. Accountant & Admin Dashboard
- Fee collection and management
- Identify pending fees
- Payment processing
- Financial reports

## 📋 System Structure

```
school-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── marksController.js
│   │   ├── attendanceController.js
│   │   ├── homeworkController.js
│   │   ├── remarkController.js
│   │   ├── examController.js
│   │   ├── eventController.js
│   │   ├── feeController.js
│   │   └── classController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Subject.js
│   │   ├── Class.js
│   │   ├── Marks.js
│   │   ├── Attendance.js
│   │   ├── Homework.js
│   │   ├── Remark.js
│   │   ├── Exam.js
│   │   ├── Event.js
│   │   └── Fee.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── marks.js
│   │   ├── attendance.js
│   │   ├── homework.js
│   │   ├── remarks.js
│   │   ├── exams.js
│   │   ├── events.js
│   │   ├── fees.js
│   │   └── classes.js
│   ├── seeds/
│   │   └── seedData.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── dashboards/
    │   │   │   ├── SuperAdminDashboard.js
    │   │   │   ├── PrincipalDashboard.js
    │   │   │   ├── TeacherDashboard.js
    │   │   │   ├── StudentDashboard.js
    │   │   │   ├── ParentDashboard.js
    │   │   │   └── AccountantDashboard.js
    │   │   └── components/
    │   │       ├── DashboardHome.js
    │   │       ├── StudentManagement.js
    │   │       ├── TeacherManagement.js
    │   │       ├── MarksManagement.js
    │   │       ├── AttendanceManagement.js
    │   │       ├── HomeworkManagement.js
    │   │       ├── FeeManagement.js
    │   │       ├── StudentMarks.js
    │   │       ├── StudentAttendance.js
    │   │       ├── StudentHomework.js
    │   │       ├── ParentMarks.js
    │   │       ├── ParentAttendance.js
    │   │       └── ParentFees.js
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── App.css
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .gitignore
```

## 🔐 Default Login Credentials

| Role | User ID | Password |
|------|---------|----------|
| Super Admin | SUPERADMIN001 | Admin@123 |
| Principal | PRINCIPAL001 | Principal@123 |
| Teacher (Math) | TEACHER001 | Teacher@123 |
| Teacher (Science) | TEACHER002 | Teacher@123 |
| Student | STUDENT001 | Student@123 |
| Parent | PARENT001 | Parent@123 |
| Accountant | ACCOUNTANT001 | Accountant@123 |

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (running locally on port 27017)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```env
DB_HOST=zltsos-db.cps4sg00qgaw.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=school_erp_dev
DB_USER=zltsosadmin
DB_PASSWORD=your_secure_password
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React application:
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## 📚 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational Database
- **Sequelize** - PostgreSQL ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling and animations
- **HTML5** - Markup

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/class/:classId` - Get students by class

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Add new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Marks
- `GET /api/marks` - Get all marks
- `GET /api/marks/student/:studentId` - Get marks by student
- `GET /api/marks/class/:classId` - Get marks by class
- `POST /api/marks` - Add marks
- `PUT /api/marks/:id` - Update marks
- `DELETE /api/marks/:id` - Delete marks

### Attendance
- `GET /api/attendance` - Get all attendance
- `GET /api/attendance/student/:studentId` - Get attendance by student
- `GET /api/attendance/class/:classId` - Get attendance by class
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Homework
- `GET /api/homework` - Get all homework
- `GET /api/homework/class/:classId` - Get homework by class
- `POST /api/homework` - Assign homework
- `PUT /api/homework/:id` - Update homework
- `DELETE /api/homework/:id` - Delete homework

### Fees
- `GET /api/fees` - Get all fees
- `GET /api/fees/student/:studentId` - Get fees by student
- `GET /api/fees/pending` - Get pending fees
- `POST /api/fees` - Add fee
- `POST /api/fees/pay` - Pay fee
- `PUT /api/fees/:id` - Update fee
- `DELETE /api/fees/:id` - Delete fee

## 🎓 Sample Data

The system comes with pre-populated sample data:
- **1 Super Admin**
- **1 Principal**
- **7 Teachers** (one for each subject)
- **30 Classes** (Grades 1-10, Sections A-C)
- **10 Students**
- **10 Parents** (one for each student)
- **1 Accountant & Admin**

### Subjects
1. Mathematics
2. Science
3. Social Studies
4. English
5. Telugu
6. Hindi
7. Environmental Science (EVS)

## 🔄 Real-Time Synchronization

The system ensures real-time data synchronization:
- When a teacher enters marks, they automatically appear in the student and parent dashboards
- When attendance is marked, it's immediately visible to the student and parent
- Fee payments are instantly updated in the accountant's dashboard
- All data is fetched fresh from the database on each page load

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password encryption
- **Role-Based Access Control** - Different access levels for each role
- **Protected Routes** - API endpoints require valid authentication token
- **CORS Protection** - Configured CORS for secure cross-origin requests

## 🎨 UI/UX Features

- **Modern Design** - Professional gradient-based color scheme
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Intuitive Navigation** - Easy-to-use sidebar menu
- **Dashboard Statistics** - Quick overview cards with key metrics
- **Data Tables** - Clean, organized table displays
- **Forms** - User-friendly forms for data entry
- **Alerts** - Success and error messages for user feedback
- **Loading States** - Spinner indicators while fetching data

## 📊 Key Functionalities

1. **Student Management**
   - Add, edit, delete student records
   - Assign students to classes
   - Track student performance

2. **Teacher Management**
   - Manage teacher profiles
   - Assign teachers to classes and subjects
   - Track qualifications and experience

3. **Academic Management**
   - Enter and track marks for different exam types
   - Mark daily attendance
   - Assign homework with due dates
   - Schedule exams
   - Add remarks for student behavior

4. **Fee Management**
   - Create and manage fee records
   - Track pending and paid fees
   - Process payments via multiple methods
   - Generate fee reports

5. **Event Management**
   - Create and manage school events
   - Track event attendance

## 🐛 Troubleshooting

### PostgreSQL Connection Error
- Ensure AWS RDS database is accessible
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env` file

### Port Already in Use
- Change the PORT in `.env` (backend) or use different port for React

### CORS Error
- Ensure backend CORS (`server.js`) allows your frontend URL
- Check if backend server is running

### Module Not Found
- Run `npm install` in both backend and frontend directories

## 📞 Support

For issues or questions, please check:
1. Ensure all dependencies are installed
2. Check PostgreSQL is running
3. Verify environment variables in `.env`
4. Check browser console for error messages
5. Check backend server logs

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created as a comprehensive School Operating System with all necessary features for modern educational institutions.

---

**Happy Learning! 🎓**


## ☁️ Deployment & Architecture
- **Frontend:** AWS S3 (Static Website Hosting)
- **Backend:** Node.js on AWS EC2 (managed by PM2)
- **Database:** PostgreSQL on AWS RDS
- **CI/CD:** GitHub Actions (`.github/workflows/`) for automated S3 and EC2 deployments
- **Secrets:** AWS Secrets Manager for secure environment variables
