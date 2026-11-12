import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Send,
  ArrowRight,
  ArrowLeft,
  Wand2,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DOC_META } from '../../lib/constants';
import { sfx } from '../../lib/soundEffects';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function ApplyModal({ open, onClose, job, onJobRefresh }) {
  const navigate = useNavigate();
  const { readiness, docs, refresh, updateUserState } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [generatingDoc, setGeneratingDoc] = useState(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [startDate, setStartDate] = useState(job?.start_date || '2027-01-04');
  const [commitment, setCommitment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flyingPlane, setFlyingPlane] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormError('');
      setStartDate(job?.start_date || '2027-01-04');
      setCommitment(false);
      setFlyingPlane(false);
    }
  }, [open, job?.id]);

  if (!job) return null;

  const verifiedDocSet = new Set(
    (docs || []).filter((d) => d.doc?.is_verified).map((d) => d.doc_type)
  );
  const requiredDocs = job.required_docs || [];
  const missingDocs = requiredDocs.filter((dt) => !verifiedDocSet.has(dt));
  const allDocsReady = missingDocs.length === 0;

  const handleInlineGenerate = async (docType) => {
    setGeneratingDoc(docType);
    try {
      const res = await api.post('/documents/generate', { doc_type: docType });
      updateUserState(res);
      await refresh();
      if (onJobRefresh) await onJobRefresh();
      toast({
        type: 'success',
        title: `${DOC_META[docType]?.label || docType} berhasil dibuat!`,
        desc: 'Berkas telah tersimpan otomatis di Brankas Dokumen.',
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal men-generate dokumen',
        desc: err.message,
      });
    } finally {
      setGeneratingDoc(null);
    }
  };

  const handleQuickLinkVerify = async (docType) => {
    setGeneratingDoc(docType);
    try {
      const defaultUrl = `https://drive.google.com/maganghub/${docType.toLowerCase()}-terverifikasi`;
      const res = await api.put(`/documents/${docType}`, {
        doc_name: `${DOC_META[docType]?.label || docType} (Tautan Cepat)`,
        source: 'link',
        external_url: defaultUrl,
      });
      updateUserState(res);
      await refresh();
      if (onJobRefresh) await onJobRefresh();
      toast({
        type: 'success',
        title: `${DOC_META[docType]?.label || docType} siap!`,
        desc: 'Tautan berkas berhasil disimpan ke Brankas Dokumen.',
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal melengkapi berkas',
        desc: err.message,
      });
    } finally {
      setGeneratingDoc(null);
    }
  };

  const handleCompleteAllMissingDocs = async () => {
    if (missingDocs.length === 0) return;
    setGeneratingAll(true);
    try {
      for (const dt of missingDocs) {
        if (dt === 'CV' || dt === 'SURAT_PENGANTAR') {
          const res = await api.post('/documents/generate', { doc_type: dt });
          updateUserState(res);
        } else {
          const defaultUrl = `https://drive.google.com/maganghub/${dt.toLowerCase()}-terverifikasi`;
          const res = await api.put(`/documents/${dt}`, {
            doc_name: `${DOC_META[dt]?.label || dt} (Terverifikasi)`,
            source: 'link',
            external_url: defaultUrl,
          });
          updateUserState(res);
        }
      }
      await refresh();
      if (onJobRefresh) await onJobRefresh();
      toast({
        type: 'success',
        title: 'Semua Berkas Wajib Siap! 🎉',
        desc: 'Seluruh dokumen syarat pendaftaran telah dilengkapi otomatis.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal melengkapi berkas sekaligus',
        desc: err.message,
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleAutoCoverLetter = async () => {
    setGeneratingCover(true);
    setFormError('');
    sfx.magicGenerate();
    try {
      const res = await api.post(`/internships/${job.id}/cover-letter`);
      const fullText = res.cover_letter || '';
      setCoverLetter(fullText);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal membuat cover letter otomatis',
        desc: err.message,
      });
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleNextToConfirm = () => {
    if (coverLetter.trim().length < 100) {
      setFormError('Motivasi melamar (Cover Letter) minimal harus 100 karakter.');
      return;
    }
    if (!startDate) {
      setFormError('Pilih tanggal siap mulai magang.');
      return;
    }
    if (!commitment) {
      setFormError('Kamu wajib mencentang komitmen mengikuti program magang.');
      return;
    }
    setFormError('');
    setStep(3);
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const res = await api.post('/applications', {
        internship_id: job.id,
        cover_letter: coverLetter.trim(),
        available_start_date: startDate,
        commitment: true,
      });

      setFlyingPlane(true);
      sfx.paperWhoosh();
      await refresh();

      toast({
        type: 'success',
        title: 'Lamaran Magang Berhasil Dikirim! ✈️',
        desc: `Lamaranmu ke ${job.company_name} telah masuk ke tahap seleksi.`,
        xp: res.xp,
      });

      setTimeout(() => {
        onClose();
        navigate('/lamaran');
      }, 650);
    } catch (err) {
      setFormError(err.message);
      toast({
        type: 'error',
        title: 'Gagal mengirim lamaran',
        desc: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const readinessScore = readiness?.score || 0;
  const readinessMissing = (readiness?.breakdown || [])
    .flatMap((b) => b.missing || [])
    .map((m) => m.title);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Daftar Magang: ${job.role_title}`}
      subtitle={`${job.company_name} • ${job.work_type} (${job.city})`}
      maxWidth="max-w-2xl"
    >
      {/* Stepper Indicator */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[
          { num: 1, label: '1. Cek Berkas Wajib' },
          { num: 2, label: '2. Form Pre-Screening' },
          { num: 3, label: '3. Konfirmasi Kirim' },
        ].map((s) => {
          const active = step === s.num;
          const passed = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  passed
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-brand-gradient text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {passed ? '✓' : s.num}
              </span>
              <span
                className={`text-xs font-bold ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Readiness Warning Banner if < 70 */}
      {readinessScore < 70 && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold">
              Kesiapanmu masih {readinessScore}% (Disarankan ≥ 70%)
            </p>
            {readinessMissing.length > 0 && (
              <p className="mt-0.5 opacity-90">
                Saran pelengkap: {readinessMissing.slice(0, 2).join(', ')}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: CEK BERKAS */}
      {step === 1 && (
        <div className="space-y-4 animate-page-enter">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sistem memverifikasi kelengkapan berkas yang disyaratkan oleh{' '}
              <strong>{job.company_name}</strong>:
            </p>
            {!allDocsReady && (
              <Button
                size="sm"
                loading={generatingAll}
                onClick={handleCompleteAllMissingDocs}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Siapkan Semua Berkas Sekaligus</span>
              </Button>
            )}
          </div>

          <div className="space-y-2.5">
            {requiredDocs.map((docType) => {
              const isReady = verifiedDocSet.has(docType);
              const meta = DOC_META[docType] || { label: docType };
              const canAutoGen = docType === 'CV' || docType === 'SURAT_PENGANTAR';

              return (
                <div
                  key={docType}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
                    isReady
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isReady ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {meta.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isReady
                          ? 'Terverifikasi di Brankas Dokumen ✓'
                          : 'Belum tersedia — wajib dilengkapi sebelum melamar'}
                      </p>
                    </div>
                  </div>

                  {!isReady && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {canAutoGen ? (
                        <Button
                          size="sm"
                          loading={generatingDoc === docType}
                          onClick={() => handleInlineGenerate(docType)}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>⚡ Generate Otomatis</span>
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={generatingDoc === docType}
                            onClick={() => handleQuickLinkVerify(docType)}
                          >
                            <span>⚡ Tautkan Cepat</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              onClose();
                              navigate('/persiapan?tab=dokumen');
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Unggah di Brankas</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button disabled={!allDocsReady} onClick={() => setStep(2)}>
              <span>Lanjut Isi Form</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: FORM PRE-SCREENING */}
      {step === 2 && (
        <div className="space-y-4 animate-page-enter">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Surat Motivasi / Cover Letter (Min. 100 Karakter)
              </label>
              <Button
                size="sm"
                variant="secondary"
                loading={generatingCover}
                onClick={handleAutoCoverLetter}
              >
                <Wand2 className="w-3.5 h-3.5 text-brand-500" />
                <span>✨ Buat Otomatis</span>
              </Button>
            </div>
            <textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Ceritakan alasanmu melamar posisi ini, keahlian yang kamu miliki, dan kesiapanmu mengikuti program magang..."
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-400">
                Gunakan tombol &ldquo;✨ Buat Otomatis&rdquo; untuk menyusun surat sesuai profilmu.
              </span>
              <span
                className={`font-bold ${
                  coverLetter.trim().length >= 100 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {coverLetter.trim().length} / 100 karakter
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal Siap Mulai Magang
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={commitment}
              onChange={(e) => setCommitment(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-brand-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Saya menyatakan bahwa seluruh data dan dokumen yang dilampirkan adalah benar, serta berkomitmen mengikuti program magang di{' '}
              <strong>{job.company_name}</strong> selama <strong>{job.duration_months} bulan</strong> sesuai aturan yang berlaku.
            </span>
          </label>

          {formError && (
            <p className="text-xs font-bold text-rose-500">{formError}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Button>
            <Button onClick={handleNextToConfirm}>
              <span>Review Lamaran</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: KONFIRMASI */}
      {step === 3 && (
        <div className="space-y-4 relative animate-page-enter">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Perusahaan &amp; Posisi:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {job.company_name} — {job.role_title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Skor Kecocokan (Match):</span>
              <span className="font-extrabold text-emerald-500">{job.match?.score || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Siap Mulai:</span>
              <span className="font-bold text-slate-900 dark:text-white">{startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Berkas Terlampir:</span>
              <span className="font-bold text-emerald-500">
                {requiredDocs.join(', ')} (Lengkap ✓)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">
              Cuplikan Cover Letter:
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line line-clamp-5">
              {coverLetter}
            </p>
          </div>

          {flyingPlane && (
            <motion.div
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: 320, y: -180, scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
              className="fixed z-50 pointer-events-none text-brand-500"
            >
              <Send className="w-12 h-12" />
            </motion.div>
          )}

          {formError && <p className="text-xs font-bold text-rose-500">{formError}</p>}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setStep(2)} disabled={submitting}>
              <ArrowLeft className="w-4 h-4" />
              <span>Ubah Form</span>
            </Button>
            <Button onClick={handleSubmitApplication} loading={submitting}>
              <Send className="w-4 h-4" />
              <span>Kirim Lamaran Sekarang</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
