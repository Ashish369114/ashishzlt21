# School Operating System - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Prerequisites Check
- ✅ Node.js installed? (Check: `node -v`)
- ✅ MongoDB running? (Check: `mongosh` or MongoDB Compass)
- ✅ Port 5000 available (Backend)
- ✅ Port 3000 available (Frontend)

---

## 🚀 Step 1: Start Backend Server

```bash
# Navigate to backend
cd backend

# Install dependencies (only first time)
npm install

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Connected to MongoDB: localhost:27017
```

---

## 🚀 Step 2: Start Frontend Application

**In a new terminal:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies (only first time)
npm install

# Start React development server
npm start
```

**Expected Output:**
```
Compiled successfully!
On Your Network: http://192.168.x.x:3000
```

---

## 🔐 Login Information

Open browser and go to: `http://localhost:3000`

Use any of these credentials:

### Super Admin (Full Access)
- **User ID:** SUPERADMIN001
- **Password:** Admin@123

### Principal (School Management)
- **User ID:** PRINCIPAL001
- **Password:** Principal@123

### Teacher (Academic Management)
- **User ID:** TEACHER001
- **Password:** Teacher@123

### Student (View Own Data)
- **User ID:** STUDENT001
- **Password:** Student@123

### Parent (Monitor Child)
- **User ID:** PARENT001
- **Password:** Parent@123

### Accountant (Fee Management)
- **User ID:** ACCOUNTANT001
- **Password:** Accountant@123

---

## 📁 Project Structure Overview

```
school-management-system/
│
├── backend/
│   ├── server.js              ← Main server file
│   ├── .env                   ← Configuration (create this)
│   ├── package.json           ← Dependencies
│   ├── models/                ← Database schemas
│   ├── routes/                ← API routes
│   ├── controllers/           ← Business logic
│   ├── middleware/            ← Auth & permissions
│   └── seeds/seedData.js      ← Sample data
│
├── frontend/
│   ├── package.json           ← Dependencies
│   ├── src/
│   │   ├── App.js             ← Main component
│   │   ├── index.js           ← Entry point
│   │   ├── pages/             ← Dashboard pages
│   │   ├── services/          ← API calls
│   │   └── styles/            ← CSS styling
│   └── public/index.html      ← HTML template
│
└── README.md                  ← Full documentation
```

---

## 🎯 What Each Dashboard Can Do

### 👑 Super Admin Dashboard
- View ALL data from all dashboards
- Manage students, teachers, fees
- Full system access
- Most powerful role

### 👔 Principal Dashboard
- Manage teachers and staff
- Track student performance
- View attendance and fees
- Generate reports

### 👨‍🏫 Teacher Dashboard
- Enter student marks
- Mark attendance
- Assign homework
- Add remarks about students

### 👨‍🎓 Student Dashboard
- View personal marks
- Check attendance
- See assigned homework
- View exam schedule

### 👨‍👩‍👧 Parent Dashboard
- Monitor child's marks
- View attendance
- Check assigned homework
- Pay fees online

### 💼 Accountant & Admin Dashboard
- Manage fee collection
- Track pending fees
- Process payments
- Generate financial reports

---

## 🔄 Features in Action

