import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const MOODS = [
  { id: '🔥 Semangat', emoji: '🔥', label: 'Semangat' },
  { id: '😊 Lancar', emoji: '😊', label: 'Lancar' },
  { id: '🤔 Menantang', emoji: '🤔', label: 'Menantang' },
];

export function LogbookForm({ onCreated }) {
  const { updateUserState } = useApp();
  const { toast } = useToast();

  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayIso);
  const [mood, setMood] = useState('🔥 Semangat');
  const [activity, setActivity] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activity.trim().length < 20) {
      toast({
        type: 'error',
        title: 'Ringkasan aktivitas terlalu singkat',
        desc: 'Tuliskan minimal 20 karakter mengenai kegiatan magangmu hari ini.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/intern/logbooks', {
        date,
        mood,
        activity_summary: activity.trim(),
        obstacle: obstacle.trim(),
      });

      updateUserState(res);
      setActivity('');
      setObstacle('');
      if (onCreated) onCreated(res.logbook);

      toast({
        type: 'success',
        title: 'Logbook Harian Tersimpan! 📓',
        desc: `Jurnal tanggal ${date} telah dikirim ke mentor pembimbing.`,
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menyimpan logbook',
        desc: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="col-span-12 lg:col-span-6 p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Isi Jurnal / Logbook Harian
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catat kegiatan harianmu untuk laporan ke mentor &amp; guru/dosen pembimbing (+15 XP/hari)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal Kegiatan
            </label>
            <input
              type="date"
              max={todayIso}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Mood Harianmu
            </label>
            <div className="flex items-center gap-2">
              {MOODS.map((m) => {
                const active = mood === m.id;
                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    animate={{ scale: active ? 1.15 : 1 }}
                    onClick={() => setMood(m.id)}
                    className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center transition-colors ${
                      active
                        ? 'bg-brand-500/20 border-brand-500 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-[10px] mt-0.5">{m.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label className="font-bold text-slate-600 dark:text-slate-300">
              Ringkasan Aktivitas Harian (Min. 20 Karakter)
            </label>
            <span
              className={`font-bold ${
                activity.trim().length >= 20 ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {activity.trim().length} / 20 karakter
            </span>
          </div>
          <textarea
            rows={3}
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Contoh: Mengikuti daily standup bersama mentor, mempelajari dokumentasi proyek, dan menyelesaikan tugas komponen UI..."
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Kendala / Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={obstacle}
            onChange={(e) => setObstacle(e.target.value)}
            placeholder="Contoh: Butuh akses repository tambahan dari tim IT..."
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>
            <Plus className="w-4 h-4" />
            <span>Simpan Entri Logbook</span>
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
