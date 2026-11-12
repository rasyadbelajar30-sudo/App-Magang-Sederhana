import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, MapPin, Wallet, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatRupiah } from '../../lib/format';

const INTEREST_CATEGORIES = [
  { id: 'ALL', label: '🌟 Semua Bidang', keywords: [] },
  {
    id: 'TECH',
    label: '💻 IT, Coding, Game & Data',
    keywords: ['frontend', 'backend', 'mobile', 'flutter', 'data', 'qa', 'cyber', 'jaringan', 'game', 'developer', 'ai', 'python', 'react'],
  },
  {
    id: 'CREATIVE',
    label: '🎨 Desain, UI/UX & Konten Kreator',
    keywords: ['ui/ux', 'designer', 'graphic', 'video', 'tiktok', 'kreatif', 'canva', 'figma', 'layout'],
  },
  {
    id: 'BUSINESS',
    label: '📈 Bisnis, Marketing, PR & Event',
    keywords: ['marketing', 'business', 'campaign', 'pr', 'kol', 'brand', 'operations', 'merchant'],
  },
  {
    id: 'FINANCE_HR',
    label: '🏦 Akuntansi, Keuangan, HR & Admin',
    keywords: ['accounting', 'finance', 'human resources', 'hr', 'admin', 'kasir', 'rekrutmen'],
  },
  {
    id: 'ENGINEERING',
    label: '🔧 Teknik Mesin, Listrik, TKJ & K3',
    keywords: ['teknisi', 'mesin', 'otomotif', 'listrik', 'sinyal', 'hse', 'k3', 'gardu', 'tkj'],
  },
  {
    id: 'HOSPITALITY_LAB',
    label: '🏨 Perhotelan, Kuliner, Bandara & Lab',
    keywords: ['culinary', 'pastry', 'hotel', 'ground staff', 'customer service', 'laboratorium', 'farmasi', 'qc'],
  },
];

const WORK_TYPES = [
  { id: 'ALL', label: 'Bebas (WFO/WFH/Hybrid)' },
  { id: 'WFH', label: '🏠 WFH (Kerja dari Rumah)' },
  { id: 'Hybrid', label: '🔄 Hybrid (Fleksibel)' },
  { id: 'WFO', label: '🏢 WFO (Praktik di Lokasi)' },
];

const STIPEND_OPTIONS = [
  { id: 0, label: 'Semua (Termasuk Fokus Sertifikat)' },
  { id: 1000000, label: '💰 Berbayar (≥ Rp1.000.000/bln)' },
  { id: 2000000, label: '💵 ≥ Rp2.000.000 / bulan' },
  { id: 3000000, label: '💎 ≥ Rp3.000.000 / bulan' },
];

const CITIES = ['Semua', 'Jakarta', 'Bandung', 'Yogyakarta', 'Tangerang', 'Surabaya', 'Bekasi', 'Semarang'];

