/**
 * Centralized Data & Storage Manager for School Management System
 * Provides reactive persistence across Teacher, Student, Parent, and Principal dashboards.
 */

// Initial Sample Data Generator for 30 Students per class with distinct names per grade & section
const studentFirstNames = [
  'Rohan', 'Ananya', 'Aarav', 'Ishita', 'Kabir', 'Diya', 'Vihaan', 'Siddharth', 'Riya', 'Karan',
  'Neha', 'Rahul', 'Tanvi', 'Aditya', 'Meera', 'Arjun', 'Pooja', 'Vikram', 'Anushka', 'Devansh',
  'Sneha', 'Harsh', 'Ritu', 'Kunal', 'Sanjana', 'Yash', 'Preeti', 'Gautam', 'Simran', 'Nikhil',
  'Aadhya', 'Advait', 'Bhavya', 'Chaitanya', 'Dhruv', 'Esha', 'Farhan', 'Garima', 'Hridaan', 'Isha',
  'Jatin', 'Kavya', 'Laksh', 'Manvi', 'Navya', 'Ojas', 'Parth', 'Qasim', 'Rishi', 'Shreya',
  'Tanya', 'Utkarsh', 'Vanya', 'Varun', 'Yashvi', 'Zaid', 'Ayaan', 'Bhumika', 'Charvi', 'Divyansh'
];

const studentLastNames = [
  'Verma', 'Sharma', 'Singh', 'Patel', 'Mehta', 'Kapoor', 'Joshi', 'Rao', 'Sen', 'Nair',
  'Deshmukh', 'Gupta', 'Kulkarni', 'Roy', 'Reddy', 'Bhatt', 'Malhotra', 'Saxena', 'Pandey', 'Iyer',
  'Jain', 'Ahuja', 'Das', 'Agrawal', 'Chowdary', 'Pillai', 'Kaur', 'Saxena', 'Bhatia', 'Menon',
  'Trivedi', 'Chhabra', 'Goswami', 'Rastogi', 'Dutta', 'Mishra', 'Tripathi', 'Shukla', 'Bansal', 'Goyal'
];

