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

export const PERMISSION_LABEL: Record<
  | 'manage_agency' | 'manage_team' | 'manage_catalogue' | 'manage_billing' | 'view_financials'
  | 'manage_clients' | 'send_documents' | 'publish_reports' | 'manage_automations'
  | 'run_paid_tools' | 'manage_content',
  { label: string; hint: string }
> = {
  manage_agency: { label: 'Gérer l’agence', hint: 'Identité, réglages, taxes, intégrations' },
  manage_team: { label: 'Gérer l’équipe', hint: 'Inviter, désactiver, changer un rôle ou un droit' },
  manage_catalogue: { label: 'Gérer le catalogue', hint: 'Produits, services, offres, modèles de documents' },
  manage_billing: { label: 'Facturer', hint: 'Factures et encaissements' },
  view_financials: { label: 'Voir les chiffres', hint: 'Revenus, consommation, marges' },
  manage_clients: { label: 'Gérer les comptes', hint: 'Créer, modifier, archiver un compte' },
  send_documents: { label: 'Envoyer des documents', hint: 'Devis, propositions, contrats' },
  publish_reports: { label: 'Publier des rapports', hint: 'Rendre un rapport visible du client' },
  manage_automations: { label: 'Gérer les automatisations', hint: 'Créer et activer une règle Quand / Alors' },
  run_paid_tools: { label: 'Lancer des outils payants', hint: 'Déclencher un appel facturé au fournisseur' },
  manage_content: { label: 'Gérer le contenu', hint: 'Briefs, articles, plan éditorial' },
};

export const PERMISSIONS = Object.keys(PERMISSION_LABEL) as (keyof typeof PERMISSION_LABEL)[];
