import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const StatusBadge = ({ paid, paidAmount, amount }) => {
  const balance = Math.max(Number(amount || 0) - Number(paidAmount || 0), 0);
  const isPaid = paid || balance === 0;
  const isPartial = !isPaid && Number(paidAmount || 0) > 0;

  if (isPaid) return (
    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
      ✅ Paid
    </span>
  );
  if (isPartial) return (
    <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
      ⚠️ Partial
    </span>
  );
  return (
    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
      ❌ Unpaid
    </span>
  );
};

const PrincipalPendingFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noticeState, setNoticeState] = useState({}); // { feeId: 'sent' | 'sending' }
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await feeService.getPending();
        setFees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to load fee data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const getStatus = (fee) => {
    const amount = Number(fee.amount || 0);
    const paid = Number(fee.paidAmount || 0);
    const balance = Math.max(amount - paid, 0);
    if (fee.isPaid || balance === 0) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const handleSendNotice = async (fee) => {
    const id = fee._id;
    setNoticeState(prev => ({ ...prev, [id]: 'sending' }));
    // Simulate sending notice (replace with real API call when notification service ready)
    await new Promise(r => setTimeout(r, 900));
    setNoticeState(prev => ({ ...prev, [id]: 'sent' }));
    // Auto-reset after 3s
    setTimeout(() => setNoticeState(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    }), 3000);
  };

  // Stats
  const total = fees.length;
  const unpaidCount = fees.filter(f => getStatus(f) === 'unpaid').length;
  const partialCount = fees.filter(f => getStatus(f) === 'partial').length;
  const totalPending = fees.reduce((sum, f) => {
    const balance = Math.max(Number(f.amount || 0) - Number(f.paidAmount || 0), 0);
    return sum + balance;
  }, 0);

  // Filter
  const filtered = fees.filter(fee => {
    const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const status = getStatus(fee);
    const matchStatus = filterStatus === 'all' || status === filterStatus;
    return matchSearch && matchStatus;
  });

  const cardStyle = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>⏳ Fee Overview</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
          Read-only view of student fee status. Use Send Notice to remind parents of pending dues.
        </p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Total Records', val: total,        icon: '📋', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Unpaid',        val: unpaidCount,   icon: '❌', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Partial',       val: partialCount,  icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Total Pending', val: `₹${totalPending.toLocaleString('en-IN')}`, icon: '💰', color: '#0891b2', bg: '#ecfeff' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: s.bg }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search student name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', background: '#fff', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>Loading fee records…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No records found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Student', 'Total Fee', 'Paid', 'Balance Pending', 'Due Date', 'Status', 'Send Notice'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((fee, i) => {
                  const amount  = Number(fee.amount || 0);
                  const paid    = Number(fee.paidAmount || 0);
                  const balance = Math.max(amount - paid, 0);
                  const status  = getStatus(fee);
                  const notice  = noticeState[fee._id];

                  return (
                    <tr
                      key={fee._id}
                      style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      {/* Student */}
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1f2937' }}>
                          {fee.student?.firstName} {fee.student?.lastName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
                          {fee.description || 'Fee Record'}
                        </div>
                      </td>
                      {/* Total */}
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: '#374151' }}>
                        ₹{amount.toLocaleString('en-IN')}
                      </td>
                      {/* Paid */}
                      <td style={{ padding: '11px 14px', color: '#15803d', fontWeight: 600 }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      {/* Balance */}
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: balance > 0 ? '#b91c1c' : '#15803d' }}>
                        {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '—'}
                      </td>
                      {/* Due Date */}
                      <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '11px 14px' }}>
                        <StatusBadge paid={fee.isPaid} paidAmount={fee.paidAmount} amount={fee.amount} />
                      </td>
                      {/* Send Notice */}
                      <td style={{ padding: '11px 14px' }}>
                        {status === 'paid' ? (
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                        ) : notice === 'sent' ? (
                          <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>✅ Notice Sent!</span>
                        ) : (
                          <button
                            onClick={() => handleSendNotice(fee)}
                            disabled={notice === 'sending'}
                            style={{
                              padding: '6px 14px',
                              background: notice === 'sending' ? '#e0e7ff' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                              color: notice === 'sending' ? '#6366f1' : '#fff',
                              border: 'none',
                              borderRadius: '7px',
                              cursor: notice === 'sending' ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s',
                            }}
                          >
                            {notice === 'sending' ? '📤 Sending…' : '📣 Send Notice'}
                          </button>
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

      {/* Footer note */}
      <p style={{ marginTop: '14px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
        💡 This is a read-only overview. To process payments, contact the Accountant.
      </p>
    </div>
  );
};

export default PrincipalPendingFees;
