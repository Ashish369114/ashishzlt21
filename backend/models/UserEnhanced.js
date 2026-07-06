const mongoose = require('mongoose');

const userEnhancedSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    phone: String,
    profileImage: String,
    role: {
      type: String,
      enum: [
        'super_admin',
        'principal',
        'admin',
        'teacher',
        'student',
        'parent',
        'accountant_admin',
        'librarian',
        'transport_coordinator',
        'hostel_warden',
        'staff',
      ],
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    permissions: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    preferences: {
      language: String,
      theme: String,
      emailNotifications: Boolean,
      smsNotifications: Boolean,
      whatsappNotifications: Boolean,
      notificationFrequency: String,
    },
    lastLogin: Date,
    loginAttempts: Number,
    lockedUntil: Date,
    twoFactorEnabled: Boolean,
    twoFactorSecret: String,
    suspensionReason: String,
    suspensionStartDate: Date,
    suspensionEndDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserEnhanced', userEnhancedSchema);
