import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { RotateCw, Printer, FileText } from 'lucide-react';
import { getInitials, formatDateID } from '../../lib/format';
import { spring } from '../../lib/constants';
import { sfx } from '../../lib/soundEffects';
import { Button } from '../ui/Button';

export function IdCard3D({
  user,
  internship,
  internId,
  period,
  hidePrintSheet = false,
  onPrintIdCard,
  onPrintLoa,
}) {
  const [flipped, setFlipped] = useState(false);
  const [holoPos, setHoloPos] = useState({ x: 50, y: 50 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 260,
    damping: 22,
  });
  const tiltY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 260,
    damping: 22,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px - 0.5);
    y.set(py - 0.5);
    setHoloPos({ x: Math.round(px * 100), y: Math.round(py * 100) });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHoloPos({ x: 50, y: 50 });
  };

  const qrValue = `MAGANGHUB|${internId}|${user?.full_name || 'Peserta'}|${
    internship?.company_name || 'Perusahaan'
  }`;
  const themeColor = internship?.company_theme_color || '#4F46E5';

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Digital Intern ID Card
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik kartu untuk membalik (Depan / Belakang QR)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sfx.cardFlip();
            setFlipped((f) => !f);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/15 text-brand-500 hover:bg-brand-500/25 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip Kartu</span>
        </button>
      </div>

      {/* 3D Card Container (Ratio 1.586:1) */}
      <motion.div
        className="w-full aspect-[1.586/1] cursor-pointer select-none"
        style={{ perspective: 1200, rotateX, rotateY: tiltY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          sfx.cardFlip();
          setFlipped((f) => !f);
        }}
      >
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={spring}
          className="relative w-full h-full rounded-3xl shadow-2xl"
        >
          {/* FRONT SIDE */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-3xl overflow-hidden bg-slate-900 text-white border border-white/20 flex flex-col justify-between p-5 sm:p-6"
          >
            {/* Holographic Shine Overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-60 transition-opacity"
              style={{
                background:
                  'linear-gradient(115deg, transparent 20%, rgba(255,255,255,.35) 40%, rgba(6,182,212,.3) 50%, rgba(124,58,237,.3) 60%, transparent 80%)',
                backgroundSize: '200% 200%',
                backgroundPosition: `${holoPos.x}% ${holoPos.y}%`,
                mixBlendMode: 'color-dodge',
              }}
            />

            {/* Header Band */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow"
                  style={{ backgroundColor: themeColor }}
                >
                  {internship?.company_logo || '🏢'}
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-white">
                    {internship?.company_name}
                  </p>
                  <p className="text-[10px] text-slate-300">OFFICIAL INTERNSHIP PASS</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-emerald" />
                AKTIF
              </span>
            </div>

            {/* Identity Body */}
            <div className="relative z-10 flex items-center gap-4 my-auto">
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-xl font-display font-extrabold text-white shadow-lg border-2 border-white/30 shrink-0"
                style={{ backgroundColor: user?.avatar_color || themeColor }}
              >
                {getInitials(user?.full_name)}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg sm:text-xl font-display font-extrabold text-white truncate">
                  {user?.full_name}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-cyan-300 truncate">
                  {internship?.role_title}
                </p>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {user?.institution_name || 'Institusi Pendidikan'} &bull; {user?.major || '-'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/15">
              <span>ID: <strong>{internId}</strong></span>
              <span>Mode: <strong>{internship?.work_type} ({internship?.city})</strong></span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-3xl overflow-hidden bg-slate-950 text-white border border-cyan-500/40 p-5 sm:p-6 flex items-center justify-between gap-4"
          >
            <div className="space-y-2 text-xs flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300">
                VERIFIKASI PESERTA
              </span>
              <p className="text-sm font-display font-extrabold text-white">{internId}</p>
              <div className="text-[11px] text-slate-300 space-y-1">
                <p>
                  <span className="text-slate-400">Mentor:</span>{' '}
                  <strong>{internship?.mentor_name}</strong> ({internship?.mentor_role})
                </p>
                <p>
                  <span className="text-slate-400">Masa Berlaku:</span>{' '}
                  <strong>
                    {formatDateID(period?.start)} s.d. {formatDateID(period?.end)}
                  </strong>
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Kartu ini adalah bukti sah penempatan magang melalui MagangHub Indonesia.
                </p>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-lg">
              <QRCodeSVG value={qrValue} size={96} level="M" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Print Actions */}
      <div className="grid grid-cols-2 gap-3 no-print">
        <Button variant="secondary" size="sm" onClick={onPrintIdCard}>
          <Printer className="w-4 h-4" />
          <span>Cetak ID Card</span>
        </Button>
        <Button size="sm" onClick={onPrintLoa}>
          <FileText className="w-4 h-4" />
          <span>Cetak Surat LoA</span>
        </Button>
      </div>

      {/* Dedicated Printable ID Card Sheet (Front + Back QR) when printing ID Card */}
      {!hidePrintSheet && (
      <div className="hidden print:block print-area">
        <div className="max-w-xl mx-auto space-y-6 p-6 border-2 border-dashed border-slate-300 rounded-3xl bg-white text-slate-900">
          <div className="text-center border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold uppercase tracking-wide">
              KARTU TANDA PESERTA MAGANG RESMI (ID CARD)
            </h2>
            <p className="text-xs text-slate-500">
              Gunting mengikuti garis putus-putus &bull; Tunjukkan QR Code saat presensi
            </p>
          </div>

          {/* Front Side Print */}
          <div
            className="rounded-2xl p-6 text-white flex flex-col justify-between min-h-[210px]"
            style={{ backgroundColor: '#0F172A' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  {internship?.company_logo || '🏢'}
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    {internship?.company_name}
                  </p>
                  <p className="text-[10px] text-slate-300">OFFICIAL INTERNSHIP PASS (DEPAN)</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                AKTIF
              </span>
            </div>

            <div className="flex items-center gap-4 my-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white border-2 border-white/40 shrink-0"
                style={{ backgroundColor: user?.avatar_color || themeColor }}
              >
                {getInitials(user?.full_name)}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white">{user?.full_name}</h4>
                <p className="text-xs font-bold text-cyan-300">{internship?.role_title}</p>
                <p className="text-[11px] text-slate-300">
                  {user?.institution_name || 'Institusi Pendidikan'} &bull; {user?.major || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/20">
              <span>
                ID: <strong>{internId}</strong>
              </span>
              <span>
                Mode: <strong>{internship?.work_type} ({internship?.city})</strong>
              </span>
            </div>
          </div>

          {/* Back Side Print with QR */}
          <div className="rounded-2xl p-6 bg-slate-900 text-white flex items-center justify-between gap-4 min-h-[180px]">
            <div className="space-y-1.5 text-xs">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/25 text-cyan-300">
                VERIFIKASI PESERTA (BELAKANG)
              </span>
              <p className="text-sm font-extrabold">{internId}</p>
              <p className="text-[11px] text-slate-300">
                Mentor: <strong>{internship?.mentor_name}</strong> ({internship?.mentor_role})
              </p>
              <p className="text-[11px] text-slate-300">
                Masa Berlaku: <strong>{formatDateID(period?.start)} s.d. {formatDateID(period?.end)}</strong>
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl shrink-0">
              <QRCodeSVG value={qrValue} size={92} level="M" />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
