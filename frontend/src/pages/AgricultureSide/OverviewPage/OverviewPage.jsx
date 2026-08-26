import React, { useState, useEffect } from 'react';
import './OverviewPage.css';
import { incidentsApi } from '../../../services/incidentsApi';
import { agricultureApi } from '../../../services/agricultureApi';
import heroImg from '../../../assets/gramsamridhi_hero.jpg';

export default function OverviewPage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    async function loadData() {
      try {
        const comps = await incidentsApi.getAll();
        const picks = await agricultureApi.getPickups();
        if (comps) setComplaints(comps);
        if (picks) setPickups(picks);
      } catch (err) {
        console.error("Error loading Overview metrics:", err);
      }
    }
    loadData();
  }, []);

  const username = user?.username || 'devinder_singh';
  const isDemoDevinder = username.toLowerCase() === 'devinder_singh';
  const name = isDemoDevinder ? 'Devinder Singh' : username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Compute dynamic stats
  const totalOrganicAgricultures = pickups
    .filter(p => p.status === 'collected' || p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.weight_kg || 0), 0) / 1000;

  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const totalOrganicSWC = (resolvedCount * 50) / 1000; // 50kg per complaint

  const totalOrganic = (totalOrganicAgricultures + totalOrganicSWC).toFixed(1);
  const totalRecyclable = (resolvedCount * 25 / 1000).toFixed(1); // Recyclable inorganic guess

  const residueSold = totalOrganicAgricultures.toFixed(1);

  const farmerEarnings = pickups
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0);

  const activeContributors = new Set([
    ...pickups.map(p => p.agriculture_name),
    ...complaints.map(c => c.citizen_name)
  ].filter(Boolean)).size || 38;

  const displayEarnings = farmerEarnings > 0 ? farmerEarnings : 128450;

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLoading(true);
    setChatResponse('');
    try {
      const res = await agricultureApi.askAssistant(chatInput);
      setChatResponse(res.response || "No response received.");
    } catch (err) {
      setChatResponse("Error connecting to AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (questionText) => {
    setChatInput(questionText);
  };

  return (
    <div className="content" id="overview">
      <div className="crumb">⌖ Village Kelejora, Ward 14, Bhubaneshwar Municipal Corp.</div>
      <h1>Welcome back, {name}! 👋</h1>
      <p className="subtitle">Here's your village activity, earnings and sustainability impact.</p>

      <div className="pillars">
        <span><i className="green-dot"></i> Swachh Gram</span>
        <span><i className="gold-dot"></i> Samridh Kisan</span>
        <span><i className="blue-dot"></i> Satat Vikas</span>
      </div>

      <section className="stats">
        <article className="stat">
          <div className="stat-top">
            <span className="metric-icon green">♻</span>
            <em>↑ 18%</em>
          </div>
          <strong>{totalOrganic} T</strong>
          <label>Waste Diverted</label>
          <small>This month</small>
        </article>
        <article className="stat">
          <div className="stat-top">
            <span className="metric-icon gold">♨</span>
            <em>↑ 9%</em>
          </div>
          <strong>{residueSold} T</strong>
          <label>Crop Residue Sold</label>
          <small>This month</small>
        </article>
        <article className="stat">
          <div className="stat-top">
            <span className="metric-icon blue">₹</span>
            <em>↑ 22%</em>
          </div>
          <strong>₹{displayEarnings.toLocaleString('en-IN')}</strong>
          <label>Earnings</label>
          <small>This month</small>
        </article>
        <article className="stat">
          <div className="stat-top">
            <span className="metric-icon green">◇</span>
            <em>↑ 11%</em>
          </div>
          <strong>24</strong>
          <label>Items Reused</label>
          <small>This month</small>
        </article>
        <article className="stat">
          <div className="stat-top">
            <span className="metric-icon gold">⌁</span>
            <em>↑ 4 pts</em>
          </div>
          <strong>86%</strong>
          <label>Community Impact</label>
          <small>Contribution score</small>
        </article>
      </section>

      <section className="hero-row">
        <article className="hero">
          <div className="hero-copy">
            <div className="eyebrow">CIRCULAR VILLAGE ECONOMY</div>
            <h2>Turn local resources into<br />local opportunity.</h2>
            <p>Report waste, sell crop residue, share surplus items and track the impact you create in your village.</p>
            <div className="hero-buttons">
              <button className="btn primary" onClick={() => onNavigate('swc')}>△ &nbsp;Report an Issue</button>
              <button className="btn" onClick={() => onNavigate('residue')}>♨ &nbsp;Sell Crop Residue</button>
              <button className="btn" onClick={() => onNavigate('surplus')}>♻ &nbsp;Open Surplus Hub</button>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroImg} alt="Community waste collection and recycling" />
            <span className="live">● Community in action</span>
            <div className="image-chips">
              <span><b>Cleaner Village</b><small>Better environment</small></span>
              <span><b>Stronger Farmers</b><small>More earnings</small></span>
              <span><b>Sustainable Future</b><small>Long-term impact</small></span>
            </div>
          </div>
        </article>

        <article className="card snapshot">
          <div className="card-head">
            <h3>Village Snapshot</h3>
            <span>This month</span>
          </div>
          <div className="snapshot-grid">
            <div><strong>12.4 T</strong><small>Waste collected</small></div>
            <div><strong>3.6 T</strong><small>Crop residue recovered</small></div>
            <div><strong>{activeContributors}</strong><small>Active contributors</small></div>
            <div><strong>84</strong><small>Items reused</small></div>
          </div>
          <div className="snapshot-art"></div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="card collection" id="collection" onClick={() => onNavigate('schedule')} style={{ cursor: 'pointer' }}>
          <div className="card-head">
            <h3>Next Collection</h3>
            <span className="success">Scheduled</span>
          </div>
          <div className="collection-main">
            <div className="big-icon">▣</div>
            <div>
              <b>Organic Waste</b>
              <p>Tomorrow · 8:30 AM</p>
              <small>Pickup zone: Village Kelejora</small>
            </div>
          </div>
          <div className="progress"><span></span></div>
        </article>

        <article className="card earnings" id="payments" onClick={() => onNavigate('paymentHistory')} style={{ cursor: 'pointer' }}>
          <div className="card-head">
            <h3>Your Earnings</h3>
            <span className="trend">↑ 16%</span>
          </div>
          <div className="earning-main">
            <strong>₹{(displayEarnings / 10.3).toFixed(0).toLocaleString('en-IN')}</strong>
            <small>This month</small>
          </div>
          <div className="earning-cols">
            <div><b>₹2,150</b><small>Pending</small></div>
            <div><b>₹10,300</b><small>Completed</small></div>
          </div>
        </article>

        <article className="card impact" id="impact" onClick={() => onNavigate('impact')} style={{ cursor: 'pointer' }}>
          <div className="card-head">
            <h3>Impact So Far</h3>
          </div>
          <div className="impact-items">
            <div><span>♻</span><b>Clean Villages</b></div>
            <div><span>♧</span><b>Healthy Farmers</b></div>
            <div><span>◎</span><b>Green Future</b></div>
          </div>
        </article>
      </section>

      <section className="three-grid">
        <article className="card activity" id="activity" onClick={() => onNavigate('activity')} style={{ cursor: 'pointer' }}>
          <div className="card-head">
            <h3>Recent Activity</h3>
            <span style={{ fontSize: '11px', color: 'var(--green)' }}>View all →</span>
          </div>
          <div className="activity-row">
            <span className="activity-icon blue">↻</span>
            <div>
              <b>Surplus item sold</b>
              <small>Surplus Hub · Yesterday</small>
            </div>
            <strong>₹850</strong>
          </div>
          <div className="activity-row">
            <span className="activity-icon green">₹</span>
            <div>
              <b>Payment received</b>
              <small>Residue buy-back · Yesterday</small>
            </div>
            <strong>₹525</strong>
          </div>
          <div className="activity-row">
            <span className="activity-icon gold">▣</span>
            <div>
              <b>Collection scheduled</b>
              <small>Organic waste · Tomorrow</small>
            </div>
            <strong>—</strong>
          </div>
        </article>

        <article className="card" id="leaderboard" onClick={() => onNavigate('leaderboard')} style={{ cursor: 'pointer' }}>
          <div className="card-head">
            <h3>Village Leaderboard</h3>
          </div>
          <div className="rank you">
            <b>1</b>
            <span>{name} <em>(You)</em></span>
            <strong>1,240 pts</strong>
          </div>
          <div className="rank">
            <b>2</b>
            <span>Sunita Devi</span>
            <strong>1,110 pts</strong>
          </div>
          <div className="rank">
            <b>3</b>
            <span>Mohan Kumar</span>
            <strong>980 pts</strong>
          </div>
          <span className="card-link">View Leaderboard →</span>
        </article>

        <article className="card" id="report">
          <div className="card-head">
            <h3>Ask KrishiSahyog</h3>
          </div>
          <p className="assistant">
            {chatResponse || "Hi Ramesh! I can help with waste reporting, crop residue, collection schedules, payments and Surplus Hub."}
          </p>
          <div className="chips">
            <button type="button" onClick={() => handleChipClick("How do I sell my crop residue?")}>How do I sell my crop residue?</button>
            <button type="button" onClick={() => handleChipClick("When is my next collection?")}>When is my next collection?</button>
            <button type="button" onClick={() => handleChipClick("What can I put on Surplus Hub?")}>What can I put on Surplus Hub?</button>
          </div>
          <form onSubmit={handleChatSubmit} className="ask">
            <input 
              id="question" 
              placeholder="Type your question..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
            />
            <button id="send" type="submit">➜</button>
          </form>
        </article>
      </section>
    </div>
  );
}
