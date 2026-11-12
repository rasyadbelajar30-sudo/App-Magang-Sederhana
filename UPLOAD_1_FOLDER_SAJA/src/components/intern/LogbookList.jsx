import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { formatDateID } from '../../lib/format';
import { stagger, item } from '../../lib/constants';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export function LogbookList({ logbooks = [], onDeleted }) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState(null);

  // Generate 28 days (4 weeks) heatmap
  const last28Days = useMemo(() => {
    const loggedMap = new Map(logbooks.map((l) => [l.date, l]));
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        iso,
        entry: loggedMap.get(iso) || null,
      });
    }
    return days;
  }, [logbooks]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/intern/logbooks/${id}`);
      if (onDeleted) onDeleted(id);
      toast({
        type: 'warning',
        title: 'Entri Logbook Dihapus',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menghapus logbook',
        desc: err.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <GlassCard className="col-span-12 p-6 space-y-6">
      {/* Heatmap 4 Minggu Terakhir */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Riwayat &amp; Heatmap Kehadiran Logbook (4 Minggu Terakhir)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kotak hijau menandakan tanggal di mana kamu telah mencatat jurnal aktivitas harian.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {last28Days.map((d) => (
            <div
              key={d.iso}
              title={`${d.iso}: ${d.entry ? d.entry.mood : 'Belum ada entri'}`}
              className={`w-5 h-5 rounded-md transition-transform hover:scale-125 ${
                d.entry
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40'
                  : 'bg-slate-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Logbook Entries */}
      {logbooks.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum Ada Catatan Logbook"
          description="Isi form jurnal harian di atas untuk mulai mendokumentasikan kegiatan magangmu!"
        />
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {logbooks.map((log) => {
            const isApproved = log.mentor_status === 'Approved';
            return (
              <motion.div
                key={log.id}
                variants={item}
                className="p-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-display font-bold text-slate-900 dark:text-white">
                      {formatDateID(log.date)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-indigo-300">
                      {log.mood}
                    </span>
                    <Badge variant={isApproved ? 'success' : 'warning'}>
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Approved Mentor
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Reviewed
                        </>
                      )}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {log.activity_summary}
                  </p>

                  {log.obstacle && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      <strong>Kendala:</strong> {log.obstacle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={deletingId === log.id}
                  onClick={() => handleDelete(log.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/15 self-end sm:self-center transition-colors"
                  title="Hapus entri"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </GlassCard>
  );
}
