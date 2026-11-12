import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { spring } from '../../lib/constants';
import { sfx } from '../../lib/soundEffects';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export function Flashcard() {
  const { sims, setSims, updateUserState } = useApp();
  const { toast } = useToast();

  const [category, setCategory] = useState('Semua');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = ['Semua', 'HR', 'Teknis', 'Etika Magang'];
  const filteredSims = (sims || []).filter(
    (s) => category === 'Semua' || s.category === category
  );

  const currentSim = filteredSims[currentIndex] || null;

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [category]);

  useEffect(() => {
    setFlipped(false);
    setAnswer(currentSim?.user_answer || '');
  }, [currentIndex, currentSim?.id]);

  const handlePrev = () => {
    if (filteredSims.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredSims.length - 1));
  };

  const handleNext = () => {
    if (filteredSims.length === 0) return;
    setCurrentIndex((prev) => (prev < filteredSims.length - 1 ? prev + 1 : 0));
  };

  const handleSavePractice = async () => {
    if (!currentSim) return;
    if (answer.trim().length < 30) {
      toast({
        type: 'error',
        title: 'Jawaban terlalu pendek',
        desc: 'Tulis minimal 30 karakter agar latihan interviewmu lebih matang.',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(`/prep/${currentSim.id}/practice`, {
        user_answer: answer.trim(),
      });
      updateUserState(res);

      setSims((prev) =>
        prev.map((item) => (item.id === currentSim.id ? res.sim : item))
      );

      toast({
        type: 'success',
        title: 'Latihan Interview Disimpan!',
        desc: 'Jawabanmu tercatat dan Readiness Score diperbarui.',
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menyimpan latihan',
        desc: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const practicedCount = (sims || []).filter((s) => s.is_practiced).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Category Chips & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  active
                    ? 'bg-brand-gradient text-white border-transparent shadow-md scale-105'
                    : 'bg-white dark:bg-[#161F33] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <Badge variant="success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{practicedCount}/12 Soal Dilatih</span>
        </Badge>
      </div>

      {currentSim && (
        <>
          {/* True 3D Perspective Flip Flashcard (Grid-stacked so it never clips text!) */}
          <div className="relative" style={{ perspective: 1400 }}>
            <motion.div
              onClick={() => {
                sfx.cardFlip();
                setFlipped((f) => !f);
              }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              whileHover={{ scale: 1.01 }}
              transition={spring}
              style={{ transformStyle: 'preserve-3d' }}
              className="grid grid-cols-1 grid-rows-1 w-full min-h-[270px] cursor-pointer select-none"
            >
              {/* FRONT SIDE: QUESTION */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="col-start-1 row-start-1 bg-white/95 dark:bg-[#161F33] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-7 flex flex-col justify-between shadow-2xl"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand">Kategori: {currentSim.category}</Badge>
                  {currentSim.is_practiced ? (
                    <Badge variant="success">Sudah Dilatih ✓</Badge>
                  ) : (
                    <Badge variant="warning">+15 XP</Badge>
                  )}
                </div>

                <div className="my-auto py-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Pertanyaan Interview #{currentIndex + 1} dari {filteredSims.length}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-snug">
                    &ldquo;{currentSim.question}&rdquo;
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-brand-600 dark:text-cyan-400">
                  <RotateCw className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Klik kartu untuk membalik 3D &amp; lihat bocoran jawaban HR (STAR)</span>
                </div>
              </div>

              {/* BACK SIDE: STAR ANSWER GUIDE */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="col-start-1 row-start-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 text-white border border-cyan-500/40 rounded-3xl p-7 flex flex-col justify-between shadow-2xl"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Panduan Jawaban Ideal (Metode STAR)
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
                    <RotateCw className="w-3.5 h-3.5" /> Klik untuk kembali ke soal
                  </span>
                </div>

                <div className="space-y-3 my-auto py-3">
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                    {currentSim.ideal_answer_guide}
                  </p>
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tips HR:</strong> {currentSim.tips}
                    </span>
                  </div>
                </div>

                <div className="text-center text-[11px] text-cyan-300 font-semibold">
                  Sekarang tulis versi jawabanmu sendiri di kotak bawah!
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Arrows & Dots */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="secondary" size="sm" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </Button>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {filteredSims.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Soal ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-7 bg-brand-500'
                      : s.is_practiced
                      ? 'w-2.5 bg-emerald-500'
                      : 'w-2.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={handleNext}>
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Practice Answer Box */}
          <GlassCard className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Latihan Jawabanmu (Min. 30 Karakter)
              </label>
              <span
                className={`text-xs font-bold ${
                  answer.trim().length >= 30 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {answer.trim().length} / 30 karakter
              </span>
            </div>

            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Ketik latihan jawabanmu di sini sesuai pengalaman dan keahlianmu..."
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />

            <div className="flex justify-end">
              <Button onClick={handleSavePractice} loading={saving}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Latihan (+15 XP)</span>
              </Button>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
