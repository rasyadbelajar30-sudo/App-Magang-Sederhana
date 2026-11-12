import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, X, Printer, Save, FileText, Mail } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { spring } from '../../lib/constants';

export function CvEditor({
  formData,
  setFormData,
  previewMode,
  setPreviewMode,
  onSaveToVault,
  savingVault,
}) {
  const { user, updateUserState } = useApp();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('Tersimpan ✓');
  const firstRender = useRef(true);

  // Debounced autosave 800ms to PUT /api/user
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setSaveStatus('Menyimpan...');
    const timer = setTimeout(async () => {
      try {
        const res = await api.put('/user', {
          full_name: formData.full_name,
          phone: formData.phone,
          education_level: formData.education_level,
          institution_name: formData.institution_name,
          major: formData.major,
          grade_or_semester: formData.grade_or_semester,
          gpa_or_score: Number(formData.gpa_or_score) || 0,
          city: formData.city,
          bio: formData.bio,
          portfolio_url: formData.portfolio_url,
        });
        updateUserState(res);
        setSaveStatus('Tersimpan ✓');
        if (res.xp?.gained > 0) {
          toast({
            type: 'success',
            title: 'Profil Lengkap!',
            desc: 'Bonus XP kelengkapan profil berhasil diklaim.',
            xp: res.xp,
          });
        }
      } catch (_err) {
        setSaveStatus('Periksa format input');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    formData.full_name,
    formData.phone,
    formData.education_level,
    formData.institution_name,
    formData.major,
    formData.grade_or_semester,
    formData.gpa_or_score,
    formData.city,
    formData.bio,
    formData.portfolio_url,
  ]);

  const handleAddSkill = async () => {
    const clean = skillInput.trim();
    if (!clean) return;
    try {
      const res = await api.post('/user/skills', { skill: clean });
      updateUserState(res);
      setFormData((prev) => ({
        ...prev,
        skills: res.user.skills,
      }));
      setSkillInput('');
      toast({
        type: 'success',
        title: `Skill "${clean}" ditambahkan!`,
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menambah skill',
        desc: err.message,
      });
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const res = await api.delete(`/user/skills/${encodeURIComponent(skill)}`);
      updateUserState(res);
      setFormData((prev) => ({
        ...prev,
        skills: res.user.skills,
      }));
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menghapus skill',
        desc: err.message,
      });
    }
  };

  const isSmk = formData.education_level === 'SMK';

  return (
    <GlassCard className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Editor Live CV &amp; Surat Pengantar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ketik di kiri, pratinjau dokumen di kanan berubah secara real-time!
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500">
          <Check className="w-3.5 h-3.5" />
          {saveStatus}
        </span>
      </div>

      {/* Toggle Preview Mode: CV vs Surat Pengantar */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        {[
          { id: 'CV', label: 'Dokumen CV ATS-Friendly', icon: FileText },
          { id: 'SURAT_PENGANTAR', label: 'Surat Pengantar Sekolah/Kampus', icon: Mail },
        ].map((tab) => {
          const active = previewMode === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPreviewMode(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="cv-studio-mode-pill"
                  transition={spring}
                  className="absolute inset-0 bg-brand-gradient rounded-xl shadow"
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span
                className={`relative z-10 ${
                  active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            No. WhatsApp / Telepon (08...)
          </label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="081234567890"
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Jenjang Pendidikan
          </label>
          <select
            value={formData.education_level || 'Mahasiswa'}
            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          >
            <option value="Mahasiswa" className="bg-white dark:bg-ink-900">
              Mahasiswa
            </option>
            <option value="SMK" className="bg-white dark:bg-ink-900">
              Siswa SMK
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Nama {isSmk ? 'Sekolah SMK' : 'Kampus / Universitas'}
          </label>
          <input
            type="text"
            value={formData.institution_name || ''}
            onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Jurusan / Program Studi
          </label>
          <input
            type="text"
            value={formData.major || ''}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {isSmk ? 'Kelas' : 'Semester'}
            </label>
            <input
              type="text"
              value={formData.grade_or_semester || ''}
              onChange={(e) => setFormData({ ...formData, grade_or_semester: e.target.value })}
              placeholder={isSmk ? 'Kelas XI' : 'Semester 5'}
              className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {isSmk ? 'Nilai (0-100)' : 'IPK (0-4.00)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.gpa_or_score ?? ''}
              onChange={(e) => setFormData({ ...formData, gpa_or_score: e.target.value })}
              className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Kota Domisili
          </label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            Link Portofolio / GitHub / LinkedIn
          </label>
          <input
            type="url"
            value={formData.portfolio_url || ''}
            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            placeholder="https://github.com/username"
            className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Bio / Ringkasan */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <label className="font-bold text-slate-600 dark:text-slate-300">
            Ringkasan Profil / Bio (Min. 30 Karakter untuk +5 Poin Readiness)
          </label>
          <span
            className={`font-bold ${
              (formData.bio || '').trim().length >= 30 ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            {(formData.bio || '').trim().length} / 30 karakter
          </span>
        </div>
        <textarea
          rows={3}
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Contoh: Mahasiswa Teknologi Informasi semester 5 yang antusias dengan pengembangan web modern menggunakan React dan Node.js serta siap berkontribusi penuh dalam tim..."
          className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Skills Chip Input */}
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
          Keahlian / Skills (Tekan Enter untuk menambah, minimal 5 skill untuk skor penuh)
        </label>
        <div className="flex gap-2 mb-2.5">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="Ketik skill (misal: React, Figma, Microsoft Excel, Git)..."
            className="flex-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
          <Button size="sm" onClick={handleAddSkill}>
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(user?.skills || formData.skills || []).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-indigo-300 border border-brand-500/30"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-rose-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions: Save to Vault & Print */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
        <Button
          onClick={() => onSaveToVault(previewMode)}
          loading={savingVault}
          className="flex-1 sm:flex-none"
        >
          <Save className="w-4 h-4" />
          <span>
            Simpan {previewMode === 'CV' ? 'CV' : 'Surat Pengantar'} ke Brankas Dokumen ✅
          </span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => window.print()}
          className="flex-1 sm:flex-none"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / PDF 🖨️</span>
        </Button>
      </div>
    </GlassCard>
  );
}
