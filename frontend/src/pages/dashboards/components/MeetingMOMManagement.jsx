import React, { useEffect, useState } from 'react';
import { Calendar, Users, FileText, Plus, CheckCircle, UserCheck } from 'lucide-react';
import { meetingMOMService } from '../../../services/api';

const MeetingMOMManagement = ({ user, isParent = false, isTeacher = true }) => {
  const [meetingType, setMeetingType] = useState('Staff'); // Staff, PTM
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    meetingType: 'Staff',
    title: '',
    meetingDate: new Date().toISOString().split('T')[0],
    participants: '',
    agenda: '',
    discussion: '',
    decisions: '',
    actionItems: '',
    responsiblePerson: '',
    deadline: '',
    // PTM
    studentName: 'Ramesh Sharma',
    parentName: 'Parent of Ramesh',
    academicPerformance: '',
    attendanceDiscussion: '',
    behaviourDiscussion: '',
    parentFeedback: '',
    teacherSuggestions: '',
    actionPlan: '',
    followUpDate: '',
  });

  const fetchMOM = async () => {
    setLoading(true);
    try {
      const res = await meetingMOMService.getAll({ meetingType });
      if (res.data && res.data.success) {
        setRecords(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMOM();
  }, [meetingType]);

  const handleSaveMOM = async () => {
    try {
      await meetingMOMService.create({ ...form, meetingType });
      setIsModalOpen(false);
      fetchMOM();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Minutes of Meeting (MOM) Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Staff Meeting Records & Parent-Teacher Meeting (PTM) detailed discussions</p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New MOM</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setMeetingType('Staff')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            meetingType === 'Staff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Staff Meeting MOM
        </button>
        <button
          onClick={() => setMeetingType('PTM')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            meetingType === 'PTM' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Parent-Teacher Meeting (PTM) Records
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading meeting minutes...</div>
      ) : records.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No {meetingType} meeting minutes found.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <span className="text-[10px] text-slate-500">Date: {item.meetingDate} {item.participants ? `• Participants: ${item.participants}` : ''}</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full uppercase">
                  {item.meetingType}
                </span>
              </div>

              {meetingType === 'Staff' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Agenda & Discussion</span>
                    <p className="text-slate-700 mt-0.5">{item.discussion || item.agenda}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Decisions Taken</span>
                    <p className="text-slate-700 mt-0.5">{item.decisions}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Action Items & Deadline</span>
                    <p className="text-slate-700 mt-0.5">{item.actionItems} ({item.responsiblePerson}) - Due: {item.deadline}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Academic & Attendance</span>
                    <p className="text-slate-700 mt-0.5">{item.academicPerformance} • {item.attendanceDiscussion}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Parent Feedback & Suggestions</span>
                    <p className="text-slate-700 mt-0.5">{item.parentFeedback} • Teacher: {item.teacherSuggestions}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Action Plan</span>
                    <p className="text-slate-700 mt-0.5">{item.actionPlan} (Follow-up: {item.followUpDate || 'TBD'})</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-4">Record New {meetingType} MOM</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quarterly Academic Review" className="w-full p-2.5 border rounded-lg" />
              </div>

              {meetingType === 'Staff' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Participants</label>
                    <input type="text" value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} placeholder="Principal, Teachers..." className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Agenda & Discussion</label>
                    <textarea value={form.discussion} onChange={e => setForm({ ...form, discussion: e.target.value })} rows={2} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Decisions & Action Items</label>
                    <textarea value={form.decisions} onChange={e => setForm({ ...form, decisions: e.target.value, actionItems: e.target.value })} rows={2} className="w-full p-2.5 border rounded-lg" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                      <input type="text" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Parent Name</label>
                      <input type="text" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic & Behaviour Discussion</label>
                    <textarea value={form.academicPerformance} onChange={e => setForm({ ...form, academicPerformance: e.target.value, behaviourDiscussion: e.target.value })} rows={2} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Parent Feedback & Action Plan</label>
                    <textarea value={form.parentFeedback} onChange={e => setForm({ ...form, parentFeedback: e.target.value, actionPlan: e.target.value })} rows={2} className="w-full p-2.5 border rounded-lg" />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-xs">Cancel</button>
              <button onClick={handleSaveMOM} className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs">Save Meeting MOM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMOMManagement;
