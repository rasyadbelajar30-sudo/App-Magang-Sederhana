import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-white/10',
    brand: 'bg-brand-500/15 text-brand-600 dark:text-indigo-300 border-brand-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
