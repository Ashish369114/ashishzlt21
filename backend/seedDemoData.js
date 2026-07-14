const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Library = require('./models/Library');
const Fee = require('./models/Fee');
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedData() {
  try {
    console.log('Seeding Demo Data...');

    // 1. Create a dummy Class
    let classA = await Class.findOne({ grade: 10, section: 'A' });
    if (!classA) {
      classA = await Class.create({ grade: 10, section: 'A' });
      console.log('Created Class 10A');
    }

    // 2. Create some dummy Students and Users
    const students = [
      { firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@student.com', role: 'student', admissionNumber: 'STD001', rollNumber: '1', dateOfBirth: '2010-05-10', gender: 'Male' },
      { firstName: 'Priya', lastName: 'Sharma', email: 'priya@student.com', role: 'student', admissionNumber: 'STD002', rollNumber: '2', dateOfBirth: '2010-08-15', gender: 'Female' },
      { firstName: 'Amit', lastName: 'Patel', email: 'amit@student.com', role: 'student', admissionNumber: 'STD003', rollNumber: '3', dateOfBirth: '2010-11-20', gender: 'Male' },
    ];

    for (let s of students) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({ firstName: s.firstName, lastName: s.lastName, userId: s.admissionNumber, email: s.email, password: 'password123', role: 'student' });
        await Student.create({
          userId: user._id,
          rollNumber: s.rollNumber,
          class: classA._id,
          admissionDate: new Date(),
          bloodGroup: 'O+',
          emergencyContact: '9999999999',
          feesPaid: 10000,
          totalFees: 50000,
        });
        console.log(`Created Student: ${s.firstName} ${s.lastName}`);
      }
    }

    // 3. Create dummy Teachers
    const teachers = [
      { firstName: 'Arun', lastName: 'Singh', email: 'arun@teacher.com', role: 'teacher', designation: 'Math Teacher', userId: 'TCH001' },
      { firstName: 'Meera', lastName: 'Reddy', email: 'meera@teacher.com', role: 'teacher', designation: 'Science Teacher', userId: 'TCH002' },
    ];
    let teacherIds = [];
    for (let t of teachers) {
      let user = await User.findOne({ email: t.email });
      if (!user) {
        user = await User.create({ firstName: t.firstName, lastName: t.lastName, userId: t.userId, email: t.email, password: 'password123', role: 'teacher', designation: t.designation });
        console.log(`Created Teacher: ${t.firstName}`);
      }
      teacherIds.push(user._id);
    }

    // 4. Create Subjects
    let mathSubj = await Subject.findOne({ name: 'Mathematics' });
    if (!mathSubj) {
      mathSubj = await Subject.create({ name: 'Mathematics', code: 'MATH101', class: classA._id, teacher: teacherIds[0] });
      console.log('Created Subject: Mathematics');
    }

    // 5. Create Exams
    let exam1 = await Exam.findOne({ name: 'Mid-Term Mathematics' });
    if (!exam1) {
      await Exam.create({
        name: 'Mid-Term Mathematics',
        class: classA._id,
        subject: mathSubj._id,
        examDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        startTime: '10:00',
        endTime: '12:00',
        totalMarks: 100,
        passingMarks: 40,
        roomNumber: 'Room 101',
        invigilator: teacherIds[0],
        status: 'Scheduled',
      });
      console.log('Created Exam: Mid-Term Mathematics');
    }

    // 6. Create Fees
    let studentForFee = await Student.findOne({ rollNumber: '1' });
    let fee1 = await Fee.findOne({ title: 'Tuition Fee - Term 1' });
    if (!fee1 && studentForFee) {
      await Fee.create({
        title: 'Tuition Fee - Term 1',
        class: classA._id,
        student: studentForFee._id,
        amount: 5000,
        dueDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      });
      console.log('Created Fee: Tuition Fee - Term 1');
    }

    // 7. Create Event
    let event1 = await Event.findOne({ title: 'Annual Sports Day' });
    if (!event1) {
      await Event.create({
        title: 'Annual Sports Day',
        description: 'The Annual Sports Day will be held next month. All students are requested to participate.',
        eventDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
        audience: ['student', 'teacher', 'parent'],
        type: 'event'
      });
      console.log('Created Event: Annual Sports Day');
    }

    console.log('Seed data insertion complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
