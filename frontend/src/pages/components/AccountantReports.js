import React, { useState, useEffect } from 'react';
import { feeService, expenseService } from '../../services/api';

const FeatureLockBanner = ({ featureName, requiredPlan = 'Platinum' }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(99,102,241,0.08))',
    border: '1.5px solid rgba(6,182,212,0.3)',
    borderRadius: '12px',
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '20px',
  }}>
    <span style={{ fontSize: '1.6rem' }}>🔒</span>
    <div>
      <strong style={{ color: '#0e7490' }}>{featureName} — {requiredPlan} Plan Feature</strong>
      <p style={{ margin: '4px 0 0', color: '#155e75', fontSize: '0.88rem' }}>
        This feature is available in the <strong>{requiredPlan}</strong> plan and above.
        <a href="/" style={{ color: '#7c3aed', marginLeft: '6px', fontWeight: '600' }}>Upgrade your plan →</a>
      </p>
    </div>
  </div>
);

const AccountantReports = ({ isPremiumFeatureAllowed }) => {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [feeResponse, expenseResponse] = await Promise.all([feeService.getAll(), expenseService.getAll()]);
        const allFees = Array.isArray(feeResponse?.data) ? feeResponse.data : [];
        const allExpenses = Array.isArray(expenseResponse?.data) ? expenseResponse.data : [];
        const pending = allFees.filter((fee) => !fee.isPaid);
        const paid = allFees.filter((fee) => fee.isPaid);
        setExpenses(allExpenses);
        setPaidFees(paid);

        const today = new Date();
        const todaysCollection = paid.reduce((sum, fee) => {
          if (!fee.paymentDate) return sum;
          const date = new Date(fee.paymentDate);
          return date.toDateString() === today.toDateString() ? sum + Number(fee.amount || 0) : sum;
        }, 0);

        const monthlyCollection = paid.reduce((sum, fee) => {
          if (!fee.paymentDate) return sum;
          const date = new Date(fee.paymentDate);
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
            ? sum + Number(fee.amount || 0)
            : sum;
        }, 0);

        setStats({
          totalFees: allFees.length,
          totalAmount: allFees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          pendingCount: pending.length,
          pendingAmount: pending.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          paidCount: paid.length,
          paidAmount: paid.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          totalExpenses: allExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
          expenseCount: allExpenses.length,
          netIncome: paid.reduce((sum, fee) => sum + (fee.amount || 0), 0) - allExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
          todaysCollection,
          monthlyCollection,
        });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          setError('Failed to load financial reports');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📊 Accountant Reports</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Fees</h3>
              <div className="value">{stats?.totalFees ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Total Amount</h3>
              <div className="value">₹{stats?.totalAmount ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="value">{stats?.pendingCount ?? 0} / ₹{stats?.pendingAmount ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Paid</h3>
              <div className="value">{stats?.paidCount ?? 0} / ₹{stats?.paidAmount ?? 0}</div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <div className="value">₹{stats?.totalExpenses ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Expense Count</h3>
              <div className="value">{stats?.expenseCount ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Net Income</h3>
              <div className="value">₹{stats?.netIncome ?? 0}</div>
            </div>
            <div className="stat-card">
              <h3>Today's Collection</h3>
              <div className="value">₹{stats?.todaysCollection ?? 0}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3>Expense Breakdown</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="4">No expense records available.</td>
                    </tr>
                  ) : (
                    expenses.slice(0, 8).map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.title}</td>
                        <td>{expense.category || 'General'}</td>
                        <td>₹{expense.amount}</td>
                        <td>{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advanced Analytics — Platinum+ only */}
          {isPremiumFeatureAllowed && !isPremiumFeatureAllowed('advanced_reports') && (
            <FeatureLockBanner featureName="Advanced Analytics & Revenue Trends" requiredPlan="Platinum" />
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3>Recent Collections</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paidFees.length === 0 ? (
                    <tr>
                      <td colSpan="4">No paid fee records available.</td>
                    </tr>
                  ) : (
                    paidFees.slice(0, 8).map((fee) => (
                      <tr key={fee._id}>
                        <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                        <td>₹{fee.amount}</td>
                        <td>{fee.paymentMethod || '-'}</td>
                        <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}</td>
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

export default AccountantReports;
