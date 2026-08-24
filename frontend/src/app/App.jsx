import React, { useState, useEffect } from "react";
import { useLocationContext } from "./LocationContext";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import IntroPage from "../pages/citizenside/IntroPage/IntroPage";
import logo from "../assets/logo.png";

// Import pages
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import SwcPage from "../pages/citizenside/SwcPage/SwcPage";
import SurplusPage from "../pages/citizenside/SurplusPage/SurplusPage";
import ImpactPage from "../pages/citizenside/ImpactPage/ImpactPage";
import MyActivityPage from "../pages/citizenside/MyActivityPage/MyActivityPage";
import SettingsPage from "../pages/citizenside/SettingsPage/SettingsPage";
import GovOverviewPage from "../pages/govtSide/GovOverviewPage/GovOverviewPage";
import GovQueuePage from "../pages/govtSide/GovQueuePage/GovQueuePage";
import GovMapPage from "../pages/govtSide/GovMapPage/GovMapPage";
import GovTeamsPage from "../pages/govtSide/GovTeamsPage/GovTeamsPage";
import GovAnalyticsPage from "../pages/govtSide/GovAnalyticsPage/GovAnalyticsPage";
import GovSlaPage from "../pages/govtSide/GovSlaPage/GovSlaPage";
import GovResolvedPage from "../pages/govtSide/GovResolvedPage/GovResolvedPage";
import GovSidebar from "../pages/govtSide/GovOverviewPage/GovSidebar";
import GovNavbar from "../pages/govtSide/GovOverviewPage/GovNavbar";
import GovBuybackPage from "../pages/govtSide/GovBuybackPage/GovBuybackPage";
import FarmerSidebar from "../pages/AgricultureSide/FarmerSidebar";
import FarmerNavbar from "../pages/AgricultureSide/FarmerNavbar";
import "../pages/govtSide/GovOverviewPage/GovSidebar.css";
import "../pages/govtSide/GovOverviewPage/GovNavbar.css";
import "../pages/AgricultureSide/FarmerDashboardPage.css";

