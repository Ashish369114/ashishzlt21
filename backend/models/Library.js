const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Library = sequelize.define('Library', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publisher: {
    type: DataTypes.STRING,
  },
  publicationYear: {
    type: DataTypes.INTEGER,
  },
  category: {
    type: DataTypes.ENUM('fiction', 'non-fiction', 'reference', 'textbook', 'biography', 'other'),
  },
  subject: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  totalCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.JSONB,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  procurementDate: {
    type: DataTypes.DATE,
  },
  schoolId: {
    type: DataTypes.INTEGER,
  },
  borrowHistory: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('available', 'damaged', 'lost', 'maintenance'),
    defaultValue: 'available',
  },
}, {
  timestamps: true,
});

module.exports = Library;
