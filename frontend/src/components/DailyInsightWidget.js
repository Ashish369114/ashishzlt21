import React from 'react';

const DailyInsightWidget = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0C4A86 0%, #0096DA 100%)',
      borderRadius: '16px',
      padding: '16px 18px',
      marginTop: 'auto',
      marginBottom: '16px',
      color: '#FFFFFF',
      boxShadow: '0 8px 20px rgba(0, 150, 218, 0.25)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        fontSize: '0.68rem',
        fontWeight: '800',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#7DD3FC',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        DAILY INSIGHT
      </div>
      <div style={{
        fontSize: '0.82rem',
        fontWeight: '600',
        lineHeight: '1.45',
        color: '#FFFFFF',
        fontStyle: 'italic'
      }}>
        "Great teachers are the ones who make learning feel like curiosity instead of duty."
      </div>
    </div>
  );
};

export default DailyInsightWidget;
