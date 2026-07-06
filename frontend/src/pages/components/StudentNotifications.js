import React, { useEffect, useState } from 'react';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications([
      { id: 1, title: 'Exam Date Confirmed', content: 'Your math exam will be held on Monday at 9:00 AM.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: 2, title: 'New Homework Posted', content: 'A new physics homework assignment has been posted. Please check the portal.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { id: 3, title: 'Project Submission Reminder', content: 'Submit your science project report by Friday.', date: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    ]);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>🔔 Notifications</h2>
      </div>
      <div className="card-content">
        {notifications.length === 0 ? (
          <p>No notifications at the moment.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((note) => (
                  <tr key={note.id}>
                    <td>{note.date.toLocaleDateString()}</td>
                    <td>{note.title}</td>
                    <td>{note.content}</td>
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

export default StudentNotifications;
