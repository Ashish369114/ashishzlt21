import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

// ─── Colour tokens ─────────────────────────────────────────────────────────
const C = {
  navy:    '#2d2d44',
  blue:    '#2b6cb0',
  blueLt:  '#ebf8ff',
  green:   '#276749',
  greenLt: '#f0fff4',
  amber:   '#975a16',
  amberLt: '#fffbeb',
  red:     '#9b2c2c',
  redLt:   '#fff5f5',
  slate:   '#4a5568',
  border:  '#e2e8f0',
  bg:      '#f7fafc',
};

const rupee   = n => `${formatCurrency(Number(n || 0))}`;
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// ─── Shared element styles ─────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '8px 11px', borderRadius: '6px',
  border: `1px solid ${C.border}`, fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box',
};
const cardBase = {
  background: '#fff', borderRadius: '6px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`,
};
const lbl = { display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: C.navy };
const secBtn = {
  padding: '8px 18px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem', color: C.slate,
};
const primaryBtn = (bg, dis) => ({
  padding: '8px 20px', background: dis ? '#cbd5e0' : bg, color: dis ? '#718096' : '#fff',
  border: 'none', borderRadius: '6px', cursor: dis ? 'not-allowed' : 'pointer',
  fontWeight: 700, fontSize: '0.84rem',
});

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ fee }) => {
  const bal = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
  if (fee.isPaid || bal === 0)
    return <span style={badge(C.greenLt, C.green)}>Paid</span>;
  if (Number(fee.paidAmount || 0) > 0)
    return <span style={badge(C.amberLt, C.amber)}>Partial</span>;
  return <span style={badge(C.redLt, C.red)}>Unpaid</span>;
};
const badge = (bg, color) => ({
  background: bg, color, padding: '3px 10px', borderRadius: '4px',
  fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap',
  border: `1px solid ${color}33`,
});

// ─── Pay Modal ─────────────────────────────────────────────────────────────
const METHODS = ['Cash', 'PhonePe / UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Net Banking', 'DD'];

