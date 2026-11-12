import React, { useState } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Badge } from '../ui/Badge';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function SkillMatchBreakdown({ job, onSkillAdded }) {
  const { updateUserState } = useApp();
  const { toast } = useToast();
  const [addingSkill, setAddingSkill] = useState(null);

  const match = job?.match || {
    score: 0,
    tier: 'low',
    matched_skills: [],
    missing_skills: [],
    potential_score: 100,
  };

  let tierLabel = 'Perlu Tambah Skill';
  let tierVariant = 'danger';
  let ringColorClass = 'text-rose-500';

  if (match.tier === 'high') {
    tierLabel = 'Sangat Cocok';
    tierVariant = 'success';
    ringColorClass = 'text-emerald-500';
  } else if (match.tier === 'mid') {
    tierLabel = 'Cukup Cocok';
    tierVariant = 'warning';
    ringColorClass = 'text-amber-500';
  }

  const handleAddSkill = async (skill) => {
    if (addingSkill) return;
    setAddingSkill(skill);
    try {
      const res = await api.post('/user/skills', { skill });
      updateUserState(res);
      toast({
        type: 'success',
        title: `Skill "${skill}" ditambahkan!`,
        desc: 'Persentase kecocokanmu dengan lowongan ini meningkat!',
        xp: res.xp,
      });
      if (onSkillAdded) onSkillAdded();
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menambah skill',
        desc: err.message,
      });
    } finally {
      setAddingSkill(null);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
          Analisis Kecocokan Skill
        </h3>
        <Badge variant={tierVariant}>{tierLabel}</Badge>
      </div>

      <div className="flex justify-center my-4">
        <ProgressRing
          score={match.score}
          radius={68}
          stroke={12}
          colorClass={ringColorClass}
        >
          <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
            <AnimatedNumber value={match.score} suffix="%" />
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Match Score</span>
        </ProgressRing>
      </div>

      {/* Matched Skills */}
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Skill yang Sudah Kamu Miliki ({match.matched_skills.length})
        </p>
        {match.matched_skills.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Belum ada skill di profilmu yang cocok dengan daftar syarat lowongan ini.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {match.matched_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Skills */}
      {match.missing_skills.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Klik untuk Tambah &amp; Pelajari Skill ({match.missing_skills.length})
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {match.missing_skills.map((skill) => (
              <button
                key={skill}
                type="button"
                disabled={addingSkill === skill}
                onClick={() => handleAddSkill(skill)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-500/15 hover:bg-brand-500 text-brand-600 dark:text-indigo-300 hover:text-white border border-brand-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah {skill}</span>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-700 dark:text-cyan-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
            <span>
              <strong>Potensi skor: {match.potential_score}%</strong> jika kamu menambahkan:{' '}
              {match.missing_skills.join(', ')}.
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
