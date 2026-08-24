import React from 'react';
import './FarmerNavbar.css';

export default function FarmerNavbar({ handleLogout }) {
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
        <button className="icon-button" onClick={() => {
          if (window.confirm('Do you want to logout?')) {
            handleLogout();
          }
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '19px', height: '19px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>
  );
}
