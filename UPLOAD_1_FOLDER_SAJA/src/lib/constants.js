export const spring = { type: 'spring', stiffness: 260, damping: 22 };

export const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12 },
};

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: spring },
};

export const STATUS_META = {
  SUBMITTED: {
    label: 'Terkirim',
    color: 'brand',
    icon: 'Send',
    badgeClass: 'bg-brand-500/15 text-brand-500 border-brand-500/30',
  },
  DOC_REVIEW: {
    label: 'Review Berkas',
    color: 'warning',
    icon: 'FileSearch',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  },
  INTERVIEW_SCHEDULED: {
    label: 'Jadwal Interview',
    color: 'cyan',
    icon: 'CalendarClock',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
  TEST_SUBMITTED: {
    label: 'Mini Pre-Test',
    color: 'violet',
    icon: 'PenLine',
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  },
  OFFERING_SENT: {
    label: 'Offering Letter',
    color: 'success',
    icon: 'Mail',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  ACCEPTED_ONBOARDING: {
    label: 'Resmi Magang',
    color: 'success',
    icon: 'BadgeCheck',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  REJECTED: {
    label: 'Dibatalkan',
    color: 'danger',
    icon: 'XCircle',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
};

export const PIPELINE_STEPS = [
  { status: 'SUBMITTED', label: 'Terkirim', icon: 'Send' },
  { status: 'DOC_REVIEW', label: 'Review Berkas', icon: 'FileSearch' },
  { status: 'INTERVIEW_SCHEDULED', label: 'Jadwal Interview', icon: 'CalendarClock' },
  { status: 'TEST_SUBMITTED', label: 'Mini Pre-Test', icon: 'PenLine' },
  { status: 'OFFERING_SENT', label: 'Offering Letter', icon: 'Mail' },
  { status: 'ACCEPTED_ONBOARDING', label: 'Resmi Magang', icon: 'BadgeCheck' },
];

export const LEVELS = [
  { lvl: 1, name: 'Pendatang Baru', min: 0 },
  { lvl: 2, name: 'Penjelajah Karier', min: 150 },
  { lvl: 3, name: 'Pejuang Magang', min: 400 },
  { lvl: 4, name: 'Kandidat Unggulan', min: 800 },
  { lvl: 5, name: 'Siap Tempur Magang', min: 1300 },
];

export const DOC_META = {
  CV: {
    label: 'CV ATS-Friendly',
    desc: 'Curriculum Vitae satu kolom standar industri yang mudah dibaca sistem ATS.',
    required: true,
    canGenerate: true,
  },
  SURAT_PENGANTAR: {
    label: 'Surat Pengantar Sekolah/Kampus',
    desc: 'Surat permohonan izin PKL/Magang resmi dari institusi pendidikan.',
    required: true,
    canGenerate: true,
  },
  TRANSKRIP: {
    label: 'Transkrip Nilai / Rapor',
    desc: 'Rekapitulasi nilai akademik semester terakhir (PDF/JPG/PNG atau Link).',
    required: true,
    canGenerate: false,
  },
  KARTU_PELAJAR_KTM: {
    label: 'Kartu Pelajar / KTM',
    desc: 'Bukti identitas aktif sebagai siswa SMK atau mahasiswa.',
    required: true,
    canGenerate: false,
  },
  PORTOFOLIO: {
    label: 'Portofolio Karya',
    desc: 'Kumpulan proyek desain, kode, atau hasil karya terbaikmu.',
    required: false,
    canGenerate: false,
  },
  BPJS: {
    label: 'BPJS Kesehatan / Asuransi',
    desc: 'Kartu jaminan kesehatan atau asuransi keselamatan kerja praktik.',
    required: false,
    canGenerate: false,
  },
};

export const INTERVIEW_TIME_SLOTS = ['09:00', '10:30', '13:00', '14:30', '16:00'];
export const INTERVIEW_METHODS = ['Zoom', 'Google Meet', 'Offline'];
