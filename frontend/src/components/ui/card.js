import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`glass-panel rounded-3xl border border-slate-200/80 shadow-panel ${className}`} {...props}>
      {children}
    </div>
  );
}
