import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Clock, MapPin, Tag } from 'lucide-react';

const defaultClassroomActivities = [
  {
    id: 1,
    title: 'Grade 9 Mathematics Mental Quiz Competition',
    className: 'Grade 9 - A',
    subject: 'Mathematics',
    date: 'August 1, 2026',
    teacher: 'Ramesh Sharma',
    description: 'Interactive speed quiz and algebra formula calculation round conducted during class period.',
    mediaType: 'Photo Gallery',
    mediaCount: '4 Photos'
  },
  {
    id: 2,
    title: 'Geometry Practical Field Measurement Workshop',
    className: 'Grade 9 - A',
    subject: 'Mathematics',
    date: 'July 29, 2026',
    teacher: 'Ramesh Sharma',
    description: 'Outdoor practical session where students calculated perimeter, area, and triangles on school grounds.',
    mediaType: 'Video Clip',
    mediaCount: '1 Video (2 mins)'
  },
  {
    id: 3,
    title: 'Science Group Experiment: Chemical Reaction Indicators',
    className: 'Grade 9 - A',
    subject: 'Science',
    date: 'July 24, 2026',
    teacher: 'Sunita Verma',
    description: 'Hands-on chemistry lab experiment testing pH levels using natural litmus indicators.',
    mediaType: 'Photo Gallery',
    mediaCount: '6 Photos'
  }
];

const ParentClassroomActivities = () => {
  const navigate = useNavigate();

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
              Classroom Activities
            </span>
          </div>
          <h1 className="text-2xl font-black">Child's Classroom Activities</h1>
          <p className="text-sky-100 text-xs font-medium">View academic events, practical workshops & classroom presentations for Grade 9A.</p>
        </div>
      </div>

      {/* Classroom Activities Grid */}
      <div className="space-y-4">
        {defaultClassroomActivities.map((act) => (
          <div key={act.id} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EBF5FF] px-3.5 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                {act.className} • {act.subject}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {act.date}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900">{act.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Conducted by: <strong className="text-slate-900">{act.teacher}</strong></span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800 border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" /> {act.mediaType} ({act.mediaCount})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentClassroomActivities;
