import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileCheck2,
  Award,
  UserCircle2,
  Lock,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../lib/format';
import { ProgressBar } from '../ui/ProgressBar';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { spring } from '../../lib/constants';

export function Sidebar() {
  const location = useLocation();
  const { user, level, readiness, activeApplicationsCount, hasAcceptedInternship } = useApp();

  const mainNav = [
    { to: '/', label: 'Dashboard Utama', icon: LayoutDashboard, exact: true },
    { to: '/lowongan', label: 'Eksplorasi Lowongan', icon: Briefcase, pill: '22+ Live' },
    { to: '/persiapan', label: 'Prep & CV Studio', icon: Sparkles },
  ];

  const careerNav = [
    {
      to: '/lamaran',
      label: 'Lamaran & Seleksi',
      icon: FileCheck2,
      badge: activeApplicationsCount > 0 ? activeApplicationsCount : null,
    },
    {
      to: '/portal-magang',
      label: 'Portal Magang Aktif',
      icon: Award,
      locked: !hasAcceptedInternship,
      glowActive: hasAcceptedInternship,
    },
    { to: '/profil', label: 'Profil & Keahlian', icon: UserCircle2 },
  ];

  const isRouteActive = (item) => {
    if (item.exact) return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  };

  const renderNavItem = (item) => {
    const active = isRouteActive(item);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all group ${
          active
            ? 'text-white'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {active && (
          <motion.div
            layoutId="nav-pill"
            transition={spring}
            className="absolute inset-0 bg-brand-gradient rounded-xl shadow-md shadow-brand-500/25"
          />
        )}

        <div className="relative z-10 flex items-center gap-3">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              active
                ? 'text-white'
                : item.glowActive
                ? 'text-emerald-500'
                : 'text-slate-400 dark:text-slate-400 group-hover:text-brand-500 dark:group-hover:text-cyan-400'
            }`}
          />
          <span>{item.label}</span>
        </div>

        <div className="relative z-10 flex items-center gap-1.5">
          {item.pill && (
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {item.pill}
            </span>
          )}

          {item.badge && (
            <span
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
                active
                  ? 'bg-white/25 text-white'
                  : 'bg-brand-500/15 text-brand-600 dark:text-indigo-300'
              }`}
            >
              {item.badge}
            </span>
          )}

          {item.locked && (
            <Lock
              className={`w-3.5 h-3.5 ${
                active ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
          )}

          {item.glowActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-emerald" />
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-[268px] shrink-0 h-screen sticky top-0 z-30 bg-white dark:bg-[#0F1629] border-r border-slate-200/90 dark:border-slate-800/90 px-4 py-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 pb-5 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-500/25">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                MagangHub
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-brand-500/15 text-brand-600 dark:text-cyan-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Platform PKL &amp; Magang Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Navigation */}
      <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Menu Utama
          </p>
          {mainNav.map(renderNavItem)}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Karir &amp; Seleksi
          </p>
          {careerNav.map(renderNavItem)}
        </div>
      </div>

      {/* Bottom User & Readiness Card */}
      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm shrink-0 shadow-sm"
              style={{ backgroundColor: user?.avatar_color || '#4F46E5' }}
            >
              {getInitials(user?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'Peserta Magang'}
                </p>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              </div>
              <p className="text-[11px] font-bold text-brand-600 dark:text-cyan-400 truncate">
                Lv.{level.lvl} &bull; {level.name}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">
                Kesiapan: <strong className="text-emerald-500">{readiness?.score || 0}%</strong>
              </span>
              <span className="text-slate-700 dark:text-slate-200">
                <AnimatedNumber value={user?.xp_points || 0} suffix=" XP" />
              </span>
            </div>
            <ProgressBar value={level.progress_pct} max={100} shimmer heightClass="h-1.5" />
          </div>
        </div>
      </div>
    </aside>
  );
}
