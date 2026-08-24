import React, { useState } from 'react';
import './GovAnalyticsPage.css';

const LEADERBOARD = [
  { name: 'Team Bravo', meta: 'Sector 7 · Ward 14', resolved: 78, avg: '10.5h' },
  { name: 'Team Alpha', meta: 'Sector 4 · Ward 14', resolved: 64, avg: '12.1h' },
  { name: 'Team Echo', meta: 'Market Road Belt', resolved: 51, avg: '13.8h' },
  { name: 'Team Delta', meta: 'Riverside Colony', resolved: 39, avg: '19.4h' },
  { name: 'Team Foxtrot', meta: 'Sector 9 · Ward 14', resolved: 22, avg: '21.0h' },
];

const SEVERITY = [
  { label: 'High', hours: 6.2, max: 24, color: '#D1493F' },
  { label: 'Medium', hours: 13.8, max: 24, color: '#E2A73B' },
  { label: 'Low', hours: 21.5, max: 24, color: '#1F7A4D' },
];

const RANGES = {
  7:  { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        reported: [14, 18, 11, 20, 16, 9, 7],
        resolved: [10, 15, 12, 17, 14, 11, 8] },
  30: { labels: ['W1', 'W2', 'W3', 'W4'],
        reported: [92, 101, 88, 110],
        resolved: [80, 95, 90, 103] },
  90: { labels: ['Jan', 'Feb', 'Mar'],
        reported: [310, 289, 342],
        resolved: [275, 301, 318] },
  365:{ labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        reported: [941, 1023, 987, 1105],
        resolved: [880, 960, 940, 1040] },
};

const RANGE_LABELS = { 7: 'Last 7 days', 30: 'Last 30 days', 90: 'Last 90 days', 365: 'Last 1 year' };

export default function GovAnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState(7);

  const activeRange = RANGES[selectedRange];

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
    const organic = [620, 780, 910, 1050, 1150, 1240];
    const inorganic = [310, 380, 460, 540, 610, 680];
    const avoided = [8, 14, 22, 31, 41, 53];

    const width = 800;
    const height = 200;
    const paddingLeft = 50;
    const paddingRight = 50;
    const paddingTop = 20;
    const paddingBottom = 25;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const getX = (index) => paddingLeft + index * (chartW / (labels.length - 1));
    const getLeftY = (val) => paddingTop + chartH - (val / 2000) * chartH;
    const getRightY = (val) => paddingTop + chartH - (val / 60) * chartH;

    const linePoints = avoided.map((val, i) => `${getX(i)},${getRightY(val)}`);
    const linePath = `M ${linePoints.join(' L ')}`;

    const leftTicks = [0, 500, 1000, 1500, 2000];
    const rightTicks = [0, 15, 30, 45, 60];

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
            const orgH = (organic[i] / 2000) * chartH;
            const inorgH = (inorganic[i] / 2000) * chartH;
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
          <div className="value">341</div>
          <div className="label">Resolved This Month</div>
        </div>
        <div className="stat-card progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="trend up">-8%</span>
          </div>
          <div className="value">14.2h</div>
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
          <div className="value">91%</div>
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
          <div className="value">4.4/5</div>
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
          <div className="value">6%</div>
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
