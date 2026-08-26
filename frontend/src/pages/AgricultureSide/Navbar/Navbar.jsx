import React from 'react';
import './Navbar.css';

export default function Navbar({ handleLogout, user, currentTab, setCurrentTab, setSidebarOpen }) {
  const username = user?.username || 'devinder_singh';
  const isDemoDevinder = username.toLowerCase() === 'devinder_singh';
  const name = isDemoDevinder ? 'Devinder Singh' : username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const initials = isDemoDevinder ? 'DS' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const activeLocation = 'Bhadana Village · Karnal';

  const tabList = [
    { tab: 'dashboard', label: 'GramSamridhi', icon: '▦' },
    { tab: 'swc', label: 'Report Issue', icon: '△' },
    { tab: 'residue', label: 'Residue', icon: '♆' },
    { tab: 'surplus', label: 'Surplus', icon: '◇' },
    { tab: 'schedule', label: 'Collection', icon: '▣' },
    { tab: 'impact', label: 'Impact', icon: '⌁' }
  ];

  return (
    <header className="topbar">
      <button className="menu-btn" id="menuBtn" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>☰</button>

      <div className="tabs">
        {tabList.map((item, idx) => (
          <button 
            key={idx}
            className={`tab ${currentTab === item.tab ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.tab)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {item.icon} <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="top-actions">
        <label className="search">
          <span>⌕</span>
          <input placeholder="Search..." aria-label="Search" />
        </label>
        <div className="location">⌖ <span>{activeLocation}</span></div>
        
        <button className="notification" aria-label="Notifications" onClick={() => alert('2 new notifications pending')}>
          ♧<i></i>
        </button>

        <div className="profile" onClick={() => {
          if (window.confirm('Do you want to logout?')) {
            handleLogout();
          }
        }} style={{ cursor: 'pointer' }}>
          <div className="avatar">{initials}</div>
          <div className="profile-text-only">
            <b>{name}</b>
          </div>
        </div>
      </div>
    </header>
  );
}
