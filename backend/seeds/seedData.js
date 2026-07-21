require('dotenv').config();
const { sequelize } = require('../config/db');
const seedDataFn = require('./seedFn');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Sync DB schema first (ensure tables exist)
    await sequelize.sync({ force: true });
    
    await seedDataFn();
    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
