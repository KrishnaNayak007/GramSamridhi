import React, { useState, useEffect, useRef } from "react";
import "./SwcPage.css";
import swcHero from "../../../assets/swc_hero.jpg";
import { apiFetch } from "../../../shared/lib/api";

export default function SwcPage({ onNavigate }) {
  // Page states
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [evidenceId, setEvidenceId] = useState("");

  // AI analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(-1);
  const [confidence, setConfidence] = useState(0);

  // Form states
  const [wasteType, setWasteType] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [description, setDescription] = useState("");

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Toasts
  const [toasts, setToasts] = useState([]);

  // File input ref
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Helper logic for recommended next step
  const getNextStepInfo = (category) => {
    const c = (category || "").toLowerCase();
    if (c.includes("crop") || c.includes("residue")) {
      return {
        type: "Crop Residue Pickup",
        desc: "Suitable for collection and an appropriate recovery or processing option."
      };
    }
    if (c.includes("organic") || c.includes("food")) {
      return {
        type: "Organic Composting",
        desc: "Can be sent for suitable composting or local processing."
      };
    }
    if (c.includes("plastic")) {
      return {
        type: "Plastic Recycling",
        desc: "Separate and send to an appropriate recycling channel."
      };
    }
    return {
      type: "Civic Waste Route",
      desc: "Route to the local sanitation team."
    };
  };

  const nextStep = getNextStepInfo(wasteType || "Crop Residue");

  // Handle image upload selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      setPreviewSrc(event.target.result);
      setStep(2);
      showToast("Photo uploaded locally");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiFetch("/api/v1/evidence/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setEvidenceId(data.id);
          showToast("Evidence created on server");
        } else {
          showToast("Evidence server upload failed");
        }
      } catch (err) {
        console.error("Evidence upload error:", err);
        showToast("Error uploading file to server");
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreviewSrc(null);
    setEvidenceId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStep(1);
    setAnalyzed(false);
    setIsAnalyzing(false);
    setScanStepIndex(-1);
    setConfidence(0);
    setWasteType("");
    setLocationStr("");
    setDescription("");
  };

  // Run AI analysis sequence
  const startAnalysis = () => {
    if (isAnalyzing || analyzed) return;
    setIsAnalyzing(true);
    setScanStepIndex(0);

    // Sequence through the 4 scanning steps
    const stepTimes = [550, 1100, 1650, 2200];
    stepTimes.forEach((time, index) => {
      setTimeout(() => {
        setScanStepIndex(index);
      }, time);
    });

    // Complete analysis after 2.7 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
      setStep(3);
      showToast("AI detection complete — routing unlocked");

      // Confidence ring counter animation
      let count = 0;
      const interval = setInterval(() => {
        count += 2;
        if (count >= 94) {
          count = 94;
          clearInterval(interval);
        }
        setConfidence(count);
      }, 15);

      // Pre-fill form if empty
      if (!wasteType) setWasteType("Crop Residue");
      if (!locationStr) setLocationStr("Village Road, Ward 24");
    }, 2700);
  };

  // Geolocation trigger
  const triggerGPS = () => {
    setLocationStr("Village Road, Ward 24");
    showToast("Current location detected");
  };

  // Reset form
  const handleReset = () => {
    setWasteType("");
    setLocationStr("");
    setDescription("");
    showToast("Form cleared");
  };

  // Submit flow
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wasteType || !locationStr || !description.trim()) {
      showToast("Please complete all required fields");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);

    let currentEvidenceId = evidenceId;

    // 1. If evidenceId wasn't uploaded yet but we have a photo file, upload it now
    if (!currentEvidenceId && photo) {
      try {
        const formData = new FormData();
        formData.append("file", photo);
        const evRes = await apiFetch("/api/v1/evidence/", {
          method: "POST",
          body: formData,
        });
        if (evRes.ok) {
          const evData = await evRes.json();
          currentEvidenceId = evData.id;
          setEvidenceId(evData.id);
        }
      } catch (err) {
        console.error("Failed to upload evidence on submit:", err);
      }
    }

    // 2. If still no evidenceId and previewSrc exists (e.g. sample image), convert to blob and upload
    if (!currentEvidenceId && previewSrc) {
      try {
        const blob = await fetch(previewSrc).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", blob, "captured_evidence.jpg");
        const evRes = await apiFetch("/api/v1/evidence/", {
          method: "POST",
          body: formData,
        });
        if (evRes.ok) {
          const evData = await evRes.json();
          currentEvidenceId = evData.id;
          setEvidenceId(evData.id);
        }
      } catch (err) {
        console.error("Failed to convert preview to evidence:", err);
      }
    }

    if (!currentEvidenceId) {
      showToast("Please upload or capture a photo first.");
      return;
    }

    const coords = { latitude: 20.296, longitude: 85.824 };

    try {
      const submitData = {
        evidence_id: currentEvidenceId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        description: description,
        category: wasteType === "Crop Residue" ? "crop_residue" : "garbage_accumulation",
      };

      const response = await apiFetch("/api/v1/reports/", {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        setTicketId(
          data.id ? `SWC-${String(data.id).slice(0, 8).toUpperCase()}` : "SWC-CONFIRMED",
        );
        setShowSuccessModal(true);
        setStep(4);
        showToast("Complaint submitted and saved successfully!");

        // Reset the form and complaint box after saving
        setWasteType("");
        setLocationStr("");
        setDescription("");
        setPhoto(null);
        setPreviewSrc(null);
        setEvidenceId("");
        setAnalyzed(false);
        setIsAnalyzing(false);
        setScanStepIndex(-1);
        setConfidence(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const errData = await response.json().catch(() => ({}));
        showToast(errData.detail || "Failed to submit complaint to server");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      showToast("Network error during submission");
    }
  };

  const reportAnother = () => {
    setShowSuccessModal(false);
    removePhoto();
  };

  const trackComplaint = () => {
    setShowSuccessModal(false);
    onNavigate("activity");
  };

  // Suggestion chips append text helper
  const handleChipClick = (text) => {
    const sep = description.trim().length ? ", " : "";
    const next = (description + sep + text).slice(0, 300);
    setDescription(next);
  };

  return (
    <div className="swc-page-container wrap">
      {/* Toast Host */}
      <div className="toast-host" id="toastHost">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="crumb">
        <span
          style={{ cursor: "pointer", color: "var(--green)" }}
          onClick={() => onNavigate("dashboard")}
        >
          Home
        </span>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink-950)" }}>SWC</span>
        <span className="sep">/</span>
        <span>Report Issue</span>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-leaf hero-leaf-1"></div>
        <div className="hero-leaf hero-leaf-2"></div>
        <svg className="hero-seal" viewBox="0 0 104 104" aria-hidden="true">
          <g className="seal-spin">
            <circle cx="52" cy="52" r="49" fill="none" stroke="rgba(233,218,169,.4)" strokeWidth="1"/>
            <circle cx="52" cy="52" r="40" fill="none" stroke="rgba(233,218,169,.5)" stroke-width="1" stroke-dasharray="1.5 4.5"/>
            <path id="sealPath" fill="none" d="M 52,52 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"/>
            <text fontSize="7" fontWeight="700" letterSpacing="2.2" fill="rgba(245,238,221,.85)">
              <textPath href="#sealPath" startOffset="1%">SWACHH SAHYOG · CIVIC WASTE NETWORK ·</textPath>
            </text>
          </g>
          <g transform="translate(52,52)">
            <circle r="20" fill="rgba(233,218,169,.08)" stroke="rgba(233,218,169,.55)" strokeWidth="1"/>
            <path d="M-6 8C-10 1 -8 -6 0 -9c-1 5 -1 8 0 12 1 -4 3 -7 7 -8 0 6 -4 12 -7 13" fill="none" stroke="#E9DAA9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
        <div className="hero-copy">
          <span className="hero-eyebrow">Smart Waste Complaint</span>
          <h1 className="hero-title">See a waste problem?<br/><span>Report it.</span></h1>
          <p className="hero-sub">From crop residue and agricultural waste to everyday garbage, share a photo and location and get an AI-assisted recommendation for the right next step.</p>
          <div className="hero-ctas">
            <button 
              className="hero-primary" 
              id="heroReportBtn" 
              type="button"
              onClick={() => {
                const dz = document.getElementById("dropzone");
                if (dz) dz.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => fileInputRef.current?.click(), 450);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Report Waste
            </button>
            <button className="hero-secondary" id="heroMapBtn" type="button" onClick={() => showToast("Map view is ready for your complaint location")}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/></svg>
              View on Map
            </button>
          </div>
          <div className="hero-tags">
            <span className="hero-tag"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></svg>Quick Report</span>
            <span className="hero-tag"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>Location Based</span>
            <span className="hero-tag"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 5 20 3c0 4-2 5-3 10a7 7 0 0 1-6 7Z"/></svg>AI Assisted</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="SWC smart waste visual">
          <img src={swcHero} alt="Rural Indian farmland with crop residue awaiting collection" />
          <div className="hero-visual-badge"><span className="pulse"></span> AI-assisted waste identification</div>
        </div>
        <button className="btn-ghost hero-help" onClick={() => showToast("SWC guides reported crop & civic waste to sanitation channels.")}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>
          How SWC Works?
        </button>
      </div>

      {/* Stepper */}
      <div className="card stepper-card">
        <div className="stepper" id="stepper">
          <div className={`step ${step === 1 ? "active" : step > 1 ? "complete" : ""}`} data-step="1" style={{ position: "relative" }}>
            <div className="step-line"></div>
            <div className="step-num">01</div>
            <div className="step-text"><div className="step-label">Capture</div><div className="step-desc">Take or upload a photo</div></div>
          </div>
          <div className={`step ${step === 2 ? "active" : step > 2 ? "complete" : ""}`} data-step="2" style={{ position: "relative" }}>
            <div className="step-line"></div>
            <div className="step-num">02</div>
            <div className="step-text"><div className="step-label">AI Review</div><div className="step-desc">AI suggests the waste type</div></div>
          </div>
          <div className={`step ${step === 3 ? "active" : step > 3 ? "complete" : ""}`} data-step="3" style={{ position: "relative" }}>
            <div className="step-line"></div>
            <div className="step-num">03</div>
            <div className="step-text"><div className="step-label">Confirm Details</div><div className="step-desc">Add location &amp; description</div></div>
          </div>
          <div className={`step ${step === 4 ? "active" : ""}`} data-step="4" style={{ position: "relative" }}>
            <div className="step-num">04</div>
            <div className="step-text"><div className="step-label">Submit</div><div className="step-desc">Sent to the right team</div></div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        {/* Left Column */}
        <div className="col-left">

          {/* Upload card */}
          <div className="card">
            <div className="card-title">Upload Waste Photo</div>
            <p className="card-sub">Add a clear image so our AI can identify and categorize the waste.</p>

            <div className="upload-grid">
              <div>
                <div 
                  className={`dropzone ${previewSrc ? "has-image" : ""}`} 
                  id="dropzone"
                  onClick={() => { if (!previewSrc) fileInputRef.current?.click(); }}
                >
                  {!previewSrc ? (
                    <div id="dz-empty">
                      <div className="dz-icon">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.9A5 5 0 0 1 6 5.3 6.5 6.5 0 0 1 18.5 8H19a4 4 0 0 1 1 7.87"/><path d="M12 12v9M9 15l3-3 3 3"/></svg>
                      </div>
                      <p className="dz-title">Drop your waste photo here</p>
                      <p className="dz-sub">JPG or PNG · Maximum 10MB</p>
                      <div className="dz-actions">
                        <button 
                          className="btn-solid" 
                          type="button" 
                          id="browseBtn"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                          Browse Files
                        </button>
                        <button 
                          className="btn-outline" 
                          type="button" 
                          id="cameraBtn"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>
                          Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div id="dz-preview" className="img-preview-wrap">
                      <img id="previewImg" src={previewSrc} alt="Uploaded waste photo preview" />
                      <button className="img-close" id="removeImg" aria-label="Remove photo" onClick={(e) => { e.stopPropagation(); removePhoto(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                      <div className="img-preview-bar">
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>waste-photo.jpg</span>
                        <span className="img-quality"><span className="dot"></span> Image Quality: Good</span>
                        <span className="ready-tag">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Ready for AI check
                        </span>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="fileInput" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="tips-box">
                <h5>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M15.09 14c.5-.5.91-1 .91-2a4 4 0 0 0-8 0c0 1 .41 1.5.91 2 .5.5.9 1.2 1 2h4.18c.1-.8.5-1.5 1-2Z"/></svg>
                  Tips for Better Detection
                </h5>
                <ul>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Take a clear photo</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Focus on the waste</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Good lighting</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Avoid zoom blur</li>
                </ul>
              </div>
            </div>

            <div className="analyze-bar">
              <button 
                className="btn-solid analyze-btn" 
                id="analyzeBtn" 
                disabled={!previewSrc || analyzed}
                onClick={startAnalysis}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 4.5L5 9l5.1 1.5L12 15l1.9-4.5L19 9l-5.1-1.5Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/></svg>
                <span>{!previewSrc ? "Upload a photo to continue" : analyzed ? "Analysis Complete" : isAnalyzing ? "Analyzing..." : "Analyze with AI"}</span>
              </button>
            </div>
          </div>

          {/* Waste details form */}
          <div className="card">
            <div className="card-title">Waste Details</div>
            <p class="card-sub">A few details help route your complaint to the right department faster.</p>

            <div className="two-col">
              <div className="field">
                <label htmlFor="wasteType">
                  Waste Type <span className="req">*</span> 
                  {analyzed && <span className="ai-suggested-tag" id="aiSuggestedTag">AI suggested</span>}
                </label>
                <select id="wasteType" value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
                  <option value="">Select type</option>
                  <option>Crop Residue</option>
                  <option>Agricultural Waste</option>
                  <option>Organic Waste</option>
                  <option>Agricultural Plastic</option>
                  <option>Plastic</option>
                  <option>Mixed Waste</option>
                  <option>General Garbage</option>
                  <option>Garbage Accumulation</option>
                  <option>Overflowing Bin</option>
                  <option>Food Waste</option>
                  <option>E-Waste</option>
                  <option>Construction Waste</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="locInput">Location <span className="req">*</span></label>
                <div className="loc-input-row">
                  <input 
                    type="text" 
                    id="locInput" 
                    placeholder="Enter or detect location"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                  />
                  <button className="loc-btn" id="useLocBtn" type="button" aria-label="Use current location" onClick={triggerGPS}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="field">
              <label htmlFor="descInput">Description <span className="req">*</span></label>
              <textarea 
                id="descInput" 
                maxLength="300" 
                placeholder="Describe the issue (e.g., garbage pile, overflowing bin, crop residue, dumped agricultural plastic...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <div className="char-count"><span id="charCount">{description.length}</span>/300</div>
              <div className="desc-chips" id="descChips">
                <button type="button" className="desc-chip" onClick={() => handleChipClick("Large waste pile")}>Large waste pile</button>
                <button type="button" class="desc-chip" onClick={() => handleChipClick("Overflowing bin")}>Overflowing bin</button>
                <button type="button" className="desc-chip" onClick={() => handleChipClick("Crop residue")}>Crop residue</button>
                <button type="button" className="desc-chip" onClick={() => handleChipClick("Dumped plastic")}>Dumped plastic</button>
              </div>
            </div>

            <div className="submit-row">
              <button className="btn-outline" style={{ flex: 0, padding: "13px 20px" }} id="resetBtn" onClick={handleReset}>Reset</button>
              <button 
                className="btn-solid" 
                id="submitBtn" 
                disabled={!analyzed || !wasteType || !locationStr || !description.trim()}
                onClick={handleSubmit}
              >
                Submit Complaint
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-right">

          {/* AI Detection Card */}
          <div className="card" id="aiCard">
            <div className="row-between" style={{ marginBottom: "3px" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>AI Detection Results</div>
              <span className="ai-badge">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 4.5L5 9l5.1 1.5L12 15l1.9-4.5L19 9l-5.1-1.5Z"/></svg>
                AI ASSISTED
              </span>
            </div>
            <p className="card-sub" style={{ marginBottom: "14px" }}>AI suggests the waste type, severity and a suitable next step.</p>

            {/* empty state */}
            {!previewSrc && !isAnalyzing && !analyzed && (
              <div className="ai-empty" id="aiEmpty">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
                <p>Upload a photo to activate AI detection.</p>
              </div>
            )}

            {/* scanning state */}
            {isAnalyzing && (
              <div id="aiScanning">
                <div className="scan-wrap">
                  <img id="scanImg" src={previewSrc} alt="Analyzing preview" />
                  <div className="scan-tint"></div>
                  <div className="scan-line"></div>
                </div>
                <div className="scan-steps" id="scanSteps">
                  <div className={`scan-step ${scanStepIndex >= 0 ? "on" : ""}`} data-i="0">
                    <span className="sicon">
                      {scanStepIndex > 0 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : scanStepIndex === 0 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Checking photo…
                  </div>
                  <div className={`scan-step ${scanStepIndex >= 1 ? "on" : ""}`} data-i="1">
                    <span className="sicon">
                      {scanStepIndex > 1 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : scanStepIndex === 1 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Identifying waste type…
                  </div>
                  <div className={`scan-step ${scanStepIndex >= 2 ? "on" : ""}`} data-i="2">
                    <span className="sicon">
                      {scanStepIndex > 2 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : scanStepIndex === 2 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Estimating severity…
                  </div>
                  <div className={`scan-step ${scanStepIndex >= 3 ? "on" : ""}`} data-i="3">
                    <span className="sicon">
                      {scanStepIndex > 3 ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : scanStepIndex === 3 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Preparing recommendation…
                  </div>
                </div>
              </div>
            )}

            {/* result state */}
            {analyzed && (
              <div className="ai-result fade-up" id="aiResult" style={{ display: "block" }}>
                <div className="ai-suggest-note">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <span>AI suggestion — {wasteType}, 94% confidence. Review before submitting.</span>
                </div>
                <div className="result-top">
                  <img className="result-thumb" id="resultThumb" src={previewSrc} alt="Result thumbnail" />
                  <div className="result-meta">
                    <div className="meta-row"><span className="meta-label">Waste Type</span><span className="meta-val" id="metaWasteType">{wasteType}</span></div>
                    <div className="meta-row"><span className="meta-label">Category</span><span className="meta-val" id="metaCategory">{wasteType.includes("Residue") || wasteType.includes("Agricultural") ? "Agricultural Waste" : "Civic Waste"}</span></div>
                    <div className="meta-row"><span className="meta-label">Severity</span><span className="pill pill-medium" id="metaSeverity">Medium</span></div>
                  </div>
                </div>
                <div className="confidence-row">
                  <div className="ring" id="confRing" style={{ "--pct": confidence }}><span id="confPct">{confidence}%</span></div>
                  <div className="conf-text"><b>AI Confidence Score</b><small>Based on visual patterns in the photo</small></div>
                </div>
                <div className="chips">
                  <div className="chips-label">Detected Materials</div>
                  <div className="chip"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M8 8h8l1 13H7L8 8Z"/></svg>{wasteType.includes("Residue") || wasteType.includes("Organic") ? "Organic" : "Inorganic"}</div>
                  <div className="chip"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 5 20 3c0 4-2 5-3 10a7 7 0 0 1-6 7Z"/></svg>{wasteType}</div>
                </div>

                <div className="next-step-block" id="nextStepBlock">
                  <div className="ns-label">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>
                    Recommended Next Step
                  </div>
                  <div className="ns-type" id="nsType">{nextStep.type}</div>
                  <p className="ns-desc" id="nsDesc">{nextStep.desc}</p>
                </div>

                <div className="info-note">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <p>Your photo helps identify the waste type and speeds up routing to the responsible sanitation team.</p>
                </div>
              </div>
            )}
          </div>

          {/* Location & Routing */}
          <div className={`card ${!analyzed ? "locked" : ""}`} id="routingCard">
            <div className="routing-inner" id="routingInner" style={{ filter: !analyzed ? "blur(3px)" : "none", opacity: !analyzed ? 0.5 : 1, pointerEvents: !analyzed ? "none" : "auto" }}>
              <div className="row-between">
                <div className="card-title">Where This Report Goes</div>
                <a href="#" className="btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={(e) => { e.preventDefault(); showToast("Location coordinate preview matches Ward 24 database."); }}>Change Location</a>
              </div>
              <span className="demo-badge">Demo routing preview</span>

              <div className="routing-preview-mini" id="routingPreviewMini">
                <div className="rpm-row"><span>Location</span><span id="previewLocation">{locationStr || "Village Road, Ward 24"}</span></div>
                <div className="rpm-row"><span>Waste Type</span><span id="previewWasteType">{wasteType || "Crop Residue"}</span></div>
                <div className="rpm-row"><span>Priority</span><span id="previewPriority">Medium</span></div>
                <div className="rpm-row"><span>Suggested Route</span><span id="previewRoute">{nextStep.desc}</span></div>
                <div className="rpm-row"><span>Status</span><span id="previewStatus">{analyzed ? "Ready to submit" : "Waiting for AI review"}</span></div>
              </div>

              <div className="map-box">
                <div className="map-grid"></div>
                <div className="map-pin-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="map-attr">Map data</div>
              </div>
              <div className="routing-block">
                <div className="rb-label">Detected Location</div>
                <div className="rb-val" id="rbLocation">{locationStr || "Village Road"}<br/>Ward 24, XYZ Nagar Nigam</div>
              </div>
              <div className="routing-two">
                <div className="routing-item">
                  <div className="ic"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg></div>
                  <div><b>Responsible Dept.</b><span>Sanitation Department</span></div>
                </div>
                <div className="routing-item">
                  <div className="ic"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="5"/></svg></div>
                  <div><b>Assigned Officer</b><span>Ward Sanitation Officer</span></div>
                </div>
              </div>
              <div className="smart-routing-card" style={{ borderRadius: "var(--r-sm)", padding: "14px" }}>
                <h5><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>Smart Routing</h5>
                <p>Based on the detected waste type and severity, the report can be directed to the appropriate local service or collection route.</p>
              </div>
            </div>
            {!analyzed && (
              <div className="locked-overlay" id="routingLock">
                <div className="lock-ic"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
                <p>Run AI analysis to unlock routing details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports & Waste Pathways: full width at bottom */}
      <div className="card recent-card">
        <div className="row-between" style={{ marginBottom: "10px" }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Recent Reports &amp; Waste Pathways</div>
          <a href="#" style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }} onClick={(e) => { e.preventDefault(); showToast("Showing all verified waste reports..."); }}>View All</a>
        </div>
        <div className="complaint-item">
          <div className="complaint-thumb-wrap"><img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=120&h=120&fit=crop" alt="" /></div>
          <div className="complaint-body">
            <b>Crop Residue</b>
            <div className="loc"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>Village Road, Ward 24</div>
            <div className="time">Today · 10:20 AM</div>
          </div>
          <div className="complaint-tags">
            <span className="pill pill-medium">Medium</span>
            <span className="pill pill-orange">Under Review</span>
          </div>
        </div>
        <div className="complaint-item">
          <div className="complaint-thumb-wrap"><img src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=120&h=120&fit=crop" alt="" /></div>
          <div className="complaint-body">
            <b>Agricultural Plastic</b>
            <div className="loc"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>Farm Road, Ward 24</div>
            <div className="time">Yesterday · 04:15 PM</div>
          </div>
          <div className="complaint-tags">
            <span className="pill pill-high">High</span>
            <span className="pill pill-progress">Collected</span>
          </div>
        </div>
        <div className="complaint-item">
          <div className="complaint-thumb-wrap"><img src="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=120&h=120&fit=crop" alt="" /></div>
          <div className="complaint-body">
            <b>Organic Waste</b>
            <div className="loc"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/></svg>Community Market</div>
            <div className="time">Yesterday · 01:30 PM</div>
          </div>
          <div className="complaint-tags">
            <span className="pill pill-low">Low</span>
            <span className="pill pill-resolved">Resolved</span>
          </div>
        </div>
      </div>

      {/* Impact strip */}
      <div className="impact-strip">
        <div className="impact-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg></div>
          <div><b>Report</b><span>Share a waste problem</span></div>
        </div>
        <div className="impact-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
          <div><b>Identify</b><span>AI suggests the waste type</span></div>
        </div>
        <div className="impact-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg></div>
          <div><b>Route</b><span>Guide it to the right next step</span></div>
        </div>
        <div className="impact-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" stroke-linejoin="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/><path d="m9 12 2 2 4-4"/></svg></div>
          <div><b>Recover</b><span>Find a suitable reuse or processing route</span></div>
        </div>
      </div>

      {/* Summary modal */}
      {showConfirmModal && (
        <div className="modal-bg show">
          <div className="modal-card">
            <h3>Confirm Your Complaint</h3>
            <p className="sub">Please review the details before submitting.</p>
            <div className="summary-row"><span>Waste Type</span><span>{wasteType || "—"}</span></div>
            <div className="summary-row"><span>Category</span><span>{wasteType.includes("Residue") || wasteType.includes("Agricultural") ? "Agricultural Waste" : "Civic Waste"}</span></div>
            <div className="summary-row"><span>Location</span><span>{locationStr || "—"}</span></div>
            <div className="summary-row"><span>Severity</span><span>Medium</span></div>
            <div className="summary-row"><span>Next Step</span><span>{nextStep.desc}</span></div>
            <div className="summary-row"><span>Assigned Department</span><span>Sanitation Department</span></div>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-solid" onClick={confirmSubmit}>Confirm &amp; Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="modal-bg show">
          <div className="modal-card center">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>Complaint Submitted Successfully</h3>
            <p class="sub">Your complaint has been routed to the Sanitation Department.</p>
            <div className="cid">{ticketId}</div>
            <div className="modal-actions">
              <button className="btn-outline" onClick={reportAnother}>Report Another</button>
              <button className="btn-solid" onClick={trackComplaint}>Track Complaint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
