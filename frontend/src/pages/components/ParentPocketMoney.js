import React, { useState, useEffect } from 'react';
import { feeService, studentService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const paymentMethods = ['UPI', 'PhonePe', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Cheque'];

const fmt = formatCurrency;

const ParentPocketMoney = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add money modal
  const [showModal, setShowModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMethod, setTopupMethod] = useState('UPI');
  const [topupNote, setTopupNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [feesRes, studRes] = await Promise.all([
        feeService.getByParent(),
        studentService.getByParent(),
      ]);
      const allFees = feesRes.data || [];
      setFees(allFees.filter(f => /pocket\s*money/i.test(f.description || '')));
      setStudents(studRes.data || []);
    } catch (err) {
      setError('Failed to load pocket money data.');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalDeposited = fees.reduce((s, f) => s + Number(f.paidAmount || 0), 0);
  const totalAllocated = fees.reduce((s, f) => s + Number(f.amount || 0), 0);
  const balance = totalDeposited; // paidAmount = money sent to school/child

  const handleTopup = async (e) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) { setSaveError('Please enter a valid amount.'); return; }
    if (!students.length) { setSaveError('No linked student found.'); return; }

    setSaving(true);
    setSaveError('');
    try {
      const student = students[0];
      const studentUserId = student.userId?._id || student.userId;

      // Create a new Pocket Money fee record and immediately pay it
      const feeRes = await feeService.add({
        student: studentUserId,
        amount,
        description: 'Pocket Money',
        dueDate: new Date().toISOString(),
        installments: 1,
        remarks: topupNote || 'Parent top-up',
      });

      const feeId = feeRes.data?._id;
      if (feeId) {
        await feeService.pay({
          feeId,
          amount,
          paymentMethod: topupMethod,
          transactionId: `PM-${Date.now()}`,
          paymentDetails: { remark: topupNote || 'Pocket money top-up by parent' },
        });
      }

      alert(`✅ ${formatCurrency(amount)} pocket money added successfully!`);
      setShowModal(false);
      setTopupAmount('');
      setTopupNote('');
      setTopupMethod('UPI');
      fetchAll();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to add pocket money.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  const studentName = students[0]
    ? `${students[0].userId?.firstName || ''} ${students[0].userId?.lastName || ''}`.trim()
    : 'your child';

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>💵 Pocket Money</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setShowModal(true); setSaveError(''); }}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '10px 22px', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          ➕ Add Money
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '20px 20px 0' }}>
        {[
          { label: 'Current Balance', value: fmt(balance), color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '💰' },
          { label: 'Total Deposited', value: fmt(totalDeposited), color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: '📥' },
          { label: 'Transactions', value: fees.length, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🧾' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{card.icon}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, marginTop: '4px' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Student info banner */}
      {students.length > 0 && (
        <div style={{ margin: '16px 20px 0', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', fontSize: '0.875rem', color: '#475569' }}>
          <span style={{ fontWeight: 600 }}>👨‍🎓 Linked Student:</span> {studentName} &nbsp;|&nbsp;
          <span style={{ fontWeight: 600 }}>Grade:</span> {students[0].class ? `${students[0].class.grade} - ${students[0].class.section}` : 'N/A'}
        </div>
      )}

      {/* Transaction history */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '14px' }}>📋 Transaction History</h3>
        {fees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💵</div>
            <p style={{ margin: 0 }}>No pocket money added yet. Click <strong>+ Add Money</strong> to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount Added</th>
                  <th>Payment Method</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...fees].reverse().map(fee => (
                  <tr key={fee._id}>
                    <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(fee.createdAt || fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><strong style={{ color: '#15803d' }}>{fmt(fee.paidAmount || fee.amount)}</strong></td>
                    <td>{fee.paymentMethod || '—'}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{fee.remarks || '—'}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: fee.isPaid ? '#dcfce7' : '#fef9c3', color: fee.isPaid ? '#166534' : '#854d0e' }}>
                        {fee.isPaid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '30px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>💵 Add Pocket Money</h3>
            <p style={{ margin: '0 0 22px', fontSize: '0.85rem', color: '#64748b' }}>
              Adding for <strong>{studentName}</strong>. Amount is immediately credited.
            </p>

            {saveError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600, fontSize: '0.83rem' }}>
                {saveError}
              </div>
            )}

            <form onSubmit={handleTopup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '5px', color: '#374151' }}>Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder="e.g. 500"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '5px', color: '#374151' }}>Payment Method *</label>
                <select
                  value={topupMethod}
                  onChange={e => setTopupMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '5px', color: '#374151' }}>Note (optional)</label>
                <input
                  type="text"
                  value={topupNote}
                  onChange={e => setTopupNote(e.target.value)}
                  placeholder="e.g. Weekly allowance"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 2, padding: '11px', background: saving ? '#93c5fd' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}
                >
                  {saving ? '⏳ Processing...' : '✅ Add Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPocketMoney;
