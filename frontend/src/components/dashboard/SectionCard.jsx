import React from 'react';

const SectionCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <section className={`rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-[#0C4A86]">{title || subtitle}</h3>
          {subtitle && title && <p className="mt-0.5 text-xs font-semibold text-[#736B63]">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
};

export default SectionCard;
