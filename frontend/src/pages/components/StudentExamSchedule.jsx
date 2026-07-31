import React, { useState } from 'react';
import { CalendarDays, Clock, FileText, Award, Download, CheckCircle2 } from 'lucide-react';

const StudentExamSchedule = () => {
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term Examinations 2026');

  const examSchedules = [
    {
      id: 1,
      subject: 'Mathematics',
      date: '2026-08-10',
      time: '09:00 AM - 12:00 PM',
      duration: '3 Hours',
      maxMarks: 100,
      room: 'Hall A - Seat 42',
      syllabus: 'Chapters 1 to 5 (Algebra, Trigonometry, Quadratic Equations)',
      status: 'Upcoming',
    },
    {
      id: 2,
      subject: 'Physics',
      date: '2026-08-12',
      time: '09:00 AM - 12:00 PM',
      duration: '3 Hours',
      maxMarks: 100,
      room: 'Physics Lab - Bench 12',
      syllabus: 'Kinematics, Thermodynamics, Optics & Wave Motion',
      status: 'Upcoming',
    },
    {
      id: 3,
      subject: 'Chemistry',
      date: '2026-08-14',
      time: '09:00 AM - 12:00 PM',
      duration: '3 Hours',
      maxMarks: 100,
      room: 'Hall B - Seat 18',
      syllabus: 'Organic Chemistry Reactions, Periodic Table, Electrochemistry',
      status: 'Upcoming',
    },
    {
      id: 4,
      subject: 'English Literature',
      date: '2026-08-17',
      time: '09:00 AM - 11:30 AM',
      duration: '2.5 Hours',
      maxMarks: 80,
      room: 'Room 201',
      syllabus: 'Macbeth Act I-III, Unseen Passage, Essay Writing',
      status: 'Upcoming',
    },
    {
      id: 5,
      subject: 'Computer Science',
      date: '2026-08-19',
      time: '09:00 AM - 11:30 AM',
      duration: '2.5 Hours',
      maxMarks: 70,
      room: 'Computer Lab 1',
      syllabus: 'Python Programming, SQL Queries & Database Concepts',
      status: 'Upcoming',
    },
  ];

  const handleDownloadHallTicket = () => {
    const element = document.createElement('a');
    const content = `OFFICIAL EXAMINATION HALL TICKET 2026\nStudent Name: Student\nRoll No: 101\nExam: Mid-Term Examinations 2026\n\nSchedule:\n` +
      examSchedules.map(e => `${e.date} | ${e.subject} | ${e.time} | Room: ${e.room}`).join('\n');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'exam_hall_ticket_2026.txt';
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
            <CalendarDays className="h-3.5 w-3.5" /> Examination Portal
          </div>
          <h1 className="text-2xl font-bold">Exam Schedule & Datesheet</h1>
          <p className="text-orange-100 text-sm">Official datesheet, syllabus coverage & seating arrangement.</p>
        </div>

        <button
          onClick={handleDownloadHallTicket}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-orange-600 shadow-md hover:bg-orange-50 transition-all"
        >
          <Download className="h-4 w-4" /> Download Hall Ticket
        </button>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {examSchedules.map((exam) => (
          <div
            key={exam.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  {exam.subject}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Max Marks: {exam.maxMarks}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">{exam.subject} Examination</h3>

              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="font-semibold text-slate-700">Syllabus:</span> {exam.syllabus}
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-sm">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {exam.time} ({exam.duration})
              </div>
              <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1">
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
