import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, PlusCircle, Check, Copy, Calendar, Clock, MapPin, Tag, ChevronRight, Presentation } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';
import TeacherTimetable from '../../components/dashboard/TeacherTimetable';
import InteractiveGoogleCalendar from '../../components/common/InteractiveGoogleCalendar';
import { teacherService } from '../../services/api';

const defaultTimetable = [
  { time: '8:30 AM - 9:15 AM', monday: 'Grade 9A • Maths', tuesday: 'Grade 10B • Maths', wednesday: 'Grade 9A • Maths', thursday: 'Grade 10B • Maths', friday: 'Grade 9A • Maths', saturday: 'Lab Session' },
  { time: '9:15 AM - 10:00 AM', monday: 'Grade 10A • Algebra', tuesday: 'Grade 9B • Geometry', wednesday: 'Grade 10A • Algebra', thursday: 'Grade 9B • Geometry', friday: 'Grade 10A • Algebra', saturday: 'Staff Sync' },
  { time: '10:15 AM - 11:00 AM', monday: 'Grade 8C • Maths', tuesday: 'Grade 8C • Maths', wednesday: 'Free Period', thursday: 'Grade 8C • Maths', friday: 'Free Period', saturday: 'Remedial Class' },
  { time: '11:00 AM - 11:45 AM', monday: 'Grade 9B • Geometry', tuesday: 'Grade 10A • Algebra', wednesday: 'Grade 9B • Geometry', thursday: 'Grade 10A • Algebra', friday: 'Grade 9B • Geometry', saturday: 'Activity Hour' },
];

const upcomingEventsList = [
  {
    id: 1,
    title: 'Annual Mathematics Olympiad & Speed Quiz',
    date: 'August 5, 2026',
    time: '09:30 AM - 12:30 PM',
    category: 'Annual Day',
    location: 'Main Auditorium',
    badgeColor: 'bg-[#0C4A86] text-white',
    description: 'Inter-house mathematics competition for Grade 8 to 10.'
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting (PTM)',
    date: 'August 12, 2026',
    time: '10:00 AM - 01:00 PM',
    category: 'Parent-Teacher Meetings',
    location: 'School Classrooms',
    badgeColor: 'bg-[#0096DA] text-white',
    description: 'Academic progress discussion between teachers & parents.'
  },
  {
    id: 3,
    title: 'Independence Day Holiday & Cultural Fest',
    date: 'August 15, 2026',
    time: '08:30 AM - 11:30 AM',
    category: 'Holidays',
    location: 'Flag Hoisting Ground',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Flag hoisting ceremony & student patriotic performances.'
  },
  {
    id: 4,
    title: 'Mid-Term 1 Half-Yearly Mathematics Exam',
    date: 'August 25, 2026',
    time: '09:00 AM - 12:00 PM',
    category: 'Exams',
    location: 'Exam Halls 1-4',
    badgeColor: 'bg-rose-600 text-white',
    description: 'Mid-Term 1 Evaluation for Grade 9 & 10 students.'
  }
];

const defaultActivityList = [
  { id: 1, title: 'Grade 9 Mathematics Quiz Competition', className: 'Grade 9 - A', description: 'Interactive mental math and formula challenge organized in class.', date: 'Today, 10:30 AM', author: 'Ramesh Sharma' },
  { id: 2, title: 'Geometry Field Measurement Workshop', className: 'Grade 10 - B', description: 'Outdoor practical measuring perimeter & area of school grounds.', date: 'Yesterday, 02:15 PM', author: 'Ramesh Sharma' },
  { id: 3, title: 'Remedial Class Session on Quadratic Equations', className: 'Grade 8 - C', description: 'Extra practice session conducted for students requiring guidance.', date: 'May 22, 2026', author: 'Ramesh Sharma' },
];

const motivationalQuotesList = [
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
  { quote: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  { quote: "Teachers can change lives with just the right mix of chalk and challenges.", author: "Joyce Meyer" },
  { quote: "Success comes from consistent effort.", author: "Sophocles" },
];

const getDailyQuoteIndex = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateSeed = year * 10000 + month * 100 + day;
  return dateSeed % motivationalQuotesList.length;
};

