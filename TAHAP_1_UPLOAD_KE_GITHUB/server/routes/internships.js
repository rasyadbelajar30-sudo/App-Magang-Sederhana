const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { optionalAuth, requireAuth, ensureProfile } = require('../middleware/auth');
const { computeMatch } = require('../logic/matching');
const { generateCoverLetter } = require('../logic/generators');
const { INTERNSHIPS, LIVE_FEED_INTERNSHIPS } = require('../seedData');

const SYNONYM_MAP = {
  fe: ['frontend', 'react', 'javascript', 'html', 'css', 'web'],
  front: ['frontend', 'react', 'ui', 'html', 'css'],
  web: ['frontend', 'fullstack', 'backend', 'react', 'javascript', 'html'],
  koding: ['frontend', 'backend', 'fullstack', 'programmer', 'javascript', 'python', 'react'],
  coding: ['frontend', 'backend', 'fullstack', 'javascript', 'python', 'react'],
  programmer: ['frontend', 'backend', 'fullstack', 'engineer', 'developer', 'javascript'],
  programer: ['frontend', 'backend', 'fullstack', 'engineer', 'developer', 'javascript'],
  developer: ['frontend', 'backend', 'fullstack', 'engineer', 'mobile', 'android'],
  it: ['teknologi', 'frontend', 'backend', 'fullstack', 'jaringan', 'data', 'cyber', 'qa'],
  be: ['backend', 'node.js', 'api', 'sql', 'python'],
  desain: ['ui/ux', 'designer', 'grafis', 'figma', 'canva', 'kreatif', 'visual'],
  design: ['ui/ux', 'designer', 'grafis', 'figma', 'canva', 'prototyping'],
  ui: ['ui/ux', 'designer', 'figma', 'frontend'],
  ux: ['ui/ux', 'designer', 'user research', 'figma'],
  uiux: ['ui/ux', 'designer', 'figma', 'prototyping'],
  bank: ['perbankan', 'bank central asia', 'finance', 'accounting', 'keuangan'],
  bca: ['bank central asia', 'perbankan', 'finance', 'accounting'],
  uang: ['finance', 'accounting', 'perbankan', 'akuntansi', 'laporan keuangan'],
  akutansi: ['akuntansi', 'accounting', 'finance', 'excel', 'laporan keuangan'],
  akuntansi: ['akuntansi', 'accounting', 'finance', 'excel', 'perbankan'],
  keuangan: ['finance', 'accounting', 'akuntansi', 'perbankan', 'laporan keuangan'],
  bengkel: ['mesin', 'otomotif', 'teknisi', 'astra honda', 'k3'],
  motor: ['otomotif', 'mesin', 'astra honda', 'teknisi'],
  mobil: ['otomotif', 'mesin', 'teknisi'],
  otomotip: ['otomotif', 'mesin', 'teknisi', 'astra'],
  tkj: ['jaringan', 'mikrotik', 'lan', 'telkom', 'server', 'smk'],
  jaringan: ['teknisi jaringan', 'mikrotik', 'telkom', 'pln', 'lan'],
  listrik: ['kelistrikan', 'pln', 'gardu', 'teknik listrik', 'k3'],
  hotel: ['perhotelan', 'hospitality', 'front office', 'pelayanan'],
  pesawat: ['penerbangan', 'garuda', 'ground staff', 'customer service'],
  bandara: ['penerbangan', 'garuda', 'ground staff'],
  sosmed: ['social media', 'marketing', 'content', 'copywriting', 'komunikasi'],
  konten: ['content', 'social media', 'copywriting', 'video', 'marketing'],
  marketing: ['digital marketing', 'social media', 'business', 'copywriting', 'campaign'],
  bisnis: ['business development', 'analisis bisnis', 'marketing', 'negosiasi'],
  data: ['data analyst', 'sql', 'python', 'data visualization', 'excel'],
  hr: ['human resources', 'rekrutmen', 'administrasi', 'psikologi'],
  hrd: ['human resources', 'rekrutmen', 'administrasi'],
  tokped: ['tokopedia', 'e-commerce'],
  jkt: ['jakarta'],
  bdg: ['bandung'],
  jogja: ['yogyakarta'],
  yogya: ['yogyakarta'],
  sby: ['surabaya'],
  tgr: ['tangerang'],
  bks: ['bekasi'],
  smg: ['semarang'],
  remote: ['wfh'],
  rumah: ['wfh'],
  online: ['wfh'],
  kantor: ['wfo'],
  onsite: ['wfo'],
};

