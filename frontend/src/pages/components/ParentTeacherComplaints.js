import React, { useState, useEffect } from 'react';
import { complaintService, teacherService } from '../../services/api';
import './PrincipalPremium.css';

const CATEGORIES = [
  'Teaching Quality', 'Homework / Assignments', 'Marks & Evaluation',
  'Attendance', 'Teacher Behaviour', 'Classroom Discipline',
  'Communication', 'Safety Concern', 'Bullying', 'Harassment',
  'Appreciation / Positive Feedback', 'Other'
];

const ParentTeacherComplaints = ({ currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    subjectName: '',
    category: '',
    priority: 'Low',
    description: '',
    anonymous: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, teachersRes] = await Promise.all([
        complaintService.getByUser(currentUser.userId),
        teacherService.getAll()
      ]);
      setComplaints(complaintsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    const teacher = teachers.find(t => t._id === teacherId);
    setFormData(prev => ({
      ...prev,
      teacherId,
      teacherName: teacher ? `${teacher.userId?.firstName} ${teacher.userId?.lastName}` : '',
      subjectName: teacher?.subject?.name || teacher?.subject || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        submittedByUserId: currentUser.userId,
        submittedByName: `${currentUser.firstName} ${currentUser.lastName}`,
        submittedByRole: 'Parent'
      };
      await complaintService.add(payload);
      setShowForm(false);
      setFormData({ teacherId: '', teacherName: '', subjectName: '', category: '', priority: 'Low', description: '', anonymous: false });
      fetchData();
      alert('Feedback/Complaint submitted successfully.');
    } catch (err) {
      alert('Failed to submit complaint.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📝 My Feedback & Complaints</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Submit New Feedback'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group">
                <label>Select Teacher</label>
                <select name="teacherId" value={formData.teacherId} onChange={handleTeacherChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.userId?.firstName} {t.userId?.lastName} ({t.subject?.name || t.subject || 'General'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subjectName" value={formData.subjectName} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="anonymous" name="anonymous" checked={formData.anonymous} onChange={handleInputChange} />
              <label htmlFor="anonymous" style={{ margin: 0 }}>Submit Anonymously (Your name will be hidden from Principal/Admin)</label>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Attachment (Optional)</label>
              <input type="file" style={{ display: 'block', marginTop: '5px' }} />
              <small style={{ color: '#6b7280' }}>Attach images or documents (Max 5MB)</small>
            </div>

            <button type="submit" className="btn btn-success">Submit Feedback</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Principal Note</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>You have not submitted any complaints/feedback yet.</td></tr>
            ) : (
              complaints.map(c => (
                <tr key={c._id}>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.teacherName}</td>
                  <td>{c.subjectName}</td>
                  <td>{c.category}</td>
                  <td>{c.priority}</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.principalNotes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentTeacherComplaints;
