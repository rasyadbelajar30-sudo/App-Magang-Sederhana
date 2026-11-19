// Multi-Profile Web Audio API Synthesizer Sound Engine for MagangHub
// Every button, search bar, card, filter, keyboard input, and Si Oyen interaction has a unique, realistic, context-relevant sound.

const STORAGE_KEY = 'maganghub_sfx_enabled';

let audioCtx = null;
let sfxEnabled = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved !== 'false';
  } catch (_e) {
    return true;
  }
})();

let lastGlobalSoundAt = 0;
let lastKeyTypeAt = 0;

function getCtx() {
  if (!sfxEnabled || typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function createNoiseBuffer(ctx, durationSec = 0.25) {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playTone(
  ctx,
  {
    type = 'sine',
    freqStart = 440,
    freqEnd = null,
    freqMid = null,
    startTime = 0,
    duration = 0.08,
    gainPeak = 0.12,
  }
) {
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const now = ctx.currentTime + startTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, now);

  if (freqMid !== null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, freqMid),
      now + duration * 0.45
    );
  }
  if (freqEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, freqEnd),
      now + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + Math.min(0.012, duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.01);
}

function playFilteredNoise(
  ctx,
  {
    filterType = 'bandpass',
    freqStart = 600,
    freqEnd = 1600,
    q = 2.5,
    startTime = 0,
    duration = 0.12,
    gainPeak = 0.09,
  }
) {
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  const now = ctx.currentTime + startTime;
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, duration + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.Q.setValueAtTime(q, now);
  filter.frequency.setValueAtTime(freqStart, now);
  if (freqEnd !== freqStart) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration + 0.02);
}

