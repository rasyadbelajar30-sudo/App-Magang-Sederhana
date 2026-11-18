import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { sfx } from '../../lib/soundEffects';

const STATUS_STEPS = [
  'Si Oyen 3D Memasang Jetpack & Aksesoris Full Gear...',
  'Menyiapkan 22+ Mitra Industri & Oyen.AI Google Gemma...',
  'Kecepatan Penuh — Siap Meluncur ke Gerbang Karirmu! 🚀',
];

const GEAR_BADGES = [
  { icon: '👑', label: 'Crown Boss 3D', color: 'from-amber-400/25 to-yellow-500/20 border-amber-400/50 text-amber-200' },
  { icon: '🕶️', label: 'Cyber Shades', color: 'from-cyan-400/25 to-blue-500/20 border-cyan-400/50 text-cyan-200' },
  { icon: '🎧', label: 'Mentor Headset', color: 'from-purple-400/25 to-indigo-500/20 border-purple-400/50 text-purple-200' },
  { icon: '🚀', label: 'Turbo Jetpack', color: 'from-rose-400/25 to-orange-500/20 border-rose-400/50 text-rose-200' },
  { icon: '🐟', label: 'Fish Booster', color: 'from-emerald-400/25 to-teal-500/20 border-emerald-400/50 text-emerald-200' },
];

