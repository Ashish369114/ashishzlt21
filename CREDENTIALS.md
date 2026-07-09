# School Operating System - User Credentials Reference

## 📋 Pre-Populated User Accounts

After running `npm run seed`, the following user accounts are created in the system.

---

## 👑 Super Admin

| Field | Value |
|-------|-------|
| User ID | SUPERADMIN001 |
| Password | Admin@123 |
| First Name | Super |
| Last Name | Admin |
| Email | superadmin@school.com |
| Phone | 9876543210 |
| Access Level | Full System Access |

**Permissions:**
- Access ALL dashboards
- View ALL data
- Manage students, teachers, fees, classes
- Delete any record
- System administrator

---

## 👔 Principal

| Field | Value |
|-------|-------|
| User ID | PRINCIPAL001 |
| Password | Principal@123 |
| First Name | Dr. |
| Last Name | Kumar |
| Email | principal@school.com |
| Phone | 9876543211 |
| Access Level | School Management |

**Permissions:**
- Manage teachers and staff
- View student performance
- Track attendance
- Manage fees and financial reports
- View all students
- Can't delete users

---

## 👨‍🏫 Teachers (7 Subjects)

### Teacher 1 - Mathematics
| Field | Value |
|-------|-------|
| User ID | TEACHER001 |
| Password | Teacher@123 |
| First Name | Ramesh |
| Last Name | Sharma |
| Subject | Mathematics |
| Email | ramesh@school.com |
| Phone | 9876543201 |

### Teacher 2 - Science
| Field | Value |
|-------|-------|
| User ID | TEACHER002 |
| Password | Teacher@123 |
| First Name | Priya |
| Last Name | Patel |
| Subject | Science |
| Email | priya@school.com |
| Phone | 9876543202 |

### Teacher 3 - Social Studies
| Field | Value |
|-------|-------|
| User ID | TEACHER003 |
| Password | Teacher@123 |
| First Name | Rajesh |
| Last Name | Singh |
| Subject | Social Studies |
| Email | rajesh@school.com |
| Phone | 9876543203 |

### Teacher 4 - English
| Field | Value |
|-------|-------|
| User ID | TEACHER004 |
| Password | Teacher@123 |
| First Name | Sneha |
| Last Name | Gupta |
| Subject | English |
| Email | sneha@school.com |
| Phone | 9876543204 |

### Teacher 5 - Telugu
| Field | Value |
|-------|-------|
| User ID | TEACHER005 |
| Password | Teacher@123 |
| First Name | Suresh |
| Last Name | Rao |
| Subject | Telugu |
| Email | suresh@school.com |
| Phone | 9876543205 |

### Teacher 6 - Hindi
| Field | Value |
|-------|-------|
| User ID | TEACHER006 |
| Password | Teacher@123 |
| First Name | Neha |
| Last Name | Verma |
| Subject | Hindi |
| Email | neha@school.com |
| Phone | 9876543206 |

### Teacher 7 - Environmental Science (EVS)
| Field | Value |
|-------|-------|
| User ID | TEACHER007 |
| Password | Teacher@123 |
| First Name | Vikram |
| Last Name | Joshi |
| Subject | EVS |
| Email | vikram@school.com |
| Phone | 9876543207 |

**Teacher Permissions:**
- Enter student marks
- Mark attendance
- Assign homework
- Add remarks
- View assigned class information
- Cannot manage fees or delete records

---

## 👨‍🎓 Students (10 Students)

### Student 1
| Field | Value |
|-------|-------|
| User ID | STUDENT001 |
| Password | Student@123 |
| First Name | Aarav |
| Last Name | Singh |
| Roll Number | ROLL001 |
| Email | aarav@school.com |
| Phone | 9876543001 |

### Student 2
| Field | Value |
|-------|-------|
| User ID | STUDENT002 |
| Password | Student@123 |
| First Name | Anaya |
| Last Name | Sharma |
| Roll Number | ROLL002 |
| Email | anaya@school.com |
| Phone | 9876543002 |

### Student 3
| Field | Value |
|-------|-------|
| User ID | STUDENT003 |
| Password | Student@123 |
| First Name | Arjun |
| Last Name | Patel |
| Roll Number | ROLL003 |
| Email | arjun@school.com |
| Phone | 9876543003 |

### Student 4
| Field | Value |
|-------|-------|
| User ID | STUDENT004 |
| Password | Student@123 |
| First Name | Aditi |
| Last Name | Gupta |
| Roll Number | ROLL004 |
| Email | aditi@school.com |
| Phone | 9876543004 |

