// Standar Kualifikasi & Requirement Magang Asli (Real-World Industry Benchmark)
// Digunakan pada Halaman Detail Lowongan & Bedah AI setelah melamar kerja

export const REAL_INTERNSHIP_STANDARDS = {
  in_01: {
    academic: 'Mahasiswa S1/D4 Teknik Informatika, Ilmu Komputer, atau Sistem Informasi (min. Semester 5, IPK ≥ 3.20)',
    tools_and_tech: ['React.js (Hooks & Context)', 'JavaScript (ES6+)', 'HTML5 & Tailwind/CSS3', 'Git & GitHub PR Workflow', 'REST API / Fetch & Chrome DevTools'],
    portfolio_must_have: [
      'Minimal 2 proyek web interaktif berbasis React yang sudah di-deploy (Vercel/Netlify) beserta link repositori GitHub.',
      'Contoh implementasi pemanggilan REST API, state management, dan tampilan responsif mobile-first.',
    ],
    real_selection_flow: 'Screening CV ATS & Portofolio GitHub → Online Coding Test (HackerRank JavaScript/React) → Technical Interview dengan Senior Engineer → HR Offering.',
    cv_ats_keywords: ['React.js', 'Component Lifecycle', 'Web Performance', 'Responsive UI', 'Git Flow'],
  },
  in_02: {
    academic: 'Mahasiswa S1/D4 Desain Komunikasi Visual (DKV), Sistem Informasi, atau Ilmu Komputer (min. Semester 5, IPK ≥ 3.10)',
    tools_and_tech: ['Figma (Auto Layout, Variants & Component Properties)', 'Interactive Prototyping', 'Design System (Asphalt Gojek)', 'Usability Testing & Maze', 'Wireframing & User Flow'],
    portfolio_must_have: [
      'Minimal 2 studi kasus (Case Study) UI/UX lengkap dari latar belakang masalah, riset pengguna, wireframe, hingga high-fidelity prototype di Figma.',
      'Menjelaskan alasan di balik keputusan desain (bukan sekadar gambar tampilan akhir).',
    ],
    real_selection_flow: 'Review CV & Portofolio Studi Kasus → Design Challenge (Take-Home Assignment) → Presentasi Desain & User Interview → HR Offering.',
    cv_ats_keywords: ['Figma', 'User Research', 'Usability Testing', 'Design System', 'High-Fidelity Prototype'],
  },
  in_03: {
    academic: 'Siswa SMK Akuntansi & Keuangan Lembaga (Kelas XI/XII, Nilai Rapor ≥ 82) atau Mahasiswa D3/S1 Akuntansi/Manajemen Keuangan (IPK ≥ 3.25)',
    tools_and_tech: ['Microsoft Excel (VLOOKUP/XLOOKUP, Pivot Table, IF Bertingkat)', 'Jurnal Umum & Buku Besar', 'Rekonsiliasi Bank', 'Verifikasi Bukti Transaksi & Invoice', 'Ketelitian & Kerahasiaan Data Perbankan'],
    portfolio_must_have: [
      'pengalaman praktik pembukuan/laporan keuangan sekolah atau kampus (neraca lajur, laba rugi, arus kas).',
      'Sertifikat uji kompetensi akuntansi (KKNI/LSP) atau sertifikasi Microsoft Excel nilai tambah besar.',
    ],
    real_selection_flow: 'Seleksi Administrasi & Transkrip Nilai → Tes Kemampuan Dasar & Excel Akuntansi → Wawancara HRD & Supervisor Finance → Penempatan.',
    cv_ats_keywords: ['Rekonsiliasi Bank', 'Laporan Keuangan', 'Pivot Table', 'VLOOKUP', 'Jurnal Akuntansi'],
  },
  in_04: {
    academic: 'Siswa SMK Teknik Bisnis Sepeda Motor (TBSM) atau Teknik Kendaraan Ringan Otomotif (TKRO) Kelas XI/XII (Nilai Praktik ≥ 80)',
    tools_and_tech: ['Servis Berkala & Tune-Up Mesin', 'Sistem Injeksi PGM-FI & Scanner', 'Penggunaan Alat Ukur (Jangka Sorong, Multitester, Kunci Torsi)', 'Prosedur K3 Bengkel & Budaya 5R', 'Membaca Manual Book & Gambar Teknik'],
    portfolio_must_have: [
      'Rekap nilai praktik bengkel sekolah (bongkar-pasang mesin, kelistrikan dasar, dan pengereman).',
      'Surat Pengantar resmi dari BKK SMK dan perlindungan BPJS Ketenagakerjaan siswa PKL.',
    ],
    real_selection_flow: 'Verifikasi Surat Pengantar BKK SMK & Rapor → Tes Teori Dasar Otomotif & K3 → Praktik Pengenalan Alat Bengkel → Penempatan Training Center.',
    cv_ats_keywords: ['Servis Berkala', 'Injeksi PGM-FI', 'K3 Bengkel', 'Budaya 5R', 'Alat Ukur Otomotif'],
  },
  in_05: {
    academic: 'Siswa SMK Teknik Komputer dan Jaringan (TKJ) atau Sistem Informasi Jaringan & Aplikasi (SIJA) Kelas XI/XII (Nilai Produktif ≥ 80)',
    tools_and_tech: ['Konfigurasi Router MikroTik (Winbox, DHCP, NAT, Firewall, Bandwidth Limiter)', 'Crimping Kabel UTP (Straight/Cross) & Dasar Fiber Optik', 'TCP/IP, Subnetting & VLAN', 'Troubleshooting Jaringan LAN/WLAN'],
    portfolio_must_have: [
      'Pengalaman praktik laboratorium TKJ (topologi jaringan Cisco Packet Tracer / konfigurasi MikroTik dasar).',
      'Sertifikat kursus jaringan dasar (MTCNA/Cisco Networking Academy) jika ada.',
    ],
    real_selection_flow: 'Verifikasi Berkas PKL Sekolah → Tes Dasar Subnetting & Troubleshooting Jaringan → Wawancara Pembimbing Lapangan → Penempatan STO Telkom.',
    cv_ats_keywords: ['MikroTik Winbox', 'TCP/IP Subnetting', 'Instalasi LAN/Fiber Optik', 'Troubleshooting Jaringan'],
  },
  in_06: {
    academic: 'Siswa SMK Pemasaran/Bisnis Digital atau Mahasiswa D3/S1 Ilmu Komunikasi, Marketing, atau Manajemen (Semester 5+, IPK ≥ 3.10)',
    tools_and_tech: ['Content Planning Instagram & TikTok', 'Copywriting & Hook Writing (AIDA/PAS)', 'Canva / CapCut Video Editing', 'Google Analytics 4 & Meta Business Suite', 'Riset Tren & Kompetitor'],
    portfolio_must_have: [
      'Portofolio contoh konten media sosial (poster Canva, video pendek Reels/TikTok, atau tulisan copywriting) yang pernah dibuat.',
      'Data hasil performa konten (views, engagement rate, atau pertumbuhan pengikut) jika pernah mengelola akun organisasi/pribadi.',
    ],
    real_selection_flow: 'Screening CV & Portofolio Kreatif → Tes Buat Ide Kampanye Singkat → Wawancara Tim Growth Marketing → Offering.',
    cv_ats_keywords: ['Content Pillar', 'Copywriting', 'Engagement Rate', 'Google Analytics', 'Social Media Campaign'],
  },
  in_07: {
    academic: 'Mahasiswa S1 Statistika, Matematika, Ilmu Komputer, Sistem Informasi, atau Teknik Industri (Semester 5+, IPK ≥ 3.25)',
    tools_and_tech: ['SQL (JOIN, CTE, Window Functions)', 'Python (Pandas, NumPy, Matplotlib)', 'Dashboarding (Looker Studio / Tableau / Power BI)', 'Microsoft Excel / Google Sheets Lanjutan', 'Exploratory Data Analysis (EDA)'],
    portfolio_must_have: [
      'Minimal 1–2 proyek analisis data di GitHub/Kaggle atau dashboard interaktif yang menampilkan insight bisnis dari dataset nyata.',
      'Kemampuan menerjemahkan angka statistik menjadi rekomendasi bisnis yang mudah dipahami.',
    ],
    real_selection_flow: 'Screening CV → Tes Query SQL & Studi Kasus Data → Wawancara User (Lead Data Analyst) → Offering.',
    cv_ats_keywords: ['SQL Query', 'Python Pandas', 'Data Visualization', 'Business Insight', 'Cohort Analysis'],
  },
};

