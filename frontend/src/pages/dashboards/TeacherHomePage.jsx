import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Camera, PlusCircle } from 'lucide-react';
import useRealtimeUpdates from '../../hooks/useRealtimeUpdates';
import SectionCard from '../../components/dashboard/SectionCard';
import TeacherTimetable from '../../components/dashboard/TeacherTimetable';
import { teacherService } from '../../services/api';

const defaultTimetable = [
  { time: '8:30 AM - 9:15 AM', monday: 'Grade 9A • Maths', tuesday: 'Grade 10B • Maths', wednesday: 'Grade 9A • Maths', thursday: 'Grade 10B • Maths', friday: 'Grade 9A • Maths', saturday: 'Lab Session' },
  { time: '9:15 AM - 10:00 AM', monday: 'Grade 10A • Algebra', tuesday: 'Grade 9B • Geometry', wednesday: 'Grade 10A • Algebra', thursday: 'Grade 9B • Geometry', friday: 'Grade 10A • Algebra', saturday: 'Staff Sync' },
  { time: '10:15 AM - 11:00 AM', monday: 'Grade 8C • Maths', tuesday: 'Grade 8C • Maths', wednesday: 'Free Period', thursday: 'Grade 8C • Maths', friday: 'Free Period', saturday: 'Remedial Class' },
  { time: '11:00 AM - 11:45 AM', monday: 'Grade 9B • Geometry', tuesday: 'Grade 10A • Algebra', wednesday: 'Grade 9B • Geometry', thursday: 'Grade 10A • Algebra', friday: 'Grade 9B • Geometry', saturday: 'Activity Hour' },
];