function getBigrams(str) {
  const s = String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const grams = [];
  for (let i = 0; i < s.length - 1; i++) {
    grams.push(s.slice(i, i + 2));
  }
  return grams;
}

function diceSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const bgA = getBigrams(a);
  const bgB = getBigrams(b);
  if (bgA.length === 0 || bgB.length === 0) return 0;
  const counts = new Map();
  for (const g of bgA) counts.set(g, (counts.get(g) || 0) + 1);
  let intersection = 0;
  for (const g of bgB) {
    const c = counts.get(g) || 0;
    if (c > 0) {
      intersection++;
      counts.set(g, c - 1);
    }
  }
  return (2 * intersection) / (bgA.length + bgB.length);
}

function computeQueryRelevance(item, rawQuery) {
  const q = String(rawQuery || '').trim().toLowerCase();
  if (!q) return 100;

  const title = (item.role_title || '').toLowerCase();
  const company = (item.company_name || '').toLowerCase();
  const industry = (item.company_industry || '').toLowerCase();
  const city = (item.city || '').toLowerCase();
  const workType = (item.work_type || '').toLowerCase();
  const edu = (item.education_target || '').toLowerCase();
  const skills = (item.required_skills || []).map((s) => s.toLowerCase());
  const desc = (item.description || '').toLowerCase();

  const fullHaystack = `${title} ${company} ${industry} ${city} ${workType} ${edu} ${skills.join(' ')} ${desc}`;

  let score = 0;

  // 1. Exact full query match
  if (title.includes(q)) score += 120;
  if (company.includes(q)) score += 110;
  if (skills.some((s) => s.includes(q))) score += 100;
  if (industry.includes(q) || city.includes(q) || workType.includes(q)) score += 85;
  if (desc.includes(q)) score += 45;

  // 2. Token-by-token + Synonym expansion + Fuzzy Bigram Proximity (strip conversational stopwords)
  const STOPWORDS = new Set([
    'saya', 'aku', 'kami', 'dengan', 'pengalaman', 'dan', 'atau', 'mencari', 'cari',
    'lowongan', 'magang', 'pkl', 'prakerin', 'di', 'ke', 'dari', 'yang', 'ada',
    'untuk', 'buat', 'jurusan', 'skill', 'keahlian', 'siswa', 'mahasiswa', 'fresh',
    'graduate', 'ingin', 'mau', 'tempat', 'posisi', 'perusahaan', 'punya', 'memiliki',
    'mahir', 'menguasai', 'bisa', 'bidang', 'bagian', 'sebagai', 'intern', 'internship'
  ]);
  const rawTokens = q.replace(/[,.;:!?()"'&]/g, ' ').split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((t) => !STOPWORDS.has(t) && t.length >= 2);
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  for (const tok of tokens) {
    if (fullHaystack.includes(tok)) {
      score += 45;
    }

    // Synonym expansion
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      if (tok === key || (tok.length >= 3 && key.startsWith(tok)) || (key.length >= 3 && tok.startsWith(key))) {
        for (const syn of syns) {
          if (title.includes(syn) || company.includes(syn) || skills.some((s) => s.includes(syn))) {
            score += 55;
          } else if (fullHaystack.includes(syn)) {
            score += 30;
          }
        }
      }
    }

    // Fuzzy similarity against role words, company words, city, and skills
    if (tok.length >= 3) {
      const candidateWords = [
        ...title.split(/[\s/&()-]+/),
        ...company.split(/[\s/&()-]+/),
        ...industry.split(/[\s/&()-]+/),
        city,
        ...skills,
      ].filter(Boolean);

      let bestSim = 0;
      for (const w of candidateWords) {
        const sim = diceSimilarity(tok, w);
        if (sim > bestSim) bestSim = sim;
      }
      if (bestSim >= 0.55) {
        score += Math.round(bestSim * 65);
      }
    }
  }

  return score;
}

// GET /api/internships
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, education, work_type, paid, city, min_stipend, sort } = req.query;

    const { data: internships, error } = await supabaseAdmin
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/internships error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    let userProfile = null;
    let activeAppsMap = new Map();

    if (req.userId) {
      const [{ data: uData }, { data: appData }] = await Promise.all([
        supabaseAdmin.from('users').select('*').eq('id', req.userId).maybeSingle(),
        supabaseAdmin
          .from('applications')
          .select('internship_id, status')
          .eq('user_id', req.userId)
          .neq('status', 'REJECTED'),
      ]);
      userProfile = uData || null;
      if (appData) {
        appData.forEach((a) => activeAppsMap.set(a.internship_id, a.status));
      }
    }

    let list = (internships || []).map((item) => {
      const match = userProfile
        ? computeMatch(userProfile, item)
        : {
            score: 0,
            tier: 'low',
            matched_skills: [],
            missing_skills: item.required_skills || [],
            potential_score: 100,
          };

      return {
        ...item,
        match,
        applied_status: activeAppsMap.get(item.id) || null,
      };
    });

    // Filtering with Smart Reference & Fuzzy Proximity Engine
    const hasSearchQuery = Boolean(q && String(q).trim());
    if (hasSearchQuery) {
      const scored = list.map((item) => ({
        ...item,
        search_relevance: computeQueryRelevance(item, q),
      }));

      const directMatches = scored.filter((item) => item.search_relevance >= 35);
      if (directMatches.length > 0) {
        list = directMatches.sort((a, b) => b.search_relevance - a.search_relevance);
      } else {
        // Jika kata kunci typo berat / belum ada yang persis, tampilkan 6 lowongan yang paling mendekati referensinya
        list = scored
          .sort((a, b) => b.search_relevance - a.search_relevance || (b.match?.score || 0) - (a.match?.score || 0))
          .slice(0, 6)
          .map((item) => ({ ...item, is_closest_reference: true }));
      }
    }

    if (education && ['SMK', 'Mahasiswa'].includes(education)) {
      list = list.filter(
        (item) => item.education_target === education || item.education_target === 'Semua'
      );
    }

    if (work_type && String(work_type).trim()) {
      const types = String(work_type)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (types.length > 0) {
        list = list.filter((item) => types.includes(item.work_type));
      }
    }

    if (city && String(city).trim() && city !== 'Semua') {
      const cityKw = String(city).trim().toLowerCase();
      list = list.filter((item) => (item.city || '').toLowerCase() === cityKw);
    }

    if (min_stipend && Number(min_stipend) > 0) {
      const minVal = Number(min_stipend);
      list = list.filter((item) => (item.stipend_amount || 0) >= minVal);
    }

    if (paid === 'true') {
      list = list.filter((item) => item.is_paid === true);
    } else if (paid === 'false') {
      list = list.filter((item) => item.is_paid === false);
    }

    // Sorting
    const sortBy = sort || 'match';
    if (sortBy === 'stipend') {
      list.sort((a, b) => (b.stipend_amount || 0) - (a.stipend_amount || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (tB !== tA) return tB - tA;
        return b.id.localeCompare(a.id);
      });
    } else if (hasSearchQuery) {
      // Saat user mengetik pencarian, prioritaskan tingkat kemiripan referensi lalu skor match
      list.sort(
        (a, b) =>
          (b.search_relevance || 0) - (a.search_relevance || 0) ||
          (b.match?.score || 0) - (a.match?.score || 0)
      );
    } else {
      // default sort by match score desc
      list.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
    }

    return res.json(list);
  } catch (err) {
    console.error('[GET /api/internships unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/internships/refresh-feed
router.post('/refresh-feed', optionalAuth, async (_req, res) => {
  try {
    const { data: existingRows } = await supabaseAdmin
      .from('internships')
      .select('id');

    const existingIds = new Set((existingRows || []).map((r) => r.id));

    // 1. Pastikan 22 lowongan utama sudah masuk semua
    const missingBase = INTERNSHIPS.filter((item) => !existingIds.has(item.id));
    if (missingBase.length > 0) {
      await supabaseAdmin.from('internships').upsert(missingBase, { onConflict: 'id' });
      missingBase.forEach((m) => existingIds.add(m.id));
    }

    // 2. Ambil 2 lowongan baru dari LIVE_FEED_INTERNSHIPS yang belum ada di DB
    const unseenLive = LIVE_FEED_INTERNSHIPS.filter((item) => !existingIds.has(item.id));
    let newlyAdded = [];

    if (unseenLive.length > 0) {
      const batch = unseenLive.slice(0, 2).map((item) => ({
        ...item,
        created_at: new Date().toISOString(),
      }));
      const { error: upsertErr } = await supabaseAdmin
        .from('internships')
        .upsert(batch, { onConflict: 'id' });

      if (!upsertErr) {
        newlyAdded = batch;
      }
    } else {
      // Jika seluruh LIVE_FEED_INTERNSHIPS sudah masuk, buat gelombang pembukaan kuota baru (Batch Baru)
      const randomTemplate =
        LIVE_FEED_INTERNSHIPS[Math.floor(Math.random() * LIVE_FEED_INTERNSHIPS.length)];
      const waveId = `in_live_${Date.now().toString().slice(-5)}`;
      const freshOpening = {
        ...randomTemplate,
        id: waveId,
        role_title: `${randomTemplate.role_title} (Batch Baru)`,
        quota: Math.floor(Math.random() * 5) + 4,
        created_at: new Date().toISOString(),
      };
      const { error: waveErr } = await supabaseAdmin
        .from('internships')
        .upsert([freshOpening], { onConflict: 'id' });
      if (!waveErr) {
        newlyAdded = [freshOpening];
      }
    }

    const { count } = await supabaseAdmin
      .from('internships')
      .select('*', { count: 'exact', head: true });

    return res.json({
      ok: true,
      added_count: missingBase.length + newlyAdded.length,
      total_count: count || existingIds.size + newlyAdded.length,
      newly_added: newlyAdded.map((j) => `${j.role_title} — ${j.company_name}`),
    });
  } catch (err) {
    console.error('[POST /api/internships/refresh-feed error]', err);
    return res.status(500).json({
      error: 'FEED_ERROR',
      message: 'Gagal menarik lowongan terbaru, silakan coba lagi.',
    });
  }
});

// GET /api/internships/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/internships/:id error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    if (!internship) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Lowongan magang tidak ditemukan.',
      });
    }

    let match = {
      score: 0,
      tier: 'low',
      matched_skills: [],
      missing_skills: internship.required_skills || [],
      potential_score: 100,
    };
    let applied_status = null;
    let docs_check = {
      complete: false,
      missing: internship.required_docs || [],
    };

    if (req.userId) {
      const [{ data: uData }, { data: appData }, { data: docsData }] = await Promise.all([
        supabaseAdmin.from('users').select('*').eq('id', req.userId).maybeSingle(),
        supabaseAdmin
          .from('applications')
          .select('status')
          .eq('user_id', req.userId)
          .eq('internship_id', id)
          .neq('status', 'REJECTED')
          .maybeSingle(),
        supabaseAdmin
          .from('user_documents')
          .select('doc_type, is_verified')
          .eq('user_id', req.userId),
      ]);

      if (uData) {
        match = computeMatch(uData, internship);
      }
      if (appData) {
        applied_status = appData.status;
      }

      const verifiedSet = new Set(
        (docsData || []).filter((d) => d.is_verified).map((d) => d.doc_type)
      );
      const missingDocs = (internship.required_docs || []).filter((reqDoc) => !verifiedSet.has(reqDoc));
      docs_check = {
        complete: missingDocs.length === 0,
        missing: missingDocs,
      };
    }

    return res.json({
      ...internship,
      match,
      applied_status,
      docs_check,
    });
  } catch (err) {
    console.error('[GET /api/internships/:id unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/internships/:id/cover-letter
router.post('/:id/cover-letter', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !internship) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Lowongan magang tidak ditemukan.',
      });
    }

    const cover_letter = generateCoverLetter(req.userProfile, internship);
    return res.json({ cover_letter });
  } catch (err) {
    console.error('[POST /api/internships/:id/cover-letter unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
