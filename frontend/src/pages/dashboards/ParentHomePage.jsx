import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  BookOpen,
  FileText,
  Award,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  CreditCard,
  ChevronRight,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { academicExamTypes, getExamResultsData } from '../../utils/academicExamConfig';

const upcomingSchoolEvents = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting (PTM)',
    date: 'August 12, 2026',
    time: '09:00 AM - 01:00 PM',
    category: 'Meeting',
    location: 'Main Auditorium',
    badgeColor: 'bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]',
    description: 'Quarterly review of student progress, attendance, and exam prep.'
  },
  {
    id: 2,
    title: 'Independence Day Celebration',
    date: 'August 15, 2026',
    time: '08:00 AM - 11:30 AM',
    category: 'Cultural',
    location: 'School Grounds',
    badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    description: 'Flag hoisting ceremony, March Past & inter-house cultural performances.'
  },
  {
    id: 3,
    title: 'Unit Test 2 Examination Starts',
    date: 'August 22, 2026',
    time: '09:00 AM - 12:00 PM',
    category: 'Examination',
    location: 'All Classrooms',
    badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
    description: 'Unit Test 2 written examinations across Grade 1 to 12.'
  },
  {
    id: 4,
    title: 'Annual Science & Robotics Exhibition',
    date: 'August 28, 2026',
    time: '10:00 AM - 03:00 PM',
    category: 'Exhibition',
    location: 'Science Block',
    badgeColor: 'bg-purple-100 text-purple-800 border border-purple-300',
    description: 'Innovative student projects, working models & robotics showcase.'
  }
];

