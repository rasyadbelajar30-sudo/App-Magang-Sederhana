import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { sfx } from '../../lib/soundEffects';

const STATUS_STEPS = [
  'Menyiapkan 22+ Mitra Industri Resmi...',
  'Mengaktifkan Oyen.AI (Google Gemma 3D)...',
  'Siap Meluncur ke Gerbang Karirmu! 🚀',
];

const FEATURE_PILLS = [
  '🏢 22+ Mitra Industri Resmi',
  '🐱 Oyen.AI Google Gemma 3D',
  '📄 Smart CV & Simulasi HRD',
];

export function IntroSplash({ onFinish }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(8);

  // Deterministic 28 star particles
  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        top: `${((i * 37 + 13) % 88) + 6}%`,
        left: `${((i * 53 + 7) % 90) + 5}%`,
        size: (i % 3) + 2,
        duration: 1.2 + (i % 4) * 0.35,
        delay: (i % 5) * 0.18,
      })),
    []
  );

  useEffect(() => {
    // 1. Beat 0.0s: Logo 3D & Orbit Ring Reveal Fanfare
    sfx.introSplash();

    // 2. Beat 0.35s: Title & Initial Warp Charge
    const p1 = setTimeout(() => {
      setProgress(45);
      sfx.introStep(1);
    }, 350);

    // 3. Beat 0.75s: Si Oyen 3D Pops In & Waves ("Meow~")
    const oyenGreetingTimer = setTimeout(() => {
      sfx.catMeow();
    }, 750);

    // 4. Beat 1.35s: Warp Step 2 ("Mengaktifkan Oyen.AI...")
    const p2 = setTimeout(() => {
      setStepIdx(1);
      setProgress(78);
      sfx.introStep(2);
    }, 1350);

    // 5. Beat 2.35s: Warp Step 3 ("Siap Meluncur! 🚀")
    const p3 = setTimeout(() => {
      setStepIdx(2);
      setProgress(100);
      sfx.introStep(3);
    }, 2350);

    // 6. Beat 3.15s: Warp Launch Sound + Curtain Reveal
    const launchSfxTimer = setTimeout(() => {
      sfx.introLaunch();
    }, 3150);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3550);

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        sfx.introLaunch();
        if (onFinish) onFinish();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(p1);
      clearTimeout(oyenGreetingTimer);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(launchSfxTimer);
      clearTimeout(finishTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#070B1A] text-white px-4 select-none"
    >
      {/* Cosmic Aurora Blobs */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full bg-indigo-600/40 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.3, 0.48, 0.3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full bg-cyan-500/35 blur-3xl"
      />

      {/* Twinkling Star Field */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((st) => (
          <motion.span
            key={st.id}
            style={{
              top: st.top,
              left: st.left,
              width: st.size,
              height: st.size,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.85, 1.4, 0.85] }}
            transition={{
              duration: st.duration,
              delay: st.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]"
          />
        ))}
      </div>

      {/* Center Stage: 3D Orbit Rings + BrandLogo Reveal */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 mb-3">
          {/* Outer Rotating 3D Orbit Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-cyan-400/35 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
            style={{ transform: 'rotateX(65deg)' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute w-32 h-32 sm:w-38 sm:h-38 rounded-full border border-indigo-400/45 border-dashed"
          />
          {/* Expanding Shockwave Ring */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0.85 }}
            animate={{ scale: [0.5, 2.2], opacity: [0.85, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="pointer-events-none absolute w-24 h-24 rounded-full border-2 border-cyan-300/60"
          />

          {/* Main 3D Brand Logo */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 13 }}
          >
            <BrandLogo size="xl" animated />
          </motion.div>
        </div>

        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-cyan-300 mb-2 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Platform Karir SMK &amp; Mahasiswa Indonesia</span>
        </motion.div>

        {/* Animated Brand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight"
        >
          <span>Magang</span>
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
            Hub
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mt-1.5 text-xs sm:text-sm text-slate-300 font-medium max-w-md"
        >
          Gerbang Karir PKL &amp; Magang Interaktif #1 Indonesia
        </motion.p>

        {/* Mini Si Oyen 3D Greeting Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.75, type: 'spring', stiffness: 200, damping: 16 }}
          className="mt-4 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-indigo-500/25 border border-amber-400/45 shadow-xl"
        >
          <motion.span
            animate={{ rotate: [0, 18, -12, 18, 0], y: [0, -3, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.6 }}
            className="text-2xl inline-block"
          >
            🐱
          </motion.span>
          <span className="text-xs sm:text-sm font-bold text-amber-200 text-left">
            &ldquo;Meow~ Selamat datang di masa depan karirmu! 🐾&rdquo;
          </span>
        </motion.div>

        {/* Warp Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-5 w-64 sm:w-80 space-y-2"
        >
          <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden p-0.5">
            <div
              style={{
                width: `${progress}%`,
                transition: 'width 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            />
          </div>
          <p className="text-xs font-extrabold text-cyan-300 tracking-wide flex items-center justify-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{STATUS_STEPS[stepIdx]}</span>
          </p>
        </motion.div>

        {/* 3 Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
        >
          {FEATURE_PILLS.map((pill) => (
            <span
              key={pill}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-bold text-slate-200"
            >
              {pill}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Skip / Enter Now Button */}
      <button
        type="button"
        onClick={() => {
          sfx.clickGhost();
          if (onFinish) onFinish();
        }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer"
      >
        <span>Lewati / Masuk Sekarang</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
