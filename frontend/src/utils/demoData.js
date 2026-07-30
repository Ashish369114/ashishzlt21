// 1. Generate Classes (Grades 1 to 10, Sections A, B, C = 30 classes)
export const demoClasses = Array.from({ length: 10 }, (_, i) => {
  const gradeNum = String(i + 1);
  return ['A', 'B', 'C'].map((section, sIdx) => ({
    _id: `cls_${gradeNum}_${section.toLowerCase()}`,
    grade: gradeNum,
    section: section,
    className: `${gradeNum}-${section}`,
    roomNumber: `${100 + i * 3 + sIdx + 1}`,
    classTeacher: `Teacher Grade ${gradeNum}-${section}`
  }));
}).flat();

// First & Last Names lists for realistic student, parent & teacher names
const firstNames = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Diya', 'Vihaan', 'Ishita', 'Arjun', 'Sanya',
  'Aditya', 'Meera', 'Dev', 'Kavya', 'Vivaan', 'Anushka', 'Reyansh', 'Riya', 'Ayaan', 'Tara',
  'Karthik', 'Nisha', 'Amit', 'Deepa', 'Sanjay', 'Ritu', 'Vijay', 'Kiran', 'Alok', 'Shweta',
  'Manoj', 'Anjali', 'Sunil', 'Kavita', 'Pradeep', 'Pooja', 'Rakesh', 'Jyoti', 'Harish', 'Nidhi'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Joshi', 'Chawla', 'Mehta', 'Nair',
  'Iyer', 'Kumar', 'Das', 'Mishra', 'Choudhury', 'Prasad', 'Goel', 'Sen', 'Tripathi', 'Dubey',
  'Saxena', 'Pandey', 'Bose', 'Gill', 'Malhotra', 'Kapoor', 'Roy', 'Jadhav', 'Kulkarni', 'Deshmukh'
];

