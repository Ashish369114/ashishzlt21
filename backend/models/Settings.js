const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
    },
    general: {
      systemName: String,
      timezone: String,
      language: String,
      dateFormat: String,
      currency: String,
    },
    academic: {
      sessionFormat: String,
      attendanceMarkedBy: String,
      minimumAttendancePercentage: Number,
      passingMarks: Number,
      gradeSystem: String,
    },
    admission: {
      admissionNumber: String,
      studentIdFormat: String,
      rollNumberFormat: String,
      autoGenerateId: Boolean,
    },
    fees: {
      feeCollectionMode: String,
      lateFeePercentage: Number,
      discountPercentage: Number,
      paymentMethods: [String],
    },
    notification: {
      emailNotifications: Boolean,
      smsNotifications: Boolean,
      whatsappNotifications: Boolean,
      pushNotifications: Boolean,
      notificationTemplates: mongoose.Schema.Types.Mixed,
    },
    security: {
      passwordPolicy: {
        minLength: Number,
        requireSpecialChar: Boolean,
        requireNumbers: Boolean,
        expiryDays: Number,
      },
      twoFactorAuth: Boolean,
      sessionTimeout: Number,
      ipWhitelist: [String],
      dataEncryption: Boolean,
    },
    backup: {
      autoBackupEnabled: Boolean,
      backupFrequency: String,
      lastBackupDate: Date,
      backupLocation: String,
    },
    api: {
      apiKey: String,
      rateLimitPerHour: Number,
      corsOrigins: [String],
    },
    customization: {
      logo: String,
      themeColor: String,
      footerText: String,
      headerText: String,
      customCSS: String,
    },
    integrations: {
      googleClassroom: Boolean,
      googleDrive: Boolean,
      microsoftTeams: Boolean,
      thirdPartyApis: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
