import React, { useState, useEffect } from 'react';
import { exportToCSV, printPDF } from '../../utils/exportUtils';
import { Search, Filter, BookOpen, CheckCircle, XCircle, Clock, Calendar, User, Download, Printer, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { demoLessonPlans } from '../../utils/demoData';
import { broadcastDataChange } from '../../services/syncService';

const PrincipalLessonPlanManagement = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [principalComments, setPrincipalComments] = useState('');

  useEffect(() => {
    fetchLessonPlans();
  }, [page, statusFilter, classFilter, subjectFilter]);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        status: statusFilter,
        ...(classFilter && { class: classFilter }),
        ...(subjectFilter && { subject: subjectFilter }),
        ...(search && { search })
      });

      const res = await fetch(`/api/lesson-plans?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setLessonPlans(data.lessonPlans || []);
        setTotalPages(data.totalPages || 1);
      } else {
        // Fallback to local storage / demoData
        const savedLpStr = localStorage.getItem('school_lesson_plans');
        let rawPlans = savedLpStr ? JSON.parse(savedLpStr) : demoLessonPlans;
        if (statusFilter && statusFilter !== 'all') {
          rawPlans = rawPlans.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
        }
        setLessonPlans(rawPlans);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch lesson plans:', err);
      setLessonPlans(demoLessonPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLessonPlans();
  };

  const handleOpenReviewModal = (plan) => {
    setSelectedPlan(plan);
    setPrincipalComments(plan.principalComments || '');
    setShowReviewModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedPlan) return;
    try {
      const targetId = String(selectedPlan.id || selectedPlan._id);

      // 1. Try backend endpoint silently
      fetch(`/api/lesson-plans/${targetId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          principalComments
        })
      }).catch(err => console.warn('Backend lesson plan approval fallback:', err));

      // 2. Update local state & localStorage
      const updatedPlan = {
        ...selectedPlan,
        status: newStatus,
        principalComments: principalComments || (newStatus === 'approved' ? 'Approved by Principal' : 'Revision requested')
      };

      const savedLpStr = localStorage.getItem('school_lesson_plans');
      let currentPlans = savedLpStr ? JSON.parse(savedLpStr) : demoLessonPlans;
      currentPlans = currentPlans.map(lp => String(lp.id || lp._id) === targetId ? updatedPlan : lp);
      
      localStorage.setItem('school_lesson_plans', JSON.stringify(currentPlans));
      setLessonPlans(currentPlans);
      setShowReviewModal(false);

      // 3. Broadcast live change to Principal & Super Admin dashboards
      window.dispatchEvent(new Event('schoolDataUpdated'));
      broadcastDataChange({ type: 'lesson_plan_updated', plan: updatedPlan });

      alert(`Lesson plan ${newStatus === 'approved' ? 'approved' : 'returned for revision'} successfully!`);
    } catch (err) {
      console.error('Error reviewing lesson plan:', err);
    }
  };

  const handleExportCSV = () => {
    const formatted = lessonPlans.map(lp => ({
      Title: lp.title,
      Subject: lp.subject,
      Class: lp.className,
      Teacher: lp.teacherName,
      StartDate: lp.startDate,
      EndDate: lp.endDate,
      Status: lp.status,
      Comments: lp.principalComments || ''
    }));
    exportToCSV(formatted, `lesson_plans_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    const cols = [
      { header: 'Title', key: 'title' },
      { header: 'Subject', key: 'subject' },
      { header: 'Class', key: 'class' },
      { header: 'Teacher', key: 'teacher' },
      { header: 'Status', key: 'status' },
    ];
    const formatted = lessonPlans.map(lp => ({
      title: lp.title,
      subject: lp.subject,
      class: lp.className,
      teacher: lp.teacherName,
      status: lp.status.toUpperCase()
    }));
    printPDF('Teacher Lesson Plan Approvals Report', cols, formatted);
  };

  return (
    <div style={{ padding: '24px', background: '#FAF6F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0C4A86', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="#0C4A86" /> Teacher Lesson Plan Approvals
          </h2>
          <p style={{ fontSize: '13px', color: '#6B5B54', margin: '4px 0 0' }}>Review, evaluate, approve or request revisions on weekly curriculum lesson plans.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#0C4A86', cursor: 'pointer' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#0C4A86', cursor: 'pointer' }}>
            <Printer size={15} /> Print PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8C7F79' }} />
            <input
              type="text"
              placeholder="Search teacher name, topic, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '9px 16px', background: '#6B5B54', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
        </form>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', outline: 'none', color: '#0C4A86' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}>
          <option value="">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
          <option value="Social Studies">Social Studies</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Hindi">Hindi</option>
          <option value="Telugu">Telugu</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
        </select>
      </div>

      {/* Grid of Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Loading lesson plans...</div>
        ) : (lessonPlans.length === 0 ? demoLessonPlans : lessonPlans).map((plan) => (
          <div key={plan.id || plan._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#334155' }}>
                  {plan.className} • {plan.subject}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize',
                  background: plan.status === 'approved' ? '#dcfce7' : plan.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: plan.status === 'approved' ? '#15803d' : plan.status === 'rejected' ? '#b91c1c' : '#b45309'
                }}>
                  {plan.status}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>{plan.title}</h3>

              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={13} /> {plan.teacherName}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {plan.startDate} to {plan.endDate}</span>
              </div>

              {plan.topicsCovered && (
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '2px' }}>Topics Covered:</strong>
                  <p style={{ fontSize: '12px', color: '#334155', margin: 0, lineHeight: '1.4' }}>{plan.topicsCovered}</p>
                </div>
              )}

              {plan.principalComments && (
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #6366f1', marginTop: '10px' }}>
                  <strong style={{ fontSize: '11px', color: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageSquare size={12} /> Principal Feedback:
                  </strong>
                  <p style={{ fontSize: '12px', color: '#334155', margin: '2px 0 0' }}>{plan.principalComments}</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => handleOpenReviewModal(plan)}
                style={{ padding: '8px 14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Review & Action
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'default' : 'pointer' }}>
            <ChevronLeft size={14} /> Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'default' : 'pointer' }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Review Lesson Plan</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>{selectedPlan.title}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Submitted by <strong>{selectedPlan.teacherName}</strong> ({selectedPlan.className} - {selectedPlan.subject})</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Principal Comments / Revisions Note</label>
              <textarea
                rows="3"
                value={principalComments}
                onChange={(e) => setPrincipalComments(e.target.value)}
                placeholder="Add feedback, notes, or instructions for the teacher..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => handleUpdateStatus('rejected')}
                style={{ padding: '10px 18px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={15} /> Request Revision (Reject)
              </button>
              <button
                onClick={() => handleUpdateStatus('approved')}
                style={{ padding: '10px 20px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={15} /> Approve Lesson Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalLessonPlanManagement;
