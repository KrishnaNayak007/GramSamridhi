import React, { useState } from 'react';
import './GovTeamsPage.css';

const INITIAL_TEAMS = [
  { id:'T-01', name:'Team Alpha', zone:'Sector 4 · Ward 14', status:'on', supervisor:'K. Sharma', supInit:'KS', members:['A','R','P','M'], load:6, capacity:8, vehicle:'WB-06-AZ 2291' },
  { id:'T-02', name:'Team Bravo', zone:'Sector 7 · Ward 14', status:'on', supervisor:'N. Roy', supInit:'NR', members:['S','D','T'], load:8, capacity:8, vehicle:'WB-06-AZ 4410' },
  { id:'T-03', name:'Team Charlie', zone:'Sector 2 · Ward 14', status:'off', supervisor:'A. Ghosh', supInit:'AG', members:['V','L'], load:0, capacity:6, vehicle:'WB-06-AZ 1187' },
  { id:'T-04', name:'Team Delta', zone:'Riverside Colony', status:'overloaded', supervisor:'P. Iyer', supInit:'PI', members:['K','J','B','H','C'], load:11, capacity:8, vehicle:'WB-06-AZ 7765' },
  { id:'T-05', name:'Team Echo', zone:'Market Road Belt', status:'on', supervisor:'S. Verma', supInit:'SV', members:['O','Q'], load:3, capacity:8, vehicle:'WB-06-AZ 3302' },
  { id:'T-06', name:'Team Foxtrot', zone:'Sector 9 · Ward 14', status:'off', supervisor:'M. Das', supInit:'MD', members:['E','F','G'], load:0, capacity:6, vehicle:'WB-06-AZ 9034' },
];

const DUTY_LABELS = { on: 'On Duty', off: 'Off Duty', overloaded: 'Overloaded' };

export default function GovTeamsPage() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredTeams = teams.filter(t => {
    const matchesFilter = activeFilter === 'all' || t.status === activeFilter;
    const matchesSearch = !searchQuery || 
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const totalTeams = teams.length;
  const onDutyCount = teams.filter(t => t.status === 'on' || t.status === 'overloaded').length;
  const overloadedCount = teams.filter(t => t.status === 'overloaded').length;
  const activeVehicles = teams.filter(t => t.status !== 'off').length + 5; // offset representing other zone vehicles

  const getWorkloadTier = (load, capacity) => {
    const pct = load / capacity;
    if (pct >= 1) return 'high';
    if (pct >= 0.6) return 'medium';
    return 'low';
  };

  const handleReassign = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newSupervisor = prompt(`Enter new supervisor name for ${team.name}:`, team.supervisor);
    if (newSupervisor === null) return; // cancelled

    const newZone = prompt(`Enter new zone assignment for ${team.name}:`, team.zone);
    if (newZone === null) return; // cancelled

    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const initials = newSupervisor
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          ...t,
          supervisor: newSupervisor || team.supervisor,
          supInit: initials || team.supInit,
          zone: newZone || team.zone
        };
      }
      return t;
    }));
  };

  const handleViewDetails = (team) => {
    alert(`
=== ${team.name} Details ===
Supervisor: ${team.supervisor} (${team.supInit})
Assigned Zone: ${team.zone}
Status: ${DUTY_LABELS[team.status]}
Active Crew Initials: ${team.members.join(', ')}
Workload: ${team.load} active of ${team.capacity} max cases
Vehicle ID: ${team.vehicle}
    `);
  };

  return (
    <div className="gov-teams-page">
      <section className="stats">
        <div className="stat-card total">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="value">{totalTeams}</div>
          <div className="label">Total Teams</div>
        </div>
        <div className="stat-card progress">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
          </div>
          <div className="value">{onDutyCount}</div>
          <div className="label">On Duty Now</div>
        </div>
        <div className="stat-card pending">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
          </div>
          <div className="value">22m</div>
          <div className="label">Avg. Response Time</div>
        </div>
        <div className="stat-card urgent">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </div>
          </div>
          <div className="value">{overloadedCount}</div>
          <div className="label">Overloaded Teams</div>
        </div>
        <div className="stat-card resolved">
          <div className="top-row">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="7" width="15" height="13" rx="2"/>
                <path d="M16 11h3l4 4v5h-7"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
              </svg>
            </div>
          </div>
          <div className="value">{activeVehicles}</div>
          <div className="label">Vehicles Active</div>
        </div>
      </section>

      <section className="panel teams-panel">
        <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>Field Teams</h2>
            <span className="count-badge">{filteredTeams.length} teams</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e1e6dc', borderRadius: '20px', padding: '4px 10px', gap: '6px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px', color: 'var(--ink-400)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search teams..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '11px', width: '150px', background: 'none' }}
            />
          </div>
        </div>

        <div className="filters">
          <div className={`chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Teams</div>
          <div className={`chip ${activeFilter === 'on' ? 'active' : ''}`} onClick={() => setActiveFilter('on')}>
            <span className="sev-dot" style={{ background: 'var(--green-600)' }}></span>On Duty
          </div>
          <div className={`chip ${activeFilter === 'off' ? 'active' : ''}`} onClick={() => setActiveFilter('off')}>
            <span className="sev-dot" style={{ background: 'var(--ink-400)' }}></span>Off Duty
          </div>
          <div className={`chip ${activeFilter === 'overloaded' ? 'active' : ''}`} onClick={() => setActiveFilter('overloaded')}>
            <span className="sev-dot" style={{ background: 'var(--red-500)' }}></span>Overloaded
          </div>
        </div>

        <div className="teams-grid">
          {filteredTeams.map(t => {
            const pct = Math.min(100, Math.round((t.load / t.capacity) * 100));
            const tier = getWorkloadTier(t.load, t.capacity);
            const memberChips = t.members.slice(0, 4).map((m, idx) => (
              <div key={idx} className="t-avatar">{m}</div>
            ));
            const extraCount = t.members.length > 4 ? `+${t.members.length - 4}` : null;

            return (
              <div key={t.id} className="team-card">
                <div className="t-head">
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-zone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {t.zone}
                    </div>
                  </div>
                  <span className={`duty-pill ${t.status}`}>{DUTY_LABELS[t.status]}</span>
                </div>

                <div className="supervisor-row">
                  <div className="t-avatar">{t.supInit}</div>
                  <div className="who">
                    <div className="n">{t.supervisor}</div>
                    <div className="r">Team Supervisor</div>
                  </div>
                </div>

                <div className="member-stack">
                  {memberChips}
                  {extraCount && <div className="more">{extraCount}</div>}
                </div>

                <div className="workload">
                  <div className="w-top">
                    <span>Workload</span>
                    <span className="v">{t.load}/{t.capacity} active</span>
                  </div>
                  <div className="w-bar">
                    <div className={`fill ${tier}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>

                <div className="t-foot">
                  <div className="vehicle-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="7" width="15" height="13" rx="2"/>
                      <path d="M16 11h3l4 4v5h-7"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/>
                    </svg>
                    {t.vehicle}
                  </div>
                  <div className="t-actions">
                    <button className="btn btn-ghost" onClick={() => handleViewDetails(t)}>View</button>
                    <button className="btn btn-primary" onClick={() => handleReassign(t.id)}>Reassign</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
