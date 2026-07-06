import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';

const ProfileUpdateForm = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    relationship: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        relationship: profile.relationship || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.updateProfile(formData);
      setMessage(response.data.message || 'Profile updated successfully.');
      if (onUpdate) onUpdate(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <h2>📝 Update Profile</h2>
      </div>
      <div className="card-content">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input name="relationship" value={formData.relationship} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
