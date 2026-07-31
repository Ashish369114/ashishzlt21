import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CheckCircle2, BookOpen, ClipboardCheck, FileText, Clock, CalendarDays, Award,
  Sparkles, Bell, Trophy, Camera, Quote, Calendar, MapPin, ArrowRight, Share2, Check, Copy
} from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const initialEventsList = [
  { id: 1, title: 'Annual Mathematics Olympiad & Quiz Contest', date: 'May 28, 2026', time: '09:30 AM - 12:30 PM', venue: 'Main Auditorium', category: 'Academic Competition', description: 'Inter-house speed quiz and problem-solving competition for Grade 8 to 10 students.' },
  { id: 2, title: 'Science & Robotics Interactive Exhibition', date: 'Jun 02, 2026', time: '10:00 AM - 02:00 PM', venue: 'School Science Lab 2', category: 'Exhibition', description: 'Hands-on demonstration of physics models, chemistry experiments, and robotics projects.' },
  { id: 3, title: 'Inter-School Sports Meet & Athletic Championship', date: 'Jun 10, 2026', time: '08:00 AM - 04:00 PM', venue: 'Sports Complex Grounds', category: 'Sports', description: 'Track & field events including 100m sprint, relay, long jump, and basketball finals.' },
  { id: 4, title: 'Career Guidance & Higher Education Workshop', date: 'Jun 15, 2026', time: '11:00 AM - 01:00 PM', venue: 'Seminar Hall 1', category: 'Guidance', description: 'Expert talk on choosing academic streams, competitive exams, and future career paths.' },
];

const motivationalQuotesList = [
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", tip: "Study Tip: Break study sessions into 25-minute focused blocks with 5-minute short breaks." },
  { quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein", tip: "Learning Tip: Explain complex math formulas in your own words to solidify understanding." },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", tip: "Productivity Tip: Review daily class notes for 10 minutes every evening." },
  { quote: "It always seems impossible until it's done. Keep striving with confidence.", author: "Nelson Mandela", tip: "Exam Tip: Solve past test papers under timed conditions to boost confidence." },
];

