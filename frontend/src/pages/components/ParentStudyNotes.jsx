import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCode, Download, BookOpen, Clock, Paperclip, FileText } from 'lucide-react';

const defaultStudyNotesList = [
  // Grade 1 Study Notes
  {
    id: 101,
    title: 'Grade 1 English: Alphabets, Phonics & Easy Words Notes',
    subject: 'English',
    teacher: 'Ananya Roy',
    date: 'August 2, 2026',
    topic: 'Phonics & Reading',
    fileName: 'Grade1_English_Phonics.pdf',
    fileType: 'PDF Document',
    description: 'Fun phonics sounds, letter tracing guides, and 3-letter word reading exercises for Grade 1 beginners.',
    grade: '1'
  },
  {
    id: 102,
    title: 'Grade 1 Mathematics: Number Counting & Shapes Guide',
    subject: 'Mathematics',
    teacher: 'Ramesh Sharma',
    date: 'July 30, 2026',
    topic: 'Numbers 1-100 & Shapes',
    fileName: 'Grade1_Math_Counting_Shapes.pdf',
    fileType: 'PDF Document',
    description: 'Illustrated guide on counting numbers 1 to 100, basic addition using picture objects, and 2D geometric shapes.',
    grade: '1'
  },
  {
    id: 103,
    title: 'Grade 1 Science: Living Things & Plant World Notes',
    subject: 'Science',
    teacher: 'Sunita Verma',
    date: 'July 26, 2026',
    topic: 'Plants & Animals',
    fileName: 'Grade1_Science_Plants_Animals.pdf',
    fileType: 'PDF Document',
    description: 'Easy notes explaining parts of a plant, domestic animals, and healthy habits for Grade 1 students.',
    grade: '1'
  },
  // Grade 5 Study Notes
  {
    id: 1,
    title: 'Grade 5 Mathematics: Fractions & Decimals Masterclass',
    subject: 'Mathematics',
    teacher: 'Ramesh Sharma',
    date: 'August 1, 2026',
    topic: 'Fractions & Decimals',
    fileName: 'Grade5_Fractions_Decimals_Notes.pdf',
    fileType: 'PDF Document',
    description: 'Comprehensive study notes with practice problem sheets on equivalent fractions and decimal arithmetic.',
    grade: '5'
  },
  {
    id: 2,
    title: 'Grade 5 Science: Plant Life Cycle & Photosynthesis',
    subject: 'Science',
    teacher: 'Sunita Verma',
    date: 'July 28, 2026',
    topic: 'Botany & Plant Science',
    fileName: 'Grade5_Plant_Life_Cycle.pdf',
    fileType: 'PDF Document',
    description: 'Illustrated notes on plant germination stages, leaf taxonomy, and chlorophyll sunlight absorption.',
    grade: '5'
  },
  {
    id: 3,
    title: 'Grade 5 English: Parts of Speech & Sentence Building',
    subject: 'English',
    teacher: 'Ananya Roy',
    date: 'July 25, 2026',
    topic: 'Grammar',
    fileName: 'Grade5_Grammar_Mastery.docx',
    fileType: 'Word Document',
    description: 'Rules and exercises for nouns, pronouns, adjectives, adverbs, and complex sentence structures.',
    grade: '5'
  },
  // Grade 8 Study Notes
  {
    id: 4,
    title: 'Grade 8 Polynomials & Algebraic Expressions Notes',
    subject: 'Mathematics',
    teacher: 'Ramesh Sharma',
    date: 'August 1, 2026',
    topic: 'Algebra & Formulae',
    fileName: 'Grade8_Polynomials_Notes.pdf',
    fileType: 'PDF Document',
    description: 'Detailed study notes covering quadratic equations, polynomial division, and formula sheets.',
    grade: '8'
  },
  {
    id: 5,
    title: 'Grade 8 Force & Laws of Motion Presentation Slides',
    subject: 'Science',
    teacher: 'Sunita Verma',
    date: 'July 25, 2026',
    topic: 'Physics',
    fileName: 'Grade8_Physics_Newton_Laws.pptx',
    fileType: 'PowerPoint Slide',
    description: 'Interactive slide deck on Newton 3 Laws of motion with real-world momentum examples.',
    grade: '8'
  }
];

const ParentStudyNotes = ({ selectedStudentId, student }) => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('All');

  const studentGrade = student?.grade || '1';
  const studentName = student?.userId?.firstName
    ? `${student.userId.firstName} ${student.userId.lastName || ''}`.trim()
    : (student?.name || 'Child');

  const filteredNotes = defaultStudyNotesList.filter((note) => {
    const matchesGrade = note.grade === String(studentGrade);
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesGrade && matchesSubject;
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
          <h1 className="text-2xl font-black">{studentName}'s Study Notes & Learning Materials</h1>
          <p className="text-sky-100 text-xs font-medium">Access and download faculty lesson notes for Grade {studentGrade}.</p>
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
