import React, { useState, useEffect } from 'react';
import { homeworkService } from '../../services/api';

const StudentHomework = ({ userId }) => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadData, setUploadData] = useState({});

  const fetchHomework = React.useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await homeworkService.getByStudent(userId);
      setHomework(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch homework');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  useEffect(() => {
    const handleHomeworkUpdated = () => {
      if (userId) {
        fetchHomework();
      }
    };

    window.addEventListener('homeworkUpdated', handleHomeworkUpdated);
    return () => window.removeEventListener('homeworkUpdated', handleHomeworkUpdated);
  }, [userId, fetchHomework]);

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (homeworkId, file) => {
    setUploadData((prev) => ({
      ...prev,
      [homeworkId]: {
        ...(prev[homeworkId] || {}),
        file,
        fileName: file.name,
        fileType: file.type,
      },
    }));
  };

  const handleCommentsChange = (homeworkId, comments) => {
    setUploadData((prev) => ({
      ...prev,
      [homeworkId]: {
        ...(prev[homeworkId] || {}),
        comments,
      },
    }));
  };

  const handleSubmitHomework = async (homeworkId) => {
    const upload = uploadData[homeworkId];
    if (!upload?.file) {
      setError('Please select a file before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const fileData = await readFileAsBase64(upload.file);
      await homeworkService.submit(homeworkId, {
        fileName: upload.fileName,
        fileType: upload.fileType,
        fileData,
        comments: upload.comments || '',
      });
      setSuccessMessage('Homework submitted successfully.');
      setUploadData((prev) => ({
        ...prev,
        [homeworkId]: {},
      }));
      fetchHomework();
      window.dispatchEvent(new Event('homeworkUpdated'));
    } catch (err) {
      setError('Failed to submit homework');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentSubmission = (hw) => {
    if (!hw.submissions?.length) return null;
    return hw.submissions.find((submission) => submission.student?._id?.toString() === userId?.toString() || submission.student?.toString() === userId?.toString());
  };

  const buildSubmissionUrl = (submission) => {
    if (!submission?.fileData) return null;
    return `data:${submission.fileType};base64,${submission.fileData}`;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📖 My Homework</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Submission</th>
              </tr>
            </thead>
            <tbody>
              {homework.map((hw) => {
                const submission = getStudentSubmission(hw);
                const overdue = isOverdue(hw.dueDate);
                const status = submission ? submission.status : overdue ? 'Overdue' : 'Pending';
                const canUpload = !submission && !overdue;
                const upload = uploadData[hw._id] || {};
                return (
                  <tr key={hw._id}>
                    <td><strong>{hw.title}</strong></td>
                    <td>{hw.description}</td>
                    <td>{hw.subject?.name || '-'}</td>
                    <td>{hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: status === 'Overdue' ? '#fee2e2' : status === 'Completed' ? '#d1fae5' : '#f3e8ff',
                        color: status === 'Overdue' ? '#991b1b' : '#0c4a6e',
                      }}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {submission ? (
                        <div>
                          <div>{submission.fileName}</div>
                          <div>{submission.comments || 'No comments'}</div>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              const url = buildSubmissionUrl(submission);
                              if (url) {
                                window.open(url, '_blank');
                              }
                            }}
                          >
                            Open File
                          </button>
                          {submission.teacherFeedback && <div style={{ marginTop: '8px' }}><strong>Teacher Feedback:</strong> {submission.teacherFeedback}</div>}
                        </div>
                      ) : canUpload ? (
                        <div>
                          <input
                            type="file"
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileChange(hw._id, file);
                              }
                            }}
                          />
                          <textarea
                            placeholder="Comments (optional)"
                            value={upload.comments || ''}
                            onChange={(e) => handleCommentsChange(hw._id, e.target.value)}
                            rows="2"
                            style={{ width: '100%', marginTop: '8px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={!upload.file}
                            onClick={() => handleSubmitHomework(hw._id)}
                          >
                            Save / Submit
                          </button>
                        </div>
                      ) : (
                        <div>{overdue ? 'Submission closed' : 'No submission yet'}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
