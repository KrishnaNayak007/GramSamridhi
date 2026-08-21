import React, { useEffect, useState } from 'react';
import './ImpactPage.css';
import { apiFetch } from '../../shared/lib/api';
import { impactApi } from '../../services/impactApi';

export default function ImpactPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animated Count-Up States
  const [countPoints, setCountPoints] = useState(0);
  const [countWaste, setCountWaste] = useState(0);
  const [countReused, setCountReused] = useState(0);
  const [countDonated, setCountDonated] = useState(0);
  const [countReported, setCountReported] = useState(0);

  // Animated Layout Progress States
  const [ringOffset, setRingOffset] = useState(427); // Circumference is ~427
  const [wasteBarWidth, setWasteBarWidth] = useState(0);
  const [reusedBarWidth, setReusedBarWidth] = useState(0);
  const [communityBarWidth, setCommunityBarWidth] = useState(0);
  const [animateChart, setAnimateChart] = useState(false);

  // UI Toast States
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  let toastTimer = null;

  // Monthly Impact Points Data
  const monthlyData = [
    { label: "Jan", points: 0 },
    { label: "Feb", points: 0 },
    { label: "Mar", points: 5 },
    { label: "Apr", points: 10 },
    { label: "May", points: 18 },
    { label: "Jun", points: 22 }, // Peak month
    { label: "Jul", points: 15 },
    { label: "Aug", points: 20 },
    { label: "Sep", points: 12 },
    { label: "Oct", points: 18 },
    { label: "Nov", points: 0 },
    { label: "Dec", points: 0 }
  ];

  const maxPoints = Math.max(...monthlyData.map(m => m.points)) || 1;
  const peakIndex = monthlyData.findIndex((m, i) => m.points === maxPoints);

  // Trigger feedback toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // Helper count-up animator
  const animateValue = (start, end, duration, setter, isDecimal = false) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = start + eased * (end - start);
      setter(isDecimal ? parseFloat(val.toFixed(1)) : Math.round(val));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setter(end);
      }
    };
    requestAnimationFrame(step);
  };

  // Trigger layouts animation
  const triggerLayoutAnimations = (pointsVal, wasteVal, reusedVal) => {
    setTimeout(() => {
      // 1. Progress ring offset calculation (120 points out of 150 target = 80%)
      const targetOffset = 427 - (80 / 100) * 427; // ~85
      setRingOffset(targetOffset);

      // 2. Progress bars width setting
      setWasteBarWidth(68); // 6.8kg / 10kg
      setReusedBarWidth(53); // 8 items / 15 items
      setCommunityBarWidth(100); // 100% Completed

      // 3. Monthly bar chart animation flag
      setAnimateChart(true);
    }, 200);
  };

  useEffect(() => {
    const fetchImpactData = async () => {
      setLoading(true);
      try {
        const data = await impactApi.getStats();
        let wasteVal = 6.8;
        let reusedVal = 8;
        let donatedVal = 3;
        let reportedVal = 6;
        let pointsVal = 120;

        if (data) {
          setStats(data);
          // If backend has live values, map them; otherwise fall back to teammate's mockups
          if (data.waste_prevented_kg) wasteVal = parseFloat(data.waste_prevented_kg);
          if (data.claimed_listings_count) reusedVal = data.claimed_listings_count;
        }

        // Animate count-up stats on mount
        animateValue(0, pointsVal, 900, setCountPoints);
        animateValue(0, wasteVal, 900, setCountWaste, true);
        animateValue(0, reusedVal, 900, setCountReused);
        animateValue(0, donatedVal, 900, setCountDonated);
        animateValue(0, reportedVal, 900, setCountReported);

        // Run progress ring/bar layout transitions
        triggerLayoutAnimations(pointsVal, wasteVal, reusedVal);

      } catch (err) {
        console.error('Error fetching impact data:', err);
        // Fallback animation on failure
        animateValue(0, 120, 900, setCountPoints);
        animateValue(0, 6.8, 900, setCountWaste, true);
        animateValue(0, 8, 900, setCountReused);
        animateValue(0, 3, 900, setCountDonated);
        animateValue(0, 6, 900, setCountReported);
        triggerLayoutAnimations(120, 6.8, 8);
      } finally {
        setLoading(false);
      }
    };
    fetchImpactData();
  }, []);

  return (
    <div className="impact-page">
      {/* BREADCRUMB */}
      <nav className="ss-breadcrumb" aria-label="Breadcrumb">
        <a href="#">Home</a><span aria-hidden="true">/</span><span aria-current="page">Impact</span>
      </nav>

      {/* PAGE HEADER */}
      <section className="page-header">
        <div className="page-header-text">
          <h1>Your Impact</h1>
          <p><strong>Small actions. Real change.</strong> See how your reports, donations and reuse efforts are helping create a cleaner community.</p>
        </div>
        <span className="page-header-accent" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <path d="M20 5C20 5 10 13 10 22.5C10 28.85 14.5 34 20 34C25.5 34 30 28.85 30 22.5C30 13 20 5 20 5Z" fill="var(--soft-green)" stroke="var(--green-500)" strokeWidth="1.6" />
            <path d="M20 15v14" stroke="var(--green-500)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <button 
          onClick={() => triggerToast('Impact report exported successfully')}
          className="ss-btn ss-btn--ghost page-header-export"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Export Report
        </button>
      </section>

      {/* IMPACT SUMMARY BANNER */}
      <section className="impact-summary panel">
        <div className="impact-summary-text">
          <p className="impact-summary-eyebrow">Total Impact Points</p>
          <p className="impact-summary-number">
            <span>{countPoints}</span>
          </p>
          <p className="impact-summary-note">Keep contributing to unlock more achievements.</p>
          <button 
            onClick={() => triggerToast('Viewing points system FAQ')}
            className="impact-summary-link"
          >
            How Impact Points Work
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="impact-summary-ring" aria-hidden="true">
          <svg className="progress-ring" viewBox="0 0 160 160">
            <circle className="ring-track" cx="80" cy="80" r="68" />
            <circle 
              className="ring-fill" 
              cx="80" 
              cy="80" 
              r="68" 
              strokeDasharray={427}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="progress-ring-label">
            <strong>{countPoints}</strong>
            <span>Impact Points</span>
          </div>
        </div>
      </section>

      {/* KEY STATISTICS */}
      <section className="stats-grid" aria-label="Key impact statistics">
        <article className="stat-card stat-card--a">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3.5 6 6.8 6 10.5A6 6 0 0 1 6 13.5C6 9.8 9 6.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countWaste} kg</span>
          <span className="stat-label">Waste Prevented</span>
          <span className="stat-sub">Estimated</span>
        </article>
        <article className="stat-card stat-card--b">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M3 8v8l9 4 9-4V8" stroke="currentColor" stroke-width="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countReused}</span>
          <span className="stat-label">Items Reused</span>
          <span className="stat-sub">Rehomed</span>
        </article>
        <article className="stat-card stat-card--c">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.6-7-10a4.8 4.8 0 0 1 8.5-3A4.8 4.8 0 0 1 19 11c0 5.4-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countDonated}</span>
          <span className="stat-label">Items Donated</span>
          <span className="stat-sub">Lifetime</span>
        </article>
        <article className="stat-card stat-card--a">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 9h12l-1.2 10.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M6 9a2 2 0 1 1 12 0" stroke="currentColor" stroke-width="1.6"/></svg>
          </span>
          <span className="stat-number">{countReported}</span>
          <span className="stat-label">Issues Reported</span>
          <span className="stat-sub">Total</span>
        </article>
        <article className="stat-card stat-card--d">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </span>
          <span className="stat-number">{countPoints}</span>
          <span className="stat-label">Impact Points</span>
          <span className="stat-sub">Earned</span>
        </article>
      </section>

      {/* TWO COLUMN GRID */}
      <section className="two-col">
        {/* ENVIRONMENTAL IMPACT */}
        <article className="panel env-impact">
          <div className="panel-head">
            <h2>Environmental Impact</h2>
          </div>

          <ul className="env-list">
            <li className="env-row">
              <span className="env-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c3 3.5 6 6.8 6 10.5A6 6 0 0 1 6 13.5C6 9.8 9 6.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="env-body">
                <div className="env-row-top">
                  <p className="env-title">Waste diverted from landfill</p>
                  <p className="env-value">6.8 <span>/ 10 kg</span></p>
                </div>
                <p className="env-desc">You helped prevent waste from reaching landfills.</p>
                <div className="progress-bar">
                  <span style={{ width: `${wasteBarWidth}%`, transition: 'width 1s ease' }}></span>
                </div>
              </div>
            </li>

            <li className="env-row">
              <span className="env-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="env-body">
                <div className="env-row-top">
                  <p className="env-title">Items given a second life</p>
                  <p className="env-value">8 <span>/ 15</span></p>
                </div>
                <p className="env-desc">Reusable items you listed or rehomed.</p>
                <div className="progress-bar">
                  <span style={{ width: `${reusedBarWidth}%`, transition: 'width 1s ease' }}></span>
                </div>
              </div>
            </li>

            <li className="env-row">
              <span className="env-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 5 18.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="9.5" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M15 8.2a2.6 2.6 0 0 1 0 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M19 20v-1.3a3 3 0 0 0-2-2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div className="env-body">
                <div className="env-row-top">
                  <p className="env-title">Community contribution</p>
                  <p className="env-value env-value--complete">100%</p>
                </div>
                <p className="env-desc">You've contributed towards a cleaner community.</p>
                <div className="progress-bar">
                  <span className="is-complete" style={{ width: `${communityBarWidth}%`, transition: 'width 1s ease' }}></span>
                </div>
              </div>
            </li>
          </ul>
        </article>

        {/* JOURNEY CARD */}
        <article className="panel journey-card">
          <div className="panel-head">
            <h2>Your Impact Journey</h2>
          </div>

          <div className="journey-row">
            <div className="journey-step">
              <span className="journey-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </span>
              <strong>{countReported}</strong>
              <span>Reported</span>
            </div>
            <span className="journey-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <div className="journey-step">
              <span className="journey-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" stroke-linejoin="round"/><path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.6" stroke-linejoin="round"/></svg>
              </span>
              <strong>{countReused}</strong>
              <span>Reused</span>
            </div>
            <span className="journey-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <div className="journey-step">
              <span className="journey-icon journey-icon--gold" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.6-7-10a4.8 4.8 0 0 1 8.5-3A4.8 4.8 0 0 1 19 11c0 5.4-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" stroke-linejoin="round"/></svg>
              </span>
              <strong>{countDonated}</strong>
              <span>Donated</span>
            </div>
            <span className="journey-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            <div className="journey-step">
              <span className="journey-icon journey-icon--dark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
              </span>
              <strong>{countPoints}</strong>
              <span>Community Impact</span>
            </div>
          </div>
        </article>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="panel achievements-card">
        <div className="panel-head">
          <h2>Achievements Earned</h2>
          <button 
            onClick={() => triggerToast('Viewing all badge milestones')}
            className="panel-link"
          >
            View All
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div className="achievements-grid">
          <div className="achievement is-earned">
            <span className="achievement-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5 3.5 6v6.2c0 5 3.7 8.4 8.5 9.3 4.8-.9 8.5-4.3 8.5-9.3V6L12 2.5Z" fill="var(--soft-green)" stroke="var(--green-500)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8.5 12.3 11 14.8l4.5-5" stroke="var(--green-700)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="achievement-name">First<br />Contribution</p>
          </div>

          <div className="achievement is-earned">
            <span className="achievement-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5 3.5 6v6.2c0 5 3.7 8.4 8.5 9.3 4.8-.9 8.5-4.3 8.5-9.3V6L12 2.5Z" fill="var(--light-gold)" stroke="var(--gold-deep)" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="10.4" r="2.2" stroke="var(--gold-deep)" strokeWidth="1.5" />
                <path d="M8.3 15.3c.7-1.4 2-2.2 3.7-2.2s3 .8 3.7 2.2" stroke="var(--gold-deep)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="achievement-name">Community<br />Helper</p>
          </div>

          <div className="achievement is-locked">
            <span className="achievement-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5 3.5 6v6.2c0 5 3.7 8.4 8.5 9.3 4.8-.9 8.5-4.3 8.5-9.3V6L12 2.5Z" fill="var(--very-light-green)" stroke="var(--line-strong)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 8v5.2M12 16.2h.01" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <p className="achievement-name">Waste<br />Warrior</p>
            <span className="achievement-hint">10 kg to unlock</span>
          </div>

          <div className="achievement is-locked">
            <span className="achievement-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5 3.5 6v6.2c0 5 3.7 8.4 8.5 9.3 4.8-.9 8.5-4.3 8.5-9.3V6L12 2.5Z" fill="var(--very-light-green)" stroke="var(--line-strong)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 14.5 12 8l3 6.5" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="achievement-name">Green<br />Champion</p>
            <span className="achievement-hint">200 pts to unlock</span>
          </div>
        </div>
      </section>

      {/* MONTHLY IMPACT CHART */}
      <section className="panel monthly-card">
        <div className="panel-head">
          <h2>Monthly Impact</h2>
          <span className="panel-note">Impact points earned per month</span>
        </div>

        <div className="bar-chart" id="monthlyChart" aria-label="Monthly impact points chart">
          {monthlyData.map((m, idx) => {
            const heightVal = animateChart ? Math.max((m.points / maxPoints) * 100, m.points > 0 ? 6 : 2) : 0;
            const isPeak = idx === peakIndex && m.points > 0;
            return (
              <div key={idx} className="bar-col">
                <div className="bar-track">
                  <div 
                    className={`bar-fill ${isPeak ? 'is-peak' : ''}`}
                    data-tip={`${m.label} · ${m.points} pts`}
                    tabIndex="0"
                    style={{ height: `${heightVal}%`, transition: 'height 1.2s ease' }}
                  ></div>
                </div>
                <span>{m.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <section className="impact-footer">
        <span className="impact-footer-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3.5 6 6.8 6 10.5A6 6 0 0 1 6 13.5C6 9.8 9 6.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
        </span>
        <p>Together we can make Ward 24 a cleaner, greener and healthier place for all.</p>
      </section>

      {/* TOAST NOTIFICATION BANNER */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