export const sfx = {
  isEnabled() {
    return sfxEnabled;
  },

  setEnabled(val) {
    sfxEnabled = Boolean(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(sfxEnabled));
    } catch (_e) {
      // ignore
    }
    if (sfxEnabled) {
      this.toggleSwitch(true);
    }
    return sfxEnabled;
  },

  // 1. Primary CTA Button: Crisp mechanical switch pop + harmonic chord
  clickPrimary() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 510,
      freqEnd: 790,
      duration: 0.075,
      gainPeak: 0.13,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 1020,
      freqEnd: 1320,
      startTime: 0.015,
      duration: 0.065,
      gainPeak: 0.06,
    });
  },

  // 2. Secondary / Standard Button: Soft matte keycap tap
  clickSecondary() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 360,
      freqEnd: 470,
      duration: 0.055,
      gainPeak: 0.1,
    });
    playFilteredNoise(ctx, {
      freqStart: 1100,
      freqEnd: 700,
      q: 4,
      duration: 0.035,
      gainPeak: 0.04,
    });
  },

  // 3. Emerald / Confirm Action Button: Bright positive double-tap
  clickEmerald() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 587.33,
      freqEnd: 659.25,
      duration: 0.07,
      gainPeak: 0.12,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 880,
      freqEnd: 1174.66,
      startTime: 0.045,
      duration: 0.09,
      gainPeak: 0.11,
    });
  },

  // 4. Danger / Delete / Cancel / Reset Button: Low warning double-thud
  clickDanger() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sawtooth',
      freqStart: 250,
      freqEnd: 155,
      duration: 0.08,
      gainPeak: 0.09,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 180,
      freqEnd: 115,
      startTime: 0.055,
      duration: 0.09,
      gainPeak: 0.11,
    });
  },

  // 5. Ghost / Subtle Button: Delicate micro-click
  clickGhost() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 620,
      freqEnd: 740,
      duration: 0.04,
      gainPeak: 0.07,
    });
  },

  // 6. Navigation / Sidebar / Tab Switch: Airy whoosh + crystal tick
  navSwitch() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 420,
      freqEnd: 1450,
      q: 2.2,
      duration: 0.095,
      gainPeak: 0.065,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 680,
      freqEnd: 960,
      startTime: 0.02,
      duration: 0.08,
      gainPeak: 0.09,
    });
  },

  // 7. Toggle Switch (Theme Dark/Light, Mode SMK/Mahasiswa, Oyen Follow ON/OFF)
  toggleSwitch(isOn = true) {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    if (isOn) {
      playTone(ctx, {
        type: 'triangle',
        freqStart: 440,
        freqEnd: 680,
        duration: 0.06,
        gainPeak: 0.1,
      });
      playTone(ctx, {
        type: 'sine',
        freqStart: 680,
        freqEnd: 920,
        startTime: 0.045,
        duration: 0.07,
        gainPeak: 0.1,
      });
    } else {
      playTone(ctx, {
        type: 'triangle',
        freqStart: 660,
        freqEnd: 420,
        duration: 0.06,
        gainPeak: 0.1,
      });
      playTone(ctx, {
        type: 'sine',
        freqStart: 420,
        freqEnd: 310,
        startTime: 0.045,
        duration: 0.07,
        gainPeak: 0.09,
      });
    }
  },

  // 8. Checkbox / Onboarding Task Check
  checkboxTick(checked = true) {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    if (checked) {
      playTone(ctx, {
        type: 'sine',
        freqStart: 540,
        freqEnd: 1080,
        duration: 0.08,
        gainPeak: 0.11,
      });
    } else {
      playTone(ctx, {
        type: 'sine',
        freqStart: 520,
        freqEnd: 340,
        duration: 0.065,
        gainPeak: 0.08,
      });
    }
  },

  // 9. Modal Open: Smooth pneumatic air pop
  modalOpen() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 300,
      freqEnd: 1100,
      q: 3,
      duration: 0.11,
      gainPeak: 0.06,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 320,
      freqEnd: 640,
      duration: 0.12,
      gainPeak: 0.1,
    });
  },

  // 10. Modal Close: Gentle air release
  modalClose() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 520,
      freqEnd: 260,
      duration: 0.1,
      gainPeak: 0.09,
    });
  },

  // 11. 3D Card Flip (Flashcard Interview & Digital Intern ID Card)
  cardFlip() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 380,
      freqEnd: 2200,
      q: 1.8,
      duration: 0.14,
      gainPeak: 0.11,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 420,
      freqEnd: 780,
      startTime: 0.04,
      duration: 0.075,
      gainPeak: 0.09,
    });
  },

  // 12. Magic Generate (CV ATS, Surat Pengantar, Auto Cover Letter ✨)
  magicGenerate() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    const notes = [523.25, 659.25, 783.99, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      playTone(ctx, {
        type: 'sine',
        freqStart: freq,
        freqEnd: freq * 1.03,
        startTime: idx * 0.05,
        duration: 0.16,
        gainPeak: 0.095,
      });
    });
  },

  // 13. Paper Airplane Whoosh (Submit Application ✈️)
  paperWhoosh() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 260,
      freqEnd: 2400,
      q: 1.6,
      duration: 0.32,
      gainPeak: 0.13,
    });
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((f, idx) => {
      playTone(ctx, {
        type: 'triangle',
        freqStart: f,
        freqEnd: f * 1.02,
        startTime: 0.12 + idx * 0.055,
        duration: 0.22,
        gainPeak: 0.1,
      });
    });
  },

  // 14. HR Document Scanner Laser Sweep (ScanningModal)
  radarScan() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 740,
      freqMid: 1320,
      freqEnd: 880,
      duration: 0.32,
      gainPeak: 0.09,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 1100,
      freqEnd: 1480,
      startTime: 0.34,
      duration: 0.14,
      gainPeak: 0.08,
    });
  },

  // 15. Digital Signature Pen Scribble
  signatureScribble() {
    const ctx = getCtx();
    if (!ctx) return;
    playFilteredNoise(ctx, {
      freqStart: 1400,
      freqEnd: 2600,
      q: 5,
      duration: 0.045,
      gainPeak: 0.045,
    });
  },

  // 16. XP Gain / Coin Crystal Bell
  xpGain() {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, {
      type: 'sine',
      freqStart: 987.77,
      freqEnd: 987.77,
      duration: 0.09,
      gainPeak: 0.12,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 1318.51,
      freqEnd: 1318.51,
      startTime: 0.075,
      duration: 0.24,
      gainPeak: 0.13,
    });
  },

  // 17. Celebration Fanfare (Accepted Internship / Level Up 🎉)
  celebrationFanfare() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    const fanfare = [
      { f: 523.25, t: 0, d: 0.13 },
      { f: 659.25, t: 0.11, d: 0.13 },
      { f: 783.99, t: 0.22, d: 0.13 },
      { f: 1046.5, t: 0.34, d: 0.42 },
    ];
    fanfare.forEach((n) => {
      playTone(ctx, {
        type: 'triangle',
        freqStart: n.f,
        freqEnd: n.f * 1.01,
        startTime: n.t,
        duration: n.d,
        gainPeak: 0.14,
      });
    });
  },

  // 18. Error / Validation Alert Buzz
  errorBuzz() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sawtooth',
      freqStart: 195,
      freqEnd: 160,
      duration: 0.11,
      gainPeak: 0.1,
    });
    playTone(ctx, {
      type: 'sawtooth',
      freqStart: 165,
      freqEnd: 130,
      startTime: 0.12,
      duration: 0.14,
      gainPeak: 0.1,
    });
  },

  // 19. Si Oyen Cute Kitten "Me-oww~"
  catMeow() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 560,
      freqMid: 960,
      freqEnd: 610,
      duration: 0.34,
      gainPeak: 0.13,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 1120,
      freqMid: 1920,
      freqEnd: 1220,
      duration: 0.32,
      gainPeak: 0.055,
    });
  },

  // 20. Si Oyen Happy Purr + Chirp ("Purrrr~ Meow!")
  catPurr() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    for (let i = 0; i < 6; i++) {
      playTone(ctx, {
        type: 'triangle',
        freqStart: 135,
        freqEnd: 165,
        startTime: i * 0.065,
        duration: 0.055,
        gainPeak: 0.08,
      });
    }
    playTone(ctx, {
      type: 'sine',
      freqStart: 660,
      freqMid: 1080,
      freqEnd: 820,
      startTime: 0.18,
      duration: 0.24,
      gainPeak: 0.11,
    });
  },

  // 21. Chat Message Outgoing Bubble Pop
  chatSend() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 440,
      freqEnd: 820,
      duration: 0.075,
      gainPeak: 0.11,
    });
  },

  // 22. Chat Message Incoming Droplet Chime
  chatReceive() {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, {
      type: 'sine',
      freqStart: 720,
      freqEnd: 920,
      duration: 0.08,
      gainPeak: 0.1,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 960,
      freqEnd: 1280,
      startTime: 0.07,
      duration: 0.12,
      gainPeak: 0.11,
    });
  },

  // 23. Live Feed Refresh Data Cascade
  liveFeedRefresh() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    const cascade = [440, 554.37, 659.25, 880];
    cascade.forEach((f, idx) => {
      playTone(ctx, {
        type: 'sine',
        freqStart: f,
        freqEnd: f * 1.08,
        startTime: idx * 0.045,
        duration: 0.1,
        gainPeak: 0.09,
      });
    });
  },

  // 24. Si Oyen Eating Fish Treat ("Nyam-nyam~ Meow!")
  catEat() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    [0, 0.11, 0.22].forEach((t, i) => {
      playFilteredNoise(ctx, {
        freqStart: 500 + i * 180,
        freqEnd: 1400,
        q: 3.5,
        startTime: t,
        duration: 0.06,
        gainPeak: 0.1,
      });
      playTone(ctx, {
        type: 'triangle',
        freqStart: 320 + i * 90,
        freqEnd: 520 + i * 110,
        startTime: t,
        duration: 0.07,
        gainPeak: 0.11,
      });
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 640,
      freqMid: 1040,
      freqEnd: 880,
      startTime: 0.34,
      duration: 0.22,
      gainPeak: 0.12,
    });
  },

  // 25. Equip 3D Accessory on Si Oyen (Cool Shades / Headset / Crown)
  equipAccessory() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 520,
      freqEnd: 1040,
      duration: 0.09,
      gainPeak: 0.12,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 1040,
      freqEnd: 1560,
      startTime: 0.06,
      duration: 0.12,
      gainPeak: 0.1,
    });
  },

  // 26. Search Bar / Input Focus: Crisp Glass Sonar Ping
  searchFocus() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 780,
      freqEnd: 1180,
      duration: 0.065,
      gainPeak: 0.085,
    });
  },

  // 27. Typing Keystroke in Search Bar / Input: Soft Tactile Mechanical Switch Tick
  keyType() {
    const ctx = getCtx();
    if (!ctx) return;
    const now = Date.now();
    if (now - lastKeyTypeAt < 42) return;
    lastKeyTypeAt = now;
    const jitter = (Math.random() - 0.5) * 60;
    playTone(ctx, {
      type: 'triangle',
      freqStart: 420 + jitter,
      freqEnd: 290 + jitter,
      duration: 0.028,
      gainPeak: 0.055,
    });
    playFilteredNoise(ctx, {
      freqStart: 1600,
      freqEnd: 950,
      q: 5,
      duration: 0.02,
      gainPeak: 0.03,
    });
  },

  // 28. Select Search Reference / Autocomplete Suggestion: Musical Ascending Chime
  suggestionSelect() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 659.25, // E5
      freqEnd: 783.99, // G5
      duration: 0.065,
      gainPeak: 0.1,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 987.77, // B5
      freqEnd: 1318.51, // E6
      startTime: 0.04,
      duration: 0.095,
      gainPeak: 0.1,
    });
  },

  // 29. Job Card Click / Preview Selection: Tactile 3D Card Pop + Air Glide
  cardSelect() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 480,
      freqEnd: 1320,
      q: 2.8,
      duration: 0.075,
      gainPeak: 0.055,
    });
    playTone(ctx, {
      type: 'triangle',
      freqStart: 460,
      freqEnd: 720,
      duration: 0.08,
      gainPeak: 0.11,
    });
  },

  // 30. Bookmark / Simpan Lowongan Toggle: Ribbon Snap Chime
  bookmarkToggle(saved = true) {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    if (saved) {
      playTone(ctx, {
        type: 'sine',
        freqStart: 659.25,
        freqEnd: 880,
        duration: 0.065,
        gainPeak: 0.11,
      });
      playTone(ctx, {
        type: 'triangle',
        freqStart: 880,
        freqEnd: 1318.51,
        startTime: 0.045,
        duration: 0.11,
        gainPeak: 0.12,
      });
    } else {
      playTone(ctx, {
        type: 'sine',
        freqStart: 780,
        freqEnd: 480,
        duration: 0.08,
        gainPeak: 0.09,
      });
    }
  },

  // 31. Filter Chip / Category Pill Click: Crisp Tactile Chip Tap
  filterPill() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 520,
      freqEnd: 760,
      duration: 0.055,
      gainPeak: 0.1,
    });
  },

  // 32. Sort Dropdown / Select Option Change: Smooth Rotary Click
  sortChange() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'sine',
      freqStart: 480,
      freqMid: 640,
      freqEnd: 580,
      duration: 0.07,
      gainPeak: 0.095,
    });
  },

  // 33. View Mode Switch (JobStreet Split View <-> 3D Grid View)
  viewModeSwitch() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, {
      type: 'triangle',
      freqStart: 440,
      freqEnd: 587.33,
      duration: 0.06,
      gainPeak: 0.095,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 587.33,
      freqEnd: 880,
      startTime: 0.04,
      duration: 0.075,
      gainPeak: 0.1,
    });
  },

  // 34. Copy to Clipboard / Snip: Crisp Camera Shutter Click
  copyText() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playFilteredNoise(ctx, {
      freqStart: 1200,
      freqEnd: 2800,
      q: 3.5,
      duration: 0.045,
      gainPeak: 0.08,
    });
    playTone(ctx, {
      type: 'sine',
      freqStart: 880,
      freqEnd: 1180,
      startTime: 0.02,
      duration: 0.06,
      gainPeak: 0.09,
    });
  },

  // Helper: Explicit user gesture audio unlock
  unlockAudio() {
    try {
      const ctx = getCtx();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (_e) {}
  },

  // 35. Intro Splash: Epic Cinematic Fanfare + Dual Turbo Jetpack Ignition
  introSplash() {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const startedAt = Date.now();

      const fireIntro = () => {
        if (Date.now() - startedAt > 1400) return;
        lastGlobalSoundAt = Date.now();

        // 1. Heavy Sub-Bass Theater Impact (Cinema Sub-Boom)
        playTone(ctx, {
          type: 'sine',
          freqStart: 95,
          freqMid: 55,
          freqEnd: 30,
          startTime: 0,
          duration: 1.1,
          gainPeak: 0.36,
        });
        playTone(ctx, {
          type: 'triangle',
          freqStart: 180,
          freqEnd: 60,
          startTime: 0,
          duration: 0.75,
          gainPeak: 0.22,
        });

        // 2. Dual Turbo Jetpack Thruster Ignite & Roar
        playFilteredNoise(ctx, {
          filterType: 'bandpass',
          freqStart: 160,
          freqEnd: 2200,
          q: 1.8,
          startTime: 0,
          duration: 0.95,
          gainPeak: 0.22,
        });
        playFilteredNoise(ctx, {
          filterType: 'lowpass',
          freqStart: 320,
          freqEnd: 880,
          q: 2.2,
          startTime: 0.08,
          duration: 1.1,
          gainPeak: 0.2,
        });

        // 3. Heroic 6-Note Orchestral Brass/Synth Chord (D-Major Victory Swell)
        const chordNotes = [146.83, 220.0, 293.66, 369.99, 440.0, 587.33];
        chordNotes.forEach((freq, i) => {
          playTone(ctx, {
            type: 'sawtooth',
            freqStart: freq * 0.99,
            freqEnd: freq,
            startTime: 0.08 + i * 0.04,
            duration: 1.2 - i * 0.08,
            gainPeak: 0.065,
          });
          playTone(ctx, {
            type: 'sine',
            freqStart: freq,
            startTime: 0.08 + i * 0.04,
            duration: 1.4 - i * 0.08,
            gainPeak: 0.15,
          });
        });

        // 4. Starlight Crystal Cascade Arpeggio (8 Sparkling Notes)
        [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0, 2349.32, 2959.96].forEach((f, idx) => {
          playTone(ctx, {
            type: 'sine',
            freqStart: f,
            startTime: 0.15 + idx * 0.075,
            duration: 0.45,
            gainPeak: 0.16,
          });
          playTone(ctx, {
            type: 'triangle',
            freqStart: f * 1.5,
            startTime: 0.15 + idx * 0.075,
            duration: 0.22,
            gainPeak: 0.05,
          });
        });

        // 5. High Stardust Shimmer Burst
        playFilteredNoise(ctx, {
          filterType: 'highpass',
          freqStart: 5500,
          freqEnd: 11000,
          q: 1.2,
          startTime: 0.45,
          duration: 0.55,
          gainPeak: 0.1,
        });
      };

      fireIntro();

      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {});
        const autoUnlock = () => {
          ctx.resume().catch(() => {});
        };
        window.addEventListener('pointerdown', autoUnlock, { once: true, passive: true });
        window.addEventListener('pointermove', autoUnlock, { once: true, passive: true });
        window.addEventListener('touchstart', autoUnlock, { once: true, passive: true });
        window.addEventListener('keydown', autoUnlock, { once: true, passive: true });
      }
    } catch (_e) {
      // ignore
    }
  },

  // 35b. Intro Warp Progress Step: Sci-Fi Telemetry Charging Turbine
  introStep(step = 1) {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      lastGlobalSoundAt = Date.now();

      // Plasma Turbine Charge Sweep
      const startF = step === 1 ? 260 : step === 2 ? 440 : 660;
      const endF = step === 1 ? 680 : step === 2 ? 1100 : 1760;
      playTone(ctx, {
        type: 'sine',
        freqStart: startF,
        freqEnd: endF,
        duration: 0.28,
        gainPeak: 0.22,
      });
      playTone(ctx, {
        type: 'triangle',
        freqStart: startF * 1.5,
        freqEnd: endF * 1.5,
        startTime: 0.04,
        duration: 0.24,
        gainPeak: 0.12,
      });

      // Jetpack Thruster Burst Whoosh
      playFilteredNoise(ctx, {
        filterType: 'bandpass',
        freqStart: 300 + step * 250,
        freqEnd: 1800 + step * 600,
        q: 2.0,
        duration: 0.32,
        gainPeak: 0.16,
      });

      // High-Tech Digital Lock-On Chimes (Major triad)
      const triad =
        step === 1
          ? [523.25, 659.25, 783.99]
          : step === 2
          ? [659.25, 830.61, 987.77]
          : [783.99, 987.77, 1174.66, 1567.98];
      triad.forEach((freq, i) => {
        playTone(ctx, {
          type: 'sine',
          freqStart: freq,
          startTime: 0.1 + i * 0.045,
          duration: 0.35,
          gainPeak: 0.18,
        });
      });
    } catch (_e) {
      // ignore
    }
  },

  // 35c. Intro Launch Curtain Reveal: Massive Hyperdrive Warp Boom + Heroic Fanfare
  introLaunch() {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      lastGlobalSoundAt = Date.now();

      // 1. Massive Sub-Bass Sonic Boom
      playTone(ctx, {
        type: 'sine',
        freqStart: 130,
        freqMid: 60,
        freqEnd: 24,
        duration: 0.95,
        gainPeak: 0.42,
      });
      playTone(ctx, {
        type: 'triangle',
        freqStart: 260,
        freqEnd: 48,
        duration: 0.65,
        gainPeak: 0.25,
      });

      // 2. High-Speed Hyperspace Sonic Tear (Whooosh!)
      playFilteredNoise(ctx, {
        filterType: 'bandpass',
        freqStart: 350,
        freqEnd: 5200,
        q: 1.4,
        duration: 0.65,
        gainPeak: 0.28,
      });
      playFilteredNoise(ctx, {
        filterType: 'highpass',
        freqStart: 3200,
        freqEnd: 9500,
        q: 1.0,
        startTime: 0.1,
        duration: 0.55,
        gainPeak: 0.16,
      });

      // 3. Grand Triumphant Victory Chords (Heroic fanfare: C5, E5, G5, B5, C6, E6)
      const fanfareNotes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
      fanfareNotes.forEach((f, idx) => {
        playTone(ctx, {
          type: 'sine',
          freqStart: f,
          startTime: 0.05 + idx * 0.04,
          duration: 0.85,
          gainPeak: 0.2,
        });
        playTone(ctx, {
          type: 'triangle',
          freqStart: f * 1.5,
          startTime: 0.05 + idx * 0.04,
          duration: 0.45,
          gainPeak: 0.07,
        });
      });
    } catch (_e) {
      // ignore
    }
  },

  // 35d. Flyby 3D Orbiting Whoosh (When Si Oyen passes in front of the giant logo)
  introFlybyWhoosh() {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      lastGlobalSoundAt = Date.now();
      playFilteredNoise(ctx, {
        filterType: 'bandpass',
        freqStart: 220,
        freqEnd: 2800,
        q: 1.5,
        duration: 0.48,
        gainPeak: 0.2,
      });
      playTone(ctx, {
        type: 'sine',
        freqStart: 330,
        freqMid: 660,
        freqEnd: 440,
        duration: 0.38,
        gainPeak: 0.12,
      });
    } catch (_e) {}
  },

  // 35e. Si Oyen Heroic Meow + Cyber Sparkle
  introOyenGreeting() {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      lastGlobalSoundAt = Date.now();
      // Cute enthusiastic Meow (two-tone pitch glide)
      playTone(ctx, {
        type: 'triangle',
        freqStart: 580,
        freqMid: 1080,
        freqEnd: 640,
        duration: 0.38,
        gainPeak: 0.24,
      });
      playTone(ctx, {
        type: 'sine',
        freqStart: 1160,
        freqMid: 2160,
        freqEnd: 1280,
        startTime: 0.02,
        duration: 0.38,
        gainPeak: 0.12,
      });
      // Cyber sparkle chime undertone
      [1046.5, 1318.51, 1567.98].forEach((f, i) => {
        playTone(ctx, {
          type: 'sine',
          freqStart: f,
          startTime: 0.18 + i * 0.06,
          duration: 0.28,
          gainPeak: 0.14,
        });
      });
    } catch (_e) {}
  },

  // 36. Open Map: Sonar double ping + whoosh
  openMap() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, { type: 'sine', freqStart: 1046, duration: 0.12, gainPeak: 0.1 });
    playTone(ctx, { type: 'sine', freqStart: 1318, startTime: 0.07, duration: 0.16, gainPeak: 0.1 });
    playFilteredNoise(ctx, { freqStart: 400, freqEnd: 2200, q: 1.2, startTime: 0.05, duration: 0.12, gainPeak: 0.05 });
  },

  // 37. Hide Oyen: Soft descending glide + pop
  oyenHide() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, { type: 'sine', freqStart: 880, freqEnd: 330, duration: 0.22, gainPeak: 0.1 });
    playTone(ctx, { type: 'triangle', freqStart: 220, freqEnd: 140, startTime: 0.18, duration: 0.06, gainPeak: 0.08 });
  },

  // 38. Show Oyen: Two rising notes + short meow
  oyenShow() {
    const ctx = getCtx();
    if (!ctx) return;
    lastGlobalSoundAt = Date.now();
    playTone(ctx, { type: 'sine', freqStart: 523, duration: 0.09, gainPeak: 0.1 });
    playTone(ctx, { type: 'sine', freqStart: 784, startTime: 0.08, duration: 0.12, gainPeak: 0.1 });
    setTimeout(() => this.catMeow(), 160);
  },

  // Global Delegated Click Listener: Deferred 5ms so specific component onClick sounds fire first,
  // while 100% guaranteeing every single clickable element in the app produces a realistic sound!
  handleGlobalInteraction(e) {
    if (!sfxEnabled) return;
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    const interactive = target.closest(
      'button, a, select, input, textarea, label, summary, [role="button"], [role="tab"], [role="option"], .cursor-pointer'
    );
    if (!interactive || interactive.disabled) return;

    const clickTime = Date.now();
    setTimeout(() => {
      // If a component's own handler already triggered a specialized sound for this click, skip fallback
      if (lastGlobalSoundAt >= clickTime - 15) return;

      if (interactive.matches('input[type="checkbox"], input[type="radio"]')) {
        this.checkboxTick(Boolean(interactive.checked));
        return;
      }

      if (
        interactive.matches(
          'input[type="text"], input[type="search"], input[type="email"], input[type="password"], input[type="url"], input[type="tel"], input[type="number"], textarea'
        )
      ) {
        this.searchFocus();
        return;
      }

      if (interactive.matches('select')) {
        this.sortChange();
        return;
      }

      if (interactive.matches('a')) {
        this.navSwitch();
        return;
      }

      const text = (interactive.textContent || '').toLowerCase();
      if (
        text.includes('hapus') ||
        text.includes('batal') ||
        text.includes('reset') ||
        text.includes('keluar')
      ) {
        this.clickDanger();
      } else if (
        text.includes('oyen') ||
        text.includes('elus') ||
        text.includes('meow')
      ) {
        this.catMeow();
      } else if (
        text.includes('generate') ||
        text.includes('otomatis') ||
        text.includes('siapkan semua')
      ) {
        this.magicGenerate();
      } else if (text.includes('salin') || text.includes('copy')) {
        this.copyText();
      } else if (text.includes('simpan') || text.includes('bookmark')) {
        this.bookmarkToggle(true);
      } else if (text.includes('flip') || text.includes('membalik')) {
        this.cardFlip();
      } else if (
        text.includes('wfo') ||
        text.includes('wfh') ||
        text.includes('hybrid') ||
        text.includes('smk') ||
        text.includes('mahasiswa') ||
        text.includes('semua') ||
        text.includes('paid')
      ) {
        this.filterPill();
      } else if (interactive.classList.contains('cursor-pointer') && !interactive.matches('button')) {
        this.cardSelect();
      } else {
        this.clickSecondary();
      }
    }, 8);
  },

  handleGlobalKeyDown(e) {
    if (!sfxEnabled) return;
    const target = e.target;
    if (!target || typeof target.matches !== 'function') return;
    if (
      target.matches('input, textarea') &&
      e.key &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      this.keyType();
    }
  },
};
