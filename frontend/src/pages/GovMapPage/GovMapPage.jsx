import React, { useState, useEffect } from 'react';
import './GovMapPage.css';
import GovDetailMap from '../../shared/components/layout/GovDetailMap';
import { incidentsApi } from '../../services/incidentsApi';

const INITIAL_PINS = [
  { id:"SS-24816", title:"Overflowing bin near Sarat Colony market", severity:"high",
    status:"submitted", locality:"Sarat Colony, Ward 14", distance:"0.4 km",
    time:"18 min ago", coords:"23.6739° N, 86.9524° E", top:44, left:30,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#6b7d63,#3a4a35)",
    desc:"Citizen reports a municipal bin overflowing onto the footpath for 3+ days, blocking pedestrian access and attracting stray animals.",
    aiNote:"Visual model detects large uncollected waste volume with pedestrian obstruction. Pattern matches recurring hotspot (4th report in 30 days).",
    confidence:94, assignedTeam: "" },
  { id:"SS-24815", title:"Illegal dumping behind Girls' High School", severity:"high",
    status:"submitted", locality:"Ushagram, Ward 14", distance:"1.1 km",
    time:"42 min ago", coords:"23.6812° N, 86.9601° E", top:58, left:52,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5c4a3a,#2e2419)",
    desc:"Construction debris and household waste dumped on vacant plot adjacent to school boundary wall. Proximity to children flagged as priority.",
    aiNote:"Mixed construction and organic waste detected. Proximity to educational institution (18m) raises priority tier automatically.",
    confidence:89, assignedTeam: "" },
  { id:"SS-24811", title:"Garbage pile near auto stand", severity:"high",
    status:"submitted", locality:"G.T. Road Crossing, Ward 14", distance:"0.9 km",
    time:"1 hr ago", coords:"23.6771° N, 86.9578° E", top:24, left:64,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo:"linear-gradient(135deg,#7a4a3d,#471f1f)",
    desc:"Loose garbage accumulating around the auto-rickshaw stand, spilling onto the main carriageway during peak hours.",
    aiNote:"High foot-traffic zone with recurring dumping pattern. Recommend priority dispatch before evening rush.",
    confidence:88, assignedTeam: "" },
  { id:"SS-24802", title:"Blocked drain causing waterlogging", severity:"medium",
    status:"assigned", locality:"Court Road, Ward 14", distance:"0.8 km",
    time:"3 hr ago", coords:"23.6765° N, 86.9552° E", top:32, left:44,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Drainage Cell",
    photo:"linear-gradient(135deg,#3d5f7a,#1f3547)",
    desc:"Plastic and silt buildup blocking roadside drain, causing water to pool near shop entrances after light rain.",
    aiNote:"Standing water with visible plastic debris identified. Weather correlation suggests risk increases with forecasted rainfall this week.",
    confidence:81, assignedTeam: "Drainage Cell · Rapid Response" },
  { id:"SS-24798", title:"Uncollected garbage — residential lane", severity:"medium",
    status:"progress", locality:"Rambandhu Talab, Ward 14", distance:"1.6 km",
    time:"Yesterday", coords:"23.6721° N, 86.9487° E", top:70, left:38,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#7a6a3d,#473c1f)",
    desc:"Household waste accumulating for over a week after missed collection rounds; residents report odor complaints.",
    aiNote:"Moderate waste volume, residential context. Missed-collection pattern flagged for scheduling review, not just one-off cleanup.",
    confidence:76, assignedTeam: "Team Alpha · Sector 4" },
  { id:"SS-24795", title:"Overflowing community bin, Zone 2", severity:"medium",
    status:"assigned", locality:"Ushagram Crossing, Ward 14", distance:"1.4 km",
    time:"5 hr ago", coords:"23.6829° N, 86.9612° E", top:18, left:46,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 2",
    photo:"linear-gradient(135deg,#5f6b7a,#2e3547)",
    desc:"Shared community bin overflowing near residential crossing; waste scattered by stray dogs overnight.",
    aiNote:"Bin capacity exceeded for the third time this month — recommend reviewing collection frequency for this stop.",
    confidence:79, assignedTeam: "Team Bravo · Sector 7" },
  { id:"SS-24790", title:"Litter along riverside walking path", severity:"low",
    status:"progress", locality:"Damodar Ghat, Ward 14", distance:"2.3 km",
    time:"Yesterday", coords:"23.6698° N, 86.9445° E", top:38, left:78,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Parks & Riverside",
    photo:"linear-gradient(135deg,#3d7a5f,#1f472e)",
    desc:"Scattered plastic wrappers and bottles along the public walking path, likely from weekend foot traffic.",
    aiNote:"Low-density scattered litter, no health hazard indicators. Suitable for routine sweep rather than dedicated dispatch.",
    confidence:71, assignedTeam: "Team Alpha · Sector 4" },
  { id:"SS-24784", title:"Minor litter near bus shelter", severity:"low",
    status:"submitted", locality:"Bus Stand Area, Ward 14", distance:"0.6 km",
    time:"7 hr ago", coords:"23.6754° N, 86.9538° E", top:66, left:70,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#5f7a5a,#2e4728)",
    desc:"Light scattering of wrappers and cups around the bus shelter bench area.",
    aiNote:"Low priority; can be bundled with the next routine sweep for this zone.",
    confidence:64, assignedTeam: "" },
  { id:"SS-24771", title:"Public toilet waste disposal issue", severity:"medium",
    status:"resolved", locality:"Bus Stand Area, Ward 14", distance:"0.6 km",
    time:"2 days ago", coords:"23.6754° N, 86.9538° E", top:80, left:56,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 3",
    photo:"linear-gradient(135deg,#7a3d4a,#471f27)",
    desc:"Overflow from public toilet waste bin near the bus stand, cleared and sanitized by Team Green-3.",
    aiNote:"Cleanup verified against before/after photo pair. Waste volume reduced to baseline; no further action required.",
    confidence:97, assignedTeam: "Team Green-3" },
  { id:"SS-24759", title:"Roadside dumping near market entrance", severity:"low",
    status:"resolved", locality:"Hutton Road, Ward 14", distance:"1.2 km",
    time:"3 days ago", coords:"23.6788° N, 86.9569° E", top:12, left:22,
    jurisdiction:"Ward 14 → Bhubaneshwar Municipal Corporation → Sanitation Zone 1",
    photo:"linear-gradient(135deg,#5f7a3d,#324719)",
    desc:"Vegetable market spillover waste cleared during scheduled morning collection route.",
    aiNote:"Confirmed resolved via routine collection log cross-reference. No citizen follow-up complaint received.",
    confidence:92, assignedTeam: "Team Alpha · Sector 4" },
];

