import React, { useEffect, useState } from 'react';
import { studentService } from '../../services/api';

const ParentCommunication = () => {
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await studentService.getByParent();
        const studentList = response.data || [];
        setStudents(studentList);
      } catch (err) {
        console.error(err);
      }
    };

    const loadInitialData = () => {
      setNotices([
        {
          id: 1,
          title: 'School Assembly Reminder',
          summary: 'A school assembly will be held on Friday morning at 8:30 AM for all grades.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          title: 'Parent-Teacher Meeting',
          summary: 'Parent-Teacher meeting scheduled for next Wednesday. Please confirm your availability.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);
      setMessages([
        {
          id: 1,
          from: 'Class Teacher',
          subject: 'Homework update for your child',
          content: 'Please review the new homework assignments and ensure the child submits them on time.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          student: 'All children',
        },
      ]);
    };

    loadStudents();
    loadInitialData();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedStudent || !messageText.trim()) {
      setError('Please select a child and enter a message.');
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      from: 'You',
      subject: 'Message to Class Teacher',
      content: messageText.trim(),
      date: new Date(),
      student: students.find((student) => String(student._id || student.userId) === String(selectedStudent))?.userId?.firstName || 'Selected child',
    };
    setMessages([newMessage, ...messages]);
    setMessageText('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💬 Parent Communication</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Children Linked</h3>
          <div className="value">{students.length}</div>
        </div>
        <div className="stat-card">
          <h3>Notices</h3>
          <div className="value">{notices.length}</div>
        </div>
        <div className="stat-card">
          <h3>Messages</h3>
          <div className="value">{messages.length}</div>
        </div>
      </div>

      <div className="card-content" style={{ marginBottom: '20px' }}>
        <h3>Send a message to the teacher</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSendMessage} className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label>Child</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                <option value="">Select a child</option>
                {students.map((student) => {
                  const id = student._id || student.userId?._id || student.userId;
                  const name = student.name || `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim() || 'Ramesh Kumar';
                  const grade = student.grade || student.class?.grade || '1';
                  const section = student.section || student.class?.section || 'A';
                  return (
                    <option key={id} value={id}>
                      {name} — Grade {grade}, Section {section}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Message</label>
              <textarea
                rows="4"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write a message to the class teacher or school office"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📰 Latest Notices</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td>{notice.date.toLocaleDateString()}</td>
                  <td>{notice.title}</td>
                  <td>{notice.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2>📥 Message History</h2>
        </div>
        {messages.length === 0 ? (
          <div className="card-content">No messages yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>To/From</th>
                  <th>Child</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>{message.date.toLocaleDateString()}</td>
                    <td>{message.from}</td>
                    <td>{message.student}</td>
                    <td>{message.subject}</td>
                    <td>{message.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentCommunication;
