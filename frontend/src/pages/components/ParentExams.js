import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Award, Download, Paperclip } from 'lucide-react';
import { academicExamTypes } from '../../utils/academicExamConfig';
import { schoolDataService } from '../../services/schoolDataStore';

const ParentExams = ({ selectedStudentId }) => {
  const navigate = useNavigate();
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('unit_test_1');
  const [examsList, setExamsList] = useState([]);

  useEffect(() => {
    const list = schoolDataService.getExamsList('c1');
    setExamsList(list);
  }, [selectedStudentId]);

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
              Examination Board
            </span>
          </div>
          <h1 className="text-2xl font-black">Official Examination Schedule</h1>
          <p className="text-sky-100 text-xs font-medium">Schedule, timings, maximum marks & exam instructions across 7 term stages.</p>
        </div>
      </div>

      {/* 7-Stage Exam Term Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-black text-[#0C4A86]">Select Examination Term:</span>
        <select
          value={selectedExamTypeId}
          onChange={(e) => setSelectedExamTypeId(e.target.value)}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
        >
          {academicExamTypes.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.sequenceOrder}. {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {examsList.map((ex) => (
          <div key={ex._id || ex.id} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EBF5FF] px-3.5 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                {ex.subject || 'Mathematics'}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                Max Marks: {ex.totalMarks || 100}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900">{ex.name || ex.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{ex.instructions || 'Standard examination instructions apply. Please bring hall ticket & stationary.'}</p>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-[#0C4A86]">
                <Calendar className="h-4 w-4" /> Date: <strong className="text-slate-900">{ex.examDate || 'August 25, 2026'}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-[#0096DA]">
                <Clock className="h-4 w-4" /> Time: <strong className="text-slate-900">{ex.startTime || '09:00 AM'} - {ex.endTime || '12:00 PM'}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <MapPin className="h-4 w-4" /> Location: <strong className="text-slate-900">Exam Hall 1</strong>
              </span>
            </div>

            {ex.fileName && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0096DA]">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-emerald-600" /> {ex.fileName} ({ex.fileType})
                </span>
                <a href={ex.fileUrl || '#'} download className="inline-flex items-center gap-1 text-[#0C4A86] underline font-extrabold hover:text-black">
                  <Download className="h-3.5 w-3.5" /> Download Materials
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentExams;
