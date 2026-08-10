import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Calendar, BookOpen, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { schoolDataService } from '../../services/schoolDataStore';

const ParentStudentProfile = ({ user, students = [], selectedStudentId, student }) => {
  const navigate = useNavigate();

  const activeStudent = student || students.find(
    (s) => (s._id || s.userId?._id || s.userId) === selectedStudentId
  ) || students[0] || {
    name: 'Ramesh Kumar',
    grade: '1',
    section: 'A',
    rollNumber: 'G1-001',
    admissionNo: 'ADM-2026-0512',
    classTeacher: 'Ramesh Sharma',
    dob: '2019-08-05'
  };

  const name = activeStudent.userId?.firstName
    ? `${activeStudent.userId.firstName} ${activeStudent.userId.lastName || ''}`.trim()
    : activeStudent.name || 'Ramesh Kumar';

  const primaryParentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user?.name || activeStudent.parentName || 'Rajesh Sharma');

  const studentGradeStr = String(activeStudent.grade || '1').replace(/^Grade\s*/i, '');
  const studentSectionStr = String(activeStudent.section || 'A').replace(/^Section\s*/i, '');

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
              Student Profile
            </span>
          </div>
          <h1 className="text-2xl font-black">{name}'s Official Student Profile</h1>
          <p className="text-sky-100 text-xs font-medium">Academic registration details, class assignment & parent contacts.</p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] text-3xl font-black text-white shadow-md">
            {name.charAt(0)}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{name}</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                Enrolled Student
              </span>
            </div>
            <p className="text-xs font-bold text-[#0096DA]">
              Grade {studentGradeStr} - Section {studentSectionStr} • Roll No: {activeStudent.rollNumber || 'G1-001'}
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              Admission No: <strong className="text-slate-800">{activeStudent.admissionNo || 'ADM-2026-0512'}</strong> • Academic Year: <strong className="text-slate-800">2026-2027</strong>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs font-bold">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">Class Teacher</span>
            <span className="text-sm font-black text-slate-900">{activeStudent.classTeacher || 'Ramesh Sharma'}</span>
            <span className="text-[11px] text-slate-500 block">Senior Mathematics Faculty</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">Date of Birth</span>
            <span className="text-sm font-black text-slate-900">{activeStudent.dob || 'August 5, 2012'}</span>
            <span className="text-[11px] text-slate-500 block">Verified in School Records</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">Primary Parent</span>
            <span className="text-sm font-black text-slate-900">{primaryParentName}</span>
            <span className="text-[11px] text-slate-500 block">Verified Parent Account ({user?.email || 'parent@school.edu'})</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">House / Group</span>
            <span className="text-sm font-black text-amber-700">Einstein House (Yellow)</span>
            <span className="text-[11px] text-slate-500 block">Inter-house Speed Quiz Team</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">Blood Group</span>
            <span className="text-sm font-black text-rose-700">O Positive (O+)</span>
            <span className="text-[11px] text-slate-500 block">Medical File Complete</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">School Branch</span>
            <span className="text-sm font-black text-[#0C4A86]">ABC International Main Campus</span>
            <span className="text-[11px] text-slate-500 block">CBSE Affiliation #10928</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentStudentProfile;
