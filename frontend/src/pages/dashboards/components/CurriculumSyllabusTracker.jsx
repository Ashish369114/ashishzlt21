import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Circle, FileText, Plus, Progress, Upload } from 'lucide-react';
import { curriculumService } from '../../../services/api';

const CurriculumSyllabusTracker = ({ user, selectedGrade = 'Grade 1', selectedSection = 'A', selectedSubject = 'Mathematics' }) => {
  const [topics, setTopics] = useState([]);
  const [summary, setSummary] = useState({ totalTopics: 0, completedTopics: 0, pendingTopics: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    grade: selectedGrade,
    section: selectedSection,
    subjectName: selectedSubject,
    chapterName: '',
    topicName: '',
    notes: '',
    document: null,
  });

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await curriculumService.getAll({
        grade: selectedGrade,
        section: selectedSection,
        subjectName: selectedSubject,
      });
      if (res.data && res.data.success) {
        setTopics(res.data.data || []);
        setSummary(res.data.summary || { totalTopics: 0, completedTopics: 0, pendingTopics: 0, completionPercentage: 0 });
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [selectedGrade, selectedSection, selectedSubject]);

  const handleToggleComplete = async (id) => {
    try {
      await curriculumService.toggleComplete(id);
      fetchCurriculum();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTopic = async () => {
    try {
      const formData = new FormData();
      formData.append('grade', selectedGrade);
      formData.append('section', selectedSection);
      formData.append('subjectName', selectedSubject);
      formData.append('chapterName', form.chapterName);
      formData.append('topicName', form.topicName);
      formData.append('notes', form.notes);
      if (form.document) formData.append('document', form.document);

      await curriculumService.addTopic(formData);
      setIsModalOpen(false);
      setForm({ ...form, chapterName: '', topicName: '', notes: '', document: null });
      fetchCurriculum();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Curriculum & Syllabus Progress Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">Track syllabus coverage, completed topics and documents for {selectedGrade}-{selectedSection} ({selectedSubject})</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Syllabus Topic</span>
        </button>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
        <div>
          <span className="text-slate-500 block font-medium">Total Topics</span>
          <span className="text-lg font-black text-slate-900">{summary.totalTopics}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Completed</span>
          <span className="text-lg font-black text-emerald-600">{summary.completedTopics}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Pending</span>
          <span className="text-lg font-black text-amber-600">{summary.pendingTopics}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Completion Rate</span>
          <span className="text-lg font-black text-indigo-600">{summary.completionPercentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
          <span>Syllabus Completion</span>
          <span>{summary.completionPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${summary.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Topics Checklist */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading syllabus topics...</div>
      ) : topics.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          No syllabus topics added yet for {selectedSubject}. Click "Add Syllabus Topic" to start tracking.
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleComplete(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                item.isCompleted ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.chapterName}</span>
                  <h4 className={`text-sm font-bold ${item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {item.topicName}
                  </h4>
                  {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                </div>
              </div>

              {item.documentUrl && (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg"
                >
                  <FileText className="w-3.5 h-3.5" /> View Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Syllabus Topic</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chapter Name</label>
                <input
                  type="text"
                  value={form.chapterName}
                  onChange={e => setForm({ ...form, chapterName: e.target.value })}
                  placeholder="e.g. Chapter 3: Algebra"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Topic Name</label>
                <input
                  type="text"
                  value={form.topicName}
                  onChange={e => setForm({ ...form, topicName: e.target.value })}
                  placeholder="e.g. Linear Equations in 1 Variable"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Description</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional notes or sub-topics..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Syllabus Document (PDF / Image)</label>
                <input
                  type="file"
                  onChange={e => setForm({ ...form, document: e.target.files[0] })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-xs">Cancel</button>
              <button onClick={handleAddTopic} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs">Save Topic</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumSyllabusTracker;
