import React, { useState, useEffect, useCallback } from 'react';
import { remarkService, teacherService, studentService, classService } from '../../services/api';

const getId = (value) => value?._id?.toString?.() || value?.toString?.() || '';

const RemarkList = ({ teacherUserId, studentId, showActions = true }) => {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    subject: '',
    remark: '',
    type: 'Neutral',
  });
  const [editingRemarkId, setEditingRemarkId] = useState(null);

  const fetchRemarks = useCallback(async (parsedUser) => {
    try {
      setLoading(true);
      let remarksData = [];

      if (studentId) {
        const response = await remarkService.getByStudent(studentId);
        remarksData = response.data || [];
      } else {
        const response = await remarkService.getAll();
        remarksData = response.data || [];

        const normalizedId = (teacherUserId || parsedUser?.id || parsedUser?.userId)?.toString?.() || '';
        if (normalizedId) {
          const teachersResponse = await teacherService.getAll();
          const teachers = teachersResponse.data || [];
          const teacher = teachers.find((teacher) => {
            const teacherUser = teacher.userId;
            const teacherObjId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
            const teacherLoginId = teacherUser?.userId;
            return teacherObjId === normalizedId || teacherUser === normalizedId || teacherLoginId === normalizedId;
          });

          if (teacher?.assignedClasses?.length) {
            const classIds = teacher.assignedClasses.map((cls) => getId(cls));
            remarksData = remarksData.filter((remark) => classIds.includes(getId(remark.class)));
          }
        }
      }

      setRemarks(remarksData);
    } catch (err) {
      setError('Failed to load remarks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teacherUserId, studentId]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser) {
      setCurrentUser(parsedUser);
    }

    const loadData = async () => {
      await fetchRemarks(parsedUser);
      if (!studentId) {
        await loadTeacherData(parsedUser);
      }
    };

    const loadTeacherData = async (parsedUser) => {
      try {
        const userId = teacherUserId || parsedUser?.id || parsedUser?.userId;
        if (!userId) return;

        const teachersResponse = await teacherService.getAll();
        const teachers = teachersResponse.data || [];
        const teacher = teachers.find((teacher) => {
          const teacherUser = teacher.userId;
          const teacherObjId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
          const teacherLoginId = teacherUser?.userId;
          return teacherObjId === userId?.toString?.() || teacherUser === userId?.toString?.() || teacherLoginId === userId?.toString?.();
        });

        if (teacher?.assignedClasses?.length) {
          const assignedClassIds = new Set(teacher.assignedClasses.map((cls) => getId(cls)));
          const studentsResponse = await studentService.getAll();
          const filteredStudents = (studentsResponse.data || []).filter((student) => assignedClassIds.has(getId(student.class)));
          setStudents(filteredStudents);

          const classesResponse = await classService.getAll();
          const filteredClasses = (classesResponse.data || []).filter((cls) => assignedClassIds.has(getId(cls)));
          setClasses(filteredClasses);
        } else {
          setStudents([]);
          setClasses([]);
        }

        const subjectsResponse = await classService.getSubjects();
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        console.error('Failed to load teacher-specific data:', err);
      }
    };

    loadData();
  }, [teacherUserId, studentId, fetchRemarks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ student: '', class: '', subject: '', remark: '', type: 'Neutral' });
    setEditingRemarkId(null);
  };

  const handleEditClick = (remark) => {
    setEditingRemarkId(remark._id);
    setFormData({
      student: remark.student?._id || remark.student || '',
      class: remark.class?._id || remark.class || '',
      subject: remark.subject?._id || remark.subject || '',
      remark: remark.remark || '',
      type: remark.type || 'Neutral',
    });
    setShowForm(true);
  };

  const handleDeleteRemark = async (id) => {
    if (!window.confirm('Delete this remark?')) return;

    try {
      await remarkService.delete(id);
      setSuccessMessage('Remark deleted successfully.');
      setError('');
      await fetchRemarks(currentUser || JSON.parse(localStorage.getItem('user') || 'null'));
    } catch (err) {
      setError('Failed to delete remark: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingRemarkId) {
        await remarkService.update(editingRemarkId, {
          ...formData,
          teacher: currentUser?.id || currentUser?.userId,
        });
        setSuccessMessage('Remark updated successfully.');
      } else {
        await remarkService.add({
          ...formData,
          teacher: currentUser?.id || currentUser?.userId,
        });
        setSuccessMessage('Remark added successfully.');
      }

      resetForm();
      setShowForm(false);
      await fetchRemarks(currentUser || JSON.parse(localStorage.getItem('user') || 'null'));
    } catch (err) {
      setError('Failed to save remark: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💬 Remarks</h2>
          {showActions && (
            <button className="btn btn-primary" onClick={() => {
              if (showForm) {
                resetForm();
              }
              setShowForm(!showForm);
            }}>
              {showForm ? 'Cancel' : '➕ Add Remark'}
            </button>
          )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showActions && showForm && (
        <div className="form-container" style={{ marginBottom: '20px' }}>
          <h3>{editingRemarkId ? 'Edit Remark' : 'Add Remark'}</h3>
          <form onSubmit={handleAddRemark}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student.userId?._id || student.userId}>
                      {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select name="class" value={formData.class} onChange={handleInputChange} required>
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange}>
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Remark</label>
              <textarea name="remark" value={formData.remark} onChange={handleInputChange} required rows="3" />
            </div>

            <button type="submit" className="btn btn-success">{editingRemarkId ? 'Update Remark' : 'Save Remark'}</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Type</th>
                <th>Remark</th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {remarks.length === 0 ? (
                <tr>
                  <td colSpan="6">No remarks available.</td>
                </tr>
              ) : (
                remarks.map((remark) => (
                  <tr key={remark._id}>
                    <td>{remark.student ? `${remark.student.firstName} ${remark.student.lastName}` : '-'}</td>
                    <td>{remark.teacher ? `${remark.teacher.firstName} ${remark.teacher.lastName}` : '-'}</td>
                    <td>{remark.subject?.name || '-'}</td>
                    <td>{remark.class ? `Grade ${remark.class.grade} - Section ${remark.class.section}` : '-'}</td>
                    <td>{remark.type || 'Neutral'}</td>
                    <td>{remark.remark}</td>
                    {showActions && (
                      <td>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleEditClick(remark)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteRemark(remark._id)} style={{ marginLeft: '8px' }}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RemarkList;
