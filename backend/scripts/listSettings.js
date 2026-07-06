require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../models/School');
const Settings = require('../models/Settings');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-management-system';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const schools = await School.find().lean();
    console.log(`Found ${schools.length} schools:`);
    schools.forEach(s => console.log(s._id.toString(), '-', s.name || '(no name)'));

    const settings = await Settings.find().lean();
    console.log(`\nFound ${settings.length} Settings documents:`);
    settings.forEach(s => console.log(s._id.toString(), '-', 'school:', s.school.toString(), 'general.systemName:', s.general?.systemName));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
