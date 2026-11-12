// Smart Reference & Fuzzy Proximity Search Engine (JobStreet-style Live Autocomplete & Closest Reference Matcher)

const SAVED_JOBS_KEY = 'maganghub_saved_jobs';

export const STOPWORDS_ID = new Set([
  'saya',
  'aku',
  'kami',
  'dengan',
  'pengalaman',
  'dan',
  'atau',
  'mencari',
  'cari',
  'lowongan',
  'magang',
  'pkl',
  'prakerin',
  'di',
  'ke',
  'dari',
  'yang',
  'ada',
  'untuk',
  'buat',
  'jurusan',
  'skill',
  'keahlian',
  'siswa',
  'mahasiswa',
  'fresh',
  'graduate',
  'ingin',
  'mau',
  'tempat',
  'posisi',
  'perusahaan',
  'punya',
  'memiliki',
  'mahir',
  'menguasai',
  'bisa',
  'bidang',
  'bagian',
  'sebagai',
  'intern',
  'internship',
]);

export function buildJobStreetTypingPrompts(allJobs = []) {
  const basePrompts = [
    'Saya mahasiswa IT dengan pengalaman React & JavaScript dan mencari lowongan Frontend Engineer di Tokopedia',
    'Saya siswa SMK jurusan TKJ dengan keahlian MikroTik dan mencari tempat PKL Network Engineer di Telkom Indonesia',
    'Saya menguasai Figma & Prototyping dan mencari lowongan UI/UX Designer Intern WFH di Gojek',
    'Saya punya keahlian Microsoft Excel & Akuntansi dan mencari magang Accounting & Finance di Bank Central Asia',
    'Saya siswa SMK Teknik Otomotif dan mencari tempat PKL Teknisi Mesin & Injeksi di Astra Honda Motor',
    'Saya mahir Social Media & Copywriting dan mencari lowongan Digital Marketing Intern di Traveloka',
    'Saya menguasai SQL & Python dan mencari lowongan Data Analyst Intern WFH di Bukalapak',
    'Saya mahir Komunikasi & Negosiasi dan mencari lowongan Business Development Intern di Shopee Indonesia',
  ];

  if (!Array.isArray(allJobs) || allJobs.length === 0) {
    return basePrompts;
  }

  const dynamicPrompts = [];
  for (const job of allJobs.slice(0, 12)) {
    const skills = Array.isArray(job.required_skills) ? job.required_skills.slice(0, 2).join(' & ') : '';
    const role = job.role_title || 'Magang';
    const company = job.company_name || 'Perusahaan Mitra';
    const city = job.city ? ` di ${job.city}` : '';
    const isSmk = job.education_target === 'SMK';

    if (skills) {
      if (isSmk) {
        dynamicPrompts.push(
          `Saya siswa SMK dengan keahlian ${skills} dan mencari PKL ${role} di ${company}${city}`
        );
      } else {
        dynamicPrompts.push(
          `Saya memiliki pengalaman ${skills} dan mencari lowongan ${role} di ${company}${city}`
        );
      }
    }
  }

  return dynamicPrompts.length >= 4 ? [...dynamicPrompts, ...basePrompts.slice(0, 3)] : basePrompts;
}

export const JOB_CATEGORIES = [
  { id: 'all', label: 'Semua Bidang', icon: '🌐', query: '' },
  { id: 'it', label: 'IT & Software', icon: '💻', query: 'Frontend React Backend Python' },
  { id: 'design', label: 'UI/UX & Kreatif', icon: '🎨', query: 'UI/UX Desain Figma Canva' },
  { id: 'marketing', label: 'Marketing & Bisnis', icon: '📈', query: 'Marketing Social Media Bisnis' },
  { id: 'finance', label: 'Keuangan & Bank', icon: '🏦', query: 'Accounting Finance Akuntansi Excel' },
  { id: 'engineering', label: 'Teknik & SMK PKL', icon: '🔧', query: 'Teknisi Jaringan Mesin Listrik K3' },
  { id: 'data', label: 'Data & Analitik', icon: '📊', query: 'Data Analyst SQL Python' },
  { id: 'hospitality', label: 'Layanan & HR', icon: '🤝', query: 'Customer Service Human Resources Hotel' },
];

