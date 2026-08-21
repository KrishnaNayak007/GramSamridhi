import React, { useState, useEffect } from 'react';
import { useLocationContext } from './LocationContext';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import IntroPage from '../pages/IntroPage/IntroPage';
import logo from '../assets/logo.png';

// Import pages
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import SwcPage from '../pages/SwcPage/SwcPage';
import SurplusPage from '../pages/SurplusPage/SurplusPage';
import ImpactPage from '../pages/ImpactPage/ImpactPage';
import MyActivityPage from '../pages/MyActivityPage/MyActivityPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import GovOverviewPage from '../pages/GovOverviewPage/GovOverviewPage';
import GovQueuePage from '../pages/GovQueuePage/GovQueuePage';
import GovMapPage from '../pages/GovMapPage/GovMapPage';
import GovTeamsPage from '../pages/GovTeamsPage/GovTeamsPage';
import GovAnalyticsPage from '../pages/GovAnalyticsPage/GovAnalyticsPage';
import GovSlaPage from '../pages/GovSlaPage/GovSlaPage';
import GovResolvedPage from '../pages/GovResolvedPage/GovResolvedPage';
import GovSidebar from '../pages/GovOverviewPage/GovSidebar';
import GovNavbar from '../pages/GovOverviewPage/GovNavbar';
import '../pages/GovOverviewPage/GovSidebar.css';
import '../pages/GovOverviewPage/GovNavbar.css';

export default function App() {
  const { activeLocation } = useLocationContext();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [authView, setAuthView] = useState('intro'); // 'intro' | 'login' | 'signup'
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
    if (authView === 'intro') {
      return (
        <IntroPage
          onLoginClick={() => setAuthView('login')}
          onGetStartedClick={() => setAuthView('signup')}
        />
      );
    }
    if (authView === 'signup') {
      return (
        <SignupPage
          onSignupSuccess={() => {
            setIsAuthenticated(true);
            setAuthView('login');
          }}
          onBackToIntro={() => setAuthView('intro')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBackToIntro={() => setAuthView('intro')}
      />
    );
  }

  // Active page router mapping
  const renderActivePage = () => {
    const isOfficer = user?.role === 'officer' || user?.role === 'government' || user?.username?.includes('officer');
    
    if (isOfficer) {
      switch (currentTab) {
        case 'overview':
        case 'dashboard':
          return <GovOverviewPage />;
        case 'queue':
          return <GovQueuePage />;
        case 'map':
          return <GovMapPage />;
        case 'teams':
          return <GovTeamsPage />;
        case 'analytics':
          return <GovAnalyticsPage />;
        case 'resolved':
          return <GovResolvedPage />;
        case 'sla':
          return <GovSlaPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <GovOverviewPage />;
      }
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'swc':
        return <SwcPage onNavigate={setCurrentTab} />;
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

  const isOfficer = user?.role === 'officer' || user?.role === 'government' || user?.username?.includes('officer');

  if (isOfficer) {
    return (
      <div className="gov-shell">
        <GovSidebar 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeLocation={activeLocation}
          user={user}
          handleLogout={handleLogout}
        />
        
        <main className="main">
          <GovNavbar 
            handleLogout={handleLogout}
            activeLocation={activeLocation}
            setCurrentTab={setCurrentTab}
          />
          
          <div className="content">
            {renderActivePage()}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand" style={{ padding: '0 0 15px 0' }}>
          <img className="brand-logo" src={logo} alt="Swachh Sahyog" />
        </div>

        <nav className="nav-group">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`nav-item nav-item-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          >
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/></svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Home</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('swc')}
            className={`nav-item nav-item-btn ${currentTab === 'swc' ? 'active' : ''}`}
            style={{ marginTop: '5px' }}
          >
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/><path d="M10 11v6M14 11v6"/></svg>
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
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/><path d="M12 8c-1.5-3-6-3-6-.5S9 8 12 8Zm0 0c1.5-3 6-3 6-.5S15 8 12 8Z"/></svg>
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
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>
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
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg>
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
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51z"/></svg>
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
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Help & Support</span>
              <span className="nav-sub">FAQs & Support</span>
            </div>
          </button>
        </nav>

        <div className="sidebar-foot">
          <strong>Swachh Sahyog</strong>
          <span>Every action counts.</span>
          <span>Together, we build a cleaner, greener city for everyone.</span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* TOPBAR HEADER */}
        <header className="topbar">
          <button className="hamburger" aria-label="Menu" onClick={() => alert('Sidebar menu')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div className="header-left">
            <div className="loc-pill" onClick={() => alert('Location options')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{activeLocation ? activeLocation.name : 'Ward 24, XYZ Nagar Nigam'}</span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            
            <div className="header-tagline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 4a7 7 0 0 1-10 14Z" /><path d="M9 22a1 1 0 0 1-1-1v-3" /></svg>
              <span>Clean City. Green Future.</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="mode-toggle" title="Toggle theme" onClick={() => alert('Dark mode coming soon')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>

            <button className="bell-wrap" onClick={() => alert('3 new notifications pending')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m10.3 13a3 3 0 0 1-5.6 0"/></svg>
              <span className="badge-dot">3</span>
            </button>

            <div className="user-chip" onClick={() => {
              if (window.confirm('Do you want to logout?')) {
                handleLogout();
              }
            }}>
              <div className="avatar">GS</div>
              <div className="user-chip-text">
                <span className="user-name">{user ? user.username : 'Goutam Soni'}</span>
                <span className="user-role">Ward 24 Resident</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
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
