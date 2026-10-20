export function formatMontant(v: number | null | undefined): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(v ?? 0));
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatJour(d: Date | string | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit' });
}

export function formatMoisCourt(d: Date | string | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { month: 'short' });
}

export function formatAnnee(d: Date | string | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric' });
}
