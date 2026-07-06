import React, { useEffect, useState } from 'react';

const StudentSyllabus = () => {
  const [syllabus, setSyllabus] = useState([]);

  useEffect(() => {
    setSyllabus([
      { subject: 'Mathematics', topics: ['Algebra', 'Geometry', 'Probability'] },
      { subject: 'Science', topics: ['Physics: Motion', 'Chemistry: Reactions', 'Biology: Cells'] },
      { subject: 'English', topics: ['Comprehension', 'Grammar', 'Writing'] },
      { subject: 'Social Science', topics: ['History', 'Geography', 'Civics'] },
    ]);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>🧾 Syllabus</h2>
      </div>
      <div className="card-content">
        <p>Review the syllabus topics for your current subjects.</p>
      </div>
      {syllabus.map((item) => (
        <div key={item.subject} className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3>{item.subject}</h3>
          </div>
          <div className="card-content">
            <ul>
              {item.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentSyllabus;
