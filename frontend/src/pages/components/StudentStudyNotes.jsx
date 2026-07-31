import React, { useState } from 'react';
import { BookOpen, Download, Search, FileText, CheckCircle, Folder } from 'lucide-react';

const StudentStudyNotes = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleNotes = [
    {
      id: 1,
      title: 'Quadratic Equations & Polynomials Summary',
      subject: 'Mathematics',
      author: 'Mr. Sharma',
      date: '2026-07-20',
      fileSize: '2.4 MB',
      type: 'PDF Document',
      description: 'Comprehensive formula sheet and solved examples for Chapter 4 Quadratic Equations.',
    },
    {
      id: 2,
      title: 'Cellular Respiration & Photosynthesis Diagram Notes',
      subject: 'Science',
      author: 'Dr. Anitha',
      date: '2026-07-18',
      fileSize: '4.1 MB',
      type: 'PDF Document',
      description: 'Handwritten annotated diagrams and step-by-step notes on cellular respiration.',
    },
    {
      id: 3,
      title: 'Modern World History & Cold War Revision',
      subject: 'Social Studies',
      author: 'Mrs. Verma',
      date: '2026-07-15',
      fileSize: '1.8 MB',
      type: 'PDF Document',
      description: 'Key timelines, dates, and causes of major events in WWII and Cold War.',
    },
    {
      id: 4,
      title: 'Grammar Guide: Active & Passive Voice + Direct Speech',
      subject: 'English',
      author: 'Ms. Elizabeth',
      date: '2026-07-12',
      fileSize: '950 KB',
      type: 'PDF Document',
      description: 'Rulebook with 50 practice exercises for active to passive conversion.',
    },
    {
      id: 5,
      title: 'Python Data Structures & Algorithm Basics',
      subject: 'Computer Science',
      author: 'Mr. Rajesh',
      date: '2026-07-10',
      fileSize: '3.2 MB',
      type: 'PDF Document',
      description: 'Notes on lists, tuples, dictionaries, sorting algorithms with code snippets.',
    },
  ];

  const subjects = ['All', 'Mathematics', 'Science', 'Social Studies', 'English', 'Computer Science'];

  const filteredNotes = sampleNotes.filter((note) => {
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleDownload = (note) => {
    // Generate dummy download prompt or blob file download
    const element = document.createElement('a');
    const file = new Blob([`Study Note: ${note.title}\nSubject: ${note.subject}\nAuthor: ${note.author}\n\nDescription:\n${note.description}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <BookOpen className="h-3.5 w-3.5" /> Learning Resources
          </div>
          <h1 className="text-2xl font-bold">Study Notes & Reference Material</h1>
          <p className="text-emerald-100 text-sm">Access curated chapter notes, revision guides, and teacher handouts.</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/20 text-center">
          <p className="text-xs text-emerald-100 uppercase font-semibold">Total Documents</p>
          <p className="text-2xl font-extrabold">{sampleNotes.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredNotes.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <Folder className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No study notes found</p>
            <p className="text-xs">Try selecting another subject or clearing your search term.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {note.subject}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{note.fileSize}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{note.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span>By {note.author}</span> • <span>{note.date}</span>
                </div>
                <button
                  onClick={() => handleDownload(note)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentStudyNotes;
