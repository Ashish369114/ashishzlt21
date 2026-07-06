import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    general: {
      systemName: '',
      timezone: '',
      language: '',
      dateFormat: '',
      currency: '',
    },
  });

  useEffect(() => {
    const storedSchoolId = localStorage.getItem('schoolId');
    if (storedSchoolId) {
      setSchoolId(storedSchoolId);
      fetchSettings(storedSchoolId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSettings = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/settings/${id}`);
      setSettings(response.data);
      setFormData({ general: response.data.general || {} });
    } catch (err) {
      setError('Unable to load settings or school ID not configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolId) {
      setError('School ID is required to save settings.');
      return;
    }
    try {
      await api.put(`/settings/${schoolId}/general`, formData.general);
      setError('');
      await fetchSettings(schoolId);
      setShowForm(false);
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>⚙️ Settings Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {!schoolId && (
            <div className="alert alert-warning">
              School ID is not configured. Please set `schoolId` in localStorage or use the School Management page to create a school first.
            </div>
          )}

          {settings && (
            <div className="settings-summary">
              <h3>Current Settings</h3>
              <p><strong>School:</strong> {settings.school}</p>
              <p><strong>System Name:</strong> {settings.general?.systemName || 'Not set'}</p>
              <p><strong>Timezone:</strong> {settings.general?.timezone || 'Not set'}</p>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Hide Settings Form' : 'Edit General Settings'}
          </button>

          {showForm && (
            <form className="form-container" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <h3>General Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>System Name</label>
                  <input
                    type="text"
                    name="systemName"
                    value={formData.general.systemName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.general.timezone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.general.language}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date Format</label>
                  <input
                    type="text"
                    name="dateFormat"
                    value={formData.general.dateFormat}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.general.currency}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success">Save Settings</button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsManagement;
