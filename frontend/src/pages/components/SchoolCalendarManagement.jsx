import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, Clock, MapPin, Tag, Trash2, CheckCircle2 } from 'lucide-react';
import { broadcastDataChange } from '../../services/syncService';

const initialEvents = [
  { id: 1, title: 'Annual Sports Meet 2026', date: '2026-08-15', category: 'Sports', time: '09:00 AM - 04:00 PM', location: 'Main School Ground', organizer: 'Physical Ed Dept', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 2, title: 'Parent-Teacher Meeting (PTM)', date: '2026-08-22', category: 'Meeting', time: '10:00 AM - 01:00 PM', location: 'Auditorium & Classrooms', organizer: 'Academic Council', badge: 'bg-amber-100 text-amber-800' },
  { id: 3, title: 'Mid-Term Examinations Start', date: '2026-09-01', category: 'Exam', time: '09:00 AM - 12:00 PM', location: 'Exam Halls 1-6', organizer: 'Examination Board', badge: 'bg-rose-100 text-rose-800' },
  { id: 4, title: 'Science & Robotics Exhibition', date: '2026-09-10', category: 'Academic', time: '10:00 AM - 03:00 PM', location: 'STEM Lab & Library', organizer: 'Science Department', badge: 'bg-sky-100 text-sky-800' },
  { id: 5, title: 'Teachers Professional Development Workshop', date: '2026-09-18', category: 'Workshop', time: '02:00 PM - 05:00 PM', location: 'Conference Hall B', organizer: 'Principal Office', badge: 'bg-indigo-100 text-indigo-800' },
];

const SchoolCalendarManagement = () => {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('school_calendar_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Academic',
    time: '09:00 AM - 12:00 PM',
    location: 'Main Auditorium',
    organizer: localStorage.getItem('role') || 'Administration',
  });

  const saveEvents = (updatedEvents) => {
    setEvents(updatedEvents);
    localStorage.setItem('school_calendar_events', JSON.stringify(updatedEvents));
    broadcastDataChange('CALENDAR_EVENT_ADDED', { totalEvents: updatedEvents.length });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const categoryBadges = {
      Sports: 'bg-emerald-100 text-emerald-800',
      Meeting: 'bg-amber-100 text-amber-800',
      Exam: 'bg-rose-100 text-rose-800',
      Academic: 'bg-sky-100 text-sky-800',
      Workshop: 'bg-indigo-100 text-indigo-800',
      Holiday: 'bg-purple-100 text-purple-800',
    };

    const created = {
      ...newEvent,
      id: Date.now(),
      badge: categoryBadges[newEvent.category] || 'bg-sky-100 text-sky-800',
    };

    saveEvents([created, ...events]);
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Academic',
      time: '09:00 AM - 12:00 PM',
      location: 'Main Auditorium',
      organizer: localStorage.getItem('role') || 'Administration',
    });
  };

  const handleDeleteEvent = (id) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  const filteredEvents = events.filter((e) => selectedCategory === 'All' || e.category === selectedCategory);

  const categories = ['All', 'Academic', 'Exam', 'Meeting', 'Sports', 'Workshop', 'Holiday'];

  return (
    <div className="space-y-6 p-6 bg-[#FAF6F0] min-h-screen font-sans text-slate-800">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-2">
            <Calendar className="h-3.5 w-3.5 text-sky-200" /> Institution Academic Calendar
          </div>
          <h1 className="text-2xl font-black text-white">School Calendar & Event Schedule</h1>
          <p className="text-xs font-semibold text-sky-100">
            Comprehensive schedule of academic terms, exams, holidays, staff workshops, and sports meets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-extrabold text-[#0C4A86] shadow-sm hover:bg-sky-50 transition self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Calendar Event
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-[#BFDBFE] shadow-xs">
        <span className="text-xs font-extrabold text-[#0C4A86] px-2">Filter Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-[#0C4A86] text-white shadow-xs'
                : 'bg-[#EBF5FF] text-[#0C4A86] hover:bg-sky-100 border border-[#BFDBFE]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="rounded-3xl border border-[#BFDBFE] bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${evt.badge}`}>
                  {evt.category}
                </span>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                  title="Delete Event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-base font-black text-[#0C4A86] leading-snug">{evt.title}</h3>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2 text-[#0C4A86] font-bold">
                <Calendar className="h-4 w-4 text-[#0096DA]" />
                <span>{evt.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{evt.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#BFDBFE] space-y-4">
            <h2 className="text-lg font-black text-[#0C4A86]">Schedule New School Event</h2>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0C4A86]">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Annual Cultural Fest 2026"
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0C4A86]">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0C4A86]">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0C4A86]">Time</label>
                <input
                  type="text"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="e.g. 10:00 AM - 02:00 PM"
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#0C4A86]">Location / Venue</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="e.g. Main Auditorium"
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-bold text-[#0C4A86] focus:border-[#0096DA] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] px-5 py-2 font-bold text-white shadow-sm hover:opacity-90"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolCalendarManagement;
