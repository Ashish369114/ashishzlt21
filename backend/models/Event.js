const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
  },
  endTime: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  organizerId: {
    type: DataTypes.INTEGER,
  },
  attendees: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  eventType: {
    type: DataTypes.ENUM('Sports', 'Cultural', 'Academic', 'Celebration', 'Other', 'Exam', 'CCA', 'PTM', 'Teachers Meeting'),
  },
  image: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

module.exports = Event;
