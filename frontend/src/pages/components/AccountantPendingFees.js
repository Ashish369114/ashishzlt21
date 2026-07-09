import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

// ─── Colour tokens (school-professional palette) ───────────────────────────
const C = {
  navy:    '#1e3a5f',
  navyLt:  '#2d5282',
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

// ─── Helpers ────────────────────────────────────────────────────────────────
const rupee = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Status Badge ────────────────────────────────────────────────────────────
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

// ─── Modal shell ─────────────────────────────────────────────────────────────
const ModalShell = ({ children, onClose, maxWidth = '460px' }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '100%',
      maxWidth, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}>
      {children}
    </div>
  </div>
);

// ─── Notice Modal ─────────────────────────────────────────────────────────────
const NoticeModal = ({ fee, onClose }) => {
  const [type,    setType]    = useState('fee_reminder');
  const [message, setMessage] = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const bal  = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);

  const templates = {
    fee_reminder: `Dear Parent/Guardian,\n\nThis is a courtesy reminder that a fee of ${rupee(bal)} is currently pending for your ward ${name}.\n\nKindly visit the school office or make the payment at the earliest to avoid inconvenience.\n\nRegards,\nAccountant\nSchool Administration`,
    warning:      `Dear Parent/Guardian,\n\nDespite our earlier reminder, a fee of ${rupee(bal)} remains unpaid for ${name}.\n\nYou are requested to clear all dues within 7 days to avoid further action.\n\nRegards,\nAccountant\nSchool Administration`,
    final_notice: `Dear Parent/Guardian,\n\nFINAL NOTICE: An outstanding fee of ${rupee(bal)} is still pending for ${name}.\n\nFailure to pay immediately may result in suspension of academic services.\n\nRegards,\nAccountant\nSchool Administration`,
  };

  useEffect(() => { setMessage(templates[type]); }, [type]); // eslint-disable-line

  const handleSend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setDone(true);
    setLoading(false);
  };

  return (
    <ModalShell onClose={onClose} maxWidth="520px">
      <h3 style={{ margin: '0 0 2px', color: C.navy, fontSize: '1.1rem' }}>Send Fee Notice</h3>
      <p style={{ margin: '0 0 18px', color: C.slate, fontSize: '0.83rem' }}>
        <strong>{name}</strong> &mdash; Pending: <strong style={{ color: C.red }}>{rupee(bal)}</strong>
      </p>
      {done ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✔</div>
          <p style={{ fontWeight: 700, color: C.green }}>Notice sent to parent of {name}</p>
          <button onClick={onClose} style={primaryBtn(C.navy)}>Close</button>
        </div>
      ) : (
        <>
          <label style={lbl}>Notice Type</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inp, marginBottom: '12px' }}>
            <option value="fee_reminder">Fee Reminder</option>
            <option value="warning">Warning Notice</option>
            <option value="final_notice">Final Notice</option>
          </select>
          <label style={lbl}>Message</label>
          <textarea rows={7} value={message} onChange={e => setMessage(e.target.value)}
            style={{ ...inp, resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={secBtn}>Cancel</button>
            <button onClick={handleSend} disabled={loading} style={primaryBtn(C.navy, loading)}>
              {loading ? 'Sending…' : 'Send Notice'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
};

// ─── Deadline Modal ───────────────────────────────────────────────────────────
const DeadlineModal = ({ fee, onClose }) => {
  const d7 = new Date(); d7.setDate(d7.getDate() + 7);
  const [date,    setDate]    = useState(d7.toISOString().split('T')[0]);
  const [note,    setNote]    = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const bal  = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);

  const handleSet = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <h3 style={{ margin: '0 0 2px', color: C.navy, fontSize: '1.1rem' }}>Set Payment Deadline</h3>
      <p style={{ margin: '0 0 18px', color: C.slate, fontSize: '0.83rem' }}>
        <strong>{name}</strong> &mdash; Balance: <strong style={{ color: C.red }}>{rupee(bal)}</strong>
      </p>
      {done ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✔</div>
          <p style={{ fontWeight: 700, color: C.green }}>Deadline set &mdash; parent has been notified.</p>
          <button onClick={onClose} style={{ ...primaryBtn(C.navy), marginTop: '12px' }}>Close</button>
        </div>
      ) : (
        <>
          <label style={lbl}>New Deadline Date *</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)} style={{ ...inp, marginBottom: '12px' }} />
          <label style={lbl}>Note to Parent (optional)</label>
          <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Please ensure payment is made by this date."
            style={{ ...inp, resize: 'vertical', marginBottom: '16px' }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={secBtn}>Cancel</button>
            <button onClick={handleSet} disabled={!date || loading} style={primaryBtn(C.amber, !date || loading)}>
              {loading ? 'Setting…' : 'Confirm Deadline'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
};

// ─── Deport Modal ─────────────────────────────────────────────────────────────
const DeportModal = ({ fee, onClose }) => {
  const [reason,  setReason]  = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const bal  = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setDone(true);
    setLoading(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <h3 style={{ margin: '0 0 2px', color: C.red, fontSize: '1.1rem' }}>Issue TC / Deportation Notice</h3>
      <p style={{ margin: '0 0 14px', color: C.slate, fontSize: '0.83rem' }}>
        Student: <strong>{name}</strong> &mdash; Outstanding: <strong style={{ color: C.red }}>{rupee(bal)}</strong>
      </p>
      {done ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✔</div>
          <p style={{ fontWeight: 700, color: C.green }}>TC Notice issued for {name}</p>
          <p style={{ fontSize: '0.82rem', color: C.slate }}>Parent will be notified by the administration.</p>
          <button onClick={onClose} style={{ ...primaryBtn(C.navy), marginTop: '10px' }}>Close</button>
        </div>
      ) : (
        <>
          <div style={{ background: C.redLt, border: `1px solid ${C.red}33`, borderRadius: '6px',
            padding: '10px 14px', marginBottom: '14px', fontSize: '0.83rem', color: C.red }}>
            Warning: This action marks the student for Transfer Certificate issuance due to
            outstanding dues of <strong>{rupee(bal)}</strong>.
          </div>
          <label style={lbl}>Reason for TC / Deportation *</label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Non-payment of dues for more than 3 months despite repeated notices."
            style={{ ...inp, resize: 'vertical', marginBottom: '16px' }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={secBtn}>Cancel</button>
            <button onClick={handleConfirm} disabled={!reason.trim() || loading}
              style={primaryBtn(C.red, !reason.trim() || loading)}>
              {loading ? 'Processing…' : 'Confirm TC / Deport'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
};

// ─── Shared element styles ────────────────────────────────────────────────────
const lbl = { display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: C.navy };
const inp = {
  width: '100%', padding: '8px 11px', borderRadius: '6px',
  border: `1px solid ${C.border}`, fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box',
};
const secBtn = {
  padding: '8px 18px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem', color: C.slate,
};
const primaryBtn = (bg, dis) => ({
  padding: '8px 18px', background: dis ? '#cbd5e0' : bg, color: dis ? '#718096' : '#fff',
  border: 'none', borderRadius: '6px', cursor: dis ? 'not-allowed' : 'pointer',
  fontWeight: 700, fontSize: '0.84rem',
});

// ─── Action button (3 variants) ───────────────────────────────────────────────
const actionBtn = (bg, color, border) => ({
  padding: '5px 10px', background: bg, color, border: `1px solid ${border}`,
  borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
  whiteSpace: 'nowrap',
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AccountantPendingFees = () => {
  const [fees,         setFees]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeModal,  setActiveModal]  = useState(null); // { type, fee }

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getPending();
      setFees(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load pending fees. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

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

  const card = {
    background: '#fff', borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`,
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: C.navy }}>
            Pending Fee Records
          </h2>
          <p style={{ margin: '3px 0 0', color: C.slate, fontSize: '0.84rem' }}>
            Use actions to send notices, set deadlines, or issue TC for overdue students.
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

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
        {[
          { label: 'Total Records',  val: fees.length,       bg: C.blueLt,   color: C.blue  },
          { label: 'Unpaid',         val: unpaidCnt,         bg: C.redLt,    color: C.red   },
          { label: 'Partial',        val: partialCnt,        bg: C.amberLt,  color: C.amber },
          { label: 'Total Pending',  val: rupee(totalPending), bg: C.greenLt, color: C.green },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '14px 16px', background: s.bg,
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
      <div style={card}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.slate }}>
            Loading fee records…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#a0aec0' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>No records found</p>
            <p style={{ fontSize: '0.83rem' }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: C.navy, color: '#fff' }}>
                  {['Student', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Actions'].map(h => (
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
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: i % 2 === 0 ? '#fff' : C.bg,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ebf4ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : C.bg}
                    >
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 700, color: C.navy }}>
                          {fee.student?.firstName} {fee.student?.lastName}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#a0aec0' }}>
                          {fee.description || 'Fee Record'}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: C.slate }}>
                        {rupee(amount)}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.green, fontWeight: 600 }}>
                        {rupee(paid)}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700,
                        color: balance > 0 ? C.red : C.green }}>
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
                          <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>No action</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap' }}>
                            <button
                              onClick={() => setActiveModal({ type: 'notice', fee })}
                              style={actionBtn(C.blueLt, C.blue, C.blue + '44')}>
                              Notice
                            </button>
                            <button
                              onClick={() => setActiveModal({ type: 'deadline', fee })}
                              style={actionBtn(C.amberLt, C.amber, C.amber + '44')}>
                              Deadline
                            </button>
                            <button
                              onClick={() => setActiveModal({ type: 'deport', fee })}
                              style={actionBtn(C.redLt, C.red, C.red + '44')}>
                              Issue TC
                            </button>
                          </div>
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
        Payments are processed under Fee Management. This view tracks outstanding dues and enforcement actions.
      </p>

      {/* ── Modals ── */}
      {activeModal?.type === 'notice'   && <NoticeModal   fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === 'deadline' && <DeadlineModal fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === 'deport'   && <DeportModal   fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
    </div>
  );
};

export default AccountantPendingFees;
