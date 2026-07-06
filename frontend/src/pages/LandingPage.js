import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We will contact you soon.');
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <Navigation />

      {/* Hero Banner */}
      <section id="home" className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Welcome to Excellence</div>
          <h1 className="hero-title">Premier Institute for Quality Education</h1>
          <p className="hero-subtitle">Empowering Students • Building Leaders • Shaping Futures</p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => scrollToSection('admissions')}
            >
              Apply Now
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => scrollToSection('about')}
            >
              Learn More
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/login')}
            >
              Student Login
            </button>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-number">5000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-number">300+</div>
              <div className="stat-label">Expert Faculty</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-number">25+</div>
              <div className="stat-label">Years Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="announcements-section">
        <div className="container">
          <h2 className="section-title">Latest Announcements</h2>
          <div className="announcements-grid">
            <div className="announcement-card">
              <div className="announcement-badge">Important</div>
              <h3>Admission Open for 2024-2025</h3>
              <p>We are now accepting applications for all classes. Submit your application online through our portal.</p>
              <a href="#admissions" className="announcement-link">Learn more →</a>
              <div className="announcement-date">June 15, 2024</div>
            </div>
            <div className="announcement-card">
              <div className="announcement-badge">Event</div>
              <h3>Annual Sports Day - July 20th</h3>
              <p>Join us for our grand annual sports event featuring athletics, team sports, and cultural performances.</p>
              <a href="#events" className="announcement-link">View details →</a>
              <div className="announcement-date">June 10, 2024</div>
            </div>
            <div className="announcement-card">
              <div className="announcement-badge">Update</div>
              <h3>New Science Lab Inauguration</h3>
              <p>Our state-of-the-art science laboratory is now operational with advanced equipment and facilities.</p>
              <a href="#academics" className="announcement-link">Explore →</a>
              <div className="announcement-date">June 8, 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About Our Institution</h2>
          <div className="about-content">
            <div className="about-text">
              <div className="about-intro">
                <h3>Excellence in Education Since 1998</h3>
                <p>
                  Our institution stands as a beacon of quality education, committed to nurturing young minds 
                  and developing well-rounded individuals prepared for the challenges of the modern world.
                </p>
              </div>
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <div>
                    <h4>Mission</h4>
                    <p>To provide world-class education fostering academic excellence and character development</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌟</span>
                  <div>
                    <h4>Vision</h4>
                    <p>Creating responsible citizens and global leaders through innovative teaching methods</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💡</span>
                  <div>
                    <h4>Innovation</h4>
                    <p>Blending traditional values with modern technology for comprehensive learning</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="about-img-placeholder">
                <div className="img-icon">🏫</div>
                <p>Campus View</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academics Section */}
      <section id="academics" className="academics-section">
        <div className="container">
          <h2 className="section-title">Academic Programs</h2>
          <div className="programs-grid">
            <div className="program-card">
              <div className="program-icon">👶</div>
              <h3>Pre-Primary</h3>
              <p>Nursery & Kindergarten - Building foundational skills through play-based learning</p>
              <ul className="program-features">
                <li>Interactive classroom</li>
                <li>Creative activities</li>
                <li>Language development</li>
              </ul>
            </div>
            <div className="program-card">
              <div className="program-icon">📚</div>
              <h3>Primary</h3>
              <p>Classes I-V - Strong academic foundation with focus on conceptual understanding</p>
              <ul className="program-features">
                <li>Activity-based learning</li>
                <li>Balanced curriculum</li>
                <li>Sports & arts</li>
              </ul>
            </div>
            <div className="program-card">
              <div className="program-icon">🧮</div>
              <h3>Secondary</h3>
              <p>Classes VI-X - Preparing students for board examinations and competitive exams</p>
              <ul className="program-features">
                <li>Subject specialization</li>
                <li>Lab facilities</li>
                <li>Career guidance</li>
              </ul>
            </div>
            <div className="program-card">
              <div className="program-icon">🔬</div>
              <h3>Senior Secondary</h3>
              <p>Classes XI-XII - Advanced curriculum with science and humanities streams</p>
              <ul className="program-features">
                <li>Advanced labs</li>
                <li>Expert faculty</li>
                <li>University prep</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section id="faculty" className="faculty-section">
        <div className="container">
          <h2 className="section-title">Our Faculty</h2>
          <p className="section-subtitle">Dedicated educators with years of experience and expertise</p>
          <div className="faculty-grid">
            <div className="faculty-card">
              <div className="faculty-avatar">👨‍🏫</div>
              <h3>Dr. Rajesh Kumar</h3>
              <p className="faculty-title">Principal & Math Specialist</p>
              <p className="faculty-bio">20+ years of experience in education management and curriculum development</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-avatar">👩‍🏫</div>
              <h3>Prof. Priya Sharma</h3>
              <p className="faculty-title">English & Literature</p>
              <p className="faculty-bio">Expert in language pedagogy with international teaching experience</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-avatar">👨‍🔬</div>
              <h3>Dr. Vikram Patel</h3>
              <p className="faculty-title">Science Department Head</p>
              <p className="faculty-bio">PhD in Physics, passionate about hands-on scientific learning</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-avatar">👩‍💼</div>
              <h3>Ms. Anjali Singh</h3>
              <p className="faculty-title">Computer Science</p>
              <p className="faculty-bio">Coding expert with experience in AI and software development training</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities-section">
        <div className="container">
          <h2 className="section-title">World-Class Facilities</h2>
          <div className="facilities-grid">
            <div className="facility-item">
              <span className="facility-icon">🔬</span>
              <h4>Science Labs</h4>
              <p>Modern equipped laboratories for physics, chemistry, and biology</p>
            </div>
            <div className="facility-item">
              <span className="facility-icon">💻</span>
              <h4>Computer Lab</h4>
              <p>Latest computers with high-speed internet and software</p>
            </div>
            <div className="facility-item">
              <span className="facility-icon">📚</span>
              <h4>Library</h4>
              <p>50,000+ books and digital resources for students</p>
            </div>
            <div className="facility-item">
              <span className="facility-icon">🏃</span>
              <h4>Sports Complex</h4>
              <p>Indoor and outdoor facilities for various sports</p>
            </div>
            <div className="facility-item">
              <span className="facility-icon">🎨</span>
              <h4>Art Studios</h4>
              <p>Creative spaces for painting, music, and performing arts</p>
            </div>
            <div className="facility-item">
              <span className="facility-icon">🍽️</span>
              <h4>Cafeteria</h4>
              <p>Nutritious meals prepared by professional chefs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <div className="container">
          <h2 className="section-title">Gallery</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <div className="gallery-placeholder">📷</div>
              <p>Sports Day 2024</p>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">🎭</div>
              <p>Annual Function</p>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">🏫</div>
              <p>School Building</p>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">🧪</div>
              <p>Science Lab</p>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">🎓</div>
              <p>Graduation Day</p>
            </div>
            <div className="gallery-item">
              <div className="gallery-placeholder">🎨</div>
              <p>Art Exhibition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="events-section">
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-timeline">
            <div className="event-item">
              <div className="event-date">
                <span className="date-day">20</span>
                <span className="date-month">July</span>
              </div>
              <div className="event-details">
                <h3>Annual Sports Day</h3>
                <p>Grand sports meet featuring athletics, relay races, and team competitions</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="date-day">15</span>
                <span className="date-month">Aug</span>
              </div>
              <div className="event-details">
                <h3>Independence Day Celebration</h3>
                <p>Patriotic event with cultural programs and flag hoisting ceremony</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="date-day">05</span>
                <span className="date-month">Sep</span>
              </div>
              <div className="event-details">
                <h3>Teachers' Day Program</h3>
                <p>Special event to honor and celebrate our dedicated teachers</p>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="date-day">22</span>
                <span className="date-month">Oct</span>
              </div>
              <div className="event-details">
                <h3>Annual Function</h3>
                <p>Spectacular cultural extravaganza with performances and awards ceremony</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="admissions-section">
        <div className="container">
          <h2 className="section-title">Admissions 2024-2025</h2>
          <div className="admissions-content">
            <div className="admissions-info">
              <h3>Open Admissions for All Classes</h3>
              <p>We invite applications from students to join our institution. Follow the simple admission process:</p>
              <div className="admission-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <h4>Fill Application</h4>
                  <p>Complete the online application form with required details</p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h4>Submit Documents</h4>
                  <p>Upload necessary documents and birth certificate</p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h4>Entrance Test</h4>
                  <p>Appear for the entrance examination (if applicable)</p>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <h4>Interview & Decision</h4>
                  <p>Attend the interview and receive admission decision</p>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Apply Online
              </button>
            </div>
            <div className="admission-highlights">
              <h3>Why Choose Us?</h3>
              <ul className="highlights-list">
                <li>✓ World-class faculty and infrastructure</li>
                <li>✓ Comprehensive curriculum aligned with boards</li>
                <li>✓ Focus on holistic development</li>
                <li>✓ Regular parent-teacher interactions</li>
                <li>✓ Scholarship programs available</li>
                <li>✓ 24/7 digital campus management system</li>
                <li>✓ Safe and secure campus environment</li>
                <li>✓ Excellent track record in academics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Address</h3>
                <p>123 Education Road<br/>New Delhi, India<br/>110001</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Phone</h3>
                <p>+91 11 1234 5678<br/>+91 11 8765 4321<br/>Available 9 AM - 5 PM</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email</h3>
                <p>info@edumanage.edu<br/>admissions@edumanage.edu<br/>support@edumanage.edu</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">⏰</div>
                <h3>Office Hours</h3>
                <p>Monday - Friday: 8 AM - 4 PM<br/>Saturday: 9 AM - 1 PM<br/>Sunday: Closed</p>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <h3>Send us a Message</h3>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>About EduManage</h3>
              <p>Premier educational institution committed to excellence and holistic development of students.</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#academics">Academics</a></li>
                <li><a href="#admissions">Admissions</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="LinkedIn">💼</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EduManage School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
