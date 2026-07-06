import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { classService } from '../../services/api';

const AcademicManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      await api.post('/subjects', {
        name: subjectName,
        code: subjectCode,
        description: subjectDescription,
      });
      setSuccess('Subject added successfully.');
      setSubjectName('');
      setSubjectCode('');
      setSubjectDescription('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subject');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🎓 Academic Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-container" style={{ marginBottom: '24px' }}>
        <h3>Add New Subject</h3>
        <form onSubmit={handleCreateSubject}>
          <div className="form-row">
            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject Code</label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label>Description</label>
              <input
                type="text"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Subject</button>
        </form>
      </div>

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
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.name}</td>
                    <td>{subject.code || '-'}</td>
                    <td>{subject.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <h3>Classes</h3>
            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls._id}>
                    <td>{cls.grade}</td>
                    <td>{cls.section}</td>
                    <td>{cls.subject || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicManagement;
