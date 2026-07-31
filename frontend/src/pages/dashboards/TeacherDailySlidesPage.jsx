import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Play, Pause, PlusCircle, Quote, Maximize2, Share2, Copy, Check } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const initialQuotes = [
  {
    id: 1,
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    category: "Inspiration & Growth",
    bgGradient: "from-[#0C4A86] to-[#0096DA]",
    theme: "Gold Elegance",
  },
  {
    id: 2,
    quote: "The secret of getting ahead is getting started. Small steps today lead to grand achievements tomorrow.",
    author: "Mark Twain",
    category: "Motivation & Perseverance",
    bgGradient: "from-emerald-700 to-teal-900",
    theme: "Emerald Fresh",
  },
  {
    id: 3,
    quote: "Teachers can open the door, but you must enter it yourself. Curiosity is the spark of all learning.",
    author: "Chinese Proverb",
    category: "Learning & Knowledge",
    bgGradient: "from-slate-700 to-[#0C4A86]",
    theme: "Midnight Taupe",
  },
  {
    id: 4,
    quote: "It always seems impossible until it’s done. Keep pushing forward with determination.",
    author: "Nelson Mandela",
    category: "Courage & Fortitude",
    bgGradient: "from-indigo-800 to-purple-950",
    theme: "Royal Indigo",
  },
  {
    id: 5,
    quote: "Develop a passion for learning. If you do, you will never cease to grow.",
    author: "Anthony J. D'Angelo",
    category: "Lifelong Learning",
    bgGradient: "from-rose-800 to-red-950",
    theme: "Warm Rose",
  },
  {
    id: 6,
    quote: "Pure Mathematics is, in its way, the poetry of logical ideas.",
    author: "Albert Einstein",
    category: "Mathematics & Logic",
    bgGradient: "from-sky-700 to-blue-900",
    theme: "Sapphire Blue",
  },
  {
    id: 7,
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    category: "Empowerment",
    bgGradient: "from-teal-800 to-cyan-950",
    theme: "Ocean Cyan",
  },
  {
    id: 8,
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Resilience",
    bgGradient: "from-[#0C4A86] to-[#0096DA]",
    theme: "Sapphire Fortitude",
  },
  {
    id: 9,
    quote: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats",
    category: "Action & Excellence",
    bgGradient: "from-purple-800 to-indigo-900",
    theme: "Deep Violet",
  },
  {
    id: 10,
    quote: "Creativity is intelligence having fun. Explore, discover, and build with pride.",
    author: "Albert Einstein",
    category: "Creativity & Innovation",
    bgGradient: "from-pink-700 to-[#0C4A86]",
    theme: "Sunset Amber",
  },
  {
    id: 11,
    quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    author: "Benjamin Franklin",
    category: "Interactive Learning",
    bgGradient: "from-stone-700 to-zinc-900",
    theme: "Granite Slate",
  },
  {
    id: 12,
    quote: "Aim for the moon. If you miss, you may hit a star.",
    author: "W. Clement Stone",
    category: "Aspiration & Excellence",
    bgGradient: "from-blue-800 to-indigo-950",
    theme: "Starlight Blue",
  },
];

const TeacherDailySlidesPage = ({ user }) => {
  const [quotesList, setQuotesList] = useState(initialQuotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  // New Slide Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState({ quote: '', author: '', category: 'Inspiration & Growth' });

  // Auto-play slides every 6 seconds
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % quotesList.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, quotesList.length]);

  const currentSlide = quotesList[currentIndex] || quotesList[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % quotesList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + quotesList.length) % quotesList.length);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentSlide.quote}" — ${currentSlide.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSlideSubmit = (e) => {
    e.preventDefault();
    if (!newQuoteForm.quote || !newQuoteForm.author) {
      alert('Please enter both the quote and author name.');
      return;
    }

    const gradients = [
      "from-[#0C4A86] to-[#0096DA]",
      "from-emerald-700 to-teal-900",
      "from-slate-700 to-[#0C4A86]",
      "from-indigo-800 to-purple-950",
    ];

    const newSlide = {
      id: Date.now(),
      quote: newQuoteForm.quote,
      author: newQuoteForm.author,
      category: newQuoteForm.category,
      bgGradient: gradients[quotesList.length % gradients.length],
      theme: "Custom Slide",
    };

    setQuotesList((prev) => [...prev, newSlide]);
    setCurrentIndex(quotesList.length); // Jump to new slide
    setNewQuoteForm({ quote: '', author: '', category: 'Inspiration & Growth' });
    setIsModalOpen(false);
    alert('New Motivational Quote Slide created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1817]">Daily Slides & Motivational Quotes</h1>
          <p className="text-sm font-semibold text-[#736B63]">
            School Lesson Academic • Daily inspirational slides deck for morning assembly & classroom presentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold text-[#0C4A86] hover:bg-[#EFEAE4]"
          >
            {isPlaying ? <Pause className="h-4 w-4 text-amber-600" /> : <Play className="h-4 w-4 text-emerald-600" />}
            <span>{isPlaying ? 'Pause Slides' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Daily Slide</span>
          </button>
        </div>
      </div>

      {/* Main Hero Slide Display */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentSlide.bgGradient} p-8 sm:p-12 text-white shadow-xl transition-all duration-700 min-h-[340px] flex flex-col justify-between`}>
        {/* Decorative Quote Icon & Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-sky-200" />
            <span>{currentSlide.category}</span>
          </div>

          <div className="flex items-center gap-2 text-white/80">
            <span className="text-xs font-bold">Slide {currentIndex + 1} of {quotesList.length}</span>
            <button
              onClick={handleCopyQuote}
              className="rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20"
              title="Copy quote text"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Quote Content */}
        <div className="my-6 space-y-4 max-w-3xl">
          <Quote className="h-10 w-10 text-white/40" />
          <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white font-serif">
            "{currentSlide.quote}"
          </h2>
          <p className="text-sm font-bold text-sky-100 uppercase tracking-widest">
            — {currentSlide.author}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {quotesList.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white transition hover:bg-white/30"
              title="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white transition hover:bg-white/30"
              title="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All Slides */}
      <SectionCard title="Daily Quote Slides Library" subtitle="Curated quotes for classroom presentation">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotesList.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                idx === currentIndex
                  ? 'border-[#0C4A86] bg-[#EBF5FF]/30 ring-2 ring-[#0C4A86] shadow-md'
                  : 'border-[#BFDBFE] bg-[#EBF5FF] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#0C4A86]">
                  {q.category}
                </span>
                <span className="text-xs font-bold text-[#736B63]">#Slide {idx + 1}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#0C4A86] line-clamp-3">"{q.quote}"</p>
              <p className="mt-2 text-[11px] font-bold text-[#0096DA]">— {q.author}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Add New Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-[#0C4A86]">Add New Daily Quote Slide</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#736B63]">✕</button>
            </div>
            <form onSubmit={handleAddSlideSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155]">Motivational Quote Text</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter inspiring quote text..."
                  value={newQuoteForm.quote}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, quote: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Author / Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APJ Abdul Kalam, Albert Einstein, Proverb"
                  value={newQuoteForm.author}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, author: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Category / Theme</label>
                <select
                  value={newQuoteForm.category}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                >
                  <option value="Inspiration & Growth">Inspiration & Growth</option>
                  <option value="Motivation & Perseverance">Motivation & Perseverance</option>
                  <option value="Learning & Knowledge">Learning & Knowledge</option>
                  <option value="Courage & Leadership">Courage & Leadership</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]">Add Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDailySlidesPage;
