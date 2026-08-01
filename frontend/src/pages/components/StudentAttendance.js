import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';
import { CheckCircle2, XCircle, Calendar, AlertCircle, Filter, Clock, ChevronLeft, ChevronRight, Sparkles, Sun } from 'lucide-react';

const sampleAttendanceRecords = [
  // July 2026
  { date: '2026-07-01', status: 'Present' },
  { date: '2026-07-02', status: 'Present' },
  { date: '2026-07-03', status: 'Present' },
  { date: '2026-07-04', status: 'Weekend' },
  { date: '2026-07-05', status: 'Weekend' },
  { date: '2026-07-06', status: 'Present' },
  { date: '2026-07-07', status: 'Present' },
  { date: '2026-07-08', status: 'Present' },
  { date: '2026-07-09', status: 'Present' },
  { date: '2026-07-10', status: 'Absent' },
  { date: '2026-07-11', status: 'Weekend' },
  { date: '2026-07-12', status: 'Weekend' },
  { date: '2026-07-13', status: 'Present' },
  { date: '2026-07-14', status: 'Present' },
  { date: '2026-07-15', status: 'Holiday', remark: 'School Founders Day' },
  { date: '2026-07-16', status: 'Present' },
  { date: '2026-07-17', status: 'Present' },
  { date: '2026-07-18', status: 'Weekend' },
  { date: '2026-07-19', status: 'Weekend' },
  { date: '2026-07-20', status: 'Present' },
  { date: '2026-07-21', status: 'Present' },
  { date: '2026-07-22', status: 'Absent' },
  { date: '2026-07-23', status: 'Present' },
  { date: '2026-07-24', status: 'Present' },
  { date: '2026-07-25', status: 'Weekend' },
  { date: '2026-07-26', status: 'Weekend' },
  { date: '2026-07-27', status: 'Present' },
  { date: '2026-07-28', status: 'Present' },
  { date: '2026-07-29', status: 'Present' },
  { date: '2026-07-30', status: 'Present' },
  { date: '2026-07-31', status: 'Present' },

  // June 2026
  { date: '2026-06-01', status: 'Present' },
  { date: '2026-06-02', status: 'Present' },
  { date: '2026-06-03', status: 'Present' },
  { date: '2026-06-04', status: 'Present' },
  { date: '2026-06-05', status: 'Present' },
  { date: '2026-06-06', status: 'Weekend' },
  { date: '2026-06-07', status: 'Weekend' },
  { date: '2026-06-08', status: 'Present' },
  { date: '2026-06-09', status: 'Present' },
  { date: '2026-06-10', status: 'Absent' },
  { date: '2026-06-11', status: 'Present' },
  { date: '2026-06-12', status: 'Present' },
  { date: '2026-06-13', status: 'Weekend' },
  { date: '2026-06-14', status: 'Weekend' },
  { date: '2026-06-15', status: 'Present' },
  { date: '2026-06-16', status: 'Present' },
  { date: '2026-06-17', status: 'Holiday', remark: 'Mid-Year Festival' },
  { date: '2026-06-18', status: 'Present' },
  { date: '2026-06-19', status: 'Present' },
  { date: '2026-06-20', status: 'Weekend' },
  { date: '2026-06-21', status: 'Weekend' },
  { date: '2026-06-22', status: 'Present' },
  { date: '2026-06-23', status: 'Present' },
  { date: '2026-06-24', status: 'Present' },
  { date: '2026-06-25', status: 'Present' },
  { date: '2026-06-26', status: 'Present' },
  { date: '2026-06-27', status: 'Weekend' },
  { date: '2026-06-28', status: 'Weekend' },
  { date: '2026-06-29', status: 'Present' },
  { date: '2026-06-30', status: 'Present' },
];

