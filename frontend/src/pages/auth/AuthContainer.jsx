import React, { useState, useEffect } from 'react';
import './auth.css';
import { authApi } from '../../services/authApi';
import logo from '../../assets/logo.png';

const jurisdictionData = {
  Odisha: {
    Bhubaneswar: { 
      rural: { 
        blocks: ["Balianta", "Balipatna"], 
        localBodies: ["Zilla Panchayat", "Tehsil"] 
      }, 
      urban: { 
        ulbs: ["Bhubaneswar Municipal Corporation"], 
        wards: ["Ward 1", "Ward 12", "Ward 34", "Ward 56"] 
      } 
    },
    Cuttack: { 
      rural: { 
        blocks: ["Cuttack Sadar", "Niali", "Nischintakoili"], 
        localBodies: ["Zilla Panchayat", "Tehsil"] 
      }, 
      urban: { 
        ulbs: ["Cuttack Municipal Corporation", "Choudwar Municipality"], 
        wards: ["Ward 2", "Ward 9", "Ward 21", "Ward 42"] 
      } 
    },
    Puri: { 
      rural: { 
        blocks: ["Brahmagiri", "Delanga", "Satyabadi"], 
        localBodies: ["Zilla Panchayat", "Tehsil"] 
      }, 
      urban: { 
        ulbs: ["Puri Municipality", "Konark NAC"], 
        wards: ["Ward 1", "Ward 8", "Ward 16", "Ward 28"] 
      } 
    }
  },
  "West Bengal": { 
    Kolkata: { 
      rural: { 
        blocks: ["Baruipur", "Sonarpur"], 
        localBodies: ["Zilla Parishad", "Tehsil"] 
      }, 
      urban: { 
        ulbs: ["Kolkata Municipal Corporation"], 
        wards: ["Ward 5", "Ward 28", "Ward 65"] 
      } 
    } 
  }
};

