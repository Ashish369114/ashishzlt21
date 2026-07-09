require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-management-system';

const fixes = [
  { query: { userId: 'SUPERADMIN001' }, update: { role: 'super_admin' } },
  { query: { userId: 'PRINCIPAL001' }, update: { role: 'principal' } },
  { query: { userId: 'ACCOUNTANT001' }, update: { role: 'accountant_admin' } },
];

const runFixes = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Connected to MongoDB: ${mongoUri}`);

    for (const fix of fixes) {
      const user = await User.findOne(fix.query);
      if (!user) {
        console.log(`No user found for query: ${JSON.stringify(fix.query)}`);
        continue;
      }

      if (user.role !== fix.update.role) {
        await User.updateOne(fix.query, { $set: fix.update });
        console.log(`Updated role for userId=${user.userId}: ${user.role} -> ${fix.update.role}`);
      } else {
        console.log(`User ${user.userId} already has role ${user.role}`);
      }
    }

    console.log('Role correction complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error applying role fixes:', error);
    process.exit(1);
  }
};

runFixes();
