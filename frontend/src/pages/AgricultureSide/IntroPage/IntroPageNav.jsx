import React from 'react';
import './IntroPageNav.css';
import logoEmblem from '../../../assets/logo_emblem.png';

export default function IntroPageNav({ onLoginClick, onGetStartedClick, setMobileOpen, mobileOpen }) {
  return (
    <header className="nav nav-fixed">
      <div className="nav-inner">
        <a href="#top" className="brand">
          <img src={logoEmblem} alt="GramSamridhi emblem" />
          <div className="brand-text">
            <span className="en-brand">GramSamridhi</span>
            <span className="sub-hi hi">ग्रामसमृद्धि</span>
          </div>
        </a>
        <nav className="links">
          <a href="#top">Home</a>
          <a href="#citizens">Citizens</a>
          <a href="#farmers">Farmers</a>
          <a href="#government">Government</a>
          <a href="#about">About</a>
        </nav>
        <div className="nav-actions">
          <button onClick={onLoginClick} className="btn btn-ghost">Login</button>
          <button onClick={onGetStartedClick} className="btn btn-primary">Get Started</button>
          <button 
            className="menu-toggle" 
            id="menuToggle" 
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-panel ${mobileOpen ? "open" : ""}`} id="mobilePanel">
        <a href="#top" onClick={() => setMobileOpen(false)}>Home</a>
        <a href="#citizens" onClick={() => setMobileOpen(false)}>Citizens</a>
        <a href="#farmers" onClick={() => setMobileOpen(false)}>Farmers</a>
        <a href="#government" onClick={() => setMobileOpen(false)}>Government</a>
        <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
        <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '12px 16px', width: '100%', borderBottom: '1px solid rgba(11,93,59,0.06)', background: 'none' }}>Login</button>
        <button onClick={() => { setMobileOpen(false); onGetStartedClick(); }} className="btn btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>Get Started</button>
      </div>
    </header>
  );
}
