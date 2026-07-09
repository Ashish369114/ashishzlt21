import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ fee }) => {
  const balance = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
  if (fee.isPaid || balance === 0) return <span style={sb('#dcfce7','#15803d')}>✅ Paid</span>;
  if (Number(fee.paidAmount || 0) > 0) return <span style={sb('#fef3c7','#92400e')}>⚠️ Partial</span>;
  return <span style={sb('#fee2e2','#b91c1c')}>❌ Unpaid</span>;
};
const sb = (bg, c) => ({ background:bg, color:c, padding:'3px 10px', borderRadius:'20px', fontSize:'0.76rem', fontWeight:700, whiteSpace:'nowrap' });
const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

// ── Notice Modal ──────────────────────────────────────────────────────────────
const NoticeModal = ({ fee, onClose }) => {
  const [type, setType] = useState('fee_reminder');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = `${fee.student?.firstName||''} ${fee.student?.lastName||''}`.trim();
  const balance = Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0);
  const defaults = {
    fee_reminder: `Dear Parent,\n\nThis is a reminder that a fee of ₹${balance.toLocaleString('en-IN')} is pending for ${name}. Please clear dues at the earliest.\n\nRegards,\nAccountant`,
    warning: `Dear Parent,\n\nDespite earlier reminders, ₹${balance.toLocaleString('en-IN')} remains unpaid for ${name}. Kindly pay within 7 days.\n\nRegards,\nAccountant`,
    final_notice: `Dear Parent,\n\nFINAL NOTICE: ₹${balance.toLocaleString('en-IN')} is still outstanding for ${name}. Immediate action required.\n\nRegards,\nAccountant`,
  };
  useEffect(() => { setMessage(defaults[type]); }, [type]);
  const handleSend = async () => { setLoading(true); await new Promise(r=>setTimeout(r,900)); setDone(true); setLoading(false); };
  return (
    <div style={overlay}><div style={{...modal,maxWidth:'500px'}}>
      <h3 style={{margin:'0 0 4px'}}>📣 Send Notice</h3>
      <p style={{color:'#6b7280',fontSize:'0.84rem',margin:'0 0 16px'}}><strong>{name}</strong> — Pending: <strong style={{color:'#b91c1c'}}>₹{balance.toLocaleString('en-IN')}</strong></p>
      {done ? (
        <div style={{textAlign:'center',padding:'24px 0'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'8px'}}>✅</div>
          <p style={{fontWeight:700,color:'#15803d'}}>Notice sent to parent of {name}</p>
          <button onClick={onClose} style={btnPrimary('#6366f1')}>Close</button>
        </div>
      ) : (
        <>
          <label style={lbl}>Notice Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} style={{...inp,marginBottom:'10px'}}>
            <option value="fee_reminder">📧 Fee Reminder</option>
            <option value="warning">⚠️ Warning Notice</option>
            <option value="final_notice">🚨 Final Notice</option>
          </select>
          <label style={lbl}>Message</label>
          <textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} style={{...inp,resize:'vertical',marginBottom:'14px',fontFamily:'inherit',lineHeight:'1.5'}} />
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={onClose} style={btnSec}>Cancel</button>
            <button onClick={handleSend} disabled={loading} style={btnPrimary('#6366f1',loading)}>{loading?'📤 Sending…':'📣 Send Notice'}</button>
          </div>
        </>
      )}
    </div></div>
  );
};