const ParentHomePage = ({ user, students = [], selectedStudentId, onSelectStudent, stats }) => {
  const navigate = useNavigate();
  const [selectedExamId, setSelectedExamId] = useState('unit_test_1');

  const parentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Priya Sharma';

  const activeStudent = students.find(
    (s) => (s._id || s.userId?._id || s.userId) === selectedStudentId
  ) || students[0] || {
    name: 'Aarav Singh',
    grade: '6',
    section: 'A',
    rollNumber: '09',
    admissionNo: 'ADM-2026-0914',
    classTeacher: 'Ramesh Sharma'
  };

  const activeStudentName = activeStudent.userId?.firstName
    ? `${activeStudent.userId.firstName} ${activeStudent.userId.lastName || ''}`.trim()
    : activeStudent.name || 'Aarav Singh';

  const studentGradeDisplay = activeStudent.grade || activeStudent.class?.grade || '6';
  const studentSectionDisplay = activeStudent.section || activeStudent.class?.section || 'A';

  // 1. Summary Cards tailored to active student
  const isGrade8 = String(studentGradeDisplay) === '8';
  const summaryCards = [
    {
      title: 'Attendance',
      value: isGrade8 ? '92%' : '96%',
      subtitle: isGrade8 ? '23 Present • 2 Absent (25 Working Days)' : '24 Present • 1 Absent (25 Working Days)',
      icon: CheckCircle2,
      path: '/dashboard/attendance',
      accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      badge: isGrade8 ? '92% Good' : '96% Excellent'
    },
    {
      title: 'Homework',
      value: isGrade8 ? '15 Items' : '12 Items',
      subtitle: isGrade8 ? '13 Completed • 2 Pending' : '10 Completed • 2 Pending',
      icon: BookOpen,
      path: '/dashboard/homework',
      accent: 'border-blue-200 bg-blue-50/50 text-blue-900',
      badge: '2 Pending'
    },
    {
      title: 'Assignments',
      value: isGrade8 ? '10 Tasks' : '8 Tasks',
      subtitle: isGrade8 ? '9 Submitted • 1 In Progress' : '7 Submitted • 1 In Progress',
      icon: FileText,
      path: '/dashboard/assignments',
      accent: 'border-purple-200 bg-purple-50/50 text-purple-900',
      badge: '1 Pending'
    },
    {
      title: 'Academic Performance',
      value: isGrade8 ? '89.4%' : '94.2%',
      subtitle: isGrade8 ? 'Grade A+ • Overall Rank #3 in Class' : 'Grade O • Overall Rank #1 in Class',
      icon: Award,
      path: '/dashboard/results',
      accent: 'border-amber-200 bg-amber-50/50 text-amber-900',
      badge: isGrade8 ? 'Rank #3' : 'Rank #1'
    }
  ];

  // 2. Quick Actions
  const quickActions = [
    { label: 'View Attendance', path: '/dashboard/attendance', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { label: 'View Homework', path: '/dashboard/homework', icon: BookOpen, bg: 'bg-blue-50 text-blue-800 border-blue-200' },
    { label: 'View Assignments', path: '/dashboard/assignments', icon: FileText, bg: 'bg-purple-50 text-purple-800 border-purple-200' },
    { label: 'View Results', path: '/dashboard/results', icon: Award, bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { label: 'View Exam Schedule', path: '/dashboard/exams', icon: Calendar, bg: 'bg-rose-50 text-rose-800 border-rose-200' },
    { label: 'Contact Teacher', path: '/dashboard/communication', icon: MessageSquare, bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    { label: 'View Calendar', path: '/dashboard/calendar', icon: Sparkles, bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    { label: 'View Fees', path: '/dashboard/fees', icon: CreditCard, bg: 'bg-slate-100 text-slate-800 border-slate-300' }
  ];

  // 3. Dynamic Subject-wise Marks Breakdown based on selectedExamId
  const rawExamData = getExamResultsData(selectedExamId);
  const subjectMarksData = rawExamData.map((r) => ({
    subject: r.subject,
    max: r.maxMarks,
    score: r.marks,
    pct: Math.round((r.marks / r.maxMarks) * 100),
    grade: r.grade,
    status: r.status,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Multi-Child Selector */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
            <Sparkles className="h-4 w-4 text-amber-400" /> Parent Portal Overview
          </div>
          <h1 className="text-2xl font-black">Welcome Back, {parentName} 👋</h1>
          <p className="text-xs text-sky-100 font-medium">
            Here's your quick access portal for {activeStudentName}'s attendance, assignments, timetable, and school notices.
          </p>
        </div>

        {/* Child Info Card & Dropdown (Req 3: Show 2 children for demo) */}
        <div className="rounded-2xl bg-white/15 p-4 border border-white/20 backdrop-blur-md space-y-2 text-xs min-w-[280px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-extrabold text-amber-300">Selected Child:</span>
            {students.length > 0 && (
              <select
                value={selectedStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="rounded-lg bg-white px-2.5 py-1 font-black text-[#0C4A86] focus:outline-none cursor-pointer text-xs"
              >
                {students.map((st) => (
                  <option key={st._id || st.userId?._id} value={st._id || st.userId?._id}>
                    {st.userId?.firstName || st.name} (Class {st.grade || '5'}{st.section || 'A'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-1.5 border-t border-white/15 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0C4A86] font-black text-sm shadow-2xs">
              {activeStudentName.charAt(0)}
            </div>
            <div>
              <p className="font-black text-white text-sm">{activeStudentName}</p>
              <p className="text-[11px] text-sky-100 font-semibold">
                Class {studentGradeDisplay} - Sec {studentSectionDisplay} • Roll No: {activeStudent.rollNumber || '05'} • Teacher: {activeStudent.classTeacher || 'Ramesh Sharma'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Child Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className={`rounded-3xl border p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 ${card.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-black text-slate-800 border border-slate-200">
                  {card.badge}
                </span>
                <Icon className="h-5 w-5 opacity-80" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parent Quick Actions Grid (Point 4: On Top of Dashboard) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#0C4A86] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Parent Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => navigate(act.path)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-black transition-all hover:scale-[1.02] shadow-2xs ${act.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{act.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Box (Point 9: Keep Upcoming Events & Notifications) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#0C4A86] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0C4A86]" /> Upcoming School Events & Notices
            </h3>
            <p className="text-xs font-semibold text-slate-500">Important school functions, exams, meetings & holidays</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/calendar')}
            className="text-xs font-extrabold text-[#0096DA] hover:underline"
          >
            View Full Calendar →
          </button>
        </div>

        <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1">
          {upcomingSchoolEvents.map((evt) => (
            <div key={evt.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${evt.badgeColor}`}>
                  {evt.category}
                </span>
                <span className="text-xs font-bold text-[#0C4A86] flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {evt.date}
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900">{evt.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#0096DA]" /> {evt.time}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <MapPin className="h-3.5 w-3.5" /> {evt.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentHomePage;
