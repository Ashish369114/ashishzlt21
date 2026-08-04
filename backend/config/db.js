const { Sequelize } = require('sequelize');
const path = require('path');

const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'school_erp';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

const isAWS = dbHost.includes('rds.amazonaws.com');

let activeInstance;

if (dbDialect === 'sqlite') {
  activeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
    logging: false
  });
} else {
  activeInstance = new Sequelize(dbName, dbUser, dbPassword, {
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
}

const sequelizeProxy = new Proxy({}, {
  get(target, prop) {
    const value = activeInstance[prop];
    return typeof value === 'function' ? value.bind(activeInstance) : value;
  },
  set(target, prop, value) {
    activeInstance[prop] = value;
    return true;
  }
});

const connectDB = async () => {
  try {
    await activeInstance.authenticate();
    console.log(`Database connected (${activeInstance.getDialect()}): ${dbHost}:${dbPort}/${dbName}`);
    return activeInstance;
  } catch (error) {
    console.warn(`PostgreSQL connection failed (${error.message}). Falling back to SQLite database...`);
    activeInstance = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database.sqlite'),
      logging: false
    });
    await activeInstance.authenticate();
    console.log('SQLite fallback database connected successfully.');
    return activeInstance;
  }
};

module.exports = { sequelize: sequelizeProxy, connectDB };


