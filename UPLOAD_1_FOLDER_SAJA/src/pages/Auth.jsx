import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Rocket,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { spring } from '../lib/constants';
import { BrandLogo } from '../components/ui/BrandLogo';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, isSupabaseConfigured } = useAuth();
  const { toast } = useToast();

  const isRegisterMode = location.pathname === '/daftar';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eduLevel, setEduLevel] = useState('Mahasiswa');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const switchMode = (targetPath) => {
    setErrorMsg('');
    navigate(targetPath);
  };

  // Password strength calculation (0-3)
  let passStrength = 0;
  if (password.length >= 8) passStrength += 1;
  if (/[A-Z]/.test(password) || /\d/.test(password)) passStrength += 1;
  if (password.length >= 10 && /[^a-zA-Z0-9]/.test(password)) passStrength += 1;

  const handleDemoFillAndLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      // Buat akun demo unik / acak baru agar tiap penguji memiliki sandbox terpisah
      let targetEmail = 'demo@maganghub.id';
      let targetPassword = 'demo12345';
      let targetName = 'Rizky Pratama';
      let isRandom = false;

      try {
        const guestRes = await api.post('/user/demo-guest', {});
        if (guestRes && guestRes.email && guestRes.password) {
          targetEmail = guestRes.email;
          targetPassword = guestRes.password;
          targetName = guestRes.name || 'Penguji Demo';
          isRandom = true;
        }
      } catch (guestErr) {
        console.warn('[Demo Guest API fallback to default demo]', guestErr);
      }

      setEmail(targetEmail);
      setPassword(targetPassword);

      await signIn({ email: targetEmail, password: targetPassword });
      window.dispatchEvent(new CustomEvent('mh-replay-intro'));
      toast({
        type: 'success',
        title: `Selamat datang, ${targetName}! 👋`,
        desc: isRandom
          ? 'Akun demo acak khusus untuk sesimu siap! Data lamaran tidak akan bercampur dengan penguji lain.'
          : 'Akun demo berhasil masuk.',
      });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Format email tidak valid.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal harus terdiri dari 8 karakter.');
      return;
    }

    if (isRegisterMode && fullName.trim().length < 2) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await signUp({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          education_level: eduLevel,
        });
        toast({
          type: 'success',
          title: 'Akun Berhasil Dibuat! 🎉',
          desc: 'Selamat datang di MagangHub. Yuk mulai lengkapi kesiapan magangmu!',
        });
        window.dispatchEvent(new CustomEvent('mh-replay-intro'));
        navigate('/');
      } else {
        await signIn({
          email: email.trim(),
          password,
        });
        toast({
          type: 'success',
          title: 'Berhasil Masuk!',
        });
        window.dispatchEvent(new CustomEvent('mh-replay-intro'));
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const floatingCards = [
    {
      title: 'Cari magang yang cocok',
      desc: 'Smart Matching otomatis menghitung persentase kecocokan skill & jenjangmu.',
      delay: 0,
    },
    {
      title: 'Siapkan berkas otomatis',
      desc: '1-Click ATS CV & Surat Pengantar Sekolah/Kampus siap cetak PDF.',
      delay: 1.2,
    },
    {
      title: 'Lacak sampai diterima',
      desc: 'Simulasi interview, studi kasus, tanda tangan Offering Letter & ID Card 3D.',
      delay: 2.4,
    },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
      {/* Left Hero Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-brand-gradient p-12 flex-col justify-between text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/15 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl animate-float-delayed" />

        <div className="relative z-10 flex items-center gap-3">
          <BrandLogo size="lg" />
          <span className="text-2xl font-display font-extrabold tracking-tight">
            MagangHub
          </span>
        </div>

        <div className="relative z-10 space-y-6 my-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Platform Magang &amp; PKL #1 Indonesia
          </span>
          <h1 className="text-4xl font-display font-extrabold leading-tight">
            Dari Persiapan Berkas Hingga Resmi Diterima Magang.
          </h1>
          <p className="text-sm text-white/85 leading-relaxed max-w-lg">
            Dirancang khusus untuk Siswa SMK &amp; Mahasiswa Indonesia. Bangun CV ATS, lengkapi brankas dokumen, lamar ke perusahaan impian, dan rasakan pengalaman seleksi interaktif!
          </p>

          {/* 3 Floating Feature Cards */}
          <div className="space-y-3.5 pt-2">
            {floatingCards.map((fc, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: fc.delay,
                  ease: 'easeInOut',
                }}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg max-w-md"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">{fc.title}</h4>
                  <p className="text-xs text-white/80 mt-0.5">{fc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/70">
          &copy; {new Date().getFullYear()} MagangHub Indonesia &bull; Powered by Supabase &amp; React
        </p>
      </div>

      {/* Right Auth Form Panel */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-4 sm:p-10 pt-14 sm:pt-10 relative">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('mh-replay-intro'))}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
        >
          ✨ Putar Ulang Intro
        </button>
        <div className="w-full max-w-md space-y-5">
          <div className="lg:hidden flex justify-center">
            <BrandLogo size="lg" showText />
          </div>
          {!isSupabaseConfigured && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-extrabold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Kredensial Supabase Belum Diisi (.env)</span>
              </div>
              <p className="opacity-90 leading-relaxed">
                Silakan isi <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>, dan{' '}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> di file <code>.env</code> sesuai petunjuk di{' '}
                <code>README.md</code>, lalu jalankan <code>npm run seed</code>.
              </p>
            </div>
          )}

          <GlassCard className="p-7 sm:p-8">
            {/* Mode Switch Header */}
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
              {[
                { label: 'Masuk Akun', path: '/masuk', active: !isRegisterMode },
                { label: 'Daftar Baru', path: '/daftar', active: isRegisterMode },
              ].map((tab) => (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => switchMode(tab.path)}
                  className="relative flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-colors"
                >
                  {tab.active && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      transition={spring}
                      className="absolute inset-0 bg-brand-gradient rounded-xl shadow"
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      tab.active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isRegisterMode ? 'register' : 'login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                    {isRegisterMode ? 'Buat Akun MagangHub' : 'Selamat Datang Kembali!'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isRegisterMode
                      ? 'Pilih jenjang pendidikanmu dan mulai perjalanan magangmu sekarang.'
                      : 'Masuk untuk melanjutkan progres pendaftaran dan seleksi magangmu.'}
                  </p>
                </div>

                {isRegisterMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Rizky Pratama"
                        className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Pilih Jenjang: 2 Kartu Besar SMK / Mahasiswa */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Pilih Jenjang Pendidikan
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'SMK', emoji: '🛠️', title: 'Siswa SMK', sub: 'Program PKL / Prakerin' },
                          { id: 'Mahasiswa', emoji: '🎓', title: 'Mahasiswa', sub: 'Magang Reguler / MSIB' },
                        ].map((card) => {
                          const active = eduLevel === card.id;
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => setEduLevel(card.id)}
                              className={`relative p-3.5 rounded-2xl border text-left transition-all overflow-hidden ${
                                active
                                  ? 'border-brand-500 bg-brand-500/15 text-slate-900 dark:text-white shadow-md'
                                  : 'border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="edu-signup-pill"
                                  transition={spring}
                                  className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none"
                                />
                              )}
                              <span className="text-2xl block mb-1">{card.emoji}</span>
                              <p className="text-xs font-extrabold">{card.title}</p>
                              <p className="text-[10px] opacity-75">{card.sub}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password {isRegisterMode && '(Minimal 8 Karakter)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indikator Kekuatan Bar 3 Warna saat Daftar */}
                  {isRegisterMode && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="grid grid-cols-3 gap-1.5 h-1.5">
                        <div
                          className={`rounded-full ${
                            passStrength >= 1 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                        <div
                          className={`rounded-full ${
                            passStrength >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                        <div
                          className={`rounded-full ${
                            passStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Kekuatan Password:{' '}
                        {passStrength === 1
                          ? 'Lemah'
                          : passStrength === 2
                          ? 'Sedang'
                          : passStrength === 3
                          ? 'Kuat ✓'
                          : 'Terlalu Pendek'}
                      </p>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ x: -6 }}
                    animate={{ x: [0, -6, 6, -4, 4, 0] }}
                    className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  {isRegisterMode ? 'Daftar & Mulai Sekarang 🚀' : 'Masuk ke MagangHub'}
                </Button>

                {!isRegisterMode && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={loading}
                    onClick={handleDemoFillAndLogin}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Coba Akun Demo Acak (Random Guest) 🎲</span>
                  </Button>
                )}
              </motion.form>
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
