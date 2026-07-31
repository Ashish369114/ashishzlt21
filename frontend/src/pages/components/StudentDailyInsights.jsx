import React, { useState } from 'react';
import { Sparkles, Flame, Target, BookOpen, Clock, Trophy, Quote, RefreshCw, Lightbulb, CheckCircle2 } from 'lucide-react';

const quotesDeck = [
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", tip: "Study Strategy: Use 25-minute Pomodoro focus sprints." },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", tip: "Retention Tip: Review class notes within 24 hours." },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela", tip: "Exam Preparation: Solve past test papers under timed conditions." },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", tip: "Mindset Tip: Focus on consistent daily progress over perfection." },
];

const StudentDailyInsights = ({ stats, user }) => {
  const studentName = `${user?.firstName || 'Rohan'}`;
  const [deckIndex, setDeckIndex] = useState(0);

  const currentQuote = quotesDeck[deckIndex];

  const handleNextQuote = () => {
    setDeckIndex((prev) => (prev + 1) % quotesDeck.length);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-[#0C4A86] p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" /> Daily Inspiration & Study Motivation Deck
          </div>
          <h1 className="text-3xl font-black text-white">Daily Learning Insights, {studentName}! 🚀</h1>
          <p className="text-xs font-semibold text-amber-100/90 max-w-xl">
            Empowering quotes, study strategies, habit streak tracking, and daily productivity guidance.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/15">
          <Flame className="h-8 w-8 text-amber-400 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Study Streak</p>
            <p className="text-xl font-black text-white">14 Days Active 🔥</p>
          </div>
        </div>
      </div>

      {/* Dynamic Quote & Strategy Card */}
      <div className="rounded-3xl border border-[#BFDBFE] bg-white p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-4">
          <h2 className="text-lg font-black text-[#0C4A86] flex items-center gap-2">
            <Quote className="h-5 w-5 text-amber-600" /> Today's Motivational Focus Card
          </h2>
          <button
            onClick={handleNextQuote}
            className="flex items-center gap-2 rounded-xl bg-[#EBF5FF] border border-[#BFDBFE] px-3.5 py-1.5 text-xs font-extrabold text-[#0C4A86] hover:bg-[#EFEAE4] transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#0096DA]" />
            <span>Next Insight</span>
          </button>
        </div>

        <div className="bg-[#EBF5FF] p-6 rounded-2xl border border-[#BFDBFE] space-y-4 text-center md:text-left">
          <p className="text-xl font-black italic text-[#0C4A86] font-serif leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-[#0C4A86]">— {currentQuote.author}</p>

          <div className="pt-3 border-t border-[#BFDBFE] flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 p-3 rounded-xl">
            <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{currentQuote.tip}</span>
          </div>
        </div>
      </div>

      {/* Snapshot Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#736B63] uppercase">Daily Goal</span>
            <Target className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-[#0C4A86]">3.5 / 4 hrs</p>
          <div className="w-full bg-[#EBF5FF] h-2 rounded-full overflow-hidden border border-[#BFDBFE]">
            <div className="bg-[#0C4A86] h-full w-[87.5%]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#736B63] uppercase">Classes Today</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#0C4A86]">6 Periods</p>
          <p className="text-xs font-bold text-emerald-700">Mathematics & Physics Lab</p>
        </div>

        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#736B63] uppercase">Homework Tasks</span>
            <BookOpen className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-[#0C4A86]">2 Pending</p>
          <p className="text-xs font-bold text-amber-700">Due in 2 days</p>
        </div>

        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#736B63] uppercase">Performance Score</span>
            <Trophy className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-[#0C4A86]">92%</p>
          <p className="text-xs font-bold text-emerald-700">+4% higher than avg</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDailyInsights;
