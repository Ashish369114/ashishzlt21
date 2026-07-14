const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    email: String,
    phone: String,
    parentName: {
      type: String,
      required: true,
    },
    parentEmail: {
      type: String,
      required: true,
    },
    parentPhone: {
      type: String,
      required: true,
    },
    parentOccupation: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: false,
    },
    appliedForClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    previousSchool: String,
    previousClass: String,
    admissionType: {
      type: String,
      enum: ['new', 'transfer'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    bloodGroup: String,
    category: {
      type: String,
      enum: ['general', 'sc', 'st', 'obc'],
    },
    medicalHistory: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
