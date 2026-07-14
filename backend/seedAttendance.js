const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Student = require('./models/Student');

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAttendance = async () => {
  try {
    const students = await Student.find();
    console.log('Found students:', students.length);
    
    const year = 2026;
    const records = [];
    const statuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Leave', 'Present'];

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    for (const student of students) {
      if (!student.class) continue;

      for (let m = 0; m <= 6; m++) { // Jan to July
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          // Use UTC noon to prevent timezone shifts when stored in MongoDB
          const date = new Date(Date.UTC(year, m, day, 12, 0, 0, 0));
          
          if (date > today) continue;
          
          // Use UTC day for weekend checks
          const dayOfWeek = date.getUTCDay();
          if (dayOfWeek === 0) continue; // Sunday
          if (dayOfWeek === 6 && day >= 8 && day <= 14) continue; // 2nd Saturday
          
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          records.push({
            student: student.userId || student._id,
            class: student.class,
            date: date,
            status: status,
            remarks: status === 'Absent' ? 'Unexcused' : (status === 'Leave' ? 'Sick' : '')
          });
        }
      }
    }

    await Attendance.deleteMany({});
    await Attendance.insertMany(records);
    console.log(`Successfully inserted ${records.length} attendance records for Jan-July 2026 up to today!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAttendance();
