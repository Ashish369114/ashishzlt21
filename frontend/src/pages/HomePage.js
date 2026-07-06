import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <img src="🏫" alt="Logo" className="logo-img" />
            <h1>Delhi Public School</h1>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>

          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#academics">Academics</a></li>
            <li><a href="#admissions">Admissions</a></li>
            <li><a href="#faculty">Faculty</a></li>
            <li><a href="#facilities">Facilities</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><button className="login-btn-nav" onClick={() => navigate('/login')}>Login</button></li>
          </ul>
        </div>
      </nav>

      {/* Hero Slider */}
      <section id="home" className="hero-slider">
        <div className="slider-content">
          <h2>Welcome to Delhi Public School</h2>
          <p>Excellence in Education, Excellence in Character</p>
          <button className="btn btn-hero" onClick={() => document.getElementById('admissions').scrollIntoView({behavior: 'smooth'})}>
            Apply Now
          </button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links">
        <div className="container">
          <div className="quick-links-grid">
            <div className="quick-link-box">
              <span className="link-icon">📋</span>
              <h4>Online Admissions</h4>
              <p>Apply for admission easily</p>
            </div>
            <div className="quick-link-box">
              <span className="link-icon">📚</span>
              <h4>Academic Calendar</h4>
              <p>View important dates</p>
            </div>
            <div className="quick-link-box">
              <span className="link-icon">🎓</span>
              <h4>Student Portal</h4>
              <p>Check grades & results</p>
            </div>
            <div className="quick-link-box">
              <span className="link-icon">📞</span>
              <h4>Contact Us</h4>
              <p>Get in touch with us</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Nurturing Excellence Since 1995</h3>
              <p>
                Delhi Public School has been a beacon of educational excellence for over 25 years. 
                We are committed to developing well-rounded individuals who excel academically, 
                physically, and morally.
              </p>
              <p>
                Our state-of-the-art facilities, experienced faculty, and holistic approach to 
                education ensure that every student achieves their full potential.
              </p>
              <ul className="about-features">
                <li>✓ Experienced and Qualified Faculty</li>
                <li>✓ Modern Infrastructure & Laboratories</li>
                <li>✓ Sports & Cultural Activities</li>
                <li>✓ Smart Classrooms & Digital Learning</li>
              </ul>
            </div>
            <div className="about-image">
              <div className="image-placeholder">📚</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="statistics">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h4>25+</h4>
              <p>Years of Excellence</p>
            </div>
            <div className="stat-item">
              <h4>2500+</h4>
              <p>Active Students</p>
            </div>
            <div className="stat-item">
              <h4>150+</h4>
              <p>Expert Faculty</p>
            </div>
            <div className="stat-item">
              <h4>98%</h4>
              <p>Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academics Section */}
      <section id="academics" className="academics-section">
        <div className="container">
          <h2 className="section-title">Our Academics</h2>
          <div className="academics-grid">
            <div className="academic-card">
              <div className="card-icon">🧒</div>
              <h4>Primary Section (I-V)</h4>
              <p>Foundation building with focus on basics, creative thinking, and character development.</p>
            </div>
            <div className="academic-card">
              <div className="card-icon">👦</div>
              <h4>Secondary (VI-X)</h4>
              <p>Comprehensive curriculum with specialized science and mathematics support.</p>
            </div>
            <div className="academic-card">
              <div className="card-icon">👨‍🎓</div>
              <h4>Senior Secondary (XI-XII)</h4>
              <p>Specialized streams: Science, Commerce & Arts with expert coaching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section id="faculty" className="faculty-section">
        <div className="container">
          <h2 className="section-title">Our Faculty</h2>
          <p className="section-subtitle">Meet our dedicated and experienced team of educators</p>
          <div className="faculty-grid">
            <div className="faculty-card">
              <div className="faculty-photo">👨‍🏫</div>
              <h4>Dr. Rajesh Kumar</h4>
              <p className="designation">Principal</p>
              <p className="qualification">M.A., B.Ed., D.Ed (20 years experience)</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-photo">👩‍🏫</div>
              <h4>Ms. Priya Sharma</h4>
              <p className="designation">Vice Principal</p>
              <p className="qualification">M.Sc., B.Ed (18 years experience)</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-photo">👨‍🏫</div>
              <h4>Mr. Amit Patel</h4>
              <p className="designation">Science Department Head</p>
              <p className="qualification">M.Sc., B.Ed (15 years experience)</p>
            </div>
            <div className="faculty-card">
              <div className="faculty-photo">👩‍🏫</div>
              <h4>Ms. Neha Singh</h4>
              <p className="designation">English Department Head</p>
              <p className="qualification">M.A., B.Ed (12 years experience)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="admissions-section">
        <div className="container">
          <h2 className="section-title">Admissions</h2>
          <div className="admissions-content">
            <div className="admission-info">
              <h3>Admission Process</h3>
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <h4>Application</h4>
                  <p>Submit online application form</p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h4>Entrance Exam</h4>
                  <p>Appear for admission test</p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h4>Interview</h4>
                  <p>Personal interview round</p>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <h4>Enrollment</h4>
                  <p>Complete admission formalities</p>
                </div>
              </div>

              <h3 style={{marginTop: '30px'}}>Important Dates</h3>
              <ul className="dates-list">
                <li><strong>Registration Opens:</strong> January 15</li>
                <li><strong>Last Date for Application:</strong> April 30</li>
                <li><strong>Entrance Examination:</strong> May 15-30</li>
                <li><strong>Interviews:</strong> June 1-20</li>
                <li><strong>Results Declaration:</strong> June 25</li>
              </ul>

              <button className="btn btn-admission" onClick={() => navigate('/login')}>
                Apply Online
              </button>
            </div>

            <div className="admission-form">
              <h3>Quick Inquiry</h3>
              <form>
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Email Address" required />
                <input type="tel" placeholder="Mobile Number" required />
                <select required>
                  <option>Select Class</option>
                  <option>Class I</option>
                  <option>Class VI</option>
                  <option>Class XI</option>
                </select>
                <textarea placeholder="Your Message" rows="5" required></textarea>
                <button type="submit" className="btn btn-submit">Submit Inquiry</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="facilities-section">
        <div className="container">
          <h2 className="section-title">Our Facilities</h2>
          <div className="facilities-grid">
            <div className="facility-card">
              <span className="facility-icon">🔬</span>
              <h4>Science Laboratories</h4>
              <p>Well-equipped labs for Physics, Chemistry, and Biology with modern equipment</p>
            </div>
            <div className="facility-card">
              <span className="facility-icon">💻</span>
              <h4>Computer Labs</h4>
              <p>Latest computers and software for coding and digital literacy programs</p>
            </div>
            <div className="facility-card">
              <span className="facility-icon">🏋️</span>
              <h4>Sports Complex</h4>
              <p>Indoor and outdoor facilities for cricket, basketball, badminton, and more</p>
            </div>
            <div className="facility-card">
              <span className="facility-icon">📚</span>
              <h4>Library</h4>
              <p>Extensive collection of books, e-books, and digital resources</p>
            </div>
            <div className="facility-card">
              <span className="facility-icon">🎨</span>
              <h4>Art & Music Studio</h4>
              <p>Creative spaces for painting, music, dance, and performing arts</p>
            </div>
            <div className="facility-card">
              <span className="facility-icon">🍽️</span>
              <h4>Cafeteria</h4>
              <p>Hygienic and nutritious food prepared by expert chefs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Activities */}
      <section id="events" className="events-section">
        <div className="container">
          <h2 className="section-title">Events & Activities</h2>
          <div className="events-grid">
            <div className="event-card">
              <div className="event-date">15 JUL</div>
              <h4>Sports Day 2024</h4>
              <p>Inter-house athletic competition with exciting sports events</p>
            </div>
            <div className="event-card">
              <div className="event-date">20 JUL</div>
              <h4>Science Exhibition</h4>
              <p>Student projects and innovations in science and technology</p>
            </div>
            <div className="event-card">
              <div className="event-date">25 JUL</div>
              <h4>Cultural Day</h4>
              <p>Dance, music, and cultural performances by students</p>
            </div>
            <div className="event-card">
              <div className="event-date">01 AUG</div>
              <h4>Annual Day</h4>
              <p>Grand finale with awards, performances, and celebrations</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Announcements */}
      <section id="news" className="news-section">
        <div className="container">
          <h2 className="section-title">Latest News</h2>
          <div className="news-grid">
            <div className="news-card">
              <div className="news-icon">🏆</div>
              <h4>Board Exam Results</h4>
              <p className="news-date">June 25, 2024</p>
              <p>Excellent results declared! 98% pass rate with 45% distinction rate achieved by our students.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>
            <div className="news-card">
              <div className="news-icon">🎯</div>
              <h4>New AI Lab Launched</h4>
              <p className="news-date">June 20, 2024</p>
              <p>State-of-the-art Artificial Intelligence lab inaugurated for student innovation programs.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>
            <div className="news-card">
              <div className="news-icon">🥇</div>
              <h4>National Sports Awards</h4>
              <p className="news-date">June 15, 2024</p>
              <p>Our students won 12 gold medals in national level sports competitions.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>
            <div className="news-card">
              <div className="news-icon">📚</div>
              <h4>Summer Camp Begins</h4>
              <p className="news-date">June 10, 2024</p>
              <p>Interactive summer camp with various activities for skill development.</p>
              <a href="#" className="read-more">Read More →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <h4>📍 Address</h4>
                <p>123 Education Lane, Knowledge City</p>
                <p>New Delhi, India 110001</p>
              </div>
              <div className="contact-item">
                <h4>📞 Phone</h4>
                <p>+91 (11) 1234-5678</p>
                <p>+91 (11) 1234-5679 (Office)</p>
              </div>
              <div className="contact-item">
                <h4>✉️ Email</h4>
                <p>info@delhipublicschool.com</p>
                <p>admissions@delhipublicschool.com</p>
              </div>
              <div className="contact-item">
                <h4>🕐 Working Hours</h4>
                <p>Monday - Friday: 8:00 AM - 3:30 PM</p>
                <p>Saturday: 9:00 AM - 12:00 PM</p>
              </div>
            </div>

            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form>
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <input type="text" placeholder="Subject" required />
                <textarea placeholder="Your Message" rows="5" required></textarea>
                <button type="submit" className="btn btn-submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About School</h4>
              <p>Delhi Public School is committed to providing quality education and holistic development of students.</p>
              <div className="social-links">
                <a href="#" className="social-icon">f</a>
                <a href="#" className="social-icon">t</a>
                <a href="#" className="social-icon">i</a>
                <a href="#" className="social-icon">y</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#academics">Academics</a></li>
                <li><a href="#admissions">Admissions</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Academics</h4>
              <ul>
                <li><a href="#">Primary Section</a></li>
                <li><a href="#">Secondary Section</a></li>
                <li><a href="#">Senior Secondary</a></li>
                <li><a href="#">Academic Calendar</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Important Links</h4>
              <ul>
                <li><a href="#">Student Portal</a></li>
                <li><a href="#">Parent Portal</a></li>
                <li><a href="#">Staff Portal</a></li>
                <li><a href="#">Online Fee Payment</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Delhi Public School. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
