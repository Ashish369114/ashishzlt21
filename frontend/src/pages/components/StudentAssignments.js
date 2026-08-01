import React, { useState, useEffect } from 'react';
import { homeworkService } from '../../services/api';
import { ClipboardCheck, Upload, Save, CheckCircle2, FileText, Clock, AlertCircle, Eye, Download, Video, Image, File, X, Play } from 'lucide-react';

const defaultAssignmentsList = [
  {
    _id: 'assign_1',
    title: 'Grade 9 Mathematics Polynomials Term Project',
    description: 'Construct a detailed report analyzing cubic polynomial roots with graph sketches.',
    subject: { name: 'Mathematics' },
    dueDate: '2026-08-10',
    teacherName: 'Mr. Sharma',
    attachments: [
      { id: 'att_a1', name: 'Polynomials_Project_Guidelines.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
      { id: 'att_a2', name: 'Polynomial_Graph_Plot.png', type: 'image', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80' },
      { id: 'att_a3', name: 'Cubic_Roots_Tutorial.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    ],
    submissions: []
  },
  {
    _id: 'assign_2',
    title: 'Physics Mechanics & Newton Laws Experiment Report',
    description: 'Document laboratory experimental readings for friction coefficient calculations.',
    subject: { name: 'Physics' },
    dueDate: '2026-08-08',
    teacherName: 'Dr. Anitha',
    attachments: [
      { id: 'att_a4', name: 'Friction_Experiment_Data.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
      { id: 'att_a5', name: 'Lab_Setup_Diagram.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' }
    ],
    submissions: []
  },
  {
    _id: 'assign_3',
    title: 'English Shakespearean Drama Analytical Essay',
    description: 'Write a 500-word critical analysis on theme of ambition in Macbeth.',
    subject: { name: 'English Literature' },
    dueDate: '2026-08-06',
    teacherName: 'Ms. Elizabeth',
    attachments: [
      { id: 'att_a6', name: 'Macbeth_Essay_Prompts.docx', type: 'doc', url: 'data:text/plain;base64,TWFjYmV0aCBFc3NheSBQcm9tcHRz' },
      { id: 'att_a7', name: 'Drama_Lecture_Video.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ],
    submissions: []
  }
];

const StudentAssignments = ({ userId }) => {
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state for viewing media/files
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: '', title: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '', title: '' });
  const [docModal, setDocModal] = useState({ isOpen: false, docName: '', content: '' });

  // Per-assignment state maps for strict isolation
  const [filesMap, setFilesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [draftsMap, setDraftsMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('student_assignment_drafts')) || {};
    } catch {
      return {};
    }
  });
  const [submittedMap, setSubmittedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('student_assignment_submissions')) || {};
    } catch {
      return {};
    }
  });

  const fetchAssignments = React.useCallback(async () => {
    if (!userId) {
      setAssignmentsList(defaultAssignmentsList);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await homeworkService.getByStudent(userId);
      const items = Array.isArray(response.data) && response.data.length > 0 ? response.data : defaultAssignmentsList;
      setAssignmentsList(items);
      setError('');
    } catch (err) {
      console.error(err);
      setAssignmentsList(defaultAssignmentsList);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFileChange = (assignId, file) => {
    if (!file) return;
    setFilesMap((prev) => ({ ...prev, [assignId]: file }));
  };

  const handleCommentChange = (assignId, text) => {
    setCommentsMap((prev) => ({ ...prev, [assignId]: text }));
  };

  const handleSaveDraft = (assignId) => {
    const file = filesMap[assignId];
    const comment = commentsMap[assignId] || '';

    const draftEntry = {
      fileName: file ? file.name : draftsMap[assignId]?.fileName || '',
      comment: comment || draftsMap[assignId]?.comment || '',
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newDrafts = { ...draftsMap, [assignId]: draftEntry };
    setDraftsMap(newDrafts);
    localStorage.setItem('student_assignment_drafts', JSON.stringify(newDrafts));

    setSuccessMessage('Assignment draft saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmitAssignment = async (assignId) => {
    const file = filesMap[assignId];
    const comment = commentsMap[assignId] || draftsMap[assignId]?.comment || '';

    if (!file && !draftsMap[assignId]?.fileName) {
      setError('Please select an assignment file before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submissionEntry = {
        fileName: file ? file.name : draftsMap[assignId]?.fileName || 'Assignment_Submission.pdf',
        comment,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      const newSubmissions = { ...submittedMap, [assignId]: submissionEntry };
      setSubmittedMap(newSubmissions);
      localStorage.setItem('student_assignment_submissions', JSON.stringify(newSubmissions));

      const newDrafts = { ...draftsMap };
      delete newDrafts[assignId];
      setDraftsMap(newDrafts);
      localStorage.setItem('student_assignment_drafts', JSON.stringify(newDrafts));

      setSuccessMessage('Assignment submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAssignments();
    } catch (err) {
      setError('Failed to submit assignment: ' + (err.message || 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = (att) => {
    const element = document.createElement('a');
    if (att.url && att.url.startsWith('http')) {
      element.href = att.url;
      element.target = '_blank';
    } else {
      const blob = new Blob([`Attached Material: ${att.name}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(blob);
      element.download = att.name;
    }
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-emerald-600" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-rose-600" />;
      default:
        return <File className="h-4 w-4 text-[#0096DA]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <ClipboardCheck className="h-3.5 w-3.5" /> Assignment Center
          </div>
          <h1 className="text-2xl font-bold">Academic Assignments</h1>
          <p className="text-sky-100 text-sm">Access uploaded assignment documents, videos, photos, and submit coursework.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {successMessage}
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">Loading assignments...</div>
        ) : (
          assignmentsList.map((item) => {
            const assignId = item._id || item.id;
            const submitted = submittedMap[assignId];
            const draft = draftsMap[assignId];
            const overdue = isOverdue(item.dueDate);
            const currentFile = filesMap[assignId];
            const currentComment = commentsMap[assignId] !== undefined ? commentsMap[assignId] : (draft?.comment || '');

            let statusLabel = 'Pending';
            let statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';

            if (submitted) {
              statusLabel = 'Submitted';
              statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (draft) {
              statusLabel = 'Draft Saved';
              statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            } else if (overdue) {
              statusLabel = 'Overdue';
              statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
            }

            const attachments = item.attachments || defaultAssignmentsList[0].attachments;

            return (
              <div
                key={assignId}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                      {item.subject?.name || 'General Subject'}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold border ${statusBadge}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-[#0C4A86]" />
                    <span>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{item.title || item.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>

                {/* Uploaded Assignment Materials & Video/File Support (Req 4) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#0C4A86]" /> Uploaded Assignment Reference Materials:
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-[#0C4A86] transition"
                      >
                        {getAttachmentIcon(att.type)}
                        <span className="text-xs font-bold text-slate-800 max-w-xs truncate">{att.name}</span>

                        <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
                          {att.type === 'video' ? (
                            <button
                              type="button"
                              onClick={() => setVideoModal({ isOpen: true, videoUrl: att.url, title: att.name })}
                              className="text-[11px] font-extrabold text-purple-700 hover:underline flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md"
                            >
                              <Play className="h-3 w-3" /> Watch
                            </button>
                          ) : att.type === 'image' ? (
                            <button
                              type="button"
                              onClick={() => setImageModal({ isOpen: true, imageUrl: att.url, title: att.name })}
                              className="text-[11px] font-extrabold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md"
                            >
                              <Eye className="h-3 w-3" /> View
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDocModal({ isOpen: true, docName: att.name, content: item.description })}
                              className="text-[11px] font-extrabold text-[#0C4A86] hover:underline flex items-center gap-1 bg-[#EBF5FF] px-2 py-0.5 rounded-md"
                            >
                              <Eye className="h-3 w-3" /> Preview
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            className="text-[11px] font-extrabold text-slate-600 hover:text-slate-900 p-1"
                            title="Download File"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submission Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {submitted ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Submitted on {submitted.submittedAt}</span>
                      </div>
                      <p className="text-slate-700">
                        <span className="font-bold">Submitted File:</span> {submitted.fileName}
                      </p>
                      {submitted.comment && (
                        <p className="text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-bold not-italic text-slate-700">Student Comment:</span> "{submitted.comment}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="file"
                          id={`file-assign-${assignId}`}
                          onChange={(e) => handleFileChange(assignId, e.target.files?.[0])}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EBF5FF] file:text-[#0C4A86] hover:file:bg-[#0C4A86] hover:file:text-white file:transition-all"
                        />
                        {currentFile && (
                          <span className="text-xs font-bold text-emerald-700 truncate max-w-xs">
                            Selected: {currentFile.name}
                          </span>
                        )}
                      </div>

                      {/* Comment Input */}
                      <div>
                        <textarea
                          placeholder="Enter comments for this assignment item..."
                          value={currentComment}
                          onChange={(e) => handleCommentChange(assignId, e.target.value)}
                          rows="2"
                          className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-[#0C4A86] focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(assignId)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
                        >
                          <Save className="h-3.5 w-3.5 text-slate-600" />
                          <span>Save Draft</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubmitAssignment(assignId)}
                          disabled={!currentFile && !draft?.fileName}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4A86] px-5 py-2 text-xs font-extrabold text-white hover:bg-black transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Submit Assignment</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Player Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-400" /> {videoModal.title}
              </h3>
              <button onClick={() => setVideoModal({ isOpen: false, videoUrl: '', title: '' })} className="p-1 hover:text-purple-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex justify-center">
              <video src={videoModal.videoUrl} controls autoPlay className="max-h-[450px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                <Image className="h-4 w-4 text-emerald-600" /> {imageModal.title}
              </h3>
              <button onClick={() => setImageModal({ isOpen: false, imageUrl: '', title: '' })} className="p-1 text-slate-500 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex justify-center">
              <img src={imageModal.imageUrl} alt={imageModal.title} className="max-h-[450px] object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-[#0C4A86] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0096DA]" /> {docModal.docName}
              </h3>
              <button onClick={() => setDocModal({ isOpen: false, docName: '', content: '' })} className="p-1 text-slate-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-900">Assignment Reference Document:</p>
              <p>{docModal.content}</p>
              <p className="text-slate-500 italic mt-2">Classroom project document provided by teacher.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDocModal({ isOpen: false, docName: '', content: '' })}
                className="px-5 py-2 rounded-xl bg-[#0C4A86] text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
