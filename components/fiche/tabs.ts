/** Onglets de la fiche client — fusion des parcours v2 et v3 (PRD). */
export const FICHE_TABS = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'priorites', label: 'Priorités SEO' },
  { id: 'plan', label: "Plan d'action" },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'rapports', label: 'Rapports client' },
  { id: 'contrat', label: 'Contrat & facturation' },
] as const;

export type FicheTab = (typeof FICHE_TABS)[number]['id'];
