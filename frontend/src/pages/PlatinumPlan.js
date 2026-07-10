import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { schoolService } from '../services/api';
import { getPlanModules } from '../utils/planModules';
import '../styles/LandingPage.css';
import '../styles/Login.css';

const paymentProviders = [
  'PhonePe', 'Google Pay', 'Paytm', 'BharatPe', 
  'Amazon Pay', 'CRED Pay', 'WhatsApp Pay', 
  'Net Banking', 'Credit/Debit Card'
];

const PlatinumPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isOcr = queryParams.get('ocr') === 'true';
  const planKey = isOcr ? 'platinum_with_ocr' : 'platinum_without_ocr';
  const planTitle = isOcr ? 'Platinum Plan (With OCR)' : 'Platinum Plan (Without OCR)';

  const [stars, setStars] = useState([]);
  
  useEffect(() => {
    const starsArray = [];
    for (let i = 0; i < 70; i++) {
      const size = Math.random() * 2.5 + 0.5;
      starsArray.push({
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 6
      });
    }
    setStars(starsArray);
  }, []);

  const [checkoutForm, setCheckoutForm] = useState({
    schoolName: '',
    schoolEmail: '',
    phone: '',
    address: '',
    principalName: '',
  });
  const [selectedProvider, setSelectedProvider] = useState(paymentProviders[1]);
  const [planDuration, setPlanDuration] = useState(12);
  const [step, setStep] = useState('details');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!checkoutForm.schoolName || !checkoutForm.schoolEmail || !checkoutForm.phone) {
      setError('Please fill in the required school name, email, and phone fields.');
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    setError('');
    setIsProcessing(true);
    setPaymentStatus(`Initiating ${selectedProvider} payment...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1700));

      const response = await schoolService.upgradePlan({
        schoolName: checkoutForm.schoolName,
        schoolEmail: checkoutForm.schoolEmail,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        principalName: checkoutForm.principalName,
        subscriptionPlan: planKey,
        subscriptionDurationMonths: planDuration,
        paymentMethod: selectedProvider,
        paymentReference: `PAY-${selectedProvider.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`,
      });

      const { school, credentials, emailSent } = response.data;
      localStorage.setItem('subscriptionPlan', planKey);
      localStorage.setItem('pendingPlan', planKey);
      setSuccessData({ school, credentials, emailSent });
      setPaymentStatus('Payment completed successfully!');
      setStep('success');

      setTimeout(() => {
        navigate('/login');
      }, 4200);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePrice = () => {
    return (100000 / 12) * planDuration;
  };

  return (
    <div className="login-page-root">
      {/* Background elements */}
      <div className="aurora-bg"></div>
      <div className="mesh-grid"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      
      {/* Twinkling star field */}
      <div className="stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      <div className="brand" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', zIndex: 10 }} onClick={() => navigate('/')}>
        <div className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', width: '48px', height: '48px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <svg viewBox="0 0 100 100" style={{ width: '28px', height: '28px', overflow: 'visible' }}>
            <path d="M 24 45 V 32 A 8 8 0 0 1 32 24 H 76 L 46 54" fill="none" stroke="#0b4d8c" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 76 55 V 68 A 8 8 0 0 1 68 76 H 24 L 54 46" fill="none" stroke="#00a2e8" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="brand-name" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0b4d8c' }}>Zayn Levi Technologies</div>
          <div className="brand-tag" style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600' }}>School Operating System Onboarding</div>
        </div>
      </div>

      <div className="login-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', padding: '40px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Side: School Details Form */}
        <div className="plan-form" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>School Details</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Enter your school information to activate the {planTitle} and receive access credentials.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="schoolName"
                placeholder="School Name"
                value={checkoutForm.schoolName}
                onChange={handleChange}
                required
                disabled={step !== 'details' || isProcessing}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <input
                type="email"
                name="schoolEmail"
                placeholder="School Email"
                value={checkoutForm.schoolEmail}
                onChange={handleChange}
                required
                disabled={step !== 'details' || isProcessing}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={checkoutForm.phone}
                onChange={handleChange}
                required
                disabled={step !== 'details' || isProcessing}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <input
                type="text"
                name="principalName"
                placeholder="Principal Name"
                value={checkoutForm.principalName}
                onChange={handleChange}
                disabled={step !== 'details' || isProcessing}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <textarea
                name="address"
                placeholder="School Address"
                rows="4"
                value={checkoutForm.address}
                onChange={handleChange}
                disabled={step !== 'details' || isProcessing}
                className="form-input"
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
            <div className="duration-selector-wrap" style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', display: 'block', color: 'inherit' }}>
                Subscription Duration
              </label>
              <div className="duration-pills" style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: '6 Months', months: 6 },
                  { label: '1 Year', months: 12 },
                  { label: '2 Years', months: 24 }
                ].map((option) => (
                  <button
                    type="button"
                    key={option.months}
                    className={`duration-pill${planDuration === option.months ? ' active' : ''}`}
                    onClick={() => setPlanDuration(option.months)}
                    disabled={step !== 'details'}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: planDuration === option.months ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.4)',
                      border: planDuration === option.months ? '2px solid #4f46e5' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: step === 'details' ? 'pointer' : 'default',
                      color: planDuration === option.months ? '#4f46e5' : 'inherit',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {step === 'details' && (
              <button type="submit" className="btn-login" style={{ marginTop: '20px', width: '100%' }} disabled={isProcessing}>
                Continue to Payment
              </button>
            )}
          </form>
        </div>

        {/* Right Side: Fake UPI Payment Details */}
        <div className="payment-panel" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>Payment Method</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Choose your preferred provider and complete the demonstration payment.</p>

          <div className="upi-methods" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {paymentProviders.map((provider) => (
              <button
                type="button"
                key={provider}
                className={`upi-option${selectedProvider === provider ? ' active' : ''}`}
                onClick={() => setSelectedProvider(provider)}
                disabled={step !== 'payment' || isProcessing}
                style={{
                  padding: '12px 6px',
                  background: selectedProvider === provider ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.4)',
                  border: selectedProvider === provider ? '2px solid #4f46e5' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.82rem',
                  cursor: step === 'payment' ? 'pointer' : 'default',
                  color: selectedProvider === provider ? '#4f46e5' : 'inherit',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                {provider}
              </button>
            ))}
          </div>

          {step === 'details' && (
            <div className="panel-info" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '12px' }}>
              <p style={{ margin: 0, opacity: 0.8 }}>Please complete the school details first to review the payment screen.</p>
            </div>
          )}

          {step === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="panel-info" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}><strong>Selected Method:</strong> {selectedProvider}</p>
                <p style={{ margin: 0 }}><strong>Amount:</strong> ₹{calculatePrice().toLocaleString()}</p>
                <p style={{ margin: 0 }}><strong>Plan:</strong> {planTitle} ({planDuration} Months)</p>
              </div>
              <button className="btn-login" onClick={handlePayment} disabled={isProcessing} style={{ width: '100%' }}>
                {isProcessing ? 'Processing Payment...' : `Pay with ${selectedProvider}`}
              </button>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: '15px' }}>{error}</div>}
          {paymentStatus && <p className="checkout-message" style={{ marginTop: '15px', fontWeight: '600', textAlign: 'center' }}>{paymentStatus}</p>}
        </div>
      </div>

      <div className="login-wrapper" style={{ marginTop: '40px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px', textAlign: 'center', color: 'inherit' }}>
          📋 Included Modules & Features
        </h3>
        <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Category 1: Academics & Operations */}
          <div className="category-card" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>📚</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#4f46e5', margin: 0 }}>Academics & Operations</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getPlanModules(planKey).filter(m => [
                'Core Academics Module', 'Timetable Management', 'Student Attendance', 'Courses and Batches', 'Examination Management', 'Homework Management', 'Gradebook', 'School & Events Calendar'
              ].includes(m)).map(m => (
                <div key={m} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {m}
                </div>
              ))}
            </div>
          </div>

          {/* Category 2: Administration & Logistics */}
          <div className="category-card" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>💼</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#10b981', margin: 0 }}>Administration & Finance</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getPlanModules(planKey).filter(m => [
                'Student Admission', 'Human Resources (HR)', 'Finance Management', 'User Management', 'Advance Fee Management', 'Multi-Branch Management', 'Payroll Automation'
              ].includes(m)).map(m => (
                <div key={m} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {m}
                </div>
              ))}
            </div>
          </div>

          {/* Category 3: Access & Communication */}
          <div className="category-card" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>💬</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>Access & Portals</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getPlanModules(planKey).filter(m => [
                'Messaging System', 'Employee / Teacher Login', 'Student / Parent Login', 'Student Information Management', 'Custom Student Remarks', 'SMS Integration', 'Dedicated Support'
              ].includes(m)).map(m => (
                <div key={m} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {m}
                </div>
              ))}
            </div>
          </div>

          {/* Category 4: Tools & Productivity */}
          <div className="category-card" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>🛠️</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ec4899', margin: 0 }}>Tools & Productivity</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getPlanModules(planKey).filter(m => [
                'News Management', 'Report Center', 'Certificate Generator', 'ID Card Generator', 'Advanced Analytics', 'OCR Document Scanner'
              ].includes(m)).map(m => (
                <div key={m} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {step === 'success' && successData && (
        <div className="success-popup visible" style={{ zIndex: 100 }}>
          <h3>Payment Successful!</h3>
          <p>Your School Operating System credentials have been sent to your registered email address.</p>
          <div className="success-details">
            <p>{successData.emailSent ? 'An email has been delivered to your inbox.' : 'If email delivery is unavailable, please check your email or contact support.'}</p>
          </div>
          <p className="success-note">You will be redirected to the login page shortly.</p>
        </div>
      )}

    </div>
  );
};

export default PlatinumPlan;
