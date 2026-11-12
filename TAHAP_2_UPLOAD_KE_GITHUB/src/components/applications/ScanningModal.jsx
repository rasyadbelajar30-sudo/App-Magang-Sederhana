import React, { useEffect, useState } from 'react';
import { FileCheck2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { sfx } from '../../lib/soundEffects';

export function ScanningModal({ open, companyName, onComplete }) {
  const [stageText, setStageText] = useState('Memeriksa CV ATS-Friendly...');

  useEffect(() => {
    if (!open) return;
    setStageText('Memeriksa CV ATS-Friendly...');
    sfx.radarScan();

    const t1 = setTimeout(() => {
      setStageText('Memeriksa Surat Pengantar & Berkas Akademik...');
      sfx.radarScan();
    }, 1100);

    const t2 = setTimeout(() => {
      setStageText('Lolos Administrasi ✓');
      sfx.xpGain();
    }, 2200);

    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open]);

  const isDone = stageText.includes('Lolos');

  return (
    <Modal
      open={open}
      title={`Verifikasi HR: ${companyName || ''}`}
      subtitle="Sistem HR sedang memindai kelengkapan dan kesesuaian berkasmu"
      maxWidth="max-w-md"
    >
      <div className="py-6 flex flex-col items-center text-center space-y-5">
        <div className="relative w-28 h-32 rounded-2xl bg-brand-500/10 border-2 border-brand-500/40 flex items-center justify-center overflow-hidden">
          {isDone ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
          ) : (
            <FileCheck2 className="w-14 h-14 text-brand-500" />
          )}

          {!isDone && (
            <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06B6D4] animate-scanline" />
          )}
        </div>

        <div>
          <p
            className={`text-base font-display font-bold ${
              isDone ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {stageText}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    </Modal>
  );
}
