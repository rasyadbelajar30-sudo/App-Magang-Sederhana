import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobCard } from '../components/jobs/JobCard';
import { CareerHero3D } from '../components/jobs/CareerHero3D';
import { PreferenceMatcherModal } from '../components/jobs/PreferenceMatcherModal';
import { HowInternshipWorksModal } from '../components/jobs/HowInternshipWorksModal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { sfx } from '../lib/soundEffects';
import { getSavedJobIds, toggleSavedJobId } from '../lib/smartSearch';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [allJobsForWizard, setAllJobsForWizard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingFeed, setRefreshingFeed] = useState(false);

  const [savedIds, setSavedIds] = useState(() => getSavedJobIds());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [matcherOpen, setMatcherOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const filters = {
    q: searchParams.get('q') || '',
    education: searchParams.get('education') || 'Semua',
    work_type: searchParams.get('work_type') || '',
    paid: searchParams.get('paid') || '',
    city: searchParams.get('city') || '',
    min_stipend: searchParams.get('min_stipend') || '',
    sort: searchParams.get('sort') || 'match',
  };

  const updateFilters = (next) => {
    const merged = { ...filters, ...next };
    const params = {};
    if (merged.q) params.q = merged.q;
    if (merged.education && merged.education !== 'Semua') params.education = merged.education;
    if (merged.work_type) params.work_type = merged.work_type;
    if (merged.paid) params.paid = merged.paid;
    if (merged.city && merged.city !== 'Semua') params.city = merged.city;
    if (merged.min_stipend) params.min_stipend = merged.min_stipend;
    if (merged.sort && merged.sort !== 'match') params.sort = merged.sort;
    setSearchParams(params);
  };

  const resetFilters = () => {
    setShowSavedOnly(false);
    setSearchParams({});
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.q) qs.set('q', filters.q);
      if (filters.education && filters.education !== 'Semua') {
        qs.set('education', filters.education);
      }
      if (filters.work_type) qs.set('work_type', qs.get('work_type') || filters.work_type);
      if (filters.paid) qs.set('paid', filters.paid);
      if (filters.city) qs.set('city', filters.city);
      if (filters.min_stipend) qs.set('min_stipend', filters.min_stipend);
      if (filters.sort) qs.set('sort', filters.sort);

      const [filteredRes, fullRes] = await Promise.all([
        api.get(`/internships?${qs.toString()}`),
        api.get('/internships'),
      ]);
      setJobs(Array.isArray(filteredRes) ? filteredRes : []);
      setAllJobsForWizard(Array.isArray(fullRes) ? fullRes : []);
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal memuat lowongan',
        desc: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [
    filters.q,
    filters.education,
    filters.work_type,
    filters.paid,
    filters.city,
    filters.min_stipend,
    filters.sort,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleSave = (jobId) => {
    const { saved, savedIds: nextIds } = toggleSavedJobId(jobId);
    setSavedIds(nextIds);
    const targetJob =
      allJobsForWizard.find((j) => j.id === jobId) || jobs.find((j) => j.id === jobId);
    toast({
      type: 'info',
      title: saved ? 'Lowongan Disimpan 🔖' : 'Dihapus dari Tersimpan',
      desc: targetJob
        ? `${targetJob.role_title} — ${targetJob.company_name}`
        : 'Daftar lowongan tersimpan diperbarui.',
    });
  };

  const displayedJobs = useMemo(() => {
    if (!showSavedOnly) return jobs;
    return jobs.filter((j) => savedIds.includes(j.id));
  }, [jobs, showSavedOnly, savedIds]);

  const handleRefreshLiveFeed = async () => {
    setRefreshingFeed(true);
    sfx.liveFeedRefresh();
    try {
      const res = await api.post('/internships/refresh-feed');
      const addedList =
        res.newly_added && res.newly_added.length > 0
          ? res.newly_added.join(', ')
          : 'Kuota & jadwal lowongan telah diperbarui';

      toast({
        type: 'success',
        title: `Live Feed Diperbarui! (${res.total_count} Lowongan Aktif)`,
        desc: `Lowongan baru masuk: ${addedList}`,
      });

      updateFilters({ sort: 'newest' });
      await fetchJobs();
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menarik lowongan terbaru',
        desc: err.message,
      });
    } finally {
      setRefreshingFeed(false);
    }
  };

  return (
    <PageTransition className="pb-16 space-y-5">
      {/* Interactive 3D Career Showcase Hero + Live Activity Ticker */}
      <CareerHero3D
        totalCount={allJobsForWizard.length || jobs.length || 22}
        refreshingFeed={refreshingFeed}
        onOpenMatcher={() => setMatcherOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onRefreshFeed={handleRefreshLiveFeed}
      />

      {/* Active Custom Preference Pills if city or min_stipend is active */}
      {(filters.city || filters.min_stipend) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            Spesifikasi Aktif:
          </span>
          {filters.city && (
            <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-cyan-300 font-bold">
              📍 Kota: {filters.city}
            </span>
          )}
          {filters.min_stipend && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              💰 Uang Saku &ge; Rp{Number(filters.min_stipend).toLocaleString('id-ID')}
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-rose-500 font-extrabold underline ml-1"
          >
            Hapus Semua Filter
          </button>
        </div>
      )}

      {/* Compact Sticky Follow-Scroll Search & Reference Bar */}
      <JobFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        allJobs={allJobsForWizard}
        savedCount={savedIds.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly((v) => !v)}
      />

      {/* Clean 3-Column Computer Grid Layout (Smooth 60FPS Scroll) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : displayedJobs.length === 0 ? (
        <EmptyState
          title={showSavedOnly ? 'Belum ada lowongan yang disimpan' : 'Tidak ada lowongan cocok'}
          description={
            showSavedOnly
              ? 'Klik ikon pita (Bookmark) pada kartu lowongan untuk menyimpan lowongan favoritmu.'
              : 'Coba ubah kata kunci pencarian atau reset filter untuk melihat seluruh kesempatan magang.'
          }
          actionLabel="Reset Filter Pencarian"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSkillAdded={fetchJobs}
              isSaved={savedIds.includes(job.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Smart Preference Matcher Modal */}
      <PreferenceMatcherModal
        open={matcherOpen}
        onClose={() => setMatcherOpen(false)}
        jobs={allJobsForWizard}
        onApplyPreferences={(prefs) => updateFilters(prefs)}
      />

      {/* How Internship Works Modal */}
      <HowInternshipWorksModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </PageTransition>
  );
}
