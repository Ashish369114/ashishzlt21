const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management_system';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Models
const Employee = require('./models/Employee');
const Remark = require('./models/Remark');
const User = require('./models/User');

const seedRemarks = async () => {
  try {
    console.log('Fetching teachers...');
    const teachers = await Employee.find({ employeeType: 'High School' });
    
    if (teachers.length === 0) {
      console.log('No teachers found to add remarks to.');
      process.exit(0);
    }
    
    // Create an array of sample remarks
    const sampleRemarks = [
      "Consistently demonstrates excellent classroom management.",
      "Needs to focus more on returning assignments promptly.",
      "Great improvement in student engagement this semester.",
      "Parents have appreciated the regular updates on student progress.",
      "Always willing to help out during school events. A great team player."
    ];
    
    // Add 2 remarks for the first 3 teachers found
    for (let i = 0; i < Math.min(3, teachers.length); i++) {
      const teacher = teachers[i];
      
      for (let j = 0; j < 2; j++) {
        const remarkText = sampleRemarks[(i * 2 + j) % sampleRemarks.length];
        
        const remark = new Remark({
          teacherId: teacher._id,
          title: `Remark - ${new Date().toLocaleDateString()}`,
          description: remarkText,
          status: 'Resolved',
          submittedBy: null
        });
        
        await remark.save();
        console.log(`Added remark for ${teacher.firstName} ${teacher.lastName}`);
      }
    }
    
    console.log('Remarks seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding remarks:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedRemarks();
