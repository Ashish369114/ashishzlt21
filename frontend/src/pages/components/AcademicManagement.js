import React, { useState, useEffect } from 'react';
import api, { classService, subjectService } from '../../services/api';

const AcademicManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subjectRes, classRes] = await Promise.all([
        api.get('/subjects'),
        classService.getAll(),
      ]);
      setSubjects(subjectRes.data);
      setClasses(classRes.data);
    } catch (err) {
      setError('Failed to fetch academic data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingSubjectId) {
        await subjectService.update(editingSubjectId, {
          name: subjectName,
          code: subjectCode,
          description: subjectDescription,
        });
        setSuccess('Subject updated successfully.');
      } else {
        await subjectService.add({
          name: subjectName,
          code: subjectCode,
          description: subjectDescription,
        });
        setSuccess('Subject added successfully.');
      }
      setSubjectName('');
      setSubjectCode('');
      setSubjectDescription('');
      setEditingSubjectId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || (editingSubjectId ? 'Failed to update subject' : 'Failed to add subject'));
      console.error(err);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubjectId(subject._id);
    setSubjectName(subject.name || '');
    setSubjectCode(subject.code || '');
    setSubjectDescription(subject.description || '');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingSubjectId(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectDescription('');
    setError('');
    setSuccess('');
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    setError('');
    setSuccess('');
    try {
      await subjectService.delete(id);
      setSuccess('Subject deleted successfully.');
      if (editingSubjectId === id) {
        handleCancelEdit();
      }
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject');
      console.error(err);
    }
  };

  // Helper values for filtering classes
  const gradeOptions = [...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClassesForGrade = selectedGrade ? classes.filter(c => String(c.grade) === String(selectedGrade)) : classes;
  const sectionOptions = [...new Set(visibleClassesForGrade.map(c => c.section).filter(Boolean))].sort();

  const filteredClasses = classes.filter(cls => {
    const matchGrade = !selectedGrade || String(cls.grade) === String(selectedGrade);
    const matchSection = !selectedSection || String(cls.section) === String(selectedSection);
    return matchGrade && matchSection;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h2>🎓 Academic Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <h3>Subjects</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.name}</td>
                    <td>{subject.code || '-'}</td>
                    <td>{subject.description || '-'}</td>
                    <td>
                      <button className="btn btn-secondary btn-small" onClick={() => handleEditSubject(subject)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-small" style={{ marginLeft: '8px' }} onClick={() => handleDeleteSubject(subject._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0 }}>Classes</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedSection('');
                  }}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
                >
                  <option value="">All Grades</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedGrade}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
                >
                  <option value="">All Sections</option>
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.grade}</td>
                      <td>{cls.section}</td>
                      <td>{cls.subject || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af' }}>No classes found matching the filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicManagement;
