const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reportType: {
    type: DataTypes.ENUM('attendance', 'academic', 'financial', 'performance', 'enrollment', 'transport', 'custom', 'working_days'),
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  generatedById: {
    type: DataTypes.INTEGER,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  filters: {
    type: DataTypes.JSONB,
  },
  data: {
    type: DataTypes.JSONB,
  },
  summary: {
    type: DataTypes.JSONB,
  },
  format: {
    type: DataTypes.ENUM('pdf', 'excel', 'json', 'csv'),
    defaultValue: 'pdf',
  },
  fileUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  visibility: {
    type: DataTypes.ENUM('private', 'shared', 'public'),
    defaultValue: 'private',
  },
  sharedWith: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  scheduledGeneration: {
    type: DataTypes.JSONB,
  },
}, {
  timestamps: true,
});

module.exports = Report;
