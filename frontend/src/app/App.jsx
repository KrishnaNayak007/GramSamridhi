import React, { useState, useEffect } from 'react';
import { useLocationContext } from './LocationContext';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import { logoBase64 } from '../assets/logo_base64';

// Import pages
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import SwcPage from '../pages/SwcPage/SwcPage';
import SurplusPage from '../pages/SurplusPage/SurplusPage';
import ImpactPage from '../pages/ImpactPage/ImpactPage';
import MyActivityPage from '../pages/MyActivityPage/MyActivityPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';

export default function App() {
  const { activeLocation } = useLocationContext();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  // Sync auth state and load user details
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
      } catch (err) {
        setUser({ username: 'odisha_citizen' });
      }
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <SignupPage
          onSignupSuccess={() => setAuthView('login')}
          switchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
        switchToSignup={() => setAuthView('signup')}
      />
    );
  }

  // Active page router mapping
  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'swc':
        return <SwcPage />;
      case 'surplus':
        return <SurplusPage />;
      case 'impact':
        return <ImpactPage />;
      case 'activity':
        return <MyActivityPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            fontFamily: 'var(--font-body)',
            minHeight: '60vh'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink-950)', marginBottom: '10px' }}>
              Help & Support
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-500)', lineHeight: '1.6' }}>
              If you have any issues with complaint registration, municipal coordination, or surplus claiming, 
              please reach out to your local Ward Officer or submit a ticket here.
            </p>
          </div>
        );
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand" style={{ padding: '0 0 15px 0' }}>
          <img className="brand-logo" src={logoBase64} alt="Swachh Sahyog" />
        </div>

        <nav className="nav-group">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`nav-item nav-item-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon" role="img" aria-label="home">🏠</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Home</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('swc')}
            className={`nav-item nav-item-btn ${currentTab === 'swc' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="bin">🗑️</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>SWC</span>
              <span className="nav-sub">Smart Waste Complaint</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('surplus')}
            className={`nav-item nav-item-btn ${currentTab === 'surplus' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="food">🎁</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>SURPLUS</span>
              <span className="nav-sub">Give It a Second Life</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`nav-item nav-item-btn ${currentTab === 'activity' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="activity">📝</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>My Activity</span>
              <span className="nav-sub">Reports & Listings</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('impact')}
            className={`nav-item nav-item-btn ${currentTab === 'impact' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="analytics">📊</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Impact</span>
              <span className="nav-sub">My Impact Stats</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`nav-item nav-item-btn ${currentTab === 'settings' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="settings">⚙️</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Settings</span>
              <span className="nav-sub">Account Settings</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('help')}
            className={`nav-item nav-item-btn ${currentTab === 'help' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <span className="nav-icon" role="img" aria-label="help">❓</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Help & Support</span>
              <span className="nav-sub">FAQs & Support</span>
            </div>
          </button>
        </nav>

        <div className="sidebar-foot" style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid var(--border-soft)', fontSize: '11.5px', color: 'var(--ink-300)' }}>
          <strong>Swachh Sahyog</strong>
          <span>Every action counts.</span>
          <span>Together, we build a cleaner, greener city for everyone.</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="location-pill">
              <span className="pin" role="img" aria-label="pin">📍</span>
              <span>{activeLocation ? activeLocation.name : 'Ward 24, XYZ Nagar Nigam'}</span>
              <span className="chev" style={{ fontSize: '9px', marginLeft: '3px' }}>▼</span>
            </div>
            <span className="tagline">Clean City. Green Future.</span>
          </div>

          <div className="header-right">
            <button className="icon-btn" aria-label="notifications">
              <span role="img" aria-label="bell">🔔</span>
              <span className="dot">3</span>
            </button>

            <div className="profile">
              <div className="avatar">GS</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="profile-name">{user ? user.username : 'Goutam Soni'}</span>
                <span className="profile-role">Ward 24 Resident</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 0 0 10px',
                  fontSize: '11px',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ACTIVE ROUTE CONTENT */}
        <div className="content">
          {renderActivePage()}
        </div>
      </main>

      {/* FLOATING AI CIVIC ASSISTANT */}
      <div className="civic-assistant" onClick={() => alert('Ask SwachSahyog: Speak in regional languages or voice commands to report waste!')}>
        <div className="ca-icon">🎙️</div>
        <div>
          <span className="ca-title">Ask SwachSahyog</span>
          <span className="ca-sub">Voice & regional language</span>
        </div>
      </div>
    </div>
  );
}