export default function AuthContainer({ initialPanel = 'role', initialMode = 'login', onLoginSuccess, onBackToIntro }) {
  // Panel States: 'role' | 'civilian' | 'government'
  const [activePanel, setActivePanel] = useState(initialPanel);
  // Civilian Mode: 'login' | 'register'
  const [civilianMode, setCivilianMode] = useState(initialMode);

  // Civilian Form Values (Prefilled with demo credentials)
  const [civilianName, setCivilianName] = useState('');
  const [civilianEmail, setCivilianEmail] = useState('odisha_citizen');
  const [civilianPassword, setCivilianPassword] = useState('citizen123');
  const [showPassword, setShowPassword] = useState(false);
  const [civilianError, setCivilianError] = useState('');

  // Government Form Values (Prefilled with demo credentials)
  const [govId, setGovId] = useState('bmc_ward24_officer');
  const [govPassword, setGovPassword] = useState('officer123');
  const [govState, setGovState] = useState('Odisha');
  const [govDistrict, setGovDistrict] = useState('Bhubaneswar');
  const [govArea, setGovArea] = useState('urban'); // 'rural' | 'urban'
  const [govBlock, setGovBlock] = useState('');
  const [govLocalBody, setGovLocalBody] = useState('');
  const [govULB, setGovULB] = useState('Bhubaneswar Municipal Corporation');
  const [govWard, setGovWard] = useState('Ward 12');
  const [govError, setGovError] = useState('');

  // Global UI States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Sync mode if initialMode changes
  useEffect(() => {
    setCivilianMode(initialMode);
  }, [initialMode]);

  // Sync panel if initialPanel changes
  useEffect(() => {
    setActivePanel(initialPanel);
  }, [initialPanel]);

  // Trigger feedback toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  // Reset dropdown selections when state changes
  const handleStateChange = (e) => {
    setGovState(e.target.value);
    setGovDistrict('');
    setGovArea('');
    setGovBlock('');
    setGovLocalBody('');
    setGovULB('');
    setGovWard('');
  };

  // Reset detailed selections when district or area changes
  const handleDistrictChange = (e) => {
    setGovDistrict(e.target.value);
    setGovArea('');
    setGovBlock('');
    setGovLocalBody('');
    setGovULB('');
    setGovWard('');
  };

  const handleAreaChange = (area) => {
    setGovArea(area);
    setGovBlock('');
    setGovLocalBody('');
    setGovULB('');
    setGovWard('');
  };

  // Submission handler for citizen access (Login / Registration)
  const handleCivilianSubmit = async (e) => {
    e.preventDefault();
    setCivilianError('');
    
    if (civilianMode === 'login') {
      if (!civilianEmail || !civilianPassword) {
        setCivilianError('Please complete all required fields.');
        return;
      }
      setLoading(true);
      try {
        const data = await authApi.login(civilianEmail, civilianPassword);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user || { username: civilianEmail }));
        triggerToast('Login successful — welcome back!');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } catch (err) {
        setCivilianError(err.message || 'Invalid email/phone or password.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!civilianName || !civilianEmail || !civilianPassword) {
        setCivilianError('Please complete all required fields.');
        return;
      }
      if (civilianPassword.length < 6) {
        setCivilianError('Password must be at least 6 characters.');
        return;
      }
      setLoading(true);
      try {
        const payload = {
          username: civilianName,
          password: civilianPassword,
          role: 'citizen'
        };
        if (civilianEmail.includes('@')) {
          payload.email = civilianEmail;
        } else {
          payload.phone = civilianEmail;
        }

        const data = await authApi.register(payload);
        triggerToast('Account details saved — welcome to SwachSahyog!');
        
        // Auto sign-in if tokens are returned
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user', JSON.stringify(data.user || { username: civilianName }));
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        } else {
          setTimeout(() => {
            setCivilianMode('login');
          }, 1500);
        }
      } catch (err) {
        setCivilianError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Submission handler for government officers
  const handleGovSubmit = async (e) => {
    e.preventDefault();
    setGovError('');

    if (!govId || !govPassword || !govState || !govDistrict || !govArea) {
      setGovError('Please complete all jurisdiction details.');
      return;
    }

    const data = jurisdictionData[govState]?.[govDistrict]?.[govArea];
    if (govArea === 'rural') {
      if (!govBlock || !govLocalBody || !govWard) {
        setGovError('Please select Block, Local Administration, and Ward.');
        return;
      }
    } else {
      if (!govULB || !govWard) {
        setGovError('Please select ULB / Municipality and Ward.');
        return;
      }
    }

    setLoading(true);
    try {
      const loginData = await authApi.login(govId, govPassword);
      localStorage.setItem('access_token', loginData.access);
      localStorage.setItem('refresh_token', loginData.refresh);
      localStorage.setItem('user', JSON.stringify(loginData.user || { username: govId }));
      
      triggerToast('Your jurisdiction is confirmed. Opening workspace…');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err) {
      setGovError(err.message || 'Invalid credentials or jurisdiction configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Helper title strings depending on the active view
  const getStepLabel = () => {
    if (activePanel === 'role') return 'Welcome to SwachSahyog';
    if (activePanel === 'civilian') return 'Citizen access';
    return 'Government access';
  };

  // Get options for selected hierarchy data
  const stateOptions = Object.keys(jurisdictionData);
  const districtOptions = govState ? Object.keys(jurisdictionData[govState] || {}) : [];
  const areaData = govState && govDistrict && govArea ? jurisdictionData[govState][govDistrict][govArea] : null;

  return (
    <div className="auth-page">
      {/* SVG clip-path template definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="leafEdge" clipPathUnits="objectBoundingBox">
            <path d="M 0.035,0
                     C 0.09,0.12 0.01,0.22 0.055,0.34
                     C 0.10,0.46 0.015,0.56 0.05,0.66
                     C 0.085,0.76 0.02,0.85 0.03,0.94
                     C 0.035,0.97 0.02,0.99 0.015,1
                     L 1,1 L 1,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="app-shell">
        {/* LEFT PANEL: photographic Nature Hero */}
        <section className="hero" aria-hidden="false">
          <div className="hero__top">
            <div className="hero__logo">
              <img src={logo} alt="SwachSahyog logo" />
            </div>
            <div className="hero__brand">
              SwachSahyog
              <span>Together for a cleaner tomorrow</span>
            </div>
          </div>

          <div className="hero__mid">
            <h1 className="slogan">
              <span className="type-line type-line--1">Your city.</span>
              <span className="type-line type-line--2">Your voice.</span>
              <span className="type-line type-line--3">Your <em>impact.</em></span>
            </h1>
            <p className="hero__tagline">
              From Clean Spaces to Circular Living
            </p>
          </div>
        </section>

        {/* RIGHT PANEL: login/registration panels card */}
        <section className="form-panel">
          <div className="auth-card">
            <p className="eyebrow"><span>{getStepLabel()}</span></p>

            {/* PANEL 1: ROLE SELECTION */}
            <div className={`panel ${activePanel === 'role' ? 'active' : ''}`}>
              {onBackToIntro && (
                <button type="button" className="back-btn" style={{ marginBottom: '14px' }} onClick={onBackToIntro}>
                  ← Back to Info Page
                </button>
              )}
              <h2>Choose how you'll sign in</h2>
              <p className="sub">Select the access that matches your account.</p>
              <div className="role-grid">
                <button type="button" className="role-card" onClick={() => {
                  setActivePanel('civilian');
                  setCivilianEmail('odisha_citizen');
                  setCivilianPassword('citizen123');
                  setCivilianMode('login');
                }}>
                  <span className="role-card__icon" aria-hidden="true">🧍</span>
                  <span>
                    <span className="role-card__title" style={{ display: 'block' }}>Citizen access</span>
                    <span className="role-card__desc" style={{ display: 'block' }}>Report issues, track cleanups, follow your area</span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" className="role-card" onClick={() => {
                  setActivePanel('civilian');
                  setCivilianEmail('devinder_singh');
                  setCivilianPassword('citizen123');
                  setCivilianMode('login');
                }}>
                  <span className="role-card__icon" style={{ backgroundColor: '#eaf6ed', color: '#18855a' }} aria-hidden="true">🌾</span>
                  <span>
                    <span className="role-card__title" style={{ display: 'block' }}>Agriculture access</span>
                    <span className="role-card__desc" style={{ display: 'block' }}>Request residue pickup, manage compost credits, organic advice</span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" className="role-card" onClick={() => setActivePanel('government')}>
                  <span className="role-card__icon" style={{ backgroundColor: '#eef5df', color: '#638e25' }} aria-hidden="true">🏛️</span>
                  <span>
                    <span className="role-card__title" style={{ display: 'block' }}>Government access</span>
                    <span className="role-card__desc" style={{ display: 'block' }}>Manage jurisdiction, respond to citizen reports</span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* PANEL 2: CIVILIAN LOGIN / SIGNUP */}
            <div className={`panel ${activePanel === 'civilian' ? 'active' : ''}`}>
              <button type="button" className="back-btn" onClick={() => setActivePanel('role')}>← Back</button>
              <h2>Citizen access</h2>
              <p className="sub">Log in or create your SwachSahyog account.</p>

              <div className="auth-mode-toggle" role="tablist" aria-label="Civilian access mode">
                <button 
                  type="button" 
                  className={civilianMode === 'login' ? 'active' : ''} 
                  onClick={() => { setCivilianMode('login'); setCivilianError(''); }}
                  role="tab" 
                  aria-selected={civilianMode === 'login'}
                >
                  Log in
                </button>
                <button 
                  type="button" 
                  className={civilianMode === 'register' ? 'active' : ''} 
                  onClick={() => { setCivilianMode('register'); setCivilianError(''); }}
                  role="tab" 
                  aria-selected={civilianMode === 'register'}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={handleCivilianSubmit} className={civilianMode === 'register' ? 'create-mode' : ''} noValidate>
                {civilianMode === 'login' && (
                  <div style={{
                    background: '#fcf8ec',
                    border: '1px solid #f2e1b8',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '11.5px',
                    lineHeight: '1.45',
                    marginBottom: '15px',
                    color: '#856404'
                  }}>
                    💡 <b>Demo Access Guide:</b>
                    <ul style={{ paddingLeft: '18px', marginTop: '4px', marginFloat: 'none', listStyleType: 'disc' }}>
                      <li>To test <b>Citizen (Urban Area)</b>: Use <code>odisha_citizen</code></li>
                      <li>To test <b>Farmer (Rural Area)</b>: Use <code>devinder_singh</code></li>
                    </ul>
                    <small style={{ display: 'block', marginTop: '4px', color: '#997305' }}>Use password <code>citizen123</code> for both.</small>
                  </div>
                )}
                <div className="field field--name">
                  <label htmlFor="civilianName">Full name</label>
                  <input 
                    type="text" 
                    id="civilianName" 
                    value={civilianName}
                    onChange={(e) => setCivilianName(e.target.value)}
                    placeholder="As per ID" 
                    required={civilianMode === 'register'}
                  />
                </div>
                <div className="field">
                  <label htmlFor="civilianEmail">Email or phone</label>
                  <input 
                    type="text" 
                    id="civilianEmail" 
                    value={civilianEmail}
                    onChange={(e) => setCivilianEmail(e.target.value)}
                    placeholder="you@example.com / username" 
                    required 
                  />
                </div>
                <div className="field">
                  <label htmlFor="civilianPassword">Password</label>
                  <div className="password-field">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      id="civilianPassword" 
                      value={civilianPassword}
                      onChange={(e) => setCivilianPassword(e.target.value)}
                      placeholder="Enter password" 
                      required 
                    />
                    <button 
                      type="button" 
                      className="show-password" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="primary" disabled={loading}>
                  {loading 
                    ? 'Loading...' 
                    : civilianMode === 'register' 
                      ? 'Create your account' 
                      : 'Log in securely'}
                  <span>→</span>
                </button>
                {civilianError && <p className="form-message" role="alert">{civilianError}</p>}
              </form>
              <p className="fine-print">By continuing you agree to SwachSahyog's Terms &amp; Privacy Policy.</p>
            </div>

            {/* PANEL 3: GOVERNMENT WORKSPACE CONFIRMATION */}
            <div className={`panel ${activePanel === 'government' ? 'active' : ''}`}>
              <button type="button" className="back-btn" onClick={() => setActivePanel('role')}>← Back</button>
              <h2>Government access</h2>
              <p className="sub">Confirm your jurisdiction to open your workspace.</p>

              <form onSubmit={handleGovSubmit} noValidate>
                <div className="field">
                  <label htmlFor="govId">Employee / officer ID</label>
                  <input 
                    type="text" 
                    id="govId" 
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                    placeholder="e.g. bmc_ward24_officer" 
                    required 
                  />
                </div>
                <div className="field">
                  <label htmlFor="govPassword">Password</label>
                  <div className="password-field">
                    <input 
                      type="password" 
                      id="govPassword" 
                      value={govPassword}
                      onChange={(e) => setGovPassword(e.target.value)}
                      placeholder="Enter password" 
                      required 
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="state">State</label>
                  <select id="state" value={govState} onChange={handleStateChange} required>
                    <option value="">Select state</option>
                    {stateOptions.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="district">District</label>
                  <select 
                    id="district" 
                    value={govDistrict} 
                    onChange={handleDistrictChange} 
                    disabled={!govState} 
                    required
                  >
                    <option value="">Select district</option>
                    {districtOptions.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label id="areaLabel">Area type</label>
                  <div className="area-toggle" role="radiogroup" aria-labelledby="areaLabel">
                    <button 
                      type="button" 
                      className={govArea === 'rural' ? 'active' : ''} 
                      onClick={() => handleAreaChange('rural')}
                      role="radio" 
                      aria-checked={govArea === 'rural'}
                      disabled={!govDistrict}
                    >
                      Rural
                    </button>
                    <button 
                      type="button" 
                      className={govArea === 'urban' ? 'active' : ''} 
                      onClick={() => handleAreaChange('urban')}
                      role="radio" 
                      aria-checked={govArea === 'urban'}
                      disabled={!govDistrict}
                    >
                      Urban
                    </button>
                  </div>
                </div>

                {/* DYNAMIC JURISDICTION FIELDS */}
                {govArea === 'rural' && areaData && (
                  <div id="jurisdictionFields">
                    <div className="field">
                      <label htmlFor="block">Block</label>
                      <select id="block" value={govBlock} onChange={(e) => setGovBlock(e.target.value)} required>
                        <option value="">Select block</option>
                        {areaData.blocks.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="ruralUnit">Local administration</label>
                      <select id="ruralUnit" value={govLocalBody} onChange={(e) => setGovLocalBody(e.target.value)} required>
                        <option value="">Select local administration</option>
                        {areaData.localBodies.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="ruralWard">Ward number</label>
                      <select id="ruralWard" value={govWard} onChange={(e) => setGovWard(e.target.value)} required>
                        <option value="">Select ward number</option>
                        {["Ward 1", "Ward 2", "Ward 3", "Ward 4"].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {govArea === 'urban' && areaData && (
                  <div id="jurisdictionFields">
                    <div className="field">
                      <label htmlFor="ulb">ULB / municipality</label>
                      <select id="ulb" value={govULB} onChange={(e) => setGovULB(e.target.value)} required>
                        <option value="">Select ulb / municipality</option>
                        {areaData.ulbs.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="urbanWard">Ward number</label>
                      <select id="urbanWard" value={govWard} onChange={(e) => setGovWard(e.target.value)} required>
                        <option value="">Select ward number</option>
                        {areaData.wards.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm jurisdiction'}
                  <span>→</span>
                </button>
                {govError && <p className="form-message" role="alert">{govError}</p>}
              </form>
            </div>

          </div>
        </section>
      </div>

      {/* TOAST ALERT FEEDBACK */}
      <div className={`toast ${toastVisible ? 'visible' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
}
