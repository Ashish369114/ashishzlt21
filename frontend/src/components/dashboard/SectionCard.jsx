import React from 'react';

const SectionCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <section className={`rounded-[1.8rem] border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{subtitle}</h3>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
};

export default SectionCard;
