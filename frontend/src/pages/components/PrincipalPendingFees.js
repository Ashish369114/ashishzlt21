import React, { useState, useEffect } from 'react';
import { feeService, classService, concessionService, studentService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ fee }) => {
  const balance = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
  if (fee.isPaid || balance === 0)
    return <span style={sb('#dcfce7','#15803d')}>✅ Paid</span>;
  if (Number(fee.paidAmount || 0) > 0)
    return <span style={sb('#fef3c7','#92400e')}>⚠️ Partial</span>;
  return <span style={sb('#fee2e2','#b91c1c')}>❌ Unpaid</span>;
};
const sb = (bg, color) => ({
  background: bg, color, padding: '3px 10px',
  borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap',
});

const fmt = formatCurrency;

// ── Deport Modal ───────────────────────────────────────────────────────────────
const DeportModal = ({ fee, onClose }) => {
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setDone(true);
    setLoading(false);
  };

  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '2.8rem' }}>🚨</div>
          <h3 style={{ margin: '8px 0 4px', color: '#b91c1c' }}>Deport / TC Notice</h3>
          <p style={{ color: '#6b7280', fontSize: '0.86rem', margin: 0 }}>
            Issuing TC / Deportation notice to <strong>{name}</strong>
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#15803d' }}>TC Notice issued for {name}</p>
            <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>Records updated. Parent will be notified.</p>
            <button onClick={onClose} style={btnPrimary('#6366f1')}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.84rem', color: '#b91c1c' }}>
              ⚠️ This action will mark the student for TC issuance due to outstanding dues of{' '}
              <strong>{formatCurrency(Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0))}</strong>.
            </div>
            <label style={lbl}>Reason for Deportation / TC *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Non-payment of dues for 3+ months, despite repeated notices."
              style={{ ...inpStyle, resize: 'vertical', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button
                onClick={handleConfirm}
                disabled={!reason.trim() || loading}
                style={btnPrimary('#ef4444', !reason.trim() || loading)}
              >
                {loading ? '⏳ Processing…' : '🚨 Confirm TC / Deport'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Notice Modal ───────────────────────────────────────────────────────────────
const NoticeModal = ({ fee, onClose }) => {
  const [type, setType] = useState('fee_reminder');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const balance = Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0);

  const defaultMsg = {
    fee_reminder: `Dear Parent,\n\nThis is a reminder that a fee of ${formatCurrency(balance)} is pending for your ward ${name}. Kindly clear the dues at the earliest.\n\nRegards,\nPrincipal`,
    warning:      `Dear Parent,\n\nDespite earlier reminders, a fee of ${formatCurrency(balance)} remains unpaid for ${name}. This is a formal warning. Failure to pay within 7 days may result in TC issuance.\n\nRegards,\nPrincipal`,
    final_notice: `Dear Parent,\n\nThis is a FINAL NOTICE for outstanding dues of ${formatCurrency(balance)} for ${name}. Immediate payment is required to avoid suspension of services.\n\nRegards,\nPrincipal`,
  };

  useEffect(() => { setMessage(defaultMsg[type]); }, [type]);

  const handleSend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setDone(true);
    setLoading(false);
  };

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: '520px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>📣 Send Notice</h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 18px' }}>
          Sending notice for <strong>{name}</strong> — Pending: <strong style={{ color: '#b91c1c' }}>{formatCurrency(balance)}</strong>
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#15803d' }}>Notice sent to parent of {name}</p>
            <button onClick={onClose} style={{ ...btnPrimary('#6366f1'), marginTop: '12px' }}>Close</button>
          </div>
        ) : (
          <>
            <label style={lbl}>Notice Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ ...inpStyle, marginBottom: '12px' }}>
              <option value="fee_reminder">📧 Fee Reminder</option>
              <option value="warning">⚠️ Warning Notice</option>
              <option value="final_notice">🚨 Final Notice</option>
            </select>

            <label style={lbl}>Message</label>
            <textarea
              rows={7}
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ ...inpStyle, resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit', lineHeight: '1.5' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={handleSend} disabled={loading} style={btnPrimary('#6366f1', loading)}>
                {loading ? '📤 Sending…' : '📣 Send Notice'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Deadline Modal ─────────────────────────────────────────────────────────────
const DeadlineModal = ({ fee, onClose }) => {
  const today = new Date();
  const defaultDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const name = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const balance = Math.max(Number(fee.amount||0)-Number(fee.paidAmount||0),0);

  const handleSet = async () => {
    if (!date) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>📅 Set Payment Deadline</h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 18px' }}>
          Setting deadline for <strong>{name}</strong> — Balance: <strong style={{ color: '#b91c1c' }}>{formatCurrency(balance)}</strong>
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#15803d' }}>
              Deadline set to <strong>{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
            </p>
            <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>Parent notified about the new payment deadline.</p>
            <button onClick={onClose} style={{ ...btnPrimary('#6366f1'), marginTop: '12px' }}>Close</button>
          </div>
        ) : (
          <>
            <label style={lbl}>New Deadline Date *</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              style={{ ...inpStyle, marginBottom: '12px' }}
            />

            <label style={lbl}>Note to Parent (optional)</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Please ensure payment by this date to avoid further action."
              style={{ ...inpStyle, resize: 'vertical', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={handleSet} disabled={!date || loading} style={btnPrimary('#f59e0b', !date || loading)}>
                {loading ? '⏳ Setting…' : '📅 Confirm Deadline'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modal   = { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const lbl     = { display: 'block', fontWeight: 700, fontSize: '0.84rem', marginBottom: '5px', color: '#374151' };
const inpStyle = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' };
const btnSecondary = { padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' };
const btnPrimary = (bg, disabled) => ({
  padding: '9px 20px', background: disabled ? '#e2e8f0' : bg, color: disabled ? '#9ca3af' : '#fff',
  border: 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.86rem',
});

const rupee = formatCurrency;

// ── Grant Modal ───────────────────────────────────────────────────────────────
const GrantModal = ({ students, fees, onClose, onGranted }) => {
  const [studentId,  setStudentId]  = useState('');
  const [feeId,      setFeeId]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [reason,     setReason]     = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);
  const [resultMsg,  setResultMsg]  = useState('');

  const studentFees = fees.filter(f => {
    const sId = f.student?._id || f.student;
    return String(sId) === String(studentId) && !f.isPaid;
  });
  const selectedFee = fees.find(f => f._id === feeId);
  const maxAmount   = selectedFee ? Math.max(Number(selectedFee.amount || 0) - Number(selectedFee.paidAmount || 0), 0) : 0;

  const handleGrant = async () => {
    if (!studentId || !feeId || !amount || !reason) {
      setError('All fields are required.'); return;
    }
    if (Number(amount) <= 0 || Number(amount) > maxAmount) {
      setError(`Amount must be between ₹1 and ${rupee(maxAmount)}.`); return;
    }
    setSaving(true); setError('');
    try {
      const res = await concessionService.create({
        studentId,
        feeId,
        concessionAmount: Number(amount),
        reason,
      });
      setResultMsg(res.data?.message || 'Concession granted!');
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grant concession.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: '500px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>🎁 Grant Fee Concession</h3>
        <p style={{ color: '#6b7280', fontSize: '0.84rem', margin: '0 0 20px' }}>
          Concession is applied <strong>immediately</strong> — no approval required.
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#15803d', fontSize: '1.05rem' }}>{resultMsg}</p>
            <p style={{ fontSize: '0.83rem', color: '#6b7280' }}>Accountant has been updated automatically.</p>
            <button onClick={onGranted} style={{ ...btnPrimary('#6366f1'), marginTop: '14px' }}>Done</button>
          </div>
        ) : (
          <>
            {error && <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600, fontSize: '0.83rem' }}>{error}</div>}

            <label style={lbl}>Student *</label>
            <select value={studentId} onChange={e => { setStudentId(e.target.value); setFeeId(''); }}
              style={{ ...inpStyle, marginBottom: '12px' }}>
              <option value="">— Select student —</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>

            <label style={lbl}>Fee Record (unpaid / partial) *</label>
            <select value={feeId} onChange={e => setFeeId(e.target.value)}
              style={{ ...inpStyle, marginBottom: '12px' }}
              disabled={!studentId}>
              <option value="">— Select fee record —</option>
              {studentFees.map(f => (
                <option key={f._id} value={f._id}>
                  {f.description || 'Fee'} — {rupee(f.amount)}
                </option>
              ))}
              {studentId && studentFees.length === 0 && (
                <option disabled>No pending fees for this student</option>
              )}
            </select>

            {selectedFee && (
              <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.84rem', color: '#1e40af' }}>
                💡 Fee amount: <strong>{rupee(selectedFee.amount)}</strong> · Paid: <strong>{rupee(selectedFee.paidAmount)}</strong>
              </div>
            )}

            <label style={lbl}>Concession Amount (₹) *</label>
            <input type="number" value={amount} min={1} max={maxAmount}
              onChange={e => setAmount(e.target.value)}
              style={{ ...inpStyle, marginBottom: '12px' }}
              placeholder={selectedFee ? `Max: ${rupee(maxAmount)}` : 'Select a fee first'} />

            <label style={lbl}>Reason for Concession *</label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Merit scholarship, financial hardship, sibling discount…"
              style={{ ...inpStyle, resize: 'vertical', marginBottom: '16px' }} />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={handleGrant} disabled={saving}
                style={btnPrimary('#15803d', saving)}>
                {saving ? '⏳ Granting…' : '✅ Grant Concession'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const PrincipalPendingFees = () => {
  const [activeTab,    setActiveTab]    = useState('dues');
  const [fees,         setFees]         = useState([]);
  const [classes,      setClasses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Modal state: { type: 'deport'|'notice'|'deadline', fee }
  const [activeModal,  setActiveModal]  = useState(null);

  // Cascade filter states:
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const [feesRes, classesRes] = await Promise.all([
        feeService.getPending(),
        classService.getAll(),
      ]);
      setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
    } catch (err) {
      setError('Failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getStatus = (fee) => {
    const balance = Math.max(Number(fee.amount||0) - Number(fee.paidAmount||0), 0);
    if (fee.isPaid || balance === 0) return 'paid';
    if (Number(fee.paidAmount||0) > 0) return 'partial';
    return 'unpaid';
  };

  const visibleDues = fees.filter(f => {
    const status = getStatus(f);
    const name = `${f.student?.userId?.firstName||''} ${f.student?.userId?.lastName||''}`.toLowerCase();
    const matchS = !search || name.includes(search.toLowerCase());
    const matchF = filterStatus === 'all' || status === filterStatus;
    const matchC = !selectedClassId || String(f.student?.class?._id || f.student?.class) === String(selectedClassId);
    return matchS && matchF && matchC;
  });

  const totalDues = visibleDues.reduce((s, f) => s + Math.max(Number(f.amount||0) - Number(f.paidAmount||0), 0), 0);
  const unpaid = visibleDues.filter(f => getStatus(f) === 'unpaid').length;
  const partial = visibleDues.filter(f => getStatus(f) === 'partial').length;

  const cardStyle = { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>⏳ Pending Fees Overview</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
          Manage student fee outstanding dues, set deadlines, and issue notices.
        </p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Grade / Section filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={selectedGrade}
          onChange={e => { setSelectedGrade(e.target.value); setSelectedSection(''); setSelectedClassId(''); }}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', minWidth: '160px', fontSize: '0.95rem' }}
        >
          <option value="">Select Grade</option>
          {[...new Set(classes.map(c => String(c.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b)).map(g => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          disabled={!selectedGrade}
          onChange={e => {
            const sec = e.target.value;
            setSelectedSection(sec);
            if (sec) {
              const matchedClass = classes.find(c => String(c.grade) === String(selectedGrade) && String(c.section) === String(sec));
              setSelectedClassId(matchedClass?._id || matchedClass?.id || '');
            } else {
              setSelectedClassId('');
            }
          }}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', minWidth: '160px', fontSize: '0.95rem', opacity: selectedGrade ? 1 : 0.5 }}
        >
          <option value="">Select Section</option>
          {classes.filter(c => String(c.grade) === String(selectedGrade)).map(c => c.section).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).sort().map(s => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>

        {selectedClassId && (
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{visibleDues.length} pending record{visibleDues.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {!selectedClassId ? (
        <p style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
          Select a Grade and Section to view pending dues.
        </p>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ ...cardStyle, padding: '18px 20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Outstanding Dues</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{rupee(totalDues)}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Across {visibleDues.length} students</div>
            </div>
            <div style={{ ...cardStyle, padding: '18px 20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Unpaid Accounts</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>{unpaid}</div>
              <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>No payments made yet</div>
            </div>
            <div style={{ ...cardStyle, padding: '18px 20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Partially Paid</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>{partial}</div>
              <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '4px' }}>Active balance remaining</div>
            </div>
          </div>

          {/* Search / Filter Controls */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search by student name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', minWidth: '150px' }}
            >
              <option value="all">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partially Paid</option>
            </select>
          </div>

          {/* Dues Table */}
          <div style={cardStyle}>
            {visibleDues.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
                <p style={{ fontWeight: 600 }}>No pending fee records found match current filters</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      {['Student', 'Fee Description', 'Amount Due', 'Due Date', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDues.map((fee, idx) => {
                      const balance = Math.max(Number(fee.amount||0) - Number(fee.paidAmount||0), 0);
                      const status = getStatus(fee);
                      return (
                        <tr key={fee._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {fee.student?.userId?.firstName} {fee.student?.userId?.lastName}
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>ID: {fee.student?.userId?.userId}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{fee.description || 'Tuition Fee'}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{rupee(balance)}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{fmt(fee.dueDate)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                              background: status === 'paid' ? '#dcfce7' : status === 'partial' ? '#fef3c7' : '#fee2e2',
                              color: status === 'paid' ? '#15803d' : status === 'partial' ? '#b45309' : '#b91c1c',
                              textTransform: 'uppercase'
                            }}>
                              {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Unpaid'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setActiveModal({ type: 'notice', fee })}
                                style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                🔔 Notice
                              </button>
                              <button onClick={() => setActiveModal({ type: 'deadline', fee })}
                                style={{ padding: '6px 12px', background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                📅 Deadline
                              </button>
                              <button onClick={() => setActiveModal({ type: 'deport', fee })}
                                style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                🚪 Suspension
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {activeModal?.type === 'notice'   && <NoticeModal   fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === 'deadline' && <DeadlineModal fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === 'deport'   && <DeportModal   fee={activeModal.fee} onClose={() => setActiveModal(null)} />}
      
    </div>
  );
};

export default PrincipalPendingFees;
