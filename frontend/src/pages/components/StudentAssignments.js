import React, { useEffect, useState } from 'react';
import { homeworkService } from '../../services/api';

const StudentAssignments = ({ userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadData, setUploadData] = useState({});

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await homeworkService.getByStudent(userId);
        setAssignments(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load assignment tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [userId]);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFileChange = (homeworkId, file) => {
    setUploadData((prev) => ({
      ...prev,
      [homeworkId]: {
        file,
        fileName: file?.name || '',
        fileType: file?.type || '',
      },
    }));
  };

  const handleSubmitAssignment = async (homeworkId) => {
    const upload = uploadData[homeworkId];
    if (!upload?.file) {
      setError('Please select a file before uploading.');
      return;
    }

    try {
      setLoading(true);
      const fileData = await readFileAsBase64(upload.file);
      await homeworkService.submit(homeworkId, {
        fileName: upload.fileName,
        fileType: upload.fileType,
        fileData,
        comments: 'Uploaded assignment submission',
      });
      setError('');
      setUploadData((prev) => ({ ...prev, [homeworkId]: {} }));
      const response = await homeworkService.getByStudent(userId);
      setAssignments(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to upload assignment.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (item) => {
    const submission = item.submissions?.find((submission) => submission.student?._id?.toString?.() === userId?.toString?.() || submission.student?.toString?.() === userId?.toString?.());
    if (submission) {
      return submission.status || 'Submitted';
    }
    if (item.dueDate && new Date(item.dueDate) < new Date()) {
      return 'Overdue';
    }
    return 'Pending';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📌 My Assignments</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : assignments.length === 0 ? (
        <div className="card-content">No assignments are available right now.</div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Total Assignments</h3>
              <div className="value">{assignments.length}</div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="value">{assignments.filter((item) => getStatusLabel(item) === 'Pending').length}</div>
            </div>
            <div className="stat-card">
              <h3>Submitted</h3>
              <div className="value">{assignments.filter((item) => getStatusLabel(item) !== 'Pending' && getStatusLabel(item) !== 'Overdue').length}</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => {
                  const upload = uploadData[item._id] || {};
                  const status = getStatusLabel(item);
                  return (
                    <tr key={item._id}>
                      <td>{item.title || item.name}</td>
                      <td>{item.subject?.name || '-'}</td>
                      <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                      <td>{status}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input type="file" onChange={(e) => handleFileChange(item._id, e.target.files?.[0])} />
                          <button className="btn btn-small btn-primary" onClick={() => handleSubmitAssignment(item._id)} disabled={!upload.file}>
                            Upload
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAssignments;
