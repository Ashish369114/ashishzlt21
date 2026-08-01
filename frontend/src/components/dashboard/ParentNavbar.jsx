import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

const ParentNavbar = ({
  user,
  students = [],
  selectedStudentId,
  onSelectStudent,
  onLogout,
  onToggleSidebar,
  unreadCount = 3
}) => {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const parentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Priya Sharma';

  return (
    <header className="sticky top-0 z-30 flex h-auto flex-col sm:flex-row min-h-[80px] w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:px-8 shadow-2xs gap-3">
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand & Page Title */}
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-[#0C4A86] text-white shadow-xs sm:flex">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">ABC International School</h2>
              <p className="text-xs font-bold text-[#0096DA]">Parent Portal & Child Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Center / Right: Multi-Child Selector Pills (Req 1, 2, 28) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
        {students.length > 1 ? (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-[#0C4A86] px-2 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[#0C4A86]" /> My Children:
            </span>
            {students.map((st) => {
              const id = st._id || st.userId?._id || st.userId;
              const name = st.userId?.firstName || st.name || 'Child';
              const grade = st.grade || st.class?.grade || '6';
              const section = st.section || st.class?.section || 'A';
              const isSelected = id === selectedStudentId;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectStudent(id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
                    isSelected
                      ? 'bg-[#0C4A86] text-white border border-[#0C4A86] shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>👤 {name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-sky-100' : 'bg-slate-100 text-slate-500'}`}>
                    {grade}{section}
                  </span>
                </button>
              );
            })}
          </div>
        ) : students.length === 1 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-1.5 shadow-2xs text-xs font-black text-[#0C4A86]">
            <Users className="h-4 w-4 text-[#0C4A86] shrink-0" />
            <span>Child: {`${students[0].userId?.firstName || students[0].name || 'Aarav'} ${students[0].userId?.lastName || ''}`.trim()} (Class {students[0].grade || students[0].class?.grade || '6'}{students[0].section || students[0].class?.section || 'A'})</span>
          </div>
        ) : null}
      </div>

      {/* Right Controls: Notification Bell & Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/notifications')}
          className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#0C4A86] transition-all"
          title="View Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Parent Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pr-3 hover:bg-slate-100 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] font-black text-white text-xs shadow-2xs">
              {parentName.charAt(0)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-black text-slate-900 leading-tight">{parentName}</p>
              <p className="text-[10px] font-bold text-[#0096DA]">Parent Account</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-black text-slate-900">{parentName}</p>
                <p className="text-[10px] font-bold text-slate-500">Parent Access</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4" /> Account Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ParentNavbar;
