import React, { useState, useEffect, useRef } from "react";
import "./HelpPage.css";

const FAQ_DATA = [
  {
    category: "collection",
    question: "How do I request residue pickup?",
    answer: "Go to your Farm Dashboard or Residue Collection tab and tap 'Request pickup'. Choose your residue type and estimated quantity, and a collection partner will be assigned to you automatically."
  },
  {
    category: "collection",
    question: "How can I track my pickup?",
    answer: "Open Residue Collection on your dashboard to see live status — confirmed, partner assigned, scheduled, and processed in real time."
  },
  {
    category: "collection",
    question: "What happens after I request collection?",
    answer: "A local collection partner is assigned within 1–2 days, a pickup slot is scheduled, and once collected your compost credit is issued automatically."
  },
  {
    category: "collection",
    question: "Can I reschedule my pickup?",
    answer: "Yes. Raise a support request below with category 'Pickup Scheduling' and your preferred new time, and our coordination team will confirm it with you."
  },
  {
    category: "collection",
    question: "What types of crop residue can be collected?",
    answer: "Paddy straw, wheat straw, sugarcane trash, and mixed agricultural crop residues are all accepted for collection and bio-processing."
  },
  {
    category: "compost",
    question: "How do I earn compost credits?",
    answer: "Every time your crop residue or organic waste is collected and processed, compost credit is added to your account based on the verified weight."
  },
  {
    category: "compost",
    question: "How can I use compost for my farm?",
    answer: "Use 'Request compost' on your dashboard to redeem available credit. A field coordinator will confirm delivery directly to your farm."
  },
  {
    category: "krishisahyog",
    question: "What is KrishiSahyog?",
    answer: "KrishiSahyog is your AI farming companion. Ask it about crop health, residue management, soil health, or organic practices in your own regional language."
  },
  {
    category: "krishisahyog",
    question: "Can KrishiSahyog help me with crop problems?",
    answer: "Yes — describe the issue or crop symptom in the AI Assistant on your dashboard and KrishiSahyog will suggest simple, organic next steps."
  },
  {
    category: "schemes",
    question: "How can I find government schemes?",
    answer: "Open Government Schemes on your dashboard to see schemes you are eligible for, such as PKVY, Sub-Mission on Agricultural Mechanization, along with step-by-step application guidance."
  },
  {
    category: "report",
    question: "How do I report a problem?",
    answer: "Use 'Raise a support request' below, choose 'Technical Issue' or the relevant category, and describe what happened. Our team responds within 24 hours."
  },
  {
    category: "account",
    question: "How can I contact Swachh Sahyog support?",
    answer: "Use Chat with Support, Call Support (toll-free 1800-11-2000), or raise a ticket below — our support team typically responds within 1 business day."
  }
];

