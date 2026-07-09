import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ fee }) => {
  const amount  = Number(fee.amount || 0);
  const paid    = Number(fee.paidAmount || 0);
  const balance = Math.max(amount - paid, 0);
  if (fee.isPaid || balance === 0)
    return <span style={badge('#dcfce7','#15803d')}>✅ Paid</span>;
  if (paid > 0)
    return <span style={badge('#fef3c7','#92400e')}>⚠️ Partial</span>;
  return <span style={badge('#fee2e2','#b91c1c')}>❌ Unpaid</span>;
};
const badge = (bg, color) => ({
  background: bg, color, padding: '3px 10px',
  borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
});

const PAYMENT_METHODS = ['PhonePe','Credit Card','Debit Card','Cash','Cheque','Net Banking','UPI'];

// ── Pay Modal ─────────────────────────────────────────────────────────────────
const PayModal = ({ fee, onClose, onSuccess }) => {
  const [method,     setMethod]     = useState('');
  const [details,    setDetails]    = useState({});
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const balance = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);

  const set = (k, v) => setDetails(p => ({ ...p, [k]: v }));

  const handlePay = async () => {
    if (!method) { setError('Please select a payment method.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        feeId: fee._id,
        paymentMethod: method,
        transactionId: `TXN-${method.replace(/\s+/g,'')}-${Date.now()}`,
        paymentDetails: details,
      };
      await feeService.pay(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'460px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin:'0 0 4px', fontSize:'1.15rem' }}>💳 Process Payment</h3>
        <p style={{ margin:'0 0 20px', color:'#6b7280', fontSize:'0.85rem' }}>
          <strong>{fee.student?.firstName} {fee.student?.lastName}</strong> — Balance: <strong style={{ color:'#b91c1c' }}>₹{balance.toLocaleString('en-IN')}</strong>
        </p>

        {/* Method */}
        <label style={{ display:'block', fontWeight:700, marginBottom:'6px', fontSize:'0.86rem' }}>Payment Method *</label>
        <select
          value={method}
          onChange={e => { setMethod(e.target.value); setDetails({}); }}
          style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'0.88rem', marginBottom:'14px', outline:'none' }}
        >
          <option value="">Select payment method</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Dynamic fields per method */}
        {method === 'PhonePe' || method === 'UPI' ? (
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>UPI / Transaction ID</label>
            <input style={inp} placeholder="e.g. 9876543210@ybl" value={details.phonePeId||''} onChange={e=>set('phonePeId',e.target.value)} />
          </div>
        ) : method === 'Credit Card' || method === 'Debit Card' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div><label style={lbl}>Cardholder Name</label><input style={inp} placeholder="John Doe" value={details.cardHolderName||''} onChange={e=>set('cardHolderName',e.target.value)} /></div>
            <div><label style={lbl}>Last 4 Digits</label><input style={inp} placeholder="1234" maxLength={4} value={details.cardLast4||''} onChange={e=>set('cardLast4',e.target.value)} /></div>
          </div>
        ) : method === 'Cheque' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div><label style={lbl}>Cheque No.</label><input style={inp} placeholder="CHK001" value={details.chequeNumber||''} onChange={e=>set('chequeNumber',e.target.value)} /></div>
            <div><label style={lbl}>Bank</label><input style={inp} placeholder="SBI / HDFC…" value={details.chequeBank||''} onChange={e=>set('chequeBank',e.target.value)} /></div>
            <div><label style={lbl}>Cheque Date</label><input style={inp} type="date" value={details.chequeDate||''} onChange={e=>set('chequeDate',e.target.value)} /></div>
          </div>
        ) : method === 'Cash' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div><label style={lbl}>Receipt ID</label><input style={inp} placeholder="RCPT-001" value={details.cashReceiptId||''} onChange={e=>set('cashReceiptId',e.target.value)} /></div>
            <div><label style={lbl}>Counter</label><input style={inp} placeholder="Front Desk" value={details.cashCounter||''} onChange={e=>set('cashCounter',e.target.value)} /></div>
          </div>
        ) : null}

        {method === 'Net Banking' && (
          <div style={{ marginBottom:'12px' }}>
            <label style={lbl}>Reference / Transaction No.</label>
            <input style={inp} placeholder="Bank reference number" value={details.phonePeId||''} onChange={e=>set('phonePeId',e.target.value)} />
          </div>
        )}

        {error && <div style={{ color:'#b91c1c', fontWeight:600, fontSize:'0.82rem', marginBottom:'10px' }}>{error}</div>}

        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'18px' }}>
          <button onClick={onClose} style={{ padding:'9px 20px', background:'#f1f5f9', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>Cancel</button>
          <button
            onClick={handlePay}
            disabled={loading}
            style={{ padding:'9px 22px', background: loading ? '#86efac' : 'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', border:'none', borderRadius:'8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight:700 }}
          >
            {loading ? '⏳ Processing…' : '✅ Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

const lbl = { display:'block', fontWeight:600, fontSize:'0.82rem', marginBottom:'4px', color:'#374151' };
const inp = { width:'100%', padding:'8px 10px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.86rem', outline:'none', boxSizing:'border-box' };

// ── Main Component ────────────────────────────────────────────────────────────
const AccountantPendingFees = () => {
  const [fees,       setFees]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [payFee,     setPayFee]     = useState(null);  // fee to pay in modal
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilter]   = useState('all');

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getPending();
      setFees(Array.isArray(res.data) ? res.data : []);
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
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const getStatus = (fee) => {
    const balance = Math.max(Number(fee.amount||0) - Number(fee.paidAmount||0), 0);
    if (fee.isPaid || balance === 0) return 'paid';
    if (Number(fee.paidAmount||0) > 0) return 'partial';
    return 'unpaid';
  };

  const filtered = fees.filter(fee => {
    const name = `${fee.student?.firstName||''} ${fee.student?.lastName||''}`.toLowerCase();
    const matchS = !search || name.includes(search.toLowerCase());
    const matchF = filterStatus === 'all' || getStatus(fee) === filterStatus;
    return matchS && matchF;
  });

  // Stats
  const totalPending = fees.reduce((s,f) => s + Math.max(Number(f.amount||0)-Number(f.paidAmount||0),0), 0);
  const unpaid  = fees.filter(f => getStatus(f) === 'unpaid').length;
  const partial = fees.filter(f => getStatus(f) === 'partial').length;

  const cardStyle = { background:'#fff', borderRadius:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.4rem', fontWeight:700 }}>⏳ Pending Fees</h2>
          <p style={{ margin:'4px 0 0', color:'#6b7280', fontSize:'0.87rem' }}>Click <strong>Pay</strong> on any row to process a payment.</p>
        </div>
        <button onClick={fetchFees} style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontWeight:600, fontSize:'0.86rem' }}>
          🔄 Refresh
        </button>
      </div>

      {error   && <div style={{ background:'#fee2e2', color:'#b91c1c', padding:'10px 16px', borderRadius:'8px', marginBottom:'14px', fontWeight:600 }}>{error}</div>}
      {success && <div style={{ background:'#dcfce7', color:'#15803d', padding:'10px 16px', borderRadius:'8px', marginBottom:'14px', fontWeight:600 }}>{success}</div>}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Records',  val: fees.length,                                      icon:'📋', color:'#6366f1', bg:'#eef2ff' },
          { label:'Unpaid',         val: unpaid,                                            icon:'❌', color:'#ef4444', bg:'#fef2f2' },
          { label:'Partial',        val: partial,                                           icon:'⚠️', color:'#f59e0b', bg:'#fffbeb' },
          { label:'Total Pending',  val:`₹${totalPending.toLocaleString('en-IN')}`,        icon:'💰', color:'#0891b2', bg:'#ecfeff' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding:'16px 18px', display:'flex', alignItems:'center', gap:'12px', background:s.bg }}>
            <span style={{ fontSize:'1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:'1.35rem', fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:'0.75rem', color:'#6b7280', fontWeight:600, marginTop:'2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'14px', flexWrap:'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search student…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex:1, minWidth:'200px', padding:'8px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'0.88rem', outline:'none' }}
        />
        <select value={filterStatus} onChange={e => setFilter(e.target.value)}
          style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'0.88rem', background:'#fff', cursor:'pointer' }}>
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding:'60px', textAlign:'center', color:'#6b7280' }}>
            <div style={{ fontSize:'2rem', marginBottom:'10px' }}>⏳</div>Loading fees…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:'#9ca3af' }}>
            <div style={{ fontSize:'3rem', marginBottom:'10px' }}>📭</div>
            <p style={{ fontWeight:600 }}>No records found</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.87rem' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e5e7eb' }}>
                  {['Student','Total Fee','Paid','Balance','Due Date','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontWeight:700, color:'#374151', whiteSpace:'nowrap' }}>{h}</th>
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
                      style={{ borderBottom:'1px solid #f1f5f9', background: i%2===0 ? '#fff' : '#fafafa', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? '#fff' : '#fafafa'}
                    >
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ fontWeight:700, color:'#1f2937' }}>{fee.student?.firstName} {fee.student?.lastName}</div>
                        <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>{fee.description || 'Fee Record'}</div>
                      </td>
                      <td style={{ padding:'11px 14px', fontWeight:600 }}>₹{amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding:'11px 14px', color:'#15803d', fontWeight:600 }}>₹{paid.toLocaleString('en-IN')}</td>
                      <td style={{ padding:'11px 14px', fontWeight:700, color: balance > 0 ? '#b91c1c' : '#15803d' }}>
                        {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding:'11px 14px', color:'#6b7280', whiteSpace:'nowrap' }}>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td style={{ padding:'11px 14px' }}><StatusBadge fee={fee} /></td>
                      <td style={{ padding:'11px 14px' }}>
                        {status === 'paid' ? (
                          <span style={{ color:'#9ca3af', fontSize:'0.8rem' }}>—</span>
                        ) : (
                          <button
                            onClick={() => setPayFee(fee)}
                            style={{ padding:'6px 16px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:'7px', cursor:'pointer', fontWeight:700, fontSize:'0.82rem' }}
                          >
                            💳 Pay
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

      {/* Pay Modal */}
      {payFee && (
        <PayModal
          fee={payFee}
          onClose={() => setPayFee(null)}
          onSuccess={async () => {
            setPayFee(null);
            setSuccess('✅ Payment processed successfully!');
            await fetchFees();
          }}
        />
      )}
    </div>
  );
};

export default AccountantPendingFees;
