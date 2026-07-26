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

// Notices
export const demoNotices = [
  { _id: 'not_1', title: 'Independence Day Celebration 2026', content: 'All students and staff are invited to participate in the Independence Day flag hoisting ceremony at 8:00 AM in the main playground.', category: 'Event', targetAudience: 'All', priority: 'High', date: '2026-08-14', author: 'Principal' },
  { _id: 'not_2', title: 'Parent-Teacher Meeting (PTM)', content: 'The first term PTM is scheduled for Saturday, 20th August 2026 from 9:00 AM to 1:00 PM. Parents are requested to attend.', category: 'Notice', targetAudience: 'Parents', priority: 'High', date: '2026-08-10', author: 'Admin' },
  { _id: 'not_3', title: 'Science Exhibition Registration', content: 'Registrations are open for the Annual Science Fair 2026. Submit your project models to science teachers by 25th August.', category: 'Academics', targetAudience: 'Students', priority: 'Medium', date: '2026-08-05', author: 'Science HOD' }
];

// Meeting MOMs
export const demoMeetingMoms = [
  { _id: 'mom_1', title: 'Academic Planning & Curriculum Review', meetingDate: '2026-08-01', attendees: 'Principal, HODs, Coordinators', agenda: 'Curriculum coverage, unit tests schedule, and smart classroom usage.', keyDecisions: '1. Unit tests start from August 15th. 2. Extra classes for Grade 10 students.', status: 'Approved' },
  { _id: 'mom_2', title: 'Sports & Cultural Fest Committee Meeting', meetingDate: '2026-08-03', attendees: 'Sports Teacher, Cultural Coordinator, Principal', agenda: 'Venue arrangement, chief guest invitation, event budget.', keyDecisions: 'Budget approved for inter-house sports competitions.', status: 'Approved' }
];

// Marks for all students
export const demoMarks = demoStudents.map((s, idx) => ({
  _id: `mrk_${idx + 1}`,
  studentId: s._id,
  studentName: `${s.firstName} ${s.lastName}`,
  student: s,
  class: { grade: s.grade, section: s.section },
  grade: s.grade,
  section: s.section,
  examName: 'Mid-Term Examination 2026',
  subject: idx % 2 === 0 ? 'Mathematics' : 'Science',
  marksObtained: 75 + (idx % 20),
  totalMarks: 100,
  remarks: 'Good Performance'
}));

// Library Books
export const demoLibraryBooks = [
  { _id: 'bk_1', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', category: 'Science', isbn: '978-8177091877', availableCopies: 12, totalCopies: 15, location: 'Shelf A-4' },
  { _id: 'bk_2', title: 'Higher Algebra', author: 'Hall & Knight', category: 'Mathematics', isbn: '978-9351449584', availableCopies: 8, totalCopies: 10, location: 'Shelf B-2' },
  { _id: 'bk_3', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', isbn: '978-0061120084', availableCopies: 5, totalCopies: 6, location: 'Shelf C-1' }
];

// Inventory Items
export const demoInventoryItems = [
  { _id: 'inv_1', itemName: 'Whiteboard Markers (Blue/Black)', category: 'Stationery', quantity: 150, unitPrice: 25, totalValue: 3750, status: 'In Stock' },
  { _id: 'inv_2', itemName: 'A4 Printing Paper Reams', category: 'Office Supplies', quantity: 80, unitPrice: 280, totalValue: 22400, status: 'In Stock' },
  { _id: 'inv_3', itemName: 'Basketballs (Spalding)', category: 'Sports Equipment', quantity: 15, unitPrice: 1200, totalValue: 18000, status: 'Low Stock' }
];

// Transport Routes
export const demoTransportRoutes = [
  { _id: 'rt_1', routeName: 'Route 1: City Center to School', busNumber: 'KA-01-F-1234', driverName: 'Ramesh Gowda', driverPhone: '9845012345', capacity: 40, enrolledStudents: 32, feeAmount: 2500 },
  { _id: 'rt_2', routeName: 'Route 2: Suburb Enclave to School', busNumber: 'KA-01-F-5678', driverName: 'Suresh Kumar', driverPhone: '9845067890', capacity: 40, enrolledStudents: 38, feeAmount: 2800 }
];

// Hostels
export const demoHostels = [
  { _id: 'hst_1', blockName: 'Tagore Boys Hostel (Block A)', wardenName: 'Mr. Mohan Das', totalRooms: 50, occupiedRooms: 42, monthlyFee: 6500 },
  { _id: 'hst_2', blockName: 'Sarojini Girls Hostel (Block B)', wardenName: 'Ms. Kamala Devi', totalRooms: 50, occupiedRooms: 38, monthlyFee: 6500 }
];

// Lesson Plans
export const demoLessonPlans = [
  { _id: 'lp_1', title: 'Quadratic Equations & Parabola Graphs', subject: 'Mathematics', className: 'Grade 10', teacherName: 'Rajesh Kumar', startDate: '2026-08-01', endDate: '2026-08-05', objectives: 'Master quadratic formulas and graph plotting.', topicsCovered: 'Factoring, quadratic formula, discriminant b^2 - 4ac', status: 'pending', principalComments: '' },
  { _id: 'lp_2', title: 'Cell Biology & Organelle Microscopic Study', subject: 'Science', className: 'Grade 9', teacherName: 'Sunita Rao', startDate: '2026-08-02', endDate: '2026-08-06', objectives: 'Understand plant and animal cell structures.', topicsCovered: 'Mitochondria, Cell Wall, Chloroplasts, Mitosis', status: 'approved', principalComments: 'Approved.' },
  { _id: 'lp_3', title: 'Shakespearean Literature & Monologues', subject: 'English', className: 'Grade 10', teacherName: 'Anil Mehta', startDate: '2026-08-04', endDate: '2026-08-08', objectives: 'Analyze poetic meters and dramatic devices.', topicsCovered: 'Julius Caesar Act 3, Monologues vs Soliloquy', status: 'pending', principalComments: '' }
];
