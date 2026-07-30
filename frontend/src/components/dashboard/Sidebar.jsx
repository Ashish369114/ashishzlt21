import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutGrid, MessageSquare, Settings, Sparkles, LogOut } from 'lucide-react';
import ZaynLeviLogo from '../ZaynLeviLogo';

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid, end: true },
  { label: 'My Classes', to: '/dashboard/classes', icon: BookOpen },
  { label: 'Parent Communications', to: '/dashboard/communications', icon: MessageSquare },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-[#07111f] px-5 py-6 text-slate-100 shadow-2xl shadow-slate-950/20 lg:flex">
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <ZaynLeviLogo size={32} textColor="light" />
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Daily Insight</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            “Great teachers are the ones who make learning feel like curiosity instead of duty.”
          </p>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;
