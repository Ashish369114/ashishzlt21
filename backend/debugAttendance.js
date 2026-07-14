const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Student = require('./models/Student');

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  // Check total attendance records
  const totalAttendance = await Attendance.countDocuments();
  console.log('Total attendance records:', totalAttendance);

  // Get a sample attendance record
  const sample = await Attendance.findOne({}).lean();
  console.log('\nSample attendance record:');
  console.log(JSON.stringify(sample, null, 2));

  // Get a sample student
  const student = await Student.findOne({}).lean();
  console.log('\nSample student record:');
  console.log(JSON.stringify(student, null, 2));

  process.exit(0);
});
