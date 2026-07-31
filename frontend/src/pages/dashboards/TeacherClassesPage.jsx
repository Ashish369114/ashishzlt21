import React, { useMemo, useState } from 'react';
import {
  BookOpen, CheckCircle2, AlertCircle, PencilLine, FileText, CalendarDays, Search,
  UserPlus, Check, X, Upload, Trash2, Paperclip, Video, File, PlusCircle, MessageSquare,
  Award, ChevronRight, Star, Send, UserCheck, Eye, ShieldCheck, Download
} from 'lucide-react';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';

import LessonPlanManagement from './components/LessonPlanManagement';
import CurriculumSyllabusTracker from './components/CurriculumSyllabusTracker';
import HomeworkEvaluationDashboard from './components/HomeworkEvaluationDashboard';
import AnecdotesAndRemedials from './components/AnecdotesAndRemedials';
import ClassReportsExporter from './components/ClassReportsExporter';
import ReportCardModal from '../../components/common/ReportCardModal';

const studentFirstNames = [
  'Rohan', 'Ananya', 'Aarav', 'Ishita', 'Kabir', 'Diya', 'Vihaan', 'Siddharth', 'Riya', 'Karan',
  'Neha', 'Rahul', 'Tanvi', 'Aditya', 'Meera', 'Arjun', 'Pooja', 'Vikram', 'Anushka', 'Devansh',
  'Sneha', 'Harsh', 'Ritu', 'Kunal', 'Sanjana', 'Yash', 'Preeti', 'Gautam', 'Simran', 'Nikhil'
];

const studentLastNames = [
  'Verma', 'Sharma', 'Singh', 'Patel', 'Mehta', 'Kapoor', 'Joshi', 'Rao', 'Sen', 'Nair',
  'Deshmukh', 'Gupta', 'Kulkarni', 'Roy', 'Reddy', 'Bhatt', 'Malhotra', 'Saxena', 'Pandey', 'Iyer',
  'Jain', 'Ahuja', 'Das', 'Agrawal', 'Chowdary', 'Pillai', 'Kaur', 'Saxena', 'Bhatia', 'Menon'
];

// Helper to generate a complete set of 30 realistic students per class
const generate30StudentsForClass = (gradeStr, sectionStr, baseRoll) => {
  return Array.from({ length: 30 }, (_, i) => {
    const fn = studentFirstNames[i % studentFirstNames.length];
    const ln = studentLastNames[(i * 3 + 1) % studentLastNames.length];
    const roll = `${baseRoll + i}`;
    const adm = `ADM-2026-${baseRoll + i}`;
    const id = `s_${gradeStr.replace(/\s+/g, '')}_${sectionStr}_${i + 1}`;
    const scoreBase = 72 + ((i * 11) % 25);

    return {
      _id: id,
      rollNumber: roll,
      admissionNo: adm,
      userId: { firstName: fn, lastName: ln, phone: `+91 98765 ${10000 + i}` },
      parentId: { firstName: `Parent of ${fn}`, lastName: ln, email: `${fn.toLowerCase()}.${ln.toLowerCase()}@parent.edu`, phone: `+91 98765 ${20000 + i}` },
      attendancePct: 90 + (i % 10),
      marks: {
        'Unit Test': Math.min(100, scoreBase),
        'Quarterly': Math.min(100, scoreBase - 3),
        'Half-Yearly': Math.min(100, scoreBase + 2),
        'Pre-Final': Math.min(100, scoreBase + 4),
        'Final': Math.min(100, scoreBase + 5),
      },
    };
  });
};

const assignedClassesData = [
  { id: 'c1', grade: 'Grade 9', section: 'A', subject: 'Mathematics', strength: 30, schedule: 'Mon • Wed • Fri (08:30 AM)', baseRoll: 901 },
  { id: 'c2', grade: 'Grade 9', section: 'B', subject: 'Mathematics', strength: 30, schedule: 'Tue • Thu • Sat (09:15 AM)', baseRoll: 931 },
  { id: 'c3', grade: 'Grade 10', section: 'A', subject: 'Mathematics', strength: 30, schedule: 'Mon • Wed • Fri (10:15 AM)', baseRoll: 1001 },
  { id: 'c4', grade: 'Grade 10', section: 'B', subject: 'Algebra & Statistics', strength: 32, schedule: 'Tue • Thu • Sat (11:00 AM)', baseRoll: 1031 },
  { id: 'c5', grade: 'Grade 8', section: 'C', subject: 'Geometry', strength: 30, schedule: 'Mon • Wed • Fri (01:30 PM)', baseRoll: 801 },
];

const examTypeOptions = ['Unit Test', 'Quarterly', 'Half-Yearly', 'Pre-Final', 'Final'];

