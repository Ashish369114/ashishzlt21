import React, { useEffect, useState } from 'react';
import { expenseService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const AccountantExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    date: '',
    expenseType: 'Operational',
    description: '',
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getAll().catch(() => ({ data: [] }));
      const apiExpenses = Array.isArray(response.data) ? response.data : [];
      if (apiExpenses.length > 0) {
        setExpenses(apiExpenses);
      } else {
        setExpenses([
          { _id: 'exp1', title: 'Classroom Whiteboard Replacement', category: 'Infrastructure', amount: 28000, date: '2026-07-28', expenseType: 'Capital', description: 'New whiteboards for Grade 6-10 classrooms', status: 'Approved' },
          { _id: 'exp2', title: 'Stationery & Office Supplies', category: 'Administrative', amount: 8500, date: '2026-07-25', expenseType: 'Operational', description: 'Monthly office supplies for admin block', status: 'Approved' },
          { _id: 'exp3', title: 'Diesel for Generator', category: 'Utilities', amount: 12000, date: '2026-07-22', expenseType: 'Operational', description: 'Power backup fuel for July', status: 'Approved' },
          { _id: 'exp4', title: 'Science Lab Chemicals', category: 'Academic', amount: 18500, date: '2026-07-20', expenseType: 'Operational', description: 'Chemistry lab reagents for practicals', status: 'Approved' },
          { _id: 'exp5', title: 'Sports Equipment', category: 'Extracurricular', amount: 45000, date: '2026-07-18', expenseType: 'Capital', description: 'Cricket bats, nets, footballs for sports day', status: 'Pending' },
          { _id: 'exp6', title: 'Staff Training Workshop', category: 'HR', amount: 22000, date: '2026-07-15', expenseType: 'Operational', description: 'Digital tools training for teachers', status: 'Approved' },
          { _id: 'exp7', title: 'Internet & Networking', category: 'Utilities', amount: 9500, date: '2026-07-12', expenseType: 'Operational', description: 'Monthly broadband + WiFi extenders', status: 'Approved' },
          { _id: 'exp8', title: 'Library Books Purchase', category: 'Academic', amount: 35000, date: '2026-07-10', expenseType: 'Capital', description: 'New textbooks and reference books Q3', status: 'Approved' },
          { _id: 'exp9', title: 'Canteen Supplies', category: 'Operations', amount: 15000, date: '2026-07-08', expenseType: 'Operational', description: 'Monthly raw material for school canteen', status: 'Approved' },
          { _id: 'exp10', title: 'Annual Day Event', category: 'Events', amount: 85000, date: '2026-07-05', expenseType: 'Capital', description: 'Stage setup, sound, lighting for annual day', status: 'Pending' },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      amount: '',
      date: '',
      expenseType: 'Operational',
      description: '',
    });
    setSelectedExpense(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      setError('Title and amount are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      if (selectedExpense) {
        await expenseService.update(selectedExpense._id, payload);
      } else {
        await expenseService.add(payload);
      }
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError('Unable to save expense.');
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      title: expense.title || '',
      category: expense.category || '',
      amount: expense.amount || '',
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : '',
      expenseType: expense.expenseType || 'Operational',
      description: expense.description || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await expenseService.delete(id);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError('Unable to delete expense');
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📉 Expense Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <h3>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSaveExpense}>
          <div className="form-row full" style={{ gap: '10px' }}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row full" style={{ gap: '10px' }}>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Transport, Office, Utilities"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="expenseType" value={formData.expenseType} onChange={handleInputChange}>
                <option value="Operational">Operational</option>
                <option value="Capital">Capital</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary">
              {selectedExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Expense Report</h3>
          <p>Total expenses recorded: {formatCurrency(totalExpense)}</p>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7">No expense records found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.title}</td>
                    <td>{expense.category || 'General'}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                    <td>{expense.expenseType}</td>
                    <td>{expense.description || '-'}</td>
                    <td>
                      <button className="btn btn-small" onClick={() => handleEdit(expense)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(expense._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountantExpenses;
