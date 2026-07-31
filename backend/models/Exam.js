const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  examType: {
    type: DataTypes.STRING,
    defaultValue: 'Unit Test',
  },
  startTime: {
    type: DataTypes.STRING,
  },
  endTime: {
    type: DataTypes.STRING,
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
  },
  room: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  invigilatorId: {
    type: DataTypes.INTEGER,
  },
  paperDispatched: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paperCollected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Exam;
