import React, { useState, useEffect } from 'react';
import api, { authService } from '../../services/api';
import PasswordChangeForm from './PasswordChangeForm';
import ProfileUpdateForm from './ProfileUpdateForm';

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('settings');
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

  // Profile Security states
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const storedSchoolId = localStorage.getItem('schoolId');
    if (storedSchoolId) {
      setSchoolId(storedSchoolId);
      fetchSettings(storedSchoolId);
    } else {
      setLoading(false);
    }
    fetchProfile();
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

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const response = await authService.getProfile();
      setProfile(response.data);
    } catch (err) {
      setProfileError('Unable to load profile details.');
    } finally {
      setProfileLoading(false);
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('settings')}
          style={{ width: 'auto', margin: 0 }}
        >
          ⚙️ System Settings
        </button>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profile')}
          style={{ width: 'auto', margin: 0 }}
        >
          🔒 Profile & Security
        </button>
      </div>

      {activeTab === 'settings' && (
        <>
          <div className="card-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
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
                <div className="settings-summary" style={{ marginBottom: '20px' }}>
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
                        value={formData.general.systemName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <input
                        type="text"
                        name="timezone"
                        value={formData.general.timezone || ''}
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
                        value={formData.general.language || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <input
                        type="text"
                        name="dateFormat"
                        value={formData.general.dateFormat || ''}
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
                        value={formData.general.currency || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success">Save Settings</button>
                </form>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'profile' && (
        <>
          <div className="card-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <h2>👤 Profile & Security</h2>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            {profileError && <div className="alert alert-error">{profileError}</div>}
            {profileLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <h3>Profile Details</h3>
                    <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
                    <p><strong>User ID:</strong> {profile?.userId}</p>
                    <p><strong>Email:</strong> {profile?.email || 'Not set'}</p>
                    <p><strong>Phone:</strong> {profile?.phone || 'Not set'}</p>
                    <p><strong>Address:</strong> {profile?.address || 'Not set'}</p>
                    <p><strong>Role:</strong> {profile?.role}</p>
                  </div>
                  <div>
                    <h3>Security</h3>
                    <p>You can change your password here. A secure password helps keep your account protected.</p>
                    <p>If you need to reset access, use the forgot password flow from the login screen.</p>
                  </div>
                </div>
                <ProfileUpdateForm profile={profile} onUpdate={(updatedUser) => setProfile(updatedUser)} />
                <PasswordChangeForm />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsManagement;
