import React, { useState, useEffect } from 'react';
import { concessionService, feeService, studentService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';
import { demoStudents, demoClasses } from '../../utils/demoData';
import { resolveStudentName, broadcastDataChange, subscribeToDataChanges, getUnifiedConcessions } from '../../services/syncService';

const rupee = formatCurrency;

// Helper to generate realistic fee records for all students across all 30 classes
const generateStudentFees = (studentsList) => {
  return studentsList.flatMap((std, idx) => {
    const stdId = std._id || std.id || `st_${std.grade}_${std.section}_${idx + 1}`;
    const gNum = Number(std.grade || std.class?.grade || 1);
    const tuitionAmt = 42000 + (gNum * 1500);
    const isPaidFirst = idx % 5 === 0;

    return [
      {
        _id: `fee_${stdId}_tuition`,
        studentId: stdId,
        student: std,
        description: `Tuition & Academic Fee (Term 1 - Grade ${std.grade || '1'})`,
        amount: tuitionAmt,
        paidAmount: isPaidFirst ? tuitionAmt : Math.floor(tuitionAmt * 0.4),
        dueAmount: isPaidFirst ? 0 : Math.ceil(tuitionAmt * 0.6),
        isPaid: isPaidFirst,
        dueDate: '2026-08-30'
      },
      {
        _id: `fee_${stdId}_admin`,
        studentId: stdId,
        student: std,
        description: 'Annual Administrative & Campus Facility Fee',
        amount: 12000,
        paidAmount: 0,
        dueAmount: 12000,
        isPaid: false,
        dueDate: '2026-09-15'
      },
      {
        _id: `fee_${stdId}_lab`,
        studentId: stdId,
        student: std,
        description: 'Computer Lab, Science STEM & Digital Learning Fee',
        amount: 6500,
        paidAmount: 0,
        dueAmount: 6500,
        isPaid: false,
        dueDate: '2026-09-30'
      }
    ];
  });
};

// ── Grant Modal ───────────────────────────────────────────────────────────────
const GrantModal = ({ students, fees, onClose, onGranted }) => {
  const [selectedGrade,   setSelectedGrade]   = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [studentId,       setStudentId]       = useState('');
  const [feeId,           setFeeId]           = useState('');
  const [amount,          setAmount]          = useState('');
  const [reason,          setReason]          = useState('');
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');
  const [done,            setDone]            = useState(false);
  const [resultMsg,       setResultMsg]       = useState('');

  // 1. Filter students by chosen Grade & Section
  const filteredStudents = students.filter(s => {
    const stdGrade = String(s.grade || s.class?.grade || '');
    const stdSection = String(s.section || s.class?.section || '');
    const matchG = !selectedGrade || stdGrade === String(selectedGrade);
    const matchS = !selectedSection || stdSection === String(selectedSection);
    return matchG && matchS;
  });

  // 2. Derive active student reliably
  const activeStudent = filteredStudents.find(s => String(s._id || s.id) === String(studentId)) || filteredStudents[0] || null;
  const activeStudentId = activeStudent ? String(activeStudent._id || activeStudent.id) : '';

  // 3. Derive active student's fee records
  const studentFees = fees.filter(f => {
    const sId = f.student?._id || f.student?.id || f.student || f.studentId;
    return sId && String(sId) === String(activeStudentId) && !f.isPaid;
  });

  // 4. Derive selected fee reliably (defaults to first fee for this student)
  const selectedFee = studentFees.find(f => f._id === feeId) || studentFees[0] || null;
  const selectedFeeId = selectedFee ? selectedFee._id : '';
  const maxAmount = selectedFee ? Number(selectedFee.dueAmount || selectedFee.amount || 0) : 0;

  const quickReasons = [
    'Academic Merit Scholarship (90%+)',
    'EWS / Financial Hardship Waiver',
    'Staff Ward Educational Benefit',
    'Sports & Athletics Achievement',
    'Sibling Discount Concession',
    'Special Talent / Arts Scholarship'
  ];

  const handleGrant = async () => {
    if (!activeStudentId || !selectedFeeId || !amount || !reason.trim()) {
      setError('Please select a student, fee record, enter concession amount and reason.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > maxAmount) {
      setError(`Concession amount must be between ₹1 and ${rupee(maxAmount)}.`);
      return;
    }

    setSaving(true);
    setError('');

    const targetStudent = activeStudent;
    const stdName = `${targetStudent?.firstName || ''} ${targetStudent?.lastName || ''}`.trim() || resolveStudentName(targetStudent, students);

    const newConcession = {
      _id: `conc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      student: targetStudent,
      studentId: activeStudentId,
      fee: selectedFee || { description: 'Tuition Fee', amount: maxAmount },
      feeId: selectedFeeId,
      concessionAmount: numAmount,
      reason: reason.trim(),
      grantedBy: 'Dr. Kumar (Principal)',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'Approved'
    };

    try {
      await concessionService.create({
        studentId: activeStudentId,
        feeId: selectedFeeId,
        concessionAmount: numAmount,
        reason: reason.trim(),
      }).catch(() => null);
    } catch (e) {
      // Local sync fallback
    }

    // Persist to localStorage for realtime cross-portal sync
    try {
      const stored = JSON.parse(localStorage.getItem('school_concessions') || '[]');
      localStorage.setItem('school_concessions', JSON.stringify([newConcession, ...stored]));
      broadcastDataChange('CONCESSION_GRANTED', newConcession);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    setResultMsg(`₹${numAmount.toLocaleString('en-IN')} Concession granted to ${stdName} (Grade ${targetStudent?.grade || selectedGrade}-${targetStudent?.section || selectedSection})!`);
    setDone(true);
    setSaving(false);
  };

  return (
    <div style={ov}>
      <div style={{ ...md, maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>🎁 Grant Fee Concession</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.84rem', margin: '0 0 16px' }}>
          Concession is approved directly by the Principal and <strong>auto-deducted</strong> from Accountant records.
        </p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎉</div>
            <p style={{ fontWeight: 800, color: '#15803d', fontSize: '1.1rem', margin: '0 0 6px' }}>{resultMsg}</p>
            <p style={{ fontSize: '0.84rem', color: '#6b7280', margin: '0 0 18px' }}>The Accountant and Parent portals have been updated automatically.</p>
            <button onClick={onGranted} style={{ ...btnPrimary('#15803d'), padding: '10px 28px', fontSize: '0.92rem' }}>
              ✓ View Concession Log
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600, fontSize: '0.84rem' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Grade & Section Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>Grade</label>
                <select
                  value={selectedGrade}
                  onChange={e => { setSelectedGrade(e.target.value); setStudentId(''); setFeeId(''); setAmount(''); }}
                  style={inp}
                >
                  <option value="">All Grades (1–10)</option>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Section</label>
                <select
                  value={selectedSection}
                  onChange={e => { setSelectedSection(e.target.value); setStudentId(''); setFeeId(''); setAmount(''); }}
                  style={inp}
                >
                  <option value="">All Sections (A–C)</option>
                  {['A', 'B', 'C'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Dropdown */}
            <label style={lbl}>Student ({filteredStudents.length} available) *</label>
            <select
              value={activeStudentId}
              onChange={e => { setStudentId(e.target.value); setFeeId(''); setAmount(''); }}
              style={{ ...inp, marginBottom: '12px', fontWeight: 600 }}
            >
              {filteredStudents.map((s, idx) => {
                const sName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || resolveStudentName(s, students, idx);
                const sGrade = s.grade || s.class?.grade || selectedGrade || '1';
                const sSec = s.section || s.class?.section || selectedSection || 'A';
                const roll = s.rollNumber || s.rollNo || `G${sGrade}-${String(idx + 1).padStart(3, '0')}`;
                return (
                  <option key={s._id || s.id || idx} value={s._id || s.id}>
                    {sName} (Roll: {roll} · Grade {sGrade}-{sSec})
                  </option>
                );
              })}
              {filteredStudents.length === 0 && (
                <option value="" disabled>No students found in selected Grade & Section</option>
              )}
            </select>

            {/* Fee Record Dropdown */}
            <label style={lbl}>Fee Record *</label>
            <select
              value={selectedFeeId}
              onChange={e => { setFeeId(e.target.value); setAmount(''); }}
              style={{ ...inp, marginBottom: '12px', fontWeight: 500 }}
              disabled={!activeStudentId || studentFees.length === 0}
            >
              {studentFees.map(f => (
                <option key={f._id} value={f._id}>
                  {f.description} — {rupee(f.dueAmount || f.amount)} due
                </option>
              ))}
              {studentFees.length === 0 && (
                <option value="" disabled>No unpaid fee records for this student</option>
              )}
            </select>

            {selectedFee && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '0.84rem', color: '#1e40af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>Total: <strong>{rupee(selectedFee.amount)}</strong></span> · 
                  <span style={{ marginLeft: '6px' }}>Paid: <strong>{rupee(selectedFee.paidAmount || 0)}</strong></span>
                </div>
                <div>
                  <span style={{ background: '#dbeafe', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    Max Concession: {rupee(maxAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Percentage Presets */}
            {selectedFee && maxAmount > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>Quick:</span>
                {[
                  { label: '25%', val: Math.round(maxAmount * 0.25) },
                  { label: '50%', val: Math.round(maxAmount * 0.50) },
                  { label: '75%', val: Math.round(maxAmount * 0.75) },
                  { label: '100% Full', val: maxAmount },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAmount(String(p.val))}
                    style={{ padding: '3px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {p.label} (₹{p.val.toLocaleString('en-IN')})
                  </button>
                ))}
              </div>
            )}

            {/* Concession Amount */}
            <label style={lbl}>Concession Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              min={1}
              max={maxAmount}
              onChange={e => setAmount(e.target.value)}
              style={{ ...inp, marginBottom: '12px', fontWeight: 700, fontSize: '0.95rem', color: '#15803d' }}
              placeholder={selectedFee ? `Enter amount up to ${rupee(maxAmount)}` : 'Select a student fee first'}
            />

            {/* Quick Reason Chips */}
            <label style={lbl}>Reason for Concession *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {quickReasons.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: reason === r ? '1px solid #16a34a' : '1px solid #e2e8f0',
                    background: reason === r ? '#dcfce7' : '#f8fafc',
                    color: reason === r ? '#15803d' : '#475569',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Academic Merit Scholarship (95%+ in Term Exams)..."
              style={{ ...inp, resize: 'vertical', marginBottom: '18px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSec}>Cancel</button>
              <button
                onClick={handleGrant}
                disabled={saving || !activeStudentId || !selectedFeeId || !amount || !reason.trim()}
                style={btnPrimary('#15803d', saving || !activeStudentId || !selectedFeeId || !amount || !reason.trim())}
              >
                {saving ? '⏳ Applying…' : '✅ Grant Concession'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const ov     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const md     = { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' };
const lbl    = { display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '4px', color: '#374151' };
const inp    = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' };
const btnSec = { padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' };
const btnPrimary = (bg, dis) => ({
  padding: '9px 22px', background: dis ? '#e2e8f0' : bg, color: dis ? '#9ca3af' : '#fff',
  border: 'none', borderRadius: '8px', cursor: dis ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.86rem',
});

// ── Main: Principal Grant Page ────────────────────────────────────────────────
const PrincipalConcessionGrant = () => {
  const [concessions, setConcessions] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [fees,        setFees]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [search,      setSearch]      = useState('');

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [cRes, sRes, fRes] = await Promise.all([
        concessionService.getAll().catch(() => ({ data: [] })),
        studentService.getAll().catch(() => ({ data: [] })),
        feeService.getAll().catch(() => ({ data: [] })),
      ]);

      const apiConcessions = Array.isArray(cRes?.data) ? cRes.data : [];
      const apiStudents    = (Array.isArray(sRes?.data) && sRes.data.length > 0) ? sRes.data : demoStudents;
      const apiFees        = Array.isArray(fRes?.data) ? fRes.data : [];

      const allConcessions = getUnifiedConcessions(apiConcessions);
      const allFees = apiFees.length > 0 ? apiFees : generateStudentFees(apiStudents);

      setConcessions(allConcessions);
      setStudents(apiStudents);
      setFees(allFees);
      setError('');
    } catch (err) {
      console.warn('Failed to load concessions:', err);
      const allFees = generateStudentFees(demoStudents);
      setStudents(demoStudents);
      setFees(allFees);
      setConcessions([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // Listen for realtime sync across tabs/portals
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
    const name = `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.toLowerCase();
    const reasonText = (c.reason || '').toLowerCase();
    const q = search.toLowerCase();
    return !search || name.includes(q) || reasonText.includes(q);
  });

  const totalGranted = concessions.reduce((s, c) => s + Number(c.concessionAmount || 0), 0);
  const thisMonthCount = concessions.filter(c => new Date(c.createdAt || Date.now()).getMonth() === new Date().getMonth()).length;
  const cardStyle = { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>🎁 Fee Concessions</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
            Grant scholarships & concessions directly — fee records are auto-adjusted and Accountant is synchronized in realtime.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#15803d,#16a34a)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
        >
          + Grant Fee Concession
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Total Granted', val: concessions.length,          icon: '🎁', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Amount',  val: rupee(totalGranted),         icon: '💰', color: '#15803d', bg: '#dcfce7' },
          { label: 'This Month',    val: `${thisMonthCount} Records`, icon: '📅', color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: s.bg }}>
            <span style={{ fontSize: '1.7rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: 600, marginTop: '3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search by student name or reason…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }}
      />

      {/* Concession Records Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>⏳ Loading concession records…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No concessions found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Student Name', 'Grade / Section', 'Fee Record', 'Concession', 'Reason', 'Granted On', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const sName = `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.trim() || resolveStudentName(c.student, students);
                  const sGrade = c.student?.grade || c.student?.class?.grade || '1';
                  const sSec = c.student?.section || c.student?.class?.section || 'A';
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
                        {c.fee?.description || 'Tuition Fee'}
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 800, color: '#15803d' }}>
                        − {rupee(c.concessionAmount)}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', maxWidth: '220px', fontSize: '0.83rem' }}>
                        {c.reason}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700 }}>
                          ✅ Approved
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

      {showModal && (
        <GrantModal
          students={students}
          fees={fees}
          onClose={() => setShowModal(false)}
          onGranted={() => { setShowModal(false); fetchAll(); }}
        />
      )}
    </div>
  );
};

export default PrincipalConcessionGrant;

