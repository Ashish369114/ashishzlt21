import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ZaynLeviLogo from '../components/ZaynLeviLogo';
import '../styles/LandingPage.css';

/**
 * Geometric Right Border SVG Component matching Image 1
 */
const GeometricRightBorder = () => (
  <div className="geometric-right-border-container">
    <svg
      viewBox="0 0 700 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="geometric-border-svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gradNavy1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#081A30" />
          <stop offset="100%" stopColor="#0C2849" />
        </linearGradient>

        <linearGradient id="gradRoyal1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F4C81" />
          <stop offset="100%" stopColor="#0A3660" />
        </linearGradient>

        <linearGradient id="gradCyan1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0096DA" />
          <stop offset="100%" stopColor="#0077B6" />
        </linearGradient>

        <linearGradient id="gradGoldLine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EAB308" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <filter id="layerDropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="-12" dy="18" stdDeviation="16" floodColor="#040D1A" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Layer 0: Cream Texture Base Angled Notch */}
      <path
        d="M 280 0 L 700 0 V 800 L 280 800 L 40 400 Z"
        fill="#F0E9DD"
        opacity="0.7"
      />

      {/* Outer Gold Accent Line */}
      <path
        d="M 310 0 L 70 400 L 310 800"
        stroke="url(#gradGoldLine)"
        strokeWidth="3.5"
        fill="none"
      />

      {/* Layer 1: Dark Navy Angled Polygon */}
      <g filter="url(#layerDropShadow)">
        <path
          d="M 360 0 L 700 0 V 800 L 360 800 L 120 400 Z"
          fill="url(#gradNavy1)"
        />
      </g>

      {/* Inner Gold Line on Navy Panel */}
      <path
        d="M 400 0 L 160 400 L 400 800"
        stroke="url(#gradGoldLine)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Layer 2: Royal Blue Diagonal Polygon */}
      <g filter="url(#layerDropShadow)">
        <path
          d="M 480 0 L 700 0 V 800 L 480 800 L 240 400 Z"
          fill="url(#gradRoyal1)"
        />
      </g>

      {/* Layer 3: Bright Cyan Blue Diagonal Panel */}
      <g filter="url(#layerDropShadow)">
        <path
          d="M 580 0 L 700 0 V 800 L 580 800 L 340 400 Z"
          fill="url(#gradCyan1)"
        />
      </g>

      {/* Shimmer Gold Spark Cross Accent */}
      <g opacity="0.9">
        <line x1="220" y1="360" x2="260" y2="440" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="200" y1="400" x2="280" y2="400" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const LandingPage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    schoolName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    city: '',
    message: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleDemoFormSubmit = (e) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setShowDemoModal(false);
      setDemoFormData({
        schoolName: '',
        contactPerson: '',
        mobile: '',
        email: '',
        city: '',
        message: ''
      });
    }, 4000);
  };

  return (
    <div className="landing-page-enterprise">
      {/* 1. Header Navigation */}
      <header className="enterprise-header">
        <div className="header-container">
          <div className="brand-logo-wrap">
            <ZaynLeviLogo size={48} textColor="dark" />
          </div>

          <div className="header-actions">
            <button className="btn-nav-outlined" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn-nav-gradient" onClick={() => setShowDemoModal(true)}>
              Book A Free Demo
            </button>
          </div>
        </div>
      </header>

      {/* 2. Single Viewport Hero Section (No Scrolling) */}
      <section id="home" className="enterprise-hero-section">
        <div className="hero-container">
          <div className="hero-left-content">
            
            <div className="image1-title-wrap">
              <h1 className="hero-main-title">
                School <span className="title-os-highlight">OS</span>
              </h1>
              <div className="image1-title-underline"></div>
            </div>

            <h2 className="hero-sub-title">Smart School. Seamless Future. this is a demo text</h2>

            <p className="hero-description-text">
              A unified platform to automate school operations, enhance communication, and drive better learning outcomes.
            </p>

            {/* Clean Words Highlights */}
            <div className="hero-words-strip">
              <span className="word-tag">Academic Excellence</span>
              <span className="word-dot">•</span>
              <span className="word-tag">Operational Efficiency</span>
              <span className="word-dot">•</span>
              <span className="word-tag">Better Communication</span>
              <span className="word-dot">•</span>
              <span className="word-tag">Safe & Secure</span>
            </div>

          </div>

          {/* Right Side: Geometric Layered Border Artwork (Image 1) */}
          <div className="hero-right-visual">
            <GeometricRightBorder />
          </div>
        </div>
      </section>

      {/* 3. Demo Modal Dialog */}
      {showDemoModal && (
        <div className="demo-modal-backdrop" onClick={() => setShowDemoModal(false)}>
          <div className="demo-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Left Info Panel */}
            <div className="demo-left-info-panel">
              <div className="demo-panel-heading-block">
                <span className="demo-big-experience">Experience</span>
                <h3 className="demo-panel-title">School OS</h3>
              </div>
              <p className="demo-panel-subtitle">
                Schedule a 1-on-1 walkthrough tailored for your institution in 4 easy steps:
              </p>

              <ul className="demo-feature-list">
                <li><span className="bullet-check">1</span> Smart Academic & Exam Management</li>
                <li><span className="bullet-check">2</span> Multi-Branch Admin & Fee Automation</li>
                <li><span className="bullet-check">3</span> Instant Parent WhatsApp & SMS Alerts</li>
                <li><span className="bullet-check">4</span> Custom Setup & Dedicated Onboarding</li>
              </ul>

              <div className="demo-contact-info-block">
                <div className="demo-contact-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>business@zaynlevi.com</span>
                </div>
                <div className="demo-contact-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>+91 6300854318</span>
                </div>
                <div className="demo-contact-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>Global Remote Delivery & Support (All Working Days)</span>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="demo-right-form-panel">
              <div className="demo-form-header">
                <h2>Book A Free Demo</h2>
                <button className="demo-close-btn" onClick={() => setShowDemoModal(false)}>&times;</button>
              </div>

              {demoSubmitted ? (
                <div className="demo-success-box">
                  <div className="success-icon-badge">✓</div>
                  <h3>Thank you!</h3>
                  <p>Our team will contact you shortly to schedule your personalized demo.</p>
                </div>
              ) : (
                <form onSubmit={handleDemoFormSubmit} className="demo-form-body">
                  <div className="demo-field-group">
                    <label>School Name</label>
                    <input
                      type="text"
                      placeholder="e.g. St. Jude International School"
                      value={demoFormData.schoolName}
                      onChange={(e) => setDemoFormData({ ...demoFormData, schoolName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="demo-field-row">
                    <div className="demo-field-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={demoFormData.contactPerson}
                        onChange={(e) => setDemoFormData({ ...demoFormData, contactPerson: e.target.value })}
                        required
                      />
                    </div>
                    <div className="demo-field-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={demoFormData.mobile}
                        onChange={(e) => setDemoFormData({ ...demoFormData, mobile: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="demo-field-row">
                    <div className="demo-field-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="admin@school.com"
                        value={demoFormData.email}
                        onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="demo-field-group">
                      <label>City / State</label>
                      <input
                        type="text"
                        placeholder="City, State"
                        value={demoFormData.city}
                        onChange={(e) => setDemoFormData({ ...demoFormData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="demo-field-group">
                    <label>Message (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Specify any details or requests..."
                      value={demoFormData.message}
                      onChange={(e) => setDemoFormData({ ...demoFormData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="demo-modal-footer">
                    <button type="button" className="btn-demo-cancel-modal" onClick={() => setShowDemoModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-demo-submit-modal">
                      Submit Demo Request
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
