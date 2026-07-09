const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 'staff' covers principal, accountant, etc.
    applicantRole: {
      type: String,
      enum: ['teacher', 'student', 'parent', 'staff'],
      required: true,
    },
    applicantName: { type: String, required: true },
    // Human-readable userId string like TEACHER001, STUDENT001 etc.
    applicantId:   { type: String, required: true },

    leaveType: {
      type: String,
      enum: [
        'Sick Leave',
        'Casual Leave',
        'Earned Leave',
        'Maternity Leave',
        'Emergency Leave',
        'Other',
      ],
      required: true,
    },

    fromDate: { type: Date, required: true },
    toDate:   { type: Date, required: true },
    reason:   { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,   // Fast queries for pending tab
    },

    remarks: { type: String, default: '' },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: number of leave days
leaveSchema.virtual('leaveDays').get(function () {
  if (!this.fromDate || !this.toDate) return 0;
  const diff = this.toDate.getTime() - this.fromDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
});

leaveSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Leave', leaveSchema);
