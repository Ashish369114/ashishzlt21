# 🌿 Branch: `ashishzlt`
**Author:** Ashish Kumar Kasani  
**Stack:** MERN (MongoDB · Express · React · Node.js)  
**Based on:** `school-operating-system` repository  

---

## 📋 What This Branch Contains

This branch implements the **Principal** and **Accountant** role dashboards for the School Operating System. All features are fully functional and connected to the backend REST API.

---

## 🔐 Role-Based Access Control (RBAC)

Each role has its own dedicated dashboard. Access is strictly separated:

| Role | Dashboard | Access |
|---|---|---|
| `super_admin` | Super Admin Dashboard | School management, users, academics |
| `principal` | Principal Dashboard | Payroll, concessions, fee overview, pending fees (notices/TC), leave approvals |
| `accountant_admin` | Accountant Dashboard | Collections, payments, pending fees (pay), reports, expenses, concessions log |
| `teacher` | Teacher Dashboard | _(ready for colleague to implement)_ |
| `student` | Student Dashboard | _(ready for colleague to implement)_ |
| `parent` | Parent Dashboard | _(ready for colleague to implement)_ |

---

## ✅ Features Implemented (Principal Dashboard)

### 💰 Fee Management
- View all pending fees with student details, due date, balance
- Send **Notice** to defaulting students
- Set **Payment Deadline**
- Issue **TC / Deport** action for severe cases

### 👨‍🏫 Teacher Payroll Management (`/dashboard/payroll`)
- View all teachers with designation, experience, qualifications, performance
- Set / update individual salaries
- Auto-suggest salary based on experience + performance
- Summary cards: Total Payroll, Average Salary, Highest Salary, Teacher Count
- Sort by: Experience, Salary, Name
- **Salary is PRIVATE — only Principal can view and edit**

### 🎁 Concession Management (`/dashboard/concessions`)
- Grant fee concessions directly to students (no approval flow)
- Concession is **auto-applied** to the fee record immediately
- Reason field for every concession
- Full concession log with original fee, concession amount, new fee

### 📊 Finance Report
- Overview of total fees, pending, collected
- Monthly revenue breakdown

### 🗓️ Attendance & Leaves
- View student/teacher attendance
- Approve / reject teacher leave requests

### 📋 Exam Management
- Manage school exams and timetable

---

## ✅ Features Implemented (Accountant Dashboard)

### 💰 Collections Center (`/dashboard/collections`)
- Real-time pending fee collections
- Today's collection, monthly revenue, pending fees count, total collected
- Inline payment collection per student

### ⏳ Pending Fees (`/dashboard/pending`)
- Full list of pending fee records
- **Pay button** opens a professional payment modal supporting:
  - 💵 Cash (Receipt No. + Counter)
  - 📱 PhonePe / UPI (Transaction ID)
  - 💳 Credit / Debit Card (Name + Last 4 digits)
  - 🏦 Cheque (Cheque No. + Bank + Date)
  - 🌐 Net Banking / DD (Reference No.)

### 💳 Payment History (`/dashboard/payments`)
- Full history of all payments made
- Filter by method, date, student

### 📊 Reports (`/dashboard/reports`)
- Total fees, pending, paid, expenses, net income, today's collection
- Recent collections table

### 📉 Expenses (`/dashboard/expenses`)
- Add and track school expenses by category

### 🎁 Concession Log (`/dashboard/concessions`)
- **Read-only** view of all concessions granted by Principal
- Shows: Student, Fee record, Original fee, Concession amount, New fee, Reason, Status

### 👨‍🏫 Teachers View (`/dashboard/teachers`)
- View teacher list: Name, Employee ID, Contact, Bio, Designation, Classes, Subjects, Status
- **Salary column is hidden** (Principal-only)

---

## 🔲 Left for Colleague (No Conflicts Guaranteed)

The following dashboards have routing slots ready in `App.js` and stub files in place. Your colleague can implement these without any merge conflict:

| File | Role |
|---|---|
| `frontend/src/pages/dashboards/TeacherDashboard.js` | Teacher portal |
| `frontend/src/pages/dashboards/StudentDashboard.js` | Student portal |
| `frontend/src/pages/dashboards/ParentDashboard.js` | Parent portal |

**Routing is already set in `App.js`:**
```js
// teacher → TeacherDashboard  ← colleague fills this
// student → StudentDashboard  ← colleague fills this
// parent  → ParentDashboard   ← colleague fills this
```

---

## 🗂️ Project Structure

```
ashishzlt/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Business logic
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Auth + role middleware
│   ├── seeds/                # DB seed data (150 students, 10 teachers, etc.)
│   └── server.js             # Entry point (port 5000)
│
├── frontend/                 # React app (CRA)
│   └── src/
│       ├── App.js            # Role-based routing ← DO NOT CONFLICT
│       ├── services/api.js   # All API calls
│       ├── pages/
│       │   ├── dashboards/   # One file per role
│       │   └── components/   # Reusable page components
│       └── styles/           # Global CSS
│
└── BRANCH_INFO.md            # This file
```

---

## 🚀 How to Run

```bash
# 1. Clone the branch
git clone -b ashishzlt https://github.com/nizamsk963/school-operating-system.git
cd school-operating-system

# 2. Start Backend (port 5000)
cd backend
npm install
node server.js

# 3. Start Frontend (port 3000)
cd ../frontend
npm install
npm start
```

---

## 🔗 API Base URL
```
http://localhost:5000/api
```

---

## 📌 Key Notes for Colleague

1. **Do NOT modify `App.js` routing for principal/accountant roles** — it will cause conflicts
2. **Add your dashboard components** in `frontend/src/pages/dashboards/`
3. **Add your API calls** in `frontend/src/services/api.js` — append at the bottom
4. **Backend routes** are in `backend/routes/` — add new files and register in `server.js`
5. **Salary data is private** — never expose `teacher.salary` in student/parent/teacher views

---

*Branch maintained by: Ashish Kumar Kasani*
