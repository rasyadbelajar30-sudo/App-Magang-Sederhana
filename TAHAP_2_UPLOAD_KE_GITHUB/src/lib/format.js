export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  if (num <= 0) return 'Unpaid (Fasilitas Makan)';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateID(dateStr, withTime = false) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  if (withTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('id-ID', options);
}

export function getInitials(name) {
  const parts = String(name || 'Peserta')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'PM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
