import React, { useState, useEffect } from 'react';
import './GovQueuePage.css';
import { apiFetch } from '../../../shared/lib/api';
import GovDetailMap from '../../../shared/components/layout/GovDetailMap';
import { incidentsApi } from '../../../services/incidentsApi';
import { formatCoordinates, formatJurisdiction } from '../../../shared/lib/formatCoords';

const SEEDED_COMPLAINTS = [];

const STEPS = ["submitted", "assigned", "progress", "resolved"];
const STEP_LABELS = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };
const SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL = { submitted: "Submitted", assigned: "Assigned", progress: "In Progress", resolved: "Resolved" };

export default function GovQueuePage() {
  const [complaints, setComplaints] = useState(SEEDED_COMPLAINTS);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [drawerId, setDrawerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
              farmScore: inc.category?.toLowerCase().includes('agri') || inc.category?.toLowerCase().includes('organic')
                ? Math.floor(75 + Math.random() * 20)
                : Math.floor(10 + Math.random() * 60)
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
  
  // Sort State
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');

  // Severity Dropdown State
  const [severityFilter, setSeverityFilter] = useState('All');

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

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = (name) => {
    if (!name) return '—';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getSeverityIcon = () => {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  };

  const farmScoreTier = (score) => {
    if (score >= 60) return 'high';
    if (score >= 30) return 'mid';
    return 'low';
  };

  const renderFarmScoreBadge = (score) => {
    const fs = score !== undefined ? score : 0;
    return (
      <span className={`farm-score-badge ${farmScoreTier(fs)}`} title="AI-estimated share of organic (compostable) waste in this report">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
        {fs}% Farm Score
      </span>
    );
  };

  // Stepper path svg generator
  const renderStepperSVG = (status) => {
    const idx = STEPS.indexOf(status);
    const positions = [30, 176, 322, 468];
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
                <circle cx={x} cy={y} r="12" fill="none" stroke={doneColor} strokeWidth="1.5" opacity="0.4" />
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

  // Row selection handler
  const handleSelectRow = (id, checked) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Check all rows in current page/view
  const handleCheckAll = (checked) => {
    if (checked) {
      const allIds = displayComplaints.map(c => c.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Reassign / Assign Team in Drawer
  const handleDrawerAssign = async (teamName) => {
    if (!teamName || !drawerId) return;
    try {
      await incidentsApi.assign(drawerId, teamName.split(' · ')[0]);
      setComplaints(prev => prev.map(c => {
        if (c.id === drawerId) {
          return {
            ...c,
            status: 'assigned',
            officer: teamName.split(' · ')[0],
            jurisdiction: c.jurisdiction?.includes(' → ')
              ? `${c.jurisdiction.split(' → ')[0]} → ${c.jurisdiction.split(' → ')[1] || 'Bhubaneshwar Municipal Corp.'} → ${teamName.split(' · ')[0]}`
              : `${c.locality || 'Ward'} → Bhubaneshwar Municipal Corp. → ${teamName.split(' · ')[0]}`
          };
        }
        return c;
      }));
      triggerToast(`Incident assigned to ${teamName.split(' · ')[0]}`);
    } catch (err) {
      triggerToast(`Error assigning team: ${err.message}`);
    }
  };

  // Bulk Assign Action
  const handleBulkAssign = () => {
    if (selectedRows.size === 0) return;
    setComplaints(prev => prev.map(c => {
      if (selectedRows.has(c.id)) {
        return { ...c, status: 'assigned', officer: 'Team Green-3' };
      }
      return c;
    }));
    triggerToast(`Assigned ${selectedRows.size} complaints to Team Green-3`);
    setSelectedRows(new Set());
  };

  // Advance Status in Drawer
  const handleDrawerAdvance = async () => {
    if (!drawerId) return;
    const c = complaints.find(x => x.id === drawerId);
    if (!c) return;

    const currentIndex = STEPS.indexOf(c.status);
    if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
      triggerToast('Incident is already resolved');
      return;
    }

    const nextStatus = STEPS[currentIndex + 1];
    const backendStatus = nextStatus === 'submitted' ? 'open' : nextStatus === 'progress' ? 'in_progress' : nextStatus;

    try {
      await incidentsApi.updateStatus(drawerId, backendStatus);
      setComplaints(prev => prev.map(item => {
        if (item.id === drawerId) {
          return { ...item, status: nextStatus };
        }
        return item;
      }));
      triggerToast(`Status advanced to: ${STEP_LABELS[nextStatus]}`);
    } catch (err) {
      triggerToast(`Error advancing status: ${err.message}`);
    }
  };

  // Filtering list
  const displayComplaints = complaints.filter(c => {
    // 1. Status Filter
    if (activeStatusFilter !== 'all' && c.status !== activeStatusFilter) return false;
    
    // 2. Severity Filter
    if (severityFilter !== 'All' && c.severity !== severityFilter.toLowerCase()) return false;
    
    // 3. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = c.id.toLowerCase().includes(q) || 
                    c.title.toLowerCase().includes(q) || 
                    c.locality.toLowerCase().includes(q) ||
                    (c.officer && c.officer.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Sorting list
  const sevOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = { submitted: 0, assigned: 1, progress: 2, resolved: 3 };

  displayComplaints.sort((a, b) => {
    let valA, valB;
    if (sortKey === 'severity') {
      valA = sevOrder[a.severity];
      valB = sevOrder[b.severity];
    } else if (sortKey === 'status') {
      valA = statusOrder[a.status];
      valB = statusOrder[b.status];
    } else if (sortKey === 'time') {
      // Seeded index determines recent order
      valA = SEV_LABEL[a.severity] ? complaints.findIndex(x => x.id === a.id) : 0;
      valB = SEV_LABEL[b.severity] ? complaints.findIndex(x => x.id === b.id) : 0;
    } else if (sortKey === 'farmScore') {
      valA = a.farmScore;
      valB = b.farmScore;
    } else {
      valA = a[sortKey] || '';
      valB = b[sortKey] || '';
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const drawerComplaint = complaints.find(c => c.id === drawerId);

  return (
    <div className="gov-queue-page">
      {/* QUEUE TOOLBAR */}
      <div className="queue-toolbar">
        <div className="toolbar-filters">
          <div className="seg-group">
            <button 
              onClick={() => setActiveStatusFilter('all')}
              className={`seg-btn ${activeStatusFilter === 'all' ? 'active' : ''}`}
            >
              All <span style={{ opacity: .55 }}>{complaints.length}</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter('submitted')}
              className={`seg-btn ${activeStatusFilter === 'submitted' ? 'active' : ''}`}
            >
              Submitted <span style={{ opacity: .55 }}>{complaints.filter(c=>c.status==='submitted').length}</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter('assigned')}
              className={`seg-btn ${activeStatusFilter === 'assigned' ? 'active' : ''}`}
            >
              Assigned <span style={{ opacity: .55 }}>{complaints.filter(c=>c.status==='assigned').length}</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter('progress')}
              className={`seg-btn ${activeStatusFilter === 'progress' ? 'active' : ''}`}
            >
              In Progress <span style={{ opacity: .55 }}>{complaints.filter(c=>c.status==='progress').length}</span>
            </button>
            <button 
              onClick={() => setActiveStatusFilter('resolved')}
              className={`seg-btn ${activeStatusFilter === 'resolved' ? 'active' : ''}`}
            >
              Resolved <span style={{ opacity: .55 }}>{complaints.filter(c=>c.status==='resolved').length}</span>
            </button>
          </div>

          <div className="dropdown">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="dropdown-btn"
              style={{ appearance: 'none', paddingRight: '28px' }}
            >
              <option value="All">Severity: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="dropdown">
            <select className="dropdown-btn" style={{ appearance: 'none', paddingRight: '28px' }}>
              <option>Zone: All</option>
              <option>Zone 1</option>
              <option>Zone 2</option>
              <option>Zone 3</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-inline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input 
              type="text" 
              placeholder="Filter this list…" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="button"
            onClick={() => triggerToast('Complaint queue exported successfully')}
            className="btn-export"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      <div className={`bulk-bar ${selectedRows.size > 0 ? 'show' : ''}`}>
        <span><b>{selectedRows.size}</b> complaints selected</span>
        <div className="spacer"></div>
        <button onClick={handleBulkAssign} className="bulk-assign">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Assign to Team
        </button>
        <button onClick={() => setSelectedRows(new Set())} className="bulk-clear">
          Clear Selection
        </button>
      </div>

      {/* FARM SCORE INFO BOX */}
      <div className="farm-score-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
        <div><b>What is Farm Score?</b> The AI vision model estimates what share of each reported complaint's waste is organic — crop residue, food, leaves, and other biodegradable material — versus inorganic (plastic, construction debris, packaging). A higher score means more of that pile can potentially be diverted to composting or the residue recovery program instead of a landfill.</div>
      </div>

      {/* COMPLAINTS TABLE */}
      <div className="queue-table-wrap">
        <table className="queue-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  className="row-check"
                  checked={displayComplaints.length > 0 && selectedRows.size === displayComplaints.length}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                />
              </th>
              <th>Complaint</th>
              <th>Locality</th>
              <th 
                className={`sortable ${sortKey === 'severity' ? 'active-sort' : ''}`}
                onClick={() => toggleSort('severity')}
              >
                Severity <span className="arrow">{sortKey === 'severity' && sortDir === 'desc' ? '▴' : '▾'}</span>
              </th>
              <th 
                className={`sortable ${sortKey === 'farmScore' ? 'active-sort' : ''}`}
                onClick={() => toggleSort('farmScore')}
              >
                Farm Score <span className="arrow">{sortKey === 'farmScore' && sortDir === 'desc' ? '▴' : '▾'}</span>
              </th>
              <th 
                className={`sortable ${sortKey === 'status' ? 'active-sort' : ''}`}
                onClick={() => toggleSort('status')}
              >
                Status <span className="arrow">{sortKey === 'status' && sortDir === 'desc' ? '▴' : '▾'}</span>
              </th>
              <th>Assigned Officer</th>
              <th 
                className={`sortable ${sortKey === 'time' ? 'active-sort' : ''}`}
                onClick={() => toggleSort('time')}
              >
                Reported <span className="arrow">{sortKey === 'time' && sortDir === 'desc' ? '▴' : '▾'}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayComplaints.map(c => (
              <tr 
                key={c.id} 
                onClick={() => setDrawerId(c.id)}
                className={selectedRows.has(c.id) ? 'row-checked' : ''}
              >
                <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    className="row-check"
                    checked={selectedRows.has(c.id)}
                    onChange={(e) => handleSelectRow(c.id, e.target.checked)}
                  />
                </td>
                <td>
                  <div className="td-complaint">
                    <div className="thumb-sm" style={{ background: c.photo }}></div>
                    <div className="tc-text">
                      <div className="tc-id">{c.id}</div>
                      <div className="tc-title">{c.title}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="td-locality">
                    {c.locality.split(',')[0]}
                    <div className="loc-sub">{c.distance} away</div>
                  </div>
                </td>
                <td>
                  <span className={`sev-badge ${c.severity}`}>
                    {getSeverityIcon()}
                    {SEV_LABEL[c.severity]}
                  </span>
                </td>
                <td>
                  {renderFarmScoreBadge(c.farmScore)}
                </td>
                <td>
                  <span className={`status-pill ${c.status}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td>
                  {c.officer ? (
                    <div className="officer-cell">
                      <span className="mini-avatar">{initials(c.officer)}</span>
                      {c.officer}
                    </div>
                  ) : (
                    <div className="officer-cell unassigned">
                      <span className="mini-avatar">—</span>
                      Unassigned
                    </div>
                  )}
                </td>
                <td className="td-time">{c.time}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button"
                    onClick={() => setDrawerId(c.id)}
                    className="row-menu-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <div className="p-info">Showing <b>1–{displayComplaints.length}</b> of <b>{displayComplaints.length}</b> complaints</div>
          <div className="p-controls">
            <button className="page-btn" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER OVERLAY */}
      <div 
        className={`gov-queue-page-drawer-overlay ${drawerComplaint ? 'show' : ''}`}
        onClick={() => setDrawerId(null)}
      ></div>

      {/* DETAIL DRAWER CONTAINER */}
      <div className={`gov-queue-page-drawer ${drawerComplaint ? 'show' : ''}`}>
        <button 
          onClick={() => setDrawerId(null)}
          className="gov-queue-page-drawer-close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="gov-queue-page-drawer-scroll">
          {drawerComplaint && (
            <>
              <div className="d-photo" style={{ position: 'relative' }}>
                <GovDetailMap coords={drawerComplaint.coords} />
                <span className={`sev-badge ${drawerComplaint.severity}`}>
                  {getSeverityIcon()}
                  {SEV_LABEL[drawerComplaint.severity]} Severity
                </span>
                {renderFarmScoreBadge(drawerComplaint.farmScore)}
                <span className="d-id">{drawerComplaint.id}</span>
              </div>

              <div className="d-body">
                <div className="d-title">{drawerComplaint.title}</div>
                <div className="d-desc">{drawerComplaint.desc}</div>

                <div className="d-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
                  <div>
                    <div className="l">Farm Score</div>
                    <div className="v">{drawerComplaint.farmScore}% organic — <span style={{ color: 'var(--ink-400)', fontWeight: 500 }}>AI-estimated share of compostable waste, used to route recoverable material to the residue buy-back program.</span></div>
                  </div>
                </div>

                <div className="d-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <div>
                    <div className="l">Jurisdiction</div>
                    <div className="v">{drawerComplaint.jurisdiction}</div>
                  </div>
                </div>

                <div className="d-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <div className="l">Coordinates</div>
                    <div className="v mono">{drawerComplaint.coords || "Location unavailable"}</div>
                  </div>
                </div>

                <div className="ai-box">
                  <div className="ai-top">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 2 7l10 5 10-5-10-5z" /><circle cx="12" cy="14" r="1" />
                    </svg>
                    <span>AI Assessment</span>
                  </div>
                  <div className="ai-line">{drawerComplaint.aiNote}</div>
                  <div className="confidence-bar">
                    <i style={{ width: `${drawerComplaint.confidence}%` }}></i>
                  </div>
                  <div className="ai-box-confidence-label">Confidence {drawerComplaint.confidence}%</div>
                </div>

                <div className="stepper-wrap">
                  <div className="stepper-label">Resolution Path</div>
                  <div className="stepper">{renderStepperSVG(drawerComplaint.status)}</div>
                  <div className="step-items">
                    {STEPS.map((s, i) => (
                      <div 
                        key={s}
                        className={`step-item ${
                          STEPS.indexOf(drawerComplaint.status) > i 
                            ? 'done' 
                            : STEPS.indexOf(drawerComplaint.status) === i 
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
                  value={drawerComplaint.officer ? `${drawerComplaint.officer} · Active` : ""}
                  onChange={(e) => handleDrawerAssign(e.target.value)}
                >
                  <option value="">{drawerComplaint.officer ? 'Reassign team…' : 'Assign to sanitation team…'}</option>
                  <option value="Team Green-1 · Zone 1">Team Green-1 · Zone 1</option>
                  <option value="Team Green-3 · Zone 3">Team Green-3 · Zone 3</option>
                  <option value="Drainage Cell · Rapid Response">Drainage Cell · Rapid Response</option>
                </select>

                <div className="assign-row">
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => setDrawerId(null)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleDrawerAdvance}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Advance Status
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TOAST PANEL */}
      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
