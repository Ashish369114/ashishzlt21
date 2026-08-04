import React, { useEffect, useState } from 'react';
import { feeService } from '../../services/api';
import { 
  IndianRupee, CreditCard, TrendingUp, AlertCircle, 
  Wallet, FileText, Send, CheckCircle2, FileSpreadsheet, X, Gift, ShieldAlert
} from 'lucide-react';

const AccountantCollections = () => {
  const [pendingFees, setPendingFees] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

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

      const defaultPendingFeesList = [
        { _id: 'pf_1', studentName: 'Aarav Sharma', student: { firstName: 'Aarav', lastName: 'Sharma', class: { grade: '1', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_2', studentName: 'Meera Mishra', student: { firstName: 'Meera', lastName: 'Mishra', class: { grade: '1', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_3', studentName: 'Dev Choudhury', student: { firstName: 'Dev', lastName: 'Choudhury', class: { grade: '1', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_4', studentName: 'Kavya Sharma', student: { firstName: 'Kavya', lastName: 'Sharma', class: { grade: '1', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_5', studentName: 'Vivaan Verma', student: { firstName: 'Vivaan', lastName: 'Verma', class: { grade: '1', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_6', studentName: 'Anushka Gupta', student: { firstName: 'Anushka', lastName: 'Gupta', class: { grade: '1', section: 'B' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_7', studentName: 'Ananya Verma', student: { firstName: 'Ananya', lastName: 'Verma', class: { grade: '2', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_8', studentName: 'Vihaan Patel', student: { firstName: 'Vihaan', lastName: 'Patel', class: { grade: '3', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_9', studentName: 'Ishaan Gupta', student: { firstName: 'Ishaan', lastName: 'Gupta', class: { grade: '4', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47200, paidAmount: 18880, dueDate: '2026-08-15' },
        { _id: 'pf_10', studentName: 'Diya Singh', student: { firstName: 'Diya', lastName: 'Singh', class: { grade: '6', section: 'B' } }, description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 19040, dueDate: '2026-08-15' },
        { _id: 'pf_11', studentName: 'Rohan Mehta', student: { firstName: 'Rohan', lastName: 'Mehta', class: { grade: '5', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_12', studentName: 'Sanya Kapoor', student: { firstName: 'Sanya', lastName: 'Kapoor', class: { grade: '4', section: 'B' } }, description: 'Quarterly Tuition Fees', amount: 47600, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_13', studentName: 'Aditya Kumar', student: { firstName: 'Aditya', lastName: 'Kumar', class: { grade: '3', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 48000, paidAmount: 19200, dueDate: '2026-08-15' },
        { _id: 'pf_14', studentName: 'Karan Patel', student: { firstName: 'Karan', lastName: 'Patel', class: { grade: '10', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 50000, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_15', studentName: 'Shreya Iyer', student: { firstName: 'Shreya', lastName: 'Iyer', class: { grade: '7', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 45000, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_16', studentName: 'Pooja Nair', student: { firstName: 'Pooja', lastName: 'Nair', class: { grade: '8', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 46000, paidAmount: 0, dueDate: '2026-08-15' },
        { _id: 'pf_17', studentName: 'Simran Singh', student: { firstName: 'Simran', lastName: 'Singh', class: { grade: '9', section: 'A' } }, description: 'Quarterly Tuition Fees', amount: 47000, paidAmount: 0, dueDate: '2026-08-15' }
      ];

      const pendingFeesToUse = pending.length > 0 ? pending : defaultPendingFeesList;

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

  const openPaymentModal = (fee) => {
    const summary = getFeeSummary(fee);
    setSelectedFee(fee);
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
      
      if (paymentData.generateReceipt) {
        generateReceipt({...selectedFee, paidAmount: (Number(selectedFee.paidAmount || 0) + amount), paymentMethod: paymentData.method});
      }

      setIsModalOpen(false);
      fetchFees();
      alert('Payment recorded successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to record payment.');
    }
  };

  const generateReceipt = (fee) => {
    const studentName = fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}` : 'Unknown Student';
    const summary = getFeeSummary(fee);
    const receiptText = `Receipt\n-------\nStudent: ${studentName}\nFee ID: ${fee._id}\nTotal Amount: ${formatCurrency(summary.amount)}\nPaid Amount: ${formatCurrency(summary.paidAmount)}\nBalance: ${formatCurrency(summary.balance)}\nPayment Method: ${fee.paymentMethod || 'N/A'}\nDate: ${new Date().toLocaleString()}\n\nThank you!`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${fee._id}.txt`;
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

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={28} color="#3b82f6" /> Fee Collection Overview
        </h2>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={20} /> {error}</div>}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ ...kpiCardStyle, borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Today's Collection <IndianRupee size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.todayTotal)}</div>
          <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> {stats.todayCount} payments received
          </div>
        </div>

        <div style={{ ...kpiCardStyle, borderTop: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Monthly Collection <TrendingUp size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.monthTotal)}</div>
          <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((stats.monthTotal / stats.monthlyTarget) * 100, 100)}%`, background: '#8b5cf6', height: '100%' }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right', marginTop: '2px' }}>Target: {formatCurrency(stats.monthlyTarget)}</div>
        </div>

        <div style={{ ...kpiCardStyle, borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Fees Pending <AlertCircle size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.pendingAmount)}</div>
          <div style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UsersIcon size={14} /> {stats.pendingCount} students with dues
          </div>
        </div>

        <div style={{ ...kpiCardStyle, borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Total Collected (Year) <FileSpreadsheet size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.totalCollectedAmount)}</div>
          <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <TrendingUp size={14} /> {stats.collectionPercentage}% collected overall
          </div>
        </div>

        <div style={{ ...kpiCardStyle, borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Scholarships / Discounts <Gift size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.discountProvided)}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} color="#f59e0b" /> {stats.discountBeneficiaries} beneficiaries
          </div>
        </div>

        <div style={{ ...kpiCardStyle, borderTop: '4px solid #64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Caution Deposits <ShieldAlert size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(stats.cautionDeposits)}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} color="#ef4444" /> {stats.refundsPending} refunds pending
          </div>
        </div>
      </div>

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
                    const fallbackClasses = ['Grade 10-A', 'Grade 9-B', 'Grade 8-A', 'Grade 7-A', 'Grade 6-B', 'Grade 5-A', 'Grade 4-B', 'Grade 3-A'];
                    const studentClass = fee.student?.class?.grade ? `Grade ${fee.student.class.grade} ${fee.student.class.section || ''}` : fallbackClasses[idx % fallbackClasses.length];
                    
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
                  .map((fee, idx) => {
                    const fallbackNames = ['Aarav Sharma', 'Ananya Verma', 'Vihaan Patel', 'Ishaan Gupta', 'Diya Singh', 'Rohan Mehta', 'Sanya Kapoor', 'Aditya Kumar'];
                    return fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}` : fee.studentName || fallbackNames[idx % fallbackNames.length];
                  })
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
                const filteredList = pendingFees.filter((fee, idx) => {
                  const fallbackNames = ['Aarav Sharma', 'Ananya Verma', 'Vihaan Patel', 'Ishaan Gupta', 'Diya Singh', 'Rohan Mehta', 'Sanya Kapoor', 'Aditya Kumar'];
                  const fallbackClasses = ['Grade 10-A', 'Grade 9-B', 'Grade 8-A', 'Grade 7-A', 'Grade 6-B', 'Grade 5-A', 'Grade 4-B', 'Grade 3-A'];
                  const studentName = fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}` : fallbackNames[idx % fallbackNames.length];
                  const studentClass = fee.student?.class?.grade ? `Grade ${fee.student.class.grade} ${fee.student.class.section || ''}` : fallbackClasses[idx % fallbackClasses.length];
                  
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
                  const fallbackNames = ['Aarav Sharma', 'Ananya Verma', 'Vihaan Patel', 'Ishaan Gupta', 'Diya Singh', 'Rohan Mehta', 'Sanya Kapoor', 'Aditya Kumar'];
                  const fallbackClasses = ['Grade 10-A', 'Grade 9-B', 'Grade 8-A', 'Grade 7-A', 'Grade 6-B', 'Grade 5-A', 'Grade 4-B', 'Grade 3-A'];
                  const studentName = fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}` : fallbackNames[idx % fallbackNames.length];
                  const studentClass = fee.student?.class?.grade ? `Grade ${fee.student.class.grade} ${fee.student.class.section || ''}` : fallbackClasses[idx % fallbackClasses.length];
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
                          onClick={() => openPaymentModal(fee)}
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
        <button style={{ flex: '1 1 auto', background: '#3b82f6', color: '#fff', border: 'none', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
          + Collect Fee
        </button>
        <button style={{ flex: '1 1 auto', background: '#fff', color: '#3b82f6', border: '2px solid #e2e8f0', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s', '&:hover': { borderColor: '#3b82f6' } }}>
          <FileText size={20} /> Generate Receipt
        </button>
        <button style={{ flex: '1 1 auto', background: '#fff', color: '#ef4444', border: '2px solid #e2e8f0', padding: '16px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s', '&:hover': { borderColor: '#ef4444' } }}>
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
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{selectedFee.student?.firstName} {selectedFee.student?.lastName}</div>
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
