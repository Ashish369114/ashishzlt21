// Generate Grades 1 to 10 classes (Section A and B)
export const demoClasses = Array.from({ length: 10 }, (_, i) => {
  const gradeNum = String(i + 1);
  return [
    { _id: `cls_${gradeNum}_a`, grade: gradeNum, section: 'A', className: `${gradeNum}-A`, roomNumber: `${100 + i * 2 + 1}`, classTeacher: `Teacher Grade ${gradeNum}-A` },
    { _id: `cls_${gradeNum}_b`, grade: gradeNum, section: 'B', className: `${gradeNum}-B`, roomNumber: `${100 + i * 2 + 2}`, classTeacher: `Teacher Grade ${gradeNum}-B` }
  ];
}).flat();

// Generate students for all grades 1 to 10
const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Diya', 'Vihaan', 'Ishita', 'Arjun', 'Sanya', 'Aditya', 'Meera', 'Dev', 'Kavya', 'Vivaan', 'Anushka', 'Reyansh', 'Riya', 'Ayaan', 'Tara'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Joshi', 'Chawla', 'Mehta', 'Nair'];

export const demoStudents = Array.from({ length: 10 }, (_, i) => {
  const gradeNum = String(i + 1);
  const fn1 = firstNames[(i * 2) % firstNames.length];
  const ln1 = lastNames[(i * 2) % lastNames.length];
  const fn2 = firstNames[(i * 2 + 1) % firstNames.length];
  const ln2 = lastNames[(i * 2 + 1) % lastNames.length];
  const fn3 = firstNames[(i * 2 + 2) % firstNames.length];
  const ln3 = lastNames[(i * 2 + 3) % lastNames.length];

  return [
    {
      _id: `std_${gradeNum}_1`,
      studentId: `STD-${1000 + i * 10 + 1}`,
      firstName: fn1,
      lastName: ln1,
      userId: { _id: `u_${gradeNum}_1`, firstName: fn1, lastName: ln1, email: `${fn1.toLowerCase()}.${ln1.toLowerCase()}@example.com` },
      class: { _id: `cls_${gradeNum}_a`, grade: gradeNum, section: 'A' },
      grade: gradeNum,
      section: 'A',
      rollNumber: `${gradeNum}01`,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      dob: `201${Math.min(9, i)}-05-14`,
      email: `${fn1.toLowerCase()}.${ln1.toLowerCase()}@example.com`,
      phone: `987654320${i}`,
      parentName: `Parent of ${fn1}`,
      parentPhone: `987654321${i}`,
      parent: { firstName: 'Parent', lastName: ln1, phone: `987654321${i}` },
      status: 'Active'
    },
    {
      _id: `std_${gradeNum}_2`,
      studentId: `STD-${1000 + i * 10 + 2}`,
      firstName: fn2,
      lastName: ln2,
      userId: { _id: `u_${gradeNum}_2`, firstName: fn2, lastName: ln2, email: `${fn2.toLowerCase()}.${ln2.toLowerCase()}@example.com` },
      class: { _id: `cls_${gradeNum}_a`, grade: gradeNum, section: 'A' },
      grade: gradeNum,
      section: 'A',
      rollNumber: `${gradeNum}02`,
      gender: i % 2 === 1 ? 'Male' : 'Female',
      dob: `201${Math.min(9, i)}-08-22`,
      email: `${fn2.toLowerCase()}.${ln2.toLowerCase()}@example.com`,
      phone: `987654322${i}`,
      parentName: `Parent of ${fn2}`,
      parentPhone: `987654323${i}`,
      parent: { firstName: 'Parent', lastName: ln2, phone: `987654323${i}` },
      status: 'Active'
    },
    {
      _id: `std_${gradeNum}_3`,
      studentId: `STD-${1000 + i * 10 + 3}`,
      firstName: fn3,
      lastName: ln3,
      userId: { _id: `u_${gradeNum}_3`, firstName: fn3, lastName: ln3, email: `${fn3.toLowerCase()}.${ln3.toLowerCase()}@example.com` },
      class: { _id: `cls_${gradeNum}_b`, grade: gradeNum, section: 'B' },
      grade: gradeNum,
      section: 'B',
      rollNumber: `${gradeNum}03`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      dob: `201${Math.min(9, i)}-02-11`,
      email: `${fn3.toLowerCase()}.${ln3.toLowerCase()}@example.com`,
      phone: `987654324${i}`,
      parentName: `Parent of ${fn3}`,
      parentPhone: `987654325${i}`,
      parent: { firstName: 'Parent', lastName: ln3, phone: `987654325${i}` },
      status: 'Active'
    }
  ];
}).flat();

