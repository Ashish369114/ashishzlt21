const mongoose = require('mongoose');

const sanitizeObjectId = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? value : undefined;
  }
  return value;
};

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      set: sanitizeObjectId,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      set: sanitizeObjectId,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      set: sanitizeObjectId,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      set: sanitizeObjectId,
    },
    marks: {
      type: Number,
      required: true,
      max: 100,
      min: 0,
    },
    examType: {
      type: String,
      enum: ['Unit Test', 'Mid-Term', 'Final', 'Practical'],
      required: true,
    },
    examDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Marks', marksSchema);
