import React, { useState } from 'react';
import { Trophy, Award, Calendar, MapPin, Users, Star, Plus, ShieldCheck, Download, ExternalLink, Sparkles } from 'lucide-react';

const initialStudentActivitiesList = [
  {
    id: 1,
    title: 'Inter-School Science & Robotics Championship',
    category: 'Robotics & AI',
    role: 'Team Leader',
    date: 'May 18, 2026',
    venue: 'State Innovation Lab Auditorium',
    achievement: '1st Prize - Golden Innovation Trophy',
    description: 'Designed an autonomous solar-powered waste sorting rover. Won first place among 24 participating schools.',
    status: 'Completed',
    badgeColor: 'bg-amber-100 text-amber-800',
    image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Annual Athletic Meet - 100m Sprint & Relay',
    category: 'Sports & Athletics',
    role: 'Individual Participant',
    date: 'Apr 22, 2026',
    venue: 'Central School Sports Complex',
    achievement: 'Silver Medalist',
    description: 'Secured second position in the 100m sprint finals with a personal best timing of 11.8 seconds.',
    status: 'Completed',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'School Debate & Public Speaking Club',
    category: 'Cultural & Literary',
    role: 'Club Vice Captain',
    date: 'Ongoing (Every Wednesday)',
    venue: 'Activity Room 2',
    achievement: 'Best Speaker Citation',
    description: 'Participated in weekly parliamentary debates, leading the opposition team on technology ethics topics.',
    status: 'Active',
    badgeColor: 'bg-purple-100 text-purple-800',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Clean Environment & Tree Plantation Drive',
    category: 'Social Service',
    role: 'Student Volunteer',
    date: 'Mar 15, 2026',
    venue: 'Green Campus Gardens',
    achievement: 'Excellence Certificate',
    description: 'Planted over 50 saplings across the campus and led awareness sessions on eco-friendly recycling.',
    status: 'Completed',
    badgeColor: 'bg-teal-100 text-teal-800',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  },
];

const StudentActivities = () => {
  const [activities, setActivities] = useState(initialStudentActivitiesList);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivityForm, setNewActivityForm] = useState({
    title: '',
    category: 'Robotics & AI',
    role: '',
    date: '',
    venue: '',
    achievement: '',
    description: '',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newActivityForm.title) {
      alert('Please enter activity title');
      return;
    }

    const newAct = {
      id: Date.now(),
      title: newActivityForm.title,
      category: newActivityForm.category,
      role: newActivityForm.role || 'Participant',
      date: newActivityForm.date || new Date().toLocaleDateString(),
      venue: newActivityForm.venue || 'School Campus',
      achievement: newActivityForm.achievement || 'Participation Certificate',
      description: newActivityForm.description || 'Logged student co-curricular activity record.',
      status: 'Active',
      badgeColor: 'bg-blue-100 text-blue-800',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    };

    setActivities([newAct, ...activities]);
    setNewActivityForm({ title: '', category: 'Robotics & AI', role: '', date: '', venue: '', achievement: '', description: '' });
    setIsAddModalOpen(false);
    alert('New activity logged successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-2">
            <Trophy className="h-3.5 w-3.5 text-amber-300" /> Extracurricular & Co-Curricular Portfolio
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Activities & Achievements</h1>
          <p className="text-xs md:text-sm font-semibold text-sky-100">
            Track your sports events, science fairs, literary debates, leadership roles, and award certificates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-extrabold text-[#0C4A86] shadow-sm hover:bg-sky-50 transition self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Log New Activity
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0C4A86]">Total Activities</p>
          <p className="mt-1 text-2xl font-black text-[#0C4A86]">{activities.length} Recorded</p>
        </div>
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0C4A86]">Trophies & Medals</p>
          <p className="mt-1 text-2xl font-black text-amber-600">3 Major Awards</p>
        </div>
        <div className="rounded-2xl border border-[#BFDBFE] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0C4A86]">Leadership Roles</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">2 Leadership Positions</p>
        </div>
      </div>

      {/* Modern Cards & Timeline UI */}
      <div className="grid gap-6 md:grid-cols-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className="group overflow-hidden rounded-3xl border border-[#BFDBFE] bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#0096DA] flex flex-col"
          >
            {/* Image Preview */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={act.image}
                alt={act.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold backdrop-blur-md shadow-xs ${act.badgeColor}`}>
                  {act.category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" /> {act.date}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-[#0096DA]" /> Role: <span className="text-[#0C4A86]">{act.role}</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                    {act.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-[#0C4A86] group-hover:text-[#0096DA] transition-colors">{act.title}</h3>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">{act.description}</p>
              </div>

              {/* Achievement Badge & Location Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <Award className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{act.achievement}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {act.venue}
                  </span>
                  <span className="text-amber-700 font-extrabold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Verified Entry
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-lg font-black text-[#0C4A86]">Log Co-Curricular Activity</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-black font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#334155] mb-1 font-bold">Activity Title</label>
                <input
                  type="text"
                  required
                  value={newActivityForm.title}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                  placeholder="e.g. Inter-School Physics Quiz"
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#334155] mb-1 font-bold">Category</label>
                  <select
                    value={newActivityForm.category}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, category: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                  >
                    <option value="Robotics & AI">Robotics & AI</option>
                    <option value="Sports & Athletics">Sports & Athletics</option>
                    <option value="Cultural & Literary">Cultural & Literary</option>
                    <option value="Social Service">Social Service</option>
                    <option value="Mathematics & Science">Mathematics & Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#334155] mb-1 font-bold">Your Role</label>
                  <input
                    type="text"
                    value={newActivityForm.role}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, role: e.target.value })}
                    placeholder="e.g. Captain / Participant"
                    className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#334155] mb-1 font-bold">Date</label>
                  <input
                    type="date"
                    value={newActivityForm.date}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, date: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                  />
                </div>

                <div>
                  <label className="block text-[#334155] mb-1 font-bold">Venue / Location</label>
                  <input
                    type="text"
                    value={newActivityForm.venue}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium"
                    className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#334155] mb-1 font-bold">Achievement / Award</label>
                <input
                  type="text"
                  value={newActivityForm.achievement}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, achievement: e.target.value })}
                  placeholder="e.g. 1st Prize / Certificate of Merit"
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-[#334155] mb-1 font-bold">Short Description</label>
                <textarea
                  rows={3}
                  value={newActivityForm.description}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                  placeholder="Describe your role and key outcomes..."
                  className="w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 font-semibold focus:outline-none focus:border-[#0C4A86]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#BFDBFE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-4 py-2 text-xs font-bold text-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0C4A86] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0096DA]"
                >
                  Save Activity Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentActivities;
