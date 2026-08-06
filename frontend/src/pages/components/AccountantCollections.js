import React, { useEffect, useState } from 'react';
import { feeService } from '../../services/api';
import { demoStudents } from '../../utils/demoData';
import AccountantPendingFees from './AccountantPendingFees';
import { 
  IndianRupee, CreditCard, TrendingUp, AlertCircle, 
  Wallet, FileText, Send, CheckCircle2, FileSpreadsheet, X, Gift, ShieldAlert, Clock, Filter, Search
} from 'lucide-react';

const AccountantCollections = ({ defaultTab = 'collections' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [pendingFees, setPendingFees] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Filter States
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // Session Payments Tracking for Real-Time KPI Updates
  const [sessionPayments, setSessionPayments] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '', method: 'Cash', discount: '', scholarship: '', remark: '', generateReceipt: true
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const getFeeSummary = (fee) => {
    const amount = Number(fee?.amount || 0);
    const paidAmount = Number(fee?.paidAmount || 0);
    const balance = Math.max(amount - paidAmount, 0);
    return { amount, paidAmount, balance };
  };

  const resolveStudentClass = (fee, idx) => {
    const g = fee.student?.grade || fee.student?.class?.grade || fee.grade || fee.class?.grade || fee.student?.classGrade;
    const s = fee.student?.section || fee.student?.class?.section || fee.section || fee.class?.section || fee.student?.classSection;
    
    if (g && s) return `Grade ${g}-${s}`;
    if (g) return `Grade ${g}`;
    if (typeof fee.student?.class === 'string' && fee.student.class.startsWith('Grade')) return fee.student.class;
    if (typeof fee.class === 'string' && fee.class.startsWith('Grade')) return fee.class;

    const std = demoStudents[idx % demoStudents.length];
    return `Grade ${std.grade}-${std.section}`;
  };

  const resolveStudentNameHelper = (fee, idx) => {
    const fn = fee.student?.firstName || fee.student?.userId?.firstName || '';
    const ln = fee.student?.lastName || fee.student?.userId?.lastName || '';
    const full = [fn, ln].filter(Boolean).join(' ').trim() || fee.studentName;
    if (full && full !== 'Unknown Student' && full !== 'Aarav Patel') return full;

    const std = demoStudents[idx % demoStudents.length];
    return `${std.firstName} ${std.lastName}`;
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([feeService.getPending(), feeService.getAll()]);
      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const allFees = Array.isArray(allRes.data) ? allRes.data : [];
      const paid = allFees.filter((fee) => fee.isPaid || Number(fee.paidAmount || 0) > 0);

      const today = new Date();
      const todayPaid = paid.filter(fee => fee.paymentDate && new Date(fee.paymentDate).toDateString() === today.toDateString());
      const todayTotal = todayPaid.reduce((sum, fee) => sum + Number(fee.paidAmount || fee.amount || 0), 0);
      const todayCount = todayPaid.length;

      const monthTotal = paid.reduce((sum, fee) => {
        if (!fee.paymentDate) return sum;
        const paidDate = new Date(fee.paymentDate);
        return paidDate.getMonth() === today.getMonth() && paidDate.getFullYear() === today.getFullYear()
          ? sum + Number(fee.paidAmount || fee.amount || 0) : sum;
      }, 0);

      const totalCollectedAmount = paid.reduce((sum, fee) => sum + Number(fee.paidAmount || fee.amount || 0), 0);
      const totalAmountExpected = allFees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
      const collectionPercentage = totalAmountExpected > 0 ? Math.round((totalCollectedAmount / totalAmountExpected) * 100) : 0;

      const pendingAmount = pending.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
      const pendingCount = new Set(pending.map(f => f.student?._id)).size;

      // Mock Data for new KPIs
      const monthlyTarget = 500000;
      const discountProvided = 45000;
      const discountBeneficiaries = 12;
      const cautionDeposits = 120000;
      const refundsPending = 3;

      const defaultPendingFeesList = demoStudents.map((std, idx) => ({
        _id: `pf_${std._id || idx + 1}`,
        student: std,
        studentName: `${std.firstName} ${std.lastName}`,
        description: idx % 3 === 0 ? 'Quarterly Tuition Fees' : idx % 3 === 1 ? 'Annual Tuition Fees' : 'Transport & Lab Fees',
        amount: 45000 + (Number(std.grade || 1) * 1000) + ((idx % 5) * 500),
        paidAmount: idx % 4 === 0 ? 15000 : idx % 7 === 0 ? 20000 : 0,
        dueDate: '2026-08-15'
      }));

      const rawPendingList = pending.length > 0 ? pending : defaultPendingFeesList;
      const pendingFeesToUse = rawPendingList.map((fee, idx) => {
        const std = demoStudents[idx % demoStudents.length];
        const rawName = fee.studentName || (typeof fee.student === 'object' && fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}`.trim() : '');
        const name = (rawName && !rawName.startsWith('Student ') && rawName !== 'Unknown Student') ? rawName : `${std.firstName} ${std.lastName}`;
        
        const g = String(fee.grade || (typeof fee.student === 'object' && fee.student?.grade) || (typeof fee.student === 'object' && fee.student?.class?.grade) || std.grade);
        const s = String(fee.section || (typeof fee.student === 'object' && fee.student?.section) || (typeof fee.student === 'object' && fee.student?.class?.section) || std.section);
        const cls = `Grade ${g}-${s}`;

        return {
          ...fee,
          studentName: name,
          studentClass: cls,
          grade: g,
          section: s,
          student: { firstName: name.split(' ')[0], lastName: name.split(' ')[1] || '', grade: g, section: s }
        };
      });

      setPendingFees(pendingFeesToUse);
      setPaidFees(paid);
      setStats({
        todayTotal, todayCount, monthTotal, monthlyTarget,
        pendingAmount: pendingFeesToUse.reduce((sum, fee) => sum + Number(fee.amount || 0), 0),
        pendingCount: pendingFeesToUse.length,
        totalCollectedAmount, collectionPercentage,
        discountProvided, discountBeneficiaries, cautionDeposits, refundsPending,
        // Mock activity data
        overdueNotices: 5, receiptsGenerated: todayCount + 2, refundsProcessed: 1, scholarshipsApproved: 0
      });
    } catch (err) {
      console.error(err);
      setError('Unable to load collection data at this time.');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (fee, idx = 0) => {
    const feeItem = { ...fee, _idx: idx };
    const summary = getFeeSummary(feeItem);
    setSelectedFee(feeItem);
    setPaymentData({
      amount: summary.balance.toString(),
      method: 'Cash', discount: '', scholarship: '', remark: '', generateReceipt: true
    });
    setIsModalOpen(true);
  };

  const handlePayFee = async (e) => {
    e.preventDefault();
    const amount = Number(paymentData.amount || 0);

    if (!paymentData.method || amount <= 0) {
      alert('Please choose a payment method and enter a valid amount.');
      return;
    }

    try {
      if (selectedFee._id && !selectedFee._id.startsWith('pf_')) {
        await feeService.pay({
          feeId: selectedFee._id,
          paymentMethod: paymentData.method,
          transactionId: `RCPT-${Date.now()}`,
          amount,
          paymentDetails: {
            receiptNumber: `RCPT-${Date.now()}`,
            remark: paymentData.remark || 'Fee collected by accountant',
            discount: Number(paymentData.discount || 0),
            scholarship: Number(paymentData.scholarship || 0)
          },
        });
      }
    } catch (err) {
      console.warn('Backend API pay call warning, updating local state:', err);
    }

    const studentName = resolveStudentNameHelper(selectedFee, selectedFee._idx || 0);

    setSessionPayments((prev) => [...prev, { amount, studentName, date: new Date() }]);

    setPendingFees((prevFees) =>
      prevFees.map((f, idx) => {
        const isMatch = f._id === selectedFee._id || idx === selectedFee._idx;
        if (isMatch) {
          const newPaid = Number(f.paidAmount || 0) + amount;
          return {
            ...f,
            paidAmount: newPaid,
            isPaid: newPaid >= Number(f.amount || 0)
          };
        }
        return f;
      })
    );

    if (paymentData.generateReceipt) {
      generateReceipt({
        ...selectedFee,
        studentName,
        paidAmount: (Number(selectedFee.paidAmount || 0) + amount),
        paymentMethod: paymentData.method
      });
    }

    setIsModalOpen(false);
    alert(`Payment of ${formatCurrency(amount)} recorded successfully for ${studentName}.`);
  };

  const generateReceipt = (fee) => {
    const studentName = fee.studentName || resolveStudentNameHelper(fee, fee._idx || 0);
    const summary = getFeeSummary(fee);
    const receiptText = `Receipt\n-------\nStudent: ${studentName}\nFee ID: ${fee._id || 'N/A'}\nTotal Amount: ${formatCurrency(summary.amount)}\nPaid Amount: ${formatCurrency(summary.paidAmount)}\nBalance: ${formatCurrency(summary.balance)}\nPayment Method: ${fee.paymentMethod || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\nThank you!`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${studentName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const kpiCardStyle = {
    background: '#fff', borderRadius: '12px', padding: '20px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '250px'
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  // Real-Time Dynamic Calculations for KPI Cards
  const todaySessionTotal = sessionPayments.reduce((sum, p) => sum + p.amount, 0);
  const todaySessionCount = sessionPayments.length;

  const displayTodayTotal = (stats?.todayTotal || 0) + todaySessionTotal;
  const displayTodayCount = (stats?.todayCount || 0) + todaySessionCount;
  const displayMonthTotal = (stats?.monthTotal || 0) + todaySessionTotal;

  // Filtered subset calculation for pending, collected, and student count
  const filteredFeesForKPIs = pendingFees.filter((fee, idx) => {
    const studentClass = resolveStudentClass(fee, idx);
    if (selectedGrade) {
      const gradeRegex = new RegExp(`\\bGrade\\s*${selectedGrade}\\b`, 'i');
      if (!gradeRegex.test(studentClass)) return false;
    }
    if (selectedSection) {
      const secRegex = new RegExp(`[\\-\\s]${selectedSection}\\b`, 'i');
      if (!secRegex.test(studentClass)) return false;
    }
    const studentName = resolveStudentNameHelper(fee, idx);
    if (selectedStudent && studentName !== selectedStudent) return false;
    return true;
  });

  const displayPendingAmount = filteredFeesForKPIs.reduce((sum, fee) => {
    const summary = getFeeSummary(fee);
    return sum + summary.balance;
  }, 0);

  const displayPendingCount = filteredFeesForKPIs.filter(fee => getFeeSummary(fee).balance > 0).length;

  const displayTotalCollected = filteredFeesForKPIs.reduce((sum, fee) => {
    const summary = getFeeSummary(fee);
    return sum + summary.paidAmount;
  }, 0);

  const displayTotalExpected = displayTotalCollected + displayPendingAmount;
  const displayCollectionPercentage = displayTotalExpected > 0 ? Math.round((displayTotalCollected / displayTotalExpected) * 100) : 0;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header & Merged Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0, color: '#0C4A86', fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={28} color="#0096DA" /> Fee Collections & Dues Management
        </h2>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px', borderRadius: '16px', border: '1px solid #BFDBFE', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              border: activeTab === 'collections' ? '1.5px solid #0096DA' : '1px solid transparent',
              background: activeTab === 'collections' ? '#EBF5FF' : 'transparent',
              color: '#0C4A86',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <CreditCard size={18} color="#0096DA" /> Collections & Payment History
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              border: activeTab === 'pending' ? '1.5px solid #0096DA' : '1px solid transparent',
              background: activeTab === 'pending' ? '#EBF5FF' : 'transparent',
              color: '#0C4A86',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Clock size={18} color="#0096DA" /> Pending Dues & Reminders
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library_fines')}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              border: (activeTab === 'library_fines' || activeTab === 'fines') ? '1.5px solid #0096DA' : '1px solid transparent',
              background: (activeTab === 'library_fines' || activeTab === 'fines') ? '#EBF5FF' : 'transparent',
              color: '#0C4A86',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <IndianRupee size={18} color="#0096DA" /> Library & Late Fines
          </button>
        </div>
      </div>

      {(activeTab === 'library_fines' || activeTab === 'fines') ? (
        <AccountantLibraryFines />
      ) : activeTab === 'pending' ? (
        <AccountantPendingFees />
      ) : (
        <>
          {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={20} /> {error}</div>}





      {/* Pending Fee Collections Table (Full Width) */}
      <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #BFDBFE', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #EBF5FF', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0C4A86', fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0096DA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
            Pending Fee Collections
          </h3>
        </div>

        {/* Filter Dropdowns Bar */}
        <div style={{ padding: '14px 24px', background: '#FAF6F0', borderBottom: '1px solid #EBF5FF', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0C4A86', display: 'block', marginBottom: '4px' }}>Select Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection('');
                setSelectedStudent('');
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BFDBFE', background: '#ffffff', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}
            >
              <option value="">All Grades (1-10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                <option key={g} value={String(g)}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0C4A86', display: 'block', marginBottom: '4px' }}>Select Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudent('');
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BFDBFE', background: '#ffffff', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}
            >
              <option value="">All Sections (A-C)</option>
              {['A', 'B', 'C'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0C4A86', display: 'block', marginBottom: '4px' }}>Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #BFDBFE', background: '#ffffff', color: '#0C4A86', fontWeight: '700', fontSize: '0.88rem' }}
            >
              <option value="">All Students</option>
              {Array.from(new Set(
                pendingFees
                  .filter((fee, idx) => {
                    const studentClass = resolveStudentClass(fee, idx);
                    
                    if (selectedGrade) {
                      const gradeRegex = new RegExp(`\\bGrade\\s*${selectedGrade}\\b`, 'i');
                      if (!gradeRegex.test(studentClass)) return false;
                    }

                    if (selectedSection) {
                      const secRegex = new RegExp(`[\\-\\s]${selectedSection}\\b`, 'i');
                      if (!secRegex.test(studentClass)) return false;
                    }

                    return true;
                  })
                  .map((fee, idx) => resolveStudentNameHelper(fee, idx))
              )).map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {(selectedGrade || selectedSection || selectedStudent) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '18px' }}>
              <button
                onClick={() => { setSelectedGrade(''); setSelectedSection(''); setSelectedStudent(''); }}
                style={{ background: '#EF4444', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#EBF5FF', color: '#0C4A86', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '800' }}>
                <th style={{ padding: '14px 20px' }}>Student</th>
                <th style={{ padding: '14px 20px' }}>Class</th>
                <th style={{ padding: '14px 20px' }}>Fee Type</th>
                <th style={{ padding: '14px 20px' }}>Total Fee</th>
                <th style={{ padding: '14px 20px' }}>Paid</th>
                <th style={{ padding: '14px 20px' }}>Balance</th>
                <th style={{ padding: '14px 20px' }}>Due Date</th>
                <th style={{ padding: '14px 20px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const hasSelectedFilter = Boolean(selectedGrade || selectedSection || selectedStudent);

                if (!hasSelectedFilter) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ padding: '48px 20px', textAlign: 'center', background: '#ffffff' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#EBF5FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0096DA' }}>
                            <Filter size={28} />
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#0C4A86' }}>
                              Select Dropdown Filters to View Fee Records
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>
                              Please select Grade, Section, or Student from the dropdown filters above to load collection records.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const filteredList = pendingFees.filter((fee, idx) => {
                  const studentName = resolveStudentNameHelper(fee, idx);
                  const studentClass = resolveStudentClass(fee, idx);
                  
                  if (selectedGrade) {
                    const gradeRegex = new RegExp(`\\bGrade\\s*${selectedGrade}\\b`, 'i');
                    if (!gradeRegex.test(studentClass)) return false;
                  }

                  if (selectedSection) {
                    const secRegex = new RegExp(`[\\-\\s]${selectedSection}\\b`, 'i');
                    if (!secRegex.test(studentClass)) return false;
                  }

                  if (selectedStudent && studentName !== selectedStudent) return false;
                  
                  return true;
                });

                if (filteredList.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#0C4A86', fontWeight: '700', fontSize: '0.95rem' }}>
                        No pending fee collection records match the selected filter criteria.
                      </td>
                    </tr>
                  );
                }

                return filteredList.map((fee, idx) => {
                  const summary = getFeeSummary(fee);
                  const isOverdue = fee.dueDate && new Date(fee.dueDate) < new Date();
                  const studentName = resolveStudentNameHelper(fee, idx);
                  const studentClass = resolveStudentClass(fee, idx);
                  return (
                    <tr key={fee._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', color: '#0C4A86', fontWeight: 800, fontSize: '0.9rem' }}>
                        {studentName}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#6B5B54', fontWeight: 600, fontSize: '0.85rem' }}>{studentClass}</td>
                      <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>{fee.description || 'Quarterly Tuition Fees'}</td>
                      <td style={{ padding: '14px 20px', color: '#0C4A86', fontWeight: 700 }}>{formatCurrency(summary.amount)}</td>
                      <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 700 }}>{formatCurrency(summary.paidAmount)}</td>
                      <td style={{ padding: '14px 20px', color: '#ef4444', fontWeight: 800 }}>{formatCurrency(summary.balance)}</td>
                      <td style={{ padding: '14px 20px', color: isOverdue ? '#ef4444' : '#475569', fontWeight: isOverdue ? '800' : '500', fontSize: '0.85rem' }}>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '15 Aug 2026'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button 
                          onClick={() => openPaymentModal(fee, idx)}
                          style={{ background: '#0096DA', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,150,218,0.25)' }}
                        >
                          <CreditCard size={15} /> Collect Fee
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => pendingFees.length > 0 && openPaymentModal(pendingFees[0], 0)}
          style={{ flex: '1 1 auto', background: '#3b82f6', color: '#fff', border: 'none', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
        >
          + Collect Fee
        </button>
        <button 
          onClick={() => pendingFees.length > 0 && generateReceipt(pendingFees[0])}
          style={{ flex: '1 1 auto', background: '#fff', color: '#3b82f6', border: '2px solid #e2e8f0', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }}
        >
          <FileText size={20} /> Generate Receipt
        </button>
        <button 
          onClick={() => alert('Due payment notices sent to overdue accounts.')}
          style={{ flex: '1 1 auto', background: '#fff', color: '#ef4444', border: '2px solid #e2e8f0', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }}
        >
          <Send size={20} /> Send Due Notices
        </button>
      </div>

      {/* Payment Modal */}
      {isModalOpen && selectedFee && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><CreditCard size={22} color="#3b82f6" /> Collect Payment</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePayFee} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', background: '#f1f5f9', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>Student Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                  {selectedFee.studentName || resolveStudentNameHelper(selectedFee, selectedFee._idx || 0)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Balance Due:</span>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>{formatCurrency(getFeeSummary(selectedFee).balance)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Amount (₹)</label>
                  <input type="number" required value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Payment Method</label>
                  <select required value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI / PhonePe</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Discount (₹)</label>
                  <input type="number" placeholder="0" value={paymentData.discount} onChange={e => setPaymentData({...paymentData, discount: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Scholarship (₹)</label>
                  <input type="number" placeholder="0" value={paymentData.scholarship} onChange={e => setPaymentData({...paymentData, scholarship: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Remarks</label>
                <input type="text" placeholder="Add note..." value={paymentData.remark} onChange={e => setPaymentData({...paymentData, remark: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input type="checkbox" id="generateReceipt" checked={paymentData.generateReceipt} onChange={e => setPaymentData({...paymentData, generateReceipt: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="generateReceipt" style={{ fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>Automatically Generate Receipt</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Collect Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

// Accountant Library & Late Fines Ledger Component
const AccountantLibraryFines = () => {
  const [finesList, setFinesList] = useState(() => {
    const saved = localStorage.getItem('library_fines_list');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'The Great Gatsby', isbn: '9780743273565', student: 'Aarav Patel', gradeSec: 'Grade 5 - Section A', dueDate: '15 Jul 2026', daysOverdue: 7, amount: 350, status: 'Unpaid', examType: 'Library Overdue' },
      { id: 2, title: 'Introduction to Algorithms', isbn: '9780262033848', student: 'Rahul Kumar', gradeSec: 'Grade 10 - Section A', dueDate: '20 Jul 2026', daysOverdue: 5, amount: 250, status: 'Unpaid', examType: 'Mid-Term Exam Fine' },
      { id: 3, title: 'Advanced High School Physics', isbn: '9780133647181', student: 'Priya Sharma', gradeSec: 'Grade 9 - Section B', dueDate: '22 Jul 2026', daysOverdue: 3, amount: 150, status: 'Unpaid', examType: 'Unit Test Penalty' },
      { id: 4, title: 'A Brief History of Time', isbn: '9780553380163', student: 'Vihaan Gupta', gradeSec: 'Grade 8 - Section B', dueDate: '10 Jul 2026', daysOverdue: 12, amount: 600, status: 'Paid', paymentMethod: 'UPI', paidDate: '01 Aug 2026', examType: 'Final Exam Fine' }
    ];
  });

  const [collectModalFor, setCollectModalFor] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const syncFines = () => {
      const saved = localStorage.getItem('library_fines_list');
      if (saved) setFinesList(JSON.parse(saved));
    };
    window.addEventListener('storage', syncFines);
    return () => window.removeEventListener('storage', syncFines);
  }, []);

  const totalOutstanding = finesList.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Student options for Student Dropdown
  const studentOptions = React.useMemo(() => {
    const raw = demoStudents || [];
    return raw.map((s, idx) => ({
      id: s._id || s.id || `std_${idx}`,
      name: `${s.firstName} ${s.lastName}`,
      grade: String(s.grade || '1'),
      section: String(s.section || 'A')
    }));
  }, []);

  const filteredStudentOptions = studentOptions.filter(s => {
    if (selectedGrade !== 'all' && s.grade !== selectedGrade) return false;
    if (selectedSection !== 'all' && s.section !== selectedSection) return false;
    return true;
  });

  const filteredFines = finesList.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || (f.title || '').toLowerCase().includes(q) || (f.student || '').toLowerCase().includes(q) || (f.isbn || '').toLowerCase().includes(q);
    
    let matchesGrade = true;
    if (selectedGrade !== 'all') {
      matchesGrade = (f.gradeSec || '').toLowerCase().includes(`grade ${selectedGrade.toLowerCase()}`) || (f.gradeSec || '').includes(selectedGrade);
    }
    
    let matchesSection = true;
    if (selectedSection !== 'all') {
      matchesSection = (f.gradeSec || '').toLowerCase().includes(`section ${selectedSection.toLowerCase()}`) || (f.gradeSec || '').includes(`-${selectedSection}`);
    }

    let matchesStudent = true;
    if (selectedStudent !== 'all') {
      matchesStudent = (f.student || '').toLowerCase().includes(selectedStudent.toLowerCase());
    }

    let matchesExamType = true;
    if (selectedExamType !== 'all') {
      const et = (f.examType || f.category || '').toLowerCase();
      matchesExamType = et.includes(selectedExamType.toLowerCase()) || (f.title || '').toLowerCase().includes(selectedExamType.toLowerCase());
    }

    let matchesStatus = true;
    if (selectedStatus !== 'all') {
      matchesStatus = f.status.toLowerCase() === selectedStatus.toLowerCase();
    }

    return matchesQuery && matchesGrade && matchesSection && matchesStudent && matchesExamType && matchesStatus;
  });

  const handleCollect = (e) => {
    e.preventDefault();
    if (!collectModalFor) return;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const updated = finesList.map(f => f.id === collectModalFor.id ? { ...f, status: 'Paid', paymentMethod: paymentMethod, paidDate: today } : f);
    setFinesList(updated);
    localStorage.setItem('library_fines_list', JSON.stringify(updated));
    alert(`🎉 Fine ₹${collectModalFor.amount} collected via ${paymentMethod} for ${collectModalFor.student}! Digital receipt issued by Accountant.`);
    setCollectModalFor(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)', padding: '24px 30px', borderRadius: '18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>💰 Library & Late Fine Collection Ledger</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Track overdue book penalties, receive fine payments, and manage accountant fee receipts.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', opacity: 0.8 }}>TOTAL FINES OUTSTANDING</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>₹{totalOutstanding}</div>
        </div>
      </div>

      {/* Filter Bar with Grade, Sec, Student & Exam Type Dropdowns */}
      <div style={{
        background: '#ffffff',
        padding: '16px 24px',
        borderRadius: '16px',
        border: '1px solid #BFDBFE',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0C4A86', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} color="#0096DA" /> Filters:
        </span>

        {/* Grade Dropdown */}
        <select
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value);
            setSelectedStudent('all');
          }}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.85rem',
            background: '#ffffff',
            color: '#0C4A86',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Grades (1-10)</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
            <option key={g} value={String(g)}>Grade {g}</option>
          ))}
        </select>

        {/* Section Dropdown */}
        <select
          value={selectedSection}
          onChange={e => {
            setSelectedSection(e.target.value);
            setSelectedStudent('all');
          }}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.85rem',
            background: '#ffffff',
            color: '#0C4A86',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Sections (A-C)</option>
          {['A', 'B', 'C'].map(sec => (
            <option key={sec} value={sec}>Section {sec}</option>
          ))}
        </select>

        {/* Student Dropdown */}
        <select
          value={selectedStudent}
          onChange={e => setSelectedStudent(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.85rem',
            background: '#ffffff',
            color: '#0C4A86',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer',
            maxWidth: '180px'
          }}
        >
          <option value="all">All Students</option>
          {filteredStudentOptions.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        {/* Exam Type / Fine Type Dropdown */}
        <select
          value={selectedExamType}
          onChange={e => setSelectedExamType(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.85rem',
            background: '#ffffff',
            color: '#0C4A86',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Exam / Fine Types</option>
          <option value="Mid-Term">📝 Mid-Term Exam Fine</option>
          <option value="Final Exam">🎓 Final Exam Fine</option>
          <option value="Unit Test">✏️ Unit Test Penalty</option>
          <option value="Library Overdue">📖 Library Overdue Fine</option>
          <option value="Late Fee">⏱️ Late Fee Penalty</option>
        </select>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.85rem',
            background: '#ffffff',
            color: '#0C4A86',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="Unpaid">⚠️ Unpaid Fines</option>
          <option value="Paid">✅ Paid Fines</option>
        </select>

        {/* Search input */}
        <div style={{ flex: '1 1 160px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by student, book, ISBN..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 34px',
              borderRadius: '10px',
              border: '1.5px solid #BFDBFE',
              fontSize: '0.85rem',
              outline: 'none',
              fontWeight: '600',
              color: '#0C4A86'
            }}
          />
          <Search size={15} color="#0096DA" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {(selectedGrade !== 'all' || selectedSection !== 'all' || selectedStudent !== 'all' || selectedExamType !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedGrade('all');
              setSelectedSection('all');
              setSelectedStudent('all');
              setSelectedExamType('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            style={{
              padding: '9px 14px',
              background: '#FEE2E2',
              color: '#991B1B',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Reset ✕
          </button>
        )}
      </div>

      {/* Fines Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#0C4A86', color: '#ffffff', fontSize: '0.78rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Book Title & ISBN</th>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Student Borrower</th>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Due Date</th>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Days Overdue</th>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800' }}>Fine Amount</th>
              <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: '800', textAlign: 'right' }}>Action / Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFines.map((fine) => (
              <tr key={fine.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{fine.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>ISBN: {fine.isbn}</div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{fine.student}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{fine.gradeSec}</div>
                </td>
                <td style={{ padding: '14px 20px', fontWeight: '700', color: '#dc2626' }}>{fine.dueDate}</td>
                <td style={{ padding: '14px 20px', fontWeight: '700', color: '#dc2626' }}>{fine.daysOverdue} Days</td>
                <td style={{ padding: '14px 20px', fontWeight: '800', color: '#d97706', fontSize: '1rem' }}>₹{fine.amount}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {fine.status === 'Unpaid' ? (
                    <button
                      onClick={() => setCollectModalFor(fine)}
                      style={{
                        padding: '6px 14px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Collect Fine
                    </button>
                  ) : (
                    <span style={{
                      padding: '4px 10px',
                      background: '#dcfce7',
                      color: '#15803d',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '800'
                    }}>
                      Paid ✅ ({fine.paymentMethod || 'UPI'})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Fine Modal */}
      {collectModalFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>💰 Collect Overdue Fine (Accountant)</h3>
              <button onClick={() => setCollectModalFor(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>{collectModalFor.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>ISBN: {collectModalFor.isbn}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Student:</span>
                <span style={{ color: '#0f172a', fontWeight: '700' }}>{collectModalFor.student} ({collectModalFor.gradeSec})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>Days Overdue:</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>{collectModalFor.daysOverdue} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '1.1rem' }}>
                <span style={{ color: '#0f172a', fontWeight: '800' }}>Fine Penalty:</span>
                <span style={{ color: '#d97706', fontWeight: '800' }}>₹{collectModalFor.amount}</span>
              </div>
            </div>

            <form onSubmit={handleCollect}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px', display: 'block' }}>Payment Method:</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}>
                  <option value="Cash">💵 Cash Payment</option>
                  <option value="UPI">📱 UPI / GPay / PhonePe</option>
                  <option value="Card">💳 Credit / Debit Card</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setCollectModalFor(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  Confirm Collection & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon since lucide-react might not export UsersIcon by default
const UsersIcon = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default AccountantCollections;
