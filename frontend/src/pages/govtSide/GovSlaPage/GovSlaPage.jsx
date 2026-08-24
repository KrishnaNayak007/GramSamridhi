import React, { useState } from 'react';
import './GovSlaPage.css';
import GovDetailMap from '../../../shared/components/layout/GovDetailMap';

const SLA_TARGET_HOURS = { high: 8, medium: 24, low: 72 };

const INITIAL_CASES = [
  { id:"SS-24816", title:"Overflowing bin near Sarat Colony market", severity:"high",
    status:"submitted", locality:"Sarat Colony, Ward 14", distance:"0.4 km",
    coords:"23.6739° N, 86.9524° E", elapsedHours:0.3, assignedTeam:"Unassigned",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#6b7d63,#3a4a35)",
    desc:"Citizen reports a municipal bin overflowing onto the footpath for 3+ days, blocking pedestrian access.", escalated: false },
  { id:"SS-24815", title:"Illegal dumping behind Girls' High School", severity:"high",
    status:"submitted", locality:"Ushagram, Ward 14", distance:"1.1 km",
    coords:"23.6812° N, 86.9601° E", elapsedHours:0.7, assignedTeam:"Unassigned",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5c4a3a,#2e2419)",
    desc:"Construction debris and household waste dumped on vacant plot adjacent to school boundary wall.", escalated: false },
  { id:"SS-24811", title:"Garbage pile near auto stand", severity:"high",
    status:"assigned", locality:"G.T. Road Crossing, Ward 14", distance:"0.9 km",
    coords:"23.6771° N, 86.9578° E", elapsedHours:6.4, assignedTeam:"Team Bravo · Sector 7",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo:"linear-gradient(135deg,#7a4a3d,#471f1f)",
    desc:"Loose garbage accumulating around the auto-rickshaw stand, spilling onto the main carriageway.", escalated: false },
  { id:"SS-24798-B", title:"Debris blocking storm drain, Zone 1", severity:"high",
    status:"assigned", locality:"Court Road, Ward 14", distance:"0.8 km",
    coords:"23.6765° N, 86.9552° E", elapsedHours:9.1, assignedTeam:"Drainage Cell",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Drainage Cell",
    photo:"linear-gradient(135deg,#3d5f7a,#1f3547)",
    desc:"Storm drain blocked by construction debris, flagged as high priority ahead of forecast rainfall.", escalated: false },
  { id:"SS-24802", title:"Blocked drain causing waterlogging", severity:"medium",
    status:"assigned", locality:"Court Road, Ward 14", distance:"0.8 km",
    coords:"23.6765° N, 86.9552° E", elapsedHours:14.5, assignedTeam:"Drainage Cell",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Drainage Cell",
    photo:"linear-gradient(135deg,#3d5f7a,#1f3547)",
    desc:"Plastic and silt buildup blocking roadside drain, causing water to pool near shop entrances.", escalated: false },
  { id:"SS-24798", title:"Uncollected garbage — residential lane", severity:"medium",
    status:"progress", locality:"Rambandhu Talab, Ward 14", distance:"1.6 km",
    coords:"23.6721° N, 86.9487° E", elapsedHours:19.8, assignedTeam:"Team Alpha · Sector 4",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#7a6a3d,#473c1f)",
    desc:"Household waste accumulating for over a week after missed collection rounds.", escalated: false },
  { id:"SS-24795", title:"Overflowing community bin, Zone 2", severity:"medium",
    status:"assigned", locality:"Ushagram Crossing, Ward 14", distance:"1.4 km",
    coords:"23.6829° N, 86.9612° E", elapsedHours:27.3, assignedTeam:"Team Bravo · Sector 7",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#5f6b7a,#2e3547)",
    desc:"Shared community bin overflowing near residential crossing; waste scattered overnight.", escalated: false },
  { id:"SS-24790", title:"Litter along riverside walking path", severity:"low",
    status:"progress", locality:"Damodar Ghat, Ward 14", distance:"2.3 km",
    coords:"23.6698° N, 86.9445° E", elapsedHours:38.0, assignedTeam:"Team Echo · Market Road",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Parks & Riverside",
    photo:"linear-gradient(135deg,#3d7a5f,#1f472e)",
    desc:"Scattered plastic wrappers and bottles along the public walking path.", escalated: false },
  { id:"SS-24784", title:"Minor litter near bus shelter", severity:"low",
    status:"submitted", locality:"Bus Stand Area, Ward 14", distance:"0.6 km",
    coords:"23.6754° N, 86.9538° E", elapsedHours:58.2, assignedTeam:"Unassigned",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5f7a5a,#2e4728)",
    desc:"Light scattering of wrappers and cups around the bus shelter bench area.", escalated: false },
  { id:"SS-24762", title:"Overflowing bin, Zone 2 residential block", severity:"medium",
    status:"assigned", locality:"Rambandhu Talab, Ward 14", distance:"1.5 km",
    coords:"23.6733° N, 86.9491° E", elapsedHours:26.9, assignedTeam:"Team Alpha · Sector 4",
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#4a5c7a,#252e3d)",
    desc:"Residential block bin overflow past scheduled collection, now exceeding SLA target.", escalated: false },
];

