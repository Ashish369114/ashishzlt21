const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConcessionRequest = sequelize.define('ConcessionRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  feeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  concessionAmount: {
    type: DataTypes.FLOAT,
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
  requestedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvedById: {
    type: DataTypes.INTEGER,
  },
  approvalDate: {
    type: DataTypes.DATE,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = ConcessionRequest;
