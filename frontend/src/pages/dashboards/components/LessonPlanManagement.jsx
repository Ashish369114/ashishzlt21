import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, CheckCircle2, Clock, FileText, Plus, Send, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import { lessonPlanService } from '../../../services/api';

const statusBadges = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-300',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  'Revision Required': 'bg-amber-50 text-amber-700 border-amber-200',
};

const LessonPlanManagement = ({ user, isPrincipal = false }) => {
  const [activeTab, setActiveTab] = useState('daily'); // daily, monthly, yearly
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, plan: null, status: '', feedback: '' });

  const [form, setForm] = useState({
    planType: 'daily',
    grade: 'Grade 1',
    section: 'A',
    subjectName: 'Mathematics',
    date: new Date().toISOString().split('T')[0],
    month: 'July',
    topic: '',
    learningObjectives: '',
    teachingMethod: '',
    resources: '',
    plannedActivities: '',
    syllabusCoverage: '',
    attachment: null,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await lessonPlanService.getAll({ planType: activeTab });
      if (res.data && res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lesson plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [activeTab]);

  const handleSubmitPlan = async (status = 'Submitted') => {
    try {
      const formData = new FormData();
      formData.append('planType', activeTab);
      formData.append('grade', form.grade);
      formData.append('section', form.section);
      formData.append('subjectName', form.subjectName);
      formData.append('topic', form.topic);
      formData.append('learningObjectives', form.learningObjectives);
      formData.append('teachingMethod', form.teachingMethod);
      formData.append('resources', form.resources);
      formData.append('plannedActivities', form.plannedActivities);
      formData.append('syllabusCoverage', form.syllabusCoverage);
      formData.append('date', form.date);
      formData.append('month', form.month);
      formData.append('status', status);
      if (form.attachment) {
        formData.append('attachment', form.attachment);
      }

      await lessonPlanService.create(formData);
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await lessonPlanService.review(reviewModal.plan.id, {
        status: reviewModal.status,
        principalFeedback: reviewModal.feedback,
      });
      setReviewModal({ isOpen: false, plan: null, status: '', feedback: '' });
      fetchPlans();
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
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Lesson Planning Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Create, organize and track Daily, Monthly, and Yearly curriculum plans</p>
        </div>

        {!isPrincipal && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lesson Plan</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        {['daily', 'monthly', 'yearly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab} Lesson Plans
          </button>
        ))}
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading lesson plans...</div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No {activeTab} lesson plans found</p>
          <p className="text-slate-400 text-xs mt-1">Click Create Lesson Plan to add one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {plan.grade} - {plan.section} • {plan.subjectName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{plan.topic}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Teacher: {plan.teacherName}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadges[plan.status] || 'bg-gray-100'}`}>
                  {plan.status}
                </span>
              </div>

              {plan.learningObjectives && (
                <div className="mt-3 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block text-[11px]">Objectives:</span>
                  <p className="line-clamp-2 text-slate-600 mt-0.5">{plan.learningObjectives}</p>
                </div>
              )}

              {plan.teachingMethod && (
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Method: </span>
                  {plan.teachingMethod}
                </div>
              )}

              {plan.principalFeedback && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block text-[10px] uppercase text-amber-700">Principal Feedback</span>
                  {plan.principalFeedback}
                </div>
              )}

              {/* Principal Review Action */}
              {isPrincipal && plan.status === 'Submitted' && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex space-x-2">
                  <button
                    onClick={() => setReviewModal({ isOpen: true, plan, status: 'Approved', feedback: '' })}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setReviewModal({ isOpen: true, plan, status: 'Revision Required', feedback: '' })}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Request Revision
                  </button>
                  <button
                    onClick={() => setReviewModal({ isOpen: true, plan, status: 'Rejected', feedback: '' })}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal - Create Lesson Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 capitalize text-base">New {activeTab} Lesson Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Grade</label>
                <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full text-xs p-2 border rounded-lg">
                  {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="w-full text-xs p-2 border rounded-lg">
                  {['A', 'B', 'C'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <select value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })} className="w-full text-xs p-2 border rounded-lg">
                  {['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Topic Title</label>
              <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Addition of 2-digit numbers" className="w-full text-xs p-2.5 border rounded-lg" />
            </div>

            <div className="mt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Learning Objectives</label>
              <textarea value={form.learningObjectives} onChange={e => setForm({ ...form, learningObjectives: e.target.value })} rows={2} placeholder="What will students learn?" className="w-full text-xs p-2.5 border rounded-lg" />
            </div>

            <div className="mt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Method & Activities</label>
              <textarea value={form.teachingMethod} onChange={e => setForm({ ...form, teachingMethod: e.target.value })} rows={2} placeholder="Demonstration, group work, practical..." className="w-full text-xs p-2.5 border rounded-lg" />
            </div>

            <div className="mt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">Resources & File Attachment</label>
              <input type="file" onChange={e => setForm({ ...form, attachment: e.target.files[0] })} className="w-full text-xs p-2 border rounded-lg" />
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => handleSubmitPlan('Draft')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors">
                Save Draft
              </button>
              <button onClick={() => handleSubmitPlan('Submitted')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                Submit Lesson Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-2">Review Lesson Plan - {reviewModal.status}</h3>
            <p className="text-xs text-slate-500 mb-4">{reviewModal.plan?.topic} ({reviewModal.plan?.grade}-{reviewModal.plan?.section})</p>

            <label className="text-xs font-bold text-slate-700 block mb-1">Feedback / Remarks</label>
            <textarea
              value={reviewModal.feedback}
              onChange={e => setReviewModal({ ...reviewModal, feedback: e.target.value })}
              rows={3}
              placeholder="Add feedback for the teacher..."
              className="w-full text-xs p-2.5 border rounded-lg"
            />

            <div className="flex space-x-3 mt-4">
              <button onClick={() => setReviewModal({ isOpen: false, plan: null, status: '', feedback: '' })} className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg">Cancel</button>
              <button onClick={handleReviewSubmit} className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanManagement;
