import React from 'react';
import { motion } from 'framer-motion';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

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

export function SuratPengantarPreview({ data }) {
  const now = new Date();
  const romanMonth = ROMAN[now.getMonth()];
  const year = now.getFullYear();
  const nomor = `142/PKL/${romanMonth}/${year}`;
  const isSmk = data.education_level === 'SMK';
  const signerTitle = isSmk ? 'Ketua Kompetensi Keahlian' : 'Kepala Program Studi';
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="print-area bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-7 sm:p-10 w-full aspect-[1/1.414] overflow-y-auto"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <div className="text-center border-b-4 border-double border-slate-900 pb-3 mb-5">
        <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
          <FlashText
            value={data.institution_name}
            fallback={isSmk ? 'SMK Negeri Unggulan' : 'Perguruan Tinggi Indonesia'}
          />
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Unit Hubungan Industri &amp; Penempatan Magang / PKL —{' '}
          <FlashText value={data.city} fallback="Indonesia" />
        </p>
      </div>

      <div className="flex justify-between text-xs sm:text-sm mb-5">
        <div>
          <p>
            <strong>Nomor:</strong> {nomor}
          </p>
          <p>
            <strong>Lampiran:</strong> 1 (Satu) Berkas
          </p>
          <p>
            <strong>Perihal:</strong> Permohonan Izin Magang / PKL
          </p>
        </div>
        <div className="text-right">
          <p>
            <FlashText value={data.city} fallback="Jakarta" />, {dateStr}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm mb-4">
        Kepada Yth.
        <br />
        <strong>Pimpinan HRD / Talent Acquisition Perusahaan Mitra</strong>
        <br />
        di Tempat
      </p>

      <p className="text-xs sm:text-sm text-justify mb-4 leading-relaxed">
        Dengan hormat, dalam rangka meningkatkan kompetensi praktis serta memenuhi kurikulum wajib pembelajaran industri pada{' '}
        <strong>
          <FlashText
            value={data.institution_name}
            fallback="Institusi Pendidikan"
          />
        </strong>
        , bersama surat ini kami mengajukan permohonan izin pelaksanaan Praktik Kerja Lapangan (PKL) / Magang bagi peserta didik kami:
      </p>

      <div className="pl-4 mb-4 space-y-1 text-xs sm:text-sm">
        <p>
          <strong>Nama Lengkap:</strong> <FlashText value={data.full_name} fallback="Nama Peserta" />
        </p>
        <p>
          <strong>Jenjang Pendidikan:</strong> <FlashText value={data.education_level} />
        </p>
        <p>
          <strong>Jurusan / Program Studi:</strong>{' '}
          <FlashText value={data.major} fallback="Program Studi" />
        </p>
        <p>
          <strong>{isSmk ? 'Kelas' : 'Semester'}:</strong>{' '}
          <FlashText value={data.grade_or_semester} fallback="-" />
        </p>
        <p>
          <strong>Kontak / Email:</strong> <FlashText value={data.phone} fallback="-" /> /{' '}
          <FlashText value={data.email} fallback="-" />
        </p>
      </div>

      <p className="text-xs sm:text-sm text-justify mb-8 leading-relaxed">
        Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.
      </p>

      <div className="text-right text-xs sm:text-sm mt-10">
        <p>Hormat kami,</p>
        <p className="font-bold mb-12">{signerTitle}</p>
        <p className="font-bold underline">Koordinator Magang &amp; PKL</p>
      </div>
    </div>
  );
}