function FlyingOyen3DAllGear() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -ml-14 -mt-14 sm:-ml-20 sm:-mt-20 w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 animate-oyen-flight select-none">
      {/* Glowing Jetpack Trail Aura */}
      <div
        className="pointer-events-none absolute -inset-3 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.42) 0%, rgba(6,182,212,0.22) 50%, transparent 72%)',
        }}
      />

      <svg viewBox="0 0 140 140" className="relative z-10 w-full h-full overflow-visible">
        <defs>
          <radialGradient id="introOyenHead" cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="28%" stopColor="#FB923C" />
            <stop offset="72%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>
          <radialGradient id="introOyenBody" cx="42%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </radialGradient>
          <radialGradient id="introOyenCream" cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <linearGradient id="introCrownGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="introJetpackMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="introFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. 3D DUAL TURBO JETPACK + BLAZING THRUSTER FLAMES */}
        <g>
          {/* Left & Right Jetpack Cylinders */}
          <rect
            x="24"
            y="72"
            width="16"
            height="34"
            rx="7"
            fill="url(#introJetpackMetal)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <rect
            x="100"
            y="72"
            width="16"
            height="34"
            rx="7"
            fill="url(#introJetpackMetal)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          {/* Jetpack Nozzles */}
          <path d="M 27 106 L 37 106 L 39 113 L 25 113 Z" fill="#334155" />
          <path d="M 103 106 L 113 106 L 115 113 L 101 113 Z" fill="#334155" />

          {/* Animated Jetpack Flames */}
          <g className="animate-jetpack-flame">
            <path d="M 25 112 Q 32 142 39 112 Z" fill="url(#introFlame)" />
            <path d="M 28 112 Q 32 132 36 112 Z" fill="#FEF08A" />
            <path d="M 101 112 Q 108 142 115 112 Z" fill="url(#introFlame)" />
            <path d="M 104 112 Q 108 132 112 112 Z" fill="#FEF08A" />
          </g>
        </g>

        {/* 2. WAGGING 3D TAIL */}
        <path
          d="M 96 104 Q 124 94 121 68 Q 119 56 111 63 Q 113 84 93 95"
          fill="none"
          stroke="url(#introOyenBody)"
          strokeWidth="11"
          strokeLinecap="round"
          className="animate-oyen-tail"
        />

        {/* 3. 3D VOLUMETRIC BODY & COLLAR */}
        <ellipse cx="70" cy="100" rx="30" ry="24" fill="url(#introOyenBody)" />
        <ellipse cx="70" cy="103" rx="18" ry="16" fill="url(#introOyenCream)" />
        <path
          d="M 46 84 Q 70 93 94 84"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="70" cy="90" r="6" fill="url(#introCrownGold)" stroke="#92400E" strokeWidth="1.2" />

        {/* 4. 3D HEAD & EARS */}
        <g>
          {/* Left Ear */}
          <g className="animate-ear-left">
            <polygon
              points="30,54 21,18 54,34"
              fill="url(#introOyenHead)"
              stroke="#9A3412"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon points="32,48 26,24 48,36" fill="#FDA4AF" opacity="0.85" />
          </g>
          {/* Right Ear */}
          <g className="animate-ear-right">
            <polygon
              points="110,54 119,18 86,34"
              fill="url(#introOyenHead)"
              stroke="#9A3412"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <polygon points="108,48 114,24 92,36" fill="#FDA4AF" opacity="0.85" />
          </g>

          {/* Volumetric Head Sphere */}
          <ellipse cx="70" cy="58" rx="36" ry="30" fill="url(#introOyenHead)" />
          <ellipse cx="56" cy="40" rx="14" ry="6" fill="#FFFFFF" opacity="0.22" transform="rotate(-15 56 40)" />

          {/* Ginger Forehead Stripes */}
          <path d="M 70 31 L 70 41" stroke="#9A3412" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 62 33 L 64 41" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 78 33 L 76 41" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />

          {/* Rosy Cheeks & Muzzle */}
          <ellipse cx="43" cy="66" rx="6.5" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="97" cy="66" rx="6.5" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="63" cy="67" rx="8.5" ry="6.5" fill="url(#introOyenCream)" />
          <ellipse cx="77" cy="67" rx="8.5" ry="6.5" fill="url(#introOyenCream)" />
          <polygon points="66,61 74,61 70,66" fill="#F43F5E" />
          <path
            d="M 70 66 Q 64 73 58 68 M 70 66 Q 76 73 82 68"
            fill="none"
            stroke="#7C2D12"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <g stroke="#FFF7ED" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
            <line x1="20" y1="60" x2="38" y2="62" />
            <line x1="18" y1="66" x2="37" y2="66" />
            <line x1="120" y1="60" x2="102" y2="62" />
            <line x1="122" y1="66" x2="103" y2="66" />
          </g>

          {/* 5. ACCESSORY #1: 3D CAREER MENTOR HEADSET (🎧) */}
          <g>
            <path
              d="M 33 56 A 37 35 0 0 1 107 56"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <rect x="27" y="50" width="9" height="17" rx="4.5" fill="#4F46E5" stroke="#22D3EE" strokeWidth="1.5" />
            <rect x="104" y="50" width="9" height="17" rx="4.5" fill="#4F46E5" stroke="#22D3EE" strokeWidth="1.5" />
            <path d="M 32 65 Q 42 78 58 75" fill="none" stroke="#22D3EE" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="59" cy="75" r="3" fill="#22D3EE" />
          </g>

          {/* 6. ACCESSORY #2: 3D CYBER BOSS SUNGLASSES (🕶️) */}
          <g>
            <path d="M 34 51 L 106 51" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />
            <rect x="39" y="47" width="26" height="16" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.2" />
            <rect x="75" y="47" width="26" height="16" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.2" />
            <line x1="43" y1="59" x2="54" y2="49" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="79" y1="59" x2="90" y2="49" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* 7. ACCESSORY #3: 3D ROYAL CHIEF MEOW OFFICER CROWN (👑) */}
          <g>
            <path
              d="M 48 30 L 53 12 L 63 22 L 70 8 L 77 22 L 87 12 L 92 30 Z"
              fill="url(#introCrownGold)"
              stroke="#FEF08A"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <rect x="48" y="28" width="44" height="5" rx="2.5" fill="#B45309" />
            <circle cx="70" cy="23" r="2.8" fill="#EF4444" />
            <circle cx="58" cy="25" r="2" fill="#06B6D4" />
            <circle cx="82" cy="25" r="2" fill="#10B981" />
          </g>
        </g>

        {/* 8. WALKING PAWS + WAVING RIGHT PAW HOLDING FISH BOOSTER */}
        <g className="animate-paw-l">
          <ellipse cx="52" cy="121" rx="11" ry="7.5" fill="url(#introOyenCream)" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="48" cy="121" r="1.8" fill="#FDA4AF" />
          <circle cx="52" cy="119.5" r="1.8" fill="#FDA4AF" />
          <circle cx="56" cy="121" r="1.8" fill="#FDA4AF" />
        </g>

        <g className="animate-paw-r">
          <ellipse cx="88" cy="121" rx="11" ry="7.5" fill="url(#introOyenCream)" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="84" cy="121" r="1.8" fill="#FDA4AF" />
          <circle cx="88" cy="119.5" r="1.8" fill="#FDA4AF" />
          <circle cx="92" cy="121" r="1.8" fill="#FDA4AF" />
        </g>

        {/* Waving Front Paw with Floating Golden Fish */}
        <g className="animate-intro-wave">
          <ellipse cx="107" cy="92" rx="9" ry="7" fill="url(#introOyenCream)" stroke="#D97706" strokeWidth="1.5" />
          <text x="111" y="85" fontSize="16">
            🐟
          </text>
        </g>
      </svg>
    </div>
  );
}

