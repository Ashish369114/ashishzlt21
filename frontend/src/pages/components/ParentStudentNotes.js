import React, { useState, useEffect } from 'react';
import { studentNotesService } from '../../services/api';

const ParentStudentNotes = ({ studentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        if (studentId) {
          const res = await studentNotesService.getByStudent(studentId);
          // Only show notes that are marked visible to parent/student
          const visibleNotes = (res.data || []).filter(note => note.visibleToParent === true);
          setNotes(visibleNotes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [studentId]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <h2>📋 Important Notes</h2>
      {notes.length === 0 ? (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          No important notes available for this student.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
          {notes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(note => (
            <div key={note._id} style={{
              padding: '16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${note.priority === 'High' ? '#ef4444' : note.priority === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
              background: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              borderRight: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#111827' }}>{note.category}</strong>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {new Date(note.date).toLocaleDateString()}
                </span>
              </div>
              {note.subject && (
                <div style={{ marginBottom: '8px', color: '#4b5563', fontSize: '0.95rem' }}>
                  <strong>Subject:</strong> {note.subject}
                </div>
              )}
              <p style={{ margin: '0 0 12px 0', color: '#374151', lineHeight: '1.5' }}>
                {note.description}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                Added by: {note.addedBy}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentStudentNotes;
