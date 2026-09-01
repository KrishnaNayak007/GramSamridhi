import React, { useEffect, useState } from 'react';
import './MyActivityPage.css';
import { apiFetch } from '../../../shared/lib/api';
import { reportsApi } from '../../../services/reportsApi';
import { surplusApi } from '../../../services/surplusApi';

export default function MyActivityPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'swc' | 'surplus'
  
  // API Raw Data
  const [reports, setReports] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // UI Display Toggles / Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  let toastTimer = null;

  // Animated Count-Up States
  const [countTotal, setCountTotal] = useState(0);
  const [countSwc, setCountSwc] = useState(0);
  const [countSurplus, setCountSurplus] = useState(0);
  const [countDonated, setCountDonated] = useState(0);
  const [countWaste, setCountWaste] = useState(0);

  // Load activity logs from API on mount
  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        // Fetch citizen waste reports (SWC)
        const fetchedReports = await reportsApi.getAll();
        const reportsList = Array.isArray(fetchedReports) ? fetchedReports : [];
        setReports(reportsList);

        // Fetch surplus sharing listings (SURPLUS)
        const listData = await surplusApi.getAll();
        const listingsList = Array.isArray(listData) ? listData : [];
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        const ownListings = listingsList.filter(item => item.owner?.username === loggedInUser.username);
        const fetchedListings = ownListings;
        setListings(fetchedListings);

        // Calculate and trigger count-up stats animations
        const total = reportsList.length + fetchedListings.length;
        const swcCount = reportsList.length;
        const surplusCount = fetchedListings.length;
        const donatedCount = fetchedListings.filter(item => item.listing_type === 'donation' || item.listing_type === 'give_away' || item.status === 'completed' || item.status === 'claimed').length;
        const wasteCount = donatedCount > 0 ? donatedCount * 5 : 0;

        animateValue(0, total, 900, setCountTotal);
        animateValue(0, swcCount, 900, setCountSwc);
        animateValue(0, surplusCount, 900, setCountSurplus);
        animateValue(0, donatedCount, 900, setCountDonated);
        animateValue(0, wasteCount, 900, setCountWaste, true);

      } catch (err) {
        console.error('Error fetching activity data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, []);

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

  // Export report handler
  const handleExportReport = () => {
    triggerToast('Activity report exported successfully');
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Status mapping to css classes and text labels
  const getStatusPill = (status, type) => {
    const norm = (status || 'pending').toLowerCase();
    if (type === 'swc') {
      if (norm === 'resolved') return <span className="status-pill status-pill--resolved">Resolved</span>;
      if (norm === 'in_progress' || norm === 'progress') return <span className="status-pill status-pill--progress">In Progress</span>;
      return <span className="status-pill status-pill--progress">Pending</span>;
    } else {
      if (norm === 'claimed' || norm === 'completed') return <span className="status-pill status-pill--completed">Completed</span>;
      return <span className="status-pill status-pill--active">Active</span>;
    }
  };

  // Construct combined activities list
  const combinedActivities = [];
  
  if (Array.isArray(reports)) {
    reports.forEach(report => {
      combinedActivities.push({
        id: report.id ? `#SWC-${report.id.slice(0, 4).toUpperCase()}` : '#SWC-DUMM',
        rawId: report.id,
        type: 'swc',
        typeLabel: 'SWC Complaint',
        title: report.description || 'Garbage accumulation near village chowk',
        location: report.location?.name || report.incident?.representative_location?.name || report.incident?.administrative_area?.name || 'Local Area, Ward 24',
        status: report.incident?.status || 'pending',
        date: report.submitted_at || report.created_at,
        category: report.incident?.category ? report.incident.category.replace(/_/g, ' ') : 'Civic Waste / Sanitation',
        priorityScore: report.incident?.priority_score || 30.0,
        evidence: report.evidence,
        rawObj: report
      });
    });
  }

  if (Array.isArray(listings)) {
    listings.forEach(item => {
      const isDonation = item.listing_type === 'donation' || item.listing_type === 'give_away';
      combinedActivities.push({
        id: item.id ? `#SUR-${item.id.slice(0, 4).toUpperCase()}` : '#SUR-DUMM',
        rawId: item.id,
        type: isDonation ? 'donation' : 'surplus',
        typeLabel: isDonation ? 'Item Donated' : 'Surplus Listing',
        title: item.title,
        description: item.description,
        location: item.location?.name || (item.owner?.username ? `${item.owner.username}` : 'Local Area'),
        status: item.status || 'active',
        date: item.created_at,
        category: item.category?.name || 'Surplus Goods',
        price: item.price,
        condition: item.condition,
        owner: item.owner?.username || 'You',
        photos: item.photos,
        rawObj: item
      });
    });
  }

  // Sort activities by date descending
  combinedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter activities by selected tab
  const filteredActivities = combinedActivities.filter(act => {
    if (activeTab === 'all') return true;
    if (activeTab === 'swc') return act.type === 'swc';
    if (activeTab === 'surplus') return act.type === 'surplus' || act.type === 'donation';
    return true;
  });

  // =========================================================
  // DONUT CHART CALCULATIONS
  // =========================================================
  const circumference = 2 * Math.PI * 48; // ~301.59

  // 1. SWC Summary
  const swcTotal = reports.length;
  const swcInProgressCount = reports.filter(r => r.incident?.status === 'in_progress' || !r.incident?.status).length;
  const swcResolvedCount = reports.filter(r => r.incident?.status === 'resolved').length;
  const swcClosedCount = reports.filter(r => r.incident?.status === 'closed').length;
  const swcRejectedCount = reports.filter(r => r.incident?.status === 'rejected').length;

  const swcDonutValues = [
    { value: swcInProgressCount, color: 'var(--status-progress)', label: 'In Progress' },
    { value: swcResolvedCount, color: 'var(--status-success)', label: 'Resolved' },
    { value: swcClosedCount, color: 'var(--status-neutral)', label: 'Closed' },
    { value: swcRejectedCount, color: 'var(--status-danger)', label: 'Rejected' },
  ];

  // 2. Surplus Summary
  const surplusTotal = listings.length;
  const surplusActiveCount = listings.filter(l => l.status === 'active' || !l.status).length;
  const surplusClaimedCount = listings.filter(l => l.status === 'claimed' && l.listing_type !== 'donation').length;
  const surplusDonatedCount = listings.filter(l => l.status === 'claimed' && l.listing_type === 'donation').length;
  const surplusExpiredCount = listings.filter(l => l.status === 'inactive' || l.status === 'expired').length;

  const surplusDonutValues = [
    { value: surplusActiveCount, color: 'var(--gold-deep)', label: 'Active' },
    { value: surplusClaimedCount, color: 'var(--green-800)', label: 'Sold / Transferred' },
    { value: surplusDonatedCount, color: 'var(--status-success)', label: 'Completed (Donated)' },
    { value: surplusExpiredCount, color: 'var(--status-neutral)', label: 'Inactive / Expired' },
  ];

  const renderDonutSegments = (values, total) => {
    if (total === 0) return null;
    let accumulatedOffset = 0;
    return values.map((seg, idx) => {
      if (seg.value === 0) return null;
      const fraction = seg.value / total;
      const segLength = fraction * circumference;
      const offset = (accumulatedOffset / total) * circumference;
      accumulatedOffset += seg.value;

      return (
        <circle
          key={idx}
          className="donut-seg"
          cx="60"
          cy="60"
          r="48"
          stroke={seg.color}
          strokeDasharray={`${segLength} ${circumference - segLength}`}
          strokeDashoffset={-offset}
          style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)', transition: 'stroke-dasharray 0.8s ease' }}
        />
      );
    });
  };

  return (
    <div className="my-activity-page">
      {/* BREADCRUMB */}
      <nav className="ss-breadcrumb" aria-label="Breadcrumb">
        <a href="#">Home</a><span aria-hidden="true">/</span><span aria-current="page">My Activity</span>
      </nav>

      {/* HERO / PAGE HEADER */}
      <section className="activity-header">
        <div className="activity-header-leaf" aria-hidden="true">
          <svg viewBox="0 0 100 170">
            <path d="M28 165C23 122 25 80 42 42" stroke="var(--green-700)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="23" cy="133" rx="18" ry="10" fill="var(--pastel-green)" stroke="var(--green-700)" strokeWidth="1.3" transform="rotate(-28 23 133)" />
            <ellipse cx="20" cy="98" rx="16" ry="9" fill="var(--pastel-green)" stroke="var(--green-700)" strokeWidth="1.3" transform="rotate(-20 20 98)" />
            <ellipse cx="31" cy="66" rx="14" ry="8" fill="var(--pastel-green)" stroke="var(--green-700)" strokeWidth="1.3" transform="rotate(-10 31 66)" />
            <ellipse cx="45" cy="38" rx="13" ry="7.5" fill="var(--pastel-gold)" stroke="var(--gold-deep)" strokeWidth="1.3" transform="rotate(4 45 38)" />
          </svg>
        </div>
        <div className="activity-header-text">
          <p className="activity-eyebrow">My Activity · Kanas</p>
          <h1 className="activity-title">My Activity</h1>
          <p className="activity-subtitle">Track your reports, listings and your contribution towards a cleaner and better community.</p>
        </div>

        <div className="activity-header-visual" aria-hidden="true">
          <svg className="impact-rings" viewBox="0 0 180 180">
            <circle className="ring-track" cx="90" cy="90" r="78" />
            <circle className="ring-track" cx="90" cy="90" r="58" />
            <circle className="ring-track" cx="90" cy="90" r="38" />
            <circle className="ring-arc ring-arc--outer" cx="90" cy="90" r="78" />
            <circle className="ring-arc ring-arc--mid" cx="90" cy="90" r="58" />
            <circle className="ring-arc ring-arc--inner" cx="90" cy="90" r="38" />
          </svg>
          <div className="impact-rings-label">
            <strong>{120}</strong>
            <span>Impact Pts</span>
          </div>
        </div>

        <button 
          onClick={handleExportReport}
          className="ss-btn ss-btn--primary activity-export"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Export Report
        </button>
      </section>

      {/* FILTER TABS */}
      <div className="activity-tabs" role="tablist" aria-label="Activity filter">
        <button 
          className={`activity-tab ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
          role="tab"
          aria-selected={activeTab === 'all'}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="10" width="18" height="4" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="16" width="18" height="4" rx="1.2" stroke="currentColor" stroke-width="1.6"/></svg>
          All Activity
        </button>
        <button 
          className={`activity-tab ${activeTab === 'swc' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('swc')}
          role="tab"
          aria-selected={activeTab === 'swc'}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9h12l-1.2 10.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M6 9a2 2 0 1 1 12 0" stroke="currentColor" strokeWidth="1.6"/></svg>
          SWC — My Complaints
        </button>
        <button 
          className={`activity-tab ${activeTab === 'surplus' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('surplus')}
          role="tab"
          aria-selected={activeTab === 'surplus'}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          SURPLUS — My Listings &amp; Requests
        </button>
      </div>

      {/* STATS TILES */}
      <section className="stats-grid" aria-label="Activity statistics">
        <article className="stat-card stat-card--green">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </span>
          <span className="stat-number">{countTotal}</span>
          <span className="stat-label">Total Activities</span>
          <span class="stat-sub">All Time</span>
        </article>

        <article className="stat-card stat-card--gold">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 9h12l-1.2 10.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M6 9a2 2 0 1 1 12 0" stroke="currentColor" strokeWidth="1.6"/></svg>
          </span>
          <span className="stat-number">{countSwc}</span>
          <span className="stat-label">SWC Complaints</span>
          <span className="stat-sub">Reported</span>
        </article>

        <article className="stat-card stat-card--cream">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countSurplus}</span>
          <span className="stat-label">Surplus Listings</span>
          <span className="stat-sub">Created</span>
        </article>

        <article className="stat-card stat-card--soft-green">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.6-7-10a4.8 4.8 0 0 1 8.5-3A4.8 4.8 0 0 1 19 11c0 5.4-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countDonated}</span>
          <span className="stat-label">Items Donated</span>
          <span className="stat-sub">Lifetime</span>
        </article>

        <article className="stat-card stat-card--blue">
          <span className="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3.5 6 6.8 6 10.5A6 6 0 0 1 6 13.5C6 9.8 9 6.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          </span>
          <span className="stat-number">{countWaste} kg</span>
          <span className="stat-label">Waste Prevented</span>
          <span className="stat-sub">Estimated</span>
        </article>
      </section>

      {/* RECENT ACTIVITY TABLE */}
      <section className="panel activity-table-card">
        <div className="panel-head">
          <h2>Recent Activity</h2>
          <button 
            type="button" 
            className="panel-link"
            onClick={() => triggerToast('Viewing all logs')}
          >
            View All Activity
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-faint)' }}>
              Loading logs...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-faint)', fontSize: '13.5px' }}>
              No activities found.
            </div>
          ) : (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Title / Item</th>
                  <th>Location / User</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.rawId}>
                    <td data-label="ID"><span className="row-id">{act.id}</span></td>
                    <td data-label="Type">
                      <span className={`type-pill type-pill--${act.type === 'swc' ? 'swc' : act.type === 'donation' ? 'donation' : 'surplus'}`}>
                        <i></i>{act.typeLabel}
                      </span>
                    </td>
                    <td data-label="Title / Item">{act.title}</td>
                    <td data-label="Location / User">{act.location}</td>
                    <td data-label="Status">{getStatusPill(act.status, act.type)}</td>
                    <td data-label="Date">{formatDate(act.date)}</td>
                    <td data-label="Action" className="col-action">
                      <button 
                        onClick={() => setSelectedActivity(act)}
                        className="row-action"
                      >
                        View Details 
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* SUMMARY DONUTS */}
      <section className="summary-grid">
        {/* SWC DONUT */}
        <article className="panel summary-card">
          <div className="panel-head">
            <h2>SWC — Complaint Summary</h2>
            <button onClick={() => triggerToast('SWC overview')} className="panel-link">
              View All
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="donut-row">
            <div className="donut-wrap">
              <svg className="donut" viewBox="0 0 120 120">
                <circle className="donut-base" cx="60" cy="60" r="48" />
                {renderDonutSegments(swcDonutValues, swcTotal)}
              </svg>
              <div className="donut-center">
                <strong>{swcTotal}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul className="donut-legend">
              {swcDonutValues.map((seg, idx) => (
                <li key={idx}>
                  <i style={{ background: seg.color }}></i>
                  {seg.label}
                  <b>{seg.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* SURPLUS DONUT */}
        <article className="panel summary-card">
          <div className="panel-head">
            <h2>SURPLUS — Listing Summary</h2>
            <button onClick={() => triggerToast('Surplus overview')} className="panel-link">
              View All
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="donut-row">
            <div className="donut-wrap">
              <svg className="donut" viewBox="0 0 120 120">
                <circle className="donut-base" cx="60" cy="60" r="48" />
                {renderDonutSegments(surplusDonutValues, surplusTotal)}
              </svg>
              <div className="donut-center">
                <strong>{surplusTotal}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul className="donut-legend">
              {surplusDonutValues.map((seg, idx) => (
                <li key={idx}>
                  <i style={{ background: seg.color }}></i>
                  {seg.label}
                  <b>{seg.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* IMPACT OVERVIEW CARD */}
      <section className="impact-overview">
        <svg className="impact-pattern" viewBox="0 0 260 220" aria-hidden="true">
          <circle className="pattern-ring" cx="210" cy="60" r="30" />
          <circle className="pattern-ring" cx="210" cy="60" r="55" />
          <circle className="pattern-ring" cx="210" cy="60" r="80" />
          <path className="pattern-leaf" d="M170 190c20-40 55-55 90-50-5 35-30 60-70 65-10-5-16-9-20-15Z" />
        </svg>

        <h2 className="impact-title">Your Impact Overview</h2>

        <div className="impact-grid">
          <div className="impact-item">
            <span className="impact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3.5 6 6.8 6 10.5A6 6 0 0 1 6 13.5C6 9.8 9 6.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span>
            <strong>{countWaste} kg</strong>
            <span>Waste Prevented</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M3 8l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span>
            <strong>{countSurplus}</strong>
            <span>Items Reused / Rehomed</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.6-7-10a4.8 4.8 0 0 1 8.5-3A4.8 4.8 0 0 1 19 11c0 5.4-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span>
            <strong>{countDonated}</strong>
            <span>Items Donated</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9h12l-1.2 10.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M6 9a2 2 0 1 1 12 0" stroke="currentColor" strokeWidth="1.6"/></svg></span>
            <strong>{countSwc}</strong>
            <span>Issues Reported</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.6"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span>
            <strong>{120}</strong>
            <span>Impact Points Earned</span>
          </div>
        </div>
      </section>

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <div className="activity-modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="activity-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="activity-modal-header">
              <div>
                <div className="activity-modal-tag">
                  <span className={`type-pill type-pill--${selectedActivity.type === 'swc' ? 'swc' : selectedActivity.type === 'donation' ? 'donation' : 'surplus'}`}>
                    <i></i>{selectedActivity.typeLabel}
                  </span>
                  {getStatusPill(selectedActivity.status, selectedActivity.type)}
                </div>
                <h3 className="activity-modal-title">{selectedActivity.id}</h3>
              </div>
              <button 
                className="activity-modal-close" 
                onClick={() => setSelectedActivity(null)}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="activity-modal-body">
              <div className="activity-detail-section">
                <h4>Title &amp; Description</h4>
                <p className="activity-detail-desc">{selectedActivity.title || selectedActivity.description || "No description provided."}</p>
              </div>

              <div className="activity-detail-grid">
                <div className="activity-detail-cell">
                  <span className="cell-label">Category</span>
                  <span className="cell-value">{selectedActivity.category}</span>
                </div>
                <div className="activity-detail-cell">
                  <span className="cell-label">Location / Area</span>
                  <span className="cell-value">{selectedActivity.location}</span>
                </div>
                <div className="activity-detail-cell">
                  <span className="cell-label">Submitted On</span>
                  <span className="cell-value">{formatDate(selectedActivity.date)}</span>
                </div>
                {selectedActivity.type === 'swc' ? (
                  <div className="activity-detail-cell">
                    <span className="cell-label">AI Priority Score</span>
                    <span className="cell-value">{selectedActivity.priorityScore} / 100</span>
                  </div>
                ) : (
                  <div className="activity-detail-cell">
                    <span className="cell-label">Price / Listing Type</span>
                    <span className="cell-value">
                      {selectedActivity.price ? `₹${selectedActivity.price}` : 'Free Giveaway'}
                    </span>
                  </div>
                )}
              </div>

              {selectedActivity.type === 'swc' && (
                <div className="activity-timeline-box">
                  <h4>Complaint Routing &amp; Status</h4>
                  <div className="timeline-step">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <strong>Report Registered</strong>
                      <span>Validated and assigned to local municipal ward authority.</span>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className={`timeline-dot ${selectedActivity.status !== 'pending' ? 'active' : ''}`}></div>
                    <div className="timeline-content">
                      <strong>Field Verification &amp; Clearance</strong>
                      <span>
                        {selectedActivity.status === 'resolved' || selectedActivity.status === 'closed'
                          ? 'Action completed and verified by sanitation team.'
                          : 'Sanitation team inspection in progress.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="activity-modal-footer">
              <button 
                className="ss-btn ss-btn--primary" 
                onClick={() => setSelectedActivity(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
