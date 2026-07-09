import React, { useState, useEffect } from 'react';
import { teacherService, classService, studentService } from '../../services/api';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userId: '',
    password: '',
    subject: '',
    assignedClasses: [],
    email: '',
    phone: '',
    gender: 'Male',
    qualifications: '',
    experience: 0,
    isAllSubjectTeacher: false,
    teachingSubjects: [],
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!classes.length) {
      setSelectedGrade('');
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
    if (selectedGrade && !gradeOptions.includes(String(selectedGrade))) {
      setSelectedGrade('');
      setSelectedSection('');
      setSelectedClassId('');
    }
  }, [classes, selectedGrade]);

  useEffect(() => {
    if (!classes.length || !selectedGrade) {
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    const gradeClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map((cls) => cls.section).filter(Boolean))].sort();

    if (!sections.length) {
      setSelectedSection('');
      setSelectedClassId('');
      return;
    }

    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
    }

    const matchedClass = gradeClasses.find((cls) => String(cls.section) === String(selectedSection || ''));
    setSelectedClassId(matchedClass?._id || '');
  }, [classes, selectedGrade, selectedSection]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response.data);
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects();
      setSubjects(response.data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectedOptions, type } = e.target;
    const newValue = name === 'assignedClasses' && type === 'select-multiple'
      ? Array.from(selectedOptions, (option) => option.value)
      : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      userId: '',
      password: '',
      subject: '',
      assignedClasses: [],
      email: '',
      phone: '',
      gender: 'Male',
      qualifications: '',
      experience: 0,
      isAllSubjectTeacher: false,
      teachingSubjects: [],
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingId(teacher._id);
    setFormData({
      firstName: teacher.userId?.firstName || '',
      lastName: teacher.userId?.lastName || '',
      userId: teacher.userId?.userId || '',
      password: '',
      subject: teacher.subject?._id || '',
      assignedClasses: Array.isArray(teacher.assignedClasses)
        ? teacher.assignedClasses.map((cls) => cls._id)
        : [],
      email: teacher.userId?.email || '',
      phone: teacher.userId?.phone || '',
      gender: teacher.userId?.gender || 'Male',
      qualifications: teacher.qualifications || '',
      experience: teacher.experience || 0,
      isAllSubjectTeacher: Boolean(teacher.isAllSubjectTeacher),
      teachingSubjects: Array.isArray(teacher.teachingSubjects)
        ? teacher.teachingSubjects.map((subject) => subject?._id || subject)
        : [],
    });
    setShowForm(true);
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await teacherService.update(editingId, formData);
      } else {
        await teacherService.add(formData);
      }
      resetForm();
      fetchTeachers();
    } catch (err) {
      setError('Failed to save teacher: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Teacher save error:', err);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.delete(id);
        fetchTeachers();
      } catch (err) {
        setError('Failed to delete teacher');
      }
    }
  };

  const visibleTeachers = teachers;

  const getTeacherClasses = (teacher) => Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses : [];
  const getTeacherStudents = (teacher) => {
    const classIds = getTeacherClasses(teacher).map((cls) => String(cls?._id || cls));
    return students.filter((student) => classIds.includes(String(student.class?._id || student.class)) && student.userId);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👨‍🏫 Teacher Management</h2>
        <button className="btn btn-primary" onClick={toggleForm}>
          {showForm ? 'Cancel' : '➕ Add Teacher'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <form onSubmit={handleSubmitTeacher}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>User ID (optional)</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Classes</label>
                <select
                  name="assignedClasses"
                  value={formData.assignedClasses}
                  onChange={handleInputChange}
                  multiple
                  size={Math.min(6, classes.length || 6)}
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {`Grade ${cls.grade} - Section ${cls.section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-success">{editingId ? 'Update Teacher' : 'Save Teacher'}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Staff ID</th>
                  <th>Primary Subject</th>
                  <th>Classes</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTeachers.map((teacher) => {
                  const teacherClasses = getTeacherClasses(teacher);
                  const teacherStudents = getTeacherStudents(teacher);
                  return (
                    <tr key={teacher._id}>
                      <td>{teacher.userId?.firstName} {teacher.userId?.lastName}</td>
                      <td>{teacher.userId?.userId}</td>
                      <td>{teacher.subject?.name || 'N/A'}</td>
                      <td>{teacherClasses.length ? teacherClasses.map((cls) => `G${cls.grade}S${cls.section}`).join(', ') : 'No classes'}</td>
                      <td>{teacherStudents.length}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-small" onClick={() => handleEditTeacher(teacher)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-small" onClick={() => handleDeleteTeacher(teacher._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