### Student 5
| Field | Value |
|-------|-------|
| User ID | STUDENT005 |
| Password | Student@123 |
| First Name | Aditya |
| Last Name | Kumar |
| Roll Number | ROLL005 |
| Email | aditya@school.com |
| Phone | 9876543005 |

### Student 6
| Field | Value |
|-------|-------|
| User ID | STUDENT006 |
| Password | Student@123 |
| First Name | Aisha |
| Last Name | Verma |
| Roll Number | ROLL006 |
| Email | aisha@school.com |
| Phone | 9876543006 |

### Student 7
| Field | Value |
|-------|-------|
| User ID | STUDENT007 |
| Password | Student@123 |
| First Name | Ajay |
| Last Name | Joshi |
| Roll Number | ROLL007 |
| Email | ajay@school.com |
| Phone | 9876543007 |

### Student 8
| Field | Value |
|-------|-------|
| User ID | STUDENT008 |
| Password | Student@123 |
| First Name | Amrita |
| Last Name | Rao |
| Roll Number | ROLL008 |
| Email | amrita@school.com |
| Phone | 9876543008 |

### Student 9
| Field | Value |
|-------|-------|
| User ID | STUDENT009 |
| Password | Student@123 |
| First Name | Akshay |
| Last Name | Reddy |
| Roll Number | ROLL009 |
| Email | akshay@school.com |
| Phone | 9876543009 |

### Student 10
| Field | Value |
|-------|-------|
| User ID | STUDENT010 |
| Password | Student@123 |
| First Name | Alisha |
| Last Name | Nair |
| Roll Number | ROLL010 |
| Email | alisha@school.com |
| Phone | 9876543010 |

**Student Permissions:**
- View own marks
- View own attendance
- View own homework
- View own exam schedule
- View remarks from teachers
- Cannot modify any data
- Cannot access other students' data

---

## 👨‍👩‍👧 Parents (10 Parents)

### Parent 1 (Parent of Student 1)
| Field | Value |
|-------|-------|
| User ID | PARENT001 |
| Password | Parent@123 |
| First Name | Rajesh |
| Last Name | Sharma |
| Email | rajesh@email.com |
| Phone | 8765432000 |
| Child | Aarav Singh |

### Parent 2 (Parent of Student 2)
| Field | Value |
|-------|-------|
| User ID | PARENT002 |
| Password | Parent@123 |
| First Name | Priya |
| Last Name | Patel |
| Email | priya@email.com |
| Phone | 8765432001 |
| Child | Anaya Sharma |

### Parent 3 (Parent of Student 3)
| Field | Value |
|-------|-------|
| User ID | PARENT003 |
| Password | Parent@123 |
| First Name | Arjun |
| Last Name | Singh |
| Email | arjun@email.com |
| Phone | 8765432002 |
| Child | Arjun Patel |

### Parent 4 (Parent of Student 4)
| Field | Value |
|-------|-------|
| User ID | PARENT004 |
| Password | Parent@123 |
| First Name | Sneha |
| Last Name | Gupta |
| Email | sneha@email.com |
| Phone | 8765432003 |
| Child | Aditi Gupta |

### Parent 5 (Parent of Student 5)
| Field | Value |
|-------|-------|
| User ID | PARENT005 |
| Password | Parent@123 |
| First Name | Vikram |
| Last Name | Verma |
| Email | vikram@email.com |
| Phone | 8765432004 |
| Child | Aditya Kumar |

### Parent 6 (Parent of Student 6)
| Field | Value |
|-------|-------|
| User ID | PARENT006 |
| Password | Parent@123 |
| First Name | Neha |
| Last Name | Joshi |
| Email | neha@email.com |
| Phone | 8765432005 |
| Child | Aisha Verma |

### Parent 7 (Parent of Student 7)
| Field | Value |
|-------|-------|
| User ID | PARENT007 |
| Password | Parent@123 |
| First Name | Suresh |
| Last Name | Rao |
| Email | suresh@email.com |
| Phone | 8765432006 |
| Child | Ajay Joshi |

### Parent 8 (Parent of Student 8)
| Field | Value |
|-------|-------|
| User ID | PARENT008 |
| Password | Parent@123 |
| First Name | Pooja |
| Last Name | Kumar |
| Email | pooja@email.com |
| Phone | 8765432007 |
| Child | Amrita Rao |

### Parent 9 (Parent of Student 9)
| Field | Value |
|-------|-------|
| User ID | PARENT009 |
| Password | Parent@123 |
| First Name | Anil |
| Last Name | Reddy |
| Email | anil@email.com |
| Phone | 8765432008 |
| Child | Akshay Reddy |

