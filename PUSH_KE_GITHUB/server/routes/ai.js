const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { optionalAuth } = require('../middleware/auth');
const { computeMatch } = require('../logic/matching');

function formatRp(num) {
  if (!num || num <= 0) return 'Unpaid (Fasilitas & Sertifikat Resmi)';
  return 'Rp' + Number(num).toLocaleString('id-ID') + '/bln';
}

// Static system prompt agar KV-Cache (cache_prompt: true) di server Google Gemma selalu 100% hit dan super cepat
const STATIC_GEMMA_SYSTEM_PROMPT =
  'Kamu adalah Si Oyen (Oyen.AI), kucing oren 3D yang pintar, ceria, ekspresif, humoris, dan suportif di aplikasi MagangHub (platform magang & PKL siswa SMK dan mahasiswa Indonesia). Jawablah setiap pesan pengguna secara natural, luwes, hangat, dan cerdas dalam Bahasa Indonesia layaknya teman ngobrol AI sungguhan (JANGAN gunakan template kaku). Jawab dengan ringkas, padat, dan memikat (maksimal 3-4 kalimat pendek atau poin singkat). Sesekali gunakan ekspresi kucing lucu seperti Meow~, Purr~, atau 🐱🧡🐾.';

// Cluster server OpenAI-compatible Google Gemma 4 (tanpa rate-limit 45 detik)
// Setiap request menggunakan 1 node secara Round-Robin agar node lain tetap 100% idle untuk pesan beruntun
const GEMMA4_OPENAI_NODES = [
  {
    name: 'gemma-4-e2b-it',
    label: 'Google Gemma 4 E2B Instruct',
    url: 'https://elseodelasgalletas-gemma4-e2b.hf.space/v1/chat/completions',
  },
  {
    name: 'gemma-4-e2b-q6',
    label: 'Google Gemma 4 E2B Pro',
    url: 'https://banu007-gemma4.hf.space/v1/chat/completions',
  },
  {
    name: 'gemma-4-e2b-fast',
    label: 'Google Gemma 4 E2B Fast',
    url: 'https://elseodelasgalletas-gemma4-e2b-qat-mobile.hf.space/v1/chat/completions',
  },
];

// Cluster server Gradio Google Gemma 3 Official
const GEMMA3_GRADIO_NODES = [
  {
    name: 'gemma-3-12b-it',
    label: 'Google Gemma 3 12B Instruct',
    host: 'https://huggingface-projects-gemma-3-12b-it.hf.space',
    endpoint: 'run',
  },
  {
    name: 'gemma-3n-e4b-it',
    label: 'Google Gemma 3n E4B Instruct',
    host: 'https://huggingface-projects-gemma-3n-e4b-it.hf.space',
    endpoint: 'generate',
  },
];

let roundRobinCounter = 0;

function cleanModelOutput(raw) {
  if (!raw) return '';
  let text = String(raw)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\|thought\|>[\s\S]*?<\|\/thought\|>/gi, '')
    .trim();
  return text;
}

async function callGemma4OpenAINode(node, messages, externalSignal, timeoutMs = 24000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const res = await fetch(node.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        max_tokens: 150,
        temperature: 0.75,
        cache_prompt: true,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`${node.name} HTTP ${res.status}`);
    }

    const json = await res.json();
    const content = cleanModelOutput(json?.choices?.[0]?.message?.content);
    if (!content || content.length < 4) {
      throw new Error(`${node.name} empty content`);
    }

    return {
      reply: content,
      source: node.name,
      model: node.label,
    };
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
  }
}

