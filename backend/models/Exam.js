const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    examType: {
      type: String,
      enum: ['Unit Test', 'Half-Yearly', 'Quarterly', 'Annual', 'Mid-Term', 'Final', 'Practical'],
      default: 'Unit Test',
    },
    startTime: String,
    endTime: String,
    totalMarks: {
      type: Number,
      default: 100,
    },
    room: String,
    description: String,
    invigilator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    paperDispatched: {
      type: Boolean,
      default: false,
    },
    paperCollected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
