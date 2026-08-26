import React, { useState, useEffect } from 'react';
import './GovBuybackPage.css';
import { agricultureApi } from '../../../services/agricultureApi';

const RATES = {
  "Rice Straw": 1500,
  "Wheat Straw": 1350,
  "Sugarcane Trash": 1100,
  "Agri Plastic Sheet": 900,
  "Irrigation Pipe": 750
};

const RESIDUE_STREAM = {
  "Rice Straw": "organic",
  "Wheat Straw": "organic",
  "Sugarcane Trash": "organic",
  "Agri Plastic Sheet": "inorganic",
  "Irrigation Pipe": "inorganic"
};

const INITIAL_RECORDS = [];

const STATUS_LABEL = { requested: "Requested", approved: "Approved", collected: "Collected", paid: "Paid" };
const STATUS_STEPS = ["requested", "approved", "collected", "paid"];

export default function GovBuybackPage() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPickups() {
      try {
        const data = await agricultureApi.getPickups();
        if (data && data.length > 0) {
          const mapped = data.map(inc => {
            const status = inc.status === 'pending' ? 'requested' : inc.status === 'scheduled' ? 'approved' : inc.status === 'collected' ? 'collected' : 'paid';
            const residue = inc.residue_type || "Rice Straw";
            return {
              id: inc.id || `RB-mock-${Math.floor(1000 + Math.random() * 9000)}`,
              farmer: inc.farmer_name || "Farmer",
              village: inc.location_name || "Village Kelejora",
              crop: inc.residue_type?.includes("Paddy") || inc.residue_type?.includes("Rice") ? "Paddy" : "Wheat",
              residue: residue,
              qty: (inc.weight_kg || 1000) / 1000,
              status: status,
              requested: 'Recently',
              pickup: inc.scheduled_slot || "Awaiting schedule"
            };
          });
          setRecords(mapped);
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        console.error("Error loading buyback pickups:", err);
      }
    }
    fetchPickups();
  }, []);

  const amountFor = (r) => {
    if (!r || !RATES[r.residue]) return 0;
    return Math.round(r.qty * RATES[r.residue]);
  };

  const uniqueFarmers = new Set(records.map(r => r.farmer)).size;
  const totalPaid = records.filter(r => r.status === 'paid').reduce((sum, r) => sum + amountFor(r), 0);
  const pendingRequests = records.filter(r => r.status === 'requested').length;
  const scheduledPickups = records.filter(r => r.status === 'approved' || r.status === 'collected').length;
  const avgPayment = uniqueFarmers > 0 ? Math.round(records.reduce((sum, r) => sum + amountFor(r), 0) / uniqueFarmers) : 0;

  const organicTotal = records
    .filter(r => RESIDUE_STREAM[r.residue] === 'organic')
    .reduce((sum, r) => sum + r.qty, 0);
  const inorganicTotal = records
    .filter(r => RESIDUE_STREAM[r.residue] === 'inorganic')
    .reduce((sum, r) => sum + r.qty, 0);
  const totalMaterial = organicTotal + inorganicTotal;

  const countRequested = records.filter(r => r.status === 'requested').length;
  const countApproved = records.filter(r => r.status === 'approved').length;
  const countCollected = records.filter(r => r.status === 'collected').length;
  const countPaid = records.filter(r => r.status === 'paid').length;

  const handleAdvanceStatus = () => {
    setRecords(prev => prev.map(r => {
      if (r.id === selectedId) {
        const currentIdx = STATUS_STEPS.indexOf(r.status);
        if (currentIdx < STATUS_STEPS.length - 1) {
          const nextStatus = STATUS_STEPS[currentIdx + 1];
          let updatedPickup = r.pickup;
          if (nextStatus === 'approved') updatedPickup = "Approved · Scheduling pickup";
          if (nextStatus === 'collected') updatedPickup = "Confirmed · Picked up today";
          if (nextStatus === 'paid') updatedPickup = "Confirmed · Paid via DBT";
          return {
            ...r,
            status: nextStatus,
            pickup: updatedPickup
          };
        }
      }
      return r;
    }));
  };

  // Filter & search records
  const filteredRecords = records.filter(r => {
    const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
    const matchesSearch = !searchQuery || 
      r.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.residue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedRecord = records.find(x => x.id === selectedId) || records[0];

  return (
    <div className="gov-buyback-page">
      {/* HEADER OVERLAY (embedded search box matches Goutam's navbar search) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 26px 20px', borderBottom: '1px solid var(--line)', background: '#fff', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)' }}>
            🌾 Farmer Residue Program
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--ink-400)', marginTop: '2px' }}>
            Manage biomass residue buy-back ledger, DBT disbursements, and procurement logs.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--cream-100)', border: '1px solid var(--line)', borderRadius: '10px', padding: '8px 12px', gap: '8px', width: '320px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px', color: 'var(--ink-400)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search farmer, village, crop…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: 'var(--ink-900)' }}
          />
        </div>
      </div>

      <div style={{ padding: '0 26px' }}>
        {/* STATS STRIP */}
        <section className="stats">
          <div className="stat-card total">
            <div className="top-row">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            <div className="value">{uniqueFarmers}</div>
            <div className="label">Farmers Participating</div>
          </div>
          <div className="stat-card resolved">
            <div className="top-row">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            <div className="value">₹{totalPaid.toLocaleString('en-IN')}</div>
            <div className="label">Paid to Farmers</div>
          </div>
          <div className="stat-card pending">
            <div className="top-row">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
            </div>
            <div className="value">{pendingRequests}</div>
            <div className="label">Requests Pending</div>
          </div>
          <div className="stat-card in-progress">
            <div className="top-row">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="7" width="15" height="13" rx="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M16 11h3l4 4v5h-7"/>
                </svg>
              </div>
            </div>
            <div className="value">{scheduledPickups}</div>
            <div className="label">Pickups Scheduled</div>
          </div>
          <div className="stat-card urgent">
            <div className="top-row">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4"/>
                </svg>
              </div>
            </div>
            <div className="value">₹{avgPayment.toLocaleString('en-IN')}</div>
            <div className="label">Avg. Payment / Farmer</div>
          </div>
        </section>

        {/* WORKSPACE */}
        <section className="residue-workspace">
          <div className="residue-left">
            {/* Recovery Panel */}
            <div className="panel recovery-panel">
              <div className="panel-head">
                <h2>Resource Recovery Overview</h2>
                <span className="count-badge">This month</span>
              </div>
              <div className="panel-body">
                <div className="recovery-flow">
                  <div className="rf-sources">
                    <div className="rf-source organic">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg></div>
                      <div className="lab">🌱 Organic</div>
                      <div className="val">{organicTotal.toFixed(1)} T</div>
                    </div>
                    <div className="rf-source inorganic">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 6"/></svg></div>
                      <div className="lab">♻️ Inorganic</div>
                      <div className="val">{inorganicTotal.toFixed(1)} T</div>
                    </div>
                  </div>
                  <div className="rf-connector">
                    <svg viewBox="0 0 340 60" preserveAspectRatio="none">
                      <path d="M85 0 C 85 30, 170 30, 170 30" fill="none" stroke="var(--organic)" strokeWidth="2"/>
                      <path d="M255 0 C 255 30, 170 30, 170 30" fill="none" stroke="var(--inorganic)" strokeWidth="2"/>
                      <path d="M170 30 L170 55" fill="none" stroke="var(--line)" strokeWidth="2"/>
                      <path d="M162 48 L170 58 L178 48" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="rf-total">
                    <div className="lab">Total Material Recovered</div>
                    <div className="val">{totalMaterial.toFixed(1)} T</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Pipeline Panel */}
            <div className="panel">
              <div className="panel-head">
                <h2>Collection Pipeline</h2>
                <span className="count-badge">Requested → Approved → Collected → Paid</span>
              </div>
              <div className="funnel">
                <div className="funnel-step"><span className="dot" style={{ background: 'var(--ink-400)' }}></span><div className="n">{countRequested}</div><div className="l">Requested</div></div>
                <div className="funnel-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                <div className="funnel-step"><span className="dot" style={{ background: 'var(--amber-500)' }}></span><div className="n">{countApproved}</div><div className="l">Approved</div></div>
                <div className="funnel-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                <div className="funnel-step"><span className="dot" style={{ background: 'var(--inorganic)' }}></span><div className="n">{countCollected}</div><div className="l">Collected</div></div>
                <div className="funnel-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                <div className="funnel-step"><span className="dot" style={{ background: 'var(--green-600)' }}></span><div className="n">{countPaid}</div><div className="l">Paid</div></div>
              </div>
            </div>

            {/* Records Table Panel */}
            <div className="panel records-panel">
              <div className="panel-head">
                <h2>Individual Collection Records</h2>
                <span className="count-badge" id="rb-count">{filteredRecords.length} records</span>
              </div>
              <div className="filters" id="rb-filters">
                {['all', 'requested', 'approved', 'collected', 'paid'].map(filter => (
                  <div 
                    key={filter} 
                    className={`chip ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {STATUS_LABEL[filter] || 'All'}
                  </div>
                ))}
              </div>
              <div className="records-body-wrap">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Crop</th>
                      <th>Residue</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-400)' }}>
                          No buy-back records match filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(r => {
                        const stream = RESIDUE_STREAM[r.residue];
                        const swColor = stream === 'organic' ? 'var(--organic)' : 'var(--inorganic)';
                        return (
                          <tr 
                            key={r.id} 
                            className={r.id === selectedId ? 'selected' : ''}
                            onClick={() => setSelectedId(r.id)}
                          >
                            <td style={{ fontWeight: 600 }}>{r.farmer}</td>
                            <td>{r.crop}</td>
                            <td>
                              <span className="residue-type">
                                <span className="sw" style={{ background: swColor }}></span>
                                {r.residue}
                              </span>
                            </td>
                            <td>{r.qty.toFixed(1)} T</td>
                            <td className="amount">₹{amountFor(r).toLocaleString('en-IN')}</td>
                            <td><span className={`wf-pill ${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column details */}
          <div className="residue-right">
            {/* Rate Card Panel */}
            <div className="panel rate-card">
              <div className="panel-head">
                <h2>Procurement Rate Card</h2>
                <span className="count-badge">Demo</span>
              </div>
              <div className="panel-body">
                <div className="rate-disclaimer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  <span>Demo procurement rates for prototype purposes only — not an official government rate. Actual rates depend on a confirmed implementing partner or scheme.</span>
                </div>
                <div className="rate-row"><div className="rt-name"><span className="sw" style={{ background: 'var(--organic)' }}></span>Rice Straw</div><div className="rt-val">₹1,500 / tonne</div></div>
                <div className="rate-row"><div className="rt-name"><span className="sw" style={{ background: 'var(--organic)' }}></span>Wheat Straw</div><div className="rt-val">₹1,350 / tonne</div></div>
                <div className="rate-row"><div className="rt-name"><span class="sw" style={{ background: 'var(--organic)' }}></span>Sugarcane Trash</div><div className="rt-val">₹1,100 / tonne</div></div>
                <div className="rate-row"><div className="rt-name"><span class="sw" style={{ background: 'var(--inorganic)' }}></span>Agri Plastic Sheet</div><div className="rt-val">₹900 / tonne</div></div>
                <div className="rate-row"><div className="rt-name"><span class="sw" style={{ background: 'var(--inorganic)' }}></span>Irrigation Pipe</div><div className="rt-val">₹750 / tonne</div></div>
              </div>
            </div>

            {/* Detail Inspector Panel */}
            <div className="panel detail-panel">
              {selectedRecord ? (
                <>
                  <div 
                    className="crop-banner" 
                    style={{ 
                      background: `linear-gradient(135deg, ${RESIDUE_STREAM[selectedRecord.residue] === 'organic' ? 'var(--organic)' : 'var(--inorganic)'}, ${RESIDUE_STREAM[selectedRecord.residue] === 'organic' ? '#2e6e1e' : '#1f4d78'})` 
                    }}
                  >
                    <div className="crop-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/>
                      </svg>
                    </div>
                    <span className={`wf-pill ${selectedRecord.status}`} style={{ background: 'rgba(255,255,255,0.85)' }}>{STATUS_LABEL[selectedRecord.status]}</span>
                    <span className="d-id" style={{ background: 'rgba(0,0,0,0.35)', position: 'absolute', top: '14px', right: '14px', color: '#fff', fontSize: '10.5px', fontFamily: 'var(--font-mono)', padding: '4px 8px', borderRadius: '20px' }}>
                      {selectedRecord.id}
                    </span>
                  </div>

                  <div className="d-body">
                    <div className="d-title">{selectedRecord.farmer}</div>
                    <div className="d-desc">{selectedRecord.crop} farmer · {selectedRecord.village}</div>

                    <div className="d-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <div><div className="l">Pickup</div><div className="v">{selectedRecord.pickup}</div></div>
                    </div>
                    <div className="d-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <div><div className="l">Requested</div><div className="v">{selectedRecord.requested}</div></div>
                    </div>

                    <div className="calc-box">
                      <div className="row"><span>Quantity</span><span className="v">{selectedRecord.qty.toFixed(1)} tonnes</span></div>
                      <div className="row"><span>Rate (demo)</span><span className="v">₹{RATES[selectedRecord.residue].toLocaleString('en-IN')} / tonne</span></div>
                      <div className="row total"><span>Estimated Payment</span><span className="v">₹{amountFor(selectedRecord).toLocaleString('en-IN')}</span></div>
                    </div>

                    <div className="assign-row">
                      <button className="btn btn-ghost" onClick={() => alert(`Details for record ${selectedRecord.id}`)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        Open Full Record
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleAdvanceStatus} 
                        disabled={selectedRecord.status === 'paid'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Advance Status
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2C7 6 6 10 6 13a6 6 0 0 0 12 0c0-3-1-7-6-11z"/></svg>
                  <p>Select a record to view farmer details and payment breakdown.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
