import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Eye, Download, Printer, CheckCircle2, BookOpen, AlertCircle } from 'lucide-react';
import { academicExamTypes, getExamTypeById } from '../../utils/academicExamConfig';
import ReportCardModal from '../../components/common/ReportCardModal';

const ParentResults = ({ selectedStudentId }) => {
  const navigate = useNavigate();
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('unit_test_1');
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  const activeExamConfig = getExamTypeById(selectedExamTypeId);

  const studentData = {
    name: 'Ramesh Kumar',
    rollNumber: '09',
    grade: 'Grade 9',
    section: 'A',
    admissionNo: 'ADM-2026-0914',
    classTeacher: 'Ramesh Sharma'
  };

  const resultsData = [
    { subject: 'Mathematics', maxMarks: 100, marks: 92, grade: 'O', status: 'Pass', remarks: 'Outstanding problem solving skills.' },
    { subject: 'Science', maxMarks: 100, marks: 88, grade: 'A+', status: 'Pass', remarks: 'Great performance in physics & chemistry lab.' },
    { subject: 'English', maxMarks: 100, marks: 90, grade: 'O', status: 'Pass', remarks: 'Excellent creative writing and comprehension.' },
    { subject: 'Social Studies', maxMarks: 100, marks: 85, grade: 'A+', status: 'Pass', remarks: 'Very thorough history & geography answers.' },
    { subject: 'Computer Science', maxMarks: 100, marks: 95, grade: 'O', status: 'Pass', remarks: 'Top scorer in programming logic.' },
  ];

  const totalMax = resultsData.reduce((sum, r) => sum + r.maxMarks, 0);
  const totalObtained = resultsData.reduce((sum, r) => sum + r.marks, 0);
  const overallPercentage = ((totalObtained / totalMax) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Academic Performance
            </span>
          </div>
          <h1 className="text-2xl font-black">Official Examination Results & Report Cards</h1>
          <p className="text-sky-100 text-xs font-medium">Subject marks breakdown, grades, teacher evaluations & report card generator.</p>
        </div>
      </div>

      {/* Exam Term Selector & Summary Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-[#0C4A86]">Select Examination Term:</h3>
            <p className="text-xs text-slate-500 font-semibold">Synchronized evaluation results across terms</p>
          </div>

          <select
            value={selectedExamTypeId}
            onChange={(e) => setSelectedExamTypeId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-black text-slate-800 focus:outline-none cursor-pointer shadow-2xs"
          >
            {academicExamTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.sequenceOrder}. {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Overall Results Metric Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs font-bold">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-slate-400 uppercase text-[10px] block">Exam Term</span>
            <span className="text-base font-black text-slate-900">{activeExamConfig.name}</span>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200">
            <span className="text-blue-800 uppercase text-[10px] block">Total Marks</span>
            <span className="text-xl font-black text-blue-700">{totalObtained} / {totalMax}</span>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
            <span className="text-emerald-800 uppercase text-[10px] block">Overall Percentage</span>
            <span className="text-xl font-black text-emerald-700">{overallPercentage}%</span>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200">
            <span className="text-amber-800 uppercase text-[10px] block">Final Grade</span>
            <span className="text-xl font-black text-amber-700">Grade O</span>
          </div>
        </div>

        {/* Subject Breakdown Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-3">Subject</th>
                <th className="p-3">Max Marks</th>
                <th className="p-3">Marks Obtained</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Result Status</th>
                <th className="p-3">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {resultsData.map((res) => (
                <tr key={res.subject} className="hover:bg-slate-50">
                  <td className="p-3 font-black text-[#0C4A86]">{res.subject}</td>
                  <td className="p-3 text-slate-500">{res.maxMarks}</td>
                  <td className="p-3 font-black text-slate-900">{res.marks}</td>
                  <td className="p-3 font-bold text-emerald-700">{res.marks}%</td>
                  <td className="p-3">
                    <span className="rounded bg-[#EBF5FF] px-2.5 py-0.5 font-black text-[#0C4A86] border border-[#BFDBFE]">
                      {res.grade}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 font-extrabold text-emerald-800">
                      {res.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 italic">{res.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Viewer & Downloader Section (Req 9) */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-[#EBF5FF] p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
              Official School Report Card Ready
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Generate & Download Official Report Card</h3>
            <p className="text-xs text-slate-600 font-medium">Includes principal seal, teacher signatures, attendance record & subject grade sheet.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsReportCardOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-black transition-all"
            >
              <Eye className="h-4 w-4 text-amber-400" /> View Report Card
            </button>
          </div>
        </div>
      </div>

      {/* Official Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        studentData={studentData}
        marksData={resultsData}
        attendancePct={92}
        examName={`${activeExamConfig.name} (${activeExamConfig.academicYear})`}
      />
    </div>
  );
};

export default ParentResults;
