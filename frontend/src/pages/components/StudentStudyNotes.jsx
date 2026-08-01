import React, { useState } from 'react';
import { BookOpen, Download, Search, FileText, Folder, Video, Image, Eye, Play, X, File } from 'lucide-react';

const StudentStudyNotes = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state for viewing media/files
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: '', title: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '', title: '' });
  const [docModal, setDocModal] = useState({ isOpen: false, docName: '', content: '' });

  const sampleNotes = [
    {
      id: 1,
      title: 'Quadratic Equations & Polynomials Summary',
      subject: 'Mathematics',
      author: 'Mr. Sharma',
      date: '2026-07-20',
      fileSize: '2.4 MB',
      type: 'pdf',
      description: 'Comprehensive formula sheet and solved examples for Chapter 4 Quadratic Equations.',
      attachments: [
        { id: 'sn_1', name: 'Quadratic_Formula_Sheet.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
        { id: 'sn_2', name: 'Quadratic_Graphs_Diagram.png', type: 'image', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
        { id: 'sn_3', name: 'Polynomial_Roots_Lecture.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
      ]
    },
    {
      id: 2,
      title: 'Cellular Respiration & Photosynthesis Diagram Notes',
      subject: 'Science',
      author: 'Dr. Anitha',
      date: '2026-07-18',
      fileSize: '4.1 MB',
      type: 'pdf',
      description: 'Handwritten annotated diagrams and step-by-step notes on cellular respiration.',
      attachments: [
        { id: 'sn_4', name: 'Respiration_Diagrams.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
        { id: 'sn_5', name: 'Photosynthesis_Flowchart.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    {
      id: 3,
      title: 'Modern World History & Cold War Revision',
      subject: 'Social Studies',
      author: 'Mrs. Verma',
      date: '2026-07-15',
      fileSize: '1.8 MB',
      type: 'doc',
      description: 'Key timelines, dates, and causes of major events in WWII and Cold War.',
      attachments: [
        { id: 'sn_6', name: 'World_History_Timeline.docx', type: 'doc', url: 'data:text/plain;base64,V29ybGQgSGlzdG9yeSBUaW1lbGluZQ==' },
        { id: 'sn_7', name: 'Cold_War_Documentary_Clip.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
      ]
    },
    {
      id: 4,
      title: 'Grammar Guide: Active & Passive Voice + Direct Speech',
      subject: 'English',
      author: 'Ms. Elizabeth',
      date: '2026-07-12',
      fileSize: '950 KB',
      type: 'pdf',
      description: 'Rulebook with 50 practice exercises for active to passive conversion.',
      attachments: [
        { id: 'sn_8', name: 'Grammar_Rulebook_2026.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' }
      ]
    },
    {
      id: 5,
      title: 'Python Data Structures & Algorithm Basics',
      subject: 'Computer Science',
      author: 'Mr. Rajesh',
      date: '2026-07-10',
      fileSize: '3.2 MB',
      type: 'video',
      description: 'Notes on lists, tuples, dictionaries, sorting algorithms with code snippets and video walk-through.',
      attachments: [
        { id: 'sn_9', name: 'Python_Data_Structures.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
        { id: 'sn_10', name: 'Sorting_Algorithms_Tutorial.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
      ]
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
    const element = document.createElement('a');
    const file = new Blob([`Study Note: ${note.title}\nSubject: ${note.subject}\nAuthor: ${note.author}\n\nDescription:\n${note.description}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-emerald-600" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-rose-600" />;
      default:
        return <File className="h-4 w-4 text-[#0096DA]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <BookOpen className="h-3.5 w-3.5" /> Learning Resources
          </div>
          <h1 className="text-2xl font-bold">Study Notes & Learning Materials</h1>
          <p className="text-sky-100 text-sm">Access chapter notes, PDF handouts, diagram photos, and instructional videos.</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/20 text-center">
          <p className="text-xs text-sky-100 uppercase font-bold">Total Documents</p>
          <p className="text-2xl font-black">{sampleNotes.length}</p>
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
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-[#0C4A86] text-white shadow-sm'
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
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all"
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
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                    {note.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{note.fileSize}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{note.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{note.description}</p>
                </div>

                {/* Uploaded Materials & Media Attachments (Req 5) */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Uploaded Learning Files:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {note.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold"
                      >
                        {getAttachmentIcon(att.type)}
                        <span className="max-w-[140px] truncate text-slate-800">{att.name}</span>

                        {att.type === 'video' ? (
                          <button
                            type="button"
                            onClick={() => setVideoModal({ isOpen: true, videoUrl: att.url, title: att.name })}
                            className="ml-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          >
                            <Play className="h-3 w-3" /> Watch
                          </button>
                        ) : att.type === 'image' ? (
                          <button
                            type="button"
                            onClick={() => setImageModal({ isOpen: true, imageUrl: att.url, title: att.name })}
                            className="ml-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          >
                            <Eye className="h-3 w-3" /> Photo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDocModal({ isOpen: true, docName: att.name, content: note.description })}
                            className="ml-1 text-[10px] font-extrabold text-[#0C4A86] bg-[#EBF5FF] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400">
                  <span>By {note.author}</span> • <span>{note.date}</span>
                </div>
                <button
                  onClick={() => handleDownload(note)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Note
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-400" /> {videoModal.title}
              </h3>
              <button onClick={() => setVideoModal({ isOpen: false, videoUrl: '', title: '' })} className="p-1 hover:text-purple-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex justify-center">
              <video src={videoModal.videoUrl} controls autoPlay className="max-h-[450px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                <Image className="h-4 w-4 text-emerald-600" /> {imageModal.title}
              </h3>
              <button onClick={() => setImageModal({ isOpen: false, imageUrl: '', title: '' })} className="p-1 text-slate-500 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex justify-center">
              <img src={imageModal.imageUrl} alt={imageModal.title} className="max-h-[450px] object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#0C4A86] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0096DA]" /> {docModal.docName}
              </h3>
              <button onClick={() => setDocModal({ isOpen: false, docName: '', content: '' })} className="p-1 text-slate-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-900">Study Note Overview:</p>
              <p>{docModal.content}</p>
              <p className="text-slate-500 italic mt-2">Study reference material provided by subject faculty.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDocModal({ isOpen: false, docName: '', content: '' })}
                className="px-5 py-2 rounded-xl bg-[#0C4A86] text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStudyNotes;
