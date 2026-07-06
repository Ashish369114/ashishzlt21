const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['attendance', 'academic', 'financial', 'performance', 'enrollment', 'transport', 'custom'],
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: Date,
    endDate: Date,
    filters: {
      class: mongoose.Schema.Types.ObjectId,
      section: String,
      teacher: mongoose.Schema.Types.ObjectId,
      student: mongoose.Schema.Types.ObjectId,
    },
    data: mongoose.Schema.Types.Mixed,
    summary: {
      totalRecords: Number,
      totalPages: Number,
      metrics: mongoose.Schema.Types.Mixed,
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'json', 'csv'],
      default: 'pdf',
    },
    fileUrl: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
    },
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        accessLevel: String,
      },
    ],
    tags: [String],
    scheduledGeneration: {
      isScheduled: Boolean,
      frequency: String,
      nextGenerationDate: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
