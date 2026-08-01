import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen, ShieldCheck, Heart, Award,
  CheckCircle2, ClipboardCheck, FileText, Clock, CalendarDays, Trophy, Maximize2, Camera
} from 'lucide-react';

import StudentAttendance from './StudentAttendance';
import StudentHomework from './StudentHomework';
import StudentAssignments from './StudentAssignments';
import StudentStudyNotes from './StudentStudyNotes';
import StudentTimetable from './StudentTimetable';
import StudentExamSchedule from './StudentExamSchedule';
import StudentResults from './StudentResults';
import StudentActivities from './StudentActivities';

const StudentProfile = ({ student, user }) => {
  const navigate = useNavigate();
  const [activeAcademicTab, setActiveAcademicTab] = useState('attendance');

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

  const studentName = `${user?.firstName || student?.firstName || 'Aro'} ${user?.lastName || student?.lastName || 'Patel'}`.trim();
  const className = student?.class?.grade ? `Grade ${student.class.grade}` : 'Grade 9';
  const sectionName = student?.class?.section ? `Section ${student.class.section}` : 'Section A';
  const rollNo = student?.rollNumber || student?.rollNo || '901';
  const admissionNo = student?.admissionNo || student?.admissionNumber || 'ADM-2026-901';
  const email = user?.email || student?.email || 'rohan.verma@school.edu';
  const phone = user?.phone || student?.phone || '+91 98765 43210';
  const parentName = student?.parentName || 'Suresh Verma';
  const parentContact = student?.parentPhone || '+91 98765 00000';
  const dob = student?.dob ? new Date(student.dob).toLocaleDateString() : 'May 14, 2011';
  const bloodGroup = student?.bloodGroup || 'B+';
  const address = student?.address || 'Flat 402, Sunshine Apartments, Green Valley Road, New Delhi';

  const studentId = student?.userId?._id || student?.userId || student?._id || user?.id || user?._id || user?.userId;

  // 8 Academic Sub-Tabs (Requirement 4: Academic Information / My Learning)
  const academicTabs = [
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2, fullPath: '/dashboard/attendance' },
    { id: 'homework', label: 'Homework', icon: BookOpen, fullPath: '/dashboard/homework' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, fullPath: '/dashboard/assignments' },
    { id: 'study-notes', label: 'Study Notes', icon: FileText, fullPath: '/dashboard/study-notes' },
    { id: 'timetable', label: 'Timetable', icon: Clock, fullPath: '/dashboard/timetable' },
    { id: 'exam-schedule', label: 'Exam Schedule', icon: CalendarDays, fullPath: '/dashboard/exam-schedule' },
    { id: 'results', label: 'Results', icon: Award, fullPath: '/dashboard/results' },
    { id: 'activities', label: 'Activities', icon: Trophy, fullPath: '/dashboard/activities' },
  ];

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

  const renderAcademicContent = () => {
    switch (activeAcademicTab) {
      case 'attendance':
        return <StudentAttendance userId={studentId} />;
      case 'homework':
        return <StudentHomework userId={studentId} />;
      case 'assignments':
        return <StudentAssignments userId={studentId} />;
      case 'study-notes':
        return <StudentStudyNotes />;
      case 'timetable':
        return <StudentTimetable />;
      case 'exam-schedule':
        return <StudentExamSchedule />;
      case 'results':
        return <StudentResults userId={studentId} user={user} student={student} />;
      case 'activities':
        return <StudentActivities />;
      default:
        return <StudentAttendance userId={studentId} />;
    }
  };

  const currentTabObject = academicTabs.find(t => t.id === activeAcademicTab);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#0C4A86] text-3xl font-black text-white shadow-md border-2 border-white/40">
            {profileAvatar ? (
              <img src={profileAvatar} alt={studentName} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <span>{studentName.charAt(0)}</span>
            )}
            <label
              htmlFor="profile-tab-photo-upload"
              className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-md hover:bg-amber-600 transition"
              title="Upload Profile Photo"
            >
              <Camera className="h-4 w-4" />
              <input
                id="profile-tab-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold backdrop-blur-md text-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Official Student Profile
            </div>
            <h1 className="text-3xl font-black">{studentName}</h1>
            <p className="text-amber-100 text-sm font-semibold">
              {className} • {sectionName} | Roll No: <span className="font-extrabold text-white">{rollNo}</span> | Admission: <span className="font-extrabold text-white">{admissionNo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Academic Details */}
        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#BFDBFE] pb-4">
            <div className="rounded-2xl bg-[#EBF5FF] p-3 text-[#0C4A86]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0C4A86] text-lg">Academic Information</h3>
              <p className="text-xs font-semibold text-[#736B63]">Current class & enrollment standing</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className="rounded-2xl bg-[#EBF5FF] p-3.5 border border-[#BFDBFE]">
              <p className="text-[10px] text-[#736B63] font-bold uppercase tracking-wider">Class & Section</p>
              <p className="font-black text-[#0C4A86] mt-1 text-sm">{className} - {sectionName}</p>
            </div>
            <div className="rounded-2xl bg-[#EBF5FF] p-3.5 border border-[#BFDBFE]">
              <p className="text-[10px] text-[#736B63] font-bold uppercase tracking-wider">Roll Number</p>
              <p className="font-black text-[#0C4A86] mt-1 text-sm">{rollNo}</p>
            </div>
            <div className="rounded-2xl bg-[#EBF5FF] p-3.5 border border-[#BFDBFE]">
              <p className="text-[10px] text-[#736B63] font-bold uppercase tracking-wider">Admission No</p>
              <p className="font-black text-[#0C4A86] mt-1 text-sm">{admissionNo}</p>
            </div>
            <div className="rounded-2xl bg-[#EBF5FF] p-3.5 border border-[#BFDBFE]">
              <p className="text-[10px] text-[#736B63] font-bold uppercase tracking-wider">Academic Session</p>
              <p className="font-black text-[#0C4A86] mt-1 text-sm">2025 - 2026</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#BFDBFE] pb-4">
            <div className="rounded-2xl bg-[#EBF5FF] p-3 text-[#0C4A86]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0C4A86] text-lg">Personal Details</h3>
              <p className="text-xs font-semibold text-[#736B63]">Contact and student demographic info</p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between py-1.5 border-b border-[#BFDBFE]">
              <span className="text-[#736B63] flex items-center gap-2"><Calendar className="h-4 w-4 text-[#0096DA]" /> Date of Birth</span>
              <span className="font-bold text-[#0C4A86]">{dob}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#BFDBFE]">
              <span className="text-[#736B63] flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Blood Group</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">{bloodGroup}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#BFDBFE]">
              <span className="text-[#736B63] flex items-center gap-2"><Mail className="h-4 w-4 text-[#0096DA]" /> Email</span>
              <span className="font-bold text-[#0C4A86]">{email}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#736B63] flex items-center gap-2"><Phone className="h-4 w-4 text-[#0096DA]" /> Contact Phone</span>
              <span className="font-bold text-[#0C4A86]">{phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guardian & Address Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#BFDBFE] pb-4">
            <div className="rounded-2xl bg-[#EBF5FF] p-3 text-emerald-700">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0C4A86] text-lg">Guardian Details</h3>
              <p className="text-xs font-semibold text-[#736B63]">Parent contact & emergency info</p>
            </div>
          </div>
          <div className="space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between py-1.5 border-b border-[#BFDBFE]">
              <span className="text-[#736B63]">Parent / Guardian Name</span>
              <span className="font-bold text-[#0C4A86]">{parentName}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#736B63]">Emergency Contact Phone</span>
              <span className="font-bold text-[#0C4A86]">{parentContact}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#BFDBFE] pb-4">
            <div className="rounded-2xl bg-[#EBF5FF] p-3 text-amber-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0C4A86] text-lg">Residential Address</h3>
              <p className="text-xs font-semibold text-[#736B63]">Official registered home address</p>
            </div>
          </div>
          <p className="text-xs font-bold text-[#0C4A86] leading-relaxed bg-[#EBF5FF] p-4 rounded-2xl border border-[#BFDBFE]">
            {address}
          </p>
        </div>
      </div>

      {/* Requirement 4: "My Academic Information" / "My Learning" Section (Replaced "My Student") */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BFDBFE] pb-4">
          <div>
            <h2 className="text-xl font-black text-[#0C4A86]">My Academic Information & Learning Workspace</h2>
            <p className="text-xs font-semibold text-[#736B63]">Quick access to your attendance logs, homework, assignments, timetable, exam schedule, and results.</p>
          </div>

          {currentTabObject && (
            <button
              onClick={() => navigate(currentTabObject.fullPath)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] hover:bg-[#EFEAE4] px-4 py-2 text-xs font-extrabold text-[#0C4A86] transition-colors self-start md:self-auto"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Open Full Page
            </button>
          )}
        </div>

        {/* Academic Sub-Tabs (8 items) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#BFDBFE]">
          {academicTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeAcademicTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAcademicTab(tab.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0C4A86] text-white shadow-sm'
                    : 'bg-[#EBF5FF] text-[#334155] hover:bg-[#EFEAE4]'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Section Viewer */}
        <div className="pt-2">
          {renderAcademicContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
