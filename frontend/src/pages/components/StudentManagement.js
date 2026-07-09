import React, { useState, useEffect } from 'react';
import { studentService, classService } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userId: '',
    password: '',
    rollNumber: '',
    classId: '',
    parentId: '',
    parentUserId: '',
    parentPassword: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentGender: 'Male',
    parentAddress: '',
    parentRelationship: '',
    dateOfBirth: '',
    phone: '',
    gender: 'Male',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchStudents();
    fetchClasses();
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      userId: '',
      password: '',
      rollNumber: '',
      classId: '',
      parentId: '',
      parentUserId: '',
      parentPassword: '',
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
      parentGender: 'Male',
      parentAddress: '',
      parentRelationship: '',
      dateOfBirth: '',
      phone: '',
      gender: 'Male',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser || !['super_admin', 'principal', 'accountant_admin'].includes(currentUser.role)) {
        setError('You do not have permission to save a student.');
        return;
      }
      setError('');

      if (editingId) {
        await studentService.update(editingId, formData);
      } else {
        await studentService.add(formData);
      }

      resetForm();
      fetchStudents();
    } catch (err) {
      const message = err.response?.data?.message || 'Unknown error';
      setError(`Failed to save student: ${message}`);
      console.error(err);
    }
  };

  const handleEditStudent = (student) => {
    setEditingId(student._id);
    setFormData({
      firstName: student.userId?.firstName || '',
      lastName: student.userId?.lastName || '',
      userId: student.userId?.userId || '',
      password: '',
      rollNumber: student.rollNumber || '',
      classId: student.class?._id || '',
      parentId: student.parentId?._id || '',
      parentUserId: student.parentId?.userId || '',
      parentPassword: '',
      parentFirstName: student.parentId?.firstName || '',
      parentLastName: student.parentId?.lastName || '',
      parentEmail: student.parentId?.email || '',
      parentPhone: student.parentId?.phone || '',
      parentGender: student.parentId?.gender || 'Male',
      parentAddress: student.parentId?.address || '',
      parentRelationship: student.parentId?.relationship || '',
      dateOfBirth: student.userId?.dateOfBirth ? new Date(student.userId.dateOfBirth).toISOString().slice(0, 10) : '',
      phone: student.userId?.phone || '',
      gender: student.userId?.gender || 'Male',
    });
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const visibleStudents = students;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👨‍🎓 Student Management</h2>
        {currentUser && ['super_admin', 'principal', 'accountant_admin'].includes(currentUser.role) && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '➕ Add Student'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmitStudent}>
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
                <label>User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required={!editingId}
                  readOnly={!!editingId}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder={editingId ? 'Leave blank to keep current password' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class / Section</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {`Grade ${cls.grade} - Section ${cls.section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
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

            {currentUser && currentUser.role === 'super_admin' && (
              <>
                <div className="form-divider">
                  <h4>Parent / Guardian Details</h4>
                  <p style={{ marginTop: '8px', color: '#6b7280' }}>
                    If you have an existing parent account, supply the Parent Account ID here. To create a new parent account, fill the parent user details below; leaving Parent User ID blank will auto-generate a parent login.
                  </p>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Existing Parent Account ID</label>
                    <input
                      type="text"
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      placeholder="Link an existing parent account by ObjectId"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent User ID</label>
                    <input
                      type="text"
                      name="parentUserId"
                      value={formData.parentUserId}
                      onChange={handleInputChange}
                      placeholder="Leave blank to auto-generate when creating a new parent"
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Password</label>
                    <input
                      type="password"
                      name="parentPassword"
                      value={formData.parentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter to create/update parent account"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent First Name</label>
                    <input
                      type="text"
                      name="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Last Name</label>
                    <input
                      type="text"
                      name="parentLastName"
                      value={formData.parentLastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Email</label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Phone</label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Gender</label>
                    <select
                      name="parentGender"
                      value={formData.parentGender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      name="parentRelationship"
                      value={formData.parentRelationship}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Address</label>
                    <input
                      type="text"
                      name="parentAddress"
                      value={formData.parentAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-success">{editingId ? 'Update Student' : 'Save Student'}</button>
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
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Admission ID</th>
                <th>Grade / Section</th>
                <th>Roll Number</th>
                <th>Phone</th>
                <th>Guardian</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.userId?.firstName} {student.userId?.lastName}</td>
                  <td>{student.userId?.userId}</td>
                  <td>{student.class ? `Grade ${student.class.grade} - Section ${student.class.section}` : 'N/A'}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.userId?.phone}</td>
                  <td>{student.parentId?.firstName ? `${student.parentId.firstName} ${student.parentId.lastName}` : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                        {currentUser && ['super_admin', 'principal', 'accountant_admin'].includes(currentUser.role) && (
                          <button className="btn btn-secondary btn-small" onClick={() => handleEditStudent(student)}>Edit</button>
                        )}
                        {currentUser && ['super_admin', 'principal'].includes(currentUser.role) && (
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
