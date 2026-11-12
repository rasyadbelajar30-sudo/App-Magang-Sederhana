import React from 'react';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = SearchX,
  title = 'Data belum tersedia',
  description = '',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/15 rounded-3xl">
      <motion.div
        animate={{ rotate: [0, -8, 8, -5, 5, 0], y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
        className="w-16 h-16 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center mb-4"
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
