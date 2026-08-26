import React, { useState, useEffect } from 'react';
import './GovResolvedPage.css';
import GovDetailMap from '../../../shared/components/layout/GovDetailMap';
import { incidentsApi } from '../../../services/incidentsApi';

const INITIAL_RESOLVED = [];

const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };

export default function GovResolvedPage() {
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchResolved() {
      try {
        const data = await incidentsApi.getAll();
        if (data && data.length > 0) {
          const resolvedData = data.filter(inc => inc.status === 'resolved' || inc.status === 'closed');
          const mapped = resolvedData.map(inc => {
            const severity = inc.priority_score > 7.0 ? 'high' : inc.priority_score > 4.0 ? 'medium' : 'low';
            return {
              id: inc.id || `SS-mock-${Math.floor(1000 + Math.random() * 9000)}`,
              title: inc.description || (inc.category ? inc.category.replace('_', ' ') : 'Uncategorized Waste'),
              severity: severity,
              locality: inc.representative_location?.name || 'BMC Ward 24',
              distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km`,
              resolvedTime: 'Recently',
              coords: inc.representative_location ? `${inc.representative_location.latitude}° N, ${inc.representative_location.longitude}° E` : "23.6739° N, 86.9524° E",
              resolutionHours: 12.5,
              jurisdiction: inc.representative_location ? `Ward 14 → Bhubaneshwar Municipal Corp. → Sanitation` : "Ward 14 → Bhubaneshwar Municipal Corp. → Sanitation Zone 3",
              photo: "linear-gradient(135deg,#6b7d63,#3a4a35)",
              desc: inc.description || 'No description provided.',
              aiNote: `AI priority score: ${inc.priority_score}. Category: ${inc.category || 'garbage_accumulation'}.`,
              confidence: 90,
              verified: true,
              rating: 5,
              reopened: false,
              resolvedBy: inc.assigned_officer?.name || "Sanitation Team Alpha"
            };
          });
          setCases(mapped);
          if (mapped.length > 0) {
            setSelectedId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading resolved cases:", err);
      }
    }
    fetchResolved();
  }, []);

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
