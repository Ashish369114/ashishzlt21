export const demoStudents = [
  {
    _id: 'std_1',
    studentId: 'STD-1001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    userId: { _id: 'u_1', firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@example.com' },
    class: { _id: 'cls_1', grade: '10', section: 'A' },
    grade: '10',
    section: 'A',
    rollNumber: '1001',
    gender: 'Male',
    dob: '2010-05-14',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    parentName: 'Rajesh Sharma',
    parentPhone: '9876543211',
    parent: { firstName: 'Rajesh', lastName: 'Sharma', phone: '9876543211' },
    status: 'Active'
  },
  {
    _id: 'std_2',
    studentId: 'STD-1002',
    firstName: 'Ananya',
    lastName: 'Verma',
    userId: { _id: 'u_2', firstName: 'Ananya', lastName: 'Verma', email: 'ananya.v@example.com' },
    class: { _id: 'cls_1', grade: '10', section: 'A' },
    grade: '10',
    section: 'A',
    rollNumber: '1002',
    gender: 'Female',
    dob: '2010-08-22',
    email: 'ananya.v@example.com',
    phone: '9876543212',
    parentName: 'Suresh Verma',
    parentPhone: '9876543213',
    parent: { firstName: 'Suresh', lastName: 'Verma', phone: '9876543213' },
    status: 'Active'
  },
  {
    _id: 'std_3',
    studentId: 'STD-1003',
    firstName: 'Rohan',
    lastName: 'Gupta',
    userId: { _id: 'u_3', firstName: 'Rohan', lastName: 'Gupta', email: 'rohan.g@example.com' },
    class: { _id: 'cls_2', grade: '10', section: 'B' },
    grade: '10',
    section: 'B',
    rollNumber: '1003',
    gender: 'Male',
    dob: '2010-02-11',
    email: 'rohan.g@example.com',
    phone: '9876543214',
    parentName: 'Amit Gupta',
    parentPhone: '9876543215',
    parent: { firstName: 'Amit', lastName: 'Gupta', phone: '9876543215' },
    status: 'Active'
  },
  {
    _id: 'std_4',
    studentId: 'STD-1004',
    firstName: 'Priya',
    lastName: 'Singh',
    userId: { _id: 'u_4', firstName: 'Priya', lastName: 'Singh', email: 'priya.s@example.com' },
    class: { _id: 'cls_3', grade: '9', section: 'A' },
    grade: '9',
    section: 'A',
    rollNumber: '9001',
    gender: 'Female',
    dob: '2011-11-05',
    email: 'priya.s@example.com',
    phone: '9876543216',
    parentName: 'Vikram Singh',
    parentPhone: '9876543217',
    parent: { firstName: 'Vikram', lastName: 'Singh', phone: '9876543217' },
    status: 'Active'
  },
  {
    _id: 'std_5',
    studentId: 'STD-1005',
    firstName: 'Kabir',
    lastName: 'Patel',
    userId: { _id: 'u_5', firstName: 'Kabir', lastName: 'Patel', email: 'kabir.p@example.com' },
    class: { _id: 'cls_4', grade: '9', section: 'B' },
    grade: '9',
    section: 'B',
    rollNumber: '9002',
    gender: 'Male',
    dob: '2011-04-19',
    email: 'kabir.p@example.com',
    phone: '9876543218',
    parentName: 'Dinesh Patel',
    parentPhone: '9876543219',
    parent: { firstName: 'Dinesh', lastName: 'Patel', phone: '9876543219' },
    status: 'Active'
  },
];

export const demoExams = [
  { _id: 'ex_1', name: 'Mid-Term Examination 2026', examName: 'Mid-Term Examination 2026', examType: 'Mid-Term', grade: '10', section: 'A', class: { grade: '10', section: 'A' }, subject: 'Mathematics', examDate: '2026-08-10', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 35, roomNo: 'Room 101' },
  { _id: 'ex_2', name: 'Mid-Term Examination 2026', examName: 'Mid-Term Examination 2026', examType: 'Mid-Term', grade: '10', section: 'A', class: { grade: '10', section: 'A' }, subject: 'Science', examDate: '2026-08-12', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 35, roomNo: 'Room 102' },
  { _id: 'ex_3', name: 'Unit Test 1', examName: 'Unit Test 1', examType: 'Unit Test', grade: '9', section: 'A', class: { grade: '9', section: 'A' }, subject: 'English', examDate: '2026-08-15', startTime: '10:00 AM', endTime: '11:30 AM', totalMarks: 50, passingMarks: 18, roomNo: 'Room 204' },
  { _id: 'ex_4', name: 'Annual Final Examination', examName: 'Annual Final Examination', examType: 'Final Exam', grade: '10', section: 'B', class: { grade: '10', section: 'B' }, subject: 'Social Science', examDate: '2026-09-01', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 100, passingMarks: 35, roomNo: 'Auditorium A' },
];

