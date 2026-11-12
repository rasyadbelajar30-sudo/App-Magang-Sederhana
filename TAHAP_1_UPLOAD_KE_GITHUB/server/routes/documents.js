const express = require('express');
const multer = require('multer');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { requireAuth, ensureProfile } = require('../middleware/auth');
const { computeReadiness } = require('../logic/readiness');
const { calculateXpAwards, XP_TABLE } = require('../logic/xp');
const { generateCV, generateSuratPengantar } = require('../logic/generators');

const DOC_SLOTS = [
  { doc_type: 'CV', label: 'CV ATS-Friendly', required: true },
  { doc_type: 'SURAT_PENGANTAR', label: 'Surat Pengantar Sekolah/Kampus', required: true },
  { doc_type: 'TRANSKRIP', label: 'Transkrip Nilai / Rapor', required: true },
  { doc_type: 'KARTU_PELAJAR_KTM', label: 'Kartu Pelajar / KTM', required: true },
  { doc_type: 'PORTOFOLIO', label: 'Portofolio Karya', required: false },
  { doc_type: 'BPJS', label: 'BPJS Kesehatan / Asuransi', required: false },
];

const ALLOWED_DOC_TYPES = DOC_SLOTS.map((d) => d.doc_type);
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

async function refreshUserReadinessAndXp(userId, userProfile, docTypeForXp = null) {
  const [{ data: docs, error: docErr }, { data: practices, error: pracErr }] = await Promise.all([
    supabaseAdmin.from('user_documents').select('*').eq('user_id', userId),
    supabaseAdmin.from('user_prep_practice').select('*').eq('user_id', userId),
  ]);
  if (docErr || pracErr) throw docErr || pracErr;

  const readiness = computeReadiness(userProfile, docs || [], practices || []);
  const events = docTypeForXp ? [{ key: `doc:${docTypeForXp}`, amount: XP_TABLE.DOC_SAVED }] : [];
  const { xpResult, updatedXpPoints, updatedXpEvents } = calculateXpAwards(userProfile, events);

  await supabaseAdmin
    .from('users')
    .update({
      readiness_score: readiness.score,
      xp_points: updatedXpPoints,
      xp_events: updatedXpEvents,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { readiness, xp: xpResult };
}

// GET /api/documents
router.get('/', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { data: docs, error } = await supabaseAdmin
      .from('user_documents')
      .select('*')
      .eq('user_id', req.userId);

    if (error) {
      console.error('[GET /api/documents error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const docMap = new Map((docs || []).map((d) => [d.doc_type, d]));
    const result = DOC_SLOTS.map((slot) => ({
      doc_type: slot.doc_type,
      label: slot.label,
      required: slot.required,
      doc: docMap.get(slot.doc_type) || null,
    }));

    return res.json(result);
  } catch (err) {
    console.error('[GET /api/documents unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// POST /api/documents/generate
router.post('/generate', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { doc_type } = req.body;
    if (!['CV', 'SURAT_PENGANTAR'].includes(doc_type)) {
      return res.status(400).json({
        error: 'VALIDATION',
        message: 'Generator otomatis hanya mendukung CV atau SURAT_PENGANTAR.',
      });
    }

    const user = req.userProfile;
    const htmlContent = doc_type === 'CV' ? generateCV(user) : generateSuratPengantar(user);
    const docName =
      doc_type === 'CV'
        ? `CV_${(user.full_name || 'Peserta').replace(/\s+/g, '_')}.html`
        : `Surat_Pengantar_${(user.full_name || 'Peserta').replace(/\s+/g, '_')}.html`;

    const payload = {
      user_id: req.userId,
      doc_type,
      doc_name: docName,
      source: 'generated',
      content_html: htmlContent,
      storage_path: null,
      external_url: null,
      mime_type: 'text/html',
      is_verified: true,
      updated_at: new Date().toISOString(),
    };

    const { data: savedDoc, error: upErr } = await supabaseAdmin
      .from('user_documents')
      .upsert(payload, { onConflict: 'user_id,doc_type' })
      .select('*')
      .single();

    if (upErr) {
      console.error('[POST /api/documents/generate error]', upErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const { readiness, xp } = await refreshUserReadinessAndXp(req.userId, user, doc_type);
    return res.json({ document: savedDoc, readiness, xp });
  } catch (err) {
    console.error('[POST /api/documents/generate unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// PUT /api/documents/:doc_type
router.put(
  '/:doc_type',
  requireAuth,
  ensureProfile,
  (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      upload.single('file')(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            error: 'VALIDATION',
            message:
              err.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran file maksimal 2MB.'
                : 'Gagal memproses file unggahan.',
          });
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    try {
      const { doc_type } = req.params;
      if (!ALLOWED_DOC_TYPES.includes(doc_type)) {
        return res.status(400).json({
          error: 'VALIDATION',
          message: 'Tipe dokumen tidak valid.',
        });
      }

      // Cek dokumen lama untuk hapus file storage lama jika ada
      const { data: existingDoc } = await supabaseAdmin
        .from('user_documents')
        .select('*')
        .eq('user_id', req.userId)
        .eq('doc_type', doc_type)
        .maybeSingle();

      let payload;

      if (req.file) {
        if (!ALLOWED_MIME.includes(req.file.mimetype)) {
          return res.status(400).json({
            error: 'VALIDATION',
            message: 'Format file harus PDF, JPG, atau PNG.',
          });
        }

        const extMap = {
          'application/pdf': 'pdf',
          'image/jpeg': 'jpg',
          'image/png': 'png',
        };
        const ext = extMap[req.file.mimetype] || 'bin';
        const storagePath = `${req.userId}/${doc_type}-${Date.now()}.${ext}`;

        const { error: storageErr } = await supabaseAdmin.storage
          .from('documents')
          .upload(storagePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (storageErr) {
          console.error('[Supabase Storage upload error]', storageErr);
          return res.status(500).json({
            error: 'DB_ERROR',
            message: 'Gagal mengunggah file ke Supabase Storage.',
          });
        }

        if (existingDoc && existingDoc.storage_path) {
          await supabaseAdmin.storage.from('documents').remove([existingDoc.storage_path]);
        }

        payload = {
          user_id: req.userId,
          doc_type,
          doc_name: req.file.originalname || `${doc_type}.${ext}`,
          source: 'upload',
          content_html: null,
          storage_path: storagePath,
          external_url: null,
          mime_type: req.file.mimetype,
          is_verified: true,
          updated_at: new Date().toISOString(),
        };
      } else {
        const { doc_name, source, external_url } = req.body || {};
        if (source !== 'link' || !external_url || !String(external_url).startsWith('https://')) {
          return res.status(400).json({
            error: 'VALIDATION',
            message: 'Tautan dokumen wajib diawali dengan https://',
          });
        }

        if (existingDoc && existingDoc.storage_path) {
          await supabaseAdmin.storage.from('documents').remove([existingDoc.storage_path]);
        }

        payload = {
          user_id: req.userId,
          doc_type,
          doc_name: String(doc_name || `Tautan ${doc_type}`).trim(),
          source: 'link',
          content_html: null,
          storage_path: null,
          external_url: String(external_url).trim(),
          mime_type: 'text/uri-list',
          is_verified: true,
          updated_at: new Date().toISOString(),
        };
      }

      const { data: savedDoc, error: upErr } = await supabaseAdmin
        .from('user_documents')
        .upsert(payload, { onConflict: 'user_id,doc_type' })
        .select('*')
        .single();

      if (upErr) {
        console.error('[PUT /api/documents/:doc_type error]', upErr);
        return res.status(500).json({
          error: 'DB_ERROR',
          message: 'Terjadi kesalahan database, coba lagi',
        });
      }

      const { readiness, xp } = await refreshUserReadinessAndXp(
        req.userId,
        req.userProfile,
        doc_type
      );

      return res.json({ document: savedDoc, readiness, xp });
    } catch (err) {
      console.error('[PUT /api/documents/:doc_type unexpected]', err);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }
  }
);

// GET /api/documents/:doc_type/url
router.get('/:doc_type/url', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { doc_type } = req.params;
    const { data: doc, error } = await supabaseAdmin
      .from('user_documents')
      .select('*')
      .eq('user_id', req.userId)
      .eq('doc_type', doc_type)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/documents/:doc_type/url error]', error);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    if (!doc) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Dokumen belum tersedia.',
      });
    }

    if (doc.source === 'generated') {
      return res.json({ html: doc.content_html, source: 'generated', doc_name: doc.doc_name });
    }

    if (doc.source === 'link') {
      return res.json({ url: doc.external_url, source: 'link', doc_name: doc.doc_name });
    }

    if (doc.source === 'upload' && doc.storage_path) {
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 600);

      if (signErr || !signed) {
        console.error('[createSignedUrl error]', signErr);
        return res.status(500).json({
          error: 'DB_ERROR',
          message: 'Gagal membuat tautan pratinjau dokumen.',
        });
      }

      return res.json({
        url: signed.signedUrl,
        source: 'upload',
        mime_type: doc.mime_type,
        doc_name: doc.doc_name,
      });
    }

    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Isi dokumen tidak ditemukan.',
    });
  } catch (err) {
    console.error('[GET /api/documents/:doc_type/url unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

// DELETE /api/documents/:doc_type
router.delete('/:doc_type', requireAuth, ensureProfile, async (req, res) => {
  try {
    const { doc_type } = req.params;
    const { data: existingDoc } = await supabaseAdmin
      .from('user_documents')
      .select('*')
      .eq('user_id', req.userId)
      .eq('doc_type', doc_type)
      .maybeSingle();

    if (existingDoc && existingDoc.storage_path) {
      await supabaseAdmin.storage.from('documents').remove([existingDoc.storage_path]);
    }

    const { error: delErr } = await supabaseAdmin
      .from('user_documents')
      .delete()
      .eq('user_id', req.userId)
      .eq('doc_type', doc_type);

    if (delErr) {
      console.error('[DELETE /api/documents/:doc_type error]', delErr);
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Terjadi kesalahan database, coba lagi',
      });
    }

    const { readiness } = await refreshUserReadinessAndXp(req.userId, req.userProfile, null);
    return res.json({ ok: true, readiness });
  } catch (err) {
    console.error('[DELETE /api/documents/:doc_type unexpected]', err);
    return res.status(500).json({
      error: 'DB_ERROR',
      message: 'Terjadi kesalahan database, coba lagi',
    });
  }
});

module.exports = router;
