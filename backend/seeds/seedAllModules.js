const { sequelize, User, Notice, MeetingMom, AuditLog, Event, Hostel, Library, Transport, LessonPlan } = require('../models');
const seedDataFn = require('./seedFn');

const seedAllModules = async () => {
  try {
    console.log('Seeding rich demo data into all modules...');
    await sequelize.sync();
    
    // Seed core database tables (Users, Teachers, Students, Classes, Fees, Exams, Attendance, Library, Transport, Hostel)
    try {
      await seedDataFn();
      console.log('✅ Core database tables seeded successfully');
    } catch (fnErr) {
      console.warn('Notice during core table seeding:', fnErr.message || fnErr);
    }

    // 1. Seed Notices
    const noticesData = [
      {
        title: 'Annual Sports Day 2026 Announcement',
        content: 'We are excited to announce our Annual Sports Meet scheduled for next month. All students from Class 1 to 10 are encouraged to register with their physical education teachers.',
        category: 'Principal Circular',
        targetAudience: 'all',
        publishedBy: 'Dr. Kumar (Principal)',
        publishDate: '2026-07-20',
        priority: 'high',
        status: 'active'
      },
      {
        title: 'Parent-Teacher Meeting (PTM) for Mid-Term Review',
        content: 'Dear Parents, PTM will be held on Saturday, 28th July 2026, from 9:00 AM to 1:00 PM. Academic progress and attendance reports will be discussed.',
        category: 'Principal Circular',
        targetAudience: 'parents',
        publishedBy: 'Dr. Kumar (Principal)',
        publishDate: '2026-07-18',
        priority: 'urgent',
        status: 'active'
      },
      {
        title: 'Staff Academic Workshop & Training',
        content: 'All faculty members are requested to attend the AI-Integrated Pedagogy workshop in the Main Auditorium on Friday afternoon.',
        category: 'General Notice',
        targetAudience: 'teachers',
        publishedBy: 'Academic Coordinator',
        publishDate: '2026-07-15',
        priority: 'normal',
        status: 'active'
      },
      {
        title: 'Library Book Return & Fine Waiver Week',
        content: 'Students holding overdue library books can return them without late fines during this week.',
        category: 'General Notice',
        targetAudience: 'students',
        publishedBy: 'Suresh Sharma (Librarian)',
        publishDate: '2026-07-10',
        priority: 'normal',
        status: 'active'
      },
      {
        title: 'School Fee Payment Reminder - Q2',
        content: 'Second quarter fee receipts are now generated. Please ensure dues are cleared by July 30th to avoid late processing charges.',
        category: 'Principal Circular',
        targetAudience: 'parents',
        publishedBy: 'Accounts Dept.',
        publishDate: '2026-07-05',
        priority: 'high',
        status: 'active'
      }
    ];

    await Notice.bulkCreate(noticesData, { ignoreDuplicates: true });
    console.log('✅ Notices seeded successfully');

    // 2. Seed Meeting MOMs
    const momsData = [
      {
        title: 'Monthly Staff Academic Planning Meeting - July 2026',
        meetingType: 'staff_meeting',
        meetingDate: '2026-07-14',
        time: '10:00 AM - 11:30 AM',
        venue: 'Conference Hall A',
        organizer: 'Dr. Kumar (Principal)',
        attendees: 'All Teaching Staff, Academic Coordinators, HODs',
        agenda: 'Curriculum progress review, upcoming mid-term exams, digital lesson plan adoption.',
        keyDecisions: '1. Mid-term examination schedule finalized. 2. Weekly remedial classes approved for Grade 9 & 10.',
        actionItems: 'HODs to submit question papers by July 25th. Class teachers to update attendance logs daily.',
        status: 'published'
      },
      {
        title: 'PTM Progress Review & Sports Day Committee Formation',
        meetingType: 'ptm_meeting',
        meetingDate: '2026-07-08',
        time: '02:00 PM - 03:30 PM',
        venue: 'Auditorium',
        organizer: 'Parent Association Committee',
        attendees: 'Parents, Principal, Vice Principal, Class Teachers',
        agenda: 'Student academic performance evaluation, co-curricular activity planning, school bus route feedback.',
        keyDecisions: '1. Parent volunteer committee formed for Sports Day. 2. Additional bus route added for North Extension.',
        actionItems: 'Transport manager to update GPS tracking links for parents by next Monday.',
        status: 'published'
      },
      {
        title: 'HOD Science & Math Curriculum Alignment Meeting',
        meetingType: 'staff_meeting',
        meetingDate: '2026-07-02',
        time: '11:00 AM - 12:15 PM',
        venue: 'Science Lab 2',
        organizer: 'Ramesh Sharma (Senior Math HOD)',
        attendees: 'Math & Science Teachers',
        agenda: 'Integration of STEM practical sessions and lab equipment allocation.',
        keyDecisions: 'Bi-weekly practical lab sessions added for Grade 7 to 10.',
        actionItems: 'Lab assistant to verify chemical and apparatus stock level.',
        status: 'published'
      }
    ];

    await MeetingMom.bulkCreate(momsData, { ignoreDuplicates: true });
    console.log('✅ Meeting MOMs seeded successfully');

    // 3. Seed Audit Logs
    const auditLogsData = [
      {
        userId: 'SUPERADMIN001',
        userName: 'Super Admin',
        userRole: 'super_admin',
        action: 'CREATE',
        resource: 'Notice',
        details: 'Published Annual Sports Day 2026 Announcement to all students and parents',
        ipAddress: '127.0.0.1'
      },
      {
        userId: 'SUPERADMIN001',
        userName: 'Super Admin',
        userRole: 'super_admin',
        action: 'CREATE',
        resource: 'Meeting MOM',
        details: 'Created Monthly Staff Academic Planning Meeting MOM',
        ipAddress: '127.0.0.1'
      },
      {
        userId: 'PRINCIPAL001',
        userName: 'Dr. Kumar',
        userRole: 'principal',
        action: 'UPDATE',
        resource: 'Employee',
        details: 'Updated designation and salary structure for Grade 10 Teacher',
        ipAddress: '192.168.0.101'
      },
      {
        userId: 'ACCOUNTANT001',
        userName: 'Ravi Verma',
        userRole: 'accountant_admin',
        action: 'CREATE',
        resource: 'Fee Receipt',
        details: 'Generated Fee Receipt #REC-2026-0941 for Student STU004',
        ipAddress: '192.168.0.105'
      },
      {
        userId: 'LIBRARIAN001',
        userName: 'Suresh Sharma',
        userRole: 'librarian',
        action: 'UPDATE',
        resource: 'Library Book',
        details: 'Issued book "Advanced Physics Grade 10" to Student STU012',
        ipAddress: '192.168.0.108'
      },
      {
        userId: 'SUPERADMIN001',
        userName: 'Super Admin',
        userRole: 'super_admin',
        action: 'EXPORT',
        resource: 'Audit Logs',
        details: 'Exported system security log report in CSV format',
        ipAddress: '127.0.0.1'
      }
    ];

    await AuditLog.bulkCreate(auditLogsData, { ignoreDuplicates: true });
    console.log('✅ Audit Logs seeded successfully');

    // 4. Ensure Transport staff user account exists
    const transportUser = await User.findOne({ where: { userId: 'TRANSPORT001' } });
    if (!transportUser) {
      await User.create({
        userId: 'TRANSPORT001',
        password: 'Transport@123',
        role: 'administrative_officer',
        firstName: 'Rajesh',
        lastName: 'Yadav',
        email: 'transport@school.com',
        phone: '9876543266',
        subscriptionPlan: 'platinum',
      });
      console.log('✅ Created Transport Staff user account (TRANSPORT001)');
    }

    // 5. Seed Teacher Lesson Plans
    await LessonPlan.destroy({ where: {} });
    const lessonPlansData = [
      {
        title: 'Quadratic Equations & Graph Plotting',
        subject: 'Mathematics',
        className: 'Class 10',
        teacherName: 'Ramesh Sharma',
        teacherId: 'TEACHER001',
        startDate: '2026-07-25',
        endDate: '2026-07-30',
        objectives: 'Understand roots of quadratic equations and parabola graph representation.',
        topicsCovered: 'Factoring method, quadratic formula, discriminant b^2 - 4ac, real-world motion physics examples.',
        teachingMethodology: 'Smartboard visualizations and interactive problem-solving worksheets.',
        assessmentStrategy: '10-minute pop quiz and weekend homework assignment.',
        status: 'pending',
        principalComments: ''
      },
      {
        title: 'Cell Biology & Organelles Functions',
        subject: 'Science',
        className: 'Class 9',
        teacherName: 'Priya Patel',
        teacherId: 'TEACHER002',
        startDate: '2026-07-22',
        endDate: '2026-07-28',
        objectives: 'Distinguish between plant and animal cells under compound microscope.',
        topicsCovered: 'Mitochondria, Endoplasmic Reticulum, Cell Wall, Chloroplasts, and Mitosis phase overview.',
        teachingMethodology: 'Laboratory microscope practicals and 3D organelle diagrams.',
        assessmentStrategy: 'Lab report submission and practical diagram drawing test.',
        status: 'approved',
        principalComments: 'Excellent lab integration plan. Approved for execution.'
      },
      {
        title: 'Shakespearean Drama & Literary Analysis',
        subject: 'English',
        className: 'Class 10',
        teacherName: 'Sneha Gupta',
        teacherId: 'TEACHER003',
        startDate: '2026-07-27',
        endDate: '2026-08-02',
        objectives: 'Analyze character motives, tragic flaws, and poetic meter in Julius Caesar Act 3.',
        topicsCovered: 'Monologue vs Soliloquy, Rhetorical devices in Mark Antony speech, Iambic pentameter.',
        teachingMethodology: 'Roleplay reading in groups and audio drama recording analysis.',
        assessmentStrategy: 'Group performance and essay writing on tragic flaws.',
        status: 'pending',
        principalComments: ''
      },
      {
        title: 'Newtonian Laws of Motion & Friction Experiments',
        subject: 'Science',
        className: 'Class 8',
        teacherName: 'Rajesh Singh',
        teacherId: 'TEACHER004',
        startDate: '2026-07-20',
        endDate: '2026-07-26',
        objectives: 'Verify 2nd and 3rd laws of motion using dynamics carts and force sensors.',
        topicsCovered: 'Force F=ma, static vs kinetic friction, momentum conservation.',
        teachingMethodology: 'Hands-on lab experiments and interactive simulation software.',
        assessmentStrategy: 'Lab worksheet calculations and exit quiz.',
        status: 'approved',
        principalComments: 'Well-structured lab exercises. Approved.'
      },
      {
        title: 'Chemical Reactions & Stoichiometry Balancing',
        subject: 'Science',
        className: 'Class 10',
        teacherName: 'Priya Patel',
        teacherId: 'TEACHER002',
        startDate: '2026-07-15',
        endDate: '2026-07-21',
        objectives: 'Master balancing complex chemical equations and mole ratio calculations.',
        topicsCovered: 'Exothermic vs endothermic reactions, redox equations, limiting reagents.',
        teachingMethodology: 'Chalkboard practice and step-by-step chemical model kits.',
        assessmentStrategy: 'In-class problem sets and weekly test.',
        status: 'approved',
        principalComments: 'Approved.'
      },
      {
        title: 'Ancient Civilization & River Valley Cultures',
        subject: 'Social Studies',
        className: 'Class 6',
        teacherName: 'Asha Mehta',
        teacherId: 'TEACHER005',
        startDate: '2026-07-28',
        endDate: '2026-08-04',
        objectives: 'Examine urban planning and trade in Indus Valley & Mesopotamian civilizations.',
        topicsCovered: 'Harappan granaries, drainage systems, cuneiform script, trade routes.',
        teachingMethodology: 'Documentary clips, map drawing, and artifact replica displays.',
        assessmentStrategy: 'Map marking assignment and short quiz.',
        status: 'rejected',
        principalComments: 'Please add a hands-on activity like clay seal modeling. Resubmit with revisions.'
      },
      {
        title: 'Python Programming Basics & Control Loops',
        subject: 'Computer Science',
        className: 'Class 9',
        teacherName: 'Karthik Rao',
        teacherId: 'TEACHER006',
        startDate: '2026-07-24',
        endDate: '2026-07-31',
        objectives: 'Write for-loops, while-loops, and conditional if-else statements in Python.',
        topicsCovered: 'Syntax rules, list iteration, range function, simple calculator script.',
        teachingMethodology: 'Live coding demonstrations in computer lab and pair programming.',
        assessmentStrategy: 'Lab code submission evaluated via automated test suite.',
        status: 'pending',
        principalComments: ''
      },
      {
        title: 'Linear Inequalities & Coordinate Geometry',
        subject: 'Mathematics',
        className: 'Class 9',
        teacherName: 'Ramesh Sharma',
        teacherId: 'TEACHER001',
        startDate: '2026-07-10',
        endDate: '2026-07-16',
        objectives: 'Plot half-plane solutions for system of linear inequalities on graph paper.',
        topicsCovered: 'Shading region of feasible solutions, boundary lines, intercepts.',
        teachingMethodology: 'Geogebra software demonstration and graph booklet exercises.',
        assessmentStrategy: 'Graph booklet submission and chapter assessment.',
        status: 'rejected',
        principalComments: 'Requires more real-life optimization problem examples before approval.'
      }
    ];

    await LessonPlan.bulkCreate(lessonPlansData, { ignoreDuplicates: true });
    console.log('✅ Lesson Plans seeded successfully');

    console.log('🎉 All module demo data successfully pushed into the database!');
  } catch (error) {
    console.error('Error seeding module data:', error);
  }
};

if (require.main === module) {
  seedAllModules().then(() => process.exit(0));
} else {
  module.exports = seedAllModules;
}
