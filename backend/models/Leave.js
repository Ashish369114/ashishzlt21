const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Leave = sequelize.define('Leave', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  applicantUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  applicantRole: {
    type: DataTypes.ENUM('teacher', 'student', 'parent', 'staff'),
    allowNull: false,
  },
  applicantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  applicantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leaveType: {
    type: DataTypes.ENUM(
      'Sick Leave',
      'Casual Leave',
      'Earned Leave',
      'Maternity Leave',
      'Emergency Leave',
      'Other'
    ),
    allowNull: false,
  },
  fromDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  toDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  remarks: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  reviewedById: {
    type: DataTypes.INTEGER,
  },
  reviewedAt: {
    type: DataTypes.DATE,
  },
  leaveDays: {
    type: DataTypes.VIRTUAL,
    get() {
      const from = this.getDataValue('fromDate');
      const to = this.getDataValue('toDate');
      if (!from || !to) return 0;
      const diff = new Date(to).getTime() - new Date(from).getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
  ],
});

module.exports = Leave;
