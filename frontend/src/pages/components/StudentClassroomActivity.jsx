import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Image, Video, Download, Filter, Sparkles, Eye, Play, X, File } from 'lucide-react';

const defaultClassroomActivities = [
  {
    id: 101,
    title: 'Grade 9 Science Lab Experiment - Exothermic Chemical Reactions',
    grade: 'Grade 9',
    section: 'A',
    subject: 'Science / Chemistry',
    teacherName: 'Dr. Vikram Sharma',
    category: 'Lab Experiment',
    date: '2026-07-28',
    description: 'Practical demonstration of exothermic chemical reactions, gas evolution, and indicator color changes observed during acid-base titration.',
    attachments: [
      { id: 'ca_1', name: 'Lab_Report_Guidelines.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
      { id: 'ca_2', name: 'Titration_Reaction_Photo.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' },
      { id: 'ca_3', name: 'Exothermic_Demo_Video.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    ]
  },
  {
    id: 102,
    title: 'Classroom Group Discussion - Environmental Conservation Project',
    grade: 'Grade 9',
    section: 'A',
    subject: 'Social Studies',
    teacherName: 'Ms. Anita Deshmukh',
    category: 'Group Activity',
    date: '2026-07-26',
    description: 'Students participated in group brainstorming sessions on plastic waste reduction and renewable energy solutions for urban schools.',
    attachments: [
      { id: 'ca_4', name: 'Project_Presentation_Slides.docx', type: 'doc', url: 'data:text/plain;base64,UHJlc2VudGF0aW9uIFNsaWRlcw==' },
      { id: 'ca_5', name: 'Group_Brainstorming_Photo.png', type: 'image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  {
    id: 103,
    title: 'Mathematics Problem Solving Challenge - Quadratic Equations',
    grade: 'Grade 9',
    section: 'A',
    subject: 'Mathematics',
    teacherName: 'Mr. Rajesh Kumar',
    category: 'Classroom Challenge',
    date: '2026-07-24',
    description: 'Speed problem-solving quiz focusing on factoring quadratic polynomials and discriminant formula applications.',
    attachments: [
      { id: 'ca_6', name: 'Quadratic_Quiz_Solutions.pdf', type: 'pdf', url: 'data:application/pdf;base64,JVBERi0xLjQK...' },
      { id: 'ca_7', name: 'Polynomial_Problem_Solving.mp4', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  }
];

const StudentClassroomActivity = ({ user, student }) => {
  const [activities, setActivities] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals state for viewing media/files
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoUrl: '', title: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '', title: '' });
  const [docModal, setDocModal] = useState({ isOpen: false, docName: '', content: '' });

  const studentGrade = 'Grade 9';
  const studentSection = 'A';

  useEffect(() => {
    const loadActivities = () => {
      setLoading(true);
      const stored = localStorage.getItem('classroom_activities');
      let loaded = defaultClassroomActivities;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loaded = [...parsed, ...defaultClassroomActivities];
          }
        } catch (e) {
          console.error('Error parsing classroom_activities:', e);
        }
      }

      setActivities(loaded);
      setLoading(false);
    };

    loadActivities();
  }, [studentGrade, studentSection]);

  const subjectsList = ['All', ...new Set(activities.map((a) => a.subject).filter(Boolean))];

  const displayedActivities = activities.filter((act) => {
    if (selectedSubject === 'All') return true;
    return act.subject === selectedSubject;
  });

  const getAttachmentIcon = (type = '') => {
    const ft = type.toLowerCase();
    if (ft.includes('video') || ft.includes('mp4')) return <Video className="h-4 w-4 text-purple-600" />;
    if (ft.includes('image') || ft.includes('jpg') || ft.includes('png')) return <Image className="h-4 w-4 text-emerald-600" />;
    if (ft.includes('pdf')) return <FileText className="h-4 w-4 text-rose-600" />;
    return <File className="h-4 w-4 text-[#0096DA]" />;
  };

  const handleDownloadAttachment = (att) => {
    const element = document.createElement('a');
    if (att.url && att.url.startsWith('http')) {
      element.href = att.url;
      element.target = '_blank';
    } else {
      const blob = new Blob([`Classroom Activity Attachment: ${att.name}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(blob);
      element.download = att.name;
    }
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Learning
          </div>
          <h1 className="text-2xl font-bold">Classroom Activities & Workshops</h1>
          <p className="text-sky-100 text-sm">
            View interactive classroom activities, teacher uploads, workshop videos, photos, and documents.
          </p>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-4 w-4 text-[#0C4A86]" /> Filter Subject:
          </span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-64 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none transition-all shadow-sm cursor-pointer"
          >
            {subjectsList.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-[#0C4A86] font-extrabold">{displayedActivities.length}</span> activities
        </div>
      </div>

      {/* Activity Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">Loading classroom activities...</div>
        ) : displayedActivities.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No classroom activities uploaded for this subject yet.
          </div>
        ) : (
          displayedActivities.map((act) => {
            const attachments = act.attachments || [
              { id: 'default_att', name: act.fileName || 'Activity_Report.pdf', type: 'pdf', url: act.fileUrl }
            ];

            return (
              <div
                key={act.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                      {act.subject || 'General Subject'}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                      {act.category || 'Class Activity'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {act.grade || studentGrade} - Sec {act.section || studentSection}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-[#0C4A86]" />
                    <span>{act.date ? new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{act.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{act.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <User className="h-4 w-4 text-[#0C4A86]" />
                  <span>Subject Teacher: {act.teacherName || 'Faculty'}</span>
                </div>

                {/* Uploaded Files, Videos, Images, Documents Bar (Req 14) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Uploaded Activity Materials & Media:
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
                              <Eye className="h-3 w-3" /> Photo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDocModal({ isOpen: true, docName: att.name, content: act.description })}
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
              <p className="font-bold text-slate-900">Classroom Activity Summary:</p>
              <p>{docModal.content}</p>
              <p className="text-slate-500 italic mt-2">Classroom activity material uploaded by teacher.</p>
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

export default StudentClassroomActivity;