const TeacherHomePage = ({ user, openActivityModal = false }) => {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState('Ramesh Sharma');
  const [timetableRows] = useState(defaultTimetable);
  const [activitiesList, setActivitiesList] = useState(defaultActivityList);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Daily Quote (Fixed 1 day per date seed)
  const dailyQuoteIndex = getDailyQuoteIndex();
  const currentQuoteObj = motivationalQuotesList[dailyQuoteIndex];
  const [copiedQuote, setCopiedQuote] = useState(false);

  // New Activity Modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(openActivityModal);
  const [newActivityForm, setNewActivityForm] = useState({ title: '', className: 'Grade 9 - A', description: '' });

  const teacherId = user?._id || user?.id || user?.userId;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const profileRes = await teacherService.getProfile(teacherId);
        if (!isMounted) return;
        if (profileRes?.data?.name) {
          setTeacherName(profileRes.data.name);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [teacherId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentQuoteObj.quote}" — ${currentQuoteObj.author}`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivityForm.title || !newActivityForm.description) {
      alert('Please fill out title and description');
      return;
    }

    const created = {
      id: Date.now(),
      title: newActivityForm.title,
      className: newActivityForm.className,
      description: newActivityForm.description,
      date: 'Just Now',
      author: teacherName,
    };

    setActivitiesList((prev) => [created, ...prev]);
    setNewActivityForm({ title: '', className: 'Grade 9 - A', description: '' });
    setIsActivityModalOpen(false);
    alert('New activity posted successfully!');
  };

  if (isLoading) {
    return <div className="rounded-2xl border border-[#BFDBFE] bg-white p-8 text-center text-sm text-[#736B63]">Loading teacher dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner & Navigation */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FF] px-3.5 py-1.5 text-xs font-bold text-[#0C4A86] border border-[#BFDBFE] hover:bg-[#0C4A86] hover:text-white transition-all"
            >
              ← Back
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome Back, {teacherName} 👋</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">Faculty</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Senior Mathematics Faculty • Department of Mathematics • Assigned Classes: <span className="font-extrabold text-[#0C4A86]">Grade 9A, 9B, 10A, 10B, 8C</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/communications')}
              className="flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-black"
            >
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span>Communication</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/classes')}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-800 transition hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 text-[#0C4A86]" />
              <span>My Classes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Daily Quote */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md">
        <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-extrabold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Daily Quote — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold transition hover:bg-white/20"
          >
            {copiedQuote ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
          </button>
        </div>

        <div className="my-3 space-y-1.5">
          <h3 className="text-xl font-black italic text-white font-serif leading-snug">
            "{currentQuoteObj.quote}"
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">— {currentQuoteObj.author}</p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Calendar & Upcoming Events (Equal Box Size & Scrollable) */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Monthly Calendar View */}
        <div className="lg:col-span-6 max-h-[520px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <InteractiveGoogleCalendar
            hideCreateEvent={true}
            hideViewToggle={true}
            assignedClassesOnly={true}
          />
        </div>

        {/* Upcoming Events Section */}
        <div className="lg:col-span-6 max-h-[520px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-[#0C4A86]">Upcoming Events</h3>
            <p className="text-[11px] font-semibold text-slate-500">Important school functions, exams & holidays</p>
          </div>
          <div className="space-y-3 pr-1">
            {upcomingEventsList.map((evt) => (
              <div key={evt.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 hover:bg-white transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${evt.badgeColor}`}>
                    {evt.category}
                  </span>
                  <span className="text-xs font-bold text-[#0C4A86] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {evt.date}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-900">{evt.title}</h4>
                <p className="text-[11px] text-slate-600">{evt.description}</p>

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#0096DA]" /> {evt.time}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <MapPin className="h-3 w-3" /> {evt.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Class Timetable Section */}
      <TeacherTimetable timetable={timetableRows} currentTime={currentTime} />

      {/* 5. New Activity List Section */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* New Activity List */}
        <div className="lg:col-span-12">
          <SectionCard
            title="New Activity List"
            subtitle="Published school & classroom activities"
            action={
              <button
                onClick={() => setIsActivityModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-black"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Activity</span>
              </button>
            }
          >
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {activitiesList.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#0C4A86]/15 px-2 py-0.5 text-xs font-bold text-[#0C4A86]">
                      {activity.className}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{activity.date}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{activity.title}</h4>
                  <p className="text-xs text-slate-600">{activity.description}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-[#0096DA]">
                    <span>By: {activity.author}</span>
                    <span className="text-emerald-700">Published ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Modal for Posting New Activity */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#0C4A86]">Post New Activity</h3>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Target Class</label>
                <select
                  value={newActivityForm.className}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, className: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800"
                >
                  <option value="Grade 9 - A">Grade 9 - A</option>
                  <option value="Grade 9 - B">Grade 9 - B</option>
                  <option value="Grade 10 - A">Grade 10 - A</option>
                  <option value="Grade 10 - B">Grade 10 - B</option>
                  <option value="Grade 8 - C">Grade 8 - C</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Exhibition Preparation"
                  value={newActivityForm.title}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details of the classroom activity..."
                  value={newActivityForm.description}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0C4A86] px-4 py-2 font-bold text-white shadow-sm hover:bg-black"
                >
                  Publish Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomePage;
