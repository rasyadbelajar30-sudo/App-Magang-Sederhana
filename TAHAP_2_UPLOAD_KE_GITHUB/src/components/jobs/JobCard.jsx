import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Check,
  Plus,
  ArrowUpRight,
  Users,
  Wallet,
  Building2,
  Bookmark,
  BadgeCheck,
  Zap,
} from 'lucide-react';
import { formatRupiah } from '../../lib/format';
import { STATUS_META } from '../../lib/constants';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Button } from '../ui/Button';
import { sfx } from '../../lib/soundEffects';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

// Shared window scroll tracker so 3D card hover never triggers layout reads while scrolling
let isWindowScrolling = false;
let scrollIdleTimer = null;
if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      isWindowScrolling = true;
      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        isWindowScrolling = false;
      }, 110);
    },
    { passive: true }
  );
}

export function JobCard({
  job,
  onSkillAdded,
  isSaved = false,
  onToggleSave,
}) {
  const navigate = useNavigate();
  const { updateUserState } = useApp();
  const { toast } = useToast();
  const [addingSkill, setAddingSkill] = useState(null);

  // Direct GPU DOM refs (Zero React state re-renders on mousemove -> 0% scroll stutter!)
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(null);

  const matchScore = job.match?.score ?? 0;
  const tier = job.match?.tier || 'low';
  const matchedSet = new Set(
    (job.match?.matched_skills || []).map((s) => s.toLowerCase())
  );

  let tierColor = '#F43F5E'; // Rose
  let ringColorClass = 'text-rose-500';
  if (tier === 'high') {
    tierColor = '#10B981'; // Emerald
    ringColorClass = 'text-emerald-500';
  } else if (tier === 'mid') {
    tierColor = '#F59E0B'; // Amber
    ringColorClass = 'text-amber-500';
  }

  const themeColor = job.company_theme_color || '#4F46E5';

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isWindowScrolling || !cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = cardRef.current;
      if (!el || isWindowScrolling) return;
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const rx = ((0.5 - py) * 9).toFixed(2);
      const ry = ((px - 0.5) * 9).toFixed(2);
      const gx = Math.round(px * 100);
      const gy = Math.round(py * 100);

      el.style.transform = `perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
      el.style.boxShadow = `0 20px 38px -12px ${themeColor}40, 0 0 0 1.5px ${tierColor}`;

      if (glareRef.current) {
        glareRef.current.style.opacity = '1';
        glareRef.current.style.background = `radial-gradient(340px circle at ${gx}% ${gy}%, ${themeColor}22, rgba(255,255,255,0.05) 45%, transparent 75%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (cardRef.current) {
      cardRef.current.style.transform = 'none';
      cardRef.current.style.boxShadow = '0 8px 24px -8px rgba(15, 23, 42, 0.12)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  const handleAddSkill = async (e, skillName) => {
    e.stopPropagation();
    if (addingSkill) return;
    sfx.clickEmerald();
    setAddingSkill(skillName);
    try {
      const res = await api.post('/user/skills', { skill: skillName });
      updateUserState(res);
      toast({
        type: 'success',
        title: `Skill "${skillName}" ditambahkan!`,
        desc: 'Skor kecocokan lowongan langsung diperbarui.',
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

  const handleCardClick = () => {
    sfx.cardSelect();
    navigate(`/lowongan/${job.id}`);
  };

  const appliedMeta = job.applied_status ? STATUS_META[job.applied_status] : null;

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      style={{
        boxShadow: '0 8px 24px -8px rgba(15, 23, 42, 0.12)',
        transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease',
      }}
      className="group relative flex flex-col justify-between bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 cursor-pointer text-left"
    >
      {/* 3D Specular Light Glare on Hover (Manipulated via DOM Ref — Zero React Re-render) */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden opacity-0 transition-opacity duration-200"
      />

      {/* Top 3D Bevel Accent Bar */}
      <div
        className="absolute top-0 inset-x-5 h-1.5 rounded-b-full opacity-95"
        style={{
          background: `linear-gradient(90deg, ${themeColor}, #06B6D4)`,
        }}
      />

      {/* Closest Reference Banner if surfaced via Fuzzy Proximity */}
      {job.is_closest_reference && (
        <div className="relative z-10 mb-2.5 mt-1 flex items-center justify-between px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
          <span>🎯 Paling Mendekati Referensi Pencarianmu</span>
        </div>
      )}

      {/* Ribbon if already applied */}
      {appliedMeta && (
        <div className="relative z-10 mb-3 mt-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-xs font-bold text-brand-600 dark:text-indigo-300">
          <span>Sudah Dilamar</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px]">
            {appliedMeta.label}
          </span>
        </div>
      )}

      <div className="relative z-10 mt-1">
        {/* Card Header with 3D Extruded Company Cube, Bookmark & Floating Match Ring */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* 3D Tactile Company Block */}
            <div
              style={{
                background: `linear-gradient(145deg, ${themeColor}28, ${themeColor}10)`,
                borderColor: `${themeColor}55`,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)',
              }}
              className="w-13 h-13 p-2.5 rounded-2xl border flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              {job.company_logo || '🏢'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                  {job.company_name}
                </p>
                <BadgeCheck
                  className="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400 shrink-0"
                  title="Mitra Industri Resmi Terverifikasi"
                />
              </div>
              <h4 className="text-base font-display font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2 mt-0.5">
                {job.role_title}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
                  {job.work_type}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  <MapPin className="w-3 h-3 text-brand-500" /> {job.city}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                  {job.education_target === 'Semua' ? 'SMK & Kuliah' : job.education_target}
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark + 3D Floating Match Score Gauge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sfx.bookmarkToggle(!isSaved);
                  onToggleSave(job.id);
                }}
                title={isSaved ? 'Hapus dari Lowongan Tersimpan' : 'Simpan Lowongan (Bookmark)'}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
            )}

            <ProgressRing
              score={matchScore}
              radius={25}
              stroke={5}
              colorClass={ringColorClass}
            >
              <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                <AnimatedNumber value={matchScore} suffix="%" />
              </span>
            </ProgressRing>
          </div>
        </div>

        {/* JobStreet-style Bullet Highlights (2 key responsibilities) */}
        {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
          <ul className="mb-3.5 space-y-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl px-3 py-2 border border-slate-200/60 dark:border-slate-800">
            {job.responsibilities.slice(0, 2).map((resp, idx) => (
              <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                <span className="text-brand-500 font-extrabold">&bull;</span>
                <span className="truncate">{resp}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Skill Tags Breakdown */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Kecocokan Skill ({job.match?.matched_skills?.length || 0}/
              {job.required_skills?.length || 0})
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3 h-3" /> Respon Cepat HRD
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(job.required_skills || []).map((skill) => {
              const isMatched = matchedSet.has(skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                    isMatched
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-300/70 dark:border-slate-700'
                  }`}
                >
                  {isMatched ? (
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      title={`Tambah skill ${skill} ke profilmu`}
                      disabled={addingSkill === skill}
                      onClick={(e) => handleAddSkill(e, skill)}
                      className="w-4 h-4 rounded-full bg-brand-500/20 hover:bg-brand-500 text-brand-600 dark:text-indigo-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  <span>{skill}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Tactile Footer */}
      <div className="relative z-10 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formatRupiah(job.stipend_amount)}</span>
            {job.is_paid && <span className="text-[10px] font-medium text-slate-400">/bln</span>}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {job.duration_months} Bulan
            </span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                job.quota <= 2 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Users className="w-3 h-3" />
              {job.quota <= 2 ? `🔥 Sisa ${job.quota} kursi!` : `Kuota ${job.quota}`}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/lowongan/${job.id}`);
          }}
          className="shrink-0 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-colors shadow-sm"
        >
          <span>Lihat Detail</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </div>
    </div>
  );
}
