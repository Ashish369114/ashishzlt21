// Central Academic Examination Configuration
// Easily updateable exam structure across the Student Dashboard

export const academicExamTypes = [
  {
    id: 'unit_test_1',
    name: 'Unit Test 1',
    shortLabel: 'Unit Test 1',
    label: '🎯 Unit Test 1 (Max Marks: 20)',
    maxMarksPerSubject: 20,
    sequenceOrder: 1,
    description: 'First periodic assessment of the academic year.'
  },
  {
    id: 'unit_test_2',
    name: 'Unit Test 2',
    shortLabel: 'Unit Test 2',
    label: '✏️ Unit Test 2 (Max Marks: 20)',
    maxMarksPerSubject: 20,
    sequenceOrder: 2,
    description: 'Second periodic assessment preceding First Mid-Term.'
  },
  {
    id: 'mid_term_1',
    name: 'Mid-Term 1 / Half-Yearly Examination',
    shortLabel: 'Mid-Term 1',
    label: '📝 Mid-Term 1 / Half-Yearly Examination (Max Marks: 80)',
    maxMarksPerSubject: 80,
    sequenceOrder: 3,
    description: 'First half-yearly comprehensive examination.'
  },
  {
    id: 'unit_test_3',
    name: 'Unit Test 3',
    shortLabel: 'Unit Test 3',
    label: '📘 Unit Test 3 (Max Marks: 20)',
    maxMarksPerSubject: 20,
    sequenceOrder: 4,
    description: 'Third periodic assessment following First Mid-Term.'
  },
  {
    id: 'unit_test_4',
    name: 'Unit Test 4',
    shortLabel: 'Unit Test 4',
    label: '📙 Unit Test 4 (Max Marks: 20)',
    maxMarksPerSubject: 20,
    sequenceOrder: 5,
    description: 'Fourth periodic assessment preceding Second Mid-Term.'
  },
  {
    id: 'mid_term_2',
    name: 'Second Mid-Term / Pre-Final Examination',
    shortLabel: 'Pre-Final Exam',
    label: '📑 Second Mid-Term / Pre-Final Examination (Max Marks: 80)',
    maxMarksPerSubject: 80,
    sequenceOrder: 6,
    description: 'Second mid-term / pre-final trial examination.'
  },
  {
    id: 'final_exam',
    name: 'Final / Annual Examination',
    shortLabel: 'Final Examination',
    label: '🏆 Final / Annual Examination (Max Marks: 100)',
    maxMarksPerSubject: 100,
    sequenceOrder: 7,
    description: 'Final annual board examination of the academic year.'
  }
];

