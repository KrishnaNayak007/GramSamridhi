import React, { useState, useEffect } from "react";
import "./IntroPage.css";
import logoEmblem from "../../../assets/logo_emblem.png";
import IntroPageNav from "./IntroPageNav";
import villageLandscape from "../../../assets/village_landscape.jpg";

export default function IntroPage({ onLoginClick, onGetStartedClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const revealEls = document.querySelectorAll(".intro-page .reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="intro-page">
      <IntroPageNav onLoginClick={onLoginClick} onGetStartedClick={onGetStartedClick} setMobileOpen={setMobileOpen} mobileOpen={mobileOpen} />

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal in">
              <span className="badge"><span className="dot"></span>🌱 AI-Powered Rural Development Platform</span>
              <h1 className="headline en">Smarter Villages.<br /><span className="accent">Empowered Farmers.</span></h1>
              <p className="lede">GramSamridhi connects citizens, farmers and government authorities through AI-powered waste management, agricultural support and digital governance.</p>
              <div className="tagline-strip hi">
                <span>स्वच्छ ग्राम</span><span className="sep">•</span><span>समृद्ध किसान</span><span className="sep">•</span><span>सतत विकास</span>
              </div>
              <div className="hero-ctas">
                <button onClick={onGetStartedClick} className="btn btn-primary">Get Started →</button>
                <a href="#preview" className="btn btn-outline">Explore Platform</a>
              </div>
              <div className="hero-stats">
                <div className="stat"><b>3</b><span>Connected pillars</span></div>
                <div className="stat"><b>AI</b><span>Waste &amp; farm insights</span></div>
                <div className="stat"><b>24×7</b><span>Complaint routing</span></div>
              </div>
            </div>
            <div className="hero-visual reveal in">
              <div className="frame-leaf">
                <img src={villageLandscape} alt="An Indian village where GramSamridhi is deployed" />
              </div>
              <div className="float-chip chip-1">
                <span className="ic" style={{ background: "#E3EEF3" }}>📍</span> Waste reported near you
              </div>
              <div className="float-chip chip-2">
                <span className="ic" style={{ background: "#FBF0DA" }}>🌾</span> Residue pickup scheduled
              </div>
              <div className="float-chip chip-3">
                <span className="ic" style={{ background: "#E4F2E1" }}>✅</span> Complaint resolved
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="pillars" id="citizens">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Our Focus</span>
              <h2 className="section-title">One Platform. <span className="hi-inline">तीन लक्ष्य।</span></h2>
              <p className="section-sub">Every report, every field and every scheme move through the same system — built for citizens, farmers and the officers who serve them.</p>
            </div>
            <div className="pillar-grid">
              <div className="pillar-card c-green reveal">
                <div className="pillar-ic">🌱</div>
                <h3 className="hi">स्वच्छ ग्राम</h3>
                <h4>Smart Waste Management</h4>
                <p>Citizens can report garbage dumps with photos and locations. AI analyzes the waste and determines severity before routing the complaint to the responsible authority.</p>
              </div>
              <div className="pillar-card c-gold reveal" id="farmers">
                <div className="pillar-ic">🌾</div>
                <h3 className="hi">समृद्ध किसान</h3>
                <h4>Empowered Farmers</h4>
                <p>Farmers can register agricultural residue, access government schemes, use the AI farming assistant and submit complaints — all from one place.</p>
              </div>
              <div className="pillar-card c-blue reveal">
                <div className="pillar-ic">♻️</div>
                <h3 className="hi">सतत विकास</h3>
                <h4>Sustainable Future</h4>
                <p>Promoting responsible waste management, agricultural-residue utilisation and sustainable rural development for the next generation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">The Process</span>
              <h2 className="section-title">From Report to Resolution.</h2>
              <p className="section-sub">A single complaint moves through four clear stages — tracked end to end by the citizen who raised it.</p>
            </div>
            <div className="flow-wrap">
              <div className="flow-path"></div>
              <div className="flow-track">
                <div className="flow-step reveal">
                  <div className="flow-num">01</div>
                  <h4>Report</h4>
                  <p>Citizen uploads a garbage photo and location from the app.</p>
                </div>
                <div className="flow-step reveal">
                  <div className="flow-num">02</div>
                  <h4>AI Analysis</h4>
                  <p>AI detects the waste type and determines its severity.</p>
                </div>
                <div className="flow-step reveal">
                  <div className="flow-num">03</div>
                  <h4>Smart Routing</h4>
                  <p>The complaint reaches the responsible government authority.</p>
                </div>
                <div className="flow-step reveal">
                  <div className="flow-num">04</div>
                  <h4>Resolution</h4>
                  <p>Sanitation teams clean, segregate and update the status.</p>
                </div>
              </div>
            </div>

            <div className="farmer-flow reveal">
              <span className="label">Farmer Journey</span>
              <div className="farmer-chain">
                <span>Farmer</span><span className="arrow">→</span>
                <span>Residue Registration</span><span className="arrow">→</span>
                <span>Collection</span><span className="arrow">→</span>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM PREVIEW */}
        <section className="preview" id="preview">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Inside The Platform</span>
              <h2 className="section-title">Everything Connected in One Platform.</h2>
              <p className="section-sub">A single dashboard for complaints, residue collection and government analytics — built for real deployment.</p>
            </div>
            <div className="preview-grid">
              <div className="dash-frame reveal">
                <div className="dash-bar">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  <span className="url">gramsamridhi.in/dashboard</span>
                </div>
                <div className="dash-body">
                  <div className="dash-top">
                    <h5>Overview — This Week</h5>
                    <span>Bhubaneswar Region</span>
                  </div>
                  <div className="dash-cards">
                    <div className="dcard">
                      <div className="k">Waste Complaints</div>
                      <div className="v">1,</div>
                      <div className="bar-mini"><i style={{ width: "72%", background: "var(--fresh)" }}></i></div>
                    </div>
                    <div className="dcard">
                      <div className="k">High Severity</div>
                      <div className="v">96</div>
                      <div className="bar-mini"><i style={{ width: "34%", background: "#E0685E" }}></i></div>
                    </div>
                    <div className="dcard gold">
                      <div className="k">Residue Collected</div>
                      <div className="v">3.6t</div>
                      <div className="bar-mini"><i style={{ width: "64%", background: "var(--gold)" }}></i></div>
                    </div>
                    <div className="dcard blue">
                      <div className="k">Farmer Participation</div>
                      <div className="v">812</div>
                      <div className="bar-mini"><i style={{ width: "80%", background: "var(--blue)" }}></i></div>
                    </div>
                  </div>
                  <div className="dash-wide">
                    <i style={{ height: "40%" }}></i><i style={{ height: "65%" }}></i><i style={{ height: "30%" }}></i><i style={{ height: "80%" }}></i><i style={{ height: "55%" }}></i><i style={{ height: "70%" }}></i><i style={{ height: "45%" }}></i><i style={{ height: "90%" }}></i>
                  </div>
                </div>
              </div>

              <div className="feature-list reveal">
                <div className="feature-item">
                  <span className="feature-ic">📍</span>
                  <div><h5>Smart Waste Complaints</h5><p>Report with a photo — AI reads location and severity instantly.</p></div>
                </div>
                <div className="feature-item">
                  <span className="feature-ic">🌾</span>
                  <div><h5>Farm Residue Buy-Back</h5><p>Register residue and get scheduled, paid collection.</p></div>
                </div>
                <div className="feature-item">
                  <span className="feature-ic">🤖</span>
                  <div><h5>AI Farming Assistant</h5><p>Crop guidance and scheme eligibility, answered in seconds.</p></div>
                </div>
                <div className="feature-item">
                  <span className="feature-ic">🏛️</span>
                  <div><h5 id="government">Government Dashboard</h5><p>Live analytics for authorities to act and track resolution.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="about">
          <div className="wrap cta-inner">
            <h2>Building a Cleaner, Smarter Gram.</h2>
            <p>Join GramSamridhi in creating cleaner communities, empowering farmers and building a sustainable future.</p>
            <div className="tagline-strip hi">
              <span>स्वच्छ ग्राम</span><span className="sep">•</span><span>समृद्ध किसान</span><span className="sep">•</span><span>सतत विकास</span>
            </div>
            <div className="cta-ctas">
              <button onClick={onGetStartedClick} className="btn btn-light">Get Started</button>
              <button onClick={onLoginClick} className="btn btn-outline">Login</button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <span className="en-brand" style={{ fontSize: "22px", color: "#fff" }}>GramSamridhi</span>
              <div className="tagline-strip hi">
                <span>स्वच्छ ग्राम</span><span className="sep">•</span><span>समृद्ध किसान</span><span className="sep">•</span><span>सतत विकास</span>
              </div>
            </div>
            <div className="foot-links">
              <div className="foot-col">
                <h6>Platform</h6>
                <a href="#top">Home</a>
                <a href="#citizens">Citizens</a>
                <a href="#farmers">Farmers</a>
              </div>
              <div className="foot-col">
                <h6>Organisation</h6>
                <a href="#government">Government</a>
                <a href="#about">About</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 GramSamridhi. All rights reserved.</span>
            <span>Made for citizens, farmers &amp; government — together.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
