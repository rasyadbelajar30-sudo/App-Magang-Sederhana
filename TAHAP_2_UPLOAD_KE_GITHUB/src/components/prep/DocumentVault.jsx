import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  UploadCloud,
  Sparkles,
  Eye,
  Trash2,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { DOC_META, spring } from '../../lib/constants';
import { formatDateID } from '../../lib/format';
import { GlassCard } from '../ui/GlassCard';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function DocumentVault() {
  const { docs, refresh, updateUserState } = useApp();
  const { toast } = useToast();

  const [busySlot, setBusySlot] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [linkInputs, setLinkInputs] = useState({});
  const [previewModal, setPreviewModal] = useState(null);

  const readyCount = (docs || []).filter((d) => d.doc?.is_verified).length;

  const handleGenerate = async (docType) => {
    setBusySlot(docType);
    try {
      const res = await api.post('/documents/generate', { doc_type: docType });
      updateUserState(res);
      await refresh();
      toast({
        type: 'success',
        title: `${DOC_META[docType]?.label} berhasil di-generate!`,
        desc: 'Dokumen otomatis telah masuk ke Brankas.',
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal men-generate dokumen',
        desc: err.message,
      });
    } finally {
      setBusySlot(null);
    }
  };

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'Ukuran file terlalu besar',
        desc: 'Maksimal ukuran file adalah 2MB (PDF/JPG/PNG).',
      });
      return;
    }

    setBusySlot(docType);
    setUploadProgress(25);
    const progInterval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 20 : p));
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.putForm(`/documents/${docType}`, formData);
      clearInterval(progInterval);
      setUploadProgress(100);

      updateUserState(res);
      await refresh();
      toast({
        type: 'success',
        title: `${DOC_META[docType]?.label} berhasil diunggah!`,
        desc: `File ${file.name} tersimpan di Supabase Storage.`,
        xp: res.xp,
      });
    } catch (err) {
      clearInterval(progInterval);
      toast({
        type: 'error',
        title: 'Gagal mengunggah berkas',
        desc: err.message,
      });
    } finally {
      setTimeout(() => {
        setBusySlot(null);
        setUploadProgress(0);
      }, 300);
    }
  };

  const handleSaveLink = async (docType) => {
    const rawUrl = (linkInputs[docType] || '').trim();
    if (!rawUrl.startsWith('https://')) {
      toast({
        type: 'error',
        title: 'Tautan tidak valid',
        desc: 'Masukkan URL lengkap yang diawali dengan https://',
      });
      return;
    }

    setBusySlot(docType);
    try {
      const res = await api.put(`/documents/${docType}`, {
        doc_name: `${DOC_META[docType]?.label} (Link)`,
        source: 'link',
        external_url: rawUrl,
      });
      updateUserState(res);
      await refresh();
      setLinkInputs((prev) => ({ ...prev, [docType]: '' }));
      toast({
        type: 'success',
        title: `${DOC_META[docType]?.label} tersimpan!`,
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menyimpan link',
        desc: err.message,
      });
    } finally {
      setBusySlot(null);
    }
  };

  const handleDelete = async (docType) => {
    setBusySlot(docType);
    try {
      const res = await api.delete(`/documents/${docType}`);
      updateUserState(res);
      await refresh();
      toast({
        type: 'warning',
        title: 'Dokumen dihapus',
        desc: `${DOC_META[docType]?.label} telah dihapus dari Brankas.`,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menghapus dokumen',
        desc: err.message,
      });
    } finally {
      setBusySlot(null);
    }
  };

  const handlePreview = async (docType) => {
    setBusySlot(docType);
    try {
      const res = await api.get(`/documents/${docType}/url`);
      setPreviewModal({
        docType,
        label: DOC_META[docType]?.label || docType,
        ...res,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal memuat pratinjau',
        desc: err.message,
      });
    } finally {
      setBusySlot(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Brankas Dokumen Persiapan Magang
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lengkapi minimal 4 berkas berlabel <strong>Wajib</strong> untuk meraih +40 poin Readiness Score.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-extrabold mb-1.5">
            <span className="text-slate-600 dark:text-slate-300">Status Kelengkapan</span>
            <span className="text-emerald-500">{readyCount}/6 dokumen siap</span>
          </div>
          <ProgressBar
            value={readyCount}
            max={6}
            colorClass="bg-emerald-500"
            heightClass="h-2.5"
          />
        </div>
      </GlassCard>

      {/* 6 Slots Grid (3x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {(docs || []).map((slot) => {
          const meta = DOC_META[slot.doc_type] || {};
          const doc = slot.doc;
          const isFilled = Boolean(doc?.is_verified);
          const isBusy = busySlot === slot.doc_type;
          const isDragOver = dragOverSlot === slot.doc_type;

          return (
            <motion.div
              key={slot.doc_type}
              layout
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 0 }}
              transition={spring}
              className="h-full"
            >
              {isFilled ? (
                /* Filled State Card */
                <GlassCard className="p-5 h-full flex flex-col justify-between border-emerald-500/40 bg-emerald-500/[0.04]">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        Terverifikasi ✓
                      </span>
                    </div>

                    <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      {meta.label || slot.label}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-1">
                      {doc.doc_name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Diperbarui: {formatDateID(doc.updated_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-3.5 border-t border-slate-200/80 dark:border-white/10">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={isBusy}
                      onClick={() => handlePreview(slot.doc_type)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat</span>
                    </Button>

                    {meta.canGenerate ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={isBusy}
                        onClick={() => handleGenerate(slot.doc_type)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Perbarui</span>
                      </Button>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200/70 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-300/70 cursor-pointer">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileUpload(slot.doc_type, e.target.files?.[0])}
                        />
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(slot.doc_type)}
                      disabled={isBusy}
                      className="ml-auto p-2 rounded-xl text-rose-500 hover:bg-rose-500/15 transition-colors"
                      title="Hapus dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ) : (
                /* Empty Slot Card with Animated Dashed Border */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(slot.doc_type);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file && !meta.canGenerate) {
                      handleFileUpload(slot.doc_type, file);
                    }
                  }}
                  className={`relative h-full rounded-3xl p-5 flex flex-col justify-between bg-white/60 dark:bg-white/[0.02] border-2 border-dashed transition-all ${
                    isDragOver
                      ? 'border-brand-500 scale-[1.02] bg-brand-500/10'
                      : 'border-slate-300 dark:border-white/15'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          slot.required
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                        }`}
                      >
                        {slot.required ? 'Wajib (+10 Readiness)' : 'Opsional (+30 XP)'}
                      </span>
                    </div>

                    <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      {meta.label || slot.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>

                  {meta.canGenerate ? (
                    <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-white/10">
                      <Button
                        size="md"
                        loading={isBusy}
                        onClick={() => handleGenerate(slot.doc_type)}
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ Generate Otomatis dari Profil</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2.5">
                      {isBusy && uploadProgress > 0 && (
                        <ProgressBar value={uploadProgress} max={100} heightClass="h-1.5" />
                      )}

                      <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-600 dark:text-indigo-300 border border-brand-500/30 text-xs font-bold cursor-pointer transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span>Pilih / Drop File (PDF/JPG/PNG ≤2MB)</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileUpload(slot.doc_type, e.target.files?.[0])}
                        />
                      </label>

                      <div className="flex gap-1.5">
                        <div className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input
                            type="url"
                            placeholder="Atau tempel link https://..."
                            value={linkInputs[slot.doc_type] || ''}
                            onChange={(e) =>
                              setLinkInputs({ ...linkInputs, [slot.doc_type]: e.target.value })
                            }
                            className="bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none w-full"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={isBusy}
                          onClick={() => handleSaveLink(slot.doc_type)}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal Preview */}
      <Modal
        open={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        title={`Pratinjau: ${previewModal?.label || ''}`}
        subtitle={previewModal?.doc_name || ''}
        maxWidth="max-w-3xl"
      >
        {previewModal?.source === 'generated' && (
          <div className="space-y-4">
            <div
              className="print-area bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-inner overflow-auto max-h-[65vh]"
              dangerouslySetInnerHTML={{ __html: previewModal.html }}
            />
            <div className="flex justify-end">
              <Button onClick={() => window.print()}>Cetak / Simpan PDF 🖨️</Button>
            </div>
          </div>
        )}

        {previewModal?.source === 'upload' && (
          <div className="space-y-4">
            {previewModal.mime_type === 'application/pdf' ? (
              <iframe
                src={previewModal.url}
                title={previewModal.doc_name}
                className="w-full h-[65vh] rounded-2xl border border-slate-200"
              />
            ) : (
              <img
                src={previewModal.url}
                alt={previewModal.doc_name}
                className="max-h-[65vh] mx-auto rounded-2xl object-contain"
              />
            )}
          </div>
        )}

        {previewModal?.source === 'link' && (
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dokumen ini tersimpan sebagai tautan eksternal:
            </p>
            <a
              href={previewModal.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-bold text-brand-500 underline break-all"
            >
              {previewModal.url}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
