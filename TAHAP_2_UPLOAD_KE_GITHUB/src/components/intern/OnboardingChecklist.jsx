import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { Badge } from '../ui/Badge';
import { fireMiniConfetti } from '../../lib/confetti';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function OnboardingChecklist({ tasks = [], onTasksChange }) {
  const { updateUserState } = useApp();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState(null);

  const total = tasks.length || 1;
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const pct = Math.round((completedCount / total) * 100);

  const handleToggle = async (task) => {
    if (busyId) return;
    const nextVal = !task.is_completed;
    setBusyId(task.id);

    try {
      const res = await api.patch(`/intern/tasks/${task.id}`, {
        is_completed: nextVal,
      });

      updateUserState(res);
      if (onTasksChange) {
        onTasksChange(tasks.map((t) => (t.id === task.id ? res.task : t)));
      }

      if (nextVal) {
        toast({
          type: 'success',
          title: 'Tugas Onboarding Selesai! ✓',
          desc: task.task_title,
          xp: res.xp,
        });
      }

      if (res.progress_pct === 100 && nextVal) {
        fireMiniConfetti();
      }
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal memperbarui tugas',
        desc: err.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <GlassCard className="col-span-12 lg:col-span-6 p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Onboarding Checklist Hari Pertama
            </h3>
            {pct === 100 && (
              <Badge variant="success">
                <Award className="w-3.5 h-3.5" /> Onboarding Selesai
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centang daftar persiapan hari pertamamu untuk meraih bonus XP!
          </p>
        </div>

        <ProgressRing score={pct} radius={32} stroke={6} colorClass="text-emerald-500">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{pct}%</span>
        </ProgressRing>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => {
          const checked = Boolean(task.is_completed);
          return (
            <motion.button
              key={task.id}
              type="button"
              disabled={busyId === task.id}
              onClick={() => handleToggle(task)}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                checked
                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.18)]'
                  : 'bg-slate-100/80 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-brand-500/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Custom SVG Checkbox with pathLength 0 -> 1 */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors shrink-0 ${
                    checked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400 dark:border-white/30 bg-transparent'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: checked ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      checked
                        ? 'line-through text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.task_title}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kategori: {task.category}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-500 shrink-0">
                +{task.xp_reward} XP <Sparkles className="w-3 h-3" />
              </span>
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
}
