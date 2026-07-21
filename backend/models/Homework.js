const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Homework = sequelize.define('Homework', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  assignedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  submissions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = Homework;
