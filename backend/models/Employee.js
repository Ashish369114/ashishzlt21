const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    employeeType: {
      type: String,
      enum: ['staff', 'admin', 'support', 'maintenance'],
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    qualification: [String],
    experience: Number,
    dateOfJoining: {
      type: Date,
      required: true,
    },
    salary: {
      baseSalary: Number,
      allowances: mongoose.Schema.Types.Mixed,
      deductions: mongoose.Schema.Types.Mixed,
    },
    bankAccount: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    address: {
      permanent: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      current: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
    phone: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    performance: {
      rating: Number,
      reviews: [
        {
          month: String,
          rating: Number,
          feedback: String,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
