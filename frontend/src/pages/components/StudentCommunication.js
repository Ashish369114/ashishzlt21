import React, { useState } from 'react';

const StudentCommunication = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'inbox',
      from: 'Class Teacher',
      subject: 'Assignment Reminder',
      body: 'Remember to submit your science homework before Friday.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      type: 'sent',
      from: 'You',
      subject: 'Clarification on Math problem',
      body: 'Could you please explain question 5 in the math worksheet?',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('Class Teacher');
  const [error, setError] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message body are required.');
      return;
    }

    setMessages([
      {
        id: messages.length + 1,
        type: 'sent',
        from: 'You',
        subject: subject.trim(),
        body: body.trim(),
        recipient,
        date: new Date(),
      },
      ...messages,
    ]);
    setSubject('');
    setBody('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💬 Student Communication</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Inbox</h3>
          <div className="value">{messages.filter((m) => m.type === 'inbox').length}</div>
        </div>
        <div className="stat-card">
          <h3>Sent</h3>
          <div className="value">{messages.filter((m) => m.type === 'sent').length}</div>
        </div>
        <div className="stat-card">
          <h3>Contacts</h3>
          <div className="value">3</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('inbox')}>
          Inbox
        </button>
        <button className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('sent')}>
          Sent
        </button>
      </div>

      <div className="card-content" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSend} className="form-container">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Recipient</label>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                <option>Class Teacher</option>
                <option>School Counselor</option>
                <option>Principal</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows="4" placeholder="Type your message here" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Send Message
          </button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {messages
              .filter((message) => message.type === activeTab)
              .map((message) => (
                <tr key={message.id}>
                  <td>{message.date.toLocaleDateString()}</td>
                  <td>{message.type === 'inbox' ? 'Inbox' : 'Sent'}</td>
                  <td>{message.type === 'inbox' ? message.from : message.recipient}</td>
                  <td>{message.subject}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentCommunication;
