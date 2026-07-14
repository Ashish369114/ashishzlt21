const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teachingSubjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    isAllSubjectTeacher: {
      type: Boolean,
      default: false,
    },
    assignedClasses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    }],
    qualifications: String,
    experience: Number,
    joinDate: Date,
    salary: Number,
    designation: {
      type: String,
      default: 'Teacher',
    },
    bio: String,
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
