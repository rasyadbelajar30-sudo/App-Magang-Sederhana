const { supabaseAdmin } = require('../supabase');
const { INTERNSHIPS, PREP_QUESTIONS, DEMO_USER_PROFILE } = require('../seedData');
const { computeReadiness } = require('../logic/readiness');

async function runSeed() {
  console.log('🌱 Memulai proses seeding MagangHub ke Supabase...');

  // 1. Upsert 10 internships
  const { error: intErr } = await supabaseAdmin
    .from('internships')
    .upsert(INTERNSHIPS, { onConflict: 'id' });
  if (intErr) {
    console.error('❌ Gagal upsert internships:', intErr.message);
    process.exit(1);
  }
  console.log(`✅ ${INTERNSHIPS.length} Lowongan magang berhasil di-upsert.`);

  // 2. Upsert 12 prep_questions
  const { error: prepErr } = await supabaseAdmin
    .from('prep_questions')
    .upsert(PREP_QUESTIONS, { onConflict: 'id' });
  if (prepErr) {
    console.error('❌ Gagal upsert prep_questions:', prepErr.message);
    process.exit(1);
  }
  console.log('✅ 12 Soal simulasi interview berhasil di-upsert.');

  // 3. Buat atau temukan akun demo
  const demoEmail = 'demo@maganghub.id';
  const demoPassword = 'demo12345';

  const { data: usersList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error('❌ Gagal membaca daftar auth users:', listErr.message);
    process.exit(1);
  }

  let demoAuthUser = usersList.users.find((u) => u.email === demoEmail);
  if (!demoAuthUser) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_USER_PROFILE.full_name,
        education_level: DEMO_USER_PROFILE.education_level,
      },
    });
    if (createErr) {
      console.error('❌ Gagal membuat akun demo:', createErr.message);
      process.exit(1);
    }
    demoAuthUser = created.user;
    console.log('✅ Akun Auth demo berhasil dibuat:', demoEmail);
  } else {
    console.log('ℹ️ Akun Auth demo sudah ada:', demoEmail);
  }

  // 4. Upsert profil demo di tabel public.users
  const readiness = computeReadiness(DEMO_USER_PROFILE, [], []);
  const profilePayload = {
    id: demoAuthUser.id,
    ...DEMO_USER_PROFILE,
    readiness_score: readiness.score,
    updated_at: new Date().toISOString(),
  };

  const { error: profErr } = await supabaseAdmin
    .from('users')
    .upsert(profilePayload, { onConflict: 'id' });
  if (profErr) {
    console.error('❌ Gagal upsert profil demo:', profErr.message);
    process.exit(1);
  }
  console.log('✅ Profil demo Rizky Pratama berhasil disimpan (Readiness:', readiness.score + '%).');
  console.log('🎉 Seeding selesai! Kamu bisa login dengan demo@maganghub.id / demo12345');
}

runSeed().catch((err) => {
  console.error('❌ Unexpected error saat seeding:', err);
  process.exit(1);
});