const defaultEventsList = [
  { id: 1, title: 'Parent-Teacher Meeting (PTM)', date: 'May 24, 2026', time: '10:00 AM - 12:00 PM', location: 'Main Auditorium', category: 'Meeting', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
  { id: 2, title: 'Periodic Test - Grade 9 & 10', date: 'May 27, 2026', time: '08:30 AM - 11:30 AM', location: 'Exam Halls 1-4', category: 'Examination', bg: 'bg-rose-50 border-rose-200 text-rose-900' },
  { id: 3, title: 'Annual Science & Tech Exhibition', date: 'May 31, 2026', time: '09:00 AM - 03:00 PM', location: 'Science Block Grounds', category: 'Exhibition', bg: 'bg-sky-50 border-sky-200 text-sky-900' },
  { id: 4, title: 'Inter-House Sports Tournament', date: 'Jun 05, 2026', time: '08:00 AM - 02:00 PM', location: 'Sports Complex', category: 'Sports', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
  { id: 5, title: 'Teacher Training & Curriculum Workshop', date: 'Jun 12, 2026', time: '02:00 PM - 05:00 PM', location: 'Conference Hall B', category: 'Workshop', bg: 'bg-purple-50 border-purple-200 text-purple-900' },
];

const defaultActivityList = [
  { id: 1, title: 'Grade 9 Mathematics Science Quiz Competition', className: 'Grade 9 - A', description: 'Interactive mental math and formula challenge organized in class.', date: 'Today, 10:30 AM', author: 'Ramesh Sharma' },
  { id: 2, title: 'Geometry Field Measurement Workshop', className: 'Grade 10 - B', description: 'Outdoor practical measuring perimeter & area of school grounds.', date: 'Yesterday, 02:15 PM', author: 'Ramesh Sharma' },
  { id: 3, title: 'Remedial Class Session on Quadratic Equations', className: 'Grade 8 - C', description: 'Extra practice session conducted for students requiring guidance.', date: 'May 22, 2026', author: 'Ramesh Sharma' },
];

const TeacherHomePage = ({ user, openActivityModal = false }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [teacherName, setTeacherName] = useState('Ramesh Sharma');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('teacherProfileImage') || '');
  const [timetableRows, setTimetableRows] = useState(defaultTimetable);
  const [eventsList, setEventsList] = useState(defaultEventsList);
  const [activitiesList, setActivitiesList] = useState(defaultActivityList);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // New Activity Modal state
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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setProfileImage(base64Url);
        localStorage.setItem('teacherProfileImage', base64Url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivityForm.title || !newActivityForm.description) {
      alert('Please fill out the title and description');
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
      {/* 1. Header Banner & Teacher Profile Directly Below Navbar */}
      <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-[#BFDBFE] pb-6">
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
                <h1 className="text-2xl font-black tracking-tight text-[#1A1817]">Welcome Back, {teacherName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Active</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#736B63]">
                Senior Mathematics Faculty • Employee ID: <span className="text-[#0C4A86] font-bold">TCH-2026-88</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/activities')}
              className="flex items-center gap-2 rounded-xl bg-[#0C4A86] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0096DA]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Classroom Activity</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/classes')}
              className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-4 py-2.5 text-xs font-bold text-[#0C4A86] transition hover:bg-[#EFEAE4]"
            >
              <BookOpen className="h-4 w-4 text-[#0096DA]" />
              <span>My Classes</span>
            </button>
          </div>
        </div>

        {/* Teacher Profile Info Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3.5">
            <p className="text-xs font-bold text-[#736B63] uppercase tracking-wider">Department & Subject</p>
            <p className="mt-1 text-sm font-extrabold text-[#0C4A86]">Mathematics & Statistics</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3.5">
            <p className="text-xs font-bold text-[#736B63] uppercase tracking-wider">Assigned Classes</p>
            <p className="mt-1 text-sm font-extrabold text-[#0C4A86]">Grade 9-A & Grade 10-B</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3.5">
            <p className="text-xs font-bold text-[#736B63] uppercase tracking-wider">Email Address</p>
            <p className="mt-1 text-sm font-extrabold text-[#0C4A86]">ramesh.sharma@school.edu</p>
          </div>
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-3.5">
            <p className="text-xs font-bold text-[#736B63] uppercase tracking-wider">Contact Phone</p>
            <p className="mt-1 text-sm font-extrabold text-[#0C4A86]">+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* 2. Combined Timetable & Scrollable Events Section Row (Metrics Row Removed) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Combined Timetable Column */}
        <div className="lg:col-span-7">
          <TeacherTimetable timetable={timetableRows} currentTime={currentTime} />
        </div>

        {/* Scrollable Events Section Column */}
        <div className="lg:col-span-5">
          <SectionCard
            title="Upcoming Events"
            subtitle="Scrollable event schedule"
            action={<span className="rounded-full bg-[#EBF5FF] border border-[#BFDBFE] px-2.5 py-1 text-xs font-bold text-[#0096DA]">{eventsList.length} Events</span>}
          >
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
              {eventsList.map((event) => (
                <div key={event.id} className={`rounded-xl border p-3.5 transition-all hover:shadow-sm ${event.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70">
                      {event.category}
                    </span>
                    <span className="text-xs font-bold">{event.date}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-extrabold">{event.title}</h4>
                  <div className="mt-1.5 flex items-center justify-between text-xs opacity-90">
                    <span className="font-semibold">🕒 {event.time}</span>
                    <span className="font-semibold">📍 {event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* 3. New Activity List & Activity Management Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <SectionCard
            title="New Activity List"
            subtitle="School & classroom activities published by faculty"
            action={
              <button
                onClick={() => navigate('/dashboard/activities')}
                className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0096DA]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Activity</span>
              </button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activitiesList.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 hover:bg-white transition-all">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#0C4A86]/15 px-2 py-0.5 text-xs font-bold text-[#0C4A86]">
                      {activity.className}
                    </span>
                    <span className="text-xs font-semibold text-[#736B63]">{activity.date}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-extrabold text-[#0C4A86]">{activity.title}</h4>
                  <p className="mt-1.5 text-xs text-[#736B63] line-clamp-2">{activity.description}</p>
                  <div className="mt-3 pt-2.5 border-t border-[#BFDBFE] flex items-center justify-between text-[11px] font-bold text-[#0096DA]">
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
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3.5">
              <h3 className="text-lg font-black text-[#0C4A86]">Post New Activity</h3>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="rounded-lg p-1 text-[#736B63] hover:bg-[#EBF5FF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">Target Class</label>
                <select
                  value={newActivityForm.className}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, className: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                >
                  <option value="Grade 9 - A">Grade 9 - A</option>
                  <option value="Grade 10 - B">Grade 10 - B</option>
                  <option value="Grade 8 - C">Grade 8 - C</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Exhibition Preparation Session"
                  value={newActivityForm.title}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">Description & Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter details of the classroom activity..."
                  value={newActivityForm.description}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-4 py-2 text-xs font-bold text-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
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
