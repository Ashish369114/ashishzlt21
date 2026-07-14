import React, { useState, useEffect } from 'react';
import { classService, teacherService } from '../../services/api';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [formData, setFormData] = useState({
    grade: '',
    section: 'A',
    classTeacher: '',
    subject: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects();
      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
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

  const getClassSubjectsAndTeachers = (classId) => {
    const classTeachers = teachers.filter((teacher) => {
      const assignedIds = (teacher.assignedClasses || []).map((c) => String(c?._id || c));
      return assignedIds.includes(String(classId));
    });

    return classTeachers.map((t) => {
      const subName = t.subject?.name || t.subject || 'General';
      const teacherName = getTeacherDisplayName(t);
      return { subName, teacherName };
    });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const visibleClasses = classes.filter((cls) => {
    if (selectedGrade && Number(cls.grade) !== Number(selectedGrade)) return false;
    if (selectedSection && String(cls.section) !== String(selectedSection)) return false;
    return true;
  });

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
                <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select a subject</option>
                  <option value="General Curriculum">General Curriculum</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
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

      {/* Filters block to simplify the page and hide default list */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', width: '100%' }}
          >
            <option value="">Select Grade</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', width: '100%' }}
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C'].map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedGrade && !selectedSection ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '8px', margin: 0 }}>
          Please select a Grade or Section from the filters above to view the classes list.
        </p>
      ) : (
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
              {visibleClasses.sort((a, b) => {
                const gradeA = Number(a.grade || 0);
                const gradeB = Number(b.grade || 0);
                if (gradeA !== gradeB) return gradeA - gradeB;
                return String(a.section || '').localeCompare(String(b.section || ''));
              }).map((cls) => (
                <tr key={cls._id}>
                  <td>{cls.grade}</td>
                  <td>{cls.section}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{cls.subject || 'Core'}</div>
                    {getClassSubjectsAndTeachers(cls._id).map(({ subName, teacherName }, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '2px' }}>
                        📖 {subName}: {teacherName}
                      </div>
                    ))}
                  </td>
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
      )}

      <div style={{ marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditingClassId(null);
            setFormData({ grade: '', section: 'A', classTeacher: '', subject: '' });
          } else {
            setEditingClassId(null);
            setFormData({ grade: '', section: 'A', classTeacher: '', subject: '' });
            setShowForm(true);
          }
        }}>

          {showForm ? 'Cancel' : '➕ Add Class'}
        </button>
      </div>
    </div>
  );
};

export default ClassManagement;
