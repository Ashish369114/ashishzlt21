import React, { useState } from 'react';
import { MessageSquare, AlertCircle, User, Building, Paperclip, Upload, FileText, Image, CheckCircle2, Trash2, Send } from 'lucide-react';

const StudentCommunication = () => {
  const [activeTab, setActiveTab] = useState('school_complaint'); // 'school_complaint' | 'teacher_concern' | 'discussions' | 'uploads'

  // Submissions state
  const [schoolComplaints, setSchoolComplaints] = useState([
    {
      id: 1,
      category: 'Infrastructure',
      subject: 'Broken Projector in Room 201',
      details: 'The smart projector in Class 10-A Room 201 flashes red and turns off during science lectures.',
      date: '2026-07-24',
      status: 'Under Review',
      attachmentName: 'classroom_projector.jpg',
      attachmentType: 'image/jpeg',
    },
    {
      id: 2,
      category: 'Library',
      subject: 'Request for additional Physics reference books',
      details: 'Please add 5 more copies of Halliday Resnick Physics to the senior library reference section.',
      date: '2026-07-20',
      status: 'Resolved',
      attachmentName: null,
    },
  ]);

  const [teacherConcerns, setTeacherConcerns] = useState([
    {
      id: 1,
      teacher: 'Mr. Sharma (Mathematics)',
      subject: 'Doubt in Calculus Chapter 3 Problem 14',
      message: 'Sir, I tried solving question 14 using substitution method but got a discrepancy. Attached my working sheet.',
      date: '2026-07-25',
      status: 'Replied',
      reply: 'Great attempt! Check line 4 where the negative sign was omitted. See you after class tomorrow.',
      attachmentName: 'math_working_sheet.pdf',
      attachmentType: 'application/pdf',
    },
  ]);

  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      teacher: 'Dr. Anitha (Science)',
      topic: 'Preparation for National Science Olympiad 2026',
      posts: [
        { sender: 'Dr. Anitha', text: 'Welcome to the Olympiad discussion group! Post your questions or prep materials here.', time: 'July 20' },
        { sender: 'You', text: 'Maam, which reference guide should we prioritize for organic chemistry?', time: 'July 21', attachmentName: 'syllabus_query.pdf' },
        { sender: 'Dr. Anitha', text: 'Focus on NCERT Exemplar and Chapter 4 conceptual problems.', time: 'July 21' },
      ],
    },
  ]);

  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'Science_Project_Draft.pdf', size: '2.4 MB', type: 'application/pdf', uploadDate: '2026-07-22' },
    { id: 2, name: 'Math_Worksheet_Solution.png', size: '1.1 MB', type: 'image/png', uploadDate: '2026-07-25' },
  ]);

  // Form states
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('Academic');
  const [selectedTeacher, setSelectedTeacher] = useState('Mr. Sharma (Mathematics)');
  const [selectedFile, setSelectedFile] = useState(null);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [activeDiscussionId, setActiveDiscussionId] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle File Input Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'txt'];
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        setErrorMsg('Invalid file format. Please upload PDF, images, or documents (.pdf, .png, .jpg, .doc, .txt)');
        setSelectedFile(null);
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
    }
  };

  // Submit Complaint to School
  const handleSubmitSchoolComplaint = (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setErrorMsg('Please enter both subject and complaint details.');
      return;
    }

    const newComplaint = {
      id: Date.now(),
      category,
      subject: subject.trim(),
      details: details.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      attachmentName: selectedFile ? selectedFile.name : null,
      attachmentType: selectedFile ? selectedFile.type : null,
    };

    if (selectedFile) {
      setUploadedFiles(prev => [
        {
          id: Date.now(),
          name: selectedFile.name,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          type: selectedFile.type,
          uploadDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }

    setSchoolComplaints([newComplaint, ...schoolComplaints]);
    setSubject('');
    setDetails('');
    setSelectedFile(null);
    setErrorMsg('');
    setFeedbackMsg('School complaint submitted successfully!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Submit Concern to Teacher
  const handleSubmitTeacherConcern = (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setErrorMsg('Please enter subject and concern details.');
      return;
    }

    const newConcern = {
      id: Date.now(),
      teacher: selectedTeacher,
      subject: subject.trim(),
      message: details.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Sent',
      reply: null,
      attachmentName: selectedFile ? selectedFile.name : null,
      attachmentType: selectedFile ? selectedFile.type : null,
    };

    if (selectedFile) {
      setUploadedFiles(prev => [
        {
          id: Date.now(),
          name: selectedFile.name,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          type: selectedFile.type,
          uploadDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }

    setTeacherConcerns([newConcern, ...teacherConcerns]);
    setSubject('');
    setDetails('');
    setSelectedFile(null);
    setErrorMsg('');
    setFeedbackMsg(`Concern sent directly to ${selectedTeacher}!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Post Discussion Reply
  const handlePostDiscussionMessage = (e) => {
    e.preventDefault();
    if (!discussionMessage.trim()) return;

    const updatedDiscussions = discussions.map(disc => {
      if (disc.id === activeDiscussionId) {
        return {
          ...disc,
          posts: [
            ...disc.posts,
            {
              sender: 'You',
              text: discussionMessage.trim(),
              time: 'Just now',
              attachmentName: selectedFile ? selectedFile.name : null,
            },
          ],
        };
      }
      return disc;
    });

    if (selectedFile) {
      setUploadedFiles(prev => [
        {
          id: Date.now(),
          name: selectedFile.name,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          type: selectedFile.type,
          uploadDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }

    setDiscussions(updatedDiscussions);
    setDiscussionMessage('');
    setSelectedFile(null);
  };

  // Standalone File Upload
  const handleDirectFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'txt'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMsg('Invalid file format. Please upload PDF, images, or documents.');
      return;
    }

    const newUpload = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      uploadDate: new Date().toISOString().slice(0, 10),
    };

    setUploadedFiles([newUpload, ...uploadedFiles]);
    setErrorMsg('');
    setFeedbackMsg(`Uploaded file: ${file.name}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleRemoveUploadedFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C4A86] to-[#0096DA] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <MessageSquare className="h-3.5 w-3.5" /> Student Portal
          </div>
          <h1 className="text-2xl font-bold">Communication</h1>
          <p className="text-blue-100 text-sm">Submit complaints to school, address teacher concerns & participate in discussions.</p>
        </div>

        {/* Standalone Upload Button */}
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-all">
          <Upload className="h-4 w-4" /> Upload Document
          <input
            type="file"
            className="hidden"
            accept=".pdf,image/*,.doc,.docx,.txt"
            onChange={handleDirectFileUpload}
          />
        </label>
      </div>

      {/* Feedback Alerts */}
      {feedbackMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {feedbackMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-600" /> {errorMsg}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setActiveTab('school_complaint'); setErrorMsg(''); setSelectedFile(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'school_complaint'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building className="h-4 w-4" /> School Complaints & Issues
        </button>

        <button
          onClick={() => { setActiveTab('teacher_concern'); setErrorMsg(''); setSelectedFile(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'teacher_concern'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <User className="h-4 w-4" /> Personal Teacher Concerns
        </button>

        <button
          onClick={() => { setActiveTab('discussions'); setErrorMsg(''); setSelectedFile(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'discussions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Teacher Discussions
        </button>

        <button
          onClick={() => { setActiveTab('uploads'); setErrorMsg(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'uploads'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Paperclip className="h-4 w-4" /> Uploaded Documents ({uploadedFiles.length})
        </button>
      </div>

      {/* TAB 1: School Complaints */}
      {activeTab === 'school_complaint' && (
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Submit Complaint / Issue to School</h3>
            
            <form onSubmit={handleSubmitSchoolComplaint} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option>Academic</option>
                  <option>Infrastructure & Classroom</option>
                  <option>Transport & Bus</option>
                  <option>Library & Facilities</option>
                  <option>Canteen & Sanitation</option>
                  <option>Other / General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue with classroom air circulation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your issue or concern in detail..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload Attachment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4 text-slate-400" /> Attach File (PDF, Image, Document)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {selectedFile && (
                  <p className="mt-1 text-xs text-blue-600 font-semibold">Attached: {selectedFile.name}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                Submit School Complaint
              </button>
            </form>
          </div>

          {/* School Complaints History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Submitted School Complaints</h3>
            
            <div className="space-y-3">
              {schoolComplaints.map(comp => (
                <div key={comp.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5">
                      {comp.category}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{comp.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{comp.details}</p>
                  {comp.attachmentName && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                      <Paperclip className="h-3 w-3 text-blue-500" /> {comp.attachmentName}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-2">Submitted on {comp.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Personal Teacher Concerns */}
      {activeTab === 'teacher_concern' && (
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Submit Personal Concern to Teacher</h3>
            
            <form onSubmit={handleSubmitTeacherConcern} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option>Mr. Sharma (Mathematics)</option>
                  <option>Dr. Anitha (Science)</option>
                  <option>Ms. Elizabeth (English)</option>
                  <option>Mrs. Verma (Social Studies)</option>
                  <option>Mr. Rajesh (Computer Science)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clarification on homework assignment"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Private Message / Concern</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message directly to the teacher..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Upload Attachment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4 text-slate-400" /> Upload File (PDF, Images, Documents)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
              >
                Send Message to Teacher
              </button>
            </form>
          </div>

          {/* Sent Teacher Concerns History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Teacher Concerns History</h3>

            <div className="space-y-4">
              {teacherConcerns.map(item => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 text-xs">{item.teacher}</span>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    "{item.message}"
                  </p>

                  {item.reply && (
                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <p className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Teacher Response:
                      </p>
                      <p className="italic">"{item.reply}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Teacher Discussions */}
      {activeTab === 'discussions' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Teacher Discussions & Q&A Forum</h3>
            <p className="text-xs text-slate-500">Participate in group discussions with teachers and classmates.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            {/* Discussion Threads List */}
            <div className="space-y-2 border-r border-slate-100 pr-4">
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Active Threads</p>
              {discussions.map(disc => (
                <button
                  key={disc.id}
                  onClick={() => setActiveDiscussionId(disc.id)}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all ${
                    activeDiscussionId === disc.id
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-xs">{disc.topic}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{disc.teacher}</p>
                </button>
              ))}
            </div>

            {/* Active Thread Chat */}
            <div className="space-y-4 flex flex-col justify-between min-h-[300px]">
              {discussions
                .filter(d => d.id === activeDiscussionId)
                .map(disc => (
                  <div key={disc.id} className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm">{disc.topic}</h4>
                      <p className="text-xs text-slate-500">Moderator: {disc.teacher}</p>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                      {disc.posts.map((post, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl max-w-lg text-xs space-y-1 ${
                            post.sender === 'You'
                              ? 'ml-auto bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] opacity-80">
                            <span className="font-bold">{post.sender}</span>
                            <span>{post.time}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{post.text}</p>
                          {post.attachmentName && (
                            <div className="inline-flex items-center gap-1 text-[10px] mt-1 bg-white/20 px-2 py-0.5 rounded">
                              <Paperclip className="h-3 w-3" /> {post.attachmentName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Post reply form */}
                    <form onSubmit={handlePostDiscussionMessage} className="flex gap-2 pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        placeholder="Write a response or ask a question..."
                        value={discussionMessage}
                        onChange={(e) => setDiscussionMessage(e.target.value)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Send className="h-3.5 w-3.5" /> Send
                      </button>
                    </form>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Uploaded Documents */}
      {activeTab === 'uploads' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Uploaded Files & Documents</h3>
              <p className="text-xs text-slate-500">Upload PDF files, images, and other relevant academic documents.</p>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition-all">
              <Upload className="h-4 w-4" /> Upload New File
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/*,.doc,.docx,.txt"
                onChange={handleDirectFileUpload}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {uploadedFiles.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-slate-400 py-8">No files uploaded yet.</p>
            ) : (
              uploadedFiles.map(file => (
                <div key={file.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
                      {file.name.endsWith('.pdf') ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-[200px]">{file.name}</h4>
                      <p className="text-[11px] text-slate-400">{file.size} • Uploaded {file.uploadDate}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveUploadedFile(file.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
                    title="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCommunication;
