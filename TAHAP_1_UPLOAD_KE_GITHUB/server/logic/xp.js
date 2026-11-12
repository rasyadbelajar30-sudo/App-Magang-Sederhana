const LEVELS = [
  { lvl: 1, name: 'Pendatang Baru', min: 0 },
  { lvl: 2, name: 'Penjelajah Karier', min: 150 },
  { lvl: 3, name: 'Pejuang Magang', min: 400 },
  { lvl: 4, name: 'Kandidat Unggulan', min: 800 },
  { lvl: 5, name: 'Siap Tempur Magang', min: 1300 },
];

const XP_TABLE = {
  PROFILE_COMPLETE: 50,
  SKILL_ADDED: 10,
  DOC_SAVED: 30,
  PRACTICE_INTERVIEW: 15,
  FIRST_APPLY: 50,
  APPLY: 20,
  STAGE_ADVANCE: 25,
  ACCEPTED: 200,
  LOGBOOK_DAILY: 15,
};

function levelFromXp(xpPoints = 0) {
  const total = Math.max(0, Number(xpPoints) || 0);
  let current = LEVELS[0];
  let next = null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (total >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }

  let progress_pct = 100;
  let next_min = current.min;

  if (next) {
    next_min = next.min;
    const span = next.min - current.min;
    const into = total - current.min;
    progress_pct = Math.min(100, Math.max(0, Math.round((into / span) * 100)));
  }

  return {
    lvl: current.lvl,
    name: current.name,
    min: current.min,
    next_min,
    next_name: next ? next.name : null,
    progress_pct,
  };
}

/**
 * Menghitung penambahan XP pada objek user di memori dan mengembalikan hasil award
 * beserta daftar event baru untuk disimpan ke Supabase.
 * @param {object} user - objek user saat ini
 * @param {Array<{key: string, amount: number}>} eventsToAward - daftar event XP
 */
function calculateXpAwards(user, eventsToAward = []) {
  const existingEvents = new Set(Array.isArray(user.xp_events) ? user.xp_events : []);
  const prevXp = Number(user.xp_points) || 0;
  const prevLevel = levelFromXp(prevXp);

  let gained = 0;
  for (const item of eventsToAward) {
    if (!item || !item.key || !item.amount) continue;
    if (!existingEvents.has(item.key)) {
      existingEvents.add(item.key);
      gained += Number(item.amount);
    }
  }

  const total = prevXp + gained;
  const newLevel = levelFromXp(total);
  const leveledUp = newLevel.lvl > prevLevel.lvl;

  return {
    xpResult: {
      gained,
      total,
      leveledUp,
      level: newLevel,
    },
    updatedXpPoints: total,
    updatedXpEvents: Array.from(existingEvents),
  };
}

module.exports = {
  LEVELS,
  XP_TABLE,
  levelFromXp,
  calculateXpAwards,
};
