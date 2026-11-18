import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { spring } from '../lib/constants';
import { useApp } from '../context/AppContext';

export default function Applications() {
  const navigate = useNavigate();
  const { applications, loading } = useApp();
  const [tab, setTab] = useState('active');

  const activeList = (applications || []).filter((a) => a.status !== 'REJECTED');
  const historyList = (applications || []).filter((a) => a.status === 'REJECTED');

  const displayed = tab === 'active' ? activeList : historyList;

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Career Simulation & Mentoring Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-cyan-500/15 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shrink-0 shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-display font-extrabold text-slate-900 dark:text-white">
                Simulator Seleksi &amp; Bimbingan Karir Interaktif
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                ✨ AI Career Coaching
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Setiap lamaran di bawah dilengkapi <strong>bimbingan bertahap</strong> (evaluasi berkas &amp; Cover Letter, kisi-kisi interview HRD, panduan studi kasus, hingga kesiapan akhir) agar kamu 100% matang sebelum mendaftar ke perusahaan asli.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-2xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Simulasi Aman &bull; Dibimbing Sampai Siap</span>
        </div>
      </div>

      {/* Tabs: Aktif vs Selesai/Dibatalkan */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex p-1.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          {[
            { id: 'active', label: `Lamaran Aktif (${activeList.length})` },
            { id: 'history', label: `Dibatalkan / Riwayat (${historyList.length})` },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="apps-tab-pill"
                    transition={spring}
                    className="absolute inset-0 bg-brand-gradient rounded-xl shadow"
                  />
                )}
                <span
                  className={`relative z-10 ${
                    active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            tab === 'active'
              ? 'Belum ada lamaran aktif'
              : 'Tidak ada lamaran yang dibatalkan'
          }
          description={
            tab === 'active'
              ? 'Cari lowongan yang sesuai dengan keahlianmu dan kirimkan lamaran pertamamu sekarang!'
              : 'Semua lamaran yang dibatalkan akan tampil di sini.'
          }
          actionLabel={tab === 'active' ? 'Cari Lowongan Magang' : null}
          onAction={tab === 'active' ? () => navigate('/lowongan') : null}
        />
      ) : (
        <div className="space-y-5">
          {displayed.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </PageTransition>
  );
}
