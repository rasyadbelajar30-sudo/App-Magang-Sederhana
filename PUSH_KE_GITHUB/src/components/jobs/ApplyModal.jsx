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
  Plus,
  Link2,
  Wrench,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DOC_META } from '../../lib/constants';
import { getRealInternshipStandard } from '../../lib/realInternshipStandards';
import { sfx } from '../../lib/soundEffects';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

function getRealtimeDefaultStartDate(jobStartDate) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Geser ke hari Senin terdekat
  const day = nextWeek.getDay();
  const diffToMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  nextWeek.setDate(nextWeek.getDate() + diffToMonday);
  const isoRealtime = nextWeek.toISOString().slice(0, 10);
  return isoRealtime || jobStartDate || '2026-12-01';
}

export function ApplyModal({ open, onClose, job, onJobRefresh }) {
  const navigate = useNavigate();
  const { user, readiness, docs, refresh, updateUserState } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [generatingDoc, setGeneratingDoc] = useState(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [addingSkill, setAddingSkill] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [availabilityMode, setAvailabilityMode] = useState('Siap Penuh Waktu (Full-Time Magang/PKL)');
  const [startDate, setStartDate] = useState(() =>
    getRealtimeDefaultStartDate(job?.start_date)
  );
  const [commitment, setCommitment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flyingPlane, setFlyingPlane] = useState(false);
  const [formError, setFormError] = useState('');
  const [inlineAiReview, setInlineAiReview] = useState('');
  const [inlineAiLoading, setInlineAiLoading] = useState(false);

  const realStd = getRealInternshipStandard(job);

  useEffect(() => {
    if (open && job) {
      setStep(1);
      setFormError('');
      setStartDate(getRealtimeDefaultStartDate(job?.start_date));
      setPortfolioLink(user?.portfolio_url || '');
      const std = getRealInternshipStandard(job);
      setSelectedTools(std?.tools_and_tech ? std.tools_and_tech.slice(0, 2) : []);
      setCommitment(false);
      setFlyingPlane(false);
      setInlineAiReview('');
    }
  }, [open, job?.id]);

  if (!job) return null;

  const verifiedDocSet = new Set(
    (docs || []).filter((d) => d.doc?.is_verified).map((d) => d.doc_type)
  );
  const requiredDocs = job.required_docs || [];
  const missingDocs = requiredDocs.filter((dt) => !verifiedDocSet.has(dt));
  const allDocsReady = missingDocs.length === 0;

  const userSkillsLower = new Set(
    (user?.skills || []).map((s) => String(s).toLowerCase())
  );
  const requiredSkills = job.required_skills || [];
  const matchedSkills = requiredSkills.filter((s) =>
    userSkillsLower.has(String(s).toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s) => !userSkillsLower.has(String(s).toLowerCase())
  );

  // Real-time ATS keyword detection inside Cover Letter
  const atsKeywords = realStd?.cv_ats_keywords || requiredSkills;
  const coverLower = coverLetter.toLowerCase();
  const includedKeywords = atsKeywords.filter((kw) =>
    coverLower.includes(String(kw).toLowerCase().split(' ')[0])
  );

  const handleQuickAddSkill = async (skillName) => {
    if (addingSkill) return;
    sfx.clickEmerald();
    setAddingSkill(skillName);
    try {
      const res = await api.post('/user/skills', { skill: skillName });
      updateUserState(res);
      await refresh();
      if (onJobRefresh) await onJobRefresh();
      toast({
        type: 'success',
        title: `Skill "${skillName}" ditambahkan ke Profil & CV!`,
        desc: 'Persyaratan kompetensi lowongan diperbarui secara real-time.',
        xp: res.xp,
      });
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
      let fullText = res.cover_letter || '';
      if (selectedTools.length > 0) {
        fullText += `\n\nSecara teknis, saya telah mempraktikkan penggunaan ${selectedTools.join(
          ', '
        )} serta siap mengikuti alur kerja (${job.work_type}) di ${
          job.company_name
        } dengan komitmen ${availabilityMode}.`;
      }
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

  const handleInsertKeywordToCover = (kw) => {
    sfx.filterPill();
    setCoverLetter((prev) => {
      const base = prev.trim();
      if (!base) {
        return `Saya memiliki pengalaman mempraktikkan ${kw} untuk mendukung posisi ${job.role_title} di ${job.company_name}. `;
      }
      return `${base} Saya juga terbiasa menerapkan ${kw} dalam pengerjaan proyek.`;
    });
  };

  const toggleToolSelection = (toolName) => {
    sfx.filterPill();
    setSelectedTools((prev) =>
      prev.includes(toolName)
        ? prev.filter((t) => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleNextToConfirm = async () => {
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
    // Simpan tautan portofolio ke profil user jika diisi/diperbarui saat pendaftaran
    if (portfolioLink.trim() && portfolioLink.trim() !== (user?.portfolio_url || '')) {
      try {
        await api.put('/user', {
          full_name: user?.full_name || 'Peserta Magang',
          phone: user?.phone || '',
          education_level: user?.education_level || 'Mahasiswa',
          institution_name: user?.institution_name || '',
          major: user?.major || '',
          grade_or_semester: user?.grade_or_semester || '',
          gpa_or_score: Number(user?.gpa_or_score) || 0,
          city: user?.city || '',
          bio: user?.bio || '',
          portfolio_url: portfolioLink.trim(),
        });
      } catch (_e) {
        // ignore
      }
    }
    setFormError('');
    setStep(3);
  };

  const handleRunInlineAiAudit = async () => {
    if (inlineAiLoading) return;
    sfx.magicGenerate();
    setInlineAiLoading(true);
    try {
      const res = await api.post('/ai/review-application', {
        role_title: job.role_title,
        company_name: job.company_name,
        required_skills: requiredSkills,
        user_skills: user?.skills || [],
        cover_letter: coverLetter,
        portfolio_url: portfolioLink || user?.portfolio_url || '',
        gpa_or_score: user?.gpa_or_score || '',
        education_level: user?.education_level || 'Mahasiswa',
        major: user?.major || '',
      });
      sfx.chatReceive();
      setInlineAiReview(res?.reply || '');
    } catch (_e) {
      // ignore
    } finally {
      setInlineAiLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setFormError('');
    try {
      const enrichedCoverLetter = [
        coverLetter.trim(),
        selectedTools.length > 0
          ? `\n[Tools & Kompetensi Teknis yang Dikuasai: ${selectedTools.join(', ')}]`
          : '',
        portfolioLink.trim()
          ? `[Tautan Bukti Portofolio/Karya: ${portfolioLink.trim()}]`
          : '',
        `[Ketersediaan Real-Time: ${availabilityMode} • Mulai ${startDate}]`,
      ]
        .filter(Boolean)
        .join('\n');

      const res = await api.post('/applications', {
        internship_id: job.id,
        cover_letter: enrichedCoverLetter,
        available_start_date: startDate,
        commitment: true,
      });

      setFlyingPlane(true);
      sfx.paperWhoosh();
      await refresh();

      toast({
        type: 'success',
        title: 'Lamaran Magang Berhasil Dikirim! ✈️',
        desc: `Lamaranmu ke ${job.company_name} telah masuk ke tahap seleksi & evaluasi AI.`,
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
      <div className="flex items-center justify-between mb-5 px-2">
        {[
          { num: 1, label: '1. Syarat & Berkas Real-Time' },
          { num: 2, label: '2. Pre-Screening Industri' },
          { num: 3, label: '3. Audit AI & Kirim' },
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
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start gap-3">
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

      {/* STEP 1: CEK SYARAT KUALIFIKASI REAL-TIME & BERKAS WAJIB */}
      {step === 1 && (
        <div className="space-y-4 animate-page-enter">
          {/* Real-Time Qualification & Skill Audit Box */}
          {realStd && (
            <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold uppercase tracking-wider text-brand-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Cek Kualifikasi Magang Asli {job.company_name} (Real-Time)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  Match {job.match?.score || 0}%
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Syarat Akademik:</strong> {realStd.academic}
              </p>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Status Kompetensi Wajib di Profilmu ({matchedSkills.length}/{requiredSkills.length} terpenuhi):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((sk) => {
                    const hasIt = userSkillsLower.has(String(sk).toLowerCase());
                    return hasIt ? (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{sk}</span>
                      </span>
                    ) : (
                      <button
                        key={sk}
                        type="button"
                        disabled={addingSkill === sk}
                        onClick={() => handleQuickAddSkill(sk)}
                        title="Klik jika kamu sudah mempelajari skill ini untuk langsung menambahkannya ke CV & Profil"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold bg-amber-500/15 hover:bg-emerald-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{addingSkill === sk ? 'Menambah...' : `${sk} (Klik + Tambah ke Profil)`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Kelengkapan berkas wajib yang disyaratkan oleh{' '}
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
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
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
              <span>Lanjut Form Pre-Screening</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: FORM PRE-SCREENING SESUAI KEBUTUHAN MAGANG ASLI */}
      {step === 2 && (
        <div className="space-y-4 animate-page-enter">
          {/* 1. Checklist Penguasaan Tools Industri Spesifik Lowongan */}
          {realStd && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-500" />
                <span>Tools &amp; Kompetensi Industri {job.company_name} yang Pernah Kamu Praktikkan:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {realStd.tools_and_tech.map((tool) => {
                  const active = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleToolSelection(tool)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        active
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Tautan Portofolio / GitHub / Proyek Praktik */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-brand-500" />
              <span>Tautan Portofolio / GitHub / Figma / Drive Karya (Sesuai Syarat HRD)</span>
            </label>
            <input
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://github.com/username atau https://drive.google.com/..."
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            {realStd?.portfolio_must_have?.[0] && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                💡 Standar {job.company_name}: {realStd.portfolio_must_have[0]}
              </p>
            )}
          </div>

          {/* 3. Cover Letter dengan Detektor Kata Kunci ATS Real-Time */}
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
                <span>✨ Buat Otomatis Sesuai Standar HRD</span>
              </Button>
            </div>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={`Ceritakan alasanmu melamar posisi ${job.role_title} di ${job.company_name}, proyek/praktik yang pernah kamu kerjakan, dan kesiapanmu...`}
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mt-1.5">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] font-bold text-slate-500">
                  Kata Kunci ATS ({includedKeywords.length}/{atsKeywords.length}):
                </span>
                {atsKeywords.map((kw) => {
                  const hasKw = coverLower.includes(
                    String(kw).toLowerCase().split(' ')[0]
                  );
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => !hasKw && handleInsertKeywordToCover(kw)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-colors ${
                        hasKw
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {hasKw ? `✓ ${kw}` : `+ ${kw}`}
                    </button>
                  );
                })}
              </div>
              <span
                className={`font-bold ${
                  coverLetter.trim().length >= 100 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {coverLetter.trim().length} / 100 karakter
              </span>
            </div>
          </div>

          {/* 4. Tanggal Mulai Real-Time & Ketersediaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Tanggal Siap Mulai Magang (Real-Time)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Ketersediaan Jam &amp; Mode ({job.work_type})
              </label>
              <select
                value={availabilityMode}
                onChange={(e) => setAvailabilityMode(e.target.value)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Siap Penuh Waktu (Full-Time Magang/PKL)">
                  Siap Penuh Waktu (Full-Time {job.duration_months} Bulan)
                </option>
                <option value="Siap Sesuai Jadwal Kampus/Sekolah (5 Hari/Minggu)">
                  Siap Sesuai Jadwal Sekolah/Kampus (5 Hari/Minggu)
                </option>
                <option value="Siap Hybrid / Penyesuaian Shift Proyek">
                  Siap Hybrid / Penyesuaian Shift Proyek
                </option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={commitment}
              onChange={(e) => setCommitment(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-brand-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Saya menyatakan bahwa seluruh data, kompetensi teknis, dan dokumen yang dilampirkan adalah benar, serta berkomitmen mengikuti program magang di{' '}
              <strong>{job.company_name}</strong> selama <strong>{job.duration_months} bulan</strong> sesuai standar industri yang berlaku.
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
              <span>Review &amp; Audit AI</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: KONFIRMASI & AUDIT AI SEBELUM KIRIM */}
      {step === 3 && (
        <div className="space-y-4 relative animate-page-enter">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Perusahaan &amp; Posisi:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {job.company_name} — {job.role_title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Skor Kecocokan Real-Time:</span>
              <span className="font-extrabold text-emerald-500">{job.match?.score || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tools Industri yang Dikuasai:</span>
              <span className="font-bold text-slate-900 dark:text-white text-right max-w-[60%] truncate">
                {selectedTools.length > 0 ? selectedTools.join(', ') : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kata Kunci ATS di Cover Letter:</span>
              <span className="font-bold text-brand-600 dark:text-cyan-400">
                {includedKeywords.length} dari {atsKeywords.length} kata kunci
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mulai &amp; Ketersediaan:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {startDate} ({availabilityMode.split(' ')[1] || 'Full-Time'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Berkas Wajib Terlampir:</span>
              <span className="font-bold text-emerald-500">
                {requiredDocs.join(', ')} (Lengkap ✓)
              </span>
            </div>
          </div>

          {/* Optional Pre-Submit AI Audit Button & Result */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>🐱</span>
                <span>Cek Kesiapan Draf Lamaran dengan Oyen.AI</span>
              </span>
              <button
                type="button"
                onClick={handleRunInlineAiAudit}
                disabled={inlineAiLoading}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold transition-colors disabled:opacity-60"
              >
                {inlineAiLoading
                  ? 'Membedah Lamaran...'
                  : inlineAiReview
                  ? '🔄 Cek Ulang dengan AI'
                  : '🤖 Cek Kekurangan Lamaran Sekarang'}
              </button>
            </div>
            {inlineAiReview ? (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-44 overflow-y-auto">
                {inlineAiReview}
              </div>
            ) : (
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Klik tombol di kanan jika ingin AI memeriksa apa yang masih kurang sebelum lamaran dikirim, atau langsung kirim untuk melihat evaluasi lengkapnya di halaman Lamaran Saya.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">
              Cuplikan Cover Letter:
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line line-clamp-4">
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
