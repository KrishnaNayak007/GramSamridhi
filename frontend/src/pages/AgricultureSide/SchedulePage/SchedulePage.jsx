import './SchedulePage.css';
import React, { useState, useEffect } from 'react';
import { agricultureApi } from '../../../services/agricultureApi';

export default function SchedulePage() {
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await agricultureApi.getPickups();
        if (data) setPickups(data);
      } catch (err) {
        console.error("Error loading schedule pickups:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="agriculture-schedule-page">
      <div className="wrap">
        {/* Header Section */}
        <div className="page-header" style={{ alignItems: 'center' }}>
          <div>
            <div className="eyebrow">WASTE TO RESOURCE · GOVERNMENT OPERATIONS</div>
            <h1 className="page-title">Collection Schedule</h1>
            <p className="page-sub">Weekly farmer pickup routes across Puri district — plan, track and confirm biomass &amp; organic waste collection.</p>
          </div>
          <div className="page-header-actions">
            <button className="loc-selector-btn">
              <span>📍</span> Puri · Kanas Village
            </button>
            <button className="btn-add-slot" onClick={() => alert('Add pickup slot dialog opened.')}>
              <span>+</span> Add Pickup Slot
            </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <section className="metrics-grid">
          <div className="metric-card highlight">
            <div className="lbl">Routes This Week</div>
            <div className="val">14 routes</div>
            <div className="sub">9 villages across 3 clusters</div>
          </div>
          <div className="metric-card">
            <div className="lbl">Farmers Covered</div>
            <div className="val">245</div>
            <div className="sub" style={{ color: '#4FAF45', fontWeight: '700' }}>↑ 12% <span style={{ color: 'var(--ink-soft)', fontWeight: '500' }}>from last week</span></div>
          </div>
          <div className="metric-card">
            <div className="lbl">Volume Scheduled</div>
            <div className="val">12.4 T</div>
            <div className="sub">Organic + crop residue</div>
          </div>
          <div className="metric-card">
            <div className="lbl">On-Time Rate</div>
            <div className="val">94%</div>
            <div className="sub">Last 30 days average</div>
          </div>
        </section>

        {/* Timeline Row Card */}
        <div className="weekly-route-card">
          <div className="route-card-head">
            <div className="route-card-title">
              This Week's Route <span>18 – 24 Aug</span>
            </div>
            <div className="route-legend">
              <div className="leg-item"><span className="leg-dot collected"></span> Collected</div>
              <div className="leg-item"><span className="leg-dot today"></span> Today's stop</div>
              <div className="leg-item"><span className="leg-dot upcoming"></span> Upcoming</div>
              <div className="leg-item"><span className="leg-dot missed"></span> Missed</div>
            </div>
          </div>

          <div className="days-timeline-row">
            {/* Mon */}
            <div className="day-col done">
              <span className="day-lbl">Mon</span>
              <span className="day-num">18</span>
              <div className="day-indicator">✓</div>
              <span className="day-loc">Kanas</span>
              <span className="day-time">08:30 AM</span>
              <span className="day-status-badge done">Done</span>
            </div>
            {/* Tue */}
            <div className="day-col done">
              <span className="day-lbl">Tue</span>
              <span className="day-num">19</span>
              <div className="day-indicator">✓</div>
              <span className="day-loc">Kunjpura</span>
              <span className="day-time">09:00 AM</span>
              <span className="day-status-badge done">Done</span>
            </div>
            {/* Wed */}
            <div className="day-col missed">
              <span className="day-lbl">Wed</span>
              <span className="day-num">20</span>
              <div className="day-indicator">✗</div>
              <span className="day-loc">Nissing</span>
              <span className="day-time">08:00 AM</span>
              <span className="day-status-badge missed">Missed</span>
            </div>
            {/* Thu */}
            <div className="day-col transit active-day">
              <span className="day-lbl">Thu</span>
              <span className="day-num">21</span>
              <div className="day-indicator">🚚</div>
              <span className="day-loc">Assandh</span>
              <span className="day-time">10:15 AM</span>
              <span className="day-status-badge transit">In Transit</span>
            </div>
            {/* Fri */}
            <div className="day-col">
              <span className="day-lbl">Fri</span>
              <span className="day-num">22</span>
              <div className="day-indicator">⏰</div>
              <span className="day-loc">Gharaunda</span>
              <span className="day-time">08:45 AM</span>
              <span className="day-status-badge upcoming">Upcoming</span>
            </div>
            {/* Sat */}
            <div className="day-col">
              <span className="day-lbl">Sat</span>
              <span className="day-num">23</span>
              <div className="day-indicator">⏰</div>
              <span className="day-loc">Indri</span>
              <span className="day-time">09:30 AM</span>
              <span className="day-status-badge upcoming">Upcoming</span>
            </div>
            {/* Sun */}
            <div className="day-col">
              <span className="day-lbl">Sun</span>
              <span className="day-num">24</span>
              <div className="day-indicator">⏰</div>
              <span className="day-loc">— Off day —</span>
              <span className="day-time">No pickup</span>
              <span className="day-status-badge upcoming">Rest</span>
            </div>
          </div>
        </div>

        {/* Bottom Grid Layout */}
        <div className="schedule-layout-grid">
          {/* Left Column: Zone-wise Table */}
          <div className="plan-card">
            <div className="plan-card-head">
              <div className="plan-card-title">Zone-wise Pickup Plan</div>
              <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); alert('Redirecting to full district schedule logs.'); }}>View Full Schedule →</a>
            </div>
            <table className="plan-table">
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
                  <td className="plan-zone">Kanas Village <span>38 farmers</span></td>
                  <td>Crop Residue</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>08:30 – 09:15</td>
                  <td>Truck · HR-05-CJ 3312</td>
                  <td><span className="status-badge collected">Collected</span></td>
                </tr>
                <tr>
                  <td className="plan-zone">Kunjpura <span>27 farmers</span></td>
                  <td>Organic Waste</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>09:00 – 09:40</td>
                  <td>Truck · HR-05-CJ 1187</td>
                  <td><span className="status-badge collected">Collected</span></td>
                </tr>
                <tr>
                  <td className="plan-zone">Nissing <span>31 farmers</span></td>
                  <td>Crop Residue</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>08:00 – 08:45</td>
                  <td>Truck · HR-05-CJ 3312</td>
                  <td><span className="status-badge rescheduled">Rescheduled</span></td>
                </tr>
                <tr>
                  <td className="plan-zone">Assandh <span>42 farmers</span></td>
                  <td>Recyclables</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>10:15 – 11:00</td>
                  <td>Mini Van · HR-05-BK 0921</td>
                  <td><span className="status-badge transit">In Transit</span></td>
                </tr>
                <tr>
                  <td className="plan-zone">Gharaunda <span>35 farmers</span></td>
                  <td>Organic Waste</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>08:45 – 09:30</td>
                  <td>Truck · HR-05-CJ 1187</td>
                  <td><span className="status-badge scheduled">Scheduled</span></td>
                </tr>
                <tr>
                  <td className="plan-zone">Indri <span>22 farmers</span></td>
                  <td>Crop Residue</td>
                  <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>09:30 – 10:10</td>
                  <td>Truck · HR-05-CJ 3312</td>
                  <td><span className="status-badge scheduled">Scheduled</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column: Next Pickup Countdown & Confirmations */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="next-pickup-card">
              <span className="card-lbl">Next Pickup</span>
              <h3>Assandh Cluster</h3>
              <p>Organic waste &amp; crop residue · 42 farmers</p>
              
              <div className="countdown-row">
                <div className="countdown-box">
                  <strong>01</strong>
                  <span>Hrs</span>
                </div>
                <div className="countdown-box">
                  <strong>24</strong>
                  <span>Min</span>
                </div>
                <div className="countdown-box">
                  <strong>10:15</strong>
                  <span>Arrival</span>
                </div>
              </div>

              <button className="btn-track-white" onClick={() => alert('Vehicle tracking started. Mini Van HR-05-BK 0921 is currently approaching Assandh Center.')}>
                Track Vehicle
              </button>
            </div>

            {/* Pending Confirmations list */}
            <div className="confirmations-card">
              <div className="plan-card-head" style={{ marginBottom: '12px' }}>
                <div className="plan-card-title" style={{ fontSize: '15px' }}>Pending Confirmations</div>
                <a href="#" className="panel-link" style={{ fontSize: '11px' }} onClick={(e) => { e.preventDefault(); alert('Showing all pending confirmation tickets.'); }}>View All →</a>
              </div>
              <div className="conf-list">
                <div className="conf-item">
                  <div className="conf-avatar">RY</div>
                  <div className="conf-info">
                    <span className="conf-name">Ramesh Yadav</span>
                    <span className="conf-desc">Kanas · Paddy straw</span>
                  </div>
                  <span className="conf-qty">350 kg</span>
                </div>
                <div className="conf-item">
                  <div className="conf-avatar">SK</div>
                  <div className="conf-info">
                    <span className="conf-name">Suresh Kumar</span>
                    <span className="conf-desc">Nissing · Wheat residue</span>
                  </div>
                  <span className="conf-qty">210 kg</span>
                </div>
                <div className="conf-item">
                  <div className="conf-avatar">PD</div>
                  <div className="conf-info">
                    <span className="conf-name">Poonam Devi</span>
                    <span className="conf-desc">Kunjpura · Organic waste</span>
                  </div>
                  <span className="conf-qty">180 kg</span>
                </div>
                <div className="conf-item">
                  <div className="conf-avatar">AS</div>
                  <div className="conf-info">
                    <span className="conf-name">Amit Sahu</span>
                    <span className="conf-desc">Assandh · Crop residue</span>
                  </div>
                  <span className="conf-qty">460 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}