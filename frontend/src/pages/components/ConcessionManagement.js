import React, { useState, useEffect } from 'react';
import { concessionService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';
import { demoStudents } from '../../utils/demoData';
import { resolveStudentName, subscribeToDataChanges } from '../../services/syncService';

const fmt   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const rupee = formatCurrency;

const ConcessionManagement = () => {
  const [concessions, setConcessions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const res = await concessionService.getAll().catch(() => ({ data: [] }));
      const apiData = Array.isArray(res.data) ? res.data : [];

      const storedConcessions = JSON.parse(localStorage.getItem('school_concessions') || '[]');

      const initialDemoConcessions = [
        {
          _id: 'conc_1',
          student: demoStudents[0] || { firstName: 'Rohan', lastName: 'Sharma', grade: '1', section: 'A' },
          fee: { description: 'Tuition & Academic Fee (Term 1 - Grade 1)', amount: 43500 },
          concessionAmount: 8000,
          reason: 'Academic Merit Scholarship (95%+ in Term Exams)',
          grantedBy: 'Dr. Kumar (Principal)',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Approved'
        },
        {
          _id: 'conc_2',
          student: demoStudents[1] || { firstName: 'Ananya', lastName: 'Mehta', grade: '1', section: 'A' },
          fee: { description: 'Annual Administrative & Campus Facility Fee', amount: 12000 },
          concessionAmount: 3500,
          reason: 'Sibling Discount Concession',
          grantedBy: 'Dr. Kumar (Principal)',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Approved'
        },
        {
          _id: 'conc_3',
          student: demoStudents[12] || { firstName: 'Kabir', lastName: 'Patel', grade: '2', section: 'A' },
          fee: { description: 'Tuition & Academic Fee (Term 1 - Grade 2)', amount: 45000 },
          concessionAmount: 15000,
          reason: 'EWS / Financial Hardship Waiver',
          grantedBy: 'Dr. Kumar (Principal)',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Approved'
        }
      ];

      const combinedMap = new Map();
      [...storedConcessions, ...apiData, ...initialDemoConcessions].forEach(c => {
        if (c && c._id) combinedMap.set(c._id, c);
      });

      setConcessions(Array.from(combinedMap.values()));
    } catch (err) {
      setError('Failed to load concession records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    const unsubscribe = subscribeToDataChanges((event) => {
      if (event?.actionType === 'CONCESSION_GRANTED' && event?.payload) {
        setConcessions(prev => [event.payload, ...prev.filter(c => c._id !== event.payload._id)]);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtered = concessions.filter(c => {
    const sName = `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.toLowerCase();
    const reason = (c.reason || '').toLowerCase();
    const sGrade = String(c.student?.grade || c.student?.class?.grade || '');
    const q = search.toLowerCase();

    const matchSearch = !search || sName.includes(q) || reason.includes(q);
    const matchGrade = !gradeFilter || sGrade === String(gradeFilter);
    return matchSearch && matchGrade;
  });

  const totalAmount = concessions.reduce((s, c) => s + Number(c.concessionAmount || 0), 0);
  const thisMonth   = concessions.filter(c => new Date(c.createdAt || Date.now()).getMonth() === new Date().getMonth()).length;
  const cardStyle   = { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>🎁 Concession Log</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
            Official log of fee concessions granted by the Principal. Adjusted automatically against student dues.
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
          Concessions are approved directly by the Principal. Each approved concession is <strong>auto-applied</strong> to the fee ledger.
        </p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Concessions Granted', val: concessions.length,  icon: '🎁', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Concession Amount',   val: rupee(totalAmount),   icon: '💰', color: '#15803d', bg: '#dcfce7' },
          { label: 'Granted This Month',        val: `${thisMonth} Active`, icon: '📅', color: '#7c3aed', bg: '#f5f3ff' },
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

      {/* Search & Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '10px', marginBottom: '14px' }}>
        <input
          type="text"
          placeholder="🔍 Search student name, scholarship reason..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
        />
        <select
          value={gradeFilter}
          onChange={e => setGradeFilter(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
        >
          <option value="">All Grades</option>
          {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(g => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>⏳ Loading concession records…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No concession records match your criteria</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Student Name', 'Grade & Sec', 'Fee Record', 'Original Fee', 'Concession', 'Net Fee', 'Reason', 'Granted On', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const sName = `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.trim() || resolveStudentName(c.student, demoStudents);
                  const sGrade = c.student?.grade || c.student?.class?.grade || '1';
                  const sSec = c.student?.section || c.student?.class?.section || 'A';
                  const origFee = Number(c.fee?.amount || 45000);
                  const concAmt = Number(c.concessionAmount || 0);
                  const netFee  = Math.max(0, origFee - concAmt);

                  return (
                    <tr key={c._id || i}
                      style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#1f2937' }}>
                        {sName}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#4b5563', fontWeight: 600 }}>
                        Grade {sGrade}-{sSec}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#4b5563' }}>
                        {c.fee?.description || 'Tuition & Academic Fee'}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', textDecoration: 'line-through' }}>
                        {rupee(origFee)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 800, color: '#15803d' }}>
                        − {rupee(concAmt)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 800, color: '#1e40af' }}>
                        {rupee(netFee)}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#4b5563', maxWidth: '200px', fontSize: '0.83rem' }}>
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
        💡 Concessions are approved by the Principal. For questions or adjustments, contact the Principal Office.
      </p>
    </div>
  );
};

export default ConcessionManagement;