const PayModal = ({ fee, onClose, onSuccess }) => {
  const [method,  setMethod]  = useState('');
  const [details, setDetails] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const name    = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const balance = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
  const set     = (k, v) => setDetails(p => ({ ...p, [k]: v }));

  const handlePay = async () => {
    if (!method) { setError('Please select a payment method.'); return; }
    setSaving(true); setError('');
    try {
      await feeService.pay({
        feeId: fee._id,
        paymentMethod: method,
        transactionId: `TXN-${method.replace(/\s+/g, '')}-${Date.now()}`,
        paymentDetails: details,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '100%',
        maxWidth: '480px', boxShadow: '0 10px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '14px', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: '1.1rem', fontWeight: 700 }}>
            Record Payment
          </h3>
          <p style={{ margin: '4px 0 0', color: C.slate, fontSize: '0.83rem' }}>
            <strong>{name}</strong> &mdash; Balance due:{' '}
            <strong style={{ color: C.red }}>{rupee(balance)}</strong>
          </p>
        </div>

        {error && (
          <div style={{ background: C.redLt, color: C.red, padding: '8px 12px', borderRadius: '6px',
            marginBottom: '14px', fontSize: '0.83rem', fontWeight: 600, border: `1px solid ${C.red}33` }}>
            {error}
          </div>
        )}

        {/* Payment method */}
        <label style={lbl}>Payment Method *</label>
        <select value={method} onChange={e => { setMethod(e.target.value); setDetails({}); }}
          style={{ ...inp, marginBottom: '14px' }}>
          <option value="">— Select payment method —</option>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Dynamic detail fields */}
        {(method === 'PhonePe / UPI') && (
          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>UPI / Transaction ID</label>
            <input style={inp} placeholder="e.g. 987654321@ybl or UTR number"
              value={details.upiId || ''} onChange={e => set('upiId', e.target.value)} />
          </div>
        )}

        {(method === 'Credit Card' || method === 'Debit Card') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Cardholder Name</label>
              <input style={inp} placeholder="John Doe" value={details.cardName || ''} onChange={e => set('cardName', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Last 4 Digits</label>
              <input style={inp} placeholder="1234" maxLength={4} value={details.cardLast4 || ''} onChange={e => set('cardLast4', e.target.value)} />
            </div>
          </div>
        )}

        {method === 'Cheque' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Cheque No.</label>
              <input style={inp} placeholder="CHQ001" value={details.chequeNo || ''} onChange={e => set('chequeNo', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Bank Name</label>
              <input style={inp} placeholder="SBI / HDFC…" value={details.bank || ''} onChange={e => set('bank', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Cheque Date</label>
              <input style={inp} type="date" value={details.chequeDate || ''} onChange={e => set('chequeDate', e.target.value)} />
            </div>
          </div>
        )}

        {method === 'Cash' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Receipt No.</label>
              <input style={inp} placeholder="RCPT-001" value={details.receiptNo || ''} onChange={e => set('receiptNo', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Collected At</label>
              <input style={inp} placeholder="Front Desk" value={details.counter || ''} onChange={e => set('counter', e.target.value)} />
            </div>
          </div>
        )}

        {(method === 'Net Banking' || method === 'DD') && (
          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Reference / Transaction No.</label>
            <input style={inp} placeholder="Bank reference number"
              value={details.refNo || ''} onChange={e => set('refNo', e.target.value)} />
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px',
          borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
          <button onClick={onClose} style={secBtn}>Cancel</button>
          <button onClick={handlePay} disabled={saving} style={primaryBtn(C.green, saving)}>
            {saving ? 'Processing…' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const AccountantPendingFees = () => {
  const [fees,         setFees]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payFee,       setPayFee]       = useState(null);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getPending();
      setFees(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load pending fees.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  const getStatus = fee => {
    const bal = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
    if (fee.isPaid || bal === 0) return 'paid';
    if (Number(fee.paidAmount || 0) > 0) return 'partial';
    return 'unpaid';
  };

  const filtered = fees.filter(fee => {
    const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase())) &&
      (filterStatus === 'all' || getStatus(fee) === filterStatus);
  });

  const totalPending = fees.reduce((s, f) => s + Math.max(Number(f.amount || 0) - Number(f.paidAmount || 0), 0), 0);
  const unpaidCnt    = fees.filter(f => getStatus(f) === 'unpaid').length;
  const partialCnt   = fees.filter(f => getStatus(f) === 'partial').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: C.navy }}>
            Pending Fee Records
          </h2>
          <p style={{ margin: '3px 0 0', color: C.slate, fontSize: '0.84rem' }}>
            Click <strong>Pay</strong> to record a student fee payment.
          </p>
        </div>
        <button onClick={fetchFees}
          style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: '6px',
            padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem' }}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: C.redLt, color: C.red, padding: '10px 14px', borderRadius: '6px',
          marginBottom: '14px', fontWeight: 600, fontSize: '0.85rem', border: `1px solid ${C.red}33` }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: C.greenLt, color: C.green, padding: '10px 14px', borderRadius: '6px',
          marginBottom: '14px', fontWeight: 600, fontSize: '0.85rem', border: `1px solid ${C.green}33` }}>
          {success}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
        {[
          { label: 'Total Records',  val: fees.length,         bg: C.blueLt,  color: C.blue  },
          { label: 'Unpaid',         val: unpaidCnt,           bg: C.redLt,   color: C.red   },
          { label: 'Partial',        val: partialCnt,          bg: C.amberLt, color: C.amber },
          { label: 'Pending Dues',   val: unpaidCnt + partialCnt, bg: C.purpleLt, color: C.purple },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: '14px 16px', background: s.bg,
            borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.73rem', color: C.slate, fontWeight: 600, marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by student name…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, flex: 1, minWidth: '200px' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={cardBase}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.slate }}>Loading fee records…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#a0aec0' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>No pending fees found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: C.navy, color: '#fff' }}>
                  {['Student', 'Description', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600,
                      fontSize: '0.78rem', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((fee, i) => {
                  const amount  = Number(fee.amount || 0);
                  const paid    = Number(fee.paidAmount || 0);
                  const balance = Math.max(amount - paid, 0);
                  const status  = getStatus(fee);

                  return (
                    <tr key={fee._id}
                      style={{ borderBottom: `1px solid ${C.border}`,
                        background: i % 2 === 0 ? '#fff' : C.bg, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ebf4ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : C.bg}
                    >
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: C.navy }}>
                        {fee.student?.firstName} {fee.student?.lastName}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.slate, fontSize: '0.83rem' }}>
                        {fee.description || 'Fee Record'}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: C.slate }}>
                        {rupee(amount)}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.green, fontWeight: 600 }}>
                        {rupee(paid)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: balance > 0 ? C.red : C.green }}>
                        {balance > 0 ? rupee(balance) : '—'}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.slate, whiteSpace: 'nowrap' }}>
                        {fmtDate(fee.dueDate)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <StatusBadge fee={fee} />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {status === 'paid' ? (
                          <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>—</span>
                        ) : (
                          <button onClick={() => setPayFee(fee)}
                            style={{ padding: '6px 16px', background: C.green, color: '#fff',
                              border: 'none', borderRadius: '5px', cursor: 'pointer',
                              fontWeight: 700, fontSize: '0.8rem' }}>
                            Pay
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

      <p style={{ marginTop: '12px', fontSize: '0.78rem', color: '#a0aec0', textAlign: 'center' }}>
        For notices, deadlines, or TC actions — contact the <strong>Principal</strong>.
      </p>

      {/* ── Pay Modal ── */}
      {payFee && (
        <PayModal
          fee={payFee}
          onClose={() => setPayFee(null)}
          onSuccess={async () => {
            setPayFee(null);
            setSuccess('Payment recorded successfully!');
            await fetchFees();
          }}
        />
      )}
    </div>
  );
};

export default AccountantPendingFees;
