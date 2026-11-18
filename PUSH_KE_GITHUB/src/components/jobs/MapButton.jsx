import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import { sfx } from '../../lib/soundEffects';
import { getCompanyAddressQuery, getGoogleMapsSearchUrl } from '../../lib/location';

const VARIANTS = {
  chip:
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/25 hover:bg-rose-500/20',
  mini:
    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20',
  hero:
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold',
};

export function MapButton({ job, variant = 'chip', label }) {
  const text =
    label ?? (variant === 'mini' ? '📍 Maps' : variant === 'hero' ? '🗺️ Buka di Google Maps ↗' : 'Cari Alamat');
  return (
    <a
      href={getGoogleMapsSearchUrl(job)}
      target="_blank"
      rel="noopener noreferrer"
      title={getCompanyAddressQuery(job)}
      onClick={(e) => {
        e.stopPropagation();
        sfx.openMap();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
      }}
      className={`${VARIANTS[variant]} transition-colors shrink-0 whitespace-nowrap`}
    >
      {variant === 'chip' && <MapIcon className="w-3 h-3" />}
      <span>{text}</span>
    </a>
  );
}
