const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: true,
    },
    hostelType: {
      type: String,
      enum: ['boys', 'girls', 'mixed'],
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    wardenName: String,
    wardenPhone: String,
    totalRooms: Number,
    totalBeds: Number,
    availableBeds: Number,
    rooms: [
      {
        roomNumber: String,
        floor: Number,
        capacity: Number,
        occupiedBeds: Number,
        students: [
          {
            studentId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Student',
            },
            bedNumber: String,
            admissionDate: Date,
          },
        ],
        facilities: [String],
      },
    ],
    monthlyFee: Number,
    rules: [String],
    visitingHours: {
      startTime: String,
      endTime: String,
      days: [String],
    },
    mealsSchedule: [
      {
        mealType: String,
        time: String,
        menu: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    facilities: [String],
    securityFeatures: [String],
    complaints: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        complaintType: String,
        description: String,
        status: {
          type: String,
          enum: ['pending', 'resolved', 'in_progress'],
        },
        submittedDate: Date,
        resolvedDate: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hostel', hostelSchema);
