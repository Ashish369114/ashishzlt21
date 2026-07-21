const { Client } = require('pg');

async function createDatabase() {
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const isAWS = dbHost.includes('rds.amazonaws.com') || process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development';

  const client = new Client({
    host: dbHost,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default DB
    ssl: isAWS && dbHost !== '127.0.0.1' && dbHost !== 'localhost' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log("Connected to default 'postgres' database.");
    
    const dbName = process.env.DB_NAME || 'school_erp_dev';
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' not found, creating it...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