const StudentHomePage = ({ user, student, stats }) => {
  const navigate = useNavigate();
  const studentName = `${user?.firstName || 'Rohan'} ${user?.lastName || 'Verma'}`.trim();

  // Avatar state
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return localStorage.getItem('student_profile_avatar') || null;
  });

  // Daily Quote state
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copiedQuote, setCopiedQuote] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotesList.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const currentQuoteObj = motivationalQuotesList[quoteIndex];

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setProfileAvatar(base64Data);
        localStorage.setItem('student_profile_avatar', base64Data);
        window.dispatchEvent(new Event('storage'));
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentQuoteObj.quote}" — ${currentQuoteObj.author}`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // 10 Feature Navigation Cards
  const featureCards = [
    { title: 'My Profile', subtitle: 'View student profile & contact details', icon: User, path: '/dashboard/profile', accent: 'bg-[#0C4A86]' },
    { title: 'Attendance', subtitle: '96% attendance record logged', icon: CheckCircle2, path: '/dashboard/attendance', accent: 'bg-emerald-600' },
    { title: 'Homework', subtitle: '2 active worksheets assigned', icon: BookOpen, path: '/dashboard/homework', accent: 'bg-amber-600' },
    { title: 'Assignments', subtitle: '1 term project coursework', icon: ClipboardCheck, path: '/dashboard/assignments', accent: 'bg-sky-600' },
    { title: 'Study Notes', subtitle: 'Chapter notes & PDF downloads', icon: FileText, path: '/dashboard/study-notes', accent: 'bg-teal-600' },
    { title: 'Timetable', subtitle: 'Mon-Fri daily period schedule', icon: Clock, path: '/dashboard/timetable', accent: 'bg-indigo-600' },
    { title: 'Exam Schedule', subtitle: 'Upcoming datesheet & syllabus', icon: CalendarDays, path: '/dashboard/exam-schedule', accent: 'bg-orange-600' },
    { title: 'Results', subtitle: 'Exam marks, grades & report cards', icon: Award, path: '/dashboard/results', accent: 'bg-rose-600' },
    { title: 'Activities', subtitle: 'School events, quizzes & sports', icon: Trophy, path: '/dashboard/activities', accent: 'bg-yellow-600' },
    { title: 'Notifications', subtitle: '3 unread announcements', icon: Bell, path: '/dashboard/notifications', accent: 'bg-[#0C4A86]' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Welcome Banner with Right-Side Profile Image Upload Option */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FF] px-3.5 py-1.5 text-xs font-bold text-[#0C4A86] border border-[#BFDBFE] hover:bg-[#0C4A86] hover:text-white transition-all"
            >
              ← Back
            </button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF5FF]/40 px-3 py-1 text-xs font-extrabold text-[#0C4A86]">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Student Academic Workspace
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1817]">Good Morning, {studentName} 👋</h1>
              <p className="text-xs md:text-sm font-semibold text-[#736B63]">
                Grade 9 - Section A • Student Admission No: <span className="font-extrabold text-[#0C4A86]">ADM-2026-901</span> • Roll No: <span className="font-extrabold text-[#0C4A86]">901</span>
              </p>
            </div>
          </div>

          {/* Right Side Avatar Upload Component */}
          <div className="flex items-center gap-4 bg-[#EBF5FF] p-3.5 rounded-2xl border border-[#BFDBFE] self-start md:self-auto">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#0C4A86] text-2xl font-black text-white shadow-md border-2 border-white">
              {profileAvatar ? (
                <img src={profileAvatar} alt={studentName} className="h-full w-full object-cover" />
              ) : (
                <span>{studentName.charAt(0)}</span>
              )}
              {/* Photo Upload Camera Badge */}
              <label
                htmlFor="student-photo-upload"
                className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#0C4A86] text-white shadow-md hover:bg-black transition"
                title="Upload/Change Profile Photo"
              >
                <Camera className="h-3.5 w-3.5" />
                <input
                  id="student-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-left">
              <label
                htmlFor="student-photo-upload"
                className="cursor-pointer text-xs font-black text-[#0C4A86] hover:text-[#0C4A86] block"
              >
                Upload Profile Photo
              </label>
              <p className="text-[11px] font-semibold text-[#736B63]">Click camera icon to change avatar photo</p>
            </div>
          </div>
        </div>

        {/* Quick Academic Snapshot Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-[#BFDBFE]">
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#736B63]">Attendance</p>
            <p className="mt-0.5 text-xl font-black text-emerald-700">96%</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#736B63]">Pending Tasks</p>
            <p className="mt-0.5 text-xl font-black text-amber-700">2 Items</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#736B63]">Exam Grade Avg</p>
            <p className="mt-0.5 text-xl font-black text-sky-800">88.5% (A)</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#736B63]">Class Rank</p>
            <p className="mt-0.5 text-xl font-black text-[#0C4A86]">#3 in Class</p>
          </div>
        </div>
      </div>

      {/* 2. Requirement 12: Prominent Daily Insight / Motivation Card directly on Homepage */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Daily Inspiration & Learning Tip
          </div>

          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold transition hover:bg-white/20"
            title="Copy quote"
          >
            {copiedQuote ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
          </button>
        </div>

        <div className="my-4 space-y-2">
          <Quote className="h-8 w-8 text-amber-400/50" />
          <h3 className="text-xl md:text-2xl font-black italic text-white font-serif leading-snug">
            "{currentQuoteObj.quote}"
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">— {currentQuoteObj.author}</p>
        </div>

        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{currentQuoteObj.tip}</span>
        </div>
      </div>

      {/* 3. Feature Cards Grid (10 Options) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#1A1817] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0C4A86]" /> My Learning & Services Directory
          </h2>
          <span className="text-xs font-bold text-[#736B63]">Click card to open page</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.path)}
                className="group relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white p-4 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#0C4A86]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent} text-white shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0C4A86] transition-colors" />
                </div>
                <h3 className="font-extrabold text-[#0C4A86] text-sm group-hover:text-[#0C4A86] transition-colors">{card.title}</h3>
                <p className="text-[11px] font-semibold text-[#736B63] mt-1 line-clamp-2">{card.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Requirement 3: Scrollable Live Updates & Events Section */}
      <SectionCard title="Live Updates & School Announcements" subtitle="Scrollable list of upcoming events and academic notices">
        <div className="max-h-80 overflow-y-auto pr-2 space-y-3 divide-y divide-[#BFDBFE]">
          {initialEventsList.map((evt) => (
            <div key={evt.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#0C4A86]">{evt.category}</span>
                  <span className="text-xs font-bold text-[#736B63] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#0C4A86]" /> {evt.date}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#0C4A86]">{evt.title}</h4>
                <p className="text-xs font-medium text-[#334155]">{evt.description}</p>
              </div>

              <div className="shrink-0 text-left sm:text-right text-xs font-semibold text-[#736B63]">
                <p className="flex items-center gap-1 font-bold text-[#0C4A86]">
                  <Clock className="h-3.5 w-3.5 text-amber-600" /> {evt.time}
                </p>
                <p className="flex items-center gap-1 text-[11px] mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-[#0096DA]" /> {evt.venue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default StudentHomePage;
