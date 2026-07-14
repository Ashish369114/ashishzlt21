import React, { useState, useEffect } from 'react';
import { studentNotesService } from '../../services/api';

const ParentStudentProfile = ({ students = [] }) => {
  const formatParentInfo = (parentId) => {
    if (!parentId) return null;
    if (typeof parentId === 'string') return parentId;
    const name = `${parentId.firstName || ''} ${parentId.lastName || ''}`.trim();
    return name || parentId.userId || parentId.email || parentId.phone || null;
  };

  const [allNotes, setAllNotes] = useState([]);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await studentNotesService.getAll();
        setAllNotes(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>👩‍🎓 Linked Student Profile</h2>
      </div>

      {students.length === 0 ? (
        <div className="card-content">No linked children found for this parent.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll Number</th>
                <th>Parent ID</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const parentInfo = formatParentInfo(student.parentId) || formatParentInfo(student.userId?.parentId);
                const hasRemedial = allNotes.filter(n => n.studentId === student._id && n.category === 'Needs Remedial Classes').length > 0;
                
                return (
                  <tr key={student._id || student.id || student.userId?._id || student.userId}>
                    <td>
                      {student.userId?.firstName} {student.userId?.lastName}
                      {hasRemedial && (
                        <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                          🚨 Remedial Required
                        </span>
                      )}
                    </td>
                    <td>{student.class?.grade || student.class}</td>
                    <td>{student.class?.section || '-'}</td>
                    <td>{student.rollNumber || student.userId?.rollNumber || '-'}</td>
                    <td>{parentInfo || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {students.length > 0 && (
        <div className="card-header" style={{ marginTop: '30px' }}>
          <h2>📝 Teacher Notes</h2>
        </div>
      )}
      
      {students.map(student => {
        const studentVisibleNotes = allNotes.filter(n => n.studentId === student._id && n.visibleToParent);
        if (studentVisibleNotes.length === 0) return null;
        
        return (
          <div key={`notes-${student._id}`} className="card-content" style={{ marginTop: '10px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Notes for {student.userId?.firstName}</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {studentVisibleNotes.sort((a,b) => new Date(b.date) - new Date(a.date)).map(note => (
                <div key={note._id} style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${note.priority === 'High' ? '#ef4444' : note.priority === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderLeftWidth: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: '#111827' }}>{note.category}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(note.date).toLocaleDateString()}</span>
                  </div>
                  {note.subject && <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '4px' }}><strong>Subject:</strong> {note.subject}</div>}
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#374151' }}>{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ParentStudentProfile;
