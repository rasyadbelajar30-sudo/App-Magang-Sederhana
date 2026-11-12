import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { sfx } from '../../lib/soundEffects';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-2xl',
  size,
  children,
}) {
  useEffect(() => {
    if (open) {
      sfx.modalOpen();
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && open && onClose) {
        sfx.modalClose();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    if (!onClose) return;
    sfx.modalClose();
    onClose();
  };

  const resolvedMaxWidth =
    size === 'lg'
      ? 'max-w-3xl'
      : size === 'xl'
      ? 'max-w-4xl'
      : size === 'sm'
      ? 'max-w-md'
      : maxWidth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 330, damping: 25 }}
        className={`relative w-full ${resolvedMaxWidth} bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 sm:py-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            <div>
              {title && (
                <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </motion.div>
    </div>
  );
}
