import React, { useMemo, useState } from 'react';
import { Video, Monitor, Building2, CalendarCheck } from 'lucide-react';
import { INTERVIEW_TIME_SLOTS } from '../../lib/constants';
import { Button } from '../ui/Button';

const METHOD_CARDS = [
  { id: 'Zoom', label: 'Zoom Meeting', icon: Video, desc: 'Link dikirim otomatis' },
  { id: 'Google Meet', label: 'Google Meet', icon: Monitor, desc: 'Via kalender undangan' },
  { id: 'Offline', label: 'Kantor (Offline)', icon: Building2, desc: 'Hadir langsung di lokasi' },
];

export function InterviewScheduler({ onSubmit, loading }) {
  // Generate 14 calendar days starting tomorrow
  const next14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;

      days.push({
        iso,
        dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
        isWeekend,
      });
    }
    return days;
  }, []);

  const firstWeekday = next14Days.find((d) => !d.isWeekend)?.iso || '';

  const [selectedDate, setSelectedDate] = useState(firstWeekday);
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [selectedMethod, setSelectedMethod] = useState('Zoom');

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !selectedMethod) return;
    onSubmit({
      interview_date: selectedDate,
      interview_time: selectedTime,
      interview_method: selectedMethod,
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-5">
      <div>
        <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
          Pilih Jadwal Interview HR &amp; User
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Selamat! Berkasmu lolos review administrasi. Pilih tanggal hari kerja (Senin–Jumat), jam, dan metode interview:
        </p>
      </div>

      {/* 14-day Calendar Grid */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          1. Pilih Tanggal (14 Hari ke Depan — Sabtu/Minggu Nonaktif)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {next14Days.map((d) => {
            const active = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.isWeekend}
                onClick={() => setSelectedDate(d.iso)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  d.isWeekend
                    ? 'opacity-35 cursor-not-allowed bg-slate-200/40 dark:bg-white/[0.01] border-transparent'
                    : active
                    ? 'bg-brand-gradient text-white border-transparent shadow-md scale-[1.03]'
                    : 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-brand-500'
                }`}
              >
                <span className="block text-[10px] font-bold uppercase opacity-80">
                  {d.dayName}
                </span>
                <span className="block text-base font-display font-extrabold">{d.dayNum}</span>
                <span className="block text-[10px] opacity-80">{d.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Time Slots */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          2. Pilih Jam Sesi Interview (WIB)
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_TIME_SLOTS.map((slot) => {
            const active = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  active
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-cyan-500'
                }`}
              >
                {slot} WIB
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Method Cards */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          3. Pilih Metode Pelaksanaan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {METHOD_CARDS.map((m) => {
            const Icon = m.icon;
            const active = selectedMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  active
                    ? 'bg-brand-500/15 border-brand-500 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[11px] opacity-75">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleConfirm} loading={loading}>
          <CalendarCheck className="w-4 h-4" />
          <span>Konfirmasi Jadwal Interview</span>
        </Button>
      </div>
    </div>
  );
}
