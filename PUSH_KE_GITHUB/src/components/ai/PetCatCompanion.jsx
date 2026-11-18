import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Heart,
  Footprints,
  MessageCircleHeart,
  Minimize2,
  RotateCcw,
  Crown,
  Fish,
  MapPin,
} from 'lucide-react';
import { api } from '../../api/client';
import { sfx } from '../../lib/soundEffects';
import { getGoogleMapsSearchUrl } from '../../lib/location';
import { useApp } from '../../context/AppContext';

const OYEN_STORAGE_KEY = 'mh-oyen-active';

const PAGE_REACTIONS = {
  '/': 'Meow~ 🐾 Selamat datang di Dashboard! Si Oyen siap ikut kamu naik-turun layar & pilihkan lowongan terbaik!',
  '/lowongan': 'Ada 22+ lowongan mitra resmi! Arahkan mouse ke kartu lowongan untuk melihat efek 3D-nya ya 🐱🧡',
  '/persiapan': 'Yuk lengkapi CV ATS & Brankas Dokumenmu biar Readiness Score tembus 100%! 📄🐾',
  '/lamaran': 'Si Oyen doakan semoga lamaranmu lancar sampai tahap Offering & Diterima ya! 🍀😻',
  '/portal-magang': 'Semangat magangnya! Jangan lupa isi jurnal logbook harian biar dapat +25 XP~ 🐾',
  '/profil': 'Tambah minimal 5 skill di profilmu yuk, biar persentase kecocokan lowongan makin tinggi! 🚀🐱',
};

const QUICK_PROMPTS = [
  '😹 Bikin pantun kucing oren yang ceria dong!',
  '🎯 Rekomendasikan magang yang paling cocok untukku',
  '🏠 Cari lowongan magang WFH / Hybrid bergaji tinggi',
  '🎤 Latihan simulasi interview HRD bareng Oyen',
  '📄 Buatkan draf Bio & tips CV magang ATS',
];

const ACCESSORIES = [
  { id: 'crown', label: '👑 Boss', title: 'Mahkota Chief Meow Officer 3D' },
  { id: 'shades', label: '🕶️ Keren', title: 'Kacamata 3D Boss Oyen' },
  { id: 'headset', label: '🎧 Mentor', title: 'Headset 3D Career Mentor' },
  { id: 'none', label: '🐱 Polos', title: 'Mode Kucing Natural' },
];

