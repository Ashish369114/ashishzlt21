import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Paperclip, Download, CheckCircle2 } from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataStore';

const ParentHomework = ({ selectedStudentId }) => {
  const navigate = useNavigate();
  const [homeworkList, setHomeworkList] = useState([]);

  useEffect(() => {
    const list = schoolDataService.getHomeworkList('c1');
    setHomeworkList(list);
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
              Daily Homework
            </span>
          </div>
          <h1 className="text-2xl font-black">Child's Homework Assignments</h1>
          <p className="text-sky-100 text-xs font-medium">Review assigned homework, due dates, completion status & download teacher attachments.</p>
        </div>
      </div>

      {/* Homework Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {homeworkList.map((hw) => (
          <div key={hw.id} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                {hw.subject}
              </span>
              <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Due: {hw.dueDate}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900">{hw.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Teacher: <strong className="text-slate-800">Ramesh Sharma</strong></span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed ✓
              </span>
            </div>

            {hw.fileName && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0096DA]">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Paperclip className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{hw.fileName}</span>
                </span>
                <a href={hw.fileUrl || '#'} download className="inline-flex items-center gap-1 text-[#0C4A86] underline font-extrabold hover:text-black">
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentHomework;