// 2. Generate 150 Students (5 students for each of the 30 classes)
export const demoStudents = demoClasses.map((cls, cIdx) => {
  return Array.from({ length: 5 }, (_, sIdx) => {
    const globalIdx = cIdx * 5 + sIdx;
    const fn = firstNames[globalIdx % firstNames.length];
    const ln = lastNames[(globalIdx + 2) % lastNames.length];
    const pFn = firstNames[(globalIdx + 5) % firstNames.length];
    const pLn = ln;
    const rollNo = `${cls.grade}${cls.section}${String(sIdx + 1).padStart(2, '0')}`;

    return {
      _id: `std_${cls.grade}_${cls.section.toLowerCase()}_${sIdx + 1}`,
      studentId: `STD-${1000 + globalIdx + 1}`,
      firstName: fn,
      lastName: ln,
      userId: { 
        _id: `u_std_${globalIdx + 1}`, 
        firstName: fn, 
        lastName: ln, 
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${globalIdx + 1}@school.com`,
        phone: `98765${String(10000 + globalIdx)}`
      },
      class: { _id: cls._id, grade: cls.grade, section: cls.section },
      grade: cls.grade,
      section: cls.section,
      rollNumber: rollNo,
      gender: globalIdx % 2 === 0 ? 'Male' : 'Female',
      dob: `201${Math.min(9, Math.floor(cIdx / 3))}-0${(globalIdx % 9) + 1}-15`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${globalIdx + 1}@school.com`,
      phone: `98765${String(10000 + globalIdx)}`,
      parentName: `${pFn} ${pLn}`,
      parentPhone: `98764${String(10000 + globalIdx)}`,
      parent: { firstName: pFn, lastName: pLn, phone: `98764${String(10000 + globalIdx)}` },
      parentId: { _id: `p_u_${globalIdx + 1}`, firstName: pFn, lastName: pLn, phone: `98764${String(10000 + globalIdx)}` },
      status: 'Active'
    };
  });
}).flat();

// 3. Generate 30 Employees / Teachers
export const demoEmployees = demoClasses.map((cls, cIdx) => {
  const fn = firstNames[(cIdx + 10) % firstNames.length];
  const ln = lastNames[(cIdx + 3) % lastNames.length];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Hindi', 'Telugu'];
  const dept = cIdx % 2 === 0 ? 'Academics' : 'Administration';
  const designation = cIdx <= 5 ? `Grade ${cls.grade} Class Teacher` : `Senior ${subjects[cIdx % subjects.length]} Faculty`;

  return {
    _id: `emp_${cIdx + 1}`,
    employeeId: `EMP-${100 + cIdx + 1}`,
    firstName: fn,
    lastName: ln,
    employeeType: cIdx % 4 === 0 ? 'Non-Teaching Staff' : 'teaching',
    designation: designation,
    department: dept,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@school.com`,
    phone: `9876500${String(100 + cIdx)}`,
    salary: 45000 + (cIdx * 1000),
    status: 'Active',
    assignedClasses: [cls]
  };
});

// 4. Generate Exams for all grades & subjects
const examTypes = ['Mid-Term Examination 2026', 'Unit Test 1', 'Annual Final Examination', 'Quarterly Assessment'];
const subjectsList = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];

export const demoExams = Array.from({ length: 10 }, (_, i) => {
  const gradeNum = String(i + 1);
  return ['A', 'B', 'C'].map((section) => {
    return subjectsList.map((subj, subIdx) => ({
      _id: `ex_${gradeNum}_${section.toLowerCase()}_${subIdx + 1}`,
      name: examTypes[subIdx % examTypes.length],
      examName: examTypes[subIdx % examTypes.length],
      examType: subIdx % 2 === 0 ? 'Mid-Term' : 'Unit Test',
      grade: gradeNum,
      section: section,
      class: { grade: gradeNum, section: section },
      subject: subj,
      examDate: `2026-08-${10 + (subIdx * 2)}`,
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      totalMarks: 100,
      passingMarks: 35,
      roomNo: `Room ${100 + i * 3 + (subIdx % 3) + 1}`
    }));
  }).flat();
}).flat();

// 5. Generate Attendance Records for all 150 students
export const demoAttendance = demoStudents.map((s, idx) => ({
  _id: `att_${idx + 1}`,
  studentId: s._id,
  studentName: `${s.firstName} ${s.lastName}`,
  student: { userId: { firstName: s.firstName, lastName: s.lastName } },
  class: { grade: s.grade, section: s.section },
  grade: s.grade,
  section: s.section,
  date: new Date().toISOString().split('T')[0],
  status: idx % 6 === 0 ? 'Absent' : idx % 7 === 0 ? 'Late' : 'Present',
  remarks: idx % 6 === 0 ? 'Medical leave requested' : idx % 7 === 0 ? '15 mins late due to traffic' : 'On time'
}));

// 6. Generate Fee Records for all 150 students
export const demoFees = demoStudents.map((s, idx) => {
  const totalFee = 45000 + (Number(s.grade) * 1500);
  const paidFee = idx % 3 === 0 ? totalFee : idx % 3 === 1 ? Math.floor(totalFee * 0.6) : 0;
  const dueFee = totalFee - paidFee;
  const status = paidFee === totalFee ? 'Paid' : paidFee > 0 ? 'Partial' : 'Pending';

  return {
    _id: `fee_${idx + 1}`,
    studentId: s._id,
    studentName: `${s.firstName} ${s.lastName}`,
    student: s,
    grade: s.grade,
    section: s.section,
    amount: totalFee,
    totalFee: totalFee,
    paidAmount: paidFee,
    paidFee: paidFee,
    dueFee: dueFee,
    status: status,
    dueDate: '2026-08-15'
  };
});

// 7. Circulars & Notices (10 Items)
export const demoNotices = [
  { _id: 'not_1', title: 'Independence Day Flag Hoisting & Cultural Fest 2026', content: 'All students, parents, and faculty members are cordially invited to attend the 80th Independence Day Flag Hoisting ceremony at 8:00 AM in the school main assembly ground. Cultural performances will follow.', category: 'Event', targetAudience: 'All', priority: 'High', date: '2026-08-14', author: 'Dr. Kumar (Principal)' },
  { _id: 'not_2', title: 'Mid-Term Examination Schedule & Syllabus Guidelines', content: 'The detailed timetable for Mid-Term Examinations starting August 15th has been released. Teachers are requested to complete syllabus revisions by August 10th.', category: 'Academics', targetAudience: 'All', priority: 'High', date: '2026-08-01', author: 'Examination Cell' },
  { _id: 'not_3', title: 'Parent-Teacher Meeting (PTM) Notice - Q2 Progress Review', content: 'Second quarter PTM is scheduled for Saturday, 20th August 2026 from 9:00 AM to 1:00 PM. Parents can discuss student progress, attendance, and exam preparation with class teachers.', category: 'Notice', targetAudience: 'Parents', priority: 'High', date: '2026-08-10', author: 'Principal Office' },
  { _id: 'not_4', title: 'Annual Science Fair & STEM Model Registration Open', content: 'Registrations are open for the Annual Science Fair 2026. Models across Physics, Chemistry, Biology, and Robotics can be submitted to science department HODs by August 25th.', category: 'Event', targetAudience: 'Students', priority: 'Medium', date: '2026-08-05', author: 'Science HOD' },
  { _id: 'not_5', title: 'School Fee Second Quarter Payment Deadline Reminder', content: 'Parents are kindly requested to clear Q2 tuition and transport fees before August 30th to avoid late processing surcharges.', category: 'Finance', targetAudience: 'Parents', priority: 'High', date: '2026-08-02', author: 'Accounts Dept.' },
  { _id: 'not_6', title: 'Staff Faculty Development Workshop on AI Pedagogy', content: 'A mandatory workshop on integrating AI tools in classroom teaching will be held in the Main Auditorium on Friday, 12th August at 2:00 PM.', category: 'Academics', targetAudience: 'Teachers', priority: 'Normal', date: '2026-08-08', author: 'Academic Coordinator' },
  { _id: 'not_7', title: 'Inter-School Sports Competition Trials', content: 'Selection trials for school basketball, football, and cricket teams will commence on Monday at 3:30 PM. Interested students register with sports teachers.', category: 'Event', targetAudience: 'Students', priority: 'Medium', date: '2026-08-07', author: 'Physical Education Dept.' },
  { _id: 'not_8', title: 'Library Book Return & Fine Waiver Week', content: 'Students holding overdue library books can return them without late fees between August 15th and August 22nd during library hours.', category: 'Library', targetAudience: 'Students', priority: 'Normal', date: '2026-08-09', author: 'Librarian' }
];

// 8. Meeting MOMs (10 Items)
export const demoMeetingMoms = [
  { _id: 'mom_1', title: 'Monthly Staff Academic Planning & Examination Review', meetingDate: '2026-08-01', attendees: 'Principal, HODs, Coordinators, Class Teachers', agenda: 'Curriculum progress review, mid-term question paper moderation, smart classroom maintenance.', keyDecisions: '1. Mid-Term exam schedule finalized. 2. Weekly remedial classes approved for Grade 9 & 10.', status: 'Approved' },
  { _id: 'mom_2', title: 'PTM Review & Sports Day Committee Formation', meetingDate: '2026-08-03', attendees: 'Principal, Sports Teacher, Cultural Coordinator, Parent Reps', agenda: 'Venue arrangement, chief guest invitation, event budget allocation.', keyDecisions: '1. Parent volunteer committee formed. 2. Additional bus route added for North Extension.', status: 'Approved' },
  { _id: 'mom_3', title: 'HOD Science & Math Curriculum Alignment Meeting', meetingDate: '2026-08-05', attendees: 'Math & Science Teachers, Principal', agenda: 'STEM practical lab sessions integration and lab equipment procurement.', keyDecisions: 'Bi-weekly practical lab sessions added for Grade 7 to 10.', status: 'Approved' },
  { _id: 'mom_4', title: 'Transport & Campus Security Review Meeting', meetingDate: '2026-08-08', attendees: 'AO, Transport Manager, Bus Drivers, Security Head', agenda: 'GPS tracking links verification, bus route timing optimization, CCTV coverage audit.', keyDecisions: 'Speed governors and mandatory breath analyzer tests instituted for driver staff.', status: 'Approved' }
];

// 9. Lesson Plans (10 Items)
export const demoLessonPlans = [
  { _id: 'lp_1', title: 'Quadratic Equations & Parabola Graph Plotting', subject: 'Mathematics', className: 'Grade 10', teacherName: 'Rajesh Kumar', startDate: '2026-08-01', endDate: '2026-08-05', objectives: 'Understand roots of quadratic equations and parabola graph representation.', topicsCovered: 'Factoring, quadratic formula, discriminant b^2 - 4ac', status: 'pending', principalComments: '' },
  { _id: 'lp_2', title: 'Cell Biology & Organelle Microscopic Study', subject: 'Science', className: 'Grade 9', teacherName: 'Sunita Rao', startDate: '2026-08-02', endDate: '2026-08-06', objectives: 'Distinguish between plant and animal cells under compound microscope.', topicsCovered: 'Mitochondria, Cell Wall, Chloroplasts, Mitosis phase overview', status: 'approved', principalComments: 'Excellent lab integration plan. Approved.' },
  { _id: 'lp_3', title: 'Shakespearean Literature & Literary Monologues', subject: 'English', className: 'Grade 10', teacherName: 'Anil Mehta', startDate: '2026-08-04', endDate: '2026-08-08', objectives: 'Analyze tragic flaws and poetic meter in Julius Caesar Act 3.', topicsCovered: 'Monologue vs Soliloquy, Rhetorical devices, Iambic pentameter', status: 'pending', principalComments: '' },
  { _id: 'lp_4', title: 'Newtonian Laws of Motion & Friction Experiments', subject: 'Science', className: 'Grade 8', teacherName: 'Vikram Singh', startDate: '2026-08-03', endDate: '2026-08-07', objectives: 'Verify 2nd and 3rd laws of motion using force sensors.', topicsCovered: 'Force F=ma, static vs kinetic friction, momentum conservation', status: 'approved', principalComments: 'Well-structured lab exercises. Approved.' },
  { _id: 'lp_5', title: 'Python Programming Basics & Control Loops', subject: 'Computer Science', className: 'Grade 9', teacherName: 'Pooja Sharma', startDate: '2026-08-05', endDate: '2026-08-10', objectives: 'Write for-loops, while-loops, and conditional if-else scripts.', topicsCovered: 'Syntax rules, list iteration, range function, calculator script', status: 'approved', principalComments: 'Approved.' }
];

// 10. Marks for all 150 students
export const demoMarks = demoStudents.map((s, idx) => ({
  _id: `mrk_${idx + 1}`,
  studentId: s._id,
  studentName: `${s.firstName} ${s.lastName}`,
  student: s,
  class: { grade: s.grade, section: s.section },
  grade: s.grade,
  section: s.section,
  examName: 'Mid-Term Examination 2026',
  subject: idx % 3 === 0 ? 'Mathematics' : idx % 3 === 1 ? 'Science' : 'English',
  marksObtained: 70 + (idx % 28),
  totalMarks: 100,
  remarks: idx % 5 === 0 ? 'Outstanding' : idx % 4 === 0 ? 'Excellent' : 'Good Performance'
}));

// 11. Library Books (20 Items)
export const demoLibraryBooks = [
  { _id: 'bk_1', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', category: 'Science', isbn: '978-8177091877', availableCopies: 12, totalCopies: 15, location: 'Shelf A-4' },
  { _id: 'bk_2', title: 'Concepts of Physics (Vol 2)', author: 'H.C. Verma', category: 'Science', isbn: '978-8177092003', availableCopies: 10, totalCopies: 12, location: 'Shelf A-5' },
  { _id: 'bk_3', title: 'Higher Algebra', author: 'Hall & Knight', category: 'Mathematics', isbn: '978-9351449584', availableCopies: 8, totalCopies: 10, location: 'Shelf B-2' },
  { _id: 'bk_4', title: 'Problems in General Physics', author: 'I.E. Irodov', category: 'Science', isbn: '978-8123903866', availableCopies: 6, totalCopies: 8, location: 'Shelf A-6' },
  { _id: 'bk_5', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', isbn: '978-0061120084', availableCopies: 5, totalCopies: 6, location: 'Shelf C-1' },
  { _id: 'bk_6', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest', category: 'Computer Science', isbn: '978-0262033848', availableCopies: 4, totalCopies: 5, location: 'Shelf D-3' },
  { _id: 'bk_7', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', isbn: '978-0553380163', availableCopies: 7, totalCopies: 9, location: 'Shelf A-1' },
  { _id: 'bk_8', title: 'Organic Chemistry', author: 'Morrison & Boyd', category: 'Science', isbn: '978-8131704813', availableCopies: 9, totalCopies: 11, location: 'Shelf A-7' }
];

// 12. Inventory Items (15 Items)
export const demoInventoryItems = [
  { _id: 'inv_1', itemName: 'Whiteboard Markers (Blue/Black Pack of 10)', category: 'Stationery', quantity: 150, unitPrice: 250, totalValue: 37500, status: 'In Stock' },
  { _id: 'inv_2', itemName: 'A4 Printing Paper Reams (500 Sheets)', category: 'Office Supplies', quantity: 80, unitPrice: 280, totalValue: 22400, status: 'In Stock' },
  { _id: 'inv_3', itemName: 'Spalding Professional Basketballs', category: 'Sports Equipment', quantity: 15, unitPrice: 1200, totalValue: 18000, status: 'Low Stock' },
  { _id: 'inv_4', itemName: 'Digital Compound Microscopes (1000x)', category: 'Lab Equipment', quantity: 24, unitPrice: 8500, totalValue: 204000, status: 'In Stock' },
  { _id: 'inv_5', itemName: 'First Aid Kit Complete Box', category: 'Medical Supplies', quantity: 20, unitPrice: 1500, totalValue: 30000, status: 'In Stock' }
];

// 13. Transport Routes (10 Items)
export const demoTransportRoutes = [
  { _id: 'rt_1', routeName: 'Route 1: City Center to School via M.G. Road', busNumber: 'KA-01-F-1234', driverName: 'Ramesh Gowda', driverPhone: '9845012345', capacity: 40, enrolledStudents: 38, feeAmount: 2500 },
  { _id: 'rt_2', routeName: 'Route 2: Suburb Enclave to School via Ring Road', busNumber: 'KA-01-F-5678', driverName: 'Suresh Kumar', driverPhone: '9845067890', capacity: 40, enrolledStudents: 36, feeAmount: 2800 },
  { _id: 'rt_3', routeName: 'Route 3: North Extension to School via Airport Expressway', busNumber: 'KA-01-F-9012', driverName: 'Mahesh Reddy', driverPhone: '9845090123', capacity: 40, enrolledStudents: 34, feeAmount: 3000 }
];

// 14. Hostels (5 Items)
export const demoHostels = [
  { _id: 'hst_1', blockName: 'Tagore Boys Hostel (Block A)', wardenName: 'Mr. Mohan Das', totalRooms: 50, occupiedRooms: 44, monthlyFee: 6500 },
  { _id: 'hst_2', blockName: 'Sarojini Girls Hostel (Block B)', wardenName: 'Ms. Kamala Devi', totalRooms: 50, occupiedRooms: 40, monthlyFee: 6500 },
  { _id: 'hst_3', blockName: 'Kalam Junior Hostel (Block C)', wardenName: 'Mr. Rajesh Nair', totalRooms: 40, occupiedRooms: 32, monthlyFee: 6000 }
];
