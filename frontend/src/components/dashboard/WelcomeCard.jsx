import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeCard = ({ name, date }) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 p-8 text-white shadow-[0_30px_90px_rgba(76,81,191,0.25)]">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Premium teacher workspace
          </div>
          <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">Welcome back, {name} 👋</h2>
          <p className="mt-3 text-base text-slate-100/90">Have a great day at school and keep every class running smoothly.</p>
          <div className="mt-6 inline-flex rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
            <span className="mr-2 text-slate-200">Today’s Date</span>
            <span className="font-semibold">{date}</span>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="flex h-40 w-40 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-white/20 to-white/5 text-5xl">
            <span>🧑‍🏫</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeCard;
