import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode, Download, BookOpen, Clock, Paperclip, FileText } from 'lucide-react';

const defaultStudyNotesList = [
  {
    id: 1,
    title: 'Polynomials & Algebraic Expressions Comprehensive Notes',
    subject: 'Mathematics',
    teacher: 'Ramesh Sharma',
    date: 'August 1, 2026',
    topic: 'Algebra & Formulae',
    fileName: 'Grade9_Polynomials_Notes.pdf',
    fileType: 'PDF Document',
    description: 'Detailed study notes covering quadratic equations, polynomial division, and practice formula sheets.'
  },
  {
    id: 2,
    title: 'Coordinate Geometry & Slope Calculations',
    subject: 'Mathematics',
    teacher: 'Ramesh Sharma',
    date: 'July 28, 2026',
    topic: 'Geometry & Graphs',
    fileName: 'Geometry_Coordinate_Guide.docx',
    fileType: 'Word Document',
    description: 'Step-by-step illustrations of Cartesian coordinates, distance formula, and slope derivation.'
  },
  {
    id: 3,
    title: 'Force & Laws of Motion Presentation Slides',
    subject: 'Science',
    teacher: 'Sunita Verma',
    date: 'July 25, 2026',
    topic: 'Physics',
    fileName: 'Physics_Newton_Laws.pptx',
    fileType: 'PowerPoint Slide',
    description: 'Interactive slide deck on Newton 3 Laws of motion with real-world examples and diagrams.'
  }
];

const ParentStudyNotes = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredNotes = defaultStudyNotesList.filter((note) => {
    if (selectedSubject === 'All') return true;
    return note.subject === selectedSubject;
  });

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
              Academic Resources
            </span>
          </div>
          <h1 className="text-2xl font-black">Study Notes & Learning Materials</h1>
          <p className="text-sky-100 text-xs font-medium">Access and download faculty lesson notes, study guides, and reference documents.</p>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-extrabold text-[#0C4A86]">Filter by Subject:</span>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="All">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>
      </div>

      {/* Study Notes List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredNotes.map((note) => (
          <div key={note.id} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-black text-[#0C4A86] border border-[#BFDBFE]">
                {note.subject}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {note.date}
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900 leading-snug">{note.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{note.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Topic: <strong className="text-slate-800">{note.topic}</strong></span>
              <span className="text-[#0096DA]">By {note.teacher}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0096DA]">
              <span className="flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-emerald-600" /> {note.fileName} ({note.fileType})
              </span>
              <button
                onClick={() => alert(`Downloading ${note.fileName}...`)}
                className="inline-flex items-center gap-1 text-[#0C4A86] underline font-extrabold hover:text-black"
              >
                <Download className="h-3.5 w-3.5" /> Download Notes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentStudyNotes;
