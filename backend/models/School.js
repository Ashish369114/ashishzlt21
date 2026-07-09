const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    principalName: String,
    academicYear: {
      type: String,
      required: true,
    },
    sessionStartDate: Date,
    sessionEndDate: Date,
    logo: String,
    website: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    subscriptionPlan: {
      type: String,
      enum: ['silver', 'gold', 'platinum'],
      default: 'silver',
    },
    subscriptionDurationMonths: {
      type: Number,
      default: 12,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    paymentReference: String,
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalTeachers: {
      type: Number,
      default: 0,
    },
    totalClasses: {
      type: Number,
      default: 0,
    },
    schoolSettings: {
      admissionOpenDate: Date,
      admissionCloseDate: Date,
      feeStructure: mongoose.Schema.Types.Mixed,
      workingDays: [String],
      holidays: [Date],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
