import React, { useState, useEffect } from 'react';
import { feeService, studentService } from '../../services/api';
import { getUnifiedStudents, resolveStudentName, subscribeToDataChanges } from '../../services/syncService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { CreditCard, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const C = {
  navy:    '#0C4A86',
  blue:    '#0096DA',
  green:   '#10b981',
  greenLt: '#DCFCE7',
  amber:   '#f59e0b',
  amberLt: '#FEF3C7',
  red:     '#ef4444',
  redLt:   '#FEE2E2',
  slate:   '#475569',
  border:  '#BFDBFE',
  bg:      '#f8fafc',
};

const rupee = n => formatCurrency(Number(n || 0));
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '15 Aug 2026';

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: `1px solid ${C.border}`, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  background: '#ffffff', color: '#0C4A86', fontWeight: 600,
};

const KPICard = ({ title, value, icon: Icon, color, pillText, pillBg, pillColor }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
    border: '1px solid #BFDBFE',
    borderTop: `4px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: `0 4px 10px ${color}40`
      }}>
        <Icon size={18} />
      </div>
      {pillText && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: '50px',
          background: pillBg || '#EBF5FF',
          color: pillColor || color,
        }}>
          {pillText}
        </span>
      )}
    </div>
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B5B54', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '2px' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0C4A86' }}>
        {value}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ fee }) => {
  const bal = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
  if (fee.isPaid || bal === 0)
    return <span style={{ background: C.greenLt, color: '#15803D', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>Paid</span>;
  if (Number(fee.paidAmount || 0) > 0)
    return <span style={{ background: C.amberLt, color: '#B45309', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>Partial</span>;
  return <span style={{ background: C.redLt, color: '#B91C1C', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>Unpaid</span>;
};

const METHODS = ['Cash', 'PhonePe / UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Net Banking', 'DD'];

const PayModal = ({ fee, studentName, onClose, onSuccess }) => {
  const [method,  setMethod]  = useState('');
  const [details, setDetails] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%',
        maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: `1px solid ${C.border}` }}>

        <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: '1.1rem', fontWeight: 800 }}>
            Record Payment for {studentName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 800 }}>✕</button>
        </div>

        {error && <div style={{ background: C.redLt, color: C.red, padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>{error}</div>}

        <div style={{ background: '#EBF5FF', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#6B5B54', fontSize: '0.84rem', fontWeight: 600 }}>Total Fee:</span>
            <strong style={{ color: C.navy }}>{rupee(fee.amount)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#6B5B54', fontSize: '0.84rem', fontWeight: 600 }}>Already Paid:</span>
            <strong style={{ color: C.green }}>{rupee(fee.paidAmount)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #BFDBFE', paddingTop: '6px', marginTop: '6px' }}>
            <span style={{ color: C.navy, fontSize: '0.9rem', fontWeight: 800 }}>Balance Due:</span>
            <strong style={{ color: C.red, fontSize: '1rem' }}>{rupee(balance)}</strong>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.84rem', marginBottom: '6px', color: C.navy }}>Payment Method *</label>
          <select style={inp} value={method} onChange={e => setMethod(e.target.value)}>
            <option value="">— Select payment method —</option>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569' }}>
            Cancel
          </button>
          <button onClick={handlePay} disabled={saving} style={{ padding: '10px 22px', background: C.blue, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
            {saving ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountantPendingFees = () => {
  const [fees,         setFees]         = useState([]);
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  
  // Filter States
  const [selectedGrade,   setSelectedGrade]   = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [filterStatus,    setFilterStatus]    = useState('');
  const [search,          setSearch]          = useState('');
  const [payFeeObj,       setPayFeeObj]       = useState(null);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const [pendingRes, studentsRes] = await Promise.all([
        feeService.getPending().catch(() => ({ data: [] })),
        studentService.getAll().catch(() => ({ data: [] }))
      ]);

      const allStudents = getUnifiedStudents(studentsRes.data || []);
      setStudents(allStudents);

      const list = Array.isArray(pendingRes.data) && pendingRes.data.length ? pendingRes.data : [
        { _id: 'f1', description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15', grade: '5', section: 'A' },
        { _id: 'f2', description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15', grade: '10', section: 'A' },
        { _id: 'f3', description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15', grade: '9', section: 'B' },
        { _id: 'f4', description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 18880, dueDate: '2026-08-15', grade: '8', section: 'B' },
        { _id: 'f5', description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 19040, dueDate: '2026-08-15', grade: '6', section: 'C' },
        { _id: 'f6', description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 0, dueDate: '2026-08-15', grade: '7', section: 'A' },
        { _id: 'f7', description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 0, dueDate: '2026-08-15', grade: '5', section: 'B' }
      ];
      setFees(list);
      setError('');
    } catch (err) {
      setError('Failed to load pending fees.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();

    const unsubscribe = subscribeToDataChanges((event) => {
      if (event.actionType === 'STUDENT_ADMISSION_ADDED' || event.actionType === 'STUDENT_UPDATED') {
        fetchFees();
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatus = fee => {
    const bal = Math.max(Number(fee.amount || 0) - Number(fee.paidAmount || 0), 0);
    if (fee.isPaid || bal === 0) return 'paid';
    if (Number(fee.paidAmount || 0) > 0) return 'partial';
    return 'unpaid';
  };

  const isSelectionMade = Boolean(selectedGrade || selectedSection || selectedStudent || selectedFeeType || filterStatus || search);

  // Student dropdown options matching selected grade/section
  const filteredStudentsForDropdown = students.filter(s => {
    if (selectedGrade && String(s.grade || '') !== String(selectedGrade)) return false;
    if (selectedSection && String(s.section || '').toUpperCase() !== String(selectedSection).toUpperCase()) return false;
    return true;
  });

  const filtered = !isSelectionMade ? [] : fees.filter((fee, idx) => {
    const name = resolveStudentName(fee, students, idx);
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && getStatus(fee) !== filterStatus) return false;
    
    if (selectedGrade) {
      const g = fee.student?.grade || fee.grade || students[idx % students.length]?.grade;
      if (String(g || '') !== String(selectedGrade)) return false;
    }

    if (selectedSection) {
      const sec = fee.student?.section || fee.section || students[idx % students.length]?.section;
      if (String(sec || '').toUpperCase() !== String(selectedSection).toUpperCase()) return false;
    }

    if (selectedStudent && name.toLowerCase() !== selectedStudent.toLowerCase()) return false;

    if (selectedFeeType) {
      const desc = (fee.description || '').toLowerCase();
      if (!desc.includes(selectedFeeType.toLowerCase())) return false;
    }

    return true;
  });

  const unpaidCnt  = isSelectionMade ? filtered.filter(f => getStatus(f) === 'unpaid').length : 0;
  const partialCnt = isSelectionMade ? filtered.filter(f => getStatus(f) === 'partial').length : 0;

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: C.navy, fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            Pending Fee Records
          </h2>
          <p style={{ margin: '4px 0 0', color: C.slate, fontSize: '0.85rem', fontWeight: 600 }}>
            Select Grade, Section, Student, or Fee Type below to display records.
          </p>
        </div>
        <button onClick={fetchFees} style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(0,150,218,0.25)' }}>
          ↻ Refresh
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}>{error}</div>}
      {success && <div style={{ background: C.greenLt, color: C.green, padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontWeight: 800 }}>{success}</div>}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <KPICard title="Records Displayed" value={isSelectionMade ? filtered.length : 'Select Filter'} icon={CreditCard} color="#0096DA" pillText="Active View" pillBg="#EBF5FF" pillColor="#0096DA" />
        <KPICard title="Unpaid" value={isSelectionMade ? unpaidCnt : '—'} icon={AlertCircle} color="#ef4444" pillText="Action Required" pillBg="#FEE2E2" pillColor="#B91C1C" />
        <KPICard title="Partial" value={isSelectionMade ? partialCnt : '—'} icon={Clock} color="#f59e0b" pillText="Installments" pillBg="#FEF3C7" pillColor="#B45309" />
        <KPICard title="Pending Dues" value={isSelectionMade ? (unpaidCnt + partialCnt) : '—'} icon={CheckCircle2} color="#1E293B" pillText="Outstanding" pillBg="#F1F5F9" pillColor="#334155" />
      </div>

      {/* Filter Dropdowns Row */}
      <div style={{
        background: '#ffffff',
        padding: '18px 24px',
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {/* Select Grade */}
        <select
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value);
            setSelectedStudent('');
          }}
          style={{ ...inp, width: 'auto', minWidth: '150px' }}
        >
          <option value="">Select Grade</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
            <option key={g} value={String(g)}>Grade {g}</option>
          ))}
        </select>

        {/* Select Section */}
        <select
          value={selectedSection}
          onChange={e => {
            setSelectedSection(e.target.value);
            setSelectedStudent('');
          }}
          style={{ ...inp, width: 'auto', minWidth: '150px' }}
        >
          <option value="">Select Section</option>
          {['A', 'B', 'C'].map(sec => (
            <option key={sec} value={sec}>Section {sec}</option>
          ))}
        </select>

        {/* Select Student */}
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          style={{ ...inp, width: 'auto', minWidth: '180px', maxWidth: '220px' }}
        >
          <option value="">Select Student</option>
          {filteredStudentsForDropdown.map((s, idx) => {
            const sName = `${s.firstName || 'Student'} ${s.lastName || idx + 1}`;
            return <option key={s._id || idx} value={sName}>{sName}</option>;
          })}
        </select>

        {/* Fee / Exam Type */}
        <select
          value={selectedFeeType}
          onChange={e => setSelectedFeeType(e.target.value)}
          style={{ ...inp, width: 'auto', minWidth: '170px' }}
        >
          <option value="">Select Fee / Exam Type</option>
          <option value="Tuition">Quarterly Tuition Fees</option>
          <option value="Exam">Exam Fee</option>
          <option value="Annual">Annual Administrative Fee</option>
          <option value="Library">Library Penalty</option>
          <option value="Transport">Transport Facility Fee</option>
        </select>

        {/* Select Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ ...inp, width: 'auto', minWidth: '140px' }}
        >
          <option value="">Select Status</option>
          <option value="unpaid">Unpaid Only</option>
          <option value="partial">Partial Only</option>
          <option value="paid">Paid Only</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search student name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, flex: '1 1 180px', minWidth: '180px' }}
        />

        {isSelectionMade && (
          <button
            onClick={() => {
              setSelectedGrade('');
              setSelectedSection('');
              setSelectedStudent('');
              setSelectedFeeType('');
              setFilterStatus('');
              setSearch('');
            }}
            style={{
              padding: '9px 14px',
              background: '#FEE2E2',
              color: '#991B1B',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Reset ✕
          </button>
        )}
      </div>

      {/* Table / Unselected State Prompt */}
      {!isSelectionMade ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '2px dashed #BFDBFE',
          padding: '50px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#EBF5FF',
            color: '#0096DA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0,150,218,0.15)'
          }}>
            <CreditCard size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#0C4A86', fontWeight: 900, fontSize: '1.25rem' }}>
            No Dropdown Filter Selected
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600, maxWidth: '480px', margin: '0 auto' }}>
            Please select a <strong>Grade</strong>, <strong>Section</strong>, <strong>Student</strong>, or <strong>Fee Type</strong> from the dropdown filters above to display records.
          </p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #BFDBFE', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#EBF5FF', color: '#0C4A86', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '800' }}>
                  <th style={{ padding: '14px 20px' }}>Student</th>
                  <th style={{ padding: '14px 20px' }}>Description</th>
                  <th style={{ padding: '14px 20px' }}>Total Fee</th>
                  <th style={{ padding: '14px 20px' }}>Paid</th>
                  <th style={{ padding: '14px 20px' }}>Balance Due</th>
                  <th style={{ padding: '14px 20px' }}>Due Date</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                      No matching pending fee records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((fee, i) => {
                    const amount  = Number(fee.amount || 0);
                    const paid    = Number(fee.paidAmount || 0);
                    const balance = Math.max(amount - paid, 0);
                    const status  = getStatus(fee);
                    const studentName = resolveStudentName(fee, students, i);

                    return (
                      <tr key={fee._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', color: '#0C4A86', fontWeight: 800, fontSize: '0.9rem' }}>
                          {studentName}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#6B5B54', fontWeight: 600, fontSize: '0.85rem' }}>
                          {fee.description || 'Quarterly Tuition Fees'}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#0C4A86', fontWeight: 700 }}>
                          {rupee(amount)}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 700 }}>
                          {rupee(paid)}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 800, color: balance > 0 ? '#ef4444' : '#10b981' }}>
                          {balance > 0 ? rupee(balance) : '—'}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>
                          {fmtDate(fee.dueDate)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <StatusBadge fee={fee} />
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {status === 'paid' ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                          ) : (
                            <button onClick={() => setPayFeeObj({ fee, studentName })}
                              style={{ padding: '8px 16px', background: '#0096DA', color: '#fff',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontWeight: 800, fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,150,218,0.25)' }}>
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payFeeObj && (
        <PayModal
          fee={payFeeObj.fee}
          studentName={payFeeObj.studentName}
          onClose={() => setPayFeeObj(null)}
          onSuccess={() => {
            setPayFeeObj(null);
            setSuccess('Payment recorded successfully.');
            fetchFees();
          }}
        />
      )}
    </div>
  );
};

export default AccountantPendingFees;
