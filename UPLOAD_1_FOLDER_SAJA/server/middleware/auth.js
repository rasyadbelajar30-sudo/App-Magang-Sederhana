const { supabaseAdmin } = require('../supabase');

const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Sesi tidak ditemukan, silakan masuk kembali.',
      });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data || !data.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Sesi sudah berakhir atau tidak valid, silakan masuk kembali.',
      });
    }

    req.userId = data.user.id;
    req.userEmail = data.user.email || '';
    req.userMeta = data.user.user_metadata || {};
    next();
  } catch (err) {
    console.error('[requireAuth error]', err);
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Gagal memverifikasi sesi pengguna.',
    });
  }
}

async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return next();

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data && data.user) {
      req.userId = data.user.id;
      req.userEmail = data.user.email || '';
      req.userMeta = data.user.user_metadata || {};
    }
    next();
  } catch (_err) {
    next();
  }
}

async function ensureProfile(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Tidak terautentikasi.',
      });
    }

    const { data: existing, error: selErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .maybeSingle();

    if (selErr) {
      console.error('[ensureProfile select error]', selErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    if (existing) {
      req.userProfile = existing;
      return next();
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const fullName =
      (req.userMeta && req.userMeta.full_name) ||
      (req.userEmail ? req.userEmail.split('@')[0] : 'Peserta Magang');
    const eduLevel =
      req.userMeta && ['SMK', 'Mahasiswa'].includes(req.userMeta.education_level)
        ? req.userMeta.education_level
        : 'Mahasiswa';

    const newProfile = {
      id: req.userId,
      full_name: fullName,
      email: req.userEmail,
      phone: '',
      avatar_color: randomColor,
      education_level: eduLevel,
      institution_name: '',
      major: '',
      grade_or_semester: '',
      gpa_or_score: 0,
      city: '',
      bio: '',
      skills: [],
      portfolio_url: '',
      readiness_score: 5, // full_name terisi = 5 poin
      xp_points: 0,
      xp_events: [],
    };

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('users')
      .insert(newProfile)
      .select('*')
      .single();

    if (insErr) {
      console.error('[ensureProfile insert error]', insErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    req.userProfile = inserted;
    next();
  } catch (err) {
    console.error('[ensureProfile unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
  ensureProfile,
};
