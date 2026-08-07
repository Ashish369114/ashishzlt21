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

// First & Last Names lists for canonical student & parent names across all portals
const firstNames = [
  'Rohan', 'Ananya', 'Aarav', 'Ishita', 'Kabir', 'Diya', 'Vihaan', 'Siddharth', 'Riya', 'Karan',
  'Neha', 'Rahul', 'Tanvi', 'Aditya', 'Meera', 'Arjun', 'Pooja', 'Vikram', 'Anushka', 'Devansh',
  'Sneha', 'Harsh', 'Ritu', 'Kunal', 'Sanjana', 'Yash', 'Preeti', 'Gautam', 'Simran', 'Nikhil',
  'Aadhya', 'Advait', 'Bhavya', 'Chaitanya', 'Dhruv', 'Esha', 'Farhan', 'Garima', 'Hridaan', 'Isha',
  'Jatin', 'Kavya', 'Laksh', 'Manvi', 'Navya', 'Ojas', 'Parth', 'Qasim', 'Rishi', 'Shreya',
  'Tanya', 'Utkarsh', 'Vanya', 'Varun', 'Yashvi', 'Zaid', 'Ayaan', 'Bhumika', 'Charvi', 'Divyansh'
];

const lastNames = [
  'Verma', 'Sharma', 'Singh', 'Patel', 'Mehta', 'Kapoor', 'Joshi', 'Rao', 'Sen', 'Nair',
  'Deshmukh', 'Gupta', 'Kulkarni', 'Roy', 'Reddy', 'Bhatt', 'Malhotra', 'Saxena', 'Pandey', 'Iyer',
  'Jain', 'Ahuja', 'Das', 'Agrawal', 'Chowdary', 'Pillai', 'Kaur', 'Saxena', 'Bhatia', 'Menon',
  'Trivedi', 'Chhabra', 'Goswami', 'Rastogi', 'Dutta', 'Mishra', 'Tripathi', 'Shukla', 'Bansal', 'Goyal'
];

