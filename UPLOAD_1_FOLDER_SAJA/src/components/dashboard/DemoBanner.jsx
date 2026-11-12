import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  FileText,
  Send,
  CalendarCheck,
  Award,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export function DemoBanner() {
  const navigate = useNavigate();
  const { readiness, docs, applications, hasAcceptedInternship } = useApp();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('mh-demo-banner-closed') === '1';
    } catch (_e) {
      return false;
    }
  });

  if (dismissed) return null;

  const profileDone =
    (readiness?.breakdown?.find((b) => b.key === 'profile')?.earned || 0) >= 25 &&
    (readiness?.breakdown?.find((b) => b.key === 'skills')?.earned || 0) >= 12;

  const requiredDocsDone =
    docs.filter((d) => d.required && d.doc?.is_verified).length >= 4;

  const hasApplied = applications.some((a) => a.status !== 'REJECTED');
  const inSelection = applications.some((a) =>
    ['DOC_REVIEW', 'INTERVIEW_SCHEDULED', 'TEST_SUBMITTED', 'OFFERING_SENT', 'ACCEPTED_ONBOARDING'].includes(
      a.status
    )
  );

  const steps = [
    {
      id: 1,
      label: 'Lengkapi Profil',
      icon: UserCheck,
      done: profileDone,
      route: '/profil',
    },
    {
      id: 2,
      label: 'Siapkan Berkas',
      icon: FileText,
      done: requiredDocsDone,
      route: '/persiapan?tab=dokumen',
    },
    {
      id: 3,
      label: 'Daftar Lowongan',
      icon: Send,
      done: hasApplied,
      route: '/lowongan',
    },
    {
      id: 4,
      label: 'Ikuti Seleksi',
      icon: CalendarCheck,
      done: inSelection,
      route: '/lamaran',
    },
    {
      id: 5,
      label: 'Resmi Magang',
      icon: Award,
      done: hasAcceptedInternship,
      route: '/portal-magang',
    },
  ];

  const nextStep = steps.find((s) => !s.done) || steps[steps.length - 1];

  const handleClose = () => {
    setDismissed(true);
    try {
      localStorage.setItem('mh-demo-banner-closed', '1');
    } catch (_e) {
      // ignore
    }
  };

  return (
    <div className="col-span-12 relative overflow-hidden rounded-3xl bg-brand-gradient p-5 sm:p-6 text-white shadow-xl shadow-brand-500/20">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Tutup panduan"
        className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="max-w-xl">
          <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-2">
            Panduan Alur Magang End-to-End
          </span>
          <h2 className="text-lg sm:text-xl font-display font-extrabold">
            Alur Magangmu: Lengkapi Profil → Siapkan Berkas → Daftar → Seleksi → Resmi Magang
          </h2>
          <p className="text-xs sm:text-sm text-white/85 mt-1">
            Ikuti setiap tahap di bawah ini hingga kamu mendapatkan Offering Letter, menandatanganinya secara digital, dan membuka Portal Magang Aktif!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isNext = nextStep.id === step.id && !step.done;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => navigate(step.route)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                    step.done
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : isNext
                      ? 'bg-white text-slate-900 animate-pulse-ring shadow-lg'
                      : 'bg-white/15 text-white/85 hover:bg-white/25'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      step.done
                        ? 'bg-white/25 text-white'
                        : isNext
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/20'
                    }`}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </span>
                  <span>{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="hidden sm:inline text-white/50 font-bold">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="shrink-0">
          <Button
            onClick={() => navigate(nextStep.route)}
            className="bg-white !text-slate-900 hover:bg-slate-100 shadow-lg"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
