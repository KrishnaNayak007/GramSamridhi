import React, { useState, useEffect } from 'react';
import './GovAnalyticsPage.css';
import { incidentsApi } from '../../../services/incidentsApi';
import { agricultureApi } from '../../../services/agricultureApi';

const SEVERITY = [
  { label: 'High', hours: 6.2, max: 24, color: '#D1493F' },
  { label: 'Medium', hours: 13.8, max: 24, color: '#E2A73B' },
  { label: 'Low', hours: 21.5, max: 24, color: '#1F7A4D' },
];

const RANGE_LABELS = { 7: 'Last 7 days', 30: 'Last 30 days', 90: 'Last 90 days', 365: 'Last 1 year' };

const RESIDUE_STREAM = {
  "Rice Straw": "organic",
  "Wheat Straw": "organic",
  "Sugarcane Trash": "organic",
  "Agri Plastic Sheet": "inorganic",
  "Irrigation Pipe": "inorganic"
};

export default function GovAnalyticsPage() {
  const [complaints, setComplaints] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [selectedRange, setSelectedRange] = useState(7);

  useEffect(() => {
    async function loadData() {
      try {
        const compData = await incidentsApi.getAll();
        const compList = Array.isArray(compData) ? compData : (compData?.results || []);
        const mapped = compList.map(inc => {
          const priority = parseFloat(inc.priority_score) || 0;
          const severity = priority > 7.0 ? 'high' : priority > 4.0 ? 'medium' : 'low';
          const status = inc.status === 'open' ? 'submitted' : inc.status === 'assigned' ? 'assigned' : inc.status === 'in_progress' ? 'progress' : 'resolved';
          const created = new Date(inc.created_at || Date.now());
          const elapsed = Math.max(0.1, ((Date.now() - created.getTime()) / 3600000));
          return {
            id: inc.id,
            status: status,
            severity: severity,
            created_at: inc.created_at,
            resolutionHours: 12.5,
            locality: inc.representative_location?.name || 'BMC Ward 24',
            assignedTeam: inc.assigned_officer?.name || null,
            rating: inc.rating || 5,
            reopened: false,
            escalated: elapsed > (severity === 'high' ? 8 : severity === 'medium' ? 24 : 72)
          };
        });
        setComplaints(mapped);

        const pickData = await agricultureApi.getPickups();
        const pickList = Array.isArray(pickData) ? pickData : (pickData?.results || []);
        setPickups(pickList);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      }
    }
    loadData();
  }, []);

  // Compute dynamic stats strip metrics
  const resolvedThisMonth = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed');
  const avgResolutionTime = resolvedComplaints.length > 0
    ? (resolvedComplaints.reduce((sum, c) => sum + (c.resolutionHours || 12.5), 0) / resolvedComplaints.length).toFixed(1) + 'h'
    : '0.0h';

  const slaCompliantCount = complaints.filter(c => !c.escalated).length;
  const slaCompliance = complaints.length > 0
    ? Math.round((slaCompliantCount / complaints.length) * 100) + '%'
    : '100%';

  const ratedComplaints = complaints.filter(c => c.rating > 0);
  const citizenSatisfaction = ratedComplaints.length > 0
    ? (ratedComplaints.reduce((sum, c) => sum + c.rating, 0) / ratedComplaints.length).toFixed(1) + '/5'
    : '5.0/5';

  const repeatCount = complaints.filter(c => c.reopened).length;
  const repeatComplaints = complaints.length > 0
    ? Math.round((repeatCount / complaints.length) * 100) + '%'
    : '0%';

  // Dynamic Leaderboard
  const teamResolutions = {};
  complaints.forEach(c => {
    if (c.status === 'resolved' || c.status === 'closed') {
      const team = c.assignedTeam || 'Sanitation Team Alpha';
      if (!teamResolutions[team]) {
        teamResolutions[team] = { name: team, meta: c.locality || 'Zone 1', resolved: 0, totalHours: 0 };
      }
      teamResolutions[team].resolved++;
      teamResolutions[team].totalHours += (c.resolutionHours || 12.5);
    }
  });

  const LEADERBOARD = Object.values(teamResolutions)
    .map(t => ({
      name: t.name,
      meta: t.meta,
      resolved: t.resolved,
      avg: (t.totalHours / t.resolved).toFixed(1) + 'h'
    }))
    .sort((a, b) => b.resolved - a.resolved)
    .slice(0, 5);

  // Dynamic ranges reported/resolved line chart helper
  const getRangeData = (range) => {
    if (range === 7) {
      const labels = [];
      const reported = [0, 0, 0, 0, 0, 0, 0];
      const resolved = [0, 0, 0, 0, 0, 0, 0];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleString('en-US', { weekday: 'short' }));
      }
      complaints.forEach(c => {
        const d = new Date(c.created_at || Date.now());
        const diffDays = Math.floor((Date.now() - d.getTime()) / (3600000 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          reported[6 - diffDays]++;
          if (c.status === 'resolved' || c.status === 'closed') {
            resolved[6 - diffDays]++;
          }
        }
      });
      return { labels, reported, resolved };
    }
    if (range === 30) {
      const labels = ['W1', 'W2', 'W3', 'W4'];
      const reported = [0, 0, 0, 0];
      const resolved = [0, 0, 0, 0];
      complaints.forEach(c => {
        const d = new Date(c.created_at || Date.now());
        const diffDays = Math.floor((Date.now() - d.getTime()) / (3600000 * 24));
        if (diffDays >= 0 && diffDays < 30) {
          const wIdx = Math.floor(diffDays / 7.5);
          if (wIdx >= 0 && wIdx < 4) {
            reported[3 - wIdx]++;
            if (c.status === 'resolved' || c.status === 'closed') {
              resolved[3 - wIdx]++;
            }
          }
        }
      });
      return { labels, reported, resolved };
    }
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const reported = Array(12).fill(0);
    const resolved = Array(12).fill(0);
    complaints.forEach(c => {
      const d = new Date(c.created_at || Date.now());
      const mIdx = d.getMonth();
      reported[mIdx]++;
      if (c.status === 'resolved' || c.status === 'closed') {
        resolved[mIdx]++;
      }
    });
    if (range === 90) {
      const currentMonth = new Date().getMonth();
      const mLabels = [];
      const mReported = [];
      const mResolved = [];
      for (let i = 2; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        mLabels.push(labels[mIdx]);
        mReported.push(reported[mIdx]);
        mResolved.push(resolved[mIdx]);
      }
      return { labels: mLabels, reported: mReported, resolved: mResolved };
    }
    const qLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const qReported = [0, 0, 0, 0];
    const qResolved = [0, 0, 0, 0];
    for (let i = 0; i < 12; i++) {
      const qIdx = Math.floor(i / 3);
      qReported[qIdx] += reported[i];
      qResolved[qIdx] += resolved[i];
    }
    return { labels: qLabels, reported: qReported, resolved: qResolved };
  };

  const activeRange = getRangeData(selectedRange);

  // Custom Line Chart SVG Plotter
  const renderLineChart = () => {
    const labels = activeRange.labels;
    const reported = activeRange.reported;
    const resolved = activeRange.resolved;

    const width = 800;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 20;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // Find max value in both sets to scale Y axis
    const maxVal = Math.max(...reported, ...resolved);
    const scaleMax = Math.ceil(maxVal * 1.15) || 20; // 15% padding at top

    // Coordinate mapping functions
    const getX = (index) => paddingLeft + index * (chartW / (labels.length - 1));
    const getY = (val) => paddingTop + chartH - (val / scaleMax) * chartH;

    // Build SVG Path strings
    const reportedPoints = reported.map((val, i) => `${getX(i)},${getY(val)}`);
    const resolvedPoints = resolved.map((val, i) => `${getX(i)},${getY(val)}`);

    const reportedPath = `M ${reportedPoints.join(' L ')}`;
    const resolvedPath = `M ${resolvedPoints.join(' L ')}`;

    const reportedArea = `${reportedPath} L ${getX(labels.length - 1)},${paddingTop + chartH} L ${getX(0)},${paddingTop + chartH} Z`;
    const resolvedArea = `${resolvedPath} L ${getX(labels.length - 1)},${paddingTop + chartH} L ${getX(0)},${paddingTop + chartH} Z`;

    // Horizontal Y Grid lines
    const yGridTicks = [0, Math.round(scaleMax * 0.25), Math.round(scaleMax * 0.5), Math.round(scaleMax * 0.75), scaleMax];

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          {yGridTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#E1E6DC" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="10" 
                  fontFamily="'IBM Plex Mono', monospace" 
                  fill="#7C8B81"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* X Axis labels */}
          {labels.map((lbl, i) => {
            const x = getX(i);
            return (
              <text 
                key={i} 
                x={x} 
                y={height - 2} 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="600" 
                fill="#7C8B81"
              >
                {lbl}
              </text>
            );
          })}

          {/* Filled Area Paths */}
          <path d={reportedArea} fill="rgba(61,127,191,0.06)" />
          <path d={resolvedArea} fill="rgba(31,122,77,0.05)" />

          {/* Line Paths */}
          <path d={reportedPath} fill="none" stroke="#3D7FBF" strokeWidth="2.5" strokeLinecap="round" />
          <path d={resolvedPath} fill="none" stroke="#1F7A4D" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive dots */}
          {reported.map((val, i) => (
            <circle key={i} cx={getX(i)} cy={getY(val)} r="3.5" fill="#3D7FBF" stroke="#fff" strokeWidth="1.5" />
          ))}
          {resolved.map((val, i) => (
            <circle key={i} cx={getX(i)} cy={getY(val)} r="3.5" fill="#1F7A4D" stroke="#fff" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    );
  };

  const renderResidueImpactChart = () => {
    const labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const organic = [0, 0, 0, 0, 0, 0];
    const inorganic = [0, 0, 0, 0, 0, 0];
    const avoided = [0, 0, 0, 0, 0, 0];

    (Array.isArray(pickups) ? pickups : []).forEach(p => {
      const d = new Date(p.created_at || Date.now());
      const m = d.toLocaleString('en-US', { month: 'short' });
      const idx = labels.indexOf(m);
      if (idx !== -1) {
        const rType = typeof p.residue_type === 'string' ? p.residue_type.toLowerCase() : '';
        const isOrganic = rType.includes('straw') || rType.includes('trash') || !rType;
        const qtyT = (parseFloat(p.weight_kg) || 0) / 1000;
        if (isOrganic) {
          organic[idx] += qtyT;
        } else {
          inorganic[idx] += qtyT;
        }
        avoided[idx] += qtyT * 0.0007;
      }
    });

    const width = 800;
    const height = 200;
    const paddingLeft = 50;
    const paddingRight = 50;
    const paddingTop = 20;
    const paddingBottom = 25;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const getX = (index) => paddingLeft + index * (chartW / Math.max(1, labels.length - 1));
    
    const maxVal = Math.max(...organic, ...inorganic, 10);
    const scaleMax = Math.ceil(maxVal * 1.15) || 10;
    const getLeftY = (val) => paddingTop + chartH - (val / scaleMax) * chartH;

    const maxAvoided = Math.max(...avoided, 1);
    const scaleAvoidedMax = Math.ceil(maxAvoided * 1.15) || 1;
    const getRightY = (val) => paddingTop + chartH - (val / scaleAvoidedMax) * chartH;

    const linePoints = avoided.map((val, i) => `${getX(i)},${getRightY(val)}`);
    const linePath = `M ${linePoints.join(' L ')}`;

    const leftTicks = [0, Math.round(scaleMax * 0.25), Math.round(scaleMax * 0.5), Math.round(scaleMax * 0.75), scaleMax];
    const rightTicks = [0, Math.round(scaleAvoidedMax * 0.25), Math.round(scaleAvoidedMax * 0.5), Math.round(scaleAvoidedMax * 0.75), scaleAvoidedMax];

    return (
      <div className="svg-chart-container" style={{ height: '220px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {leftTicks.map((tickVal, i) => {
            const y = getLeftY(tickVal);
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#E1E6DC" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="10" 
                  fontFamily="'IBM Plex Mono', monospace" 
                  fill="#7C8B81"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {rightTicks.map((tickVal, i) => {
            const y = getRightY(tickVal);
            return (
              <text 
                key={i}
                x={width - paddingRight + 10} 
                y={y + 4} 
                textAnchor="start" 
                fontSize="10" 
                fontFamily="'IBM Plex Mono', monospace" 
                fill="#7C8B81"
              >
                {tickVal}
              </text>
            );
          })}

          {labels.map((lbl, i) => {
            const x = getX(i);
            return (
              <text 
                key={i} 
                x={x} 
                y={height - 2} 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="600" 
                fill="#7C8B81"
              >
                {lbl}
              </text>
            );
          })}

          {labels.map((_, i) => {
            const x = getX(i);
            const orgH = (organic[i] / scaleMax) * chartH;
            const inorgH = (inorganic[i] / scaleMax) * chartH;
            const orgY = paddingTop + chartH - orgH;
            const inorgY = orgY - inorgH;

            return (
              <g key={i}>
                <rect 
                  x={x - 15} 
                  y={orgY} 
                  width="30" 
                  height={orgH} 
                  fill="#5FAE3D" 
                  rx="3"
                />
                <rect 
                  x={x - 15} 
                  y={inorgY} 
                  width="30" 
                  height={inorgH} 
                  fill="#3D7FBF" 
                  rx="3"
                />
              </g>
            );
          })}

          <path d={linePath} fill="none" stroke="#E2622A" strokeWidth="3" strokeLinecap="round" />

          {avoided.map((val, i) => (
            <circle 
              key={i} 
              cx={getX(i)} 
              cy={getRightY(val)} 
              r="4.5" 
              fill="#E2622A" 
              stroke="#fff" 
              strokeWidth="1.5" 
            />
          ))}
        </svg>
      </div>
    );
  };

  // Custom Doughnut Arc coordinates for SLA Compliance
  // Radius: 60, Center: (100, 100), Circumference = 376.99
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const slaPct = 91;
  const delayedPct = 6;
  const breachedPct = 3;

  const slaStroke = (slaPct / 100) * circ;
  const delayedStroke = (delayedPct / 100) * circ;
  const breachedStroke = (breachedPct / 100) * circ;

  return (
    <div className="gov-analytics-page">
      <section className="stats">
        <div className="stat-card total">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span className="trend up">+12%</span>
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
            <span className="trend up">-8%</span>
          </div>
          <div className="value">{avgResolutionTime}</div>
          <div className="label">Avg. Resolution Time</div>
        </div>
        <div className="stat-card resolved">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <span className="trend up">+3%</span>
          </div>
          <div className="value">{slaCompliance}</div>
          <div className="label">SLA Compliance</div>
        </div>
        <div className="stat-card pending">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <span className="trend up">+0.2</span>
          </div>
          <div className="value">{citizenSatisfaction}</div>
          <div className="label">Citizen Satisfaction</div>
        </div>
        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </div>
            <span className="trend down">-2%</span>
          </div>
          <div className="value">{repeatComplaints}</div>
          <div className="label">Repeat Complaints</div>
        </div>
      </section>

      <div className="filters">
        <div className={`chip ${selectedRange === 7 ? 'active' : ''}`} onClick={() => setSelectedRange(7)}>7 Days</div>
        <div className={`chip ${selectedRange === 30 ? 'active' : ''}`} onClick={() => setSelectedRange(30)}>30 Days</div>
        <div className={`chip ${selectedRange === 90 ? 'active' : ''}`} onClick={() => setSelectedRange(90)}>90 Days</div>
        <div className={`chip ${selectedRange === 365 ? 'active' : ''}`} onClick={() => setSelectedRange(365)}>1 Year</div>
      </div>

      <section className="analytics-grid">
        {/* Organic Recovery Growth & Burning Avoided */}
        <div className="panel span-2" style={{ borderColor: 'var(--leaf-300, #9ecb7f)' }}>
          <div className="panel-head">
            <h2>🌾 Organic Recovery Growth &amp; Burning Avoided</h2>
            <span className="count-badge">Last 6 months</span>
          </div>
          <div className="panel-body">
            {renderResidueImpactChart()}
          </div>
          <div className="chart-legend">
            <div className="li"><span className="sw" style={{ background: '#5FAE3D' }}></span>Organic Recovered (T)</div>
            <div className="li"><span className="sw" style={{ background: '#3D7FBF' }}></span>Inorganic Recovered (T)</div>
            <div className="li">
              <span 
                className="sw" 
                style={{ 
                  background: '#E2622A', 
                  borderRadius: 0, 
                  width: '12px', 
                  height: '3px' 
                }}
              ></span>
              Burning Incidents Avoided (cumulative)
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="panel span-2">
          <div className="panel-head">
            <h2>Complaints — Reported vs Resolved</h2>
            <span className="count-badge">{RANGE_LABELS[selectedRange]}</span>
          </div>
          <div className="panel-body">
            {renderLineChart()}
          </div>
          <div className="chart-legend">
            <div className="li"><span className="sw" style={{ background: '#3D7FBF' }}></span>Reported</div>
            <div className="li"><span className="sw" style={{ background: '#1F7A4D' }}></span>Resolved</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="panel">
          <div className="panel-head">
            <h2>Complaints by Category</h2>
            <span className="count-badge">Last 30 days</span>
          </div>
          <div className="panel-body">
            <div className="bar-chart-container">
              {[
                { label: 'Garbage', val: 128 },
                { label: 'Drainage', val: 84 },
                { label: 'Streetlight', val: 61 },
                { label: 'Water', val: 47 },
                { label: 'Road', val: 39 },
                { label: 'Other', val: 22 }
              ].map((c, i) => {
                const maxBarVal = 140;
                const barH = (c.val / maxBarVal) * 100;
                return (
                  <div className="bar-col" key={i}>
                    <div className="bar-fill" style={{ height: `${barH}%` }}>
                      <span className="bar-val">{c.val}</span>
                    </div>
                    <span className="bar-label">{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="panel">
          <div className="panel-head">
            <h2>SLA Compliance</h2>
            <span className="count-badge">This month</span>
          </div>
          <div className="panel-body">
            <div className="doughnut-container">
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                {/* Breached Segment (Red) */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  fill="none" 
                  stroke="#D1493F" 
                  strokeWidth="15" 
                  strokeDasharray={`${breachedStroke} ${circ}`} 
                  strokeDashoffset={-(slaStroke + delayedStroke)}
                />
                {/* Delayed Segment (Orange) */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  fill="none" 
                  stroke="#E2A73B" 
                  strokeWidth="15" 
                  strokeDasharray={`${delayedStroke} ${circ}`} 
                  strokeDashoffset={-slaStroke}
                />
                {/* Within SLA Segment (Green) */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  fill="none" 
                  stroke="#1F7A4D" 
                  strokeWidth="15" 
                  strokeDasharray={`${slaStroke} ${circ}`} 
                  strokeDashoffset="0"
                />
              </svg>

              <div className="doughnut-center-text">
                <span className="pct">91%</span>
                <span className="lbl">Within SLA</span>
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <div className="li"><span className="sw" style={{ background: '#1F7A4D' }}></span>Within SLA</div>
            <div className="li"><span className="sw" style={{ background: '#E2A73B' }}></span>Delayed</div>
            <div className="li"><span className="sw" style={{ background: '#D1493F' }}></span>Breached</div>
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="panel">
          <div className="panel-head">
            <h2>Team Performance</h2>
            <span className="count-badge">This month</span>
          </div>
          <div className="leaderboard">
            {LEADERBOARD.map((t, i) => (
              <div className="lb-row" key={i}>
                <div className="lb-rank">{i + 1}</div>
                <div className="lb-info">
                  <div className="n">{t.name}</div>
                  <div className="m">{t.meta}</div>
                </div>
                <div className="lb-stat">
                  <div className="v">{t.resolved}</div>
                  <div className="l">Resolved</div>
                </div>
                <div className="lb-stat" style={{ marginLeft: '12px' }}>
                  <div className="v">{t.avg}</div>
                  <div className="l">Avg. Time</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time Horizontal Bars */}
        <div className="panel">
          <div className="panel-head">
            <h2>Resolution Time by Severity</h2>
            <span className="count-badge">Avg. hours</span>
          </div>
          <div className="hbar-list">
            {SEVERITY.map((s, idx) => (
              <div className="hbar-row" key={idx}>
                <div className="hb-top">
                  <div className="lab">
                    <span className="sev-dot" style={{ background: s.color }}></span>
                    {s.label}
                  </div>
                  <div className="val">{s.hours}h</div>
                </div>
                <div className="hb-track">
                  <div className="hb-fill" style={{ width: `${Math.min(100, (s.hours / s.max) * 100)}%`, background: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
