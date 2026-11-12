import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { JobCard } from '../jobs/JobCard';
import { Button } from '../ui/Button';

export function RecommendedJobs({ jobs = [], onSkillAdded }) {
  const navigate = useNavigate();
  const topJobs = jobs.slice(0, 3);

  return (
    <div className="col-span-12 mt-2">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Rekomendasi Lowongan Terbaik Untukmu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diurutkan berdasarkan persentase kecocokan skill &amp; jenjang pendidikanmu
            </p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/lowongan')}>
          <span>Lihat Semua ({jobs.length || 22})</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {topJobs.map((job) => (
          <JobCard key={job.id} job={job} onSkillAdded={onSkillAdded} />
        ))}
      </div>
    </div>
  );
}
