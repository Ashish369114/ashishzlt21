import React, { useState } from 'react';
import { Bell, MessageSquare, Calendar, AlertTriangle, MessageCircle, PlusCircle, Paperclip, CheckCircle2, Clock } from 'lucide-react';
import SectionCard from '../../components/dashboard/SectionCard';

const initialNotices = [
  { id: 1, title: 'Annual Sports Day Auditions Announced', author: 'Principal Office', target: 'All Students & Parents', date: 'May 26, 2026', body: 'Auditions for track and field events will commence next Monday in the sports ground.', tag: 'Principal Notice' },
  { id: 2, title: 'Grade 9 Mathematics Unit Test Schedule', author: 'Ramesh Sharma (Teacher)', target: 'Grade 9 Students', date: 'May 25, 2026', body: 'The Unit Test 2 will cover Linear Equations and Polynomials on Friday at 9:00 AM.', tag: 'Teacher Notice' },
  { id: 3, title: 'Parent-Teacher Meeting Agenda Feedback', author: 'Suresh Verma (Parent)', target: 'Faculty & Admin', date: 'May 24, 2026', body: 'Requesting discussion on extra coaching classes for board exam preparation.', tag: 'Parent Post' },
];

const initialMeetings = [
  { id: 1, title: 'Parent-Teacher Meeting (PTM) - Term 1', type: 'Parent-Teacher Meeting (PTM)', date: 'Jun 05, 2026', time: '10:00 AM - 01:00 PM', location: 'Main Auditorium & Online Google Meet', participants: 'Grade 9 Parents & Faculty', agenda: 'Review student quarterly performance, attendance, and behavioral remarks.', status: 'Scheduled' },
  { id: 2, title: 'Faculty & Academic Curriculum Sync', type: 'Staff Meeting', date: 'May 28, 2026', time: '03:30 PM - 04:30 PM', location: 'Conference Hall A', participants: 'All Teachers & Principal', agenda: 'Finalize syllabus timeline and exam question paper submission deadlines.', status: 'Scheduled' },
  { id: 3, title: 'Student Council Leadership Sync', type: 'Student Meeting', date: 'May 22, 2026', time: '11:00 AM - 12:00 PM', location: 'Room 204', participants: 'Class Monitors & Grade Teacher', agenda: 'Discuss science exhibition decor and discipline duty allocations.', status: 'Completed' },
];

const initialFeedbacks = [
  { id: 1, studentName: 'Rohan Verma', parentName: 'Suresh Verma', grade: 'Grade 9 - A', category: 'Academic Improvement', reviewText: 'Rohan needs extra practice in Geometry proofs. We noticed he struggles with theorem applications during homework.', responseText: 'Thank you for bringing this up! I will provide additional practice worksheets and cover this during Friday remedial class.', status: 'Response Added', date: 'May 24, 2026' },
  { id: 2, studentName: 'Ananya Sharma', parentName: 'Vikram Sharma', grade: 'Grade 10 - B', category: 'Personal Development', reviewText: 'Ananya has shown great progress in public speaking, but gets anxious before major exams. Any tips for exam stress?', responseText: 'We have scheduled a group counseling & relaxation session before exams.', status: 'Under Review', date: 'May 22, 2026' },
];

const initialComplaints = [
  { id: 'CMP-101', title: 'Delay in Transport Bus Route #4 Arrival', complainantName: 'Rajesh Singh (Parent of Aarav)', target: 'School Transport & Admin', date: 'May 25, 2026', description: 'Bus route #4 arrived 35 minutes late on Tuesday, causing students to miss morning assembly.', fileAttached: 'bus_delay_log.pdf', status: 'In Progress', response: 'Transport manager notified. Driver schedule re-aligned.' },
  { id: 'CMP-102', title: 'Clarification regarding Canteen Hygiene', complainantName: 'Manish Patel (Parent of Ishita)', target: 'Principal & Health Officer', date: 'May 20, 2026', description: 'Requesting periodic inspection of drinking water filtration units in the primary wing.', fileAttached: 'hygiene_note.docx', status: 'Resolved', response: 'Water filters inspected and serviced on May 22.' },
];

const TeacherCommunicationsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('notices'); // 'notices' | 'meetings' | 'feedback' | 'complaints' | 'messages'

  // Notices state
  const [noticesList, setNoticesList] = useState(initialNotices);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', target: 'All Students & Parents', body: '' });

  // Meetings state
  const [meetingsList, setMeetingsList] = useState(initialMeetings);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', type: 'Parent-Teacher Meeting (PTM)', date: '', time: '', location: '', participants: '', agenda: '' });

  // Feedback state
  const [feedbackList, setFeedbackList] = useState(initialFeedbacks);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackResponseInput, setFeedbackResponseInput] = useState('');

  // Complaints state
  const [complaintsList, setComplaintsList] = useState(initialComplaints);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: '', target: 'Teacher', description: '', fileName: '' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Notice submit
  const handleAddNotice = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      title: noticeForm.title,
      author: `${user?.firstName || 'Ramesh'} ${user?.lastName || 'Sharma'} (Teacher)`,
      target: noticeForm.target,
      date: 'Just Now',
      body: noticeForm.body,
      tag: 'Teacher Notice',
    };
    setNoticesList((prev) => [created, ...prev]);
    setNoticeForm({ title: '', target: 'All Students & Parents', body: '' });
    setIsNoticeModalOpen(false);
    alert('Notice posted to Notice Board successfully!');
  };

  // Meeting submit
  const handleAddMeeting = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      title: meetingForm.title,
      type: meetingForm.type,
      date: meetingForm.date || 'Jun 10, 2026',
      time: meetingForm.time || '10:00 AM - 11:30 AM',
      location: meetingForm.location || 'Conference Room',
      participants: meetingForm.participants || 'Parents & Faculty',
      agenda: meetingForm.agenda || 'General sync',
      status: 'Scheduled',
    };
    setMeetingsList((prev) => [created, ...prev]);
    setMeetingForm({ title: '', type: 'Parent-Teacher Meeting (PTM)', date: '', time: '', location: '', participants: '', agenda: '' });
    setIsMeetingModalOpen(false);
    alert('New Meeting scheduled successfully!');
  };

  // Complaint submit
  const handleAddComplaint = (e) => {
    e.preventDefault();
    const created = {
      id: `CMP-${Date.now().toString().slice(-3)}`,
      title: complaintForm.title,
      complainantName: `${user?.firstName || 'Parent'} (${complaintForm.target})`,
      target: complaintForm.target,
      date: 'Just Now',
      description: complaintForm.description,
      fileAttached: complaintForm.fileName || 'document.pdf',
      status: 'Submitted',
      response: 'Under review by school authority',
    };
    setComplaintsList((prev) => [created, ...prev]);
    setComplaintForm({ title: '', target: 'Teacher', description: '', fileName: '' });
    setIsComplaintModalOpen(false);
    alert('Complaint / Grievance submitted successfully!');
  };

  // Update complaint status
  const handleUpdateComplaintStatus = (complaintId, newStatus) => {
    setComplaintsList((prev) => prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c)));
  };

  // Add response to feedback
  const handleSaveFeedbackResponse = (id) => {
    if (!feedbackResponseInput) return;
    setFeedbackList((prev) => prev.map((f) => (f.id === id ? { ...f, responseText: feedbackResponseInput, status: 'Response Added' } : f)));
    setSelectedFeedback(null);
    setFeedbackResponseInput('');
    alert('Response sent to parent successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Tabs */}
      <div className="rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1817]">Parent Communication & Grievances Hub</h1>
          <p className="text-sm font-semibold text-[#736B63]">Manage Notice Board, Meetings, Parent Feedback, and Complaints</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${activeTab === 'notices' ? 'bg-[#0C4A86] text-white shadow-sm' : 'bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]'}`}
          >
            <Bell className="h-4 w-4" />
            <span>Notice Board</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${activeTab === 'meetings' ? 'bg-[#0C4A86] text-white shadow-sm' : 'bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]'}`}
          >
            <Calendar className="h-4 w-4" />
            <span>Meetings</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${activeTab === 'feedback' ? 'bg-[#0C4A86] text-white shadow-sm' : 'bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]'}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Student Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${activeTab === 'complaints' ? 'bg-[#0C4A86] text-white shadow-sm' : 'bg-[#EBF5FF] text-[#0C4A86] border border-[#BFDBFE]'}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Parent Complaints</span>
          </button>
        </div>
      </div>

      {/* 3. Notice Board Tab */}
      {activeTab === 'notices' && (
        <SectionCard
          title="Notice Board & Communication"
          subtitle="Notices from Principal, Teachers, Students, and Parents"
          action={
            <button onClick={() => setIsNoticeModalOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]">
              <PlusCircle className="h-4 w-4" />
              <span>Post Notice</span>
            </button>
          }
        >
          <div className="space-y-4">
            {noticesList.map((notice) => (
              <div key={notice.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 space-y-2 hover:bg-white transition-all">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#0C4A86]/15 px-2.5 py-0.5 text-xs font-bold text-[#0C4A86]">
                    {notice.tag}
                  </span>
                  <span className="text-xs font-semibold text-[#736B63]">{notice.date}</span>
                </div>
                <h4 className="text-base font-extrabold text-[#0C4A86]">{notice.title}</h4>
                <p className="text-xs text-[#334155] leading-relaxed">{notice.body}</p>
                <div className="pt-2 border-t border-[#BFDBFE] flex items-center justify-between text-[11px] font-bold text-[#0096DA]">
                  <span>Author: {notice.author}</span>
                  <span>Target: {notice.target}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 4. Meetings Tab */}
      {activeTab === 'meetings' && (
        <SectionCard
          title="School & Parent Meetings"
          subtitle="Staff Meetings, PTMs, Student & Principal Meetings"
          action={
            <button onClick={() => setIsMeetingModalOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0096DA]">
              <PlusCircle className="h-4 w-4" />
              <span>Schedule Meeting</span>
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetingsList.map((m) => (
              <div key={m.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#0C4A86]/15 px-2 py-0.5 text-[11px] font-bold text-[#0C4A86]">
                      {m.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Completed' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-extrabold text-[#0C4A86]">{m.title}</h4>
                  <p className="mt-1 text-xs text-[#736B63]"><span className="font-bold">Agenda:</span> {m.agenda}</p>
                </div>

                <div className="pt-3 border-t border-[#BFDBFE] space-y-1 text-xs font-semibold text-[#334155]">
                  <p>📅 <span className="font-bold">{m.date}</span> ({m.time})</p>
                  <p>📍 <span className="font-bold">{m.location}</span></p>
                  <p>👥 <span className="font-bold">{m.participants}</span></p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 5. Student Review & Improvement Feedback Tab */}
      {activeTab === 'feedback' && (
        <SectionCard
          title="Parent Reviews & Student Improvement Feedback"
          subtitle="Parent feedback regarding personal development & teacher responses"
        >
          <div className="space-y-4">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0C4A86]">Student: {fb.studentName} ({fb.grade})</h4>
                    <p className="text-xs font-semibold text-[#736B63]">Parent: {fb.parentName} • {fb.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    fb.status === 'Response Added' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fb.status}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-[#BFDBFE] text-xs font-semibold text-[#0C4A86]">
                  <span className="font-bold text-[#0C4A86]">Parent Review / Concern:</span> "{fb.reviewText}"
                </div>

                {fb.responseText ? (
                  <div className="rounded-xl bg-[#0C4A86]/10 p-3 border border-[#0C4A86]/30 text-xs font-semibold text-[#0C4A86]">
                    <span className="font-bold text-[#0C4A86]">Teacher Response:</span> "{fb.responseText}"
                  </div>
                ) : (
                  <div>
                    {selectedFeedback === fb.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows="2"
                          placeholder="Write your response to the parent..."
                          value={feedbackResponseInput}
                          onChange={(e) => setFeedbackResponseInput(e.target.value)}
                          className="w-full rounded-xl border border-[#BFDBFE] bg-white p-2 text-xs font-semibold text-[#0C4A86]"
                        ></textarea>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setSelectedFeedback(null)} className="rounded-lg border border-[#BFDBFE] bg-white px-3 py-1 text-xs font-bold">Cancel</button>
                          <button onClick={() => handleSaveFeedbackResponse(fb.id)} className="rounded-lg bg-[#0C4A86] px-3 py-1 text-xs font-bold text-white">Send Response</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedFeedback(fb.id)} className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-bold text-[#0C4A86] hover:bg-[#EFEAE4]">
                        Respond to Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 6. Parent Complaints / Grievances Tab */}
      {activeTab === 'complaints' && (
        <SectionCard
          title="Parent Complaint & Grievance Tracker"
          subtitle="Submit & track complaints (Submitted -> Under Review -> In Progress -> Resolved -> Closed)"
          action={
            <button onClick={() => setIsComplaintModalOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700">
              <PlusCircle className="h-4 w-4" />
              <span>Submit Complaint</span>
            </button>
          }
        >
          <div className="space-y-4">
            {complaintsList.map((c) => (
              <div key={c.id} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#BFDBFE] pb-3">
                  <div>
                    <span className="text-xs font-black text-[#0C4A86]">{c.id}</span>
                    <h4 className="text-sm font-extrabold text-[#0C4A86]">{c.title}</h4>
                    <p className="text-xs text-[#736B63]">Submitted by {c.complainantName} • {c.date}</p>
                  </div>

                  {/* Status Dropdown Tracker */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#334155]">Status:</span>
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                      className={`rounded-xl border px-3 py-1 text-xs font-bold focus:outline-none ${
                        c.status === 'Resolved' || c.status === 'Closed'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : c.status === 'In Progress' || c.status === 'Under Review'
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs font-semibold text-[#0C4A86] leading-relaxed">{c.description}</p>

                {c.fileAttached && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0096DA]">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attachment: <a href="#file" onClick={(e) => e.preventDefault()} className="underline">{c.fileAttached}</a></span>
                  </div>
                )}

                <div className="rounded-xl bg-white p-3 border border-[#BFDBFE] text-xs font-semibold text-[#334155]">
                  <span className="font-bold text-[#0C4A86]">School Response:</span> {c.response}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Post Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-[#0C4A86]">Post Notice to Notice Board</h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="text-[#736B63]">✕</button>
            </div>
            <form onSubmit={handleAddNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155]">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Audition Announcement"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Target Audience</label>
                <select
                  value={noticeForm.target}
                  onChange={(e) => setNoticeForm({ ...noticeForm, target: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                >
                  <option value="All Students & Parents">All Students & Parents</option>
                  <option value="Grade 9 Students">Grade 9 Students</option>
                  <option value="Grade 10 Students">Grade 10 Students</option>
                  <option value="Faculty & Staff">Faculty & Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Notice Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write the notice description..."
                  value={noticeForm.body}
                  onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-[#0C4A86]">Schedule Meeting</h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-[#736B63]">✕</button>
            </div>
            <form onSubmit={handleAddMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155]">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 PTM Session"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Meeting Type</label>
                <select
                  value={meetingForm.type}
                  onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                >
                  <option value="Parent-Teacher Meeting (PTM)">Parent-Teacher Meeting (PTM)</option>
                  <option value="Staff Meeting">Staff Meeting</option>
                  <option value="Student Meeting">Student Meeting</option>
                  <option value="Principal Meeting">Principal Meeting</option>
                  <option value="Other School Meeting">Other School Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155]">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 11:30 AM"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Location / Meeting Link</label>
                <input
                  type="text"
                  placeholder="Main Auditorium or Google Meet Link"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Participants & Agenda</label>
                <textarea
                  rows="2"
                  placeholder="Participants list & agenda..."
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#0C4A86] px-4 py-2 text-xs font-bold text-white">Save Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-3">
              <h3 className="text-base font-black text-rose-900">Submit Parent Complaint / Grievance</h3>
              <button onClick={() => setIsComplaintModalOpen(false)} className="text-[#736B63]">✕</button>
            </div>
            <form onSubmit={handleAddComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155]">Complaint Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bus Route Delay Issue"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Submit To</label>
                <select
                  value={complaintForm.target}
                  onChange={(e) => setComplaintForm({ ...complaintForm, target: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="School Admin">School Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Detailed Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write detailed grievance..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-semibold text-[#0C4A86]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155]">Attach Document / File Name</label>
                <input
                  type="text"
                  placeholder="e.g. grievance_photo.jpg"
                  value={complaintForm.fileName}
                  onChange={(e) => setComplaintForm({ ...complaintForm, fileName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] p-2.5 text-xs font-bold text-[#0C4A86]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BFDBFE]">
                <button type="button" onClick={() => setIsComplaintModalOpen(false)} className="rounded-xl border border-[#BFDBFE] bg-[#EBF5FF] px-3.5 py-2 text-xs font-bold">Cancel</button>
                <button type="submit" className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">Submit Grievance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCommunicationsPage;