// Sample Date of Birth helper to generate realistic birthdays
const getSampleDob = (index) => {
  const today = new Date();
  const month = (today.getMonth() + (index % 3)) % 12;
  const day = index % 5 === 0 ? today.getDate() : ((today.getDate() + index * 3) % 28) + 1;
  const year = 2011 + (index % 3);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// 2. Generate Students for each of the 30 classes (in 100% sync with Teacher & Parent views)
export const demoStudents = demoClasses.map((cls) => {
  const gNum = parseInt(cls.grade, 10);
  const secVal = cls.section === 'A' ? 0 : cls.section === 'B' ? 13 : 27;
  const classOffset = gNum * 7 + secVal;
  const secOffset = cls.section === 'A' ? 1 : cls.section === 'B' ? 31 : 61;
  const baseRoll = gNum * 100 + secOffset;

  return Array.from({ length: 10 }, (_, i) => {
    const fn = firstNames[(classOffset + i * 3) % firstNames.length];
    const ln = lastNames[(classOffset * 2 + i * 5 + 1) % lastNames.length];
    const rollNo = `${baseRoll + i}`;
    const admNo = `ADM-2026-${baseRoll + i}`;
    const pName = `Suresh ${ln}`;
    const sPhone = `+91 98765 ${10000 + i}`;
    const pPhone = `+91 98765 ${20000 + i}`;
    const stdId = `st_${cls.grade.replace(/\s+/g, '')}_${cls.section}_${i + 1}`;
    const dob = getSampleDob(i);

    return {
      _id: stdId,
      studentId: admNo,
      admissionNo: admNo,
      firstName: fn,
      lastName: ln,
      name: `${fn} ${ln}`,
      userId: { 
        _id: `u_${stdId}`, 
        firstName: fn, 
        lastName: ln, 
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@school.com`,
        phone: sPhone
      },
      class: { _id: cls._id, grade: cls.grade, section: cls.section },
      grade: cls.grade,
      section: cls.section,
      rollNumber: rollNo,
      rollNo: rollNo,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      dob: dob,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@school.com`,
      phone: sPhone,
      parentName: pName,
      parentPhone: pPhone,
      parent: { firstName: 'Suresh', lastName: ln, phone: pPhone },
      parentId: { _id: `p_${stdId}`, firstName: 'Suresh', lastName: ln, phone: pPhone },
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
  const joinYear = 2020 + (cIdx % 4);
  const joinMonth = String((cIdx % 12) + 1).padStart(2, '0');
  const joinDay = String((cIdx % 25) + 1).padStart(2, '0');

  // Status distribution: 3 Serving Notice Period, 2 Left, rest Working/Active
  let status = 'Active';
  let employeeStatus = 'Working';
  let inNoticePeriod = false;

  if (cIdx === 3 || cIdx === 8 || cIdx === 14) {
    status = 'Notice Period';
    employeeStatus = 'Serving Notice Period';
    inNoticePeriod = true;
  } else if (cIdx === 5 || cIdx === 11) {
    status = 'Left';
    employeeStatus = 'Left';
    inNoticePeriod = false;
  }

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
    status: status,
    employeeStatus: employeeStatus,
    inNoticePeriod: inNoticePeriod,
    dateOfJoining: `${joinYear}-${joinMonth}-${joinDay}`,
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

// 5. Generate Attendance Records for all 300 students
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

// 6. Generate Fee Records for all 300 students
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

// 11. Library Books (8 Items)
export const demoLibraryBooks = [
  { _id: 'bk_1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Textbook', publisher: 'MIT Press', isbn: '9780262033848', availableCopies: 8, totalCopies: 10, location: 'Shelf D-3' },
  { _id: 'bk_2', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', publisher: 'Grand Central Publishing', isbn: '9780446310789', availableCopies: 3, totalCopies: 5, location: 'Shelf C-1' },
  { _id: 'bk_3', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Non-Fiction', publisher: 'Bantam Books', isbn: '9780553380163', availableCopies: 7, totalCopies: 7, location: 'Shelf A-1' },
  { _id: 'bk_4', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', category: 'Science', publisher: 'Bharati Bhawan', isbn: '9788177091877', availableCopies: 12, totalCopies: 15, location: 'Shelf A-4' },
  { _id: 'bk_5', title: 'Higher Algebra', author: 'Hall & Knight', category: 'Mathematics', publisher: 'Arihant', isbn: '9789351449584', availableCopies: 8, totalCopies: 10, location: 'Shelf B-2' },
  { _id: 'bk_6', title: 'Problems in General Physics', author: 'I.E. Irodov', category: 'Science', publisher: 'CBS Publishers', isbn: '9788123903866', availableCopies: 6, totalCopies: 8, location: 'Shelf A-6' },
  { _id: 'bk_7', title: 'Organic Chemistry', author: 'Morrison & Boyd', category: 'Science', publisher: 'Pearson', isbn: '9788131704813', availableCopies: 9, totalCopies: 11, location: 'Shelf A-7' }
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

// 15. Fee Collections Receipts (Recent & Historical)
export const demoFeeCollections = [
  { _id: 'fc_1', receiptNumber: 'REC-2026-8801', studentName: 'Aarav Sharma', gradeSec: 'Grade 10 - Section A', feeType: 'Tuition Fee (Q2)', paidAmount: 47200, paymentMethod: 'UPI / Online', paymentDate: '2026-08-04', status: 'Completed' },
  { _id: 'fc_2', receiptNumber: 'REC-2026-8802', studentName: 'Ananya Verma', gradeSec: 'Grade 9 - Section B', feeType: 'Tuition & Lab Fee', paidAmount: 52400, paymentMethod: 'Card / POS', paymentDate: '2026-08-04', status: 'Completed' },
  { _id: 'fc_3', receiptNumber: 'REC-2026-8803', studentName: 'Vihaan Patel', gradeSec: 'Grade 8 - Section A', feeType: 'Transport Fee', paidAmount: 8500, paymentMethod: 'Cash', paymentDate: '2026-08-03', status: 'Completed' },
  { _id: 'fc_4', receiptNumber: 'REC-2026-8804', studentName: 'Diya Gupta', gradeSec: 'Grade 7 - Section C', feeType: 'Tuition Fee (Q2)', paidAmount: 47200, paymentMethod: 'Net Banking', paymentDate: '2026-08-03', status: 'Completed' },
  { _id: 'fc_5', receiptNumber: 'REC-2026-8805', studentName: 'Ishaan Singh', gradeSec: 'Grade 6 - Section B', feeType: 'Annual Sports & Activity Fee', paidAmount: 12500, paymentMethod: 'UPI', paymentDate: '2026-08-02', status: 'Completed' }
];

// 16. Pending Fee Dues
export const demoPendingDues = [
  { _id: 'pd_1', studentName: 'Kabir Chawla', gradeSec: 'Grade 10 - Section B', feeType: 'Tuition Fee (Q2)', amount: 47200, paidAmount: 0, dueDate: '2026-08-15', status: 'Unpaid' },
  { _id: 'pd_2', studentName: 'Sanya Kapoor', gradeSec: 'Grade 9 - Section A', feeType: 'Lab & Computer Fee', amount: 15400, paidAmount: 5000, dueDate: '2026-08-15', status: 'Partial' },
  { _id: 'pd_3', studentName: 'Aditya Rao', gradeSec: 'Grade 8 - Section C', feeType: 'Transport Fee (Q2)', amount: 8500, paidAmount: 0, dueDate: '2026-08-20', status: 'Unpaid' },
  { _id: 'pd_4', studentName: 'Meera Nair', gradeSec: 'Grade 7 - Section A', feeType: 'Tuition Fee (Q2)', amount: 47200, paidAmount: 18880, dueDate: '2026-08-15', status: 'Partial' },
  { _id: 'pd_5', studentName: 'Dev Iyer', gradeSec: 'Grade 6 - Section C', feeType: 'Hostel Fee (Q2)', amount: 19500, paidAmount: 0, dueDate: '2026-08-10', status: 'Unpaid' }
];

// 17. School Expenses
export const demoExpenses = [
  { _id: 'exp_1', title: 'Science Lab Equipment & Reagents Purchase', category: 'Lab Supplies', amount: 85000, date: '2026-08-03', paidTo: 'Precision Scientific Ltd', status: 'Approved' },
  { _id: 'exp_2', title: 'Campus High-Speed Internet & Lease Line Bill', category: 'Utilities', amount: 32000, date: '2026-08-01', paidTo: 'Airtel Broadband Ltd', status: 'Paid' },
  { _id: 'exp_3', title: 'Library Books & Encyclopedia Subscription', category: 'Library Stock', amount: 45000, date: '2026-07-28', paidTo: 'Oxford University Press', status: 'Approved' },
  { _id: 'exp_4', title: 'Annual Sports Day Equipment & Medals', category: 'Sports', amount: 62000, date: '2026-07-25', paidTo: 'Decathlon Sports India', status: 'Paid' }
];

// 18. Staff Monthly Payroll
export const demoPayroll = [
  { _id: 'pr_1', staffName: 'Sunita Sharma', role: 'Class Teacher (Grade 10-A)', month: 'July 2026', basicSalary: 55000, allowances: 8000, deductions: 2500, netSalary: 60500, status: 'Disbursed' },
  { _id: 'pr_2', staffName: 'Ramesh Gupta', role: 'Senior Physics Faculty', month: 'July 2026', basicSalary: 62000, allowances: 9500, deductions: 3000, netSalary: 68500, status: 'Disbursed' },
  { _id: 'pr_3', staffName: 'Anjali Verma', role: 'Mathematics Teacher', month: 'July 2026', basicSalary: 52000, allowances: 7500, deductions: 2200, netSalary: 57300, status: 'Disbursed' },
  { _id: 'pr_4', staffName: 'Vikram Rathore', role: 'Administrative Officer', month: 'July 2026', basicSalary: 58000, allowances: 8500, deductions: 2800, netSalary: 63700, status: 'Disbursed' }
];

// 19. Principal & Teacher Leave Requests
export const demoLeaveRequests = [
  { _id: 'lv_1', applicantName: 'Mrs. Sunita Sharma', role: 'Teacher (Grade 10-A)', leaveType: 'Casual Leave', startDate: '2026-08-08', endDate: '2026-08-09', totalDays: 2, reason: 'Attending family function', status: 'Pending' },
  { _id: 'lv_2', applicantName: 'Mr. Ramesh Gupta', role: 'Senior Physics Faculty', leaveType: 'Medical Leave', startDate: '2026-08-05', endDate: '2026-08-06', totalDays: 2, reason: 'Doctor appointment & viral recovery', status: 'Approved' },
  { _id: 'lv_3', applicantName: 'Mrs. Anjali Verma', role: 'Teacher (Grade 8-B)', leaveType: 'Earned Leave', startDate: '2026-08-12', endDate: '2026-08-14', totalDays: 3, reason: 'Personal work', status: 'Pending' }
];

// 20. Vendors & Contracts
export const demoVendors = [
  { _id: 'ven_1', vendorName: 'Raymond School Apparel', serviceType: 'Uniform Supplies', contactPerson: 'Rajesh Malhotra', phone: '9820011223', email: 'sales@raymondapparel.com', contractExpiry: '2027-03-31', status: 'Active' },
  { _id: 'ven_2', vendorName: 'S Chand Publishing', serviceType: 'Textbooks & Workbooks', contactPerson: 'Sanjay Goel', phone: '9810033445', email: 'orders@schand.com', contractExpiry: '2027-05-31', status: 'Active' },
  { _id: 'ven_3', vendorName: 'Apex Security & Transport Services', serviceType: 'Campus Guard & Bus Drivers', contactPerson: 'Vikram Guard', phone: '9833055667', email: 'info@apexsecurity.com', contractExpiry: '2026-12-31', status: 'Active' }
];

// 21. Infrastructure Maintenance Requests
export const demoMaintenanceRequests = [
  { _id: 'mnt_1', issueTitle: 'Physics Lab Projector Lamp Replacement', location: 'Science Block Room 204', priority: 'High', reportedBy: 'Mr. Ramesh Gupta', reportDate: '2026-08-03', status: 'In Progress' },
  { _id: 'mnt_2', issueTitle: 'Basketball Court Light Fixture Repair', location: 'Outdoor Sports Area', priority: 'Medium', reportedBy: 'Mr. Vikram Singh', reportDate: '2026-08-02', status: 'Open' },
  { _id: 'mnt_3', issueTitle: 'Auditorium Air Conditioning Filter Cleaning', location: 'Main Auditorium', priority: 'Low', reportedBy: 'Mrs. Pooja Sharma', reportDate: '2026-07-30', status: 'Completed' }
];