const DEFAULT_REQUESTS = [
  { id: "#SS-20481", title: "Pickup scheduling issue", status: "In Progress", updated: "Today" },
  { id: "#SS-20372", title: "Compost availability", status: "Resolved", updated: "2 days ago" }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndices, setOpenFaqIndices] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  // Modals
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatLog, setChatLog] = useState([
    { id: 1, sender: "agent", text: "Hello! I'm here to help with your Swachh Sahyog account. What can I help you with today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState("");

  // Support requests list
  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem("ssSupportRequests");
      return stored ? JSON.parse(stored) : DEFAULT_REQUESTS;
    } catch {
      return DEFAULT_REQUESTS;
    }
  });

  // Support Form state
  const [formData, setFormData] = useState({
    name: "",
    farmerId: "",
    phone: "",
    contactMethod: "Phone call",
    category: "",
    service: "",
    description: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const raiseFormRef = useRef(null);
  const requestsListRef = useRef(null);
  const faqCardRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndices((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCategoryClick = (catKey) => {
    if (activeCategory === catKey) {
      setActiveCategory("all");
    } else {
      setActiveCategory(catKey);
      setSearchQuery("");
      faqCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: chatInput.trim() };
    setChatLog((prev) => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "agent",
          text: "Thanks — a support coordinator will follow up shortly. You can also browse the FAQs or raise a ticket below."
        }
      ]);
    }, 600);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.phone.trim()) errors.phone = true;
    if (!formData.category) errors.category = true;
    if (!formData.description.trim()) errors.description = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please fill in the required fields.");
      return;
    }
    setFormErrors({});

    const newId = `#SS-${Math.floor(20000 + Math.random() * 900)}`;
    const newReq = {
      id: newId,
      title: `${formData.category}${formData.service ? " · " + formData.service : ""}`,
      status: "Open",
      updated: "Today",
      description: formData.description,
      name: formData.name,
      phone: formData.phone
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    try {
      localStorage.setItem("ssSupportRequests", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setCreatedRequestId(newId);
    setSuccessModalOpen(true);
    setFormData({
      name: "",
      farmerId: "",
      phone: "",
      contactMethod: "Phone call",
      category: "",
      service: "",
      description: ""
    });
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") return "resolved";
    if (status === "In Progress") return "progress";
    return "open";
  };

  return (
    <div className="help-page-container">
      {/* Top Header */}
      <div className="help-header">
        <div>
          <span className="help-breadcrumb">Support Center</span>
          <h1>How can we help you?</h1>
          <p>Get quick answers, contact our support team, or get help with your farm activities.</p>
        </div>
        <div className="help-status">
          <span className="dot"></span> Support available (9 AM – 6 PM)
        </div>
      </div>

      {/* Search Bar */}
      <div className="help-card help-search-card">
        <h2>Search for help</h2>
        <div className="help-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
          </svg>
          <input
            type="text"
            id="helpSearchInput"
            placeholder="Search questions, pickup, compost, soil, schemes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveCategory("all");
            }}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Category Cards */}
      <div className="help-categories">
        <button
          type="button"
          className={`help-cat-card ${activeCategory === "collection" ? "active" : ""}`}
          onClick={() => handleCategoryClick("collection")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
            </svg>
          </span>
          <b>Residue Collection</b>
          <small>Pickup, scheduling and collection</small>
        </button>

        <button
          type="button"
          className={`help-cat-card ${activeCategory === "compost" ? "active" : ""}`}
          onClick={() => handleCategoryClick("compost")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21c4-3 6-6.2 6-9.6C18 7.6 15.3 4 12 2 8.7 4 6 7.6 6 11.4 6 14.8 8 18 12 21Z" /><path d="M12 21v-7" />
            </svg>
          </span>
          <b>Compost &amp; Soil</b>
          <small>Compost, soil health and usage</small>
        </button>

        <button
          type="button"
          className={`help-cat-card ${activeCategory === "krishisahyog" ? "active" : ""}`}
          onClick={() => handleCategoryClick("krishisahyog")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5V6a2 2 0 0 1 2-2h13.5v14H7a2 2 0 0 0-2 2Z" /><path d="M6 17.5h13.5" /><path d="M8 8h9M8 11.2h9" />
            </svg>
          </span>
          <b>KrishiSahyog</b>
          <small>Get AI-powered farming guidance</small>
        </button>

        <button
          type="button"
          className={`help-cat-card ${activeCategory === "schemes" ? "active" : ""}`}
          onClick={() => handleCategoryClick("schemes")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21h16" /><path d="M5 21V10.5L12 5l7 5.5V21" /><path d="M9.5 21v-6h5v6" />
            </svg>
          </span>
          <b>Government Schemes</b>
          <small>Find schemes and farmer benefits</small>
        </button>

        <button
          type="button"
          className={`help-cat-card ${activeCategory === "account" ? "active" : ""}`}
          onClick={() => handleCategoryClick("account")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 6.6l1.4-1.4M19.4 17.4l1.4 1.4M4.6 6.6 3.2 5.2M4.6 17.4l-1.4 1.4M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
          </span>
          <b>Account &amp; Dashboard</b>
          <small>Manage your profile &amp; records</small>
        </button>

        <button
          type="button"
          className={`help-cat-card ${activeCategory === "report" ? "active" : ""}`}
          onClick={() => handleCategoryClick("report")}
        >
          <span className="help-cat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 10v4M12 17h.01" />
            </svg>
          </span>
          <b>Report a Problem</b>
          <small>Something isn't working?</small>
        </button>
      </div>

      {/* FAQ Accordion Card */}
      <div className="help-card help-faq-card" ref={faqCardRef}>
        <div className="help-faq-head">
          <h2>Frequently asked questions</h2>
          <span className="help-faq-count">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <div className="faq-list">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = !!openFaqIndices[idx];
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button type="button" className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{faq.question}</span>
                  <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 9.5 12 15l6-5.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
          {filteredFaqs.length === 0 && (
            <p className="faq-empty">No matching questions found. Try a different search term.</p>
          )}
        </div>
      </div>

      {/* Contact Options Card */}
      <div className="help-card help-contact-card">
        <h2>Still need help?</h2>
        <p>Our support team is here to help you.</p>
        <div className="help-support-grid">
          <div className="support-option">
            <span className="support-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4z" />
              </svg>
            </span>
            <b>Chat with Support</b>
            <small>Get real-time assistance from our support team.</small>
            <button className="support-btn" type="button" onClick={() => setChatModalOpen(true)}>
              Start chat
            </button>
          </div>

          <div className="support-option">
            <span className="support-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 4.5 5.5a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <b>Call Support</b>
            <small>Talk directly with our dedicated toll-free desk.</small>
            <button
              className="support-btn"
              type="button"
              onClick={() => showToast("Connecting you to farmer support: 1800-11-2000 (toll-free).")}
            >
              Call support
            </button>
          </div>

          <div className="support-option">
            <span className="support-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 10v4M12 17h.01" />
              </svg>
            </span>
            <b>Raise a Request</b>
            <small>Tell us about your issue and we'll track it.</small>
            <button
              className="support-btn"
              type="button"
              onClick={() => raiseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              Create request
            </button>
          </div>
        </div>
      </div>

      {/* Raise Support Request Form */}
      <div className="help-card help-form-card" ref={raiseFormRef} id="raiseRequest">
        <h2>Raise a support request</h2>
        <form className="help-form" onSubmit={handleFormSubmit} noValidate>
          <div className="form-row">
            <label>
              Full Name *
              <input
                type="text"
                value={formData.name}
                className={formErrors.name ? "field-error" : ""}
                placeholder="Enter your name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
            <label>
              Farmer ID (Optional)
              <input
                type="text"
                value={formData.farmerId}
                placeholder="SS-10284"
                onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Phone Number *
              <input
                type="tel"
                value={formData.phone}
                className={formErrors.phone ? "field-error" : ""}
                placeholder="+91 98765 43210"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>
            <label>
              Preferred contact method
              <select
                value={formData.contactMethod}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
              >
                <option>Phone call</option>
                <option>SMS</option>
                <option>WhatsApp</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Issue Category *
              <select
                value={formData.category}
                className={formErrors.category ? "field-error" : ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option>Residue Collection</option>
                <option>Pickup Scheduling</option>
                <option>Compost &amp; Soil</option>
                <option>KrishiSahyog</option>
                <option>Government Scheme</option>
                <option>Account</option>
                <option>Technical Issue</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Related Service
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              >
                <option value="">Select service</option>
                <option>Residue Collection</option>
                <option>Compost &amp; Soil</option>
                <option>KrishiSahyog</option>
                <option>Government Schemes</option>
                <option>Dashboard</option>
              </select>
            </label>
          </div>

          <label className="full">
            Description *
            <textarea
              rows="4"
              value={formData.description}
              className={formErrors.description ? "field-error" : ""}
              placeholder="Tell us what went wrong in detail..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </label>

          <label className="full">
            Attachment (optional)
            <input type="file" />
          </label>

          <button className="submit-btn" type="submit">
            Submit Request
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h13.5M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>

      {/* Support Requests List */}
      <div className="help-card help-requests-card" ref={requestsListRef}>
        <h2>My support requests</h2>
        <div className="request-list">
          {requests.map((req, idx) => (
            <div
              key={idx}
              className="request-item"
              onClick={() => {
                setSelectedRequest(req);
                setDetailModalOpen(true);
              }}
            >
              <div>
                <b>{req.id}</b>
                <small>{req.title}</small>
              </div>
              <div className="request-meta">
                <span className={`status-badge ${getStatusClass(req.status)}`}>{req.status}</span>
                <small>Updated: {req.updated}</small>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="request-empty">You haven't raised any support requests yet.</p>
          )}
        </div>
      </div>

      {/* Emergency Contact Strip */}
      <div className="help-emergency">
        <div>
          <b>Need urgent assistance?</b>
          <small>Call our dedicated farmer support desk for immediate coordination with active field teams.</small>
        </div>
        <button
          className="emergency-btn"
          type="button"
          onClick={() => showToast("Connecting you to farmer support: 1800-11-2000 (toll-free).")}
        >
          Contact support
        </button>
      </div>

      {/* Footer */}
      <footer className="help-footer">
        <div>
          <b>Swachh Sahyog</b>
          <small>Together for a cleaner tomorrow.</small>
        </div>
        <div className="help-footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("Help Center opened."); }}>Help Center</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("Privacy terms updated."); }}>Privacy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("Terms of service."); }}>Terms</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast("Contact support: support@gramsamridhi.in"); }}>Contact</a>
        </div>
      </footer>

      {/* Toast */}
      {toastMsg && <div className="help-toast">{toastMsg}</div>}

      {/* Chat Modal */}
      {chatModalOpen && (
        <div className="help-modal-backdrop" onClick={() => setChatModalOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-close-modal" onClick={() => setChatModalOpen(false)}>×</button>
            <span className="help-breadcrumb" style={{ color: "#25855A" }}>SUPPORT CHAT</span>
            <h2>Chat with Support</h2>
            <div className="help-chat-log">
              {chatLog.map((msg) => (
                <div key={msg.id} className={`help-chat-msg ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <input
                type="text"
                value={chatInput}
                placeholder="Type your message..."
                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #dfe7e1", outline: 0 }}
                onChange={(e) => setChatInput(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                style={{
                  background: "#25855A",
                  color: "#fff",
                  border: 0,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12 20 4.5 15 20l-3.6-6L4.5 12Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {detailModalOpen && selectedRequest && (
        <div className="help-modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-close-modal" onClick={() => setDetailModalOpen(false)}>×</button>
            <span className="help-breadcrumb" style={{ color: "#25855A" }}>
              {selectedRequest.status.toUpperCase()}
            </span>
            <h2>Request Details</h2>
            <div style={{ marginTop: "14px" }}>
              <div className="help-detail-row">
                <span>Request ID</span>
                <span>{selectedRequest.id}</span>
              </div>
              <div className="help-detail-row">
                <span>Issue Title</span>
                <span>{selectedRequest.title}</span>
              </div>
              <div className="help-detail-row">
                <span>Status</span>
                <span className={`status-badge ${getStatusClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div className="help-detail-row">
                <span>Last Updated</span>
                <span>{selectedRequest.updated}</span>
              </div>
              {selectedRequest.description && (
                <div className="help-detail-row" style={{ flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                  <span>Description</span>
                  <span style={{ fontSize: "11.5px", color: "#4f6259", lineHeight: "1.5" }}>
                    {selectedRequest.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div className="help-modal-backdrop" onClick={() => setSuccessModalOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="help-close-modal" onClick={() => setSuccessModalOpen(false)}>×</button>
            <span className="help-breadcrumb" style={{ color: "#25855A" }}>REQUEST SUBMITTED</span>
            <h2>Request submitted successfully</h2>
            <p>Your support request has been logged and assigned to our regional support desk.</p>
            <div className="help-success-id">{createdRequestId}</div>
            <p style={{ textAlign: "center" }}>We'll contact you shortly via your preferred channel.</p>
            <button
              className="submit-btn"
              type="button"
              style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
              onClick={() => {
                setSuccessModalOpen(false);
                requestsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              View My Requests
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
