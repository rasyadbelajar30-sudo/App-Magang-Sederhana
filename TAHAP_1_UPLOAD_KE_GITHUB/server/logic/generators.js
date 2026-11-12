const { computeMatch } = require('./matching');

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateCV(user) {
  const fullName = escapeHtml(user.full_name || 'Nama Lengkap');
  const email = escapeHtml(user.email || 'email@domain.com');
  const phone = escapeHtml(user.phone || '0812xxxxxxxx');
  const city = escapeHtml(user.city || 'Indonesia');
  const portfolio = escapeHtml(user.portfolio_url || '');
  const bio = escapeHtml(
    user.bio ||
      `${user.education_level === 'SMK' ? 'Siswa SMK' : 'Mahasiswa'} jurusan ${
        user.major || 'terkait'
      } yang antusias, cepat belajar, dan siap berkontribusi secara profesional dalam program magang industri.`
  );
  const inst = escapeHtml(user.institution_name || 'Institusi Pendidikan');
  const major = escapeHtml(user.major || 'Program Studi / Jurusan');
  const grade = escapeHtml(user.grade_or_semester || '-');
  const gpaLabel = user.education_level === 'SMK' ? 'Nilai Rata-rata' : 'IPK';
  const gpaVal = user.gpa_or_score ? escapeHtml(user.gpa_or_score) : '-';
  const skills = Array.isArray(user.skills) && user.skills.length > 0
    ? escapeHtml(user.skills.join(', '))
    : 'Komunikasi, Kerja Tim, Pemecahan Masalah';

  return `
<div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5; max-width: 720px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">${fullName}</h1>
  <p style="margin: 0 0 16px 0; font-size: 13px; color: #374151;">
    ${city} &bull; ${phone} &bull; ${email}${portfolio ? ` &bull; ${portfolio}` : ''}
  </p>
  <hr style="border: 0; border-top: 2px solid #111827; margin: 12px 0 16px 0;" />

  <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; color: #111827;">Ringkasan Profil</h2>
  <p style="margin: 0 0 16px 0; font-size: 13px; text-align: justify;">${bio}</p>

  <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; color: #111827;">Pendidikan</h2>
  <div style="margin: 0 0 16px 0; font-size: 13px;">
    <p style="margin: 0; font-weight: 700;">${inst}</p>
    <p style="margin: 2px 0;">${major} (${grade})</p>
    <p style="margin: 2px 0;">${gpaLabel}: <strong>${gpaVal}</strong></p>
  </div>

  <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; color: #111827;">Keahlian &amp; Kompetensi</h2>
  <p style="margin: 0 0 16px 0; font-size: 13px;">${skills}</p>

  ${
    portfolio
      ? `<h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; color: #111827;">Portofolio &amp; Tautan Karya</h2>
  <p style="margin: 0; font-size: 13px;">${portfolio}</p>`
      : ''
  }
</div>`.trim();
}

