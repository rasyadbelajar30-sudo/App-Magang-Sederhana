-- ===== supabase/seed.sql =====
-- INSERT 10 internships + 12 prep_questions (on conflict do update)

insert into public.internships (
  id, company_name, company_logo, company_theme_color, company_industry, company_address,
  role_title, education_target, work_type, city, duration_months, is_paid, stipend_amount,
  quota, required_skills, required_docs, description, responsibilities,
  mentor_name, mentor_role, case_study_question, start_date
) values
(
  'in_01', 'Tokopedia', '🟢', '#03AC0E', 'E-Commerce',
  'Tokopedia Tower, Jl. Prof. Dr. Satrio Kav. 11, Jakarta Selatan',
  'Frontend Engineer Intern', 'Mahasiswa', 'Hybrid', 'Jakarta', 6, true, 3500000,
  4,
  array['React','JavaScript','HTML','CSS','Git'],
  array['CV','SURAT_PENGANTAR','TRANSKRIP','PORTOFOLIO'],
  'Bergabung dengan tim Buyer Experience untuk membangun fitur halaman produk yang dipakai jutaan pengguna setiap hari. Kamu akan belajar standar kode produksi, code review, dan performa web bersama engineer senior.',
  array[
    'Mengembangkan komponen UI menggunakan React sesuai desain Figma.',
    'Memperbaiki bug dan meningkatkan performa halaman web.',
    'Mengikuti code review dan sprint planning mingguan bersama tim.'
  ],
  'Andi Wijaya', 'Senior Frontend Engineer',
  'Halaman daftar produk lambat saat memuat 1.000 item. Jelaskan 2 teknik optimasi di React yang akan kamu terapkan dan alasannya.',
  '2027-01-04'
),
(
  'in_02', 'Gojek', '🛵', '#00AA13', 'Teknologi / Super App',
  'Pasaraya Blok M Gedung B, Jl. Iskandarsyah II No. 7, Jakarta Selatan',
  'UI/UX Designer Intern', 'Mahasiswa', 'WFH', 'Jakarta', 4, true, 3000000,
  3,
  array['Figma','UI Design','User Research','Prototyping'],
  array['CV','PORTOFOLIO','SURAT_PENGANTAR'],
  'Bantu tim desain GoFood merancang pengalaman memesan makanan yang lebih cepat dan mudah. Kamu akan terlibat dari riset pengguna sampai prototipe yang siap diuji.',
  array[
    'Membuat wireframe, mockup, dan prototipe interaktif di Figma.',
    'Melakukan wawancara dan usability testing dengan pengguna.',
    'Menjaga konsistensi komponen di design system.'
  ],
  'Sarah Putri', 'Lead Product Designer',
  'Pengguna mengeluh tombol ''Pesan'' sulit ditemukan di aplikasi. Jelaskan langkah riset dan perbaikan desain yang akan kamu lakukan.',
  '2027-01-04'
),
(
  'in_03', 'Bank Central Asia', '🏦', '#0060AF', 'Perbankan',
  'Menara BCA, Grand Indonesia, Jl. M.H. Thamrin No. 1, Jakarta Pusat',
  'Accounting & Finance Intern', 'Semua', 'WFO', 'Jakarta', 6, true, 2800000,
  5,
  array['Microsoft Excel','Akuntansi Dasar','Ketelitian','Laporan Keuangan'],
  array['CV','SURAT_PENGANTAR','TRANSKRIP','KARTU_PELAJAR_KTM'],
  'Dukung divisi Finance dalam pencatatan dan pelaporan keuangan harian kantor pusat. Program ini terbuka untuk siswa SMK Akuntansi maupun mahasiswa Akuntansi/Manajemen.',
  array[
    'Menginput dan memverifikasi transaksi harian di Microsoft Excel.',
    'Membantu rekonsiliasi bank dan penyusunan laporan bulanan.',
    'Mengarsipkan dokumen keuangan secara rapi dan sesuai SOP.'
  ],
  'Budi Santoso', 'Finance Supervisor',
  'Saldo kas di laporan berbeda Rp250.000 dengan rekening koran. Jelaskan langkah rekonsiliasi untuk menemukan selisihnya.',
  '2027-01-04'
),
(
  'in_04', 'Astra Honda Motor', '🏍️', '#E3001B', 'Otomotif / Manufaktur',
  'Jl. Raya Pegangsaan Dua Km 2,2, Kelapa Gading — Training Center Cikarang, Bekasi',
  'Teknisi Mesin Otomotif (PKL)', 'SMK', 'WFO', 'Bekasi', 3, true, 1500000,
  8,
  array['Mesin Otomotif','K3','Membaca Gambar Teknik','Kerja Tim'],
  array['CV','SURAT_PENGANTAR','KARTU_PELAJAR_KTM','BPJS'],
  'Program Praktik Kerja Lapangan untuk siswa SMK Teknik Kendaraan Ringan/Sepeda Motor di bengkel training resmi. Kamu akan praktik langsung servis dan perawatan sepeda motor dengan standar K3 industri.',
  array[
    'Membantu servis berkala dan perbaikan ringan sepeda motor.',
    'Menerapkan prosedur K3 dan menjaga kebersihan area kerja (5R).',
    'Mencatat hasil pemeriksaan kendaraan pada lembar kerja.'
  ],
  'Agus Setiawan', 'Kepala Bengkel Training',
  'Motor pelanggan sulit dinyalakan di pagi hari. Sebutkan urutan pemeriksaan yang kamu lakukan beserta prosedur K3-nya.',
  '2026-12-07'
),
(
  'in_05', 'Telkom Indonesia', '📡', '#E42313', 'Telekomunikasi',
  'Jl. Japati No. 1, Sadang Serang, Bandung',
  'Teknisi Jaringan (TKJ) PKL', 'SMK', 'WFO', 'Bandung', 3, true, 1200000,
  6,
  array['Jaringan Komputer','Mikrotik','Crimping Kabel','Troubleshooting'],
  array['CV','SURAT_PENGANTAR','KARTU_PELAJAR_KTM'],
  'Program PKL untuk siswa SMK TKJ di unit layanan jaringan kantor wilayah. Kamu akan terjun langsung ke instalasi dan perawatan jaringan bersama teknisi lapangan.',
  array[
    'Membantu instalasi dan crimping kabel LAN serta pemasangan perangkat.',
    'Mengonfigurasi router Mikrotik dasar di bawah pengawasan teknisi.',
    'Melakukan troubleshooting gangguan jaringan dan mencatat laporannya.'
  ],
  'Dedi Kurniawan', 'Network Engineer',
  'Satu lantai kantor tidak bisa terhubung internet, lantai lain normal. Jelaskan langkah troubleshooting kamu secara berurutan.',
  '2026-12-07'
),
(
  'in_06', 'Traveloka', '✈️', '#0194F3', 'Travel & Teknologi',
  'The Breeze BSD City, Jl. BSD Grand Boulevard, Tangerang',
  'Digital Marketing Intern', 'Semua', 'Hybrid', 'Tangerang', 4, true, 2500000,
  4,
  array['Social Media','Copywriting','Canva','Google Analytics'],
  array['CV','SURAT_PENGANTAR','PORTOFOLIO'],
  'Bantu tim Growth Marketing membuat kampanye media sosial untuk promo liburan. Kamu akan belajar membuat konten, membaca data performa, dan mengoptimalkan kampanye.',
  array[
    'Membuat konten Instagram dan TikTok menggunakan Canva.',
    'Menulis copywriting untuk iklan dan caption promo.',
    'Menyusun laporan performa kampanye mingguan dari Google Analytics.'
  ],
  'Maya Lestari', 'Marketing Manager',
  'Buat ide 1 konten Instagram untuk promo tiket liburan akhir tahun: hook, caption singkat, dan metrik untuk mengukur keberhasilannya.',
  '2027-01-04'
),
(
  'in_07', 'Bukalapak', '🛍️', '#E31E52', 'E-Commerce',
  'Metropolitan Tower, Jl. R.A. Kartini Kav. 14, Jakarta Selatan',
  'Data Analyst Intern', 'Mahasiswa', 'WFH', 'Jakarta', 6, true, 3200000,
  2,
  array['SQL','Python','Microsoft Excel','Data Visualization'],
  array['CV','SURAT_PENGANTAR','TRANSKRIP'],
  'Bergabung dengan tim Business Intelligence untuk mengolah data transaksi menjadi insight bisnis. Kamu akan bekerja dengan SQL, Python, dan dashboard visualisasi.',
  array[
    'Menulis query SQL untuk mengambil dan membersihkan data.',
    'Membuat dashboard dan visualisasi data untuk tim bisnis.',
    'Menyajikan temuan analisis dalam presentasi mingguan.'
  ],
  'Fajar Nugroho', 'Data Lead',
  'Penjualan turun 15% bulan ini. Tulis query/pendekatan analisis yang kamu gunakan untuk mencari penyebabnya.',
  '2027-01-04'
),
(
  'in_08', 'Unilever Indonesia', '🧴', '#1F36C7', 'FMCG',
  'Grha Unilever, Jl. BSD Boulevard Barat, Green Office Park Kav. 3, Tangerang',
  'Human Resources Intern', 'Mahasiswa', 'WFO', 'Tangerang', 5, true, 2700000,
  3,
  array['Komunikasi','Microsoft Office','Rekrutmen','Administrasi'],
  array['CV','SURAT_PENGANTAR','TRANSKRIP'],
  'Dukung tim Talent Acquisition dalam proses rekrutmen dan administrasi karyawan. Kamu akan belajar alur rekrutmen perusahaan multinasional dari dekat.',
  array[
    'Menyaring CV dan menjadwalkan interview kandidat.',
    'Mengelola database kandidat dan dokumen administrasi karyawan.',
    'Membantu persiapan acara employer branding dan job fair kampus.'
  ],
  'Rina Amalia', 'HR Business Partner',
  'Ada 200 lamaran untuk 5 posisi dengan waktu 1 minggu. Jelaskan cara kamu menyaring kandidat secara adil dan efisien.',
  '2027-01-04'
),
(
  'in_09', 'Kopi Kenangan', '☕', '#7B3F00', 'F&B Retail',
  'Jl. Kaliurang Km 5 No. 12, Sleman, Yogyakarta',
  'Admin & Kasir Outlet (PKL)', 'SMK', 'WFO', 'Yogyakarta', 3, false, 0,
  10,
  array['Microsoft Excel','Pelayanan Pelanggan','Komunikasi','Ketelitian'],
  array['CV','SURAT_PENGANTAR','KARTU_PELAJAR_KTM'],
  'Program PKL untuk siswa SMK jurusan Bisnis Daring & Pemasaran atau Akuntansi di outlet Yogyakarta. Kamu akan belajar operasional toko, pelayanan pelanggan, dan administrasi penjualan. Fasilitas: makan siang setiap hari kerja.',
  array[
    'Melayani transaksi kasir dan pembayaran digital pelanggan.',
    'Merekap penjualan harian dan stok bahan di Microsoft Excel.',
    'Menjaga standar pelayanan dan kebersihan outlet.'
  ],
  'Tono Hartanto', 'Store Manager',
  'Antrean pelanggan panjang saat jam makan siang dan ada pelanggan yang komplain. Apa yang kamu lakukan?',
  '2026-12-07'
),
(
  'in_10', 'Dicoding', '💻', '#2D3E50', 'EdTech',
  'Jl. Batik Kumeli No. 50, Sukaluyu, Bandung',
  'Backend Developer Intern', 'Semua', 'WFH', 'Bandung', 6, true, 2000000,
  3,
  array['Node.js','JavaScript','REST API','Git','SQL'],
  array['CV','SURAT_PENGANTAR','PORTOFOLIO'],
  'Bergabung dengan tim Platform untuk membangun API yang dipakai ratusan ribu pelajar developer di Indonesia. Terbuka untuk mahasiswa maupun siswa SMK RPL yang sudah menguasai Node.js dasar.',
  array[
    'Membangun dan mendokumentasikan endpoint REST API dengan Node.js.',
    'Menulis query SQL dan menjaga kualitas data.',
    'Menggunakan Git untuk kolaborasi dan mengikuti code review.'
  ],
  'Yoga Permana', 'Backend Lead',
  'Rancang endpoint REST API untuk fitur ''bookmark kelas''. Sebutkan method, URL, dan contoh response JSON-nya.',
  '2027-01-04'
)
on conflict (id) do update set
  company_name = excluded.company_name,
  company_logo = excluded.company_logo,
  company_theme_color = excluded.company_theme_color,
  company_industry = excluded.company_industry,
  company_address = excluded.company_address,
  role_title = excluded.role_title,
  education_target = excluded.education_target,
  work_type = excluded.work_type,
  city = excluded.city,
  duration_months = excluded.duration_months,
  is_paid = excluded.is_paid,
  stipend_amount = excluded.stipend_amount,
  quota = excluded.quota,
  required_skills = excluded.required_skills,
  required_docs = excluded.required_docs,
  description = excluded.description,
  responsibilities = excluded.responsibilities,
  mentor_name = excluded.mentor_name,
  mentor_role = excluded.mentor_role,
  case_study_question = excluded.case_study_question,
  start_date = excluded.start_date;

