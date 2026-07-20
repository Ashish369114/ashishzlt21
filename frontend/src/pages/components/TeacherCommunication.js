import React, { useState, useEffect } from 'react';

const TeacherCommunication = ({ teacherId, user }) => {
  const [notices, setNotices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notices');
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientType, setRecipientType] = useState('students'); // 'students' or 'parents'
  const [currentChat, setCurrentChat] = useState(null);

  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    recipients: 'all', // 'all', 'class', 'specific'
    targetClass: '',
  });

  const [messageData, setMessageData] = useState({
    recipientName: '',
    recipientType: 'student',
    message: '',
  });

  // Simulated data
  const [recipients] = useState([
    { id: 1, name: 'Class 10A', type: 'class', studentCount: 35 },
    { id: 2, name: 'Class 10B', type: 'class', studentCount: 32 },
    { id: 3, name: 'Ramesh Kumar', type: 'student', studentId: 'STU001' },
    { id: 4, name: 'Priya Sharma', type: 'student', studentId: 'STU002' },
    { id: 5, name: 'Anil Patel', type: 'student', studentId: 'STU003' },
    { id: 6, name: 'Mr. Kumar (Parent)', type: 'parent', studentId: 'STU001' },
    { id: 7, name: 'Mrs. Sharma (Parent)', type: 'parent', studentId: 'STU002' },
    { id: 8, name: 'Mr. Patel (Parent)', type: 'parent', studentId: 'STU003' },
  ]);

  useEffect(() => {
    // Load initial data
    loadNotices();
  }, []);

  const loadNotices = () => {
    // Simulated notices
    setNotices([
      {
        id: 1,
        title: 'Exam Schedule Updated',
        content: 'The final exam schedule for Q1 has been updated. Please check the new dates in your class portal.',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        recipientCount: 67,
        type: 'announcement',
      },
      {
        id: 2,
        title: 'Assignment Submission Deadline',
        content: 'Please submit all pending assignments by Friday EOD. Late submissions will have marks deduction.',
        sentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        recipientCount: 35,
        type: 'reminder',
      },
      {
        id: 3,
        title: 'Class Cancelled Tomorrow',
        content: 'Due to a special assembly, Math class is cancelled tomorrow. New schedule will be updated soon.',
        sentDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        recipientCount: 32,
        type: 'cancellation',
      },
    ]);
  };

  const handleNoticeInputChange = (e) => {
    const { name, value } = e.target;
    setNoticeData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeData.title || !noticeData.content) {
      alert('Please fill all required fields');
      return;
    }

    const newNotice = {
      id: notices.length + 1,
      title: noticeData.title,
      content: noticeData.content,
      sentDate: new Date(),
      recipientCount: 67,
      type: 'general',
    };

    setNotices([newNotice, ...notices]);
    setNoticeData({ title: '', content: '', recipients: 'all', targetClass: '' });
    setShowNoticeForm(false);
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageData.recipientName || !messageData.message) {
      alert('Please select recipient and type a message');
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      sender: user?.firstName + ' ' + user?.lastName,
      recipient: messageData.recipientName,
      recipientType: messageData.recipientType,
      content: messageData.message,
      sentDate: new Date(),
      read: false,
    };

    setMessages([newMessage, ...messages]);
    setMessageData({ recipientName: '', recipientType: 'student', message: '' });
    setShowChatModal(false);
  };

  const filteredRecipients = recipientType === 'students'
    ? recipients.filter(r => r.type === 'student' || r.type === 'class')
    : recipients.filter(r => r.type === 'parent');

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Notices Sent</h3>
          <div className="value">{notices.length}</div>
        </div>
        <div className="stat-card">
          <h3>Messages Sent</h3>
          <div className="value" style={{ color: '#10b981' }}>{messages.length}</div>
        </div>
        <div className="stat-card">
          <h3>Recipients Reached</h3>
          <div className="value" style={{ color: '#3b82f6' }}>
            {notices.reduce((sum, n) => sum + (n.recipientCount || 0), 0) + messages.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'notices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('notices')}
        >
          📢 Notices
        </button>
        <button
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
      </div>

      {activeTab === 'notices' && (
        <>
          {!showNoticeForm && (
            <button
              className="btn btn-primary"
              onClick={() => setShowNoticeForm(true)}
              style={{ marginBottom: '20px' }}
            >
              📢 Send Notice
            </button>
          )}

          {showNoticeForm && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h2>📢 Create New Notice</h2>
              </div>
              <form onSubmit={handleCreateNotice}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Notice Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={noticeData.title}
                      onChange={handleNoticeInputChange}
                      placeholder="e.g., Exam Schedule Updated"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Send To *</label>
                    <select
                      name="recipients"
                      value={noticeData.recipients}
                      onChange={handleNoticeInputChange}
                      required
                    >
                      <option value="all">All Classes</option>
                      <option value="class">Specific Class</option>
                      <option value="specific">Specific Students</option>
                    </select>
                  </div>
                </div>

                {noticeData.recipients === 'class' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Class *</label>
                      <select
                        name="targetClass"
                        value={noticeData.targetClass}
                        onChange={handleNoticeInputChange}
                      >
                        <option value="">-- Choose Class --</option>
                        <option value="10A">Class 10A</option>
                        <option value="10B">Class 10B</option>
                        <option value="9A">Class 9A</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Notice Content *</label>
                    <textarea
                      name="content"
                      value={noticeData.content}
                      onChange={handleNoticeInputChange}
                      placeholder="Type your notice here..."
                      rows="5"
                      required
                    ></textarea>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">✓ Send Notice</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowNoticeForm(false);
                      setNoticeData({ title: '', content: '', recipients: 'all', targetClass: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {notices.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {notices.map(notice => (
                <div
                  key={notice.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>
                        {notice.type === 'announcement' && '📢'} 
                        {notice.type === 'reminder' && '⏰'} 
                        {notice.type === 'cancellation' && '❌'} 
                        {' '}{notice.title}
                      </h3>
                      <div style={{ fontSize: '0.85em', color: '#6b7280' }}>
                        {notice.sentDate.toLocaleString()} • Sent to {notice.recipientCount} recipients
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p style={{ margin: '10px 0 0 0', color: '#374151' }}>
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No notices sent yet
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'messages' && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${recipientType === 'students' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRecipientType('students')}
            >
              👨‍🎓 Students
            </button>
            <button
              className={`btn ${recipientType === 'parents' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRecipientType('parents')}
            >
              👨‍👩‍👧 Parents
            </button>
            <button
              className="btn btn-success"
              onClick={() => setShowChatModal(true)}
              style={{ marginLeft: 'auto' }}
            >
              ✎ Send Message
            </button>
          </div>

          {showChatModal && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h2>💬 Send Message</h2>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Recipient *</label>
                    <select
                      value={messageData.recipientName}
                      onChange={(e) => setMessageData(prev => ({ ...prev, recipientName: e.target.value }))}
                      required
                    >
                      <option value="">-- Choose Recipient --</option>
                      {filteredRecipients.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.name} {r.studentCount ? `(${r.studentCount})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Message *</label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Type your message here..."
                      rows="4"
                      required
                    ></textarea>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">✓ Send</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowChatModal(false);
                      setMessageData({ recipientName: '', recipientType: 'student', message: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {messages.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    backgroundColor: '#f0fdf4',
                    borderLeft: '4px solid #10b981'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#1f2937' }}>
                      To: {message.recipient}
                      {message.recipientType === 'parent' && ' (Parent)'}
                    </strong>
                    <span style={{ fontSize: '0.85em', color: '#6b7280' }}>
                      {message.sentDate.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '0', color: '#374151' }}>
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No messages sent yet
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherCommunication;
