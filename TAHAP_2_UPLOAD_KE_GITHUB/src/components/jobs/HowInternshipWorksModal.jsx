import React from 'react';
import {
  CheckCircle2,
  Laptop,
  Building2,
  Award,
  Wallet,
  CalendarClock,
  BookOpenCheck,
  Users,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function HowInternshipWorksModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📘 Magang & PKL di MagangHub Itu Gimana Sih?"
      size="lg"
    >
      <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600/15 via-violet-600/15 to-cyan-500/15 border border-brand-500/30">
          <h4 className="text-sm font-display font-extrabold text-slate-900 dark:text-white mb-1">
            🌟 Apa Itu Program Magang &amp; PKL di MagangHub?
          </h4>
          <p>
            MagangHub menghubungkan <strong>Siswa SMK (PKL/Prakerin)</strong> dan{' '}
            <strong>Mahasiswa</strong> langsung dengan perusahaan mitra resmi. Kamu tidak cuma disuruh fotokopi — melainkan mengerjakan proyek/praktik nyata dengan didampingi{' '}
            <strong>Mentor Pembimbing Lapangan</strong> berpengalaman!
          </p>
        </div>

        {/* 5 Tahap Perjalanan Magang */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            🚀 5 Tahap Perjalanan Magang dari Awal Sampai Lulus
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-extrabold text-brand-600 dark:text-cyan-400 mb-1">
                1. Siapkan Berkas di Studio Persiapan
              </div>
              <p>
                Buat CV ATS otomatis &amp; surat pengantar langsung di aplikasi, lalu simpan ke Brankas Dokumen sekali saja untuk melamar ke mana pun.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-extrabold text-brand-600 dark:text-cyan-400 mb-1">
                2. Daftar &amp; Jawab Studi Kasus Singkat
              </div>
              <p>
                Pilih lowongan yang cocok, lampirkan surat lamaran otomatis, dan jawab 1 studi kasus praktis dari mentor perusahaan.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-extrabold text-brand-600 dark:text-cyan-400 mb-1">
                3. Onboarding &amp; Terima Surat LoA Resmi
              </div>
              <p>
                Begitu diterima, kamu langsung mendapatkan <strong>ID Card Magang Digital</strong> dan <strong>Surat Penerimaan (LoA)</strong> resmi untuk diserahkan ke sekolah/kampus.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-extrabold text-brand-600 dark:text-cyan-400 mb-1">
                4. Bimbingan Mentor &amp; Logbook Harian
              </div>
              <p>
                Setiap hari kerja kamu berdiskusi dengan mentor, mengerjakan tugas industri, dan mencatat aktivitas di Jurnal Logbook (+25 XP/hari).
              </p>
            </div>
          </div>
        </div>

        {/* Perbedaan Sistem Kerja */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            🏢 Pilihan Sistem Kerja (Bisa Disesuaikan!)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-300 mb-1">
                <Laptop className="w-4 h-4" /> WFH (Remote)
              </div>
              <p>
                Kerja 100% dari rumah/kos memakai laptop &amp; internet. Koordinasi lewat Zoom/Google Meet bersama mentor.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
              <div className="flex items-center gap-1.5 font-extrabold text-indigo-700 dark:text-indigo-300 mb-1">
                <CalendarClock className="w-4 h-4" /> Hybrid (Fleksibel)
              </div>
              <p>
                Kombinasi datang ke kantor 2–3 hari seminggu dan sisanya dikerjakan dari rumah/kampus.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-700 dark:text-amber-300 mb-1">
                <Building2 className="w-4 h-4" /> WFO (On-Site)
              </div>
              <p>
                Praktik langsung di kantor, bengkel training, hotel, atau laboratorium perusahaan sesuai standar K3.
              </p>
            </div>
          </div>
        </div>

        {/* Fasilitas yang Didapat */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            🎁 Apa Saja yang Akan Kamu Dapatkan?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Uang Saku Bulanan</strong> (Rp1,2 Juta – Rp3,8 Juta/bln untuk lowongan Paid)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Sertifikat Industri Resmi</strong> &amp; Penilaian Akhir untuk Sekolah/Kampus
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500 shrink-0" />
              <span>
                <strong>Mentoring 1-on-1</strong> setiap minggu bersama praktisi ahli
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>
                <strong>Rekap Logbook PDF Otomatis</strong> siap cetak untuk laporan PKL/Magang
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Paham, Yuk Cari Lowongan!</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
