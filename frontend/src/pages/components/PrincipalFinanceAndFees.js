import React, { useState } from 'react';
import PrincipalPendingFees from './PrincipalPendingFees';
import PrincipalFinanceReport from './PrincipalFinanceReport';
import PlanUpgradeRequired from './PlanUpgradeRequired';

const PrincipalFinanceAndFees = ({ isPlatinum }) => {
  const [activeSubTab, setActiveSubTab] = useState('fees');

  return (
    <div className="card">
      <div className="tab-navigation" style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`tab-btn ${activeSubTab === 'fees' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSubTab === 'fees' ? '#7c3aed' : 'transparent',
            color: activeSubTab === 'fees' ? '#fff' : '#4b5563',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ⏳ Fee Overview
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`tab-btn ${activeSubTab === 'finance' ? 'active' : ''}`}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSubTab === 'finance' ? '#7c3aed' : 'transparent',
            color: activeSubTab === 'finance' ? '#fff' : '#4b5563',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          💰 Finance Overview
        </button>
      </div>

      <div>
        {activeSubTab === 'fees' && <PrincipalPendingFees />}
        {activeSubTab === 'finance' && (
          isPlatinum ? (
            <PrincipalFinanceReport />
          ) : (
            <PlanUpgradeRequired featureName="Finance Overview" requiredPlan="Platinum" />
          )
        )}
      </div>
    </div>
  );
};

export default PrincipalFinanceAndFees;
