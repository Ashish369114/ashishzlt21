import React, { useState } from 'react';
import { authService } from '../../services/api';

const PasswordChangeForm = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      setMessage(response.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <h2>🔒 Change Password</h2>
      </div>
      <div className="card-content">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
