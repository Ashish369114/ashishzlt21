import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const AccountantPendingFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentState, setPaymentState] = useState({});

  const getFeeSummary = (fee) => {
    const amount = Number(fee?.amount || 0);
    const paidAmount = Number(fee?.paidAmount || 0);
    const balance = Math.max(amount - paidAmount, 0);
    return { amount, paidAmount, balance };
  };

  useEffect(() => {
    const fetchPendingFees = async () => {
      try {
        setLoading(true);
        const response = await feeService.getPending();
        setFees(response.data);
      } catch (err) {
        setError('Failed to load pending fees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFees();
  }, []);

  const setMethodForFee = (feeId, method) => {
    setPaymentState((prev) => ({
      ...prev,
      [feeId]: {
        selectedPaymentMethod: method,
        paymentDetails: {},
      },
    }));
  };

  const updatePaymentField = (feeId, field, value) => {
    setPaymentState((prev) => ({
      ...prev,
      [feeId]: {
        ...prev[feeId],
        paymentDetails: {
          ...(prev[feeId]?.paymentDetails || {}),
          [field]: value,
        },
      },
    }));
  };

  const handlePayFee = async (feeId) => {
    const feePayment = paymentState[feeId] || {};
    const selectedPaymentMethod = feePayment.selectedPaymentMethod || '';
    const paymentDetails = feePayment.paymentDetails || {};

    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const payload = {
      feeId,
      paymentMethod: selectedPaymentMethod,
      transactionId: `TXN-${selectedPaymentMethod}-${Date.now()}`,
      paymentDetails: {},
    };

    if (selectedPaymentMethod === 'PhonePe') {
      payload.paymentDetails = {
        phonePeId: paymentDetails.phonePeId || 'PHONEPE-12345',
        additionalInfo: paymentDetails.phonePeNote || 'PhonePe test transaction',
      };
    } else if (selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') {
      payload.paymentDetails = {
        cardHolderName: paymentDetails.cardHolderName || 'Test Cardholder',
        cardLast4: paymentDetails.cardLast4 || '1111',
        cardNetwork: paymentDetails.cardNetwork || 'Visa',
        additionalInfo: paymentDetails.cardNotes || 'Card payment authorization',
      };
    } else if (selectedPaymentMethod === 'Cheque') {
      payload.paymentDetails = {
        chequeNumber: paymentDetails.chequeNumber || 'CHK000123',
        chequeBank: paymentDetails.chequeBank || 'Test Bank',
        chequeDate: paymentDetails.chequeDate || new Date().toISOString().slice(0, 10),
        chequeStatus: paymentDetails.chequeStatus || 'Pending',
      };
    } else if (selectedPaymentMethod === 'Cash') {
      payload.paymentDetails = {
        cashReceiptId: paymentDetails.cashReceiptId || `RCPT-${Date.now()}`,
        cashCounter: paymentDetails.cashCounter || 'Front Desk',
        additionalInfo: paymentDetails.cashNote || 'Cash collected in person',
      };
    }

    try {
      await feeService.pay(payload);
      setPaymentState((prev) => {
        const next = { ...prev };
        delete next[feeId];
        return next;
      });
      const response = await feeService.getPending();
      setFees(response.data);
      alert('Payment processed successfully');
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>⏳ Pending Fees</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="5">No pending fees found.</td>
                  </tr>
                ) : (
                  fees.map((fee) => {
                    const summary = getFeeSummary(fee);
                    return (
                    <tr key={fee._id}>
                      <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                      <td>
                        <div>Total: ₹{summary.amount}</div>
                        <div>Paid: ₹{summary.paidAmount}</div>
                        <div>Balance: ₹{summary.balance}</div>
                      </td>
                      <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td>{fee.remarks || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(() => {
                            const rowState = paymentState[fee._id] || {};
                            const selectedPaymentMethod = rowState.selectedPaymentMethod || '';
                            const paymentDetails = rowState.paymentDetails || {};
                            return (
                              <>
                                <select
                                  value={selectedPaymentMethod}
                                  onChange={(e) => setMethodForFee(fee._id, e.target.value)}
                                  style={{ padding: '10px', borderRadius: '6px', width: '100%' }}
                                >
                                  <option value="">Select payment method</option>
                                  <option value="PhonePe">PhonePe</option>
                                  <option value="Credit Card">Credit Card</option>
                                  <option value="Debit Card">Debit Card</option>
                                  <option value="Cash">Cash</option>
                                  <option value="Cheque">Cheque</option>
                                </select>

                                {selectedPaymentMethod === 'PhonePe' && (
                                  <div className="form-row full" style={{ gap: '10px' }}>
                                    <div className="form-group">
                                      <label>PhonePe ID</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.phonePeId || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'phonePeId', e.target.value)}
                                        placeholder="PhonePe UPI or ID"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Transaction Note</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.phonePeNote || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'phonePeNote', e.target.value)}
                                        placeholder="Optional note"
                                      />
                                    </div>
                                  </div>
                                )}

                                {(selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') && (
                                  <div className="form-row full" style={{ gap: '10px' }}>
                                    <div className="form-group">
                                      <label>Card Holder</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.cardHolderName || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'cardHolderName', e.target.value)}
                                        placeholder="John Doe"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Card Last 4</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.cardLast4 || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'cardLast4', e.target.value)}
                                        placeholder="1111"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Card Network</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.cardNetwork || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'cardNetwork', e.target.value)}
                                        placeholder="Visa / MasterCard"
                                      />
                                    </div>
                                  </div>
                                )}

                                {selectedPaymentMethod === 'Cheque' && (
                                  <div className="form-row full" style={{ gap: '10px' }}>
                                    <div className="form-group">
                                      <label>Cheque Number</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.chequeNumber || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'chequeNumber', e.target.value)}
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Bank</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.chequeBank || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'chequeBank', e.target.value)}
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Cheque Date</label>
                                      <input
                                        type="date"
                                        value={paymentDetails.chequeDate || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'chequeDate', e.target.value)}
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Status</label>
                                      <select
                                        value={paymentDetails.chequeStatus || 'Pending'}
                                        onChange={(e) => updatePaymentField(fee._id, 'chequeStatus', e.target.value)}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Cleared">Cleared</option>
                                        <option value="Bounced">Bounced</option>
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {selectedPaymentMethod === 'Cash' && (
                                  <div className="form-row full" style={{ gap: '10px' }}>
                                    <div className="form-group">
                                      <label>Receipt ID</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.cashReceiptId || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'cashReceiptId', e.target.value)}
                                        placeholder="RCPT-001"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Cash Counter</label>
                                      <input
                                        type="text"
                                        value={paymentDetails.cashCounter || ''}
                                        onChange={(e) => updatePaymentField(fee._id, 'cashCounter', e.target.value)}
                                        placeholder="Front Desk"
                                      />
                                    </div>
                                  </div>
                                )}

                                <button className="btn btn-small" onClick={() => handlePayFee(fee._id)}>
                                  Pay
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountantPendingFees;
