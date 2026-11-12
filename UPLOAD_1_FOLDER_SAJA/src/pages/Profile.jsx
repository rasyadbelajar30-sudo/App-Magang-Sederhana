import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  RotateCcw,
  LogOut,
  GraduationCap,
  Wrench,
  Plus,
  X,
} from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getInitials } from '../lib/format';
import { spring } from '../lib/constants';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, readiness, level, docs, sims, applications, refresh, updateUserState } = useApp();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    avatar_color: '#4F46E5',
    education_level: 'Mahasiswa',
    institution_name: '',
    major: '',
    grade_or_semester: '',
    gpa_or_score: 0,
    city: '',
    bio: '',
    portfolio_url: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_color: user.avatar_color || '#4F46E5',
        education_level: user.education_level || 'Mahasiswa',
        institution_name: user.institution_name || '',
        major: user.major || '',
        grade_or_semester: user.grade_or_semester || '',
        gpa_or_score: user.gpa_or_score ?? 0,
        city: user.city || '',
        bio: user.bio || '',
        portfolio_url: user.portfolio_url || '',
      });
    }
  }, [user]);

  const isSmk = form.education_level === 'SMK';

  const handleModeSwitch = async (targetMode) => {
    if (form.education_level === targetMode) return;
    try {
      const res = await api.patch('/user/mode', { education_level: targetMode });
      updateUserState(res);
      toast({
        type: 'success',
        title: `Mode beralih ke ${targetMode}`,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal mengubah mode',
        desc: err.message,
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (form.phone && !/^08\d{8,11}$/.test(form.phone.trim())) {
      setFieldError('Nomor telepon harus diawali 08 dan terdiri dari 10–13 digit.');
      return;
    }

    const numGpa = Number(form.gpa_or_score);
    if (isNaN(numGpa) || numGpa < 0 || (isSmk && numGpa > 100) || (!isSmk && numGpa > 4)) {
      setFieldError(
        isSmk
          ? 'Nilai rata-rata SMK harus antara 0 sampai 100.'
          : 'IPK Mahasiswa harus antara 0.00 sampai 4.00.'
      );
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/user', {
        ...form,
        gpa_or_score: numGpa,
      });
      updateUserState(res);
      toast({
        type: 'success',
        title: 'Profil Berhasil Disimpan!',
        desc: 'Readiness Score dan pencocokan lowongan telah diperbarui.',
        xp: res.xp,
      });
    } catch (err) {
      setFieldError(err.message);
      toast({
        type: 'error',
        title: 'Gagal menyimpan profil',
        desc: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    const clean = skillInput.trim();
    if (!clean) return;
    try {
      const res = await api.post('/user/skills', { skill: clean });
      updateUserState(res);
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

  const handleDeleteSkill = async (skill) => {
    try {
      const res = await api.delete(`/user/skills/${encodeURIComponent(skill)}`);
      updateUserState(res);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menghapus skill',
        desc: err.message,
      });
    }
  };

  const handleResetProgress = async () => {
    setResetting(true);
    try {
      await api.post('/dev/reset');
      await refresh();
      setResetModalOpen(false);
      toast({
        type: 'warning',
        title: 'Progres Berhasil Direset',
        desc: 'Seluruh lamaran, berkas, latihan, dan XP akunmu telah dikembalikan ke awal.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal mereset progres',
        desc: err.message,
      });
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/masuk');
  };

  return (
    <PageTransition className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Profile Summary & Mode Switcher */}
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-display font-extrabold shadow-lg shrink-0"
            style={{ backgroundColor: form.avatar_color }}
          >
            {getInitials(form.full_name)}
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
              {form.full_name || 'Peserta Magang'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setForm({ ...form, avatar_color: col })}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    form.avatar_color === col ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Big Animated Mode Toggle */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Switch Mode Jenjang Pendidikan
          </span>
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {[
              { id: 'SMK', label: 'Siswa SMK', icon: Wrench },
              { id: 'Mahasiswa', label: 'Mahasiswa', icon: GraduationCap },
            ].map((m) => {
              const active = form.education_level === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeSwitch(m.id)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="profile-mode-pill"
                      transition={spring}
                      className="absolute inset-0 bg-brand-gradient rounded-xl shadow"
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 relative z-10 ${active ? 'text-white' : 'text-slate-500'}`}
                  />
                  <span
                    className={`relative z-10 ${
                      active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <span className="text-xs text-slate-500 block">Readiness Score</span>
          <strong className="text-2xl font-display font-extrabold text-brand-500">
            {readiness?.score || 0}%
          </strong>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <span className="text-xs text-slate-500 block">Level &amp; XP</span>
          <strong className="text-2xl font-display font-extrabold text-amber-500">
            Lv.{level?.lvl || 1} ({user?.xp_points || 0})
          </strong>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <span className="text-xs text-slate-500 block">Berkas Terverifikasi</span>
          <strong className="text-2xl font-display font-extrabold text-emerald-500">
            {(docs || []).filter((d) => d.doc?.is_verified).length}/6
          </strong>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <span className="text-xs text-slate-500 block">Total Lamaran</span>
          <strong className="text-2xl font-display font-extrabold text-cyan-500">
            {(applications || []).length}
          </strong>
        </GlassCard>
      </div>

      {/* Main Profile Form */}
      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Informasi Akademik &amp; Data Diri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp (Format 08xxxxxxxxxx)
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Nama {isSmk ? 'Sekolah' : 'Kampus'}
              </label>
              <input
                type="text"
                value={form.institution_name}
                onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                placeholder={isSmk ? 'SMK Negeri 2 Depok Sleman' : 'Universitas Gadjah Mada'}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Jurusan / Program Studi
              </label>
              <input
                type="text"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {isSmk ? 'Kelas' : 'Semester'}
              </label>
              <input
                type="text"
                value={form.grade_or_semester}
                onChange={(e) => setForm({ ...form, grade_or_semester: e.target.value })}
                placeholder={isSmk ? 'Kelas XI' : 'Semester 5'}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {isSmk ? 'Nilai Rata-rata (0–100)' : 'IPK (0.00–4.00)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={form.gpa_or_score}
                onChange={(e) => setForm({ ...form, gpa_or_score: e.target.value })}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Kota Domisili
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                URL Portofolio / LinkedIn / GitHub
              </label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-bold text-slate-600 dark:text-slate-300">
                Ringkasan Diri / Bio (Minimal 30 Karakter)
              </label>
              <span
                className={`font-bold ${
                  (form.bio || '').trim().length >= 30 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {(form.bio || '').trim().length} / 30 karakter
              </span>
            </div>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tuliskan ringkasan singkat mengenai minat karier, keahlian utama, dan tujuan magangmu..."
              className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {fieldError && (
            <motion.p
              initial={{ x: -6 }}
              animate={{ x: [0, -6, 6, -4, 4, 0] }}
              className="text-xs font-bold text-rose-500"
            >
              {fieldError}
            </motion.p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </Button>
          </div>
        </form>

        {/* Skills Management */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-sm font-display font-bold text-slate-900 dark:text-white">
            Daftar Keahlian (Skills)
          </h4>
          <div className="flex gap-2 max-w-md">
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
              placeholder="Tambah skill baru..."
              className="flex-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <Button size="sm" onClick={handleAddSkill}>
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(user?.skills || []).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-indigo-300 border border-brand-500/30"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Danger Zone: Reset Progres Saya & Keluar */}
      <GlassCard className="p-6 flex flex-wrap items-center justify-between gap-4 border-rose-500/30">
        <div>
          <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
            Pengaturan Sesi &amp; Reset Demo
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reset progres hanya menghapus data milik akunmu sendiri (lamaran, berkas, latihan &amp; XP) dan mengembalikan kuota lowongan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={() => setResetModalOpen(true)}>
            <RotateCcw className="w-4 h-4" />
            <span>Reset Progres Saya</span>
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </Button>
        </div>
      </GlassCard>

      {/* Reset Confirmation Modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Konfirmasi Reset Progres Saya"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Semua lamaran, berkas di Brankas Dokumen, latihan interview, dan poin XP milik akunmu akan direset ke awal. Lanjutkan?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleResetProgress} loading={resetting}>
              Ya, Reset Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
