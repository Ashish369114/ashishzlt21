import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
} from 'lucide-react';

const studentModules = [
  { key: 'studentList', label: 'Student List', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: CheckCircle2 },
  { key: 'marks', label: 'Marks', icon: TrendingUp },
  { key: 'remarks', label: 'Remarks', icon: FileText },
  { key: 'exams', label: 'Exams', icon: ClipboardCheck },
  { key: 'homework', label: 'Homework', icon: BookOpen },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
];

const students = [
  { name: 'Rahul Sharma', rollNo: '01', className: 'Grade 8 · A', attendance: '96%', marks: '88%', homework: 'Submitted', assignment: 'Reviewed', remarks: 'Strong progress' },
  { name: 'Sneha Verma', rollNo: '02', className: 'Grade 8 · A', attendance: '94%', marks: '92%', homework: 'Submitted', assignment: 'Pending', remarks: 'Excellent effort' },
  { name: 'Aditi Rao', rollNo: '03', className: 'Grade 8 · A', attendance: '87%', marks: '76%', homework: 'Pending', assignment: 'Pending', remarks: 'Needs follow-up' },
  { name: 'Aman Khan', rollNo: '04', className: 'Grade 8 · A', attendance: '95%', marks: '85%', homework: 'Submitted', assignment: 'Reviewed', remarks: 'Steady performance' },
];

const TeacherStudentModule = ({ teacherId }) => {
  const [activeSection, setActiveSection] = useState('studentList');

  const summaryCards = useMemo(() => [
    { title: 'Attendance', value: '94%', icon: CheckCircle2, detail: "Today's class attendance" },
    { title: 'Homework Pending Review', value: '12', icon: BookOpen, detail: 'Awaiting teacher feedback' },
    { title: 'Assignment Pending Review', value: '5', icon: ClipboardList, detail: 'Submission review queue' },
    { title: 'Upcoming Exams', value: '2', icon: ClipboardCheck, detail: 'Scheduled this week' },
    { title: 'Average Performance', value: '89%', icon: TrendingUp, detail: 'Across current class' },
    { title: 'Class Assigned', value: '3', icon: GraduationCap, detail: 'Active sections' },
  ], []);

  const renderContent = () => {
    switch (activeSection) {
      case 'attendance':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Attendance overview</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Present</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">30</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Absent</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-100">2</p>
              </div>
            </div>
          </div>
        );
      case 'marks':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Marks review</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {students.map((student) => (
                <li key={student.rollNo} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                  {student.name} — {student.marks}%
                </li>
              ))}
            </ul>
          </div>
        );
      case 'remarks':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Remarks</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {students.map((student) => (
                <li key={student.rollNo} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                  {student.name}: {student.remarks}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'exams':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Upcoming exams</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">Mathematics assessment — Thursday</li>
              <li className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">Science quiz — Friday</li>
            </ul>
          </div>
        );
      case 'homework':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Homework review</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {students.filter((student) => student.homework === 'Pending').map((student) => (
                <li key={student.rollNo} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                  {student.name} — pending submission
                </li>
              ))}
            </ul>
          </div>
        );
      case 'assignments':
        return (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Assignments</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {students.filter((student) => student.assignment === 'Pending').map((student) => (
                <li key={student.rollNo} className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-950/80">
                  {student.name} — assignment pending review
                </li>
              ))}
            </ul>
          </div>
        );
      case 'studentList':
      default:
        return (
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-4 text-left">Roll No</th>
                    <th className="px-4 py-4 text-left">Student</th>
                    <th className="px-4 py-4 text-left">Class</th>
                    <th className="px-4 py-4 text-left">Attendance</th>
                    <th className="px-4 py-4 text-left">Marks</th>
                    <th className="px-4 py-4 text-left">Homework</th>
                    <th className="px-4 py-4 text-left">Assignment</th>
                    <th className="px-4 py-4 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.rollNo} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.rollNo}</td>
                      <td className="px-4 py-4 font-medium text-slate-950 dark:text-slate-100">{student.name}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.className}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.attendance}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.marks}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.homework}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.assignment}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{student.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Students Module</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">Manage all student activity from one place</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Teacher ID: {teacherId || 'Current teacher'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {students.length} students assigned
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{card.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{card.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-panel dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="flex flex-wrap gap-3">
          {studentModules.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                  activeSection === item.key
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">{renderContent()}</div>
      </div>
    </section>
  );
};

export default TeacherStudentModule;
