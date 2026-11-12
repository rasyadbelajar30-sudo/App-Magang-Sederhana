import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileCheck2,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function MobileNav() {
  const location = useLocation();
  const { activeApplicationsCount, hasAcceptedInternship } = useApp();

  const items = [
    { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
    { to: '/lowongan', label: 'Lowongan', icon: Briefcase },
    { to: '/persiapan', label: 'Prep', icon: Sparkles },
    {
      to: '/lamaran',
      label: 'Lamaran',
      icon: FileCheck2,
      badge: activeApplicationsCount > 0 ? activeApplicationsCount : null,
    },
    {
      to: '/portal-magang',
      label: 'Portal',
      icon: Award,
      glow: hasAcceptedInternship,
    },
  ];

  const isRouteActive = (item) => {
    if (item.exact) return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#0F1629] border-t border-slate-200 dark:border-slate-800 px-2 py-1.5">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = isRouteActive(item);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[11px] font-bold transition-colors ${
                active
                  ? 'text-brand-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-brand-500 text-white">
                    {item.badge}
                  </span>
                )}
                {item.glow && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse-emerald" />
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
