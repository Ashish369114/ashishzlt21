# School Management System - API Documentation

## Overview
This is a comprehensive RESTful API for a school management system with real-time updates using WebSocket.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Schools Management

### Get All Schools
```
GET /schools
```
Returns list of all schools.

### Get School by ID
```
GET /schools/:id
```
Returns a specific school by ID.

### Get School Statistics
```
GET /schools/:id/statistics
```
Returns statistics for a school (total students, teachers, classes).

### Create School
```
POST /schools
```
**Role:** super_admin
```json
{
  "name": "XYZ School",
  "code": "XYZ001",
  "email": "info@xyzschool.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  },
  "academicYear": "2024-2025"
}
```

### Update School
```
PUT /schools/:id
```
**Role:** super_admin, principal

### Delete School
```
DELETE /schools/:id
```
**Role:** super_admin

---

## 2. Admissions Management

### Get All Admissions
```
GET /admissions
```

### Get Admission by ID
```
GET /admissions/:id
```

### Get Admissions by School
```
GET /admissions/school/:schoolId
```

### Get Admissions by Status
```
GET /admissions/school/:schoolId/status/:status
```
Status: pending, approved, rejected, completed

### Submit Admission Application
```
POST /admissions
```
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2010-01-15",
  "parentName": "Jane Doe",
  "parentEmail": "jane@example.com",
  "parentPhone": "+1234567890",
  "address": { "street": "...", "city": "..." },
  "appliedForClass": "class_id",
  "bloodGroup": "O+",
  "category": "general"
}
```

### Approve Admission
```
POST /admissions/:id/approve
```
**Role:** super_admin, principal, admin
- Creates user account
- Creates student record

### Reject Admission
```
POST /admissions/:id/reject
```
**Role:** super_admin, principal, admin
```json
{
  "rejectionReason": "Quota full"
}
```

---

## 3. Employees Management

### Get All Employees
```
GET /employees
```

### Get Employee by ID
```
GET /employees/:id
```

### Get Employees by Department
```
GET /employees/school/:schoolId/department/:department
```

### Get Employees by Type
```
GET /employees/school/:schoolId/type/:type
```
Type: staff, admin, support, maintenance

### Get Payroll
```
GET /employees/school/:schoolId/payroll
```

### Create Employee
```
POST /employees
```
**Role:** super_admin, principal, admin
```json
{
  "userId": "user_id",
  "employeeType": "staff",
  "department": "English",
  "designation": "Teacher",
  "dateOfJoining": "2024-01-15",
  "salary": {
    "baseSalary": 50000,
    "allowances": { "hra": 5000, "da": 3000 },
    "deductions": { "tax": 5000, "insurance": 2000 }
  }
}
```

### Update Employee
```
PUT /employees/:id
```
**Role:** super_admin, principal, admin

### Update Employee Salary
```
PUT /employees/:id/salary
```
**Role:** super_admin, principal, admin

### Delete Employee
```
DELETE /employees/:id
```
**Role:** super_admin, principal

---

## 4. Library Management

### Get All Books
```
GET /library
```

### Get Book by ID
```
GET /library/:id
```

### Get Available Books
```
GET /library/school/:schoolId/available
```

### Get Books by Category
```
GET /library/school/:schoolId/category/:category
```
Category: fiction, non-fiction, reference, textbook, biography, other

### Get User Borrow History
```
GET /library/user/:userId/history
```

### Add Book
```
POST /library
```
**Role:** super_admin, principal, librarian
```json
{
  "title": "Mathematics Vol 1",
  "isbn": "978-3-16-148410",
  "author": "John Author",
  "publisher": "XYZ Publishers",
  "category": "textbook",
  "totalCopies": 10,
  "school": "school_id"
}
```

### Borrow Book
```
POST /library/:id/borrow
```
```json
{
  "userId": "user_id"
}
```
- Sets due date to 14 days from borrow date
- Reduces available copies

### Return Book
```
POST /library/:id/return
```
```json
{
  "userId": "user_id"
}
```
- Calculates fine if overdue (₹10/day)
- Increases available copies

### Update Book
```
PUT /library/:id
```

### Delete Book
```
DELETE /library/:id
```
**Role:** super_admin, principal, librarian

---

## 5. Transport Management

### Get All Routes
```
GET /transport
```

### Get Route by ID
```
GET /transport/:id
```

### Get Routes by School
```
GET /transport/school/:schoolId/routes
```

### Get Vehicle Tracking
```
GET /transport/:id/tracking
```

### Create Route
```
POST /transport
```
**Role:** super_admin, principal, admin
```json
{
  "routeName": "Route A",
  "school": "school_id",
  "startPoint": { "name": "School", "latitude": 12.34, "longitude": 56.78 },
  "endPoint": { "name": "Downtown", "latitude": 12.35, "longitude": 56.79 },
  "pickupTime": "07:00",
  "dropTime": "08:00",
  "vehicle": {
    "vehicleNumber": "ABC-1234",
    "capacity": 40,
    "driverName": "John"
  },
  "stops": [
    { "stopName": "Stop 1", "sequence": 1, "latitude": 12.34, "longitude": 56.78, "arrivalTime": "07:15" }
  ]
}
```

### Assign Student to Route
```
POST /transport/:id/assign-student
```
**Role:** super_admin, principal, transport_coordinator
```json
{
  "studentId": "student_id",
  "boarding": "Stop 1"
}
```

### Remove Student from Route
```
POST /transport/:id/remove-student
```
**Role:** super_admin, principal, transport_coordinator
```json
{
  "studentId": "student_id"
}
```

### Update Vehicle Location (Real-time)
```
POST /transport/:id/update-location
```
```json
{
  "latitude": 12.34,
  "longitude": 56.78,
  "status": "in_transit"
}
```

### Delete Route
```
DELETE /transport/:id
```
**Role:** super_admin, principal

---

## 6. Hostel Management

### Get All Hostels
```
GET /hostels
```

### Get Hostel by ID
```
GET /hostels/:id
```

### Get Hostels by School
```
GET /hostels/school/:schoolId/hostels
```

### Get Available Rooms
```
GET /hostels/school/:schoolId/available-rooms
```

### Create Hostel
```
POST /hostels
```
**Role:** super_admin, principal, admin
```json
{
  "hostelName": "Boys Hostel A",
  "hostelType": "boys",
  "school": "school_id",
  "wardenName": "Mr. Smith",
  "wardenPhone": "+1234567890",
  "totalRooms": 20,
  "totalBeds": 40,
  "monthlyFee": 5000,
  "facilities": ["WiFi", "AC", "Dining Hall"]
}
```

### Allocate Student to Room
```
POST /hostels/:hostelId/allocate-student
```
**Role:** super_admin, principal, hostel_warden
```json
{
  "roomNumber": "101",
  "studentId": "student_id"
}
```

### Remove Student from Room
```
POST /hostels/:hostelId/remove-student
```
**Role:** super_admin, principal, hostel_warden
```json
{
  "roomNumber": "101",
  "studentId": "student_id"
}
```

### Register Complaint
```
POST /hostels/:hostelId/complaint
```
```json
{
  "studentId": "student_id",
  "complaintType": "water_shortage",
  "description": "No water in room 101"
}
```

### Resolve Complaint
```
POST /hostels/:hostelId/complaint/:complaintId/resolve
```
**Role:** super_admin, principal, hostel_warden

### Update Hostel
```
PUT /hostels/:id
```

### Delete Hostel
```
DELETE /hostels/:id
```
**Role:** super_admin, principal

---

## 7. Reports Management

### Get All Reports
```
GET /reports
```

### Get Report by ID
```
GET /reports/:id
```

### Get Reports by School
```
GET /reports/school/:schoolId/reports
```

### Generate Attendance Report
```
POST /reports/generate/attendance
```
**Role:** super_admin, principal, admin
```json
{
  "schoolId": "school_id",
  "classId": "class_id",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "pdf"
}
```

### Generate Academic Report
```
POST /reports/generate/academic
```
**Role:** super_admin, principal, admin
```json
{
  "schoolId": "school_id",
  "classId": "class_id",
  "term": "1",
  "format": "excel"
}
```

### Generate Financial Report
```
POST /reports/generate/financial
```
**Role:** super_admin, principal, accountant_admin
```json
{
  "schoolId": "school_id",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "format": "pdf"
}
```

### Generate Performance Report
```
POST /reports/generate/performance
```
**Role:** super_admin, principal, admin
```json
{
  "schoolId": "school_id",
  "classId": "class_id"
}
```

### Schedule Report
```
POST /reports/schedule
```
**Role:** super_admin, principal, admin
```json
{
  "title": "Monthly Attendance Report",
  "reportType": "attendance",
  "schoolId": "school_id",
  "frequency": "monthly",
  "nextGenerationDate": "2024-02-01"
}
```

### Delete Report
```
DELETE /reports/:id
```
**Role:** super_admin, principal

---

## 8. Settings Management

### Get Settings
```
GET /settings/:schoolId
```

### Create Settings
```
POST /settings
```
**Role:** super_admin, principal
```json
{
  "school": "school_id",
  "general": {
    "systemName": "School Management System",
    "timezone": "Asia/Kolkata",
    "language": "English",
    "currency": "INR"
  },
  "academic": {
    "sessionFormat": "yearly",
    "minimumAttendancePercentage": 75,
    "passingMarks": 35
  }
}
```

### Update General Settings
```
PUT /settings/:schoolId/general
```

### Update Academic Settings
```
PUT /settings/:schoolId/academic
```

### Update Admission Settings
```
PUT /settings/:schoolId/admission
```

### Update Fee Settings
```
PUT /settings/:schoolId/fees
```

### Update Notification Settings
```
PUT /settings/:schoolId/notification
```

### Update Security Settings
```
PUT /settings/:schoolId/security
```
**Role:** super_admin

### Update Backup Settings
```
PUT /settings/:schoolId/backup
```
**Role:** super_admin

### Update Customization
```
PUT /settings/:schoolId/customization
```

### Update Integrations
```
PUT /settings/:schoolId/integrations
```

---

## Real-time WebSocket Events

### Events Emitted by Client
- `user:authenticate` - User login for real-time updates
- `attendance:marked` - Mark attendance
- `marks:posted` - Post student marks
- `fee:paid` - Fee payment
- `homework:assigned` - Assign homework
- `exam:scheduled` - Schedule exam
- `transport:location:update` - Update vehicle GPS location
- `hostel:complaint:registered` - Register complaint
- `admission:submitted` - Submit admission application
- `library:book:borrowed` - Borrow book

### Events Received by Client
- `attendance:updated` - Attendance marked
- `marks:updated` - Marks posted
- `fee:received` - Fee received
- `fee:pending` - Fee reminder
- `homework:new` - New homework assigned
- `exam:new` - Exam scheduled
- `transport:tracking` - Vehicle location update
- `complaint:new` - New complaint
- `admission:new` - New admission application
- `library:borrowed` - Book borrowed
- `notification:received` - Generic notification
- `user:connected` - User connected
- `user:disconnected` - User disconnected

---

## Error Handling

All errors return the following format:
```json
{
  "message": "Error description",
  "status": 400
}
```

### Common HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Installation & Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_SERVICE=gmail
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Role-Based Access Control (RBAC)

### Available Roles
- super_admin - Full system access
- principal - School administration
- admin - Administrative staff
- teacher - Teaching staff
- student - Student user
- parent - Parent user
- accountant_admin - Financial management
- librarian - Library management
- transport_coordinator - Transport management
- hostel_warden - Hostel management
- staff - Support staff

---

## Features

✅ Multi-school management
✅ Real-time updates via WebSocket
✅ Comprehensive admission system
✅ Employee payroll management
✅ Library book management with borrowing system
✅ GPS tracking for transport
✅ Hostel room allocation and complaint management
✅ Advanced reporting (Attendance, Academic, Financial, Performance)
✅ System settings and customization
✅ Email notifications
✅ Role-based access control
✅ Secure JWT authentication

---

## License
ISC
