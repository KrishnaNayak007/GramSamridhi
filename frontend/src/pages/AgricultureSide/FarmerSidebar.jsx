import React from 'react';
import './FarmerSidebar.css';

export default function FarmerSidebar({ currentTab, setCurrentTab, user }) {
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
    <aside className="farmer-sidebar">
      <div className="brand" style={{ padding: '0' }}>
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '21px', height: '21px' }}>
            <path d="M12 3c3.6 2 6 5.6 6 9.4 0 4-2.7 6.6-6 6.6s-6-2.6-6-6.6C6 8.6 8.4 5 12 3Z" fill="currentColor"/>
          </svg>
        </span>
        <span className="brand-name">Swachh <b>Sahyog</b></span>
      </div>
      <div className="brand-tagline">TOGETHER FOR A CLEANER TOMORROW</div>

      <div className="profile-mini">
        <div className="avatar">{initials}</div>
        <div>
          <strong>{name}</strong>
          <small>Farmer ID: {farmerId}</small>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <div className="nav-section">MY FARM</div>
        <button 
          className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>
          Overview
        </button>

        <div className="nav-section">MANAGE</div>
        <button 
          className={`nav-link ${currentTab === 'swc' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('dashboard');
            setTimeout(() => {
              document.getElementById('requestPickupForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M7 3 4 8l3 5"/><path d="M4 8h9.5A5.5 5.5 0 0 1 19 13.5V15"/><path d="M17 21l3-5-3-5"/><path d="M20 16h-9.5A5.5 5.5 0 0 1 5 10.5V9"/></svg>
          Residue Collection
        </button>
        
        <button 
          className={`nav-link ${currentTab === 'surplus' ? 'active' : ''}`}
          onClick={() => {
            setCurrentTab('dashboard');
            setTimeout(() => {
              document.getElementById('compost')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z"/><path d="M12 21v-7"/></svg>
          Compost &amp; Soil
        </button>

        <div className="nav-section">LEARN</div>
        <button 
          className="nav-link"
          onClick={() => {
            setCurrentTab('dashboard');
            setTimeout(() => {
              document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          KrishiSahyog
        </button>

        <button 
          className="nav-link"
          onClick={() => {
            setCurrentTab('dashboard');
            setTimeout(() => {
              document.getElementById('guidance')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Organic Guidance
        </button>

        <div className="nav-section">SUPPORT</div>
        <button 
          className="nav-link"
          onClick={() => {
            setCurrentTab('dashboard');
            setTimeout(() => {
              document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Government Schemes
        </button>

        <button 
          className={`nav-link ${currentTab === 'help' ? 'active' : ''}`}
          onClick={() => setCurrentTab('help')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: '18px', height: '18px', marginRight: '6px' }}><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.9.5-1.3 1-1.3 2"/><path d="M12 16.6h.01"/></svg>
          Help &amp; Support
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="language-button" onClick={() => alert('भाषा बदली जा रही है...')}>
          <span>◎ &nbsp; हिंदी</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: '15px', height: '15px' }}><path d="M6 9.5 12 15l6-5.5"/></svg>
        </button>
      </div>
    </aside>
  );
}
