# School Management System - New Modules Guide

## Overview
This document describes the newly added modules to the school management system with real-time capabilities.

## New Modules Added

### 1. **Schools Module** 📚
Manage multiple schools within the system with complete school profiles and statistics.

**Features:**
- Create and manage multiple schools
- Track school statistics (total students, teachers, classes)
- Academic year management
- Principal assignment
- Contact information and address management

**Files:**
- Model: `backend/models/School.js`
- Controller: `backend/controllers/schoolController.js`
- Routes: `backend/routes/schools.js`
- Frontend: `frontend/src/pages/components/SchoolManagement.js`

**API Endpoints:**
```
GET    /api/schools
GET    /api/schools/:id
GET    /api/schools/:id/statistics
POST   /api/schools
PUT    /api/schools/:id
DELETE /api/schools/:id
```

---

### 2. **Admissions Module** 🎓
Complete admission system for student enrollment with approval workflow.

**Features:**
- Student admission applications
- Application status tracking (pending, approved, rejected, completed)
- Document upload support
- Automatic user account creation upon approval
- Email notifications
- Category-based admissions (General, SC, ST, OBC)
- Medical history tracking

**Files:**
- Model: `backend/models/Admission.js`
- Controller: `backend/controllers/admissionController.js`
- Routes: `backend/routes/admissions.js`
- Frontend: `frontend/src/pages/components/AdmissionManagement.js`

**Real-time Updates:**
- `admission:submitted` - New admission application
- `admission:approved` - Application approved
- `admission:rejected` - Application rejected

**API Endpoints:**
```
GET    /api/admissions
GET    /api/admissions/:id
GET    /api/admissions/school/:schoolId
GET    /api/admissions/school/:schoolId/status/:status
POST   /api/admissions
PUT    /api/admissions/:id
POST   /api/admissions/:id/approve
POST   /api/admissions/:id/reject
```

---

### 3. **Employees Module** 👥
Comprehensive employee management system with payroll tracking.

**Features:**
- Employee records (staff, admin, support, maintenance)
- Department and designation management
- Salary structure with allowances and deductions
- Payroll management
- Bank account information
- Performance tracking and reviews
- Leave management
- Document storage

**Files:**
- Model: `backend/models/Employee.js`
- Controller: `backend/controllers/employeeController.js`
- Routes: `backend/routes/employees.js`
- Frontend: `frontend/src/pages/components/EmployeeManagement.js`

**Real-time Updates:**
- `employee:salary:processed` - Salary processed

**API Endpoints:**
```
GET    /api/employees
GET    /api/employees/:id
GET    /api/employees/school/:schoolId/department/:department
GET    /api/employees/school/:schoolId/type/:type
GET    /api/employees/school/:schoolId/payroll
POST   /api/employees
PUT    /api/employees/:id
PUT    /api/employees/:id/salary
DELETE /api/employees/:id
```

---

### 4. **Library Module** 📖
Complete library management system with book borrowing.

**Features:**
- Book catalog management
- Multiple copies per book
- Book categories and ISBN tracking
- Borrowing system with due dates
- Automatic fine calculation (₹10/day overdue)
- Borrow history tracking
- Available books search
- Fine management

**Files:**
- Model: `backend/models/Library.js`
- Controller: `backend/controllers/libraryController.js`
- Routes: `backend/routes/library.js`
- Frontend: `frontend/src/pages/components/LibraryManagement.js`

**Real-time Updates:**
- `library:book:borrowed` - Book borrowed
- `library:book:reminder` - Book due date reminder

**API Endpoints:**
```
GET    /api/library
GET    /api/library/:id
GET    /api/library/school/:schoolId/available
GET    /api/library/school/:schoolId/category/:category
GET    /api/library/user/:userId/history
POST   /api/library
PUT    /api/library/:id
POST   /api/library/:id/borrow
POST   /api/library/:id/return
DELETE /api/library/:id
```

---

### 5. **Transport Module** 🚌
Real-time transport management with GPS tracking.

**Features:**
- Route creation and management
- Vehicle and driver information
- Student assignment to routes
- GPS tracking with real-time updates
- Stop management with timings
- Vehicle status tracking
- Real-time location updates
- Parent notifications for transport alerts

**Files:**
- Model: `backend/models/Transport.js`
- Controller: `backend/controllers/transportController.js`
- Routes: `backend/routes/transport.js`
- Frontend: `frontend/src/pages/components/TransportManagement.js`

**Real-time Updates:**
- `transport:location:update` - Vehicle location updated
- `transport:assignment` - Student assigned to route
- `transport:tracking` - Real-time GPS tracking

