require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../models/School');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-management-system';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const result = await School.updateMany(
      { settings: { $exists: true } },
      { $unset: { settings: "" } }
    );

    console.log('Removed legacy `settings` field from schools. Matched:', result.matchedCount, 'Modified:', result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('Error removing settings field:', err);
    process.exit(1);
  }
})();
