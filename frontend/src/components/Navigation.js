import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ user = null, onLogout = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="school-logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🎓</span>
            <span className="logo-text">EduManage</span>
          </div>
        </div>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <a 
                href="#home" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('home');
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('about');
                }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#admissions" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('admissions');
                }}
              >
                Admissions
              </a>
            </li>
            <li>
              <a 
                href="#academics" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('academics');
                }}
              >
                Academics
              </a>
            </li>
            <li>
              <a 
                href="#faculty" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('faculty');
                }}
              >
                Faculty
              </a>
            </li>
            <li>
              <a 
                href="#gallery" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('gallery');
                }}
              >
                Gallery
              </a>
            </li>
            <li>
              <a 
                href="#events" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('events');
                }}
              >
                Events
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('contact');
                }}
              >
                Contact Us
              </a>
            </li>
            {user ? (
              <>
                <li>
                  <button 
                    className="nav-link dashboard-btn"
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    className="login-btn logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={handleLoginClick} className="login-btn">
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