export function getRealInternshipStandard(job) {
  if (!job) return null;
  if (REAL_INTERNSHIP_STANDARDS[job.id]) {
    return REAL_INTERNSHIP_STANDARDS[job.id];
  }

  const skills = Array.isArray(job.required_skills) && job.required_skills.length > 0
    ? job.required_skills
    : ['Komunikasi Profesional', 'Kerja Tim', 'Microsoft Office'];
  const isSmk = job.education_target === 'SMK';

  return {
    academic: isSmk
      ? `Siswa SMK jurusan terkait ${job.role_title} (Kelas XI/XII, Nilai Rapor Produktif ≥ 80)`
      : `Mahasiswa D3/D4/S1 jurusan relevan untuk posisi ${job.role_title} (min. Semester 5, IPK ≥ 3.15)`,
    tools_and_tech: skills.map((s) => `${s} (Standar Industri ${job.company_name})`),
    portfolio_must_have: [
      `Minimal 1–2 bukti proyek/praktik nyata yang menerapkan keahlian ${skills.slice(0, 3).join(', ')}.`,
      `CV ATS-Friendly yang merinci kontribusi dan hasil terukur pada kegiatan sekolah/kampus.`,
    ],
    real_selection_flow: `Screening Administrasi & CV ATS → Tes Kompetensi Teknis (${skills.slice(0, 2).join(' & ')}) → Wawancara HRD & Mentor (${job.mentor_name || 'Supervisor'}) → Penerbitan LoA.`,
    cv_ats_keywords: skills,
  };
}
