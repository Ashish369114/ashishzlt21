import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Download, Printer } from 'lucide-react';

const StudentTimetable = () => {
  const [viewMode, setViewMode] = useState('weekly'); // 'today' or 'weekly'

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetableData = {
    Monday: [
      { period: '1', time: '08:30 AM - 09:15 AM', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 201' },
      { period: '2', time: '09:15 AM - 10:00 AM', subject: 'Physics', teacher: 'Dr. Anitha', room: 'Physics Lab' },
      { period: '3', time: '10:15 AM - 11:00 AM', subject: 'English Literature', teacher: 'Ms. Elizabeth', room: 'Room 201' },
      { period: '4', time: '11:00 AM - 11:45 AM', subject: 'Chemistry', teacher: 'Mr. Kapoor', room: 'Chemistry Lab' },
      { period: 'Lunch', time: '11:45 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
      { period: '5', time: '12:30 PM - 01:15 PM', subject: 'Computer Science', teacher: 'Mr. Rajesh', room: 'Computer Lab' },
      { period: '6', time: '01:15 PM - 02:00 PM', subject: 'Social Studies', teacher: 'Mrs. Verma', room: 'Room 201' },
    ],
    Tuesday: [
      { period: '1', time: '08:30 AM - 09:15 AM', subject: 'Physics', teacher: 'Dr. Anitha', room: 'Physics Lab' },
      { period: '2', time: '09:15 AM - 10:00 AM', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 201' },
      { period: '3', time: '10:15 AM - 11:00 AM', subject: 'Biology', teacher: 'Dr. Mehta', room: 'Bio Lab' },
      { period: '4', time: '11:00 AM - 11:45 AM', subject: 'English', teacher: 'Ms. Elizabeth', room: 'Room 201' },
      { period: 'Lunch', time: '11:45 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
      { period: '5', time: '12:30 PM - 01:15 PM', subject: 'Physical Education', teacher: 'Coach Singh', room: 'Sports Ground' },
      { period: '6', time: '01:15 PM - 02:00 PM', subject: 'Chemistry', teacher: 'Mr. Kapoor', room: 'Room 201' },
    ],
    Wednesday: [
      { period: '1', time: '08:30 AM - 09:15 AM', subject: 'English Language', teacher: 'Ms. Elizabeth', room: 'Room 201' },
      { period: '2', time: '09:15 AM - 10:00 AM', subject: 'Social Studies', teacher: 'Mrs. Verma', room: 'Room 201' },
      { period: '3', time: '10:15 AM - 11:00 AM', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 201' },
      { period: '4', time: '11:00 AM - 11:45 AM', subject: 'Computer Science', teacher: 'Mr. Rajesh', room: 'Computer Lab' },
      { period: 'Lunch', time: '11:45 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
      { period: '5', time: '12:30 PM - 01:15 PM', subject: 'Physics', teacher: 'Dr. Anitha', room: 'Physics Lab' },
      { period: '6', time: '01:15 PM - 02:00 PM', subject: 'Art & Craft', teacher: 'Mrs. D Souza', room: 'Art Studio' },
    ],
    Thursday: [
      { period: '1', time: '08:30 AM - 09:15 AM', subject: 'Chemistry', teacher: 'Mr. Kapoor', room: 'Chemistry Lab' },
      { period: '2', time: '09:15 AM - 10:00 AM', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 201' },
      { period: '3', time: '10:15 AM - 11:00 AM', subject: 'Physics', teacher: 'Dr. Anitha', room: 'Room 201' },
      { period: '4', time: '11:00 AM - 11:45 AM', subject: 'Biology', teacher: 'Dr. Mehta', room: 'Bio Lab' },
      { period: 'Lunch', time: '11:45 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
      { period: '5', time: '12:30 PM - 01:15 PM', subject: 'Social Studies', teacher: 'Mrs. Verma', room: 'Room 201' },
      { period: '6', time: '01:15 PM - 02:00 PM', subject: 'English', teacher: 'Ms. Elizabeth', room: 'Room 201' },
    ],
    Friday: [
      { period: '1', time: '08:30 AM - 09:15 AM', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'Room 201' },
      { period: '2', time: '09:15 AM - 10:00 AM', subject: 'Computer Science', teacher: 'Mr. Rajesh', room: 'Computer Lab' },
      { period: '3', time: '10:15 AM - 11:00 AM', subject: 'English', teacher: 'Ms. Elizabeth', room: 'Room 201' },
      { period: '4', time: '11:00 AM - 11:45 AM', subject: 'Social Studies', teacher: 'Mrs. Verma', room: 'Room 201' },
      { period: 'Lunch', time: '11:45 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
      { period: '5', time: '12:30 PM - 01:15 PM', subject: 'Library Hour', teacher: 'Mrs. Rao', room: 'Library' },
      { period: '6', time: '01:15 PM - 02:00 PM', subject: 'Club Activity', teacher: 'Various', room: 'Auditorium' },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <Calendar className="h-3.5 w-3.5" /> Class Schedule
          </div>
          <h1 className="text-2xl font-bold">Class Timetable</h1>
          <p className="text-purple-100 text-sm">Weekly period distribution, subject teachers & room locations.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-white/10 p-1 backdrop-blur-md border border-white/20 flex gap-1">
            <button
              onClick={() => setViewMode('today')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewMode === 'today' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewMode === 'weekly' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              Weekly Schedule
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="rounded-2xl bg-white/20 hover:bg-white/30 p-3 text-white backdrop-blur-md border border-white/30 transition-all"
            title="Print Timetable"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timetable View */}
      {viewMode === 'today' ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" /> Today's Class Schedule (Monday)
            </h3>
            <span className="rounded-full bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 text-xs">
              7 Periods
            </span>
          </div>

          <div className="space-y-3">
            {timetableData.Monday.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border transition-all ${
                  item.period === 'Lunch'
                    ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`h-10 w-10 flex items-center justify-center rounded-xl font-extrabold text-sm ${
                    item.period === 'Lunch' ? 'bg-amber-200 text-amber-900' : 'bg-indigo-600 text-white'
                  }`}>
                    {item.period === 'Lunch' ? '🍱' : item.period}
                  </span>
                  <div>
                    <h4 className="font-bold text-base">{item.subject}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <Clock className="h-3.5 w-3.5" /> {item.time}
                    </p>
                  </div>
                </div>

                {item.period !== 'Lunch' && (
                  <div className="flex items-center gap-6 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {item.teacher}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium rounded-full bg-white px-3 py-1 border border-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" /> {item.room}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Weekly Grid View */
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 font-bold rounded-tl-3xl">Day / Period</th>
                <th className="p-4 font-bold">P1 (08:30)</th>
                <th className="p-4 font-bold">P2 (09:15)</th>
                <th className="p-4 font-bold">P3 (10:15)</th>
                <th className="p-4 font-bold">P4 (11:00)</th>
                <th className="p-4 font-bold bg-amber-900/40 text-amber-200">Lunch</th>
                <th className="p-4 font-bold">P5 (12:30)</th>
                <th className="p-4 font-bold rounded-tr-3xl">P6 (01:15)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50 border-r border-slate-100">{day}</td>
                  {timetableData[day].map((slot, idx) => (
                    <td
                      key={idx}
                      className={`p-3 text-xs border-r border-slate-100 ${
                        slot.period === 'Lunch' ? 'bg-amber-50/40 text-amber-900 font-semibold text-center' : ''
                      }`}
                    >
                      <div className="font-bold text-slate-800">{slot.subject}</div>
                      {slot.period !== 'Lunch' && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {slot.teacher} • <span className="text-indigo-600 font-semibold">{slot.room}</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
