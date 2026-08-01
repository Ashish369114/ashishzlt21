import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, AlertCircle, Paperclip, Download, BookOpen } from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataStore';

const ParentAssignments = ({ selectedStudentId }) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch assignments for student class
    const list = schoolDataService.getAssignmentList('c1');
    setAssignments(list);
    setLoading(false);
  }, [selectedStudentId]);

  if (loading) {
    return <div className="p-8 text-center text-sm font-bold text-slate-500">Loading assignments...</div>;
  }

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
              Academic Coursework
            </span>
          </div>
          <h1 className="text-2xl font-black">Student Coursework & Assignments</h1>
          <p className="text-sky-100 text-xs font-medium">Track your child's assignment progress, submission status & teacher feedback.</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {assignments.map((asg) => (
          <div key={asg.id} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                {asg.subject}
              </span>
              <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Due: {asg.dueDate}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900">{asg.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Teacher: <strong className="text-slate-800">Ramesh Sharma</strong></span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted ✓
              </span>
            </div>

            {asg.fileName && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0096DA]">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Paperclip className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{asg.fileName}</span>
                </span>
                <a href={asg.fileUrl || '#'} download className="inline-flex items-center gap-1 text-[#0C4A86] underline font-extrabold hover:text-black">
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

export default ParentAssignments;
