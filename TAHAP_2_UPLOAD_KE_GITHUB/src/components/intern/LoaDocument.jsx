import React from 'react';
import { formatDateID, formatRupiah } from '../../lib/format';

export function LoaDocument({ application, internship, user, internId, period }) {
  if (!application || !internship || !user) return null;

  return (
    <div className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 max-w-3xl mx-auto space-y-5">
      <div className="border-b-4 border-double border-slate-900 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{internship.company_logo || '🏢'}</span>
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide">
              {internship.company_name}
            </h1>
            <p className="text-xs text-slate-600">{internship.company_address}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-extrabold">LETTER OF ACCEPTANCE (LoA)</p>
          <p>No: {application.offering_letter_no}</p>
          <p>ID Peserta: {internId}</p>
        </div>
      </div>

      <div className="text-center py-2">
        <h2 className="text-lg font-extrabold underline uppercase">
          SURAT KETERANGAN DITERIMA MAGANG / PKL
        </h2>
      </div>

      <p className="text-sm leading-relaxed text-justify">
        Yang bertanda tangan di bawah ini, Manajemen <strong>{internship.company_name}</strong>, menerangkan bahwa peserta didik berikut telah <strong>RESMI DITERIMA</strong> dan terdaftar aktif mengikuti program magang industri:
      </p>

      <table className="w-full text-sm border-collapse my-3">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold w-48">Nama Lengkap</td>
            <td className="py-2">: {user.full_name}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold">Asal Sekolah / Kampus</td>
            <td className="py-2">
              : {user.institution_name || '-'} ({user.education_level})
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold">Jurusan / Program Studi</td>
            <td className="py-2">
              : {user.major || '-'} ({user.grade_or_semester || '-'})
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold">Posisi Penempatan</td>
            <td className="py-2">: {internship.role_title}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold">Periode Magang</td>
            <td className="py-2">
              : {formatDateID(period?.start)} s.d. {formatDateID(period?.end)} ({internship.duration_months} Bulan)
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-2 font-bold">Uang Saku / Fasilitas</td>
            <td className="py-2">: {formatRupiah(internship.stipend_amount)}</td>
          </tr>
          <tr>
            <td className="py-2 font-bold">Mentor Pembimbing</td>
            <td className="py-2">
              : {internship.mentor_name} ({internship.mentor_role})
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-sm leading-relaxed text-justify">
        Surat keterangan ini dapat dipergunakan sebagaimana mestinya sebagai bukti resmi penerimaan magang bagi pihak sekolah/kampus terkait.
      </p>

      <div className="pt-8 flex justify-between items-end text-sm">
        <div>
          <p className="text-xs text-slate-500">Peserta Magang,</p>
          <p className="font-signature text-3xl text-brand-600 my-2">
            {application.signature_name || user.full_name}
          </p>
          <p className="font-bold underline">{user.full_name}</p>
          <p className="text-xs text-slate-500">
            Ditandatangani: {formatDateID(application.signed_by_user_at, true)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Mentor Pembimbing,</p>
          <p className="font-signature text-3xl text-slate-800 my-2">
            {internship.mentor_name}
          </p>
          <p className="font-bold underline">{internship.mentor_name}</p>
          <p className="text-xs text-slate-500">{internship.mentor_role}</p>
        </div>
      </div>
    </div>
  );
}
