import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { apiFetch } from '../../../shared/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('account');

  // Preferences States (Local / LocalStorage)
  const [language, setLanguage] = useState(localStorage.getItem('swachhLanguage') || 'English');
  const [distanceUnit, setDistanceUnit] = useState(localStorage.getItem('swachhDistanceUnit') || 'Kilometers (km)');
  const [theme, setTheme] = useState(localStorage.getItem('swachhTheme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('swachhFontSize') || 'medium');

  // Privacy Settings States (Synced with API / Backend)
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [contactVisibility, setContactVisibility] = useState('nobody');
  const [locationSharing, setLocationSharing] = useState('while_reporting');
  const [activityStatusVisible, setActivityStatusVisible] = useState(false);

  // Notification States
  const [swcUpdates, setSwcUpdates] = useState(true);
  const [surplusUpdates, setSurplusUpdates] = useState(false);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [impactAchievements, setImpactAchievements] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // App Preferences
  const [dataSaver, setDataSaver] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Security Expandable Form States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // UI Toast States
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  let toastTimer = null;

  // Load user details and API preferences on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    // Apply active theme and font size classes on mount
    applyThemeClass(theme);
    applyFontSizeClass(fontSize);

    const fetchPreferences = async () => {
      try {
        const res = await apiFetch('/api/v1/accounts/preferences/');
        if (res.ok) {
          const data = await res.json();
          setProfileVisibility(data.profile_visibility || 'public');
          setContactVisibility(data.contact_visibility || 'nobody');
          setLocationSharing(data.location_sharing || 'while_reporting');
          setActivityStatusVisible(!!data.activity_status_visible);
        }
      } catch (err) {
        console.error('Error fetching user preferences:', err);
      }
    };
    fetchPreferences();
  }, []);

  // Trigger local custom feedback toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // Switch Active Tab
  const handleTabClick = (tabKey, label) => {
    setActiveTab(tabKey);
    triggerToast(`${label} selected`);
  };

  // Preference Dropdown Changes
  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('swachhLanguage', val);
    triggerToast('Preference updated');
  };

  const handleDistanceChange = (e) => {
    const val = e.target.value;
    setDistanceUnit(val);
    localStorage.setItem('swachhDistanceUnit', val);
    triggerToast('Preference updated');
  };

  // Apply Theme Classes Helper
  const applyThemeClass = (selectedTheme) => {
    if (selectedTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  // Change Theme Mode
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('swachhTheme', selectedTheme);
    applyThemeClass(selectedTheme);
    triggerToast(selectedTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');
  };

  // Apply Font Size Helper
  const applyFontSizeClass = (size) => {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
  };

  // Change Font Size
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('swachhFontSize', size);
    applyFontSizeClass(size);
    const label = size.charAt(0).toUpperCase() + size.slice(1);
    triggerToast(`Font size: ${label}`);
  };

  // Save privacy selections to Backend API
  const handlePrivacySelectChange = async (field, value) => {
    // Optimistic UI state updates
    let updatedPayload = {};
    if (field === 'profile_visibility') {
      setProfileVisibility(value);
      updatedPayload.profile_visibility = value;
    } else if (field === 'contact_visibility') {
      setContactVisibility(value);
      updatedPayload.contact_visibility = value;
    } else if (field === 'location_sharing') {
      setLocationSharing(value);
      updatedPayload.location_sharing = value;
    }

    try {
      const res = await apiFetch('/api/v1/accounts/preferences/', {
        method: 'PATCH',
        body: JSON.stringify(updatedPayload)
      });
      if (res.ok) {
        triggerToast('Preference updated');
      } else {
        throw new Error('API update failed');
      }
    } catch (err) {
      console.error('Failed to sync privacy preferences:', err);
      triggerToast('Error saving preferences');
    }
  };

  // Toggle Switches Helper (Saves local/mock settings or API toggles)
  const handleToggleSwitch = async (label, stateVal, setter, apiField = null) => {
    const nextState = !stateVal;
    setter(nextState);
    triggerToast(nextState ? 'Setting enabled' : 'Setting disabled');

    if (apiField) {
      try {
        await apiFetch('/api/v1/accounts/preferences/', {
          method: 'PATCH',
          body: JSON.stringify({ [apiField]: nextState })
        });
      } catch (err) {
        console.error('Failed to sync toggle preference:', err);
      }
    }
  };

  // Handle Expandable Security Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');
    
    if (!oldPassword || !newPassword) {
      setPwdError('Please complete all required fields.');
      return;
    }
    setPwdLoading(true);

    try {
      const res = await apiFetch('/api/v1/accounts/security/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.old_password || data.new_password || data.detail || 'Password change failed.');
      }
      setPwdSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      triggerToast('Password updated');
      setTimeout(() => setShowPasswordForm(false), 1500);
    } catch (err) {
      setPwdError(err.message || 'Error updating password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        Home &nbsp;›&nbsp; <span>Settings</span>
      </div>

      {/* HERO BANNER */}
      <section className="hero">
        <div className="hero-small">ACCOUNT · WARD 24</div>
        <h1>
          Your <em>settings</em>,<br />
          your city profile.
        </h1>
        <p>Manage your account, preferences, privacy and security — all in one place.</p>
        <div className="progress-ring">
          <div className="progress-text">
            3/4 <small>COMPLETE</small>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => handleTabClick('account', 'Account Settings')}
        >
          ♙ Account Settings
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => handleTabClick('preferences', 'Preferences')}
        >
          ☷ Preferences
        </button>
        <button 
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => handleTabClick('notifications', 'Notifications')}
        >
          ♧ Notifications
        </button>
        <button 
          className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => handleTabClick('privacy', 'Privacy')}
        >
          ♢ Privacy
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => handleTabClick('security', 'Security')}
        >
          🔒 Security
        </button>
      </div>

      {/* PROFILE + PREFERENCES GRID */}
      <div className="top-grid">
        {/* PROFILE CARD */}
        <section className="card profile-card">
          <h2 className="card-title">
            <span className="card-icon">♙</span>
            Profile Information
          </h2>
          <div className="profile-content">
            <div className="profile-avatar">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'DS'}
              <span className="camera">📷</span>
            </div>
            <div>
              <div className="profile-name">
                {user?.username || 'Devinder Singh'}
                <span className="verified">✓ Verified</span>
              </div>
              <div className="profile-detail">
                ✉ &nbsp; {user?.email || 'Not linked yet — add an email'}
              </div>
              <div className="profile-detail">
                ☎ &nbsp; {user?.phone || 'Not linked yet — add a phone number'}
              </div>
              <div className="profile-detail">
                ⌖ &nbsp; Ward 24, XYZ Nagar Nigam
              </div>
              <button 
                type="button" 
                className="edit-btn"
                onClick={() => triggerToast('Profile editor opened')}
              >
                ✎ &nbsp; Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* PREFERENCES CARD */}
        <section className="card">
          <h2 className="card-title">
            <span className="card-icon gold">☷</span>
            Preferences
          </h2>
          <div className="preference-grid">
            <div className="preference">
              <div className="preference-title">Preferred Language</div>
              <div className="preference-desc">Choose the language used across the app</div>
              <select value={language} onChange={handleLanguageChange}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Odia">Odia</option>
              </select>
            </div>

            <div className="preference">
              <div className="preference-title">Distance Unit</div>
              <div className="preference-desc">Used for nearby complaints &amp; listings</div>
              <select value={distanceUnit} onChange={handleDistanceChange}>
                <option value="Kilometers (km)">Kilometers (km)</option>
                <option value="Miles (mi)">Miles (mi)</option>
              </select>
            </div>

            <div className="preference">
              <div className="preference-title">Theme</div>
              <div className="preference-desc">Choose how Swachh Sahyog looks</div>
              <div className="choice-row">
                <button 
                  type="button" 
                  className={`choice ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀ Light
                </button>
                <button 
                  type="button" 
                  className={`choice ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  ◐ Dark
                </button>
              </div>
            </div>

            <div className="preference">
              <div className="preference-title">Font Size</div>
              <div className="preference-desc">Adjust text size for readability</div>
              <div className="choice-row">
                <button 
                  type="button" 
                  className={`choice ${fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('small')}
                >
                  Aa Small
                </button>
                <button 
                  type="button" 
                  className={`choice ${fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('medium')}
                >
                  Aa Medium
                </button>
                <button 
                  type="button" 
                  className={`choice ${fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange('large')}
                >
                  Aa Large
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* NOTIFICATIONS / PRIVACY / SECURITY */}
      <div className="lower-grid">
        {/* NOTIFICATIONS */}
        <section className="card">
          <h2 className="card-title">
            <span className="card-icon gold">♧</span>
            Notification Settings
          </h2>
          
          <div className="setting-row">
            <div>
              <span className="setting-name">SWC Complaint Updates</span>
              <span className="setting-desc">Get updates on your complaint status</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${swcUpdates ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('SWC Updates', swcUpdates, setSwcUpdates)}
              aria-label="SWC complaint updates"
            ></button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">SURPLUS Listing Updates</span>
              <span className="setting-desc">Get updates on listings and requests</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${surplusUpdates ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('Surplus Updates', surplusUpdates, setSurplusUpdates)}
              aria-label="SURPLUS listing updates"
            ></button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Messages</span>
              <span className="setting-desc">Receive messages and chat notifications</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${messageNotifications ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('Messages', messageNotifications, setMessageNotifications)}
              aria-label="Messages"
            ></button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Impact &amp; Achievements</span>
              <span className="setting-desc">Get notified about your impact and badges</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${impactAchievements ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('Impact & Achievements', impactAchievements, setImpactAchievements)}
              aria-label="Impact and achievements"
            ></button>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-name">Email Notifications</span>
              <span className="setting-desc">Receive email notifications</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${emailNotifications ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('Email Notifications', emailNotifications, setEmailNotifications)}
              aria-label="Email notifications"
            ></button>
          </div>

          <button 
            type="button" 
            className="manage-btn"
            onClick={() => triggerToast('Notification settings opened')}
          >
            Manage All Notifications →
          </button>
        </section>

        {/* PRIVACY */}
        <section className="card">
          <h2 className="card-title">
            <span className="card-icon blue">♢</span>
            Privacy Settings
          </h2>

          <div className="privacy-row">
            <div>
              <span className="setting-name">Profile Visibility</span>
              <span className="setting-desc">Who can see your profile</span>
            </div>
            <select 
              className="privacy-select" 
              value={profileVisibility} 
              onChange={(e) => handlePrivacySelectChange('profile_visibility', e.target.value)}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="privacy-row">
            <div>
              <span className="setting-name">Contact Information</span>
              <span className="setting-desc">Show phone number to other users</span>
            </div>
            <select 
              className="privacy-select" 
              value={contactVisibility} 
              onChange={(e) => handlePrivacySelectChange('contact_visibility', e.target.value)}
            >
              <option value="nobody">Nobody</option>
              <option value="verified_only">Only Verified Users</option>
            </select>
          </div>

          <div className="privacy-row">
            <div>
              <span className="setting-name">Location Sharing</span>
              <span className="setting-desc">Share precise location with authorities</span>
            </div>
            <select 
              className="privacy-select" 
              value={locationSharing} 
              onChange={(e) => handlePrivacySelectChange('location_sharing', e.target.value)}
            >
              <option value="never">Never</option>
              <option value="while_reporting">While Reporting</option>
              <option value="always">Always</option>
            </select>
          </div>

          <div className="privacy-row">
            <div>
              <span className="setting-name">Activity Status</span>
              <span className="setting-desc">Show my activity status</span>
            </div>
            <button 
              type="button" 
              className={`toggle ${activityStatusVisible ? 'on' : ''}`}
              onClick={() => handleToggleSwitch('Activity Status', activityStatusVisible, setActivityStatusVisible, 'activity_status_visible')}
              aria-label="Activity status"
            ></button>
          </div>
        </section>

        {/* SECURITY */}
        <section className="card">
          <h2 className="card-title">
            <span className="card-icon">🔒</span>
            Security
          </h2>

          {/* CHANGE PASSWORD ACCORDION */}
          <div 
            className="security-row" 
            style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: '54px' }}>
              <div>
                <div className="security-title">Change Password</div>
                <div className="security-desc">Update your account password</div>
              </div>
              <span className="arrow" style={{ transform: showPasswordForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                ›
              </span>
            </div>

            {showPasswordForm && (
              <div 
                style={{ paddingBottom: '14px', paddingTop: '4px' }} 
                onClick={(e) => e.stopPropagation()} // Prevent closing accordion when clicking inside form
              >
                {pwdSuccess && (
                  <div style={{ padding: '8px 12px', marginBottom: '10px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', color: '#237804', borderRadius: '6px', fontSize: '11px' }}>
                    {pwdSuccess}
                  </div>
                )}
                {pwdError && (
                  <div style={{ padding: '8px 12px', marginBottom: '10px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', color: '#a8071a', borderRadius: '6px', fontSize: '11px' }}>
                    {pwdError}
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-2)' }}>Current Password</label>
                    <input 
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      style={{ padding: '7px 9px', borderRadius: '6px', border: '1px solid #e0e5dc', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-2)' }}>New Password</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ padding: '7px 9px', borderRadius: '6px', border: '1px solid #e0e5dc', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={pwdLoading}
                    style={{ 
                      marginTop: '6px', 
                      padding: '7px 12px', 
                      borderRadius: '6px', 
                      border: 'none', 
                      background: 'var(--green)', 
                      color: '#fff', 
                      fontWeight: '800', 
                      fontSize: '10px' 
                    }}
                  >
                    {pwdLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="security-row">
            <div>
              <div className="security-title">Two-Factor Authentication</div>
              <div className="security-desc">Add an extra layer of security</div>
            </div>
            <span className="status">ON</span>
          </div>

          <div 
            className="security-row" 
            style={{ cursor: 'pointer' }}
            onClick={() => triggerToast('Sessions management opened')}
          >
            <div>
              <div className="security-title">Login Sessions</div>
              <div className="security-desc">Manage your active sessions</div>
            </div>
            <span className="arrow">›</span>
          </div>

          <div 
            className="security-row" 
            style={{ cursor: 'pointer' }}
            onClick={() => triggerToast('Recent login history')}
          >
            <div>
              <div className="security-title">Recent Activity</div>
              <div className="security-desc">See recent login activity</div>
            </div>
            <span className="arrow">›</span>
          </div>
        </section>
      </div>

      {/* APP PREFERENCES + HELP */}
      <div className="bottom-grid">
        {/* APP PREFERENCES */}
        <section className="card app-preferences">
          <h2 className="card-title">
            <span className="card-icon">▣</span>
            App Preferences
          </h2>
          <div className="app-grid">
            <div className="app-item">
              <div className="app-icon">⇆</div>
              <div className="app-text">
                <span className="app-title">Data<br />Saver Mode</span>
                <span className="app-desc">Use less data</span>
              </div>
              <button 
                type="button" 
                className={`toggle ${dataSaver ? 'on' : ''}`}
                onClick={() => handleToggleSwitch('Data Saver', dataSaver, setDataSaver)}
                aria-label="Data saver mode"
              ></button>
            </div>

            <div className="app-item">
              <div className="app-icon">⟳</div>
              <div className="app-text">
                <span className="app-title">Auto<br />Refresh</span>
                <span className="app-desc">Refresh content automatically</span>
              </div>
              <button 
                type="button" 
                className={`toggle ${autoRefresh ? 'on' : ''}`}
                onClick={() => handleToggleSwitch('Auto Refresh', autoRefresh, setAutoRefresh)}
                aria-label="Auto refresh"
              ></button>
            </div>

            <div 
              className="app-item" 
              style={{ cursor: 'pointer' }}
              onClick={() => triggerToast('Download settings opened')}
            >
              <div className="app-icon">↓</div>
              <div className="app-text">
                <span className="app-title">Download<br />Settings</span>
                <span className="app-desc">Manage downloads</span>
              </div>
              <span className="arrow">›</span>
            </div>
          </div>
        </section>

        {/* HELP CARD */}
        <section className="card help-card">
          <div className="help-content">
            <div className="help-icon">♧</div>
            <div>
              <div className="help-title">Need Help?</div>
              <div className="help-text">We're here to help you with any questions or issues.</div>
            </div>
          </div>
          <div className="help-buttons">
            <button 
              type="button" 
              className="help-btn"
              onClick={() => triggerToast('Help Center opened')}
            >
              ? Help Center
            </button>
            <button 
              type="button" 
              className="help-btn primary"
              onClick={() => triggerToast('Support request started')}
            >
              ✉ Contact Support
            </button>
          </div>
        </section>
      </div>

      {/* TOAST POPUP BANNER */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
