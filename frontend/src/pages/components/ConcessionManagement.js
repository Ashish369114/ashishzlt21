import React, { useState, useEffect } from 'react';
import { concessionService } from '../../services/api';

const fmt   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const rupee = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const ConcessionManagement = () => {
  const [concessions, setConcessions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const res = await concessionService.getAll();
      setConcessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load concession records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = concessions.filter(c => {
    const name = `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const totalAmount = concessions.reduce((s, c) => s + Number(c.concessionAmount || 0), 0);
  const thisMonth   = concessions.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length;
  const cardStyle   = { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>🎁 Concession Log</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
            Read-only view of all concessions granted by the Principal. Fee records are already updated.
          </p>
        </div>
        <button onClick={fetchAll} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e' }}>
          Concessions are granted directly by the Principal. Each concession is <strong>auto-applied</strong> to the fee record — no action needed from the Accountant.
        </p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Concessions', val: concessions.length,  icon: '🎁', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Amount',      val: rupee(totalAmount),   icon: '💰', color: '#15803d', bg: '#dcfce7' },
          { label: 'This Month',        val: thisMonth,            icon: '📅', color: '#0891b2', bg: '#ecfeff' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: s.bg }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input type="text" placeholder="🔍 Search student…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }} />

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>⏳ Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No concessions have been granted yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Student', 'Fee Record', 'Original Fee', 'Concession', 'New Fee', 'Reason', 'Granted On', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const origFee = Number(c.fee?.amount || 0) + Number(c.concessionAmount || 0);
                  const newFee  = Number(c.fee?.amount || 0);
                  return (
                    <tr key={c._id}
                      style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#1f2937' }}>
                        {c.student?.firstName} {c.student?.lastName}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#4b5563' }}>
                        {c.fee?.description || 'Fee Record'}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', textDecoration: 'line-through' }}>
                        {rupee(origFee)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 800, color: '#15803d' }}>
                        − {rupee(c.concessionAmount)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 800, color: '#1e40af' }}>
                        {rupee(newFee)}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', maxWidth: '180px', fontSize: '0.83rem' }}>
                        {c.reason}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {fmt(c.createdAt)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700 }}>
                          ✅ Applied
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '14px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
        💡 All concessions are granted and applied by the Principal. Contact Principal to grant or revoke.
      </p>
    </div>
  );
};

export default ConcessionManagement;
