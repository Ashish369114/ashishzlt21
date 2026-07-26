const { Sequelize } = require('sequelize');
const path = require('path');
const { execSync } = require('child_process');

let isPostgresAvailable = false;

// Quick check if local PostgreSQL port 5432 is responding before initializing Sequelize models
try {
  const checkPortScript = "const net = require('net'); const socket = new net.Socket(); socket.setTimeout(600); socket.on('connect', () => { socket.destroy(); process.exit(0); }); socket.on('timeout', () => { socket.destroy(); process.exit(1); }); socket.on('error', () => { socket.destroy(); process.exit(1); }); socket.connect(5432, '127.0.0.1');";
  execSync(`node -e "${checkPortScript}"`, { stdio: 'ignore' });
  isPostgresAvailable = true;
} catch (e) {
  isPostgresAvailable = false;
}

const dbHost = process.env.DB_HOST || '127.0.0.1';
const useSqlite = process.env.DB_DIALECT === 'sqlite' || (!isPostgresAvailable && !dbHost.includes('rds.amazonaws.com'));

const isAWS = dbHost.includes('rds.amazonaws.com');

const sequelize = useSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'database.sqlite'),
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'school_erp',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: dbHost,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: isAWS ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected (${useSqlite ? 'SQLite' : 'PostgreSQL'}): ${useSqlite ? 'database.sqlite' : dbHost}`);
    return sequelize;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
