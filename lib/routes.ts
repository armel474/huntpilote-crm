/**
 * Fabriques d'URL du cockpit.
 *
 * Les écrans de détail se renvoient les uns aux autres (une priorité pointe
 * sa tâche, une tâche sa preuve de valeur, un rapport ses priorités). Les
 * chemins sont centralisés ici pour qu'un changement de route ne se traduise
 * pas par une chasse aux liens morts.
 */

export const routes = {
  clients: () => '/clients',
  client: (id: string) => `/clients/${id}`,
  priorite: (id: string, p: string) => `/clients/${id}/priorites/${p}`,
  tache: (id: string, t: string) => `/clients/${id}/taches/${t}`,
  rapport: (id: string, r: string) => `/clients/${id}/rapports/${r}`,
  audit: (id: string, a: string) => `/clients/${id}/audits/${a}`,
  outil: (slug: string) => `/outils/${slug}`,
  pipeline: () => '/pipeline',
  parametres: (section?: string) => (section ? `/parametres?section=${section}` : '/parametres'),
  /** Document partageable, hors cockpit — dans l'esprit de `/r/[token]` (session 1.3). */
  auditProspect: (token: string) => `/audit-prospect/${token}`,

  /* ── Phase 4 — le quotidien de l'agence ── */
  travail: () => '/travail',
  prioritesTransversales: () => '/priorites',
  agenda: () => '/agenda',
  rapportsAProduire: () => '/rapports',

  /* ── Phase 3 — SEO local ── */
  local: () => '/local',
  etablissement: (etab: string) => `/local/${etab}`,
  etablissementAvis: (etab: string) => `/local/${etab}/avis`,
  etablissementCitations: (etab: string) => `/local/${etab}/citations`,
  etablissementPositions: (etab: string) => `/local/${etab}/positions`,
  etablissementConcurrence: (etab: string) => `/local/${etab}/concurrence`,

  /* ── Phase 5 — le portail client ── */
  portail: () => '/portail',
  portailConnexion: () => '/portail/connexion',
  portailRapports: () => '/portail/rapports',
  portailEchanges: () => '/portail/echanges',

  /* ── Phase 6 — contenu et socle ── */
  contenu: (id: string) => `/clients/${id}/contenu`,
  brief: (id: string, b: string) => `/clients/${id}/contenu/${b}`,
  connexion: () => '/connexion',
} as const;
