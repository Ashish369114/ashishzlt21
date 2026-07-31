import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Download, FileText, Filter, MessageSquare, Star, Search, User } from 'lucide-react';
import { submissionService, homeworkService } from '../../../services/api';

const HomeworkEvaluationDashboard = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evalForm, setEvalForm] = useState({ marksObtained: '', feedback: '' });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await submissionService.getAll();
      if (res.data && res.data.success) {
        setSubmissions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenEvaluate = (sub) => {
    setSelectedSubmission(sub);
    setEvalForm({
      marksObtained: sub.marksObtained !== null ? sub.marksObtained : '',
      feedback: sub.feedback || '',
    });
  };

  const handleSaveEvaluation = async () => {
    if (!selectedSubmission) return;
    try {
      await submissionService.evaluate(selectedSubmission.id, {
        marksObtained: evalForm.marksObtained,
        feedback: evalForm.feedback,
      });
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            Homework & Assignment Submission Evaluation Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review student file submissions, enter marks, add teacher feedback, and approve evaluations</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading student submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          No submissions received yet. When students upload homework or assignments, they will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-3">Student Name</th>
                <th className="p-3">Homework / Topic</th>
                <th className="p-3">Submitted Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Attachment</th>
                <th className="p-3 text-center">Marks</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {sub.studentName || 'Student'}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{sub.homework?.title || 'Homework'}</span>
                    <span className="text-[10px] text-slate-500">{sub.homework?.subjectName || 'General'}</span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === 'Evaluated'
                        ? 'bg-emerald-50 text-emerald-700'
                        : sub.status === 'Late'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {sub.fileUrl ? (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{sub.fileName || 'Download File'}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No File</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    {sub.marksObtained !== null ? `${sub.marksObtained} / ${sub.maxMarks}` : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenEvaluate(sub)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      {sub.status === 'Evaluated' ? 'Edit Marks' : 'Evaluate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Evaluate Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-1">Evaluate Student Submission</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedSubmission.studentName} - {selectedSubmission.homework?.title}</p>

            {selectedSubmission.notes && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-4">
                <span className="font-bold block text-[10px] text-slate-500 uppercase">Student Notes</span>
                {selectedSubmission.notes}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Marks Obtained (Max: {selectedSubmission.maxMarks})</label>
                <input
                  type="number"
                  max={selectedSubmission.maxMarks}
                  min={0}
                  value={evalForm.marksObtained}
                  onChange={e => setEvalForm({ ...evalForm, marksObtained: e.target.value })}
                  placeholder="e.g. 95"
                  className="w-full p-2.5 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teacher Feedback & Comments</label>
                <textarea
                  value={evalForm.feedback}
                  onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })}
                  rows={3}
                  placeholder="Provide constructive feedback for student and parent..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setSelectedSubmission(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg text-xs">Cancel</button>
              <button onClick={handleSaveEvaluation} className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-xs">Submit Evaluation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkEvaluationDashboard;
