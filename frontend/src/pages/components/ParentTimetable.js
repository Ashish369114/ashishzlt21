import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, BookOpen, MapPin, User, CheckCircle2, ChevronLeft, ChevronRight, Sun } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Grade 5 Section A Timetable Schedule
const grade5Timetable = [
  { time: '08:30 AM - 09:15 AM', period: 'Period 1', monday: { subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 5A' }, tuesday: { subject: 'Science', teacher: 'Sunita Verma', room: 'Science Lab 1' }, wednesday: { subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 5A' }, thursday: { subject: 'English', teacher: 'Ananya Roy', room: 'Room 5A' }, friday: { subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 5A' }, saturday: { subject: 'Computer Science', teacher: 'K. Rajesh', room: 'Computer Lab' } },
  { time: '09:15 AM - 10:00 AM', period: 'Period 2', monday: { subject: 'English', teacher: 'Ananya Roy', room: 'Room 5A' }, tuesday: { subject: 'Social Studies', teacher: 'Vikram Joshi', room: 'Room 5A' }, wednesday: { subject: 'Science', teacher: 'Sunita Verma', room: 'Room 5A' }, thursday: { subject: 'Telugu', teacher: 'P. Subbarao', room: 'Room 5A' }, friday: { subject: 'English', teacher: 'Ananya Roy', room: 'Room 5A' }, saturday: { subject: 'Sports & PE', teacher: 'Coach Arjun', room: 'Sports Ground' } },
  { time: '10:00 AM - 10:15 AM', period: 'Interval Break', isBreak: true, isInterval: true, monday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, tuesday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, wednesday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, thursday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, friday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, saturday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' } },
  { time: '10:15 AM - 11:00 AM', period: 'Period 3', monday: { subject: 'Science', teacher: 'Sunita Verma', room: 'Science Lab 1' }, tuesday: { subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 5A' }, wednesday: { subject: 'English', teacher: 'Ananya Roy', room: 'Room 5A' }, thursday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 5A' }, friday: { subject: 'Social Studies', teacher: 'Vikram Joshi', room: 'Room 5A' }, saturday: { subject: 'Art & Craft', teacher: 'S. Kulkarni', room: 'Art Studio' } },
  { time: '11:00 AM - 11:45 AM', period: 'Period 4', monday: { subject: 'Social Studies', teacher: 'Vikram Joshi', room: 'Room 5A' }, tuesday: { subject: 'Telugu', teacher: 'P. Subbarao', room: 'Room 5A' }, wednesday: { subject: 'Social Studies', teacher: 'Vikram Joshi', room: 'Room 5A' }, thursday: { subject: 'Mathematics', teacher: 'Ramesh Sharma', room: 'Room 5A' }, friday: { subject: 'Telugu', teacher: 'P. Subbarao', room: 'Room 5A' }, saturday: { subject: 'Library Hour', teacher: 'Librarian', room: 'Central Library' } },
  { time: '11:45 AM - 12:30 PM', period: 'Lunch Break', isBreak: true, isInterval: false, monday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, tuesday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, wednesday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, thursday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, friday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, saturday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' } },
  { time: '12:30 PM - 01:15 PM', period: 'Period 5', monday: { subject: 'Telugu', teacher: 'P. Subbarao', room: 'Room 5A' }, tuesday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 5A' }, wednesday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 5A' }, thursday: { subject: 'Science Lab', teacher: 'Sunita Verma', room: 'Science Lab 2' }, friday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 5A' }, saturday: { subject: 'Value Education', teacher: 'Principal', room: 'Auditorium' } },
  { time: '01:15 PM - 02:00 PM', period: 'Period 6', monday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 5A' }, tuesday: { subject: 'Art & Music', teacher: 'S. Kulkarni', room: 'Music Room' }, wednesday: { subject: 'Computer Lab', teacher: 'K. Rajesh', room: 'Computer Lab' }, thursday: { subject: 'Sports', teacher: 'Coach Arjun', room: 'Ground' }, friday: { subject: 'Moral Science', teacher: 'Ananya Roy', room: 'Room 5A' }, saturday: { subject: 'Club Activity', teacher: 'Activity In-charge', room: 'Campus' } }
];

// Grade 8 Section B Timetable Schedule
const grade8Timetable = [
  { time: '08:30 AM - 09:15 AM', period: 'Period 1', monday: { subject: 'Physics', teacher: 'Sunita Verma', room: 'Physics Lab' }, tuesday: { subject: 'Algebra', teacher: 'Ramesh Sharma', room: 'Room 8B' }, wednesday: { subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Chem Lab' }, thursday: { subject: 'Physics', teacher: 'Sunita Verma', room: 'Room 8B' }, friday: { subject: 'Algebra', teacher: 'Ramesh Sharma', room: 'Room 8B' }, saturday: { subject: 'Coding & AI', teacher: 'K. Rajesh', room: 'Computer Lab' } },
  { time: '09:15 AM - 10:00 AM', period: 'Period 2', monday: { subject: 'English Lit', teacher: 'Ananya Roy', room: 'Room 8B' }, tuesday: { subject: 'Biology', teacher: 'Dr. Gupta', room: 'Bio Lab' }, wednesday: { subject: 'English Lit', teacher: 'Ananya Roy', room: 'Room 8B' }, thursday: { subject: 'Biology', teacher: 'Dr. Gupta', room: 'Room 8B' }, friday: { subject: 'English Lit', teacher: 'Ananya Roy', room: 'Room 8B' }, saturday: { subject: 'Basketball', teacher: 'Coach Arjun', room: 'Sports Complex' } },
  { time: '10:00 AM - 10:15 AM', period: 'Interval Break', isBreak: true, isInterval: true, monday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, tuesday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, wednesday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, thursday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, friday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' }, saturday: { subject: '☕ Interval / Recess', teacher: 'School Courtyard / Break', room: 'Campus' } },
  { time: '10:15 AM - 11:00 AM', period: 'Period 3', monday: { subject: 'History', teacher: 'Vikram Joshi', room: 'Room 8B' }, tuesday: { subject: 'Civics', teacher: 'Vikram Joshi', room: 'Room 8B' }, wednesday: { subject: 'Geography', teacher: 'Vikram Joshi', room: 'Room 8B' }, thursday: { subject: 'History', teacher: 'Vikram Joshi', room: 'Room 8B' }, friday: { subject: 'Civics', teacher: 'Vikram Joshi', room: 'Room 8B' }, saturday: { subject: 'Robotics Workshop', teacher: 'K. Rajesh', room: 'STEM Lab' } },
  { time: '11:00 AM - 11:45 AM', period: 'Period 4', monday: { subject: 'Advanced Math', teacher: 'Ramesh Sharma', room: 'Room 8B' }, tuesday: { subject: 'Hindi Lit', teacher: 'Meena Sharma', room: 'Room 8B' }, wednesday: { subject: 'Telugu Lit', teacher: 'P. Subbarao', room: 'Room 8B' }, thursday: { subject: 'Advanced Math', teacher: 'Ramesh Sharma', room: 'Room 8B' }, friday: { subject: 'Telugu Lit', teacher: 'P. Subbarao', room: 'Room 8B' }, saturday: { subject: 'General Knowledge', teacher: 'Ananya Roy', room: 'Room 8B' } },
  { time: '11:45 AM - 12:30 PM', period: 'Lunch Break', isBreak: true, isInterval: false, monday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, tuesday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, wednesday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, thursday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, friday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' }, saturday: { subject: '🍱 Lunch Break', teacher: 'School Cafeteria / Rest', room: 'Dining Hall' } },
  { time: '12:30 PM - 01:15 PM', period: 'Period 5', monday: { subject: 'Telugu', teacher: 'P. Subbarao', room: 'Room 8B' }, tuesday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 8B' }, wednesday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 8B' }, thursday: { subject: 'Science Lab', teacher: 'Sunita Verma', room: 'Science Lab 2' }, friday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 8B' }, saturday: { subject: 'Value Education', teacher: 'Principal', room: 'Auditorium' } },
  { time: '01:15 PM - 02:00 PM', period: 'Period 6', monday: { subject: 'Hindi', teacher: 'Meena Sharma', room: 'Room 8B' }, tuesday: { subject: 'Art & Music', teacher: 'S. Kulkarni', room: 'Music Room' }, wednesday: { subject: 'Computer Lab', teacher: 'K. Rajesh', room: 'Computer Lab' }, thursday: { subject: 'Sports', teacher: 'Coach Arjun', room: 'Ground' }, friday: { subject: 'Moral Science', teacher: 'Ananya Roy', room: 'Room 8B' }, saturday: { subject: 'Club Activity', teacher: 'Activity In-charge', room: 'Campus' } }
];

const getCurrentDayName = () => {
  const dayIndex = new Date().getDay();
  // 0 is Sunday, 1 is Monday...
  if (dayIndex === 0 || dayIndex === 7) return 'Monday';
  return daysOfWeek[dayIndex - 1] || 'Monday';
};

const ParentTimetable = ({ selectedStudentId, student }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [selectedDay, setSelectedDay] = useState(getCurrentDayName());

  const studentGrade = student?.grade || '5';
  const studentSection = student?.section || 'A';
  const studentName = student?.userId?.firstName
    ? `${student.userId.firstName} ${student.userId.lastName || ''}`.trim()
    : (student?.name || 'Child');

  const timetableData = String(studentGrade) === '8' ? grade8Timetable : grade5Timetable;

  const currentDayKey = selectedDay.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black text-white hover:bg-white hover:text-[#0C4A86] transition-all"
            >
              ← Back
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              Class Schedule
            </span>
          </div>
          <h1 className="text-2xl font-black">{studentName}'s Class Timetable</h1>
          <p className="text-sky-100 text-xs font-medium">Daily period breakdown & weekly class schedule for Grade {studentGrade} - Sec {studentSection}.</p>
        </div>
      </div>

      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#0C4A86]">Schedule View:</span>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                viewMode === 'daily'
                  ? 'bg-[#0C4A86] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View (Current Day)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                viewMode === 'weekly'
                  ? 'bg-[#0C4A86] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly View (Complete)
            </button>
          </div>
        </div>

        {/* Day Selector Pills for Daily View */}
        {viewMode === 'daily' && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {day} {day === getCurrentDayName() && '(Today)'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Daily View Layout */}
      {viewMode === 'daily' ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-black text-[#0C4A86] flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" /> {selectedDay}'s Daily Schedule
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Period timetable for {studentName} (Grade {studentGrade} - Sec {studentSection})
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              Active Day: {selectedDay}
            </span>
          </div>

          <div className="space-y-3">
            {timetableData.map((row, idx) => {
              const periodInfo = row[currentDayKey];
              if (!periodInfo) return null;

              if (row.isBreak) {
                const isInt = row.isInterval;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isInt
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-amber-300 bg-amber-50 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white font-black text-xs shadow-2xs ${
                        isInt ? 'bg-sky-600' : 'bg-amber-500'
                      }`}>
                        {isInt ? 'Interval' : 'Lunch'}
                      </div>
                      <div>
                        <span className={`text-xs font-bold flex items-center gap-1 ${isInt ? 'text-sky-700' : 'text-amber-700'}`}>
                          <Clock className="h-3.5 w-3.5" /> {row.time}
                        </span>
                        <h4 className="text-base font-black">{periodInfo.subject}</h4>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold">
                      <span>{isInt ? 'Campus Courtyard • Recess Break' : 'Dining Hall • School Cafeteria / Break'}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C4A86] text-white font-black text-xs shadow-2xs shrink-0">
                      {row.period}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0096DA] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {row.time}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{periodInfo.subject}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-extrabold text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" /> Faculty: <strong className="text-slate-900">{periodInfo.teacher}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                      <MapPin className="h-4 w-4" /> {periodInfo.room}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly View Matrix Table (Req 6 - Perfectly Aligned Columns) */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-[#0C4A86]">
              Complete Weekly Timetable Matrix (Grade {studentGrade} - Sec {studentSection})
            </h3>
            <span className="text-xs font-bold text-slate-500">6 Days Schedule</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold text-center">
                  <th className="p-3.5 w-36 text-left bg-slate-200/60">Time Slot / Period</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Monday</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Tuesday</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Wednesday</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Thursday</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Friday</th>
                  <th className="p-3.5 w-32 border-l border-slate-200">Saturday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {timetableData.map((row, i) => {
                  if (row.isBreak) {
                    const isInt = row.isInterval;
                    return (
                      <tr key={i} className={`font-bold border-y ${isInt ? 'bg-sky-50/90 border-sky-300' : 'bg-amber-50/90 border-amber-300'}`}>
                        <td className={`p-3.5 font-black text-left border-r ${isInt ? 'text-sky-900 bg-sky-100/80 border-sky-200' : 'text-amber-900 bg-amber-100/80 border-amber-200'}`}>
                          <div className="font-extrabold text-xs">{isInt ? '☕ ' + row.period : '🍱 ' + row.period}</div>
                          <div className="text-[10px] font-bold whitespace-nowrap">{row.time}</div>
                        </td>
                        <td colSpan={6} className={`p-3.5 text-center font-black uppercase tracking-wider text-xs ${isInt ? 'text-sky-900 bg-sky-50' : 'text-amber-900 bg-amber-50'}`}>
                          {isInt ? '☕ Interval Break (10:00 AM - 10:15 AM) — School Courtyard & Rest' : '🍱 Lunch Break (11:45 AM - 12:30 PM) — School Cafeteria / Dining Hall'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={i} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-3.5 font-black text-[#0096DA] bg-slate-50 border-r border-slate-200 text-left">
                        <div className="text-xs font-black text-[#0C4A86]">{row.period}</div>
                        <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">{row.time}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-[#0C4A86]">{row.monday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.monday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.monday?.room}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-[#0C4A86]">{row.tuesday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.tuesday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.tuesday?.room}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-[#0C4A86]">{row.wednesday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.wednesday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.wednesday?.room}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-[#0C4A86]">{row.thursday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.thursday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.thursday?.room}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-[#0C4A86]">{row.friday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.friday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.friday?.room}</div>
                      </td>
                      <td className="p-3.5 border-l border-slate-100 text-left align-top">
                        <div className="font-extrabold text-emerald-700">{row.saturday?.subject}</div>
                        <div className="text-[10px] text-slate-500">{row.saturday?.teacher}</div>
                        <div className="text-[9px] text-purple-700 font-bold mt-0.5">{row.saturday?.room}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTimetable;
