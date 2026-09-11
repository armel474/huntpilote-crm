/** Onglets de la fiche client — fusion des parcours v2 et v3 (PRD). */
export const FICHE_TABS = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'priorites', label: 'Priorités SEO' },
  { id: 'plan', label: "Plan d'action" },
  { id: 'diagnostics', label: 'Diagnostics' },
  /** Mène au calendrier éditorial (session 6.1) — pas un panneau interne, un lien de sortie. */
  { id: 'contenu', label: 'Contenu', external: true },
  { id: 'rapports', label: 'Rapports client' },
  /** Fil unique tous canaux, fusionné avec le portail client (session 7.2). */
  { id: 'communications', label: 'Communications' },
  { id: 'contrat', label: 'Contrat & facturation' },
] as const;

export type FicheTab = (typeof FICHE_TABS)[number]['id'];
