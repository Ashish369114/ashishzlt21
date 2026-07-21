const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserEnhanced = sequelize.define('UserEnhanced', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM(
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
      'staff'
    ),
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  preferences: {
    type: DataTypes.JSONB,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
  },
  lockedUntil: {
    type: DataTypes.DATE,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
  },
  suspensionReason: {
    type: DataTypes.TEXT,
  },
  suspensionStartDate: {
    type: DataTypes.DATE,
  },
  suspensionEndDate: {
    type: DataTypes.DATE,
  },
  createdById: {
    type: DataTypes.INTEGER,
  },
  lastModifiedById: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true,
});

module.exports = UserEnhanced;
