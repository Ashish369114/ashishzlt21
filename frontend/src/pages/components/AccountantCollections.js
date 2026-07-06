import React, { useEffect, useState } from 'react';
import { feeService } from '../../services/api';

const AccountantCollections = () => {
  const [pendingFees, setPendingFees] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [paymentState, setPaymentState] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([feeService.getPending(), feeService.getAll()]);
      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const allFees = Array.isArray(allRes.data) ? allRes.data : [];
      const paid = allFees.filter((fee) => fee.isPaid);

      const today = new Date();
      const todayTotal = paid.reduce((sum, fee) => {
        if (!fee.paymentDate) return sum;
        const paidDate = new Date(fee.paymentDate);
        return paidDate.toDateString() === today.toDateString() ? sum + Number(fee.amount || 0) : sum;
      }, 0);

      const monthTotal = paid.reduce((sum, fee) => {
        if (!fee.paymentDate) return sum;
        const paidDate = new Date(fee.paymentDate);
        return paidDate.getMonth() === today.getMonth() && paidDate.getFullYear() === today.getFullYear()
          ? sum + Number(fee.amount || 0)
          : sum;
      }, 0);

      setPendingFees(pending);
      setPaidFees(paid);
      setStats({ todayTotal, monthTotal, pendingCount: pending.length, pendingAmount: pending.reduce((sum, fee) => sum + Number(fee.amount || 0), 0), totalCollected: paid.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) });
    } catch (err) {
      console.error(err);
      setError('Unable to load collection data at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChange = (feeId, field, value) => {
    setPaymentState((prev) => ({
      ...prev,
      [feeId]: {
        ...prev[feeId],
        [field]: value,
      },
    }));
  };

  const handlePayFee = async (feeId) => {
    const state = paymentState[feeId] || {};
    const amount = Number(state.amount || 0);
    const method = state.method || '';

    if (!method || amount <= 0) {
      alert('Please choose a payment method and enter a valid amount.');
      return;
    }

    try {
      await feeService.pay({
        feeId,
        paymentMethod: method,
        transactionId: `RCPT-${Date.now()}`,
        amount,
        paymentDetails: {
          receiptNumber: `RCPT-${Date.now()}`,
          remark: state.remark || 'Fee collected by accountant',
        },
      });
      handlePaymentStateReset(feeId);
      fetchFees();
      alert('Payment recorded successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to record payment.');
    }
  };

  const handlePaymentStateReset = (feeId) => {
    setPaymentState((prev) => {
      const next = { ...prev };
      delete next[feeId];
      return next;
    });
  };

  const generateReceipt = (fee) => {
    const studentName = fee.student?.firstName ? `${fee.student.firstName} ${fee.student.lastName || ''}` : 'Unknown Student';
    const paymentDate = fee.paymentDate ? new Date(fee.paymentDate).toLocaleString() : 'N/A';
    const receiptText = `Receipt\n-------\nStudent: ${studentName}\nFee ID: ${fee._id}\nAmount Paid: ₹${fee.amount}\nPayment Method: ${fee.paymentMethod || 'N/A'}\nTransaction ID: ${fee.transactionId || 'N/A'}\nPayment Date: ${paymentDate}\nDescription: ${fee.description || 'Fee collection'}\n\nThank you for your payment.`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${fee._id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

  return (
    <div className="card">
      <div className="card-header">
        <h2>💰 Collections Center</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Today's Collection</h3>
              <div className="value">{formatCurrency(stats.todayTotal)}</div>
            </div>
            <div className="stat-card">
              <h3>Monthly Revenue</h3>
              <div className="value">{formatCurrency(stats.monthTotal)}</div>
            </div>
            <div className="stat-card">
              <h3>Pending Fees</h3>
              <div className="value">{stats.pendingCount} / {formatCurrency(stats.pendingAmount)}</div>
            </div>
            <div className="stat-card">
              <h3>Total Collected</h3>
              <div className="value">{formatCurrency(stats.totalCollected)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Pending Fee Collections</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount Due</th>
                    <th>Due Date</th>
                    <th>Payment Method</th>
                    <th>Collect Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFees.length === 0 ? (
                    <tr>
                      <td colSpan="5">No pending fee records found.</td>
                    </tr>
                  ) : (
                    pendingFees.map((fee) => {
                      const state = paymentState[fee._id] || {};
                      return (
                        <tr key={fee._id}>
                          <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                          <td>{formatCurrency(fee.amount)}</td>
                          <td>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</td>
                          <td>
                            <select
                              value={state.method || ''}
                              onChange={(e) => handlePaymentChange(fee._id, 'method', e.target.value)}
                            >
                              <option value="">Select</option>
                              <option value="PhonePe">PhonePe</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Debit Card">Debit Card</option>
                              <option value="Cash">Cash</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <input
                                type="number"
                                min="1"
                                placeholder="Amount"
                                value={state.amount || ''}
                                onChange={(e) => handlePaymentChange(fee._id, 'amount', e.target.value)}
                                style={{ width: '100px' }}
                              />
                              <button className="btn btn-small" onClick={() => handlePayFee(fee._id)}>
                                Collect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3>Recent Receipts</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Paid On</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paidFees.length === 0 ? (
                    <tr>
                      <td colSpan="5">No collection records available.</td>
                    </tr>
                  ) : (
                    paidFees.slice(0, 10).map((fee) => (
                      <tr key={fee._id}>
                        <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                        <td>{formatCurrency(fee.amount)}</td>
                        <td>{fee.paymentMethod || '-'}</td>
                        <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <button className="btn btn-small" onClick={() => generateReceipt(fee)}>
                            Generate Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountantCollections;
