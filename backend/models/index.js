const { sequelize } = require('../config/db');

// Import all models
const Admission = require('./Admission');
const Attendance = require('./Attendance');
const Class = require('./Class');
const ConcessionRequest = require('./ConcessionRequest');
const Employee = require('./Employee');
const Event = require('./Event');
const Exam = require('./Exam');
const Expense = require('./Expense');
const Fee = require('./Fee');
const Homework = require('./Homework');
const Hostel = require('./Hostel');
const Leave = require('./Leave');
const Library = require('./Library');
const Marks = require('./Marks');
const Remark = require('./Remark');
const Report = require('./Report');
const School = require('./School');
const Settings = require('./Settings');
const Student = require('./Student');
const Subject = require('./Subject');
const Teacher = require('./Teacher');
const Transport = require('./Transport');
const User = require('./User');
const UserEnhanced = require('./UserEnhanced');

User.hasOne(Student, { as: 'studentProfile', foreignKey: 'userId' });
Student.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Student, { as: 'children', foreignKey: 'parentId' });
Student.belongsTo(User, { as: 'parent', foreignKey: 'parentId' });

Class.hasMany(Student, { as: 'students', foreignKey: 'classId' });
Student.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

Class.belongsTo(User, { as: 'classTeacher', foreignKey: 'classTeacherId' });

User.hasOne(Teacher, { as: 'teacherProfile', foreignKey: 'userId' });
Teacher.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Teacher.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });

User.hasOne(Employee, { foreignKey: 'userId' });
Employee.belongsTo(User, { as: 'user', foreignKey: 'userId' });

School.hasMany(Employee, { as: 'employees', foreignKey: 'schoolId' });
Employee.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

Class.hasMany(Employee, { as: 'employees', foreignKey: 'classId' });
Employee.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

Admission.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });
Admission.belongsTo(Class, { as: 'appliedForClass', foreignKey: 'appliedForClassId' });
Admission.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

Attendance.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Attendance.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

ConcessionRequest.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
ConcessionRequest.belongsTo(Fee, { as: 'fee', foreignKey: 'feeId' });
ConcessionRequest.belongsTo(User, { as: 'requestedBy', foreignKey: 'requestedById' });
ConcessionRequest.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

School.hasMany(User, { foreignKey: 'schoolId' });
User.belongsTo(School, { foreignKey: 'schoolId' });

Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });

Exam.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
Exam.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
Exam.belongsTo(Teacher, { as: 'invigilator', foreignKey: 'invigilatorId' });

Fee.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Expense.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
Expense.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

Homework.belongsTo(Class, { as: 'class', foreignKey: 'classId' });
Homework.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
Homework.belongsTo(Teacher, { as: 'teacher', foreignKey: 'teacherId' });

Hostel.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

Leave.belongsTo(User, { as: 'applicant', foreignKey: 'applicantUserId' });
Leave.belongsTo(User, { as: 'reviewedBy', foreignKey: 'reviewedById' });

Library.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

Marks.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Marks.belongsTo(Teacher, { as: 'teacher', foreignKey: 'teacherId' });
Marks.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
Marks.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

Remark.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
Remark.belongsTo(Teacher, { as: 'teacher', foreignKey: 'teacherId' });
Remark.belongsTo(Subject, { as: 'subject', foreignKey: 'subjectId' });
Remark.belongsTo(Class, { as: 'class', foreignKey: 'classId' });

Report.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });
Report.belongsTo(User, { as: 'generatedBy', foreignKey: 'generatedById' });

School.belongsTo(User, { as: 'principal', foreignKey: 'principalId' });

Settings.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

Transport.belongsTo(School, { as: 'school', foreignKey: 'schoolId' });

module.exports = {
  sequelize,
  Admission,
  Attendance,
  Class,
  ConcessionRequest,
  Employee,
  Event,
  Exam,
  Expense,
  Fee,
  Homework,
  Hostel,
  Leave,
  Library,
  Marks,
  Remark,
  Report,
  School,
  Settings,
  Student,
  Subject,
  Teacher,
  Transport,
  User,
  UserEnhanced,
};
