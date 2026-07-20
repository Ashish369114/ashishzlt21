import React from 'react';

const variantStyles = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100',
  ghost: 'bg-white/80 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm font-semibold',
  lg: 'h-12 px-5 text-base font-semibold',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
