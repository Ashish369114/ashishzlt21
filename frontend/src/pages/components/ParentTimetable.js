import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, BookOpen, MapPin, User } from 'lucide-react';

const defaultTimetable = [
  { time: '8:30 AM - 9:15 AM', monday: 'Mathematics (9A)', tuesday: 'Physics (9A)', wednesday: 'Mathematics (9A)', thursday: 'Chemistry (9A)', friday: 'Mathematics (9A)', saturday: 'Lab Session' },
  { time: '9:15 AM - 10:00 AM', monday: 'English Lit (9A)', tuesday: 'Biology (9A)', wednesday: 'English Lit (9A)', thursday: 'Biology (9A)', friday: 'English Lit (9A)', saturday: 'Sports Hour' },
  { time: '10:15 AM - 11:00 AM', monday: 'Social Studies', tuesday: 'Social Studies', wednesday: 'Free Period', thursday: 'Social Studies', friday: 'Computer Science', saturday: 'Activity Hour' },
  { time: '11:00 AM - 11:45 AM', monday: 'Computer Science', tuesday: 'Mathematics (9A)', wednesday: 'Science Lab', thursday: 'Mathematics (9A)', friday: 'Social Studies', saturday: 'Staff Sync' }
];

const ParentTimetable = ({ selectedStudentId }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('weekly');

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
              Class Schedule
            </span>
          </div>
          <h1 className="text-2xl font-black">Child's Weekly Class Timetable</h1>
          <p className="text-sky-100 text-xs font-medium">Daily period breakdown, subject schedules, teachers & classroom assignments.</p>
        </div>
      </div>

      {/* View Toggle Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-black text-[#0C4A86]">Schedule View Mode:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
              viewMode === 'weekly'
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
              viewMode === 'daily'
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today's View
          </button>
        </div>
      </div>

      {/* Timetable Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-3">Time Slot</th>
                <th className="p-3">Monday</th>
                <th className="p-3">Tuesday</th>
                <th className="p-3">Wednesday</th>
                <th className="p-3">Thursday</th>
                <th className="p-3">Friday</th>
                <th className="p-3">Saturday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {defaultTimetable.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-black text-[#0096DA]">{row.time}</td>
                  <td className="p-3 font-bold text-slate-900">{row.monday}</td>
                  <td className="p-3">{row.tuesday}</td>
                  <td className="p-3">{row.wednesday}</td>
                  <td className="p-3">{row.thursday}</td>
                  <td className="p-3">{row.friday}</td>
                  <td className="p-3 text-emerald-700 font-bold">{row.saturday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentTimetable;
