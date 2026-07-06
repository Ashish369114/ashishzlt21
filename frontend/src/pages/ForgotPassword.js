import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = identifier.includes('@') ? { email: identifier } : { userId: identifier };
      const response = await authService.forgotPassword(payload);
      setMessage(response.data.message || 'Password reset instructions sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Forgot Password</h1>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or User ID</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or user ID"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <button type="button" className="btn btn-link" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
