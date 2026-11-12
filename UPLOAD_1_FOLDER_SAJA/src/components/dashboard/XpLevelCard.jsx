import React from 'react';
import { Trophy, Sparkles, GraduationCap, Wrench } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressBar } from '../ui/ProgressBar';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

export function XpLevelCard() {
  const { user, level, updateUserState } = useApp();
  const { toast } = useToast();

  const xpPoints = user?.xp_points || 0;
  const remainingXp = Math.max(0, (level?.next_min || 0) - xpPoints);

  const handleSwitchMode = async (targetMode) => {
    if (user?.education_level === targetMode) return;
    try {
      const res = await api.patch('/user/mode', { education_level: targetMode });
      updateUserState(res);
      toast({
        type: 'success',
        title: `Mode diubah ke ${targetMode}`,
        desc: `Rekomendasi lowongan & pencocokan jenjang disesuaikan untuk ${targetMode}.`,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal mengubah mode',
        desc: err.message,
      });
    }
  };

  return (
    <GlassCard className="col-span-12 lg:col-span-7 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                Level {level?.lvl || 1}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <AnimatedNumber value={xpPoints} suffix=" Total XP" />
              </span>
            </div>
            <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
              {level?.name || 'Pendatang Baru'}
            </h3>
          </div>
        </div>

        {/* Switch Mode SMK / Mahasiswa */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSwitchMode('SMK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              user?.education_level === 'SMK'
                ? 'bg-brand-gradient text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Siswa SMK
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('Mahasiswa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              user?.education_level === 'Mahasiswa'
                ? 'bg-brand-gradient text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Mahasiswa
          </button>
        </div>
      </div>

      <ProgressBar value={level?.progress_pct || 0} max={100} shimmer heightClass="h-3" />

      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
        <span>Progres Level: {level?.progress_pct || 0}%</span>
        <span>
          {level?.next_name
            ? `${remainingXp} XP lagi menuju ${level.next_name}`
            : 'Level Maksimal Tercapai! 🏆'}
        </span>
      </div>
    </GlassCard>
  );
}
