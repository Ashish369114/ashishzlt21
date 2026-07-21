const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teachingSubjects: {
    type: DataTypes.JSONB, // PostgreSQL natively supports arrays
    defaultValue: [],
  },
  isAllSubjectTeacher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  assignedClasses: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  qualifications: {
    type: DataTypes.STRING,
  },
  experience: {
    type: DataTypes.FLOAT,
  },
  joinDate: {
    type: DataTypes.DATEONLY,
  },
  salary: {
    type: DataTypes.FLOAT,
  },
  designation: {
    type: DataTypes.STRING,
    defaultValue: 'Teacher',
  },
  bio: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  remarks: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = Teacher;
