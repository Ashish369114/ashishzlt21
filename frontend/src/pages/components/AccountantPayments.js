import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const AccountantPayments = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaidFees = async () => {
      try {
        setLoading(true);
        const response = await feeService.getAll();
        const paidFees = response.data.filter((fee) => fee.isPaid);
        setFees(paidFees);

        const totalCollected = paidFees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
        const methodCounts = paidFees.reduce((acc, fee) => {
          const method = fee.paymentMethod || 'Unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {});
        const lastPayment = paidFees.reduce((latest, fee) => {
          if (!fee.paymentDate) return latest;
          const date = new Date(fee.paymentDate);
          return !latest || date > new Date(latest.paymentDate) ? fee : latest;
        }, null);

        setStats({
          totalPayments: paidFees.length,
          totalCollected,
          methodCounts,
          lastPaymentMethod: lastPayment?.paymentMethod || 'N/A',
          lastPaymentDate: lastPayment?.paymentDate ? new Date(lastPayment.paymentDate).toLocaleDateString() : 'N/A',
        });
      } catch (err) {
        setError('Failed to load payment records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidFees();
  }, []);

  const renderDetails = (details) => {
    if (!details) return '—';

    const entries = [];
    if (details.phonePeId) entries.push(`PhonePe ID: ${details.phonePeId}`);
    if (details.cardHolderName) entries.push(`Card Holder: ${details.cardHolderName}`);
    if (details.cardLast4) entries.push(`Last 4: ${details.cardLast4}`);
    if (details.cardNetwork) entries.push(`Network: ${details.cardNetwork}`);
    if (details.chequeNumber) entries.push(`Cheque: ${details.chequeNumber}`);
    if (details.chequeBank) entries.push(`Bank: ${details.chequeBank}`);
    if (details.chequeDate) entries.push(`Date: ${new Date(details.chequeDate).toLocaleDateString()}`);
    if (details.chequeStatus) entries.push(`Status: ${details.chequeStatus}`);
    if (details.cashReceiptId) entries.push(`Receipt: ${details.cashReceiptId}`);
    if (details.cashCounter) entries.push(`Counter: ${details.cashCounter}`);
    if (details.additionalInfo) entries.push(details.additionalInfo);
    return entries.length ? entries.join(' · ') : '—';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💳 Payment History</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {stats && (
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <h3>Total Payments</h3>
                <div className="value">{stats.totalPayments}</div>
              </div>
              <div className="stat-card">
                <h3>Total Collected</h3>
                <div className="value">{formatCurrency(stats.totalCollected)}</div>
              </div>
              <div className="stat-card">
                <h3>Last Payment</h3>
                <div className="value">{stats.lastPaymentDate}</div>
              </div>
              <div className="stat-card">
                <h3>Last Method</h3>
                <div className="value">{stats.lastPaymentMethod}</div>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="6">No payment records available.</td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                      <td>{formatCurrency(fee.amount)}</td>
                      <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}</td>
                      <td>{fee.paymentMethod || '-'}</td>
                      <td>{fee.transactionId || '-'}</td>
                      <td>{renderDetails(fee.paymentDetails)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountantPayments;
