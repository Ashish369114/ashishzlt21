/**
 * seedEvents.js
 * Seeds the database with a full academic year of school events.
 * Run: node seedEvents.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school-os';

const events = [
  // ── July 2026 ──────────────────────────────────────────────────────────────
  {
    title: 'Annual Sports Day – Track & Field',
    description: 'Inter-house athletics competition. All classes participate in sprint, relay, long jump, and shot put events. Parents are invited.',
    eventDate: new Date('2026-07-15'),
    startTime: '08:00',
    endTime: '13:00',
    location: 'School Grounds',
    eventType: 'Sports',
  },
  {
    title: 'Independence Day Celebration',
    description: 'Flag hoisting ceremony followed by cultural performances by students — patriotic songs, skits, and march past. All staff and students must attend.',
    eventDate: new Date('2026-08-15'),
    startTime: '07:30',
    endTime: '10:00',
    location: 'School Assembly Ground',
    eventType: 'Celebration',
  },
  {
    title: 'Science & Technology Fair',
    description: 'Students from Grade 6–10 exhibit working models and projects. Judges from local engineering colleges. Best project wins Principal\'s Award.',
    eventDate: new Date('2026-08-22'),
    startTime: '09:00',
    endTime: '16:00',
    location: 'Science Block & Corridors',
    eventType: 'Academic',
  },
  {
    title: 'Teachers\' Day Celebration',
    description: 'Senior students take over classes and pay tribute to teachers. Felicitation of best teachers. Cultural programme by students in the evening.',
    eventDate: new Date('2026-09-05'),
    startTime: '09:00',
    endTime: '15:00',
    location: 'School Auditorium',
    eventType: 'Celebration',
  },
  {
    title: 'Inter-School Debate Competition',
    description: 'Students from Grade 8–10 represent the school in district-level debate. Topics relate to environment, technology, and social issues.',
    eventDate: new Date('2026-09-12'),
    startTime: '10:00',
    endTime: '14:00',
    location: 'Main Hall',
    eventType: 'Academic',
  },
  {
    title: 'Hindi Diwas – Language Week',
    description: 'Week-long Hindi language activities — essay writing, poetry recitation, story telling competition. Certificate distribution on the last day.',
    eventDate: new Date('2026-09-14'),
    startTime: '09:30',
    endTime: '11:30',
    location: 'Hindi Department & Assembly Hall',
    eventType: 'Cultural',
  },
  {
    title: 'Parent–Teacher Meeting (PTM) – Q2',
    description: 'Second quarter PTM. Parents collect progress reports, discuss academic performance and attendance. Appointment-based slots from 9 AM.',
    eventDate: new Date('2026-09-26'),
    startTime: '09:00',
    endTime: '13:00',
    location: 'Respective Classrooms',
    eventType: 'Academic',
  },
  {
    title: 'Navratri Cultural Programme',
    description: 'Garba and dandiya celebration. Students perform traditional dances. Traditional attire encouraged. Open to all students and parents.',
    eventDate: new Date('2026-10-03'),
    startTime: '17:00',
    endTime: '20:00',
    location: 'School Courtyard',
    eventType: 'Cultural',
  },
  {
    title: 'Annual Drawing & Painting Competition',
    description: 'Open to all grades. Theme: "Nature and Environment". Prizes in three categories: Primary, Middle, and Secondary. Entry fee: ₹50.',
    eventDate: new Date('2026-10-10'),
    startTime: '10:00',
    endTime: '13:00',
    location: 'Art Room & Verandah',
    eventType: 'Cultural',
  },
  {
    title: 'Mid-Term Examinations – Grade 6–10',
    description: 'Mid-term written examinations for secondary classes. Timetable circulated separately. Students must carry hall ticket and school ID.',
    eventDate: new Date('2026-10-14'),
    startTime: '09:00',
    endTime: '12:00',
    location: 'Examination Halls',
    eventType: 'Academic',
  },
  {
    title: 'Diwali Mela & Celebration',
    description: 'Annual Diwali fair with food stalls, games, and entertainment by students and parents. All proceeds go to the school welfare fund.',
    eventDate: new Date('2026-10-20'),
    startTime: '15:00',
    endTime: '20:00',
    location: 'School Campus',
    eventType: 'Celebration',
  },
  {
    title: 'Children\'s Day Celebration',
    description: 'Teachers perform for students — dances, comedy skits, singing. Special lunch provided. Prize distribution for best students across grades.',
    eventDate: new Date('2026-11-14'),
    startTime: '09:00',
    endTime: '14:00',
    location: 'School Auditorium',
    eventType: 'Celebration',
  },
  {
    title: 'Inter-House Cricket Tournament',
    description: 'T-10 cricket tournament between four houses. Semi-finals and finals on the same day. Open to boys Grade 5–10. Cheerleading encouraged.',
    eventDate: new Date('2026-11-21'),
    startTime: '08:00',
    endTime: '17:00',
    location: 'School Cricket Ground',
    eventType: 'Sports',
  },
  {
    title: 'Annual Cultural Night – "Rang de Basanti"',
    description: 'Grand cultural event with dance drama, western music, classical recital, and fashion show. Parents and alumni invited. Entry by pass only.',
    eventDate: new Date('2026-12-05'),
    startTime: '17:30',
    endTime: '21:00',
    location: 'School Auditorium',
    eventType: 'Cultural',
  },
  {
    title: 'Christmas Celebration',
    description: 'Carol singing, Secret Santa exchange, and Christmas craft workshop. Fancy dress for primary students. Cake cutting ceremony at 11 AM.',
    eventDate: new Date('2026-12-24'),
    startTime: '09:00',
    endTime: '12:00',
    location: 'Assembly Ground & Classrooms',
    eventType: 'Celebration',
  },
  {
    title: 'Annual School Sports Meet – Closing Ceremony',
    description: 'Medal distribution for all inter-house sports events of the academic year. Chief Guest: District Sports Officer. Trophy presentation to winning house.',
    eventDate: new Date('2027-01-10'),
    startTime: '10:00',
    endTime: '13:00',
    location: 'School Auditorium',
    eventType: 'Sports',
  },
  {
    title: 'Republic Day Celebration',
    description: 'Flag hoisting, march past, and patriotic performances. Best student of the year award. Special address by school Principal.',
    eventDate: new Date('2027-01-26'),
    startTime: '07:30',
    endTime: '10:30',
    location: 'School Assembly Ground',
    eventType: 'Celebration',
  },
  {
    title: 'Mathematics Olympiad – School Round',
    description: 'School-level qualifying round for State Mathematics Olympiad. Students from Grade 5–10 eligible. Top 10 qualify for district level.',
    eventDate: new Date('2027-02-07'),
    startTime: '10:00',
    endTime: '12:30',
    location: 'Examination Hall – Block B',
    eventType: 'Academic',
  },
  {
    title: 'Annual Prize Distribution Ceremony',
    description: 'Prizes for academic excellence, sports, cultural, and conduct. Chief Guest: Local MLA / Education Officer. Parents formally invited.',
    eventDate: new Date('2027-02-20'),
    startTime: '10:00',
    endTime: '13:30',
    location: 'School Auditorium',
    eventType: 'Celebration',
  },
  {
    title: 'Career Counselling Workshop – Grade 10',
    description: 'Expert session on stream selection (Science / Commerce / Arts), entrance exams (JEE, NEET, CA, CLAT), and future careers. Parent attendance encouraged.',
    eventDate: new Date('2027-02-28'),
    startTime: '09:30',
    endTime: '12:00',
    location: 'Seminar Room',
    eventType: 'Academic',
  },
  {
    title: 'Holi Celebration & Colour Festival',
    description: 'Traditional Holi puja and safe colour celebration with organic gulal. Students participate in folk songs and dance. Refreshments provided.',
    eventDate: new Date('2027-03-13'),
    startTime: '09:00',
    endTime: '11:30',
    location: 'School Courtyard',
    eventType: 'Cultural',
  },
  {
    title: 'Annual Final Examinations – All Grades',
    description: 'End-of-year written examinations for all grades. Detailed timetable issued by class teachers. Students must arrive 15 minutes early.',
    eventDate: new Date('2027-03-20'),
    startTime: '09:00',
    endTime: '12:00',
    location: 'Examination Halls',
    eventType: 'Academic',
  },
  {
    title: 'Farewell to Grade 10 Batch',
    description: 'Formal farewell ceremony for outgoing Grade 10 students. Speeches, memories, and cultural performances by junior students. Felicitation of toppers.',
    eventDate: new Date('2027-03-28'),
    startTime: '10:00',
    endTime: '13:00',
    location: 'School Auditorium',
    eventType: 'Celebration',
  },
  {
    title: 'Yoga & Mental Wellness Day',
    description: 'Special session on yoga, meditation, and mental health awareness. Resource person from a certified yoga institute. Open to all students and staff.',
    eventDate: new Date('2026-06-21'),
    startTime: '06:30',
    endTime: '08:30',
    location: 'School Grounds',
    eventType: 'Sports',
  },
  {
    title: 'Book Fair & Reading Festival',
    description: 'Annual school book fair with over 500 titles. Storytelling sessions for primary students. Best reader of the year award. 10% discount on all books.',
    eventDate: new Date('2026-11-05'),
    startTime: '09:00',
    endTime: '16:00',
    location: 'Library & Adjacent Hall',
    eventType: 'Academic',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const inserted = await Event.insertMany(events, { ordered: false });
    console.log(`✅ Seeded ${inserted.length} events successfully!`);

    inserted.forEach(e => console.log(`  • [${e.eventType}] ${e.title} — ${new Date(e.eventDate).toDateString()}`));
  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️  Some events already exist (duplicate key). Skipping duplicates.');
    } else {
      console.error('❌ Error seeding events:', err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
