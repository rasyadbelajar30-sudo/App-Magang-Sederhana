import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  Send,
  Calendar,
  Building2,
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { SkillMatchBreakdown } from '../components/jobs/SkillMatchBreakdown';
import { ApplyModal } from '../components/jobs/ApplyModal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { DOC_META, STATUS_META, stagger, item } from '../lib/constants';
import { formatDateID, formatRupiah, getInitials } from '../lib/format';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasAcceptedInternship, docs } = useApp();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/internships/${id}`);
      setJob(res);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal memuat detail lowongan',
        desc: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <PageTransition className="space-y-6 pb-12">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!job) return null;

  const verifiedDocSet = new Set(
    (docs || []).filter((d) => d.doc?.is_verified).map((d) => d.doc_type)
  );

  let disableReason = null;
  if (job.applied_status) {
    disableReason = `Sudah Dilamar (${STATUS_META[job.applied_status]?.label || job.applied_status})`;
  } else if (hasAcceptedInternship) {
    disableReason = 'Kamu Sudah Resmi Magang Aktif';
  } else if (job.quota <= 0) {
    disableReason = 'Kuota Lowongan Penuh';
  }

  const themeColor = job.company_theme_color || '#4F46E5';

  return (
    <PageTransition className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate('/lowongan')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Lowongan</span>
      </button>

      {/* Hero Banner with Company Theme Gradient */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #1E1B4B 100%)`,
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shrink-0 shadow-lg">
              {job.company_logo || '🏢'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {job.company_industry}
                </span>
                <span className="text-xs font-bold bg-black/25 px-2.5 py-0.5 rounded-full">
                  Target: {job.education_target === 'Semua' ? 'SMK & Mahasiswa' : job.education_target}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold mt-1">
                {job.role_title}
              </h2>
              <p className="text-sm text-white/90 font-semibold">{job.company_name}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/85 mt-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {job.work_type} &bull; {job.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Durasi {job.duration_months} Bulan
                </span>
                <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-300">
                  <Wallet className="w-4 h-4" /> {formatRupiah(job.stipend_amount)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Sisa Kuota: <strong>{job.quota} Kursi</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Mulai: {formatDateID(job.start_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
            <Button
              size="lg"
              disabled={Boolean(disableReason)}
              onClick={() => setApplyOpen(true)}
              className="bg-white !text-slate-900 hover:bg-slate-100 shadow-xl"
            >
              <Send className="w-4 h-4 text-brand-600" />
              <span>{disableReason || 'Daftar Magang Sekarang'}</span>
            </Button>
            {job.applied_status && (
              <button
                type="button"
                onClick={() => navigate('/lamaran')}
                className="text-xs font-bold text-cyan-300 underline"
              >
                Pantau di halaman Lamaran Saya →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Description, Responsibilities, Mentor */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Deskripsi Program Magang
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {job.description}
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <strong>Lokasi Kantor / Training Center:</strong> {job.company_address}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Tanggung Jawab &amp; Aktivitas Pembelajaran
            </h3>
            <ul className="space-y-3">
              {(job.responsibilities || []).map((resp, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Gambaran & Sistem Magang ("Magang di Sini Gimana Sih?") */}
          <GlassCard className="p-6 space-y-4 border-brand-500/30 dark:border-cyan-400/25">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                Panduan &amp; Gambaran Pelaksanaan
              </span>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
                📘 Magang di {job.company_name} Itu Gimana Sih?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-1">
                <div className="font-extrabold text-brand-700 dark:text-cyan-300">
                  1. Sistem Kerja ({job.work_type})
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {job.work_type === 'WFH'
                    ? 'Dikerjakan 100% secara online dari rumah/kos. Koordinasi harian bersama tim dilakukan melalui video call & ruang kolaborasi digital.'
                    : job.work_type === 'Hybrid'
                    ? `Kombinasi fleksibel: hadir di kantor ${job.city} sekitar 2–3 hari seminggu dan sisanya dapat dikerjakan secara remote dari rumah/kampus.`
                    : `Praktik langsung di lokasi (${job.city}) dengan pendampingan penuh, peralatan kerja standar industri, dan penerapan prosedur K3.`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="font-extrabold text-emerald-700 dark:text-emerald-300">
                  2. Jam Kerja Ramah Pelajar/Mahasiswa
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Senin – Jumat (09.00 – 16.30 WIB) selama {job.duration_months} bulan. Tersedia dispensasi izin resmi apabila ada jadwal ujian sekolah/kampus atau bimbingan guru/dosen.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-1">
                <div className="font-extrabold text-violet-700 dark:text-violet-300">
                  3. Bimbingan Mentor &amp; Logbook
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Kamu tidak dibiarkan bingung sendiri! <strong>{job.mentor_name}</strong> ({job.mentor_role}) akan memberikan briefing tugas terstruktur dan review mingguan atas jurnal logbook-mu.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="font-extrabold text-amber-700 dark:text-amber-300">
                  4. Hak, Fasilitas &amp; Sertifikat Resmi
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Mendapatkan Surat Penerimaan (LoA) resmi, ID Card Magang Digital,{' '}
                  {job.is_paid
                    ? `uang saku bulanan ${formatRupiah(job.stipend_amount)}, `
                    : 'fasilitas operasional harian, '}
                  serta Sertifikat Kelulusan Industri untuk nilai PKL/SKS kampus.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Mentor Info */}
          <GlassCard className="p-6 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-display font-extrabold text-white shrink-0 shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              {getInitials(job.mentor_name)}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500 dark:text-cyan-400">
                Mentor Pembimbing Lapangan
              </span>
              <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
                {job.mentor_name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job.mentor_role} di {job.company_name}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: SkillMatchBreakdown & Document Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <SkillMatchBreakdown job={job} onSkillAdded={fetchDetail} />

          <GlassCard className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Syarat Dokumen Pendaftaran
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pastikan berkas berikut sudah tersedia di Brankas Dokumenmu:
              </p>
            </div>

            <div className="space-y-2.5">
              {(job.required_docs || []).map((docType) => {
                const isReady = verifiedDocSet.has(docType);
                const meta = DOC_META[docType] || { label: docType };
                return (
                  <div
                    key={docType}
                    className={`flex items-center justify-between gap-2 p-3 rounded-2xl border text-xs font-semibold ${
                      isReady
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isReady ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span>{meta.label}</span>
                    </div>

                    {isReady ? (
                      <span className="font-bold">Siap ✓</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/persiapan?tab=dokumen')}
                        className="font-extrabold underline hover:opacity-80"
                      >
                        Lengkapi →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        job={job}
        onJobRefresh={fetchDetail}
      />
    </PageTransition>
  );
}
