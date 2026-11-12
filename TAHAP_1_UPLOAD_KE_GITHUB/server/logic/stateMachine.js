const ALLOWED_INTERVIEW_TIMES = ['09:00', '10:30', '13:00', '14:30', '16:00'];
const ALLOWED_INTERVIEW_METHODS = ['Zoom', 'Google Meet', 'Offline'];

const TRANSITIONS = {
  SUBMITTED: {
    action: 'verify',
    next: 'DOC_REVIEW',
  },
  DOC_REVIEW: {
    action: 'schedule',
    next: 'INTERVIEW_SCHEDULED',
    requires: ['interview_date', 'interview_time', 'interview_method'],
  },
  INTERVIEW_SCHEDULED: {
    action: 'submit_test',
    next: 'TEST_SUBMITTED',
    requires: ['test_answer'],
  },
  TEST_SUBMITTED: {
    action: 'issue_offer',
    next: 'OFFERING_SENT',
  },
  OFFERING_SENT: {
    action: 'sign',
    next: 'ACCEPTED_ONBOARDING',
    requires: ['signature_name'],
  },
};

function validateAdvanceTransition(application, action, payload = {}, user) {
  const currentStatus = application.status;
  const rule = TRANSITIONS[currentStatus];

  if (!rule || rule.action !== action) {
    return {
      ok: false,
      httpStatus: 409,
      body: {
        error: 'INVALID_TRANSITION',
        from: currentStatus,
        action,
        message: `Transisi aksi '${action}' tidak valid dari status '${currentStatus}'.`,
      },
    };
  }

  if (action === 'schedule') {
    const { interview_date, interview_time, interview_method } = payload;
    if (!interview_date || !interview_time || !interview_method) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Tanggal, jam, dan metode interview wajib diisi.',
        },
      };
    }

    if (!ALLOWED_INTERVIEW_TIMES.includes(interview_time)) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Jam interview harus salah satu dari slot yang tersedia.',
        },
      };
    }

    if (!ALLOWED_INTERVIEW_METHODS.includes(interview_method)) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Metode interview harus Zoom, Google Meet, atau Offline.',
        },
      };
    }

    // Validasi tanggal >= hari ini + 1 dan bukan Sabtu/Minggu
    const parts = String(interview_date).split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Format tanggal interview tidak valid.',
        },
      };
    }
    const chosenDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (chosenDate < tomorrow) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Tanggal interview minimal mulai besok (H+1).',
        },
      };
    }

    const dayOfWeek = chosenDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Jadwal interview hanya tersedia pada hari kerja (Senin–Jumat).',
        },
      };
    }
  }

  if (action === 'submit_test') {
    const answer = String(payload.test_answer || '').trim();
    if (answer.length < 50) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: 'Jawaban studi kasus minimal 50 karakter.',
        },
      };
    }
  }

  if (action === 'sign') {
    const sig = String(payload.signature_name || '').trim();
    const expected = String(user?.full_name || '').trim();
    if (!sig || sig.toLowerCase() !== expected.toLowerCase()) {
      return {
        ok: false,
        httpStatus: 400,
        body: {
          error: 'VALIDATION',
          message: `Tanda tangan harus sama persis dengan nama lengkapmu (${expected}).`,
        },
      };
    }
  }

  return {
    ok: true,
    nextStatus: rule.next,
  };
}

module.exports = {
  TRANSITIONS,
  ALLOWED_INTERVIEW_TIMES,
  ALLOWED_INTERVIEW_METHODS,
  validateAdvanceTransition,
};