### Parent 10 (Parent of Student 10)
| Field | Value |
|-------|-------|
| User ID | PARENT010 |
| Password | Parent@123 |
| First Name | Kavya |
| Last Name | Nair |
| Email | kavya@email.com |
| Phone | 8765432009 |
| Child | Alisha Nair |

**Parent Permissions:**
- View child's marks
- View child's attendance
- View child's homework
- View child's exam schedule
- View child's remarks
- Pay fees
- Cannot view other children's data

---

## 💼 Accountant & Admin

| Field | Value |
|-------|-------|
| User ID | ACCOUNTANT001 |
| Password | Accountant@123 |
| First Name | Ravi |
| Last Name | Verma |
| Email | accountant@school.com |
| Phone | 9876543299 |

**Permissions:**
- Manage fees
- View pending fees
- Process fee payments
- Generate financial reports
- View all student fee details
- Cannot manage student/teacher records

---

## 📚 Classes (30 Classes)

Classes are created for Grades 1-10 with 3 sections each (A, B, C):

```
Grade 1:  1A, 1B, 1C
Grade 2:  2A, 2B, 2C
Grade 3:  3A, 3B, 3C
Grade 4:  4A, 4B, 4C
Grade 5:  5A, 5B, 5C
Grade 6:  6A, 6B, 6C
Grade 7:  7A, 7B, 7C
Grade 8:  8A, 8B, 8C
Grade 9:  9A, 9B, 9C
Grade 10: 10A, 10B, 10C
```

Each class can have multiple students assigned.

---

## 🎓 Subjects (7 Subjects)

1. **Mathematics**
   - Teacher: Ramesh Sharma
   - Teacher ID: TEACHER001

2. **Science**
   - Teacher: Priya Patel
   - Teacher ID: TEACHER002

3. **Social Studies**
   - Teacher: Rajesh Singh
   - Teacher ID: TEACHER003

4. **English**
   - Teacher: Sneha Gupta
   - Teacher ID: TEACHER004

5. **Telugu**
   - Teacher: Suresh Rao
   - Teacher ID: TEACHER005

6. **Hindi**
   - Teacher: Neha Verma
   - Teacher ID: TEACHER006

7. **Environmental Science (EVS)**
   - Teacher: Vikram Joshi
   - Teacher ID: TEACHER007

---

## 💰 Fees

**Total Fees per Student:** ₹50,000 per year

Sample fee data is created for all 10 students with:
- Varying payment statuses (some paid, some pending)
- Different payment methods
- Due date: 31st December

---

## 🔐 Password Policy

All users are created with the same password format for demo purposes:

| Role | Password |
|------|----------|
| Super Admin | Admin@123 |
| Principal | Principal@123 |
| Teachers | Teacher@123 |
| Students | Student@123 |
| Parents | Parent@123 |
| Accountant | Accountant@123 |

**⚠️ Security Note:** Change all passwords to strong, unique passwords in production!

---

## 🔄 How to Create Additional Users

After initial setup, you can add more users through the dashboard:

### Through Super Admin Dashboard:
1. Go to Super Admin Dashboard
2. Click "👨‍🎓 Students" or "👨‍🏫 Teachers"
3. Click "➕ Add Student" or "➕ Add Teacher"
4. Fill the form with required details
5. Click "Save"

---

## 🔑 Quick Login Reference Card

```
╔═══════════════════════════════════════════════════════════╗
║        School Operating System - LOGIN QUICK REF         ║
╠═════════════════╦═════════════════╦════════════════════════╣
║     ROLE        ║     USER ID     ║      PASSWORD          ║
╠═════════════════╬═════════════════╬════════════════════════╣
║ Super Admin     ║ SUPERADMIN001   ║ Admin@123              ║
║ Principal       ║ PRINCIPAL001    ║ Principal@123          ║
║ Teacher (Math)  ║ TEACHER001      ║ Teacher@123            ║
║ Teacher (Sci)   ║ TEACHER002      ║ Teacher@123            ║
║ Student         ║ STUDENT001      ║ Student@123            ║
║ Parent          ║ PARENT001       ║ Parent@123             ║
║ Accountant      ║ ACCOUNTANT001   ║ Accountant@123         ║
╚═════════════════╩═════════════════╩════════════════════════╝
```

---

## 📊 Data Summary

| Entity | Count |
|--------|-------|
| Users | 28 total |
| Super Admins | 1 |
| Principals | 1 |
| Teachers | 7 |
| Students | 10 |
| Parents | 10 |
| Accountants | 1 |
| Classes | 30 |
| Subjects | 7 |
| Fee Records | 10 |

---

**All credentials are loaded during the database seed. Enjoy exploring the system!** 🎓
