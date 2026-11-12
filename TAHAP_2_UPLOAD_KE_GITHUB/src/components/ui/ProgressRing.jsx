import React, { useId } from 'react';

export function ProgressRing({
  score = 0,
  radius = 80,
  stroke = 14,
  gradientId,
  colorClass = null,
  children,
}) {
  const autoId = useId().replace(/:/g, '');
  const resolvedGradientId = gradientId || `mh-ring-${autoId}`;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, Number(score) || 0));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const size = radius * 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <defs>
          <linearGradient id={resolvedGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle
          stroke="currentColor"
          className="text-slate-200 dark:text-white/10"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={colorClass ? 'currentColor' : `url(#${resolvedGradientId})`}
          className={`${colorClass || ''} transition-[stroke-dashoffset] duration-700 ease-out`}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