export default function App() {
  const { activeLocation } = useLocationContext();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [authView, setAuthView] = useState("intro"); // 'intro' | 'login' | 'signup'
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [user, setUser] = useState(null);

  // Sync auth state and load user details
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      } catch (err) {
        setUser({ username: "odisha_citizen" });
      }
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentTab("dashboard");
  };

  if (!isAuthenticated) {
    if (authView === "intro") {
      return (
        <IntroPage
          onLoginClick={() => setAuthView("login")}
          onGetStartedClick={() => setAuthView("signup")}
        />
      );
    }
    if (authView === "signup") {
      return (
        <SignupPage
          onSignupSuccess={() => {
            setIsAuthenticated(true);
            setAuthView("login");
          }}
          onBackToIntro={() => setAuthView("intro")}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBackToIntro={() => setAuthView("intro")}
      />
    );
  }

  // Active page router mapping
  const renderActivePage = () => {
    const isOfficer =
      user?.role === "officer" ||
      user?.role === "government" ||
      user?.username?.includes("officer");

    if (isOfficer) {
      switch (currentTab) {
        case "overview":
        case "dashboard":
          return <GovOverviewPage onNavigate={setCurrentTab} />;
        case "queue":
          return <GovQueuePage />;
        case "map":
          return <GovMapPage />;
        case "teams":
          return <GovTeamsPage />;
        case "analytics":
          return <GovAnalyticsPage />;
        case "buyback":
          return <GovBuybackPage />;
        case "resolved":
          return <GovResolvedPage />;
        case "sla":
          return <GovSlaPage />;
        case "settings":
          return <SettingsPage />;
        default:
          return <GovOverviewPage />;
      }
    }

    switch (currentTab) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentTab} user={user} />;
      case "swc":
        return <SwcPage onNavigate={setCurrentTab} />;
      case "surplus":
        return <SurplusPage />;
      case "impact":
        return <ImpactPage />;
      case "activity":
        return <MyActivityPage />;
      case "settings":
        return <SettingsPage />;
      case "help":
        return (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              fontFamily: "var(--font-body)",
              minHeight: "60vh",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--ink-950)",
                marginBottom: "10px",
              }}
            >
              Help & Support
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--ink-500)",
                lineHeight: "1.6",
              }}
            >
              If you have any issues with complaint registration, municipal
              coordination, or surplus claiming, please reach out to your local
              Ward Officer or submit a ticket here.
            </p>
          </div>
        );
      default:
        return <DashboardPage onNavigate={setCurrentTab} user={user} />;
    }
  };

  const isOfficer =
    user?.role === "officer" ||
    user?.role === "government" ||
    user?.username?.includes("officer");

  if (isOfficer) {
    return (
      <div className="gov-shell">
        <GovSidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeLocation={activeLocation}
          user={user}
          handleLogout={handleLogout}
        />

        <main className="main">
          <GovNavbar
            handleLogout={handleLogout}
            activeLocation={activeLocation}
            setCurrentTab={setCurrentTab}
          />

          <div className="content">{renderActivePage()}</div>
        </main>
      </div>
    );
  }

  const isFarmer =
    user?.role === "farmer" ||
    user?.username?.includes("farmer") ||
    user?.username === "devinder_singh";

  if (isFarmer) {
    return (
      <div className="farmer-shell">
        <FarmerSidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
        />

        <main className="farmer-main-content">
          <FarmerNavbar handleLogout={handleLogout} user={user} />

          <div className="farmer-page-content">{renderActivePage()}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand brand-vertical">
          <img className="brand-logo" src={logo} alt="GramSamridhii logo" />
          <span className="brand-tagline">Swach Gram • Samridh Kisan</span>
        </div>

        <nav className="nav-group">
          <div
            className="nav-section"
            style={{
              fontSize: "8.5px",
              fontWeight: 700,
              letterSpacing: "1.45px",
              color: "#77847d",
              padding: "7px 11px 6px",
            }}
          >
            PLATFORM
          </div>

          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`nav-item nav-item-btn ${currentTab === "dashboard" ? "active" : ""}`}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9v11h14V9" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                Home
              </strong>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("swc")}
            className={`nav-item nav-item-btn ${currentTab === "swc" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                SWC
              </strong>
              <small
                style={{
                  display: "block",
                  fontSize: "9.5px",
                  color: "#88988e",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                Smart Waste Complaint
              </small>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("surplus")}
            className={`nav-item nav-item-btn ${currentTab === "surplus" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
              <path d="M12 8c-1.5-3-6-3-6-.5S9 8 12 8Zm0 0c1.5-3 6-3 6-.5S15 8 12 8Z" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                SURPLUS
              </strong>
              <small
                style={{
                  display: "block",
                  fontSize: "9.5px",
                  color: "#88988e",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                Resource Exchange
              </small>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("activity")}
            className={`nav-item nav-item-btn ${currentTab === "activity" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6h11M9 12h11M9 18h11" />
              <path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                My Activity
              </strong>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("impact")}
            className={`nav-item nav-item-btn ${currentTab === "impact" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                Impact
              </strong>
              <small
                style={{
                  display: "block",
                  fontSize: "9.5px",
                  color: "#88988e",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                System Outcomes
              </small>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("settings")}
            className={`nav-item nav-item-btn ${currentTab === "settings" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                Settings
              </strong>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab("help")}
            className={`nav-item nav-item-btn ${currentTab === "help" ? "active" : ""}`}
            style={{ marginTop: "5px" }}
          >
            <svg
              className="nav-ic"
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
            <span>
              <strong
                style={{ display: "block", fontSize: "13px", fontWeight: 600 }}
              >
                Help & Support
              </strong>
            </span>
          </button>
        </nav>

        <div className="sidebar-foot" style={{ marginTop: "auto" }}>
          <strong>GramSamridhi</strong>
          <span>One platform. Three outcomes.</span>
          <span>
            Cleaner communities, supported farmer participation and sustainable
            resource recovery.
          </span>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* TOPBAR HEADER */}
        <header className="topbar">
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => alert("Sidebar menu")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="header-left">
            <div className="loc-pill" onClick={() => alert("Location options")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                {activeLocation
                  ? activeLocation.name
                  : "Bhadana Village, Karnal, Haryana"}
              </span>
              <svg
                className="chev"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div className="header-tagline">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 2 2 4a7 7 0 0 1-10 14Z" />
                <path d="M9 22a1 1 0 0 1-1-1v-3" />
              </svg>
              <span>TOGETHER FOR A CLEANER TOMORROW</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="mode-toggle"
              title="Toggle theme"
              onClick={() => alert("Dark mode coming soon")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <button
              className="bell-wrap"
              onClick={() => alert("2 new notifications pending")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m10.3 13a3 3 0 0 1-5.6 0" />
              </svg>
              <span className="badge-dot">2</span>
            </button>

            <div
              className="user-chip"
              onClick={() => {
                if (window.confirm("Do you want to logout?")) {
                  handleLogout();
                }
              }}
            >
              <div className="avatar">
                {(user?.username || "UC").substring(0, 2).toUpperCase()}
              </div>
              <div className="user-chip-text">
                <span className="user-name">
                  {user ? user.username : "odisha_citizen"}
                </span>
                <span className="user-role">Urban Citizen</span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </header>

        {/* ACTIVE ROUTE CONTENT */}
        <div className="content">{renderActivePage()}</div>
      </main>

      {/* FLOATING AI CIVIC ASSISTANT */}
      <div
        className="civic-assistant"
        onClick={() =>
          alert(
            "Ask SwachSahyog: Speak in regional languages or voice commands to report waste!",
          )
        }
      >
        <div className="ca-icon">🎙️</div>
        <div>
          <span className="ca-title">Ask SwachSahyog</span>
          <span className="ca-sub">Voice & regional language</span>
        </div>
      </div>
    </div>
  );
}
