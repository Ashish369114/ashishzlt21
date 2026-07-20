import React, { useMemo } from 'react';

const periodStatus = (startTime, endTime, now) => {
  const toDate = (timeStr) => {
    // expects 'HH:MM AM/PM' or 'HH:MM' 24h
    const parsed = new Date();
    const parts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!parts) return null;
    let hh = Number(parts[1]);
    const mm = Number(parts[2]);
    const ampm = parts[3];
    if (ampm) {
      if (/pm/i.test(ampm) && hh !== 12) hh += 12;
      if (/am/i.test(ampm) && hh === 12) hh = 0;
    }
    parsed.setHours(hh);
    parsed.setMinutes(mm);
    parsed.setSeconds(0);
    parsed.setMilliseconds(0);
    return parsed;
  };

  const s = toDate(startTime);
  const e = toDate(endTime);
  if (!s || !e) return 'unknown';
  if (now >= s && now <= e) return 'ongoing';
  if (now < s) return 'upcoming';
  return 'completed';
};

const TeacherTimetable = ({ timetable = [], currentTime = new Date() }) => {
  const rows = useMemo(() => timetable, [timetable]);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
        <p className="text-sm text-slate-500">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row, idx) => {
          // support row.time or row.start/end
          const timeLabel = row.time || `${row.start || ''} - ${row.end || ''}` || '—';
          const start = row.start || row.time?.split('-')?.[0] || row.time;
          const end = row.end || row.time?.split('-')?.[1] || '';
          const status = (start && end) ? periodStatus(start.trim(), end.trim(), currentTime) : 'upcoming';
          return (
            <div key={idx} className={`flex items-center justify-between rounded-xl p-3 ${status === 'ongoing' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <div>
                <p className="font-semibold text-slate-800">{row.subject || row.monday || row.title || 'Period'}</p>
                <p className="text-sm text-slate-500">{row.className || row.schedule || row.section || ''}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${status === 'ongoing' ? 'text-emerald-700' : 'text-slate-600'}`}>{status === 'ongoing' ? 'Ongoing' : status === 'upcoming' ? 'Upcoming' : 'Completed'}</p>
                <p className="text-xs text-slate-500">{timeLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherTimetable;