export const REFERENCE_SYNONYMS = [
  {
    triggers: ['fe', 'front', 'web', 'website', 'react', 'html', 'css', 'koding', 'coding', 'programer', 'programmer', 'developer', 'it'],
    title: 'Frontend & Web Engineer',
    query: 'Frontend React JavaScript',
    badge: 'IT & Web',
    icon: '💻',
    desc: 'Cocok untuk HTML, CSS, JavaScript, React & Fullstack',
  },
  {
    triggers: ['be', 'back', 'server', 'api', 'node', 'database', 'sistem'],
    title: 'Backend & Cloud Developer',
    query: 'Backend Developer API SQL',
    badge: 'Backend IT',
    icon: '⚙️',
    desc: 'Cocok untuk Node.js, Python, SQL, REST API & Arsitektur Server',
  },
  {
    triggers: ['ui', 'ux', 'uiux', 'ui/ux', 'desain', 'design', 'desainer', 'figma', 'gambar', 'grafis', 'kreatif', 'canva'],
    title: 'UI/UX & Graphic Designer',
    query: 'UI/UX Designer Figma Canva',
    badge: 'Desain & Kreatif',
    icon: '🎨',
    desc: 'Cocok untuk Figma, Prototyping, UI Design & Konten Visual',
  },
  {
    triggers: ['uang', 'gaji', 'paid', 'bayar', 'cuan', 'tinggi', 'mahal', 'saku'],
    title: 'Uang Saku Tertinggi (Paid)',
    query: '',
    filterAction: { paid: 'true', sort: 'stipend' },
    badge: 's/d Rp3,8 Jt',
    icon: '💰',
    desc: 'Urutkan otomatis dari uang saku bulanan paling tinggi',
  },
  {
    triggers: ['wfh', 'remote', 'rumah', 'online', 'jauh', 'fleksibel'],
    title: 'Magang Remote dari Rumah (WFH)',
    query: '',
    filterAction: { work_type: 'WFH' },
    badge: '100% WFH',
    icon: '🏠',
    desc: 'Kerja fleksibel dari rumah/kos tanpa perlu ke kantor',
  },
  {
    triggers: ['bank', 'bca', 'akuntansi', 'akutansi', 'accounting', 'finance', 'keuangan', 'pajak', 'excel'],
    title: 'Accounting, Finance & Perbankan',
    query: 'Accounting Finance Akuntansi Excel',
    badge: 'Keuangan & Bank',
    icon: '🏦',
    desc: 'Bank Central Asia (BCA), Rekonsiliasi & Laporan Keuangan',
  },
  {
    triggers: ['bengkel', 'mesin', 'motor', 'mobil', 'otomotif', 'otomotip', 'astra', 'honda', 'mekanik', 'tkr', 'tsm'],
    title: 'Teknisi Mesin & Otomotif (PKL SMK)',
    query: 'Teknisi Mesin Otomotif Astra',
    badge: 'SMK & Teknik',
    icon: '🏍️',
    desc: 'Praktik bengkel resmi PT Astra Honda Motor & Standar K3',
  },
  {
    triggers: ['jaringan', 'tkj', 'wifi', 'kabel', 'mikrotik', 'telkom', 'lan', 'listrik', 'pln', 'gardu'],
    title: 'Teknisi Jaringan & Listrik (TKJ / PLN)',
    query: 'Teknisi Jaringan Listrik Telkom PLN',
    badge: 'Infrastruktur',
    icon: '📡',
    desc: 'PT Telkom Indonesia & PT PLN (Persero)',
  },
  {
    triggers: ['marketing', 'sosmed', 'ig', 'tiktok', 'konten', 'content', 'iklan', 'pr', 'bisnis', 'sales', 'shopee', 'sociolla', 'traveloka'],
    title: 'Digital Marketing & Business Dev',
    query: 'Marketing Social Media Copywriting Business',
    badge: 'Marketing',
    icon: '📢',
    desc: 'Shopee, Traveloka, Sociolla — Social Media & Campaign',
  },
  {
    triggers: ['data', 'analis', 'analyst', 'sql', 'python', 'statistik', 'bukalapak', 'ai'],
    title: 'Data Analyst & Business Intelligence',
    query: 'Data Analyst SQL Python Excel',
    badge: 'Data & AI',
    icon: '📊',
    desc: 'Analisis data, SQL, Python & Data Visualization',
  },
  {
    triggers: ['hr', 'hrd', 'psikologi', 'rekrutmen', 'admin', 'administrasi', 'unilever'],
    title: 'Human Resources (HRD) & Admin',
    query: 'Human Resources Rekrutmen Administrasi',
    badge: 'HR & People',
    icon: '👥',
    desc: 'Unilever Indonesia — Rekrutmen & Administrasi Kantor',
  },
  {
    triggers: ['hotel', 'pariwisata', 'bandara', 'pesawat', 'garuda', 'cs', 'pelayanan', 'resepsionis'],
    title: 'Hospitality, Ground Staff & CS',
    query: 'Customer Service Ground Staff Perhotelan Garuda',
    badge: 'Hospitality',
    icon: '✈️',
    desc: 'Garuda Indonesia & Perhotelan Bintang 5',
  },
  {
    triggers: ['jkt', 'jakarta', 'jabodetabek', 'jaksel', 'jakpus'],
    title: 'Filter Kota: Jakarta',
    query: '',
    filterAction: { city: 'Jakarta' },
    badge: 'DKI Jakarta',
    icon: '📍',
    desc: 'Tampilkan lowongan magang area DKI Jakarta',
  },
  {
    triggers: ['bdg', 'bandung', 'jabar'],
    title: 'Filter Kota: Bandung',
    query: '',
    filterAction: { city: 'Bandung' },
    badge: 'Bandung',
    icon: '📍',
    desc: 'Tampilkan lowongan magang area Bandung',
  },
  {
    triggers: ['jogja', 'yogya', 'yogyakarta', 'sleman'],
    title: 'Filter Kota: Yogyakarta',
    query: '',
    filterAction: { city: 'Yogyakarta' },
    badge: 'Yogyakarta',
    icon: '📍',
    desc: 'Tampilkan lowongan magang area Yogyakarta',
  },
];

