const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { requireAuth, ensureProfile } = require('../middleware/auth');
const { computeMatch } = require('../logic/matching');
const { validateAdvanceTransition } = require('../logic/stateMachine');
const { generateOfferNo } = require('../logic/generators');
const { calculateXpAwards, XP_TABLE } = require('../logic/xp');
const { ONBOARDING_TASK_TEMPLATES } = require('../seedData');

// GET /api/applications
router.get('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { data: apps, error } = await supabaseAdmin
      .from('applications')
      .select('*, internship:internships(*)')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[GET /api/applications error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    return res.json(apps || []);
  } catch (err) {
    console.error('[GET /api/applications unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// GET /api/applications/:id
router.get('/:id', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('applications')
      .select('*, internship:internships(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/applications/:id error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    if (!app) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Data lamaran tidak ditemukan.',
      });
    }

    return res.json({
      ...app,
      user: req.userProfile,
    });
  } catch (err) {
    console.error('[GET /api/applications/:id unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/applications
router.post('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { internship_id, cover_letter, available_start_date, commitment } = req.body || {};
    const user = req.userProfile;

    if (!internship_id) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'ID lowongan wajib disertakan.',
      });
    }

    // Ambil detail lowongan
    const { data: internship, error: intErr } = await supabaseAdmin
      .from('internships')
      .select('*')
      .eq('id', internship_id)
      .maybeSingle();

    if (intErr || !internship) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Lowongan magang tidak ditemukan.',
      });
    }

    // 1. Cek apakah user sudah punya aplikasi ACCEPTED_ONBOARDING
    const { data: acceptedApp } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', req.userId)
      .eq('status', 'ACCEPTED_ONBOARDING')
      .maybeSingle();

    if (acceptedApp) {
      return res.status(409).json({
        error: 'ALREADY_INTERNING',
        message: 'Kamu sudah berstatus Resmi Magang aktif dan tidak bisa melamar lagi.',
      });
    }

    // 2. Cek apakah sudah ada aplikasi aktif ke lowongan yang sama
    const { data: existingActive } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', req.userId)
      .eq('internship_id', internship_id)
      .neq('status', 'REJECTED')
      .maybeSingle();

    if (existingActive) {
      return res.status(409).json({
        error: 'ALREADY_APPLIED',
        message: 'Kamu sudah memiliki lamaran aktif pada lowongan ini.',
      });
    }

    // 3. Cek kelengkapan dokumen wajib lowongan
    const { data: userDocs } = await supabaseAdmin
      .from('user_documents')
      .select('doc_type, is_verified')
      .eq('user_id', req.userId);

    const verifiedSet = new Set(
      (userDocs || []).filter((d) => d.is_verified).map((d) => d.doc_type)
    );
    const missingDocs = (internship.required_docs || []).filter((d) => !verifiedSet.has(d));

    if (missingDocs.length > 0) {
      return res.status(422).json({
        error: 'MISSING_DOCS',
        missing: missingDocs,
        message: `Berkas wajib belum lengkap: ${missingDocs.join(', ')}`,
      });
    }

    // 4. Validasi input form
    const cleanCover = String(cover_letter || '').trim();
    if (cleanCover.length < 100) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Cover letter minimal harus terdiri dari 100 karakter.',
      });
    }

    if (!available_start_date || isNaN(Date.parse(available_start_date))) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Tanggal siap mulai tidak valid.',
      });
    }

    if (commitment !== true) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Kamu wajib mencentang pernyataan komitmen magang.',
      });
    }

    // 5. Ambil kuota secara atomik via RPC take_quota
    const { data: quotaTaken, error: rpcErr } = await supabaseAdmin.rpc('take_quota', {
      p_internship_id: internship_id,
    });

    if (rpcErr) {
      console.error('[take_quota rpc error]', rpcErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan saat memproses kuota lowongan.',
      });
    }

    if (!quotaTaken) {
      return res.status(409).json({
        error: 'QUOTA_FULL',
        message: 'Maaf, kuota lowongan magang ini sudah penuh.',
      });
    }

    const match = computeMatch(user, internship);
    const nowIso = new Date().toISOString();

    const newAppPayload = {
      user_id: req.userId,
      internship_id,
      status: 'SUBMITTED',
      match_score: match.score,
      cover_letter: cleanCover,
      available_start_date,
      history: [{ status: 'SUBMITTED', at: nowIso }],
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data: createdApp, error: insErr } = await supabaseAdmin
      .from('applications')
      .insert(newAppPayload)
      .select('*, internship:internships(*)')
      .single();

    if (insErr) {
      // Kembalikan kuota jika insert gagal
      await supabaseAdmin.rpc('return_quota', { p_internship_id: internship_id });

      if (insErr.code === '23505') {
        return res.status(409).json({
          error: 'ALREADY_APPLIED',
          message: 'Kamu sudah melamar ke lowongan ini.',
        });
      }

      console.error('[POST /api/applications insert error]', insErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    // Award XP first_apply + apply:<internship_id>
    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(user, [
      { key: 'first_apply', amount: XP_TABLE.FIRST_APPLY },
      { key: `apply:${internship_id}`, amount: XP_TABLE.APPLY },
    ]);

    await supabaseAdmin
      .from('users')
      .update({
        xp_points: updatedXpPoints,
        xp_events: updatedXpEvents,
        updated_at: nowIso,
      })
      .eq('id', req.userId);

    return res.status(201).json({
      application: createdApp,
      xp: xpResult,
    });
  } catch (err) {
    console.error('[POST /api/applications unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/applications/:id/advance
router.post('/:id/advance', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, ...payload } = req.body || {};
    const user = req.userProfile;

    const { data: app, error: selErr } = await supabaseAdmin
      .from('applications')
      .select('*, internship:internships(*)')
      .eq('id', id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (selErr || !app) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Lamaran tidak ditemukan.',
      });
    }

    const validation = validateAdvanceTransition(app, action, payload, user);
    if (!validation.ok) {
      return res.status(validation.httpStatus).json(validation.body);
    }

    const nowIso = new Date().toISOString();
    const history = Array.isArray(app.history) ? [...app.history] : [];
    const updates = { updated_at: nowIso };
    const xpEvents = [];
    let celebrate = false;

    if (action === 'verify') {
      updates.status = 'DOC_REVIEW';
      history.push({ status: 'DOC_REVIEW', at: nowIso });
      xpEvents.push({ key: `stage:${id}:DOC_REVIEW`, amount: XP_TABLE.STAGE_ADVANCE });
    } else if (action === 'schedule') {
      updates.status = 'INTERVIEW_SCHEDULED';
      updates.interview_date = payload.interview_date;
      updates.interview_time = payload.interview_time;
      updates.interview_method = payload.interview_method;
      history.push({ status: 'INTERVIEW_SCHEDULED', at: nowIso });
      xpEvents.push({ key: `stage:${id}:INTERVIEW_SCHEDULED`, amount: XP_TABLE.STAGE_ADVANCE });
    } else if (action === 'submit_test') {
      // Berantai otomatis: TEST_SUBMITTED -> OFFERING_SENT
      const cleanAnswer = String(payload.test_answer || '').trim();
      const t1 = new Date().toISOString();
      const t2 = new Date(Date.now() + 500).toISOString();

      const { count } = await supabaseAdmin
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .not('offering_letter_no', 'is', null);

      const seq = (count || 0) + 1 + Math.floor(Math.random() * 90);
      const offerNo = generateOfferNo(app.internship?.company_name || 'MGH', seq);

      updates.test_answer = cleanAnswer;
      updates.offering_letter_no = offerNo;
      updates.status = 'OFFERING_SENT';

      history.push({ status: 'TEST_SUBMITTED', at: t1 });
      history.push({ status: 'OFFERING_SENT', at: t2 });

      xpEvents.push({ key: `stage:${id}:TEST_SUBMITTED`, amount: XP_TABLE.STAGE_ADVANCE });
      xpEvents.push({ key: `stage:${id}:OFFERING_SENT`, amount: XP_TABLE.STAGE_ADVANCE });
    } else if (action === 'sign') {
      // Cek apakah user sudah punya aplikasi ACCEPTED_ONBOARDING lain
      const { data: existingAccepted } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('user_id', req.userId)
        .eq('status', 'ACCEPTED_ONBOARDING')
        .neq('id', id)
        .maybeSingle();

      if (existingAccepted) {
        return res.status(409).json({
          error: 'ALREADY_INTERNING',
          message: 'Kamu sudah menerima tawaran magang di tempat lain.',
        });
      }

      updates.status = 'ACCEPTED_ONBOARDING';
      updates.signature_name = String(payload.signature_name).trim();
      updates.signed_by_user_at = nowIso;
      history.push({ status: 'ACCEPTED_ONBOARDING', at: nowIso });
      celebrate = true;

      xpEvents.push({ key: `stage:${id}:ACCEPTED_ONBOARDING`, amount: XP_TABLE.STAGE_ADVANCE });
      xpEvents.push({ key: `accepted:${id}`, amount: XP_TABLE.ACCEPTED });
    }

    updates.history = history;

    const { data: updatedApp, error: updErr } = await supabaseAdmin
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select('*, internship:internships(*)')
      .single();

    if (updErr) {
      if (updErr.code === '23505') {
        return res.status(409).json({
          error: 'ALREADY_INTERNING',
          message: 'Kamu hanya dapat memiliki 1 status magang aktif.',
        });
      }
      console.error('[POST /api/applications/:id/advance error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    // Jika baru saja sign (ACCEPTED_ONBOARDING):
    // 1. Buat 6 onboarding_tasks
    // 2. Batalkan aplikasi lain yang masih aktif & kembalikan kuotanya
    if (action === 'sign') {
      const tasksPayload = ONBOARDING_TASK_TEMPLATES.map((t) => ({
        application_id: id,
        task_title: t.task_title,
        category: t.category,
        xp_reward: t.xp_reward,
        is_completed: false,
        order_no: t.order_no,
      }));

      await supabaseAdmin.from('onboarding_tasks').insert(tasksPayload);

      const { data: otherApps } = await supabaseAdmin
        .from('applications')
        .select('id, internship_id, history')
        .eq('user_id', req.userId)
        .neq('id', id)
        .neq('status', 'REJECTED');

      if (otherApps && otherApps.length > 0) {
        for (const other of otherApps) {
          const otherHist = Array.isArray(other.history) ? [...other.history] : [];
          otherHist.push({ status: 'REJECTED', at: nowIso });
          await supabaseAdmin
            .from('applications')
            .update({
              status: 'REJECTED',
              reject_reason: 'Mengundurkan diri – sudah menerima tawaran lain',
              history: otherHist,
              updated_at: nowIso,
            })
            .eq('id', other.id);

          await supabaseAdmin.rpc('return_quota', { p_internship_id: other.internship_id });
        }
      }
    }

    const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(user, xpEvents);
    await supabaseAdmin
      .from('users')
      .update({
        xp_points: updatedXpPoints,
        xp_events: updatedXpEvents,
        updated_at: nowIso,
      })
      .eq('id', req.userId);

    return res.json({
      application: updatedApp,
      xp: xpResult,
      celebrate,
    });
  } catch (err) {
    console.error('[POST /api/applications/:id/advance unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/applications/:id/withdraw
router.post('/:id/withdraw', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: app, error: selErr } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (selErr || !app) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Lamaran tidak ditemukan.',
      });
    }

    if (app.status === 'ACCEPTED_ONBOARDING' || app.status === 'REJECTED') {
      return res.status(409).json({
        error: 'INVALID_TRANSITION',
        from: app.status,
        action: 'withdraw',
        message: 'Lamaran ini tidak dapat dibatalkan.',
      });
    }

    const nowIso = new Date().toISOString();
    const history = Array.isArray(app.history) ? [...app.history] : [];
    history.push({ status: 'REJECTED', at: nowIso });

    const { data: updatedApp, error: updErr } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'REJECTED',
        reject_reason: 'Dibatalkan oleh pelamar',
        history,
        updated_at: nowIso,
      })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select('*, internship:internships(*)')
      .single();

    if (updErr) {
      console.error('[POST /api/applications/:id/withdraw error]', updErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    await supabaseAdmin.rpc('return_quota', { p_internship_id: app.internship_id });

    return res.json({ application: updatedApp });
  } catch (err) {
    console.error('[POST /api/applications/:id/withdraw unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
