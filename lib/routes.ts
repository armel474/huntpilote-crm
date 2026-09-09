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
} as const;
