import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../shared/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  // Preferences states
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [contactVisibility, setContactVisibility] = useState('everyone');
  const [locationSharing, setLocationSharing] = useState('always');
  const [activityStatusVisible, setActivityStatusVisible] = useState(true);

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status/Error states
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    // Load current user details from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    // Load current user preferences from API
    const loadPreferences = async () => {
      try {
        const res = await apiFetch('/api/v1/accounts/preferences/');
        if (res.ok) {
          const data = await res.json();
          setProfileVisibility(data.profile_visibility);
          setContactVisibility(data.contact_visibility);
          setLocationSharing(data.location_sharing);
          setActivityStatusVisible(data.activity_status_visible);
        }
      } catch (err) {
        console.error('Error fetching user preferences:', err);
      }
    };
    loadPreferences();
  }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefSuccess('');
    setPrefError('');

    try {
      const res = await apiFetch('/api/v1/accounts/preferences/', {
        method: 'PATCH',
        body: JSON.stringify({
          profile_visibility: profileVisibility,
          contact_visibility: contactVisibility,
          location_sharing: locationSharing,
          activity_status_visible: activityStatusVisible
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update preferences.');
      setPrefSuccess('Privacy and visibility preferences updated successfully.');
    } catch (err) {
      setPrefError(err.message || 'Error updating preferences.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    try {
      const res = await apiFetch('/api/v1/accounts/security/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.old_password || data.new_password || data.detail || 'Password change failed.');
      setPwdSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdError(err.message || 'Error updating password.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', fontFamily: 'var(--font-body)' }}>
      {/* LEFT AREA: PROFILE INFO + PRIVACY SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* PROFILE INFO CARD */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink-950)' }}>
              Profile Information
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '2px' }}>
              Your account details registered in Swachsahyog.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
            <div>
              <strong style={{ color: 'var(--ink-700)', display: 'block', fontSize: '12px' }}>Username</strong>
              <span style={{ color: 'var(--ink-900)', fontWeight: '600' }}>{user?.username || 'N/A'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--ink-700)', display: 'block', fontSize: '12px' }}>Email Address</strong>
              <span style={{ color: 'var(--ink-900)', fontWeight: '600' }}>{user?.email || 'N/A'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--ink-700)', display: 'block', fontSize: '12px' }}>Phone Number</strong>
              <span style={{ color: 'var(--ink-900)', fontWeight: '600' }}>{user?.phone || 'N/A'}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--ink-700)', display: 'block', fontSize: '12px' }}>Account Role</strong>
              <span style={{ color: 'var(--ink-900)', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* PRIVACY SETTINGS CARD */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink-950)' }}>
              Privacy & Visibility Settings
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '2px' }}>
              Control who can view your profile, contact details, and location.
            </p>
          </div>

          {prefSuccess && (
            <div style={{ padding: '8px 12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', color: 'var(--green-900)', borderRadius: '6px', fontSize: '13px' }}>
              {prefSuccess}
            </div>
          )}

          {prefError && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', color: 'var(--red)', borderRadius: '6px', fontSize: '13px' }}>
              {prefError}
            </div>
          )}

          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Profile Visibility</label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontSize: '13.5px', outline: 'none' }}
                >
                  <option value="public">Public Dropdown</option>
                  <option value="private">Private Dropdown</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Contact Visibility</label>
                <select
                  value={contactVisibility}
                  onChange={(e) => setContactVisibility(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontSize: '13.5px', outline: 'none' }}
                >
                  <option value="everyone">Everyone</option>
                  <option value="verified_only">Verified Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Location Sharing</label>
                <select
                  value={locationSharing}
                  onChange={(e) => setLocationSharing(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontSize: '13.5px', outline: 'none' }}
                >
                  <option value="always">Always Share Location</option>
                  <option value="while_reporting">While Reporting</option>
                  <option value="never">Never Share</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Activity Toggle</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-900)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activityStatusVisible}
                    onChange={(e) => setActivityStatusVisible(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>Show Activity Status Toggle</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--green-700)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                marginTop: '5px',
                width: 'fit-content'
              }}
            >
              Save Preferences
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT AREA: SECURITY / CHANGE PASSWORD */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: 'fit-content'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink-950)' }}>
            Change Password
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '2px' }}>
            Update your authentication credentials securely.
          </p>
        </div>

        {pwdSuccess && (
          <div style={{ padding: '8px 12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', color: 'var(--green-900)', borderRadius: '6px', fontSize: '13px' }}>
            {pwdSuccess}
          </div>
        )}

        {pwdError && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', color: 'var(--red)', borderRadius: '6px', fontSize: '13px' }}>
            {pwdError}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--green-700)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
