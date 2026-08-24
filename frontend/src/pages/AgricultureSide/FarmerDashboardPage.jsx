import React, { useState } from 'react';
import './FarmerDashboardPage.css';

export default function FarmerDashboardPage({ onNavigate }) {
  const [residueDiverted, setResidueDiverted] = useState(1240);
  const [pickupScheduled, setPickupScheduled] = useState(650);
  const [compostCredit, setCompostCredit] = useState(330);
  const [compostReceived, setCompostReceived] = useState(320);

  // Modal and toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compostRequestQty, setCompostRequestQty] = useState(100);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Form states
  const [residueType, setResidueType] = useState('Paddy straw');
  const [residueQty, setResidueQty] = useState(500);

  // AI Chat Bot KrishiSahyog state
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCompostRequestSubmit = (e) => {
    e.preventDefault();
    if (compostRequestQty > compostCredit) {
      triggerToast('Requested quantity exceeds available credit!');
      return;
    }
    setCompostCredit(prev => prev - compostRequestQty);
    setCompostReceived(prev => prev + Number(compostRequestQty));
    setIsModalOpen(false);
    triggerToast(`Compost request for ${compostRequestQty} kg submitted successfully!`);
  };

  const handlePickupRequest = (e) => {
    e.preventDefault();
    setPickupScheduled(prev => prev + Number(residueQty));
    triggerToast(`Residue pickup request for ${residueQty} kg of ${residueType} submitted!`);
  };

  // AI assistant responses
  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('मिट्टी') || q.includes('कम्पोस्ट')) {
      return 'कम्पोस्ट खाद जैविक कार्बन बढ़ाती है, जल धारण क्षमता में सुधार करती है, और यूरिया/DAP की लागत को कम करती है। आपके क्रेडिट को रिडीम करने के लिए "कम्पोस्ट का अनुरोध करें" पर क्लिक करें।';
    }
    if (q.includes('धान') || q.includes('अवशेष') || q.includes('पराली')) {
      return 'पराली जलाने के बजाय उसे गीला कम्पोस्ट बनाकर मिट्टी में मिलाएं या हमारे पिकअप सिस्टम द्वारा रीसायकल करवाएं। इससे हवा प्रदूषित नहीं होगी और आपको खाद क्रेडिट मिलेगा।';
    }
    if (q.includes('irrigate') || q.includes('irrigation') || q.includes('पानी')) {
      return 'Paddy requires saturation during tillering and flowering. Based on Karnal weather forecast, light rain is expected on Thursday, so you may delay manual irrigation by 24 hours.';
    }
    if (q.includes('green manure') || q.includes('dhaincha') || q.includes('खाद')) {
      return 'Dhaincha (Sesbania aculeata) is highly recommended. Sow it in May and plough it back after 40-50 days to add ~80 kg nitrogen/ha.';
    }
    return 'Excellent question! In the Karnal region, crop residue recycling is highly active. Avoid stubble burning and contact NGO coordinators at 1800-419-5888.';
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatResponse(getAIResponse(chatInput));
  };

  const handlePromptClick = (promptText) => {
    setChatInput(promptText);
    setChatResponse(getAIResponse(promptText));
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setChatInput('सुन रहा हूँ... बोलिए');
    setTimeout(() => {
      setIsListening(false);
      const query = 'धान का अवशेष कैसे संभालें?';
      setChatInput(query);
      setChatResponse(getAIResponse(query));
    }, 2000);
  };

  return (
    <div className="farmer-dashboard-container">
      {/* HERO CARD */}
      <section className="hero-card" aria-label="Farm overview">
        <div className="hero-image"></div>
        <div className="hero-overlay"></div>

        <div className="hero-copy">
          <span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>CIRCULAR FARMING</span>
          <h2>Turn crop residue<br/><span>into a valuable resource.</span></h2>
          <p>Avoid burning. Request collection, earn compost credits and improve your soil organic carbon.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#requestPickupForm" onClick={(e) => {
              e.preventDefault();
              document.getElementById('requestPickupForm')?.scrollIntoView({ behavior: 'smooth' });
            }}>Request pickup <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></a>
            <a className="outline-button" href="#assistant" onClick={(e) => {
              e.preventDefault();
              document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' });
            }}>Ask KrishiSahyog <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5V6a2 2 0 0 1 2-2h13.5v14H7a2 2 0 0 0-2 2Z"/><path d="M6 17.5h13.5"/><path d="M8 8h9M8 11.2h9"/></svg></a>
          </div>
        </div>

        <div className="pickup-panel">
          <div className="panel-label">
            <span>◉</span> CURRENT PICKUP 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', width: '15px', height: '15px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <small>Paddy straw</small>
          <strong>{pickupScheduled} kg</strong>
          <div className="panel-divider"></div>
          <div className="pickup-meta"><span className="status-dot"></span><b>Pickup scheduled</b></div>
          <div className="pickup-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg> 
            Tomorrow, 09:00 – 11:00 AM
          </div>
          <button className="panel-button" onClick={() => onNavigate('swc')}>
            Track collection 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <div className="benefits">
          <div><span className="benefit-icon">🌱</span><div><b>No burning</b><small>Cleaner air</small></div></div>
          <div><span className="benefit-icon">🌾</span><div><b>More compost</b><small>Better soil</small></div></div>
          <div><span className="benefit-icon">🪙</span><div><b>Less cost</b><small>Higher yield</small></div></div>
          <div><span className="benefit-icon">🤝</span><div><b>Better future</b><small>Sustainable farming</small></div></div>
        </div>
      </section>

      {/* METRICS */}
      <section className="metrics" aria-label="Farm metrics">
        <article>
          <span className="metric-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg>
          </span>
          <div>
            <b>{residueDiverted.toLocaleString()} kg</b>
            <small>Residue diverted</small>
          </div>
          <span className="metric-badge green">This season</span>
        </article>

        <article>
          <span className="metric-icon gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </span>
          <div>
            <b>{pickupScheduled} kg</b>
            <small>Pickup scheduled</small>
          </div>
          <span className="metric-badge gold">Tomorrow</span>
        </article>

        <article>
          <span className="metric-icon brown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z"/><path d="M12 21v-7"/></svg>
          </span>
          <div>
            <b>{compostCredit} kg</b>
            <small>Compost credit</small>
          </div>
          <span className="metric-badge green">Available</span>
        </article>

        <article>
          <span className="metric-icon mint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          <div>
            <b>{compostReceived} kg</b>
            <small>Compost received</small>
          </div>
          <span className="metric-badge green">This season</span>
        </article>
      </section>

      {/* MAIN GRID */}
      <section className="main-grid">
        {/* KRISHISAHYOG CHATBOT CARD */}
        <article className="card assistant-card" id="assistant">
          <div className="card-top green-top">
            <div>
              <span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>YOUR FARM COMPANION</span>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                KrishiSahyog 
                <span className="verified">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </h2>
              <p>Ask about crops, residue, soil health or organic practices.</p>
            </div>
            <span className="bot-orb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg></span>
          </div>

          <div className="quick-prompts">
            <button type="button" onClick={() => handlePromptClick('मेरी मिट्टी के लिए कम्पोस्ट?')}>मेरी मिट्टी के लिए कम्पोस्ट?</button>
            <button type="button" onClick={() => handlePromptClick('धान का अवशेष कैसे संभालें?')}>धान का अवशेष कैसे संभालें?</button>
            <button type="button" onClick={() => handlePromptClick('When should I irrigate?')}>When should I irrigate?</button>
            <button type="button" onClick={() => handlePromptClick('Best green manure for paddy?')}>Best green manure for paddy?</button>
          </div>

          <form className="chat-entry" onSubmit={handleChatSubmit}>
            <button 
              type="button" 
              className={`mic-button ${isListening ? 'listening' : ''}`} 
              onClick={handleVoiceInput}
              aria-label="Use voice input"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </button>
            <input 
              aria-label="Ask KrishiSahyog" 
              placeholder="Ask your question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              autoComplete="off"
            />
            <button className="send-button" aria-label="Send question">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>

          {chatResponse && (
            <div className="chat-response-wrap">
              <span className="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg></span>
              <div className="chat-response" aria-live="polite">
                {chatResponse}
              </div>
            </div>
          )}
          <small className="integration-note">Demo mode • Powered by Swachh Sahyog Agri AI Knowledge Base.</small>
        </article>

        {/* ACTIVE REQUESTS TIMELINE */}
        <article className="card collection-card" id="residue">
          <div className="card-title-row">
            <div><span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>ACTIVE REQUEST</span><h2>Residue collection</h2></div>
            <span className="status-pill">Scheduled</span>
          </div>
          <div className="request-summary"><b>Paddy straw &nbsp;·&nbsp; 650 kg</b><small>Request #RC-4892</small></div>
          <ol className="timeline">
            <li className="done">
              <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></i>
              <div><b>Request confirmed</b><small>20 Aug 2026, 10:15 AM</small></div>
            </li>
            <li className="done">
              <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></i>
              <div><b>Collection partner assigned</b><small>GreenEarth NGO · 21 Aug, 02:40 PM</small></div>
            </li>
            <li className="current">
              <i></i>
              <div><b>Pickup scheduled</b><small>Tomorrow, 09:00 – 11:00 AM</small></div>
            </li>
            <li>
              <i></i>
              <div><b>Material processed</b><small>Compost credit will be issued</small></div>
            </li>
          </ol>
          <button className="track-button" onClick={() => onNavigate('swc')}>
            Track collection 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </article>

        {/* REQUEST PICKUP FORM */}
        <article className="card request-card" id="requestPickupForm">
          <div className="card-title-row">
            <div><span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>REQUEST PICKUP</span><h2>Turn residue into a resource</h2></div>
            <span className="round-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg>
            </span>
          </div>
          <p className="card-description">Schedule a crop residue pickup to earn compost credit instead of burning it.</p>
          <form className="collection-form" onSubmit={handlePickupRequest}>
            <label>Residue type
              <select value={residueType} onChange={(e) => setResidueType(e.target.value)}>
                <option value="Paddy straw">Paddy straw</option>
                <option value="Wheat straw">Wheat straw</option>
                <option value="Sugarcane trash">Sugarcane trash</option>
                <option value="Mixed crop residue">Mixed crop residue</option>
              </select>
            </label>
            <label>Estimated quantity (kg)
              <input 
                type="number" 
                min="50" 
                value={residueQty} 
                onChange={(e) => setResidueQty(e.target.value)} 
                required 
              />
            </label>
            <button className="primary-button">
              Request pickup 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <small className="form-note">ⓘ Collection availability depends on local NGO networks.</small>
          </form>
        </article>
      </section>

      {/* LOWER GRID */}
      <section className="lower-grid">
        {/* COMPOST BALANCE CARD */}
        <article className="card standard-card" id="compost">
          <div className="card-title-row">
            <div><span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>COMPOST &amp; SOIL</span><h2>Compost balance</h2></div>
            <span className="status-pill">Available</span>
          </div>
          <div className="compost-main">
            <div className="ring" style={{ '--progress': 72 } }><span>72<small>%</small></span></div>
            <div>
              <b>{compostCredit} kg</b>
              <small>Compost credit available</small>
              <p>Based on your verified residue contribution.</p>
              <button className="secondary-button" onClick={() => setIsModalOpen(true)}>
                Request compost 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '11px', height: '11px' }}><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg>
              </button>
            </div>
          </div>
          <div className="progress-row"><span>Seasonal goal</span><b>{compostReceived} / 450 kg</b></div>
          <div className="progress"><i style={{ width: `${Math.round((compostReceived / 450) * 100)}%` }}></i></div>
        </article>

        {/* SOIL IMPACT REPORT */}
        <article className="card standard-card impact-card" id="impact">
          <div className="card-title-row">
            <div>
              <span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>YOUR FARM IMPACT</span>
              <h2>Positive impact</h2>
            </div>
            <span className="impact-badge">This season</span>
          </div>

          <div className="impact-stats">
            <div>
              <span className="impact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3 4 8l3 5"/><path d="M4 8h9.5A5.5 5.5 0 0 1 19 13.5V15"/><path d="M17 21l3-5-3-5"/><path d="M20 16h-9.5A5.5 5.5 0 0 1 5 10.5V9"/></svg></span>
              <b>{(residueDiverted + (pickupScheduled - 650)).toLocaleString()} kg</b>
              <small>Residue diverted</small>
            </div>
            <div>
              <span className="impact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-5-2.46.5-5 2.21-5 5A3.5 3.5 0 0 0 14.5 19h3z"/><path d="M7.5 15A4.5 4.5 0 0 1 12 10.5c0-3.59-3.27-5.79-6.43-6.43A4.5 4.5 0 0 0 3 10.5 4.5 4.5 0 0 0 7.5 15z"/></svg></span>
              <b>0.86 t</b>
              <small>CO₂e avoided</small>
            </div>
            <div>
              <span className="impact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z"/><path d="M12 21v-7"/></svg></span>
              <b>{compostReceived} kg</b>
              <small>Compost received</small>
            </div>
          </div>

          <div className="impact-chart" aria-label="Monthly residue diverted">
            <div className="chart-grid-line line-1"></div>
            <div className="chart-grid-line line-2"></div>
            <div className="chart-grid-line line-3"></div>
            <div className="impact-bars">
              <button className="impact-bar-wrap" type="button" aria-label="March: 180 kilograms">
                <span className="impact-tooltip">180 kg</span>
                <i className="impact-bar" style={{ '--bar': '28%' }}></i>
                <small>Mar</small>
              </button>
              <button className="impact-bar-wrap" type="button" aria-label="April: 260 kilograms">
                <span className="impact-tooltip">260 kg</span>
                <i className="impact-bar" style={{ '--bar': '40%' }}></i>
                <small>Apr</small>
              </button>
              <button className="impact-bar-wrap" type="button" aria-label="May: 340 kilograms">
                <span className="impact-tooltip">340 kg</span>
                <i className="impact-bar" style={{ '--bar': '53%' }}></i>
                <small>May</small>
              </button>
              <button className="impact-bar-wrap" type="button" aria-label="June: 520 kilograms">
                <span className="impact-tooltip">520 kg</span>
                <i className="impact-bar" style={{ '--bar': '67%' }}></i>
                <small>Jun</small>
              </button>
              <button className="impact-bar-wrap" type="button" aria-label="July: 780 kilograms">
                <span className="impact-tooltip">780 kg</span>
                <i className="impact-bar" style={{ '--bar': '84%' }}></i>
                <small>Jul</small>
              </button>
              <button className="impact-bar-wrap active" type="button" aria-label="August: 1240 kilograms">
                <span className="impact-tooltip">1,240 kg</span>
                <i className="impact-bar" style={{ '--bar': '100%' }}></i>
                <small>Aug</small>
              </button>
            </div>
          </div>

          <p className="impact-caption"><b>{residueDiverted.toLocaleString()} kg</b> of residue diverted from open burning this season.</p>
          <button className="full-report" onClick={() => onNavigate('impact')}>
            View full impact report 
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '11px', height: '11px' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </article>

        {/* RECOMMENDED ACTIONS */}
        <article className="card standard-card next-card">
          <div className="card-title-row">
            <div><span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>WHAT CAN YOU DO NEXT?</span><h2>Recommended for you</h2></div>
          </div>
          <div className="next-list">
            <button type="button">
              <span className="next-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z"/><path d="M12 21v-7"/></svg></span>
              <span><b>Prepare bio-enriched compost</b><small>7 min read</small></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button type="button">
              <span className="next-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg></span>
              <span><b>Natural pest management</b><small>6 min read</small></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button type="button">
              <span className="next-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18.5 8 7l4 6 3-4 6 9.5"/><path d="M3 20.5h18"/></svg></span>
              <span><b>Improve soil organic carbon</b><small>5 min read</small></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </article>

        {/* SCHEME CARD */}
        <article className="scheme-card" id="schemes">
          <div className="scheme-topline">
            <span className="scheme-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 
              GOVERNMENT SCHEME
            </span>
            <span className="scheme-mark" aria-hidden="true">PK</span>
          </div>
          <h2>Paramparagat Krishi Vikas Yojana</h2>
          <span className="scheme-code">PKVY • ORGANIC FARMING</span>
          <p>Support for cluster-based organic farming, certifications, and farmer capacity building.</p>
          <div className="scheme-footer">
            <span>Eligible farmer</span>
            <button onClick={() => triggerToast('Opening PKVY program registration links...')}>
              Explore PKVY 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '11px', height: '11px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </article>
      </section>

      {/* LEARN & GROW STRIP */}
      <section id="guidance" className="guidance-strip card">
        <div><span className="eyebrow" style={{ color: 'var(--palette-gold)' }}>LEARN &amp; GROW</span><h2>Organic farming guidance</h2></div>
        <div className="guidance-list">
          <button type="button" onClick={() => triggerToast('Opening guide: Prepare bio-enriched compost')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z"/><path d="M12 21v-7"/></svg>
            <span><b>Prepare bio-enriched compost</b><small>For paddy fields</small></span>
          </button>
          <button type="button" onClick={() => triggerToast('Opening guide: Natural pest management')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19c-.6-6.8 3-13 13-14 1 9-4.8 13.5-13 14Z"/><path d="M6 18c2.3-2.6 4.6-5 8.7-8.4"/></svg>
            <span><b>Natural pest management</b><small>Neem-based practices</small></span>
          </button>
          <button type="button" onClick={() => triggerToast('Opening guide: Improve soil organic carbon')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18.5 8 7l4 6 3-4 6 9.5"/><path d="M3 20.5h18"/></svg>
            <span><b>Improve soil organic carbon</b><small>Simple actions this season</small></span>
          </button>
        </div>
        <a href="#assistant" onClick={(e) => {
          e.preventDefault();
          document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          Ask KrishiSahyog 
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </section>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>

      {/* COMPOST CREDIT REQUEST MODAL */}
      {!isModalOpen ? null : (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <button className="close-modal" onClick={() => setIsModalOpen(false)} aria-label="Close">×</button>
            <span class="eyebrow" style={{ color: 'var(--palette-gold)' }}>COMPOST REQUEST</span>
            <h2 id="modalTitle">Use your compost credit</h2>
            <p>You have {compostCredit} kg available. Submit a request and the local NGO partner will coordinate doorstep delivery.</p>
            <label>Quantity needed (kg)
              <input 
                id="compostAmount" 
                type="number" 
                min="25" 
                max={compostCredit} 
                value={compostRequestQty} 
                onChange={(e) => setCompostRequestQty(e.target.value)} 
              />
            </label>
            <button className="primary-button" onClick={handleCompostRequestSubmit}>
              Submit request 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
