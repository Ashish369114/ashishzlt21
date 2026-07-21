const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Admission = sequelize.define('Admission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admissionNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentOccupation: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.JSONB,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  appliedForClassId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  previousSchool: {
    type: DataTypes.STRING,
  },
  previousClass: {
    type: DataTypes.STRING,
  },
  admissionType: {
    type: DataTypes.ENUM('new', 'transfer'),
    defaultValue: 'new',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending',
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  applicationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  approvalDate: {
    type: DataTypes.DATE,
  },
  approvedById: {
    type: DataTypes.INTEGER,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  bloodGroup: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.ENUM('general', 'sc', 'st', 'obc'),
  },
  medicalHistory: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Admission;
