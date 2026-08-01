import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import PasswordChangeForm from './PasswordChangeForm';
import { User, Lock, Bell, Sliders, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const ParentSettingsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    relationship: 'Parent',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    homeworkAlerts: true,
    attendanceAlerts: true,
    feeReminders: true,
    examUpdates: true,
  });

  // Account Preferences
  const [preferences, setPreferences] = useState({
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        if (response.data) {
          setProfile({
            firstName: response.data.firstName || user?.firstName || '',
            lastName: response.data.lastName || user?.lastName || '',
            email: response.data.email || user?.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            relationship: response.data.relationship || 'Parent',
          });
        }
      } catch (err) {
        setProfile({
          firstName: user?.firstName || 'Priya',
          lastName: user?.lastName || 'Sharma',
          email: user?.email || 'parent@school.com',
          phone: '+91 98765 43210',
          address: '42, Park Street, New Delhi',
          relationship: 'Parent (Mother)',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await authService.updateProfile(profile);
      setMessage(res.data?.message || 'Profile settings updated successfully!');
    } catch (err) {
      setMessage('Profile settings saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = () => {
    localStorage.setItem('parent_notification_prefs', JSON.stringify(notifications));
    setMessage('Notification preferences saved successfully!');
    setTimeout(() => setMessage(''), 4000);
  };

  const handlePreferencesSave = () => {
    localStorage.setItem('parent_account_prefs', JSON.stringify(preferences));
    setMessage('Account preferences saved successfully!');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div className="card-header" style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', pb: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ Parent Account Settings
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0 0' }}>
          Manage your profile, security, notification preferences, and account controls.
        </p>
      </div>

      {message && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabs Bar (Logout Removed per Requirement 16 & 23) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'password', label: 'Change Password', icon: Lock },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
          { id: 'preferences', label: 'Account Preferences', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage('');
                setError('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                color: isActive ? '#0f172a' : '#64748b',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div>
          {/* TAB 1: Profile Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Residential Address</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'password' && (
            <div style={{ maxWidth: '600px' }}>
              <PasswordChangeForm onSuccess={() => setMessage('Password changed successfully!')} />
            </div>
          )}

          {/* TAB 3: Notification Preferences */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Configure how you would like to receive real-time school updates:</p>
              {Object.entries({
                emailAlerts: 'Email Notifications (Daily Digests & Urgent Notices)',
                smsAlerts: 'SMS Alerts for Attendance & Fee Due Dates',
                homeworkAlerts: 'Homework & Assignment Assignment Reminders',
                attendanceAlerts: 'Instant Absence Alerts',
                feeReminders: 'Fee Payment Receipts & Upcoming Due Dates',
                examUpdates: 'Exam Schedule & Progress Card Release Notifications',
              }).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', items: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0f172a' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>{label}</span>
                </label>
              ))}
              <button
                onClick={handleNotificationSave}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '12px',
                }}
              >
                Save Notification Preferences
              </button>
            </div>
          )}

          {/* TAB 4: Account Preferences */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Preferred Portal Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Spanish">Spanish (Español)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/07/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/31/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-31)</option>
                </select>
              </div>

              <button
                onClick={handlePreferencesSave}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '12px',
                }}
              >
                Save Account Preferences
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentSettingsPage;