// Sample Date of Birth helper to generate realistic birthdays
const getSampleDob = (index) => {
  const today = new Date();
  const month = (today.getMonth() + (index % 3)) % 12; // Some match today's month
  const day = index % 5 === 0 ? today.getDate() : ((today.getDate() + index * 3) % 28) + 1; // Index 0, 5, 10 match today!
  const year = 2011 + (index % 3);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const generate30Students = (grade, section, baseRoll) => {
  const gNum = parseInt(String(grade || '1').replace(/\D/g, ''), 10) || 1;
  const secVal = String(section || 'A').toUpperCase() === 'A' ? 0 : String(section || 'A').toUpperCase() === 'B' ? 13 : 27;
  const classOffset = gNum * 7 + secVal;

  return Array.from({ length: 10 }, (_, i) => {
    const fn = studentFirstNames[(classOffset + i * 3) % studentFirstNames.length];
    const ln = studentLastNames[(classOffset * 2 + i * 5 + 1) % studentLastNames.length];
    const roll = `${baseRoll + i}`;
    const adm = `ADM-2026-${baseRoll + i}`;
    const id = `st_${grade.replace(/\s+/g, '')}_${section}_${i + 1}`;
    const dob = getSampleDob(i);

    return {
      _id: id,
      rollNumber: roll,
      admissionNo: adm,
      dob: dob,
      firstName: fn,
      lastName: ln,
      name: `${fn} ${ln}`,
      grade: grade,
      section: section,
      className: `${grade} - ${section}`,
      parentName: `Suresh ${ln}`,
      parentEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}@parent.edu`,
      parentPhone: `+91 98765 ${20000 + i}`,
      studentPhone: `+91 98765 ${10000 + i}`,
    };
  });
};

export const assignedTeacherClasses = [
  { id: 'c1', grade: 'Grade 9', section: 'A', className: 'Grade 9 - A', subject: 'Mathematics', strength: 10, baseRoll: 901 },
  { id: 'c2', grade: 'Grade 9', section: 'B', className: 'Grade 9 - B', subject: 'Mathematics', strength: 10, baseRoll: 931 },
  { id: 'c3', grade: 'Grade 10', section: 'A', className: 'Grade 10 - A', subject: 'Mathematics', strength: 10, baseRoll: 1001 },
  { id: 'c4', grade: 'Grade 10', section: 'B', className: 'Grade 10 - B', subject: 'Algebra & Statistics', strength: 10, baseRoll: 1031 },
  { id: 'c5', grade: 'Grade 8', section: 'C', className: 'Grade 8 - C', subject: 'Geometry', strength: 10, baseRoll: 801 },
];

// Helper to get or initialize LocalStorage
const getStorageItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('schoolDataUpdated'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

// Initial Events List for School Calendar
const initialEventsList = [
  {
    id: 1,
    title: 'Annual Mathematics Olympiad & Quiz Contest',
    date: '2026-08-05',
    time: '09:30 AM - 12:30 PM',
    category: 'Exam',
    color: 'bg-red-500 text-white',
    location: 'Main Auditorium',
    organizer: 'Academic Board',
    description: 'Inter-house speed quiz and problem solving competition for Grade 8 to 10.'
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting (PTM) - Term 1',
    date: '2026-08-12',
    time: '10:00 AM - 01:00 PM',
    category: 'Meeting',
    color: 'bg-amber-500 text-white',
    location: 'School Classrooms',
    organizer: 'Principal Office',
    description: 'Quarterly academic progress discussion between teachers and parents.'
  },
  {
    id: 3,
    title: 'Inter-School Sports Meet & Track Championship',
    date: '2026-08-18',
    time: '08:00 AM - 04:00 PM',
    category: 'Sports',
    color: 'bg-emerald-500 text-white',
    location: 'Sports Grounds',
    organizer: 'Sports Department',
    description: 'Track and field events including 100m sprint, relay, long jump, and basketball.'
  },
  {
    id: 4,
    title: 'Science & Robotics Interactive Exhibition',
    date: '2026-08-25',
    time: '10:00 AM - 02:00 PM',
    category: 'Academic',
    color: 'bg-blue-600 text-white',
    location: 'STEM Science Lab 2',
    organizer: 'Science Department',
    description: 'Hands-on demonstration of physics models, chemistry experiments, and robotics.'
  },
  {
    id: 5,
    title: 'Independence Day Holiday & Cultural Program',
    date: '2026-08-15',
    time: '08:30 AM - 11:30 AM',
    category: 'Holiday',
    color: 'bg-purple-600 text-white',
    location: 'Main Flag Ground',
    organizer: 'School Administration',
    description: 'Flag hoisting ceremony followed by patriotic songs and student performances.'
  }
];

export const schoolDataService = {
  // 1. Get Students for Class (guarantees 10 students per section)
  getStudentsForClass: (classId) => {
    const cls = assignedTeacherClasses.find((c) => c.id === classId) || assignedTeacherClasses[0];
    const key = `students_${cls.id}`;
    const existing = getStorageItem(key, null);
    if (existing && Array.isArray(existing) && existing.length === 10) return existing;
    const generated = generate30Students(cls.grade, cls.section, cls.baseRoll);
    setStorageItem(key, generated);
    return generated;
  },

  // 2. Birthday Notifications for Teacher Assigned Classes (Req 3)
  getTeacherBirthdayNotifications: (teacherAssignedClasses = assignedTeacherClasses) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const notifications = [];

    teacherAssignedClasses.forEach((cls) => {
      const students = schoolDataService.getStudentsForClass(cls.id);
      students.forEach((st) => {
        if (!st.dob) return;
        const [y, m, d] = st.dob.split('-').map(Number);
        if (m === todayMonth && d === todayDay) {
          notifications.push({
            id: `bday_${st._id}`,
            type: 'birthday',
            title: '🎂 Student Birthday',
            message: `Happy Birthday to ${st.name} from Class ${st.grade} ${st.section}!`,
            studentName: st.name,
            className: `${st.grade} ${st.section}`,
            date: 'Today',
          });
        }
      });
    });

    return notifications;
  },

  // 3. Calendar Events Management (Req 1 & 2)
  getCalendarEvents: () => {
    return getStorageItem('school_calendar_events', initialEventsList);
  },

  addCalendarEvent: (eventData) => {
    const events = schoolDataService.getCalendarEvents();
    const newEvt = {
      id: Date.now(),
      ...eventData,
    };
    const updated = [newEvt, ...events];
    setStorageItem('school_calendar_events', updated);
    return newEvt;
  },

  // 4. Attendance Management (Req 4 & 5)
  getAttendanceRecord: (classId, dateStr) => {
    const key = `attendance_${classId}_${dateStr}`;
    return getStorageItem(key, null);
  },

  saveAttendanceRecord: (classId, dateStr, recordsMap) => {
    const key = `attendance_${classId}_${dateStr}`;
    setStorageItem(key, {
      classId,
      date: dateStr,
      records: recordsMap,
      savedAt: new Date().toISOString(),
    });
  },

  // 5. Marks Management (Req 6 & 7)
  getMarksRecord: (classId, examTypeId, subject) => {
    const key = `marks_${classId}_${examTypeId}_${subject}`;
    return getStorageItem(key, {});
  },

  saveMarksRecord: (classId, examTypeId, subject, marksMap) => {
    const key = `marks_${classId}_${examTypeId}_${subject}`;
    setStorageItem(key, marksMap);
  },

  // 6. Homework Management (Req 8 & 13)
  getHomeworkList: (classId) => {
    const key = `homework_${classId}`;
    const initial = [
      { id: 'h1', title: 'Quadratic Equations Chapter 4 Practice Sheet', description: 'Solve questions 1-15 from exercise 4.2.', classId, className: 'Grade 9 - A', subject: 'Mathematics', dueDate: '2026-08-10', fileName: 'Quadratic_Worksheet_9A.pdf', fileType: 'PDF Document', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'h2', title: 'Polynomial Theorems Video Study', description: 'Watch the video lesson and summarize key formulas.', classId, className: 'Grade 9 - A', subject: 'Mathematics', dueDate: '2026-08-12', fileName: 'Polynomial_Lesson.mp4', fileType: 'MP4 Video', fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    ];
    return getStorageItem(key, initial);
  },

  addHomework: (classId, homeworkData) => {
    const current = schoolDataService.getHomeworkList(classId);
    const newItem = {
      id: `hw_${Date.now()}`,
      classId,
      createdAt: new Date().toISOString(),
      ...homeworkData,
    };
    const updated = [newItem, ...current];
    setStorageItem(`homework_${classId}`, updated);
    return newItem;
  },

  // 7. Assignment Management (Req 9)
  getAssignmentList: (classId) => {
    const key = `assignment_${classId}`;
    const initial = [
      { id: 'a1', title: 'Algebra Term Project & Presentation', description: 'Prepare 5-page report on real-world applications of parabolas.', classId, className: 'Grade 9 - A', subject: 'Mathematics', startDate: '2026-08-01', dueDate: '2026-08-15', fileName: 'Term_Project_Guide_9A.docx', fileType: 'Word Document', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ];
    return getStorageItem(key, initial);
  },

  addAssignment: (classId, assignmentData) => {
    const current = schoolDataService.getAssignmentList(classId);
    const newItem = {
      id: `asg_${Date.now()}`,
      classId,
      createdAt: new Date().toISOString(),
      ...assignmentData,
    };
    const updated = [newItem, ...current];
    setStorageItem(`assignment_${classId}`, updated);
    return newItem;
  },

  // 8. Exam Management (Req 10)
  getExamsList: (classId) => {
    const key = `exams_${classId}`;
    const initial = [
      { _id: 'e1', name: 'Unit Test 1: Quadratic Equations', examType: 'unit_test_1', examTypeName: 'Unit Test 1', classId, className: 'Grade 9 - A', subject: 'Mathematics', examDate: '2026-08-15', startTime: '09:00 AM', endTime: '10:00 AM', totalMarks: 20, instructions: 'Attempt all questions.', fileName: 'Unit_Test_1_Paper.pdf' },
      { _id: 'e2', name: 'Mid-Term 1 Half-Yearly Exam', examType: 'mid_term_1', examTypeName: 'Mid-Term 1', classId, className: 'Grade 9 - A', subject: 'Mathematics', examDate: '2026-09-20', startTime: '09:00 AM', endTime: '12:00 PM', totalMarks: 80, instructions: 'Show step-by-step working.', fileName: 'Mid_Term_1_Paper.pdf' },
    ];
    return getStorageItem(key, initial);
  },

  addExam: (classId, examData) => {
    const current = schoolDataService.getExamsList(classId);
    const newItem = {
      _id: `ex_${Date.now()}`,
      classId,
      createdAt: new Date().toISOString(),
      ...examData,
    };
    const updated = [newItem, ...current];
    setStorageItem(`exams_${classId}`, updated);
    return newItem;
  },
};