export function IntroSplash({ onFinish }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(14);
  const [exiting, setExiting] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        top: `${((i * 37 + 13) % 88) + 6}%`,
        left: `${((i * 53 + 7) % 90) + 5}%`,
        size: (i % 3) + 2,
      })),
    []
  );

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      if (onFinishRef.current) onFinishRef.current();
    }, 350);
  };

  useEffect(() => {
    // 1. Beat 0.0s: Cosmic Logo & Dual Turbo Jetpack Takeoff Fanfare
    sfx.introSplash();

    // 2. Beat 0.42s: Si Oyen Equips All 3D Gear + 3D Flyby Sonic Whoosh
    const p1 = setTimeout(() => {
      setProgress(45);
      sfx.equipAccessory();
      sfx.introFlybyWhoosh();
    }, 420);

    // 3. Beat 0.9s: Si Oyen Mid-Air Wave, Cheerful Meow & Cyber Sparkles
    const oyenGreetingTimer = setTimeout(() => {
      sfx.introOyenGreeting();
    }, 900);

    // 4. Beat 1.5s: Warp Step 2 ("Menyiapkan 22+ Mitra Industri & Oyen.AI...") - Turbine Power Charge
    const p2 = setTimeout(() => {
      setStepIdx(1);
      setProgress(78);
      sfx.introStep(2);
    }, 1500);

    // 5. Beat 2.5s: Warp Step 3 ("Kecepatan Penuh — Siap Meluncur! 🚀") - Maximum Warp Lock
    const p3 = setTimeout(() => {
      setStepIdx(2);
      setProgress(100);
      sfx.introStep(3);
    }, 2500);

    // 6. Beat 3.45s: Full Jetpack Warp Launch + Curtain Reveal
    const launchSfxTimer = setTimeout(() => {
      sfx.introLaunch();
      triggerClose();
    }, 3450);

    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        sfx.introLaunch();
        triggerClose();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(p1);
      clearTimeout(oyenGreetingTimer);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(launchSfxTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div
      onPointerDown={() => sfx.unlockAudio()}
      style={{
        background:
          'radial-gradient(circle at 50% 32%, #1E1B4B 0%, #0B1026 52%, #060914 100%)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden text-white px-4 select-none ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D Cyber Perspective Grid Floor */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(56,189,248,0.28) 1px, transparent 1px), linear-gradient(to top, rgba(99,102,241,0.32) 1px, transparent 1px)',
          backgroundSize: '44px 32px',
          transform: 'perspective(380px) rotateX(62deg)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Glowing Cosmic Aurora Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/35 blur-3xl animate-orb-1" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/30 blur-3xl animate-orb-2" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Shooting Comets */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-28 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-white rounded-full animate-comet-1" />
      <div className="pointer-events-none absolute top-28 right-1/3 w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-white rounded-full animate-comet-2" />

      {/* Star Field */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((st) => (
          <span
            key={st.id}
            style={{
              top: st.top,
              left: st.left,
              width: st.size,
              height: st.size,
            }}
            className="absolute rounded-full bg-cyan-200 animate-pulse shadow-[0_0_8px_rgba(103,232,249,0.9)]"
          />
        ))}
      </div>

      {/* CENTER 3D STAGE: GIANT 3D BrandLogo + Si Oyen Orbiting & Flying IN FRONT & BEHIND the Logo! */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
        <div className="intro-3d-stage relative flex items-center justify-center w-52 h-44 sm:w-80 sm:h-60 lg:w-96 lg:h-68 mb-2">
          {/* Outer 3D Holographic Orbit Rings */}
          <div className="pointer-events-none absolute w-44 h-44 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full border-2 border-cyan-400/45 shadow-[0_0_36px_rgba(6,182,212,0.4)] animate-intro-orbit-cw" />
          <div className="pointer-events-none absolute w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full border-2 border-indigo-400/45 border-dashed animate-intro-orbit-ccw" />

          {/* GIANT 3D BrandLogo at Center (Z = 0px) — Responsive: Fit on HP, Huge on Laptop/PC */}
          <div className="animate-logo-3d-center">
            <BrandLogo
              animated
              responsiveClass="w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56"
            />
          </div>

          {/* 3D Si Oyen Full-Gear Flying & Orbiting Across Front (Z = +170px) and Behind (Z = -150px) the Giant Logo */}
          <FlyingOyen3DAllGear />
        </div>

        {/* Stage 1: Top Badge */}
        <div className="animate-intro-stage-1 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-cyan-400/35 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-cyan-300 mb-1.5 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Platform Karir SMK &amp; Mahasiswa #1 Indonesia</span>
        </div>

        {/* Stage 2: Animated Shimmer Brand Title & Tagline */}
        <div className="animate-intro-stage-2">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight drop-shadow-[0_6px_24px_rgba(79,70,229,0.5)]">
            <span className="text-white">Magang</span>
            <span className="bg-gradient-to-r from-cyan-300 via-amber-300 to-indigo-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 font-semibold">
            Eksplorasi Peluang &bull; Simulasi Seleksi AI &bull; Raih Karir Impian
          </p>
        </div>

        {/* Stage 3: All-Accessories Showcase Pills + Si Oyen Speech Bubble */}
        <div className="animate-intro-stage-3 mt-3.5 space-y-2.5 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {GEAR_BADGES.map((g) => (
              <span
                key={g.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r border text-[10px] sm:text-[11px] font-extrabold shadow-sm ${g.color}`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-indigo-500/25 border border-amber-400/45 shadow-xl">
            <span className="text-xs sm:text-sm font-extrabold text-amber-200">
              &ldquo;Meow~ Si Oyen 3D Full Aksesoris &amp; Jetpack siap menerbangkan karirmu! 🐾🚀&rdquo;
            </span>
          </div>
        </div>

        {/* Stage 4: Warp Progress Bar */}
        <div className="animate-intro-stage-4 mt-4 w-64 sm:w-80 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-white/10 border border-white/15 overflow-hidden p-0.5">
            <div
              style={{
                width: `${progress}%`,
                transition: 'width 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500 shadow-[0_0_14px_rgba(6,182,212,0.9)]"
            />
          </div>
          <p className="text-[11px] sm:text-xs font-extrabold text-cyan-300 tracking-wide flex items-center justify-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{STATUS_STEPS[stepIdx]}</span>
          </p>
        </div>
      </div>

      {/* Top Controls: Audio Status & Volume Boost Pill */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sfx.unlockAudio();
            sfx.introSplash();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Klik untuk mengaktifkan audio 3D & efek suara penuh"
        >
          <span className="animate-bounce">🔊</span>
          <span>Audio 3D &amp; SFX Si Oyen</span>
        </button>
      </div>

      {/* Skip / Enter Now Button */}
      <button
        type="button"
        onClick={() => {
          sfx.introLaunch();
          triggerClose();
        }}
        className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer"
      >
        <span>Lewati / Masuk Sekarang</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
