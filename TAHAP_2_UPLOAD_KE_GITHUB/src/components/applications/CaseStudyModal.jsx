import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Send, MailOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function CaseStudyModal({ open, onClose, application, onSubmit, loading }) {
  const [answer, setAnswer] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600); // 10:00 visual countdown
  const [envelopeStage, setEnvelopeStage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setAnswer(application?.test_answer || '');
    setSecondsLeft(600);
    setEnvelopeStage(false);
    setError('');

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, application?.id]);

  if (!application) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleSend = async () => {
    if (answer.trim().length < 50) {
      setError('Jawaban studi kasus minimal harus 50 karakter.');
      return;
    }
    setError('');
    setEnvelopeStage(true);

    setTimeout(async () => {
      await onSubmit(answer.trim());
    }, 1200);
  };

  return (
    <Modal
      open={open}
      onClose={loading || envelopeStage ? undefined : onClose}
      title={`Mini Case Study: ${application.internship?.role_title || ''}`}
      subtitle={`${application.internship?.company_name} • Mentor: ${application.internship?.mentor_name}`}
      maxWidth="max-w-2xl"
    >
      {envelopeStage ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
          <div className="relative" style={{ perspective: 800 }}>
            <motion.div
              initial={{ rotateX: 0, scale: 0.9 }}
              animate={{ rotateX: [0, -35, 0], scale: [0.9, 1.15, 1] }}
              transition={{ duration: 1.1 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40"
            >
              <MailOpen className="w-12 h-12" />
            </motion.div>
          </div>
          <div>
            <h4 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
              Menilai Jawaban &amp; Menerbitkan Offering Letter...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mentor sedang membuka amplop surat penerimaan magang resmimu!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/30">
            <span className="text-xs font-bold text-violet-600 dark:text-violet-300">
              Studi Kasus Posisi {application.internship?.role_title}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-violet-500 text-white">
              <Clock className="w-3.5 h-3.5" />
              {mins}:{secs}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Pertanyaan Studi Kasus:</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{application.internship?.case_study_question}&rdquo;
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Jawaban Solusimu (Minimal 50 Karakter)
              </label>
              <span
                className={`font-bold ${
                  answer.trim().length >= 50 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {answer.trim().length} / 50 karakter
              </span>
            </div>
            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Tuliskan langkah-langkah analisis dan solusi yang akan kamu lakukan..."
              className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleSend} loading={loading}>
              <Send className="w-4 h-4" />
              <span>Kirim Jawaban &amp; Lihat Hasil</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
