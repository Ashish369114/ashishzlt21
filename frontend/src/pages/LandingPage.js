import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/LandingPage.css';

const services = [
  {
    title: 'Custom Software Development',
    description: 'Bespoke web and desktop solutions tailored to your business workflows and growth goals.',
    features: ['CRM and ERP tools', 'Workflow automation', 'Business intelligence dashboards']
  },
  {
    title: 'Web & Mobile App Development',
    description: 'Modern, responsive applications designed to keep your team productive and your customers engaged.',
    features: ['Progressive web apps', 'Android and iOS apps', 'User-centered UI/UX']
  },
  {
    title: 'Cloud & DevOps Solutions',
    description: 'Secure deployment, infrastructure optimization, and operational support that scale with your business.',
    features: ['Cloud migration', 'CI/CD pipelines', '24/7 monitoring and support']
  }
];

const pricingTiers = [
  {
    name: 'Silver Plan',
    price: '₹40,000',
    subtitle: 'Ideal for small schools getting started with digital operations.',
    features: ['Student admission and profile management', 'Attendance tracking', 'Fee collection and receipts', 'Basic exam scheduling'],
    featured: false
  },
  {
    name: 'Gold Plan',
    price: '₹70,000',
    subtitle: 'Most popular for growing institutions that need deeper automation.',
    features: ['Everything in Silver', 'Homework and timetable management', 'Staff payroll and leave tracking', 'Parent communication portal', 'Advanced reporting and analytics'],
    featured: true
  },
  {
    name: 'Platinum Plan',
    price: '₹1,00,000',
    subtitle: 'Premium solution for large institutions with complex integrations.',
    features: ['Everything in Gold', 'Custom integrations and APIs', 'Multi-branch management', 'Advanced role-based access', 'Dedicated implementation and support'],
    featured: false
  }
];

const LandingPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [contactMessage, setContactMessage] = useState('');
  const navigate = useNavigate();

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactMessage('Thank you for your message. Our team will contact you shortly.');
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handlePlanSelection = (planName) => {
    if (planName === 'silver') {
      navigate('/silver-plan');
    } else if (planName === 'gold') {
      navigate('/gold-plan');
    } else if (planName === 'platinum') {
      navigate('/platinum-plan');
    } else {
      navigate('/silver-plan');
    }
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

      <section id="home" className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">Trusted Digital Transformation Partner</div>
          <h1 className="hero-title">Zayn Levi Technologies</h1>
          <p className="hero-subtitle">
            Delivering intelligent software solutions with our <span>Advanced School Operating System</span>
          </p>
          <p className="hero-description">
            We build secure, scalable technology for schools, enterprises, and fast-growing organizations that want reliable digital operations.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => scrollToSection('services')}>
              Explore Services
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('pricing')}>
              View Pricing
            </button>
          </div>
          <div className="hero-highlights">
            <span>Custom Software</span>
            <span>Cloud Solutions</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div className="trust-card">
            <strong>100+</strong>
            <p>Digital projects delivered</p>
          </div>
          <div className="trust-card">
            <strong>99.9%</strong>
            <p>System uptime assurance</p>
          </div>
          <div className="trust-card">
            <strong>24/7</strong>
            <p>Support and maintenance</p>
          </div>
          <div className="trust-card">
            <strong>Secure</strong>
            <p>Data-first architecture</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="container about-content">
          <div className="about-card">
            <h2 className="section-title">About Us</h2>
            <p>
              Zayn Levi Technologies is a forward-thinking technology company dedicated to creating digital solutions that simplify complexity and unlock growth for modern organizations.
            </p>
            <p>
              Our vision is to blend innovation, reliability, and user-focused design to deliver software that empowers teams, improves customer experiences, and scales with ambition. From custom platforms to intelligent automation, we build technology that turns business goals into measurable progress.
            </p>
            <ul className="check-list">
              <li>Vision-led product development</li>
              <li>Secure, scalable digital experiences</li>
              <li>Tailored solutions for every stage of growth</li>
            </ul>
          </div>
          <div className="about-card accent-card">
            <h3>Why organizations choose us</h3>
            <ul className="check-list">
              <li>End-to-end digital transformation support</li>
              <li>Transparent collaboration and clear delivery milestones</li>
              <li>Reliable post-launch maintenance and enhancement</li>
              <li>Flexible engagement models for startups and established teams</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="service-grid">
            {services.map((service) => (
              <div className="service-card" key={service.title}>
                <div className="service-icon">⚙️</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="services-spotlight">
            <div className="spotlight-panel">
              <div className="hero-badge">Flagship Product</div>
              <h3>School Operating System</h3>
              <p>
                Our Advanced School Operating System helps educational institutions manage admissions, attendance, fee collection, examinations, communication, and reporting from a single platform.
              </p>
              <ul className="check-list">
                <li>Student management</li>
                <li>Attendance tracking</li>
                <li>Fee collection and billing</li>
                <li>Examination management</li>
                <li>Timetable and homework tools</li>
              </ul>
            </div>
            <div className="spotlight-panel secondary-panel">
              <h3>Built for modern schools</h3>
              <p>Whether you run a small academy or a multi-branch institution, we create solutions that make administration simpler and more transparent.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">School Operating System Pricing</h2>
          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <div className={`price-card ${tier.featured ? 'popular' : ''}`} key={tier.name}>
                {tier.featured && <div className="popular-badge">Most Popular</div>}
                <h3>{tier.name}</h3>
                <p className="price-subtitle">{tier.subtitle}</p>
                <div className="price">{tier.price}</div>
                <ul>
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button className="btn btn-primary" onClick={() => handlePlanSelection(tier.name.toLowerCase().includes('gold') ? 'gold' : tier.name.toLowerCase().includes('platinum') ? 'platinum' : 'silver')}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="subscription-cta-section">
        <div className="container">
          <div className="subscription-cta-card">
            <h2>Ready to get started?</h2>
            <p>Choose the Gold Plan to unlock the full School Operating System experience with a separate subscription dashboard and a demo UPI payment flow.</p>
            <button className="btn btn-primary" onClick={() => navigate('/silver-plan')}>
              Go to Silver Plan Subscription
            </button>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container contact-content">
          <div className="contact-card-list">
            <h2 className="section-title">Contact Us</h2>
            <div className="contact-item">
              <h3>Let’s shape your next digital milestone</h3>
              <p>Share your goals and we’ll help you map the right technology path with a tailored strategy and clear next steps.</p>
            </div>
            <div className="contact-item">
              <h3>Official Email</h3>
              <p>business@zaynlevi.com</p>
            </div>
            <div className="contact-item">
              <h3>Official Phone</h3>
              <p>+91 6300854318</p>
            </div>
            <div className="contact-item">
              <h3>Service Area</h3>
              <p>Remote delivery, strategic consulting, and implementation support for growing teams.</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <h3>Request a consultation</h3>
            <p>Leave your details below and our team will reach out with the right next step.</p>
            <div className="form-group">
              <input type="text" name="name" placeholder="Your Name" value={contactForm.name} onChange={handleContactChange} required />
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder="Your Email" value={contactForm.email} onChange={handleContactChange} required />
            </div>
            <div className="form-group">
              <input type="tel" name="phone" placeholder="Your Phone" value={contactForm.phone} onChange={handleContactChange} />
            </div>
            <div className="form-group">
              <input type="text" name="subject" placeholder="Subject" value={contactForm.subject} onChange={handleContactChange} required />
            </div>
            <div className="form-group">
              <textarea name="message" placeholder="Tell us about your project" rows="5" value={contactForm.message} onChange={handleContactChange} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Inquiry</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <div>
            <h3>Zayn Levi Technologies</h3>
            <p>We build secure, scalable digital products that help businesses streamline operations, improve customer experiences, and grow with confidence.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>Phone: +91 6300854318</p>
            <p>Email: business@zaynlevi.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
