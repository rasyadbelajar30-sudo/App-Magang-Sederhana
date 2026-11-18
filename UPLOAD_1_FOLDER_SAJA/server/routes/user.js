const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { requireAuth, ensureProfile } = require('../middleware/auth');
const { computeReadiness } = require('../logic/readiness');
const { levelFromXp, calculateXpAwards, XP_TABLE } = require('../logic/xp');

async function getUserDocsAndPractices(userId) {
  const [{ data: docs, error: docErr }, { data: practices, error: pracErr }] = await Promise.all([
    supabaseAdmin.from('user_documents').select('*').eq('user_id', userId),
    supabaseAdmin.from('user_prep_practice').select('*').eq('user_id', userId),
  ]);

  if (docErr || pracErr) {
    throw docErr || pracErr;
  }

  return {
    docs: docs || [],
    practices: practices || [],
  };
}

// POST /api/user/demo-guest (Buat akun demo tamu acak agar sesi penguji tidak saling tumpuk)
router.post('/demo-guest', async (_req, res) => {
  try {
    const suffix = Math.random().toString(36).substring(2, 7);
    const email = `guest_${suffix}@maganghub.id`;
    const password = `demo_${suffix}_${Date.now().toString(36)}!`;

    const guestNames = [
      'Budi Santoso',
      'Siti Nurhaliza',
      'Ahmad Fauzi',
      'Putri Ayu',
      'Dwi Nugroho',
      'Anisa Rahmawati',
      'Fajar Pratama',
      'Rina Kartika',
      'Kevin Adiputra',
      'Nadia Safitri',
    ];
    const pickedName =
      guestNames[Math.floor(Math.random() * guestNames.length)] + ` (Demo ${suffix.toUpperCase()})`;

    const studentTemplates = [
      {
        major: 'Teknik Informatika',
        institution: 'Universitas Indonesia',
        level: 'Mahasiswa',
        grade: 'Semester 5',
        gpa: 3.72,
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'REST API'],
      },
      {
        major: 'Sistem Informasi',
        institution: 'Universitas Gadjah Mada',
        level: 'Mahasiswa',
        grade: 'Semester 5',
        gpa: 3.65,
        skills: ['Figma', 'UI/UX', 'Product Management', 'SQL'],
      },
      {
        major: 'Rekayasa Perangkat Lunak',
        institution: 'SMK Negeri 1 Jakarta',
        level: 'SMK',
        grade: 'Kelas XII',
        gpa: 88.5,
        skills: ['HTML', 'CSS', 'JavaScript', 'Figma', 'PHP'],
      },
      {
        major: 'Teknik Komputer dan Jaringan',
        institution: 'SMK Negeri 2 Bandung',
        level: 'SMK',
        grade: 'Kelas XII',
        gpa: 86.0,
        skills: ['Linux', 'Networking', 'Python', 'Mikrotik'],
      },
      {
        major: 'Desain Komunikasi Visual',
        institution: 'Institut Teknologi Bandung',
        level: 'Mahasiswa',
        grade: 'Semester 6',
        gpa: 3.8,
        skills: ['Figma', 'Illustrator', 'Photoshop', 'Canva', 'Motion Graphic'],
      },
    ];
    const template = studentTemplates[Math.floor(Math.random() * studentTemplates.length)];

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: pickedName,
        education_level: template.level,
      },
    });

    if (authError || !authData?.user) {
      console.error('[demo-guest auth error]', authError);
      return res.status(500).json({
        error: 'AUTH_FAILED',
        message: authError?.message || 'Gagal membuat akun demo acak.',
      });
    }

    const userId = authData.user.id;
    const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    // Seed profile demo yang terisi lengkap & siap tes
    await supabaseAdmin.from('users').upsert({
      id: userId,
      full_name: pickedName,
      email,
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      avatar_color: avatarColor,
      education_level: template.level,
      institution_name: template.institution,
      major: template.major,
      grade_or_semester: template.grade,
      gpa_or_score: template.gpa,
      city: 'Jakarta',
      bio: `Peserta demo MagangHub bidang ${template.major}. Siap berkontribusi dan belajar hal baru!`,
      skills: template.skills,
      portfolio_url: `https://github.com/guest-${suffix}`,
      readiness_score: 55,
      xp_points: 100,
      xp_events: [
        { label: 'Akun Demo Siap', points: 100, date: new Date().toISOString() },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.json({
      success: true,
      email,
      password,
      name: pickedName,
      isRandomGuest: true,
    });
  } catch (err) {
    console.error('[POST /api/user/demo-guest error]', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /api/user
router.get('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const user = req.userProfile;
    const { docs, practices } = await getUserDocsAndPractices(req.userId);
    const readiness = computeReadiness(user, docs, practices);

    if (user.readiness_score !== readiness.score) {
      await supabaseAdmin
        .from('users')
        .update({ readiness_score: readiness.score, updated_at: new Date().toISOString() })
        .eq('id', req.userId);
      user.readiness_score = readiness.score;
    }

    const level = levelFromXp(user.xp_points);
    return res.json({ user, readiness, level });
  } catch (err) {
    console.error('[GET /api/user error]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// PUT /api/user
router.put('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const user = req.userProfile;
    const allowedFields = [
      'full_name',
      'phone',
      'avatar_color',
      'education_level',
      'institution_name',
      'major',
      'grade_or_semester',
      'gpa_or_score',
      'city',
      'bio',
      'portfolio_url',
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) {
        updates[f] = req.body[f];
      }
    }

    if (updates.education_level && !['SMK', 'Mahasiswa'].includes(updates.education_level)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Jenjang pendidikan harus SMK atau Mahasiswa.',
      });
    }

    if (updates.phone !== undefined && updates.phone !== '') {
      const phoneStr = String(updates.phone).trim();
      if (!/^08\d{8,11}$/.test(phoneStr)) {
        return res.status(400).json({
          error: 'VALIDATION',
          message: 'Nomor telepon harus diawali 08 dan terdiri dari 10–13 digit.',
        });
      }
      updates.phone = phoneStr;
    }

    const targetEdu = updates.education_level || user.education_level;
    if (updates.gpa_or_score !== undefined) {
      const num = Number(updates.gpa_or_score);
      if (isNaN(num) || num < 0 || (targetEdu === 'Mahasiswa' && num > 4) || (targetEdu === 'SMK' && num > 100)) {
        return res.status(400).json({
          error: 'VALIDATION',
          message:
            targetEdu === 'Mahasiswa'
              ? 'IPK Mahasiswa harus bernilai antara 0.00 sampai 4.00.'
              : 'Nilai rata-rata SMK harus bernilai antara 0 sampai 100.',
        });
      }
      updates.gpa_or_score = num;
    }

    const mergedUser = { ...user, ...updates };
    const { docs, practices } = await getUserDocsAndPractices(req.userId);
    const readiness = computeReadiness(mergedUser, docs, practices);

    const profileBlock = readiness.breakdown.find((b) => b.key === 'profile');
    const xpEventsToAward = [];
    if (profileBlock && profileBlock.earned === 25) {
      xpEventsToAward.push({ key: 'profile_complete', amount: XP_TABLE.PROFILE_COMPLETE });
    }

    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(
      mergedUser,
      xpEventsToAward
    );

    const finalPayload = {
      ...updates,
      readiness_score: readiness.score,
      xp_points: updatedXpPoints,
      xp_events: updatedXpEvents,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedUser, error: updErr } = await supabaseAdmin
      .from('users')
      .update(finalPayload)
      .eq('id', req.userId)
      .select('*')
      .single();

    if (updErr) {
      console.error('[PUT /api/user error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json({
      user: updatedUser,
      readiness,
      level: xpResult.level,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[PUT /api/user unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/user/skills
router.post('/skills', requireAuth, ensureProfile, async (req, res) => {
  try {
    const user = req.userProfile;
    const rawSkill = String(req.body.skill || '').trim();

    if (rawSkill.length < 1 || rawSkill.length > 30) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Nama skill harus memiliki panjang 1 hingga 30 karakter.',
      });
    }

    const currentSkills = Array.isArray(user.skills) ? user.skills : [];
    const exists = currentSkills.some((s) => s.trim().toLowerCase() === rawSkill.toLowerCase());
    if (exists) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: `Skill "${rawSkill}" sudah ada di daftar keahlianmu.`,
      });
    }

    const nextSkills = [...currentSkills, rawSkill];
    const mergedUser = { ...user, skills: nextSkills };

    const { docs, practices } = await getUserDocsAndPractices(req.userId);
    const readiness = computeReadiness(mergedUser, docs, practices);

    const skillKey = `skill_added:${rawSkill.toLowerCase()}`;
    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(mergedUser, [
      { key: skillKey, amount: XP_TABLE.SKILL_ADDED },
    ]);

    const { data: updatedUser, error: updErr } = await supabaseAdmin
      .from('users')
      .update({
        skills: nextSkills,
        readiness_score: readiness.score,
        xp_points: updatedXpPoints,
        xp_events: updatedXpEvents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select('*')
      .single();

    if (updErr) {
      console.error('[POST /api/user/skills error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json({
      user: updatedUser,
      readiness,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[POST /api/user/skills unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// DELETE /api/user/skills/:skill
router.delete('/skills/:skill', requireAuth, ensureProfile, async (req, res) => {
  try {
    const user = req.userProfile;
    const targetSkill = decodeURIComponent(req.params.skill || '').trim().toLowerCase();
    const currentSkills = Array.isArray(user.skills) ? user.skills : [];
    const nextSkills = currentSkills.filter((s) => s.trim().toLowerCase() !== targetSkill);

    const mergedUser = { ...user, skills: nextSkills };
    const { docs, practices } = await getUserDocsAndPractices(req.userId);
    const readiness = computeReadiness(mergedUser, docs, practices);

    const { data: updatedUser, error: updErr } = await supabaseAdmin
      .from('users')
      .update({
        skills: nextSkills,
        readiness_score: readiness.score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select('*')
      .single();

    if (updErr) {
      console.error('[DELETE /api/user/skills error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json({
      user: updatedUser,
      readiness,
    });
  } catch (err) {
    console.error('[DELETE /api/user/skills unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// PATCH /api/user/mode
router.patch('/mode', requireAuth, ensureProfile, async (req, res) => {
  try {
    const user = req.userProfile;
    const { education_level } = req.body;
    if (!['SMK', 'Mahasiswa'].includes(education_level)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Mode jenjang harus SMK atau Mahasiswa.',
      });
    }

    const updates = { education_level };

    const defaultMhsInstitutions = ['', 'Universitas Gadjah Mada'];
    const defaultSmkInstitutions = ['', 'SMK Negeri 2 Depok Sleman'];

    if (
      education_level === 'SMK' &&
      defaultMhsInstitutions.includes(user.institution_name || '')
    ) {
      updates.institution_name = 'SMK Negeri 2 Depok Sleman';
      updates.major = 'Teknik Komputer & Jaringan';
      updates.grade_or_semester = 'Kelas XI';
      updates.gpa_or_score = 88.5;
    } else if (
      education_level === 'Mahasiswa' &&
      defaultSmkInstitutions.includes(user.institution_name || '')
    ) {
      updates.institution_name = 'Universitas Gadjah Mada';
      updates.major = 'Teknologi Informasi';
      updates.grade_or_semester = 'Semester 5';
      updates.gpa_or_score = 3.52;
    } else if (education_level === 'Mahasiswa' && Number(user.gpa_or_score) > 4) {
      updates.gpa_or_score = 3.5;
    } else if (education_level === 'SMK' && Number(user.gpa_or_score) <= 4 && Number(user.gpa_or_score) > 0) {
      updates.gpa_or_score = 85;
    }

    const mergedUser = { ...user, ...updates };
    const { docs, practices } = await getUserDocsAndPractices(req.userId);
    const readiness = computeReadiness(mergedUser, docs, practices);

    const { data: updatedUser, error: updErr } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        readiness_score: readiness.score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select('*')
      .single();

    if (updErr) {
      console.error('[PATCH /api/user/mode error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json({
      user: updatedUser,
      readiness,
    });
  } catch (err) {
    console.error('[PATCH /api/user/mode unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
