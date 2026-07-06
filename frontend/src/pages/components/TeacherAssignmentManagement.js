import React, { useState, useEffect } from 'react';
import { homeworkService, studentService } from '../../services/api';

const TeacherAssignmentManagement = ({ teacherId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    attachmentFile: null,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await homeworkService.getAll();
      setAssignments(response.data || []);
    } catch (err) {
      setError('Failed to load assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachmentFile') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.dueDate) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const newAssignment = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        status: 'Active',
        createdBy: teacherId,
        submissions: [],
      };

      await homeworkService.add(newAssignment);
      setFormData({ title: '', description: '', dueDate: '', attachmentFile: null });
      setShowForm(false);
      fetchAssignments();
    } catch (err) {
      setError('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await homeworkService.delete(id);
        fetchAssignments();
      } catch (err) {
        setError('Failed to delete assignment');
      }
    }
  };

  const getSubmissionStats = (assignment) => {
    const submissions = assignment.submissions || [];
    const submitted = submissions.filter(s => s.status === 'Submitted').length;
    const reviewed = submissions.filter(s => s.marksObtained !== undefined).length;
    const pending = submissions.length - submitted;

    return { submitted, reviewed, pending, total: submissions.length };
  };

  const filteredAssignments = assignments.filter(a => {
    if (activeTab === 'pending') return a.status !== 'Closed';
    if (activeTab === 'closed') return a.status === 'Closed';
    if (activeTab === 'review') {
      const stats = getSubmissionStats(a);
      return stats.submitted > stats.reviewed;
    }
    return true;
  });

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Assignments</h3>
          <div className="value">{assignments.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <div className="value" style={{ color: '#3b82f6' }}>
            {assignments.filter(a => a.status !== 'Closed').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Pending Review</h3>
          <div className="value" style={{ color: '#f59e0b' }}>
            {assignments.reduce((sum, a) => {
              const stats = getSubmissionStats(a);
              return sum + (stats.submitted - stats.reviewed);
            }, 0)}
          </div>
        </div>
        <div className="stat-card">
          <h3>Closed</h3>
          <div className="value" style={{ color: '#6b7280' }}>
            {assignments.filter(a => a.status === 'Closed').length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('all')}
        >
          📋 All Assignments
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Active
        </button>
        <button
          className={`btn ${activeTab === 'review' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('review')}
        >
          📝 Pending Review
        </button>
        <button
          className={`btn ${activeTab === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('closed')}
        >
          ✓ Closed
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h2>➕ Create New Assignment</h2>
          </div>
          <form onSubmit={handleCreateAssignment}>
            <div className="form-row">
              <div className="form-group">
                <label>Assignment Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Chapter 5 Comprehension"
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Assignment instructions and details..."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Attachment (Optional)</label>
                <input
                  type="file"
                  name="attachmentFile"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-success">✓ Create Assignment</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', dueDate: '', attachmentFile: null });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {!showForm && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ marginBottom: '20px' }}
            >
              ➕ Create Assignment
            </button>
          )}

          {filteredAssignments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredAssignments.map(assignment => {
                const stats = getSubmissionStats(assignment);
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;

                return (
                  <div
                    key={assignment._id}
                    style={{
                      border: isOverdue ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: isOverdue ? '#fef2f2' : '#f9fafb',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
                      {assignment.title}
                      {isOverdue && <span style={{ color: '#ef4444', fontSize: '0.85em' }}> (Overdue)</span>}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9em', margin: '5px 0' }}>
                      {assignment.description.substring(0, 100)}...
                    </p>

                    <div style={{ margin: '12px 0', padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.85em', marginBottom: '8px' }}>
                        📅 Due: <strong>{dueDate.toLocaleDateString()}</strong>
                        {daysLeft > 0 && <span style={{ color: '#10b981' }}> ({daysLeft} days left)</span>}
                        {isOverdue && <span style={{ color: '#ef4444' }}> ({Math.abs(daysLeft)} days overdue)</span>}
                      </div>
                      <div style={{ fontSize: '0.85em', marginBottom: '8px' }}>
                        📝 Submissions: <strong>{stats.submitted}/{stats.total}</strong>
                      </div>
                      <div style={{ fontSize: '0.85em' }}>
                        ✓ Reviewed: <strong>{stats.reviewed}/{stats.submitted}</strong>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '10px',
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '5px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#10b981'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.75em', color: '#6b7280' }}>
                        {stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        className="btn btn-small"
                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white' }}
                      >
                        Review
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        style={{ flex: 1 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No assignments in this category
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherAssignmentManagement;
