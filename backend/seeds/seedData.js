require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Homework = require('../models/Homework');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-management-system';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Class.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Fee.deleteMany({}),
      Homework.deleteMany({}),
      Marks.deleteMany({}),
      Attendance.deleteMany({}),
      Exam.deleteMany({}),
      Event.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    const subjectsData = [
      { name: 'Mathematics' },
      { name: 'Science' },
      { name: 'Social Studies' },
      { name: 'English' },
      { name: 'Telugu' },
      { name: 'Hindi' },
      { name: 'Environmental Science (EVS)' },
    ];

    const subjects = await Subject.insertMany(subjectsData);
    console.log(`Created ${subjects.length} subjects`);

    const superAdmin = new User({
      userId: 'SUPERADMIN001',
      password: 'Admin@123',
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@school.com',
      phone: '9876543210',
    });
    await superAdmin.save();

    const principal = new User({
      userId: 'PRINCIPAL001',
      password: 'Principal@123',
      role: 'principal',
      firstName: 'Dr.',
      lastName: 'Kumar',
      email: 'principal@school.com',
      phone: '9876543211',
    });
    await principal.save();

    const accountant = new User({
      userId: 'ACCOUNTANT001',
      password: 'Accountant@123',
      role: 'accountant_admin',
      firstName: 'Ravi',
      lastName: 'Verma',
      email: 'accountant@school.com',
      phone: '9876543299',
    });
    await accountant.save();
    console.log('Created admin accounts');

    const teacherData = [
      { firstName: 'Ramesh', lastName: 'Sharma', subjectIndex: 0, isAllSubjectTeacher: true, grade: 1 },
      { firstName: 'Priya', lastName: 'Patel', subjectIndex: 1, isAllSubjectTeacher: true, grade: 2 },
      { firstName: 'Rajesh', lastName: 'Singh', subjectIndex: 2, isAllSubjectTeacher: true, grade: 3 },
      { firstName: 'Sneha', lastName: 'Gupta', subjectIndex: 3, isAllSubjectTeacher: true, grade: 4 },
      { firstName: 'Suresh', lastName: 'Rao', subjectIndex: 4, isAllSubjectTeacher: true, grade: 5 },
      { firstName: 'Neha', lastName: 'Verma', subjectIndex: 5, isAllSubjectTeacher: false, grade: 6 },
      { firstName: 'Vikram', lastName: 'Joshi', subjectIndex: 6, isAllSubjectTeacher: false, grade: 7 },
      { firstName: 'Asha', lastName: 'Mehta', subjectIndex: 0, isAllSubjectTeacher: false, grade: 8 },
      { firstName: 'Karthik', lastName: 'Iyer', subjectIndex: 2, isAllSubjectTeacher: false, grade: 9 },
      { firstName: 'Nisha', lastName: 'Reddy', subjectIndex: 4, isAllSubjectTeacher: false, grade: 10 },
    ];

    const teacherUsersByGrade = {};
    const teachers = [];
    let teacherCount = 1;

    for (const tData of teacherData) {
      const user = new User({
        userId: `TEACHER${String(teacherCount).padStart(3, '0')}`,
        password: 'Teacher@123',
        role: 'teacher',
        firstName: tData.firstName,
        lastName: tData.lastName,
        email: `${tData.firstName.toLowerCase()}${teacherCount}@school.com`,
        phone: `987654321${teacherCount}`,
      });
      await user.save();

      const teacher = new Teacher({
        userId: user._id,
        subject: subjects[tData.subjectIndex]._id,
        teachingSubjects: tData.isAllSubjectTeacher ? subjects.map((subject) => subject._id) : [subjects[tData.subjectIndex]._id],
        isAllSubjectTeacher: tData.isAllSubjectTeacher,
        qualifications: 'B.Ed, M.A',
        experience: tData.isAllSubjectTeacher ? 8 : 5,
        joinDate: new Date('2019-01-01'),
        salary: 50000 + tData.grade * 2500,
      });
      await teacher.save();
      teachers.push(teacher);
      teacherUsersByGrade[tData.grade] = user._id;
      teacherCount += 1;
    }
    console.log(`Created ${teachers.length} teachers`);

    const classes = [];
    for (let grade = 1; grade <= 10; grade += 1) {
      for (const section of ['A', 'B', 'C']) {
        const classData = new Class({
          grade,
          section,
          subject: 'Core',
        });
        await classData.save();
        classes.push(classData);
      }
    }
    console.log(`Created ${classes.length} classes`);

    for (let teacherIndex = 0; teacherIndex < teachers.length; teacherIndex += 1) {
      const teacherDataItem = teacherData[teacherIndex];
      const matchingClasses = classes.filter((cls) => Number(cls.grade) === Number(teacherDataItem.grade));
      for (const classItem of matchingClasses) {
        await Teacher.findByIdAndUpdate(teachers[teacherIndex]._id, {
          $addToSet: { assignedClasses: classItem._id },
        });
        await Class.findByIdAndUpdate(classItem._id, {
          classTeacher: teachers[teacherIndex].userId,
        });
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
        const parent = new User({
          userId: `PAR-${rollNumber}`,
          password: 'Parent@123',
          role: 'parent',
          firstName: parentFirstNames[studentIndex % parentFirstNames.length],
          lastName: parentLastNames[studentIndex % parentLastNames.length],
          email: `parent-${rollNumber.toLowerCase()}@school.com`,
          phone: `8765432${String(studentIndex).padStart(3, '0')}`,
        });
        await parent.save();

        const user = new User({
          userId: `STUDENT${String(studentIndex + 1).padStart(3, '0')}`,
          password: 'Student@123',
          role: 'student',
          firstName: studentFirstNames[studentIndex % studentFirstNames.length],
          lastName: studentLastNames[(studentIndex + 2) % studentLastNames.length],
          email: `${studentFirstNames[studentIndex % studentFirstNames.length].toLowerCase()}${studentIndex + 1}@school.com`,
          phone: `9876543${String(studentIndex).padStart(3, '0')}`,
        });
        await user.save();

        const student = new Student({
          userId: user._id,
          rollNumber,
          class: classItem._id,
          parentId: parent._id,
          admissionDate: new Date('2024-06-01'),
          bloodGroup: 'O+',
          totalFees: 50000 + classItem.grade * 1500,
        });
        await student.save();
        studentRecords.push({ student, classItem, user, parent });

        await Class.findByIdAndUpdate(classItem._id, {
          $push: { students: user._id },
        });

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
      const isPaid = student.rollNumber.endsWith('0') || student.rollNumber.endsWith('5') || student.rollNumber.endsWith('7') ? true : false;
      const fee = new Fee({
        student: student.userId,
        amount,
        description: classItem.grade >= 6 ? 'Annual Tuition Fees' : 'Quarterly Tuition Fees',
        dueDate,
        isPaid,
        ...(isPaid ? {
          paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          paymentMethod: ['PhonePe', 'Credit Card', 'Debit Card', 'Cash'][Math.floor(Math.random() * 4)],
        } : {}),
        remarks: isPaid ? 'Paid on time' : 'Pending review',
      });
      await fee.save();
      feeRecords.push(fee);
    }
    console.log(`Created ${feeRecords.length} fee records`);

    const homeworkTemplates = [
      { title: 'Practice worksheet on fractions', description: 'Solve problems 1 to 20 and show proper working.' },
      { title: 'Read chapter summary and answer questions', description: 'Write five short answers based on the chapter.' },
      { title: 'Prepare a science observation log', description: 'Record observations from the school garden activity.' },
      { title: 'Write a short essay on community helpers', description: 'Use at least five descriptive sentences.' },
    ];

    const homeworkRecords = [];
    for (const classItem of classes) {
      const teacherUserId = teacherUsersByGrade[classItem.grade];
      const subjectPool = subjects.filter((_, index) => index < 4);
      const selectedSubject = subjectPool[(classItem.grade + classItem.section.charCodeAt(0)) % subjectPool.length];
      for (let index = 0; index < 2; index += 1) {
        const template = homeworkTemplates[index % homeworkTemplates.length];
        const assignedDate = new Date();
        assignedDate.setDate(assignedDate.getDate() - (index + 1) * 2);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (index + 1) * 3);
        const homework = new Homework({
          class: classItem._id,
          subject: selectedSubject._id,
          teacher: teacherUserId,
          title: `${template.title} · ${classItem.section}`,
          description: template.description,
          assignedDate,
          dueDate,
        });
        await homework.save();
        homeworkRecords.push(homework);
      }
    }
    console.log(`Created ${homeworkRecords.length} homework records`);

    const marksRecords = [];
    const subjectPoolForMarks = [subjects[0], subjects[3], subjects[1]];
    for (const { student, classItem, user } of studentRecords) {
      const teacherUserId = teacherUsersByGrade[classItem.grade];
      const baseSubject = subjectPoolForMarks[(classItem.grade + classItem.section.charCodeAt(0)) % subjectPoolForMarks.length];
      const secondSubject = subjectPoolForMarks[(classItem.grade + 1 + classItem.section.charCodeAt(0)) % subjectPoolForMarks.length];
      const scoreOne = 58 + ((studentIndex + classItem.grade) % 35);
      const scoreTwo = 62 + ((studentIndex + classItem.grade + 2) % 30);
      const examDate = new Date();
      examDate.setDate(examDate.getDate() - 7);

      const markOne = new Marks({
        student: user._id,
        teacher: teacherUserId,
        subject: baseSubject._id,
        class: classItem._id,
        marks: scoreOne,
        examType: classItem.grade >= 6 ? 'Mid-Term' : 'Unit Test',
        examDate,
      });
      await markOne.save();
      marksRecords.push(markOne);

      const markTwo = new Marks({
        student: user._id,
        teacher: teacherUserId,
        subject: secondSubject._id,
        class: classItem._id,
        marks: scoreTwo,
        examType: classItem.grade >= 6 ? 'Final' : 'Mid-Term',
        examDate: new Date(examDate.getTime() + 12 * 24 * 60 * 60 * 1000),
      });
      await markTwo.save();
      marksRecords.push(markTwo);
    }
    console.log(`Created ${marksRecords.length} mark records`);

    const attendanceRecords = [];
    for (const { student, classItem, user } of studentRecords) {
      const dates = [new Date(), new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)];
      const statuses = ['Present', 'Present', 'Absent'];
      for (let index = 0; index < 3; index += 1) {
        const attendance = new Attendance({
          student: user._id,
          class: classItem._id,
          date: dates[index],
          status: statuses[index],
          remarks: statuses[index] === 'Absent' ? 'Medical leave' : 'On time',
        });
        await attendance.save();
        attendanceRecords.push(attendance);
      }
    }
    console.log(`Created ${attendanceRecords.length} attendance records`);

    const examRecords = [];
    for (const classItem of classes) {
      const subject = subjects[(classItem.grade + classItem.section.charCodeAt(0)) % subjects.length];
      const examOne = new Exam({
        name: classItem.grade <= 5 ? 'Unit Test 1' : 'Mid-Term Examination',
        class: classItem._id,
        subject: subject._id,
        examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        startTime: '09:00',
        endTime: '10:30',
        totalMarks: 100,
        room: `Room ${20 + classItem.grade}`,
        description: `Scheduled for Grade ${classItem.grade} Section ${classItem.section}. Results will be announced next week.`,
      });
      await examOne.save();
      examRecords.push(examOne);

      const examTwo = new Exam({
        name: classItem.grade <= 5 ? 'Weekly Assessment' : 'Final Assessment',
        class: classItem._id,
        subject: subjects[(classItem.grade + 2 + classItem.section.charCodeAt(0)) % subjects.length]._id,
        examDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startTime: '11:00',
        endTime: '12:00',
        totalMarks: 50,
        room: `Room ${25 + classItem.grade}`,
        description: `Practical evaluation for Grade ${classItem.grade} Section ${classItem.section}.`,
      });
      await examTwo.save();
      examRecords.push(examTwo);
    }
    console.log(`Created ${examRecords.length} examination records`);

    const eventRecords = [];
    const eventData = [
      { title: 'Parent-Teacher Meeting', description: 'Discuss term progress and classroom goals.', eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), eventType: 'Academic', location: 'Main Hall' },
      { title: 'Science Fair', description: 'Students present innovative projects and experiments.', eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), eventType: 'Cultural', location: 'Science Lab' },
      { title: 'Annual Sports Day', description: 'Track and field activities for all grades.', eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), eventType: 'Sports', location: 'Playground' },
      { title: 'Cultural Festival', description: 'Dance, drama, and music performances by students.', eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), eventType: 'Cultural', location: 'Auditorium' },
    ];

    for (const event of eventData) {
      const eventDoc = new Event({
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        startTime: '10:00',
        endTime: '13:00',
        location: event.location,
        organizer: superAdmin._id,
        eventType: event.eventType,
      });
      await eventDoc.save();
      eventRecords.push(eventDoc);
    }
    console.log(`Created ${eventRecords.length} events`);

    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