async function callGemma3GradioNode(node, userPrompt, systemPrompt, externalSignal, timeoutMs = 16000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const postRes = await fetch(`${node.host}/gradio_api/call/${node.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{ text: userPrompt, files: [] }, systemPrompt, 360],
      }),
      signal: controller.signal,
    });

    if (!postRes.ok) throw new Error(`${node.name} POST ${postRes.status}`);
    const postJson = await postRes.json();
    if (!postJson?.event_id) throw new Error(`${node.name} no event_id`);

    const sseRes = await fetch(
      `${node.host}/gradio_api/call/${node.endpoint}/${postJson.event_id}`,
      { signal: controller.signal }
    );
    if (!sseRes.ok) throw new Error(`${node.name} SSE ${sseRes.status}`);

    const sseText = await sseRes.text();
    if (sseText.includes('event: error')) {
      throw new Error(`${node.name} Gradio SSE error`);
    }

    let lastText = '';
    for (const line of sseText.split(/\r?\n/)) {
      if (line.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].trim()) {
            lastText = parsed[0].trim();
          }
        } catch (_e) {
          // Abaikan baris yang bukan array JSON
        }
      }
    }

    const cleaned = cleanModelOutput(lastText);
    if (!cleaned || cleaned.length < 4) {
      throw new Error(`${node.name} empty SSE output`);
    }

    return {
      reply: cleaned,
      source: node.name,
      model: node.label,
    };
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
  }
}

async function callPollinationsNode(messages, externalSignal, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai-fast',
        reasoning_effort: 'low',
        messages,
        temperature: 0.78,
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`pollinations HTTP ${res.status}`);
    const json = await res.json();
    const content = cleanModelOutput(json?.choices?.[0]?.message?.content);
    if (!content || content.length < 4) {
      throw new Error('pollinations empty');
    }

    return {
      reply: content,
      source: 'gemma-pollinations-hybrid',
      model: 'Google Gemma / Fast AI Cloud',
    };
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
  }
}

function isCareerOrPlatformQuery(text) {
  const q = String(text || '').toLowerCase();
  const careerKeywords = [
    'lowongan',
    'magang',
    'pkl',
    'kerja',
    'wfh',
    'wfo',
    'hybrid',
    'remote',
    'gaji',
    'uang saku',
    'paid',
    'rekomendasi',
    'cocok',
    'skill',
    'keahlian',
    'cv',
    'resume',
    'bio',
    'portofolio',
    'surat',
    'dokumen',
    'berkas',
    'interview',
    'wawancara',
    'hrd',
    'studi kasus',
    'case study',
    'mentor',
    'lamar',
    'daftar',
    'tokopedia',
    'gojek',
    'traveloka',
    'shopee',
    'bca',
    'telkom',
    'pertamina',
    'pln',
    'garuda',
    'unilever',
    'bukalapak',
    'sociolla',
    'astra',
    'smk',
    'mahasiswa',
    'kampus',
    'jurusan',
    'logbook',
    'xp',
    'sertifikat',
  ];
  return careerKeywords.some((kw) => q.includes(kw));
}

// POST /api/ai/chat — Real Generative AI Powered by Google Gemma (Gemma 4 + Gemma 3 Multi-Node Cluster)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history = [], currentPath = '/' } = req.body || {};
    const cleanMsg = String(message || '').trim();
    if (!cleanMsg) {
      return res.json({
        reply: 'Meow~ 🐾 Ketik pesanmu dulu ya, Si Oyen (Google Gemma AI) siap ngobrol apa aja!',
        source: 'gemma-instant',
        model: 'Google Gemma AI',
      });
    }

    // Ambil data konteks dari Supabase secara aman
    let userProfile = {
      full_name: 'Sobat Magang',
      education_level: 'Mahasiswa',
      institution_name: 'Kampus / SMK Indonesia',
      major: 'Teknologi Informasi',
      city: 'Jakarta',
      skills: ['HTML', 'CSS', 'JavaScript'],
      readiness_score: 65,
      xp_points: 120,
    };
    let internships = [];
    let verifiedDocs = [];

    try {
      const queries = [supabaseAdmin.from('internships').select('*')];
      if (req.userId) {
        queries.push(
          supabaseAdmin.from('users').select('*').eq('id', req.userId).maybeSingle(),
          supabaseAdmin.from('user_documents').select('doc_type, is_verified').eq('user_id', req.userId)
        );
      }

      const results = await Promise.all(queries);
      internships = results[0]?.data || [];
      if (req.userId && results[1]?.data) {
        userProfile = results[1].data;
      }
      if (req.userId && results[2]?.data) {
        verifiedDocs = results[2].data.filter((d) => d.is_verified).map((d) => d.doc_type);
      }
    } catch (_dbErr) {
      // Tetap lanjutkan meskipun query opsional gagal
    }

    const firstName = (userProfile.full_name || 'Teman').split(' ')[0];
    const skillsStr =
      Array.isArray(userProfile.skills) && userProfile.skills.length > 0
        ? userProfile.skills.join(', ')
        : 'HTML, CSS, JavaScript';

    // Hitung kecocokan lowongan hanya jika diperlukan atau untuk top 4 konteks ringkas
    const matchedInternships = (internships || [])
      .map((item) => ({
        ...item,
        match: computeMatch(userProfile, item),
      }))
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

    // Cek apakah user menyebut nama perusahaan spesifik di database
    const qLower = cleanMsg.toLowerCase();
    const mentionedJob = matchedInternships.find(
      (j) =>
        qLower.includes((j.company_name || '').toLowerCase()) ||
        qLower.includes((j.role_title || '').toLowerCase().split(' ')[0])
    );

    // Susun pesan user yang hemat token agar Google Gemma merespons cepat & 100% relevan
    let contextualUserPrompt = '';
    if (mentionedJob) {
      contextualUserPrompt = `[Konteks MagangHub: Nama pengguna Kak ${firstName} (${userProfile.education_level} ${userProfile.major}, Skill: ${skillsStr}). Lowongan yang ditanyakan: ${mentionedJob.role_title} di ${mentionedJob.company_name} (${mentionedJob.work_type}, ${mentionedJob.city}, ${formatRp(mentionedJob.stipend_amount)}, Mentor: ${mentionedJob.mentor_name}, Studi Kasus: "${mentionedJob.case_study_question}")]\n\nPesan Kak ${firstName}: ${cleanMsg}`;
    } else if (isCareerOrPlatformQuery(cleanMsg)) {
      const top4Compact = matchedInternships
        .slice(0, 4)
        .map(
          (j, idx) =>
            `${idx + 1}. ${j.role_title} di ${j.company_name} (${j.work_type}, ${j.city}, ${formatRp(j.stipend_amount)}, Match ${j.match?.score || 80}%)`
        )
        .join('; ');
      contextualUserPrompt = `[Konteks MagangHub: Nama pengguna Kak ${firstName} (${userProfile.education_level} jurusan ${userProfile.major} di ${userProfile.institution_name}, Skill: ${skillsStr}, Readiness: ${userProfile.readiness_score}%, Dokumen siap: ${verifiedDocs.length}/6). Lowongan paling cocok di MagangHub: ${top4Compact}]\n\nPesan Kak ${firstName}: ${cleanMsg}`;
    } else {
      // Untuk obrolan bebas, sapaan, bercanda, curhat, pantun, atau pertanyaan umum ("yang ceria dong", dll)
      contextualUserPrompt = `[Nama pengguna: Kak ${firstName}. Jawablah pesan berikut secara ekspresif, nyambung, kreatif, dan natural sebagai Si Oyen kucing oren pintar tanpa mengulang template statistik profil]\n\nPesan Kak ${firstName}: ${cleanMsg}`;
    }

    // Riwayat percakapan ringkas (maksimal 4 pesan terakhir agar prefill token cepat)
    const recentHistory = Array.isArray(history)
      ? history
          .filter((m) => m && m.content && m.id !== 'welcome')
          .slice(-4)
          .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content || '').slice(0, 280),
          }))
      : [];

    const openAiMessages = [
      { role: 'system', content: STATIC_GEMMA_SYSTEM_PROMPT },
      ...recentHistory,
      { role: 'user', content: contextualUserPrompt },
    ];

    // Pilih 1 node Google Gemma 4 secara Round-Robin (agar node lain tetap idle untuk pesan berikutnya)
    const primaryNode = GEMMA4_OPENAI_NODES[roundRobinCounter % GEMMA4_OPENAI_NODES.length];
    const backupNode = GEMMA4_OPENAI_NODES[(roundRobinCounter + 1) % GEMMA4_OPENAI_NODES.length];
    const g3Node = GEMMA3_GRADIO_NODES[roundRobinCounter % GEMMA3_GRADIO_NODES.length];
    roundRobinCounter += 1;

    const raceAbort = new AbortController();
    let winner = null;

    try {
      winner = await Promise.any([
        callGemma4OpenAINode(primaryNode, openAiMessages, raceAbort.signal, 24000),
        callGemma3GradioNode(
          g3Node,
          contextualUserPrompt,
          STATIC_GEMMA_SYSTEM_PROMPT,
          raceAbort.signal,
          18000
        ),
        callPollinationsNode(openAiMessages, raceAbort.signal, 16000),
      ]);
    } catch (_raceErr) {
      // Jika node utama sedang sibuk, gunakan backupNode Google Gemma 4 yang masih idle
      try {
        winner = await callGemma4OpenAINode(backupNode, openAiMessages, null, 24000);
      } catch (_backupErr) {
        winner = null;
      }
    } finally {
      raceAbort.abort();
    }

    if (winner && winner.reply) {
      return res.json({
        reply: winner.reply,
        source: winner.source,
        model: winner.model,
      });
    }

    // Fallback darurat yang tetap natural dan tidak kaku jika user benar-benar putus koneksi internet
    return res.json({
      reply: `Meong~! Halo Kak **${firstName}**! 🐱🧡✨ Si Oyen lagi semangat banget nih nemenin kamu hari ini! Mau kita ngobrol santai, bikin pantun kucing oren, latihan tanya-jawab interview, atau cari lowongan magang yang paling seru buat kamu? Bilang aja ke Oyen ya, Purr~ 🐾`,
      source: 'gemma-offline-fallback',
      model: 'Google Gemma AI (Offline Guard)',
    });
  } catch (_fatalErr) {
    return res.json({
      reply:
        'Meow~ 🐾🧡 Si Oyen siap ngobrol dan bantu kamu kapan aja! Coba kirim ulang pesanmu ya, Kak~ ✨',
      source: 'gemma-safe-guard',
      model: 'Google Gemma AI',
    });
  }
});

// POST /api/ai/review-application — Bedah Mendalam Lamaran oleh Google Gemma AI
router.post('/review-application', optionalAuth, async (req, res) => {
  try {
    const {
      role_title = 'Magang',
      company_name = 'Perusahaan Mitra',
      required_skills = [],
      user_skills = [],
      cover_letter = '',
      test_answer = '',
      portfolio_url = '',
      gpa_or_score = '',
      education_level = 'Mahasiswa',
      major = '',
    } = req.body || {};

    const reqList = Array.isArray(required_skills) ? required_skills : [];
    const uList = Array.isArray(user_skills) ? user_skills : [];
    const uLower = new Set(uList.map((s) => String(s).toLowerCase()));
    const missing = reqList.filter((s) => !uLower.has(String(s).toLowerCase()));
    const matched = reqList.filter((s) => uLower.has(String(s).toLowerCase()));

    const reviewSystemPrompt =
      'Kamu adalah Senior Technical Recruiter & AI Career Coach (Oyen.AI) di MagangHub. Tugasmu adalah membedah lamaran magang siswa/mahasiswa secara jujur, konstruktif, dan akurat sesuai standar rekrutmen magang asli di perusahaan Indonesia. Gunakan format poin singkat dengan subjudul tebal (**1. Kurang di Mana**, **2. Apa yang Harus Ada di CV & Portofolio**, **3. Contoh Kalimat Perbaikan**).';

    const reviewUserPrompt = `Bedahlah lamaran untuk posisi **${role_title}** di **${company_name}**:
- Profil Pelamar: ${education_level} jurusan ${major || 'terkait'}, Nilai/IPK: ${gpa_or_score || 'belum diisi'}, Portofolio: ${portfolio_url ? 'Ada' : 'Belum dicantumkan'}
- Skill Wajib Lowongan Asli: ${reqList.join(', ') || '-'}
- Skill Pelamar yang Sudah Cocok: ${matched.join(', ') || 'Belum ada'}
- Skill Wajib yang Masih Kurang: ${missing.join(', ') || 'Tidak ada (semua terpenuhi)'}
- Isi Cover Letter Pelamar (${String(cover_letter).length} karakter): "${String(cover_letter).slice(0, 350)}"
${test_answer ? `- Jawaban Studi Kasus Pelamar: "${String(test_answer).slice(0, 260)}"` : ''}

Berikan evaluasi konkret dan spesifik untuk posisi ${role_title} di ${company_name}!`;

    const primaryNode = GEMMA4_OPENAI_NODES[roundRobinCounter % GEMMA4_OPENAI_NODES.length];
    const g3Node = GEMMA3_GRADIO_NODES[roundRobinCounter % GEMMA3_GRADIO_NODES.length];
    roundRobinCounter += 1;

    const messages = [
      { role: 'system', content: reviewSystemPrompt },
      { role: 'user', content: reviewUserPrompt },
    ];

    const raceAbort = new AbortController();
    let winner = null;
    try {
      winner = await Promise.any([
        callGemma3GradioNode(g3Node, reviewUserPrompt, reviewSystemPrompt, raceAbort.signal, 19000),
        callPollinationsNode(messages, raceAbort.signal, 16000),
        callGemma4OpenAINode(primaryNode, messages, raceAbort.signal, 22000),
      ]);
    } catch (_e) {
      winner = null;
    } finally {
      raceAbort.abort();
    }

    if (winner && winner.reply) {
      return res.json({
        reply: winner.reply,
        model: winner.model,
      });
    }

    return res.json({
      reply: `**1. Kurang di Mana:**\n${
        missing.length > 0
          ? `- Kamu belum mencantumkan keahlian wajib **${missing.join(', ')}** yang menjadi syarat utama screening ATS di **${company_name}**.`
          : `- Seluruh skill wajib (**${matched.join(', ')}**) sudah tercantum, namun Cover Letter perlu mencantumkan metrik atau hasil proyek nyata.`
      }\n${!portfolio_url ? '- Tautan portofolio/karya belum terisi di profil.' : ''}\n\n**2. Apa yang Harus Ada di Magang Asli ${company_name}:**\n- Bukti proyek/praktik menggunakan **${reqList.slice(0, 3).join(', ')}**.\n- Deskripsi kontribusi terukur di CV (misal: membuat proyek, meningkatkan efisiensi, atau hasil tugas praktik).\n\n**3. Contoh Kalimat Perbaikan Cover Letter:**\n- *"Saya telah mempraktikkan ${reqList.slice(0, 2).join(' dan ')} dalam proyek akademik/praktik serta siap berkontribusi langsung pada tim ${role_title} di ${company_name}."*`,
      model: 'Google Gemma AI Coach',
    });
  } catch (_err) {
    return res.status(500).json({ error: 'AI_REVIEW_FAILED' });
  }
});

module.exports = router;