// Generate exams for all grades 1 to 10
export const demoExams = Array.from({ length: 10 }, (_, i) => {
  const gradeNum = String(i + 1);
  return [
    { _id: `ex_${gradeNum}_1`, name: 'Mid-Term Examination 2026', examName: 'Mid-Term Examination 2026', examType: 'Mid-Term', grade: gradeNum, section: 'A', class: { grade: gradeNum, section: 'A' }, subject: 'Mathematics', examDate: '2026-08-10', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 35, roomNo: `Room 10${i}` },
    { _id: `ex_${gradeNum}_2`, name: 'Mid-Term Examination 2026', examName: 'Mid-Term Examination 2026', examType: 'Mid-Term', grade: gradeNum, section: 'A', class: { grade: gradeNum, section: 'A' }, subject: 'Science', examDate: '2026-08-12', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 35, roomNo: `Room 10${i}` },
    { _id: `ex_${gradeNum}_3`, name: 'Unit Test 1', examName: 'Unit Test 1', examType: 'Unit Test', grade: gradeNum, section: 'B', class: { grade: gradeNum, section: 'B' }, subject: 'English', examDate: '2026-08-15', startTime: '10:00 AM', endTime: '11:30 AM', totalMarks: 50, passingMarks: 18, roomNo: `Room 20${i}` }
  ];
}).flat();

// Generate attendance for all grades 1 to 10
export const demoAttendance = demoStudents.map((s, idx) => ({
  _id: `att_${idx + 1}`,
  studentId: s._id,
  studentName: `${s.firstName} ${s.lastName}`,
  student: { userId: { firstName: s.firstName, lastName: s.lastName } },
  class: { grade: s.grade, section: s.section },
  grade: s.grade,
  section: s.section,
  date: new Date().toISOString().split('T')[0],
  status: idx % 4 === 0 ? 'Absent' : idx % 5 === 0 ? 'Late' : 'Present',
  remarks: idx % 4 === 0 ? 'Sick leave' : idx % 5 === 0 ? '10 mins late' : 'On time'
}));

// Employees
export const demoEmployees = [
  { _id: 'emp_1', employeeId: 'EMP-101', firstName: 'Rajesh', lastName: 'Kumar', designation: 'Senior Math Teacher', department: 'Academics', email: 'rajesh.k@school.com', phone: '9876500001', salary: 55000, status: 'Active' },
  { _id: 'emp_2', employeeId: 'EMP-102', firstName: 'Sunita', lastName: 'Rao', designation: 'Physics HOD', department: 'Academics', email: 'sunita.r@school.com', phone: '9876500002', salary: 62000, status: 'Active' },
  { _id: 'emp_3', employeeId: 'EMP-103', firstName: 'Anil', lastName: 'Mehta', designation: 'English Teacher', department: 'Academics', email: 'anil.m@school.com', phone: '9876500003', salary: 48000, status: 'Active' },
  { _id: 'emp_4', employeeId: 'EMP-104', firstName: 'Pooja', lastName: 'Sharma', designation: 'Primary Teacher', department: 'Academics', email: 'pooja.s@school.com', phone: '9876500004', salary: 42000, status: 'Active' },
  { _id: 'emp_5', employeeId: 'EMP-105', firstName: 'Vikram', lastName: 'Singh', designation: 'Science Teacher', department: 'Academics', email: 'vikram.s@school.com', phone: '9876500005', salary: 50000, status: 'Active' },
];

// Fees for all students
export const demoFees = demoStudents.map((s, idx) => ({
  _id: `fee_${idx + 1}`,
  studentId: s._id,
  studentName: `${s.firstName} ${s.lastName}`,
  student: s,
  grade: s.grade,
  section: s.section,
  totalFee: 45000,
  paidFee: idx % 3 === 0 ? 45000 : idx % 3 === 1 ? 30000 : 0,
  dueFee: idx % 3 === 0 ? 0 : idx % 3 === 1 ? 15000 : 45000,
  status: idx % 3 === 0 ? 'Paid' : idx % 3 === 1 ? 'Partial' : 'Pending',
  dueDate: '2026-08-15'
}));
