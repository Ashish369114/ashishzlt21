import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

const defaultWeeklyData = [
  { time: '08:30 AM - 09:15 AM', monday: 'Grade 9A • Maths', tuesday: 'Grade 10B • Maths', wednesday: 'Grade 9A • Maths', thursday: 'Grade 10B • Maths', friday: 'Grade 9A • Maths', saturday: 'Lab Session' },
  { time: '09:15 AM - 10:00 AM', monday: 'Grade 10A • Algebra', tuesday: 'Grade 9B • Geometry', wednesday: 'Grade 10A • Algebra', thursday: 'Grade 9B • Geometry', friday: 'Grade 10A • Algebra', saturday: 'Staff Sync' },
  { time: '10:15 AM - 11:00 AM', monday: 'Grade 8C • Maths', tuesday: 'Grade 8C • Maths', wednesday: 'Free Period', thursday: 'Grade 8C • Maths', friday: 'Free Period', saturday: 'Remedial Class' },
  { time: '11:00 AM - 11:45 AM', monday: 'Grade 9B • Geometry', tuesday: 'Grade 10A • Algebra', wednesday: 'Grade 9B • Geometry', thursday: 'Grade 10A • Algebra', friday: 'Grade 9B • Geometry', saturday: 'Activity Hour' },
  { time: '12:30 PM - 01:15 PM', monday: 'Grade 10B • Advanced', tuesday: 'Grade 9A • Revision', wednesday: 'Grade 10B • Advanced', thursday: 'Grade 9A • Revision', friday: 'Grade 10B • Advanced', saturday: 'Club Meeting' },
];

const todayScheduleData = [
  { period: 'Period 1', time: '08:30 AM - 09:15 AM', subject: 'Mathematics', classSection: 'Grade 9 - Section A', room: 'Room 204', status: 'Completed' },
  { period: 'Period 2', time: '09:15 AM - 10:00 AM', subject: 'Algebra & Functions', classSection: 'Grade 10 - Section B', room: 'Room 302', status: 'Ongoing' },
  { period: 'Period 3', time: '10:15 AM - 11:00 AM', subject: 'Geometry Basics', classSection: 'Grade 8 - Section C', room: 'Room 105', status: 'Upcoming' },
  { period: 'Period 4', time: '11:00 AM - 11:45 AM', subject: 'Applied Mathematics', classSection: 'Grade 9 - Section B', room: 'Room 204', status: 'Upcoming' },
  { period: 'Period 5', time: '12:30 PM - 01:15 PM', subject: 'Advanced Calculus', classSection: 'Grade 10 - Section A', room: 'Lab 2', status: 'Upcoming' },
];

const TeacherTimetable = ({ timetable = [], currentTime = new Date() }) => {
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'weekly'

  return (
    <div className="rounded-2xl border border-[#BFDBFE] bg-white p-5.5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#BFDBFE] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0C4A86]">Class Timetable</h3>
            <p className="text-xs font-semibold text-[#736B63]">
              {viewMode === 'today' ? "Today's Schedule & Period Status" : "Complete Weekly Schedule (Mon - Sat)"}
            </p>
          </div>
        </div>

        {/* Dropdown Selector for Today vs Weekly Timetable */}
        <div className="relative inline-block">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="appearance-none rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] py-2 pl-3.5 pr-8 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="today">📅 Today's Timetable</option>
            <option value="weekly">🗓️ Weekly Timetable</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-[#736B63]" />
        </div>
      </div>

      <div className="mt-4">
        {viewMode === 'today' ? (
          /* Today's Timetable View */
          <div className="space-y-3">
            {todayScheduleData.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  item.status === 'Ongoing'
                    ? 'border-amber-300 bg-amber-50/50 shadow-2xs'
                    : 'border-[#BFDBFE] bg-[#EBF5FF] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    item.status === 'Ongoing' ? 'bg-amber-600 text-white' : 'bg-[#EFEAE4] text-[#334155]'
                  }`}>
                    {item.period}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0C4A86]">{item.subject}</p>
                    <p className="text-xs font-semibold text-[#736B63]">{item.classSection} • <span className="text-[#0C4A86]">{item.room}</span></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.status === 'Ongoing'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Completed'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                  <p className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-[#736B63]">
                    <Clock className="h-3 w-3" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Weekly Timetable View */
          <div className="overflow-x-auto rounded-xl border border-[#BFDBFE]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#EBF5FF] text-[#334155] uppercase font-extrabold border-b border-[#BFDBFE]">
                  <th className="p-3">Time</th>
                  <th className="p-3">Monday</th>
                  <th className="p-3">Tuesday</th>
                  <th className="p-3">Wednesday</th>
                  <th className="p-3">Thursday</th>
                  <th className="p-3">Friday</th>
                  <th className="p-3">Saturday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFDBFE] font-medium text-[#0C4A86]">
                {defaultWeeklyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#EBF5FF]">
                    <td className="p-3 font-bold text-[#736B63] whitespace-nowrap bg-[#EBF5FF]/50">{row.time}</td>
                    <td className="p-3">{row.monday}</td>
                    <td className="p-3">{row.tuesday}</td>
                    <td className="p-3">{row.wednesday}</td>
                    <td className="p-3">{row.thursday}</td>
                    <td className="p-3">{row.friday}</td>
                    <td className="p-3">{row.saturday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTimetable;
