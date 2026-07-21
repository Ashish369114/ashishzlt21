const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  schoolId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  general: {
    type: DataTypes.JSONB,
  },
  academic: {
    type: DataTypes.JSONB,
  },
  admission: {
    type: DataTypes.JSONB,
  },
  fees: {
    type: DataTypes.JSONB,
  },
  notification: {
    type: DataTypes.JSONB,
  },
  security: {
    type: DataTypes.JSONB,
  },
  backup: {
    type: DataTypes.JSONB,
  },
  api: {
    type: DataTypes.JSONB,
  },
  customization: {
    type: DataTypes.JSONB,
  },
  integrations: {
    type: DataTypes.JSONB,
  },
}, {
  timestamps: true,
});

module.exports = Settings;
