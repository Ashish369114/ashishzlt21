const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MeetingMom = sequelize.define('MeetingMom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meetingType: {
    type: DataTypes.ENUM('staff_meeting', 'ptm_meeting'),
    allowNull: false,
    defaultValue: 'staff_meeting',
  },
  meetingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  organizer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attendees: {
    type: DataTypes.TEXT, // Comma-separated or JSON list of attendees
    allowNull: true,
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  keyDecisions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  actionItems: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published',
  },
  schoolId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'meeting_moms',
});

module.exports = MeetingMom;
