const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  employeeType: {
    type: DataTypes.ENUM('Pre-Primary', 'Junior School', 'High School', 'Non-Teaching Staff', 'teaching', 'non_teaching', 'staff', 'admin', 'support', 'maintenance'),
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qualification: {
    type: DataTypes.JSONB,
  },
  experience: {
    type: DataTypes.FLOAT,
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  inNoticePeriod: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  salary: {
    type: DataTypes.JSONB, // { baseSalary, allowances, deductions }
  },
  bankAccount: {
    type: DataTypes.JSONB, // { accountHolder, accountNumber, ifscCode, bankName }
  },
  address: {
    type: DataTypes.JSONB, // { permanent: {}, current: {} }
  },
  phone: {
    type: DataTypes.STRING,
  },
  emergencyContact: {
    type: DataTypes.JSONB, // { name, phone, relation }
  },
  documents: {
    type: DataTypes.JSONB, // Array of { name, url, uploadedAt }
    defaultValue: [],
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  performance: {
    type: DataTypes.JSONB, // { rating, reviews: [] }
  },
  remarks: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = Employee;
