import React from 'react';
import './GovSchedulePage.css';

export default function GovSchedulePage() {
  return (
    <div className="gov-schedule-page">
      <div className="wrap">

        {/* Header */}
        <div className="page-header">
          <div>
            <div className="eyebrow">Waste to Resource · Government Operations</div>
            <h1 className="page-title">Collection Schedule</h1>
            <p className="page-sub">Weekly farmer pickup routes across Puri district — plan, track and confirm biomass &amp; organic waste collection.</p>
          </div>
          <div className="header-actions">
            <div className="zone-pill">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              Puri · Kanas Village
            </div>
            <button className="btn-primary" onClick={() => alert('Add Pickup Slot feature: Scheduled slot configuration form modal opens.')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Pickup Slot
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="stat-strip">
          <div className="stat-card hero">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="7" width="15" height="10" rx="1.5" />
                <path d="M16 10h3.5L22 13.5V17h-6" />
                <circle cx="6" cy="19.5" r="1.6" />
                <circle cx="17.5" cy="19.5" r="1.6" />
              </svg>
            </div>
            <div className="stat-label">Routes This Week</div>
            <div className="stat-value">14 <span className="unit">routes</span></div>
            <div className="stat-foot"><b>9 villages</b> across 3 clusters</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-label">Farmers Covered</div>
            <div className="stat-value">245</div>
            <div className="stat-foot">up <b>↑ 12%</b> from last week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-label">Volume Scheduled</div>
            <div className="stat-value">12.4 <span className="unit">T</span></div>
            <div className="stat-foot">Organic + crop residue</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>
            <div className="stat-label">On-Time Rate</div>
            <div className="stat-value">94<span class="unit">%</span></div>
            <div className="stat-foot">Last 30 days average</div>
          </div>
        </div>

        {/* Route trail (signature element) */}
        <div className="trail-card">
          <div className="trail-head">
            <div className="trail-title">This Week's Route <span>18 – 24 Aug</span></div>
            <div className="legend">
              <div className="legend-item"><span className="dot done"></span>Collected</div>
              <div className="legend-item"><span class="dot today"></span>Today's stop</div>
              <div className="legend-item"><span className="dot upcoming"></span>Upcoming</div>
              <div className="legend-item"><span className="dot missed"></span>Missed</div>
            </div>
          </div>

          <div className="trail">
            <div className="day done">
              <div className="day-name">Mon</div><div className="day-num">18</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="day-village">Kanas</div>
              <div className="day-time">08:30 AM</div>
              <div className="day-status">Done</div>
            </div>
            <div className="day done">
              <div className="day-name">Tue</div><div className="day-num">19</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="day-village">Kunjpura</div>
              <div className="day-time">09:00 AM</div>
              <div className="day-status">Done</div>
            </div>
            <div className="day missed">
              <div className="day-name">Wed</div><div className="day-num">20</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </div>
              <div className="day-village">Nissing</div>
              <div className="day-time">08:00 AM</div>
              <div className="day-status">Missed</div>
            </div>
            <div className="day today">
              <div className="day-name">Thu</div><div className="day-num">21</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="7" width="13" height="9" rx="1.2" />
                  <path d="M14 10h3l3 3v3h-6" />
                  <circle cx="5" cy="18.5" r="1.4" />
                  <circle cx="16.5" cy="18.5" r="1.4" />
                </svg>
              </div>
              <div className="day-village">Assandh</div>
              <div className="day-time">10:15 AM</div>
              <div className="day-status">In Transit</div>
            </div>
            <div className="day upcoming">
              <div className="day-name">Fri</div><div className="day-num">22</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div className="day-village">Gharaunda</div>
              <div className="day-time">08:45 AM</div>
              <div className="day-status">Upcoming</div>
            </div>
            <div className="day upcoming">
              <div className="day-name">Sat</div><div className="day-num">23</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div className="day-village">Indri</div>
              <div className="day-time">09:30 AM</div>
              <div className="day-status">Upcoming</div>
            </div>
            <div className="day upcoming">
              <div className="day-name">Sun</div><div className="day-num">24</div>
              <div className="node">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div className="day-village">— Off day —</div>
              <div className="day-time">No pickup</div>
              <div className="day-status">Rest</div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="main-grid">

          {/* Left: schedule table */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Zone-wise Pickup Plan</div>
              <a className="panel-link" href="#" onClick={(e) => e.preventDefault()}>View Full Schedule →</a>
            </div>
            <table className="sched">
              <thead>
                <tr>
                  <th>Village / Zone</th>
                  <th>Waste Type</th>
                  <th>Time Window</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Kanas Village</div>
                        <div className="village-farmers">38 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Crop Residue</td>
                  <td className="time-mono">08:30 – 09:15</td>
                  <td className="veh">Truck · HR-05-CJ 3312</td>
                  <td><span className="badge b-leaf">Collected</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Kunjpura</div>
                        <div className="village-farmers">27 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Organic Waste</td>
                  <td className="time-mono">09:00 – 09:40</td>
                  <td className="veh">Truck · HR-05-CJ 1187</td>
                  <td><span className="badge b-leaf">Collected</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Nissing</div>
                        <div className="village-farmers">31 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Crop Residue</td>
                  <td className="time-mono">08:00 – 08:45</td>
                  <td className="veh">Truck · HR-05-CJ 3312</td>
                  <td><span className="badge b-wheat">Rescheduled</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Assandh</div>
                        <div className="village-farmers">42 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Recyclables</td>
                  <td className="time-mono">10:15 – 11:00</td>
                  <td className="veh">Mini Van · HR-05-BK 0921</td>
                  <td><span className="badge b-clay">In Transit</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Gharaunda</div>
                        <div className="village-farmers">35 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Organic Waste</td>
                  <td className="time-mono">08:45 – 09:30</td>
                  <td className="veh">Truck · HR-05-CJ 1187</td>
                  <td><span className="badge b-sky">Scheduled</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="village-cell">
                      <div className="village-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                        </svg>
                      </div>
                      <div>
                        <div className="village-name">Indri</div>
                        <div className="village-farmers">22 farmers</div>
                      </div>
                    </div>
                  </td>
                  <td>Crop Residue</td>
                  <td className="time-mono">09:30 – 10:10</td>
                  <td className="veh">Truck · HR-05-CJ 3312</td>
                  <td><span className="badge b-sky">Scheduled</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: sidebar */}
          <div className="side-stack">
            <div className="next-card">
              <div className="next-eyebrow">Next Pickup</div>
              <div className="next-village">Assandh Cluster</div>
              <div className="next-detail">Organic waste &amp; crop residue · 42 farmers</div>
              <div className="next-countdown">
                <div className="cd-block"><div className="cd-num">01</div><div className="cd-label">Hrs</div></div>
                <div className="cd-block"><div className="cd-num">24</div><div className="cd-label">Min</div></div>
                <div className="cd-block"><div className="cd-num">10:15</div><div className="cd-label">Arrival</div></div>
              </div>
              <button className="next-btn" onClick={() => alert('Tracking Vehicle... Initializing live GPS route feed.')}>Track Vehicle</button>
            </div>

            <div className="panel list-card">
              <div className="panel-head">
                <div className="panel-title">Pending Confirmations</div>
                <a className="panel-link" href="#" onClick={(e) => e.preventDefault()}>View All →</a>
              </div>
              <div className="req-row">
                <div className="req-avatar">RY</div>
                <div>
                  <div className="req-name">Ramesh Yadav</div>
                  <div className="req-meta">Kanas · Paddy straw</div>
                </div>
                <div className="req-amt">350 kg</div>
              </div>
              <div className="req-row">
                <div className="req-avatar">SK</div>
                <div>
                  <div className="req-name">Suresh Kumar</div>
                  <div className="req-meta">Nissing · Wheat residue</div>
                </div>
                <div className="req-amt">210 kg</div>
              </div>
              <div className="req-row">
                <div className="req-avatar">PD</div>
                <div>
                  <div className="req-name">Poonam Devi</div>
                  <div className="req-meta">Kunjpura · Organic waste</div>
                </div>
                <div className="req-amt">180 kg</div>
              </div>
              <div className="req-row">
                <div className="req-avatar">AS</div>
                <div>
                  <div className="req-name">Amit Sahu</div>
                  <div className="req-meta">Assandh · Crop residue</div>
                </div>
                <div className="req-amt">460 kg</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
