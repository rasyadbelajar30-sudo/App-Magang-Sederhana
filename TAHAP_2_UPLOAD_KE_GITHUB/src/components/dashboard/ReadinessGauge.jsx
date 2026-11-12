import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { ProgressBar } from '../ui/ProgressBar';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Badge } from '../ui/Badge';

export function ReadinessGauge({ readiness }) {
  const score = readiness?.score || 0;
  const breakdown = readiness?.breakdown || [];

  let tierLabel = 'Belum Siap';
  let tierVariant = 'danger';
  if (score >= 70) {
    tierLabel = 'Siap Melamar';
    tierVariant = 'success';
  } else if (score >= 40) {
    tierLabel = 'Hampir Siap';
    tierVariant = 'warning';
  }

  return (
    <GlassCard className="col-span-12 lg:col-span-5 lg:row-span-2 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Skor Kesiapan Magang
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Indikator kelengkapan profil, berkas &amp; latihanmu
            </p>
          </div>
          <Badge variant={tierVariant}>{tierLabel}</Badge>
        </div>

        <div className="flex justify-center my-4">
          <ProgressRing score={score} radius={80} stroke={14}>
            <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={score} suffix="%" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500 dark:text-cyan-400 mt-0.5">
              {tierLabel}
            </span>
          </ProgressRing>
        </div>
      </div>

      <div className="space-y-3.5 mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
        {breakdown.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {item.earned}/{item.max} poin
              </span>
            </div>
            <ProgressBar
              value={item.earned}
              max={item.max}
              colorClass={
                item.earned === item.max
                  ? 'bg-emerald-500'
                  : 'bg-brand-gradient'
              }
              heightClass="h-2"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
