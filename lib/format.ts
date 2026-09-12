/** Mise en forme d'affichage — l'argent se stocke en cents, il s'affiche en dollars. */

const cad = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const cadCents = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });

export function money(cents: number | null | undefined, { exact = false } = {}): string {
  if (cents === null || cents === undefined) return '—';
  const dollars = cents / 100;
  return (exact || dollars % 1 !== 0 ? cadCents : cad).format(dollars);
}

export const BILLING_LABEL: Record<'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel', string> = {
  mensuel: '/ mois',
  trimestriel: '/ trimestre',
  annuel: '/ an',
  ponctuel: 'paiement unique',
};

export const ROLE_LABEL: Record<'admin' | 'chef_projet' | 'specialiste_seo' | 'redacteur', string> = {
  admin: 'Administration',
  chef_projet: 'Chef de projet',
  specialiste_seo: 'Spécialiste SEO',
  redacteur: 'Rédaction',
};
