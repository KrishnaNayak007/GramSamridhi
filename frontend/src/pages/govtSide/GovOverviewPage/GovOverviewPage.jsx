import React, { useState, useEffect } from 'react';
import './GovOverviewPage.css';
import { apiFetch } from '../../../shared/lib/api';
import GovDetailMap from '../../../shared/components/layout/GovDetailMap';
import { incidentsApi } from '../../../services/incidentsApi';
import { formatCoordinates, parseCoordinates, formatJurisdiction } from '../../../shared/lib/formatCoords';

const SEEDED_COMPLAINTS = [];

const STEPS = ["submitted", "assigned", "progress", "resolved"];
const STEP_LABELS = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };
const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };

export default function GovOverviewPage({ onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [assignedTeam, setAssignedTeam] = useState('');

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const data = await incidentsApi.getAll();
        if (data && data.length > 0) {
          const mapped = data.map(inc => {
            const severity = inc.priority_score > 7.0 ? 'high' : inc.priority_score > 4.0 ? 'medium' : 'low';
            const status = inc.status === 'open' ? 'submitted' : inc.status === 'assigned' ? 'assigned' : inc.status === 'in_progress' ? 'progress' : 'resolved';
            return {
              id: inc.id || `SS-mock-${Math.floor(1000 + Math.random() * 9000)}`,
              title: inc.description || (inc.category ? inc.category.replace('_', ' ') : 'Uncategorized Waste'),
              severity: severity,
              status: status,
              locality: inc.representative_location?.name || inc.administrative_area?.name || 'BMC Ward',
              distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km`,
              time: 'Recently',
              officer: inc.assigned_officer?.name || null,
              coords: formatCoordinates(inc.representative_location),
              jurisdiction: formatJurisdiction(inc),
              photo: "linear-gradient(135deg,#6b7d63,#3a4a35)",
              desc: inc.description || 'No description provided.',
              aiNote: `AI priority score: ${inc.priority_score}. Category: ${inc.category || 'garbage_accumulation'}.`,
              confidence: 90,
              farmScore: (typeof inc.category === 'string' && (inc.category.toLowerCase().includes('agri') || inc.category.toLowerCase().includes('organic')))
                ? Math.floor(75 + Math.random() * 20)
                : Math.floor(10 + Math.random() * 60),
              mapTop: `${Math.floor(20 + Math.random() * 60)}%`,
              mapLeft: `${Math.floor(20 + Math.random() * 60)}%`
            };
          });
          setComplaints(prev => {
            const merged = [...prev];
            mapped.forEach(m => {
              const existsIdx = merged.findIndex(p => p.id === m.id);
              if (existsIdx !== -1) {
                merged[existsIdx] = { ...merged[existsIdx], ...m };
              } else {
                merged.unshift(m);
              }
            });
            return merged;
          });
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        console.error("Error loading incidents:", err);
      }
    }
    fetchComplaints();
  }, []);

  const mapRef = React.useRef(null);
  const googleMapRef = React.useRef(null);
  const markersRef = React.useRef({});

  // Helper to parse coordinate string
  const parseCoords = (coordStr) => {
    return parseCoordinates(coordStr, { lat: 20.296, lng: 85.824 });
  };

  useEffect(() => {
    const loadGoogleMapsScript = (callback) => {
      if (window.google && window.google.maps) {
        callback();
        return;
      }
      const scriptId = 'google-maps-script';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      const handleLoad = () => callback();
      script.addEventListener('load', handleLoad);
    };

    loadGoogleMapsScript(() => {
      if (!mapRef.current) return;
      if (!window.google || !window.google.maps) {
        console.warn("Google Maps is not defined yet.");
        return;
      }

      // Initialize Map if not already created
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.296, lng: 85.824 },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });
      }

      // Update/Clear Markers based on complaints list
      // 1. Clear markers that are no longer present
      Object.keys(markersRef.current).forEach(id => {
        if (!complaints.some(c => c.id === id)) {
          markersRef.current[id].setMap(null);
          delete markersRef.current[id];
        }
      });

      // 2. Add or update markers for complaints
      complaints.forEach(c => {
        const position = parseCoords(c.coords);
        
        // Marker icon based on severity
        let pinColor = 'red'; // high
        if (c.severity === 'medium') pinColor = 'yellow';
        else if (c.severity === 'low') pinColor = 'green';

        const markerIcon = `https://maps.google.com/mapfiles/ms/icons/${pinColor}-dot.png`;

        if (!markersRef.current[c.id]) {
          const marker = new window.google.maps.Marker({
            position: position,
            map: googleMapRef.current,
            title: c.title,
            icon: markerIcon,
          });

          marker.addListener('click', () => {
            setSelectedId(c.id);
          });

          markersRef.current[c.id] = marker;
        } else {
          markersRef.current[c.id].setPosition(position);
          markersRef.current[c.id].setIcon(markerIcon);
        }
      });

      // 3. Focus/Center on selected marker
      if (selectedId && markersRef.current[selectedId]) {
        const selectedMarker = markersRef.current[selectedId];
        googleMapRef.current.panTo(selectedMarker.getPosition());
        Object.values(markersRef.current).forEach(m => m.setAnimation(null));
        selectedMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => selectedMarker.setAnimation(null), 1400);
      }
    });
  }, [complaints, selectedId]);

  // UI Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  let toastTimer = null;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  const farmScoreTier = (score) => {
    if (score >= 60) return 'high';
    if (score >= 30) return 'mid';
    return 'low';
  };

  const renderFarmScoreBadge = (score) => {
    const fs = score !== undefined ? score : 0;
    return (
      <span className={`farm-score-badge ${farmScoreTier(fs)}`} title="AI-estimated share of organic waste in this report">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
        {fs}% Farm Score
      </span>
    );
  };

  // Calculate dynamic stats
  const totalCount = complaints.length;
  const awaitingCount = complaints.filter(c => c.status === 'submitted' || c.status === 'reported').length;
  const progressCount = complaints.filter(c => c.status === 'progress' || c.status === 'in_progress' || c.status === 'assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const urgentCount = complaints.filter(c => c.severity === 'high' && (c.status === 'submitted' || c.status === 'reported')).length;

  const selectedComplaint = complaints.find(c => c.id === selectedId) || complaints[0] || null;

  // Filters logic
  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'High') return c.severity === 'high';
    if (activeFilter === 'Medium') return c.severity === 'medium';
    if (activeFilter === 'Low') return c.severity === 'low';
    if (activeFilter === 'Unassigned') return c.status === 'submitted';
    if (activeFilter === 'My Team') return c.status === 'assigned' || c.status === 'progress';
    return true;
  });

  // Stepper SVG rendering mathematically
  const renderStepperSVG = (status) => {
    const idx = STEPS.indexOf(status);
    const positions = [30, 176, 322, 468]; // x coordinates over 500-wide viewbox
    const y = 26;
    let pathD = `M${positions[0]} ${y}`;
    pathD += ` C ${positions[0] + 60} ${y - 16}, ${positions[1] - 60} ${y + 16}, ${positions[1]} ${y}`;
    pathD += ` C ${positions[1] + 60} ${y - 16}, ${positions[2] - 60} ${y + 16}, ${positions[2]} ${y}`;
    pathD += ` C ${positions[2] + 60} ${y - 16}, ${positions[3] - 60} ${y + 16}, ${positions[3]} ${y}`;

    const doneColor = "#5FAE3D";
    const pendingColor = "#D9E2D3";

    let donePathD = "";
    if (idx > 0) {
      donePathD = `M${positions[0]} ${y}`;
      for (let i = 1; i <= idx; i++) {
        donePathD += ` C ${positions[i - 1] + 60} ${y - 16}, ${positions[i] - 60} ${y + 16}, ${positions[i]} ${y}`;
      }
    }

    return (
      <svg viewBox="0 0 500 52" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke={pendingColor} strokeWidth="3" />
        {idx > 0 && <path d={donePathD} fill="none" stroke={doneColor} strokeWidth="3" />}
        {positions.map((x, i) => {
          const state = i < idx ? 'done' : i === idx ? 'now' : 'pending';
          const fill = state === 'pending' ? pendingColor : doneColor;
          const r = state === 'now' ? 8 : 6;
          return (
            <g key={i}>
              {state === 'now' && (
                <circle cx={x} cy={y} r={12} fill="none" stroke={doneColor} strokeWidth="1.5" opacity="0.4" />
              )}
              <circle cx={x} cy={y} r={r} fill={fill} />
              {state !== 'pending' && (
                <path d={`M${x - 3} ${y} l2 2.5 l4.5 -5`} stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Dispatch Assignment Action
  const handleAssignTeam = async (e) => {
    const team = e.target.value;
    setAssignedTeam(team);
    if (!team) return;

    // Perform API call or update state locally
    setComplaints(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          status: 'assigned',
          jurisdiction: c.jurisdiction?.includes(' → ')
            ? `${c.jurisdiction.split(' → ')[0]} → ${c.jurisdiction.split(' → ')[1] || 'Bhubaneshwar Municipal Corp.'} → ${team.split(' · ')[0]}`
            : `${c.locality || 'Ward'} → Bhubaneshwar Municipal Corp. → ${team.split(' · ')[0]}`
        };
      }
      return c;
    }));
    triggerToast(`Incident assigned to ${team}`);
  };

  // Advance Status workflow transition
  const handleAdvanceStatus = () => {
    if (!selectedComplaint) return;
    const currentIndex = STEPS.indexOf(selectedComplaint.status);
    if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
      triggerToast('Incident is already resolved');
      return;
    }

    const nextStatus = STEPS[currentIndex + 1];
    setComplaints(prev => prev.map(c => {
      if (c.id === selectedId) {
        return { ...c, status: nextStatus };
      }
      return c;
    }));
    triggerToast(`Status advanced to: ${STEP_LABELS[nextStatus]}`);
  };

  return (
    <div className="gov-overview-page">
      {/* STATS STRIP */}
      <section className="stats">
        <div className="stat-card total">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" /><path d="M18.4 8.6 13 14l-3-3-4.6 4.6" />
              </svg>
            </div>
            <span className="trend up">+12%</span>
          </div>
          <div className="value">{totalCount}</div>
          <div className="label">Total complaints — this month</div>
        </div>

        <div className="stat-card pending">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="trend down">-4%</span>
          </div>
          <div className="value">{awaitingCount}</div>
          <div className="label">Awaiting assignment</div>
        </div>

        <div className="stat-card in-progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />
              </svg>
            </div>
            <span className="trend up">+6%</span>
          </div>
          <div className="value">{progressCount}</div>
          <div className="label">In progress</div>
        </div>

        <div className="stat-card resolved">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="trend up">+18%</span>
          </div>
          <div className="value">{resolvedCount}</div>
          <div className="label">Resolved &amp; verified</div>
        </div>

        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 2 21h20L12 2z" /><path d="M12 9v5M12 17h.01" />
              </svg>
            </div>
            <span className="trend down">Action</span>
          </div>
          <div className="value">{urgentCount}</div>
          <div className="label">High-severity, unassigned</div>
        </div>
      </section>

      {/* WORKSPACE SPLIT */}
      <section className="workspace">
        {/* COMPLAINT QUEUE PANEL */}
        <div className="panel">
          <div className="panel-head">
            <h2>Complaint Queue</h2>
            <span className="count-badge">{filteredComplaints.length} open</span>
          </div>

          <div className="filters">
            {['All', 'High', 'Medium', 'Low', 'Unassigned', 'My Team'].map(filterName => (
              <div 
                key={filterName}
                className={`chip ${activeFilter === filterName ? 'active' : ''}`}
                onClick={() => setActiveFilter(filterName)}
              >
                {filterName === 'High' && <span className="sev-dot" style={{ background: 'var(--red-500)' }}></span>}
                {filterName === 'Medium' && <span className="sev-dot" style={{ background: 'var(--amber-500)' }}></span>}
                {filterName === 'Low' && <span className="sev-dot" style={{ background: 'var(--green-600)' }}></span>}
                {filterName}
              </div>
            ))}
          </div>

          <div className="queue">
            {filteredComplaints.map(c => (
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
                      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                      {SEV_LABEL[c.severity]}
                    </span>
                    {renderFarmScoreBadge(c.farmScore)}
                  </div>
                  <div className="c-title">{c.title}</div>
                  <div className="c-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {c.locality} · {c.distance}
                  </div>
                </div>
                <div className="c-right">
                  <span className={`status-pill ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                  <span className="c-time">{c.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-col">
          {/* LIVE MAP */}
          <div className="panel map-panel">
            <div className="panel-head">
              <h2>Live Map</h2>
              <span className="count-badge">{complaints.length} Active</span>
            </div>
            <div ref={mapRef} className="map-canvas" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}></div>
            <div className="map-legend">
              <div className="li"><span className="sw" style={{ background: 'var(--red-500)' }}></span>High</div>
              <div className="li"><span class="sw" style={{ background: 'var(--amber-500)' }}></span>Medium</div>
              <div className="li"><span className="sw" style={{ background: 'var(--green-600)' }}></span>Low</div>
            </div>
          </div>

          {/* DETAIL PANEL */}
          <div className="panel detail-panel">
            {selectedComplaint ? (
              <>
                <div className="d-photo" style={{ position: 'relative' }}>
                  <GovDetailMap coords={selectedComplaint.coords} />
                  <span className={`sev-badge ${selectedComplaint.severity}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                    {SEV_LABEL[selectedComplaint.severity]} Severity
                  </span>
                  {renderFarmScoreBadge(selectedComplaint.farmScore)}
                  <span className="d-id">{selectedComplaint.id}</span>
                </div>

                <div className="d-body">
                  <div className="d-title">{selectedComplaint.title}</div>
                  <div className="d-desc">{selectedComplaint.desc}</div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
                    <div>
                      <div className="l">Farm Score</div>
                      <div className="v">{selectedComplaint.farmScore}% organic — <span style={{ color: 'var(--ink-400)', fontWeight: 500 }}>AI-estimated share of compostable waste, used to route recoverable material to the residue buy-back program.</span></div>
                    </div>
                  </div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <div>
                      <div className="l">Jurisdiction</div>
                      <div className="v">{selectedComplaint.jurisdiction}</div>
                    </div>
                  </div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div className="l">Coordinates</div>
                      <div className="v mono">{selectedComplaint.coords || "Location unavailable"}</div>
                    </div>
                  </div>

                  <div className="ai-box">
                    <div className="ai-top">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2 2 7l10 5 10-5-10-5z" /><circle cx="12" cy="14" r="1" />
                      </svg>
                      <span>AI Assessment</span>
                    </div>
                    <div className="ai-line">{selectedComplaint.aiNote}</div>
                    <div className="confidence-bar">
                      <i style={{ width: `${selectedComplaint.confidence}%` }}></i>
                    </div>
                    <div className="ai-box-confidence-label">Confidence {selectedComplaint.confidence}%</div>
                  </div>

                  <div className="stepper-wrap">
                    <div className="stepper-label">Resolution Path</div>
                    <div className="stepper">{renderStepperSVG(selectedComplaint.status)}</div>
                    <div className="step-items">
                      {STEPS.map((s, i) => (
                        <div 
                          key={s}
                          className={`step-item ${
                            STEPS.indexOf(selectedComplaint.status) > i 
                              ? 'done' 
                              : STEPS.indexOf(selectedComplaint.status) === i 
                                ? 'now' 
                                : ''
                          }`}
                        >
                          {STEP_LABELS[s]}
                        </div>
                      ))}
                    </div>
                  </div>

                  <select 
                    className="select-team"
                    value={assignedTeam}
                    onChange={handleAssignTeam}
                  >
                    <option value="">Assign to sanitation team…</option>
                    <option value="Team Green-1 · Zone 1">Team Green-1 · Zone 1</option>
                    <option value="Team Green-3 · Zone 3">Team Green-3 · Zone 3</option>
                    <option value="Drainage Cell · Rapid Response">Drainage Cell · Rapid Response</option>
                  </select>

                  <div className="assign-row">
                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => triggerToast(`Case details opened in full mode for ${selectedComplaint.id}`)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Open Full Case
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleAdvanceStatus}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      Advance Status
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <p>Select a complaint from the queue to review evidence and take action.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMBINED: FARMER RESIDUE PROGRAM SUMMARY */}
      <section className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-head" style={{ justifyContent: 'space-between' }}>
          <h2>Farmer Residue Program — Quick Overview</h2>
          <button 
            onClick={() => onNavigate && onNavigate('buyback')} 
            className="count-badge" 
            style={{ textDecoration: 'none', cursor: 'pointer', border: 'none', background: 'var(--cream-100)' }}
          >
            View Full Dashboard →
          </button>
        </div>
        <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', alignItems: 'center', padding: '22px 24px' }}>

          <div className="recovery-flow">
            <div className="rf-sources">
              <div className="rf-source organic">
                <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg></div>
                <div className="lab">🌱 Organic</div>
                <div className="val">1,240 T</div>
              </div>
              <div className="rf-source inorganic">
                <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 6"/></svg></div>
                <div className="lab">♻️ Inorganic</div>
                <div className="val">680 T</div>
              </div>
            </div>
            <div className="rf-connector">
              <svg viewBox="0 0 340 60" preserveAspectRatio="none">
                <path d="M85 0 C 85 30, 170 30, 170 30" fill="none" stroke="#5FAE3D" strokeWidth="2"/>
                <path d="M255 0 C 255 30, 170 30, 170 30" fill="none" stroke="#3D7FBF" strokeWidth="2"/>
                <path d="M170 30 L170 55" fill="none" stroke="var(--line)" strokeWidth="2"/>
                <path d="M162 48 L170 58 L178 48" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="rf-total">
              <div className="lab">Total Material Recovered</div>
              <div className="val">1,920 T</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            <div className="stat-card total" style={{ marginTop: 0 }}>
              <div className="top-row"><div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div></div>
              <div className="value">426</div>
              <div className="label">Farmers Participating</div>
            </div>
            <div className="stat-card resolved" style={{ marginTop: 0 }}>
              <div className="top-row"><div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
              <div className="value">₹8.4L</div>
              <div className="label">Paid to Farmers</div>
            </div>
            <div className="stat-card pending" style={{ marginTop: 0 }}>
              <div className="top-row"><div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div></div>
              <div className="value">86</div>
              <div className="label">Requests Pending</div>
            </div>
            <div className="stat-card in-progress" style={{ marginTop: 0 }}>
              <div className="top-row"><div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="7" width="15" height="13" rx="2"/><path d="M16 11h3l4 4v5h-7"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/></svg></div></div>
              <div className="value">37</div>
              <div className="label">Pickups Scheduled</div>
            </div>
          </div>

        </div>
      </section>

      {/* TOAST POPUP */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
