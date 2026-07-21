const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
  },
  paymentMethod: {
    type: DataTypes.ENUM('PhonePe', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Net Banking', 'UPI', 'Wallet'),
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  paidAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  paymentHistory: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  paymentDetails: {
    type: DataTypes.JSONB,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Fee;
