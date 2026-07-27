# AI-Powered ZaynLevi School Operating System - Full Stack

A comprehensive, production-level AI-Powered ZaynLevi School Operating System built with React, Node.js, Express, and PostgreSQL. This system provides separate dashboards for Super Admin, Principal, Teachers, Students, Parents, and Accountant & Admin with real-time data synchronization.

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

## 1. System Architecture & Technology Stack

The application is designed using a decoupled client-server architecture, ensuring high scalability and modularity.

### Frontend (Client-Side)
The frontend is a Single Page Application (SPA) responsible for all user interfaces and interactions.
* **Core Framework:** React 18
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development)
* **API Communication:** Axios (for making HTTP requests to the backend)
* **Real-time Communication:** Socket.io-client (for real-time notifications/chat)
* **Animations & Charts:** Framer Motion (UI animations) and Recharts (data visualization)

### Backend (Server-Side)
The backend is a RESTful API service that handles business logic, security, and data management.
* **Core Framework:** Node.js with Express.js
* **Database ORM:** Sequelize (Object-Relational Mapping library used to interact with the database using JavaScript models instead of raw SQL)
* **Authentication:** JSON Web Tokens (JWT) and `bcryptjs` for secure password hashing.
* **Real-time Server:** Socket.io

### Database Layer
* **Primary Database:** PostgreSQL (Relational database ideal for complex, structured data like school records, attendance, and finance).

---

## 2. Infrastructure & Cloud Deployment (AWS)

The platform relies on Amazon Web Services (AWS) for hosting and infrastructure. 

* **Frontend Hosting:** AWS S3 (Simple Storage Service) configured for static website hosting. 
* **Backend Hosting:** AWS EC2 (Elastic Compute Cloud) running Amazon Linux/Ubuntu. 
* **Database Hosting:** AWS RDS (Relational Database Service) for a managed, scalable PostgreSQL database.
* **Secrets Management:** AWS Secrets Manager (Used to securely store production variables like `DB_PASSWORD` and `JWT_SECRET` so they are never hardcoded in the repository).

---

## 3. Codebase Structure & Flow

### Backend Directory Structure (`/backend`)
* **`server.js`:** The entry point. It initializes the Express app, configures CORS (security), connects to the database, and loads routes.
* **`models/`:** Defines the database schemas using Sequelize. Example: `User.js` defines the columns for the Users table.
* **`routes/`:** Maps URLs to specific functions. Example: `/api/auth/login` is mapped to the login controller.
* **`controllers/`:** Contains the core business logic. This is where data is fetched from the database, modified, and returned as JSON to the frontend.
* **`middleware/`:** Security checkpoints. The `auth.js` middleware ensures a user has a valid JWT token before allowing them to access private data.

### Request Flow Example (Login)
1. User clicks "Login" on the React frontend.
2. Axios sends a POST request to `http://<EC2-IP>/api/auth/login`.
3. The Express router routes this to the `authController`.
4. The Controller queries the PostgreSQL database via Sequelize.
5. `bcrypt` verifies the password. A JWT token is generated and returned to the React app.

---

## 4. Software Engineering (SWE) Practices

### Continuous Integration & Continuous Deployment (CI/CD)
The project uses **GitHub Actions** (`.github/workflows/`) to automate deployments. This means developers do not need to manually copy files to servers.
* **`deploy-frontend.yml`:** Whenever code is pushed to the `frontend/` directory, this pipeline automatically runs `npm run build` and syncs the built files to the AWS S3 bucket.
* **`deploy-backend.yml`:** Whenever code is pushed to the `backend/` directory, this pipeline connects to the AWS EC2 instance via SSH, pulls the latest code, installs dependencies, securely fetches the environment variables from AWS Secrets Manager, and restarts the server.

### Process Management (PM2)
On the EC2 server, the backend is kept alive using **PM2**, a production process manager for Node.js. If the server crashes, PM2 automatically restarts it.

---

## 5. Maintenance & Troubleshooting Guide

### Managing the Database
* **Database Syncing:** Sequelize can automatically create tables if they are missing using `sequelize.sync()`.
* **Seeding Data:** To insert default data (like demo admins and subjects), the backend has seed scripts (`create_db.js`, `seedFn.js`). You can trigger a database reset and seed by hitting the `/api/force-seed` endpoint.

### Checking Backend Logs (EC2)
If the backend crashes or returns 500 Internal Server Errors, you must check the PM2 logs on the EC2 instance. 
1. SSH into the EC2 instance.
2. Run `pm2 logs` to see a live stream of the backend terminal output.
3. Run `pm2 status` to see if the Node.js application is online or in an "errored" state.
4. Run `pm2 restart all` if you need to manually reboot the API.

### Handling Environment Variables
If you need to change a database password, the JWT secret, or the backend URL, **do not change it in the code**. 
1. Go to **AWS Secrets Manager** in the AWS Console.
2. Edit the secret for your environment (e.g., `zltsos/dev`).
3. Re-run the GitHub Actions deployment pipeline so it pulls the new secrets and generates a fresh `.env` file on the server.

> [!WARNING]
> **CORS Configurations**
> If the frontend URL ever changes (e.g., moving from `dev.zltsos.com` to `www.zltsos.com`), you must update the `allowedOrigins` array in `backend/server.js` to prevent the browser from blocking requests due to Cross-Origin Resource Sharing (CORS) security rules.


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

Created as an AI-Powered ZaynLevi School Operating System with all necessary features for modern educational institutions.

---

**Happy Learning! 🎓**
