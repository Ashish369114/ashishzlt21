const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Remark = sequelize.define('Remark', {
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
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Positive', 'Negative', 'Neutral'),
    defaultValue: 'Neutral',
  },
}, {
  timestamps: true,
});

module.exports = Remark;
