import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, User, BookOpen, ClipboardCheck, FileText, Clock, CalendarDays, Calendar, Award,
  Trophy, Sparkles, Bell, Settings, LogOut, ShieldCheck, ArrowLeft, CheckCircle2, GraduationCap, Camera, Layers
} from 'lucide-react';
import { marksService, attendanceService, homeworkService, studentService, feeService } from '../../services/api';

import StudentHomePage from './StudentHomePage';
import StudentDailyInsights from '../components/StudentDailyInsights';
import StudentSettings from '../components/StudentSettings';
import StudentActivities from '../components/StudentActivities';
import StudentProfile from '../components/StudentProfile';
import StudentAttendance from '../components/StudentAttendance';
import StudentHomework from '../components/StudentHomework';
import StudentAssignments from '../components/StudentAssignments';
import StudentStudyNotes from '../components/StudentStudyNotes';
import StudentTimetable from '../components/StudentTimetable';
import StudentExamSchedule from '../components/StudentExamSchedule';
import StudentResults from '../components/StudentResults';
import StudentNotifications from '../components/StudentNotifications';
import StudentClassroomActivity from '../components/StudentClassroomActivity';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import MultiRoleMessagingSystem from '../../components/common/MultiRoleMessagingSystem';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Avatar photo sync state
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return localStorage.getItem('student_profile_avatar') || null;
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setProfileAvatar(localStorage.getItem('student_profile_avatar'));
    };
    window.addEventListener('storage', handleAvatarUpdate);
    return () => window.removeEventListener('storage', handleAvatarUpdate);
  }, []);

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

  useEffect(() => {
    const loadData = async () => {
      const userIdentifier = user?.userId || user?.id || user?._id;
      if (!userIdentifier) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentRes = await studentService.getByUserId(userIdentifier);
        const studentData = studentRes.data || {};
        const studentWithGrade9 = {
          ...studentData,
          grade: '9',
          section: 'A',
          rollNumber: '901',
          admissionNo: studentData.admissionNo || 'ADM-2026-901',
          class: {
            ...(studentData.class || {}),
            grade: '9',
            section: 'A'
          }
        };
        setStudent(studentWithGrade9);

        const studentId = studentData.userId?._id || studentData.userId || studentData._id || userIdentifier;
        const [marksRes, attendanceRes, homeworkRes, feeRes] = await Promise.all([
          marksService.getByStudent(studentId).catch(() => ({ data: [] })),
          attendanceService.getByStudent(studentId).catch(() => ({ data: [] })),
          homeworkService.getByStudent(studentId).catch(() => ({ data: [] })),
          feeService.getByStudent(studentId).catch(() => ({ data: [] })),
        ]);

        const marks = marksRes.data || [];
        const attendance = attendanceRes.data || [];
        const homework = homeworkRes.data || [];
        const fees = feeRes.data || [];

        const averageMarks = marks.length
          ? (marks.reduce((sum, item) => sum + Number(item.marks || 0), 0) / marks.length).toFixed(2)
          : 0;
        const attendancePercent = attendance.length
          ? ((attendance.filter((record) => record.status === 'Present').length / attendance.length) * 100).toFixed(2)
          : 0;
        const pendingHomework = homework.filter((item) => {
          const dueDate = item.dueDate ? new Date(item.dueDate) : null;
          return !item.submissions?.some((submission) => submission.student?._id?.toString?.() === studentId?.toString?.() || submission.student?.toString?.() === studentId?.toString?.()) && (!dueDate || dueDate >= new Date());
        }).length;
        const dueFees = fees.filter((fee) => !fee.isPaid).reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

        setStats({
          averageMarks,
          attendancePercent,
          homeworkAssignments: homework.length,
          pendingHomework,
          totalMarks: marks.length,
          attendanceRecords: attendance.length,
          totalPendingFees: dueFees,
        });
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const studentId = student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId;
  const studentName = `${user?.firstName || 'Student'}`.trim();
  const gradeStr = 'Grade 9';
  const sectionStr = 'Section A';
  const isSubPage = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/';

  return (
    <div className="flex min-h-screen bg-[#F6F0E8] text-slate-800">
      {/* Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between overflow-y-auto bg-[#FAF6F0] px-5 py-6 text-slate-800 border-r border-slate-200 shadow-lg lg:flex">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] text-white shadow-md">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[#0C4A86] leading-tight">ABS International</p>
              <p className="text-xs font-bold text-[#0096DA]">School Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            {/* Overview */}
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                  isActive ? 'bg-[#0C4A86] text-white shadow-md' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Overview</span>
            </NavLink>

            {/* Academics Section Header */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#0C4A86]">
                Academics & Learning
              </p>
            </div>

            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/dashboard/classroom-activity"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Layers className="h-4 w-4" />
              <span>Classroom Activity</span>
            </NavLink>

            <NavLink
              to="/dashboard/attendance"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/dashboard/homework"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <BookOpen className="h-4 w-4" />
              <span>Homework</span>
            </NavLink>

            <NavLink
              to="/dashboard/assignments"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Assignments</span>
            </NavLink>

            <NavLink
              to="/dashboard/study-notes"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <FileText className="h-4 w-4" />
              <span>Study Notes</span>
            </NavLink>

            <NavLink
              to="/dashboard/timetable"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Clock className="h-4 w-4" />
              <span>Timetable</span>
            </NavLink>

            <NavLink
              to="/dashboard/exam-schedule"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <CalendarDays className="h-4 w-4" />
              <span>Exam Schedule</span>
            </NavLink>

            <NavLink
              to="/dashboard/results"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Award className="h-4 w-4" />
              <span>Results</span>
            </NavLink>

            <NavLink
              to="/dashboard/activities"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Trophy className="h-4 w-4" />
              <span>Activities</span>
            </NavLink>

            {/* General Section Header */}
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#0C4A86]">
                General
              </p>
            </div>

            <NavLink
              to="/dashboard/calendar"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </NavLink>

            <NavLink
              to="/dashboard/daily-insights"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Sparkles className="h-4 w-4" />
              <span>Daily Insights</span>
            </NavLink>

            <NavLink
              to="/dashboard/communications"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Bell className="h-4 w-4" />
              <span>Messages</span>
            </NavLink>

            <NavLink
              to="/dashboard/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </NavLink>

            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 font-bold transition-all ${
                  isActive ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-xs' : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3 rounded-2xl bg-[#EBF5FF] p-3 border border-[#BFDBFE] shadow-2xs">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0C4A86] font-extrabold text-white text-sm">
              {profileAvatar ? (
                <img src={profileAvatar} alt={studentName} className="h-full w-full object-cover" />
              ) : (
                <span>{studentName.charAt(0)}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-black text-slate-900">{studentName}</p>
              <p className="truncate text-[10px] font-bold text-[#0C4A86]">Student</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all border border-rose-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top bar for subpages - "Back to Overview" */}
        {isSubPage && (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-[#FAF6F0]/90 px-6 py-3.5 backdrop-blur-md">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-1.5 text-xs font-bold text-[#0C4A86] hover:bg-[#EFEAE4] transition"
            >
              <ArrowLeft className="h-4 w-4 text-[#0096DA]" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3 text-xs font-semibold text-[#736B63]">
              <span>{gradeStr} - {sectionStr}</span>
              <span>•</span>
              <span>Academic Year 2025-2026</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0C4A86] border-t-transparent"></div>
            </div>
          ) : (
            <Routes>
              <Route index element={<StudentHomePage user={user} student={student} stats={stats} />} />
              <Route path="profile" element={<StudentProfile user={user} student={student} />} />
              <Route path="calendar" element={<InteractiveGoogleCalendar />} />
              <Route path="classroom-activity" element={<StudentClassroomActivity user={user} student={student} />} />
              <Route path="activities" element={<StudentActivities />} />
              <Route path="daily-insights" element={<StudentDailyInsights user={user} stats={stats} />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="communications" element={<MultiRoleMessagingSystem currentUserRole="Student" currentUserName={studentName} />} />
              <Route path="settings" element={<StudentSettings user={user} />} />

              {/* Sub-Routes */}
              <Route path="attendance" element={<StudentAttendance userId={studentId} />} />
              <Route path="homework" element={<StudentHomework userId={studentId} />} />
              <Route path="assignments" element={<StudentAssignments userId={studentId} />} />
              <Route path="study-notes" element={<StudentStudyNotes />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="exam-schedule" element={<StudentExamSchedule />} />
              <Route path="exams" element={<StudentExamSchedule />} />
              <Route path="results" element={<StudentResults userId={studentId} user={user} student={student} />} />
              <Route path="marks" element={<StudentResults userId={studentId} user={user} student={student} />} />

              <Route path="*" element={<StudentHomePage user={user} student={student} stats={stats} />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;

