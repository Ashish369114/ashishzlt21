import React, { useState, useEffect, useCallback } from 'react';
import { teacherService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

// ── Helpers ───────────────────────────────────────────────────────────────────
const rupee = formatCurrency;
const expLabel = yrs => {
  if (yrs >= 15) return { label: 'Senior', color: '#7c3aed', bg: '#f3e8ff' };
  if (yrs >= 8)  return { label: 'Mid-Senior', color: '#7c3aed', bg: '#f5f3ff' };
  if (yrs >= 3)  return { label: 'Mid-Level', color: '#15803d', bg: '#dcfce7' };
  return { label: 'Junior', color: '#b45309', bg: '#fef3c7' };
};

// Star rating display
const Stars = ({ value, max = 5 }) => (
  <span>
    {[...Array(max)].map((_, i) => (
      <span key={i} style={{ color: i < value ? '#f59e0b' : '#d1d5db', fontSize: '1rem' }}>★</span>
    ))}
    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '4px' }}>({value}/{max})</span>
  </span>
);

// ── Salary Edit Modal ─────────────────────────────────────────────────────────
const SalaryModal = ({ teacher, onClose, onSave }) => {
  const user   = teacher.userId || {};
  const name   = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Teacher';
  const exp    = Number(teacher.experience || 0);
  const expInfo = expLabel(exp);

  const [salary,      setSalary]      = useState(Number(teacher.salary || 0));
  const [performance, setPerformance] = useState(Number(teacher.performanceRating || 3));
  const [designation, setDesignation] = useState(teacher.designation || 'Teacher');
  const [remarks,     setRemarks]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  // Auto-suggest salary based on experience + performance
  const suggested = Math.round(
    25000 + (exp * 2500) + (performance * 3000)
  );

  const handleSave = async () => {
    if (!salary || salary < 0) { setError('Enter a valid salary.'); return; }
    setSaving(true);
    setError('');
    try {
      await teacherService.update(teacher._id, {
        salary: Number(salary),
        designation,
        performanceRating: performance,
        principalRemarks: remarks,
      });
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={ov}>
      <div style={{ ...md, maxWidth: '520px' }}>
        {/* Teacher info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem', fontWeight: 800, flexShrink: 0 }}>
            {(user.firstName || 'T')[0]}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{name}</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ ...pill(expInfo.bg, expInfo.color) }}>{expInfo.label} · {exp} yr{exp !== 1 ? 's' : ''}</span>
              <span style={{ ...pill('#f1f5f9', '#374151') }}>🎓 {teacher.qualifications || 'B.Ed'}</span>
            </div>
          </div>
        </div>

        {/* Current salary */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Current Salary</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6366f1' }}>{rupee(teacher.salary)}</span>
        </div>

        {/* Performance rating */}
        <label style={lbl}>⭐ Performance Rating (1–5)</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map(v => (
            <button key={v} onClick={() => setPerformance(v)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
                background: v <= performance ? '#fef3c7' : '#f1f5f9',
                color: v <= performance ? '#b45309' : '#9ca3af',
                transform: v <= performance ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s',
              }}>
              {v}★
            </button>
          ))}
          <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: '#6b7280', marginLeft: '4px' }}>
            {['', 'Needs Improvement', 'Average', 'Good', 'Very Good', 'Excellent'][performance]}
          </span>
        </div>

        {/* Designation */}
        <label style={lbl}>🏷️ Designation</label>
        <select value={designation} onChange={e => setDesignation(e.target.value)} style={{ ...inp, marginBottom: '14px' }}>
          <option value="Teacher">Teacher</option>
          <option value="Senior Teacher">Senior Teacher</option>
          <option value="Head of Department">Head of Department</option>
          <option value="Assistant Principal">Assistant Principal</option>
          <option value="Special Educator">Special Educator</option>
          <option value="Coordinator">Coordinator</option>
        </select>

        {/* Salary input */}
        <label style={lbl}>💰 New Salary (₹ per month)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
          <input
            type="number"
            value={salary}
            min={0}
            onChange={e => setSalary(e.target.value)}
            style={{ ...inp, flex: 1 }}
            placeholder="e.g. 55000"
          />
        </div>
        <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#6366f1', cursor: 'pointer' }}
          onClick={() => setSalary(suggested)}>
          💡 Suggested based on experience + rating: <strong>{rupee(suggested)}</strong> — click to apply
        </p>

        {/* Remarks */}
        <label style={lbl}>📝 Principal's Remarks (optional)</label>
        <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="e.g. Excellent classroom management, increment well deserved."
          style={{ ...inp, resize: 'vertical', marginBottom: '14px' }}
        />

        {error && <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.82rem', marginBottom: '10px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSec}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 22px', background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
            {saving ? '⏳ Saving…' : '✅ Save Payroll'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const ov  = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const md  = { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' };
const lbl = { display: 'block', fontWeight: 700, fontSize: '0.84rem', marginBottom: '5px', color: '#374151' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' };
const btnSec = { padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };
const pill = (bg, color) => ({ background: bg, color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700 });

// ── Main Component ────────────────────────────────────────────────────────────
const PrincipalPayrollManagement = () => {
  const [teachers,   setTeachers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [editing,    setEditing]    = useState(null); // teacher being edited
  const [search,     setSearch]     = useState('');
  const [sortBy,     setSortBy]     = useState('experience'); // 'experience'|'salary'|'name'

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await teacherService.getAll().catch(() => ({ data: [] }));
      const apiTeachers = Array.isArray(res.data) ? res.data : [];
      if (apiTeachers.length > 0) {
        setTeachers(apiTeachers);
      } else {
        const demoTeacherNames = [
          { firstName: 'Priya', lastName: 'Sharma', subject: 'Mathematics', exp: 12, salary: 48000, rating: 5 },
          { firstName: 'Rahul', lastName: 'Verma', subject: 'Science', exp: 8, salary: 42000, rating: 4 },
          { firstName: 'Ananya', lastName: 'Singh', subject: 'English', exp: 5, salary: 36000, rating: 4 },
          { firstName: 'Kiran', lastName: 'Mehta', subject: 'Hindi', exp: 15, salary: 55000, rating: 5 },
          { firstName: 'Vijay', lastName: 'Gupta', subject: 'Social Studies', exp: 3, salary: 30000, rating: 3 },
          { firstName: 'Ritu', lastName: 'Joshi', subject: 'Computer Science', exp: 7, salary: 40000, rating: 4 },
          { firstName: 'Aditya', lastName: 'Kumar', subject: 'Physical Education', exp: 10, salary: 38000, rating: 3 },
          { firstName: 'Deepa', lastName: 'Patel', subject: 'Arts', exp: 6, salary: 34000, rating: 4 },
          { firstName: 'Sanjay', lastName: 'Reddy', subject: 'Chemistry', exp: 9, salary: 44000, rating: 4 },
          { firstName: 'Nisha', lastName: 'Iyer', subject: 'Biology', exp: 11, salary: 46000, rating: 5 },
        ];
        setTeachers(demoTeacherNames.map((t, idx) => ({
          _id: `demo_teacher_${idx}`,
          userId: { firstName: t.firstName, lastName: t.lastName, email: `${t.firstName.toLowerCase()}@school.com` },
          subject: t.subject,
          designation: t.exp >= 10 ? 'Senior Teacher' : t.exp >= 5 ? 'Teacher' : 'Junior Teacher',
          experience: t.exp,
          salary: t.salary,
          performanceRating: t.rating,
          status: 'Active'
        })));
      }
    } catch (err) {
      setError('Failed to load teacher data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  // Filter + sort
  const displayed = [...teachers]
    .filter(t => {
      const user = t.userId || {};
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      return !search || name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return Number(b.experience || 0) - Number(a.experience || 0);
      if (sortBy === 'salary')     return Number(b.salary || 0) - Number(a.salary || 0);
      if (sortBy === 'name') {
        const an = `${a.userId?.firstName || ''}${a.userId?.lastName || ''}`;
        const bn = `${b.userId?.firstName || ''}${b.userId?.lastName || ''}`;
        return an.localeCompare(bn);
      }
      return 0;
    });

  // Stats
  const totalPayroll  = teachers.reduce((s, t) => s + Number(t.salary || 0), 0);
  const avgSalary     = teachers.length ? Math.round(totalPayroll / teachers.length) : 0;
  const highestSalary = Math.max(...teachers.map(t => Number(t.salary || 0)), 0);
  const cardStyle     = { background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>💼 Teacher Payroll</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.87rem' }}>
            Set salaries based on experience, qualifications, and performance. Click <strong>Set Pay</strong> on any teacher.
          </p>
        </div>
        <button onClick={fetchTeachers} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}>
          🔄 Refresh
        </button>
      </div>

      {error   && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 16px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600 }}>{success}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Total Teachers', val: teachers.length,        icon: '👨‍🏫', color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Payroll',  val: rupee(totalPayroll),    icon: '💰', color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Average Salary', val: rupee(avgSalary),       icon: '📊', color: '#15803d', bg: '#dcfce7' },
          { label: 'Highest Salary', val: rupee(highestSalary),   icon: '🏆', color: '#b45309', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: s.bg }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: s.val.toString().length > 8 ? '1rem' : '1.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="🔍 Search teacher…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', outline: 'none' }} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', background: '#fff', cursor: 'pointer' }}>
          <option value="experience">Sort: Experience ↓</option>
          <option value="salary">Sort: Salary ↓</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>Loading teachers…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
            <p style={{ fontWeight: 600 }}>No teachers found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Teacher', 'Subject', 'Designation', 'Experience', 'Qualifications', 'Performance', 'Current Salary', 'Action'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((teacher, i) => {
                  const user   = teacher.userId || {};
                  const name   = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
                  const exp    = Number(teacher.experience || 0);
                  const expInfo = expLabel(exp);
                  const rating = Number(teacher.performanceRating || 0);

                  return (
                    <tr key={teacher._id}
                      style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      {/* Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                            {(user.firstName || 'T')[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1f2937' }}>{name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>{user.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      {/* Subject */}
                      <td style={{ padding: '12px 14px', color: '#4b5563', fontSize: '0.84rem' }}>{teacher.subject?.name || '—'}</td>
                      {/* Designation */}
                      <td style={{ padding: '12px 14px', color: '#374151', fontWeight: 600 }}>{teacher.designation || 'Teacher'}</td>
                      {/* Experience */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={pill(expInfo.bg, expInfo.color)}>{expInfo.label}</span>
                        <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '3px' }}>{exp} year{exp !== 1 ? 's' : ''}</div>
                      </td>
                      {/* Qualifications */}
                      <td style={{ padding: '12px 14px', color: '#4b5563', fontSize: '0.84rem' }}>{teacher.qualifications || '—'}</td>
                      {/* Performance */}
                      <td style={{ padding: '12px 14px' }}>
                        {rating > 0 ? <Stars value={rating} /> : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Not rated</span>}
                      </td>
                      {/* Salary */}
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#6366f1', fontSize: '1rem' }}>
                        {teacher.salary ? rupee(teacher.salary) : <span style={{ color: '#ef4444', fontSize: '0.82rem' }}>Not set</span>}
                      </td>
                      {/* Action */}
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setEditing(teacher)}
                          style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          💼 Set Pay
                        </button>
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
        💡 Salary decisions by the Principal are final. Payroll disbursement is handled by the Accountant.
      </p>

      {/* Edit Modal */}
      {editing && (
        <SalaryModal
          teacher={editing}
          onClose={() => setEditing(null)}
          onSave={async () => {
            setEditing(null);
            setSuccess('✅ Payroll updated successfully!');
            await fetchTeachers();
          }}
        />
      )}
    </div>
  );
};

export default PrincipalPayrollManagement;
