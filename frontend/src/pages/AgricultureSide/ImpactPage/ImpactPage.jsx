import React, { useEffect, useState } from "react";
import "./ImpactPage.css";
import { incidentsApi } from "../../../services/incidentsApi";
import { agricultureApi } from "../../../services/agricultureApi";

export default function ImpactPage() {
  // Reveal animations mount flag
  const [revealVisible, setRevealVisible] = useState(false);

  // Count up animation states
  const [wasteCount, setWasteCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [residueCount, setResidueCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [villagesCount, setVillagesCount] = useState(0);

  // Chart interactivity states
  const [activeSeries, setActiveSeries] = useState("waste");

  // Toast feedback states
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState(null);

  // Data mapping for Monthly Trend Chart
  const chartLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [chartDataState, setChartDataState] = useState({
    waste: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    residue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    complaints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    farmers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const chartUnits = {
    waste: "kg",
    residue: "kg",
    complaints: "resolved",
    farmers: "participants",
  };
  const chartNames = {
    waste: "Waste collected",
    residue: "Crop residue collected",
    complaints: "Complaints resolved",
    farmers: "Farmers participating",
  };

  const values = chartDataState[activeSeries];
  const maxVal = Math.max(...values) || 1;
  const peakIndex = values.indexOf(maxVal);

  useEffect(() => {
    async function loadData() {
      try {
        const compData = await incidentsApi.getAll();
        const pickData = await agricultureApi.getPickups();

        const comps = compData || [];
        const picks = pickData || [];

        const resolvedCount = comps.filter(c => c.status === 'resolved' || c.status === 'closed').length;
        const wasteCountVal = resolvedCount * 50; // 50kg per resolved complaint
        
        const residueCountVal = picks
          .filter(p => p.status === 'collected' || p.status === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.weight_kg || 0), 0);

        const paymentsCountVal = picks
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0);

        const uniqueVillages = new Set([
          ...picks.map(p => p.location_name || 'kanas'),
          ...comps.map(c => c.representative_location?.name || 'BMC Ward 24')
        ].filter(Boolean));
        const villagesCountVal = uniqueVillages.size || 1;

        // Populate monthly trends
        const monthlyWaste = Array(12).fill(0);
        const monthlyResidue = Array(12).fill(0);
        const monthlyComplaints = Array(12).fill(0);
        const monthlyFarmers = Array(12).fill(0);

        comps.forEach(c => {
          const m = new Date(c.created_at || Date.now()).getMonth();
          monthlyComplaints[m]++;
          if (c.status === 'resolved' || c.status === 'closed') {
            monthlyWaste[m] += 50;
          }
        });

        const activeFarmersByMonth = Array(12).fill(null).map(() => new Set());
        picks.forEach(p => {
          const d = new Date(p.created_at || Date.now());
          const m = d.getMonth();
          const isCollectedOrPaid = p.status === 'collected' || p.status === 'paid';
          if (isCollectedOrPaid) {
            monthlyResidue[m] += parseFloat(p.weight_kg || 0);
          }
          if (p.farmer_name) {
            activeFarmersByMonth[m].add(p.farmer_name);
          }
        });

        for (let i = 0; i < 12; i++) {
          monthlyFarmers[i] = activeFarmersByMonth[i].size;
        }

        setChartDataState({
          waste: monthlyWaste,
          residue: monthlyResidue,
          complaints: monthlyComplaints,
          farmers: monthlyFarmers
        });

        // Animate from 0 to targets
        const duration = 900;
        const start = performance.now();
        let animId;

        const step = (timestamp) => {
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

          setWasteCount(eased * wasteCountVal);
          setComplaintsCount(eased * resolvedCount);
          setResidueCount(eased * residueCountVal);
          setPaymentsCount(eased * paymentsCountVal);
          setVillagesCount(eased * villagesCountVal);

          if (progress < 1) {
            animId = requestAnimationFrame(step);
          }
        };

        animId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animId);
      } catch (err) {
        console.error("Error loading impact data:", err);
      }
    }
    loadData();
    setRevealVisible(true);
  }, []);

  // Format counter numeric values
  const formatMetric = (val, type) => {
    const value = Math.round(val);
    if (type === "ton") return (value / 1000).toFixed(1) + " T";
    if (type === "kg") return value.toLocaleString("en-IN") + " KG";
    if (type === "money") {
      if (value >= 100000) return "₹" + (value / 100000).toFixed(2) + " L";
      return "₹" + value.toLocaleString("en-IN");
    }
    return value.toLocaleString("en-IN");
  };

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    const timer = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
    setToastTimer(timer);
  };

  // Export report logic
  const handleExport = () => {
    const reportText = [
      "GramSamridhi — SYSTEM IMPACT REPORT",
      "Swach Gram • Samridh Kisan • Satat Vikas",
      "",
      "Ward 24 · Rourkela Municipal Corp.",
      "",
      "KEY OUTCOMES",
      "Waste collected: 2.4 T",
      "Complaints resolved: 156",
      "Crop residue collected: 860 KG",
      "Farmer payments processed: ₹1.84 L",
      "Villages reached: 18",
      "",
      "This prototype uses demonstration data. Connect these fields to live jurisdiction-level records for deployment.",
    ].join("\n");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GramSamridhi-impact-report.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    triggerToast("Report downloaded successfully!");
  };

  return (
    <div className="impact-page">
      <div className="breadcrumb">
        <a href="#">Home</a>
        <span>/</span>
        <strong>Impact</strong>
      </div>

      <section className={`page-head reveal ${revealVisible ? "visible" : ""}`}>
        <div>
          <p className="eyebrow">GramSamridhi · SYSTEM IMPACT</p>
          <h1>Measuring change across every community.</h1>
          <p>
            See how citizens, farmers and government teams are working through
            one platform to create cleaner communities, stronger farmer
            participation and sustainable rural development.
          </p>
          <div className="tagline">
            <span>Swach Gram</span>
            <i>•</i>
            <span>Samridh Kisan</span>
            <i>•</i>
            <span>Satat Vikas</span>
          </div>
        </div>
        <button className="export-btn" onClick={handleExport}>
          ↓ &nbsp; Export report
        </button>
      </section>

      <section
        className={`impact-hero reveal ${revealVisible ? "visible" : ""}`}
      >
        <div className="hero-copy">
          <p className="eyebrow light">
            FROM LOCAL ACTION TO MEASURABLE OUTCOMES
          </p>
          <h2>
            Three pillars.
            <br />
            <span>One connected system.</span>
          </h2>
          <p>
            GramSamridhi links a citizen's report or a farmer's residue request
            to the people and processes that can act on it — and records the
            result.
          </p>
          <div className="hero-pills">
            <span>Citizen reports</span>
            <span>Farmer participation</span>
            <span>Government response</span>
          </div>
        </div>
        <div
          className="hero-orbit"
          aria-label="GramSamridhi three-pillar model"
        >
          <div className="orbit-line"></div>
          <div className="orbit-node node-one">
            <b>
              SWACH
              <br />
              GRAM
            </b>
            <small>Cleaner villages</small>
          </div>
          <div className="orbit-node node-two">
            <b>
              SAMRIDH
              <br />
              KISAN
            </b>
            <small>Farmer support</small>
          </div>
          <div className="orbit-node node-three">
            <b>
              SATAT
              <br />
              VIKAS
            </b>
            <small>Resource recovery</small>
          </div>
          <div className="orbit-center">
            <strong>GS</strong>
            <span>impact</span>
          </div>
        </div>
      </section>

      <section
        className={`metric-grid reveal ${revealVisible ? "visible" : ""}`}
        aria-label="Key system metrics"
      >
        <article className="metric">
          <div className="metric-icon green">♻</div>
          <strong>{formatMetric(wasteCount, "ton")}</strong>
          <b>Waste collected</b>
          <small>Reported and recovered through local pathways</small>
        </article>
        <article className="metric">
          <div className="metric-icon gold">◌</div>
          <strong>{formatMetric(complaintsCount)}</strong>
          <b>Complaints resolved</b>
          <small>Citizen issues closed by responsible teams</small>
        </article>
        <article className="metric">
          <div className="metric-icon green">⌁</div>
          <strong>{formatMetric(residueCount, "kg")}</strong>
          <b>Residue collected</b>
          <small>Crop residue routed away from burning</small>
        </article>
        <article className="metric">
          <div className="metric-icon gold">₹</div>
          <strong>{formatMetric(paymentsCount, "money")}</strong>
          <b>Farmer payments</b>
          <small>Processed through residue collection</small>
        </article>
        <article className="metric">
          <div className="metric-icon green">⌂</div>
          <strong>{formatMetric(villagesCount)}</strong>
          <b>Villages reached</b>
          <small>Communities participating across the network</small>
        </article>
      </section>

      <section
        className={`pillar-section reveal ${revealVisible ? "visible" : ""}`}
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">THE CORE OF GramSamridhi</p>
            <h2>Three pillars. One mission.</h2>
          </div>
          <span className="section-note">
            Measured through platform activity
          </span>
        </div>
        <div className="pillar-grid">
          <article className="pillar pillar-green">
            <div class="pillar-top">
              <span className="pillar-number">01</span>
              <span className="pillar-icon">♻</span>
            </div>
            <p className="pillar-label">SWACH GRAM</p>
            <h3>Cleaner communities</h3>
            <p>
              AI-assisted waste reporting helps authorities identify, prioritize
              and resolve local waste issues.
            </p>
            <div className="mini-stats">
              <div>
                <strong>156</strong>
                <span>resolved</span>
              </div>
              <div>
                <strong>2.4 T</strong>
                <span>collected</span>
              </div>
              <div>
                <strong>24</strong>
                <span>critical handled</span>
              </div>
            </div>
            <div className="flow">
              <span>Reported</span>
              <i>→</i>
              <span>AI analysed</span>
              <i>→</i>
              <span>Assigned</span>
              <i>→</i>
              <span>Resolved</span>
            </div>
          </article>

          <article className="pillar pillar-gold">
            <div class="pillar-top">
              <span className="pillar-number">02</span>
              <span className="pillar-icon">⌁</span>
            </div>
            <p className="pillar-label">SAMRIDH KISAN</p>
            <h3>Better support for farmers</h3>
            <p>
              Farmers can register crop residue for authorized collection,
              receive payment and access digital support.
            </p>
            <div className="mini-stats">
              <div>
                <strong>124</strong>
                <span>farmers</span>
              </div>
              <div>
                <strong>860 kg</strong>
                <span>residue</span>
              </div>
              <div>
                <strong>₹1.84 L</strong>
                <span>payments</span>
              </div>
            </div>
            <div className="flow">
              <span>Registered</span>
              <i>→</i>
              <span>Collected</span>
              <i>→</i>
              <span>Paid</span>
            </div>
          </article>

          <article className="pillar pillar-cream">
            <div class="pillar-top">
              <span className="pillar-number">03</span>
              <span className="pillar-icon">◒</span>
            </div>
            <p className="pillar-label">SATAT VIKAS</p>
            <h3>Sustainable rural development</h3>
            <p>
              Waste and agricultural residue are redirected toward reuse,
              recycling and composting instead of unmanaged disposal.
            </p>
            <div className="mini-stats">
              <div>
                <strong>680 kg</strong>
                <span>compost</span>
              </div>
              <div>
                <strong>540 kg</strong>
                <span>recycled</span>
              </div>
              <div>
                <strong>0.86 T</strong>
                <span>CO₂e est.</span>
              </div>
            </div>
            <div className="flow">
              <span>Collect</span>
              <i>→</i>
              <span>Recover</span>
              <i>→</i>
              <span>Reuse</span>
            </div>
          </article>
        </div>
      </section>

      <section
        className={`two-column reveal ${revealVisible ? "visible" : ""}`}
      >
        <article className="panel governance">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">GOVERNMENT IMPACT</p>
              <h2>From report to response.</h2>
            </div>
            <span className="status-chip">Operational view</span>
          </div>
          <p className="section-copy">
            Jurisdiction-based dashboards help officials see what needs
            attention, assign work and monitor resolution.
          </p>
          <div className="gov-grid">
            <div>
              <strong>204</strong>
              <span>Reports received</span>
            </div>
            <div>
              <strong>24</strong>
              <span>Critical prioritized</span>
            </div>
            <div>
              <strong>18 hrs</strong>
              <span>Avg. resolution time</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Sanitation teams active</span>
            </div>
            <div>
              <strong>32</strong>
              <span>Farmer complaints processed</span>
            </div>
            <div>
              <strong>48</strong>
              <span>Residue requests completed</span>
            </div>
          </div>
        </article>

        <article className="panel citizen">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">CITIZEN IMPACT</p>
              <h2>Every report becomes traceable.</h2>
            </div>
          </div>
          <div className="citizen-flow">
            <div>
              <span className="step-no">01</span>
              <div>
                <strong>Citizen reports</strong>
                <small>Photo + location + description</small>
              </div>
            </div>
            <i>↓</i>
            <div>
              <span className="step-no">02</span>
              <div>
                <strong>AI classifies</strong>
                <small>Waste type + severity</small>
              </div>
            </div>
            <i>↓</i>
            <div>
              <span className="step-no">03</span>
              <div>
                <strong>Authority acts</strong>
                <small>Assign → clean → resolve</small>
              </div>
            </div>
          </div>
          <div className="citizen-result">
            <strong>82%</strong>
            <span>resolved within target time</span>
            <b>24 critical issues handled</b>
          </div>
        </article>
      </section>

      <section
        className={`two-column reveal ${revealVisible ? "visible" : ""}`}
      >
        <article className="panel farmer-impact">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">FARMER IMPACT</p>
              <h2>Residue becomes an opportunity.</h2>
            </div>
          </div>
          <div className="farmer-metrics">
            <div>
              <strong>124</strong>
              <span>Farmers participating</span>
            </div>
            <div>
              <strong>860 kg</strong>
              <span>Residue collected</span>
            </div>
            <div>
              <strong>₹1.84 L</strong>
              <span>Payments processed</span>
            </div>
            <div>
              <strong>320 kg</strong>
              <span>Compost delivered</span>
            </div>
          </div>
          <div className="farmer-tools">
            <span>AI Farming Assistant</span>
            <span>Government Schemes</span>
            <span>Farmer Complaint Box</span>
          </div>
        </article>

        <article className="panel environment">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">ENVIRONMENTAL OUTCOMES</p>
              <h2>Recovery with a visible result.</h2>
            </div>
          </div>
          <div className="env-list">
            <div>
              <span className="env-icon">♻</span>
              <div>
                <strong>2.4 T</strong>
                <b>Waste diverted</b>
                <small>Redirected from unmanaged disposal</small>
              </div>
            </div>
            <div>
              <span className="env-icon">◌</span>
              <div>
                <strong>680 kg</strong>
                <b>Compost generated</b>
                <small>Organic material returned to soil use</small>
              </div>
            </div>
            <div>
              <span className="env-icon">⌁</span>
              <div>
                <strong>540 kg</strong>
                <b>Material recycled</b>
                <small>Recovered for productive reuse</small>
              </div>
            </div>
            <div>
              <span className="env-icon gold">≈</span>
              <div>
                <strong>0.86 T</strong>
                <b>CO₂e avoided</b>
                <small>Estimated from recovery pathways</small>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section
        className={`panel journey reveal ${revealVisible ? "visible" : ""}`}
      >
        <div className="section-head compact">
          <div>
            <p className="eyebrow">HOW THE SYSTEM CREATES IMPACT</p>
            <h2>From local action to measurable change.</h2>
          </div>
          <span className="section-note">Two connected pathways</span>
        </div>
        <div className="journey-grid">
          <div className="journey-card">
            <span className="journey-tag">CITIZEN PATH</span>
            <div className="journey-line">
              <span>Citizen</span>
              <i>→</i>
              <span>Waste photo</span>
              <i>→</i>
              <span>AI analysis</span>
              <i>→</i>
              <span>Authority</span>
              <i>→</i>
              <span>Sanitation</span>
              <i>→</i>
              <strong>Resolved</strong>
            </div>
          </div>
          <div className="journey-card">
            <span className="journey-tag gold">FARMER PATH</span>
            <div className="journey-line">
              <span>Farmer</span>
              <i>→</i>
              <span>Residue</span>
              <i>→</i>
              <span>Collection</span>
              <i>→</i>
              <span>Payment</span>
              <i>→</i>
              <strong>Resource recovery</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`panel activity-chart-grid reveal ${revealVisible ? "visible" : ""}`}
      >
        <div className="activity">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h2>What changed recently.</h2>
            </div>
          </div>
          <ul className="activity-list">
            <li>
              <span className="activity-dot green"></span>
              <div>
                <strong>Crop residue collected</strong>
                <small>Kanas Village · 650 kg</small>
              </div>
              <time>Today</time>
            </li>
            <li>
              <span className="activity-dot gold"></span>
              <div>
                <strong>Waste issue resolved</strong>
                <small>Sector 5 · Garbage accumulation</small>
              </div>
              <time>Yesterday</time>
            </li>
            <li>
              <span className="activity-dot green"></span>
              <div>
                <strong>Farmer payment processed</strong>
                <small>Kanas Village · ₹12,500</small>
              </div>
              <time>2 days ago</time>
            </li>
            <li>
              <span className="activity-dot cream"></span>
              <div>
                <strong>Compost delivered</strong>
                <small>Kanas Village · 320 kg</small>
              </div>
              <time>4 days ago</time>
            </li>
          </ul>
        </div>

        <div className="trend">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">IMPACT TREND</p>
              <h2>Monthly platform activity.</h2>
            </div>
          </div>
          <div
            className="chart-controls"
            role="group"
            aria-label="Impact trend"
          >
            {["waste", "residue", "complaints", "farmers"].map((key) => (
              <button
                key={key}
                className={`chart-btn ${activeSeries === key ? "active" : ""}`}
                onClick={() => {
                  setActiveSeries(key);
                  triggerToast(`Viewing monthly ${key} trends`);
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="chart" aria-label="Monthly impact chart">
            {chartLabels.map((label, idx) => {
              const heightPercent = Math.max((values[idx] / maxVal) * 100, 5);
              const isPeak = idx === peakIndex;
              return (
                <div key={label} className="bar">
                  <div
                    className={`bar-fill ${isPeak ? "peak" : ""}`}
                    data-tip={`${label} · ${values[idx]} ${chartUnits[activeSeries]}`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-foot">
            <span>
              {chartNames[activeSeries]} · {chartUnits[activeSeries]}
            </span>
            <span>
              Peak: {chartLabels[peakIndex]} ({values[peakIndex]}{" "}
              {chartUnits[activeSeries]})
            </span>
          </div>
        </div>
      </section>

      <section
        className={`outcome-strip reveal ${revealVisible ? "visible" : ""}`}
      >
        <div>
          <span>01</span>
          <strong>Cleaner villages</strong>
          <small>More waste issues identified and resolved.</small>
        </div>
        <div>
          <span>02</span>
          <strong>Better farmer participation</strong>
          <small>An alternative to burning crop residue.</small>
        </div>
        <div>
          <span>03</span>
          <strong>Faster government response</strong>
          <small>Prioritization and routing make action traceable.</small>
        </div>
        <div>
          <span>04</span>
          <strong>Resource recovery</strong>
          <small>Waste becomes material, compost or farm value.</small>
        </div>
      </section>

      <footer className="footer-note">
        <div className="footer-mark">GS</div>
        <div>
          <strong>GramSamridhi</strong>
          <span>Swach Gram • Samridh Kisan • Satat Vikas</span>
        </div>
        <p>
          Impact data shown here is prototype data and can be connected to live
          jurisdiction-level records.
        </p>
      </footer>

      {toastVisible && (
        <div className="toast show" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