**API Endpoints:**
```
GET    /api/transport
GET    /api/transport/:id
GET    /api/transport/school/:schoolId/routes
GET    /api/transport/:id/tracking
POST   /api/transport
PUT    /api/transport/:id
POST   /api/transport/:id/assign-student
POST   /api/transport/:id/remove-student
POST   /api/transport/:id/update-location
DELETE /api/transport/:id
```

---

### 6. **Hostels Module** 🏢
Hostel management system with room allocation and complaint management.

**Features:**
- Hostel creation (Boys, Girls, Mixed)
- Room allocation and management
- Student room assignment
- Facility tracking
- Meal schedule management
- Complaint registration and resolution
- Visitor entry tracking
- Warden management

**Files:**
- Model: `backend/models/Hostel.js`
- Controller: `backend/controllers/hostelController.js`
- Routes: `backend/routes/hostels.js`
- Frontend: `frontend/src/pages/components/HostelManagement.js`

**Real-time Updates:**
- `hostel:complaint:registered` - New complaint
- `hostel:complaint:resolved` - Complaint resolved
- `hostel:visitor:entry` - Visitor entry

**API Endpoints:**
```
GET    /api/hostels
GET    /api/hostels/:id
GET    /api/hostels/school/:schoolId/hostels
GET    /api/hostels/school/:schoolId/available-rooms
POST   /api/hostels
PUT    /api/hostels/:id
POST   /api/hostels/:hostelId/allocate-student
POST   /api/hostels/:hostelId/remove-student
POST   /api/hostels/:hostelId/complaint
POST   /api/hostels/:hostelId/complaint/:complaintId/resolve
DELETE /api/hostels/:id
```

---

### 7. **Reports Module** 📊
Advanced reporting system with multiple report types.

**Features:**
- Attendance Reports
- Academic Performance Reports
- Financial Reports (fee collection)
- Student Performance Analysis
- Multiple export formats (PDF, Excel, CSV)
- Scheduled report generation
- Custom filters (class, teacher, student)
- Data visualization support

**Files:**
- Model: `backend/models/Report.js`
- Controller: `backend/controllers/reportController.js`
- Routes: `backend/routes/reports.js`
- Frontend: `frontend/src/pages/components/ReportManagement.js`

**Report Types:**
- **Attendance Report**: Track attendance by date range and class
- **Academic Report**: Marks and performance by term
- **Financial Report**: Fee collection and pending amounts
- **Performance Report**: Student and class performance metrics

**API Endpoints:**
```
GET    /api/reports
GET    /api/reports/:id
GET    /api/reports/school/:schoolId/reports
POST   /api/reports/generate/attendance
POST   /api/reports/generate/academic
POST   /api/reports/generate/financial
POST   /api/reports/generate/performance
POST   /api/reports/schedule
DELETE /api/reports/:id
```

---

### 8. **Settings Module** ⚙️
Comprehensive system configuration and settings management.

**Features:**
- General settings (system name, timezone, language, currency)
- Academic settings (session format, attendance threshold, passing marks)
- Admission settings (number format, auto-generation)
- Fee settings (collection mode, late fees, discounts)
- Notification settings (email, SMS, WhatsApp, push)
- Security settings (password policy, 2FA, session timeout)
- Backup configuration
- API settings
- UI Customization (logo, theme, colors)
- Third-party integrations (Google Classroom, Teams, etc.)

**Files:**
- Model: `backend/models/Settings.js`
- Controller: `backend/controllers/settingsController.js`
- Routes: `backend/routes/settings.js`

**API Endpoints:**
```
GET    /api/settings/:schoolId
POST   /api/settings
PUT    /api/settings/:schoolId
PUT    /api/settings/:schoolId/general
PUT    /api/settings/:schoolId/academic
PUT    /api/settings/:schoolId/admission
PUT    /api/settings/:schoolId/fees
PUT    /api/settings/:schoolId/notification
PUT    /api/settings/:schoolId/security
PUT    /api/settings/:schoolId/backup
PUT    /api/settings/:schoolId/customization
PUT    /api/settings/:schoolId/integrations
```

---

### 9. **Users Module (Enhanced)** 👤
Enhanced user management with comprehensive role-based access control.

**Features:**
- Multiple user roles (super_admin, principal, teacher, student, parent, etc.)
- User preferences and settings
- Login history and activity tracking
- Two-factor authentication support
- Account suspension with reasons
- Password policy enforcement
- Profile image management

**Files:**
- Model: `backend/models/UserEnhanced.js`

**Roles:**
- super_admin - System administration
- principal - School management
- admin - Administrative staff
- teacher - Teaching staff
- student - Student user
- parent - Parent/Guardian
- accountant_admin - Financial management
- librarian - Library management
- transport_coordinator - Transport management
- hostel_warden - Hostel management
- staff - Support staff

