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
    let migrated = 0;

    for (const school of schools) {
      const existing = await Settings.findOne({ school: school._id });
      if (existing) continue;

      // Look for legacy `settings` field first, then `schoolSettings`.
      const embedded = school.settings || school.schoolSettings;
      if (!embedded || Object.keys(embedded).length === 0) {
        console.log(`No embedded settings for school ${school._id} (${school.name || ''}). Skipping.`);
        continue;
      }

      const newSettings = new Settings({
        school: school._id,
        ...embedded,
      });

      await newSettings.save();
      migrated += 1;
      console.log(`Created Settings for school ${school._id} (${school.name || ''})`);
    }

    console.log(`Migration completed. Migrated ${migrated} schools.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