export const demoAttendance = [
  { _id: 'att_1', studentId: 'std_1', studentName: 'Aarav Sharma', student: { userId: { firstName: 'Aarav', lastName: 'Sharma' } }, class: { grade: '10', section: 'A' }, grade: '10', section: 'A', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: 'On time' },
  { _id: 'att_2', studentId: 'std_2', studentName: 'Ananya Verma', student: { userId: { firstName: 'Ananya', lastName: 'Verma' } }, class: { grade: '10', section: 'A' }, grade: '10', section: 'A', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: 'On time' },
  { _id: 'att_3', studentId: 'std_3', studentName: 'Rohan Gupta', student: { userId: { firstName: 'Rohan', lastName: 'Gupta' } }, class: { grade: '10', section: 'B' }, grade: '10', section: 'B', date: new Date().toISOString().split('T')[0], status: 'Absent', remarks: 'Sick leave' },
  { _id: 'att_4', studentId: 'std_4', studentName: 'Priya Singh', student: { userId: { firstName: 'Priya', lastName: 'Singh' } }, class: { grade: '9', section: 'A' }, grade: '9', section: 'A', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: 'On time' },
  { _id: 'att_5', studentId: 'std_5', studentName: 'Kabir Patel', student: { userId: { firstName: 'Kabir', lastName: 'Patel' } }, class: { grade: '9', section: 'B' }, grade: '9', section: 'B', date: new Date().toISOString().split('T')[0], status: 'Late', remarks: '15 mins late' },
];

export const demoClasses = [
  { _id: 'cls_1', grade: '10', section: 'A', className: '10-A', roomNumber: '101', classTeacher: 'Mr. Rajesh Kumar' },
  { _id: 'cls_2', grade: '10', section: 'B', className: '10-B', roomNumber: '102', classTeacher: 'Ms. Sunita Rao' },
  { _id: 'cls_3', grade: '9', section: 'A', className: '9-A', roomNumber: '201', classTeacher: 'Mr. Anil Mehta' },
  { _id: 'cls_4', grade: '9', section: 'B', className: '9-B', roomNumber: '202', classTeacher: 'Ms. Pooja Sharma' },
];

export const demoEmployees = [
  { _id: 'emp_1', employeeId: 'EMP-101', firstName: 'Rajesh', lastName: 'Kumar', designation: 'Senior Math Teacher', department: 'Academics', email: 'rajesh.k@school.com', phone: '9876500001', salary: 55000, status: 'Active' },
  { _id: 'emp_2', employeeId: 'EMP-102', firstName: 'Sunita', lastName: 'Rao', designation: 'Physics HOD', department: 'Academics', email: 'sunita.r@school.com', phone: '9876500002', salary: 62000, status: 'Active' },
  { _id: 'emp_3', employeeId: 'EMP-103', firstName: 'Anil', lastName: 'Mehta', designation: 'English Teacher', department: 'Academics', email: 'anil.m@school.com', phone: '9876500003', salary: 48000, status: 'Active' },
];

export const demoFees = [
  { _id: 'fee_1', studentId: 'std_1', studentName: 'Aarav Sharma', grade: '10', section: 'A', totalFee: 45000, paidFee: 45000, dueFee: 0, status: 'Paid', dueDate: '2026-07-15' },
  { _id: 'fee_2', studentId: 'std_2', studentName: 'Ananya Verma', grade: '10', section: 'A', totalFee: 45000, paidFee: 30000, dueFee: 15000, status: 'Partial', dueDate: '2026-08-01' },
  { _id: 'fee_3', studentId: 'std_3', studentName: 'Rohan Gupta', grade: '10', section: 'B', totalFee: 45000, paidFee: 0, dueFee: 45000, status: 'Pending', dueDate: '2026-07-30' },
];
