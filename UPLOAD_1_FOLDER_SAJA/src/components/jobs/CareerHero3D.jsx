import React, { useEffect, useState } from 'react';
import {
  Compass,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  Award,
  Wallet,
  Radio,
} from 'lucide-react';
import { Button } from '../ui/Button';

const LIVE_TICKER_ITEMS = [
  '🔥 Nadira Putri (SMKN 1 Bandung) baru saja menandatangani LoA PKL di PT Astra Honda Motor',
  '⚡ Dimas Prakoso (Ilmu Komputer UGM) lolos tahap Studi Kasus di Tokopedia Backend Intern',
  '💼 Bagas Saputra (SMKN 2 Depok Sleman) menerima ID Card Magang Digital di PT Telkom Indonesia',
  '🎯 Siti Rahma (Universitas Airlangga) mencapai 95% Match Score di Unilever Indonesia',
  '🚀 Mitra Industri baru saja memperbarui kuota lowongan WFH, Hybrid & WFO semester ini',
];

export function CareerHero3D({
  totalCount = 22,
  refreshingFeed = false,
  onOpenMatcher,
  onOpenGuide,
  onRefreshFeed,
}) {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [stageTilt, setStageTilt] = useState({ rx: 8, ry: -14 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % LIVE_TICKER_ITEMS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const handleStageMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setStageTilt({
      rx: Number(((0.5 - py) * 22).toFixed(2)),
      ry: Number(((px - 0.5) * 24).toFixed(2)),
    });
  };

  const handleStageLeave = () => {
    setStageTilt({ rx: 8, ry: -14 });
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-2xl p-6 sm:p-8">
      {/* Subtle Architectural Grid & Lighting (Zero Blur Filter) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 35%, rgba(79, 70, 229, 0.35) 0%, rgba(6, 182, 212, 0.18) 38%, transparent 70%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Copy, Live Ticker & Tactile Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Activity Ticker Bar */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/95 border border-slate-700 text-xs max-w-full">
            <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-400 shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              LIVE:
            </span>
            <span className="text-slate-200 font-medium truncate">
              {LIVE_TICKER_ITEMS[tickerIdx]}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight leading-tight">
              Eksplorasi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-indigo-300">
                {totalCount}+ Lowongan Magang &amp; PKL
              </span>{' '}
              Mitra Industri Resmi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Bukan sekadar daftar lowongan biasa — sesuaikan spesifikasi magang impianmu (bidang, sistem kerja WFH/WFO/Hybrid, kota, dan target uang saku), lihat simulasi kecocokan skill secara *real-time*, hingga terbit **ID Card 3D &amp; LoA Resmi**.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              size="md"
              onClick={onOpenMatcher}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0 shadow-lg"
            >
              <Compass className="w-4 h-4" />
              <span>Cari Magang Sesuai Keinginanku</span>
            </Button>

            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Magang di Sini Gimana Sih?</span>
            </button>

            <button
              type="button"
              disabled={refreshingFeed}
              onClick={onRefreshFeed}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs sm:text-sm font-bold border border-emerald-500/35 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-emerald-400 ${refreshingFeed ? 'animate-spin' : ''}`}
              />
              <span>Update Lowongan Terbaru</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive 3D Isometric Career Stack (Mouse-Tilting 3D Stage!) */}
        <div
          onMouseMove={handleStageMove}
          onMouseLeave={handleStageLeave}
          className="lg:col-span-5 flex items-center justify-center py-2 cursor-grab active:cursor-grabbing select-none"
          style={{ perspective: 1100 }}
        >
          <div
            style={{
              transform: `rotateX(${stageTilt.rx}deg) rotateY(${stageTilt.ry}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.15s ease-out',
            }}
            className="relative w-full max-w-[340px] h-[210px]"
          >
            {/* 3D Backplate Shadow Base (Z = -18px) */}
            <div
              style={{ transform: 'translateZ(-18px)' }}
              className="absolute inset-2 rounded-3xl bg-slate-950/90 border border-indigo-500/30 shadow-2xl"
            />

            {/* Main 3D Holographic Intern Pass Card (Z = 12px) */}
            <div
              style={{
                transform: 'translateZ(12px)',
                background:
                  'linear-gradient(135deg, #1E1B4B 0%, #0F172A 55%, #083344 100%)',
              }}
              className="absolute inset-0 rounded-3xl border border-cyan-400/40 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg shadow-md border border-white/20">
                    🚀
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                      MAGANGHUB 3D PASS
                    </p>
                    <p className="text-xs font-bold text-white">
                      22+ Mitra BUMN &amp; Unicorn
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  VERIFIED 3D
                </span>
              </div>

              <div className="my-auto space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Jalur Penempatan:</span>
                  <span className="font-extrabold text-white">PKL SMK &amp; Magang Kuliah</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <span>🎯 Smart Match Engine</span>
                <span className="text-cyan-300 font-bold">Geser Mouse untuk 3D ↗</span>
              </div>
            </div>

            {/* 3D Floating Top-Right Badge: Uang Saku (Z = 46px) */}
            <div
              style={{ transform: 'translateZ(46px)' }}
              className="absolute -top-3.5 -right-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-xl border border-white/30 flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Uang Saku s/d Rp3,8 Jt/bln</span>
            </div>

            {/* 3D Floating Bottom-Left Badge: LoA & Sertifikat (Z = 54px) */}
            <div
              style={{ transform: 'translateZ(54px)' }}
              className="absolute -bottom-3.5 -left-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-extrabold shadow-xl border border-white/30 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>LoA Resmi &amp; ID Card 3D</span>
            </div>

            {/* 3D Floating Middle-Right Pill (Z = 34px) */}
            <div
              style={{ transform: 'translateZ(34px)' }}
              className="absolute bottom-10 -right-4 px-3 py-1.5 rounded-xl bg-slate-900/95 text-cyan-300 text-[11px] font-extrabold border border-cyan-400/40 shadow-lg flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>WFH &bull; Hybrid &bull; WFO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
