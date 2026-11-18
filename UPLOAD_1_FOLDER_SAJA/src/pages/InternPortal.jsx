import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Calendar,
  UserCheck,
  Building2,
  MapPin,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { IdCard3D } from '../components/intern/IdCard3D';
import { OnboardingChecklist } from '../components/intern/OnboardingChecklist';
import { LogbookForm } from '../components/intern/LogbookForm';
import { LogbookList } from '../components/intern/LogbookList';
import { LoaDocument } from '../components/intern/LoaDocument';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { PIPELINE_STEPS, STATUS_META } from '../lib/constants';
import { formatDateID, formatRupiah } from '../lib/format';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function InternPortal() {
  const navigate = useNavigate();
  const { applications } = useApp();

  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaModalOpen, setLoaModalOpen] = useState(false);

  const fetchPortal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/intern');
      setPortalData(res);
    } catch (_err) {
      setPortalData({ active: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortal();
  }, [fetchPortal]);

  if (loading) {
    return (
      <PageTransition className="space-y-6 pb-12">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-5">
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Locked State if active === false
  if (!portalData?.active) {
    // Find furthest application progress
    const activeApps = (applications || []).filter((a) => a.status !== 'REJECTED');
    let furthestApp = null;
    let maxIdx = -1;
    for (const a of activeApps) {
      const idx = PIPELINE_STEPS.findIndex((s) => s.status === a.status);
      if (idx > maxIdx) {
        maxIdx = idx;
        furthestApp = a;
      }
    }

    const progressPct =
      maxIdx >= 0 ? Math.round(((maxIdx + 1) / PIPELINE_STEPS.length) * 100) : 0;

    return (
      <PageTransition className="pb-12">
        <GlassCard className="max-w-2xl mx-auto p-8 sm:p-12 text-center space-y-6 my-8">
          <motion.div
            animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-brand-500/15 text-brand-500 flex items-center justify-center shadow-inner"
          >
            <Lock className="w-10 h-10" />
          </motion.div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-500">
              Portal Magang Terkunci
            </span>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              Selesaikan seleksi untuk membuka Portal Magang
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Portal ini berisi ID Card Magang Digital 3D, Surat Penerimaan Resmi (LoA), Checklist Onboarding, dan Logbook Harian setelah kamu menandatangani Offering Letter.
            </p>
          </div>

          {furthestApp ? (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-200">
                  Progres Terjauh: {furthestApp.internship?.company_name} ({furthestApp.internship?.role_title})
                </span>
                <span className="text-brand-500">
                  {STATUS_META[furthestApp.status]?.label} ({progressPct}%)
                </span>
              </div>
              <ProgressBar value={progressPct} max={100} shimmer />
            </div>
          ) : null}

          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate(furthestApp ? '/lamaran' : '/lowongan')}
            >
              <span>
                {furthestApp ? 'Lanjutkan Seleksi di Lamaran Saya' : 'Cari & Daftar Lowongan'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      </PageTransition>
    );
  }

  const { application, internship, user, tasks, logbooks, intern_id, period } = portalData;

  // Calculate internship day countdown / progress
  const today = new Date();
  const start = new Date(period.start);
  const end = new Date(period.end);
  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const diffFromStart = Math.round((today - start) / (1000 * 60 * 60 * 24));

  let dayStatusLabel = '';
  let dayProgressPct = 0;
  if (diffFromStart < 0) {
    dayStatusLabel = `Mulai dalam ${Math.abs(diffFromStart)} hari (${formatDateID(period.start)})`;
    dayProgressPct = 5;
  } else {
    const currentDay = Math.min(totalDays, diffFromStart + 1);
    dayStatusLabel = `Hari ke-${currentDay} dari ${totalDays} hari magang`;
    dayProgressPct = Math.min(100, Math.round((currentDay / totalDays) * 100));
  }

  return (
    <PageTransition className="space-y-6 pb-12">
      <div className="grid grid-cols-12 gap-5">
        {/* Tile 1: 3D Flip Digital Intern ID Card (span 5) */}
        <IdCard3D
          user={user}
          internship={internship}
          internId={intern_id}
          period={period}
          hidePrintSheet={loaModalOpen}
          onPrintIdCard={() => window.print()}
          onPrintLoa={() => setLoaModalOpen(true)}
        />

        {/* Tile 2: Ringkasan Magang (span 7) */}
        <GlassCard className="col-span-12 lg:col-span-7 p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-emerald" />
                Status: Peserta Magang Resmi &amp; Aktif
              </span>
              <span className="text-xs font-bold text-slate-400">
                No. LoA: {application.offering_letter_no}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
                style={{
                  backgroundColor: `${internship.company_theme_color || '#4F46E5'}22`,
                  border: `1px solid ${internship.company_theme_color || '#4F46E5'}55`,
                }}
              >
                {internship.company_logo || '🏢'}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  {internship.role_title}
                </h2>
                <p className="text-sm font-bold text-brand-600 dark:text-cyan-400">
                  {internship.company_name} &bull; {internship.company_industry}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-brand-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Mentor Pembimbing</span>
                  <strong className="text-slate-900 dark:text-white">
                    {internship.mentor_name} ({internship.mentor_role})
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cyan-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Periode Magang ({internship.duration_months} Bulan)</span>
                  <strong className="text-slate-900 dark:text-white">
                    {formatDateID(period.start)} – {formatDateID(period.end)}
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Sistem Kerja &amp; Kota</span>
                  <strong className="text-slate-900 dark:text-white">
                    {internship.work_type} — {internship.city}
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Uang Saku Bulanan</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(internship.stipend_amount)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Status Waktu Pelaksanaan</span>
              <span className="text-brand-600 dark:text-cyan-400">{dayStatusLabel}</span>
            </div>
            <ProgressBar value={dayProgressPct} max={100} shimmer heightClass="h-2.5" />
          </div>
        </GlassCard>

        {/* Tile 3: Onboarding Checklist (span 6) */}
        <OnboardingChecklist
          tasks={tasks}
          onTasksChange={(nextTasks) =>
            setPortalData((prev) => ({ ...prev, tasks: nextTasks }))
          }
        />

        {/* Tile 4: Logbook Form (span 6) */}
        <LogbookForm
          onCreated={(newLog) =>
            setPortalData((prev) => ({
              ...prev,
              logbooks: [newLog, ...(prev.logbooks || [])],
            }))
          }
        />

        {/* Tile 5: Logbook List + 4-week Heatmap (span 12) */}
        <LogbookList
          logbooks={logbooks}
          onDeleted={(delId) =>
            setPortalData((prev) => ({
              ...prev,
              logbooks: (prev.logbooks || []).filter((l) => l.id !== delId),
            }))
          }
        />
      </div>

      {/* Modal Preview & Print Surat LoA */}
      <Modal
        open={loaModalOpen}
        onClose={() => setLoaModalOpen(false)}
        title="Surat Keterangan Diterima Magang (LoA)"
        subtitle="Siap dicetak atau disimpan sebagai PDF untuk administrasi sekolah/kampus"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="print-area">
            <LoaDocument
              application={application}
              internship={internship}
              user={user}
              internId={intern_id}
              period={period}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setLoaModalOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF 🖨️</span>
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
