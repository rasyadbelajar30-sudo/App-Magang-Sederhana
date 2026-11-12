import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, Target } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { stagger, item } from '../../lib/constants';

export function MissionList({ readiness }) {
  const navigate = useNavigate();
  const breakdown = readiness?.breakdown || [];

  const allMissions = [];
  for (const b of breakdown) {
    if (Array.isArray(b.missing)) {
      for (const m of b.missing) {
        allMissions.push({
          ...m,
          categoryLabel: b.label,
        });
      }
    }
  }

  return (
    <GlassCard className="col-span-12 lg:col-span-7 p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Misi Persiapan Magang
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selesaikan misi berikut untuk menaikkan Readiness Score hingga 100%
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-500 dark:text-indigo-300">
          {allMissions.length === 0 ? 'Semua Selesai ✓' : `${allMissions.length} Misi Tersisa`}
        </span>
      </div>

      {allMissions.length === 0 ? (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-bold">Persiapanmu Sudah 100% Sempurna!</p>
            <p className="text-xs opacity-90 mt-0.5">
              Semua profil, keahlian, dokumen wajib, dan latihan interview telah siap. Ayo lamar lowongan impianmu!
            </p>
          </div>
          <Button variant="emerald" size="sm" onClick={() => navigate('/lowongan')}>
            Cari Lowongan
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
          {allMissions.map((mission) => (
            <div
              key={mission.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-brand-500/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {mission.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-500">
                    +{mission.xp} XP <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                  {mission.title}
                </p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(mission.action_route)}
                className="shrink-0"
              >
                <span>Kerjakan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
