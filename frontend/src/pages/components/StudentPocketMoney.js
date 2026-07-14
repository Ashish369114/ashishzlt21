import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const fmt = formatCurrency;

const StudentPocketMoney = ({ user }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const studentUserId = user?.id || user?._id || user?.userId;

  useEffect(() => {
    fetchPocketMoney();
  }, [studentUserId]);

  const fetchPocketMoney = async () => {
    if (!studentUserId) return;
    setLoading(true);
    try {
      const res = await feeService.getByStudent(studentUserId);
      const all = res.data || [];
      setFees(all.filter(f => /pocket\s*money/i.test(f.description || '')));
    } catch (err) {
      setError('Failed to load pocket money data.');
    } finally {
      setLoading(false);
    }
  };

  const totalDeposited = fees.reduce((s, f) => s + Number(f.paidAmount || 0), 0);
  const totalPending = fees.reduce((s, f) => s + Math.max(0, Number(f.amount || 0) - Number(f.paidAmount || 0)), 0);
  const balance = totalDeposited;

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>💵 Pocket Money</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          Overview of pocket money deposited by your parent
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Big Balance Card */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
          borderRadius: '16px',
          padding: '28px 28px',
          color: '#fff',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '40px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ fontSize: '0.85rem', opacity: 0.85, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            💰 Available Balance
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fmt(balance)}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '10px' }}>
            Deposited by parent — read-only view
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Deposited', value: fmt(totalDeposited), icon: '📥', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Pending Payment', value: fmt(totalPending), icon: '⏳', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Transactions', value: fees.length, icon: '🧾', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, marginTop: '3px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Info notice */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 16px', fontSize: '0.83rem', color: '#0369a1', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
          <span>
            Your parent adds pocket money through their account. Contact your parent to request a top-up.
            This balance reflects what has been deposited — your school accountant manages disbursements.
          </span>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ padding: '0 20px 24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '14px' }}>📋 Deposit History</h3>
        {fees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💵</div>
            <p style={{ margin: 0 }}>No pocket money deposits yet.</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>Ask your parent to add pocket money from their account.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...fees].reverse().map((fee, idx) => (
                  <tr key={fee._id}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{fees.length - idx}</td>
                    <td>
                      {fee.paymentDate
                        ? new Date(fee.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : new Date(fee.createdAt || fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td><strong style={{ color: '#15803d', fontSize: '1rem' }}>{fmt(fee.paidAmount || fee.amount)}</strong></td>
                    <td>{fee.paymentMethod || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '180px' }}>{fee.remarks || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: fee.isPaid ? '#dcfce7' : '#fef9c3',
                        color: fee.isPaid ? '#166534' : '#854d0e',
                      }}>
                        {fee.isPaid ? '✅ Credited' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPocketMoney;
