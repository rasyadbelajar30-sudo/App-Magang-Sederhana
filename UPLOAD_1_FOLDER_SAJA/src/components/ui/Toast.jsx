import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, X, Trophy } from 'lucide-react';
import { spring } from '../../lib/constants';
import { Button } from './Button';

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isWarn = t.type === 'warning';

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 90, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: spring }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              className="pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-ink-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isError ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : isWarn ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</p>
                    {t.xpGained > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.25, 1] }}
                        transition={{ duration: 0.45 }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm"
                      >
                        +{t.xpGained} XP <Sparkles className="w-3 h-3" />
                      </motion.span>
                    )}
                  </div>
                  {t.desc && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(t.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shrinking progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${
                  isError
                    ? 'bg-rose-500'
                    : isWarn
                    ? 'bg-amber-500'
                    : 'bg-brand-gradient'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function LevelUpModal({ level, onClose }) {
  return (
    <AnimatePresence>
      {level && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: spring }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 max-w-md w-full bg-white dark:bg-ink-900 border border-amber-500/40 rounded-3xl p-8 text-center shadow-2xl"
          >
            <motion.div
              initial={{ rotate: 0, scale: 0.7 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
              Level Up!
            </span>
            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              Level {level.lvl}: {level.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 mb-6">
              Keren! Persiapan magangmu semakin matang. Terus tingkatkan progresmu hingga resmi diterima magang!
            </p>

            <Button onClick={onClose} className="w-full">
              Lanjutkan Perjuangan 🚀
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