export function PreferenceMatcherModal({ open, onClose, jobs = [], onApplyPreferences }) {
  const navigate = useNavigate();

  const [interest, setInterest] = useState('ALL');
  const [workType, setWorkType] = useState('ALL');
  const [minStipend, setMinStipend] = useState(0);
  const [city, setCity] = useState('Semua');
  const [maxDuration, setMaxDuration] = useState(6);

  const resetPrefs = () => {
    setInterest('ALL');
    setWorkType('ALL');
    setMinStipend(0);
    setCity('Semua');
    setMaxDuration(6);
  };

  // Compute tailored matches based on user's explicit desires + profile match
  const matchedResults = useMemo(() => {
    const selectedCategory = INTEREST_CATEGORIES.find((c) => c.id === interest);

    return (jobs || [])
      .filter((job) => {
        if (workType !== 'ALL' && job.work_type !== workType) return false;
        if (minStipend > 0 && (job.stipend_amount || 0) < minStipend) return false;
        if (city !== 'Semua' && (job.city || '').toLowerCase() !== city.toLowerCase()) return false;
        if (maxDuration < 6 && (job.duration_months || 6) > maxDuration) return false;

        if (selectedCategory && selectedCategory.keywords.length > 0) {
          const haystack = `${job.role_title} ${job.company_industry} ${(job.required_skills || []).join(' ')} ${job.description}`.toLowerCase();
          const hasKw = selectedCategory.keywords.some((kw) => haystack.includes(kw));
          if (!hasKw) return false;
        }
        return true;
      })
      .map((job) => {
        const reasons = [];
        if (workType !== 'ALL' && job.work_type === workType) {
          reasons.push(`Sistem ${job.work_type}`);
        }
        if (job.stipend_amount > 0) {
          reasons.push(`Uang saku ${formatRupiah(job.stipend_amount)}`);
        }
        if (job.match?.score >= 60) {
          reasons.push(`Skill profil cocok ${job.match.score}%`);
        }
        return {
          ...job,
          reasons,
        };
      })
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
  }, [jobs, interest, workType, minStipend, city, maxDuration]);

  const handleApplyToBoard = () => {
    const selectedCategory = INTEREST_CATEGORIES.find((c) => c.id === interest);
    onApplyPreferences({
      q:
        interest === 'ALL'
          ? ''
          : selectedCategory?.keywords[0] || '',
      work_type: workType === 'ALL' ? '' : workType,
      paid: minStipend > 0 ? 'true' : '',
      city: city === 'Semua' ? '' : city,
      min_stipend: minStipend > 0 ? String(minStipend) : '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🧭 Pencari Magang Pintar Sesuai Keinginanmu"
      size="lg"
    >
      <div className="space-y-5">
        <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3">
          <span>
            Pilih spesifikasi magang impianmu di bawah ini — sistem kami langsung menyaring dan mengurutkan lowongan terbaik untukmu secara instan!
          </span>
          <button
            type="button"
            onClick={resetPrefs}
            className="shrink-0 inline-flex items-center gap-1 font-extrabold text-brand-600 dark:text-cyan-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* 1. Bidang / Minat */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Bidang Pekerjaan yang Kamu Inginkan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTEREST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setInterest(cat.id)}
                className={`text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  interest === cat.id
                    ? 'bg-brand-gradient text-white border-transparent shadow-md'
                    : 'bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-brand-500/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sistem Kerja & 3. Target Uang Saku */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Sistem Kerja Pilihan
            </label>
            <div className="space-y-1.5">
              {WORK_TYPES.map((wt) => (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => setWorkType(wt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    workType === wt.id
                      ? 'bg-brand-500/15 border-brand-500 text-brand-700 dark:text-cyan-300'
                      : 'bg-slate-100/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Harapan Uang Saku (Stipend)
            </label>
            <div className="space-y-1.5">
              {STIPEND_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setMinStipend(st.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    minStipend === st.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Kota & 5. Durasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Kota Penempatan
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'Semua' ? 'Semua Kota di Indonesia' : `Kota ${c}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Durasi Magang Maksimal
            </label>
            <select
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              <option value={6}>Semua Durasi (3 – 6 Bulan)</option>
              <option value={3}>Maksimal 3 Bulan (Cocok PKL SMK)</option>
              <option value={4}>Maksimal 4 Bulan</option>
            </select>
          </div>
        </div>

        {/* Hasil Rekomendasi */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>
                Ditemukan {matchedResults.length} Lowongan yang Sesuai Keinginanmu
              </span>
            </h4>
          </div>

          {matchedResults.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
              Belum ada lowongan yang persis memenuhi kombinasi filter ketat di atas. Coba ubah Kota menjadi <strong>Semua</strong> atau turunkan batas uang saku ya!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {matchedResults.slice(0, 6).map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    onClose();
                    navigate(`/lowongan/${job.id}`);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 hover:bg-brand-500/10 border border-slate-200/80 dark:border-white/10 cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                      {job.company_logo || '🏢'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {job.role_title}
                        </h5>
                        <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                          Cocok {job.match?.score || 0}%
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {job.company_name} &bull; {job.work_type} ({job.city}) &bull;{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatRupiah(job.stipend_amount)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={handleApplyToBoard}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Tampilkan Hasil di Papan Utama</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
