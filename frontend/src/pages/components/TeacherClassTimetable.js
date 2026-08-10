import React, { useState, useEffect } from 'react';

const TeacherClassTimetable = ({ teacherId, user }) => {
  const [timetable, setTimetable] = useState([]);
  const [subjectAllocations, setSubjectAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timetable');

  useEffect(() => {
    loadTimetableData();
  }, []);

  const loadTimetableData = () => {
    // Simulated timetable data
    setTimetable([
      { id: 1, day: 'Monday', class: '10A', subject: 'Mathematics', time: '09:00 - 10:00', room: 'Room 101' },
      { id: 2, day: 'Monday', class: '10B', subject: 'Mathematics', time: '10:00 - 11:00', room: 'Room 102' },
      { id: 3, day: 'Monday', class: '9A', subject: 'Mathematics', time: '12:00 - 13:00', room: 'Room 103' },

      { id: 4, day: 'Tuesday', class: '10A', subject: 'Mathematics', time: '09:00 - 10:00', room: 'Room 101' },
      { id: 5, day: 'Tuesday', class: '10B', subject: 'Mathematics', time: '10:00 - 11:00', room: 'Room 102' },
      { id: 6, day: 'Tuesday', class: '9A', subject: 'Mathematics', time: '12:00 - 13:00', room: 'Room 103' },

      { id: 7, day: 'Wednesday', class: '10A', subject: 'Mathematics', time: '09:00 - 10:00', room: 'Room 101' },
      { id: 8, day: 'Wednesday', class: '10B', subject: 'Mathematics', time: '10:00 - 11:00', room: 'Room 102' },
      { id: 9, day: 'Wednesday', class: '9A', subject: 'Mathematics', time: '12:00 - 13:00', room: 'Room 103' },

      { id: 10, day: 'Thursday', class: '10A', subject: 'Mathematics', time: '09:00 - 10:00', room: 'Room 101' },
      { id: 11, day: 'Thursday', class: '10B', subject: 'Mathematics', time: '10:00 - 11:00', room: 'Room 102' },
      { id: 12, day: 'Thursday', class: '9A', subject: 'Mathematics', time: '12:00 - 13:00', room: 'Room 103' },

      { id: 13, day: 'Friday', class: '10A', subject: 'Mathematics', time: '09:00 - 10:00', room: 'Room 101' },
      { id: 14, day: 'Friday', class: '10B', subject: 'Mathematics', time: '10:00 - 11:00', room: 'Room 102' },
      { id: 15, day: 'Friday', class: '9A', subject: 'Mathematics', time: '12:00 - 13:00', room: 'Room 103' },
    ]);

    // Simulated subject allocations
    setSubjectAllocations([
      {
        id: 1,
        subject: 'Mathematics',
        grade: '10',
        section: 'A',
        students: 35,
        startDate: new Date('2024-06-01'),
        books: ['NCERT Math 10', 'RS Aggarwal'],
        chapters: 12,
      },
      {
        id: 2,
        subject: 'Mathematics',
        grade: '10',
        section: 'B',
        students: 32,
        startDate: new Date('2024-06-01'),
        books: ['NCERT Math 10', 'RS Aggarwal'],
        chapters: 12,
      },
      {
        id: 3,
        subject: 'Mathematics',
        grade: '9',
        section: 'A',
        students: 38,
        startDate: new Date('2024-06-01'),
        books: ['NCERT Math 9', 'RD Sharma'],
        chapters: 15,
      },
    ]);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 11:15 (Interval Break)',
    '11:15 - 12:15',
    '12:15 - 01:00 (Lunch Break)',
  ];
  const classes = [...new Set(timetable.map(t => t.class))];

  // Create timetable grid
  const getTimetableCell = (day, time) => {
    return timetable.find(t => t.day === day && t.time === time);
  };

  const getClassColor = (classname) => {
    const colors = {
      '10A': '#dbeafe',
      '10B': '#fce7f3',
      '9A': '#dcfce7',
      '9B': '#fee2e2',
    };
    return colors[classname] || '#f3f4f6';
  };

  const getTodayIndex = () => {
    const dayMap = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    const today = dayMap[new Date().getDay()];
    return days.indexOf(today);
  };

  const todayIndex = getTodayIndex();

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Classes Assigned</h3>
          <div className="value">{classes.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="value" style={{ color: '#10b981' }}>
            {subjectAllocations.reduce((sum, s) => sum + s.students, 0)}
          </div>
        </div>
        <div className="stat-card">
          <h3>Classes/Week</h3>
          <div className="value" style={{ color: '#3b82f6' }}>
            {timetable.length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Subjects</h3>
          <div className="value" style={{ color: '#f59e0b' }}>
            {[...new Set(subjectAllocations.map(s => s.subject))].length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'timetable' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('timetable')}
        >
          📅 Class Timetable
        </button>
        <button
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('subjects')}
        >
          📚 Subject Allocation
        </button>
        <button
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Today's Schedule
        </button>
      </div>

      {activeTab === 'timetable' && (
        <div className="card">
          <div className="card-header">
            <h2>📅 Weekly Class Timetable</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #d1d5db' }}>
                    Time
                  </th>
                  {days.map((day, index) => (
                    <th
                      key={day}
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        borderBottom: '2px solid #d1d5db',
                        backgroundColor: index === todayIndex ? '#fef3c7' : 'transparent'
                      }}
                    >
                      {day}
                      {index === todayIndex && ' 📍'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => {
                  const isInterval = time.includes('Interval');
                  const isLunch = time.includes('Lunch');

                  if (isInterval || isLunch) {
                    return (
                      <tr key={time} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: isInterval ? '#e0f2fe' : '#fef3c7' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: isInterval ? '#0369a1' : '#b45309', fontSize: '0.85em' }}>
                          {time}
                        </td>
                        <td colSpan={5} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: isInterval ? '#0369a1' : '#92400e', fontSize: '0.85em' }}>
                          {isInterval ? '☕ Interval / Recess Break (School Courtyard)' : '🍱 Lunch Break (School Dining Hall)'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={time} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontWeight: '500', backgroundColor: '#f9fafb' }}>
                        {time}
                      </td>
                      {days.map((day, index) => {
                        const cell = getTimetableCell(day, time);
                        return (
                          <td
                            key={`${day}-${time}`}
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              backgroundColor: index === todayIndex ? 'rgba(254, 243, 199, 0.3)' : 'transparent'
                            }}
                          >
                            {cell ? (
                              <div style={{
                                padding: '8px',
                                backgroundColor: getClassColor(cell.class),
                                borderRadius: '4px',
                                fontSize: '0.9em'
                              }}>
                                <div style={{ fontWeight: 'bold' }}>{cell.class}</div>
                                <div style={{ fontSize: '0.85em', color: '#374151' }}>{cell.subject}</div>
                                <div style={{ fontSize: '0.75em', color: '#6b7280' }}>{cell.room}</div>
                              </div>
                            ) : (
                              <span style={{ color: '#d1d5db' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {classes.map(cls => (
              <div key={cls} style={{
                padding: '10px',
                backgroundColor: getClassColor(cls),
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: getClassColor(cls).replace('e7', '8f'), borderRadius: '2px' }}></div>
                <span style={{ fontSize: '0.9em', fontWeight: '500' }}>{cls}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="card">
          <div className="card-header">
            <h2>📚 Subject Allocation</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Chapters</th>
                  <th>Reference Books</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {subjectAllocations.map(allocation => (
                  <tr key={allocation.id}>
                    <td>
                      <strong>{allocation.subject}</strong>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: getClassColor(`${allocation.grade}${allocation.section}`),
                        borderRadius: '3px',
                        fontSize: '0.9em',
                        fontWeight: '500'
                      }}>
                        Grade {allocation.grade} - {allocation.section}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong>{allocation.students}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {allocation.chapters}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85em' }}>
                        {allocation.books.map((book, i) => (
                          <div key={i}>• {book}</div>
                        ))}
                      </div>
                    </td>
                    <td>
                      {allocation.startDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card">
          <div className="card-header">
            <h2>⏰ Today's Class Schedule</h2>
          </div>
          {todayIndex >= 0 && todayIndex < days.length ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {times.map(time => {
                const todayClass = getTimetableCell(days[todayIndex], time);
                return (
                  <div
                    key={time}
                    style={{
                      padding: '15px',
                      border: todayClass ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: todayClass ? '#eff6ff' : '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                          ⏰ {time}
                        </h3>
                        {todayClass ? (
                          <div style={{ color: '#374151' }}>
                            <div>📚 <strong>Class:</strong> {todayClass.class}</div>
                            <div>📖 <strong>Subject:</strong> {todayClass.subject}</div>
                            <div>🏢 <strong>Room:</strong> {todayClass.room}</div>
                          </div>
                        ) : (
                          <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Free Period</div>
                        )}
                      </div>
                      {todayClass && (
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          fontWeight: '500',
                          color: '#0369a1'
                        }}>
                          {todayClass.class}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              No classes scheduled for today
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherClassTimetable;
