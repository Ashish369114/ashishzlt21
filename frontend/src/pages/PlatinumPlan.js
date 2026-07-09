import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/api';
import '../styles/LandingPage.css';

const paymentProviders = ['PhonePe', 'Google Pay', 'Paytm', 'BharatPe'];

const PlatinumPlan = () => {
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
        subscriptionPlan: 'platinum',
        subscriptionDurationMonths: planDuration,
        paymentMethod: `${selectedProvider} UPI`,
        paymentReference: `UPI-${selectedProvider.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`,
      });

      const { school, credentials, emailSent } = response.data;
      localStorage.setItem('subscriptionPlan', 'platinum');
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
          <div className="hero-badge">Platinum Plan Subscription</div>
          <h1 className="hero-title">School Operating System Platinum Plan</h1>
          <p className="hero-subtitle">
            Experience complete school automation at scale with a demo UPI payment and instant credential provisioning.
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
              <p>Enter your school information to activate the Platinum Plan and receive access credentials.</p>
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
                    <p><strong>Amount:</strong> ₹1,00,000</p>
                    <p><strong>Plan:</strong> Platinum Plan</p>
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

export default PlatinumPlan;
