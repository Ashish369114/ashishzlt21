import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Filter, GraduationCap, Search, Users, CheckCircle2, AlertCircle, PencilLine, Trash2, FileText, CalendarDays } from 'lucide-react';
import { teacherService, attendanceService, marksService, homeworkService, assignmentService, examService } from '../../services/api';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';


const defaultClasses = [
  { name: 'Grade 1 - A', subject: 'Mathematics', strength: 32, schedule: 'Mon • Wed • Fri' },
  { name: 'Grade 2 - B', subject: 'Science', strength: 29, schedule: 'Tue • Thu • Sat' },
  { name: 'Grade 3 - A', subject: 'English', strength: 30, schedule: 'Mon • Wed • Fri' },
];

const tabs = ['Students', 'Attendance', 'Marks', 'Homework', 'Assignments', 'Exams', 'Performance'];
const subjectOptions = ['Mathematics', 'English', 'Science', 'Social', 'Computer Science'];
const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const sectionOptions = ['A', 'B', 'C'];
// statusColors intentionally omitted; use utility classes directly in markup when needed

const TeacherClassesPage = ({ user }) => {
  // page state
  const [activeTab, setActiveTab] = useState('Students');
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  const [homework, setHomework] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [filters, setFilters] = useState({ grade: 'Grade 1', section: 'A', subject: 'Mathematics' });
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [markDrafts, setMarkDrafts] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Unit Test');
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', dueDate: '', priority: 'High', subject: 'Mathematics' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', priority: 'High', subject: 'Mathematics' });
  const [examForm, setExamForm] = useState({ name: '', date: '', totalMarks: '100', subject: 'Mathematics' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherId = user?._id || user?.id || user?.userId;
        if (!teacherId) return;
        // Prefer the teacher dashboard payload to populate related data
        const [dashboardRes, attendanceRes, performanceRes] = await Promise.all([
          teacherService.getDashboard(teacherId),
          attendanceService.getAll(),
          fetch('/api/performance').then((res) => res.json()),
        ]);

        const dashboard = dashboardRes?.data;
        setDashboardData(dashboard);

        // Use teacher dashboard payload where available (students, homework, assignments, exams)
        setStudents(dashboard?.students || []);
        setHomework(dashboard?.homework || []);
        // prefer explicit assignments array from dashboard
        setAssignments(dashboard?.assignments || dashboard?.communications || []);
        setExams(dashboard?.exams || []);

        // fallback to generic endpoints where needed
        setAttendance(attendanceRes?.data || []);
        // marks currently not stored in local state; we use marksService directly when needed
        setPerformance(performanceRes);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [user]);

  const teacherIdLocal = user?._id || user?.id || user?.userId;
  const schoolId = localStorage.getItem('schoolId') || 'default';
  const { emitEvent } = useRealtimeUpdates(teacherIdLocal, schoolId, 'teacher');

  const classes = useMemo(() => {
    const teacherId = user?._id || user?.id || user?.userId;
    if (dashboardData?.classes?.length) {
      const filtered = dashboardData.classes.filter((item) => {
        // support common shapes: item.teacher, item.teacherId, item.assignedTeachers, item.teachers
        if (!teacherId) return true;
        if (item.teacher && (item.teacher._id === teacherId || item.teacher === teacherId)) return true;
        if (item.teacherId && item.teacherId === teacherId) return true;
        if (Array.isArray(item.assignedTeachers) && item.assignedTeachers.includes(teacherId)) return true;
        if (Array.isArray(item.teachers) && item.teachers.includes(teacherId)) return true;
        return false;
      });
      return filtered.map((item) => ({
        name: item.displayName || item.className || item.name || 'Class',
        subject: item.subjectName || item.subject?.name || 'General',
        strength: item.strength || item.studentCount || 0,
        schedule: item.schedule || 'Mon • Wed • Fri',
      }));
    }
    return defaultClasses;
  }, [dashboardData, user]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return (students || []).filter((student) => {
      const fullName = `${student?.userId?.firstName || ''} ${student?.userId?.lastName || ''}`.toLowerCase();
      const parentName = `${student?.parentId?.firstName || ''} ${student?.parentId?.lastName || ''}`.toLowerCase();
      const matchesSearch = !query || fullName.includes(query) || (student?.rollNumber || '').toLowerCase().includes(query) || parentName.includes(query) || (student?.userId?.phone || '').includes(query);
      const gradeMatch = !filters.grade || (student?.class?.grade ? `Grade ${student.class.grade}` : '').includes(filters.grade.replace('Grade ', ''));
      const sectionMatch = !filters.section || student?.class?.section === filters.section;
      const subjectMatch = !filters.subject || filters.subject === 'All' || true;
      return matchesSearch && gradeMatch && sectionMatch && subjectMatch;
    });
  }, [students, searchTerm, filters]);

  const summaryCards = useMemo(() => {
    const presentCount = attendance.filter((entry) => entry.status === 'Present').length;
    const absentCount = attendance.filter((entry) => entry.status === 'Absent').length;
    return [
      { title: 'Total Students', value: filteredStudents.length || students.length || 0, subtitle: 'Enrolled', icon: Users, accent: 'from-violet-500 to-indigo-500' },
      { title: 'Present Today', value: presentCount, subtitle: 'Marked present', icon: CheckCircle2, accent: 'from-emerald-500 to-lime-500' },
      { title: 'Absent Today', value: absentCount, subtitle: 'Needs follow-up', icon: AlertCircle, accent: 'from-rose-500 to-orange-500' },
      { title: 'Subjects', value: subjectOptions.length, subtitle: 'Available', icon: BookOpen, accent: 'from-sky-500 to-cyan-500' },
      { title: 'Assignments', value: assignments.length, subtitle: 'Live tasks', icon: FileText, accent: 'from-amber-500 to-yellow-500' },
      { title: 'Upcoming Exams', value: exams.length, subtitle: 'Scheduled', icon: CalendarDays, accent: 'from-fuchsia-500 to-violet-500' },
    ];
  }, [attendance, filteredStudents, students, assignments, exams]);

  const saveAttendance = async () => {
    const entries = Object.entries(attendanceDraft).map(([studentId, status]) => ({ student: studentId, status, date: new Date(), class: students.find((item) => item.userId?._id === studentId)?.class?._id || null }));
    try {
      // optimistic local update
      setAttendance((prev) => [...prev, ...entries]);
      await Promise.all(entries.map((entry) => attendanceService.mark(entry)));
      // emit realtime event for attendance
      entries.forEach((entry) => emitEvent('attendance:updated', { ...entry, teacher: teacherIdLocal }));
      alert('Attendance saved successfully');
    } catch (error) {
      console.error(error);
      alert('Could not save attendance');
    }
  };

  const saveMarks = async () => {
    const entries = Object.entries(markDrafts).map(([studentId, value]) => ({
      student: studentId,
      teacher: user?._id || user?.id || user?.userId,
      subject: selectedSubject,
      class: students.find((item) => item.userId?._id === studentId)?.class?._id || null,
      marks: Number(value),
      examType: selectedExam,
      examDate: new Date(),
    }));
    try {
      // optimistic local update of performance/realtime store
      setPerformance((prev) => prev);
      await Promise.all(entries.map((entry) => marksService.add(entry)));
      // emit realtime events
      entries.forEach((entry) => emitEvent('marks:updated', { ...entry }));
      alert('Marks saved successfully');
    } catch (error) {
      console.error(error);
      alert('Could not save marks');
    }
  };

  const createHomework = async (e) => {
    e.preventDefault();
    try {
      const res = await homeworkService.add({ ...homeworkForm, dueDate: homeworkForm.dueDate, teacher: user?._id || user?.id || user?.userId, class: students[0]?.class?._id || null, subject: homeworkForm.subject });
      const newHw = res?.data || { ...homeworkForm, _id: Date.now(), teacher: user?._id };
      setHomework((prev) => [newHw, ...prev]);
      emitEvent('homework:new', newHw);
      alert('Homework assigned');
    } catch (error) {
      console.error(error);
      alert('Could not assign homework');
    }
  };

  const deleteHomeworkItem = async (id) => {
    try {
      // optimistic remove
      setHomework((prev) => prev.filter((h) => h._id !== id && h.id !== id));
      await homeworkService.delete(id);
      emitEvent && emitEvent('homework:removed', { id, teacher: teacherIdLocal });
    } catch (err) {
      console.error(err);
      alert('Could not delete homework');
    }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await assignmentService.add({ ...assignmentForm, dueDate: assignmentForm.dueDate, teacher: user?._id || user?.id || user?.userId, class: students[0]?.class?._id || null, subject: assignmentForm.subject });
      const newAssign = res?.data || { ...assignmentForm, _id: Date.now(), teacher: user?._id };
      setAssignments((prev) => [newAssign, ...prev]);
      emitEvent('assignment:new', newAssign);
      alert('Assignment created');
    } catch (error) {
      console.error(error);
      alert('Could not create assignment');
    }
  };

  const deleteAssignmentItem = async (id) => {
    try {
      setAssignments((prev) => prev.filter((a) => a._id !== id && a.id !== id));
      await assignmentService.delete(id);
      emitEvent && emitEvent('assignment:removed', { id, teacher: teacherIdLocal });
    } catch (err) {
      console.error(err);
      alert('Could not delete assignment');
    }
  };

  const createExam = async (e) => {
    e.preventDefault();
    try {
      await examService.add({ ...examForm, class: students[0]?.class?._id || null, subject: examForm.subject, examDate: examForm.date, totalMarks: Number(examForm.totalMarks) });
      alert('Exam created');
    } catch (error) {
      console.error(error);
      alert('Could not create exam');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.20)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-600">My Classes</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Premium class management for every section</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">Monitor students, attendance, marks, homework, exams, and performance from one elegant workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => document.getElementById('students-section')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5">View Students</button>
            <button onClick={() => setActiveTab('Performance')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5">Class Performance</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {classes.map((item) => (
          <motion.div whileHover={{ y: -4, scale: 1.01 }} key={item.name} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{item.subject}</span>
            </div>
            <p className="mt-4 text-sm text-slate-500">Strength: {item.strength} students</p>
            <p className="mt-2 text-sm text-slate-500">Schedule: {item.schedule}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-[1.8rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((grade) => (
            <button key={grade} onClick={() => setFilters((prev) => ({ ...prev, grade }))} className={`rounded-2xl px-3 py-2 text-sm font-semibold ${filters.grade === grade ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{grade}</button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
            <span className="mb-2 flex items-center gap-2"><Filter className="h-4 w-4" /> Section</span>
            <select value={filters.section} onChange={(e) => setFilters((prev) => ({ ...prev, section: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {sectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
            <span className="mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Subject</span>
            <select value={filters.subject} onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
            <span className="mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Grade</span>
            <select value={filters.grade} onChange={(e) => setFilters((prev) => ({ ...prev, grade: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {gradeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div whileHover={{ y: -4 }} key={card.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{card.title}</p>
              <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Students' && (
        <section id="students-section" className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, roll, parent or phone" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">Export</button>
              <button className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white">Add Student</button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">DOB</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Average</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{student.rollNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-semibold text-white">{(student?.userId?.firstName || 'S').charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-slate-800">{student?.userId?.firstName || ''} {student?.userId?.lastName || ''}</p>
                          <p className="text-xs text-slate-500">{student?.class?.grade ? `Grade ${student.class.grade} - ${student.class.section}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student?.userId?.gender || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{student?.userId?.dateOfBirth ? new Date(student.userId.dateOfBirth).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{student?.userId?.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{student?.parentId ? `${student.parentId.firstName || ''} ${student.parentId.lastName || ''}`.trim() : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">92%</td>
                    <td className="px-4 py-3 text-slate-600">88%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-slate-100 px-2.5 py-2 text-slate-600"><PencilLine className="h-4 w-4" /></button>
                        <button className="rounded-xl bg-slate-100 px-2.5 py-2 text-slate-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'Attendance' && (
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Attendance Management</h3>
              <p className="text-sm text-slate-500">One-click status updates for today’s class.</p>
            </div>
            <button onClick={saveAttendance} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Save Attendance</button>
          </div>
          <div className="mt-5 grid gap-3">
            {filteredStudents.map((student) => (
              <div key={student._id} className="flex flex-wrap items-center justify-between rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-semibold text-white">{(student?.userId?.firstName || 'S').charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-slate-800">{student?.userId?.firstName || ''} {student?.userId?.lastName || ''}</p>
                    <p className="text-sm text-slate-500">{student.rollNumber || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Present', 'Absent', 'Late', 'Leave'].map((status) => (
                    <button key={status} onClick={() => setAttendanceDraft((prev) => ({ ...prev, [student.userId?._id || student._id]: status }))} className={`rounded-2xl px-3 py-2 text-sm font-semibold ${attendanceDraft[student.userId?._id || student._id] === status ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Marks' && (
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Marks Entry</h3>
              <p className="text-sm text-slate-500">Subject-wise marks and grade updates.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                {subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                {['Unit Test', 'Mid-Term', 'Final', 'Practical'].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <button onClick={saveMarks} className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Save Marks</button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{student.rollNumber || '—'}</td>
                    <td className="px-4 py-3">{student?.userId?.firstName || ''} {student?.userId?.lastName || ''}</td>
                    <td className="px-4 py-3"><input type="number" onChange={(e) => setMarkDrafts((prev) => ({ ...prev, [student.userId?._id || student._id]: e.target.value }))} className="w-24 rounded-xl border border-slate-200 px-3 py-2" /></td>
                    <td className="px-4 py-3">A</td>
                    <td className="px-4 py-3"><input placeholder="Remark" className="w-full rounded-xl border border-slate-200 px-3 py-2" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'Homework' && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Assign Homework</h3>
            <form onSubmit={createHomework} className="mt-4 space-y-3">
              <input value={homeworkForm.title} onChange={(e) => setHomeworkForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <textarea value={homeworkForm.description} onChange={(e) => setHomeworkForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <input type="date" value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <select value={homeworkForm.priority} onChange={(e) => setHomeworkForm((prev) => ({ ...prev, priority: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2">
                {['Low', 'Medium', 'High'].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <button className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Assign</button>
            </form>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Homework List</h3>
            <div className="mt-4 space-y-3">
              {(homework || []).slice(0, 4).map((item) => (
                <div key={item._id || item.id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{item.priority || 'High'}</span>
                      <button type="button" onClick={() => deleteHomeworkItem(item._id || item.id)} className="rounded-xl bg-slate-100 px-2 py-1 text-slate-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-2 text-sm text-slate-500">Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Assignments' && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Create Assignment</h3>
            <form onSubmit={createAssignment} className="mt-4 space-y-3">
              <input value={assignmentForm.title} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <input type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <button className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Create</button>
            </form>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Assignment Queue</h3>
            <div className="mt-4 space-y-3">
              {(assignments || []).slice(0, 4).map((item) => (
                <div key={item._id || item.id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{item.priority || 'Medium'}</span>
                      <button type="button" onClick={() => deleteAssignmentItem(item._id || item.id)} className="rounded-xl bg-slate-100 px-2 py-1 text-slate-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Exams' && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Exam Schedule</h3>
            <form onSubmit={createExam} className="mt-4 space-y-3">
              <input value={examForm.name} onChange={(e) => setExamForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Exam Name" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <input type="date" value={examForm.date} onChange={(e) => setExamForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <input value={examForm.totalMarks} onChange={(e) => setExamForm((prev) => ({ ...prev, totalMarks: e.target.value }))} placeholder="Max Marks" className="w-full rounded-2xl border border-slate-200 px-3 py-2" />
              <button className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Publish Exam</button>
            </form>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Scheduled Exams</h3>
            <div className="mt-4 space-y-3">
              {(exams || []).slice(0, 4).map((item) => (
                <div key={item._id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">{item.totalMarks || 100} marks</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Date: {item.examDate ? new Date(item.examDate).toLocaleDateString() : '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'Performance' && performance && (
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Performance Analytics</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.subjectPerformance || []}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Attendance & Outcomes</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performance.monthlyProgress || []}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Quick Actions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Mark Attendance', () => setActiveTab('Attendance')],
            ['Enter Marks', () => setActiveTab('Marks')],
            ['Assign Homework', () => setActiveTab('Homework')],
            ['Create Assignment', () => setActiveTab('Assignments')],
          ].map(([label, action]) => (
            <button key={label} onClick={action} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5">{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherClassesPage;
