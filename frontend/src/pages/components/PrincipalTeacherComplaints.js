import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/api';
import './PrincipalPremium.css';

const CATEGORIES = [
  'Teaching Quality', 'Homework / Assignments', 'Marks & Evaluation',
  'Attendance', 'Teacher Behaviour', 'Classroom Discipline',
  'Communication', 'Safety Concern', 'Bullying', 'Harassment',
  'Appreciation / Positive Feedback', 'Other'
];

const PrincipalTeacherComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [internalNote, setInternalNote] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await complaintService.updateStatus(id, newStatus);
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleAddNote = async (id) => {
    if (!internalNote.trim()) return;
    try {
      await complaintService.addNote(id, internalNote);
      setInternalNote('');
      fetchComplaints();
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(prev => ({ ...prev, principalNotes: internalNote }));
      }
    } catch (err) {
      alert('Error adding note');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterTeacher && !c.teacherName?.toLowerCase().includes(filterTeacher.toLowerCase())) return false;
    if (filterCategory && c.category !== filterCategory) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPriority && c.priority !== filterPriority) return false;
    return true;
  });

  const totalComplaints = complaints.length;
  const newComplaints = complaints.filter(c => c.status === 'New').length;
  const underReviewComplaints = complaints.filter(c => c.status === 'Under Review').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 Teacher Feedback & Complaints</h2>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px', background: '#f3f4f6', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>{totalComplaints}</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>Total Complaints</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px', background: '#fee2e2', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#b91c1c' }}>{newComplaints}</h3>
          <p style={{ margin: 0, color: '#b91c1c' }}>New</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px', background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#b45309' }}>{underReviewComplaints}</h3>
          <p style={{ margin: 0, color: '#b45309' }}>Under Review</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px', background: '#d1fae5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#047857' }}>{resolvedComplaints}</h3>
          <p style={{ margin: 0, color: '#047857' }}>Resolved</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Filter by Teacher" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Under Review">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Teacher</th>
              <th>Submitted By</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No complaints found.</td></tr>
            ) : (
              filteredComplaints.map(c => (
                <tr key={c._id}>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.teacherName}</td>
                  <td>{c.anonymous ? 'Anonymous' : `${c.submittedByName} (${c.submittedByRole})`}</td>
                  <td>{c.category}</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: c.priority === 'High' ? '#fee2e2' : c.priority === 'Medium' ? '#fef3c7' : '#d1fae5', color: c.priority === 'High' ? '#b91c1c' : c.priority === 'Medium' ? '#b45309' : '#047857' }}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedComplaint(c)}>View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Complaint Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div><strong>Teacher:</strong> {selectedComplaint.teacherName}</div>
              <div><strong>Subject:</strong> {selectedComplaint.subjectName}</div>
              <div><strong>Submitted By:</strong> {selectedComplaint.anonymous ? 'Anonymous' : `${selectedComplaint.submittedByName} (${selectedComplaint.submittedByRole})`}</div>
              <div><strong>Date:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</div>
              <div><strong>Category:</strong> {selectedComplaint.category}</div>
              <div><strong>Priority:</strong> {selectedComplaint.priority}</div>
              <div><strong>Status:</strong> {selectedComplaint.status}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Description:</strong>
              <p style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.principalNotes && (
              <div style={{ marginBottom: '20px' }}>
                <strong>Internal Notes:</strong>
                <p style={{ background: '#fef3c7', padding: '10px', borderRadius: '4px', border: '1px solid #fbbf24', marginTop: '8px' }}>
                  {selectedComplaint.principalNotes}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0 }}>Update Status & Notes</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(selectedComplaint._id, 'Under Review')}>Mark Under Review</button>
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selectedComplaint._id, 'Resolved')}>Mark Resolved</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selectedComplaint._id, 'Closed')}>Close Complaint</button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Add internal note..." value={internalNote} onChange={e => setInternalNote(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <button className="btn btn-primary" onClick={() => handleAddNote(selectedComplaint._id)}>Save Note</button>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => { setSelectedComplaint(null); setInternalNote(''); }} style={{ width: '100%' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalTeacherComplaints;
