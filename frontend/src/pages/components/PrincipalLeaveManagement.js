import React, { useState, useEffect, useCallback } from 'react';
import { leaveService } from '../../services/api';

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    teacher: { label: '👨‍🏫 Teacher',  bg: '#dbeafe', color: '#1d4ed8' },
    student: { label: '👨‍🎓 Student',  bg: '#dcfce7', color: '#15803d' },
    parent:  { label: '👪 Parent',    bg: '#fef3c7', color: '#b45309' },
    staff:   { label: '🏢 Staff',     bg: '#f3e8ff', color: '#7c3aed' },
  };
  const s = map[role] || { label: role, bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 9px', borderRadius: '20px',
      fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: '⏳ Pending',  bg: '#fef3c7', color: '#92400e' },
    approved: { label: '✅ Approved', bg: '#dcfce7', color: '#15803d' },
    rejected: { label: '❌ Rejected', bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = map[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '0.78rem', fontWeight: 700,
    }}>
      {s.label}
    </span>
  );
};

// ── Date formatter ────────────────────────────────────────────────────────────
const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const days = (from, to) => {
  if (!from || !to) return 0;
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

// ── Main component ────────────────────────────────────────────────────────────
const PrincipalLeaveManagement = () => {
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [activeTab,   setActiveTab]   = useState('All');
  const [selected,    setSelected]    = useState(null);   // leave for detail/action
  const [actionType,  setActionType]  = useState('');     // 'approve' | 'reject'
  const [remarks,     setRemarks]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [filterRole,  setFilterRole]  = useState('all');  // filter by applicant role
  const [search,      setSearch]      = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await leaveService.getAll();
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load leave requests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // Auto-dismiss success message
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  // ── Derived filtered list ──────────────────────────────────────────────────
  const filtered = leaves.filter((l) => {
    const tabMatch =
      activeTab === 'All'      ? true :
      activeTab === 'Pending'  ? l.status === 'pending'  :
      activeTab === 'Approved' ? l.status === 'approved' :
                                 l.status === 'rejected';
    const roleMatch = filterRole === 'all' || l.applicantRole === filterRole;
    const q = search.toLowerCase();
    const searchMatch = !q ||
      (l.applicantName || '').toLowerCase().includes(q) ||
      (l.applicantId   || '').toLowerCase().includes(q) ||
      (l.leaveType     || '').toLowerCase().includes(q) ||
      (l.reason        || '').toLowerCase().includes(q);
    return tabMatch && roleMatch && searchMatch;
  });

  // ── Counters for tab badges ────────────────────────────────────────────────
  const counts = {
    All:      leaves.length,
    Pending:  leaves.filter(l => l.status === 'pending').length,
    Approved: leaves.filter(l => l.status === 'approved').length,
    Rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  // ── Action handlers ────────────────────────────────────────────────────────
  const openAction = (leave, type) => {
    setSelected(leave);
    setActionType(type);
    setRemarks('');
  };

  const closeAction = () => {
    setSelected(null);
    setActionType('');
    setRemarks('');
  };

  const submitAction = async () => {
    if (actionType === 'reject' && !remarks.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      if (actionType === 'approve') {
        await leaveService.approve(selected._id, remarks || 'Approved');
        setSuccess(`✅ Leave approved for ${selected.applicantName}`);
      } else {
        await leaveService.reject(selected._id, remarks);
        setSuccess(`❌ Leave rejected for ${selected.applicantName}`);
      }
      closeAction();
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (leave) => {
    if (!window.confirm(`Delete this leave request from ${leave.applicantName}?`)) return;
    try {
      await leaveService.remove(leave._id);
      setSuccess('Leave request deleted.');
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const cardStyle = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 4px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>🗓️ Leave Management</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.88rem' }}>
            Review and approve or reject leave requests from staff, teachers, students &amp; parents.
          </p>
        </div>
        <button
          onClick={fetchLeaves}
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.87rem' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Alerts ── */}
      {error   && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{success}</div>}

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Total',    val: counts.All,      color: '#6366f1', bg: '#eef2ff', icon: '📋' },
          { label: 'Pending',  val: counts.Pending,  color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
          { label: 'Approved', val: counts.Approved, color: '#22c55e', bg: '#f0fdf4', icon: '✅' },
          { label: 'Rejected', val: counts.Rejected, color: '#ef4444', bg: '#fef2f2', icon: '❌' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: s.bg }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search by name, ID, leave type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1', minWidth: '200px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none' }}
        />
        {/* Role filter */}
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
          <option value="parent">Parents</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#6366f1' : '#6b7280',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            {tab} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading leave requests…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No leave requests found</p>
            <p style={{ fontSize: '0.85rem' }}>Try changing the filter or tab.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Applicant', 'Role', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((leave, i) => (
                  <tr
                    key={leave._id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#1f2937' }}>{leave.applicantName || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{leave.applicantId}</div>
                    </td>
                    <td style={{ padding: '11px 12px' }}><RoleBadge role={leave.applicantRole} /></td>
                    <td style={{ padding: '11px 12px', fontWeight: 600, color: '#374151' }}>{leave.leaveType}</td>
                    <td style={{ padding: '11px 12px', color: '#4b5563' }}>{fmt(leave.fromDate)}</td>
                    <td style={{ padding: '11px 12px', color: '#4b5563' }}>{fmt(leave.toDate)}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 700, color: '#6366f1' }}>
                      {leave.leaveDays ?? days(leave.fromDate, leave.toDate)}
                    </td>
                    <td style={{ padding: '11px 12px', maxWidth: '200px', color: '#6b7280' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                        {leave.reason}
                      </div>
                      {leave.remarks && (
                        <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '3px', fontStyle: 'italic' }} title={leave.remarks}>
                          Remark: {leave.remarks}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px' }}><StatusBadge status={leave.status} /></td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openAction(leave, 'approve')}
                              style={{ padding: '5px 10px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => openAction(leave, 'reject')}
                              style={{ padding: '5px 10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(leave)}
                          style={{ padding: '5px 8px', background: '#f1f5f9', color: '#6b7280', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Action modal ── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem' }}>
              {actionType === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '0.88rem' }}>
              {selected.applicantName} — <strong>{selected.leaveType}</strong> ({fmt(selected.fromDate)} → {fmt(selected.toDate)}, {days(selected.fromDate, selected.toDate)} day{days(selected.fromDate, selected.toDate) !== 1 ? 's' : ''})
            </p>

            {/* Reason display */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.86rem', color: '#374151' }}>
              <strong>Reason:</strong> {selected.reason}
            </div>

            <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.87rem' }}>
              {actionType === 'reject' ? '⚠️ Rejection Reason (required)' : '💬 Remarks (optional)'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'e.g. Approved. Please arrange substitution.'
                  : 'e.g. Exam season — please reschedule.'
              }
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
            />
            {error && <div style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '6px', fontWeight: 600 }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={closeAction} style={{ padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting}
                style={{
                  padding: '9px 22px', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, color: '#fff',
                  background: actionType === 'approve'
                    ? (submitting ? '#86efac' : '#22c55e')
                    : (submitting ? '#fca5a5' : '#ef4444'),
                }}
              >
                {submitting ? '…' : actionType === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalLeaveManagement;
