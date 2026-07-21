const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Leave', 'Half-day'),
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'classId', 'date'],
    },
  ],
});

module.exports = Attendance;
