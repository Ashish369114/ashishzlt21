import React, { useState, useEffect } from 'react';
import { teacherService, classService, studentService, complaintService } from '../../services/api';

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
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-small" onClick={() => alert(`Assigned Classes:\n${teacherClasses.length ? teacherClasses.map((cls) => `Grade ${cls.grade} - Section ${cls.section}`).join('\n') : 'No classes assigned'}`)}>
                            Classes
                          </button>
                          
                          <button className="btn btn-secondary btn-small" onClick={() => setComplaintsModalTeacher(teacher)} style={{ position: 'relative' }}>
                            💬 Complaints
                            {allComplaints.filter(c => c.teacherId === teacher._id && ['New', 'Under Review'].includes(c.status)).length > 0 && (
                              <span style={{
                                position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold'
                              }}>
                                {allComplaints.filter(c => c.teacherId === teacher._id && ['New', 'Under Review'].includes(c.status)).length}
                              </span>
                            )}
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
                const reviewCount = tComplaints.filter(c => c.status === 'Under Review').length;
                const resolvedCount = tComplaints.filter(c => c.status === 'Resolved').length;
                const appreciationCount = tComplaints.filter(c => c.category === 'Appreciation').length;

                return (
                  <>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                      <div style={{ flex: 1, padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{tComplaints.length}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Complaints</div>
                      </div>
                      <div style={{ flex: 1, padding: '15px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>{openCount}</div>
                        <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>Open</div>
                      </div>
                      <div style={{ flex: 1, padding: '15px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b45309' }}>{reviewCount}</div>
                        <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}>Under Review</div>
                      </div>
                      <div style={{ flex: 1, padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>{resolvedCount}</div>
                        <div style={{ fontSize: '0.85rem', color: '#22c55e' }}>Resolved</div>
                      </div>
                      <div style={{ flex: 1, padding: '15px', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6d28d9' }}>{appreciationCount}</div>
                        <div style={{ fontSize: '0.85rem', color: '#8b5cf6' }}>Appreciations</div>
                      </div>
                    </div>

                    {tComplaints.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                        ✅ No complaints have been reported for this teacher.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                              <th style={{ padding: '12px' }}>Date</th>
                              <th style={{ padding: '12px' }}>Submitted By</th>
                              <th style={{ padding: '12px' }}>Category</th>
                              <th style={{ padding: '12px' }}>Priority</th>
                              <th style={{ padding: '12px' }}>Status</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tComplaints.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(complaint => (
                              <React.Fragment key={complaint._id}>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', background: expandedComplaintId === complaint._id ? '#f8fafc' : 'white' }}>
                                  <td style={{ padding: '12px' }}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                  <td style={{ padding: '12px' }}>
                                    {complaint.isAnonymous ? 'Anonymous' : (
                                      <>
                                        <div>{complaint.studentName}</div>
                                        {complaint.submittedByRole === 'parent' && <div style={{ fontSize: '0.8em', color: '#64748b' }}>Parent: {complaint.parentName}</div>}
                                      </>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px', fontWeight: '500' }}>{complaint.category}</td>
                                  <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                                      background: complaint.priority === 'High' ? '#fee2e2' : complaint.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                                      color: complaint.priority === 'High' ? '#b91c1c' : complaint.priority === 'Medium' ? '#b45309' : '#475569'
                                    }}>{complaint.priority}</span>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                                      background: complaint.status === 'New' ? '#fee2e2' : complaint.status === 'Under Review' ? '#fef3c7' : complaint.status === 'Resolved' ? '#dcfce7' : '#f1f5f9',
                                      color: complaint.status === 'New' ? '#b91c1c' : complaint.status === 'Under Review' ? '#b45309' : complaint.status === 'Resolved' ? '#15803d' : '#475569'
                                    }}>{complaint.status}</span>
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <button 
                                      onClick={() => setExpandedComplaintId(expandedComplaintId === complaint._id ? null : complaint._id)}
                                      style={{ background: 'none', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                      {expandedComplaintId === complaint._id ? 'Hide Details' : 'View Full Complaint'}
                                    </button>
                                  </td>
                                </tr>
                                {expandedComplaintId === complaint._id && (
                                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <td colSpan={6} style={{ padding: '20px' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                        <div>
                                          <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Description:</h4>
                                          <p style={{ margin: '0 0 20px 0', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
                                          
                                          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                            {complaint.status !== 'Under Review' && (
                                              <button onClick={async () => { await complaintService.updateStatus(complaint._id, 'Under Review'); fetchAllComplaints(); }} className="btn btn-secondary btn-small">Mark Under Review</button>
                                            )}
                                            {complaint.status !== 'Resolved' && (
                                              <button onClick={async () => { await complaintService.updateStatus(complaint._id, 'Resolved'); fetchAllComplaints(); }} className="btn btn-success btn-small">Mark Resolved</button>
                                            )}
                                            {complaint.status !== 'Closed' && (
                                              <button onClick={async () => { await complaintService.updateStatus(complaint._id, 'Closed'); fetchAllComplaints(); }} className="btn btn-secondary btn-small">Close Complaint</button>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div style={{ marginBottom: '15px' }}>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>Internal Remarks / Reply:</h4>
                                            <textarea 
                                              value={internalRemark} 
                                              onChange={(e) => setInternalRemark(e.target.value)} 
                                              placeholder="Add a note or reply..." 
                                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px', marginBottom: '8px' }}
                                            />
                                            <button 
                                              onClick={async () => { 
                                                if(!internalRemark) return; 
                                                const existing = complaint.principalNotes ? complaint.principalNotes + '\n\n' : '';
                                                await complaintService.addNote(complaint._id, existing + `[${new Date().toLocaleDateString()}] ` + internalRemark);
                                                setInternalRemark('');
                                                fetchAllComplaints();
                                              }} 
                                              className="btn btn-primary btn-small" style={{ width: '100%' }}
                                            >
                                              Save Remark
                                            </button>
                                          </div>
                                          
                                          {complaint.principalNotes && (
                                            <div style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                              <strong>History of Remarks:</strong><br/>
                                              {complaint.principalNotes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