export const examSchedulesData = [
  // Unit Test 1 (20 Marks)
  { id: 1, examType: 'unit_test_1', examTypeName: 'Unit Test 1', subject: 'Mathematics', date: '2026-07-10', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Real Numbers & Polynomials' },
  { id: 2, examType: 'unit_test_1', examTypeName: 'Unit Test 1', subject: 'Physics', date: '2026-07-12', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Physics Lab 1', syllabus: 'Light: Reflection & Refraction' },
  { id: 3, examType: 'unit_test_1', examTypeName: 'Unit Test 1', subject: 'Chemistry', date: '2026-07-14', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Chemistry Lab 2', syllabus: 'Chemical Reactions & Equations' },
  { id: 4, examType: 'unit_test_1', examTypeName: 'Unit Test 1', subject: 'English Literature', date: '2026-07-16', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'First Flight Ch 1-2 & Grammar' },
  { id: 5, examType: 'unit_test_1', examTypeName: 'Unit Test 1', subject: 'Social Studies', date: '2026-07-18', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Rise of Nationalism in Europe' },

  // Unit Test 2 (20 Marks)
  { id: 6, examType: 'unit_test_2', examTypeName: 'Unit Test 2', subject: 'Mathematics', date: '2026-08-20', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Pair of Linear Equations in Two Variables' },
  { id: 7, examType: 'unit_test_2', examTypeName: 'Unit Test 2', subject: 'Physics', date: '2026-08-22', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Physics Lab 2', syllabus: 'Human Eye & Colourful World' },
  { id: 8, examType: 'unit_test_2', examTypeName: 'Unit Test 2', subject: 'Chemistry', date: '2026-08-24', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Chemistry Lab 1', syllabus: 'Acids, Bases & Salts' },
  { id: 9, examType: 'unit_test_2', examTypeName: 'Unit Test 2', subject: 'English Literature', date: '2026-08-26', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Poetry Analysis & Formal Writing' },
  { id: 10, examType: 'unit_test_2', examTypeName: 'Unit Test 2', subject: 'Social Studies', date: '2026-08-28', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Resources and Development' },

  // Mid-Term 1 (80 Marks)
  { id: 11, examType: 'mid_term_1', examTypeName: 'Mid-Term 1 / Half-Yearly Exam', subject: 'Mathematics', date: '2026-09-15', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Main Hall Seat 42', syllabus: 'Chapters 1-7 (Algebra, Triangles, Coordinate Geometry)' },
  { id: 12, examType: 'mid_term_1', examTypeName: 'Mid-Term 1 / Half-Yearly Exam', subject: 'Physics', date: '2026-09-17', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Physics Hall B', syllabus: 'Light, Electricity, Magnetic Effects' },
  { id: 13, examType: 'mid_term_1', examTypeName: 'Mid-Term 1 / Half-Yearly Exam', subject: 'Chemistry', date: '2026-09-19', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Chemistry Lab 1', syllabus: 'Acids Bases Salts, Metals Non-Metals' },
  { id: 14, examType: 'mid_term_1', examTypeName: 'Mid-Term 1 / Half-Yearly Exam', subject: 'English Literature', date: '2026-09-21', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Room 304', syllabus: 'First Flight Ch 1-5, Prose & Poetry' },
  { id: 15, examType: 'mid_term_1', examTypeName: 'Mid-Term 1 / Half-Yearly Exam', subject: 'Social Studies', date: '2026-09-23', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Room 304', syllabus: 'History, Civics, Geography & Economics' },

  // Unit Test 3 (20 Marks)
  { id: 16, examType: 'unit_test_3', examTypeName: 'Unit Test 3', subject: 'Mathematics', date: '2026-11-10', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Trigonometry & Circle Area Concepts' },
  { id: 17, examType: 'unit_test_3', examTypeName: 'Unit Test 3', subject: 'Physics', date: '2026-11-12', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Physics Lab 2', syllabus: 'Magnetic Effects of Electric Current' },
  { id: 18, examType: 'unit_test_3', examTypeName: 'Unit Test 3', subject: 'Chemistry', date: '2026-11-14', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Chemistry Lab 1', syllabus: 'Carbon and its Compounds' },
  { id: 19, examType: 'unit_test_3', examTypeName: 'Unit Test 3', subject: 'English Literature', date: '2026-11-16', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Footprints without Feet Ch 1-3' },
  { id: 20, examType: 'unit_test_3', examTypeName: 'Unit Test 3', subject: 'Social Studies', date: '2026-11-18', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Agriculture & Mineral Resources' },

  // Unit Test 4 (20 Marks)
  { id: 21, examType: 'unit_test_4', examTypeName: 'Unit Test 4', subject: 'Mathematics', date: '2026-12-15', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Surface Areas, Volumes & Statistics' },
  { id: 22, examType: 'unit_test_4', examTypeName: 'Unit Test 4', subject: 'Physics', date: '2026-12-17', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Physics Lab 1', syllabus: 'Sources of Energy & Revision' },
  { id: 23, examType: 'unit_test_4', examTypeName: 'Unit Test 4', subject: 'Chemistry', date: '2026-12-19', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Chemistry Lab 2', syllabus: 'Periodic Classification of Elements' },
  { id: 24, examType: 'unit_test_4', examTypeName: 'Unit Test 4', subject: 'English Literature', date: '2026-12-21', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Analytical Paragraph & Letter Writing' },
  { id: 25, examType: 'unit_test_4', examTypeName: 'Unit Test 4', subject: 'Social Studies', date: '2026-12-23', time: '09:00 AM - 10:00 AM', duration: '1 Hour', maxMarks: 20, room: 'Room 201', syllabus: 'Manufacturing Industries & Money' },

  // Mid-Term 2 / Pre-Final (80 Marks)
  { id: 26, examType: 'mid_term_2', examTypeName: 'Second Mid-Term / Pre-Final', subject: 'Mathematics', date: '2027-01-15', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Main Auditorium', syllabus: 'Full Course Trial Exam - Paper 1' },
  { id: 27, examType: 'mid_term_2', examTypeName: 'Second Mid-Term / Pre-Final', subject: 'Physics', date: '2027-01-17', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Physics Hall A', syllabus: 'Full Course Trial Exam - Physics' },
  { id: 28, examType: 'mid_term_2', examTypeName: 'Second Mid-Term / Pre-Final', subject: 'Chemistry', date: '2027-01-19', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Chemistry Lab 1', syllabus: 'Full Course Trial Exam - Chemistry' },
  { id: 29, examType: 'mid_term_2', examTypeName: 'Second Mid-Term / Pre-Final', subject: 'English Literature', date: '2027-01-21', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Room 304', syllabus: 'Full Course Trial Exam - English' },
  { id: 30, examType: 'mid_term_2', examTypeName: 'Second Mid-Term / Pre-Final', subject: 'Social Studies', date: '2027-01-23', time: '09:00 AM - 12:00 PM', duration: '3 Hours', maxMarks: 80, room: 'Room 304', syllabus: 'Full Course Trial Exam - Social Studies' },

  // Final Exam (100 Marks)
  { id: 31, examType: 'final_exam', examTypeName: 'Final / Annual Examination', subject: 'Mathematics', date: '2027-03-04', time: '09:30 AM - 12:30 PM', duration: '3 Hours', maxMarks: 100, room: 'Board Exam Center Hall 1', syllabus: 'Full CBSE Class 9 Mathematics Curriculum' },
  { id: 32, examType: 'final_exam', examTypeName: 'Final / Annual Examination', subject: 'Physics', date: '2027-03-08', time: '09:30 AM - 12:30 PM', duration: '3 Hours', maxMarks: 100, room: 'Board Exam Center Hall 1', syllabus: 'Full Physics Theory & Practical Syllabus' },
  { id: 33, examType: 'final_exam', examTypeName: 'Final / Annual Examination', subject: 'Chemistry', date: '2027-03-11', time: '09:30 AM - 12:30 PM', duration: '3 Hours', maxMarks: 100, room: 'Board Exam Center Hall 1', syllabus: 'Full Chemistry Theory & Practical Syllabus' },
  { id: 34, examType: 'final_exam', examTypeName: 'Final / Annual Examination', subject: 'English Literature', date: '2027-03-15', time: '09:30 AM - 12:30 PM', duration: '3 Hours', maxMarks: 100, room: 'Board Exam Center Hall 1', syllabus: 'Full Class 9 English Language & Literature' },
  { id: 35, examType: 'final_exam', examTypeName: 'Final / Annual Examination', subject: 'Social Studies', date: '2027-03-18', time: '09:30 AM - 12:30 PM', duration: '3 Hours', maxMarks: 100, room: 'Board Exam Center Hall 1', syllabus: 'Full History, Civics, Geography & Economics' }
];

export const examResultsDataMap = {
  unit_test_1: [
    { subject: 'Mathematics', marks: 18, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', status: 'Pass', comment: 'Excellent problem solving skills in algebra quiz.' },
    { subject: 'Physics', marks: 17, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', status: 'Pass', comment: 'Strong understanding of optics & light reflection.' },
    { subject: 'Chemistry', marks: 16, maxMarks: 20, examType: 'Unit Test 1', grade: 'A', status: 'Pass', comment: 'Good knowledge of chemical reactions & balancing.' },
    { subject: 'English Literature', marks: 19, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', status: 'Pass', comment: 'Outstanding comprehension & grammar precision.' },
    { subject: 'Social Studies', marks: 17, maxMarks: 20, examType: 'Unit Test 1', grade: 'A+', status: 'Pass', comment: 'Clear historical timeline analysis.' },
  ],
  unit_test_2: [
    { subject: 'Mathematics', marks: 19, maxMarks: 20, examType: 'Unit Test 2', grade: 'A+', status: 'Pass', comment: 'Flawless linear equations solutions.' },
    { subject: 'Physics', marks: 18, maxMarks: 20, examType: 'Unit Test 2', grade: 'A+', status: 'Pass', comment: 'Great eye refraction diagram accuracy.' },
    { subject: 'Chemistry', marks: 17, maxMarks: 20, examType: 'Unit Test 2', grade: 'A+', status: 'Pass', comment: 'Excellent grasp of acids and bases.' },
    { subject: 'English Literature', marks: 18, maxMarks: 20, examType: 'Unit Test 2', grade: 'A+', status: 'Pass', comment: 'Top-tier poetry analysis.' },
    { subject: 'Social Studies', marks: 18, maxMarks: 20, examType: 'Unit Test 2', grade: 'A+', status: 'Pass', comment: 'Comprehensive geography map representation.' },
  ],
  mid_term_1: [
    { subject: 'Mathematics', marks: 74, maxMarks: 80, examType: 'Mid-Term 1', grade: 'A+', status: 'Distinction', comment: 'Outstanding performance in algebra and geometry.' },
    { subject: 'Physics', marks: 68, maxMarks: 80, examType: 'Mid-Term 1', grade: 'A', status: 'First Class', comment: 'Very good numerical problem solving in optics & light.' },
    { subject: 'Chemistry', marks: 71, maxMarks: 80, examType: 'Mid-Term 1', grade: 'A+', status: 'Distinction', comment: 'Flawless answers on chemical equations.' },
    { subject: 'English Literature', marks: 73, maxMarks: 80, examType: 'Mid-Term 1', grade: 'A+', status: 'Distinction', comment: 'Brilliant essay and prose commentary.' },
    { subject: 'Social Studies', marks: 66, maxMarks: 80, examType: 'Mid-Term 1', grade: 'A', status: 'First Class', comment: 'Thorough explanation of historical events.' }
  ],
  unit_test_3: [
    { subject: 'Mathematics', marks: 19, maxMarks: 20, examType: 'Unit Test 3', grade: 'A+', status: 'Pass', comment: 'Perfect trigonometry score.' },
    { subject: 'Physics', marks: 18, maxMarks: 20, examType: 'Unit Test 3', grade: 'A+', status: 'Pass', comment: 'Solid magnetic effects concepts.' },
    { subject: 'Chemistry', marks: 17, maxMarks: 20, examType: 'Unit Test 3', grade: 'A+', status: 'Pass', comment: 'Good periodic classification answers.' },
    { subject: 'English Literature', marks: 19, maxMarks: 20, examType: 'Unit Test 3', grade: 'A+', status: 'Pass', comment: 'Great grammar and literature insight.' },
    { subject: 'Social Studies', marks: 18, maxMarks: 20, examType: 'Unit Test 3', grade: 'A+', status: 'Pass', comment: 'Detailed agriculture map answers.' }
  ],
  unit_test_4: [
    { subject: 'Mathematics', marks: 20, maxMarks: 20, examType: 'Unit Test 4', grade: 'O', status: 'Pass', comment: 'Perfect score in surface area and volumes!' },
    { subject: 'Physics', marks: 19, maxMarks: 20, examType: 'Unit Test 4', grade: 'A+', status: 'Pass', comment: 'Excellent sources of energy paper.' },
    { subject: 'Chemistry', marks: 18, maxMarks: 20, examType: 'Unit Test 4', grade: 'A+', status: 'Pass', comment: 'Strong organic chemistry reactions.' },
    { subject: 'English Literature', marks: 19, maxMarks: 20, examType: 'Unit Test 4', grade: 'A+', status: 'Pass', comment: 'High quality letter writing format.' },
    { subject: 'Social Studies', marks: 18, maxMarks: 20, examType: 'Unit Test 4', grade: 'A+', status: 'Pass', comment: 'Good economics and manufacturing answers.' }
  ],
  mid_term_2: [
    { subject: 'Mathematics', marks: 76, maxMarks: 80, examType: 'Mid-Term 2 / Pre-Final', grade: 'A+', status: 'Distinction', comment: 'Pre-board level trial exam result.' },
    { subject: 'Physics', marks: 72, maxMarks: 80, examType: 'Mid-Term 2 / Pre-Final', grade: 'A+', status: 'Distinction', comment: 'High accuracy in physics numericals.' },
    { subject: 'Chemistry', marks: 73, maxMarks: 80, examType: 'Mid-Term 2 / Pre-Final', grade: 'A+', status: 'Distinction', comment: 'Strong chemistry theory preparation.' },
    { subject: 'English Literature', marks: 75, maxMarks: 80, examType: 'Mid-Term 2 / Pre-Final', grade: 'A+', status: 'Distinction', comment: 'Flawless literary commentary.' },
    { subject: 'Social Studies', marks: 70, maxMarks: 80, examType: 'Mid-Term 2 / Pre-Final', grade: 'A+', status: 'Distinction', comment: 'Thorough answers in history and civics.' }
  ],
  final_exam: [
    { subject: 'Mathematics', marks: 94, maxMarks: 100, examType: 'Final Examination', grade: 'O', status: 'Distinction', comment: 'Exemplary final board examination score.' },
    { subject: 'Physics', marks: 88, maxMarks: 100, examType: 'Final Examination', grade: 'A+', status: 'Distinction', comment: 'High proficiency in physics theory and practicals.' },
    { subject: 'Chemistry', marks: 89, maxMarks: 100, examType: 'Final Examination', grade: 'A+', status: 'Distinction', comment: 'Excellent practical and theoretical chemistry score.' },
    { subject: 'English Literature', marks: 95, maxMarks: 100, examType: 'Final Examination', grade: 'O', status: 'Distinction', comment: 'School top rank in English literature.' },
    { subject: 'Social Studies', marks: 88, maxMarks: 100, examType: 'Final Examination', grade: 'A+', status: 'Distinction', comment: 'Superb map work and descriptive answers.' }
  ]
};

export const getExamTypeById = (examId) => {
  return academicExamTypes.find((e) => e.id === examId) || academicExamTypes[0];
};

export const getExamSchedules = (examId) => {
  return examSchedulesData.filter((e) => e.examType === examId);
};

export const getExamResultsData = (examId) => {
  return examResultsDataMap[examId] || examResultsDataMap.unit_test_1;
};
