import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
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
