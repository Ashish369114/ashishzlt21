import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';
import OnlineFeePaymentModal from '../dashboards/components/OnlineFeePaymentModal';

const ParentFees = ({ isPaymentMode = false }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);

  useEffect(() => {
    fetchFees();
  }, [isPaymentMode]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeService.getByParent();
      const fetchedFees = response.data || [];
      setFees(fetchedFees);
      if (isPaymentMode && fetchedFees.length > 0) {
        const pending = fetchedFees.find(f => !f.isPaid && (Number(f.amount || 0) - Number(f.paidAmount || 0)) > 0);
        if (pending) {
          setSelectedFeeForPayment(pending);
        }
      }
    } catch (err) {
      setError('Failed to fetch fees');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{isPaymentMode ? '💳 Online Fee Payments Portal' : '💰 Student Fee Details & Ledger'}</h2>
        {isPaymentMode && (
          <span style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            🔒 Instant Online Payment Gateway Active
          </span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Fee Items</h3>
          <div className="value">{fees.length}</div>
        </div>
        <div className="stat-card">
          <h3>Paid Amount</h3>
          <div className="value" style={{ color: '#059669' }}>${calculateTotalPaid()}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <div className="value" style={{ color: '#dc2626' }}>${calculateTotalPending()}</div>
        </div>
        <div className="stat-card">
          <h3>Total Fee Amount</h3>
          <div className="value">${calculateTotalFeeAmount()}</div>
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
                <th>Fee Details</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const paidAmount = Number(fee.paidAmount || 0);
                const pendingAmount = Math.max(Number(fee.amount || 0) - paidAmount, 0);
                return (
                  <tr key={fee._id || fee.id}>
                    <td><strong>{fee.student?.firstName || 'Student'} {fee.student?.lastName || ''}</strong></td>
                    <td>{fee.title || fee.feeType || 'Tuition Fee'}</td>
                    <td>${fee.amount}</td>
                    <td>${paidAmount}</td>
                    <td>${pendingAmount}</td>
                    <td>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        backgroundColor: fee.isPaid || pendingAmount === 0 ? '#d1fae5' : '#fee2e2',
                        color: fee.isPaid || pendingAmount === 0 ? '#065f46' : '#991b1b',
                      }}>
                        {fee.isPaid || pendingAmount === 0 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!fee.isPaid && pendingAmount > 0 ? (
                        <button
                          className="btn btn-small"
                          onClick={() => setSelectedFeeForPayment(fee)}
                          style={{ background: '#10b981', color: 'white', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Pay Online Now
                        </button>
                      ) : (
                        <a
                          href={fee.receiptUrl || `/api/payments/receipt/${fee.transactionId || 'TXN1001'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-small"
                          style={{ background: '#2563eb', color: 'white', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}
                        >
                          Download Receipt PDF
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedFeeForPayment && (
        <OnlineFeePaymentModal
          isOpen={!!selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          feeItem={selectedFeeForPayment}
          studentData={selectedFeeForPayment?.student}
          onPaymentSuccess={() => {
            fetchFees();
          }}
        />
      )}
    </div>
  );
};

export default ParentFees;
