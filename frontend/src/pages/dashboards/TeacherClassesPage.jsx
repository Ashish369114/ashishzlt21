import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle2, AlertCircle, Search,
  Check, X, Upload, Trash2, Paperclip, Video, File, PlusCircle,
  Eye, Save, Edit, FileText, Image as ImageIcon, Film, Presentation
} from 'lucide-react';

import CurriculumSyllabusTracker from './components/CurriculumSyllabusTracker';
import HomeworkEvaluationDashboard from './components/HomeworkEvaluationDashboard';
import ClassReportsExporter from './components/ClassReportsExporter';
import ReportCardModal from '../../components/common/ReportCardModal';

import { academicExamTypes, getExamTypeById } from '../../utils/academicExamConfig';
import { schoolDataService, assignedTeacherClasses } from '../../services/schoolDataStore';

const TeacherClassesPage = ({ user }) => {
  const navigate = useNavigate();
  const [assignedClasses] = useState(assignedTeacherClasses);
  const [selectedClassId, setSelectedClassId] = useState('c1');
  const [activeTab, setActiveTab] = useState('Students');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().substring(0, 10));

  const activeClass = assignedClasses.find((c) => c.id === selectedClassId) || assignedClasses[0];

  // 1. Dynamic Class Students (30 per class)
  const [students, setStudents] = useState([]);
  useEffect(() => {
    const list = schoolDataService.getStudentsForClass(selectedClassId);
    setStudents(list);
  }, [selectedClassId]);

  // 2. Attendance State (Req 7, 8, 9, 10, 11, 12, 13, 14, 15)
  // - Remove individual Actions column
  // - All Present + Edit next to All Present
  // - Present = 🟢✓, Absent = 🔴✓ compact visual controls
  // - Save Attendance positioned above Maximum Marks section
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isAttendanceSaved, setIsAttendanceSaved] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState('');

  useEffect(() => {
    const saved = schoolDataService.getAttendanceRecord(selectedClassId, attendanceDate);
    if (saved && saved.records && Object.keys(saved.records).length > 0) {
      setAttendanceRecords(saved.records);
      setIsAttendanceSaved(true);
    } else {
      const recs = {};
      students.forEach((st, idx) => {
        recs[st._id] = idx === 3 || idx === 14 ? 'Absent' : 'Present';
      });
      setAttendanceRecords(recs);
      setIsAttendanceSaved(false);
    }
  }, [selectedClassId, attendanceDate, students]);

  // "All Present" Action
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = 'Present';
    });
    setAttendanceRecords(updated);
    setIsAttendanceSaved(false);
    setAttendanceSuccessMsg('All students marked Present!');
    setTimeout(() => setAttendanceSuccessMsg(''), 4000);
  };

  // "Save Attendance" Action
  const handleSaveAttendance = (e) => {
    if (e) e.preventDefault();
    schoolDataService.saveAttendanceRecord(selectedClassId, attendanceDate, attendanceRecords);
    setIsAttendanceSaved(true);
    const msg = 'Attendance saved successfully.';
    setAttendanceSuccessMsg(msg);
    setTimeout(() => setAttendanceSuccessMsg(''), 5000);
  };

  // "Edit Attendance" Action
  const handleEditAttendance = () => {
    setIsAttendanceSaved(false);
    setAttendanceSuccessMsg('Attendance unlocked for editing. Modify selected students and click Save Attendance.');
    setTimeout(() => setAttendanceSuccessMsg(''), 4000);
  };

  const totalStudentsCount = students.length;
  const presentCount = Object.values(attendanceRecords).filter((s) => s === 'Present').length;
  const absentCount = totalStudentsCount - presentCount;

  // 3. Marks Entry State
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('unit_test_1');
  const [selectedSubject, setSelectedSubject] = useState(activeClass.subject);
  const [marksRecords, setMarksRecords] = useState({});
  const [marksValidationError, setMarksValidationError] = useState('');
  const [marksSuccessMsg, setMarksSuccessMsg] = useState('');

  const activeExamConfig = getExamTypeById(selectedExamTypeId);

  useEffect(() => {
    setSelectedSubject(activeClass.subject);
  }, [activeClass]);

  useEffect(() => {
    const saved = schoolDataService.getMarksRecord(selectedClassId, selectedExamTypeId, selectedSubject);
    if (saved && Object.keys(saved).length > 0) {
      setMarksRecords(saved);
    } else {
      const recs = {};
      students.forEach((st, i) => {
        const basePct = 0.85 - (i % 5) * 0.05;
        const calculated = Math.round(activeExamConfig.maxMarksPerSubject * basePct);
        recs[st._id] = calculated;
      });
      setMarksRecords(recs);
    }
  }, [selectedClassId, selectedExamTypeId, selectedSubject, students, activeExamConfig]);

  const handleMarkChange = (studentId, value) => {
    setMarksValidationError('');
    const num = Number(value);
    if (num > activeExamConfig.maxMarksPerSubject) {
      setMarksValidationError(`Marks cannot exceed maximum marks of ${activeExamConfig.maxMarksPerSubject}.`);
      return;
    }
    if (num < 0) {
      setMarksValidationError('Marks cannot be negative.');
      return;
    }
    setMarksRecords((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (marksValidationError) return;
    schoolDataService.saveMarksRecord(selectedClassId, selectedExamTypeId, selectedSubject, marksRecords);
    const msg = `Marks saved successfully for ${activeClass.className} • ${selectedSubject} (${activeExamConfig.name})`;
    setMarksSuccessMsg(msg);
    setTimeout(() => setMarksSuccessMsg(''), 5000);
    alert(msg);
  };

  // 4. Homework Management with File Upload Support (Req 7)
  const [homeworkList, setHomeworkList] = useState([]);
  useEffect(() => {
    setHomeworkList(schoolDataService.getHomeworkList(selectedClassId));
  }, [selectedClassId]);

  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    section: 'A',
    subject: activeClass.subject,
    fileName: '',
    fileType: 'PDF Document',
    fileUrl: ''
  });

  const handleHomeworkFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let typeLabel = 'PDF Document';
      if (['png', 'jpg', 'jpeg'].includes(fileExt)) typeLabel = 'Photo / Image';
      else if (['mp4', 'mov', 'avi'].includes(fileExt)) typeLabel = 'Video Clip';
      else if (['doc', 'docx'].includes(fileExt)) typeLabel = 'Word Document';
      else if (['xls', 'xlsx'].includes(fileExt)) typeLabel = 'Excel Spreadsheet';
      else if (['ppt', 'pptx'].includes(fileExt)) typeLabel = 'Presentation Slide';

      const dummyUrl = URL.createObjectURL(file);
      setHomeworkForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: typeLabel,
        fileUrl: dummyUrl
      }));
    }
  };

  const handleCreateHomework = (e) => {
    e.preventDefault();
    if (!homeworkForm.title || !homeworkForm.dueDate) {
      alert('Please fill out Homework Title and Due Date.');
      return;
    }
    schoolDataService.addHomework(selectedClassId, {
      ...homeworkForm,
      className: activeClass.className,
      subject: homeworkForm.subject || activeClass.subject,
    });
    setHomeworkList(schoolDataService.getHomeworkList(selectedClassId));
    setIsHomeworkModalOpen(false);
    setHomeworkForm({ title: '', description: '', dueDate: '', section: 'A', subject: activeClass.subject, fileName: '', fileType: 'PDF Document', fileUrl: '' });
    alert('Homework created & uploaded to database! Students and Parents can view, open, and download files.');
  };

  // 5. Assignment Management with File Upload Support (Req 8)
  const [assignmentList, setAssignmentList] = useState([]);
  useEffect(() => {
    setAssignmentList(schoolDataService.getAssignmentList(selectedClassId));
  }, [selectedClassId]);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().substring(0, 10),
    dueDate: '',
    section: 'A',
    subject: activeClass.subject,
    fileName: '',
    fileType: 'PDF Document',
    fileUrl: ''
  });

  const handleAssignmentFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let typeLabel = 'PDF Document';
      if (['png', 'jpg', 'jpeg'].includes(fileExt)) typeLabel = 'Photo / Image';
      else if (['mp4', 'mov', 'avi'].includes(fileExt)) typeLabel = 'Video Clip';
      else if (['doc', 'docx'].includes(fileExt)) typeLabel = 'Word Document';
      else if (['xls', 'xlsx'].includes(fileExt)) typeLabel = 'Excel Spreadsheet';
      else if (['ppt', 'pptx'].includes(fileExt)) typeLabel = 'Presentation Slide';

      const dummyUrl = URL.createObjectURL(file);
      setAssignmentForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: typeLabel,
        fileUrl: dummyUrl
      }));
    }
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.dueDate) {
      alert('Please fill out Assignment Title and Due Date.');
      return;
    }
    schoolDataService.addAssignment(selectedClassId, {
      ...assignmentForm,
      className: activeClass.className,
      subject: assignmentForm.subject || activeClass.subject,
    });
    setAssignmentList(schoolDataService.getAssignmentList(selectedClassId));
    setIsAssignmentModalOpen(false);
    setAssignmentForm({ title: '', description: '', startDate: '', dueDate: '', section: 'A', subject: activeClass.subject, fileName: '', fileType: 'PDF Document', fileUrl: '' });
    alert('Assignment created & uploaded! Assigned students and parents can now access attachment files.');
  };

  // 6. Exam Management with File Upload Support (Req 9)
  const [examsList, setExamsList] = useState([]);
  useEffect(() => {
    setExamsList(schoolDataService.getExamsList(selectedClassId));
  }, [selectedClassId]);

  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [createExamForm, setCreateExamForm] = useState({
    name: '',
    examType: 'unit_test_1',
    subject: activeClass.subject,
    examDate: '',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    instructions: '',
    fileName: '',
    fileType: 'PDF Document',
    fileUrl: ''
  });

  const handleExamFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let typeLabel = 'PDF Document';
      if (['png', 'jpg', 'jpeg'].includes(fileExt)) typeLabel = 'Photo / Image';
      else if (['mp4', 'mov', 'avi'].includes(fileExt)) typeLabel = 'Video File';
      else if (['doc', 'docx'].includes(fileExt)) typeLabel = 'Word Document';

      const dummyUrl = URL.createObjectURL(file);
      setCreateExamForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: typeLabel,
        fileUrl: dummyUrl
      }));
    }
  };

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!createExamForm.name || !createExamForm.examDate) {
      alert('Please enter Exam Name and Exam Date.');
      return;
    }
    const examConfig = getExamTypeById(createExamForm.examType);
    schoolDataService.addExam(selectedClassId, {
      ...createExamForm,
      examTypeName: examConfig.shortLabel,
      totalMarks: examConfig.maxMarksPerSubject,
      className: activeClass.className,
    });
    setExamsList(schoolDataService.getExamsList(selectedClassId));
    setIsCreateExamModalOpen(false);
    setCreateExamForm({ name: '', examType: 'unit_test_1', subject: activeClass.subject, examDate: '', startTime: '09:00 AM', endTime: '10:00 AM', instructions: '', fileName: '', fileType: 'PDF Document', fileUrl: '' });
    alert('Exam scheduled with uploaded materials! Connected to database for Student Dashboard access.');
  };

  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(st =>
    st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.rollNumber.includes(searchTerm) ||
    st.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Banner with In-App Back Button (Req 13) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-black text-white border border-white/30 hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <BookOpen className="h-3.5 w-3.5" /> Classroom Operations
            </div>
          </div>
          <h1 className="text-2xl font-bold">Classroom Operations & Academic Records</h1>
          <p className="text-sky-100 text-sm">Attendance (All Present + Edit), Marks Entry, Homework Uploads, Assignments & Exams.</p>
        </div>

        {/* Class Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 self-start md:self-auto">
          <span className="text-xs font-extrabold text-amber-300">Selected Class:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-[#0C4A86] focus:outline-none cursor-pointer"
          >
            {assignedClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.grade} - {cls.section} ({cls.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-extrabold">
        {[
          { id: 'Students', label: 'Student Directory' },
          { id: 'Attendance', label: 'Attendance (All Present + Edit)' },
          { id: 'Marks', label: 'Marks Entry (7-Stage Exam Terms)' },
          { id: 'Homework', label: 'Homework Management' },
          { id: 'Assignments', label: 'Assignments Upload' },
          { id: 'Evaluation', label: 'Homework Evaluation' },
          { id: 'Exams', label: 'Exam Uploads & Schedule' },
          { id: 'Curriculum', label: 'Curriculum & Syllabus' },
          { id: 'ClassReports', label: 'Classroom Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Student Directory Tab */}
      {activeTab === 'Students' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Students Roster ({activeClass.className})</h3>
              <p className="text-xs font-semibold text-slate-500">30 enrolled students with parent contacts and official report card viewer</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Date of Birth</th>
                  <th className="p-3">Parent Name</th>
                  <th className="p-3">Parent Phone</th>
                  <th className="p-3">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-[#0C4A86]">{st.rollNumber}</td>
                    <td className="p-3 font-black text-slate-900">{st.name}</td>
                    <td className="p-3 font-bold text-slate-500">{st.admissionNo}</td>
                    <td className="p-3 text-slate-600">{st.dob}</td>
                    <td className="p-3">{st.parentName}</td>
                    <td className="p-3 text-slate-600">{st.parentPhone}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedStudentForReportCard(st)}
                        className="inline-flex items-center gap-1 text-[#0C4A86] font-extrabold hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Attendance Tab – Date Selector, All Present, Empty Visual Boxes (🟩✓ / 🟥✓ / □), Save & Edit Flow */}
      {activeTab === 'Attendance' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">Attendance Register — {activeClass.className}</h3>
              <p className="text-xs font-semibold text-slate-500">
                Select date, click <strong>All Present</strong> or select individual <strong>Present 🟩 / Absent 🟥</strong> boxes, then click <strong>Save Attendance</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-slate-500">Attendance Date:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#0C4A86] focus:outline-none"
                />
              </div>

              {/* All Present & Save/Edit Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={isAttendanceSaved}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-2xs ${
                    isAttendanceSaved
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Check className="h-4 w-4" /> All Present
                </button>

                {isAttendanceSaved ? (
                  <button
                    type="button"
                    onClick={handleEditAttendance}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#0C4A86] bg-sky-50 px-5 py-2 text-xs font-extrabold text-[#0C4A86] shadow-2xs hover:bg-[#0C4A86] hover:text-white transition-all"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Attendance</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0C4A86] px-5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
                  >
                    <Save className="h-4 w-4 text-amber-400" />
                    <span>Save Attendance</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {attendanceSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-extrabold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {attendanceSuccessMsg}
            </div>
          )}

          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-3 gap-4 text-xs font-bold">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block">Total Students</span>
              <span className="text-2xl font-black text-slate-900">{totalStudentsCount}</span>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <span className="text-emerald-800 uppercase tracking-wider text-[10px] block">Present Count</span>
              <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <span className="text-rose-800 uppercase tracking-wider text-[10px] block">Absent Count</span>
              <span className="text-2xl font-black text-rose-700">{absentCount}</span>
            </div>
          </div>

          {/* Legend Guide */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-extrabold">
            <span className="text-[#0C4A86]">Visual Attendance Status Boxes:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white inline-block"></span>
                <span>Unselected (□)</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-5 h-5 rounded-md border-2 border-emerald-600 bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Present (🟩✓)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-800 font-bold">
                <span className="w-5 h-5 rounded-md border-2 border-rose-600 bg-rose-600 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Absent (🟥✓)</span>
              </span>
            </div>
          </div>

          {/* Student Attendance Table with Visual Boxes (□ / 🟩✓ / 🟥✓) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3 text-center">Present</th>
                  <th className="p-3 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {students.map((st) => {
                  const status = attendanceRecords[st._id];
                  const isPresent = status === 'Present';
                  const isAbsent = status === 'Absent';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50">
                      <td className="p-3 font-black text-[#0C4A86]">{st.rollNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3 text-slate-500">{st.admissionNo}</td>

                      {/* Present Visual Box */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={isAttendanceSaved}
                          onClick={() => setAttendanceRecords((prev) => ({ ...prev, [st._id]: 'Present' }))}
                          className="inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed group focus:outline-none"
                          title="Mark Present"
                        >
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-black transition-all ${
                              isPresent
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-white border-slate-300 text-transparent group-hover:border-emerald-500'
                            }`}
                          >
                            ✓
                          </div>
                          <span className={`text-xs font-bold ${isPresent ? 'text-emerald-800 font-extrabold' : 'text-slate-500'}`}>
                            Present
                          </span>
                        </button>
                      </td>

                      {/* Absent Visual Box */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={isAttendanceSaved}
                          onClick={() => setAttendanceRecords((prev) => ({ ...prev, [st._id]: 'Absent' }))}
                          className="inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed group focus:outline-none"
                          title="Mark Absent"
                        >
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-black transition-all ${
                              isAbsent
                                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                : 'bg-white border-slate-300 text-transparent group-hover:border-rose-500'
                            }`}
                          >
                            ✓
                          </div>
                          <span className={`text-xs font-bold ${isAbsent ? 'text-rose-800 font-extrabold' : 'text-slate-500'}`}>
                            Absent
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500">
              {isAttendanceSaved
                ? 'Attendance is locked. Click "Edit Attendance" at the top to modify records.'
                : 'Review attendance records above and click Save Attendance to update database.'}
            </span>
            {isAttendanceSaved ? (
              <button
                type="button"
                onClick={handleEditAttendance}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#0C4A86] bg-sky-50 px-6 py-2.5 text-xs font-extrabold text-[#0C4A86] shadow-sm hover:bg-[#0C4A86] hover:text-white transition-all"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Attendance</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-black transition-all"
              >
                <Save className="h-4 w-4 text-amber-400" />
                <span>Save Attendance</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Marks Entry Tab */}
      {activeTab === 'Marks' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">Marks Entry & Evaluation — {activeClass.className}</h3>
              <p className="text-xs font-semibold text-slate-500">Select exam term and subject to record student marks.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-slate-500">Exam Term:</label>
                <select
                  value={selectedExamTypeId}
                  onChange={(e) => setSelectedExamTypeId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:border-[#0C4A86] focus:outline-none"
                >
                  {academicExamTypes.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.sequenceOrder}. {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-slate-500">Subject:</label>
                <input
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-36 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveMarks}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-black transition"
              >
                <Save className="h-4 w-4 text-amber-400" /> Save Marks
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] p-4 text-xs font-bold text-[#0C4A86] flex items-center justify-between">
            <span>Configured Examination: <strong>{activeExamConfig.name}</strong></span>
            <span>Maximum Marks Locked: <strong className="text-emerald-700 text-sm">{activeExamConfig.maxMarksPerSubject} Marks</strong></span>
          </div>

          {marksValidationError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3.5 text-xs font-extrabold text-rose-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" /> {marksValidationError}
            </div>
          )}

          {marksSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-extrabold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {marksSuccessMsg}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Max Marks</th>
                  <th className="p-3">Marks Obtained</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {students.map((st) => {
                  const score = Number(marksRecords[st._id] || 0);
                  const max = activeExamConfig.maxMarksPerSubject;
                  const pct = max > 0 ? ((score / max) * 100).toFixed(1) : 0;
                  const grade = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : 'C';
                  const passStatus = pct >= 40 ? 'Pass' : 'Fail';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50">
                      <td className="p-3 font-black text-[#0C4A86]">{st.rollNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3 font-extrabold text-slate-500">{max}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          max={max}
                          min={0}
                          value={marksRecords[st._id] !== undefined ? marksRecords[st._id] : ''}
                          onChange={(e) => handleMarkChange(st._id, e.target.value)}
                          className="w-24 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-[#0C4A86] focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-700">{pct}%</td>
                      <td className="p-3">
                        <span className="bg-[#EBF5FF] text-[#0C4A86] px-2.5 py-0.5 rounded font-black border border-[#BFDBFE]">
                          {grade}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                          passStatus === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {passStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Homework Management Tab (File Upload Support - Req 7) */}
      {activeTab === 'Homework' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Homework Assignments ({activeClass.className})</h3>
              <p className="text-xs font-semibold text-slate-500">Create & upload PDF, Word, Excel, Images, Photos, Videos, PPTs</p>
            </div>

            <button
              onClick={() => setIsHomeworkModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-400" /> Create & Upload Homework
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 hover:bg-white transition-all">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#0C4A86]">{hw.subject}</span>
                  <span className="text-xs font-bold text-rose-600">Due: {hw.dueDate}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{hw.title}</h4>
                <p className="text-xs text-slate-600">{hw.description}</p>
                {hw.fileName && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#0096DA]">
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-600" /> {hw.fileName} ({hw.fileType})
                    </span>
                    <a href={hw.fileUrl || '#'} download className="text-[#0C4A86] underline hover:text-black font-extrabold">
                      View / Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Assignments Tab (File Upload Support - Req 8) */}
      {activeTab === 'Assignments' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Homework Assignments Upload ({activeClass.className})</h3>
              <p className="text-xs font-semibold text-slate-500">Upload coursework projects with document, photo & video attachments</p>
            </div>

            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-400" /> Create & Upload Assignment
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {assignmentList.map((asg) => (
              <div key={asg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 hover:bg-white transition-all">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#0C4A86]">{asg.subject}</span>
                  <span className="text-xs font-bold text-rose-600">Due: {asg.dueDate}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{asg.title}</h4>
                <p className="text-xs text-slate-600">{asg.description}</p>
                {asg.fileName && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#0096DA]">
                    <span className="flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-600" /> {asg.fileName} ({asg.fileType})
                    </span>
                    <a href={asg.fileUrl || '#'} download className="text-[#0C4A86] underline hover:text-black font-extrabold">
                      View / Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Homework Evaluation Tab */}
      {activeTab === 'Evaluation' && (
        <HomeworkEvaluationDashboard classId={selectedClassId} className={activeClass.className} />
      )}

      {/* 7. Exam Uploads & Schedule Tab (Req 9) */}
      {activeTab === 'Exams' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Exam Management & Uploads ({activeClass.className})</h3>
              <p className="text-xs font-semibold text-slate-500">Schedule examinations and upload PDF, document & video materials</p>
            </div>

            <button
              onClick={() => setIsCreateExamModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
            >
              <PlusCircle className="h-4 w-4 text-amber-400" /> Schedule & Upload Exam Material
            </button>
          </div>

          <div className="space-y-3">
            {examsList.map((ex) => (
              <div key={ex._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#EBF5FF] px-3 py-0.5 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                      {ex.examTypeName}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Max Marks: {ex.totalMarks}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-1">{ex.name}</h4>
                  <p className="text-xs text-slate-600">Date: {ex.examDate} • Time: {ex.startTime} - {ex.endTime}</p>

                  {ex.fileName && (
                    <div className="mt-2 text-xs font-bold text-[#0096DA] flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-600" /> Exam Material: {ex.fileName} ({ex.fileType})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Curriculum Tab */}
      {activeTab === 'Curriculum' && (
        <CurriculumSyllabusTracker classId={selectedClassId} className={activeClass.className} />
      )}

      {/* 9. Classroom Reports Tab */}
      {activeTab === 'ClassReports' && (
        <ClassReportsExporter classId={selectedClassId} className={activeClass.className} students={students} />
      )}

      {/* Modal: Create Homework & Upload Files (Req 7) */}
      {isHomeworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#0C4A86]">Create & Upload Homework</h3>
              <button onClick={() => setIsHomeworkModalOpen(false)} className="text-slate-400 font-bold hover:text-black">✕</button>
            </div>
            <form onSubmit={handleCreateHomework} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700">Homework Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Practice Sheet & Assignment"
                  value={homeworkForm.title}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700">Section</label>
                  <select
                    value={homeworkForm.section}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, section: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={homeworkForm.dueDate}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#BFDBFE] bg-slate-50 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Description</label>
                <textarea
                  rows="2"
                  value={homeworkForm.description}
                  onChange={(e) => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold"
                ></textarea>
              </div>

              {/* Upload Support: PDF, Doc, Excel, Images, Photos, Videos, PPT (Req 7) */}
              <div>
                <label className="font-extrabold text-slate-700">Upload Attachment (PDF, Doc, Excel, Photo, Video, PPT)</label>
                <input
                  type="file"
                  onChange={handleHomeworkFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.mov"
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2 font-bold"
                />
                {homeworkForm.fileName && (
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    Selected File: {homeworkForm.fileName} ({homeworkForm.fileType})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsHomeworkModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-5 py-2 font-extrabold text-white hover:bg-black">Submit & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment & Upload Files (Req 8) */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#0C4A86]">Create & Upload Assignment</h3>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-400 font-bold hover:text-black">✕</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-world Parabolas Project"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700">Section</label>
                  <select
                    value={assignmentForm.section}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, section: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[#BFDBFE] bg-slate-50 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Description</label>
                <textarea
                  rows="2"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold"
                ></textarea>
              </div>

              {/* Upload Support: PDF, Doc, Excel, Images, Photos, Videos, PPT (Req 8) */}
              <div>
                <label className="font-extrabold text-slate-700">Upload Attachment File / Video / Photo</label>
                <input
                  type="file"
                  onChange={handleAssignmentFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.mov"
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2 font-bold"
                />
                {assignmentForm.fileName && (
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    Selected File: {assignmentForm.fileName} ({assignmentForm.fileType})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-5 py-2 font-extrabold text-white hover:bg-black">Submit & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create & Schedule Exam (Req 9) */}
      {isCreateExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#0C4A86]">Schedule & Upload Exam Material</h3>
              <button onClick={() => setIsCreateExamModalOpen(false)} className="text-slate-400 font-bold hover:text-black">✕</button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 2: Polynomials & Equations"
                  value={createExamForm.name}
                  onChange={(e) => setCreateExamForm({ ...createExamForm, name: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700">7-Stage Exam Term *</label>
                <select
                  value={createExamForm.examType}
                  onChange={(e) => setCreateExamForm({ ...createExamForm, examType: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                >
                  {academicExamTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.sequenceOrder}. {t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={createExamForm.examDate}
                  onChange={(e) => setCreateExamForm({ ...createExamForm, examDate: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold"
                />
              </div>

              {/* Upload Exam Materials: PDF, Docs, Images, Videos (Req 9) */}
              <div>
                <label className="font-extrabold text-slate-700">Upload Exam Material (PDF, Question Paper, Video)</label>
                <input
                  type="file"
                  onChange={handleExamFileUpload}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2 font-bold"
                />
                {createExamForm.fileName && (
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    Selected File: {createExamForm.fileName} ({createExamForm.fileType})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsCreateExamModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-5 py-2 font-extrabold text-white hover:bg-black">Submit & Save Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      <ReportCardModal
        isOpen={!!selectedStudentForReportCard}
        onClose={() => setSelectedStudentForReportCard(null)}
        studentData={selectedStudentForReportCard}
        examName="Unit Test 1 (2026)"
      />
    </div>
  );
};

export default TeacherClassesPage;
