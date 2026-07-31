import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, Paperclip, Calendar, MapPin, Tag, CheckCircle2, Trash2, PencilLine, FileText, Image, Video, ArrowLeft } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const initialActivities = [
  { id: 1, title: 'Grade 9 Mathematics Mental Quiz Competition', grade: 'Grade 9', section: 'A', subject: 'Mathematics', category: 'Co-Curricular', date: 'May 26, 2026', venue: 'Room 204', description: 'Interactive mental math formula speed round challenge for students.', fileName: 'Quiz_Rules_Sheet.pdf', fileType: 'PDF Document' },
  { id: 2, title: 'Outdoor Geometry Field Area Survey Workshop', grade: 'Grade 10', section: 'B', subject: 'Mathematics', category: 'Practical Workshop', date: 'May 28, 2026', venue: 'School Sports Grounds', description: 'Hands-on measurement of perimeter, angles, and surface area using measuring tapes.', fileName: 'Survey_Formulas.docx', fileType: 'Word Document' },
  { id: 3, title: 'Quadratic Equations Remedial Coaching Session', grade: 'Grade 8', section: 'C', subject: 'Algebra', category: 'Remedial', date: 'Jun 02, 2026', venue: 'Math Lab 1', description: 'Guided practice session for students to clarify algebra equation concepts.', fileName: 'Remedial_Practice_Video.mp4', fileType: 'MP4 Video' },
];

const TeacherActivitiesPage = ({ user }) => {
  const navigate = useNavigate();
  const [activitiesList, setActivitiesList] = useState(initialActivities);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [activityForm, setActivityForm] = useState({
    title: '',
    grade: 'Grade 9',
    section: 'A',
    subject: 'Mathematics',
    category: 'Co-Curricular',
    date: '',
    time: '10:00 AM - 11:30 AM',
    venue: '',
    description: '',
    fileName: '',
    fileType: 'PDF Document',
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActivityForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'Uploaded File',
      }));
    }
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!activityForm.title || !activityForm.description) {
      alert('Please fill out the Activity Title and Description.');
      return;
    }

    const newActivity = {
      id: Date.now(),
      title: activityForm.title,
      grade: activityForm.grade,
      section: activityForm.section,
      subject: activityForm.subject,
      category: activityForm.category,
      date: activityForm.date || 'Today',
      venue: activityForm.venue || 'Classroom',
      description: activityForm.description,
      fileName: activityForm.fileName || 'Activity_Resources.pdf',
      fileType: activityForm.fileType,
    };

    setActivitiesList((prev) => [newActivity, ...prev]);
    setActivityForm({
      title: '',
      grade: 'Grade 9',
      section: 'A',
      subject: 'Mathematics',
      category: 'Co-Curricular',
      date: '',
      time: '10:00 AM - 11:30 AM',
      venue: '',
      description: '',
      fileName: '',
      fileType: 'PDF Document',
    });

    setSuccessMessage('Activity created & uploaded successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivitiesList((prev) => prev.filter((act) => act.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1817]">Create & Upload Classroom Activity</h1>
          <p className="text-sm font-semibold text-[#736B63]">
            Dedicated activity creation page to publish class activities, workshops, and supporting files
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-4 py-2.5 text-xs font-bold text-[#0C4A86] hover:bg-[#EFEAE4] transition self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4 text-[#0096DA]" />
          <span>Back</span>
        </button>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Form on Left/Top, List on Right/Bottom */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Create Activity Form */}
        <div className="lg:col-span-7">
          <SectionCard title="Classroom Activity Details" subtitle="Enter activity parameters and upload resources">
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">
                  Activity Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Project Presentation"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Grade</label>
                  <select
                    value={activityForm.grade}
                    onChange={(e) => setActivityForm({ ...activityForm, grade: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 7">Grade 7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Section</label>
                  <select
                    value={activityForm.section}
                    onChange={(e) => setActivityForm({ ...activityForm, section: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Subject</label>
                  <input
                    type="text"
                    value={activityForm.subject}
                    onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Category / Type</label>
                  <select
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                  >
                    <option value="Co-Curricular">Co-Curricular</option>
                    <option value="Practical Workshop">Practical Workshop</option>
                    <option value="Remedial Session">Remedial Session</option>
                    <option value="Exhibition">Exhibition / Project</option>
                    <option value="Sports Activity">Sports Activity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Activity Date</label>
                  <input
                    type="date"
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium, Math Lab 2, Grounds"
                  value={activityForm.venue}
                  onChange={(e) => setActivityForm({ ...activityForm, venue: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">
                  Upload Supporting Media / File (Documents, PDFs, Images, Videos)
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-semibold text-[#0C4A86] focus:outline-none"
                />
                {activityForm.fileName && (
                  <p className="mt-1 text-xs font-bold text-sky-800">
                    Selected File: {activityForm.fileName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#334155]">
                  Detailed Description & Instructions <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain objectives, student preparation, and instructions..."
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86] focus:border-[#0C4A86] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#0C4A86] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]"
                >
                  <Upload className="h-4 w-4" />
                  <span>Save & Publish Activity</span>
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Existing Published Activities */}
        <div className="lg:col-span-5">
          <SectionCard title="Published Activities Roster" subtitle="Manage previously created activities">
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {activitiesList.map((act) => (
                <div key={act.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 space-y-2 hover:bg-white transition-all">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-xs font-bold text-[#0C4A86]">
                      {act.grade} - Section {act.section}
                    </span>
                    <span className="text-[11px] font-bold text-[#0096DA]">{act.category}</span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#0C4A86]">{act.title}</h4>
                  <p className="text-xs text-[#334155] leading-relaxed">{act.description}</p>

                  <div className="pt-1 flex flex-wrap gap-3 text-[11px] font-semibold text-[#736B63]">
                    <span>📅 {act.date}</span>
                    <span>📍 {act.venue}</span>
                  </div>

                  {act.fileName && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-sky-800">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>Attachment: <a href="#file" onClick={(e) => { e.preventDefault(); alert(`Downloading ${act.fileName}`); }} className="underline">{act.fileName}</a></span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#BFDBFE] flex items-center justify-end gap-2">
                    <button
                      onClick={() => alert(`Editing activity ${act.title}`)}
                      className="rounded-lg border border-[#BFDBFE] bg-white px-2.5 py-1 text-[11px] font-bold text-[#334155] hover:bg-[#EFEAE4]"
                    >
                      <PencilLine className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherActivitiesPage;
