import React, { useState } from 'react';
import './GovResolvedPage.css';
import GovDetailMap from '../../../shared/components/layout/GovDetailMap';

const INITIAL_RESOLVED = [
  { id:"SS-24771", title:"Public toilet waste disposal issue", severity:"medium",
    locality:"Bus Stand Area, Ward 14", distance:"0.6 km",
    resolvedTime:"2 days ago", coords:"23.6754° N, 86.9538° E", resolutionHours:9.5,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#7a3d4a,#471f27)",
    desc:"Overflow from public toilet waste bin near the bus stand, cleared and sanitized by Team Bravo.",
    aiNote:"Cleanup verified against before/after photo pair. Waste volume reduced to baseline; no further action required.",
    confidence:97, verified:true, rating:5, reopened:false, resolvedBy:"Team Bravo · Sector 7" },
  { id:"SS-24759", title:"Roadside dumping near market entrance", severity:"low",
    locality:"Hutton Road, Ward 14", distance:"1.2 km",
    resolvedTime:"3 days ago", coords:"23.6788° N, 86.9569° E", resolutionHours:14.2,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo:"linear-gradient(135deg,#5f7a3d,#324719)",
    desc:"Vegetable market spillover waste cleared during scheduled morning collection route.",
    aiNote:"Confirmed resolved via routine collection log cross-reference. No citizen follow-up complaint received.",
    confidence:92, verified:true, rating:4, reopened:false, resolvedBy:"Team Alpha · Sector 4" },
  { id:"SS-24741", title:"Overflowing bin, Ushagram crossing", severity:"high",
    locality:"Ushagram, Ward 14", distance:"1.1 km",
    resolvedTime:"4 days ago", coords:"23.6812° N, 86.9601° E", resolutionHours:6.8,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5c4a3a,#2e2419)",
    desc:"Bin overflow near crossing cleared same-day after priority dispatch flagged by AI triage.",
    aiNote:"Before/after image comparison shows full clearance. Response time well within SLA for high-severity tier.",
    confidence:95, verified:true, rating:5, reopened:false, resolvedBy:"Team Bravo · Sector 7" },
  { id:"SS-24730", title:"Blocked drain, Court Road", severity:"medium",
    locality:"Court Road, Ward 14", distance:"0.8 km",
    resolvedTime:"5 days ago", coords:"23.6765° N, 86.9552° E", resolutionHours:18.4,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Drainage Cell",
    photo:"linear-gradient(135deg,#3d5f7a,#1f3547)",
    desc:"Drain desilted and plastic debris cleared; waterlogging no longer observed after test rainfall.",
    aiNote:"Follow-up drone pass confirms drain flow restored. No standing water detected in latest imagery.",
    confidence:88, verified:false, rating:0, reopened:false, resolvedBy:"Drainage Cell · Rapid Response" },
  { id:"SS-24718", title:"Litter, Damodar Ghat walking path", severity:"low",
    locality:"Damodar Ghat, Ward 14", distance:"2.3 km",
    resolvedTime:"6 days ago", coords:"23.6698° N, 86.9445° E", resolutionHours:22.1,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Parks & Riverside",
    photo:"linear-gradient(135deg,#3d7a5f,#1f472e)",
    desc:"Routine sweep cleared scattered litter along the riverside path during scheduled maintenance.",
    aiNote:"Low-priority item closed via routine sweep log. No dedicated dispatch was required.",
    confidence:74, verified:true, rating:3, reopened:false, resolvedBy:"Team Echo · Market Road" },
  { id:"SS-24705", title:"Garbage pile, G.T. Road crossing", severity:"high",
    locality:"G.T. Road Crossing, Ward 14", distance:"0.9 km",
    resolvedTime:"1 week ago", coords:"23.6771° N, 86.9578° E", resolutionHours:8.3,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo:"linear-gradient(135deg,#7a4a3d,#471f1f)",
    desc:"Loose garbage near auto stand cleared; area resurveyed twice to confirm no recurrence.",
    aiNote:"Recurrence check after 48 hours shows no new accumulation — closing with high confidence.",
    confidence:90, verified:true, rating:2, reopened:true, resolvedBy:"Team Alpha · Sector 4" },
  { id:"SS-24689", title:"Community bin overflow, Sector 2", severity:"medium",
    locality:"Ushagram Crossing, Ward 14", distance:"1.4 km",
    resolvedTime:"1 week ago", coords:"23.6829° N, 86.9612° E", resolutionHours:11.6,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#5f6b7a,#2e3547)",
    desc:"Community bin emptied and collection frequency adjusted after third repeat report this month.",
    aiNote:"Escalated to scheduling review; collection frequency at this stop has been increased going forward.",
    confidence:83, verified:true, rating:4, reopened:false, resolvedBy:"Team Bravo · Sector 7" },
  { id:"SS-24662", title:"Minor litter, bus shelter", severity:"low",
    locality:"Bus Stand Area, Ward 14", distance:"0.6 km",
    resolvedTime:"9 days ago", coords:"23.6754° N, 86.9538° E", resolutionHours:16.0,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5f7a5a,#2e4728)",
    desc:"Bundled with routine zone sweep; wrappers and cups cleared from shelter bench area.",
    aiNote:"No hazard indicators present; item closed as part of scheduled maintenance route.",
    confidence:68, verified:false, rating:0, reopened:false, resolvedBy:"Team Echo · Market Road" },
  { id:"SS-24631", title:"Illegal dumping, vacant plot", severity:"high",
    locality:"Sarat Colony, Ward 14", distance:"0.4 km",
    resolvedTime:"10 days ago", coords:"23.6739° N, 86.9524° E", resolutionHours:5.4,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#6b7d63,#3a4a35)",
    desc:"Construction debris and household waste removed same day due to proximity to school priority flag.",
    aiNote:"Priority-flagged case closed within target window. Plot resurveyed — no further dumping observed.",
    confidence:96, verified:true, rating:5, reopened:false, resolvedBy:"Team Delta · Riverside" },
  { id:"SS-24604", title:"Waterlogging, residential lane", severity:"medium",
    locality:"Rambandhu Talab, Ward 14", distance:"1.6 km",
    resolvedTime:"12 days ago", coords:"23.6721° N, 86.9487° E", resolutionHours:20.7,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#7a6a3d,#473c1f)",
    desc:"Missed-collection backlog cleared; residents confirmed odor complaint resolved on follow-up call.",
    aiNote:"Citizen follow-up call logged as satisfied. Scheduling adjustment applied to prevent recurrence.",
    confidence:85, verified:true, rating:4, reopened:false, resolvedBy:"Team Alpha · Sector 4" },
];

