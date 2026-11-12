const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { requireAuth, ensureProfile } = require('../middleware/auth');
const { computeReadiness } = require('../logic/readiness');
const { calculateXpAwards, XP_TABLE } = require('../logic/xp');

// GET /api/prep?category=
router.get('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabaseAdmin.from('prep_questions').select('*').order('id', { ascending: true });

    if (category && ['HR', 'Teknis', 'Etika Magang'].includes(category)) {
      query = query.eq('category', category);
    }

    const [{ data: questions, error: qErr }, { data: practices, error: pErr }] = await Promise.all([
      query,
      supabaseAdmin.from('user_prep_practice').select('*').eq('user_id', req.userId),
    ]);

    if (qErr || pErr) {
      console.error('[GET /api/prep error]', qErr || pErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const pracMap = new Map((practices || []).map((p) => [p.question_id, p]));
    const result = (questions || []).map((q) => {
      const pr = pracMap.get(q.id);
      return {
        ...q,
        is_practiced: Boolean(pr),
        user_answer: pr ? pr.user_answer : '',
        practiced_at: pr ? pr.practiced_at : null,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('[GET /api/prep unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/prep/:id/practice
router.post('/:id/practice', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const cleanAnswer = String(req.body.user_answer || '').trim();

    if (cleanAnswer.length < 30) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Jawaban latihan minimal harus 30 karakter agar efektif.',
      });
    }

    const { data: question, error: qErr } = await supabaseAdmin
      .from('prep_questions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (qErr || !question) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Soal latihan tidak ditemukan.',
      });
    }

    const nowIso = new Date().toISOString();
    const { error: upErr } = await supabaseAdmin.from('user_prep_practice').upsert(
      {
        user_id: req.userId,
        question_id: id,
        user_answer: cleanAnswer,
        practiced_at: nowIso,
      },
      { onConflict: 'user_id,question_id' }
    );

    if (upErr) {
      console.error('[POST /api/prep/:id/practice error]', upErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const [{ data: docs }, { data: practices }] = await Promise.all([
      supabaseAdmin.from('user_documents').select('*').eq('user_id', req.userId),
      supabaseAdmin.from('user_prep_practice').select('*').eq('user_id', req.userId),
    ]);

    const readiness = computeReadiness(req.userProfile, docs || [], practices || []);
    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(req.userProfile, [
      { key: `practice:${id}`, amount: XP_TABLE.PRACTICE_INTERVIEW },
    ]);

    await supabaseAdmin
      .from('users')
      .update({
        readiness_score: readiness.score,
        xp_points: updatedXpPoints,
        xp_events: updatedXpEvents,
        updated_at: nowIso,
      })
      .eq('id', req.userId);

    return res.json({
      sim: {
        ...question,
        is_practiced: true,
        user_answer: cleanAnswer,
        practiced_at: nowIso,
      },
      readiness,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[POST /api/prep/:id/practice unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
