import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Users,
  Wallet,
  Building2,
  BadgeCheck,
  Bookmark,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  UserCheck,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { formatRupiah, formatDateID } from '../../lib/format';
import { DOC_META } from '../../lib/constants';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Button } from '../ui/Button';
import { sfx } from '../../lib/soundEffects';

export function JobPreviewPane({ job, isSaved = false, onToggleSave }) {
  const navigate = useNavigate();

  if (!job) return null;

  const matchScore = job.match?.score ?? 0;
  const tier = job.match?.tier || 'low';
  const themeColor = job.company_theme_color || '#4F46E5';

  let ringColorClass = 'text-rose-500';
  if (tier === 'high') ringColorClass = 'text-emerald-500';
  else if (tier === 'mid') ringColorClass = 'text-amber-500';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={job.id}
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.99 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="sticky top-[195px] bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-215px)]"
      >
        {/* Top Brand Banner */}
        <div
          className="h-20 px-6 flex items-end pb-3 relative shrink-0"
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #1E1B4B 100%)`,
          }}
        >
          <div className="flex items-center justify-between w-full text-white/90 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 border border-white/20">
              <BadgeCheck className="w-3.5 h-3.5 text-cyan-300" />
              Mitra Industri Resmi MagangHub
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-white/15 px-2.5 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> Mulai: {formatDateID(job.start_date)}
            </span>
          </div>
        </div>

        {/* Scrollable JobStreet Detail Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                style={{
                  background: `linear-gradient(145deg, ${themeColor}28, ${themeColor}10)`,
                  borderColor: `${themeColor}55`,
                }}
                className="w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 shadow-md"
              >
                {job.company_logo || '🏢'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs font-extrabold text-brand-600 dark:text-cyan-400 truncate">
                    {job.company_name} &bull; {job.company_industry}
                  </p>
                </div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white leading-snug mt-0.5">
                  {job.role_title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{job.company_address || job.city}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onToggleSave && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.bookmarkToggle(!isSaved);
                    onToggleSave(job.id);
                  }}
                  title={isSaved ? 'Hapus dari Tersimpan' : 'Simpan Lowongan'}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              )}

              <ProgressRing score={matchScore} radius={26} stroke={5} colorClass={ringColorClass}>
                <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                  <AnimatedNumber value={matchScore} suffix="%" />
                </span>
              </ProgressRing>
            </div>
          </div>

          {/* Primary JobStreet Action Bar */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              size="md"
              onClick={() => navigate(`/lowongan/${job.id}`)}
              className="flex-1 justify-center shadow-lg"
            >
              <span>Lamar Sekarang / Lihat Studi Kasus</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Key Highlights Grid (Gaji, Sistem Kerja, Durasi, Kuota) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
              <p className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                Uang Saku Bulanan
              </p>
              <p className="text-sm font-display font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                {formatRupiah(job.stipend_amount)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Sistem &amp; Lokasi Kerja
              </p>
              <p className="text-sm font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                {job.work_type} &bull; {job.city}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Durasi &amp; Jenjang
              </p>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {job.duration_months} Bulan ({job.education_target === 'Semua' ? 'SMK & Kuliah' : job.education_target})
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Kuota Tersedia
              </p>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                {job.quota} Posisi Aktif
              </p>
            </div>
          </div>

          {/* Deskripsi Pekerjaan */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Deskripsi Program Magang
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Tanggung Jawab Harian */}
          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Tanggung Jawab &amp; Proyek Nyata
              </h4>
              <ul className="space-y-1.5">
                {job.responsibilities.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mentor & Preview Studi Kasus */}
          {job.mentor_name && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Mentor: {job.mentor_name}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {job.mentor_role}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  Bimbingan 1-on-1
                </span>
              </div>

              {job.case_study_question && (
                <div className="pt-2 border-t border-indigo-500/20 text-[11px] text-slate-700 dark:text-slate-300">
                  <p className="font-extrabold text-indigo-600 dark:text-indigo-300 flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3" /> Tantangan Studi Kasus Seleksi:
                  </p>
                  <p className="italic">&ldquo;{job.case_study_question}&rdquo;</p>
                </div>
              )}
            </div>
          )}

          {/* Dokumen Persyaratan */}
          {Array.isArray(job.required_docs) && job.required_docs.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Dokumen Persyaratan
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.required_docs.map((doc) => (
                  <span
                    key={doc}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {DOC_META[doc]?.label || doc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
