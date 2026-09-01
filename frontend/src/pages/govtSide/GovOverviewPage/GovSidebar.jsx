import React, { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import { incidentsApi } from "../../../services/incidentsApi";

export default function GovSidebar({
  currentTab,
  setCurrentTab,
  activeLocation,
  user,
  handleLogout,
}) {
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      try {
        const data = await incidentsApi.getAll();
        if (data) {
          const count = data.filter(c => c.status === 'open' || c.status === 'reported' || c.status === 'submitted').length;
          setOpenCount(count);
        }
      } catch (err) {
        console.error("Error loading sidebar count:", err);
      }
    }
    loadCount();
  }, []);

  const getInitials = () => {
    if (user?.username === "Block_level_officer") return "MS";
    if (user?.username === "kudiary_gp_secretary") return "KD";
    return "RB";
  };

  const getDisplayName = () => {
    if (user?.username === "Block_level_officer") return "Mahi Sharma";
    if (user?.username === "kudiary_gp_secretary") return "Kalinga Das";
    return user?.username || "R. Banerjee";
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <img src={logo} alt="GramSamridhi Logo" />
        </div>
        <div className="brand-text">
          <div className="tag">AUTHORITY CONSOLE</div>
        </div>
      </div>

      <div className="nav-label">WORKFLOW</div>
      <nav className="nav">
        <button
          onClick={() => setCurrentTab("overview")}
          className={`nav-item ${currentTab === "overview" || currentTab === "dashboard" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
          Overview
        </button>
        <button
          onClick={() => setCurrentTab("queue")}
          className={`nav-item urgent ${currentTab === "queue" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2 2 21h20L12 2z" />
            <path d="M12 9v5M12 17h.01" />
          </svg>
          Complaint Queue
          <span className="count">{openCount}</span>
        </button>
        <button
          onClick={() => setCurrentTab("map")}
          className={`nav-item ${currentTab === "map" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Live Map
        </button>
        <button
          onClick={() => setCurrentTab("teams")}
          className={`nav-item ${currentTab === "teams" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Sanitation Teams
        </button>
      </nav>

      <div className="nav-label">FARMER PROGRAM</div>
      <nav className="nav">
        <button
          onClick={() => setCurrentTab("schedule")}
          className={`nav-item ${currentTab === "schedule" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Collection Schedule
        </button>
        <button
          onClick={() => setCurrentTab("buyback")}
          className={`nav-item ${currentTab === "buyback" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Residue Buy-Back
        </button>
        <button
          onClick={() => setCurrentTab("analytics")}
          className={`nav-item ${currentTab === "analytics" ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3v18h18" />
            <path d="M7 15l4-6 4 3 5-8" />
          </svg>
          Analytics
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="jurisdiction-chip">
          <div className="lbl">ASSIGNED JURISDICTION</div>
          <div className="val">
            {activeLocation?.name ||
             user?.assigned_area?.name ||
             user?.assigned_ward ||
             user?.location?.name ||
             "Bhubaneshwar Municipal Corp."}
          </div>
        </div>
        <div
          className="official"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (window.confirm("Do you want to logout?")) {
              handleLogout();
            }
          }}
          title="Click to logout"
        >
          <div className="avatar">{getInitials()}</div>
          <div className="who">
            <div className="n">{getDisplayName()}</div>
            <div className="r">Sanitation Department</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
