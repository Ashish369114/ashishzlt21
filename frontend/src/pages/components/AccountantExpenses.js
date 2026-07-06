import React, { useEffect, useState } from 'react';
import { expenseService } from '../../services/api';

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
      const response = await expenseService.getAll();
      setExpenses(response.data);
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
          <p>Total expenses recorded: ₹{totalExpense.toLocaleString()}</p>
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
                    <td>₹{expense.amount}</td>
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
