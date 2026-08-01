import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Award, Download, Filter, ArrowRight } from 'lucide-react';
import { academicExamTypes, getExamSchedules } from '../../utils/academicExamConfig';

const StudentExamSchedule = () => {
  const navigate = useNavigate();
  const [selectedExamType, setSelectedExamType] = useState(() => {
    return localStorage.getItem('student_selected_exam') || 'unit_test_1';
  });

  useEffect(() => {
    localStorage.setItem('student_selected_exam', selectedExamType);
  }, [selectedExamType]);

  const activeExamConfig = academicExamTypes.find((e) => e.id === selectedExamType) || academicExamTypes[0];
  const filteredSchedules = getExamSchedules(selectedExamType);

  const handleSelectExamAndGoToResults = (examTypeKey) => {
    setSelectedExamType(examTypeKey);
    localStorage.setItem('student_selected_exam', examTypeKey);
    navigate('/dashboard/results');
  };

  const handleDownloadDatesheet = () => {
    const content = `OFFICIAL ACADEMIC EXAMINATION DATESHEET 2026-2027\nStudent Name: Student\nGrade: Class 9 Section A\nExam Category: ${activeExamConfig.name}\n\n` +
      filteredSchedules.map(e => `${e.date} | ${e.examTypeName} | ${e.subject} | ${e.time} | Max Marks: ${e.maxMarks} | Room: ${e.room}`).join('\n');

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `exam_schedule_${selectedExamType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <CalendarDays className="h-3.5 w-3.5" /> Examination Portal
          </div>
          <h1 className="text-2xl font-bold">Academic Examination Schedule</h1>
          <p className="text-sky-100 text-sm">7-stage academic exam sequence, maximum marks configuration, and direct result reports.</p>
        </div>

        <button
          onClick={handleDownloadDatesheet}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#0C4A86] shadow-md hover:bg-slate-50 transition-all self-start md:self-auto"
        >
          <Download className="h-4 w-4" /> Download Datesheet
        </button>
      </div>

      {/* Synchronized 7-Stage Exam Selector Bar (Req 2, 3) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-4 w-4 text-[#0C4A86]" /> Select Examination:
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full sm:w-96 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all cursor-pointer shadow-sm"
          >
            {academicExamTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.sequenceOrder}. {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => handleSelectExamAndGoToResults(selectedExamType)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
        >
          <Award className="h-4 w-4 text-amber-400" />
          <span>View Result Report ({activeExamConfig.shortLabel})</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Sequence Roadmap Indicator */}
      <div className="rounded-2xl bg-slate-100 p-3 border border-slate-200 text-xs font-bold flex items-center gap-2 overflow-x-auto text-slate-600">
        <span className="text-[#0C4A86] font-black uppercase text-[10px]">Academic Flow:</span>
        {academicExamTypes.map((type, idx) => (
          <React.Fragment key={type.id}>
            {idx > 0 && <span className="text-slate-300 font-normal">→</span>}
            <button
              onClick={() => setSelectedExamType(type.id)}
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

      {/* Exam Cards List */}
      <div className="space-y-4">
        {filteredSchedules.map((exam) => (
          <div
            key={exam.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                  {exam.examTypeName}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                  Maximum Marks: {exam.maxMarks}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">{exam.subject}</h3>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">Syllabus Coverage:</span> {exam.syllabus}
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-sm">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <CalendarDays className="h-4 w-4 text-[#0C4A86]" />
                {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {exam.time} ({exam.duration})
              </div>
              <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-1">
                {exam.room}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentExamSchedule;
