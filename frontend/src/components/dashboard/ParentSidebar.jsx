import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  User,
  CheckCircle2,
  BookOpen,
  FileText,
  FileCode,
  Clock,
  Calendar,
  Award,
  Trophy,
  Sparkles,
  MessageSquare,
  Bell,
  CreditCard,
  CalendarDays,
  Settings,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';

const parentNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid, end: true },
  { label: 'My Child', to: '/dashboard/child', icon: User },
  { label: 'Attendance', to: '/dashboard/attendance', icon: CheckCircle2 },
  { label: 'Homework', to: '/dashboard/homework', icon: BookOpen },
  { label: 'Assignments', to: '/dashboard/assignments', icon: FileText },
  { label: 'Study Notes', to: '/dashboard/study-notes', icon: FileCode },
  { label: 'Timetable', to: '/dashboard/timetable', icon: Clock },
  { label: 'Exam Schedule', to: '/dashboard/exams', icon: Calendar },
  { label: 'Results', to: '/dashboard/results', icon: Award },
  { label: 'Activities', to: '/dashboard/activities', icon: Trophy },
  { label: 'Classroom Activities', to: '/dashboard/classroom-activities', icon: Sparkles },
  { label: 'Communication', to: '/dashboard/communication', icon: MessageSquare },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Fees & Payments', to: '/dashboard/fees', icon: CreditCard },
  { label: 'School Calendar', to: '/dashboard/calendar', icon: CalendarDays },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

const ParentSidebar = ({ onLogout, isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between overflow-y-auto bg-[#FAF6F0] px-5 py-6 text-slate-800 border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] text-white shadow-md">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-black tracking-tight text-[#0C4A86] leading-tight">ABC International</p>
                <p className="text-xs font-bold text-[#0096DA]">Parent Portal</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0C4A86]">
              Parent Navigation
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {parentNavigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-2xs font-extrabold'
                      : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 text-[#0C4A86]" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Footer */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-xs font-extrabold text-[#DC2626] transition-all hover:bg-[#DC2626] hover:text-white shadow-2xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
