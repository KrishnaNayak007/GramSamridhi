import React from 'react';
import logo from '../../assets/logo.png';

export default function GovSidebar({ currentTab, setCurrentTab, activeLocation, user, handleLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <img src={logo} alt="SwachSahyog Logo" />
        </div>
        <div className="brand-text">
          <div className="tag">AUTHORITY CONSOLE</div>
        </div>
      </div>

      <div className="nav-label">Workflow</div>
      <nav className="nav">
        <button 
          onClick={() => setCurrentTab('overview')} 
          className={`nav-item ${currentTab === 'overview' || currentTab === 'dashboard' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
          Overview
        </button>
        <button 
          onClick={() => setCurrentTab('queue')} 
          className={`nav-item urgent ${currentTab === 'queue' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 17h.01"/></svg>
          Complaint Queue
          <span className="count">7</span>
        </button>
        <button 
          onClick={() => setCurrentTab('map')} 
          className={`nav-item ${currentTab === 'map' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Live Map
        </button>
        <button 
          onClick={() => setCurrentTab('teams')} 
          className={`nav-item ${currentTab === 'teams' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Sanitation Teams
        </button>
        <button 
          onClick={() => setCurrentTab('analytics')} 
          className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 15l4-6 4 3 5-8"/></svg>
          Analytics
        </button>
      </nav>

      <div className="nav-label">Records</div>
      <nav className="nav">
        <button 
          onClick={() => setCurrentTab('resolved')} 
          className={`nav-item ${currentTab === 'resolved' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Resolved Cases
        </button>
        <button 
          onClick={() => setCurrentTab('sla')} 
          className={`nav-item ${currentTab === 'sla' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          SLA Tracker
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="jurisdiction-chip">
          <div className="lbl">Assigned Jurisdiction</div>
          <div className="val">{activeLocation ? activeLocation.name : 'Ward 14 · Bhubaneshwar Municipal Corp.'}</div>
        </div>
        <div 
          className="official"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (window.confirm('Do you want to logout?')) {
              handleLogout();
            }
          }}
          title="Click to logout"
        >
          <div className="avatar">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : 'RB'}
          </div>
          <div className="who">
            <div className="n">{user?.username || 'R. Banerjee'}</div>
            <div className="r">Sanitation Department</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