const STEPS = ["submitted", "assigned", "progress", "resolved"];
const STEP_LABELS = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };
const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };

export default function GovMapPage() {
  const [pins, setPins] = useState(INITIAL_PINS);
  const [selectedId, setSelectedId] = useState(INITIAL_PINS[1].id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPins() {
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
              top: Math.floor(20 + Math.random() * 60),
              left: Math.floor(20 + Math.random() * 60),
              assignedTeam: inc.assigned_officer?.name || ""
            };
          });
          setPins(prev => {
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
        console.error("Error loading incidents map pins:", err);
      }
    }
    fetchPins();
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

  // Filtering Logic
  const filteredPins = pins.filter(p => {
    // Search Query filter
    const matchesSearch = p.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Severity/Assigned filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unassigned') return p.status === 'submitted';
    return p.severity === activeFilter;
  });

  React.useEffect(() => {
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

      // Update/Clear Markers based on filteredPins
      // 1. Clear markers that are no longer present
      Object.keys(markersRef.current).forEach(id => {
        if (!filteredPins.some(p => p.id === id)) {
          markersRef.current[id].setMap(null);
          delete markersRef.current[id];
        }
      });

      // 2. Add or update markers for filteredPins
      filteredPins.forEach(p => {
        const position = parseCoords(p.coords);
        
        // Marker icon based on severity
        let pinColor = 'red'; // high
        if (p.severity === 'medium') pinColor = 'yellow';
        else if (p.severity === 'low') pinColor = 'green';

        const markerIcon = `https://maps.google.com/mapfiles/ms/icons/${pinColor}-dot.png`;

        if (!markersRef.current[p.id]) {
          const marker = new window.google.maps.Marker({
            position: position,
            map: googleMapRef.current,
            title: p.title,
            icon: markerIcon,
          });

          marker.addListener('click', () => {
            setSelectedId(p.id);
          });

          markersRef.current[p.id] = marker;
        } else {
          // Update position and icon in case they changed
          markersRef.current[p.id].setPosition(position);
          markersRef.current[p.id].setIcon(markerIcon);
        }
      });

      // 3. Focus/Center on the selected marker
      if (selectedId && markersRef.current[selectedId]) {
        const selectedMarker = markersRef.current[selectedId];
        googleMapRef.current.panTo(selectedMarker.getPosition());
        // Optional bounce animation
        Object.values(markersRef.current).forEach(m => m.setAnimation(null));
        selectedMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => selectedMarker.setAnimation(null), 1400);
      }
    });
  }, [filteredPins, selectedId]);

  const selectedPin = pins.find(p => p.id === selectedId);

  // Stats Calculations
  const pinsOnMap = filteredPins.length;
  const highSeverityCount = pins.filter(p => p.severity === 'high').length;
  const unassignedCount = pins.filter(p => p.status === 'submitted').length;
  const progressCount = pins.filter(p => p.status === 'progress' || p.status === 'assigned').length;

  const handleAssignTeam = (teamName) => {
    if (!teamName || teamName === "Assign to sanitation team…") return;
    setPins(prev => prev.map(p => {
      if (p.id === selectedId) {
        return {
          ...p,
          assignedTeam: teamName,
          status: p.status === 'submitted' ? 'assigned' : p.status
        };
      }
      return p;
    }));
  };

  const handleAdvanceStatus = () => {
    setPins(prev => prev.map(p => {
      if (p.id === selectedId) {
        const currentIdx = STEPS.indexOf(p.status);
        if (currentIdx < STEPS.length - 1) {
          const nextStatus = STEPS[currentIdx + 1];
          return {
            ...p,
            status: nextStatus
          };
        }
      }
      return p;
    }));
  };

  const renderStepperPath = (status) => {
    const idx = STEPS.indexOf(status);
    const positions = [30, 176, 322, 468];
    const y = 26;
    let path = `M${positions[0]} ${y}`;
    path += ` C ${positions[0]+60} ${y-16}, ${positions[1]-60} ${y+16}, ${positions[1]} ${y}`;
    path += ` C ${positions[1]+60} ${y-16}, ${positions[2]-60} ${y+16}, ${positions[2]} ${y}`;
    path += ` C ${positions[2]+60} ${y-16}, ${positions[3]-60} ${y+16}, ${positions[3]} ${y}`;

    const doneColor = "#5FAE3D";
    const pendingColor = "#D9E2D3";

    return (
      <svg viewBox="0 0 500 52" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={pendingColor} strokeWidth="3" />
        {idx > 0 && (
          <path d={(() => {
            let p = `M${positions[0]} ${y}`;
            for (let i = 1; i <= idx; i++) {
              p += ` C ${positions[i-1]+60} ${y-16}, ${positions[i]-60} ${y+16}, ${positions[i]} ${y}`;
            }
            return p;
          })()} fill="none" stroke={doneColor} strokeWidth="3" />
        )}
        {positions.map((x, i) => {
          const state = i < idx ? 'done' : i === idx ? 'now' : 'pending';
          const fill = state === 'pending' ? pendingColor : doneColor;
          const r = state === 'now' ? 8 : 6;
          return (
            <React.Fragment key={i}>
              {state === 'now' && (
                <circle cx={x} cy={y} r="12" fill="none" stroke={doneColor} strokeWidth="1.5" opacity="0.4" />
              )}
              <circle cx={x} cy={y} r={r} fill={fill} />
              {state !== 'pending' && (
                <path d={`M${x-3} ${y} l2 2.5 l4.5 -5`} stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </React.Fragment>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="gov-map-page">
      {/* Search overlay inside content header */}
      <div style={{ display: 'none' }}>
        {/* We expose search input triggers here or via props, but since Goutam's search box is in GovNavbar, we can implement an internal search input inside the filters bar if necessary, or hook it to a state! */}
      </div>

      <section className="stats">
        <div className="stat-card total">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
          <div className="value">{pinsOnMap}</div>
          <div className="label">Pins on Map</div>
        </div>
        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 2 21h20L12 2z"/>
                <path d="M12 9v5M12 17h.01"/>
              </svg>
            </div>
          </div>
          <div className="value">{highSeverityCount}</div>
          <div className="label">High Severity</div>
        </div>
        <div className="stat-card pending">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
          </div>
          <div className="value">{unassignedCount}</div>
          <div className="label">Unassigned</div>
        </div>
        <div className="stat-card progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="7" width="15" height="13" rx="2"/>
                <path d="M16 11h3l4 4v5h-7"/>
                <circle cx="6" cy="20" r="2"/>
                <circle cx="18" cy="20" r="2"/>
              </svg>
            </div>
          </div>
          <div className="value">{progressCount}</div>
          <div className="label">Teams Active</div>
        </div>
      </section>

      <section className="live-map-workspace">
        {/* Left tall map panel */}
        <div className="panel map-panel map-panel-tall">
          <div className="panel-head" style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', zIndex: 2 }}>
            <h2>Ward 14 — Live Complaint Map</h2>
            <span className="count-badge">{pinsOnMap} active</span>
          </div>

          <div className="filters" style={{ position: 'absolute', top: '53px', left: 0, right: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</div>
              <div className={`chip ${activeFilter === 'high' ? 'active' : ''}`} onClick={() => setActiveFilter('high')}>
                <span className="sev-dot" style={{ background: 'var(--red-500)' }}></span>High
              </div>
              <div className={`chip ${activeFilter === 'medium' ? 'active' : ''}`} onClick={() => setActiveFilter('medium')}>
                <span className="sev-dot" style={{ background: 'var(--amber-500)' }}></span>Medium
              </div>
              <div className={`chip ${activeFilter === 'low' ? 'active' : ''}`} onClick={() => setActiveFilter('low')}>
                <span className="sev-dot" style={{ background: 'var(--green-600)' }}></span>Low
              </div>
              <div className={`chip ${activeFilter === 'unassigned' ? 'active' : ''}`} onClick={() => setActiveFilter('unassigned')}>Unassigned</div>
            </div>

            <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e1e6dc', borderRadius: '20px', padding: '4px 10px', gap: '6px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px', color: 'var(--ink-400)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search pins..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '11px', width: '90px', background: 'none' }}
              />
            </div>
          </div>

          <div ref={mapRef} className="map-canvas" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}></div>

          <div className="map-legend">
            <div className="li"><span className="sw" style={{ background: 'var(--red-500)' }}></span>High</div>
            <div className="li"><span class="sw" style={{ background: 'var(--amber-500)' }}></span>Medium</div>
            <div className="li"><span class="sw" style={{ background: 'var(--green-600)' }}></span>Low</div>
          </div>
        </div>

        {/* Right column queue + details */}
        <div className="right-col">
          <div className="panel">
            <div className="panel-head">
              <h2>Nearby Complaints</h2>
              <span className="count-badge">{filteredPins.length}</span>
            </div>
            <div className="queue">
              {filteredPins.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '12px' }}>
                  No complaints match current filters.
                </div>
              ) : (
                filteredPins.map(p => (
                  <div 
                    key={p.id}
                    className={`complaint ${p.id === selectedId ? 'selected' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="thumb" style={{ background: p.photo }}></div>
                    <div className="c-main">
                      <div className="c-top">
                        <span className="c-id">{p.id}</span>
                        <span className={`sev-badge ${p.severity}`}>
                          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                          {SEV_LABEL[p.severity]}
                        </span>
                      </div>
                      <div className="c-title">{p.title}</div>
                      <div className="c-meta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {p.locality}
                      </div>
                    </div>
                    <div className="c-right">
                      <span className={`status-pill ${p.status}`}>{STEP_LABELS[p.status]}</span>
                      <span className="c-time">{p.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel detail-panel">
            {selectedPin ? (
              <>
                <div className="d-photo" style={{ position: 'relative' }}>
                  <GovDetailMap coords={selectedPin.coords} />
                  <span className={`sev-badge ${selectedPin.severity}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                    {SEV_LABEL[selectedPin.severity]} Severity
                  </span>
                  <span className="d-id">{selectedPin.id}</span>
                </div>
                <div className="d-body">
                  <div className="d-title">{selectedPin.title}</div>
                  <div className="d-desc">{selectedPin.desc}</div>

                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <div>
                      <div className="l">Jurisdiction</div>
                      <div className="v">{selectedPin.jurisdiction}</div>
                    </div>
                  </div>
                  <div className="d-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div className="l">Coordinates</div>
                      <div className="v mono">{selectedPin.coords}</div>
                    </div>
                  </div>

                  <div className="ai-box">
                    <div className="ai-top">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2 2 7l10 5 10-5-10-5z"/><circle cx="12" cy="14" r="1"/>
                      </svg>
                      <span>AI Assessment</span>
                    </div>
                    <div className="ai-line">{selectedPin.aiNote}</div>
                    <div className="confidence-bar"><i style={{ width: `${selectedPin.confidence}%` }}></i></div>
                    <div style={{ fontSize: '10.5px', color: '#B9CDBA', marginTop: '5px', fontFamily: '"IBM Plex Mono", monospace' }}>
                      Confidence {selectedPin.confidence}%
                    </div>
                  </div>

                  <div className="stepper-wrap">
                    <div className="stepper-label">Resolution Path</div>
                    <div className="stepper">{renderStepperPath(selectedPin.status)}</div>
                    <div className="step-items">
                      {STEPS.map((s, i) => (
                        <div 
                          key={s} 
                          className={`step-item ${STEPS.indexOf(selectedPin.status) > i ? 'done' : STEPS.indexOf(selectedPin.status) === i ? 'now' : ''}`}
                        >
                          {STEP_LABELS[s]}
                        </div>
                      ))}
                    </div>
                  </div>

                  <select 
                    className="select-team"
                    value={selectedPin.assignedTeam || "Assign to sanitation team…"}
                    onChange={(e) => handleAssignTeam(e.target.value)}
                  >
                    <option>Assign to sanitation team…</option>
                    <option>Team Alpha · Sector 4</option>
                    <option>Team Bravo · Sector 7</option>
                    <option>Drainage Cell · Rapid Response</option>
                  </select>

                  <div className="assign-row">
                    <button className="btn btn-ghost" onClick={() => alert(`Opening full case for ticket ${selectedPin.id}`)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                      Open Full Case
                    </button>
                    <button className="btn btn-primary" onClick={handleAdvanceStatus} disabled={selectedPin.status === 'resolved'}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Advance Status
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="detail-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p>Select a pin on the map or a complaint from the list to review details.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
