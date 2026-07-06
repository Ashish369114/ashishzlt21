import React, { useEffect, useState } from 'react';
import { employeeService } from '../../services/api';

const AccountantPayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [schoolId, setSchoolId] = useState(localStorage.getItem('schoolId') || '');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryData, setSalaryData] = useState({ baseSalary: 0, allowances: {}, deductions: {} });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schoolId) {
      fetchPayroll();
    } else {
      setLoading(false);
    }
  }, [schoolId]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getPayroll(schoolId);
      setPayroll(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load payroll data. Ensure schoolId is configured.');
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSalaryData({
      baseSalary: employee.baseSalary || 0,
      allowances: employee.allowances || {},
      deductions: employee.deductions || {},
    });
    setNotes(`Payslip for ${employee.employeeId}`);
  };

  const handleSalaryFieldChange = (field, value) => {
    setSalaryData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleAllowanceChange = (name, value) => {
    setSalaryData((prev) => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        [name]: Number(value),
      },
    }));
  };

  const handleDeductionChange = (name, value) => {
    setSalaryData((prev) => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [name]: Number(value),
      },
    }));
  };

  const handleSaveSalary = async () => {
    if (!selectedEmployee) {
      alert('Select an employee first');
      return;
    }

    try {
      await employeeService.updateSalary(selectedEmployee._id, salaryData);
      fetchPayroll();
      alert('Salary data updated successfully');
    } catch (err) {
      console.error(err);
      setError('Unable to save salary details.');
    }
  };

  const calculateNetSalary = () => {
    const base = Number(salaryData.baseSalary || 0);
    const allowancesTotal = Object.values(salaryData.allowances || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);
    const deductionsTotal = Object.values(salaryData.deductions || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);
    return base + allowancesTotal - deductionsTotal;
  };

  const generatePayslip = (employee) => {
    const totalAllowances = Object.entries(employee.allowances || {}).map(([key, value]) => `${key}: ₹${value}`).join('\n') || 'None';
    const totalDeductions = Object.entries(employee.deductions || {}).map(([key, value]) => `${key}: ₹${value}`).join('\n') || 'None';
    const netPay = (employee.baseSalary || 0) +
      Object.values(employee.allowances || {}).reduce((sum, curr) => sum + Number(curr || 0), 0) -
      Object.values(employee.deductions || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);

    const payslipText = `Payslip\n-------\nEmployee ID: ${employee.employeeId}\nBase Salary: ₹${employee.baseSalary}\nAllowances:\n${totalAllowances}\nDeductions:\n${totalDeductions}\nNet Salary: ₹${netPay}\n\nNotes:\n${notes}`;
    const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payslip_${employee.employeeId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💵 Payroll Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {!schoolId ? (
            <div className="alert alert-warning">schoolId is not configured in localStorage. Please add a schoolId before loading payroll.</div>
          ) : (
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <h3>Total Staff</h3>
                <div className="value">{payroll.length}</div>
              </div>
              <div className="stat-card">
                <h3>Average Salary</h3>
                <div className="value">₹{(payroll.reduce((sum, emp) => sum + (emp.netSalary || 0), 0) / Math.max(payroll.length, 1)).toFixed(0)}</div>
              </div>
              <div className="stat-card">
                <h3>Total Payroll</h3>
                <div className="value">₹{payroll.reduce((sum, emp) => sum + (emp.netSalary || 0), 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>Payroll Listings</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Base Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.length === 0 ? (
                    <tr>
                      <td colSpan="6">No payroll records found.</td>
                    </tr>
                  ) : (
                    payroll.map((employee) => (
                      <tr key={employee.employeeId}>
                        <td>{employee.employeeId}</td>
                        <td>₹{employee.baseSalary}</td>
                        <td>{Object.values(employee.allowances || {}).reduce((sum, value) => sum + Number(value || 0), 0)}</td>
                        <td>{Object.values(employee.deductions || {}).reduce((sum, value) => sum + Number(value || 0), 0)}</td>
                        <td>₹{employee.netSalary}</td>
                        <td>
                          <button className="btn btn-small" onClick={() => selectEmployee(employee)}>
                            Manage
                          </button>
                          <button className="btn btn-small" onClick={() => generatePayslip(employee)}>
                            Payslip
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedEmployee && (
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="card-header">
                <h3>Salary Configuration</h3>
              </div>
              <div className="form-container">
                <div className="form-row full" style={{ gap: '10px' }}>
                  <div className="form-group">
                    <label>Base Salary</label>
                    <input
                      type="number"
                      value={salaryData.baseSalary}
                      onChange={(e) => handleSalaryFieldChange('baseSalary', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" />
                  </div>
                </div>
                <div className="form-row full" style={{ gap: '10px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Allowances</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="HRA"
                        value={salaryData.allowances?.HRA || ''}
                        onChange={(e) => handleAllowanceChange('HRA', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Transport"
                        value={salaryData.allowances?.Transport || ''}
                        onChange={(e) => handleAllowanceChange('Transport', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Deductions</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="PF"
                        value={salaryData.deductions?.PF || ''}
                        onChange={(e) => handleDeductionChange('PF', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Tax"
                        value={salaryData.deductions?.Tax || ''}
                        onChange={(e) => handleDeductionChange('Tax', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={handleSaveSalary}>
                    Update Salary
                  </button>
                  <button className="btn btn-secondary" onClick={() => generatePayslip(selectedEmployee)}>
                    Export Payslip
                  </button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <strong>Net Salary:</strong> ₹{calculateNetSalary()}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountantPayroll;
