import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Paperclip, CheckCircle2, Clock, Filter, Search,
  PlusCircle, User, FileText, Image, Video, X, Bell, ShieldCheck, CornerDownLeft
} from 'lucide-react';
import { unifiedCommunicationService } from '../../services/unifiedCommunicationStore';

const MultiRoleMessagingSystem = ({ currentUserRole = 'Teacher', currentUserName = 'Ramesh Sharma' }) => {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'sent'
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState(null);

  // New Message Modal State
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessageForm, setNewMessageForm] = useState({
    targetRole: currentUserRole === 'Student' || currentUserRole === 'Parent' ? 'Teacher' : 'Parent',
    targetName: currentUserRole === 'Student' || currentUserRole === 'Parent' ? 'Ramesh Sharma (Mathematics)' : 'Suresh Verma (Parent of Rohan)',
    className: 'Grade 9 - A',
    subject: '',
    category: currentUserRole === 'Student' ? 'Academic Doubt' : 'Parent Query',
    text: '',
    fileName: '',
    fileType: 'PDF Document',
  });

  const loadMessages = () => {
    const list = unifiedCommunicationService.getMessagesForRole(currentUserRole, currentUserName);
    setMessages(list);
    if (selectedThread) {
      const refreshed = list.find((m) => m.id === selectedThread.id);
      if (refreshed) setSelectedThread(refreshed);
    }
  };

  useEffect(() => {
    loadMessages();
    const handleSync = () => loadMessages();
    window.addEventListener('messagesUpdated', handleSync);
    return () => window.removeEventListener('messagesUpdated', handleSync);
  }, [currentUserRole, currentUserName]);

  const handleSelectThread = (msg) => {
    setSelectedThread(msg);
    if (msg.unread && msg.targetRole === currentUserRole) {
      unifiedCommunicationService.markAsRead(msg.id);
      loadMessages();
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const attachmentObj = replyFile ? { fileName: replyFile.name, fileType: replyFile.type.includes('image') ? 'Image File' : 'Document File' } : null;

    unifiedCommunicationService.replyToThread(selectedThread.id, {
      senderName: currentUserName,
      senderRole: currentUserRole,
      text: replyText.trim(),
      attachment: attachmentObj,
    });

    setReplyText('');
    setReplyFile(null);
    loadMessages();
  };

  const handleCreateNewMessage = (e) => {
    e.preventDefault();
    if (!newMessageForm.subject.trim() || !newMessageForm.text.trim()) {
      alert('Please fill out the message subject and content.');
      return;
    }

    const attachmentObj = newMessageForm.fileName ? { fileName: newMessageForm.fileName, fileType: newMessageForm.fileType } : null;

    unifiedCommunicationService.sendMessage({
      senderRole: currentUserRole,
      senderName: currentUserName,
      targetRole: newMessageForm.targetRole,
      targetName: newMessageForm.targetName,
      className: newMessageForm.className,
      subject: newMessageForm.subject,
      category: newMessageForm.category,
      text: newMessageForm.text,
      attachment: attachmentObj,
    });

    setIsNewMessageOpen(false);
    setNewMessageForm({
      targetRole: currentUserRole === 'Student' || currentUserRole === 'Parent' ? 'Teacher' : 'Parent',
      targetName: currentUserRole === 'Student' || currentUserRole === 'Parent' ? 'Ramesh Sharma (Mathematics)' : 'Suresh Verma (Parent of Rohan)',
      className: 'Grade 9 - A',
      subject: '',
      category: currentUserRole === 'Student' ? 'Academic Doubt' : 'Parent Query',
      text: '',
      fileName: '',
      fileType: 'PDF Document',
    });
    loadMessages();
    alert('Message sent successfully!');
  };

  const filteredMessages = messages.filter((msg) => {
    const isInbox = activeTab === 'inbox' ? msg.targetRole === currentUserRole || msg.senderRole !== currentUserRole : msg.senderRole === currentUserRole;
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.targetName.toLowerCase().includes(searchQuery.toLowerCase());
    return isInbox && matchesSearch;
  });

  const unreadCount = messages.filter((m) => m.unread && m.targetRole === currentUserRole).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C4A86] text-white shadow-md">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Communication & Messaging Center</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-black text-white animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Role-based Messaging • Logged in as: <strong className="text-[#0C4A86]">{currentUserName} ({currentUserRole})</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewMessageOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0C4A86] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all self-start md:self-auto"
        >
          <PlusCircle className="h-4 w-4 text-amber-400" /> Start New Conversation
        </button>
      </div>

      {/* Main Grid: Message List & Active Conversation Thread */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Message Threads List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Controls & Search */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-extrabold">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'inbox' ? 'bg-[#0C4A86] text-white shadow-2xs' : 'text-slate-600'}`}
                >
                  Inbox ({messages.filter(m => m.targetRole === currentUserRole || m.senderRole !== currentUserRole).length})
                </button>
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'sent' ? 'bg-[#0C4A86] text-white shadow-2xs' : 'text-slate-600'}`}
                >
                  Sent ({messages.filter(m => m.senderRole === currentUserRole).length})
                </button>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Click item to view</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages by subject or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* List Cards */}
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs font-semibold text-slate-400">
                No messages found in this view.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedThread?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectThread(msg)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#0C4A86] bg-[#EBF5FF] shadow-xs'
                        : msg.unread && msg.targetRole === currentUserRole
                        ? 'border-amber-300 bg-amber-50/50 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#0C4A86]/15 px-2 py-0.5 text-[10px] font-black text-[#0C4A86]">
                        {msg.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{msg.dateFormatted}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{msg.subject}</h4>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
                      <span>From: <strong className="text-slate-800">{msg.senderName}</strong> ({msg.senderRole})</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{msg.className}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation View & Thread Reply */}
        <div className="lg:col-span-7">
          {selectedThread ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between min-h-[550px]">
              {/* Thread Header */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-extrabold text-[#0C4A86] border border-[#BFDBFE]">
                    {selectedThread.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Class: {selectedThread.className}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedThread.subject}</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Participants: <strong className="text-slate-800">{selectedThread.senderName}</strong> & <strong className="text-slate-800">{selectedThread.targetName}</strong>
                </p>
              </div>

              {/* Chat Thread Messages Bubbles */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 my-2">
                {selectedThread.thread.map((item, idx) => {
                  const isMe = item.senderRole === currentUserRole || item.senderName.includes(currentUserName);
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-extrabold text-slate-500">
                        <span>{item.senderName} ({item.senderRole})</span>
                        <span>• {item.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-md rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-[#0C4A86] text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{item.text}</p>
                        {item.attachment && (
                          <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center gap-1.5 font-bold text-[11px]">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span>Attachment: {item.attachment.fileName} ({item.attachment.fileType})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="border-t border-slate-200 pt-4 space-y-3">
                <div className="relative">
                  <textarea
                    rows="3"
                    required
                    placeholder="Type your reply message here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 text-xs font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="reply-file-upload"
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-[#0C4A86]" />
                      <span>{replyFile ? replyFile.name : 'Attach File / Photo'}</span>
                      <input
                        id="reply-file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setReplyFile(e.target.files[0])}
                      />
                    </label>
                    {replyFile && (
                      <button
                        type="button"
                        onClick={() => setReplyFile(null)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0C4A86] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-black transition-all"
                  >
                    <Send className="h-4 w-4" /> Send Reply
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 space-y-3 min-h-[550px] flex flex-col items-center justify-center">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <h3 className="text-base font-extrabold text-slate-700">No Conversation Selected</h3>
              <p className="text-xs font-semibold max-w-sm">
                Select a message thread from the list on the left to read conversation details and send replies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Start New Conversation Modal */}
      {isNewMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-[#0C4A86] flex items-center gap-2">
                <Send className="h-5 w-5 text-[#0096DA]" /> Send New Message
              </h3>
              <button onClick={() => setIsNewMessageOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMessage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700">Recipient Role *</label>
                  <select
                    value={newMessageForm.targetRole}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, targetRole: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                  >
                    {currentUserRole === 'Parent' ? (
                      <>
                        <option value="Teacher">Teacher</option>
                        <option value="Principal">Principal</option>
                      </>
                    ) : (
                      <>
                        <option value="Teacher">Teacher</option>
                        <option value="Parent">Parent</option>
                        <option value="Student">Student</option>
                        <option value="Principal">Principal</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700">Target Class *</label>
                  <select
                    value={newMessageForm.className}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, className: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                  >
                    <option value="Grade 9 - A">Grade 9 - A</option>
                    <option value="Grade 6 - B">Grade 6 - B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Recipient Name / Authorized Contact *</label>
                {currentUserRole === 'Parent' ? (
                  <select
                    value={newMessageForm.targetName}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, targetName: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Ramesh Sharma (Class Teacher - Mathematics)">Ramesh Sharma (Class Teacher - Mathematics)</option>
                    <option value="Sunita Verma (Science Faculty)">Sunita Verma (Science Faculty)</option>
                    <option value="Vikram Patel (English Literature)">Vikram Patel (English Literature)</option>
                    <option value="Dr. Anita Roy (School Principal)">Dr. Anita Roy (School Principal)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma / Suresh Verma"
                    value={newMessageForm.targetName}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, targetName: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Subject / Query Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question 5 Doubt in Math Homework"
                  value={newMessageForm.subject}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Detailed Message Text *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write your doubt, question, or inquiry..."
                  value={newMessageForm.text}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, text: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="font-extrabold text-slate-700">Attachment File Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. homework_question5.png"
                  value={newMessageForm.fileName}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, fileName: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-800 focus:border-[#0C4A86] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewMessageOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0C4A86] px-5 py-2 font-extrabold text-white shadow-sm hover:bg-black transition"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiRoleMessagingSystem;