---

### 10. **Real-time Notifications Service** 📬
Service for sending notifications via multiple channels.

**Features:**
- Email notifications
- In-app real-time notifications
- Admission status updates
- Fee reminders
- Homework assignments
- Exam schedules
- Transport alerts
- Library due date reminders
- Mark notifications
- Hostel updates

**Files:**
- Service: `backend/services/notificationService.js`

**Notification Types:**
```javascript
sendAdmissionNotification(email, name, status)
sendFeeReminder(email, name, amount, dueDate)
sendHomeworkNotification(email, subject, dueDate)
sendExamScheduleNotification(email, exam, date, time, subject)
sendTransportAlertNotification(email, name, message)
sendLibraryNotification(email, book, dueDate)
sendMarkNotification(email, subject, marks, total)
```

---

## Real-time Features

### WebSocket Configuration
File: `backend/config/socket.js`

**Real-time Events:**

#### Attendance
- `attendance:marked` - Attendance marked
- `attendance:updated` - Attendance updated in real-time
- `attendance:checkin` - Staff check-in
- `attendance:checkout` - Staff check-out

#### Marks & Grades
- `marks:posted` - Marks posted by teacher
- `marks:updated` - Marks updated in real-time
- `marks:newEntry` - New marks for student

#### Fees
- `fee:paid` - Fee payment received
- `fee:reminder` - Fee payment reminder
- `fee:confirmation` - Fee payment confirmation

#### Homework
- `homework:assigned` - New homework assigned
- `homework:submitted` - Homework submitted
- `homework:received` - Homework received by teacher

#### Exams
- `exam:scheduled` - Exam scheduled
- `exam:marks:published` - Exam results published

#### Transport
- `transport:location:update` - Vehicle GPS update
- `transport:assignment` - Student assigned to route

#### Hostels
- `hostel:complaint:registered` - Complaint registered
- `hostel:complaint:resolved` - Complaint resolved
- `hostel:visitor:entry` - Visitor entry

#### Admissions
- `admission:submitted` - Application submitted
- `admission:approved` - Application approved
- `admission:rejected` - Application rejected

#### Library
- `library:book:borrowed` - Book borrowed
- `library:book:reminder` - Due date reminder

---

## Frontend Components

All components are located in `frontend/src/pages/components/`:

- SchoolManagement.js
- AdmissionManagement.js
- EmployeeManagement.js
- LibraryManagement.js
- TransportManagement.js
- HostelManagement.js
- ReportManagement.js

**Shared Styles:** `frontend/src/styles/ManagementStyles.css`

**Real-time Hook:** `frontend/src/hooks/useRealtimeUpdates.js`

---

## Installation & Setup

### Backend Dependencies Added
```json
{
  "socket.io": "^4.6.0",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.0",
  "pdfkit": "^0.13.0",
  "exceljs": "^4.3.0"
}
```

### Frontend Dependencies Added
```json
{
  "socket.io-client": "^4.6.0"
}
```

### Installation Steps
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

---

## Environment Configuration

Create `.env` file in backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=gmail
CORS_ORIGIN=http://localhost:3000
```

---

## Database Models Summary

| Model | Description | Key Fields |
|-------|-------------|-----------|
| School | School information | name, code, academicYear, principalId |
| Admission | Student admission applications | firstName, parentEmail, status, documents |
| Employee | Staff and admin employees | employeeId, designation, salary, department |
| Library | Book management | title, isbn, author, availableCopies |
| Transport | Transport routes and vehicles | routeName, vehicle, driver, stops |
| Hostel | Hostel management | hostelName, rooms, warden, monthlyFee |
| Report | Generated reports | reportType, data, format, status |
| Settings | System configuration | school, general, academic, security |
| UserEnhanced | Enhanced user profiles | role, preferences, loginHistory |

---

## Best Practices

1. **Always use authentication** - Include JWT token in all requests
2. **Check roles** - Verify user role before sensitive operations
3. **Real-time updates** - Use WebSocket for instant notifications
4. **Error handling** - Return proper HTTP status codes
5. **Data validation** - Validate all input data
6. **Logging** - Log important operations
7. **Security** - Use HTTPS in production, secure sensitive data
8. **Scalability** - Design for multiple schools and users

---

## Testing

Run tests for existing modules:
```bash
cd backend
npm test
```

---

## Support & Documentation

- API Documentation: See `API_DOCUMENTATION.md`
- Configuration: See `CONFIGURATION.md`
- Getting Started: See `QUICKSTART.md`

---

## Version
2.0.0 - Major update with 10 new modules and real-time features

---

## License
ISC
