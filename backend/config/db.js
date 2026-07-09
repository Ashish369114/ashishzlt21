const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management_system';
    
    // Attempt standard connection first
    let conn;
    try {
      conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`MongoDB Connected (External): ${conn.connection.host}`);
      return conn;
    } catch (e) {
      console.warn('External MongoDB not reachable, starting in-memory database server...');
    }

    // Lazy load and start memory server if external connection fails
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Bind to standard MongoDB port so any client can connect
        dbName: 'school_management_system',
      }
    });
    
    const memoryUri = mongod.getUri();
    console.log(`Memory MongoDB started at: ${memoryUri}`);
    
    conn = await mongoose.connect(memoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

    // Seed the database automatically on startup for the demo!
    try {
      console.log('Seeding in-memory database...');
      const seedDataFn = require('../seeds/seedFn');
      await seedDataFn();
      console.log('✓ Seeding in-memory database successful!');
    } catch (seedErr) {
      console.error('Error seeding database:', seedErr);
    }

    return conn;
  } catch (error) {
    console.error(`Fatal error in MongoDB setup: ${error.message}`);
  }
};

module.exports = connectDB;
