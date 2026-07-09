import React, { useState, useEffect } from 'react';
import { concessionService } from '../../services/api';

const ConcessionManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remarks, setRemarks] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await concessionService.getAll();
      setRequests(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load concession requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await concessionService.approve(id, remarks[id] || 'Approved by Principal');
      setSuccess(response.data?.message || 'Concession approved successfully!');
      fetchRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve concession.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await concessionService.reject(id, remarks[id] || 'Rejected by Principal');
      setSuccess(response.data?.message || 'Concession request rejected.');
      fetchRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject concession.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleRemarkChange = (id, val) => {
    setRemarks(prev => ({ ...prev, [id]: val }));
  };

  const isApprover = currentUser && ['super_admin', 'principal'].includes(currentUser.role);

  return (
    <div className="card">
      <div className="card-header">
        <h2>✍ Fee Concession Requests</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Admission ID</th>
                <th>Fee Details</th>
                <th>Concession Amount</th>
                <th>Requested By</th>
                <th>Reason</th>
                <th>Status</th>
                {isApprover && <th>Approval Remarks</th>}
                {isApprover && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.student?.firstName} {req.student?.lastName}</td>
                    <td>{req.student?.userId || 'N/A'}</td>
                    <td>{req.fee?.description || 'Tuition Fee'}</td>
                    <td style={{ fontWeight: 'bold', color: '#dc2626' }}>₹{req.concessionAmount}</td>
                    <td>{req.requestedBy?.firstName} {req.requestedBy?.lastName}</td>
                    <td>{req.reason}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85em',
                          fontWeight: 'bold',
                          backgroundColor:
                            req.status === 'approved' ? '#4caf50' :
                            req.status === 'rejected' ? '#f44336' : '#ff9800',
                          color: '#fff',
                        }}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    {isApprover && (
                      <td>
                        {req.status === 'pending' ? (
                          <input
                            type="text"
                            placeholder="Add approval comments..."
                            value={remarks[req._id] || ''}
                            onChange={(e) => handleRemarkChange(req._id, e.target.value)}
                            style={{ width: '150px', padding: '6px' }}
                          />
                        ) : (
                          <span>{req.remarks || '-'}</span>
                        )}
                      </td>
                    )}
                    {isApprover && (
                      <td>
                        {req.status === 'pending' ? (
                          <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-success btn-small"
                              onClick={() => handleApprove(req._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleReject(req._id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.9em' }}>Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isApprover ? 9 : 7} style={{ textAlign: 'center' }}>
                    No concession requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConcessionManagement;
