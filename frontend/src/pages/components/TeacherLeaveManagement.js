import React, { useState, useEffect } from 'react';

const TeacherLeaveManagement = ({ teacherId, user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    approverComments: '',
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    // Simulated leave data
    setLeaves([
      {
        id: 1,
        leaveType: 'Sick Leave',
        fromDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        reason: 'Medical treatment',
        status: 'Approved',
        approverComments: 'Approved by Principal',
        appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        daysUsed: 3,
      },
      {
        id: 2,
        leaveType: 'Casual Leave',
        fromDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        reason: 'Personal work',
        status: 'Pending',
        approverComments: '',
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        daysUsed: 1,
      },
      {
        id: 3,
        leaveType: 'Earned Leave',
        fromDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        reason: 'Vacation',
        status: 'Approved',
        approverComments: 'Approved by Principal',
        appliedDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        daysUsed: 6,
      },
      {
        id: 4,
        leaveType: 'Sick Leave',
        fromDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        reason: 'Medical checkup',
        status: 'Rejected',
        approverComments: 'Clashes with exam schedule',
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        daysUsed: 0,
      },
    ]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      setError('Please fill all required fields');
      return;
    }

    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);

    if (fromDate > toDate) {
      setError('From date must be before to date');
      return;
    }

    const daysRequested = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      id: leaves.length + 1,
      leaveType: formData.leaveType,
      fromDate: fromDate,
      toDate: toDate,
      reason: formData.reason,
      status: 'Pending',
      approverComments: '',
      appliedDate: new Date(),
      daysUsed: 0,
    };

    setLeaves([newLeave, ...leaves]);
    setFormData({ leaveType: '', fromDate: '', toDate: '', reason: '', approverComments: '' });
    setShowForm(false);
    setError('');
  };

  const calculateLeaveBalance = () => {
    const approved = leaves.filter(l => l.status === 'Approved');
    const usedDays = approved.reduce((sum, l) => {
      const days = Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    return {
      totalAllocated: 30,
      used: usedDays,
      balance: 30 - usedDays,
      sick: 10,
      casual: 10,
      earned: 10,
    };
  };

  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return leave.status === 'Pending';
    if (activeTab === 'approved') return leave.status === 'Approved';
    if (activeTab === 'rejected') return leave.status === 'Rejected';
    return true;
  });

  const balance = calculateLeaveBalance();

  const getStatusColor = (status) => {
    if (status === 'Approved') return '#dcfce7';
    if (status === 'Pending') return '#fef3c7';
    if (status === 'Rejected') return '#fee2e2';
    return '#f3f4f6';
  };

  const getStatusTextColor = (status) => {
    if (status === 'Approved') return '#15803d';
    if (status === 'Pending') return '#92400e';
    if (status === 'Rejected') return '#991b1b';
    return '#374151';
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Leave Balance</h3>
          <div className="value" style={{ color: '#10b981' }}>{balance.balance}</div>
          <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '5px' }}>
            Out of {balance.totalAllocated} days
          </div>
        </div>
        <div className="stat-card">
          <h3>Days Used</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{balance.used}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <div className="value" style={{ color: '#3b82f6' }}>
            {leaves.filter(l => l.status === 'Pending').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Leaves</h3>
          <div className="value">{leaves.length}</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8em', color: '#0c4a6e' }}>Sick Leave</div>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#0369a1' }}>{balance.sick}</div>
          <div style={{ fontSize: '0.75em', color: '#0c4a6e', marginTop: '3px' }}>Allocated</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#fce7f3', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8em', color: '#831843' }}>Casual Leave</div>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#be185d' }}>{balance.casual}</div>
          <div style={{ fontSize: '0.75em', color: '#831843', marginTop: '3px' }}>Allocated</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8em', color: '#15803d' }}>Earned Leave</div>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#16a34a' }}>{balance.earned}</div>
          <div style={{ fontSize: '0.75em', color: '#15803d', marginTop: '3px' }}>Allocated</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('all')}
        >
          📋 All Leaves ({leaves.length})
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({leaves.filter(l => l.status === 'Pending').length})
        </button>
        <button
          className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('approved')}
        >
          ✓ Approved ({leaves.filter(l => l.status === 'Approved').length})
        </button>
        <button
          className={`btn ${activeTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rejected')}
        >
          ✗ Rejected ({leaves.filter(l => l.status === 'Rejected').length})
        </button>
      </div>

      {!showForm && (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '20px' }}
          disabled={balance.balance === 0}
        >
          ➕ Apply for Leave
        </button>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h2>➕ Apply for Leave</h2>
          </div>
          <form onSubmit={handleApplyLeave}>
            <div className="form-row">
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Leave Type --</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>To Date *</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Reason for Leave *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Please provide details for your leave request..."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">✓ Submit Request</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ leaveType: '', fromDate: '', toDate: '', reason: '', approverComments: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredLeaves.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Approver Comments</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(leave => (
                <tr key={leave.id}>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '3px',
                      backgroundColor: leave.leaveType === 'Sick Leave' ? '#dbeafe' :
                                      leave.leaveType === 'Casual Leave' ? '#fce7f3' : '#dcfce7',
                      fontSize: '0.85em',
                      fontWeight: '500'
                    }}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td>{leave.fromDate.toLocaleDateString()}</td>
                  <td>{leave.toDate.toLocaleDateString()}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {leave.reason}
                  </td>
                  <td style={{ fontSize: '0.9em', color: '#6b7280' }}>
                    {leave.appliedDate.toLocaleDateString()}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '3px',
                      backgroundColor: getStatusColor(leave.status),
                      color: getStatusTextColor(leave.status),
                      fontSize: '0.85em',
                      fontWeight: 'bold'
                    }}>
                      {leave.status === 'Approved' && '✓ '}
                      {leave.status === 'Rejected' && '✗ '}
                      {leave.status === 'Pending' && '⏳ '}
                      {leave.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9em', color: '#6b7280' }}>
                    {leave.approverComments || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No leaves in this category
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaveManagement;
