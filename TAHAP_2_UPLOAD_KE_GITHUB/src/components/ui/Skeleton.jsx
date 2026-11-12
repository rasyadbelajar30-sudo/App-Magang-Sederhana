import React from 'react';

export function Skeleton({ className = 'h-24 w-full rounded-3xl' }) {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 animate-shimmer ${className}`}
    />
  );
}
