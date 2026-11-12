import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileSearch,
  PenLine,
  Award,
  XCircle,
  PartyPopper,
} from 'lucide-react';
import { STATUS_META } from '../../lib/constants';
import { formatDateID } from '../../lib/format';
import { fireCelebration } from '../../lib/confetti';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { PipelineStepper } from './PipelineStepper';
import { ScanningModal } from './ScanningModal';
import { InterviewScheduler } from './InterviewScheduler';
import { CaseStudyModal } from './CaseStudyModal';
import { OfferLetter } from './OfferLetter';
import { SignaturePad } from './SignaturePad';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function ApplicationCard({ application }) {
  const navigate = useNavigate();
  const { user, refresh, updateUserState } = useApp();
  const { toast } = useToast();

  const [expanded, setExpanded] = useState(true);
  const [scanningOpen, setScanningOpen] = useState(false);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const internship = application.internship || {};
  const meta = STATUS_META[application.status] || STATUS_META.SUBMITTED;

  const handleAdvance = async (action, payload = {}) => {
    setLoadingAction(true);
    try {
      const res = await api.post(`/applications/${application.id}/advance`, {
        action,
        ...payload,
      });

      updateUserState(res);
      await refresh();

      if (res.celebrate) {
        fireCelebration();
        setCelebrationModalOpen(true);
      } else {
        toast({
          type: 'success',
          title: 'Tahap Seleksi Meningkat!',
          desc: `Status lamaranmu di ${internship.company_name} kini diperbarui.`,
          xp: res.xp,
        });
      }
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal memproses tahapan',
        desc: err.message,
      });
    } finally {
      setLoadingAction(false);
      setScanningOpen(false);
      setCaseStudyOpen(false);
    }
  };

  const handleWithdraw = async () => {
    setLoadingAction(true);
    try {
      await api.post(`/applications/${application.id}/withdraw`);
      await refresh();
      setWithdrawModalOpen(false);
      toast({
        type: 'warning',
        title: 'Lamaran Dibatalkan',
        desc: `Kuota lowongan di ${internship.company_name} telah dikembalikan.`,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal membatalkan lamaran',
        desc: err.message,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <GlassCard layout className="p-6 space-y-5">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 p-3 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{
                backgroundColor: `${internship.company_theme_color || '#4F46E5'}22`,
                border: `1px solid ${internship.company_theme_color || '#4F46E5'}55`,
              }}
            >
              {internship.company_logo || '🏢'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {internship.company_name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500">
                  Match {application.match_score}%
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                {internship.role_title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dilamar pada {formatDateID(application.created_at)} &bull; {internship.work_type} ({internship.city})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${meta.badgeClass}`}
            >
              {meta.label}
            </span>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <PipelineStepper currentStatus={application.status} />

        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5 pt-2 border-t border-slate-200/80 dark:border-white/10"
          >
            {/* Contextual Action Panel based on current status */}
            {application.status === 'SUBMITTED' && (
              <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                    Tahap 1: Menunggu Verifikasi Berkas HR
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Klik tombol di samping untuk mensimulasikan pemeriksaan CV &amp; berkas wajib oleh HR {internship.company_name}.
                  </p>
                </div>
                <Button onClick={() => setScanningOpen(true)} loading={loadingAction}>
                  <FileSearch className="w-4 h-4" />
                  <span>Simulasikan Verifikasi HR ⚡</span>
                </Button>
              </div>
            )}

            {application.status === 'DOC_REVIEW' && (
              <InterviewScheduler
                loading={loadingAction}
                onSubmit={(schedulePayload) => handleAdvance('schedule', schedulePayload)}
              />
            )}

            {application.status === 'INTERVIEW_SCHEDULED' && (
              <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-500/20 text-cyan-500">
                    Jadwal Interview Terkonfirmasi
                  </span>
                  <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {formatDateID(application.interview_date)} pukul {application.interview_time} WIB via {application.interview_method}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Selesaikan Mini Case Study dari mentor <strong>{internship.mentor_name}</strong> untuk melanjutkan ke penerbitan Offering Letter!
                  </p>
                </div>
                <Button onClick={() => setCaseStudyOpen(true)} loading={loadingAction}>
                  <PenLine className="w-4 h-4" />
                  <span>Kerjakan Mini Case Study ⚡</span>
                </Button>
              </div>
            )}

            {application.status === 'OFFERING_SENT' && (
              <div className="space-y-5">
                <OfferLetter application={application} user={user} />
                <SignaturePad
                  expectedName={user?.full_name}
                  loading={loadingAction}
                  onSign={(sigName) => handleAdvance('sign', { signature_name: sigName })}
                />
              </div>
            )}

            {application.status === 'ACCEPTED_ONBOARDING' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-display font-extrabold text-emerald-600 dark:text-emerald-300">
                      🎉 Selamat! Kamu Resmi Terdaftar Sebagai Peserta Magang Aktif
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Ditandatangani oleh {application.signature_name} pada {formatDateID(application.signed_by_user_at, true)}.
                    </p>
                  </div>
                  <Button variant="emerald" onClick={() => navigate('/portal-magang')}>
                    <Award className="w-4 h-4" />
                    <span>Buka Portal Magang Aktif</span>
                  </Button>
                </div>
                <OfferLetter application={application} user={user} />
              </div>
            )}

            {application.status === 'REJECTED' && application.reject_reason && (
              <p className="text-xs text-rose-400 italic">
                Catatan: {application.reject_reason}
              </p>
            )}

            {/* History Timeline & Withdraw Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider">Riwayat Tahapan:</span>
                {(application.history || []).map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5"
                  >
                    <Clock className="w-3 h-3 text-brand-500" />
                    <strong>{STATUS_META[h.status]?.label || h.status}</strong>
                    <span>({formatDateID(h.at, true)})</span>
                  </span>
                ))}
              </div>

              {application.status !== 'ACCEPTED_ONBOARDING' &&
                application.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(true)}
                    className="text-xs font-bold text-rose-500 hover:underline self-end sm:self-auto"
                  >
                    Batalkan lamaran
                  </button>
                )}
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* Scanning Modal */}
      <ScanningModal
        open={scanningOpen}
        companyName={internship.company_name}
        onComplete={() => handleAdvance('verify')}
      />

      {/* Case Study Modal */}
      <CaseStudyModal
        open={caseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
        application={application}
        loading={loadingAction}
        onSubmit={(test_answer) => handleAdvance('submit_test', { test_answer })}
      />

      {/* Withdraw Confirmation Modal */}
      <Modal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Batalkan Lamaran Magang?"
        subtitle={`${internship.role_title} — ${internship.company_name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Apakah kamu yakin ingin membatalkan lamaran ini? Kuota kursi magang akan dikembalikan ke perusahaan.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWithdrawModalOpen(false)}>
              Kembali
            </Button>
            <Button variant="danger" onClick={handleWithdraw} loading={loadingAction}>
              <XCircle className="w-4 h-4" />
              <span>Ya, Batalkan Lamaran</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Celebration Modal on Accepted */}
      <Modal
        open={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <PartyPopper className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
            Selamat, kamu resmi magang di {internship.company_name}!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ID Card Magang Digital, Surat Bukti Diterima (LoA), Checklist Onboarding, dan Logbook Harianmu kini sudah aktif!
          </p>
          <Button
            variant="emerald"
            size="lg"
            className="w-full"
            onClick={() => {
              setCelebrationModalOpen(false);
              navigate('/portal-magang');
            }}
          >
            Buka Portal Magang 🚀
          </Button>
        </div>
      </Modal>
    </>
  );
}
