import React, { useState, useEffect } from 'react';
import { classService, teacherService } from '../../services/api';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    section: 'A',
    classTeacher: '',
    subject: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const getTeacherDisplayName = (teacher) => {
    const user = teacher?.userId || teacher;
    const firstName = user?.firstName || teacher?.firstName || '';
    const lastName = user?.lastName || teacher?.lastName || '';
    const fallbackId = user?.userId || teacher?.userId || '';

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || fallbackId || 'No teacher assigned';
  };

  const getTeacherAssignedClassesCount = (teacher) => {
    const assignedClasses = teacher?.assignedClasses || teacher?.userId?.assignedClasses || [];
    return Array.isArray(assignedClasses) ? assignedClasses.length : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      let response;
      if (editingClassId) {
        response = await classService.update(editingClassId, formData);
      } else {
        response = await classService.create(formData);
      }
      const message = response?.data?.message;
      if (message === 'Class already exists') {
        setSuccessMessage('This class already exists in the system.');
      } else {
        setSuccessMessage(editingClassId ? 'Class updated successfully.' : 'Class saved successfully.');
      }
      setFormData({ grade: '', section: 'A', classTeacher: '', subject: '' });
      setShowForm(false);
      setEditingClassId(null);
      fetchClasses();
    } catch (err) {
      setError('Failed to add class: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleEditClass = (cls) => {
    setEditingClassId(cls._id);
    setFormData({
      grade: cls.grade || '',
      section: cls.section || 'A',
      classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
      subject: cls.subject || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingClassId(null);
    setFormData({ grade: '', section: 'A', classTeacher: '', subject: '' });
    setShowForm(false);
    setError('');
    setSuccessMessage('');
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(id);
        fetchClasses();
      } catch (err) {
        setError('Failed to delete class');
      }
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>📚 Classes Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Class</h3>
          <form onSubmit={handleAddClass}>
            <div className="form-row">
              <div className="form-group">
                <label>Grade (1-10)</label>
                <input
                  type="number"
                  name="grade"
                  min="1"
                  max="10"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Section</label>
                <select name="section" value={formData.section} onChange={handleInputChange} required>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="form-group">
                <label>Class Teacher</label>
                <select name="classTeacher" value={formData.classTeacher} onChange={handleInputChange}>
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {getTeacherDisplayName(teacher)}{getTeacherAssignedClassesCount(teacher) ? ` (${getTeacherAssignedClassesCount(teacher)} class${getTeacherAssignedClassesCount(teacher) > 1 ? 'es' : ''})` : ' (0 classes)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save Class</button>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Section</th>
              <th>Subject</th>
              <th>Class Teacher</th>
              <th>Students Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td>{cls.grade}</td>
                <td>{cls.section}</td>
                <td>{cls.subject || 'N/A'}</td>
                <td>{getTeacherDisplayName(cls.classTeacher) || 'No teacher assigned'}</td>
                <td>{cls.students?.length || 0}</td>
                <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditClass(cls)}
                      style={{ marginRight: '8px' }}
                    >
                      Edit
                    </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteClass(cls._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Class'}
        </button>
      </div>
    </div>
  );
};

export default ClassManagement;
