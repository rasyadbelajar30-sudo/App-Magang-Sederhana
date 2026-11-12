import React, { useCallback, useEffect, useState } from 'react';
import { FileCheck2, Send, MessageSquareQuote } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { DemoBanner } from '../components/dashboard/DemoBanner';
import { ReadinessGauge } from '../components/dashboard/ReadinessGauge';
import { XpLevelCard } from '../components/dashboard/XpLevelCard';
import { MissionList } from '../components/dashboard/MissionList';
import { RecommendedJobs } from '../components/dashboard/RecommendedJobs';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { readiness, docs, sims, activeApplicationsCount, loading } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const fetchRecommended = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await api.get('/internships?sort=match');
      setJobs(Array.isArray(res) ? res : []);
    } catch (_err) {
      // ignore
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  const readyDocsCount = (docs || []).filter((d) => d.doc?.is_verified).length;
  const practicedSimsCount = (sims || []).filter((s) => s.is_practiced).length;

  return (
    <PageTransition className="space-y-6 pb-12">
      <div className="grid grid-cols-12 gap-5">
        {/* Tile 1: Demo Banner (span 12) */}
        <DemoBanner />

        {/* Tile 2: Readiness Gauge (span 5, row-span 2) */}
        {loading && !readiness ? (
          <div className="col-span-12 lg:col-span-5 lg:row-span-2">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
          </div>
        ) : (
          <ReadinessGauge readiness={readiness} />
        )}

        {/* Tile 3: XP Level Card (span 7) */}
        <XpLevelCard />

        {/* Tile 4: Mission List (span 7) */}
        <MissionList readiness={readiness} />

        {/* Tile 5: Mini Stats (3 x span 4) */}
        <GlassCard className="col-span-12 sm:col-span-4 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Lamaran Aktif</p>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={activeApplicationsCount} />
            </p>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 sm:col-span-4 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Dokumen Siap</p>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={readyDocsCount} suffix="/6" />
            </p>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 sm:col-span-4 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Latihan Interview
            </p>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              <AnimatedNumber value={practicedSimsCount} suffix="/12" />
            </p>
          </div>
        </GlassCard>

        {/* Tile 6: Recommended Jobs (span 12) */}
        {loadingJobs ? (
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <RecommendedJobs jobs={jobs} onSkillAdded={fetchRecommended} />
        )}
      </div>
    </PageTransition>
  );
}
