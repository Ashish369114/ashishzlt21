import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import { getPlanModules } from '../utils/planModules';
import ZaynLeviLogo from '../components/ZaynLeviLogo';
import '../styles/LandingPage.css';
import '../styles/Login.css';
import { formatCurrency } from '../utils/currencyFormatter';

const paymentProviders = [
  'PhonePe', 'Google Pay', 'Paytm', 'BharatPe', 
  'Amazon Pay', 'CRED Pay', 'WhatsApp Pay', 
  'Net Banking', 'Credit/Debit Card'
];

const GoldPlan = () => {
  const navigate = useNavigate();
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
        subscriptionPlan: 'gold',
        subscriptionDurationMonths: planDuration,
        paymentMethod: selectedProvider,
        paymentReference: `PAY-${selectedProvider.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`,
      });

      const { school, credentials, emailSent } = response.data;
      localStorage.setItem('subscriptionPlan', 'gold');
      localStorage.setItem('pendingPlan', 'gold');
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
    return (70000 / 12) * planDuration;
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
        <ZaynLeviLogo size={42} textColor="dark" />
      </div>

      <div className="login-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', padding: '40px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Side: School Details Form */}
        <div className="plan-form" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>School Details</h2>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>Enter your school information to activate the Gold Plan and receive access credentials.</p>
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
                <p style={{ margin: 0 }}><strong>Amount:</strong> {formatCurrency(calculatePrice())}</p>
                <p style={{ margin: 0 }}><strong>Plan:</strong> Gold Plan ({planDuration} Months)</p>
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

export default GoldPlan;
