import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Eye, ChevronDown, Filter, Search, BookOpen, CheckCircle2, X, UserCheck } from 'lucide-react';
import ReportCardModal from '../../components/common/ReportCardModal';
import { academicExamTypes, getExamTypeById, getExamResultsData } from '../../utils/academicExamConfig';

const StudentResults = ({ userId, user, student }) => {
  const [selectedExamType, setSelectedExamType] = useState(() => {
    return localStorage.getItem('student_selected_exam') || 'unit_test_1';
  });

  const [searchSubject, setSearchSubject] = useState('');
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [breakdownModalSubject, setBreakdownModalSubject] = useState(null);

  useEffect(() => {
    const handleStorageSync = () => {
      const stored = localStorage.getItem('student_selected_exam');
      if (stored && stored !== selectedExamType) {
        setSelectedExamType(stored);
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [selectedExamType]);

  const handleExamChange = (e) => {
    const newExam = e.target.value;
    setSelectedExamType(newExam);
    localStorage.setItem('student_selected_exam', newExam);
  };

  const activeExamConfig = getExamTypeById(selectedExamType);
  const rawResults = getExamResultsData(selectedExamType);

  const displayedMarks = rawResults.filter((item) => {
    return item.subject.toLowerCase().includes(searchSubject.toLowerCase());
  });

  const totalObtained = displayedMarks.reduce((sum, item) => sum + Number(item.marks || 0), 0);
  const totalMax = displayedMarks.reduce((sum, item) => sum + Number(item.maxMarks || activeExamConfig.maxMarksPerSubject), 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';

  const getGradeBadge = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (pct >= 80) return 'bg-[#EBF5FF] text-[#0C4A86] border-[#BFDBFE]';
    if (pct >= 70) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <Award className="h-3.5 w-3.5" /> Performance & Result Center
          </div>
          <h1 className="text-2xl font-bold">{activeExamConfig.name} — Result Report</h1>
          <p className="text-sky-100 text-sm">Subject-wise marks breakdown, score percentage, and official report cards.</p>
        </div>

        <button
          onClick={() => setIsReportCardOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#0C4A86] shadow-md hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <Eye className="h-4 w-4" /> Open Official Report Card
        </button>
      </div>

      {/* Synchronized 7-Stage Exam Selection Controls (Req 2, 3) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-4 w-4 text-[#0C4A86]" /> Select Result Report:
          </label>
          <div className="relative w-full sm:w-96">
            <select
              value={selectedExamType}
              onChange={handleExamChange}
              className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-extrabold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              {academicExamTypes.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.sequenceOrder}. {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Subject Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject..."
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Sequence Roadmap Indicator */}
      <div className="rounded-2xl bg-slate-100 p-3 border border-slate-200 text-xs font-bold flex items-center gap-2 overflow-x-auto text-slate-600">
        <span className="text-[#0C4A86] font-black uppercase text-[10px]">Academic Flow:</span>
        {academicExamTypes.map((type, idx) => (
          <React.Fragment key={type.id}>
            {idx > 0 && <span className="text-slate-300 font-normal">→</span>}
            <button
              onClick={() => {
                setSelectedExamType(type.id);
                localStorage.setItem('student_selected_exam', type.id);
              }}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                selectedExamType === type.id
                  ? 'bg-[#0C4A86] text-white shadow-2xs font-extrabold'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {type.shortLabel}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Exam Score Percentage</p>
          <p className="text-3xl font-black text-slate-900">{percentage}%</p>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> High Academic Standing
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Score Obtained</p>
          <p className="text-3xl font-black text-[#0C4A86]">{totalObtained} / {totalMax}</p>
          <p className="text-xs font-semibold text-slate-500">{displayedMarks.length} Subjects Evaluated</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selected Exam Report</p>
          <p className="text-2xl font-black text-emerald-600 truncate">{activeExamConfig.shortLabel}</p>
          <p className="text-xs font-semibold text-slate-500">Grade 9 - Sec A</p>
        </div>
      </div>

      {/* Subject-Wise Results Table (Req 3) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0C4A86]" /> Subject-Wise Results ({activeExamConfig.name})
          </h3>
          <span className="text-xs font-extrabold text-[#0C4A86] bg-[#EBF5FF] px-3 py-1 rounded-full border border-[#BFDBFE]">
            Click row for detailed breakdown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-l-2xl">Subject Name</th>
                <th className="p-4 font-bold">Maximum Marks</th>
                <th className="p-4 font-bold">Marks Obtained</th>
                <th className="p-4 font-bold">Percentage</th>
                <th className="p-4 font-bold">Grade</th>
                <th className="p-4 font-bold">Result Status</th>
                <th className="p-4 font-bold rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMarks.map((item, idx) => {
                const scored = Number(item.marks);
                const max = Number(item.maxMarks);
                const pct = max > 0 ? (scored / max) * 100 : 0;
                return (
                  <tr
                    key={idx}
                    onClick={() => setBreakdownModalSubject(item)}
                    className="hover:bg-[#EBF5FF]/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-black text-slate-900">{item.subject}</td>
                    <td className="p-4 font-bold text-slate-700">{max}</td>
                    <td className="p-4 font-black text-[#0C4A86] text-base">{scored}</td>
                    <td className="p-4 font-bold text-slate-700">{pct.toFixed(1)}%</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-black ${getGradeBadge(scored, max)}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBreakdownModalSubject(item);
                        }}
                        className="text-xs font-extrabold text-[#0C4A86] hover:underline"
                      >
                        Breakdown →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Result Breakdown Modal */}
      {breakdownModalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86]">
                  {breakdownModalSubject.examType}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{breakdownModalSubject.subject} — Detailed Breakdown</h3>
              </div>
              <button
                onClick={() => setBreakdownModalSubject(null)}
                className="p-1 text-slate-400 hover:text-black font-bold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Maximum Marks</span>
                <span className="text-lg font-black text-slate-800">{breakdownModalSubject.maxMarks}</span>
              </div>
              <div className="bg-[#EBF5FF] p-3 rounded-2xl border border-[#BFDBFE]">
                <span className="text-[#0C4A86] font-bold uppercase block text-[10px]">Marks Obtained</span>
                <span className="text-lg font-black text-[#0C4A86]">{breakdownModalSubject.marks}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Percentage</span>
                <span className="text-lg font-black text-slate-800">
                  {((breakdownModalSubject.marks / breakdownModalSubject.maxMarks) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-emerald-800 font-bold uppercase block text-[10px]">Grade & Status</span>
                <span className="text-lg font-black text-emerald-700">
                  {breakdownModalSubject.grade} ({breakdownModalSubject.status})
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                <UserCheck className="h-4 w-4 text-amber-600" /> Teacher Remarks:
              </div>
              <p className="text-amber-800 italic">"{breakdownModalSubject.comment}"</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBreakdownModalSubject(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0C4A86] text-white text-xs font-black"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        examName={activeExamConfig.name}
        studentData={{
          name: `${user?.firstName || 'Student'} ${user?.lastName || ''}`,
          rollNo: student?.rollNumber || '901',
          grade: student?.class?.grade || 'Grade 9',
          section: student?.class?.section || 'A',
        }}
        marksData={displayedMarks}
        attendancePct={96}
      />
    </div>
  );
};

export default StudentResults;
