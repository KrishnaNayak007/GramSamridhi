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
  const dropzoneRef = useRef(null);

  const showToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

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

      // Start upload to server
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiFetch("/api/v1/evidence/upload/", {
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
    const stepTimes = [600, 1200, 1800, 2400];
    stepTimes.forEach((time, index) => {
      setTimeout(() => {
        setScanStepIndex(index);
      }, time);
    });

    // Complete analysis after 3 seconds
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
      if (!wasteType) setWasteType("Garbage Accumulation");
      if (!locationStr) setLocationStr("Park Road, Sector 5, Ward 24");
    }, 3000);
  };

  // Geolocation trigger
  const triggerGPS = () => {
    setLocationStr("Park Road, Sector 5, Ward 24");
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
    const coords = { latitude: 20.296, longitude: 85.824 };

    try {
      const submitData = {
        evidence_id: evidenceId || "mock-evidence-uuid-12345",
        latitude: coords.latitude,
        longitude: coords.longitude,
        description: description,
        category: "garbage_accumulation",
      };

      const response = await apiFetch("/api/v1/reports/", {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        setTicketId(
          data.id || "SWC-2026-" + Math.floor(10000 + Math.random() * 89999),
        );
        setShowSuccessModal(true);
        setStep(4);
        showToast("Complaint submitted successfully");
      } else {
        showToast("Failed to submit complaint to server");
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

  return (
    <div className="wrap">
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
            <circle
              cx="52"
              cy="52"
              r="49"
              fill="none"
              stroke="rgba(233,218,169,.4)"
              strokeWidth="1"
            />
            <circle
              cx="52"
              cy="52"
              r="40"
              fill="none"
              stroke="rgba(233,218,169,.5)"
              strokeWidth="1"
              strokeDasharray="1.5 4.5"
            />
            <path
              id="sealPath"
              fill="none"
              d="M 52,52 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
            />
            <text
              fontSize="7"
              fontWeight="700"
              letterSpacing="2.2"
              fill="rgba(245,238,221,.85)"
            >
              <textPath href="#sealPath" startOffset="1%">
                GramSamridhi · CIVIC WASTE NETWORK ·
              </textPath>
            </text>
          </g>
          <g transform="translate(52,52)">
            <circle
              r="20"
              fill="rgba(233,218,169,.08)"
              stroke="rgba(233,218,169,.55)"
              strokeWidth="1"
            />
            <path
              d="M-6 8C-10 1 -8 -6 0 -9c-1 5 -1 8 0 12 1 -4 3 -7 7 -8 0 6 -4 12 -7 13"
              fill="none"
              stroke="#E9DAA9"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
        <div className="swc-hero-copy">
          <span className="hero-eyebrow">Smart Waste Complaint</span>
          <h1 className="hero-title">
            See it. Report it.
            <br />
            <span>We’ll clean it.</span>
          </h1>
          <p className="hero-sub">
            Spot a waste issue? Capture it, add your location, and let SWC use
            smart detection to route the complaint to the right sanitation team
            — faster.
          </p>
          <div className="hero-ctas">
            <button
              className="hero-primary"
              type="button"
              onClick={() => {
                dropzoneRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                setTimeout(() => fileInputRef.current?.click(), 450);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Report Waste
            </button>
            <button
              className="hero-secondary"
              type="button"
              onClick={() =>
                showToast("Map view is ready for your complaint location")
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
                <path d="M9 3v15M15 6v15" />
              </svg>
              View on Map
            </button>
          </div>
          <div className="hero-tags">
            <span className="hero-tag">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
              </svg>
              Quick Report
            </span>
            <span className="hero-tag">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location Based
            </span>
            <span className="hero-tag">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 5 20 3c0 4-2 5-3 10a7 7 0 0 1-6 7Z" />
              </svg>
              AI Powered
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-label="SWC smart waste visual">
          <img
            src={swcHero}
            alt="Smart Waste Complaint recycling bins in a clean city"
          />
          <div className="hero-visual-badge">
            <span className="pulse"></span> SWC AI Vision Ready
          </div>
        </div>
        <button
          className="btn-ghost hero-help"
          onClick={() =>
            showToast(
              "Capture image -> AI classifies type -> Automatically routes to assigned Officer",
            )
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4" />
            <path d="M12 17h.01" />
          </svg>
          How SWC Works?
        </button>
      </div>

      {/* Stepper */}
      <div className="card stepper-card">
        <div className="stepper" id="stepper">
          <div
            className={`step ${step > 1 ? "complete" : ""} ${step === 1 ? "active" : ""}`}
            data-step="1"
          >
            <div className="step-line"></div>
            <div className="step-num">01</div>
            <div className="step-text">
              <div class="step-label">Upload Photo</div>
              <div class="step-desc">Capture or upload waste image</div>
            </div>
          </div>
          <div
            className={`step ${step > 2 ? "complete" : ""} ${step === 2 ? "active" : ""}`}
            data-step="2"
          >
            <div className="step-line"></div>
            <div className="step-num">02</div>
            <div className="step-text">
              <div class="step-label">AI Detection</div>
              <div class="step-desc">AI analyzes the waste</div>
            </div>
          </div>
          <div
            className={`step ${step > 3 ? "complete" : ""} ${step === 3 ? "active" : ""}`}
            data-step="3"
          >
            <div className="step-line"></div>
            <div className="step-num">03</div>
            <div className="step-text">
              <div class="step-label">Add Details</div>
              <div class="step-desc">Provide location &amp; description</div>
            </div>
          </div>
          <div className={`step ${step === 4 ? "active" : ""}`} data-step="4">
            <div className="step-num">04</div>
            <div className="step-text">
              <div class="step-label">Submit</div>
              <div class="step-desc">Routed to the right authority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="main-grid">
        {/* Left Column (Forms and Uploads) */}
        <div className="col-left">
          {/* Upload card */}
          <div className="card">
            <div className="card-title">Upload Waste Photo</div>
            <p className="card-sub">
              Add a clear image so our AI can identify and categorize the waste.
            </p>

            <div className="upload-grid">
              <div>
                <div
                  ref={dropzoneRef}
                  className={`dropzone ${previewSrc ? "has-image" : ""}`}
                  onClick={() => {
                    if (!previewSrc) fileInputRef.current?.click();
                  }}
                >
                  {!previewSrc ? (
                    <div id="dz-empty">
                      <div className="dz-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 14.9A5 5 0 0 1 6 5.3 6.5 6.5 0 0 1 18.5 8H19a4 4 0 0 1 1 7.87" />
                          <path d="M12 12v9M9 15l3-3 3 3" />
                        </svg>
                      </div>
                      <p className="dz-title">Drop your waste photo here</p>
                      <p className="dz-sub">JPG or PNG · Maximum 10MB</p>
                      <div className="dz-actions">
                        <button
                          className="btn-solid"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M17 8l-5-5-5 5" />
                            <path d="M12 3v12" />
                          </svg>
                          Browse Files
                        </button>
                        <button
                          className="btn-outline"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div id="dz-preview" className="img-preview-wrap">
                      <img
                        id="previewImg"
                        src={previewSrc}
                        alt="Uploaded waste photo preview"
                      />
                      <button
                        className="img-close"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        aria-label="Remove photo"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="img-preview-bar">
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--muted)",
                          }}
                        >
                          waste-photo.jpg
                        </span>
                        <span className="img-quality">
                          <span className="dot"></span> Image Quality: Good
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <div className="tips-box">
                <h5>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6M10 22h4M15.09 14c.5-.5.91-1 .91-2a4 4 0 0 0-8 0c0 1 .41 1.5.91 2 .5.5.9 1.2 1 2h4.18c.1-.8.5-1.5 1-2Z" />
                  </svg>
                  Tips for Better Detection
                </h5>
                <ul>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>{" "}
                    Take a clear photo
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>{" "}
                    Focus on the waste
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>{" "}
                    Good lighting
                  </li>
                  <li>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>{" "}
                    Avoid zoom blur
                  </li>
                </ul>
              </div>
            </div>

            <div className="analyze-bar">
              <button
                className="btn-solid analyze-btn"
                onClick={startAnalysis}
                disabled={!previewSrc || isAnalyzing || analyzed}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.9 4.5L5 9l5.1 1.5L12 15l1.9-4.5L19 9l-5.1-1.5Z" />
                  <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
                </svg>
                <span>
                  {isAnalyzing
                    ? "AI Scanning..."
                    : analyzed
                      ? "AI Analysis Complete"
                      : previewSrc
                        ? "Analyze with AI"
                        : "Upload a photo to continue"}
                </span>
              </button>
            </div>
          </div>

          {/* Waste details form */}
          <div className="card">
            <div className="card-title">Waste Details</div>
            <p class="card-sub">
              A few details help route your complaint to the right department
              faster.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="two-col">
                <div className="field">
                  <label>
                    Waste Type <span className="req">*</span>
                  </label>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Garbage Accumulation">
                      Garbage Accumulation
                    </option>
                    <option value="Overflowing Bin">Overflowing Bin</option>
                    <option value="Plastic Waste">Plastic Waste</option>
                    <option value="Food Waste">Food Waste</option>
                    <option value="E-Waste">E-Waste</option>
                    <option value="Construction Waste">
                      Construction Waste
                    </option>
                    <option value="Mixed Waste">Mixed Waste</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>
                    Location <span className="req">*</span>
                  </label>
                  <div className="loc-input-row">
                    <input
                      type="text"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      placeholder="Enter or detect location"
                      required
                    />
                    <button
                      className="loc-btn"
                      type="button"
                      onClick={triggerGPS}
                      aria-label="Use current location"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>
                  Description <span className="req">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  maxLength={300}
                  placeholder="Describe the issue (e.g., garbage pile, overflowing bin, etc.)"
                  required
                />
                <div className="char-count">
                  <span>{description.length}</span>/300
                </div>
              </div>

              <div className="submit-row">
                <button
                  className="btn-outline"
                  style={{ flex: 0, padding: "13px 20px" }}
                  type="button"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  className="btn-solid"
                  type="submit"
                  disabled={!analyzed}
                >
                  Submit Complaint
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-right">
          {/* AI Detection Card */}
          <div className="card" id="aiCard">
            <div className="row-between" style={{ marginBottom: "3px" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                AI Detection Results
              </div>
              <span className="ai-badge">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.9 4.5L5 9l5.1 1.5L12 15l1.9-4.5L19 9l-5.1-1.5Z" />
                </svg>
                AI POWERED
              </span>
            </div>
            <p className="card-sub" style={{ marginBottom: "14px" }}>
              AI checks the photo and prepares a faster, smarter complaint.
            </p>

            {/* Empty State */}
            {!previewSrc && !isAnalyzing && !analyzed && (
              <div className="ai-empty">
                <div className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
                <p>Upload a photo to activate AI detection.</p>
              </div>
            )}

            {/* Scanning State */}
            {isAnalyzing && (
              <div id="aiScanning">
                <div className="scan-wrap">
                  <img src={previewSrc} alt="Preview" />
                  <div className="scan-tint"></div>
                  <div className="scan-line"></div>
                </div>
                <div className="scan-steps">
                  <div
                    className={`scan-step ${scanStepIndex >= 0 ? "on" : ""}`}
                  >
                    <span className="sicon">
                      {scanStepIndex > 0 ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : scanStepIndex === 0 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Scanning image…
                  </div>
                  <div
                    className={`scan-step ${scanStepIndex >= 1 ? "on" : ""}`}
                  >
                    <span className="sicon">
                      {scanStepIndex > 1 ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : scanStepIndex === 1 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Identifying waste type…
                  </div>
                  <div
                    className={`scan-step ${scanStepIndex >= 2 ? "on" : ""}`}
                  >
                    <span className="sicon">
                      {scanStepIndex > 2 ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : scanStepIndex === 2 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Estimating severity…
                  </div>
                  <div
                    className={`scan-step ${scanStepIndex >= 3 ? "on" : ""}`}
                  >
                    <span className="sicon">
                      {scanStepIndex > 3 ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : scanStepIndex === 3 ? (
                        <span className="spinner"></span>
                      ) : null}
                    </span>
                    Determining category…
                  </div>
                </div>
              </div>
            )}

            {/* Results State */}
            {analyzed && (
              <div className="ai-result" style={{ display: "block" }}>
                <div className="result-top">
                  <img
                    className="result-thumb"
                    src={previewSrc}
                    alt="Result thumbnail"
                  />
                  <div className="result-meta">
                    <div className="meta-row">
                      <span className="meta-label">Waste Type</span>
                      <span className="meta-val">
                        {wasteType || "Garbage Accumulation"}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Category</span>
                      <span className="meta-val">Mixed Waste</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Severity</span>
                      <span className="pill pill-high">High</span>
                    </div>
                  </div>
                </div>
                <div className="confidence-row">
                  <div className="ring" style={{ "--pct": confidence }}>
                    <span>{confidence}%</span>
                  </div>
                  <div className="conf-text">
                    <b>AI Confidence Score</b>
                    <small>
                      High confidence detection based on visual patterns
                    </small>
                  </div>
                </div>
                <div className="chips">
                  <div className="chip">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 8h14l-1 12H6L5 8Z" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                    </svg>
                    Plastic
                  </div>
                  <div className="chip">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v6M8 8h8l1 13H7L8 8Z" />
                    </svg>
                    Food Waste
                  </div>
                  <div className="chip">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 3h9l3 3v15H6V3Z" />
                      <path d="M9 12h6M9 16h6" />
                    </svg>
                    Paper
                  </div>
                  <div className="chip">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12h8" />
                    </svg>
                    Other
                  </div>
                </div>
                <div className="info-note">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p>
                    Your photo helps identify the waste type and speeds up
                    routing to the responsible sanitation team.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location & Routing */}
          <div className={`card ${!analyzed ? "locked" : ""}`} id="routingCard">
            <div className="locked-inner">
              <div className="row-between">
                <div className="card-title">Location &amp; Routing</div>
                <span
                  className="btn-ghost"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    showToast("Editing coordinates via map is enabled")
                  }
                >
                  Change Location
                </span>
              </div>
              <div className="map-box" style={{ marginTop: "10px" }}>
                <div className="map-grid"></div>
                <div className="map-pin-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="map-attr">Map data</div>
              </div>
              <div className="routing-block">
                <div className="rb-label">Detected Location</div>
                <div className="rb-val">
                  Park Road, Sector 5<br />
                  Ward 24, XYZ Nagar Nigam
                </div>
              </div>
              <div className="routing-two">
                <div className="routing-item">
                  <div className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 9h18" />
                    </svg>
                  </div>
                  <div>
                    <b>Responsible Dept.</b>
                    <span>Sanitation Department</span>
                  </div>
                </div>
                <div className="routing-item">
                  <div className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="8" r="5" />
                    </svg>
                  </div>
                  <div>
                    <b>Assigned Officer</b>
                    <span>Ward Sanitation Officer</span>
                  </div>
                </div>
              </div>
              <div
                className="smart-routing-card"
                style={{ borderRadius: "var(--r-sm)", padding: "14px" }}
              >
                <h5>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                  </svg>
                  Smart Routing
                </h5>
                <p>
                  Based on the detected location and waste category, your
                  complaint will be routed to the responsible municipal
                  department.
                </p>
              </div>
            </div>
            {!analyzed && (
              <div className="locked-overlay">
                <div className="lock-ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <p>Run AI analysis to unlock routing details</p>
              </div>
            )}
          </div>

          {/* Recent Complaints */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: "10px" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                Recent Complaints Nearby
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--green)",
                  cursor: "pointer",
                }}
                onClick={() => onNavigate("activity")}
              >
                View All
              </span>
            </div>

            <div className="complaint-item">
              <div className="complaint-thumb-wrap">
                <img
                  src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=120&h=120&fit=crop"
                  alt="Garbage accumulation"
                />
              </div>
              <div className="complaint-body">
                <b>Garbage Accumulation</b>
                <div className="loc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  </svg>
                  Park Road, Sector 5
                </div>
                <div className="time">14 May 2025 · 10:10 AM</div>
              </div>
              <div className="complaint-tags">
                <span className="pill pill-high">High</span>
                <span className="pill pill-orange">In Progress</span>
              </div>
            </div>

            <div className="complaint-item">
              <div className="complaint-thumb-wrap">
                <img
                  src="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=120&h=120&fit=crop"
                  alt="Overflowing bin"
                />
              </div>
              <div className="complaint-body">
                <b>Overflowing Bin</b>
                <div className="loc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  </svg>
                  Green Park Main Road
                </div>
                <div className="time">13 May 2025 · 04:15 PM</div>
              </div>
              <div className="complaint-tags">
                <span className="pill pill-medium">Medium</span>
                <span className="pill pill-resolved">Resolved</span>
              </div>
            </div>

            <div className="complaint-item">
              <div className="complaint-thumb-wrap">
                <img
                  src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=120&h=120&fit=crop"
                  alt="Construction waste"
                />
              </div>
              <div className="complaint-body">
                <b>Construction Waste</b>
                <div className="loc">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  </svg>
                  Lake View Colony
                </div>
                <div className="time">12 May 2025 · 09:40 AM</div>
              </div>
              <div className="complaint-tags">
                <span className="pill pill-low">Low</span>
                <span className="pill pill-progress">Assigned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Strip */}
      <div className="impact-strip">
        <div className="impact-item">
          <div className="ic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
            </svg>
          </div>
          <div>
            <b>Report</b>
            <span>Report waste issues in your area</span>
          </div>
        </div>
        <div className="impact-item">
          <div className="ic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div>
            <b>AI Detect</b>
            <span>Automatically categorize the waste</span>
          </div>
        </div>
        <div className="impact-item">
          <div className="ic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6" />
            </svg>
          </div>
          <div>
            <b>Smart Route</b>
            <span>Send it to the right authority</span>
          </div>
        </div>
        <div className="impact-item">
          <div className="ic">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <b>Resolve</b>
            <span>Build a cleaner, greener city</span>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showConfirmModal && (
        <div className="modal-bg show">
          <div className="modal-card">
            <h3>Confirm Your Complaint</h3>
            <p className="sub">Please review the details before submitting.</p>
            <div className="summary-row">
              <span>Waste Type</span>
              <span>{wasteType}</span>
            </div>
            <div className="summary-row">
              <span>Location</span>
              <span>{locationStr}</span>
            </div>
            <div className="summary-row">
              <span>Severity</span>
              <span>High</span>
            </div>
            <div className="summary-row">
              <span>Assigned Department</span>
              <span>Sanitation Department</span>
            </div>
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button className="btn-solid" onClick={confirmSubmit}>
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-bg show">
          <div className="modal-card center">
            <div className="success-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3>Complaint Submitted Successfully</h3>
            <p className="sub">
              Your complaint has been routed to the Sanitation Department.
            </p>
            <div className="cid">{ticketId}</div>
            <div className="modal-actions">
              <button className="btn-outline" onClick={reportAnother}>
                Report Another
              </button>
              <button className="btn-solid" onClick={trackComplaint}>
                Track Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
