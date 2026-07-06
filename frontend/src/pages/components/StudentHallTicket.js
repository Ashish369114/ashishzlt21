import React, { useEffect, useState } from 'react';

const StudentHallTicket = ({ userId }) => {
  const [hallTicket, setHallTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHallTicket({
      examName: 'Term 2 Final Examination',
      studentName: 'Student Name',
      className: '10-B',
      rollNumber: 'STU-2026-045',
      seatNumber: 'B24',
      examCenter: 'Main School Hall',
      schedule: [
        { subject: 'Mathematics', date: '2026-07-10', time: '09:00 AM' },
        { subject: 'Science', date: '2026-07-12', time: '09:00 AM' },
        { subject: 'English', date: '2026-07-14', time: '09:00 AM' },
      ],
    });
    setLoading(false);
  }, [userId]);

  const downloadTicket = () => {
    if (!hallTicket) return;
    const content = [`Hall Ticket for ${hallTicket.studentName}`, '================================', `Exam: ${hallTicket.examName}`, `Class: ${hallTicket.className}`, `Roll: ${hallTicket.rollNumber}`, `Seat: ${hallTicket.seatNumber}`, `Center: ${hallTicket.examCenter}`, '', 'Schedule:', ...hallTicket.schedule.map((item) => `- ${item.subject}: ${item.date} ${item.time}`)];
    const blob = new Blob([content.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hall-ticket-${hallTicket.rollNumber}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🎫 Hall Ticket</h2>
      </div>
      {loading ? (
        <div className="spinner"></div>
      ) : !hallTicket ? (
        <div className="card-content">No hall ticket available.</div>
      ) : (
        <>
          <div className="card-content">
            <p><strong>{hallTicket.examName}</strong></p>
            <p>{hallTicket.studentName}</p>
            <p>{hallTicket.className} • Roll {hallTicket.rollNumber}</p>
            <p>Seat: {hallTicket.seatNumber}</p>
            <p>Location: {hallTicket.examCenter}</p>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {hallTicket.schedule.map((item, index) => (
                  <tr key={index}>
                    <td>{item.subject}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary" onClick={downloadTicket} style={{ marginTop: '16px' }}>
            Download Hall Ticket
          </button>
        </>
      )}
    </div>
  );
};

export default StudentHallTicket;
