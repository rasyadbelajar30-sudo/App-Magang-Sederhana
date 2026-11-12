import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  X,
  ArrowUpRight,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { spring } from '../../lib/constants';
import { sfx } from '../../lib/soundEffects';
import { buildJobStreetTypingPrompts, getSmartSuggestions } from '../../lib/smartSearch';
import { formatRupiah } from '../../lib/format';

const CITIES = [
  'Semua',
  'Jakarta',
  'Bandung',
  'Yogyakarta',
  'Tangerang',
  'Surabaya',
  'Bekasi',
  'Semarang',
];

export function JobFilters({
  filters,
  onChange,
  onReset,
  allJobs = [],
  savedCount = 0,
  showSavedOnly = false,
  onToggleSavedOnly,
}) {
  const navigate = useNavigate();
  const inputId = useId();
  const dropdownId = useId();
  const citySelectId = useId();
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);
  const lastCompositionEndRef = useRef(null);

  const [searchInput, setSearchInput] = useState(filters.q || '');
  const [suggestOpen, setSuggestOpen] = useState(false);

  // JobStreet-style Typewriter State
  const typingPrompts = useMemo(() => buildJobStreetTypingPrompts(allJobs), [allJobs]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSearchInput(filters.q || '');
  }, [filters.q]);

  // Smooth Typewriter Animation Effect (runs when searchInput is empty)
  useEffect(() => {
    if (searchInput) return undefined;
    const currentFullText = typingPrompts[promptIdx % typingPrompts.length] || '';

    let timeoutDelay = isDeleting ? 18 : 34;

    if (!isDeleting && typedText === currentFullText) {
      // Pause at full sentence so user can read it like on JobStreet
      timeoutDelay = 2300;
    } else if (isDeleting && typedText === '') {
      timeoutDelay = 260;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentFullText) {
        setIsDeleting(true);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setPromptIdx((prev) => (prev + 1) % typingPrompts.length);
      } else {
        const nextLength = isDeleting ? typedText.length - 1 : typedText.length + 1;
        setTypedText(currentFullText.slice(0, nextLength));
      }
    }, timeoutDelay);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, promptIdx, typingPrompts, searchInput]);

  // Debounce 260ms for live search filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.q || '')) {
        onChange({ ...filters, q: searchInput });
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const onOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const suggestions = getSmartSuggestions(searchInput, allJobs);

  const eduOptions = ['Semua', 'SMK', 'Mahasiswa'];
  const workTypes = ['WFO', 'WFH', 'Hybrid'];

  const selectedWorkTypes = filters.work_type
    ? filters.work_type.split(',').filter(Boolean)
    : [];

  const toggleWorkType = (wt) => {
    sfx.filterPill();
    const exists = selectedWorkTypes.includes(wt);
    const next = exists
      ? selectedWorkTypes.filter((item) => item !== wt)
      : [...selectedWorkTypes, wt];
    onChange({ ...filters, work_type: next.join(',') });
  };

  const handleCompositionEnd = (e) => {
    lastCompositionEndRef.current = e.timeStamp;
  };

  const handleKeyDown = (e) => {
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
      sfx.suggestionSelect();
      setSuggestOpen(false);
      onChange({ ...filters, q: searchInput });
    } else if (e.key === 'Tab' && !searchInput && typedText) {
      // Allow pressing Tab to auto-complete current typewriter prompt
      e.preventDefault();
      const fullPrompt = typingPrompts[promptIdx % typingPrompts.length] || typedText;
      sfx.suggestionSelect();
      setSearchInput(fullPrompt);
      onChange({ ...filters, q: fullPrompt });
    } else if (e.key === 'Escape') {
      setSuggestOpen(false);
    }
  };

  const handleApplyCurrentTypedPrompt = () => {
    const fullPrompt = typingPrompts[promptIdx % typingPrompts.length] || typedText;
    if (!fullPrompt) return;
    sfx.suggestionSelect();
    setSearchInput(fullPrompt);
    setSuggestOpen(false);
    onChange({ ...filters, q: fullPrompt });
  };

  const handlePickReference = (refItem) => {
    sfx.suggestionSelect();
    setSuggestOpen(false);
    if (refItem.filterAction) {
      onChange({ ...filters, ...refItem.filterAction });
    } else {
      const nextQ = refItem.query || refItem.title;
      setSearchInput(nextQ);
      onChange({ ...filters, q: nextQ });
    }
  };

  const handlePickJob = (job) => {
    sfx.cardSelect();
    setSuggestOpen(false);
    navigate(`/lowongan/${job.id}`);
  };

  const handlePickSkill = (skill) => {
    sfx.suggestionSelect();
    setSuggestOpen(false);
    setSearchInput(skill);
    onChange({ ...filters, q: skill });
  };

  return (
    <search
      aria-label="Pencarian dan filter lowongan magang"
      className="sticky top-[60px] z-20 block bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg mb-5"
    >
      {/* ROW 1: FULL-WIDTH JOBSTREET-STYLE HERO SEARCH BAR */}
      <form
        action="/lowongan"
        method="GET"
        onSubmit={(e) => {
          e.preventDefault();
          sfx.clickPrimary();
          setSuggestOpen(false);
          onChange({ ...filters, q: searchInput });
        }}
        className="w-full"
      >
        <div
          ref={searchBoxRef}
          className="relative w-full flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
        >
          {/* Wide Search Box with Live Typewriter Animation */}
          <div className="relative flex-1 flex items-center gap-3 min-h-[52px] sm:min-h-[56px] px-4 sm:px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200/90 dark:border-slate-700/90 focus-within:border-brand-500 dark:focus-within:border-cyan-400 focus-within:bg-white dark:focus-within:bg-[#0F172A] focus-within:ring-4 focus-within:ring-brand-500/15 transition-all shadow-sm">
            <label htmlFor={inputId} className="sr-only">
              Ketik posisi, keahlian, perusahaan, atau deskripsi lowongan yang kamu cari
            </label>
            <Search className="w-5 h-5 text-brand-500 dark:text-cyan-400 shrink-0" />

            <div className="relative flex-1 flex items-center min-w-0 h-full">
              <input
                ref={inputRef}
                id={inputId}
                name="q"
                type="text"
                value={searchInput}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                enterKeyHint="search"
                aria-expanded={suggestOpen}
                aria-controls={dropdownId}
                onCompositionEnd={handleCompositionEnd}
                onFocus={() => {
                  sfx.searchFocus();
                  setSuggestOpen(true);
                }}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSuggestOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="relative z-10 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white focus:outline-none w-full"
              />

              {/* JobStreet-Style Animated Typewriter Overlay when input is empty */}
              {!searchInput && (
                <div
                  aria-hidden="true"
                  onClick={() => inputRef.current?.focus()}
                  className="pointer-events-none select-none absolute inset-0 flex items-center overflow-hidden pr-2"
                >
                  <span className="text-xs sm:text-[15px] font-medium text-slate-400 dark:text-slate-400 truncate">
                    {typedText}
                    <span className="inline-block w-[2px] h-4 sm:h-[18px] ml-0.5 align-middle bg-brand-500 dark:bg-cyan-400 animate-pulse" />
                  </span>
                </div>
              )}
            </div>

            {/* Quick button to try the currently typed sentence or clear input */}
            {!searchInput ? (
              <button
                type="button"
                onClick={handleApplyCurrentTypedPrompt}
                title="Klik untuk mencari dengan kalimat ini"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-cyan-300 text-[11px] font-extrabold shrink-0 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Coba Kalimat Ini</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sfx.clickGhost();
                  setSearchInput('');
                  onChange({ ...filters, q: '' });
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                aria-label="Hapus kata kunci pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City Selector + Primary Search Submit Button */}
          <div className="flex items-stretch gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 min-h-[52px] sm:min-h-[56px] rounded-2xl bg-slate-50 dark:bg-[#0B1120] border-2 border-slate-200/90 dark:border-slate-700/90 shrink-0">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <label htmlFor={citySelectId} className="sr-only">
                Pilih lokasi kota magang
              </label>
              <select
                id={citySelectId}
                name="city"
                value={filters.city || 'Semua'}
                onChange={(e) => {
                  sfx.sortChange();
                  const val = e.target.value;
                  onChange({ ...filters, city: val === 'Semua' ? '' : val });
                }}
                className="bg-transparent text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900">
                    {c === 'Semua' ? 'Semua Kota' : c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 min-h-[52px] sm:min-h-[56px] rounded-2xl bg-brand-gradient text-white text-xs sm:text-sm font-extrabold shadow-md hover:opacity-95 transition-opacity shrink-0 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Cari</span>
            </button>
          </div>

          {/* WIDE, SPACIOUS LIVE SMART REFERENCE & PROXIMITY DROPDOWN */}
          <AnimatePresence>
            {suggestOpen && (
              <motion.div
                id={dropdownId}
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                transition={{ duration: 0.14 }}
                className="absolute left-0 right-0 top-full mt-2.5 w-full rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 sm:p-5 space-y-4 max-h-[420px] overflow-y-auto">
                  {/* Section 1: Closest Reference Synonyms in a Wide 3-Column Grid */}
                  {suggestions.references.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-1 mb-2.5">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-cyan-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {suggestions.isDefault
                              ? 'Referensi Karir & Pencarian Cepat'
                              : `Referensi Paling Mendekati "${searchInput}"`}
                          </span>
                        </p>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Klik untuk pilih otomatis
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {suggestions.references.map((refItem) => (
                          <button
                            key={refItem.title}
                            type="button"
                            onClick={() => handlePickReference(refItem)}
                            className="text-left flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500/40 transition-all group overflow-hidden"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <span className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 shadow-sm">
                                {refItem.icon}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-300 truncate">
                                    {refItem.title}
                                  </p>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {refItem.desc}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-600 dark:text-cyan-300 whitespace-nowrap">
                              {refItem.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Closest Matching Internships in a Wide 2-Column Grid */}
                  {suggestions.jobs.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2.5">
                        💼 Lowongan Terdekat dengan Referensimu
                      </p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {suggestions.jobs.map((job) => (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => handlePickJob(job)}
                            className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group overflow-hidden"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-lg shrink-0">
                                {job.company_logo || '🏢'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 truncate">
                                  {job.role_title}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {job.company_name} &bull; {job.work_type} ({job.city}) &bull;{' '}
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {formatRupiah(job.stipend_amount)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 whitespace-nowrap">
                                Match {job.match?.score || 0}%
                              </span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Closest Skill Tags */}
                  {suggestions.skills.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
                        ⚡ Skill &amp; Kata Kunci Terdekat
                      </p>
                      <div className="flex flex-wrap gap-2 px-1">
                        {suggestions.skills.map((sk) => (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => handlePickSkill(sk)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 transition-colors"
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
        </div>
      </form>

      {/* ROW 2: SLEEK HORIZONTAL FILTER CONTROLS BAR */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Control Jenjang */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {eduOptions.map((edu) => {
              const active = (filters.education || 'Semua') === edu;
              return (
                <button
                  key={edu}
                  type="button"
                  onClick={() => {
                    sfx.filterPill();
                    onChange({ ...filters, education: edu });
                  }}
                  className="relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="edu-filter-pill"
                      transition={spring}
                      className="absolute inset-0 bg-brand-gradient rounded-xl shadow"
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      active ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {edu}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Multi-toggle Work Type Chips */}
          <div className="flex items-center gap-1.5">
            {workTypes.map((wt) => {
              const active = selectedWorkTypes.includes(wt);
              return (
                <button
                  key={wt}
                  type="button"
                  onClick={() => toggleWorkType(wt)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {wt}
                </button>
              );
            })}
          </div>

          {/* Toggle Paid Only */}
          <button
            type="button"
            onClick={() => {
              sfx.filterPill();
              onChange({
                ...filters,
                paid: filters.paid === 'true' ? '' : 'true',
              });
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filters.paid === 'true'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            💰 Uang Saku (Paid)
          </button>

          {/* Saved / Bookmarked Filter Pill */}
          {onToggleSavedOnly && (
            <button
              type="button"
              onClick={() => {
                sfx.bookmarkToggle(!showSavedOnly);
                onToggleSavedOnly();
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showSavedOnly
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-amber-500 text-amber-500' : ''}`}
              />
              <span>Disimpan ({savedCount})</span>
            </button>
          )}
        </div>

        {/* Right side of Row 2: Sort & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={filters.sort || 'match'}
              onChange={(e) => {
                sfx.sortChange();
                onChange({ ...filters, sort: e.target.value });
              }}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="match" className="bg-white dark:bg-slate-900">
                Urutkan: Match Tertinggi
              </option>
              <option value="stipend" className="bg-white dark:bg-slate-900">
                Urutkan: Uang Saku Tertinggi
              </option>
              <option value="newest" className="bg-white dark:bg-slate-900">
                Urutkan: Terbaru
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              sfx.clickDanger();
              setSearchInput('');
              onReset();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </search>
  );
}
