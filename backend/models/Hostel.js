const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Hostel = sequelize.define('Hostel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  hostelName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hostelType: {
    type: DataTypes.ENUM('boys', 'girls', 'mixed'),
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  address: {
    type: DataTypes.JSONB,
  },
  wardenName: {
    type: DataTypes.STRING,
  },
  wardenPhone: {
    type: DataTypes.STRING,
  },
  totalRooms: {
    type: DataTypes.INTEGER,
  },
  totalBeds: {
    type: DataTypes.INTEGER,
  },
  availableBeds: {
    type: DataTypes.INTEGER,
  },
  rooms: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  monthlyFee: {
    type: DataTypes.FLOAT,
  },
  rules: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  visitingHours: {
    type: DataTypes.JSONB,
  },
  mealsSchedule: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  facilities: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  securityFeatures: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  complaints: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = Hostel;
