import React from 'react';
import { Printer } from 'lucide-react';
import { formatDateID, formatRupiah } from '../../lib/format';
import { Button } from '../ui/Button';

function addMonths(dateStr, months) {
  const parts = String(dateStr || '2027-01-04').split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setMonth(d.getMonth() + Number(months || 3));
  return d.toISOString().slice(0, 10);
}

export function OfferLetter({ application, user }) {
  const internship = application?.internship || {};
  const startDate = internship.start_date || application?.available_start_date;
  const endDate = addMonths(startDate, internship.duration_months || 3);
  const themeColor = internship.company_theme_color || '#4F46E5';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
          📄 Dokumen Resmi: Offering Letter (Letter of Acceptance)
        </span>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Offering Letter</span>
        </Button>
      </div>

      <div className="print-area bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Kop Perusahaan */}
        <div
          className="px-6 py-5 text-white flex items-center justify-between"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/20 p-2 rounded-xl">
              {internship.company_logo || '🏢'}
            </span>
            <div>
              <h3 className="text-lg font-display font-extrabold uppercase tracking-wide">
                {internship.company_name}
              </h3>
              <p className="text-xs opacity-90">{internship.company_address}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">SURAT PENERIMAAN MAGANG</p>
            <p className="opacity-90">No: {application.offering_letter_no}</p>
          </div>
        </div>

        {/* Isi Surat */}
        <div className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm leading-relaxed">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Perihal: Penawaran &amp; Penerimaan Peserta Magang (Offering Letter)</span>
            <span>Tanggal: {formatDateID(application.updated_at)}</span>
          </div>

          <p>
            Kepada Yth. <strong>{user?.full_name}</strong> ({user?.institution_name || 'Peserta'})
          </p>

          <p className="text-justify">
            Selamat! Berdasarkan hasil evaluasi berkas administrasi, wawancara, serta penilaian studi kasus yang telah kamu selesaikan dengan sangat baik, bersama surat ini{' '}
            <strong>{internship.company_name}</strong> secara resmi menawarkan posisi magang dengan rincian sebagai berikut:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Posisi Magang:</span>
              <strong className="text-slate-900">{internship.role_title}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Periode Pelaksanaan:</span>
              <strong className="text-slate-900">
                {formatDateID(startDate)} s.d. {formatDateID(endDate)} ({internship.duration_months} Bulan)
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tipe &amp; Lokasi Kerja:</span>
              <strong className="text-slate-900">
                {internship.work_type} — {internship.city}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Uang Saku / Tunjangan:</span>
              <strong className="text-emerald-700">{formatRupiah(internship.stipend_amount)} / bulan</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Mentor Pembimbing Lapangan:</span>
              <strong className="text-slate-900">
                {internship.mentor_name} ({internship.mentor_role})
              </strong>
            </div>
          </div>

          <div>
            <p className="font-bold mb-1.5">Tata Tertib &amp; Ketentuan Peserta Magang:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
              <li>Mematuhi jam kerja, standar keselamatan (K3), dan SOP internal perusahaan.</li>
              <li>Menjaga kerahasiaan data, kode sumber, dan informasi milik {internship.company_name}.</li>
              <li>Mengisi jurnal aktivitas harian (Logbook) untuk pemantauan mentor dan sekolah/kampus.</li>
              <li>Berkoordinasi secara aktif dengan mentor pembimbing selama masa magang berlangsung.</li>
            </ol>
          </div>

          {application.signed_by_user_at && (
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-500">Mengetahui Mentor,</p>
                <p className="font-signature text-2xl text-slate-800 my-1">
                  {internship.mentor_name}
                </p>
                <p className="text-xs font-bold">{internship.mentor_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Disetujui secara elektronik ({formatDateID(application.signed_by_user_at, true)})
                </p>
                <p className="font-signature text-2xl text-brand-600 my-1">
                  {application.signature_name}
                </p>
                <p className="text-xs font-bold">{application.signature_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