const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };

export default function GovResolvedPage() {
  const [cases, setCases] = useState(INITIAL_RESOLVED);
  const [selectedId, setSelectedId] = useState(INITIAL_RESOLVED[0].id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return c.verified;
    if (activeFilter === 'unverified') return !c.verified;
    if (activeFilter === 'reopened') return c.reopened;
    return true;
  });

  const selectedCase = cases.find(c => c.id === selectedId);

  // Stats
  const resolvedThisMonth = 158;
  const avgResolutionTime = '13.6h';
  const avgCitizenRating = '4.5/5';
  const reopenedCount = cases.filter(c => c.reopened).length;

  const handleReopen = () => {
    if (!selectedCase) return;
    const confirmReopen = window.confirm(`Are you sure you want to reopen ticket ${selectedCase.id}?`);
    if (!confirmReopen) return;

    setCases(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          reopened: true,
          verified: false
        };
      }
      return c;
    }));
  };

  const renderStars = (rating) => {
    const starList = [];
    for (let i = 1; i <= 5; i++) {
      starList.push(
        <svg 
          key={i} 
          className={i <= rating ? 'filled' : 'empty'} 
          viewBox="0 0 24 24" 
          strokeWidth="1.5"
          style={{ width: '13px', height: '13px', marginRight: '2px' }}
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      );
    }
    return <span className="stars">{starList}</span>;
  };

  return (
    <div className="gov-resolved-page">
      <section className="stats">
        <div className="stat-card resolved">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span className="trend up">+18%</span>
          </div>
          <div className="value">{resolvedThisMonth}</div>
          <div className="label">Resolved This Month</div>
        </div>
        <div className="stat-card in-progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
          </div>
          <div className="value">{avgResolutionTime}</div>
          <div className="label">Avg. Resolution Time</div>
        </div>
        <div className="stat-card total">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
          </div>
          <div className="value">{avgCitizenRating}</div>
          <div className="label">Avg. Citizen Rating</div>
        </div>
        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
            </div>
          </div>
          <div className="value">{reopenedCount}</div>
          <div className="label">Reopened Cases</div>
        </div>
      </section>

      <section className="resolved-workspace">
        {/* Left Closed complaints List */}
        <div className="panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Closed Complaints</h2>
              <span className="count-badge">{filteredCases.length} resolved</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e1e6dc', borderRadius: '20px', padding: '4px 10px', gap: '6px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px', color: 'var(--ink-400)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search resolved..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '11px', width: '120px', background: 'none' }}
              />
            </div>
          </div>

          <div className="filters">
            <div className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</div>
            <div className={`chip ${activeFilter === 'verified' ? 'active' : ''}`} onClick={() => setActiveFilter('verified')}>Citizen Verified</div>
            <div className={`chip ${activeFilter === 'unverified' ? 'active' : ''}`} onClick={() => setActiveFilter('unverified')}>Pending Verification</div>
            <div className={`chip ${activeFilter === 'reopened' ? 'active' : ''}`} onClick={() => setActiveFilter('reopened')}>Reopened</div>
          </div>

          <div className="queue">
            {filteredCases.map(c => (
              <div 
                key={c.id}
                className={`complaint ${c.id === selectedId ? 'selected' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="thumb" style={{ background: c.photo }}></div>
                <div className="c-main">
                  <div className="c-top">
                    <span className="c-id">{c.id}</span>
                    <span className={`sev-badge ${c.severity}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                      {SEV_LABEL[c.severity]}
                    </span>
                    {c.reopened && (
                      <span className="verified-tag" style={{ background: 'var(--red-100)', color: 'var(--red-500)' }}>
                        Reopened
                      </span>
                    )}
                  </div>
                  <div className="c-title">{c.title}</div>
                  <div className="c-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {c.locality} · {c.distance}
                  </div>
                </div>
                <div className="c-right">
                  <span className="status-pill resolved">Resolved</span>
                  <span className="c-time">{c.resolvedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="right-col">
          <div className="panel detail-panel">
            {selectedCase ? (
              <>
                <div className="d-photo" style={{ position: 'relative' }}>
                  <GovDetailMap coords={selectedCase.coords} />
                  <span className={`sev-badge ${selectedCase.severity}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                    {SEV_LABEL[selectedCase.severity]} Severity
                  </span>
                  <span className="d-id">{selectedCase.id}</span>
                </div>
                <div className="d-body">
                  <div className="d-title">{selectedCase.title}</div>
                  <div className="d-desc">{selectedCase.desc}</div>

                  {selectedCase.reopened ? (
                    <div className="resolved-summary" style={{ background: 'var(--red-100)', borderColor: '#f0c7c2' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--red-500)" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                      </svg>
                      <div>
                        <div className="rs-title" style={{ color: 'var(--red-500)' }}>Case Reopened</div>
                        <div className="rs-sub">Citizen reported recurrence after closure</div>
                      </div>
                    </div>
                  ) : (
                    <div className="resolved-summary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <div>
                        <div className="rs-title">Closed &amp; {selectedCase.verified ? 'Citizen Verified' : 'Pending Verification'}</div>
                        <div className="rs-sub">Resolved by {selectedCase.resolvedBy}</div>
                      </div>
                    </div>
                  )}

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <div>
                      <div className="l">Jurisdiction</div>
                      <div className="v">{selectedCase.jurisdiction}</div>
                    </div>
                  </div>
                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    <div>
                      <div className="l">Resolution Time</div>
                      <div className="v mono">{selectedCase.resolutionHours}h</div>
                    </div>
                  </div>
                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div className="l">Coordinates</div>
                      <div className="v mono">{selectedCase.coords}</div>
                    </div>
                  </div>
                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    <div>
                      <div className="l">Citizen Rating</div>
                      <div className="v">
                        {selectedCase.rating > 0 ? (
                          renderStars(selectedCase.rating)
                        ) : (
                          <span style={{ color: 'var(--ink-400)', fontWeight: 500 }}>Not rated yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ai-box">
                    <div className="ai-top">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2 2 7l10 5 10-5-10-5z"/><circle cx="12" cy="14" r="1"/>
                      </svg>
                      <span>AI Assessment</span>
                    </div>
                    <div className="ai-line">{selectedCase.aiNote}</div>
                    <div className="confidence-bar"><i style={{ width: `${selectedCase.confidence}%` }}></i></div>
                    <div style={{ fontSize: '10.5px', color: '#B9CDBA', marginTop: '5px', fontFamily: '"IBM Plex Mono", monospace' }}>
                      Confidence {selectedCase.confidence}%
                    </div>
                  </div>

                  <div className="assign-row">
                    <button className="btn btn-ghost" onClick={() => alert(`Opening before/after imagery verification for ticket ${selectedCase.id}`)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                      View Before/After
                    </button>
                    <button 
                      className="btn btn-warn" 
                      onClick={handleReopen}
                      disabled={selectedCase.reopened}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                      </svg>
                      Reopen Case
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <p>Select a resolved case to view verification details and citizen feedback.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
