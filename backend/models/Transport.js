const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  routeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  routeNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  vehicle: {
    type: DataTypes.JSONB,
  },
  driver: {
    type: DataTypes.JSONB,
  },
  conductor: {
    type: DataTypes.JSONB,
  },
  startPoint: {
    type: DataTypes.JSONB,
  },
  endPoint: {
    type: DataTypes.JSONB,
  },
  stops: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  pickupTime: {
    type: DataTypes.STRING,
  },
  dropTime: {
    type: DataTypes.STRING,
  },
  distance: {
    type: DataTypes.FLOAT,
  },
  fare: {
    type: DataTypes.FLOAT,
  },
  students: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active',
  },
  gpsTracking: {
    type: DataTypes.JSONB,
  },
}, {
  timestamps: true,
});

module.exports = Transport;
