import React, { useEffect, useState } from 'react';
import { useLocationContext } from '../../app/LocationContext';
import { apiFetch } from '../../shared/lib/api';
import GoogleMap from '../../shared/components/layout/GoogleMap';
import { surplusApi } from '../../services/surplusApi';
import { incidentsApi } from '../../services/incidentsApi';
import './DashboardPage.css';

// Import slide images
import heroBins from '../../assets/hero_bins.jpg';
import heroSharing from '../../assets/hero_sharing.jpg';
import heroCleanup from '../../assets/hero_cleanup.jpg';

export default function DashboardPage({ onNavigate }) {
  const { coords, activeLocation } = useLocationContext();

  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState('transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)');

  // Auto-slide transition interval (3s)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(slideTimer);
  }, []);

  // Handle infinite loop wrap around when reaching the cloned slide (index 3)
  useEffect(() => {
    if (currentSlide === 3) {
      const timeout = setTimeout(() => {
        // Instantly jump back to index 0 (without transition)
        setTransitionStyle('none');
        setCurrentSlide(0);
      }, 800); // 800ms matches the transition duration
      return () => clearTimeout(timeout);
    } else if (transitionStyle === 'none') {
      // Re-enable transition for the next slides, waiting a tiny frame (50ms) to let the jump to 0 settle
      const timeout = setTimeout(() => {
        setTransitionStyle('transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)');
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, transitionStyle]);

  const handleDotClick = (index) => {
    setTransitionStyle('transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)');
    setCurrentSlide(index);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const listingsData = await surplusApi.getAll();
        setListings(listingsData);

        const reportsData = await incidentsApi.getAll();
        setReports(reportsData);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Determine active dot (index 3 is the clone of index 0)
  const activeDot = currentSlide === 3 ? 0 : currentSlide;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* HERO + MAP ROW */}
      <div className="top-row">
        
        {/* HERO CAROUSEL */}
        <section className="hero hero-carousel">
          <div className="hero-slideshow" aria-label="CivicLoop highlights" style={{ overflow: 'hidden', position: 'relative' }}>
            
            {/* Sliding container with 3s right-to-left infinite animation */}
            <div style={{
              display: 'flex',
              width: '400%',
              height: '100%',
              transition: transitionStyle,
              transform: `translateX(-${currentSlide * 25}%)`
            }}>
              {/* Slide 1 */}
              <div className="hero-slide" style={{ position: 'relative', width: '25%', height: '100%', flexShrink: 0, opacity: 1, transform: 'none' }}>
                <img src={heroBins} alt="Segregated wet, dry and recyclable waste bins on an Indian city street" />
              </div>
              {/* Slide 2 */}
              <div className="hero-slide" style={{ position: 'relative', width: '25%', height: '100%', flexShrink: 0, opacity: 1, transform: 'none' }}>
                <img src={heroSharing} alt="Neighbours exchanging books and donated items at a community give-and-share drive" />
              </div>
              {/* Slide 3 */}
              <div className="hero-slide" style={{ position: 'relative', width: '25%', height: '100%', flexShrink: 0, opacity: 1, transform: 'none' }}>
                <img src={heroCleanup} alt="Volunteers cleaning a riverside and planting a sapling under a Clean City Green City sign" />
              </div>
              {/* Slide 1 Clone (enables infinite right-to-left loops) */}
              <div className="hero-slide" style={{ position: 'relative', width: '25%', height: '100%', flexShrink: 0, opacity: 1, transform: 'none' }}>
                <img src={heroBins} alt="Segregated wet, dry and recyclable waste bins on an Indian city street" />
              </div>
            </div>

            <div 
              className="hero-overlay" 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                zIndex: 10, 
                pointerEvents: 'none', 
                background: 'linear-gradient(100deg, rgba(9,38,30,.92) 0%, rgba(9,38,30,.78) 30%, rgba(9,38,30,.38) 56%, rgba(9,38,30,.06) 78%), linear-gradient(0deg, rgba(9,38,30,.55) 0%, rgba(9,38,30,0) 26%)'
              }}
            ></div>

            <div 
              className="hero-copy" 
              style={{ 
                position: 'absolute', 
                zIndex: 20, 
                left: '36px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                maxWidth: '440px', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              <div className="hero-kicker" style={{ fontSize: '9.5px', letterSpacing: '.16em', fontWeight: 800, color: '#A9D8BE', marginBottom: '14px' }}>
                CIVIC WASTE + CIRCULARITY
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '34px', lineHeight: 1.16, letterSpacing: '-.035em', color: '#FFFDF8', marginBottom: '10px' }}>
                A cleaner city starts with <span style={{ color: '#A9D8BE' }}>you.</span>
              </h1>
              <p style={{ fontSize: '13.5px', lineHeight: 1.5, color: 'rgba(255,253,248,.82)', marginBottom: '24px' }}>
                Report waste. Reuse useful items. Track the impact you create.
              </p>
              <div className="hero-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#A9D8BE', fontWeight: 600, marginBottom: '24px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {activeLocation?.name || 'Ward 24 active'}
                </span>
                <span>•</span>
                <span>AI-assisted reporting</span>
                <span>•</span>
                <span>Live updates</span>
              </div>
              <div className="hero-actions" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => onNavigate('swc')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px', marginRight: '6px' }}><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
                  Report Waste
                </button>
                <button className="btn btn-secondary" onClick={() => onNavigate('surplus')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px', marginRight: '6px' }}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/><path d="M12 8c-1.5-3-6-3-6-.5S9 8 12 8Zm0 0c1.5-3 6-3 6-.5S15 8 12 8Z"/></svg>
                  Give / Sell an Item
                </button>
              </div>
            </div>

            {/* Dots navigator */}
            <div className="hero-dots" aria-hidden="true" style={{ zIndex: 20 }}>
              <button className={`hero-dot ${activeDot === 0 ? 'active' : ''}`} onClick={() => handleDotClick(0)}></button>
              <button className={`hero-dot ${activeDot === 1 ? 'active' : ''}`} onClick={() => handleDotClick(1)}></button>
              <button className={`hero-dot ${activeDot === 2 ? 'active' : ''}`} onClick={() => handleDotClick(2)}></button>
            </div>
          </div>
        </section>

        {/* MAP CARD */}
        <section className="map-card">
          <div className="map-card-head">
            <h3>Waste Issues Near You</h3>
            <span className="subtxt">Live</span>
          </div>

          <div className="mini-map">
            {coords ? (
              <GoogleMap latitude={coords.latitude} longitude={coords.longitude} />
            ) : (
              <>
                <div className="you"></div>
                <div className="mk red"></div>
                <div className="mk orange"></div>
                <div className="mk green"></div>
              </>
            )}
          </div>

          <div className="issue-row">
            <span className="issue-dot red"></span>
            <div className="issue-text">
              <div className="issue-title">Garbage accumulation</div>
              <div className="issue-meta">Park Road • 0.6 km</div>
            </div>
          </div>

          <div className="issue-row">
            <span className="issue-dot orange"></span>
            <div className="issue-text">
              <div className="issue-title">Overflowing bin</div>
              <div className="issue-meta">Green Park • 1.2 km</div>
            </div>
          </div>

          <div className="issue-row">
            <span className="issue-dot green"></span>
            <div className="issue-text">
              <div className="issue-title">Cleanup completed</div>
              <div className="issue-meta">Sector 4 • 1.8 km</div>
            </div>
          </div>

          <div className="map-card-foot">
            <span className="count">3 issues near you</span>
            <button onClick={() => onNavigate('swc')} className="link-arrow" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              View Map &rarr;
            </button>
          </div>
        </section>

      </div>

      {/* MODULE CARDS */}
      <div className="modules">
        
        {/* SWC CARD */}
        <div className="module-card swc">
          <div className="module-head">
            <div className="module-title-wrap">
              <h2>SWC</h2>
              <div className="module-sub">Smart Waste Complaint</div>
            </div>
            <span className="ai-badge">✨ AI Powered</span>
          </div>
          <p className="module-desc">Spot a waste issue? Report it in seconds and let AI route it to the right authority.</p>
          
          <div className="workflow">
            <div className="wf-step">
              <div className="wf-icon">📷</div>
              <span>Photo</span>
            </div>
            <span className="wf-arrow">&rarr;</span>
            <div className="wf-step">
              <div className="wf-icon">🤖</div>
              <span>AI Detection</span>
            </div>
            <span className="wf-arrow">&rarr;</span>
            <div className="wf-step">
              <div className="wf-icon">🗺️</div>
              <span>Smart Routing</span>
            </div>
            <span className="wf-arrow">&rarr;</span>
            <div className="wf-step">
              <div className="wf-icon">✅</div>
              <span>Resolution</span>
            </div>
          </div>

          <div className="module-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('swc')}>
              Report an Issue &rarr;
            </button>
            <button className="view-link" onClick={() => onNavigate('activity')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              View My Complaints
            </button>
          </div>

          <div className="benefits-row">
            <div className="benefit"><span className="b-icon">📷</span>Photo Reporting</div>
            <div className="benefit"><span className="b-icon">📍</span>Auto Location</div>
            <div className="benefit"><span className="b-icon">🔔</span>Live Status</div>
          </div>
        </div>

        {/* SURPLUS CARD */}
        <div className="module-card surplus">
          <div className="module-head">
            <div className="module-title-wrap">
              <h2>SURPLUS</h2>
              <div className="module-sub">Give It a Second Life</div>
            </div>
          </div>
          <p className="module-desc">Donate or sell useful items instead of sending them to waste.</p>
          
          <div className="categories-row">
            <span className="cat-chip">📚 Books</span>
            <span className="cat-chip">👕 Clothes</span>
            <span className="cat-chip">🛋️ Furniture</span>
            <span className="cat-chip">🔌 Electronics</span>
          </div>

          <div className="workflow">
            <div className="wf-step">
              <div className="wf-icon">📷</div>
              <span>Add Photo</span>
            </div>
            <span className="wf-arrow">&rarr;</span>
            <div className="wf-step">
              <div className="wf-icon">📝</div>
              <span>Add Details</span>
            </div>
            <span className="wf-arrow">&rarr;</span>
            <div className="wf-step">
              <div className="wf-icon">🎯</div>
              <span>Reach Nearby People</span>
            </div>
          </div>

          <div className="module-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('surplus')}>
              Give / Sell an Item &rarr;
            </button>
            <button className="view-link" onClick={() => onNavigate('activity')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              View My Listings
            </button>
          </div>
        </div>

      </div>

      {/* YOUR IMPACT SECTION */}
      <div className="impact-card">
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <h2>Your Impact</h2>
        </div>
        <div className="impact-grid">
          <div className="impact-stat">
            <span className="impact-icon">🔄</span>
            <div>
              <div className="impact-num">8</div>
              <div className="impact-label">Items Reused</div>
            </div>
          </div>
          <div className="impact-stat">
            <span className="impact-icon">❤️</span>
            <div>
              <div className="impact-num">3</div>
              <div className="impact-label">Items Donated</div>
            </div>
          </div>
          <div className="impact-stat">
            <span className="impact-icon">🌱</span>
            <div>
              <div className="impact-num">6.8 kg</div>
              <div className="impact-label">Waste Prevented</div>
            </div>
          </div>
          <div className="impact-stat">
            <span className="impact-icon">🏆</span>
            <div>
              <div className="impact-num">120</div>
              <div className="impact-label">Impact Points</div>
            </div>
          </div>
        </div>
        <div className="impact-foot">
          <span className="impact-msg">You're helping keep <strong>your community</strong> cleaner.</span>
          <button onClick={() => onNavigate('impact')} className="link-arrow" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            View Impact &rarr;
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="section-head">
        <h2>Recent Activity</h2>
        <button onClick={() => onNavigate('activity')} className="link-arrow" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          View All &rarr;
        </button>
      </div>

      <div className="activity-list">
        {/* SWC Garbage accumulation card */}
        <div className="activity-item">
          <span className="activity-tag swc">SWC</span>
          <div className="activity-body">
            <div className="activity-title">Garbage accumulation</div>
            <div className="activity-meta">
              <span>Park Road, Ward 24</span>
              <span>•</span>
              <span className="priority-tag">High Priority</span>
            </div>
          </div>
          <div className="activity-right">
            <span className="status-badge progress">In Progress</span>
            <span className="activity-time">2 hours ago</span>
          </div>
        </div>

        {/* Surplus Study Table card */}
        <div className="activity-item">
          <span className="activity-tag surplus">SURPLUS</span>
          <div className="activity-body">
            <div className="activity-title">Study Table</div>
            <div className="activity-meta">
              <span>1.2 km away</span>
            </div>
          </div>
          <div className="activity-right">
            <span className="activity-price">₹250</span>
            <span className="status-badge active">Active</span>
            <span className="activity-time">Yesterday</span>
          </div>
        </div>

        {/* Surplus Old Clothes card */}
        <div className="activity-item">
          <span className="activity-tag surplus">SURPLUS</span>
          <div className="activity-body">
            <div className="activity-title">Old Clothes</div>
            <div className="activity-meta">
              <span>0.8 km away</span>
            </div>
          </div>
          <div className="activity-right">
            <span className="activity-price">Free</span>
            <span className="status-badge available">Available</span>
            <span className="activity-time">2 days ago</span>
          </div>
        </div>
      </div>

      {/* COMMUNITY ADVERTISEMENT */}
      <div className="community-card">
        <div className="community-left">
          <div className="community-icon">🧹</div>
          <div>
            <div className="community-title">Cleanliness drive this Sunday</div>
            <div className="community-meta">
              <span>📍 Ward 24 Community Park</span>
              <span>•</span>
              <span>👥 48 participants</span>
              <span>•</span>
              <span>📅 Sunday, 8:00 AM</span>
            </div>
          </div>
        </div>
        <button onClick={() => onNavigate('activity')} className="community-cta" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          View Community Activities &rarr;
        </button>
      </div>

      {/* HOW SWACHSAHYOG WORKS FLOW STRIP */}
      <div className="flow-strip">
        <h3>How SwachSahyog Works</h3>
        <div className="flow-steps">
          <div className="flow-step">
            <span className="flow-icon">📷</span>
            <span className="flow-step-title">Report</span>
            <span className="flow-step-desc">Capture a waste issue.</span>
          </div>
          <div className="flow-divider"></div>
          <div className="flow-step">
            <span className="flow-icon">🤖</span>
            <span className="flow-step-title">AI Detect</span>
            <span className="flow-step-desc">Identify waste type and severity.</span>
          </div>
          <div className="flow-divider"></div>
          <div className="flow-step">
            <span className="flow-icon">🗺️</span>
            <span className="flow-step-title">Smart Route</span>
            <span className="flow-step-desc">Send it to the right authority.</span>
          </div>
          <div className="flow-divider"></div>
          <div className="flow-step">
            <span className="flow-icon">✅</span>
            <span className="flow-step-title">Resolve</span>
            <span className="flow-step-desc">Track the complaint.</span>
          </div>
          <div className="flow-divider"></div>
          <div className="flow-step">
            <span className="flow-icon">🔄</span>
            <span className="flow-step-title">Reuse</span>
            <span className="flow-step-desc">Give useful items a second life.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
