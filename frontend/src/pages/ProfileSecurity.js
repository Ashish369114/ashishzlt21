import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import PasswordChangeForm from './components/PasswordChangeForm';
import ProfileUpdateForm from './components/ProfileUpdateForm';

const ProfileSecurity = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setProfile(response.data);
      } catch (err) {
        setError('Unable to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>👤 Profile & Security</h2>
      </div>
      <div className="card-content">
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
    </div>
  );
};

export default ProfileSecurity;
