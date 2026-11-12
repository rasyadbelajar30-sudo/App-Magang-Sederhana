import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({
  value = 0,
  max = 100,
  shimmer = false,
  colorClass = 'bg-brand-gradient',
  heightClass = 'h-2.5',
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div className={`w-full bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden ${heightClass}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`h-full rounded-full ${colorClass} ${shimmer ? 'animate-shimmer' : ''}`}
      />
    </div>
  );
}
