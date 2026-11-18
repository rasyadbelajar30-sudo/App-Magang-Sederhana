import { sfx } from './soundEffects';

export const COMPANY_ADDRESSES = {
  tokopedia: 'Tokopedia Tower, Ciputra World 2, Jl. Prof. DR. Satrio, Jakarta Selatan',
  'telkom indonesia': 'Telkom Landmark Tower, Jl. Gatot Subroto Kav. 52, Jakarta Selatan',
  gojek: 'Pasaraya Blok M, Jl. Iskandarsyah II, Jakarta Selatan',
  'bank central asia': 'Menara BCA, Grand Indonesia, Jl. M.H. Thamrin No. 1, Jakarta Pusat',
  'astra honda motor': 'PT Astra Honda Motor, Jl. Laksda Yos Sudarso, Sunter, Jakarta Utara',
  traveloka: 'Traveloka Campus, Green Office Park, BSD City, Tangerang',
  'unilever indonesia': 'Grha Unilever, Green Office Park Kav. 3, BSD City, Tangerang',
  bukalapak: 'Metropolitan Tower, Jl. R.A. Kartini, Cilandak, Jakarta Selatan',
  dicoding: 'Dicoding Indonesia, Jl. Batik Kumeli No. 50, Bandung',
  'kopi kenangan': 'Kopi Kenangan HQ, Jakarta Selatan',
  'shopee indonesia': 'Pacific Century Place, SCBD Lot 10, Jakarta Selatan',
  shopee: 'Pacific Century Place, SCBD Lot 10, Jakarta Selatan',
  sociolla: 'Sociolla HQ, Lippo Mall Kemang, Jakarta Selatan',
  'pt pln (persero)': 'Kantor Pusat PT PLN (Persero), Jl. Trunojoyo Blok M I/135, Jakarta Selatan',
  'garuda indonesia': 'Garuda City Center, Bandara Soekarno-Hatta, Tangerang',
};

const keyOf = (job) => String(job?.company_name || '').trim().toLowerCase();

export function getCompanyAddress(job) {
  return COMPANY_ADDRESSES[keyOf(job)] || null;
}

export function getCompanyAddressQuery(job) {
  const addr = getCompanyAddress(job);
  return addr
    ? `${addr}, Indonesia`
    : `${job?.company_name || ''}, ${job?.city || ''}, Indonesia`.trim();
}

export function getJobAddressLabel(job) {
  const addr = getCompanyAddress(job);
  return addr ? `${addr.split(',')[0]} • ${job?.city || ''}` : `${job?.company_name || ''} • ${job?.city || ''}`;
}

export const getGoogleMapsSearchUrl = (job) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getCompanyAddressQuery(job))}`;

export const getGoogleMapsEmbedUrl = (job) =>
  `https://www.google.com/maps?q=${encodeURIComponent(getCompanyAddressQuery(job))}&output=embed`;

export function openJobMap(e, job) {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  sfx.openMap();
  window.open(getGoogleMapsSearchUrl(job), '_blank', 'noopener,noreferrer');
}