const StudentAttendance = ({ userId }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View state: viewMode = 'monthly' | 'weekly'
  const [viewMode, setViewMode] = useState('monthly');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed: 6 = July
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // 0 to 4

  useEffect(() => {
    const loadAttendance = async () => {
      if (!userId) {
        setAttendanceRecords(sampleAttendanceRecords);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await attendanceService.getByStudent(userId);
        const records = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.attendance)
          ? response.data.attendance
          : [];
        
        if (records.length > 0) {
          const formatted = records.map((r) => ({
            date: typeof r.date === 'string' ? r.date.substring(0, 10) : new Date(r.date).toISOString().substring(0, 10),
            status: r.status || 'Present',
            remark: r.remark || ''
          }));
          setAttendanceRecords(formatted);
        } else {
          setAttendanceRecords(sampleAttendanceRecords);
        }
        setError('');
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setAttendanceRecords(sampleAttendanceRecords);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [userId]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper to get status for a specific YYYY-MM-DD
  const getDayAttendance = (dateStr) => {
    const found = attendanceRecords.find((r) => r.date === dateStr);
    if (found) return found;

    // Check weekend
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { date: dateStr, status: 'Weekend' };
    }

    return { date: dateStr, status: 'Present' };
  };

  // Generate calendar days for current month
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...

    const days = [];
    // Padding from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Days of current month
    for (let d = 1; d <= numDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push(getDayAttendance(dateStr));
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  // Group days into weeks for Weekly View
  const getWeeksInMonth = () => {
    const validDays = calendarDays.filter((d) => d !== null);
    const weeks = [];
    let currentWeek = [];
    
    validDays.forEach((dayObj, index) => {
      currentWeek.push(dayObj);
      const d = new Date(dayObj.date + 'T00:00:00');
      if (d.getDay() === 6 || index === validDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  };

  const weeksList = getWeeksInMonth();
  const currentWeekDays = weeksList[selectedWeekIndex] || weeksList[0] || [];

  // Filter records for summary stats based on current view range (Selected Month or Selected Week)
  const activeStatsDays = viewMode === 'monthly'
    ? calendarDays.filter((d) => d !== null)
    : currentWeekDays;

  // Dynamic Metrics Calculation
  const totalDays = activeStatsDays.length;
  const weekendDaysCount = activeStatsDays.filter((d) => d.status === 'Weekend').length;
  const holidayDaysCount = activeStatsDays.filter((d) => d.status === 'Holiday').length;
  
  // Total Working Days = Total Days - Weekends - Holidays
  const totalWorkingDays = Math.max(0, totalDays - weekendDaysCount - holidayDaysCount);
  const presentDaysCount = activeStatsDays.filter((d) => d.status === 'Present').length;
  const absentDaysCount = activeStatsDays.filter((d) => d.status === 'Absent').length;
  
  const attendancePercentage = totalWorkingDays > 0
    ? ((presentDaysCount / totalWorkingDays) * 100).toFixed(1)
    : '0.0';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Present</span>;
      case 'Absent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">Absent</span>;
      case 'Holiday':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">Holiday</span>;
      case 'Weekend':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">Weekend</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Present</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <Calendar className="h-3.5 w-3.5" /> Attendance Portal
          </div>
          <h1 className="text-2xl font-bold">Attendance Summary & Overview</h1>
          <p className="text-sky-100 text-sm">Full calendar-style date-wise attendance view with monthly and weekly tracking.</p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 text-center">
          <p className="text-xs text-sky-100 uppercase font-bold">Attendance Rate</p>
          <p className="text-3xl font-black">{attendancePercentage}%</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" /> {error}
        </div>
      )}

      {/* View Toggle Bar & Navigation */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-4 w-4 text-[#0C4A86]" /> Attendance View:
          </span>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                viewMode === 'monthly' ? 'bg-[#0C4A86] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Attendance
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                viewMode === 'weekly' ? 'bg-[#0C4A86] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Attendance
            </button>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 transition"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-black text-[#0C4A86] min-w-36 text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 transition"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Synchronized with working days) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Working Days */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Working Days</p>
          <p className="text-3xl font-black text-slate-900">{totalWorkingDays} Days</p>
          <p className="text-xs font-semibold text-slate-500">Excludes weekends & holidays</p>
        </div>

        {/* Present Days */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Present Days</p>
          <p className="text-3xl font-black text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6" /> {presentDaysCount} Days
          </p>
          <p className="text-xs font-semibold text-emerald-600">Attended successfully</p>
        </div>

        {/* Absent Days */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Absent Days</p>
          <p className="text-3xl font-black text-rose-600 flex items-center gap-2">
            <XCircle className="h-6 w-6" /> {absentDaysCount} Days
          </p>
          <p className="text-xs font-semibold text-rose-600">Absences recorded</p>
        </div>

        {/* Attendance Percentage */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</p>
          <p className="text-3xl font-black text-[#0C4A86]">{attendancePercentage}%</p>
          <p className="text-xs font-semibold text-[#0096DA]">Synchronized calculation</p>
        </div>
      </div>

      {/* Main View: Monthly Full Calendar vs Weekly Attendance */}
      {viewMode === 'monthly' ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0C4A86]" /> Monthly Attendance Calendar — {monthNames[currentMonth]} {currentYear}
            </h3>

            {/* Legend */}
            <div className="hidden md:flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Present</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Absent</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span> Holiday</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Weekend</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
              <div key={dayName} className="text-center text-xs font-black uppercase text-slate-500 py-2 bg-slate-50 rounded-xl">
                {dayName}
              </div>
            ))}

            {calendarDays.map((dayObj, index) => {
              if (!dayObj) {
                return <div key={`empty-${index}`} className="h-24 rounded-2xl bg-slate-50/50 border border-transparent"></div>;
              }

              const dayNum = parseInt(dayObj.date.split('-')[2], 10);
              const isWeekend = dayObj.status === 'Weekend';
              const isPresent = dayObj.status === 'Present';
              const isAbsent = dayObj.status === 'Absent';
              const isHoliday = dayObj.status === 'Holiday';

              return (
                <div
                  key={dayObj.date}
                  className={`h-24 rounded-2xl p-2 border flex flex-col justify-between transition-all ${
                    isPresent
                      ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400'
                      : isAbsent
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                      : isHoliday
                      ? 'bg-purple-50/70 border-purple-200 hover:border-purple-400'
                      : 'bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black rounded-lg h-6 w-6 flex items-center justify-center ${
                      isPresent ? 'bg-emerald-600 text-white' : isAbsent ? 'bg-rose-600 text-white' : isHoliday ? 'bg-purple-600 text-white' : 'bg-slate-400 text-white'
                    }`}>
                      {dayNum}
                    </span>

                    {getStatusBadge(dayObj.status)}
                  </div>

                  <div className="mt-1">
                    {dayObj.remark && (
                      <p className="text-[10px] font-bold text-purple-900 truncate" title={dayObj.remark}>
                        🎉 {dayObj.remark}
                      </p>
                    )}
                    {isPresent && <p className="text-[10px] font-semibold text-emerald-800">Full Day Present</p>}
                    {isAbsent && <p className="text-[10px] font-bold text-rose-800">Leave / Absent</p>}
                    {isWeekend && <p className="text-[10px] font-semibold text-slate-500">Off Day</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly Attendance View matching weekly schedule layout */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#0C4A86]" /> Weekly Attendance Schedule — {monthNames[currentMonth]} {currentYear}
            </h3>

            {/* Week selector buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {weeksList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedWeekIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition ${
                    selectedWeekIndex === idx ? 'bg-[#0C4A86] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Week {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {currentWeekDays.map((dayObj) => {
              const d = new Date(dayObj.date + 'T00:00:00');
              const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
              const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={dayObj.date}
                  className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border transition-all ${
                    dayObj.status === 'Present'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : dayObj.status === 'Absent'
                      ? 'bg-rose-50/60 border-rose-200'
                      : dayObj.status === 'Holiday'
                      ? 'bg-purple-50/60 border-purple-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black text-sm ${
                      dayObj.status === 'Present'
                        ? 'bg-emerald-600'
                        : dayObj.status === 'Absent'
                        ? 'bg-rose-600'
                        : dayObj.status === 'Holiday'
                        ? 'bg-purple-600'
                        : 'bg-slate-400'
                    }`}>
                      {d.getDate()}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{dayName}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{dateFormatted}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {dayObj.remark && (
                      <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                        {dayObj.remark}
                      </span>
                    )}

                    {getStatusBadge(dayObj.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
