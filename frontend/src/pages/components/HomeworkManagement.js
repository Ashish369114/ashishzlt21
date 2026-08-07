import React, { useState, useEffect } from 'react';
import { homeworkService, classService } from '../../services/api';

const HomeworkManagement = () => {
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    dueDate: '',
  });
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [reviewData, setReviewData] = useState({
    status: 'Reviewed',
    teacherFeedback: '',
  });
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchHomework();
    fetchClasses();
    fetchSubjects();
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
    setSelectedClassId(matchedClass?._id || matchedClass?.id || '');
  }, [classes, selectedGrade, selectedSection]);

  const formatDateKey = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultSelectedDate = (homeworkItems = []) => {
    const upcomingDates = (homeworkItems || [])
      .filter((hw) => {
        const dueDate = hw.dueDate ? new Date(hw.dueDate) : null;
        if (!dueDate) return false;
        const isCompleted = (hw.submissions?.length || 0) > 0 && hw.submissions.every((submission) => ['Completed', 'Reviewed'].includes(submission?.status));
        return !isCompleted;
      })
      .map((hw) => hw.dueDate ? new Date(hw.dueDate) : null)
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (upcomingDates.length) {
      const selectedDateValue = new Date(upcomingDates[0]);
      selectedDateValue.setHours(0, 0, 0, 0);
      return formatDateKey(selectedDateValue);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return formatDateKey(today);
  };

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const response = await homeworkService.getAll();
      const homeworkItems = response.data || [];
      setHomework(homeworkItems);
      setSelectedDate((current) => current || getDefaultSelectedDate(homeworkItems));
    } catch (err) {
      setError('Failed to fetch homework');
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
      console.error('Failed to fetch classes:', err);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectHomework = (hw) => {
    setSelectedHomework(hw);
    setSelectedSubmission(null);
    setReviewData({ status: 'Reviewed', teacherFeedback: '' });
    setReviewSuccess('');
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setReviewData({
      status: submission.status || 'Reviewed',
      teacherFeedback: submission.teacherFeedback || '',
    });
    setReviewSuccess('');
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedHomework || !selectedSubmission) {
      setError('Please select a homework submission to review.');
      return;
    }
    try {
      await homeworkService.review(selectedHomework._id, {
        submissionId: selectedSubmission._id,
        status: reviewData.status,
        teacherFeedback: reviewData.teacherFeedback,
      });
      setReviewSuccess('Submission reviewed successfully.');
      setError('');
      const refreshed = await homeworkService.getAll();
      setHomework(refreshed.data);
      const updatedHomework = refreshed.data.find((hw) => hw._id === selectedHomework._id);
      setSelectedHomework(updatedHomework || null);
      if (updatedHomework) {
        const updatedSubmission = updatedHomework.submissions.find((sub) => sub._id === selectedSubmission._id);
        setSelectedSubmission(updatedSubmission || null);
      }
    } catch (err) {
      setError('Failed to review submission: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  const handleAddHomework = async (e) => {
    e.preventDefault();
    if (!currentUser?.id && !currentUser?.userId) {
      setError('Could not determine current user. Please log in again.');
      return;
    }

    try {
      const data = {
        ...formData,
        teacher: currentUser.id || currentUser.userId,
      };
      await homeworkService.add(data);
      setFormData({
        title: '',
        description: '',
        class: '',
        subject: '',
        dueDate: '',
      });
      setSelectedDate(data.dueDate);
      setShowForm(false);
      fetchHomework();
      setError('');
    } catch (err) {
      setError('Failed to add homework: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const selectedDateValue = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const visibleHomework = homework.filter((hw) => {
    const hwClassId = hw.class?._id || hw.class || hw.classId;
    const matchesClass = !selectedClassId || String(hwClassId) === String(selectedClassId);
    if (!matchesClass) return false;

    const dueDate = hw.dueDate ? new Date(hw.dueDate) : null;
    const isCompleted = (hw.submissions?.length || 0) > 0 && hw.submissions.every((submission) => ['Completed', 'Reviewed'].includes(submission?.status));
    if (isCompleted) return false;

    if (!selectedDateValue || !dueDate) return false;
    const dueDay = new Date(dueDate);
    dueDay.setHours(0, 0, 0, 0);
    return dueDay.getTime() === selectedDateValue.getTime();
  });

  const calendarDays = Array.from({ length: 35 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 7 + index);
    return date;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '50px',
              background: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>📖 Homework Management</h2>
        </div>
        {(currentUser?.role === 'teacher' || currentUser?.role === 'principal') && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '➕ Assign Homework'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <div className="form-group">
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!sectionsForGrade.length}>
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {(currentUser?.role === 'teacher' || currentUser?.role === 'principal') && showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Assign New Homework</h3>
          <form onSubmit={handleAddHomework}>
            <div className="form-row full">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Assign Homework</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : !selectedClassId ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          Select a grade and section to view homework.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', marginBottom: '20px' }}>
            {calendarDays.map((date) => {
              const dateKey = formatDateKey(date);
              const hasHomework = homework.some((hw) => {
                const dueDate = hw.dueDate ? new Date(hw.dueDate) : null;
                if (!dueDate) return false;
                const isCompleted = (hw.submissions?.length || 0) > 0 && hw.submissions.every((submission) => ['Completed', 'Reviewed'].includes(submission?.status));
                if (isCompleted) return false;
                const compareDate = new Date(dueDate);
                compareDate.setHours(0, 0, 0, 0);
                const selectedDay = new Date(date);
                selectedDay.setHours(0, 0, 0, 0);
                return compareDate.getTime() === selectedDay.getTime();
              });
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '6px',
                    border: selectedDate === dateKey ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    backgroundColor: selectedDate === dateKey ? '#f3e8ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div style={{ fontWeight: '700' }}>{date.getDate()}</div>
                  {hasHomework && <div style={{ fontSize: '0.7rem', color: '#7c3aed' }}>●</div>}
                </button>
              );
            })}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {visibleHomework.length === 0 ? (
                  <tr>
                    <td colSpan="5">No homework for this date.</td>
                  </tr>
                ) : (
                  visibleHomework.map((hw) => (
                    <tr key={hw._id}>
                      <td><strong>{hw.title}</strong></td>
                      <td>{hw.description}</td>
                      <td>{new Date(hw.assignedDate).toLocaleDateString()}</td>
                      <td>{new Date(hw.dueDate).toLocaleDateString()}</td>
                      <td>
                        <div>{hw.submissions?.length || 0} submission(s)</div>
                        {hw.submissions?.length > 0 && (
                          <button className="btn btn-sm btn-secondary" type="button" onClick={() => handleSelectHomework(hw)}>
                            Review Submissions
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedHomework && (
            <div className="form-container" style={{ marginTop: '24px' }}>
              <h3>Review submissions for: {selectedHomework.title}</h3>
              {selectedHomework.submissions.length === 0 ? (
                <p>No submissions available for this assignment.</p>
              ) : (
                <div>
                  {selectedHomework.submissions.map((submission) => (
                    <div key={submission._id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '12px', borderRadius: '6px' }}>
                      <div><strong>Student:</strong> {submission.student?.firstName ? `${submission.student.firstName} ${submission.student.lastName}` : submission.student?._id || submission.student}</div>
                      <div><strong>Status:</strong> {submission.status}</div>
                      <div><strong>Attached File:</strong> {submission.fileName || 'None'}</div>
                      <div><strong>Student Comments:</strong> {submission.comments || 'None'}</div>
                      {submission.teacherFeedback && <div><strong>Teacher Feedback:</strong> {submission.teacherFeedback}</div>}
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSelectSubmission(submission)}
                        >
                          Review This Submission
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSubmission && (
                <form onSubmit={handleSubmitReview} style={{ marginTop: '16px' }}>
                  <h4>Review Submission</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={reviewData.status} onChange={handleReviewChange}>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Teacher Feedback</label>
                    <textarea
                      name="teacherFeedback"
                      value={reviewData.teacherFeedback}
                      onChange={handleReviewChange}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Save Review</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Cancel
                  </button>
                  {reviewSuccess && <div className="alert alert-success" style={{ marginTop: '12px' }}>{reviewSuccess}</div>}
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeworkManagement;
