const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const records = await Attendance.find({
    date: { $gte: new Date('2026-07-01'), $lte: new Date('2026-07-31') }
  });
  console.log('Total records for July:', records.length);
  
  const classRecords = await Attendance.find({
    date: { $gte: new Date('2026-07-01'), $lte: new Date('2026-07-31') }
  }).populate('class');
  
  const grouped = {};
  for(let r of classRecords) {
    if(!r.class) continue;
    grouped[r.class._id] = (grouped[r.class._id] || 0) + 1;
  }
  console.log('Records per class in July:', grouped);
  
  process.exit(0);
});
