import React from 'react';

const variantStyles = {
  default: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
};

export function Badge({ variant = 'default', className = '', children, ...props }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