insert into public.prep_questions (id, category, question, ideal_answer_guide, tips) values
(
  'pq_01', 'HR', 'Ceritakan tentang dirimu.',
  'Gunakan pola Sekarang–Dulu–Nanti: (1) Sekarang: nama, jurusan, sekolah/kampus, dan semester/kelas. (2) Dulu: 1–2 pengalaman atau proyek yang relevan dengan posisi. (3) Nanti: kenapa kamu tertarik magang di posisi ini dan apa yang ingin kamu pelajari. Maksimal 1 menit.',
  'Jangan membacakan ulang CV — pilih hal yang relevan dengan posisi.'
),
(
  'pq_02', 'HR', 'Kenapa ingin magang di perusahaan ini?',
  'Sebutkan (1) hal spesifik tentang perusahaan yang kamu kagumi (produk, budaya, atau pencapaian), (2) kecocokan dengan jurusan/skill-mu, (3) apa yang ingin kamu pelajari dan kontribusikan selama magang.',
  'Riset website & media sosial perusahaan sebelum interview.'
),
(
  'pq_03', 'HR', 'Apa kelebihan dan kekuranganmu?',
  'Kelebihan: sebutkan 1–2 yang relevan dengan posisi + contoh nyata. Kekurangan: sebutkan 1 kekurangan jujur yang tidak fatal untuk posisi tersebut, lalu jelaskan langkah konkret yang sedang kamu lakukan untuk memperbaikinya.',
  'Hindari jawaban klise seperti "saya terlalu perfeksionis".'
),
(
  'pq_04', 'HR', 'Ceritakan pengalaman kerja tim yang menantang.',
  'Gunakan metode STAR: Situation (konteks tim/proyek), Task (peranmu), Action (apa yang kamu lakukan untuk mengatasi tantangan), Result (hasil akhir, sebaiknya dengan angka atau dampak jelas).',
  'Fokus pada tindakanmu sendiri, bukan menyalahkan anggota tim.'
),
(
  'pq_05', 'HR', 'Di mana kamu melihat dirimu 3 tahun lagi?',
  'Hubungkan tujuan kariermu dengan bidang posisi ini: skill yang ingin dikuasai, peran yang ingin dicapai, dan bagaimana magang ini menjadi langkah pertama menuju tujuan tersebut.',
  'Tunjukkan ambisi yang realistis dan selaras dengan bidang perusahaan.'
),
(
  'pq_06', 'Teknis', 'Jelaskan proyek terbaik yang pernah kamu kerjakan.',
  'Jelaskan (1) masalah yang diselesaikan, (2) tools/teknologi yang dipakai, (3) peran spesifikmu, (4) tantangan terbesar dan cara mengatasinya, (5) hasil atau pelajaran. Siapkan link/foto portofolio.',
  'Pilih proyek yang paling mirip dengan pekerjaan di posisi yang dilamar.'
),
(
  'pq_07', 'Teknis', 'Bagaimana cara kamu mempelajari tools baru dengan cepat?',
  'Ceritakan langkah belajarmu (dokumentasi resmi, video tutorial, langsung praktik dengan proyek kecil, bertanya ke komunitas) dan berikan 1 contoh nyata tools yang berhasil kamu pelajari dalam waktu singkat.',
  'Sertakan durasi nyata, misalnya "dalam 2 minggu saya bisa...".'
),
(
  'pq_08', 'Teknis', 'Bagaimana kamu menangani deadline yang bertabrakan?',
  'Jelaskan cara memprioritaskan (urgensi vs dampak), memecah tugas jadi bagian kecil, membuat jadwal, dan berkomunikasi lebih awal ke guru/dosen/atasan jika butuh penyesuaian. Beri 1 contoh nyata.',
  'Tunjukkan bahwa kamu proaktif berkomunikasi, bukan diam sampai terlambat.'
),
(
  'pq_09', 'Teknis', 'Jelaskan skill teknis utamamu dengan contoh nyata.',
  'Sebutkan 1–2 skill utama, tingkat penguasaanmu, dan contoh hasil kerja nyata yang memakai skill tersebut (tugas, lomba, proyek, atau sertifikat).',
  'Bukti nyata lebih meyakinkan daripada klaim "saya menguasai".'
),
(
  'pq_10', 'Etika Magang', 'Apa yang kamu lakukan jika tidak paham instruksi mentor?',
  'Segera bertanya untuk klarifikasi dengan sopan, ulangi instruksi dengan kata-katamu sendiri untuk memastikan pemahaman, catat poin pentingnya, lalu laporkan progres secara berkala.',
  'Bertanya di awal jauh lebih baik daripada salah mengerjakan.'
),
(
  'pq_11', 'Etika Magang', 'Bagaimana sikapmu jika melakukan kesalahan saat bekerja?',
  'Akui kesalahan secepatnya ke mentor, jelaskan apa yang terjadi tanpa membuat alasan, tawarkan solusi perbaikan, dan sampaikan langkah agar kesalahan yang sama tidak terulang.',
  'Kejujuran dan tanggung jawab lebih dihargai daripada menutupi kesalahan.'
),
(
  'pq_12', 'Etika Magang', 'Bagaimana kamu menjaga kerahasiaan data perusahaan?',
  'Tidak membagikan data/dokumen internal ke luar (termasuk media sosial), hanya memakai data sesuai keperluan tugas, menjaga password & perangkat kerja, serta mematuhi perjanjian kerahasiaan (NDA) dan SOP perusahaan.',
  'Jangan pernah memotret atau memposting layar kerja tanpa izin.'
)
on conflict (id) do update set
  category = excluded.category,
  question = excluded.question,
  ideal_answer_guide = excluded.ideal_answer_guide,
  tips = excluded.tips;
