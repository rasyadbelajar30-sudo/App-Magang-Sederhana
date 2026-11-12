const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { supabaseAdmin } = require('./supabase');
const { requireAuth, ensureProfile } = require('./middleware/auth');
const { DEMO_USER_PROFILE } = require('./seedData');
const { computeReadiness } = require('./logic/readiness');

const userRoutes = require('./routes/user');
const documentsRoutes = require('./routes/documents');
const internshipsRoutes = require('./routes/internships');
const applicationsRoutes = require('./routes/applications');
const prepRoutes = require('./routes/prep');
const internRoutes = require('./routes/intern');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// GET /api/health
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabaseAdmin.from('internships').select('id').limit(1);
    return res.json({ ok: true, supabase: !error });
  } catch (_err) {
    return res.json({ ok: true, supabase: false });
  }
});

// Mount feature routes
app.use('/api/user', userRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/prep', prepRoutes);
app.use('/api/intern', internRoutes);
app.use('/api/ai', aiRoutes);

// POST /api/dev/reset
app.post('/api/dev/reset', requireAuth, ensureProfile, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Kembalikan kuota untuk semua lamaran aktif (non-REJECTED) milik user ini
    const { data: userApps } = await supabaseAdmin
      .from('applications')
      .select('id, internship_id, status')
      .eq('user_id', userId);

    if (userApps && userApps.length > 0) {
      for (const a of userApps) {
        if (a.status !== 'REJECTED') {
          await supabaseAdmin.rpc('return_quota', { p_internship_id: a.internship_id });
        }
      }
      await supabaseAdmin.from('applications').delete().eq('user_id', userId);
    }

    // 2. Hapus file di Storage & baris user_documents
    const { data: userDocs } = await supabaseAdmin
      .from('user_documents')
      .select('storage_path')
      .eq('user_id', userId);

    const pathsToRemove = (userDocs || []).map((d) => d.storage_path).filter(Boolean);
    if (pathsToRemove.length > 0) {
      await supabaseAdmin.storage.from('documents').remove(pathsToRemove);
    }
    await supabaseAdmin.from('user_documents').delete().eq('user_id', userId);

    // 3. Hapus latihan interview
    await supabaseAdmin.from('user_prep_practice').delete().eq('user_id', userId);

    // 4. Reset profil user
    const isDemo = req.userEmail === 'demo@maganghub.id';
    const resetFields = isDemo
      ? {
          full_name: DEMO_USER_PROFILE.full_name,
          phone: DEMO_USER_PROFILE.phone,
          education_level: DEMO_USER_PROFILE.education_level,
          institution_name: DEMO_USER_PROFILE.institution_name,
          major: DEMO_USER_PROFILE.major,
          grade_or_semester: DEMO_USER_PROFILE.grade_or_semester,
          gpa_or_score: DEMO_USER_PROFILE.gpa_or_score,
          city: DEMO_USER_PROFILE.city,
          bio: '',
          skills: DEMO_USER_PROFILE.skills,
          portfolio_url: '',
          xp_points: 0,
          xp_events: [],
        }
      : {
          bio: '',
          skills: [],
          portfolio_url: '',
          xp_points: 0,
          xp_events: [],
        };

    const readiness = computeReadiness(
      { ...req.userProfile, ...resetFields },
      [],
      []
    );

    const { data: resetUser, error: updErr } = await supabaseAdmin
      .from('users')
      .update({
        ...resetFields,
        readiness_score: readiness.score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (updErr) {
      console.error('[POST /api/dev/reset error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan saat mereset progres.',
      });
    }

    return res.json({
      ok: true,
      user: resetUser,
      readiness,
    });
  } catch (err) {
    console.error('[POST /api/dev/reset unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// Serve Frontend Build (dist/) for Production Hosting (Render / Railway)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MagangHub API Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