const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };
const STATE_LABELS = { ontrack: "On Track", atrisk: "At Risk", breached: "Breached" };

export default function GovSlaPage() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [selectedId, setSelectedId] = useState(INITIAL_CASES[3].id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to calculate SLA state
  const getSlaState = (c) => {
    const target = SLA_TARGET_HOURS[c.severity];
    const pct = (c.elapsedHours / target) * 100;
    const state = pct >= 100 ? 'breached' : pct >= 70 ? 'atrisk' : 'ontrack';
    return { target, pct: Math.min(pct, 130), state, remaining: target - c.elapsedHours };
  };

  const formatHours = (h) => {
    const sign = h < 0 ? '-' : '';
    const abs = Math.abs(h);
    return `${sign}${abs.toFixed(1)}h`;
  };

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    return getSlaState(c).state === activeFilter;
  });

  const selectedCase = cases.find(c => c.id === selectedId);
  const selectedSla = selectedCase ? getSlaState(selectedCase) : null;

  // Stat calculations
  const onTrackCount = cases.filter(c => getSlaState(c).state === 'ontrack').length;
  const atRiskCount = cases.filter(c => getSlaState(c).state === 'atrisk').length;
  const breachedCount = cases.filter(c => getSlaState(c).state === 'breached').length;

  const handleEscalate = () => {
    if (!selectedCase) return;
    alert(`Escalation dispatch triggered for ticket ${selectedCase.id}! Dispatch notifications sent to drainage/sanitation managers.`);
    setCases(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          escalated: true
        };
      }
      return c;
    }));
  };

  return (
    <div className="gov-sla-page">
      <section className="stats">
        <div className="stat-card resolved">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
          </div>
          <div className="value">91%</div>
          <div className="label">Overall SLA Compliance</div>
        </div>
        <div className="stat-card progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
          </div>
          <div className="value">{onTrackCount}</div>
          <div className="label">On Track</div>
        </div>
        <div className="stat-card pending">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </div>
          </div>
          <div className="value">{atRiskCount}</div>
          <div className="label">At Risk</div>
        </div>
        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 17h.01"/>
              </svg>
            </div>
          </div>
          <div className="value">{breachedCount}</div>
          <div className="label">Breached</div>
        </div>
      </section>

      <section className="sla-workspace">
        {/* Left active clocks panel */}
        <div className="panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Active SLA Clocks</h2>
              <span className="count-badge">{filteredCases.length} cases</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e1e6dc', borderRadius: '20px', padding: '4px 10px', gap: '6px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px', color: 'var(--ink-400)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search clocks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '11px', width: '120px', background: 'none' }}
              />
            </div>
          </div>

          <div className="filters">
            <div className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</div>
            <div className={`chip ${activeFilter === 'ontrack' ? 'active' : ''}`} onClick={() => setActiveFilter('ontrack')}>
              <span className="sev-dot" style={{ background: 'var(--green-600)' }}></span>On Track
            </div>
            <div className={`chip ${activeFilter === 'atrisk' ? 'active' : ''}`} onClick={() => setActiveFilter('atrisk')}>
              <span className="sev-dot" style={{ background: 'var(--amber-500)' }}></span>At Risk
            </div>
            <div className={`chip ${activeFilter === 'breached' ? 'active' : ''}`} onClick={() => setActiveFilter('breached')}>
              <span className="sev-dot" style={{ background: 'var(--red-500)' }}></span>Breached
            </div>
          </div>

          <div className="queue">
            {filteredCases.map(c => {
              const s = getSlaState(c);
              const remainLabel = s.state === 'breached'
                ? `Breached by ${formatHours(Math.abs(s.remaining))}`
                : `${formatHours(s.remaining)} remaining`;

              return (
                <div 
                  key={c.id}
                  className={`complaint ${c.id === selectedId ? 'selected' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="row-top">
                    <div className="thumb" style={{ background: c.photo }}></div>
                    <div className="c-main">
                      <div className="c-top">
                        <span className="c-id">{c.id}</span>
                        <span className={`sev-badge ${c.severity}`}>
                          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          {SEV_LABEL[c.severity]}
                        </span>
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
                      <span className={`sla-pill ${s.state}`}>{STATE_LABELS[s.state]}</span>
                      <span className="c-time">{remainLabel}</span>
                    </div>
                  </div>
                  <div className="sla-track">
                    <div className={`fill ${s.state}`} style={{ width: `${Math.min(100, s.pct)}%` }}></div>
                  </div>
                </div>
              );
            })}
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
                  <div className="d-title">
                    {selectedCase.title}
                    {selectedCase.escalated && (
                      <span style={{ fontSize: '10px', background: 'var(--red-100)', color: 'var(--red-500)', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', marginLeft: '8px', textTransform: 'uppercase' }}>
                        Escalated
                      </span>
                    )}
                  </div>
                  <div className="d-desc">{selectedCase.desc}</div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <div>
                      <div className="l">Assigned To</div>
                      <div className="v">{selectedCase.assignedTeam}</div>
                    </div>
                  </div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <div>
                      <div className="l">Jurisdiction</div>
                      <div className="v">{selectedCase.jurisdiction}</div>
                    </div>
                  </div>

                  <div className="sla-box">
                    <div className="sla-top">
                      <span className="lab">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        SLA Clock
                      </span>
                      <span className={`sla-state ${selectedSla.state}`}>{STATE_LABELS[selectedSla.state]}</span>
                    </div>
                    <div className="sla-grid">
                      <div>
                        <div className="k">Target</div>
                        <div className="v">{selectedSla.target}h</div>
                      </div>
                      <div>
                        <div className="k">Elapsed</div>
                        <div className="v">{selectedCase.elapsedHours.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="k">{selectedSla.state === 'breached' ? 'Overdue' : 'Remaining'}</div>
                        <div className="v">{formatHours(Math.abs(selectedSla.remaining))}</div>
                      </div>
                    </div>
                    <div className="sla-bar">
                      <div className={`fill ${selectedSla.state}`} style={{ width: `${Math.min(100, selectedSla.pct)}%` }}></div>
                    </div>
                  </div>

                  <div className="assign-row">
                    <button className="btn btn-ghost" onClick={() => alert(`Opening full case for ticket ${selectedCase.id}`)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                      Open Full Case
                    </button>
                    <button className="btn btn-primary" onClick={handleEscalate} disabled={selectedCase.escalated}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Escalate
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <p>Select a case to view its SLA clock and deadline breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