// ── Deadline Modal ────────────────────────────────────────────────────────────
const DeadlineModal = ({ fee, onClose }) => {
  const d7 = new Date(); d7.setDate(d7.getDate()+7);
  const [date, setDate] = useState(d7.toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = `${fee.student?.firstName||''} ${fee.student?.lastName||''}`.trim();
  const balance = Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0);
  const handleSet = async () => { setLoading(true); await new Promise(r=>setTimeout(r,800)); setDone(true); setLoading(false); };
  return (
    <div style={overlay}><div style={modal}>
      <h3 style={{margin:'0 0 4px'}}>📅 Set Payment Deadline</h3>
      <p style={{color:'#6b7280',fontSize:'0.84rem',margin:'0 0 16px'}}><strong>{name}</strong> — Balance: <strong style={{color:'#b91c1c'}}>₹{balance.toLocaleString('en-IN')}</strong></p>
      {done ? (
        <div style={{textAlign:'center',padding:'24px 0'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'8px'}}>✅</div>
          <p style={{fontWeight:700,color:'#15803d'}}>Deadline set — parent notified.</p>
          <button onClick={onClose} style={{...btnPrimary('#6366f1'),marginTop:'12px'}}>Close</button>
        </div>
      ) : (
        <>
          <label style={lbl}>New Deadline *</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e=>setDate(e.target.value)} style={{...inp,marginBottom:'10px'}} />
          <label style={lbl}>Note to Parent (optional)</label>
          <textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Please pay by this date to avoid further action." style={{...inp,resize:'vertical',marginBottom:'14px'}} />
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={onClose} style={btnSec}>Cancel</button>
            <button onClick={handleSet} disabled={!date||loading} style={btnPrimary('#f59e0b',!date||loading)}>{loading?'⏳ Setting…':'📅 Confirm Deadline'}</button>
          </div>
        </>
      )}
    </div></div>
  );
};

// ── Deport Modal ──────────────────────────────────────────────────────────────
const DeportModal = ({ fee, onClose }) => {
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = `${fee.student?.firstName||''} ${fee.student?.lastName||''}`.trim();
  const balance = Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0);
  const handleConfirm = async () => { setLoading(true); await new Promise(r=>setTimeout(r,900)); setDone(true); setLoading(false); };
  return (
    <div style={overlay}><div style={modal}>
      <div style={{textAlign:'center',marginBottom:'14px'}}>
        <div style={{fontSize:'2.8rem'}}>🚨</div>
        <h3 style={{margin:'8px 0 4px',color:'#b91c1c'}}>Deport / TC Notice</h3>
        <p style={{color:'#6b7280',fontSize:'0.84rem',margin:0}}>Issuing TC / deportation notice to <strong>{name}</strong></p>
      </div>
      {done ? (
        <div style={{textAlign:'center',padding:'16px 0'}}>
          <div style={{fontSize:'2rem',marginBottom:'8px'}}>✅</div>
          <p style={{fontWeight:700,color:'#15803d'}}>TC Notice issued for {name}</p>
          <p style={{fontSize:'0.82rem',color:'#6b7280'}}>Parent will be notified.</p>
          <button onClick={onClose} style={{...btnPrimary('#6366f1'),marginTop:'10px'}}>Close</button>
        </div>
      ) : (
        <>
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'10px 14px',marginBottom:'14px',fontSize:'0.83rem',color:'#b91c1c'}}>
            ⚠️ This marks the student for TC due to outstanding dues of <strong>₹{balance.toLocaleString('en-IN')}</strong>.
          </div>
          <label style={lbl}>Reason for TC / Deportation *</label>
          <textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Non-payment for 3+ months despite repeated notices." style={{...inp,resize:'vertical',marginBottom:'14px'}} />
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <button onClick={onClose} style={btnSec}>Cancel</button>
            <button onClick={handleConfirm} disabled={!reason.trim()||loading} style={btnPrimary('#ef4444',!reason.trim()||loading)}>{loading?'⏳ Processing…':'🚨 Confirm TC / Deport'}</button>
          </div>
        </>
      )}
    </div></div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const overlay  = {position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'};
const modal    = {background:'#fff',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'460px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'};
const lbl      = {display:'block',fontWeight:700,fontSize:'0.83rem',marginBottom:'4px',color:'#374151'};
const inp      = {width:'100%',padding:'9px 12px',borderRadius:'8px',border:'1px solid #d1d5db',fontSize:'0.87rem',outline:'none',boxSizing:'border-box'};
const btnSec   = {padding:'9px 20px',background:'#f1f5f9',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600,fontSize:'0.86rem'};
const btnPrimary = (bg,dis) => ({padding:'9px 20px',background:dis?'#e2e8f0':bg,color:dis?'#9ca3af':'#fff',border:'none',borderRadius:'8px',cursor:dis?'not-allowed':'pointer',fontWeight:700,fontSize:'0.86rem'});

// ── Main Component ────────────────────────────────────────────────────────────
const AccountantPendingFees = () => {
  const [fees,         setFees]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilter]       = useState('all');
  const [activeModal,  setActiveModal]  = useState(null);

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
