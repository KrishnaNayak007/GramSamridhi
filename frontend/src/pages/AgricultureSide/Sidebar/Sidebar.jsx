import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import logo from '../../../assets/logo.png';

export default function Sidebar({ currentTab, setCurrentTab, sidebarOpen, setSidebarOpen }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    setIsMobile(window.innerWidth <= 850);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { section: 'Overview' },
    { tab: 'dashboard', title: 'Overview', icon: '▦' },
    
    { section: 'Report & Contribute' },
    { tab: 'swc', title: 'Report an Issue', subtitle: 'Civic waste & sanitation', icon: '△' },
    { tab: 'residue', title: 'Sell Crop Residue', subtitle: 'Earn from your crop residue', icon: '♆' },
    { tab: 'surplus', title: 'Surplus Hub', subtitle: 'Give, sell & exchange items', icon: '◇' },
    
    { section: 'My Activity' },
    { tab: 'activity', title: 'My Reports & Requests', subtitle: 'Track your submissions', icon: '☑' },
    { tab: 'schedule', title: 'Collection Schedule', subtitle: 'Upcoming pickups', icon: '▣' },
    { tab: 'paymentHistory', title: 'Payment History', subtitle: 'Earnings & transactions', icon: '₹' },
    
    { section: 'Impact & Community' },
    { tab: 'impact', title: 'My Impact', subtitle: 'Your contribution', icon: '⌁' },
    { tab: 'leaderboard', title: 'Village Leaderboard', subtitle: 'Community rankings', icon: '♛' },
    
    { section: 'More' },
    { tab: 'settings', title: 'Settings', icon: '⚙' },
    { tab: 'help', title: 'Help & Support', icon: '?' }
  ];

  return (
    <>
      {sidebarOpen && <div className="backdrop show" onClick={() => setSidebarOpen(false)}></div>}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <button 
          className="sidebar-close" 
          id="sidebarClose" 
          aria-label="Close menu" 
          onClick={() => setSidebarOpen(false)}
          style={{ display: isMobile ? 'block' : 'none' }}
        >
          ×
        </button>

        {/* Inline styled brand card to guarantee display on desktop */}
        <div 
          className="brand-card" 
          style={{ 
            display: 'block', 
            width: '100%', 
            aspectRatio: '1/1', 
            background: '#fff', 
            border: '1px solid #dce9dc', 
            borderRadius: '18px', 
            overflow: 'hidden', 
            boxShadow: '0 5px 16px rgba(35, 130, 75, 0.07)', 
            marginBottom: '12px' 
          }}
        >
          <img 
            src={logo} 
            alt="GramSamridhi logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center', 
              display: 'block' 
            }} 
          />
        </div>

        <nav className="side-nav">
          {menuItems.map((item, idx) => {
            if (item.section) {
              return <div key={idx} className="nav-section">{item.section}</div>;
            }
            const isActive = currentTab === item.tab;
            return (
              <button
                key={idx}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab(item.tab);
                  setSidebarOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>
                  {item.subtitle ? (
                    <>
                      <b>{item.title}</b>
                      <small>{item.subtitle}</small>
                    </>
                  ) : (
                    <b>{item.title}</b>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="language">
          <span>🌐</span>
          <select aria-label="Language" defaultValue="English">
            <option>English</option>
            <option>हिन्दी (Hindi)</option>
            <option>ଓଡ଼ିଆ (Odia)</option>
            <option>বাংলা (Bengali)</option>
          </select>
        </div>
      </aside>
    </>
  );
}
