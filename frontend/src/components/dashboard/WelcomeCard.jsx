import React from 'react';

const WelcomeCard = ({ name, date }) => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#1A1817]">Dashboard</h1>
        <p className="mt-1 text-sm font-semibold text-[#736B63]">Welcome back, {name || 'Admin'}!</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-xl border border-[#BFDBFE] bg-white px-3.5 py-1.5 text-xs font-bold text-[#334155] shadow-2xs">
          📅 {date}
        </span>
      </div>
    </div>
  );
};

export default WelcomeCard;
