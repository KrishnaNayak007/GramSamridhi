import React, { useState, useEffect } from 'react';
import './ResiduePage.css';
import { agricultureApi } from '../../../services/agricultureApi';

const RATES = {
  "Rice Straw": 1500,
  "Wheat Straw": 1350,
  "Sugarcane Trash": 1100,
  "Other Residue": 900
};

const cropToResidue = {
  paddy: "Rice Straw",
  wheat: "Wheat Straw",
  sugarcane: "Sugarcane Trash",
  other: "Other Residue"
};

export default function ResiduePage() {
  const [user, setUser] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('Ramesh Mahato');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [location, setLocation] = useState('Village Kanas, Puri');
  const [landArea, setLandArea] = useState('');
  const [landUnit, setLandUnit] = useState('acre');
  const [ownership, setOwnership] = useState('Owned');
  const [crop, setCrop] = useState('paddy');
  const [residueType, setResidueType] = useState('Rice Straw');
  const [quantity, setQuantity] = useState('2.5');
  const [pickupLocation, setPickupLocation] = useState('Village Kanas, Puri');
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning (7 AM – 11 AM)');
  const [notes, setNotes] = useState('');

  // Editable toggle
  const [isEditable, setIsEditable] = useState(false);

  // Photo states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Submit and Estimate states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reqId, setReqId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    
    // Auto-fill from logged-in user profile
    if (storedUser.username) {
      const isDemoDevinder = storedUser.username.toLowerCase() === 'devinder_Sahu';
      const cleanName = isDemoDevinder ? 'Devinder Sahu' : storedUser.username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      setFullName(cleanName);
    }
    if (storedUser.phone) {
      setMobileNumber(storedUser.phone);
    }
    if (storedUser.address) {
      setLocation(storedUser.address);
      setPickupLocation(storedUser.address);
    }
  }, []);

  const handleCropPillClick = (cropName) => {
    setCrop(cropName);
    const residue = cropToResidue[cropName];
    if (residue) {
      setResidueType(residue);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getEstimatedAmount = () => {
    const qty = parseFloat(quantity) || 0;
    const rate = RATES[residueType] || 0;
    return qty * rate;
  };

  const formatINR = (n) => {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const qtyVal = parseFloat(quantity) || 0;
    const payload = {
      residue_type: residueType,
      weight_kg: qtyVal * 1000, // Tonnes to KG
      location_address: pickupLocation,
      scheduled_slot: pickupDate + ' | ' + timeSlot
    };

    try {
      const data = await agricultureApi.createPickup(payload);
      const generatedId = data.id ? `RB-${String(data.id).slice(0, 8)}` : 'RB-CONFIRMED';
      setReqId(generatedId);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error creating pickup request:", err);
      alert(err.message || 'Failed to submit pickup request. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const estimatedAmount = getEstimatedAmount();

  return (
    <div className="agriculture-residue-page">
      <div className="sr-wrap">
        <div className="sr-header">
          <div className="sr-eyebrow">Residue Buy-Back Program</div>
          <h1>Sell Your Crop Residue</h1>
          <p>Register your land once, then list your residue any time. We'll estimate your payment instantly and coordinate pickup — no burning, no hassle.</p>
        </div>

        {!isSubmitted ? (
          <form className="sr-layout" id="sr-form" onSubmit={handleSubmit}>
            <div className="sr-left">
              {/* FARMER & LAND DETAILS */}
              <div className="sr-card">
                <div className="sr-card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="num">1</span>
                    <div>
                      <h2>Farmer &amp; Land Details</h2>
                      <div className="sub">Profile details loaded automatically</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="sr-edit-profile-btn" 
                    onClick={() => setIsEditable(!isEditable)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isEditable ? '#fff' : '#1F7A4D',
                      background: isEditable ? '#1F7A4D' : '#EAF6EC',
                      border: '1.5px solid #1F7A4D',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      outline: 'none'
                    }}
                  >
                    {isEditable ? '🔒 Lock Info' : '✏️ Edit Profile Info'}
                  </button>
                </div>

                <div className="sr-grid">
                  <div className="sr-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Mahato" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      readOnly={!isEditable}
                      style={{ opacity: isEditable ? 1 : 0.8, cursor: isEditable ? 'text' : 'not-allowed' }}
                      required
                    />
                  </div>
                  <div className="sr-field">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 98XXXXXXXX" 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      readOnly={!isEditable}
                      style={{ opacity: isEditable ? 1 : 0.8, cursor: isEditable ? 'text' : 'not-allowed' }}
                      required
                    />
                  </div>

                  <div className="sr-field full">
                    <label>Village / Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Village kanas, Ward 14" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      readOnly={!isEditable}
                      style={{ opacity: isEditable ? 1 : 0.8, cursor: isEditable ? 'text' : 'not-allowed' }}
                      required
                    />
                  </div>

                  <div className="sr-field">
                    <label>Total Land Area <span className="hint">(area you farm)</span></label>
                    <div className="sr-unit-row">
                      <input 
                        type="number" 
                        id="landArea" 
                        placeholder="e.g. 4.5" 
                        min="0" 
                        step="0.1"
                        value={landArea}
                        onChange={(e) => setLandArea(e.target.value)}
                        required
                      />
                      <select value={landUnit} onChange={(e) => setLandUnit(e.target.value)}>
                        <option value="acre">Acres</option>
                        <option value="hectare">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>

                  <div className="sr-field">
                    <label>Land Ownership</label>
                    <select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                      <option>Owned</option>
                      <option>Leased</option>
                      <option>Shared / Family Land</option>
                    </select>
                  </div>

                  <div className="sr-field full">
                    <label>Primary Crop Grown on This Land</label>
                    <div className="sr-pill-group" id="cropPills">
                      <div className={'sr-pill ' + (crop === 'paddy' ? 'active' : '')} onClick={() => handleCropPillClick('paddy')}>🌾 Paddy</div>
                      <div className={'sr-pill ' + (crop === 'wheat' ? 'active' : '')} onClick={() => handleCropPillClick('wheat')}>🌿 Wheat</div>
                      <div className={'sr-pill ' + (crop === 'sugarcane' ? 'active' : '')} onClick={() => handleCropPillClick('sugarcane')}>🎋 Sugarcane</div>
                      <div className={'sr-pill ' + (crop === 'other' ? 'active' : '')} onClick={() => handleCropPillClick('other')}>🌱 Other</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESIDUE DETAILS */}
              <div className="sr-card">
                <div className="sr-card-head">
                  <span className="num">2</span>
                  <div>
                    <h2>Residue Details</h2>
                    <div className="sub">What you're selling this time</div>
                  </div>
                </div>

                <div className="sr-grid">
                  <div className="sr-field">
                    <label>Residue Type</label>
                    <select id="residueType" value={residueType} onChange={(e) => setResidueType(e.target.value)}>
                      <option value="Rice Straw">♻️ Rice Straw</option>
                      <option value="Wheat Straw">♻️ Wheat Straw</option>
                      <option value="Sugarcane Trash">♻️ Sugarcane Trash</option>
                      <option value="Other Residue">♻️ Other Residue</option>
                    </select>
                  </div>
                  <div className="sr-field">
                    <label>Approximate Quantity</label>
                    <div className="sr-unit-row">
                      <input 
                        type="number" 
                        id="quantity" 
                        placeholder="e.g. 2.5" 
                        min="0" 
                        step="0.1" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                      <select disabled style={{ opacity: 0.7 }}><option>Tonnes</option></select>
                    </div>
                  </div>

                  <div className="sr-field full">
                    <label>Pickup Location</label>
                    <input 
                      type="text" 
                      placeholder="Same as village, or specify field location" 
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sr-field">
                    <label>Pickup Availability — Date</label>
                    <input 
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sr-field">
                    <label>Preferred Time Slot</label>
                    <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                      <option>Morning (7 AM – 11 AM)</option>
                      <option>Afternoon (12 PM – 4 PM)</option>
                      <option>Evening (4 PM – 7 PM)</option>
                    </select>
                  </div>

                  {/* PHOTO UPLOAD FIELD */}
                  <div className="sr-field full">
                    <label>Upload Residue Photo <span className="hint">(for quality verification)</span></label>
                    <div 
                      className="sr-photo-upload-zone"
                      onClick={() => document.getElementById('residueFile').click()}
                      style={{
                        border: '2px dashed var(--line)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#fcfdfb',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <input 
                        type="file" 
                        id="residueFile" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {photoPreview ? (
                        <div style={{ position: 'relative', width: '100%', maxHeight: '180px', overflow: 'hidden', borderRadius: '8px' }}>
                          <img src={photoPreview} alt="Residue preview" style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'contain' }} />
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoFile(null);
                              setPhotoPreview(null);
                            }}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#2C9660" strokeWidth="1.8" style={{ width: '32px', height: '32px' }}>
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-600)' }}>Click to upload or take a photo</span>
                          <span style={{ fontSize: '11px', color: 'var(--ink-400)' }}>PNG, JPG or JPEG up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sr-field full">
                    <label>Additional Notes <span className="hint">(optional)</span></label>
                    <textarea 
                      placeholder="e.g. Residue is stacked near the main road, easy tractor access"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="sr-sticky">
              <div className="sr-estimate">
                <div className="lab">Estimated Payment</div>
                <div className="amount">{formatINR(estimatedAmount)}</div>
                <div className="row"><span>Quantity</span><b>{(parseFloat(quantity) || 0).toFixed(1) + ' tonnes'}</b></div>
                <div className="row"><span>Residue Type</span><b>{residueType}</b></div>
                <div className="row"><span>Rate (demo)</span><b>{formatINR(RATES[residueType]) + ' / tonne'}</b></div>
                <button type="submit" className="cta" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Residue Request'}
                </button>
              </div>

              <div className="sr-rates">
                <h3>Procurement Rate Card</h3>
                <div className="sr-rate-row"><span className="rn"><span className="sw"></span>Rice Straw</span><span className="rv">₹1,500 / T</span></div>
                <div className="sr-rate-row"><span className="rn"><span className="sw"></span>Wheat Straw</span><span className="rv">₹1,350 / T</span></div>
                <div className="sr-rate-row"><span className="rn"><span className="sw"></span>Sugarcane Trash</span><span className="rv">₹1,100 / T</span></div>
                <div className="sr-rate-row"><span className="rn"><span className="sw"></span>Other Residue</span><span className="rv">₹900 / T</span></div>
              </div>

              <div className="sr-disclaimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
                <span>Rates shown are a configurable demo procurement rate for this prototype — not an official government rate.</span>
              </div>
            </div>
          </form>
        ) : (
          <div className="sr-success show" id="srSuccess">
            <div className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h2>Request Submitted!</h2>
            <p>We've received your residue listing. A collection team will contact you to confirm the pickup slot, and payment will be released once the residue is collected and verified.</p>
            <div className="req-id">{reqId}</div>
            <button className="cta-back" onClick={() => {
              setIsSubmitted(false);
              setQuantity('2.5');
              setPickupDate('');
              setNotes('');
              setPhotoFile(null);
              setPhotoPreview(null);
            }}>Submit Another Request</button>
          </div>
        )}
      </div>
    </div>
  );
}
