import React, { useState, useEffect } from 'react';
import './GovOverviewPage.css';
import { apiFetch } from '../../shared/lib/api';
import GovDetailMap from '../../shared/components/layout/GovDetailMap';
import { incidentsApi } from '../../services/incidentsApi';

const SEEDED_COMPLAINTS = [
  {
    id: "SS-24816",
    title: "Overflowing bin near Sarat Colony market",
    severity: "high",
    status: "submitted",
    locality: "Sarat Colony, Ward 14",
    distance: "0.4 km",
    time: "18 min ago",
    coords: "23.6739° N, 86.9524° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo: "linear-gradient(135deg,#6b7d63,#3a4a35)",
    desc: "Citizen reports a municipal bin overflowing onto the footpath for 3+ days, blocking pedestrian access and attracting stray animals.",
    aiNote: "Visual model detects large uncollected waste volume with pedestrian obstruction. Pattern matches recurring hotspot (4th report in 30 days).",
    confidence: 94,
    mapTop: "44%",
    mapLeft: "30%"
  },
  {
    id: "SS-24815",
    title: "Illegal dumping behind Girls' High School",
    severity: "high",
    status: "submitted",
    locality: "Ushagram, Ward 14",
    distance: "1.1 km",
    time: "42 min ago",
    coords: "23.6812° N, 86.9601° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo: "linear-gradient(135deg,#5c4a3a,#2e2419)",
    desc: "Construction debris and household waste dumped on vacant plot adjacent to school boundary wall. Proximity to children flagged as priority.",
    aiNote: "Mixed construction and organic waste detected. Proximity to educational institution (18m) raises priority tier automatically.",
    confidence: 89,
    mapTop: "58%",
    mapLeft: "52%"
  },
  {
    id: "SS-24802",
    title: "Blocked drain causing waterlogging",
    severity: "medium",
    status: "assigned",
    locality: "Court Road, Ward 14",
    distance: "0.8 km",
    time: "3 hr ago",
    coords: "23.6765° N, 86.9552° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Drainage Cell",
    photo: "linear-gradient(135deg,#3d5f7a,#1f3547)",
    desc: "Plastic and silt buildup blocking roadside drain, causing water to pool near shop entrances after light rain.",
    aiNote: "Standing water with visible plastic debris identified. Weather correlation suggests risk increases with forecasted rainfall this week.",
    confidence: 81,
    mapTop: "70%",
    mapLeft: "38%"
  },
  {
    id: "SS-24798",
    title: "Uncollected garbage — residential lane",
    severity: "medium",
    status: "progress",
    locality: "Rambandhu Talab, Ward 14",
    distance: "1.6 km",
    time: "Yesterday",
    coords: "23.6721° N, 86.9487° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo: "linear-gradient(135deg,#7a6a3d,#473c1f)",
    desc: "Household waste accumulating for over a week after missed collection rounds; residents report odor complaints.",
    aiNote: "Moderate waste volume, residential context. Missed-collection pattern flagged for scheduling review, not just one-off cleanup.",
    confidence: 76,
    mapTop: "22%",
    mapLeft: "44%"
  },
  {
    id: "SS-24790",
    title: "Litter along riverside walking path",
    severity: "low",
    status: "progress",
    locality: "Damodar Ghat, Ward 14",
    distance: "2.3 km",
    time: "Yesterday",
    coords: "23.6698° N, 86.9445° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Parks & Riverside",
    photo: "linear-gradient(135deg,#3d7a5f,#1f472e)",
    desc: "Scattered plastic wrappers and bottles along the public walking path, likely from weekend foot traffic.",
    aiNote: "Low-density scattered litter, no health hazard indicators. Suitable for routine sweep rather than dedicated dispatch.",
    confidence: 71,
    mapTop: "66%",
    mapLeft: "70%"
  },
  {
    id: "SS-24771",
    title: "Public toilet waste disposal issue",
    severity: "medium",
    status: "resolved",
    locality: "Bus Stand Area, Ward 14",
    distance: "0.6 km",
    time: "2 days ago",
    coords: "23.6754° N, 86.9538° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo: "linear-gradient(135deg,#7a3d4a,#471f27)",
    desc: "Overflow from public toilet waste bin near the bus stand, cleared and sanitized by Team Green-3.",
    aiNote: "Cleanup verified against before/after photo pair. Waste volume reduced to baseline; no further action required.",
    confidence: 97,
    mapTop: "32%",
    mapLeft: "62%"
  },
  {
    id: "SS-24759",
    title: "Roadside dumping near market entrance",
    severity: "low",
    status: "resolved",
    locality: "Hutton Road, Ward 14",
    distance: "1.2 km",
    time: "3 days ago",
    coords: "23.6788° N, 86.9569° E",
    jurisdiction: "Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo: "linear-gradient(135deg,#5f7a3d,#324719)",
    desc: "Vegetable market spillover waste cleared during scheduled morning collection route.",
    aiNote: "Confirmed resolved via routine collection log cross-reference. No citizen follow-up complaint received.",
    confidence: 92,
    mapTop: "38%",
    mapLeft: "78%"
  }
];

const STEPS = ["submitted", "assigned", "progress", "resolved"];
const STEP_LABELS = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };
const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };

export default function GovOverviewPage() {
  const [complaints, setComplaints] = useState(SEEDED_COMPLAINTS);
  const [selectedId, setSelectedId] = useState(SEEDED_COMPLAINTS[1].id);
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
              locality: inc.representative_location?.name || 'BMC Ward 24',
              distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km`,
              time: 'Recently',
              officer: inc.assigned_officer?.name || null,
              coords: inc.representative_location ? `${inc.representative_location.latitude}° N, ${inc.representative_location.longitude}° E` : "23.6739° N, 86.9524° E",
              jurisdiction: inc.representative_location ? `Ward 14 → Bhubaneshwar Municipal Corp. → Sanitation` : "Ward 14 → Bhubaneshwar Municipal Corp. → Sanitation Zone 3",
              photo: "linear-gradient(135deg,#6b7d63,#3a4a35)",
              desc: inc.description || 'No description provided.',
              aiNote: `AI priority score: ${inc.priority_score}. Category: ${inc.category || 'garbage_accumulation'}.`,
              confidence: 90,
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

  // Helper to parse coordinate string like "23.6739° N, 86.9524° E"
  const parseCoords = (coordStr) => {
    if (!coordStr) return { lat: 23.677, lng: 86.955 };
    try {
      const parts = coordStr.split(',');
      const latPart = parts[0].trim();
      const lngPart = parts[1].trim();
      const latVal = parseFloat(latPart);
      const lngVal = parseFloat(lngPart);
      const lat = latPart.toUpperCase().includes('S') ? -latVal : latVal;
      const lng = lngPart.toUpperCase().includes('W') ? -lngVal : lngVal;
      return { lat: lat || 23.677, lng: lng || 86.955 };
    } catch (e) {
      return { lat: 23.677, lng: 86.955 };
    }
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
          center: { lat: 23.677, lng: 86.955 },
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

  const selectedComplaint = complaints.find(c => c.id === selectedId) || complaints[0];

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
          jurisdiction: `${c.jurisdiction.split(' → ')[0]} → ${c.jurisdiction.split(' → ')[1]} → ${team.split(' · ')[0]}`
        };
      }
      return c;
    }));
    triggerToast(`Incident assigned to ${team}`);
  };

  // Advance Status workflow transition
  const handleAdvanceStatus = () => {
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
          <div className="value">248</div>
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
          <div className="value">36</div>
          <div className="label">Awaiting assignment</div>
        </div>

        <div className="stat-card progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />
              </svg>
            </div>
            <span className="trend up">+6%</span>
          </div>
          <div className="value">54</div>
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
          <div className="value">158</div>
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
          <div className="value">7</div>
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
              <span className="count-badge">Ward 23</span>
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
                  <span className="d-id">{selectedComplaint.id}</span>
                </div>

                <div className="d-body">
                  <div className="d-title">{selectedComplaint.title}</div>
                  <div className="d-desc">{selectedComplaint.desc}</div>

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
                      <div className="v mono">{selectedComplaint.coords}</div>
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

      {/* TOAST POPUP */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
