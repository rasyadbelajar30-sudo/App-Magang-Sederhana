import React from 'react';
import { motion } from 'framer-motion';

function FlashText({ value, fallback = '-' }) {
  const display = value && String(value).trim().length > 0 ? value : fallback;
  return (
    <motion.span
      key={String(display)}
      initial={{ backgroundColor: 'rgba(250, 204, 21, 0.55)' }}
      animate={{ backgroundColor: 'rgba(250, 204, 21, 0)' }}
      transition={{ duration: 0.6 }}
      className="rounded px-0.5"
    >
      {display}
    </motion.span>
  );
}

export function CvPreview({ data }) {
  const isSmk = data.education_level === 'SMK';
  const skills = Array.isArray(data.skills) && data.skills.length > 0
    ? data.skills
    : ['Komunikasi', 'Kerja Tim'];

  return (
    <div className="print-area bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-7 sm:p-10 w-full aspect-[1/1.414] overflow-y-auto">
      <div className="border-b-2 border-slate-900 pb-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900">
          <FlashText value={data.full_name} fallback="Nama Lengkap Peserta" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <FlashText value={data.city} fallback="Kota Domisili" />
          <span>&bull;</span>
          <FlashText value={data.phone} fallback="0812xxxxxxxx" />
          <span>&bull;</span>
          <FlashText value={data.email} fallback="email@domain.com" />
          {data.portfolio_url && (
            <>
              <span>&bull;</span>
              <FlashText value={data.portfolio_url} />
            </>
          )}
        </p>
      </div>

      {/* Ringkasan Profil */}
      <section className="mb-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Ringkasan Profil
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
          <FlashText
            value={data.bio}
            fallback={`${
              isSmk ? 'Siswa SMK' : 'Mahasiswa'
            } jurusan ${data.major || 'terkait'} yang antusias, cepat belajar, dan siap berkontribusi secara profesional dalam program magang industri.`}
          />
        </p>
      </section>

      {/* Pendidikan */}
      <section className="mb-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Pendidikan
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
          <div>
            <p className="font-bold text-slate-900">
              <FlashText value={data.institution_name} fallback="Institusi Pendidikan" />
            </p>
            <p className="text-slate-700">
              <FlashText value={data.major} fallback="Program Studi / Jurusan" /> (
              <FlashText value={data.grade_or_semester} fallback={isSmk ? 'Kelas XI' : 'Semester 5'} />)
            </p>
          </div>
          <div className="mt-1 sm:mt-0 sm:text-right font-bold text-slate-800">
            {isSmk ? 'Nilai Rata-rata: ' : 'IPK: '}
            <FlashText value={data.gpa_or_score} fallback="-" />
          </div>
        </div>
      </section>

      {/* Keahlian */}
      <section className="mb-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Keahlian &amp; Kompetensi
        </h2>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          <FlashText value={skills.join(', ')} />
        </p>
      </section>

      {/* Portofolio */}
      {data.portfolio_url && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Portofolio &amp; Karya
          </h2>
          <p className="text-xs sm:text-sm text-brand-600 font-medium break-all">
            <FlashText value={data.portfolio_url} />
          </p>
        </section>
      )}
    </div>
  );
}
