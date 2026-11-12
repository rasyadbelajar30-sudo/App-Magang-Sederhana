const REQUIRED_READINESS_DOCS = [
  { type: 'CV', label: 'CV ATS-Friendly' },
  { type: 'SURAT_PENGANTAR', label: 'Surat Pengantar Sekolah/Kampus' },
  { type: 'TRANSKRIP', label: 'Transkrip Nilai / Rapor' },
  { type: 'KARTU_PELAJAR_KTM', label: 'Kartu Pelajar / KTM' },
];

/**
 * Menghitung skor kesiapan magang (0-100) beserta rincian breakdown & misi.
 * @param {object} user - baris dari tabel users
 * @param {Array} docs - baris dari tabel user_documents milik user
 * @param {Array} practices - baris dari tabel user_prep_practice milik user
 */
function computeReadiness(user, docs = [], practices = []) {
  // A. Profil lengkap (full_name, institution_name, major, gpa_or_score>0, bio.length>=30): 5 poin per field -> maks 25
  let profileEarned = 0;
  const profileMissing = [];

  if (user.full_name && user.full_name.trim().length > 0) {
    profileEarned += 5;
  } else {
    profileMissing.push({
      id: 'prof_name',
      title: 'Lengkapi Nama Lengkap di Profil',
      xp: 50,
      action_route: '/profil',
    });
  }

  if (user.institution_name && user.institution_name.trim().length > 0) {
    profileEarned += 5;
  } else {
    profileMissing.push({
      id: 'prof_inst',
      title: `Isi Nama ${user.education_level === 'SMK' ? 'Sekolah SMK' : 'Kampus'} di Profil`,
      xp: 50,
      action_route: '/profil',
    });
  }

  if (user.major && user.major.trim().length > 0) {
    profileEarned += 5;
  } else {
    profileMissing.push({
      id: 'prof_major',
      title: 'Isi Jurusan / Program Studi di Profil',
      xp: 50,
      action_route: '/profil',
    });
  }

  if (Number(user.gpa_or_score) > 0) {
    profileEarned += 5;
  } else {
    profileMissing.push({
      id: 'prof_gpa',
      title: `Isi ${user.education_level === 'SMK' ? 'Nilai Rata-rata' : 'IPK'} di Profil`,
      xp: 50,
      action_route: '/profil',
    });
  }

  if (user.bio && user.bio.trim().length >= 30) {
    profileEarned += 5;
  } else {
    profileMissing.push({
      id: 'prof_bio',
      title: 'Tulis Ringkasan Diri (Bio minimal 30 karakter)',
      xp: 50,
      action_route: '/persiapan?tab=cv',
    });
  }

  // B. Skill: min(skills.length, 5) * 4 -> maks 20
  const skillsArr = Array.isArray(user.skills) ? user.skills : [];
  const skillCount = Math.min(skillsArr.length, 5);
  const skillEarned = skillCount * 4;
  const skillMissing = [];
  if (skillsArr.length < 5) {
    const need = 5 - skillsArr.length;
    skillMissing.push({
      id: 'skill_more',
      title: `Tambahkan ${need} keahlian (skill) lagi ke profilmu`,
      xp: need * 10,
      action_route: '/persiapan?tab=cv',
    });
  }

  // C. Dokumen wajib verified: CV, SURAT_PENGANTAR, TRANSKRIP, KARTU_PELAJAR_KTM: 10 tiap -> maks 40
  const verifiedSet = new Set(
    (docs || []).filter((d) => d && d.is_verified).map((d) => d.doc_type)
  );
  let docEarned = 0;
  const docMissing = [];
  for (const reqDoc of REQUIRED_READINESS_DOCS) {
    if (verifiedSet.has(reqDoc.type)) {
      docEarned += 10;
    } else {
      const isAuto = reqDoc.type === 'CV' || reqDoc.type === 'SURAT_PENGANTAR';
      docMissing.push({
        id: `doc_${reqDoc.type}`,
        title: isAuto
          ? `Generate otomatis ${reqDoc.label}`
          : `Unggah berkas ${reqDoc.label} di Brankas`,
        xp: 30,
        action_route: isAuto ? '/persiapan?tab=cv' : '/persiapan?tab=dokumen',
      });
    }
  }

  // D. Latihan interview: min(jumlah is_practiced, 3) * 5 -> maks 15
  const practicedCount = Array.isArray(practices) ? practices.length : 0;
  const prepEarned = Math.min(practicedCount, 3) * 5;
  const prepMissing = [];
  if (practicedCount < 3) {
    const rem = 3 - practicedCount;
    prepMissing.push({
      id: 'prep_interview',
      title: `Latih ${rem} kartu soal simulasi interview`,
      xp: rem * 15,
      action_route: '/persiapan?tab=interview',
    });
  }

  const score = Math.min(100, profileEarned + skillEarned + docEarned + prepEarned);

  const breakdown = [
    {
      key: 'profile',
      label: 'Kelengkapan Profil',
      earned: profileEarned,
      max: 25,
      missing: profileMissing,
      action_route: '/profil',
    },
    {
      key: 'skills',
      label: 'Keahlian & Kompetensi',
      earned: skillEarned,
      max: 20,
      missing: skillMissing,
      action_route: '/persiapan?tab=cv',
    },
    {
      key: 'documents',
      label: 'Berkas Wajib Magang',
      earned: docEarned,
      max: 40,
      missing: docMissing,
      action_route: '/persiapan?tab=dokumen',
    },
    {
      key: 'interview',
      label: 'Simulasi Interview',
      earned: prepEarned,
      max: 15,
      missing: prepMissing,
      action_route: '/persiapan?tab=interview',
    },
  ];

  return {
    score,
    breakdown,
  };
}

module.exports = {
  computeReadiness,
  REQUIRED_READINESS_DOCS,
};
