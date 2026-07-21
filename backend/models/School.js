const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const School = sequelize.define('School', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.JSONB, // { street, city, state, zipCode, country }
  },
  principalId: {
    type: DataTypes.INTEGER,
    // Will be properly associated with User model later
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sessionStartDate: {
    type: DataTypes.DATEONLY,
  },
  sessionEndDate: {
    type: DataTypes.DATEONLY,
  },
  logo: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalTeachers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalClasses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  schoolSettings: {
    type: DataTypes.JSONB, // { admissionOpenDate, admissionCloseDate, feeStructure, workingDays, holidays }
  },
}, {
  timestamps: true,
});

module.exports = School;
