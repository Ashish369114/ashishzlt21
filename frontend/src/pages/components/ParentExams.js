import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Award, Download, Paperclip, BookOpen, Filter } from 'lucide-react';
import { academicExamTypes } from '../../utils/academicExamConfig';

const allSubjectsExamSchedule = [
  // Unit Test 1
  { id: 'ex-1', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'Mathematics', examDate: '2026-08-10', day: 'Monday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', maxMarks: 20 },
  { id: 'ex-2', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'Science', examDate: '2026-08-12', day: 'Wednesday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Science Lab 1', maxMarks: 20 },
  { id: 'ex-3', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'English', examDate: '2026-08-14', day: 'Friday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', maxMarks: 20 },
  { id: 'ex-4', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'Social Studies', examDate: '2026-08-17', day: 'Monday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', maxMarks: 20 },
  { id: 'ex-5', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'Telugu', examDate: '2026-08-19', day: 'Wednesday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', maxMarks: 20 },
  { id: 'ex-6', examType: 'unit_test_1', examName: 'Unit Test 1', subject: 'Hindi', examDate: '2026-08-21', day: 'Friday', startTime: '10:00 AM', endTime: '11:00 AM', room: 'Room 201', maxMarks: 20 },

  // Mid-Term 1
  { id: 'ex-7', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'Mathematics', examDate: '2026-09-15', day: 'Tuesday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Main Hall', maxMarks: 80 },
  { id: 'ex-8', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'Science', examDate: '2026-09-17', day: 'Thursday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Science Block', maxMarks: 80 },
  { id: 'ex-9', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'English', examDate: '2026-09-19', day: 'Saturday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Room 304', maxMarks: 80 },
  { id: 'ex-10', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'Social Studies', examDate: '2026-09-22', day: 'Tuesday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Room 304', maxMarks: 80 },
  { id: 'ex-11', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'Telugu', examDate: '2026-09-24', day: 'Thursday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Room 304', maxMarks: 80 },
  { id: 'ex-12', examType: 'mid_term_1', examName: 'Mid-Term 1 / Half-Yearly', subject: 'Hindi', examDate: '2026-09-26', day: 'Saturday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Room 304', maxMarks: 80 }
];

const ParentExams = ({ selectedStudentId, student }) => {
  const navigate = useNavigate();
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('unit_test_1');

  const studentGrade = student?.grade || '5';
  const studentSection = student?.section || 'A';
  const studentName = student?.userId?.firstName
    ? `${student.userId.firstName} ${student.userId.lastName || ''}`.trim()
    : (student?.name || 'Child');

  // Filter exams for selected term
  const examsForTerm = allSubjectsExamSchedule.filter((ex) => ex.examType === selectedExamTypeId);
  const activeExamConfig = academicExamTypes.find((e) => e.id === selectedExamTypeId) || academicExamTypes[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Examination Schedule
            </span>
          </div>
          <h1 className="text-2xl font-black">{studentName}'s Examination Schedule</h1>
          <p className="text-sky-100 text-xs font-medium">Complete subject-wise exam dates, timings & exam room allocations for Grade {studentGrade} - Sec {studentSection}.</p>
        </div>
      </div>

      {/* Term Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-black text-[#0C4A86] flex items-center gap-2 whitespace-nowrap">
            <Filter className="h-4 w-4 text-[#0096DA]" /> Select Examination Term:
          </label>
          <select
            value={selectedExamTypeId}
            onChange={(e) => setSelectedExamTypeId(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-black text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs w-full sm:w-80"
          >
            {academicExamTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.sequenceOrder}. {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-[#0C4A86] font-black">{examsForTerm.length}</span> subject exams for <strong className="text-slate-800">{activeExamConfig.name}</strong>
        </div>
      </div>

      {/* Exam Schedule Table (Req 7) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#0C4A86] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0096DA]" /> Complete Subject Exam Schedule ({activeExamConfig.name})
          </h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            All Subjects Schedule
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-3">Exam Name</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Exam Date</th>
                <th className="p-3">Day</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">End Time</th>
                <th className="p-3">Room / Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {examsForTerm.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-[#0C4A86]">{ex.examName}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-[#EBF5FF] px-3 py-0.5 font-black text-[#0C4A86] border border-[#BFDBFE]">
                      {ex.subject}
                    </span>
                  </td>
                  <td className="p-3 font-black text-slate-900">{ex.examDate}</td>
                  <td className="p-3 text-slate-600">{ex.day}</td>
                  <td className="p-3 text-emerald-700 font-bold">{ex.startTime}</td>
                  <td className="p-3 text-rose-700 font-bold">{ex.endTime}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-purple-50 px-2.5 py-0.5 font-bold text-purple-800 border border-purple-200">
                      {ex.room}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentExams;