export function PetCatCompanion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  // DOM refs for 60FPS direct GPU manipulation
  const catContainerRef = useRef(null);
  const catSvgRef = useRef(null);
  const headGroupRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftHighlightRef = useRef(null);
  const rightHighlightRef = useRef(null);
  const leftPawRef = useRef(null);
  const rightPawRef = useRef(null);
  const chatEndRef = useRef(null);

  // Full 2D Smooth Spring Physics: Horizontal (X: Kiri-Kanan) AND Vertical (Y: Naik-Turun)
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  const smoothX = useSpring(targetX, {
    stiffness: 52,
    damping: 19,
    mass: 0.65,
  });
  const smoothY = useSpring(targetY, {
    stiffness: 52,
    damping: 19,
    mass: 0.65,
  });

  // UI & 3D Interactive Pet states
  const isTouch =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  const [oyenActive, setOyenActive] = useState(() => {
    try {
      return localStorage.getItem(OYEN_STORAGE_KEY) !== 'false';
    } catch (_e) {
      return true;
    }
  });
  const [isBlinking, setIsBlinking] = useState(false);
  const [followCursor, setFollowCursor] = useState(() => !isTouch);
  const [isPurring, setIsPurring] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [feedingFish, setFeedingFish] = useState(false);
  const [accessoryIdx, setAccessoryIdx] = useState(0); // Default 'crown'
  const [hearts, setHearts] = useState([]);
  const [speechBubble, setSpeechBubble] = useState(
    'Meow~ Aku Si Oyen 3D (Oyen.AI) 👑🐱 Bisa ganti aksesoris, dikasih ikan 🐟, & ikut kamu 2D!'
  );
  const [showBubble, setShowBubble] = useState(true);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(OYEN_STORAGE_KEY, String(oyenActive));
    } catch (_e) {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent('mh-oyen-state', { detail: { active: oyenActive } })
    );
  }, [oyenActive]);

  useEffect(() => {
    const onToggle = (e) => {
      setOyenActive((prev) => {
        const next =
          typeof e?.detail?.active === 'boolean' ? e.detail.active : !prev;
        if (next) sfx.oyenShow();
        else sfx.oyenHide();
        return next;
      });
    };
    window.addEventListener('mh-toggle-oyen', onToggle);
    return () => window.removeEventListener('mh-toggle-oyen', onToggle);
  }, []);

  const currentAccessory = ACCESSORIES[accessoryIdx]?.id || 'crown';

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeModelLabel, setActiveModelLabel] = useState('Google Gemma 4 E2B Instruct');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      model: 'Google Gemma AI',
      content:
        'Meow~ Halo! 🐾🧡 Aku **Si Oyen (Oyen.AI)**, *Chief Meow Officer & Career Paw-sistant 3D* yang ditenagai **Google Gemma AI**!\n\nKamu bebas ngobrol apa aja sama Oyen—mau minta sapaan yang ceria, pantun kucing, curhat, latihan interview HRD, bedah studi kasus, sampai rekomendasi lowongan magang (WFH/WFO/Hybrid)! 🐱✨',
    },
  ]);

  // Job directory for clickable chat links + location
  const [jobsIndex, setJobsIndex] = useState([]);
  useEffect(() => {
    api
      .get('/internships')
      .then((res) => Array.isArray(res) && setJobsIndex(res))
      .catch(() => {});
  }, []);

  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  const findJobByText = (t) => {
    const n = norm(t);
    if (n.length < 4) return null;
    return (
      jobsIndex.find((j) => norm(j.role_title) === n) ||
      jobsIndex.find((j) => n.includes(norm(j.role_title)) || norm(j.role_title).includes(n)) ||
      null
    );
  };

  const findMentionedJobs = (text) => {
    const n = norm(text);
    return jobsIndex.filter((j) => j.role_title && n.includes(norm(j.role_title))).slice(0, 3);
  };

  const mapsUrl = (job) => getGoogleMapsSearchUrl(job);

  const hideOyen = (e) => {
    if (e) e.stopPropagation();
    sfx.oyenHide();
    setChatOpen(false);
    setShowTools(false);
    setOyenActive(false);
  };

  const showOyen = () => {
    sfx.oyenShow();
    setOyenActive(true);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 650);
  };

  const goToJob = (job) => {
    sfx.cardSelect();
    setChatOpen(false);
    navigate(`/lowongan/${job.id}`);
  };

  // 1. Natural blinking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // 2. Page route change reaction
  useEffect(() => {
    const baseRoute = location.pathname.startsWith('/lowongan/')
      ? '/lowongan/detail'
      : location.pathname;

    const msg =
      baseRoute === '/lowongan/detail'
        ? 'Meow! 🧐 Lagi lihat detail lowongan ya? Tanya Si Oyen kalau butuh bantuan jawab studi kasusnya!'
        : PAGE_REACTIONS[baseRoute] ||
          'Meow~ Si Oyen selalu di sini kalau kamu butuh bantuan karir! 🐾';

    setSpeechBubble(msg);
    setShowBubble(true);

    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 6500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 3. Event-Driven 2D Following (X & Y Naik-Turun) + 3D Head Perspective Tracking (Zero idle RAF loop!)
  useEffect(() => {
    if (!oyenActive) return undefined;
    let rafPending = false;
    let lastMouseX = window.innerWidth - 120;
    let lastMouseY = window.innerHeight - 120;
    let walkPhase = 0;
    let walkStopTimer = null;

    const processMouseMove = () => {
      rafPending = false;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isSmallScreen = vw < 640;

      const dockX = vw - (isSmallScreen ? 76 : 105);
      const dockY = vh - (isSmallScreen ? 138 : 105);

      const catCenterX = dockX + smoothX.get() + (isSmallScreen ? 32 : 48);
      const catCenterY = dockY + smoothY.get() + (isSmallScreen ? 32 : 48);

      const dx = lastMouseX - catCenterX;
      const dy = lastMouseY - catCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) / 25, 5.2);

      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      const tiltDeg = Math.max(-9, Math.min(9, dx / 48));

      const transformPupil = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      const transformHighlight = `translate(${(px * 0.45).toFixed(1)}px, ${(py * 0.45).toFixed(1)}px)`;

      if (leftPupilRef.current) leftPupilRef.current.style.transform = transformPupil;
      if (rightPupilRef.current) rightPupilRef.current.style.transform = transformPupil;
      if (leftHighlightRef.current) leftHighlightRef.current.style.transform = transformHighlight;
      if (rightHighlightRef.current) rightHighlightRef.current.style.transform = transformHighlight;

      if (headGroupRef.current) {
        headGroupRef.current.style.transform = `translate(${(px * 0.55).toFixed(1)}px, ${(py * 0.4).toFixed(1)}px) rotate(${tiltDeg.toFixed(1)}deg)`;
      }

      if (followCursor && !chatOpen) {
        const minX = isSmallScreen ? 75 : 290;
        const maxLeftOffset = isSmallScreen ? vw - 90 : vw - 340;
        const desiredScreenX = Math.min(vw - 75, Math.max(minX, lastMouseX + 85));
        const desiredScreenY = Math.min(vh - 75, Math.max(110, lastMouseY + 55));

        const nextOffsetX = desiredScreenX - dockX;
        const nextOffsetY = desiredScreenY - dockY;

        targetX.set(Math.min(16, Math.max(-maxLeftOffset, nextOffsetX)));
        targetY.set(Math.min(16, Math.max(-(vh - 180), nextOffsetY)));

        walkPhase += 0.45;
        const leftLift = Math.sin(walkPhase) * 4.5;
        const rightLift = -Math.sin(walkPhase) * 4.5;
        if (leftPawRef.current) {
          leftPawRef.current.style.transform = `translate(0, ${Math.min(0, leftLift).toFixed(1)}px)`;
        }
        if (rightPawRef.current) {
          rightPawRef.current.style.transform = `translate(0, ${Math.min(0, rightLift).toFixed(1)}px)`;
        }

        if (walkStopTimer) clearTimeout(walkStopTimer);
        walkStopTimer = setTimeout(() => {
          if (leftPawRef.current) leftPawRef.current.style.transform = 'translate(0, 0)';
          if (rightPawRef.current) rightPawRef.current.style.transform = 'translate(0, 0)';
        }, 180);
      }
    };

    const handleMouseMove = (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(processMouseMove);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (walkStopTimer) clearTimeout(walkStopTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [oyenActive, followCursor, chatOpen, targetX, targetY, smoothX, smoothY]);

  // Return smoothly to dock when chat opens
  useEffect(() => {
    if (chatOpen) {
      targetX.set(0);
      targetY.set(0);
    }
  }, [chatOpen, targetX, targetY]);

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const handleResetDock = (e) => {
    if (e) e.stopPropagation();
    targetX.set(0);
    targetY.set(0);
  };

  const handleCycleAccessory = (e) => {
    if (e) e.stopPropagation();
    sfx.equipAccessory();
    const nextIdx = (accessoryIdx + 1) % ACCESSORIES.length;
    setAccessoryIdx(nextIdx);
    const nextAcc = ACCESSORIES[nextIdx];
    setSpeechBubble(`Meow~ Gimana penampilan baru Si Oyen pakai **${nextAcc.title}**? Keren kan! ✨🐱`);
    setShowBubble(true);
  };

  const handleFeedFish = (e) => {
    if (e) e.stopPropagation();
    if (feedingFish) return;
    sfx.catEat();
    setFeedingFish(true);
    setIsPurring(true);
    setIsJumping(true);
    setSpeechBubble(
      `Nyam nyam nyam~ 🐟😻 Makasih ikannya Kak ${(user?.full_name || 'Sobat').split(' ')[0]}! Energi Si Oyen 1000% siap bantuin kamu lolos magang!`
    );
    setShowBubble(true);

    const newHearts = [
      { id: Date.now() + 1, x: -22 },
      { id: Date.now() + 2, x: 0 },
      { id: Date.now() + 3, x: 22 },
    ];
    setHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => setIsJumping(false), 650);
    setTimeout(() => setFeedingFish(false), 950);
    setTimeout(() => setIsPurring(false), 1900);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1500);
  };

  const handlePetCat = (e) => {
    if (e) e.stopPropagation();
    sfx.catPurr();
    setIsPurring(true);
    setIsJumping(true);
    setSpeechBubble(
      `Purrrr~ Meow! 😻🧡 Si Oyen seneng banget dielus Kak ${(user?.full_name || 'Sobat').split(' ')[0]}! Lompat gembira dulu~ 🐾`
    );
    setShowBubble(true);

    const newHearts = [
      { id: Date.now() + 1, x: -20 },
      { id: Date.now() + 2, x: 0 },
      { id: Date.now() + 3, x: 20 },
    ];
    setHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setIsJumping(false);
    }, 650);

    setTimeout(() => {
      setIsPurring(false);
    }, 1800);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1500);
  };

  const handleSendMessage = async (textOverride) => {
    const text = String(textOverride !== undefined ? textOverride : input).trim();
    if (!text || sending) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textOverride === undefined) setInput('');
    setSending(true);
    sfx.chatSend();

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        currentPath: location.pathname,
        history: messages.slice(-6).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      });

      sfx.chatReceive();
      if (res?.model) {
        setActiveModelLabel(res.model);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          model: res?.model || 'Google Gemma AI',
          content:
            res?.reply ||
            'Meow~ 🐾 Si Oyen (Google Gemma AI) siap ngobrol dan membantu karirmu!',
        },
      ]);
    } catch (_err) {
      // Direct Browser Fallback ke server Google Gemma 4 jika API lokal sedang restart
      try {
        const firstName = (user?.full_name || 'Teman').split(' ')[0];
        const directRes = await fetch(
          'https://elseodelasgalletas-gemma4-e2b.hf.space/v1/chat/completions',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content:
                    'Kamu adalah Si Oyen (Oyen.AI), kucing oren 3D yang pintar, ceria, ekspresif, dan suportif di aplikasi MagangHub. Jawablah setiap pesan pengguna secara natural, luwes, hangat, dan cerdas dalam Bahasa Indonesia layaknya teman ngobrol AI sungguhan.',
                },
                {
                  role: 'user',
                  content: `[Pengguna: Kak ${firstName}]\nPesan: ${text}`,
                },
              ],
              max_tokens: 300,
              temperature: 0.78,
              cache_prompt: true,
              chat_template_kwargs: { enable_thinking: false },
            }),
          }
        );
        const directJson = await directRes.json();
        const directReply = directJson?.choices?.[0]?.message?.content?.trim();
        sfx.chatReceive();
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            model: 'Google Gemma 4 E2B (Direct)',
            content:
              directReply ||
              `Meong~! Halo Kak **${firstName}**! 🐱🧡 Si Oyen siap banget ngobrol seru bareng kamu! Yuk cerita lagi~ ✨`,
          },
        ]);
      } catch (_directErr) {
        const firstName = (user?.full_name || 'Teman').split(' ')[0];
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            model: 'Google Gemma AI',
            content: `Meong~! Halo Kak **${firstName}**! 🐱🧡 Si Oyen lagi merapikan kumis sebentar nih, coba kirim pesanmu sekali lagi ya~ 🐾✨`,
          },
        ]);
      }
    } finally {
      setSending(false);
    }
  };

  const renderFormattedText = (raw, withJobLinks = false) => {
    const text = String(raw || '');
    const lines = text.split('\n').map((line, idx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const inner = part.slice(2, -2);
                const job = withJobLinks ? findJobByText(inner) : null;
                if (job) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToJob(job)}
                      className="font-extrabold text-brand-600 dark:text-cyan-300 underline decoration-dotted underline-offset-2 hover:text-amber-600"
                    >
                      {inner}
                    </button>
                  );
                }
                return (
                  <strong key={i} className="font-extrabold text-amber-600 dark:text-amber-300">
                    {inner}
                  </strong>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      });

    if (!withJobLinks) return lines;
    const mentioned = findMentionedJobs(text);
    if (mentioned.length === 0) return lines;
    return (
      <>
        {lines}
        <div className="mt-2.5 space-y-1.5">
          {mentioned.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
            >
              <span className="text-base shrink-0">{job.company_logo || '🏢'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
                  {job.role_title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {job.company_name} • {job.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToJob(job)}
                className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-brand-gradient text-white"
              >
                Lihat
              </button>
              <a
                href={mapsUrl(job)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.cardSelect()}
                className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-300 inline-flex items-center gap-0.5"
              >
                <MapPin className="w-3 h-3" /> Lokasi
              </a>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="fixed bottom-[74px] lg:bottom-4 right-3 sm:right-6 z-50 pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {!oyenActive ? (
          <motion.button
            key="oyen-launcher"
            type="button"
            onClick={showOyen}
            initial={{ opacity: 0, scale: 0.75, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            title="Klik untuk mengaktifkan kembali Si Oyen 3D (Oyen.AI)"
            aria-label="Aktifkan Si Oyen"
            className="pointer-events-auto relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white text-[11px] sm:text-xs font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <span
              className="absolute inset-0 rounded-full animate-ping bg-amber-400/25 pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative text-sm">🐱</span>
            <span className="relative">Aktifkan Oyen.AI</span>
          </motion.button>
        ) : (
          <motion.div
            key="oyen-active"
            initial={{ opacity: 0, scale: 0.7, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 18 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="flex flex-col items-end"
          >
      {/* Oyen.AI Chat Window Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto mb-2.5 sm:mb-3 w-[calc(100vw-1.5rem)] sm:w-[400px] max-h-[72vh] sm:max-h-[540px] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-[0_24px_60px_rgba(15,23,42,0.35)] overflow-hidden bg-white dark:bg-[#111827]"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/25">
                  🐱
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-display font-extrabold tracking-tight">
                      Oyen.AI &bull; Si Oyen 3D
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      ⚡ Google Gemma AI
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 font-medium">
                    {activeModelLabel} &bull; 100% Real AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFollowCursor((v) => !v)}
                  title={followCursor ? 'Mode Ikuti Layar 2D Aktif' : 'Mode Duduk Manis / Geser Manual'}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                    followCursor ? 'bg-white/25 text-white' : 'bg-black/20 text-white/70'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
                  aria-label="Tutup chat Si Oyen"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 max-h-[45vh] sm:max-h-[310px] text-xs bg-slate-50/60 dark:bg-[#0B0F1E]/60">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${
                    m.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    }`}
                  >
                    {m.role === 'user' ? '🧑' : '🐱'}
                  </div>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-[#161F33] text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm'
                    }`}
                  >
                    {m.role === 'assistant' && m.model && (
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{m.model}</span>
                      </div>
                    )}
                    {renderFormattedText(m.content, m.role === 'assistant')}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold pl-2">
                  <span className="animate-bounce">🐾</span>
                  <span>Si Oyen sedang menyusun jawaban terbaik...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-white dark:bg-[#111827] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSendMessage(qp)}
                  className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya Si Oyen apa saja (lowongan, CV, studi kasus)..."
                className="flex-1 text-base sm:text-xs rounded-xl px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white disabled:opacity-40 hover:opacity-95 transition-opacity shadow-md"
                aria-label="Kirim pesan ke Si Oyen"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Claymorphism Interactive Pet Cat ("Si Oyen") */}
      <motion.div
        drag={!followCursor && !chatOpen}
        dragMomentum={false}
        style={{ x: smoothX, y: smoothY }}
        className="pointer-events-auto relative flex flex-col items-end"
      >
        {/* Floating Hearts when Petted / Fed */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, x: h.x, scale: 0.6 }}
              animate={{ opacity: 0, y: -65, x: h.x * 1.4, scale: 1.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
              className="absolute -top-6 right-12 text-rose-500 pointer-events-none z-20"
            >
              <Heart className="w-5 h-5 fill-rose-500" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Flying Fish Treat Animation when Fed */}
        <AnimatePresence>
          {feedingFish && (
            <motion.div
              initial={{ opacity: 1, x: -55, y: 10, scale: 1.2, rotate: -25 }}
              animate={{ opacity: 0, x: -8, y: -15, scale: 0.4, rotate: 15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeIn' }}
              className="absolute bottom-14 right-14 text-2xl pointer-events-none z-30"
            >
              🐟
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speech Bubble */}
        <AnimatePresence>
          {showBubble && !chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.94 }}
              transition={{ duration: 0.18 }}
              className="mb-1.5 sm:mb-2 max-w-[205px] sm:max-w-[275px] p-2.5 sm:p-3 rounded-2xl rounded-br-none bg-white dark:bg-[#161F33] border border-amber-500/40 dark:border-amber-400/35 shadow-xl text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 relative"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute top-1.5 right-1.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
                aria-label="Tutup pesan Si Oyen"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="pr-3 font-medium leading-snug">
                {renderFormattedText(speechBubble)}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    sfx.catMeow();
                    setChatOpen(true);
                  }}
                  className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Tanya Oyen.AI
                </button>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <button
                  type="button"
                  onClick={handleFeedFish}
                  className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  🐟 Kasih Ikan
                </button>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <button
                  type="button"
                  onClick={handlePetCat}
                  className="text-[11px] font-bold text-rose-500 hover:underline"
                >
                  🐾 Elus
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cat Controls + 3D Claymorphism Ginger Tabby Cat */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Interactive 3D Action & Dress-Up Pills */}
          <div className="flex flex-col items-end gap-1 sm:gap-1.5 mb-1 sm:mb-2">
            <AnimatePresence>
            {showTools && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap justify-end items-center gap-1 p-1 max-w-[235px] sm:max-w-none rounded-2xl sm:rounded-full bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              {/* 3D Outfit / Accessory Switcher */}
              <button
                type="button"
                onClick={handleCycleAccessory}
                title="Ganti Aksesoris 3D Si Oyen (Mahkota / Kacamata / Headset)"
                className="min-h-[30px] sm:min-h-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>{ACCESSORIES[accessoryIdx]?.label.replace(/^\S+\s/, '')}</span>
              </button>

              {/* Feed Fish Button */}
              <button
                type="button"
                onClick={handleFeedFish}
                title="Kasih makan ikan ke Si Oyen!"
                className="min-h-[30px] sm:min-h-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <Fish className="w-3 h-3 text-cyan-500" />
                <span>Ikan</span>
              </button>

              {/* 2D Follow Toggle */}
              <button
                type="button"
                onClick={() => {
                  setFollowCursor((v) => {
                    const next = !v;
                    sfx.toggleSwitch(next);
                    if (!next) {
                      targetX.set(0);
                      targetY.set(0);
                    }
                    return next;
                  });
                }}
                className={`min-h-[30px] sm:min-h-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
                  followCursor
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
                title="Aktifkan/Matikan Si Oyen Mengikuti Kursor Naik-Turun & Kiri-Kanan"
              >
                <Footprints className="w-3 h-3" />
                <span>{followCursor ? '2D: ON' : 'Geser'}</span>
              </button>

              {!followCursor && (
                <button
                  type="button"
                  onClick={handleResetDock}
                  title="Kembalikan Si Oyen ke Pojok Bawah"
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              {/* Close / Hide Si Oyen Button */}
              <button
                type="button"
                onClick={hideOyen}
                title="Tutup / Sembunyikan Si Oyen (bisa diaktifkan kembali kapan saja)"
                aria-label="Tutup Si Oyen"
                className="min-h-[30px] sm:min-h-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                <span>Tutup</span>
              </button>
            </motion.div>
            )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => {
                sfx.catMeow();
                setChatOpen((o) => !o);
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white text-[11px] sm:text-xs font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <MessageCircleHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{chatOpen ? 'Tutup Oyen.AI' : 'Tanya Oyen.AI'}</span>
            </button>
          </div>

          {/* 3D Volumetric Pixar/Clay-Style Ginger Tabby Cat SVG */}
          <div
            ref={catContainerRef}
            onClick={() => {
              sfx.catMeow();
              setShowTools((v) => !v);
            }}
            onDoubleClick={handlePetCat}
            title="Klik untuk buka menu Si Oyen • Klik 2x untuk elus 3D Si Oyen!"
            className={`relative w-16 h-16 sm:w-28 sm:h-28 cursor-pointer group transition-transform duration-300 ${
              isJumping ? '-translate-y-4 sm:-translate-y-7 scale-105' : 'animate-oyen-bob'
            }`}
          >
            {/* Quick Corner Close Badge */}
            <button
              type="button"
              onClick={hideOyen}
              title="Sembunyikan Si Oyen"
              aria-label="Sembunyikan Si Oyen"
              className={`absolute -top-1 -right-1 z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 shadow flex items-center justify-center transition-opacity ${
                isTouch && showTools
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
            {/* Glowing Interactive Aura Behind Si Oyen (Pure Radial Gradient) */}
            <div
              className="absolute inset-0 rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 70%)',
              }}
            />

            {/* 3D Pedestal Ground Shadow */}
            <div
              className="absolute bottom-0.5 inset-x-3 h-4 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, transparent 75%)',
              }}
            />

            <svg
              ref={catSvgRef}
              viewBox="0 0 140 140"
              className="relative z-10 w-full h-full"
            >
              <defs>
                {/* 3D Clay/Pixar Volumetric Head Gradient with Specular Top-Left Light */}
                <radialGradient id="oyenHeadFur" cx="38%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#FED7AA" />
                  <stop offset="28%" stopColor="#FB923C" />
                  <stop offset="72%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#9A3412" />
                </radialGradient>

                <radialGradient id="oyenBodyFur" cx="42%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FDBA74" />
                  <stop offset="55%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#7C2D12" />
                </radialGradient>

                <radialGradient id="oyenCreamFur" cx="45%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="65%" stopColor="#FEF3C7" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </radialGradient>

                <linearGradient id="oyenEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FECDD3" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>

                <radialGradient id="oyenIris" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#BEF264" />
                  <stop offset="65%" stopColor="#65A30D" />
                  <stop offset="100%" stopColor="#1A2E05" />
                </radialGradient>

                <linearGradient id="oyenCollar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>

                <linearGradient id="oyenCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
              </defs>

              {/* Smooth Wagging 3D Tail */}
              <g className="animate-oyen-tail">
                <path
                  d="M 92 104 C 122 96, 130 68, 118 48"
                  fill="none"
                  stroke="url(#oyenBodyFur)"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 112 88 C 118 85, 121 79, 118 75 M 118 70 C 123 67, 125 61, 121 57"
                  fill="none"
                  stroke="#7C2D12"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.65"
                />
              </g>

              {/* Cat 3D Plump Body + Rim Highlight */}
              <ellipse cx="70" cy="100" rx="33" ry="25" fill="url(#oyenBodyFur)" />
              <path
                d="M 40 94 Q 48 92 52 96 M 38 103 Q 47 101 51 105 M 100 94 Q 92 92 88 96 M 102 103 Q 93 101 89 105"
                fill="none"
                stroke="#7C2D12"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />

              {/* Fluffy 3D Cream Chest Tuft */}
              <path
                d="M 50 92 C 50 78, 90 78, 90 92 C 90 110, 78 120, 70 122 C 62 120, 50 110, 50 92 Z"
                fill="url(#oyenCreamFur)"
              />

              {/* Oyen.AI Smart Collar & 3D Golden Bell */}
              <path
                d="M 45 88 Q 70 97 95 88"
                fill="none"
                stroke="url(#oyenCollar)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
              <circle cx="70" cy="94" r="6.5" fill="url(#oyenCrownGrad)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="68" cy="92" r="2" fill="#FFFFFF" opacity="0.85" />

              {/* Head Group (Moves & Tilts in 3D Perspective via GPU ref) */}
              <g
                ref={headGroupRef}
                style={{
                  transformOrigin: '70px 65px',
                  transition: 'transform 0.08s ease-out',
                }}
              >
                {/* Left Ear (Animated Twitch) */}
                <g className="animate-ear-left">
                  <path
                    d="M 30 52 C 20 34, 22 16, 29 14 C 37 12, 50 24, 56 34 Z"
                    fill="url(#oyenHeadFur)"
                  />
                  <path
                    d="M 33 47 C 26 34, 27 21, 31 20 C 36 19, 46 27, 50 35 Z"
                    fill="url(#oyenEarInner)"
                    opacity="0.85"
                  />
                  <path
                    d="M 31 45 L 38 40 M 33 48 L 41 43"
                    stroke="#FFFBEB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>

                {/* Right Ear (Animated Twitch) */}
                <g className="animate-ear-right">
                  <path
                    d="M 110 52 C 120 34, 118 16, 111 14 C 103 12, 90 24, 84 34 Z"
                    fill="url(#oyenHeadFur)"
                  />
                  <path
                    d="M 107 47 C 114 34, 113 21, 109 20 C 104 19, 94 27, 90 35 Z"
                    fill="url(#oyenEarInner)"
                    opacity="0.85"
                  />
                  <path
                    d="M 109 45 L 102 40 M 107 48 L 99 43"
                    stroke="#FFFBEB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>

                {/* Rounded 3D Cat Head with Volumetric Highlight */}
                <path
                  d="M 32 62 C 26 42, 44 26, 70 26 C 96 26, 114 42, 108 62 C 115 74, 104 90, 70 90 C 36 90, 25 74, 32 62 Z"
                  fill="url(#oyenHeadFur)"
                />
                {/* 3D Clay Specular Sheen on Top-Left Forehead */}
                <ellipse
                  cx="53"
                  cy="38"
                  rx="14"
                  ry="6"
                  transform="rotate(-18 53 38)"
                  fill="#FFFFFF"
                  opacity="0.22"
                />

                {/* Tabby "M" Forehead & Cheek Markings */}
                <path
                  d="M 55 40 L 61 31 L 70 39 L 79 31 L 85 40"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.75"
                />
                <path
                  d="M 70 27 L 70 36 M 33 64 Q 40 62 44 66 M 32 71 Q 39 70 43 73 M 107 64 Q 100 62 96 66 M 108 71 Q 101 70 97 73"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.65"
                />

                {/* Cream Chin & 3D Plump Muzzle Pads */}
                <ellipse cx="70" cy="78" rx="18" ry="10" fill="#FFFBEB" />
                <ellipse cx="60" cy="72" rx="12" ry="9.5" fill="url(#oyenCreamFur)" />
                <ellipse cx="80" cy="72" rx="12" ry="9.5" fill="url(#oyenCreamFur)" />

                {/* Blush */}
                <ellipse cx="43" cy="70" rx="6.5" ry="3.8" fill="#FB7185" opacity="0.55" />
                <ellipse cx="97" cy="70" rx="6.5" ry="3.8" fill="#FB7185" opacity="0.55" />

                {/* Eyes */}
                {isPurring || isBlinking ? (
                  <g stroke="#431407" strokeWidth="3.5" fill="none" strokeLinecap="round">
                    <path d="M 43 58 Q 52 49 61 58" />
                    <path d="M 79 58 Q 88 49 97 58" />
                  </g>
                ) : (
                  <g>
                    <ellipse cx="52" cy="57" rx="10.8" ry="10.2" fill="#27272A" />
                    <ellipse cx="88" cy="57" rx="10.8" ry="10.2" fill="#27272A" />

                    <ellipse cx="52" cy="57.5" rx="9.4" ry="9" fill="url(#oyenIris)" />
                    <ellipse cx="88" cy="57.5" rx="9.4" ry="9" fill="url(#oyenIris)" />

                    {/* Direct 60FPS GPU-translated Pupils */}
                    <g ref={leftPupilRef}>
                      <ellipse cx="52" cy="57.5" rx="4.8" ry="6.5" fill="#090D16" />
                    </g>
                    <g ref={rightPupilRef}>
                      <ellipse cx="88" cy="57.5" rx="4.8" ry="6.5" fill="#090D16" />
                    </g>

                    {/* Direct 60FPS 3D Specular Eye Highlights */}
                    <g ref={leftHighlightRef}>
                      <circle cx="49" cy="53.5" r="2.8" fill="#FFFFFF" />
                      <circle cx="55.5" cy="60.5" r="1.4" fill="#FFFFFF" opacity="0.9" />
                    </g>
                    <g ref={rightHighlightRef}>
                      <circle cx="85" cy="53.5" r="2.8" fill="#FFFFFF" />
                      <circle cx="91.5" cy="60.5" r="1.4" fill="#FFFFFF" opacity="0.9" />
                    </g>
                  </g>
                )}

                {/* 3D Pink Nose & Smile */}
                <path
                  d="M 65 66 C 65 64, 75 64, 75 66 L 70 71.5 Z"
                  fill="#F43F5E"
                  stroke="#9F1239"
                  strokeWidth="1"
                />
                <ellipse cx="68.5" cy="66.2" rx="2.2" ry="1" fill="#FFFFFF" opacity="0.85" />
                <path
                  d="M 70 71.5 L 70 75 M 61 75.5 Q 65.5 79.5 70 75 Q 74.5 79.5 79 75.5"
                  fill="none"
                  stroke="#431407"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Whiskers */}
                <g stroke="#FFFBEB" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
                  <line x1="14" y1="66" x2="42" y2="70" />
                  <line x1="12" y1="73" x2="41" y2="74" />
                  <line x1="16" y1="80" x2="43" y2="78" />
                  <line x1="126" y1="66" x2="98" y2="70" />
                  <line x1="128" y1="73" x2="99" y2="74" />
                  <line x1="124" y1="80" x2="97" y2="78" />
                </g>

                {/* === 3D INTERACTIVE ACCESSORIES === */}
                {currentAccessory === 'crown' && (
                  <g>
                    <path
                      d="M 52 28 L 55 12 L 64 21 L 70 9 L 76 21 L 85 12 L 88 28 Z"
                      fill="url(#oyenCrownGrad)"
                      stroke="#B45309"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="70" cy="21" r="2.3" fill="#EF4444" />
                    <circle cx="60" cy="23" r="1.8" fill="#06B6D4" />
                    <circle cx="80" cy="23" r="1.8" fill="#06B6D4" />
                  </g>
                )}

                {currentAccessory === 'shades' && (
                  <g>
                    {/* Cool 3D Boss Sunglasses */}
                    <line x1="30" y1="53" x2="110" y2="53" stroke="#0F172A" strokeWidth="3.5" />
                    <rect
                      x="36"
                      y="48"
                      width="29"
                      height="16"
                      rx="4"
                      fill="#0F172A"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                    />
                    <rect
                      x="75"
                      y="48"
                      width="29"
                      height="16"
                      rx="4"
                      fill="#0F172A"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                    />
                    {/* 3D Lens Glare */}
                    <line x1="41" y1="61" x2="50" y2="51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    <line x1="80" y1="61" x2="89" y2="51" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  </g>
                )}

                {currentAccessory === 'headset' && (
                  <g>
                    {/* 3D Studio Mentor Headphones & Boom Mic */}
                    <path
                      d="M 28 58 C 26 24, 114 24, 112 58"
                      fill="none"
                      stroke="url(#oyenCollar)"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                    <rect x="21" y="48" width="10" height="20" rx="5" fill="#4F46E5" stroke="#22D3EE" strokeWidth="1.8" />
                    <rect x="109" y="48" width="10" height="20" rx="5" fill="#4F46E5" stroke="#22D3EE" strokeWidth="1.8" />
                    <path
                      d="M 26 65 Q 35 82 54 79"
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="55" cy="79" r="3" fill="#22D3EE" />
                  </g>
                )}
              </g>

              {/* Front 3D Paws */}
              <g ref={leftPawRef}>
                <ellipse
                  cx="52"
                  cy="121"
                  rx="11.5"
                  ry="8"
                  fill="url(#oyenCreamFur)"
                  stroke="#D97706"
                  strokeWidth="1.5"
                />
                <circle cx="48" cy="121" r="1.9" fill="#FDA4AF" />
                <circle cx="52" cy="119.5" r="1.9" fill="#FDA4AF" />
                <circle cx="56" cy="121" r="1.9" fill="#FDA4AF" />
              </g>

              <g ref={rightPawRef}>
                <ellipse
                  cx="88"
                  cy="121"
                  rx="11.5"
                  ry="8"
                  fill="url(#oyenCreamFur)"
                  stroke="#D97706"
                  strokeWidth="1.5"
                />
                <circle cx="84" cy="121" r="1.9" fill="#FDA4AF" />
                <circle cx="88" cy="119.5" r="1.9" fill="#FDA4AF" />
                <circle cx="92" cy="121" r="1.9" fill="#FDA4AF" />
              </g>
            </svg>
          </div>
        </div>
      </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
