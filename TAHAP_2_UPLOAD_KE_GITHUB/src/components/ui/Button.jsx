import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { sfx } from '../../lib/soundEffects';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  const variants = {
    primary:
      'bg-brand-gradient text-white shadow-lg shadow-brand-500/25 btn-shine border border-white/10',
    secondary:
      'bg-slate-200/70 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-300/70 dark:hover:bg-white/15 border border-slate-300/60 dark:border-white/10',
    emerald:
      'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 btn-shine',
    danger:
      'bg-rose-500/15 text-rose-500 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30',
    ghost:
      'bg-transparent hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs font-semibold rounded-xl gap-1.5',
    md: 'px-4.5 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base font-bold rounded-xl gap-2.5',
  };

  const handleClick = (e) => {
    if (isDisabled) return;
    if (variant === 'danger') {
      sfx.clickDanger();
    } else if (variant === 'emerald') {
      sfx.clickEmerald();
    } else if (variant === 'secondary') {
      sfx.clickSecondary();
    } else if (variant === 'ghost') {
      sfx.clickGhost();
    } else {
      sfx.clickPrimary();
    }
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      whileHover={isDisabled ? undefined : { scale: 1.03 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      className={`inline-flex items-center justify-center transition-colors select-none ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${
        isDisabled ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </motion.button>
  );
}
