require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../models/School');
const Settings = require('../models/Settings');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-management-system';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const schools = await School.find();
    for (const school of schools) {
      const existing = await Settings.findOne({ school: school._id });
      if (!existing) {
        const s = new Settings({
          school: school._id,
          general: {
            systemName: `${school.name} Portal`,
            timezone: 'UTC',
            language: 'English',
            dateFormat: 'YYYY-MM-DD',
            currency: 'USD',
          },
        });
        await s.save();
        console.log('Created settings for', school.name);
      } else {
        console.log('Settings already exist for', school.name);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
