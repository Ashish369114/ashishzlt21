import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin,
  X, Filter, Cake, User
} from 'lucide-react';
import { schoolDataService, assignedTeacherClasses } from '../../services/schoolDataStore';

const initialCalendarEvents = [
  {
    id: 1,
    title: 'Annual Mathematics Olympiad & Quiz Contest',
    date: '2026-08-05',
    time: '09:30 AM - 12:30 PM',
    category: 'Annual Day',
    color: 'bg-[#0C4A86] text-white',
    location: 'Main Auditorium',
    organizer: 'Academic Board',
    description: 'Inter-house speed quiz and problem solving competition for Grade 8 to 10.'
  },
  {
    id: 2,
    title: 'Parent-Teacher Meeting (PTM)',
    date: '2026-08-12',
    time: '10:00 AM - 01:00 PM',
    category: 'Parent-Teacher Meetings',
    color: 'bg-[#0096DA] text-white',
    location: 'School Classrooms',
    organizer: 'Principal Office',
    description: 'Quarterly academic progress discussion between teachers and parents.'
  },
  {
    id: 3,
    title: 'Inter-School Sports Meet & Track Championship',
    date: '2026-08-18',
    time: '08:00 AM - 04:00 PM',
    category: 'School Events',
    color: 'bg-emerald-600 text-white',
    location: 'Sports Grounds',
    organizer: 'Sports Department',
    description: 'Track and field events including 100m sprint, relay, long jump, and basketball.'
  },
  {
    id: 4,
    title: 'Mid-Term 1 Half-Yearly Mathematics Exam',
    date: '2026-08-25',
    time: '09:00 AM - 12:00 PM',
    category: 'Exams',
    color: 'bg-rose-600 text-white',
    location: 'Exam Halls 1-4',
    organizer: 'Examination Board',
    description: 'Mid-Term 1 Evaluation for Grade 9 & 10 students.'
  },
  {
    id: 5,
    title: 'Independence Day Holiday & Cultural Program',
    date: '2026-08-15',
    time: '08:30 AM - 11:30 AM',
    category: 'Holidays',
    color: 'bg-purple-600 text-white',
    location: 'Main Flag Ground',
    organizer: 'School Administration',
    description: 'Flag hoisting ceremony followed by patriotic songs and student performances.'
  }
];

const categoryColorMap = {
  'School Events': 'bg-emerald-600 text-white',
  'Annual Day': 'bg-[#0C4A86] text-white',
  'Holidays': 'bg-purple-600 text-white',
  'Exams': 'bg-rose-600 text-white',
  'Student Birthdays': 'bg-amber-500 text-white font-bold',
  'Parent-Teacher Meetings': 'bg-[#0096DA] text-white',
  'Other School Events': 'bg-slate-700 text-white',
};

const categoryFilterOptions = [
  'All',
  'School Events',
  'Annual Day',
  'Holidays',
  'Exams',
  'Student Birthdays',
  'Parent-Teacher Meetings',
  'Other School Events'
];

