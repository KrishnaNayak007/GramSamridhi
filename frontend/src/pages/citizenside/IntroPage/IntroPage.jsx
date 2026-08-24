import React, { useState, useEffect, useRef } from 'react';
import './IntroPage.css';
import logo from '../../../assets/logo.png';

export default function IntroPage({ onLoginClick, onGetStartedClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hiwActive, setHiwActive] = useState(false);
  const railRef = useRef(null);

  // Navbar scrolled class toggle
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for general scroll reveal effects
  useEffect(() => {
    const revealEls = document.querySelectorAll('.intro-page .reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver for "How it works" steps progress rail
  useEffect(() => {
    if (!railRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setHiwActive(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="intro-page">
      {/* SVG ICON SPRITE DEF IN THE DOM */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"/><circle cx="12" cy="9.5" r="2.4"/></symbol>
          <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.6"/></symbol>
          <symbol id="i-track" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.4-4.4"/></symbol>
          <symbol id="i-recycle" viewBox="0 0 24 24"><path d="M7 19H4.8a2 2 0 0 1-1.7-3l1.7-2.9"/><path d="M10.3 4.6 12 2l3 4.9"/><path d="M15.7 14 19 19.5l-2 .5"/><path d="M9 19h6"/><path d="M14 2.6 17 7l-3.2 2"/><path d="M4 12.5 7 7"/></symbol>
          <symbol id="i-food" viewBox="0 0 24 24"><path d="M12 21c-4-3-8-6.7-8-11A5 5 0 0 1 12 6a5 5 0 0 1 8 4c0 4.3-4 8-8 11Z"/></symbol>
          <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
          <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
          <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></symbol>
          <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></symbol>
          <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4.5 6v6c0 4.6 3.2 8 7.5 9 4.3-1 7.5-4.4 7.5-9V6Z"/></symbol>
          <symbol id="i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.3"/><circle cx="18" cy="5" r="2.3"/><path d="M8.2 19H15a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3H9a3 3 0 0 1-3-3V7.2"/></symbol>
          <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m5.6 5.6 2.8 2.8"/><path d="m15.6 15.6 2.8 2.8"/><path d="m18.4 5.6-2.8 2.8"/><path d="m8.4 15.6-2.8 2.8"/></symbol>
          <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.2 1.2 0 0 1 1.2-.3 9 9 0 0 0 3 .5 1.2 1.2 0 0 1 1.2 1.2v3a1.2 1.2 0 0 1-1.2 1.2A17 17 0 0 1 3 4.2 1.2 1.2 0 0 1 4.2 3h3a1.2 1.2 0 0 1 1.2 1.2 9 9 0 0 0 .5 3 1.2 1.2 0 0 1-.3 1.2Z"/></symbol>
          <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></symbol>
          <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-7"/></symbol>
          <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.2"/><path d="M18 14.2a6.4 6.4 0 0 1 3.6 5.8"/></symbol>
          <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M4 20c8.5 0 16-4.5 16-15C11 5 4 11.5 4 20Z"/><path d="M4 20c3-4.5 6.5-8 12-11"/></symbol>
          <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></symbol>
          <symbol id="i-cpu" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></symbol>
          <symbol id="i-map" viewBox="0 0 24 24"><path d="m9 4-6 2.4v13.6l6-2.4 6 2.4 6-2.4V3.6L15 6Z"/><path d="M9 4v13.6"/><path d="M15 6v13.6"/></symbol>
          <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.7 2.5 4 5.7 4 9s-1.3 6.5-4 9c-2.7-2.5-4-5.7-4-9s1.3-6.5 4-9Z"/></symbol>
          <symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="3" width="10" height="18"/><path d="M14 8h6v13h-6"/><path d="M7 7h1M7 11h1M7 15h1M11 7h1M11 11h1M11 15h1"/></symbol>
          <symbol id="i-hand" viewBox="0 0 24 24"><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 12V4.5a1.5 1.5 0 0 1 3 0V12"/><path d="M14 12.2V6.5a1.5 1.5 0 0 1 3 0V14"/><path d="M8 13l-2-1.8a1.6 1.6 0 0 0-2.2 2.3L8.5 19a5 5 0 0 0 3.8 1.7h2.2a5 5 0 0 0 5-5v-3.5a1.5 1.5 0 0 0-3 0"/></symbol>
        </defs>
      </svg>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container navbar-inner" id="navbarInner">
          <a href="#home" className="brand">
            <img src={logo} alt="GramSamridh logo" />
            <span className="brand-word">Gram<span>Samridh</span></span>
          </a>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">SWC</a>
            <a href="#surplus">Surplus</a>
            <a href="#about">About</a>
          </div>
          <div className="nav-cta">
            <button onClick={onLoginClick} className="nav-login">Log in</button>
            <button onClick={onGetStartedClick} className="btn btn-primary btn-sm">Get Started</button>
          </div>
          <button className="nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg className="icon"><use href="#i-menu"/></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE NAV PANEL */}
      <div className={`mobile-panel ${mobileOpen ? 'open' : ''}`} id="mobilePanel">
        <div className="mobile-panel-top">
          <a href="#home" className="brand">
            <img src={logo} alt="GramSamridh" style={{ height: '48px', width: '48px' }} />
            <span className="brand-word" style={{ color: 'var(--white)' }}>GramSamridh</span>
          </a>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <svg className="icon"><use href="#i-close"/></svg>
          </button>
        </div>
        <div className="mobile-links">
          <a href="#home" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>SWC</a>
          <a href="#surplus" onClick={() => setMobileOpen(false)}>Surplus</a>
          <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
        </div>
        <div className="mobile-cta">
          <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="btn btn-outline-light btn-block">Log in</button>
          <button onClick={() => { setMobileOpen(false); onGetStartedClick(); }} className="btn btn-primary btn-block">Get Started</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="dot"></span> Together for a cleaner tomorrow</span>
            <h1>See waste.<br />Report it.<br /><em>Solve it.</em></h1>
            <p className="lead">SwachSahyog connects citizens with the right local authority, making waste reporting faster, smarter and more transparent.</p>
            <div className="hero-actions">
              <a href="#how-it-works" className="btn btn-ghost">Explore SWC</a>
            </div>
            <div className="hero-flowline">
              <div className="flow-step"><span class="flow-ico"><svg className="icon"><use href="#i-camera"/></svg></span> Citizen</div>
              <span className="flow-arrow"></span>
              <div className="flow-step"><span class="flow-ico"><svg className="icon"><use href="#i-cpu"/></svg></span> AI</div>
              <span className="flow-arrow"></span>
              <div className="flow-step"><span class="flow-ico"><svg className="icon"><use href="#i-building"/></svg></span> Authority</div>
              <span className="flow-arrow"></span>
              <div className="flow-step"><span class="flow-ico"><svg className="icon"><use href="#i-check"/></svg></span> Resolution</div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="map-card">
              <svg className="map-bg" viewBox="0 0 500 510" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="dotgrid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <circle cx="1.3" cy="1.3" r="1.3" fill="rgba(255,255,255,0.09)"/>
                  </pattern>
                  <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#9bd94a"/>
                    <stop offset="1" stop-color="#2e9e5b"/>
                  </linearGradient>
                </defs>
                <rect width="500" height="510" fill="url(#dotgrid)"/>
                <g fill="rgba(255,255,255,0.045)">
                  <rect x="40" y="60" width="120" height="90" rx="6"/>
                  <rect x="180" y="40" width="90" height="60" rx="6"/>
                  <rect x="300" y="70" width="150" height="110" rx="6"/>
                  <rect x="40" y="190" width="80" height="130" rx="6"/>
                  <rect x="150" y="210" width="140" height="70" rx="6"/>
                  <rect x="320" y="220" width="130" height="150" rx="6"/>
                  <rect x="60" y="360" width="150" height="100" rx="6"/>
                  <rect x="230" y="330" width="90" height="130" rx="6"/>
                </g>
                <path d="M30 250 C 150 180, 220 320, 340 200 S 470 260, 470 260" fill="none" stroke="url(#roadGrad)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity="0.55"/>
                <path d="M60 420 C 160 380, 210 300, 300 340 S 420 300, 460 380" fill="none" stroke="rgba(229,198,144,0.4)" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round"/>
              </svg>
              <div className="map-noise"></div>

              <span className="pin p-critical" style={{ top: '33%', left: '29%' }}></span>
              <span className="pin p-high" style={{ top: '52%', left: '64%' }}></span>
              <span className="pin p-low" style={{ top: '70%', left: '38%' }}></span>
              <span className="pin p-high" style={{ top: '20%', left: '60%' }}></span>

              <div className="float-card fc-1">
                <span className="fc-ico"><svg className="icon"><use href="#i-pin"/></svg></span>
                <div><div className="fc-title">Waste Detected</div><div className="fc-sub">12 sec ago</div></div>
              </div>
              <div className="float-card fc-2">
                <span className="fc-ico"><svg className="icon"><use href="#i-spark"/></svg></span>
                <div><div className="fc-title">AI Severity: HIGH</div><div className="fc-sub">confidence 92%</div></div>
              </div>
              <div className="float-card fc-3">
                <span className="fc-ico"><svg className="icon"><use href="#i-map"/></svg></span>
                <div><div className="fc-title">Ward 24</div><div className="fc-sub">Bhubaneswar</div></div>
              </div>
              <div className="float-card fc-4">
                <span className="fc-ico"><svg className="icon"><use href="#i-check"/></svg></span>
                <div><div className="fc-title">Complaint Resolved ✓</div><div className="fc-sub">SS-24A1-BBSR</div></div>
              </div>

              <div className="map-legend">
                <span><i style={{ background: '#e28a63' }}></i> Critical</span>
                <span><i style={{ background: '#e5c690' }}></i> High</span>
                <span><i style={{ background: '#9bd94a' }}></i> Low</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS SECTION */}
      <section className="hiw" id="how-it-works" ref={railRef}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow"><span className="dot"></span> SWC</span>
            <h2>From a pin on the map to a closed ticket.</h2>
            <p>Four steps, most of it automatic. You do the noticing — we handle the routing.</p>
          </div>
          <div className="rail" id="rail">
            <div className="rail-line">
              <div 
                className="rail-line-fill" 
                id="railFill" 
                style={{ width: hiwActive ? '100%' : '0%' }}
              ></div>
            </div>
            <div className={`rail-step ${hiwActive ? 'active' : ''}`}>
              <div className="rail-num"><svg className="icon"><use href="#i-pin"/></svg></div>
              <span className="rail-tag">Step 01</span>
              <h3>Detect Location</h3>
              <p>We pin your exact location the moment you open a report — no addresses to type out.</p>
            </div>
            <div className={`rail-step ${hiwActive ? 'active' : ''}`} style={{ transitionDelay: '220ms' }}>
              <div className="rail-num"><svg className="icon"><use href="#i-camera"/></svg></div>
              <span className="rail-tag">Step 02</span>
              <h3>Report</h3>
              <p>Add a photo and a short note. Most citizens finish a report in under a minute.</p>
            </div>
            <div className={`rail-step ${hiwActive ? 'active' : ''}`} style={{ transitionDelay: '440ms' }}>
              <div className="rail-num"><svg className="icon"><use href="#i-spark"/></svg></div>
              <span className="rail-tag">Step 03</span>
              <h3>AI Analysis</h3>
              <p>AI analyzes waste images, classifies severity, and prioritizes critical complaints, enabling faster responses, smarter waste management, and cleaner communities.</p>
            </div>
            <div className={`rail-step ${hiwActive ? 'active' : ''}`} style={{ transitionDelay: '660ms' }}>
              <div className="rail-num"><svg className="icon"><use href="#i-route"/></svg></div>
              <span className="rail-tag">Step 04</span>
              <h3>Smart Routing</h3>
              <p>The report lands directly with the ward officer responsible — not a general helpline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SURPLUS SECTION */}
      <section className="surplus-section" id="surplus">
        <div className="container">
          <div className="surplus-card reveal">
            <div className="surplus-copy">
              <span className="eyebrow"><span className="dot"></span> Surplus</span>
              <h2>Keep useful things in use.</h2>
              <p>Surplus helps prevent usable items from becoming waste. Citizens can list things they no longer need, and nearby people can discover and reuse them instead of sending them to disposal.</p>
              <div className="surplus-flow" aria-label="Surplus flow">
                <span>List</span><b>→</b><span>Match nearby</span><b>→</b><span>Reuse</span>
              </div>
            </div>
            <div className="surplus-steps">
              <div className="surplus-step">
                <div className="surplus-icon"><svg className="icon"><use href="#i-hand"/></svg></div>
                <small>01 · Share</small>
                <h3>List an item</h3>
                <p>Add a usable item you no longer need and make it visible to the community.</p>
              </div>
              <div className="surplus-step">
                <div className="surplus-icon"><svg className="icon"><use href="#i-map"/></svg></div>
                <small>02 · Connect</small>
                <h3>Find nearby</h3>
                <p>People nearby can discover available items that match what they need.</p>
              </div>
              <div className="surplus-step">
                <div className="surplus-icon"><svg className="icon"><use href="#i-recycle"/></svg></div>
                <small>03 · Reuse</small>
                <h3>Give it another life</h3>
                <p>The item moves from one person to another instead of becoming unnecessary waste.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="section-wrap final-wrap" id="about">
        <div className="final-cta reveal">
          <div className="final-glow"></div>
          <div className="final-cta-inner">
            <span className="eyebrow" style={{ background: 'rgba(155,217,74,0.14)', borderColor: 'rgba(155,217,74,0.32)', color: '#9bd94a' }}><span className="dot" style={{ background: '#9bd94a' }}></span> Get started today</span>
            <h2 style={{ marginTop: '18px' }}>Your city. Your voice.<br />Your impact.</h2>
            <div className="btn-row">
              <button onClick={onGetStartedClick} className="btn btn-outline-light">Get Started</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-brand">
                <img src={logo} alt="GramSamridh logo" />
                <span>GramSamridh</span>
              </div>
              <p className="footer-tag">Swach Gram · Samridh Kisan · Satat Vikas — connecting communities, empowering farmers, and building a sustainable future.</p>
              <div className="footer-social">
                <a href="#" aria-label="LinkedIn"><svg className="icon" style={{ stroke: 'var(--white)' }}><use href="#i-linkedin"/></svg></a>
                <a href="#" aria-label="Twitter"><svg className="icon" style={{ stroke: 'var(--white)' }}><use href="#i-twitter"/></svg></a>
                <a href="#" aria-label="Instagram"><svg className="icon" style={{ stroke: 'var(--white)' }}><use href="#i-instagram"/></svg></a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#how-it-works">SWC</a></li>
                <li><a href="#surplus">Surplus</a></li>
                <li><a href="#about">About</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Government</h4>
              <ul>
                <li><button onClick={onLoginClick} style={{ color: 'inherit', display: 'block', padding: '0', textAlign: 'left' }}>ULB Login</button></li>
                <li><button onClick={onLoginClick} style={{ color: 'inherit', display: 'block', padding: '0', textAlign: 'left' }}>Panchayat Login</button></li>
                <li><a href="#">Partner With Us</a></li>
                <li><a href="#">API Documentation</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@swachsahyog.in"><svg className="icon" style={{ width: '14px', height: '14px', verticalAlign: '-2px', marginRight: '6px' }}><use href="#i-mail"/></svg>hello@swachsahyog.in</a></li>
                <li><a href="tel:+911800000000"><svg className="icon" style={{ width: '14px', height: '14px', verticalAlign: '-2px', marginRight: '6px' }}><use href="#i-phone"/></svg>1800-000-000</a></li>
              </ul>
              <span className="gov-pill"><svg className="icon" style={{ stroke: 'var(--lime-400)' }}><use href="#i-shield"/></svg>Built for ULBs &amp; Panchayats</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 GramSamridh. All rights reserved.</span>
            <div className="fb-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Data Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
