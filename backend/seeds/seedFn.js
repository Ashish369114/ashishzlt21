const { User, Subject, Class, Teacher, Student, Fee, Homework, Marks, Attendance, Exam, Event, Leave, Employee, School, Library, Transport, Hostel } = require('../models');

const seedDataFn = async () => {
  // Sync in seedData.js already wiped tables, so we don't need deleteMany.
  console.log('Cleared existing data (tables synced)');

  const defaultSchool = await School.create({
    name: 'Greenwood High School',
    code: 'GHS101',
    email: 'info@greenwood.edu',
    phone: '1234567890',
    academicYear: '2026-2027',
  });
  console.log('Created default school Greenwood High School');

  const subjectsData = [
    { name: 'Mathematics' },
    { name: 'Science' },
    { name: 'Social Studies' },
    { name: 'English' },
    { name: 'Telugu' },
    { name: 'Hindi' },
    { name: 'Environmental Science (EVS)' },
  ];

  const subjects = await Subject.bulkCreate(subjectsData);
  console.log(`Created ${subjects.length} subjects`);

  const superAdmin = await User.create({
    userId: 'SUPERADMIN001',
    password: 'Admin@123',
    role: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@school.com',
    phone: '9876543210',
    subscriptionPlan: 'platinum_with_ocr',
  });

  const principal = await User.create({
    userId: 'PRINCIPAL001',
    password: 'Principal@123',
    role: 'principal',
    firstName: 'Dr.',
    lastName: 'Kumar',
    email: 'principal@school.com',
    phone: '9876543211',
    subscriptionPlan: 'platinum_with_ocr',
  });

  const accountant = await User.create({
    userId: 'ACCOUNTANT001',
    password: 'Accountant@123',
    role: 'accountant_admin',
    firstName: 'Ravi',
    lastName: 'Verma',
    email: 'accountant@school.com',
    phone: '9876543299',
    subscriptionPlan: 'gold',
  });

  const examiner = await User.create({
    userId: 'EXAMINER001',
    password: 'Examiner@123',
    role: 'examiner',
    firstName: 'Amit',
    lastName: 'Jha',
    email: 'examiner@school.com',
    phone: '9876543290',
    subscriptionPlan: 'gold',
  });

  const librarian = await User.create({
    userId: 'LIBRARIAN001',
    password: 'Librarian@123',
    role: 'librarian',
    firstName: 'Suresh',
    lastName: 'Sharma',
    email: 'librarian@school.com',
    phone: '9876543288',
    subscriptionPlan: 'platinum',
  });

  const adminOfficer = await User.create({
    userId: 'ADMIN_OFFICER001',
    password: 'Ao@123',
    role: 'administrative_officer',
    firstName: 'Vikram',
    lastName: 'Rathore',
    email: 'ao@school.com',
    phone: '9876543277',
    subscriptionPlan: 'platinum_with_ocr',
  });

  console.log('Created admin and examiner accounts');

  const firstNames = ['Ramesh', 'Priya', 'Rajesh', 'Sneha', 'Suresh', 'Neha', 'Vikram', 'Asha', 'Karthik', 'Nisha',
                      'Amit', 'Deepa', 'Sanjay', 'Ritu', 'Vijay', 'Kiran', 'Alok', 'Shweta', 'Manoj', 'Anjali',
                      'Sunil', 'Kavita', 'Pradeep', 'Pooja', 'Rakesh', 'Jyoti', 'Harish', 'Nidhi', 'Sanjeev', 'Preeti'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Rao', 'Verma', 'Joshi', 'Mehta', 'Iyer', 'Reddy',
                     'Kumar', 'Das', 'Mishra', 'Choudhury', 'Prasad', 'Nair', 'Goel', 'Sen', 'Tripathi', 'Dubey',
                     'Saxena', 'Pandey', 'Joshi', 'Bose', 'Gill', 'Malhotra', 'Kapoor', 'Roy', 'Jadhav', 'Kulkarni'];

  const teacherData = [];
  let count = 0;
  for (let grade = 1; grade <= 10; grade++) {
    for (const section of ['A', 'B', 'C']) {
      const idx = count;
      teacherData.push({
        firstName: firstNames[idx % firstNames.length],
        lastName: lastNames[idx % lastNames.length],
        subjectIndex: idx % subjects.length,
        isAllSubjectTeacher: grade <= 5,
        grade,
        section
      });
      count++;
    }
  }

  const teacherUsersByClass = {};
  const teachers = [];
  let teacherCount = 1;

  for (const tData of teacherData) {
    const user = await User.create({
      userId: `TEACHER${String(teacherCount).padStart(3, '0')}`,
      password: 'Teacher@123',
      role: 'teacher',
      firstName: tData.firstName,
      lastName: tData.lastName,
      email: `${tData.firstName.toLowerCase()}${teacherCount}@school.com`,
      phone: `987654321${teacherCount}`,
    });

    const teacher = await Teacher.create({
      userId: user.id,
      subjectId: subjects[tData.subjectIndex].id,
      teachingSubjects: tData.isAllSubjectTeacher ? subjects.map((subject) => subject.id) : [subjects[tData.subjectIndex].id],
      isAllSubjectTeacher: tData.isAllSubjectTeacher,
      qualifications: 'B.Ed, M.A',
      experience: tData.isAllSubjectTeacher ? 8 : 5,
      joinDate: new Date('2019-01-01'),
      salary: 50000 + tData.grade * 2500,
    });
    
    teachers.push(teacher);
    teacherUsersByClass[`${tData.grade}-${tData.section}`] = user.id;
    teacherCount += 1;
  }
  console.log(`Created ${teachers.length} teachers`);

  const classes = [];
  for (let grade = 1; grade <= 10; grade += 1) {
    for (const section of ['A', 'B', 'C']) {
      const classTeacherUserId = teacherUsersByClass[`${grade}-${section}`];
      const classData = await Class.create({
        grade,
        section,
        subject: 'General Curriculum',
        classTeacherId: classTeacherUserId
      });
      classes.push(classData);
    }
  }
  console.log(`Created ${classes.length} classes`);

  // Assign multiple teachers to teach different subjects in each class
  for (const classItem of classes) {
    const classTeacher = teachers.find(t => String(t.userId) === String(classItem.classTeacherId));
    if (classTeacher) {
      let assigned = classTeacher.assignedClasses || [];
      if (!assigned.includes(classItem.id)) assigned.push(classItem.id);
      classTeacher.assignedClasses = assigned;
      await classTeacher.save();
    }

    const tIndex = classes.indexOf(classItem);
    const altTeacher1 = teachers[(tIndex + 10) % teachers.length];
    const altTeacher2 = teachers[(tIndex + 20) % teachers.length];
    for (const t of [altTeacher1, altTeacher2]) {
      if (t) {
        let assigned = t.assignedClasses || [];
        if (!assigned.includes(classItem.id)) assigned.push(classItem.id);
        t.assignedClasses = assigned;
        await t.save();
      }
    }
  }

  const parentFirstNames = ['Rajesh', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Neha', 'Suresh', 'Pooja', 'Anil', 'Kavya'];
  const parentLastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Joshi', 'Rao', 'Kumar', 'Reddy', 'Nair'];
  const studentFirstNames = ['Aarav', 'Anaya', 'Arjun', 'Aditi', 'Aditya', 'Aisha', 'Ajay', 'Amrita', 'Akshay', 'Alisha'];
  const studentLastNames = ['Singh', 'Sharma', 'Patel', 'Gupta', 'Kumar', 'Verma', 'Joshi', 'Rao', 'Reddy', 'Nair'];

  const studentsPerClass = 5;
  const studentRecords = [];
  let studentIndex = 0;

  for (const classItem of classes) {
    for (let i = 0; i < studentsPerClass; i += 1) {
      const rollNumber = `G${classItem.grade}-${String(studentIndex + 1).padStart(3, '0')}`;
      const parent = await User.create({
        userId: `PAR-${rollNumber}`,
        password: 'Parent@123',
        role: 'parent',
        firstName: parentFirstNames[studentIndex % parentFirstNames.length],
        lastName: parentLastNames[studentIndex % parentLastNames.length],
        email: `parent-${rollNumber.toLowerCase()}@school.com`,
        phone: `8765432${String(studentIndex).padStart(3, '0')}`,
      });

      const user = await User.create({
        userId: `STUDENT${String(studentIndex + 1).padStart(3, '0')}`,
        password: 'Student@123',
        role: 'student',
        firstName: studentFirstNames[studentIndex % studentFirstNames.length],
        lastName: studentLastNames[(studentIndex + 2) % studentLastNames.length],
        email: `${studentFirstNames[studentIndex % studentFirstNames.length].toLowerCase()}${studentIndex + 1}@school.com`,
        phone: `9876543${String(studentIndex).padStart(3, '0')}`,
      });

      const student = await Student.create({
        userId: user.id,
        rollNumber,
        classId: classItem.id,
        parentId: parent.id,
        admissionDate: new Date('2024-06-01'),
        bloodGroup: 'O+',
        totalFees: 50000 + classItem.grade * 1500,
      });
      studentRecords.push({ student, classItem, user, parent });

      let stList = classItem.students || [];
      stList.push(user.id);
      classItem.students = stList;
      await classItem.save();

      studentIndex += 1;
    }
  }
  console.log(`Created ${studentRecords.length} students`);

  const feeRecords = [];
  for (const { student, classItem } of studentRecords) {
    const amount = 45000 + classItem.grade * 1800 + (classItem.section.charCodeAt(0) - 64) * 400;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(15);
    
    const rollEnd = student.rollNumber.slice(-1);
    let isPaid = false;
    let paidAmount = 0;
    let paymentHistory = [];

    if (['0', '5', '7'].includes(rollEnd)) {
      isPaid = true;
      paidAmount = amount;
      paymentHistory = [{
        amount,
        paymentMethod: ['PhonePe', 'Credit Card', 'Debit Card', 'Cash'][Math.floor(Math.random() * 4)],
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        remark: 'Paid on time',
      }];
    } else if (['1', '6'].includes(rollEnd)) {
      isPaid = false;
      paidAmount = Math.round(amount * 0.4);
      paymentHistory = [{
        amount: Math.round(amount * 0.4),
        paymentMethod: ['PhonePe', 'Cash'][Math.floor(Math.random() * 2)],
        paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        remark: 'First installment paid',
      }];
    } else {
      isPaid = false;
      paidAmount = 0;
    }

    feeRecords.push({
      studentId: student.id,
      amount,
      description: classItem.grade >= 6 ? 'Annual Tuition Fees' : 'Quarterly Tuition Fees',
      dueDate,
      isPaid,
      paidAmount,
      paymentHistory,
      ...(isPaid ? {
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: paymentHistory[0]?.paymentMethod || 'Cash',
      } : {}),
      remarks: isPaid ? 'Paid on time' : paidAmount > 0 ? 'Partially Paid' : 'Pending review',
    });
  }
  await Fee.bulkCreate(feeRecords);
  console.log(`Created ${feeRecords.length} fee records`);

  const homeworkTemplates = [
    { title: 'Practice worksheet on fractions', description: 'Solve problems 1 to 20 and show proper working.' },
    { title: 'Read chapter summary and answer questions', description: 'Write five short answers based on the chapter.' },
    { title: 'Prepare a science observation log', description: 'Record observations from the school garden activity.' },
    { title: 'Write a short essay on community helpers', description: 'Use at least five descriptive sentences.' },
  ];

  const homeworkRecords = [];
  for (const classItem of classes) {
    const teacherUserId = teacherUsersByClass[`${classItem.grade}-${classItem.section}`];
    const teacher = teachers.find(t => t.userId === teacherUserId);
    const subjectPool = subjects.filter((_, index) => index < 4);
    const selectedSubject = subjectPool[(classItem.grade + classItem.section.charCodeAt(0)) % subjectPool.length];
    for (let index = 0; index < 2; index += 1) {
      const template = homeworkTemplates[index % homeworkTemplates.length];
      const assignedDate = new Date();
      assignedDate.setDate(assignedDate.getDate() - (index + 1) * 2);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (index + 1) * 3);
      homeworkRecords.push({
        classId: classItem.id,
        subjectId: selectedSubject.id,
        teacherId: teacher?.id || 1,
        title: `${template.title} · ${classItem.section}`,
        description: template.description,
        assignedDate,
        dueDate,
      });
    }
  }
  await Homework.bulkCreate(homeworkRecords);
  console.log(`Created ${homeworkRecords.length} homework records`);

  const marksRecords = [];
  const examTypes = ['Unit Test', 'Mid-Term', 'Final'];
  for (let idx = 0; idx < studentRecords.length; idx++) {
    const { student, classItem, user } = studentRecords[idx];
    const examDate = new Date();
    examDate.setDate(examDate.getDate() - 15);

    subjects.forEach((subject, subIdx) => {
      const teacherUserId = teacherUsersByClass[`${classItem.grade}-${classItem.section}`] || teachers[subIdx % teachers.length].userId;
      const teacher = teachers.find(t => t.userId === teacherUserId);

      examTypes.forEach((examType, examIdx) => {
        const baseScore = 60 + ((idx + subIdx + classItem.grade + examIdx * 5) % 25);
        const marksValue = idx % 8 >= 6 ? baseScore - 12 : baseScore + 8;

        marksRecords.push({
          studentId: student.id,
          teacherId: teacher?.id || 1,
          subjectId: subject.id,
          classId: classItem.id,
          marks: Math.min(100, Math.max(0, marksValue)),
          examType,
          examDate: new Date(examDate.getTime() + examIdx * 5 * 24 * 60 * 60 * 1000),
        });
      });
    });
  }
  const insertedMarks = await Marks.bulkCreate(marksRecords);
  console.log(`Created ${insertedMarks.length} mark records`);

  const allDates = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(Date.UTC(currentYear, 0, 1));
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  let tempDate = new Date(startDate);
  while (tempDate <= endDate) {
    const day = tempDate.getUTCDay();
    const dateNum = tempDate.getUTCDate();
    const isSecondSaturday = (day === 6 && dateNum >= 8 && dateNum <= 14);
    if (day !== 0 && !isSecondSaturday) {
      allDates.push(new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate(), 12, 0, 0, 0)));
    }
    tempDate.setUTCDate(tempDate.getUTCDate() + 1);
  }

  const attendanceDocs = [];
  studentRecords.forEach(({ student, classItem, user }, idx) => {
    const studentRate = 0.75 + ((idx % 23) / 100);
    for (const d of allDates) {
      const isPresent = Math.random() < studentRate;
      const status = isPresent ? 'Present' : 'Absent';
      attendanceDocs.push({
        studentId: student.id,
        classId: classItem.id,
        date: d,
        status: status,
        remarks: status === 'Absent' ? 'Medical leave' : 'On time',
      });
    }
  });
  
  // BulkCreate in chunks to prevent memory issues with many attendance records
  const chunkSize = 5000;
  for (let i = 0; i < attendanceDocs.length; i += chunkSize) {
    await Attendance.bulkCreate(attendanceDocs.slice(i, i + chunkSize));
  }
  console.log(`Created ${attendanceDocs.length} attendance records`);

  const examRecords = [];
  const types = ['Unit Test', 'Half-Yearly', 'Quarterly', 'Annual', 'Mid-Term', 'Final', 'Practical'];
  for (const classItem of classes) {
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      for (let j = 0; j < subjects.length; j++) {
        const subject = subjects[j];
        examRecords.push({
          name: `${type} - ${subject.name}`,
          classId: classItem.id,
          subjectId: subject.id,
          examDate: j === 0 ? new Date() : new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000 + j * 24 * 60 * 60 * 1000),
          examType: type,
          startTime: '09:00',
          endTime: '11:00',
          totalMarks: 100,
          room: `Room ${100 + (classItem.grade - 1) * 10 + (j % 8) + 1}`,
          description: `Scheduled evaluation for ${type} in Grade ${classItem.grade} Section ${classItem.section}.`,
        });
      }
    }
  }
  await Exam.bulkCreate(examRecords);
  console.log(`Created ${examRecords.length} examination records`);

  const eventRecords = [];
  const eventData = [
    { title: 'Parent-Teacher Meeting (PTM)', description: 'Discuss term progress and classroom goals.', eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), eventType: 'Academic', location: 'Main Hall' },
    { title: 'Science Fair', description: 'Students present innovative projects and experiments.', eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), eventType: 'Cultural', location: 'Science Lab' },
    { title: 'Annual Sports Day', description: 'Track and field activities for all grades.', eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), eventType: 'Sports', location: 'Playground' },
    { title: 'Cultural Festival (CCA)', description: 'Dance, drama, and music performances by students.', eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), eventType: 'Cultural', location: 'Auditorium' },
    { title: 'CCA Drawing & Craft Activity', description: 'Showcase of student paintings, sculptures, and handmade crafts.', eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), eventType: 'Cultural', location: 'Art Room & Gallery' },
    { title: 'Inter-School Debate Championship', description: 'Declamation and debate competition on modern global issues.', eventDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), eventType: 'Academic', location: 'Seminar Hall' },
    { title: 'Career Counseling Seminar', description: 'Expert lectures for high school students regarding college admissions.', eventDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000), eventType: 'Academic', location: 'Auditorium' },
    { title: 'Independence Day Celebration', description: 'Flag hoisting ceremony followed by patriotic songs and dance performances.', eventDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000), eventType: 'Celebration', location: 'School Assembly Ground' },
    { title: 'Mid-Term Examinations', description: 'Formal mid-term examination for all grades.', eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), eventType: 'Academic', location: 'Respective Classrooms' },
    { title: 'Weekly Teachers Meeting', description: 'Staff meeting to discuss weekly syllabus progress and evaluations.', eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), eventType: 'Teachers Meeting', location: 'Staff Room' },
    { title: 'Inter-House Basketball Tournament', description: 'Annual inter-house sports event.', eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), eventType: 'Sports', location: 'Basketball Court' }
  ];

  for (const event of eventData) {
    eventRecords.push({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      startTime: '10:00',
      endTime: '13:00',
      location: event.location,
      organizerId: superAdmin.id,
      eventType: event.eventType,
    });
  }
  await Event.bulkCreate(eventRecords);
  console.log(`Created ${eventRecords.length} events`);

  const teacherUsers = await User.findAll({ where: { role: 'teacher' }, limit: 4 });
  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt;
  };

  const leaveSeeds = [
    {
      applicantUserId: teacherUsers[0]?.id || 1,
      applicantRole: 'teacher',
      applicantName: `${teacherUsers[0]?.firstName} ${teacherUsers[0]?.lastName}`,
      applicantId: teacherUsers[0]?.userId || 'T1',
      leaveType: 'Sick Leave',
      fromDate: d(1),
      toDate: d(3),
      reason: 'Fever and viral infection, doctor advised rest for 3 days.',
      status: 'pending',
    },
    {
      applicantUserId: teacherUsers[1]?.id || 1,
      applicantRole: 'teacher',
      applicantName: `${teacherUsers[1]?.firstName} ${teacherUsers[1]?.lastName}`,
      applicantId: teacherUsers[1]?.userId || 'T2',
      leaveType: 'Casual Leave',
      fromDate: d(5),
      toDate: d(5),
      reason: 'Family function on Saturday.',
      status: 'pending',
    },
    {
      applicantUserId: teacherUsers[2]?.id || 1,
      applicantRole: 'teacher',
      applicantName: `${teacherUsers[2]?.firstName} ${teacherUsers[2]?.lastName}`,
      applicantId: teacherUsers[2]?.userId || 'T3',
      leaveType: 'Emergency Leave',
      fromDate: d(-2),
      toDate: d(-1),
      reason: 'Medical emergency in family.',
      status: 'approved',
      remarks: 'Granted. Please ensure substitute arrangement.',
    },
    {
      applicantUserId: teacherUsers[3]?.id || 1,
      applicantRole: 'teacher',
      applicantName: `${teacherUsers[3]?.firstName} ${teacherUsers[3]?.lastName}`,
      applicantId: teacherUsers[3]?.userId || 'T4',
      leaveType: 'Earned Leave',
      fromDate: d(-5),
      toDate: d(-3),
      reason: 'Annual vacation plan.',
      status: 'rejected',
      remarks: 'Exam season — please reschedule after exams.',
    },
  ];

  await Leave.bulkCreate(leaveSeeds);
  console.log(`Created ${leaveSeeds.length} demo leave requests`);

  const employeeData = [
    { firstName: 'Amit', lastName: 'Kumar', employeeType: 'High School', designation: 'Mathematics PGT', dateOfJoining: new Date('2020-07-15'), baseSalary: 45000 },
    { firstName: 'Vikram', lastName: 'Rathore', employeeType: 'High School', designation: 'Physics PGT', dateOfJoining: new Date('2019-09-05'), baseSalary: 48000 },
    { firstName: 'Meera', lastName: 'Nair', employeeType: 'High School', designation: 'Chemistry PGT', dateOfJoining: new Date('2020-11-20'), baseSalary: 47000 },
    { firstName: 'Sunita', lastName: 'Rani', employeeType: 'Junior School', designation: 'Science TGT', dateOfJoining: new Date('2021-08-20'), baseSalary: 38000 },
    { firstName: 'Rahul', lastName: 'Verma', employeeType: 'Junior School', designation: 'English Primary Teacher', dateOfJoining: new Date('2022-06-01'), baseSalary: 35000 },
    { firstName: 'Preeti', lastName: 'Joshi', employeeType: 'Junior School', designation: 'Mathematics TGT', dateOfJoining: new Date('2021-04-18'), baseSalary: 37000 },
    { firstName: 'Nisha', lastName: 'Sharma', employeeType: 'Pre-Primary', designation: 'Kindergarten Teacher', dateOfJoining: new Date('2023-01-10'), baseSalary: 28000 },
    { firstName: 'Sanjana', lastName: 'Sen', employeeType: 'Pre-Primary', designation: 'Nursery Teacher', dateOfJoining: new Date('2024-02-15'), baseSalary: 27000 },
    { firstName: 'Pooja', lastName: 'Mehta', employeeType: 'Pre-Primary', designation: 'Kindergarten Assistant', dateOfJoining: new Date('2025-05-10'), baseSalary: 22000 },
    { firstName: 'Anil', lastName: 'Kapoor', employeeType: 'Non-Teaching Staff', designation: 'Accountant Clerk', dateOfJoining: new Date('2018-05-10'), baseSalary: 30000 },
    { firstName: 'Geeta', lastName: 'Kumari', employeeType: 'Non-Teaching Staff', designation: 'Librarian', dateOfJoining: new Date('2019-11-01'), baseSalary: 32000 },
    { firstName: 'Ravi', lastName: 'Teja', employeeType: 'Non-Teaching Staff', designation: 'IT Support Specialist', dateOfJoining: new Date('2022-03-12'), baseSalary: 35000 },
    { firstName: 'Kiran', lastName: 'Bedi', employeeType: 'Non-Teaching Staff', designation: 'Administrative Officer', dateOfJoining: new Date('2015-06-01'), baseSalary: 55000 },
    { firstName: 'Suresh', lastName: 'Raina', employeeType: 'Non-Teaching Staff', designation: 'Office Assistant', dateOfJoining: new Date('2023-08-01'), baseSalary: 25000 },
    { firstName: 'Deepa', lastName: 'Rao', employeeType: 'Non-Teaching Staff', designation: 'Senior Receptionist', dateOfJoining: new Date('2017-03-15'), baseSalary: 29000 },
  ];

  const employeeDocs = employeeData.map((emp, i) => ({
    firstName: emp.firstName,
    lastName: emp.lastName,
    employeeId: `EMP-${1000 + i}`,
    employeeType: emp.employeeType,
    designation: emp.designation,
    dateOfJoining: emp.dateOfJoining,
    salary: { baseSalary: emp.baseSalary },
    userId: 1, // Linking to superadmin for simplicity
    schoolId: defaultSchool.id,
  }));

  await Employee.bulkCreate(employeeDocs);
  console.log(`Created ${employeeDocs.length} employees`);

  const libraryBooks = [
    {
      title: "Introduction to Algorithms",
      isbn: "9780262033848",
      author: "Thomas H. Cormen",
      publisher: "MIT Press",
      publicationYear: 2009,
      category: "textbook",
      subject: "Computer Science",
      description: "A comprehensive guide to algorithm design and analysis.",
      totalCopies: 10,
      availableCopies: 8,
      schoolId: defaultSchool.id,
      status: "available"
    },
    {
      title: "To Kill a Mockingbird",
      isbn: "9780446310789",
      author: "Harper Lee",
      publisher: "Grand Central Publishing",
      publicationYear: 1988,
      category: "fiction",
      subject: "English Literature",
      description: "The classic novel about racial injustice and the destruction of innocence.",
      totalCopies: 5,
      availableCopies: 3,
      schoolId: defaultSchool.id,
      status: "available"
    },
    {
      title: "A Brief History of Time",
      isbn: "9780553380163",
      author: "Stephen Hawking",
      publisher: "Bantam Books",
      publicationYear: 1998,
      category: "non-fiction",
      subject: "Physics",
      description: "A landmark volume in science writing by one of the great minds of our time.",
      totalCopies: 7,
      availableCopies: 7,
      schoolId: defaultSchool.id,
      status: "available"
    }
  ];
  await Library.bulkCreate(libraryBooks);
  console.log(`Created ${libraryBooks.length} library books`);

  const transportRoutes = [
    {
      routeName: "Route A - North City",
      routeNumber: "RT-101",
      schoolId: defaultSchool.id,
      vehicle: {
        vehicleNumber: "TS 09 UA 1234",
        vehicleType: "Bus",
        manufacturer: "Tata Motors",
        capacity: 40,
        registrationNumber: "REG-991122"
      },
      driver: {
        driverId: "DRV-101",
        driverName: "Ram Singh",
        licenseNumber: "DL-123456789",
        phone: "9848022338",
        address: "Secunderabad, Hyderabad"
      },
      startPoint: { name: "North Station" },
      endPoint: { name: "Greenwood High School" },
      pickupTime: "07:30",
      dropTime: "16:30",
      distance: 12.5,
      fare: 1500,
      status: "active"
    },
    {
      routeName: "Route B - West suburbs",
      routeNumber: "RT-102",
      schoolId: defaultSchool.id,
      vehicle: {
        vehicleNumber: "TS 09 UB 5678",
        vehicleType: "Bus",
        manufacturer: "Leyland",
        capacity: 35,
        registrationNumber: "REG-993344"
      },
      driver: {
        driverId: "DRV-102",
        driverName: "Krishna Rao",
        licenseNumber: "DL-987654321",
        phone: "9848033445",
        address: "Kukatpally, Hyderabad"
      },
      startPoint: { name: "West Gate" },
      endPoint: { name: "Greenwood High School" },
      pickupTime: "07:45",
      dropTime: "16:45",
      distance: 10.2,
      fare: 1200,
      status: "active"
    }
  ];
  await Transport.bulkCreate(transportRoutes);
  console.log(`Created ${transportRoutes.length} transport routes`);

  const hostels = [
    {
      hostelName: "Newton Boys Hostel",
      hostelType: "boys",
      schoolId: defaultSchool.id,
      address: {
        street: "Hostel Block A, School Campus",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500001"
      },
      wardenName: "Mr. Ramesh Sharma",
      wardenPhone: "9848099887",
      totalRooms: 50,
      totalBeds: 150,
      availableBeds: 120,
      monthlyFee: 3500,
      status: "active"
    },
    {
      hostelName: "Curie Girls Hostel",
      hostelType: "girls",
      schoolId: defaultSchool.id,
      address: {
        street: "Hostel Block B, School Campus",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500001"
      },
      wardenName: "Mrs. Lalitha Prasad",
      wardenPhone: "9848088776",
      totalRooms: 40,
      totalBeds: 120,
      availableBeds: 100,
      monthlyFee: 3500,
      status: "active"
    }
  ];
  await Hostel.bulkCreate(hostels);
  console.log(`Created ${hostels.length} hostels`);
};

module.exports = seedDataFn;
