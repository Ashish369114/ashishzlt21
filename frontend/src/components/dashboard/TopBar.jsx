import React from 'react';
import { Bell, MessageCircleMore, Search, Settings, Sparkles } from 'lucide-react';

const TopBar = ({ userName, subject, onOpenMessages, onOpenNotifications, onOpenSettings }) => {
  return (
    <header className="flex items-center justify-between rounded-[1.6rem] border border-slate-200/80 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="min-w-[360px]">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Search className="h-4 w-4" /></span>
            <input aria-label="Search" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400" placeholder="Search classes, students, tasks, activities..." />
          </label>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm text-slate-500">
          <span className="px-2 py-1 rounded-full bg-slate-100">Dashboard</span>
          <span className="px-2 py-1 rounded-full bg-slate-100">My Classes</span>
          <span className="px-2 py-1 rounded-full bg-slate-100">Timetable</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onOpenNotifications} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
        </button>
        <button onClick={onOpenMessages} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100">
          <MessageCircleMore className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
        </button>
        <button onClick={onOpenSettings} className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100">
          <Settings className="h-5 w-5" />
        </button>

        <div className="ml-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-[160px]">
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{subject}</span>
              <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
