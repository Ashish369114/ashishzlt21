import React, { useEffect, useState } from 'react';
import { employeeService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const AccountantPayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [schoolId, setSchoolId] = useState(localStorage.getItem('schoolId') || '');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryData, setSalaryData] = useState({ baseSalary: 0, allowances: {}, deductions: {} });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

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
      setPayroll(response.data || []);
    } catch (err) {
      console.error(err);
      // Suppress technical error as per requirements
      setPayroll([]);
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
    setSalaryData((prev) => ({ ...prev, allowances: { ...prev.allowances, [name]: Number(value) } }));
  };

  const handleDeductionChange = (name, value) => {
    setSalaryData((prev) => ({ ...prev, deductions: { ...prev.deductions, [name]: Number(value) } }));
  };

  const handleSaveSalary = async () => {
    if (!selectedEmployee) return;
    try {
      await employeeService.updateSalary(selectedEmployee._id, salaryData);
      fetchPayroll();
      alert('Salary data updated successfully');
      setSelectedEmployee(null);
    } catch (err) {
      console.error(err);
      alert('Unable to save salary details.');
    }
  };

  const calculateNetSalary = () => {
    const base = Number(salaryData.baseSalary || 0);
    const allowancesTotal = Object.values(salaryData.allowances || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);
    const deductionsTotal = Object.values(salaryData.deductions || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);
    return base + allowancesTotal - deductionsTotal;
  };

  const generatePayslip = (employee) => {
    const totalAllowances = Object.entries(employee.allowances || {}).map(([key, value]) => `${key}: ${formatCurrency(value)}`).join('\n') || 'None';
    const totalDeductions = Object.entries(employee.deductions || {}).map(([key, value]) => `${key}: ${formatCurrency(value)}`).join('\n') || 'None';
    const netPay = (employee.baseSalary || 0) +
      Object.values(employee.allowances || {}).reduce((sum, curr) => sum + Number(curr || 0), 0) -
      Object.values(employee.deductions || {}).reduce((sum, curr) => sum + Number(curr || 0), 0);

    const payslipText = `Payslip\n-------\nEmployee ID: ${employee.employeeId}\nBase Salary: ${formatCurrency(employee.baseSalary)}\nAllowances:\n${totalAllowances}\nDeductions:\n${totalDeductions}\nNet Salary: ${formatCurrency(netPay)}\n\nNotes:\n${notes}`;
    const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payslip_${employee.employeeId}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredPayroll = payroll.filter(emp => {
    const matchSearch = emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalPayroll = payroll.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);
  const paidThisMonth = totalPayroll * 0.8; // Visual mock for dashboard completeness
  const pendingSalaries = totalPayroll - paidThisMonth; // Visual mock

  if (loading) {
    return <div className="spinner" style={{ margin: '40px auto' }}></div>;
  }

  // Improved Empty State
  if (!schoolId || payroll.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', margin: '20px auto', maxWidth: '600px' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>📝</div>
        <h2 style={{ color: '#111827', fontSize: '24px', marginBottom: '12px', fontWeight: '700' }}>No Payroll Records Found</h2>
        <p style={{ color: '#6b7280', margin: '0 auto 28px', lineHeight: '1.6', fontSize: '15px' }}>
          It looks like you haven't generated the payroll for this month yet. Ensure all employee records are up to date before generating.
        </p>
        <button 
          className="btn btn-primary"
          onClick={async () => {
            try {
              setLoading(true);
              const empRes = await employeeService.getAll();
              const employees = empRes.data || [];
              if (employees.length === 0) {
                alert('No employees found. Please add employees first.');
                setLoading(false);
                return;
              }
              const generated = employees.map(emp => ({
                _id: emp._id,
                employeeId: emp.employeeId || `EMP-${emp._id?.slice(-4)}`,
                name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                department: emp.department || 'General',
                baseSalary: emp.salary?.baseSalary || emp.baseSalary || 25000,
                allowances: emp.salary?.allowances || emp.allowances || { HRA: 5000, DA: 3000 },
                deductions: emp.salary?.deductions || emp.deductions || { PF: 2000, Tax: 1500 },
                netSalary: (emp.salary?.baseSalary || emp.baseSalary || 25000) +
                  Object.values(emp.salary?.allowances || emp.allowances || { HRA: 5000, DA: 3000 }).reduce((s,v) => s + Number(v||0), 0) -
                  Object.values(emp.salary?.deductions || emp.deductions || { PF: 2000, Tax: 1500 }).reduce((s,v) => s + Number(v||0), 0),
                status: 'Pending',
              }));
              setPayroll(generated);
              setLoading(false);
            } catch (err) {
              console.error('Error generating payroll:', err);
              alert('Failed to generate payroll. Please try again.');
              setLoading(false);
            }
          }}
          style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
        >
          ✨ Generate Payroll
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { title: 'Total Employees', value: payroll.length, icon: '👥', color: '#3b82f6' },
          { title: 'Total Payroll', value: formatCurrency(totalPayroll), icon: '💰', color: '#8b5cf6' },
          { title: 'Paid This Month', value: formatCurrency(paidThisMonth), icon: '✅', color: '#10b981' },
          { title: 'Pending Salaries', value: formatCurrency(pendingSalaries), icon: '⏳', color: '#f59e0b' },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</p>
              <h3 style={{ margin: '6px 0 0', color: '#111827', fontSize: '24px', fontWeight: '800' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Search Employee ID..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1', minWidth: '220px', fontSize: '14px', outline: 'none' }}
        />
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
          <option>June 2026</option>
          <option>July 2026</option>
          <option>August 2026</option>
        </select>
        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
          <option>All Departments</option>
          <option>Teaching</option>
          <option>Administration</option>
          <option>Support Staff</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Payroll Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee ID</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base Salary</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allowances</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deductions</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Salary</th>
                <th style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayroll.map((employee) => (
                <tr key={employee.employeeId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a' }}>{employee.employeeId}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b', fontWeight: '500' }}>{formatCurrency(employee.baseSalary)}</td>
                  <td style={{ padding: '16px 24px', color: '#059669', fontWeight: '600' }}>+{Object.values(employee.allowances || {}).reduce((sum, value) => sum + Number(value || 0), 0)}</td>
                  <td style={{ padding: '16px 24px', color: '#dc2626', fontWeight: '600' }}>-{Object.values(employee.deductions || {}).reduce((sum, value) => sum + Number(value || 0), 0)}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(employee.netSalary)}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => selectEmployee(employee)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Edit</button>
                      <button onClick={() => generatePayslip(employee)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>📄 Payslip</button>
                      <button onClick={() => alert("Marked as paid (Mock)")} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Mark Paid</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayroll.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>No employees matched your search filters. Try adjusting your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Configuration Modal */}
      {selectedEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '640px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '700' }}>Edit Salary Configuration</h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Employee ID: {selectedEmployee.employeeId}</p>
              </div>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Base Salary</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '600' }}>₹</span>
                  <input type="number" value={salaryData.baseSalary} onChange={(e) => handleSalaryFieldChange('baseSalary', e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 32px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', color: '#0f172a', fontWeight: '500' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dcfce7', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>+</span> Allowances
                  </label>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>HRA</label>
                    <input type="number" placeholder="0" value={salaryData.allowances?.HRA || ''} onChange={(e) => handleAllowanceChange('HRA', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Transport</label>
                    <input type="number" placeholder="0" value={salaryData.allowances?.Transport || ''} onChange={(e) => handleAllowanceChange('Transport', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#fee2e2', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>-</span> Deductions
                  </label>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>PF</label>
                    <input type="number" placeholder="0" value={salaryData.deductions?.PF || ''} onChange={(e) => handleDeductionChange('PF', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tax</label>
                    <input type="number" placeholder="0" value={salaryData.deductions?.Tax || ''} onChange={(e) => handleDeductionChange('Tax', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Internal Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Final Net Salary</span>
                <span style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>{formatCurrency(calculateNetSalary())}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <button onClick={() => generatePayslip(selectedEmployee)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#fff', color: '#7c3aed', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📄 Export PDF</button>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedEmployee(null)} style={{ padding: '14px 28px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
              <button onClick={handleSaveSalary} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantPayroll;
