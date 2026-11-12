const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { requireAuth, ensureProfile } = require('../middleware/auth');
const { calculateXpAwards, XP_TABLE } = require('../logic/xp');

function addMonths(dateStr, months) {
  const parts = String(dateStr).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setMonth(d.getMonth() + Number(months || 3));
  return d.toISOString().slice(0, 10);
}

// GET /api/intern
router.get('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('applications')
      .select('*, internship:internships(*)')
      .eq('user_id', req.userId)
      .eq('status', 'ACCEPTED_ONBOARDING')
      .maybeSingle();

    if (error) {
      console.error('[GET /api/intern error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    if (!app) {
      return res.json({ active: false });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    // Otomatis ubah logbook yang tanggalnya < hari ini menjadi Approved
    await supabaseAdmin
      .from('daily_logbooks')
      .update({ mentor_status: 'Approved' })
      .eq('application_id', app.id)
      .lt('date', todayStr)
      .eq('mentor_status', 'Reviewed');

    const [{ data: tasks, error: tErr }, { data: logbooks, error: lErr }] = await Promise.all([
      supabaseAdmin
        .from('onboarding_tasks')
        .select('*')
        .eq('application_id', app.id)
        .order('order_no', { ascending: true }),
      supabaseAdmin
        .from('daily_logbooks')
        .select('*')
        .eq('application_id', app.id)
        .order('date', { ascending: false }),
    ]);

    if (tErr || lErr) {
      console.error('[GET /api/intern tasks/logbooks error]', tErr || lErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const year = new Date(app.signed_by_user_at || app.created_at).getFullYear();
    const last4 = String(app.id).replace(/-/g, '').slice(-4).toUpperCase();
    const intern_id = `MH-${year}-${last4}`;

    const startDate = app.internship?.start_date || todayStr;
    const endDate = addMonths(startDate, app.internship?.duration_months || 3);

    return res.json({
      active: true,
      application: app,
      internship: app.internship,
      user: req.userProfile,
      tasks: tasks || [],
      logbooks: logbooks || [],
      intern_id,
      period: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (err) {
    console.error('[GET /api/intern unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// PATCH /api/intern/tasks/:id
router.patch('/tasks/:id', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body || {};

    if (typeof is_completed !== 'boolean') {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Status is_completed harus berupa boolean.',
      });
    }

    // Pastikan task milik aplikasi ACCEPTED_ONBOARDING milik user ini
    const { data: task, error: tErr } = await supabaseAdmin
      .from('onboarding_tasks')
      .select('*, application:applications(user_id)')
      .eq('id', id)
      .maybeSingle();

    if (tErr || !task || task.application?.user_id !== req.userId) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Tugas onboarding tidak ditemukan.',
      });
    }

    const { data: updatedTask, error: updErr } = await supabaseAdmin
      .from('onboarding_tasks')
      .update({ is_completed })
      .eq('id', id)
      .select('*')
      .single();

    if (updErr) {
      console.error('[PATCH /api/intern/tasks/:id error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const { data: allTasks } = await supabaseAdmin
      .from('onboarding_tasks')
      .select('is_completed')
      .eq('application_id', task.application_id);

    const totalTasks = (allTasks || []).length || 1;
    const completedTasks = (allTasks || []).filter((t) => t.is_completed).length;
    const progress_pct = Math.round((completedTasks / totalTasks) * 100);

    const events = is_completed
      ? [{ key: `task:${id}`, amount: Number(task.xp_reward) || 20 }]
      : [];

    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(
      req.userProfile,
      events
    );

    if (xpResult.gained > 0) {
      await supabaseAdmin
        .from('users')
        .update({
          xp_points: updatedXpPoints,
          xp_events: updatedXpEvents,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.userId);
    }

    return res.json({
      task: updatedTask,
      progress_pct,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[PATCH /api/intern/tasks/:id unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/intern/logbooks
router.post('/logbooks', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { date, mood, activity_summary, obstacle } = req.body || {};

    const { data: app } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', req.userId)
      .eq('status', 'ACCEPTED_ONBOARDING')
      .maybeSingle();

    if (!app) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Kamu belum memiliki status magang aktif.',
      });
    }

    const allowedMoods = ['🔥 Semangat', '😊 Lancar', '🤔 Menantang'];
    if (!allowedMoods.includes(mood)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Pilih mood harian yang valid.',
      });
    }

    const cleanSummary = String(activity_summary || '').trim();
    if (cleanSummary.length < 20) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Ringkasan aktivitas harian minimal 20 karakter.',
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const logDate = date || todayStr;
    if (logDate > todayStr) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Tanggal logbook tidak boleh melebihi hari ini.',
      });
    }

    const mentorStatus = logDate < todayStr ? 'Approved' : 'Reviewed';

    const { data: createdLog, error: insErr } = await supabaseAdmin
      .from('daily_logbooks')
      .insert({
        application_id: app.id,
        date: logDate,
        mood,
        activity_summary: cleanSummary,
        obstacle: String(obstacle || '').trim(),
        mentor_status: mentorStatus,
      })
      .select('*')
      .single();

    if (insErr) {
      if (insErr.code === '23505') {
        return res.status(409).json({
          error: 'DUPLICATE_DATE',
          message: `Logbook untuk tanggal ${logDate} sudah pernah diisi.`,
        });
      }
      console.error('[POST /api/intern/logbooks error]', insErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(req.userProfile, [
      { key: `logbook:${logDate}`, amount: XP_TABLE.LOGBOOK_DAILY },
    ]);

    if (xpResult.gained > 0) {
      await supabaseAdmin
        .from('users')
        .update({
          xp_points: updatedXpPoints,
          xp_events: updatedXpEvents,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.userId);
    }

    return res.status(201).json({
      logbook: createdLog,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[POST /api/intern/logbooks unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// DELETE /api/intern/logbooks/:id
router.delete('/logbooks/:id', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: log } = await supabaseAdmin
      .from('daily_logbooks')
      .select('*, application:applications(user_id)')
      .eq('id', id)
      .maybeSingle();

    if (!log || log.application?.user_id !== req.userId) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Entri logbook tidak ditemukan.',
      });
    }

    const { error: delErr } = await supabaseAdmin.from('daily_logbooks').delete().eq('id', id);
    if (delErr) {
      console.error('[DELETE /api/intern/logbooks/:id error]', delErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/intern/logbooks/:id unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
