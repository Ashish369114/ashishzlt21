import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    role: 'student',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingUserId(null);
    setFormData({
      userId: '',
      password: '',
      role: 'student',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Male',
      isActive: true,
    });
    setShowForm(false);
    setError('');
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      userId: user.userId,
      password: '',
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || 'Male',
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>👥 User Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '20px' }}>
          <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  readOnly={!!editingUserId}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUserId}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="super_admin">Super Admin</option>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="accountant_admin">Accountant Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active account
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>User ID</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Loading...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.userId}</td>
                  <td>{user.role}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button className="btn btn-secondary btn-small" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(user._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!showForm && (
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowForm(true)}>
          ➕ Add User
        </button>
      )}
    </div>
  );
};

export default UserManagement;
