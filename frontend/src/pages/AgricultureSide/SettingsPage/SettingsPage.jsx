import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { apiFetch } from '../../../shared/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('panel-account');

  // Preferences States
  const [language, setLanguage] = useState(localStorage.getItem('gramsamridhiLanguage') || 'English');
  const [distanceUnit, setDistanceUnit] = useState(localStorage.getItem('gramsamridhiDistanceUnit') || 'km');
  const [theme, setTheme] = useState(localStorage.getItem('gramsamridhiTheme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('gramsamridhiFontSize') || 'medium');

  // Privacy States
  const [profileVisibility, setProfileVisibility] = useState('private');
  const [contactVisibility, setContactVisibility] = useState('nobody');
  const [locationSharing, setLocationSharing] = useState('reporting');
  const [activityStatus, setActivityStatus] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  // Accessibility States
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largerText, setLargerText] = useState(false);

  // Notification States
  const [notifs, setNotifs] = useState({
    swc: true,
    surplus: true,
    farmer: true,
    pickup: true,
    payments: true,
    schemes: false,
    platform: false
  });

  // App Behavior
  const [dataSaver, setDataSaver] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confirmSubmit, setConfirmSubmit] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', confirmLabel: '', neutral: false, onConfirm: () => {} });

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState(null);

  // Load User Data & Saved settings on Mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    // Apply global accessibility & theme classes on mount
    applyThemeClass(theme);
    applyAccessibilityClasses({ reduceMotion, highContrast, largerText });
    applyFontSizeClass(fontSize);

    // Fetch synced settings from backend if available
    async function loadBackendSettings() {
      try {
        const res = await apiFetch('/api/v1/accounts/preferences/');
        if (res.ok) {
          const data = await res.json();
          if (data.profile_visibility) setProfileVisibility(data.profile_visibility);
          if (data.contact_visibility) setContactVisibility(data.contact_visibility);
          if (data.location_sharing) setLocationSharing(data.location_sharing);
        }
      } catch (err) {
        console.error('Error fetching backend preferences:', err);
      }
    }
    loadBackendSettings();
  }, []);

  const triggerToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    const timer = setTimeout(() => setToastVisible(false), 2200);
    setToastTimer(timer);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const applyThemeClass = (selTheme) => {
    document.body.classList.toggle('dark', selTheme === 'dark');
  };

  const handleThemeChange = (selTheme) => {
    setTheme(selTheme);
    localStorage.setItem('gramsamridhiTheme', selTheme);
    applyThemeClass(selTheme);
    triggerToast(selTheme === 'dark' ? 'Dark mode enabled' : selTheme === 'light' ? 'Light mode enabled' : 'Using system theme');
  };

  const applyFontSizeClass = (size) => {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + size);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('gramsamridhiFontSize', size);
    applyFontSizeClass(size);
    const label = size.charAt(0).toUpperCase() + size.slice(1);
    triggerToast('Font size: ' + label);
  };

  const applyAccessibilityClasses = (acc) => {
    document.body.classList.toggle('reduce-motion', !!acc.reduceMotion);
    document.body.classList.toggle('high-contrast', !!acc.highContrast);
    document.body.classList.toggle('larger-text', !!acc.largerText);
  };

  const handleAccessibilityToggle = (key, label) => {
    let nextVal = false;
    let nextAcc = { reduceMotion, highContrast, largerText };
    if (key === 'reduceMotion') {
      nextVal = !reduceMotion;
      setReduceMotion(nextVal);
      nextAcc.reduceMotion = nextVal;
    } else if (key === 'highContrast') {
      nextVal = !highContrast;
      setHighContrast(nextVal);
      nextAcc.highContrast = nextVal;
    } else if (key === 'largerText') {
      nextVal = !largerText;
      setLargerText(nextVal);
      nextAcc.largerText = nextVal;
    }
    applyAccessibilityClasses(nextAcc);
    triggerToast(label + ' ' + (nextVal ? 'enabled' : 'disabled'));
  };

  const handlePrivacySelect = async (field, val) => {
    let updatedPayload = {};
    if (field === 'visibility') {
      setProfileVisibility(val);
      updatedPayload.profile_visibility = val;
    } else if (field === 'contact') {
      setContactVisibility(val);
      updatedPayload.contact_visibility = val;
    } else if (field === 'location') {
      setLocationSharing(val);
      updatedPayload.location_sharing = val;
    }
    try {
      await apiFetch('/api/v1/accounts/preferences/', {
        method: 'PATCH',
        body: JSON.stringify(updatedPayload)
      });
      triggerToast('Privacy settings updated');
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger confirmation modal
  const triggerConfirmation = (key) => {
    const configs = {
      'signout-all': {
        title: 'Sign out of all devices?',
        message: "You'll be signed out everywhere, including this device. You'll need to sign in again on each device.",
        confirmLabel: 'Sign Out Everywhere',
        neutral: true,
        onConfirm: () => triggerToast('Signed out of all devices')
      },
      'delete-account': {
        title: 'Delete your account?',
        message: 'This permanently removes your GramSamridhi account, including your complaints, listings and activity history. This cannot be undone.',
        confirmLabel: 'Delete Account',
        neutral: false,
        onConfirm: () => triggerToast('Account deletion requested')
      }
    };
    if (configs[key]) {
      setModalConfig(configs[key]);
      setIsModalOpen(true);
    }
  };

  const enabledNotifCount = Object.values(notifs).filter(Boolean).length;
  const username = user?.username || 'Goutam Soni';
  const userInitials = username.substring(0, 2).toUpperCase();
  const roleName = user?.role === 'farmer' ? 'Smart Farmer' : (user?.role === 'govt' ? 'Govt Official' : 'Ward Resident');

  return (
    <div className="settings-page-wrapper">
      <div className="breadcrumb">Home &nbsp;&rsaquo;&nbsp; <span>Settings</span></div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-small">ACCOUNT &amp; PREFERENCES</div>
          <h1>Settings</h1>
          <p>Manage your GramSamridhi account, preferences, privacy and security.</p>
        </div>
        <svg className="hero-motif" viewBox="0 0 160 160" aria-hidden="true">
          <circle cx="110" cy="50" r="26" stroke="#e6a21b" strokeWidth="1.4" opacity=".5" fill="none"/>
          <circle cx="110" cy="50" r="42" stroke="#16834d" strokeWidth="1.2" opacity=".35" fill="none"/>
          <path d="M70 140c14-30 40-42 66-38-4 26-24 44-52 48-8-3-12-6-14-10Z" fill="#16834d" opacity=".12"/>
        </svg>
      </section>

      {/* Tabs list */}
      <div className="settings-nav" role="tablist" aria-label="Settings sections">
        <button className={'settings-tab ' + (activeTab === 'panel-account' ? 'is-active' : '')} onClick={() => handleTabClick('panel-account')}>
          <span className="settings-tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round"/></svg></span>
          <span className="settings-tab-text"><b>Account</b><small>Profile &amp; contact information</small></span>
        </button>
        <button className={'settings-tab ' + (activeTab === 'panel-preferences' ? 'is-active' : '')} onClick={() => handleTabClick('panel-preferences')}>
          <span className="settings-tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7h10M18 7h2M4 17h2M8 17h12" strokeLinecap="round"/><circle cx="16" cy="7" r="2.2"/><circle cx="6" cy="17" r="2.2"/></svg></span>
          <span className="settings-tab-text"><b>Preferences</b><small>Language, theme &amp; accessibility</small></span>
        </button>
        <button className={'settings-tab ' + (activeTab === 'panel-notifications' ? 'is-active' : '')} onClick={() => handleTabClick('panel-notifications')}>
          <span className="settings-tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z" strokeLinejoin="round"/><path d="M9.5 20.5a2.5 2.5 0 0 0 5 0" strokeLinecap="round"/></svg></span>
          <span className="settings-tab-text"><b>Notifications</b><small>Choose what alerts you receive</small></span>
        </button>
        <button className={'settings-tab ' + (activeTab === 'panel-privacy' ? 'is-active' : '')} onClick={() => handleTabClick('panel-privacy')}>
          <span className="settings-tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3l7 3.2v5.3c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6.2L12 3Z" strokeLinejoin="round"/></svg></span>
          <span className="settings-tab-text"><b>Privacy</b><small>Control your information</small></span>
        </button>
        <button className={'settings-tab ' + (activeTab === 'panel-security' ? 'is-active' : '')} onClick={() => handleTabClick('panel-security')}>
          <span className="settings-tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg></span>
          <span className="settings-tab-text"><b>Security</b><small>Password &amp; login protection</small></span>
        </button>
      </div>

      {/* ACCOUNT PANEL */}
      {activeTab === 'panel-account' && (
        <div className="settings-panel is-active" id="panel-account">
          <section className="card">
            <h2 className="card-title">
              <span className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" strokeLinecap="round"/></svg></span>
              Account Information
            </h2>
            <div className="profile-content">
              <div className="profile-avatar">
                {userInitials}
                <span className="camera"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="8" width="18" height="12" rx="2.4"/><circle cx="12" cy="14" r="3.2"/><path d="M9 8l1.3-2.5h3.4L15 8"/></svg></span>
              </div>
              <div className="profile-info">
                <div className="profile-name">
                  {username}
                  <span className="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/></svg> Verified</span>
                </div>
                <div className="profile-role">{roleName}</div>

                <div className="profile-detail-row">
                  <span className="profile-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 6.5L20.5 6"/></svg> Email: <em>Not linked yet</em></span>
                  <button className="link-btn" onClick={() => triggerToast('Link email opened')}>Add Email</button>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6.5 3h3l1.5 4.5-2 1.5a13 13 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" strokeLinejoin="round"/></svg> Phone: <em>Not linked yet</em></span>
                  <button className="link-btn" onClick={() => triggerToast('Link phone opened')}>Add Phone</button>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/></svg> Bhadana Village, Karnal</span>
                </div>

                <button className="edit-btn" onClick={() => triggerToast('Profile editor opened')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 20l1-4L16.5 4.5a1.7 1.7 0 0 1 2.4 2.4L7.4 18.5l-4 1.5Z" strokeLinejoin="round"/></svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PREFERENCES PANEL */}
      {activeTab === 'panel-preferences' && (
        <div className="settings-panel" id="panel-preferences">
          <section className="card">
            <h2 className="card-title">
              <span className="card-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7h10M18 7h2M4 17h2M8 17h12" strokeLinecap="round"/><circle cx="16" cy="7" r="2.2"/><circle cx="6" cy="17" r="2.2"/></svg></span>
              Preferences
            </h2>

            <div className="preference-grid">
              <div className="preference">
                <div className="preference-title">Preferred Language</div>
                <div className="preference-desc">Choose the language used across the app</div>
                <select value={language} onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('gramsamridhiLanguage', e.target.value);
                  triggerToast('Language updated');
                }}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Odia">Odia</option>
                </select>
              </div>

              <div className="preference">
                <div className="preference-title">Distance Unit</div>
                <div className="preference-desc">Used for nearby complaints &amp; listings</div>
                <select value={distanceUnit} onChange={(e) => {
                  setDistanceUnit(e.target.value);
                  localStorage.setItem('gramsamridhiDistanceUnit', e.target.value);
                  triggerToast('Distance unit updated');
                }}>
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              <div className="preference">
                <div className="preference-title">Appearance</div>
                <div className="preference-desc">Choose how GramSamridhi looks</div>
                <div className="choice-row">
                  <button className={'choice ' + (theme === 'light' ? 'active' : '')} onClick={() => handleThemeChange('light')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" strokeLinecap="round"/></svg>
                    Light
                  </button>
                  <button className={'choice ' + (theme === 'dark' ? 'active' : '')} onClick={() => handleThemeChange('dark')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" strokeLinejoin="round"/></svg>
                    Dark
                  </button>
                  <button className={'choice ' + (theme === 'system' ? 'active' : '')} onClick={() => handleThemeChange('system')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8 20h8M12 16.5V20" strokeLinecap="round"/></svg>
                    System
                  </button>
                </div>
              </div>

              <div className="preference">
                <div className="preference-title">Text Size</div>
                <div className="preference-desc">Adjust text size for readability</div>
                <div className="choice-row">
                  <button className={'choice ' + (fontSize === 'small' ? 'active' : '')} onClick={() => handleFontSizeChange('small')}>Aa Small</button>
                  <button className={'choice ' + (fontSize === 'medium' ? 'active' : '')} onClick={() => handleFontSizeChange('medium')}>Aa Medium</button>
                  <button className={'choice ' + (fontSize === 'large' ? 'active' : '')} onClick={() => handleFontSizeChange('large')}>Aa Large</button>
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">
              <span className="card-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M8.5 12h7M12 8.5v7" strokeLinecap="round"/></svg></span>
              Accessibility
            </h2>
            <div className="setting-row">
              <div><span className="setting-name">Reduce Motion</span><span className="setting-desc">Minimize transitions and animations</span></div>
              <button className={'toggle ' + (reduceMotion ? 'on' : '')} onClick={() => handleAccessibilityToggle('reduceMotion', 'Reduce motion')} aria-checked={reduceMotion ? 'true' : 'false'} role="switch"></button>
            </div>
            <div className="setting-row">
              <div><span className="setting-name">High Contrast</span><span className="setting-desc">Increase contrast for better visibility</span></div>
              <button className={'toggle ' + (highContrast ? 'on' : '')} onClick={() => handleAccessibilityToggle('highContrast', 'High contrast')} aria-checked={highContrast ? 'true' : 'false'} role="switch"></button>
            </div>
            <div className="setting-row">
              <div><span className="setting-name">Larger Text</span><span className="setting-desc">Increase the base text size app-wide</span></div>
              <button className={'toggle ' + (largerText ? 'on' : '')} onClick={() => handleAccessibilityToggle('largerText', 'Larger text')} aria-checked={largerText ? 'true' : 'false'} role="switch"></button>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">
              <span className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8M8 8h8M8 16h5" strokeLinecap="round"/></svg></span>
              App Behavior
            </h2>
            <div className="setting-row">
              <div><span className="setting-name">Data Saver Mode</span><span className="setting-desc">Use less data across the app</span></div>
              <button className={'toggle ' + (dataSaver ? 'on' : '')} onClick={() => {
                setDataSaver(!dataSaver);
                triggerToast(dataSaver ? 'Data Saver disabled' : 'Data Saver enabled');
              }} aria-checked={dataSaver ? 'true' : 'false'} role="switch"></button>
            </div>
            <div className="setting-row">
              <div><span className="setting-name">Auto-refresh Activity</span><span className="setting-desc">Keep your activity feed updated automatically</span></div>
              <button className={'toggle ' + (autoRefresh ? 'on' : '')} onClick={() => {
                setAutoRefresh(!autoRefresh);
                triggerToast(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
              }} aria-checked={autoRefresh ? 'true' : 'false'} role="switch"></button>
            </div>
            <div className="setting-row">
              <div><span className="setting-name">Confirm Before Submitting</span><span className="setting-desc">Ask for confirmation before complaints or listings go live</span></div>
              <button className={'toggle ' + (confirmSubmit ? 'on' : '')} onClick={() => {
                setConfirmSubmit(!confirmSubmit);
                triggerToast(confirmSubmit ? 'Submit confirmations disabled' : 'Submit confirmations enabled');
              }} aria-checked={confirmSubmit ? 'true' : 'false'} role="switch"></button>
            </div>
          </section>
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {activeTab === 'panel-notifications' && (
        <div className="settings-panel" id="panel-notifications">
          <section className="card">
            <h2 className="card-title">
              <span className="card-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z" strokeLinejoin="round"/><path d="M9.5 20.5a2.5 2.5 0 0 0 5 0" strokeLinecap="round"/></svg></span>
              Notifications
            </h2>
            <p className="panel-intro">Choose what GramSamridhi can notify you about.</p>
            <p className="panel-summary"><span>7</span> notification categories &middot; <span>{enabledNotifCount}</span> enabled</p>

            {Object.keys(notifs).map(key => {
              const labels = {
                swc: { name: 'SWC Complaint Updates', desc: 'Get updates when your complaint status changes' },
                surplus: { name: 'SURPLUS Activity', desc: 'Get updates about your listings and requests' },
                farmer: { name: 'Farmer Activity', desc: 'Get updates about residue collection and farmer services' },
                pickup: { name: 'Pickup & Collection', desc: 'Receive pickup scheduling and status alerts' },
                payments: { name: 'Payments', desc: 'Get notified about farmer payment updates' },
                schemes: { name: 'Government Schemes', desc: 'Receive relevant scheme announcements' },
                platform: { name: 'GramSamridhi Updates', desc: 'Important platform announcements and service updates' }
              };
              return (
                <div className="setting-row" key={key}>
                  <div><span className="setting-name">{labels[key].name}</span><span className="setting-desc">{labels[key].desc}</span></div>
                  <button className={'toggle ' + (notifs[key] ? 'on' : '')} onClick={() => {
                    const nextVal = !notifs[key];
                    setNotifs({ ...notifs, [key]: nextVal });
                    triggerToast(labels[key].name + ' ' + (nextVal ? 'enabled' : 'disabled'));
                  }} aria-checked={notifs[key] ? 'true' : 'false'} role="switch"></button>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* PRIVACY PANEL */}
      {activeTab === 'panel-privacy' && (
        <div className="settings-panel" id="panel-privacy">
          <section className="card">
            <h2 className="card-title">
              <span className="card-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3l7 3.2v5.3c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6.2L12 3Z" strokeLinejoin="round"/></svg></span>
              Privacy
            </h2>

            <div className="privacy-row">
              <div><span className="setting-name">Profile Visibility</span><span className="setting-desc">Who can see your profile</span></div>
              <select className="privacy-select" value={profileVisibility} onChange={(e) => handlePrivacySelect('visibility', e.target.value)}>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="privacy-row">
              <div><span className="setting-name">Contact Information</span><span className="setting-desc">Who can see your phone number</span></div>
              <select className="privacy-select" value={contactVisibility} onChange={(e) => handlePrivacySelect('contact', e.target.value)}>
                <option value="nobody">Nobody</option>
                <option value="verified">Only Verified Users</option>
              </select>
            </div>

            <div className="privacy-row">
              <div>
                <span className="setting-name">Location Sharing</span>
                <span className="setting-desc">Precise location is used only when required for complaint reporting or service delivery.</span>
              </div>
              <select className="privacy-select" value={locationSharing} onChange={(e) => handlePrivacySelect('location', e.target.value)}>
                <option value="never">Never</option>
                <option value="reporting">While Reporting</option>
                <option value="always">Always</option>
              </select>
            </div>

            <div className="setting-row">
              <div><span className="setting-name">Activity Status</span><span className="setting-desc">Show your activity status to others</span></div>
              <button className={'toggle ' + (activityStatus ? 'on' : '')} onClick={() => {
                setActivityStatus(!activityStatus);
                triggerToast('Activity Status updated');
              }} aria-checked={activityStatus ? 'true' : 'false'} role="switch"></button>
            </div>

            <div className="setting-row">
              <div><span className="setting-name">Data Sharing</span><span className="setting-desc">Control whether anonymous usage data is shared to improve GramSamridhi</span></div>
              <button className={'toggle ' + (dataSharing ? 'on' : '')} onClick={() => {
                setDataSharing(!dataSharing);
                triggerToast('Data Sharing settings updated');
              }} aria-checked={dataSharing ? 'true' : 'false'} role="switch"></button>
            </div>
          </section>
        </div>
      )}

      {/* SECURITY PANEL */}
      {activeTab === 'panel-security' && (
        <div className="settings-panel" id="panel-security">
          <section className="card">
            <h2 className="card-title">
              <span className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg></span>
              Security
            </h2>

            <button className="security-row" onClick={() => triggerToast('Password change started')}>
              <div><div className="security-title">Change Password</div><div className="security-desc">Update your account password</div></div>
              <span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>

            <div className="security-row security-row--static">
              <div><div className="security-title">Two-Factor Authentication</div><div className="security-desc">Add an extra layer of protection</div></div>
              <span className="status">ON</span>
            </div>

            <button className="security-row" onClick={() => triggerToast('Managing login sessions')}>
              <div><div className="security-title">Login Sessions</div><div className="security-desc">Manage active devices and sessions</div></div>
              <span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>

            <div className="security-row security-row--static">
              <div><div className="security-title">Recent Login Activity</div><div className="security-desc">Today &middot; Chrome &middot; Current device</div></div>
            </div>

            <button className="security-row" onClick={() => triggerToast('Managing account recovery')}>
              <div><div className="security-title">Account Recovery</div><div className="security-desc">Manage recovery options</div></div>
              <span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </section>

          <section className="card danger-zone">
            <h2 className="card-title danger-title">
              <span className="card-icon danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round"/><path d="M12 10v4M12 17v.1" strokeLinecap="round"/></svg></span>
              Danger Zone
            </h2>

            <button className="danger-row danger-row--critical" onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}>
              <span>Sign Out</span><span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
            <button className="danger-row" onClick={() => triggerConfirmation('signout-all')}>
              <span>Sign Out of All Devices</span><span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
            <button className="danger-row danger-row--critical" onClick={() => triggerConfirmation('delete-account')}>
              <span>Delete Account</span><span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </section>
        </div>
      )}

      {/* HELP & SUPPORT (always visible) */}
      <section className="card help-card">
        <div className="support-header">
          <div className="support-header-left">
            <div className="support-header-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M8.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6"/><circle cx="12" cy="17" r=".7" fill="currentColor"/></svg>
            </div>
            <div>
              <div className="support-title">Support Center</div>
              <div className="support-subtitle">We're here to help</div>
            </div>
          </div>
          <div className="support-status"><span className="status-dot" aria-hidden="true"></span>Support available</div>
        </div>
        <p className="support-desc">Get quick answers, contact our team, or find help with your GramSamridhi account.</p>

        <div className="support-grid">
          <button className="support-card" onClick={() => triggerToast('Opening FAQs')}>
            <span className="support-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/><path d="M8.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6"/><circle cx="12" cy="17" r=".7" fill="currentColor"/></svg></span>
            <span className="support-card-title">FAQs</span>
            <span className="support-card-desc">Find quick answers to common questions.</span>
            <span className="support-card-link">Browse FAQs <span className="support-card-arrow" aria-hidden="true">&rarr;</span></span>
          </button>

          <button className="support-card support-card--primary" onClick={() => triggerToast('Support request started')}>
            <span className="support-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3"/><path d="M4 17v-4h3v6H6a2 2 0 0 1-2-2Z"/><path d="M9 20a2 2 0 0 0 2 1h1"/></svg></span>
            <span className="support-card-title">Contact Support</span>
            <span className="support-card-desc">Need help with your account, reports or payments?</span>
            <span className="support-card-link">Contact us <span className="support-card-arrow" aria-hidden="true">&rarr;</span></span>
          </button>

          <button className="support-card" onClick={() => triggerToast('Report a problem opened')}>
            <span className="support-card-icon support-card-icon--warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round"/><path d="M12 10v4M12 17v.1" strokeLinecap="round"/></svg></span>
            <span className="support-card-title">Report a Problem</span>
            <span className="support-card-desc">Tell us if something isn't working correctly.</span>
            <span className="support-card-link">Report issue <span className="support-card-arrow" aria-hidden="true">&rarr;</span></span>
          </button>
        </div>

        <div className="support-banner">
          <span className="support-banner-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3"/><path d="M4 17v-4h3v6H6a2 2 0 0 1-2-2Z"/><path d="M9 20a2 2 0 0 0 2 1h1"/></svg></span>
          <div className="support-banner-text">
            <strong>Need personal assistance?</strong>
            <p>Our support team can help with complaints, collection requests, payments and account issues.</p>
          </div>
          <button className="support-banner-btn" onClick={() => triggerToast('Support request started')}>Contact Support <span aria-hidden="true">&rarr;</span></button>
        </div>

        <div className="support-topics">
          <div className="support-topics-label">Popular help topics</div>
          <div className="support-topics-row">
            <span className="topic-pill">Waste Reports</span>
            <span className="topic-pill">Crop Residue</span>
            <span className="topic-pill">Collection Schedule</span>
            <span className="topic-pill">Payments</span>
          </div>
        </div>

        <div className="support-legal">
          <div className="support-legal-label">Information &amp; Policies</div>
          <div className="support-legal-links">
            <button className="legal-link" onClick={() => triggerToast('Opening Privacy Policy')}>
              <span className="legal-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" strokeLinejoin="round"/><path d="m9 12 2 2 4-4"/></svg></span>
              <span className="legal-link-text"><strong>Privacy Policy</strong><small>How your information is handled</small></span>
              <span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
            <button className="legal-link" onClick={() => triggerToast('Opening Terms of Use')}>
              <span className="legal-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 3h7l4 4v14H7z" strokeLinejoin="round"/><path d="M14 3v4h4"/><path d="M9.5 13h5M9.5 16.5h5"/></svg></span>
              <span className="legal-link-text"><strong>Terms of Use</strong><small>Rules for using GramSamridhi</small></span>
              <span className="arrow" aria-hidden="true">&rsaquo;</span>
            </button>
          </div>
        </div>
      </section>

      {/* CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" id="modalBackdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalMessage">
            <h3 className="modal-title" id="modalTitle">{modalConfig.title}</h3>
            <p className="modal-message" id="modalMessage">{modalConfig.message}</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={'modal-btn modal-btn--confirm ' + (modalConfig.neutral ? 'is-neutral' : '')} onClick={() => {
                modalConfig.onConfirm();
                setIsModalOpen(false);
              }}>{modalConfig.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={'toast ' + (toastVisible ? 'show' : '')} id="toast">{toastMessage}</div>
    </div>
  );
}
