import React from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  FileSearch,
  CalendarClock,
  PenLine,
  Mail,
  BadgeCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { PIPELINE_STEPS } from '../../lib/constants';

const ICONS = {
  Send,
  FileSearch,
  CalendarClock,
  PenLine,
  Mail,
  BadgeCheck,
};

export function PipelineStepper({ currentStatus }) {
  if (currentStatus === 'REJECTED') {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
        <XCircle className="w-5 h-5 shrink-0" />
        <span>Lamaran ini telah dibatalkan / dihentikan.</span>
      </div>
    );
  }

  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.status === currentStatus);
  const activeIndex = currentIdx >= 0 ? currentIdx : 0;
  const progressPct = Math.round((activeIndex / (PIPELINE_STEPS.length - 1)) * 100);

  return (
    <div className="py-4">
      <div className="relative">
        {/* Background Track */}
        <div className="hidden sm:block absolute top-5 left-6 right-6 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-brand-gradient animate-shimmer rounded-full"
          />
        </div>

        {/* 6 Stepper Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 relative z-10">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = ICONS[step.icon] || Send;
            const isPassed = idx < activeIndex || currentStatus === 'ACCEPTED_ONBOARDING';
            const isActive = idx === activeIndex && currentStatus !== 'ACCEPTED_ONBOARDING';

            return (
              <div
                key={step.status}
                className="flex sm:flex-col items-center gap-2.5 sm:text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isPassed
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : isActive
                      ? 'bg-brand-gradient text-white animate-pulse-ring shadow-lg'
                      : 'bg-slate-200 dark:bg-ink-800 text-slate-400 border border-slate-300 dark:border-white/10'
                  }`}
                >
                  {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isPassed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isActive
                      ? 'text-brand-600 dark:text-cyan-400 font-extrabold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
