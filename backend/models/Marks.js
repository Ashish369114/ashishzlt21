const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Marks = sequelize.define('Marks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  marks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      max: 100,
      min: 0,
    },
  },
  examType: {
    type: DataTypes.ENUM('Unit Test', 'Mid-Term', 'Final', 'Practical'),
    allowNull: false,
  },
  examDate: {
    type: DataTypes.DATEONLY,
  },
}, {
  timestamps: true,
});

module.exports = Marks;
