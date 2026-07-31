import React from 'react';
import { TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, accent }) => {
  return (
    <div className="group rounded-2xl border border-[#BFDBFE] bg-white p-5.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EBF5FF] text-[#0096DA] border border-[#BFDBFE]">
          {Icon ? <Icon className="h-5.5 w-5.5 text-[#0C4A86]" /> : <TrendingUp className="h-5.5 w-5.5 text-[#0C4A86]" />}
        </div>
        <p className="text-sm font-bold text-[#736B63] leading-tight">{title}</p>
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-black tracking-tight text-[#0C4A86]">{value}</p>
        {subtitle && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#0096DA]">
            <span className="text-emerald-700 font-bold">↑</span>
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
