import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlanUpgradeRequired = ({ featureName, requiredPlan = 'Gold' }) => {
  const navigate = useNavigate();
  
  const getPlanColor = () => {
    const p = requiredPlan.toLowerCase();
    if (p.includes('platinum')) return {
      primary: '#0b4d8c',
      accent: '#00a2e8',
      gradient: 'linear-gradient(135deg, #0b4d8c 0%, #00a2e8 100%)',
      badge: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
    };
    return {
      primary: '#f59e0b',
      accent: '#d97706',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      badge: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
    };
  };

  const colors = getPlanColor();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
      margin: '20px',
      maxWidth: '800px',
      alignSelf: 'center',
      justifySelf: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.1)'
      }}>
        🔒
      </div>
      
      <span style={{
        background: colors.badge,
        color: '#ffffff',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        marginBottom: '16px'
      }}>
        {requiredPlan} Plan Feature
      </span>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '14px',
        letterSpacing: '-0.5px'
      }}>
        Unlock {featureName}
      </h1>

      <p style={{
        fontSize: '1.05rem',
        color: '#475569',
        maxWidth: '540px',
        lineHeight: '1.6',
        marginBottom: '32px'
      }}>
        The <strong>{featureName}</strong> module is currently locked under your active plan. 
        Upgrade to the <strong>{requiredPlan}</strong> plan to access this feature along with advanced tools for your school.
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => navigate('/login')}
          style={{
            background: colors.gradient,
            color: '#ffffff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          View Onboarding & Plans
        </button>
      </div>
    </div>
  );
};

export default PlanUpgradeRequired;
