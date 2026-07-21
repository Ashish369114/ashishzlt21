const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rollNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
  },
  admissionDate: {
    type: DataTypes.DATEONLY,
  },
  bloodGroup: {
    type: DataTypes.STRING,
  },
  emergencyContact: {
    type: DataTypes.STRING,
  },
  feesPaid: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalFees: {
    type: DataTypes.FLOAT,
    defaultValue: 50000,
  },
}, {
  timestamps: true,
});

module.exports = Student;
