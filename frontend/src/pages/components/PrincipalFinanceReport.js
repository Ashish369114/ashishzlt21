import React, { useState, useEffect } from 'react';
import { feeService, studentService } from '../../services/api';

const PrincipalFinanceReport = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('collection');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await feeService.getAll();
      setFees(response.data || []);
    } catch (err) {
      setError('Failed to load fee data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;
    const paidCount = fees.filter(f => f.isPaid).length;
    const pendingCount = fees.filter(f => !f.isPaid).length;

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalFees: fees.length,
      paidCount,
      pendingCount,
      collectionPercentage: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0,
    };
  };

  const stats = calculateStats();

  const getPendingFeesByStudent = () => {
    const pending = fees.filter(f => !f.isPaid);
    return pending
      .map(f => ({
        student: f.student?.userId?.firstName + ' ' + f.student?.userId?.lastName || 'Unknown',
        amount: f.amount,
        dueDate: f.dueDate,
        daysOverdue: Math.floor((new Date() - new Date(f.dueDate)) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  const getMonthlyCollection = () => {
    const months = {};
    fees.forEach(fee => {
      if (fee.paymentDate) {
        const month = new Date(fee.paymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!months[month]) months[month] = 0;
        months[month] += fee.paidAmount || 0;
      }
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  };

  const pendingFeesByStudent = getPendingFeesByStudent();
  const monthlyCollection = getMonthlyCollection();

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <div className="value">₹{(stats.totalAmount / 100000).toFixed(2)}L</div>
        </div>
        <div className="stat-card">
          <h3>Collected</h3>
          <div className="value" style={{ color: '#10b981' }}>₹{(stats.paidAmount / 100000).toFixed(2)}L</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value" style={{ color: '#ef4444' }}>₹{(stats.pendingAmount / 100000).toFixed(2)}L</div>
        </div>
        <div className="stat-card">
          <h3>Collection Rate</h3>
          <div className="value" style={{ color: '#3b82f6' }}>{stats.collectionPercentage}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'collection' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('collection')}
        >
          💰 Collection Report
        </button>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pending')}
        >
          📋 Pending Fees ({stats.pendingCount})
        </button>
        <button
          className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('monthly')}
        >
          📊 Monthly Trends
        </button>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {activeTab === 'collection' && (
            <div className="card">
              <div className="card-header">
                <h2>💰 Fee Collection Report</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.85em', color: '#1e40af', marginBottom: '5px' }}>Total Fees</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>{stats.totalFees}</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#dcfce7', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.85em', color: '#15803d', marginBottom: '5px' }}>Paid</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#166534' }}>{stats.paidCount}</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '0.85em', color: '#991b1b', marginBottom: '5px' }}>Pending</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7f1d1d' }}>{stats.pendingCount}</div>
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b',
                marginBottom: '20px'
              }}>
                <strong>💡 Collection Efficiency</strong>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    flex: 1,
                    height: '20px',
                    backgroundColor: '#fcd34d',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${stats.collectionPercentage}%`,
                      height: '100%',
                      backgroundColor: '#10b981'
                    }}></div>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{stats.collectionPercentage}%</span>
                </div>
              </div>

              <p style={{ color: '#6b7280', fontSize: '0.95em' }}>
                📊 This report shows the complete fee collection status including total amounts, collections, and pending amounts.
              </p>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="card">
              <div className="card-header">
                <h2>📋 Pending Fees by Student</h2>
              </div>
              {pendingFeesByStudent.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Amount Pending</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingFeesByStudent.map((item, index) => (
                        <tr key={index}>
                          <td>{item.student}</td>
                          <td style={{ fontWeight: 'bold' }}>₹{item.amount.toLocaleString()}</td>
                          <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: item.daysOverdue > 30 ? '#fee2e2' :
                                             item.daysOverdue > 0 ? '#fef3c7' : '#dcfce7',
                              color: item.daysOverdue > 30 ? '#991b1b' :
                                     item.daysOverdue > 0 ? '#92400e' : '#15803d',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              {item.daysOverdue > 0 ? `${item.daysOverdue} days` : 'Due soon'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              fontSize: '0.85em'
                            }}>
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  All fees are collected! 🎉
                </p>
              )}
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="card">
              <div className="card-header">
                <h2>📊 Monthly Fee Collection Trends</h2>
              </div>
              {monthlyCollection.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Amount Collected</th>
                        <th>Collection Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyCollection.map((item, index) => {
                        const maxAmount = Math.max(...monthlyCollection.map(m => m.amount));
                        const percentage = (item.amount / maxAmount) * 100;
                        return (
                          <tr key={index}>
                            <td>{item.month}</td>
                            <td style={{ fontWeight: 'bold' }}>₹{item.amount.toLocaleString()}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '100px',
                                  height: '8px',
                                  backgroundColor: '#e5e7eb',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    backgroundColor: '#10b981'
                                  }}></div>
                                </div>
                                <span style={{ fontSize: '0.85em' }}>{percentage.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  No monthly data available yet.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalFinanceReport;
