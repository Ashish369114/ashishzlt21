import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

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
    const content = `Receipt\n==========\nStudent: ${fee.student?.firstName || '-'} ${fee.student?.lastName || '-'}\nAmount: ₹${fee.amount}\nStatus: ${fee.isPaid ? 'Paid' : 'Pending'}\nMethod: ${fee.paymentMethod || '-'}\nTransaction: ${fee.transactionId || '-'}\nDate: ${fee.paymentDate ? new Date(fee.paymentDate).toLocaleString() : '-'}\nDetails: ${JSON.stringify(fee.paymentDetails || {}, null, 2)}`;
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
          <div className="value">₹{calculateTotalPaid()}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <div className="value">₹{calculateTotalPending()}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fee Amount</h3>
          <div className="value">₹{calculateTotalFeeAmount()}</div>
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
                    <td>₹{fee.amount}</td>
                    <td>{fee.installments || 3}</td>
                    <td>₹{paidAmount}</td>
                    <td>₹{pendingAmount}</td>
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
                        <button
                          className="btn btn-small"
                          onClick={() => handlePayFee(fee._id)}
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          Pay
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-small"
                        onClick={() => downloadReceipt(fee)}
                        style={{ background: '#2563eb', color: 'white' }}
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
    </div>
  );
};

export default ParentFees;
