import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  GraduationCap,
  Wrench,
  Volume2,
  VolumeX,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { sfx } from '../../lib/soundEffects';
import { buildJobStreetTypingPrompts, getSmartSuggestions } from '../../lib/smartSearch';
import { formatRupiah } from '../../lib/format';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { BrandLogo } from '../ui/BrandLogo';
import { MapButton } from '../jobs/MapButton';

const PAGE_TITLES = {
  '/': 'Dashboard Kesiapan Magang',
  '/lowongan': 'Portal Lowongan Magang & PKL',
  '/persiapan': 'Magang Prep & CV Studio',
  '/lamaran': 'Tracker Lamaran & Seleksi',
  '/portal-magang': 'Portal Peserta Magang Aktif',
  '/profil': 'Profil & Pengaturan Akun',
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, level, updateUserState } = useApp();
  const { toast } = useToast();

  const searchInputId = useId();
  const topbarDropdownId = useId();
  const searchWrapRef = useRef(null);
  const topbarInputRef = useRef(null);
  const lastCompositionEndRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cachedJobs, setCachedJobs] = useState([]);
  const [soundOn, setSoundOn] = useState(() => sfx.isEnabled());
  const [oyenOn, setOyenOn] = useState(() => {
    try {
      return localStorage.getItem('mh-oyen-active') !== 'false';
    } catch (_e) {
      return true;
    }
  });

  useEffect(() => {
    const onOyenState = (e) => {
      if (typeof e?.detail?.active === 'boolean') {
        setOyenOn(e.detail.active);
      }
    };
    window.addEventListener('mh-oyen-state', onOyenState);
    return () => window.removeEventListener('mh-oyen-state', onOyenState);
  }, []);

  // JobStreet-style Typewriter State for Topbar Search
  const typingPrompts = useMemo(() => buildJobStreetTypingPrompts(cachedJobs), [cachedJobs]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const pageTitle = location.pathname.startsWith('/lowongan/')
    ? 'Detail Lowongan & Pendaftaran'
    : PAGE_TITLES[location.pathname] || 'MagangHub';

  // Preload job references once for instant Topbar autocomplete
  useEffect(() => {
    let mounted = true;
    api
      .get('/internships')
      .then((res) => {
        if (mounted && Array.isArray(res)) setCachedJobs(res);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Typewriter loop when searchQuery is empty
  useEffect(() => {
    if (searchQuery) return undefined;
    const currentFullText = typingPrompts[promptIdx % typingPrompts.length] || '';
    let delay = isDeleting ? 18 : 35;

    if (!isDeleting && typedText === currentFullText) {
      delay = 2400;
    } else if (isDeleting && typedText === '') {
      delay = 280;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentFullText) {
        setIsDeleting(true);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setPromptIdx((prev) => (prev + 1) % typingPrompts.length);
      } else {
        const nextLen = isDeleting ? typedText.length - 1 : typedText.length + 1;
        setTypedText(currentFullText.slice(0, nextLen));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, promptIdx, typingPrompts, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const suggestions = getSmartSuggestions(searchQuery, cachedJobs);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const targetQuery =
      searchQuery.trim() || typingPrompts[promptIdx % typingPrompts.length] || '';
    if (!targetQuery) return;
    sfx.suggestionSelect();
    setDropdownOpen(false);
    setSearchQuery(targetQuery);
    navigate(`/lowongan?q=${encodeURIComponent(targetQuery)}`);
  };

  const handleCompositionEnd = (e) => {
    lastCompositionEndRef.current = e.timeStamp;
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.nativeEvent?.isComposing || e.isComposing || e.keyCode === 229) {
        return;
      }
      if (
        lastCompositionEndRef.current !== null &&
        Math.abs(e.timeStamp - lastCompositionEndRef.current) < 50
      ) {
        return;
      }
      handleSearchSubmit();
    } else if (e.key === 'Tab' && !searchQuery && typedText) {
      e.preventDefault();
      const fullPrompt = typingPrompts[promptIdx % typingPrompts.length] || typedText;
      sfx.suggestionSelect();
      setSearchQuery(fullPrompt);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleSelectReference = (refItem) => {
    sfx.suggestionSelect();
    setDropdownOpen(false);
    if (refItem.filterAction) {
      const qs = new URLSearchParams(refItem.filterAction).toString();
      setSearchQuery(refItem.title);
      navigate(`/lowongan?${qs}`);
    } else {
      const qVal = refItem.query || refItem.title;
      setSearchQuery(qVal);
      navigate(`/lowongan?q=${encodeURIComponent(qVal)}`);
    }
  };

  const handleSelectJob = (job) => {
    sfx.cardSelect();
    setDropdownOpen(false);
    navigate(`/lowongan/${job.id}`);
  };

  const handleSelectSkill = (skill) => {
    sfx.suggestionSelect();
    setDropdownOpen(false);
    setSearchQuery(skill);
    navigate(`/lowongan?q=${encodeURIComponent(skill)}`);
  };

  const handleQuickModeToggle = async () => {
    const nextMode = user?.education_level === 'SMK' ? 'Mahasiswa' : 'SMK';
    sfx.toggleSwitch(nextMode === 'Mahasiswa');
    try {
      const res = await api.patch('/user/mode', { education_level: nextMode });
      updateUserState(res);
      toast({
        type: 'success',
        title: `Mode beralih ke ${nextMode}`,
        desc: 'Rekomendasi lowongan disesuaikan otomatis.',
      });
    } catch (_err) {
      // ignore
    }
  };

  const handleThemeToggle = () => {
    sfx.toggleSwitch(theme !== 'dark');
    toggleTheme();
  };

  const handleSoundToggle = () => {
    const next = sfx.setEnabled(!soundOn);
    setSoundOn(next);
  };

  const handleOyenToggle = () => {
    const next = !oyenOn;
    setOyenOn(next);
    window.dispatchEvent(
      new CustomEvent('mh-toggle-oyen', { detail: { active: next } })
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#0F1629] border-b border-slate-200/90 dark:border-slate-800/90 px-3.5 sm:px-6 py-2.5 sm:py-3 mb-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="lg:hidden shrink-0">
            <BrandLogo size="sm" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <button
                type="button"
                onClick={handleQuickModeToggle}
                title="Klik untuk ganti cepat mode SMK / Mahasiswa"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 hover:bg-brand-500/20 font-bold text-brand-600 dark:text-cyan-400 transition-colors shrink-0"
              >
                {user?.education_level === 'SMK' ? (
                  <>
                    <Wrench className="w-3 h-3" /> Mode Siswa SMK
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3" /> Mode Mahasiswa
                  </>
                )}
              </button>
              {user?.institution_name && (
                <>
                  <span className="hidden xs:inline">&bull;</span>
                  <span className="hidden xs:inline truncate max-w-[110px] sm:max-w-[220px] font-medium text-slate-600 dark:text-slate-300">
                    {user.institution_name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {/* Wide JobStreet-Style Smart Reference Search Bar with Live Typewriter */}
          <search
            ref={searchWrapRef}
            aria-label="Pencarian cepat lowongan magang"
            className="relative hidden md:block flex-1 max-w-md lg:max-w-xl"
          >
            <form
              action="/lowongan"
              method="GET"
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/90 focus-within:border-brand-500 dark:focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
            >
              <label htmlFor={searchInputId} className="sr-only">
                Cari posisi, perusahaan, atau referensi skill
              </label>
              <Search className="w-4 h-4 text-brand-500 dark:text-cyan-400 shrink-0" />

              <div className="relative flex-1 flex items-center min-w-0">
                <input
                  ref={topbarInputRef}
                  id={searchInputId}
                  name="q"
                  type="text"
                  value={searchQuery}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  enterKeyHint="search"
                  aria-expanded={dropdownOpen}
                  aria-controls={topbarDropdownId}
                  onCompositionEnd={handleCompositionEnd}
                  onFocus={() => {
                    sfx.searchFocus();
                    setDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder=""
                  className="relative z-10 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none w-full font-medium"
                />

                {/* Typewriter overlay inside Topbar search */}
                {!searchQuery && (
                  <div
                    aria-hidden="true"
                    onClick={() => topbarInputRef.current?.focus()}
                    className="pointer-events-none select-none absolute inset-0 flex items-center overflow-hidden pr-2"
                  >
                    <span className="text-xs text-slate-400 dark:text-slate-400 truncate font-medium">
                      {typedText}
                      <span className="inline-block w-[2px] h-3.5 ml-0.5 align-middle bg-brand-500 dark:bg-cyan-400 animate-pulse" />
                    </span>
                  </div>
                )}
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    sfx.clickGhost();
                    setSearchQuery('');
                    topbarInputRef.current?.focus();
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="submit" className="sr-only">
                Cari
              </button>
            </form>

            {/* Wide Live Reference Autocomplete Popover */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  id={topbarDropdownId}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2.5 w-[480px] lg:w-[580px] rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 space-y-3.5 max-h-[420px] overflow-y-auto">
                    {/* Closest Reference Categories / Intent */}
                    {suggestions.references.length > 0 && (
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-cyan-400 px-1 mb-2">
                          {suggestions.isDefault
                            ? '🧭 Referensi Karir & Pencarian Populer'
                            : `🎯 Referensi Paling Mendekati "${searchQuery}"`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {suggestions.references.map((refItem) => (
                            <button
                              key={refItem.title}
                              type="button"
                              onClick={() => handleSelectReference(refItem)}
                              className="text-left flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 border border-slate-200/80 dark:border-slate-700/80 transition-all group overflow-hidden"
                            >
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-base shrink-0">
                                  {refItem.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 truncate">
                                    {refItem.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {refItem.desc}
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-cyan-300 whitespace-nowrap">
                                {refItem.badge}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Closest Matching Internships */}
                    {suggestions.jobs.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
                          💼 Lowongan Terdekat dengan Referensimu
                        </p>
                        <div className="space-y-1.5">
                          {suggestions.jobs.map((job) => (
                            <div
                              key={job.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleSelectJob(job)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectJob(job);
                                }
                              }}
                              className="w-full text-left flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group overflow-hidden cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0">
                                  {job.company_logo || '🏢'}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 truncate">
                                    {job.role_title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {job.company_name} &bull; {job.work_type} ({job.city}) &bull;{' '}
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                      {formatRupiah(job.stipend_amount)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <MapButton job={job} variant="mini" />
                                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Skill Tags */}
                    {suggestions.skills.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                          ⚡ Keahlian Terkait
                        </p>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {suggestions.skills.map((sk) => (
                            <button
                              key={sk}
                              type="button"
                              onClick={() => handleSelectSkill(sk)}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              + {sk}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </search>

          {/* XP Chip */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-extrabold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <AnimatedNumber value={user?.xp_points || 0} suffix=" XP" />
            <span className="hidden sm:inline text-[11px] opacity-80">(Lv.{level.lvl})</span>
          </div>

          {/* Sound Effects Toggle (ON / OFF) */}
          <button
            type="button"
            onClick={handleSoundToggle}
            aria-label="Toggle efek suara"
            title={
              soundOn
                ? 'Efek Suara Interaktif: AKTIF (Klik untuk Mute)'
                : 'Efek Suara: MUTE (Klik untuk Aktifkan)'
            }
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              soundOn
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Si Oyen 3D Companion Quick Toggle (ON / OFF) */}
          <button
            type="button"
            onClick={handleOyenToggle}
            aria-label={oyenOn ? 'Sembunyikan Si Oyen' : 'Aktifkan Si Oyen'}
            title={
              oyenOn
                ? 'Si Oyen 3D: AKTIF (Klik untuk Sembunyikan)'
                : 'Si Oyen 3D: TERSEMBUNYI (Klik untuk Aktifkan)'
            }
            className={`p-2 rounded-xl border transition-colors shrink-0 text-sm leading-none ${
              oyenOn
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35 hover:bg-amber-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
            }`}
          >
            <span>🐱</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label="Toggle tema"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-brand-600" />
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </header>
  );
}
