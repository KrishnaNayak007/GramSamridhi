import React from 'react';

export default function GovNavbar({ handleLogout, activeLocation, user, setCurrentTab }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const areaLabel = activeLocation?.name || user?.assigned_area?.name || user?.assigned_ward || "Bhubaneswar Municipal Corp.";

  return (
    <header className="topbar">
      <div>
        <h1>Complaint Overview</h1>
        <div className="sub">{areaLabel} · {currentDate}</div>
      </div>
      <div className="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search by complaint ID, locality, or officer…" />
      </div>
      <div className="topbar-actions">
        <div className="live-pill"><span className="blip"></span>Live</div>
        <button onClick={() => alert('3 notifications pending')} className="icon-btn" title="Notifications">
          <span className="dot"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        <button 
          onClick={() => setCurrentTab('settings')} 
          className="icon-btn" 
          title="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51z"/></svg>
        </button>
        <button 
          onClick={() => {
            if (window.confirm('Do you want to logout?')) {
              handleLogout();
            }
          }} 
          className="icon-btn" 
          title="Logout"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </header>
  );
}
