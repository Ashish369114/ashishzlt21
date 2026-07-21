const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  section: {
    type: DataTypes.ENUM('A', 'B', 'C'),
    allowNull: false,
  },
  classTeacherId: {
    type: DataTypes.INTEGER,
  },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'N/A',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['grade', 'section', 'subject'],
    },
  ],
});

module.exports = Class;
