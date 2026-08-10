import React, { useState, useEffect } from 'react';
import { teacherService, classService, studentService, complaintService } from '../../services/api';
import { demoEmployees, demoClasses, demoStudents } from '../../utils/demoData';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [allComplaints, setAllComplaints] = useState([]);
  const [complaintsModalTeacher, setComplaintsModalTeacher] = useState(null);
  const [internalRemark, setInternalRemark] = useState('');
  const [complaintReply, setComplaintReply] = useState('');
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
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
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
    try {
      const res = await complaintService.getAll();
      setAllComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    }
  };

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
      const response = await teacherService.getAll().catch(err => ({ data: [] }));
      let list = response?.data && response.data.length ? response.data : demoEmployees;
      const hasRamesh = list.some(t => 
        (t.firstName === 'Ramesh' && t.lastName === 'Sharma') ||
        (t.user && t.user.firstName === 'Ramesh' && t.user.lastName === 'Sharma')
      );
      if (!hasRamesh) {
        list = [
          {
            _id: 'teacher_ramesh_sharma',
            employeeId: 'EMP-T-001',
            firstName: 'Ramesh',
            lastName: 'Sharma',
            subject: 'Mathematics',
            email: 'ramesh.sharma@school.com',
            phone: '9876543210',
            gender: 'Male',
            qualifications: 'M.Sc. Mathematics, B.Ed.',
            experience: 8,
            assignedClasses: [{ className: '9-A', grade: '9', section: 'A' }]
          },
          ...list
        ];
      }
      setTeachers(list);
      setError('');
    } catch (err) {
      console.warn('API error, using demo teachers:', err);
      setTeachers(demoEmployees);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects().catch(err => ({ data: [] }));
      setSubjects(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll().catch(err => ({ data: [] }));
      setClasses(response?.data && response.data.length ? response.data : demoClasses);
    } catch (err) {
      console.warn('Failed to fetch classes, using demo classes:', err);
      setClasses(demoClasses);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll().catch(err => ({ data: [] }));
      setStudents(response?.data && response.data.length ? response.data : demoStudents);
    } catch (err) {
      console.warn('Failed to fetch students, using demo students:', err);
      setStudents(demoStudents);
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
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-small" onClick={() => alert(`Assigned Classes:\n${teacherClasses.length ? teacherClasses.map((cls) => `Grade ${cls.grade} - Section ${cls.section}`).join('\n') : 'No classes assigned'}`)}>
                            Classes
                          </button>
                          
                          <button className="btn btn-secondary btn-small" onClick={() => setComplaintsModalTeacher(teacher)}>
                            📝 Remarks
                          </button>
                          
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
      
      {complaintsModalTeacher && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>📝 Remarks for {complaintsModalTeacher.userId?.firstName} {complaintsModalTeacher.userId?.lastName}</h2>
              <button onClick={() => setComplaintsModalTeacher(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>Add Remark:</h4>
                <textarea 
                  value={internalRemark} 
                  onChange={(e) => setInternalRemark(e.target.value)} 
                  placeholder="Type a new remark here..." 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', marginBottom: '12px', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
                <button 
                  onClick={async () => { 
                    if(!internalRemark) return; 
                    const existing = complaintsModalTeacher.remarks ? complaintsModalTeacher.remarks + '\n\n' : '';
                    const newRemarks = existing + `[${new Date().toLocaleDateString()}] ` + internalRemark;
                    await teacherService.update(complaintsModalTeacher._id, { remarks: newRemarks });
                    setInternalRemark('');
                    // Update local state for immediate feedback
                    setComplaintsModalTeacher({ ...complaintsModalTeacher, remarks: newRemarks });
                    fetchTeachers();
                  }} 
                  className="btn btn-primary" style={{ width: '100%' }}
                >
                  Save Remark
                </button>
              </div>
              
              {complaintsModalTeacher.remarks ? (
                <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>History of Remarks:</h4>
                  {complaintsModalTeacher.remarks}
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  No remarks have been added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherManagement;