const InteractiveGoogleCalendar = ({
  hideCreateEvent = false,
  hideViewToggle = false,
  assignedClassesOnly = true,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [baseEvents, setBaseEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('google_calendar_events');
      return saved ? JSON.parse(saved) : initialCalendarEvents;
    } catch {
      return initialCalendarEvents;
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('google_calendar_events');
        if (saved) setBaseEvents(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('googleCalendarUpdated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('googleCalendarUpdated', handleSync);
    };
  }, []);

  // Compute birthday events grouped by date (Req 2, 3 & 15)
  // Inside calendar cells: Show ONLY "🎂 Birthday" (Do NOT show student names directly in calendar cells!)
  const birthdayMapByDate = {};
  const teacherClasses = assignedTeacherClasses;

  teacherClasses.forEach((cls) => {
    const students = schoolDataService.getStudentsForClass(cls.id);
    students.forEach((st) => {
      if (!st.dob) return;
      const parts = st.dob.split('-');
      if (parts.length === 3) {
        const m = parts[1];
        const d = parts[2];
        const currentYear = currentDate.getFullYear();
        const dateStr = `${currentYear}-${m}-${d}`;

        if (!birthdayMapByDate[dateStr]) {
          birthdayMapByDate[dateStr] = [];
        }
        birthdayMapByDate[dateStr].push({
          studentName: st.name,
          className: `${st.grade}${st.section}`,
          dateStr: dateStr,
          rawDob: st.dob
        });
      }
    });
  });

  // Convert birthday map to calendar events formatted strictly as "🎂 Birthday"
  const birthdayCalendarEvents = Object.keys(birthdayMapByDate).map((dateStr) => {
    const studentsList = birthdayMapByDate[dateStr];
    return {
      id: `bday_group_${dateStr}`,
      title: '🎂 Birthday', // Strictly "🎂 Birthday" per Req 2 & 15
      date: dateStr,
      time: 'All Day',
      category: 'Student Birthdays',
      color: 'bg-amber-500 text-white font-black',
      isBirthday: true,
      students: studentsList,
    };
  });

  const allCombinedEvents = [...baseEvents, ...birthdayCalendarEvents];

  // Date Navigation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Grid Calculation for Month View
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const daysArray = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const pMonth = month === 0 ? 11 : month - 1;
    const pYear = month === 0 ? year - 1 : year;
    const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ dayNumber: d, isCurrentMonth: false, dateStr });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push({ dayNumber: i, isCurrentMonth: true, dateStr });
  }

  const totalGridCells = Math.ceil(daysArray.length / 7) * 7;
  const nextPaddingCount = totalGridCells - daysArray.length;
  for (let i = 1; i <= nextPaddingCount; i++) {
    const nMonth = month === 11 ? 0 : month + 1;
    const nYear = month === 11 ? year + 1 : year;
    const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push({ dayNumber: i, isCurrentMonth: false, dateStr });
  }

  const todayStr = new Date().toISOString().substring(0, 10);

  const filteredEvents = allCombinedEvents.filter((ev) => {
    if (selectedCategory === 'All') return true;
    return ev.category === selectedCategory;
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0C4A86] text-white shadow-xs">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0C4A86] leading-tight">Calendar</h2>
            <p className="text-[11px] font-semibold text-slate-500">School Events & Student Birthday Schedule</p>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-[#0C4A86] hover:text-white transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-1 text-slate-600 hover:bg-slate-200 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-1 text-slate-600 hover:bg-slate-200 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-black text-slate-900 ml-1">
            {monthNames[month]} {year}
          </span>
        </div>
      </div>

      {/* Category Filter Dropdown (Req 2 & 15) */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <label className="font-extrabold text-[#0C4A86] flex items-center gap-1.5 whitespace-nowrap">
          <Filter className="h-3.5 w-3.5" /> Filter Category:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:border-[#0C4A86] focus:outline-none cursor-pointer shadow-2xs"
        >
          {categoryFilterOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly Calendar Matrix Grid */}
      <div className="space-y-2">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysArray.map((cell, idx) => {
            const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr);
            const isToday = cell.dateStr === todayStr;

            return (
              <div
                key={idx}
                className={`min-h-[85px] p-1.5 rounded-xl border transition-all flex flex-col justify-between ${
                  cell.isCurrentMonth
                    ? isToday
                      ? 'bg-[#EBF5FF] border-[#0C4A86] shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-[#0C4A86]'
                    : 'bg-slate-50/50 border-slate-100 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black h-5 w-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#0C4A86] text-white'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                </div>

                {/* Event Chips (Shows ONLY "🎂 Birthday" for birthdays - Req 2 & 15) */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`text-[9px] font-black truncate px-1.5 py-0.5 rounded-md shadow-2xs cursor-pointer hover:opacity-90 ${
                        evt.color || categoryColorMap[evt.category] || 'bg-[#0C4A86] text-white'
                      }`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Birthday Details & Event Details View Modal (Req 3 & 15) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${selectedEvent.color || 'bg-[#0C4A86] text-white'}`}>
                {selectedEvent.category}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Birthday Details View (Req 3 & 15) */}
            {selectedEvent.isBirthday ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cake className="h-6 w-6 text-amber-500" />
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Birthday Details</h2>
                    <p className="text-xs font-extrabold text-amber-600">
                      Date: {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs font-semibold text-slate-800">
                  <p className="font-extrabold text-amber-900 mb-1">
                    Student Birthdays ({selectedEvent.students?.length || 1}):
                  </p>
                  <ul className="space-y-2">
                    {selectedEvent.students?.map((st, i) => (
                      <li key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                        <div className="flex items-center gap-2 font-black text-slate-900">
                          <User className="h-4 w-4 text-[#0C4A86]" />
                          <span>{st.studentName}</span>
                        </div>
                        <span className="rounded-full bg-[#EBF5FF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                          Class {st.className}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              /* Regular Event Details View */
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 leading-snug">{selectedEvent.title}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedEvent.description}</p>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-700 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#0C4A86]" />
                    <span>Date: <strong className="text-slate-900">{selectedEvent.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0096DA]" />
                    <span>Time: <strong className="text-slate-900">{selectedEvent.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Location: <strong className="text-slate-900">{selectedEvent.location}</strong></span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-[#0C4A86] px-5 py-2 text-xs font-extrabold text-white hover:bg-black transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGoogleCalendar;
