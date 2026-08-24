import React from 'react';
import './FarmerNavbar.css';

export default function FarmerNavbar({ handleLogout, user }) {
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const username = user?.username || 'devinder_singh';
  const isDemoDevinder = username.toLowerCase() === 'devinder_singh';

  const name = isDemoDevinder ? 'Devinder Singh' : username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const initials = isDemoDevinder ? 'DS' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const farmerId = isDemoDevinder ? 'SS-10492' : `SS-${(getHash(username) % 90000) + 10000}`;

  return (
    <header className="farmer-topbar">
      <div className="welcome">
        <p>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px', display: 'inline-block', verticalAlign: '-1.5px', marginRight: '4px' }}>
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/>
          </svg>
          Bhadana Village, Karnal, Haryana
        </p>
        <h1>Your Farm Dashboard</h1>
        <span>Manage crop residue, earn compost and improve your soil health.</span>
      </div>
      <div className="top-actions">
        <button className="icon-button" onClick={() => alert('2 new notifications pending')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '19px', height: '19px' }}><path d="M6 9.5a6 6 0 0 1 12 0c0 4.2 1.2 5.6 2 6.5H4c.8-.9 2-2.3 2-6.5Z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/></svg>
          <em>2</em>
        </button>

        <div className="user-chip" onClick={() => {
          if (window.confirm('Do you want to logout?')) {
            handleLogout();
          }
        }}>
          <div className="avatar">{initials}</div>
          <div className="user-chip-text">
            <span className="user-name">{name}</span>
            <span className="user-role">Farmer ID: {farmerId}</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', opacity: 0.7 }}><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </header>
  );
}
