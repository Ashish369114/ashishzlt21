import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, accent }) => {
  return (
    <button type="button" className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Live</span>
      </div>
      <div className="mt-6">
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
    </button>
  );
};

export default MetricCard;
