const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  description: {
    type: DataTypes.TEXT,
  },
  expenseType: {
    type: DataTypes.ENUM('Operational', 'Capital', 'Miscellaneous'),
    defaultValue: 'Operational',
  },
  createdById: {
    type: DataTypes.INTEGER,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: true,
});

module.exports = Expense;
