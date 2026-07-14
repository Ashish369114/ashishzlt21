import React, { useState, useEffect } from 'react';
import { feeService, concessionService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const paymentMethods = [
  'PhonePe',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Cheque',
  'Cash',
];

const ParentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});

  const [requestModalFee, setRequestModalFee] = useState(null);
  const [concessionAmount, setConcessionAmount] = useState('');
  const [concessionReason, setConcessionReason] = useState('');
  const [requestSaving, setRequestSaving] = useState(false);
  const [requestError, setRequestError] = useState('');

  const handleOpenRequestModal = (fee) => {
    setRequestModalFee(fee);
    setConcessionAmount('');
    setConcessionReason('');
    setRequestError('');
  };

  const handleCloseRequestModal = () => {
    setRequestModalFee(null);
  };

  const handleSubmitConcessionRequest = async (e) => {
    e.preventDefault();
    if (!concessionAmount || !concessionReason) {
      setRequestError('Please fill in all fields.');
      return;
    }
    const amount = Number(concessionAmount);
    if (amount <= 0 || amount > requestModalFee.amount) {
      setRequestError(`Concession amount must be between ₹1 and ${formatCurrency(requestModalFee.amount)}.`);
      return;
    }
    setRequestSaving(true);
    setRequestError('');
    try {
      await concessionService.create({
        studentId: requestModalFee.student?._id || requestModalFee.student,
        feeId: requestModalFee._id,
        concessionAmount: amount,
        reason: concessionReason,
      });
      alert('Concession request submitted successfully!');
      handleCloseRequestModal();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setRequestSaving(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeService.getByParent();
      setFees(response.data);
    } catch (err) {
      setError('Failed to fetch fees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChange = (feeId, field, value) => {
    setPaymentInputs((prev) => ({
      ...prev,
      [feeId]: {
        ...prev[feeId],
        [field]: value,
      },
    }));
  };

  const buildPaymentDetails = (feeId) => {
    const input = paymentInputs[feeId] || {};
    const method = input.paymentMethod;
    const details = { additionalInfo: input.additionalInfo || '' };

    switch (method) {
      case 'PhonePe':
        details.phonePeId = input.phonePeId || '';
        break;
      case 'Credit Card':
      case 'Debit Card':
        details.cardHolderName = input.cardHolderName || '';
        details.cardLast4 = input.cardLast4 || input.cardNumber?.slice(-4) || '';
        details.cardNetwork = input.cardNetwork || '';
        break;
      case 'UPI':
        details.upiId = input.upiId || '';
        break;
      case 'Net Banking':
        details.netBankingRef = input.netBankingRef || '';
        details.bankName = input.bankName || '';
        break;
      case 'Cheque':
        details.chequeNumber = input.chequeNumber || '';
        details.chequeBank = input.chequeBank || '';
        details.chequeDate = input.chequeDate || new Date().toISOString().slice(0, 10);
        break;
      case 'Cash':
        details.cashReceiptId = input.cashReceiptId || `CASH-${Date.now()}`;
        details.cashCounter = input.cashCounter || 'Main Desk';
        break;
      default:
        break;
    }

    return details;
  };

  const handlePayFee = async (feeId) => {
    const input = paymentInputs[feeId] || {};
    const method = input.paymentMethod;

    if (!method) {
      alert('Please select a payment method');
      return;
    }

    try {
      await feeService.pay({
        feeId,
        paymentMethod: method,
        transactionId: input.transactionId || `TXN-${Date.now()}`,
        paymentDetails: buildPaymentDetails(feeId),
      });
      setPaymentInputs((prev) => ({
        ...prev,
        [feeId]: {
          ...prev[feeId],
          paymentMethod: '',
        },
      }));
      fetchFees();
      alert('Payment processed successfully!');
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  const downloadReceipt = (fee) => {
    const content = `Receipt\n==========\nStudent: ${fee.student?.firstName || '-'} ${fee.student?.lastName || '-'}\nAmount: ${formatCurrency(fee.amount)}\nStatus: ${fee.isPaid ? 'Paid' : 'Pending'}\nMethod: ${fee.paymentMethod || '-'}\nTransaction: ${fee.transactionId || '-'}\nDate: ${fee.paymentDate ? new Date(fee.paymentDate).toLocaleString() : '-'}\nDetails: ${JSON.stringify(fee.paymentDetails || {}, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt-${fee._id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const calculateTotalPaid = () => {
    return fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  };

  const calculateTotalPending = () => {
    return fees.reduce(
      (sum, f) => sum + Math.max(Number(f.amount || 0) - Number(f.paidAmount || 0), 0),
      0,
    );
  };

  const calculateTotalFeeAmount = () => {
    return fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💰 Student Fees</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Fees</h3>
          <div className="value">{fees.length}</div>
        </div>
        <div className="stat-card">
          <h3>Paid Amount</h3>
          <div className="value">{formatCurrency(calculateTotalPaid())}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <div className="value">{formatCurrency(calculateTotalPending())}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fee Amount</h3>
          <div className="value">{formatCurrency(calculateTotalFeeAmount())}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Installments</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const paidAmount = Number(fee.paidAmount || 0);
                const pendingAmount = Math.max(Number(fee.amount || 0) - paidAmount, 0);
                return (
                  <tr key={fee._id}>
                    <td><strong>{fee.student?.firstName} {fee.student?.lastName}</strong></td>
                    <td>{formatCurrency(fee.amount)}</td>
                    <td>{fee.installments || 3}</td>
                    <td>{formatCurrency(paidAmount)}</td>
                    <td>{formatCurrency(pendingAmount)}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: fee.isPaid ? '#d1fae5' : '#fee2e2',
                      color: fee.isPaid ? '#065f46' : '#991b1b',
                    }}>
                      {fee.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{fee.paymentMethod || '-'}</td>
                  <td>
                    {!fee.isPaid ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select
                          value={paymentInputs[fee._id]?.paymentMethod || ''}
                          onChange={(e) => handlePaymentChange(fee._id, 'paymentMethod', e.target.value)}
                          style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ddd' }}
                        >
                          <option value="">Select Method</option>
                          {paymentMethods.map((method) => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-small"
                            onClick={() => handlePayFee(fee._id)}
                            style={{ background: '#10b981', color: 'white', flex: 1 }}
                          >
                            Pay
                          </button>
                          <button
                            className="btn btn-small"
                            onClick={() => handleOpenRequestModal(fee)}
                            style={{ background: '#eab308', color: 'white', flex: 1, border: 'none' }}
                          >
                            🎁 Concession
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-small"
                        onClick={() => downloadReceipt(fee)}
                        style={{ background: '#7c3aed', color: 'white' }}
                      >
                        Download Receipt
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

      {requestModalFee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.22)', color: '#374151', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>🎁 Request Fee Concession</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 20px', lineHeight: 1.4 }}>
              Submit a request for <strong>{requestModalFee.description || 'Tuition Fee'}</strong> (Outstanding: {formatCurrency(requestModalFee.amount)}). The Principal will review your request.
            </p>

            {requestError && (
              <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontWeight: 600, fontSize: '0.83rem', textAlign: 'left' }}>
                {requestError}
              </div>
            )}

            <form onSubmit={handleSubmitConcessionRequest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '4px', color: '#374151', textAlign: 'left' }}>
                  Requested Concession Amount (₹) *
                </label>
                <input
                  type="number"
                  value={concessionAmount}
                  min={1}
                  max={requestModalFee.amount}
                  onChange={(e) => setConcessionAmount(e.target.value)}
                  placeholder={`Max: ${formatCurrency(requestModalFee.amount)}`}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.83rem', marginBottom: '4px', color: '#374151', textAlign: 'left' }}>
                  Reason for Request *
                </label>
                <textarea
                  rows={3}
                  value={concessionReason}
                  onChange={(e) => setConcessionReason(e.target.value)}
                  placeholder="Explain why you are requesting a concession (e.g. academic excellence, financial hardship...)"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseRequestModal}
                  style={{ padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestSaving}
                  style={{
                    padding: '9px 22px',
                    background: requestSaving ? '#cbd5e1' : '#15803d',
                    color: requestSaving ? '#94a3b8' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: requestSaving ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.86rem'
                  }}
                >
                  {requestSaving ? '⏳ Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentFees;