const TeacherClassesPage = ({ user }) => {
  const [assignedClasses] = useState(assignedClassesData);
  const [selectedClassId, setSelectedClassId] = useState('c1');
  const [activeTab, setActiveTab] = useState('Students');

  // Dynamic Class Data Storage for 30 Students per class
  const [studentsMap, setStudentsMap] = useState(() => {
    const initialMap = {};
    assignedClassesData.forEach((cls) => {
      initialMap[cls.id] = generate30StudentsForClass(cls.grade, cls.section, cls.baseRoll);
    });
    return initialMap;
  });

  const [attendanceMap, setAttendanceMap] = useState(() => {
    const initialMap = {};
    assignedClassesData.forEach((cls) => {
      const list = generate30StudentsForClass(cls.grade, cls.section, cls.baseRoll);
      const recs = {};
      list.forEach((st, idx) => {
        recs[st._id] = idx === 3 || idx === 14 || idx === 23 ? 'Absent' : 'Present';
      });
      initialMap[cls.id] = recs;
    });
    return initialMap;
  });

  const [marksMap, setMarksMap] = useState(() => {
    const initialMap = {};
    assignedClassesData.forEach((cls) => {
      const list = generate30StudentsForClass(cls.grade, cls.section, cls.baseRoll);
      const examObj = {
        'Unit Test': {},
        'Quarterly': {},
        'Half-Yearly': {},
        'Pre-Final': {},
        'Final': {},
      };
      list.forEach((st) => {
        examTypeOptions.forEach((exam) => {
          examObj[exam][st._id] = st.marks[exam];
        });
      });
      initialMap[cls.id] = examObj;
    });
    return initialMap;
  });

  // Homework Map per Class
  const [homeworkMap, setHomeworkMap] = useState({
    c1: [
      { id: 'h1', title: 'Quadratic Equations Chapter 4 Practice Sheet', description: 'Solve questions 1-15 from exercise 4.2.', grade: 'Grade 9', section: 'A', dueDate: '2026-06-05', fileName: 'Quadratic_Worksheet_9A.pdf', fileType: 'PDF Document' },
      { id: 'h2', title: 'Polynomial Theorems Video Study', description: 'Watch the video lesson and summarize key formulas.', grade: 'Grade 9', section: 'A', dueDate: '2026-06-08', fileName: 'Polynomial_Lesson.mp4', fileType: 'MP4 Video' },
    ],
    c2: [
      { id: 'h3', title: 'Linear Equations in Two Variables', description: 'Complete graph problems 1 to 10.', grade: 'Grade 9', section: 'B', dueDate: '2026-06-06', fileName: 'Linear_Equations_9B.pdf', fileType: 'PDF Document' },
    ],
    c3: [
      { id: 'h4', title: 'Trigonometric Identities Workbook', description: 'Verify all identity proofs on pages 45-48.', grade: 'Grade 10', section: 'A', dueDate: '2026-06-07', fileName: 'Trig_Workbook_10A.pdf', fileType: 'PDF Document' },
    ],
    c4: [
      { id: 'h5', title: 'Statistics & Probability Data Sets', description: 'Analyze variance & mean deviation.', grade: 'Grade 10', section: 'B', dueDate: '2026-06-09', fileName: 'Stats_DataSet_10B.xlsx', fileType: 'Excel Sheet' },
    ],
    c5: [
      { id: 'h6', title: 'Triangles & Congruence Theorems', description: 'Draw construction diagrams for theorem 6.1.', grade: 'Grade 8', section: 'C', dueDate: '2026-06-10', fileName: 'Geometry_Proof_8C.pdf', fileType: 'PDF Document' },
    ],
  });

  // Assignments Map per Class
  const [assignmentMap, setAssignmentMap] = useState({
    c1: [
      { id: 'a1', title: 'Algebra Term Project & Presentation', description: 'Prepare 5-page report on real-world applications of parabolas.', grade: 'Grade 9', section: 'A', dueDate: '2026-06-15', fileName: 'Term_Project_Guide_9A.docx', fileType: 'Word Document' },
    ],
    c2: [
      { id: 'a2', title: 'Coordinate Geometry Modeling', description: 'Design 2D shape plots using coordinates.', grade: 'Grade 9', section: 'B', dueDate: '2026-06-16', fileName: 'Coordinate_Guide_9B.pdf', fileType: 'PDF Document' },
    ],
    c3: [
      { id: 'a3', title: 'Heights & Distances Survey Report', description: 'Practical clinometer angle survey activity.', grade: 'Grade 10', section: 'A', dueDate: '2026-06-18', fileName: 'Survey_Guide_10A.pdf', fileType: 'PDF Document' },
    ],
    c4: [
      { id: 'a4', title: 'Probability Distributions Case Study', description: 'Statistical analysis of dice & card simulations.', grade: 'Grade 10', section: 'B', dueDate: '2026-06-20', fileName: 'CaseStudy_10B.pdf', fileType: 'PDF Document' },
    ],
    c5: [
      { id: 'a5', title: 'Surface Area & Volume Model Craft', description: '3D cardboard cylinder & cone construction.', grade: 'Grade 8', section: 'C', dueDate: '2026-06-22', fileName: 'Craft_Guide_8C.pdf', fileType: 'PDF Document' },
    ],
  });

  // Exams Map per Class
  const [examsMap, setExamsMap] = useState({
    c1: [
      { _id: 'e1', name: 'Unit Test 1: Quadratic Equations', examType: 'Unit Test', grade: 'Grade 9', section: 'A', subject: 'Mathematics', lesson: 'Chapter 4', examDate: '2026-06-15', examTime: '09:00 AM', totalMarks: 100, fileName: 'Unit_Test_1_Paper.pdf' },
      { _id: 'e2', name: 'Half-Yearly Mathematics Exam', examType: 'Half-Yearly', grade: 'Grade 9', section: 'A', subject: 'Mathematics', lesson: 'Chapters 1-6', examDate: '2026-07-20', examTime: '09:00 AM', totalMarks: 100, fileName: 'Half_Yearly_Paper.pdf' },
    ],
    c2: [
      { _id: 'e3', name: 'Unit Test 1: Polynomials', examType: 'Unit Test', grade: 'Grade 9', section: 'B', subject: 'Mathematics', lesson: 'Chapter 2', examDate: '2026-06-16', examTime: '09:00 AM', totalMarks: 100, fileName: 'UT1_9B.pdf' },
    ],
    c3: [
      { _id: 'e4', name: 'Quarterly Assessment Mathematics', examType: 'Quarterly', grade: 'Grade 10', section: 'A', subject: 'Mathematics', lesson: 'Chapters 1-5', examDate: '2026-06-18', examTime: '10:00 AM', totalMarks: 100, fileName: 'Quarterly_10A.pdf' },
    ],
    c4: [
      { _id: 'e5', name: 'Unit Test: Statistics & Probability', examType: 'Unit Test', grade: 'Grade 10', section: 'B', subject: 'Algebra & Statistics', lesson: 'Chapter 14', examDate: '2026-06-19', examTime: '11:00 AM', totalMarks: 100, fileName: 'UT_Stats_10B.pdf' },
    ],
    c5: [
      { _id: 'e6', name: 'Geometry Formative Quiz', examType: 'Unit Test', grade: 'Grade 8', section: 'C', subject: 'Geometry', lesson: 'Chapter 6', examDate: '2026-06-21', examTime: '01:30 PM', totalMarks: 50, fileName: 'Quiz_8C.pdf' },
    ],
  });

  // UI state
  const [isBatchEditingAttendance, setIsBatchEditingAttendance] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('Unit Test');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({ firstName: '', lastName: '', rollNumber: '', admissionNo: '', parentName: '', phone: '' });

  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', dueDate: '', fileName: '', fileType: 'PDF Document' });

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', fileName: '', fileType: 'PDF Document' });

  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [createExamForm, setCreateExamForm] = useState({
    name: '',
    examType: 'Unit Test',
    lesson: '',
    examDate: '',
    examTime: '10:00 AM',
    instructions: '',
    fileName: '',
    fileType: 'PDF Document',
  });

  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState(null);

  // Requirement 8: Student Feedback / Student Report Modal
  const [isStudentReportModalOpen, setIsStudentReportModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [studentReportForm, setStudentReportForm] = useState({
    academicPerformance: 'Outstanding (A+ Grade)',
    behaviour: 'Cooperative, Active & Disciplined',
    strengths: 'Strong logical reasoning, formula application, active participant in class discussions.',
    areasForImprovement: 'Focus on neat step-by-step presentation in long proofs.',
    teacherFeedback: 'The student shows impressive dedication to learning. Submits all homework promptly.',
    additionalRemarks: 'Recommended to participate in the upcoming Mathematics Competition.',
  });

  const teacherId = user?._id || user?.id || user?.userId;
  const schoolId = localStorage.getItem('schoolId') || 'default';
  const { emitEvent } = useRealtimeUpdates(teacherId, schoolId, 'teacher');

  const selectedClass = useMemo(() => {
    return assignedClasses.find((c) => c.id === selectedClassId) || assignedClasses[0];
  }, [assignedClasses, selectedClassId]);

  // Current active 30 students list for selected class
  const currentStudents = useMemo(() => {
    return studentsMap[selectedClass.id] || [];
  }, [studentsMap, selectedClass.id]);

  // Current attendance records for selected class
  const currentAttendance = useMemo(() => {
    return attendanceMap[selectedClass.id] || {};
  }, [attendanceMap, selectedClass.id]);

  // Current marks records for selected class
  const currentMarks = useMemo(() => {
    return marksMap[selectedClass.id] || {
      'Unit Test': {},
      'Quarterly': {},
      'Half-Yearly': {},
      'Pre-Final': {},
      'Final': {},
    };
  }, [marksMap, selectedClass.id]);

  // Attendance summary count: Present + Absent = Total Students (Always synchronized)
  const classAttendanceSummary = useMemo(() => {
    const totalCount = currentStudents.length;
    const absentCount = Object.values(currentAttendance).filter((s) => s === 'Absent').length;
    const presentCount = totalCount - absentCount;

    return {
      total: totalCount,
      present: Math.max(0, presentCount),
      absent: absentCount,
    };
  }, [currentAttendance, currentStudents.length]);

  // Attendance Toggle handler
  const handleToggleAttendance = (studentId, status) => {
    setAttendanceMap((prevMap) => ({
      ...prevMap,
      [selectedClass.id]: {
        ...(prevMap[selectedClass.id] || {}),
        [studentId]: status,
      },
    }));
    emitEvent('attendance:updated', { studentId, status, classId: selectedClass.id });
  };

  // Save Attendance Batch
  const handleSaveAttendanceBatch = () => {
    setIsBatchEditingAttendance(false);
    emitEvent('attendance:batch_saved', { classId: selectedClass.id, attendanceRecords: currentAttendance });
    alert(`Attendance batch saved successfully for ${selectedClass.grade} - Section ${selectedClass.section}! Total Students: ${classAttendanceSummary.total}, Present: ${classAttendanceSummary.present}, Absent: ${classAttendanceSummary.absent}.`);
  };

  // Marks handlers
  const handleSaveMarks = (studentId, score) => {
    const numericScore = Math.min(Math.max(Number(score) || 0, 0), 100);
    setMarksMap((prevMap) => ({
      ...prevMap,
      [selectedClass.id]: {
        ...(prevMap[selectedClass.id] || {}),
        [selectedExamType]: {
          ...(prevMap[selectedClass.id]?.[selectedExamType] || {}),
          [studentId]: numericScore,
        },
      },
    }));
    emitEvent('marks:updated', { studentId, score: numericScore, examType: selectedExamType });
    alert(`Marks updated for student! ${selectedExamType}: ${numericScore}/100.`);
  };

  const handleSaveAllMarks = () => {
    emitEvent('marks:batch_saved', { classId: selectedClass.id, examType: selectedExamType, marks: currentMarks[selectedExamType] });
    alert(`All marks saved and submitted successfully for ${selectedExamType} (${selectedClass.grade} - Section ${selectedClass.section})!`);
  };

  // Create / Upload Exam submit
  const handleCreateExamSubmit = (e) => {
    e.preventDefault();
    if (!createExamForm.name || !createExamForm.lesson) {
      alert('Please fill out Exam Name and Lesson/Chapter details.');
      return;
    }

    const newExam = {
      _id: `e_${Date.now()}`,
      name: createExamForm.name,
      examType: createExamForm.examType,
      grade: selectedClass.grade,
      section: selectedClass.section,
      subject: selectedClass.subject,
      lesson: createExamForm.lesson,
      examDate: createExamForm.examDate || '2026-06-25',
      examTime: createExamForm.examTime,
      totalMarks: 100,
      fileName: createExamForm.fileName || 'Exam_Question_Paper.pdf',
    };

    setExamsMap((prev) => ({
      ...prev,
      [selectedClass.id]: [newExam, ...(prev[selectedClass.id] || [])],
    }));

    setIsCreateExamModalOpen(false);
    setCreateExamForm({ name: '', examType: 'Unit Test', lesson: '', examDate: '', examTime: '10:00 AM', instructions: '', fileName: '', fileType: 'PDF Document' });
    alert(`Exam "${newExam.name}" created & uploaded successfully for ${selectedClass.grade} - Section ${selectedClass.section}!`);
  };

  // Submit Student Feedback / Parent Report
  const handleSendStudentReportSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentForReport) return;

    const reportData = {
      id: `rep_${Date.now()}`,
      studentId: selectedStudentForReport._id,
      studentName: `${selectedStudentForReport.userId?.firstName} ${selectedStudentForReport.userId?.lastName}`,
      rollNumber: selectedStudentForReport.rollNumber,
      grade: selectedClass.grade,
      section: selectedClass.section,
      parentName: selectedStudentForReport.parentId?.firstName,
      academicYear: '2025-2026',
      teacherName: user?.name || 'Ramesh Sharma',
      ...studentReportForm,
      submittedAt: new Date().toISOString(),
    };

    // Save to localStorage for Parent Dashboard retrieval
    const existingReports = JSON.parse(localStorage.getItem('teacher_student_reports') || '[]');
    localStorage.setItem('teacher_student_reports', JSON.stringify([reportData, ...existingReports]));

    emitEvent('student_report:sent', reportData);
    setIsStudentReportModalOpen(false);
    alert(`Teacher Feedback Report for ${reportData.studentName} has been saved and successfully published to the Parent Dashboard!`);
  };

  // Add Student handler
  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudentForm.firstName || !newStudentForm.rollNumber) {
      alert('Please fill out student name and roll number');
      return;
    }

    const newStudent = {
      _id: `s_${selectedClass.id}_${Date.now()}`,
      rollNumber: newStudentForm.rollNumber,
      admissionNo: newStudentForm.admissionNo || `ADM-2026-${Date.now()}`,
      userId: { firstName: newStudentForm.firstName, lastName: newStudentForm.lastName, phone: newStudentForm.phone || '+91 98765 00000' },
      parentId: { firstName: newStudentForm.parentName || 'Parent' },
      attendancePct: 100,
      marks: { 'Unit Test': 80, 'Quarterly': 80, 'Half-Yearly': 80, 'Pre-Final': 80, 'Final': 80 },
    };

    setStudentsMap((prev) => ({
      ...prev,
      [selectedClass.id]: [newStudent, ...(prev[selectedClass.id] || [])],
    }));

    setAttendanceMap((prev) => ({
      ...prev,
      [selectedClass.id]: { ...(prev[selectedClass.id] || {}), [newStudent._id]: 'Present' },
    }));

    setNewStudentForm({ firstName: '', lastName: '', rollNumber: '', admissionNo: '', parentName: '', phone: '' });
    setIsAddStudentOpen(false);
    alert(`Student ${newStudentForm.firstName} added to ${selectedClass.grade} - Section ${selectedClass.section}!`);
  };

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return currentStudents.filter((s) => {
      const name = `${s.userId?.firstName || ''} ${s.userId?.lastName || ''}`.toLowerCase();
      return !q || name.includes(q) || (s.rollNumber || '').includes(q);
    });
  }, [currentStudents, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Class Selection */}
      <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#BFDBFE] pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#1A1817]">Class Workspace: {selectedClass.grade} - Section {selectedClass.section}</h1>
            <p className="text-sm font-semibold text-[#736B63]">
              Assigned Subject: <span className="font-bold text-[#0C4A86]">{selectedClass.subject}</span> • Schedule: {selectedClass.schedule}
            </p>
          </div>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0C4A86] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Three Attendance Summary Cards: Synchronized for the selected class */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#736B63]">Total Students ({selectedClass.grade}-{selectedClass.section})</p>
              <p className="mt-1 text-3xl font-black text-[#0C4A86]">{classAttendanceSummary.total}</p>
            </div>
            <span className="rounded-xl bg-[#0C4A86] p-3 text-white font-bold">👥</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Present</p>
              <p className="mt-1 text-3xl font-black text-emerald-900">{classAttendanceSummary.present}</p>
            </div>
            <span className="rounded-xl bg-emerald-600 p-3 text-white font-bold">✓</span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Absent</p>
              <p className="mt-1 text-3xl font-black text-rose-900">{classAttendanceSummary.absent}</p>
            </div>
            <span className="rounded-xl bg-rose-600 p-3 text-white font-bold">✕</span>
          </div>
        </div>

        {/* Class Selection Cards (Grade 9-A, Grade 9-B, Grade 10-A, Grade 10-B, Grade 8-C) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2">
          {assignedClasses.map((cls) => {
            const isSelected = cls.id === selectedClassId;
            const clsStudentCount = (studentsMap[cls.id] || []).length;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? 'border-[#0C4A86] bg-[#EBF5FF]/40 ring-2 ring-[#0C4A86] shadow-sm'
                    : 'border-[#BFDBFE] bg-[#EBF5FF] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#0C4A86]">{cls.grade} - {cls.section}</span>
                  <span className="rounded-full bg-[#0C4A86] px-2 py-0.5 text-[10px] font-bold text-white">
                    {clsStudentCount} Students
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] font-semibold text-[#736B63] truncate">
                  {cls.subject}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs for Class Tasks */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#BFDBFE] bg-white p-2 shadow-sm">
        {['Students', 'Attendance', 'Marks Entry', 'Homework Uploads', 'Assignments', 'Exams', 'Lesson Plans', 'Curriculum', 'Homework Evaluation', 'Anecdotes & Remedials', 'Class Reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-[#0C4A86] text-white shadow-sm font-extrabold'
                : 'bg-[#EBF5FF] text-[#334155] hover:bg-[#EFEAE4]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. Students Tab & Full Roster (All 30 Students) */}
      {activeTab === 'Students' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Student Directory: {selectedClass.grade} - Section {selectedClass.section} ({filteredStudents.length} Students)
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">
                Complete student records for assigned class. Generate report cards and write detailed parent feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#9E9082]" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student or roll number..."
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] py-2 pl-9 pr-3 text-xs text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none font-semibold"
                />
              </div>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#EBF5FF] text-[#334155] uppercase font-extrabold border-b border-[#BFDBFE]">
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Admission No</th>
                  <th className="p-3.5">Parent Contact</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5 text-right">Actions & Parent Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE] font-medium text-[#0C4A86]">
                {filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-[#EBF5FF]">
                    <td className="p-3.5 font-bold text-[#736B63]">{st.rollNumber}</td>
                    <td className="p-3.5 font-extrabold text-[#0C4A86]">{st.userId?.firstName} {st.userId?.lastName}</td>
                    <td className="p-3.5 text-[#736B63] font-semibold">{st.admissionNo}</td>
                    <td className="p-3.5 text-[#736B63]">
                      <span className="font-bold text-[#334155]">{st.parentId?.firstName || 'Parent'}</span> ({st.userId?.phone})
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {currentAttendance[st._id] === 'Present' ? '96%' : '88%'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Single Student Report Button */}
                        <button
                          onClick={() => {
                            setSelectedStudentForReport(st);
                            setIsStudentReportModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
                          title="Write detailed feedback for parent dashboard"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Student Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Requirement 4: Attendance Tab (Columns: Student Roll Number, Student Name, Present, Absent; Action Column Removed, Single Edit Button) */}
      {activeTab === 'Attendance' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Daily Attendance: {selectedClass.grade} - Section {selectedClass.section} ({selectedClass.subject})
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">
                Total: <span className="font-extrabold text-[#0C4A86]">{classAttendanceSummary.total}</span> | Present: <span className="font-extrabold text-emerald-700">{classAttendanceSummary.present}</span> | Absent: <span className="font-extrabold text-rose-700">{classAttendanceSummary.absent}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Single Edit Button for whole class */}
              <button
                type="button"
                onClick={() => setIsBatchEditingAttendance((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                  isBatchEditingAttendance
                    ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-xs'
                    : 'border-[#BFDBFE] bg-[#EBF5FF] text-[#0C4A86] hover:bg-[#EFEAE4]'
                }`}
              >
                <PencilLine className="h-4 w-4 text-amber-700" />
                <span>{isBatchEditingAttendance ? 'Editing Active (Click Present/Absent)' : 'Edit Attendance'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendanceBatch}
                className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA] transition"
              >
                Save Attendance Batch
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#EBF5FF] text-[#334155] uppercase font-extrabold border-b border-[#BFDBFE]">
                  <th className="p-3.5">Student Roll Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5 text-center">Present</th>
                  <th className="p-3.5 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE] font-medium text-[#0C4A86]">
                {filteredStudents.map((st) => {
                  const currentStatus = currentAttendance[st._id] || 'Present';

                  return (
                    <tr key={st._id} className="hover:bg-[#EBF5FF]">
                      {/* Student Roll Number */}
                      <td className="p-3.5">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C4A86] text-xs font-bold text-white">
                          {st.rollNumber}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="p-3.5">
                        <div>
                          <p className="text-sm font-extrabold text-[#0C4A86]">{st.userId?.firstName} {st.userId?.lastName}</p>
                          <p className="text-xs text-[#736B63]">
                            <span className="font-semibold text-[#334155]">Student No:</span> {st.admissionNo}
                          </p>
                        </div>
                      </td>

                      {/* Present Column - Circular Checkbox with Green Check Mark */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(st._id, 'Present')}
                          disabled={!isBatchEditingAttendance}
                          className={`inline-flex items-center justify-center p-1 group focus:outline-none ${
                            !isBatchEditingAttendance ? 'cursor-default' : 'cursor-pointer'
                          }`}
                          title="Mark Present"
                        >
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                            currentStatus === 'Present'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                              : 'border-slate-300 bg-white hover:border-emerald-500'
                          }`}>
                            {currentStatus === 'Present' ? (
                              <Check className="h-4 w-4 stroke-[3]" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-transparent group-hover:bg-emerald-400"></span>
                            )}
                          </div>
                        </button>
                      </td>

                      {/* Absent Column - Circular Checkbox with Red Mark/Cross */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(st._id, 'Absent')}
                          disabled={!isBatchEditingAttendance}
                          className={`inline-flex items-center justify-center p-1 group focus:outline-none ${
                            !isBatchEditingAttendance ? 'cursor-default' : 'cursor-pointer'
                          }`}
                          title="Mark Absent"
                        >
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                            currentStatus === 'Absent'
                              ? 'border-rose-600 bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                              : 'border-slate-300 bg-white hover:border-rose-500'
                          }`}>
                            {currentStatus === 'Absent' ? (
                              <X className="h-4 w-4 stroke-[3]" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-transparent group-hover:bg-rose-400"></span>
                            )}
                          </div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Requirement 5: Marks Entry Tab (Connected to selected Grade/Section & All 30 Students) */}
      {activeTab === 'Marks Entry' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Marks Entry: {selectedClass.grade} - Section {selectedClass.section} ({selectedClass.subject})
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">
                Maximum Marks: <span className="font-bold text-[#0C4A86]">100</span>. Select examination type from the dropdown box to view and enter marks for all 30 students.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Dropdown Box for Student Examination Types */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[#334155] whitespace-nowrap">Exam Type:</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="rounded-xl border-2 border-[#0C4A86] bg-[#EBF5FF] px-3.5 py-2 text-xs font-extrabold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none shadow-xs"
                >
                  {examTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveAllMarks}
                className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition"
              >
                Save All Marks
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#EBF5FF] text-[#334155] uppercase font-extrabold border-b border-[#BFDBFE]">
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Exam Type</th>
                  <th className="p-3.5 text-center">Marks Obtained / Max (100)</th>
                  <th className="p-3.5 text-center">Percentage & Grade</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE] font-medium text-[#0C4A86]">
                {filteredStudents.map((st) => {
                  const currentScore = currentMarks[selectedExamType]?.[st._id] ?? 85;

                  return (
                    <tr key={st._id} className="hover:bg-[#EBF5FF]">
                      <td className="p-3.5 font-bold text-[#736B63]">{st.rollNumber}</td>
                      <td className="p-3.5 font-extrabold">{st.userId?.firstName} {st.userId?.lastName}</td>
                      <td className="p-3.5 font-bold text-[#0C4A86]">{selectedExamType}</td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentScore}
                            onChange={(e) => handleSaveMarks(st._id, e.target.value)}
                            className="w-20 rounded-xl border border-[#0C4A86] bg-white p-1.5 text-center text-xs font-black text-[#0C4A86] focus:ring-2 focus:ring-[#0C4A86]"
                          />
                          <span className="font-bold text-[#736B63]">/ 100</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                          currentScore >= 90 ? 'bg-emerald-100 text-emerald-800' : currentScore >= 75 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentScore}% ({currentScore >= 90 ? 'Grade A+' : currentScore >= 75 ? 'Grade A' : 'Grade B'})
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleSaveMarks(st._id, currentScore)}
                          className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Homework Uploads Tab */}
      {activeTab === 'Homework Uploads' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Class Homework Uploads: {selectedClass.grade} - Section {selectedClass.section}
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">Upload homework worksheets, video lessons, and reference files</p>
            </div>

            <button
              onClick={() => setIsHomeworkModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
            >
              <Upload className="h-4 w-4" />
              <span>Create & Upload Homework</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(homeworkMap[selectedClass.id] || []).map((hw) => (
              <div key={hw.id} className="rounded-2xl border border-[#BFDBFE] bg-[#EBF5FF] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-xs font-bold text-[#0C4A86]">{hw.fileType}</span>
                  <span className="text-xs font-bold text-rose-700">Due: {hw.dueDate}</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0C4A86]">{hw.title}</h4>
                <p className="text-xs text-[#334155] font-medium">{hw.description}</p>
                <div className="flex items-center justify-between border-t border-[#BFDBFE] pt-3 text-xs">
                  <span className="font-bold text-[#736B63] flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5 text-[#0C4A86]" /> {hw.fileName}
                  </span>
                  <button
                    onClick={() => alert(`Downloading homework file: ${hw.fileName}`)}
                    className="rounded-xl bg-[#0C4A86] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0096DA]"
                  >
                    Download File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Assignments Tab */}
      {activeTab === 'Assignments' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Class Assignments: {selectedClass.grade} - Section {selectedClass.section}
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">Manage term assignments and project guidelines</p>
            </div>

            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
            >
              <Upload className="h-4 w-4" />
              <span>Create & Upload Assignment</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(assignmentMap[selectedClass.id] || []).map((asg) => (
              <div key={asg.id} className="rounded-2xl border border-[#BFDBFE] bg-[#EBF5FF] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-xs font-bold text-[#0C4A86]">{asg.fileType}</span>
                  <span className="text-xs font-bold text-rose-700">Due: {asg.dueDate}</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0C4A86]">{asg.title}</h4>
                <p className="text-xs text-[#334155] font-medium">{asg.description}</p>
                <div className="flex items-center justify-between border-t border-[#BFDBFE] pt-3 text-xs">
                  <span className="font-bold text-[#736B63] flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5 text-[#0C4A86]" /> {asg.fileName}
                  </span>
                  <button
                    onClick={() => alert(`Downloading assignment file: ${asg.fileName}`)}
                    className="rounded-xl bg-[#0C4A86] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0096DA]"
                  >
                    Download File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Requirement 6: Exams Tab – Create & Upload Exam Functionality */}
      {activeTab === 'Exams' && (
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86]">
                Exam Schedule & Question Papers: {selectedClass.grade} - Section {selectedClass.section}
              </h3>
              <p className="text-xs font-semibold text-[#736B63]">
                Create new exams, upload question papers, and assign them to specific lessons/chapters.
              </p>
            </div>

            <button
              onClick={() => setIsCreateExamModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create / Upload Exam</span>
            </button>
          </div>

          <div className="space-y-3">
            {(examsMap[selectedClass.id] || []).map((ex) => (
              <div key={ex._id} className="rounded-2xl border border-[#BFDBFE] bg-[#EBF5FF] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800">{ex.examType}</span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{ex.lesson}</span>
                  </div>
                  <h4 className="text-base font-black text-[#0C4A86]">{ex.name}</h4>
                  <p className="text-xs font-semibold text-[#736B63]">
                    Date: <span className="font-bold text-[#0C4A86]">{ex.examDate}</span> • Time: <span className="font-bold text-[#0C4A86]">{ex.examTime || '09:00 AM'}</span> • Subject: <span className="font-bold text-[#0C4A86]">{ex.subject || selectedClass.subject}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-[#0C4A86]/15 px-3 py-1.5 text-xs font-bold text-[#334155]">Max Marks: {ex.totalMarks || 100}</span>
                  {ex.fileName && (
                    <button
                      onClick={() => alert(`Downloading question paper file: ${ex.fileName}`)}
                      className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{ex.fileName}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Requirement 7: Class Reports Tab */}
      {activeTab === 'Class Reports' && (
        <ClassReportsExporter user={user} />
      )}

      {/* Other tabs */}
      {activeTab === 'Lesson Plans' && <LessonPlanManagement user={user} isPrincipal={false} />}
      {activeTab === 'Curriculum' && <CurriculumSyllabusTracker user={user} selectedGrade={selectedClass.grade} selectedSection={selectedClass.section} selectedSubject={selectedClass.subject} />}
      {activeTab === 'Homework Evaluation' && <HomeworkEvaluationDashboard user={user} />}
      {activeTab === 'Anecdotes & Remedials' && <AnecdotesAndRemedials user={user} />}

      {/* MODAL 1: Create & Upload Exam Modal */}
      {isCreateExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-[#0C4A86]">
                Create & Upload Exam ({selectedClass.grade} - Section {selectedClass.section})
              </h3>
              <button onClick={() => setIsCreateExamModalOpen(false)} className="text-[#736B63] hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155]">Exam Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2: Quadratic Equations & Formulae"
                  value={createExamForm.name}
                  onChange={(e) => setCreateExamForm({ ...createExamForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Exam Type</label>
                  <select
                    value={createExamForm.examType}
                    onChange={(e) => setCreateExamForm({ ...createExamForm, examType: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  >
                    {examTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Lesson / Chapter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 4 - Quadratic Equations"
                    value={createExamForm.lesson}
                    onChange={(e) => setCreateExamForm({ ...createExamForm, lesson: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={createExamForm.examDate}
                    onChange={(e) => setCreateExamForm({ ...createExamForm, examDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Exam Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    value={createExamForm.examTime}
                    onChange={(e) => setCreateExamForm({ ...createExamForm, examTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Upload Question Paper / File (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCreateExamForm({ ...createExamForm, fileName: file.name, fileType: file.type || 'Question Paper' });
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-semibold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Exam Instructions</label>
                <textarea
                  rows="2"
                  placeholder="Instructions for students (e.g. Bring scientific calculator)..."
                  value={createExamForm.instructions}
                  onChange={(e) => setCreateExamForm({ ...createExamForm, instructions: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsCreateExamModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700">Create & Publish Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Requirement 8 - Student Feedback / Student Report Modal to Parent Dashboard */}
      {isStudentReportModalOpen && selectedStudentForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <div>
                <h3 className="text-base font-black text-[#0C4A86]">
                  Student Report & Parent Feedback
                </h3>
                <p className="text-xs font-bold text-[#736B63]">
                  Student: <span className="text-amber-800 font-extrabold">{selectedStudentForReport.userId?.firstName} {selectedStudentForReport.userId?.lastName}</span> (Roll No: {selectedStudentForReport.rollNumber}) • {selectedClass.grade}-{selectedClass.section}
                </p>
              </div>
              <button onClick={() => setIsStudentReportModalOpen(false)} className="text-[#736B63]">✕</button>
            </div>

            <form onSubmit={handleSendStudentReportSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-[#EBF5FF] p-3 rounded-xl border border-[#BFDBFE] text-xs">
                <div>
                  <span className="font-bold text-[#736B63]">Parent Name:</span>
                  <p className="font-extrabold text-[#0C4A86]">{selectedStudentForReport.parentId?.firstName} {selectedStudentForReport.parentId?.lastName || ''}</p>
                </div>
                <div>
                  <span className="font-bold text-[#736B63]">Parent Email / Contact:</span>
                  <p className="font-extrabold text-[#0C4A86]">{selectedStudentForReport.parentId?.email || 'parent@school.edu'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Academic Performance</label>
                  <select
                    value={studentReportForm.academicPerformance}
                    onChange={(e) => setStudentReportForm({ ...studentReportForm, academicPerformance: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  >
                    <option value="Outstanding (A+ Grade)">Outstanding (A+ Grade)</option>
                    <option value="Excellent (A Grade)">Excellent (A Grade)</option>
                    <option value="Good (B Grade)">Good (B Grade)</option>
                    <option value="Satisfactory (C Grade)">Satisfactory (C Grade)</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155]">Behaviour & Discipline</label>
                  <select
                    value={studentReportForm.behaviour}
                    onChange={(e) => setStudentReportForm({ ...studentReportForm, behaviour: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  >
                    <option value="Cooperative, Active & Disciplined">Cooperative, Active & Disciplined</option>
                    <option value="Well Behaved & Polite">Well Behaved & Polite</option>
                    <option value="Attentive in Class">Attentive in Class</option>
                    <option value="Needs More Focus">Needs More Focus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Key Strengths</label>
                <input
                  type="text"
                  required
                  value={studentReportForm.strengths}
                  onChange={(e) => setStudentReportForm({ ...studentReportForm, strengths: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Areas for Improvement</label>
                <input
                  type="text"
                  required
                  value={studentReportForm.areasForImprovement}
                  onChange={(e) => setStudentReportForm({ ...studentReportForm, areasForImprovement: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Teacher Feedback & Remarks</label>
                <textarea
                  rows="3"
                  required
                  value={studentReportForm.teacherFeedback}
                  onChange={(e) => setStudentReportForm({ ...studentReportForm, teacherFeedback: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsStudentReportModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit & Send to Parent Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-[#0C4A86]">
                Add Student to {selectedClass.grade} - Section {selectedClass.section}
              </h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-[#736B63]">✕</button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.firstName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Last Name</label>
                  <input
                    type="text"
                    value={newStudentForm.lastName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 931"
                    value={newStudentForm.rollNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Admission No</label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-31"
                    value={newStudentForm.admissionNo}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, admissionNo: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Verma"
                  value={newStudentForm.parentName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsAddStudentOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold text-[#334155]">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]">Save & Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherClassesPage;
