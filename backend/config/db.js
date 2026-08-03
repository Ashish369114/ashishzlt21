const { Sequelize } = require('sequelize');

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'school_erp';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

const isAWS = dbHost.includes('rds.amazonaws.com');

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
  dialectOptions: isAWS ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`PostgreSQL Database connected: ${dbHost}:${dbPort}/${dbName}`);
    return sequelize;
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
