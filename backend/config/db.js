const { Sequelize } = require('sequelize');

const dbHost = process.env.DB_HOST || '127.0.0.1';
const isAWS = dbHost.includes('rds.amazonaws.com') || process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'school_erp',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: dbHost,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries in console
    dialectOptions: isAWS && dbHost !== '127.0.0.1' && dbHost !== 'localhost' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`PostgreSQL Connected (External): ${sequelize.config.host}`);
    
    // In development, you might want to sync models here:
    // await sequelize.sync({ alter: true });
    
    return sequelize;
  } catch (error) {
    console.error(`Fatal error in PostgreSQL setup: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
