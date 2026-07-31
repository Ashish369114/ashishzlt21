import React, { useEffect, useState } from 'react';
import { Award, AlertTriangle, BookOpen, Calendar, Plus, User, CheckCircle2, TrendingUp } from 'lucide-react';
import { anecdoteService, remedialService } from '../../../services/api';

const categoryBadges = {
  Academic: 'bg-blue-50 text-blue-700',
  Behaviour: 'bg-purple-50 text-purple-700',
  Discipline: 'bg-amber-50 text-amber-700',
  Participation: 'bg-cyan-50 text-cyan-700',
  'Positive Achievement': 'bg-emerald-50 text-emerald-700',
  'Improvement Required': 'bg-rose-50 text-rose-700',
};

const AnecdotesAndRemedials = ({ user, studentId = null }) => {
  const [activeTab, setActiveTab] = useState('anecdotes'); // anecdotes, remedials
  const [anecdotes, setAnecdotes] = useState([]);
  const [remedials, setRemedials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAnecdoteModalOpen, setIsAnecdoteModalOpen] = useState(false);
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);

  const [anecdoteForm, setAnecdoteForm] = useState({
    studentId: studentId || 'STUDENT001',
    studentName: 'Ramesh Sharma',
    category: 'Academic',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [remedialForm, setRemedialForm] = useState({
    studentId: studentId || 'STUDENT001',
    studentName: 'Ramesh Sharma',
    subjectName: 'Mathematics',
    identifiedProblem: '',
    actionTaken: '',
    remedialPlan: '',
    date: new Date().toISOString().split('T')[0],
    followUpDate: '',
    initialPerformance: '',
    followUpPerformance: '',
    improvementStatus: 'In Progress',
    teacherRemarks: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'anecdotes') {
        const res = await anecdoteService.getAll(studentId ? { studentId } : {});
        if (res.data && res.data.success) setAnecdotes(res.data.data || []);
      } else {
        const res = await remedialService.getAll(studentId ? { studentId } : {});
        if (res.data && res.data.success) setRemedials(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, studentId]);

  const handleSaveAnecdote = async () => {
    try {
      await anecdoteService.add(anecdoteForm);
      setIsAnecdoteModalOpen(false);
      setAnecdoteForm({ ...anecdoteForm, description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRemedial = async () => {
    try {
      await remedialService.add(remedialForm);
      setIsRemedialModalOpen(false);
      setRemedialForm({ ...remedialForm, identifiedProblem: '', actionTaken: '', remedialPlan: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Student Observation Anecdotes & Remedial Action History
          </h2>
          <p className="text-xs text-slate-500 mt-1">Record behavioral observations, achievements, academic problems, and remedial plan progress</p>
        </div>

        <div className="flex space-x-2">
          {activeTab === 'anecdotes' ? (
            <button
              onClick={() => setIsAnecdoteModalOpen(true)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Anecdote</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRemedialModalOpen(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Remedial Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('anecdotes')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'anecdotes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Anecdotal Observations
        </button>
        <button
          onClick={() => setActiveTab('remedials')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'remedials' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Remedial History & Action Plans
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading records...</div>
      ) : activeTab === 'anecdotes' ? (
        anecdotes.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">No anecdotal observations recorded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anecdotes.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${categoryBadges[item.category] || 'bg-gray-100'}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">{item.studentName}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">Recorded by: {item.teacherName}</span>
              </div>
            ))}
          </div>
        )
      ) : (
        remedials.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">No remedial action plans recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {remedials.map(item => (
              <div key={item.id} className="p-5 rounded-xl border border-purple-100 bg-purple-50/30">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.studentName} • {item.subjectName}</h4>
                    <span className="text-[10px] text-slate-500">Initiated on {item.date} {item.followUpDate ? `• Follow-up: ${item.followUpDate}` : ''}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
                    {item.improvementStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px] text-rose-700">Identified Problem</span>
                    <p className="text-slate-700 mt-0.5">{item.identifiedProblem}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px] text-indigo-700">Action Taken & Plan</span>
                    <p className="text-slate-700 mt-0.5">{item.actionTaken} - {item.remedialPlan}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px] text-emerald-700">Performance Progress</span>
                    <p className="text-slate-700 mt-0.5 font-semibold">
                      Initial: {item.initialPerformance || 'N/A'} → Follow-up: {item.followUpPerformance || 'In Progress'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Anecdote Modal */}
      {isAnecdoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-4">Record Anecdotal Observation</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                <input type="text" value={anecdoteForm.studentName} onChange={e => setAnecdoteForm({ ...anecdoteForm, studentName: e.target.value })} className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observation Category</label>
                <select value={anecdoteForm.category} onChange={e => setAnecdoteForm({ ...anecdoteForm, category: e.target.value })} className="w-full p-2.5 border rounded-lg font-medium">
                  {['Academic', 'Behaviour', 'Discipline', 'Participation', 'Positive Achievement', 'Improvement Required'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observation Description</label>
                <textarea value={anecdoteForm.description} onChange={e => setAnecdoteForm({ ...anecdoteForm, description: e.target.value })} rows={3} placeholder="Describe the specific incident or observation..." className="w-full p-2.5 border rounded-lg" />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setIsAnecdoteModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-xs">Cancel</button>
              <button onClick={handleSaveAnecdote} className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs">Save Observation</button>
            </div>
          </div>
        </div>
      )}

      {/* Remedial Modal */}
      {isRemedialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-4">Create Remedial Action Plan</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                  <input type="text" value={remedialForm.studentName} onChange={e => setRemedialForm({ ...remedialForm, studentName: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <input type="text" value={remedialForm.subjectName} onChange={e => setRemedialForm({ ...remedialForm, subjectName: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Identified Academic Problem</label>
                <textarea value={remedialForm.identifiedProblem} onChange={e => setRemedialForm({ ...remedialForm, identifiedProblem: e.target.value })} rows={2} placeholder="What difficulty is student facing?" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Taken & Remedial Plan</label>
                <textarea value={remedialForm.remedialPlan} onChange={e => setRemedialForm({ ...remedialForm, remedialPlan: e.target.value, actionTaken: e.target.value })} rows={2} placeholder="Plan of action..." className="w-full p-2.5 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Performance (%)</label>
                  <input type="text" value={remedialForm.initialPerformance} onChange={e => setRemedialForm({ ...remedialForm, initialPerformance: e.target.value })} placeholder="e.g. 58%" className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Follow-up Date</label>
                  <input type="date" value={remedialForm.followUpDate} onChange={e => setRemedialForm({ ...remedialForm, followUpDate: e.target.value })} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setIsRemedialModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-xs">Cancel</button>
              <button onClick={handleSaveRemedial} className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-lg text-xs">Create Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnecdotesAndRemedials;
