import React, { useState, useEffect } from "react";
import "./auth.css";
import { authApi } from "../../services/authApi";
import { jurisdictionData } from "../../services/jurisdictionData";
import logo from "../../assets/logo.png";

export default function AuthContainer({
  initialPanel = "role",
  initialMode = "login",
  onLoginSuccess,
  onBackToIntro,
}) {
  // Panel States: 'role' | 'civilian' | 'farmer' | 'government'
  const [activePanel, setActivePanel] = useState(initialPanel);

  // Form Modes: 'login' | 'register'
  const [civilianMode, setCivilianMode] = useState(initialMode);
  const [farmerMode, setFarmerMode] = useState(initialMode);

  // Citizen Form State
  const [civilianName, setCivilianName] = useState("");
  const [civilianEmail, setCivilianEmail] = useState("odisha_citizen");
  const [civilianPhone, setCivilianPhone] = useState("");
  const [civilianAddress, setCivilianAddress] = useState("");
  const [civilianPassword, setCivilianPassword] = useState("citizen123");
  const [showCivilianPassword, setShowCivilianPassword] = useState(false);
  const [civilianError, setCivilianError] = useState("");

  // Farmer Form State
  const [farmerName, setFarmerName] = useState("");
  const [farmerEmail, setFarmerEmail] = useState("devinder_singh");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerAddress, setFarmerAddress] = useState("");
  const [farmerPassword, setFarmerPassword] = useState("citizen123");
  const [showFarmerPassword, setShowFarmerPassword] = useState(false);
  const [farmerError, setFarmerError] = useState("");

  // Government Form State
  const [govId, setGovId] = useState("bmc_ward24_officer");
  const [govPassword, setGovPassword] = useState("officer123");
  const [govState, setGovState] = useState("Odisha");
  const [govDistrict, setGovDistrict] = useState("Bhubaneswar");
  const [govArea, setGovArea] = useState("urban"); // 'rural' | 'urban'
  const [govBlock, setGovBlock] = useState("");
  const [govLocalBody, setGovLocalBody] = useState("");
  const [govULB, setGovULB] = useState("Bhubaneswar Municipal Corporation");
  const [govWard, setGovWard] = useState("Ward 12");
  const [govError, setGovError] = useState("");

  // State / District Autocomplete Search States
  const [stateSearch, setStateSearch] = useState("Odisha");
  const [showStateList, setShowStateList] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("Bhubaneswar");
  const [showDistrictList, setShowDistrictList] = useState(false);

  // Global UI States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Sync mode if initialMode changes
  useEffect(() => {
    setCivilianMode(initialMode);
    setFarmerMode(initialMode);
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

  // State selection logic for autocomplete
  const handleStateSelect = (selectedState) => {
    setGovState(selectedState);
    setStateSearch(selectedState);
    setShowStateList(false);
    setGovDistrict("");
    setDistrictSearch("");
    setGovArea("");
    setGovBlock("");
    setGovLocalBody("");
    setGovULB("");
    setGovWard("");
  };

  // District selection logic for autocomplete
  const handleDistrictSelect = (selectedDistrict) => {
    setGovDistrict(selectedDistrict);
    setDistrictSearch(selectedDistrict);
    setShowDistrictList(false);
    setGovArea("");
    setGovBlock("");
    setGovLocalBody("");
    setGovULB("");
    setGovWard("");
  };

  const handleAreaChange = (area) => {
    setGovArea(area);
    setGovBlock("");
    setGovLocalBody("");
    setGovULB("");
    setGovWard("");
  };

  // Submit handler for Citizen Dashboard login or registration
  const handleCivilianSubmit = async (e) => {
    e.preventDefault();
    setCivilianError("");

    if (civilianMode === "login") {
      if (!civilianEmail || !civilianPassword) {
        setCivilianError("Please enter both email/username and password.");
        return;
      }
      setLoading(true);
      try {
        const data = await authApi.login(civilianEmail, civilianPassword);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user || { username: civilianEmail }),
        );
        triggerToast("Login successful — welcome back!");
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } catch (err) {
        setCivilianError(err.message || "Invalid email/phone or password.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!civilianEmail || !civilianPassword) {
        setCivilianError("Email/username and password are required.");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          username: civilianName || civilianEmail.split("@")[0],
          password: civilianPassword,
          role: "citizen",
          email: civilianEmail,
          phone: civilianPhone,
          address: civilianAddress,
        };
        const data = await authApi.register(payload);
        triggerToast("Citizen account created successfully!");
        if (data.access) {
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);
          localStorage.setItem(
            "user",
            JSON.stringify(data.user || { username: payload.username }),
          );
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        } else {
          setTimeout(() => {
            setCivilianMode("login");
          }, 1500);
        }
      } catch (err) {
        setCivilianError(err.message || "Registration failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit handler for Farmer Dashboard login or registration
  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setFarmerError("");

    if (farmerMode === "login") {
      if (!farmerEmail || !farmerPassword) {
        setFarmerError("Please enter both email/username and password.");
        return;
      }
      setLoading(true);
      try {
        const data = await authApi.login(farmerEmail, farmerPassword);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user || { username: farmerEmail }),
        );
        triggerToast("Login successful — welcome back!");
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } catch (err) {
        setFarmerError(err.message || "Invalid email/phone or password.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!farmerEmail || !farmerPassword) {
        setFarmerError("Email/username and password are required.");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          username: farmerName || farmerEmail.split("@")[0],
          password: farmerPassword,
          role: "farmer",
          email: farmerEmail,
          phone: farmerPhone,
          address: farmerAddress,
        };
        const data = await authApi.register(payload);
        triggerToast("Farmer account created successfully!");
        if (data.access) {
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);
          localStorage.setItem(
            "user",
            JSON.stringify(data.user || { username: payload.username }),
          );
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        } else {
          setTimeout(() => {
            setFarmerMode("login");
          }, 1500);
        }
      } catch (err) {
        setFarmerError(err.message || "Registration failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit handler for government jurisdiction
  const handleGovSubmit = async (e) => {
    e.preventDefault();
    setGovError("");

    if (!govId || !govPassword || !govState || !govDistrict || !govArea) {
      setGovError("Please complete all jurisdiction details.");
      return;
    }

    if (govArea === "rural") {
      if (!govBlock || !govLocalBody || !govWard) {
        setGovError("Please select Block, Local Administration, and Ward.");
        return;
      }
    } else {
      if (!govULB || !govWard) {
        setGovError("Please select ULB / Municipality and Ward.");
        return;
      }
    }

    setLoading(true);
    try {
      const loginData = await authApi.login(govId, govPassword);
      localStorage.setItem("access_token", loginData.access);
      localStorage.setItem("refresh_token", loginData.refresh);

      const sessionUser = loginData.user || { username: govId };
      sessionUser.role = "government";
      localStorage.setItem("user", JSON.stringify(sessionUser));

      triggerToast("Your jurisdiction is confirmed. Opening workspace…");
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err) {
      setGovError(
        err.message || "Invalid credentials or jurisdiction configuration.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepLabel = () => {
    if (activePanel === "role") return "Welcome to GramSamridhii";
    if (activePanel === "civilian") return "Citizen access";
    if (activePanel === "farmer") return "Farmer access";
    return "Government access";
  };

  // Autocomplete filtering options
  const stateOptions = Object.keys(jurisdictionData).filter((st) =>
    st.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const districtOptions =
    govState && jurisdictionData[govState]
      ? Object.keys(jurisdictionData[govState]).filter((dist) =>
          dist.toLowerCase().includes(districtSearch.toLowerCase()),
        )
      : [];

  const areaData =
    govState && govDistrict ? jurisdictionData[govState][govDistrict] : null;

  return (
    <div className="auth-page">
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="leafEdge" clipPathUnits="objectBoundingBox">
            <path
              d="M 0.035,0
                     C 0.09,0.12 0.01,0.22 0.055,0.34
                     C 0.10,0.46 0.015,0.56 0.05,0.66
                     C 0.085,0.76 0.02,0.85 0.03,0.94
                     C 0.035,0.97 0.02,0.99 0.015,1
                     L 1,1 L 1,0 Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="app-shell">
        {/* LEFT PANEL: photographic Nature Hero */}
        <section className="hero" aria-hidden="false">
          <div className="hero__top">
            <div className="hero__logo">
              <img src={logo} alt="GramSamridhii logo" />
            </div>
            <div className="hero__brand">
              GramSamridhii
              <span>SMART CIVIC &amp; SUSTAINABLE PLATFORM</span>
            </div>
          </div>

          <div className="hero__mid">
            <h1 className="slogan">
              <span className="type-line type-line--1">Swach Gram.</span>
              <span className="type-line type-line--2">Samridh Kisan.</span>
              <span className="type-line type-line--3">
                Satat <em>Vikas.</em>
              </span>
            </h1>
            <p className="hero__tagline">
              Cleaner communities. Stronger farmers. Smarter governance.
            </p>
          </div>
        </section>

        {/* RIGHT PANEL: login/registration panels card */}
        <section className="form-panel">
          <div className="auth-card">
            <p className="eyebrow">
              <span id="stepLabel">{getStepLabel()}</span>
            </p>

            {/* PANEL 1: ROLE SELECTION */}
            <div className={`panel ${activePanel === "role" ? "active" : ""}`}>
              {onBackToIntro && (
                <button
                  type="button"
                  className="back-btn"
                  style={{ marginBottom: "14px" }}
                  onClick={onBackToIntro}
                >
                  ← Back to Info Page
                </button>
              )}
              <h2>Choose how you'll sign in</h2>
              <p className="sub">
                Select the access that matches your account.
              </p>
              <div className="role-grid">
                <button
                  type="button"
                  className="role-card"
                  onClick={() => {
                    setActivePanel("civilian");
                    setCivilianEmail("odisha_citizen");
                    setCivilianPassword("citizen123");
                    setCivilianMode("login");
                  }}
                >
                  <span className="role-card__icon" aria-hidden="true">
                    🧍
                  </span>
                  <span>
                    <span
                      className="role-card__title"
                      style={{ display: "block" }}
                    >
                      Citizen access
                    </span>
                    <span
                      className="role-card__desc"
                      style={{ display: "block" }}
                    >
                      Report issues, track cleanups, follow your area
                    </span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <button
                  type="button"
                  className="role-card"
                  onClick={() => {
                    setActivePanel("farmer");
                    setFarmerEmail("devinder_singh");
                    setFarmerPassword("citizen123");
                    setFarmerMode("login");
                  }}
                >
                  <span
                    className="role-card__icon"
                    style={{ backgroundColor: "#eaf6ed", color: "#18855a" }}
                    aria-hidden="true"
                  >
                    🌾
                  </span>
                  <span>
                    <span
                      className="role-card__title"
                      style={{ display: "block" }}
                    >
                      Farmer access
                    </span>
                    <span
                      className="role-card__desc"
                      style={{ display: "block" }}
                    >
                      Register land, access advisories and local support
                    </span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <button
                  type="button"
                  className="role-card"
                  onClick={() => {
                    setActivePanel("government");
                  }}
                >
                  <span
                    className="role-card__icon"
                    style={{ backgroundColor: "#eef5df", color: "#638e25" }}
                    aria-hidden="true"
                  >
                    🏛️
                  </span>
                  <span>
                    <span
                      className="role-card__title"
                      style={{ display: "block" }}
                    >
                      Government access
                    </span>
                    <span
                      className="role-card__desc"
                      style={{ display: "block" }}
                    >
                      Manage jurisdiction, respond to citizen reports
                    </span>
                  </span>
                  <span className="role-card__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* PANEL 2: CIVILIAN LOGIN / SIGNUP */}
            <div
              className={`panel ${activePanel === "civilian" ? "active" : ""}`}
            >
              <button
                type="button"
                className="back-btn"
                onClick={() => setActivePanel("role")}
              >
                ← Back
              </button>
              <h2>Citizen access</h2>
              <p className="sub">
                Log in or create your GramSamridhii account.
              </p>

              <div
                className="auth-mode-toggle"
                role="tablist"
                aria-label="Civilian access mode"
              >
                <button
                  type="button"
                  className={civilianMode === "login" ? "active" : ""}
                  onClick={() => {
                    setCivilianMode("login");
                    setCivilianError("");
                  }}
                  role="tab"
                  aria-selected={civilianMode === "login"}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={civilianMode === "register" ? "active" : ""}
                  onClick={() => {
                    setCivilianMode("register");
                    setCivilianError("");
                  }}
                  role="tab"
                  aria-selected={civilianMode === "register"}
                >
                  Create account
                </button>
              </div>

              <form
                onSubmit={handleCivilianSubmit}
                className={civilianMode === "register" ? "create-mode" : ""}
                noValidate
              >
                {civilianMode === "login" && (
                  <div
                    style={{
                      background: "#fcf8ec",
                      border: "1px solid #f2e1b8",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "11.5px",
                      lineHeight: "1.45",
                      marginBottom: "15px",
                      color: "#856404",
                    }}
                  >
                    💡 <b>Demo Access Guide:</b>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        marginTop: "4px",
                        marginFloat: "none",
                        listStyleType: "disc",
                      }}
                    >
                      <li>
                        To test <b>Citizen (Urban Area)</b>: Use{" "}
                        <code>odisha_citizen</code>
                      </li>
                    </ul>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#997305",
                      }}
                    >
                      Use password <code>citizen123</code> to log in.
                    </small>
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
                    required={civilianMode === "register"}
                  />
                </div>
                <div className="field">
                  <label htmlFor="civilianEmail">Email or username</label>
                  <input
                    type="text"
                    id="civilianEmail"
                    value={civilianEmail}
                    onChange={(e) => setCivilianEmail(e.target.value)}
                    placeholder="you@example.com / username"
                    required
                  />
                </div>
                {civilianMode === "register" && (
                  <>
                    <div className="field">
                      <label htmlFor="civilianPhone">Phone number</label>
                      <input
                        type="tel"
                        id="civilianPhone"
                        value={civilianPhone}
                        onChange={(e) => setCivilianPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="civilianAddress">Address</label>
                      <input
                        type="text"
                        id="civilianAddress"
                        value={civilianAddress}
                        onChange={(e) => setCivilianAddress(e.target.value)}
                        placeholder="House/street, town, district, state"
                      />
                    </div>
                  </>
                )}
                <div className="field">
                  <label htmlFor="civilianPassword">Password</label>
                  <div className="password-field">
                    <input
                      type={showCivilianPassword ? "text" : "password"}
                      id="civilianPassword"
                      value={civilianPassword}
                      onChange={(e) => setCivilianPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password"
                      onClick={() =>
                        setShowCivilianPassword(!showCivilianPassword)
                      }
                    >
                      {showCivilianPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="primary" disabled={loading}>
                  {loading
                    ? "Loading..."
                    : civilianMode === "register"
                      ? "Create your account"
                      : "Log in securely"}
                  <span>→</span>
                </button>
                {civilianError && (
                  <p className="form-message" role="alert">
                    {civilianError}
                  </p>
                )}
              </form>
              <p className="fine-print">
                By continuing you agree to GramSamridhi's Terms &amp; Privacy
                Policy.
              </p>
            </div>

            {/* PANEL 3: FARMER LOGIN / SIGNUP */}
            <div
              className={`panel ${activePanel === "farmer" ? "active" : ""}`}
            >
              <button
                type="button"
                className="back-btn"
                onClick={() => setActivePanel("role")}
              >
                ← Back
              </button>
              <h2>Farmer access</h2>
              <p className="sub">Log in or create your GramSamridhi account.</p>

              <div
                className="auth-mode-toggle"
                role="tablist"
                aria-label="Farmer access mode"
              >
                <button
                  type="button"
                  className={farmerMode === "login" ? "active" : ""}
                  onClick={() => {
                    setFarmerMode("login");
                    setFarmerError("");
                  }}
                  role="tab"
                  aria-selected={farmerMode === "login"}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={farmerMode === "register" ? "active" : ""}
                  onClick={() => {
                    setFarmerMode("register");
                    setFarmerError("");
                  }}
                  role="tab"
                  aria-selected={farmerMode === "register"}
                >
                  Create account
                </button>
              </div>

              <form
                onSubmit={handleFarmerSubmit}
                className={farmerMode === "register" ? "create-mode" : ""}
                noValidate
              >
                {farmerMode === "login" && (
                  <div
                    style={{
                      background: "#fcf8ec",
                      border: "1px solid #f2e1b8",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "11.5px",
                      lineHeight: "1.45",
                      marginBottom: "15px",
                      color: "#856404",
                    }}
                  >
                    💡 <b>Demo Access Guide:</b>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        marginTop: "4px",
                        marginFloat: "none",
                        listStyleType: "disc",
                      }}
                    >
                      <li>
                        To test <b>Farmer (Rural Area)</b>: Use{" "}
                        <code>devinder_singh</code>
                      </li>
                    </ul>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#997305",
                      }}
                    >
                      Use password <code>citizen123</code> to log in.
                    </small>
                  </div>
                )}

                <div className="field field--name">
                  <label htmlFor="farmerName">Full name</label>
                  <input
                    type="text"
                    id="farmerName"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="As per ID"
                    required={farmerMode === "register"}
                  />
                </div>
                <div className="field">
                  <label htmlFor="farmerEmail">Email or username</label>
                  <input
                    type="text"
                    id="farmerEmail"
                    value={farmerEmail}
                    onChange={(e) => setFarmerEmail(e.target.value)}
                    placeholder="you@example.com / username"
                    required
                  />
                </div>
                {farmerMode === "register" && (
                  <>
                    <div className="field">
                      <label htmlFor="farmerPhone">Phone number</label>
                      <input
                        type="tel"
                        id="farmerPhone"
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="farmerAddress">Address</label>
                      <input
                        type="text"
                        id="farmerAddress"
                        value={farmerAddress}
                        onChange={(e) => setFarmerAddress(e.target.value)}
                        placeholder="Village / town, block, district, state"
                      />
                    </div>
                  </>
                )}
                <div className="field">
                  <label htmlFor="farmerPassword">Password</label>
                  <div className="password-field">
                    <input
                      type={showFarmerPassword ? "text" : "password"}
                      id="farmerPassword"
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password"
                      onClick={() => setShowFarmerPassword(!showFarmerPassword)}
                    >
                      {showFarmerPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="primary" disabled={loading}>
                  {loading
                    ? "Loading..."
                    : farmerMode === "register"
                      ? "Create your account"
                      : "Log in securely"}
                  <span>→</span>
                </button>
                {farmerError && (
                  <p className="form-message" role="alert">
                    {farmerError}
                  </p>
                )}
              </form>
              <p className="fine-print">
                By continuing you agree to GramSamridhi's Terms &amp; Privacy
                Policy.
              </p>
            </div>

            {/* PANEL 4: GOVERNMENT WORKSPACE CONFIRMATION */}
            <div
              className={`panel ${activePanel === "government" ? "active" : ""}`}
            >
              <button
                type="button"
                className="back-btn"
                onClick={() => setActivePanel("role")}
              >
                ← Back
              </button>
              <h2>Government access</h2>
              <p className="sub">
                Confirm your jurisdiction to open your workspace.
              </p>

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

                {/* State Autocomplete */}
                <div className="field autocomplete">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    value={stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setShowStateList(true);
                    }}
                    onFocus={() => setShowStateList(true)}
                    placeholder="Start typing your state"
                    required
                    autoComplete="off"
                  />
                  {showStateList && stateOptions.length > 0 && (
                    <ul className="autocomplete-list visible" role="listbox">
                      {stateOptions.map((st) => (
                        <li
                          key={st}
                          onClick={() => handleStateSelect(st)}
                          role="option"
                        >
                          {st}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* District Autocomplete */}
                <div className="field autocomplete">
                  <label htmlFor="district">District</label>
                  <input
                    type="text"
                    id="district"
                    value={districtSearch}
                    onChange={(e) => {
                      setDistrictSearch(e.target.value);
                      setShowDistrictList(true);
                    }}
                    onFocus={() => setShowDistrictList(true)}
                    disabled={!govState}
                    placeholder={
                      govState
                        ? "Start typing your district"
                        : "Select a state first"
                    }
                    required
                    autoComplete="off"
                  />
                  {showDistrictList && districtOptions.length > 0 && (
                    <ul className="autocomplete-list visible" role="listbox">
                      {districtOptions.map((dist) => (
                        <li
                          key={dist}
                          onClick={() => handleDistrictSelect(dist)}
                          role="option"
                        >
                          {dist}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="field">
                  <label id="areaLabel">Area type</label>
                  <div
                    className="area-toggle"
                    role="radiogroup"
                    aria-labelledby="areaLabel"
                  >
                    <button
                      type="button"
                      className={govArea === "rural" ? "active" : ""}
                      onClick={() => handleAreaChange("rural")}
                      role="radio"
                      aria-checked={govArea === "rural"}
                      disabled={!govDistrict}
                    >
                      Rural
                    </button>
                    <button
                      type="button"
                      className={govArea === "urban" ? "active" : ""}
                      onClick={() => handleAreaChange("urban")}
                      role="radio"
                      aria-checked={govArea === "urban"}
                      disabled={!govDistrict}
                    >
                      Urban
                    </button>
                  </div>
                </div>

                {/* DYNAMIC JURISDICTION FIELDS */}
                {govArea === "rural" && areaData && areaData.rural && (
                  <div id="jurisdictionFields">
                    <div className="field">
                      <label htmlFor="block">Block</label>
                      <select
                        id="block"
                        value={govBlock}
                        onChange={(e) => setGovBlock(e.target.value)}
                        required
                      >
                        <option value="">Select block</option>
                        {areaData.rural.blocks.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="ruralUnit">Local administration</label>
                      <select
                        id="ruralUnit"
                        value={govLocalBody}
                        onChange={(e) => setGovLocalBody(e.target.value)}
                        required
                      >
                        <option value="">Select local administration</option>
                        {areaData.rural.localBodies.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="ruralWard">Ward number</label>
                      <select
                        id="ruralWard"
                        value={govWard}
                        onChange={(e) => setGovWard(e.target.value)}
                        required
                      >
                        <option value="">Select ward number</option>
                        {["Ward 1", "Ward 2", "Ward 3", "Ward 4"].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {govArea === "urban" && areaData && areaData.urban && (
                  <div id="jurisdictionFields">
                    <div className="field">
                      <label htmlFor="ulb">ULB / municipality</label>
                      <select
                        id="ulb"
                        value={govULB}
                        onChange={(e) => setGovULB(e.target.value)}
                        required
                      >
                        <option value="">Select ulb / municipality</option>
                        {areaData.urban.ulbs.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="urbanWard">Ward number</label>
                      <select
                        id="urbanWard"
                        value={govWard}
                        onChange={(e) => setGovWard(e.target.value)}
                        required
                      >
                        <option value="">Select ward number</option>
                        {areaData.urban.wards.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="primary" disabled={loading}>
                  {loading ? "Confirming..." : "Confirm jurisdiction"}
                  <span>→</span>
                </button>
                {govError && (
                  <p className="form-message" role="alert">
                    {govError}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* TOAST ALERT FEEDBACK */}
      <div
        className={`toast ${toastVisible ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </div>
  );
}
