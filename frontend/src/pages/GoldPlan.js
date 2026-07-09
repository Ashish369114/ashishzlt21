import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import { getPlanModules } from '../utils/planModules';
import '../styles/LandingPage.css';

const paymentProviders = ['PhonePe', 'Google Pay', 'Paytm', 'BharatPe'];

const GoldPlan = () => {
  const navigate = useNavigate();
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
    setPaymentStatus(`Initiating ${selectedProvider} UPI payment...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1700));

      const response = await schoolService.upgradePlan({
        schoolName: checkoutForm.schoolName,
        schoolEmail: checkoutForm.schoolEmail,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        principalName: checkoutForm.principalName,
        subscriptionPlan: 'gold',
        subscriptionDurationMonths: planDuration,
        paymentMethod: `${selectedProvider} UPI`,
        paymentReference: `UPI-${selectedProvider.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`,
      });

      const { school, credentials, emailSent } = response.data;
      localStorage.setItem('subscriptionPlan', 'gold');
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

  return (
    <div className="landing-page gold-plan-page">
      <section className="hero-banner" style={{ minHeight: '60vh' }}>
        <div className="hero-content">
          <div className="hero-badge">Gold Plan Subscription</div>
          <h1 className="hero-title">School Operating System Gold Plan</h1>
          <p className="hero-subtitle">
            Complete onboarding for your school with a demo UPI payment experience and instant credential provisioning.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Landing</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="container">
          <div className="gold-plan-grid">
            <div className="plan-form card">
              <h2>School Details</h2>
              <p>Enter your school information to activate the Gold Plan and receive access credentials.</p>
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
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="schoolEmail"
                    placeholder="School Email"
                    value={checkoutForm.schoolEmail}
                    onChange={handleChange}
                    required
                    disabled={step !== 'details' || isProcessing}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={checkoutForm.phone}
                    onChange={handleChange}
                    required
                    disabled={step !== 'details' || isProcessing}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="principalName"
                    placeholder="Principal Name"
                    value={checkoutForm.principalName}
                    onChange={handleChange}
                    disabled={step !== 'details' || isProcessing}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="address"
                    placeholder="School Address"
                    rows="4"
                    value={checkoutForm.address}
                    onChange={handleChange}
                    disabled={step !== 'details' || isProcessing}
                  />
                </div>
                <div className="plan-toggle">
                  <label>
                    <input type="radio" name="duration" checked={planDuration === 12} onChange={() => setPlanDuration(12)} disabled={step !== 'details'} />
                    1 Year
                  </label>
                  <label>
                    <input type="radio" name="duration" checked={planDuration === 24} onChange={() => setPlanDuration(24)} disabled={step !== 'details'} />
                    2 Years
                  </label>
                </div>
                {step === 'details' && (
                  <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                    Continue to Payment
                  </button>
                )}
              </form>
            </div>

            <div className="payment-panel card">
              <h2>Fake UPI Payment</h2>
              <p>Choose your preferred UPI provider and complete the demonstration payment.</p>

              <div className="upi-methods">
                {paymentProviders.map((provider) => (
                  <button
                    type="button"
                    key={provider}
                    className={`upi-option${selectedProvider === provider ? ' active' : ''}`}
                    onClick={() => setSelectedProvider(provider)}
                    disabled={step !== 'payment' || isProcessing}
                  >
                    {provider}
                  </button>
                ))}
              </div>

              {step === 'details' && (
                <div className="panel-info">
                  <p>Please complete the school details first to review the payment screen.</p>
                </div>
              )}

              {step === 'payment' && (
                <>
                  <div className="panel-info">
                    <p><strong>Selected Provider:</strong> {selectedProvider}</p>
                    <p><strong>Amount:</strong> ₹70,000</p>
                    <p><strong>Plan:</strong> Gold Plan</p>
                  </div>
                  <button className="btn btn-primary" onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing Payment...' : `Pay with ${selectedProvider}`}
                  </button>
                </>
              )}

              {error && <div className="alert alert-error">{error}</div>}
              {paymentStatus && <p className="checkout-message">{paymentStatus}</p>}
            </div>
          </div>

          <div className="modules-showcase-container" style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', textAlign: 'center', color: '#1e293b' }}>
              📋 Included Modules & Features
            </h3>
            <div className="modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {/* Category 1: Academics & Operations */}
              <div className="category-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>📚</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4f46e5', margin: 0 }}>Academics & Operations</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getPlanModules('gold').filter(m => [
                    'Core Academics Module', 'Timetable Management', 'Student Attendance', 'Courses and Batches', 'Examination Management', 'Homework Management', 'Gradebook', 'School & Events Calendar'
                  ].includes(m)).map(m => (
                    <div key={m} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.88rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Administration & Logistics */}
              <div className="category-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>💼</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981', margin: 0 }}>Administration & Finance</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getPlanModules('gold').filter(m => [
                    'Student Admission', 'Human Resources (HR)', 'Finance Management', 'User Management', 'Advance Fee Management', 'Multi-Branch Management', 'Payroll Automation'
                  ].includes(m)).map(m => (
                    <div key={m} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.88rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Access & Communication */}
              <div className="category-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>💬</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>Access & Portals</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getPlanModules('gold').filter(m => [
                    'Messaging System', 'Employee / Teacher Login', 'Student / Parent Login', 'Student Information Management', 'Custom Student Remarks', 'SMS Integration', 'Dedicated Support'
                  ].includes(m)).map(m => (
                    <div key={m} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.88rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 4: Tools & Productivity */}
              <div className="category-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🛠️</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ec4899', margin: 0 }}>Tools & Productivity</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getPlanModules('gold').filter(m => [
                    'News Management', 'Report Center', 'Certificate Generator', 'ID Card Generator', 'Advanced Analytics', 'OCR Document Scanner'
                  ].includes(m)).map(m => (
                    <div key={m} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7', fontSize: '0.88rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                      <span style={{ color: '#10b981' }}>✓</span> {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {step === 'success' && successData && (
            <div className="success-popup visible">
              <h3>Payment Successful!</h3>
              <p>Your School Operating System credentials have been sent to your registered email address.</p>
              <div className="success-details">
                <p>{successData.emailSent ? 'An email has been delivered to your inbox.' : 'If email delivery is unavailable, please check your email or contact support.'}</p>
              </div>
              <p className="success-note">You will be redirected to the login page shortly.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GoldPlan;