function getBigrams(str) {
  const s = String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const grams = [];
  for (let i = 0; i < s.length - 1; i++) {
    grams.push(s.slice(i, i + 2));
  }
  return grams;
}

export function diceSimilarity(a, b) {
  if (!a || !b) return 0;
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  if (sa === sb) return 1;
  if (sa.length < 2 || sb.length < 2) {
    return sa.includes(sb) || sb.includes(sa) ? 0.7 : 0;
  }
  const bgA = getBigrams(sa);
  const bgB = getBigrams(sb);
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

export function extractMeaningfulTokens(rawQuery) {
  const cleaned = String(rawQuery || '')
    .toLowerCase()
    .replace(/[,.;:!?()"']/g, ' ')
    .trim();
  if (!cleaned) return [];
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const meaningful = rawTokens.filter((t) => !STOPWORDS_ID.has(t) && t.length >= 2);
  return meaningful.length > 0 ? meaningful : rawTokens;
}

export function getSmartSuggestions(rawQuery, allJobs = []) {
  const q = String(rawQuery || '').trim().toLowerCase();

  // If input is empty, return popular/trending references
  if (!q) {
    return {
      isDefault: true,
      references: REFERENCE_SYNONYMS.slice(0, 6),
      jobs: (allJobs || []).slice(0, 4),
      skills: ['React', 'Microsoft Excel', 'Figma', 'Komunikasi', 'MikroTik', 'Python', 'Canva', 'K3'],
    };
  }

  const tokens = extractMeaningfulTokens(q);

  // 1. Score Reference Synonyms
  const scoredRefs = REFERENCE_SYNONYMS.map((ref) => {
    let score = 0;
    const titleLower = ref.title.toLowerCase();
    const descLower = ref.desc.toLowerCase();

    if (titleLower.includes(q) || descLower.includes(q)) score += 90;

    for (const tok of tokens) {
      for (const trig of ref.triggers) {
        if (trig === tok) score += 100;
        else if (trig.startsWith(tok) || tok.startsWith(trig)) score += 75;
        else {
          const sim = diceSimilarity(tok, trig);
          if (sim >= 0.5) score += Math.round(sim * 70);
        }
      }
      const titleSim = diceSimilarity(tok, titleLower);
      if (titleSim >= 0.45) score += Math.round(titleSim * 50);
    }
    return { ref, score };
  })
    .filter((item) => item.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.ref);

  // 2. Score Jobs by Direct + Synonym + Fuzzy Proximity
  const expandedKeywords = new Set(tokens);
  for (const ref of scoredRefs.slice(0, 3)) {
    if (ref.query) {
      ref.query
        .toLowerCase()
        .split(/\s+/)
        .forEach((w) => expandedKeywords.add(w));
    }
  }

  const scoredJobs = (allJobs || []).map((job) => {
    const title = (job.role_title || '').toLowerCase();
    const company = (job.company_name || '').toLowerCase();
    const industry = (job.company_industry || '').toLowerCase();
    const city = (job.city || '').toLowerCase();
    const workType = (job.work_type || '').toLowerCase();
    const skills = (job.required_skills || []).map((s) => s.toLowerCase());

    let score = 0;
    if (title.includes(q)) score += 120;
    if (company.includes(q)) score += 110;
    if (skills.some((s) => s.includes(q))) score += 100;
    if (city.includes(q) || industry.includes(q) || workType.includes(q)) score += 85;

    for (const kw of expandedKeywords) {
      if (title.includes(kw) || company.includes(kw)) score += 55;
      if (skills.some((s) => s.includes(kw))) score += 50;
      if (city.includes(kw) || industry.includes(kw)) score += 35;

      // Fuzzy check against words
      if (kw.length >= 2) {
        const words = [
          ...title.split(/[\s/&()-]+/),
          ...company.split(/[\s/&()-]+/),
          city,
          ...skills,
        ].filter(Boolean);
        let bestSim = 0;
        for (const w of words) {
          const sim = diceSimilarity(kw, w);
          if (sim > bestSim) bestSim = sim;
        }
        if (bestSim >= 0.5) score += Math.round(bestSim * 65);
      }
    }

    return { job, score };
  });

  const matchedJobs = scoredJobs
    .sort((a, b) => b.score - a.score || (b.job.match?.score || 0) - (a.job.match?.score || 0))
    .slice(0, 4)
    .map((item) => ({
      ...item.job,
      isClosestFallback: item.score < 35,
    }));

  // 3. Collect closest skills
  const allSkillsSet = new Set();
  (allJobs || []).forEach((j) => (j.required_skills || []).forEach((s) => allSkillsSet.add(s)));
  const matchedSkills = [...allSkillsSet]
    .map((skill) => {
      const sl = skill.toLowerCase();
      let sc = sl.includes(q) ? 100 : diceSimilarity(q, sl) * 80;
      for (const kw of expandedKeywords) {
        if (sl.includes(kw)) sc = Math.max(sc, 70);
      }
      return { skill, sc };
    })
    .filter((x) => x.sc >= 35)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 8)
    .map((x) => x.skill);

  return {
    isDefault: false,
    references: scoredRefs.length > 0 ? scoredRefs : REFERENCE_SYNONYMS.slice(0, 3),
    jobs: matchedJobs,
    skills: matchedSkills,
  };
}

export function getSavedJobIds() {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

export function toggleSavedJobId(jobId) {
  const current = getSavedJobIds();
  const exists = current.includes(jobId);
  const next = exists ? current.filter((id) => id !== jobId) : [...current, jobId];
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
  } catch (_e) {
    // ignore
  }
  return { saved: !exists, savedIds: next };
}