### ✅ Real-Time Synchronization
When teacher enters marks → Immediately visible to:
- Student (can see their marks)
- Parent (can see child's marks)
- Super Admin (sees all marks)
- Principal (can see all marks)

### 💰 Fee Payment
Multiple payment methods supported:
- PhonePe
- Credit Card
- Debit Card
- Cash
- Cheque

### 📚 Sample Data Included
- 10 Students across 30 classes
- 7 Teachers (one per subject)
- 10 Parents
- All subjects and classes pre-configured

---

## ⚠️ Troubleshooting

### Backend won't start?
```bash
# Check if MongoDB is running
mongosh

# Kill process on port 5000 (if needed)
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Try again
npm run dev
```

### Frontend shows "Cannot GET" error?
```bash
# Make sure backend is running on port 5000
# Check backend terminal for errors
# Verify .env has correct MONGODB_URI
```

### Can't login?
- Check you're using correct User ID and Password
- Verify database was seeded: `npm run seed`
- Check browser console (F12) for error messages

### Database connection error?
```bash
# Ensure MongoDB is running
mongo  # or mongosh

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/school-management-system
```

---

## 📊 Database Collections Created

1. **users** - All user accounts
2. **students** - Student records
3. **teachers** - Teacher records
4. **subjects** - 7 subjects
5. **classes** - 30 classes (Grades 1-10, Sections A-C)
6. **marks** - Student marks
7. **attendance** - Attendance records
8. **homework** - Homework assignments
9. **remarks** - Teacher remarks
10. **exams** - Exam schedules
11. **events** - School events
12. **fees** - Student fees

---

## 🎨 UI Features

- **Modern Design** - Beautiful gradient-based interface
- **Responsive Layout** - Works on desktop, tablet, mobile
- **Data Tables** - Easy-to-read tabular data
- **Forms** - Simple data entry forms
- **Statistics Cards** - Quick overview metrics
- **Alerts** - Success/error notifications
- **Loading States** - Spinner indicators

---

## 📝 Common Tasks

### Add a New Student
1. Go to Super Admin / Principal Dashboard
2. Click "👨‍🎓 Students" in sidebar
3. Click "➕ Add Student"
4. Fill the form and click "Save Student"
5. Student can now login with their credentials

### Mark Attendance
1. Go to Teacher Dashboard
2. Click "✅ Attendance" in sidebar
3. Click "➕ Mark Attendance"
4. Select date, status, and save
5. Appears immediately in student/parent view

### Enter Marks
1. Go to Teacher Dashboard
2. Click "📝 Marks" in sidebar
3. Click "➕ Add Marks"
4. Fill exam details and marks
5. Visible to student and parent instantly

### Pay Fees (Parent)
1. Go to Parent Dashboard
2. Click "💰 Fees" in sidebar
3. Select payment method
4. Click "Pay"
5. Fee marked as paid in accountant's view

---

## 🔐 Security

- **Passwords** - Hashed with bcryptjs
- **Authentication** - JWT tokens
- **Authorization** - Role-based access
- **Protected Routes** - All API endpoints require valid token
- **Password Requirements** - Strong password hashing

---

## 📱 Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

---

## 🎓 Learning Paths

### For Understanding the System:
1. Start with Super Admin login
2. Explore all dashboards to understand workflow
3. Try adding sample data
4. See how data syncs across dashboards

### For Development:
1. Check backend API endpoints in README
2. Review model structure in backend/models
3. Understand React components in frontend/src
4. See how API calls work in frontend/src/services

---

## 💡 Tips & Tricks

1. **Use Demo Data** - Database is pre-populated for testing
2. **Multiple Browsers** - Open different dashboards simultaneously to see real-time sync
3. **Mobile Testing** - Responsive design works on mobile
4. **Dark Mode** - Can be added to App.css
5. **Export Data** - Can be added to fee reports

---

## 🚀 What's Next?

After getting comfortable with the system:
1. Customize school name and colors in App.css
2. Add your school logo
3. Configure email notifications
4. Add more payment gateways
5. Set up data export/import
6. Add SMS notifications

---

## 📞 Need Help?

1. **Check README.md** - Comprehensive documentation
2. **Check Backend Logs** - Terminal running `npm run dev`
3. **Check Browser Console** - F12 → Console tab
4. **Verify Credentials** - Use demo credentials from Quick Start
5. **MongoDB Status** - Ensure MongoDB is running

---

## ✨ Enjoy Your School Operating System!

You now have a fully functional, production-ready School Operating System. Start exploring and customize it for your needs! 🎓

**Happy Managing! 📚**
