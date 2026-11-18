import React, { useId } from 'react';
import { motion } from 'framer-motion';

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 112 };

export function LogoMark({ px = 40, idPrefix = 'mh' }) {
  const g = `${idPrefix}-g`;
  const r = `${idPrefix}-r`;
  const glow = `${idPrefix}-glow`;
  return (
    <svg width={px} height={px} viewBox="0 0 64 64" role="img" aria-label="MagangHub">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={r} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="4" y="10" width="56" height="50" rx="16" fill="#1E1B4B" opacity="0.45" />
      <rect x="4" y="6" width="56" height="52" rx="16" fill={`url(#${g})`} />
      <path d="M12 16 C 20 9, 34 8, 42 11 C 30 12, 18 16, 12 24 Z" fill="#fff" opacity="0.22" />
      <path
        d="M16 46 V25 L32 37 L48 25 V46"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 37 L44 15" stroke={`url(#${r})`} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44 11 L47.5 17 L41 16.5 Z" fill="#F59E0B" />
      <path d="M24 19 L32 15 L40 19 L32 23 Z" fill="#fff" opacity="0.95" />
      <path d="M40 19 V24" stroke="#FDE68A" strokeWidth="1.4" strokeLinecap="round" />
      <path
        className="mh-logo-star"
        filter={`url(#${glow})`}
        d="M52 7 L53.3 10.7 L57 12 L53.3 13.3 L52 17 L50.7 13.3 L47 12 L50.7 10.7 Z"
        fill="#FDE68A"
      />
    </svg>
  );
}

export function BrandLogo({ size = 'md', animated = false, showText = false, className = '' }) {
  const px = SIZES[size] || SIZES.md;
  const id = useId().replace(/:/g, '');

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <motion.span
        className={`inline-flex shrink-0 drop-shadow-[0_6px_14px_rgba(79,70,229,0.35)] ${
          animated ? 'animate-oyen-bob' : 'transition-transform hover:scale-105 hover:-rotate-3'
        }`}
        animate={animated ? { y: [0, -6, 0], rotate: [0, -3, 3, 0] } : undefined}
        transition={animated ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <LogoMark px={px} idPrefix={`mh${id}`} />
      </motion.span>
      {showText && (
        <span className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
          Magang<span className="text-brand-500 dark:text-cyan-400">Hub</span>
        </span>
      )}
    </span>
  );
}