function generateSuratPengantar(user) {
  const now = new Date();
  const romanMonth = ROMAN_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const num = String((now.getDate() * 7) % 900 + 100).padStart(3, '0');
  const nomorSurat = `${num}/PKL/${romanMonth}/${year}`;

  const inst = escapeHtml(
    user.institution_name ||
      (user.education_level === 'SMK' ? 'SMK Negeri Unggulan' : 'Perguruan Tinggi Indonesia')
  );
  const city = escapeHtml(user.city || 'Jakarta');
  const fullName = escapeHtml(user.full_name || 'Nama Peserta');
  const major = escapeHtml(user.major || 'Program Studi / Kompetensi Keahlian');
  const grade = escapeHtml(user.grade_or_semester || '-');
  const signerTitle =
    user.education_level === 'SMK' ? 'Ketua Kompetensi Keahlian' : 'Kepala Program Studi';
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<div style="font-family: 'Times New Roman', Times, serif; color: #111827; line-height: 1.6; max-width: 720px; margin: 0 auto; padding: 28px;">
  <div style="text-align: center; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 20px;">
    <h1 style="font-size: 20px; font-weight: 700; margin: 0; text-transform: uppercase;">${inst}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px;">Unit Hubungan Industri &amp; Penempatan Magang / PKL &mdash; ${city}</p>
  </div>

  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 16px;">
    <div>
      <p style="margin: 2px 0;"><strong>Nomor:</strong> ${nomorSurat}</p>
      <p style="margin: 2px 0;"><strong>Lampiran:</strong> 1 (Satu) Berkas</p>
      <p style="margin: 2px 0;"><strong>Perihal:</strong> Permohonan Izin Magang/PKL</p>
    </div>
    <div>
      <p style="margin: 2px 0;">${city}, ${dateFormatted}</p>
    </div>
  </div>

  <p style="font-size: 13px; margin: 16px 0;">
    Kepada Yth.<br />
    <strong>Pimpinan HRD / Talent Acquisition Perusahaan Mitra</strong><br />
    di Tempat
  </p>

  <p style="font-size: 13px; text-align: justify; margin: 12px 0;">
    Dengan hormat,<br />
    Dalam rangka meningkatkan kompetensi praktis serta memenuhi kurikulum wajib pembelajaran industri pada <strong>${inst}</strong>, bersama surat ini kami mengajukan permohonan izin pelaksanaan Praktik Kerja Lapangan (PKL) / Magang bagi peserta didik kami berikut:
  </p>

  <table style="width: 100%; font-size: 13px; margin: 12px 0 16px 16px; border-collapse: collapse;">
    <tr>
      <td style="width: 180px; padding: 3px 0;">Nama Lengkap</td>
      <td style="padding: 3px 0;">: <strong>${fullName}</strong></td>
    </tr>
    <tr>
      <td style="padding: 3px 0;">Jenjang Pendidikan</td>
      <td style="padding: 3px 0;">: ${escapeHtml(user.education_level)}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0;">Jurusan / Program Studi</td>
      <td style="padding: 3px 0;">: ${major}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0;">${user.education_level === 'SMK' ? 'Kelas' : 'Semester'}</td>
      <td style="padding: 3px 0;">: ${grade}</td>
    </tr>
    <tr>
      <td style="padding: 3px 0;">Email / Kontak</td>
      <td style="padding: 3px 0;">: ${escapeHtml(user.email)} / ${escapeHtml(user.phone || '-')}</td>
    </tr>
  </table>

  <p style="font-size: 13px; text-align: justify; margin: 12px 0;">
    Kami sangat berharap peserta didik tersebut dapat diterima untuk melaksanakan program magang di bawah bimbingan tim Bapak/Ibu. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.
  </p>

  <div style="margin-top: 36px; text-align: right; font-size: 13px;">
    <p style="margin: 0;">Hormat kami,</p>
    <p style="margin: 2px 0 48px 0;"><strong>${signerTitle}</strong></p>
    <p style="margin: 0; font-weight: 700; text-decoration: underline;">Koordinator Magang &amp; PKL</p>
    <p style="margin: 2px 0; font-size: 12px;">${inst}</p>
  </div>
</div>`.trim();
}

function generateCoverLetter(user, internship) {
  const match = computeMatch(user, internship);
  const matchedList =
    match.matched_skills.length > 0
      ? match.matched_skills.join(', ')
      : Array.isArray(user.skills) && user.skills.length > 0
      ? user.skills.join(', ')
      : 'keahlian pendukung yang relevan';

  const inst =
    user.institution_name ||
    (user.education_level === 'SMK' ? 'SMK asal saya' : 'kampus asal saya');
  const major = user.major || 'bidang terkait';
  const grade = user.grade_or_semester || '';

  const p1 = `Yth. Tim Rekrutmen & Mentor ${internship.company_name},\nPerkenalkan, saya ${
    user.full_name || 'Kandidat'
  }, ${user.education_level === 'SMK' ? 'siswa' : 'mahasiswa'} jurusan ${major} (${grade}) dari ${inst}. Melalui surat ini, saya menyampaikan ketertarikan yang besar untuk melamar posisi ${
    internship.role_title
  } di ${internship.company_name}.`;

  const p2 = `Selama menempuh pendidikan di jurusan ${major}, saya telah mempelajari dan mempraktikkan kompetensi di bidang ${matchedList}. Saya yakin bekal pengetahuan tersebut, ditambah semangat belajar yang tinggi dan kemampuan kolaborasi tim, dapat membantu saya berkontribusi langsung dalam mendukung tugas-tugas di tim ${internship.company_name} di bawah bimbingan ${internship.mentor_name}.`;

  const p3 = `Saya siap mengikuti seluruh rangkaian kegiatan magang secara penuh (${internship.work_type} - ${internship.city}) selama ${internship.duration_months} bulan dan bersedia mulai efektif pada tanggal ${internship.start_date}. Terima kasih atas waktu dan kesempatan yang diberikan untuk meninjau lamaran saya.`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

function generateOfferNo(companyName, sequenceNum = 1) {
  const lettersOnly = String(companyName || 'MGH')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  const code = (lettersOnly + 'XXX').slice(0, 3);
  const year = new Date().getFullYear();
  const seq = String(sequenceNum).padStart(4, '0');
  return `MH/${code}/${year}/${seq}`;
}

module.exports = {
  generateCV,
  generateSuratPengantar,
  generateCoverLetter,
  generateOfferNo,
};
