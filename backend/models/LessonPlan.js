const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LessonPlan = sequelize.define('LessonPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  topicsCovered: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  teachingMethodology: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assessmentStrategy: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  principalComments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  schoolId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'lesson_plans',
});

module.exports = LessonPlan;
