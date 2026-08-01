import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  MessageSquare,
  PlusCircle,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

const motivationalQuotes = [
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Develop a passion for learning. You will never cease to grow.", author: "Anthony J. D'Angelo" },
  { quote: "Curiosity is the spark of all learning.", author: "Proverb" },
  { quote: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
  { quote: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.", author: "Albert Einstein" },
  { quote: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" }
];

// Date-seeded deterministic quote calculation (Req 2: 1 Date = 1 Fixed Quote)
const getDailyQuote = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
};

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid, end: true },
  { label: 'My Classes', to: '/dashboard/classes', icon: BookOpen },
  { label: 'Communication', to: '/dashboard/communications', icon: MessageSquare },
  { label: 'Classroom Activity', to: '/dashboard/activities', icon: PlusCircle },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

const Sidebar = ({ onLogout }) => {
  const currentQuote = getDailyQuote();
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between overflow-y-auto bg-[#FAF6F0] px-5 py-6 text-slate-800 border-r 1.5 border-slate-200 shadow-lg lg:flex">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] text-white shadow-md">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight text-[#0C4A86] leading-tight">ABC International</p>
            <p className="text-xs font-bold text-[#0096DA]">Teacher Portal</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0C4A86]">
            Navigation Menu
          </p>
        </div>

        {/* Single Unified Navigation List */}
        <nav className="space-y-1.5">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EBF5FF] text-[#0C4A86] border border-[#0096DA] shadow-sm font-bold'
                    : 'text-slate-700 hover:bg-[#F0F9FF] hover:text-[#0C4A86]'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Fixed Daily Quote Widget in Sidebar (Requirement 2: Exactly 1 Quote Per Day, Fixed, No Scrolling) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0C4A86] to-[#0096DA] p-4 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Daily Quote</span>
            </div>
            <span className="text-[10px] font-bold text-sky-100 bg-white/20 px-2 py-0.5 rounded-full">
              {dateFormatted}
            </span>
          </div>

          <p className="text-xs font-medium text-white italic leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-[11px] font-extrabold text-amber-300 text-right">
            — {currentQuote.author}
          </p>
        </div>
      </div>

      {/* Footer Logout Button */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm font-bold text-[#DC2626] transition-all hover:bg-[#DC2626] hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
