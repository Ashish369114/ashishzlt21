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

  // 1. Summary Cards
  const summaryCards = [
    {
      title: 'Attendance',
      value: '92%',
      subtitle: '23 Present • 2 Absent (25 Working Days)',
      icon: CheckCircle2,
      path: '/dashboard/attendance',
      accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      badge: '92% Excellent'
    },
    {
      title: 'Homework',
      value: '12 Items',
      subtitle: '10 Completed • 2 Pending',
      icon: BookOpen,
      path: '/dashboard/homework',
      accent: 'border-blue-200 bg-blue-50/50 text-blue-900',
      badge: '2 Pending'
    },
    {
      title: 'Assignments',
      value: '8 Tasks',
      subtitle: '7 Submitted • 1 In Progress',
      icon: FileText,
      path: '/dashboard/assignments',
      accent: 'border-purple-200 bg-purple-50/50 text-purple-900',
      badge: '1 Pending'
    },
    {
      title: 'Academic Performance',
      value: '89.4%',
      subtitle: 'Grade A+ • Overall Rank #3 in Class',
      icon: Award,
      path: '/dashboard/results',
      accent: 'border-amber-200 bg-amber-50/50 text-amber-900',
      badge: 'Rank #3'
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
            Here's an overview of your child's academic progress, attendance, homework, and school activities.
          </p>
        </div>

        {/* Child Info Card & Dropdown */}
        <div className="rounded-2xl bg-white/15 p-4 border border-white/20 backdrop-blur-md space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-extrabold text-amber-300">Selected Child:</span>
            {students.length > 1 && (
              <select
                value={selectedStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="rounded-lg bg-white px-2.5 py-1 font-black text-[#0C4A86] focus:outline-none cursor-pointer text-xs"
              >
                {students.map((st) => (
                  <option key={st._id || st.userId?._id} value={st._id || st.userId?._id}>
                    {st.userId?.firstName || st.name} (Class {st.grade || '6'}{st.section || 'A'})
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
                Class {studentGradeDisplay} - Sec {studentSectionDisplay} • Roll No: {activeStudent.rollNumber || '09'} • Class Teacher: Ramesh Sharma
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards (Clickable) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className={`rounded-3xl border ${card.accent} p-5 space-y-3 shadow-xs hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-2xs text-[#0C4A86]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-black text-[#0C4A86] border border-slate-200">
                  {card.badge}
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">{card.title}</span>
                <span className="text-2xl font-black text-slate-900">{card.value}</span>
              </div>

              <p className="text-[11px] font-bold text-slate-600 border-t border-slate-200/60 pt-2 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#0096DA]" />
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Attendance Overview, Academic Performance, Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Monthly Attendance Overview */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-[#0C4A86]">Attendance Overview</h3>
              <p className="text-xs font-semibold text-slate-500">Monthly attendance log for {activeStudentName}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/attendance')}
              className="text-xs font-extrabold text-[#0096DA] hover:underline"
            >
              View Full Register →
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-slate-400 uppercase text-[9px] block">Total Days</span>
              <span className="text-lg font-black text-slate-800">25</span>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-2.5 border border-emerald-200">
              <span className="text-emerald-800 uppercase text-[9px] block">Present</span>
              <span className="text-lg font-black text-emerald-700">23</span>
            </div>
            <div className="rounded-2xl bg-rose-50 p-2.5 border border-rose-200">
              <span className="text-rose-800 uppercase text-[9px] block">Absent</span>
              <span className="text-lg font-black text-rose-700">2</span>
            </div>
            <div className="rounded-2xl bg-purple-50 p-2.5 border border-purple-200">
              <span className="text-purple-800 uppercase text-[9px] block">Rate</span>
              <span className="text-lg font-black text-purple-700">92%</span>
            </div>
          </div>

          {/* Compact Visual Indicators Grid */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>August 2026 Monthly Matrix:</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-700 font-bold">🟢 Present (23)</span>
                <span className="text-rose-700 font-bold">🔴 Absent (2)</span>
                <span className="text-purple-700 font-bold">🟣 Holiday (1)</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-slate-400 uppercase py-1">{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, idx) => {
                const day = idx + 1;
                const isAbsent = day === 4 || day === 18;
                const isHoliday = day === 15;
                const isWeekend = (day % 7 === 1) || (day % 7 === 2);

                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded-xl border flex flex-col items-center justify-center font-bold ${
                      isHoliday
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : isWeekend
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-[8px]">{isHoliday ? '🟣' : isAbsent ? '🔴' : isWeekend ? '⚪' : '🟢'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Academic Performance & 7-Stage Exam Selector */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-[#0C4A86]">Academic Performance</h3>
              <p className="text-xs font-semibold text-slate-500">Subject breakdown & examination evaluation</p>
            </div>

            {/* 7-Stage Exam Term Selector */}
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-800 focus:outline-none cursor-pointer shadow-2xs"
            >
              {academicExamTypes.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.sequenceOrder}. {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="p-3">Subject</th>
                  <th className="p-3">Max</th>
                  <th className="p-3">Obtained</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {subjectMarksData.map((row) => (
                  <tr key={row.subject} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-[#0C4A86]">{row.subject}</td>
                    <td className="p-3 text-slate-500">{row.max}</td>
                    <td className="p-3 font-black text-slate-900">{row.score}</td>
                    <td className="p-3 font-bold text-emerald-700">{row.score}%</td>
                    <td className="p-3">
                      <span className="rounded bg-[#EBF5FF] px-2 py-0.5 font-black text-[#0C4A86] border border-[#BFDBFE]">
                        {row.grade}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-extrabold text-emerald-800">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Teacher Remarks: <em className="text-slate-800">"Excellent consistency in mathematics and problem solving."</em></span>
            <button
              onClick={() => navigate('/dashboard/results')}
              className="text-xs font-black text-[#0C4A86] underline hover:text-black"
            >
              View Official Report Card →
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events Box (Requirement 13: Internal Scroll max-h-[520px]) */}
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

      {/* Quick Actions Grid (8 Buttons) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#0C4A86]">Parent Quick Actions</h3>
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
    </div>
  );
};

export default ParentHomePage;
