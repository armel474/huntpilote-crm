/**
 * Recherche globale — index cherchable, récents et actions rapides
 * (session 4.3). Partagé par tout écran du cockpit.
 *
 * Le groupe « Clients et prospects » est construit depuis le vrai
 * répertoire `CLIENTS` : chaque résultat mène à une vraie fiche. Les
 * autres groupes (tâches, priorités, mots-clés, rapports, établissements,
 * factures) restent illustratifs — les jeux de données réels et
 * exhaustifs pour ces objets appartiennent à d'autres sessions (mon plan
 * de travail, priorités transversales, SEO local…) — mais chaque entrée
 * pointe vers un vrai compte de `CLIENTS`, jamais un nom inventé.
 */

import { CLIENTS } from '@/lib/data/clients';
import { routes } from '@/lib/routes';

export type SearchType =
  | 'action'
  | 'client'
  | 'prospect'
  | 'tache'
  | 'priorite'
  | 'motcle'
  | 'rapport'
  | 'etab'
  | 'facture';

export type SearchGroupId = 'action' | 'clients' | 'tache' | 'priorite' | 'motcle' | 'rapport' | 'etab' | 'facture';

export const HS_TYPES: Record<SearchType, { label: string; tone: 'violet' | 'green' | 'blue' | 'red' | 'yellow' | 'neutral' }> = {
  action: { label: 'Action rapide', tone: 'violet' },
  client: { label: 'Client', tone: 'green' },
  prospect: { label: 'Prospect', tone: 'blue' },
  tache: { label: 'Tâche', tone: 'blue' },
  priorite: { label: 'Priorité', tone: 'red' },
  motcle: { label: 'Mot-clé suivi', tone: 'yellow' },
  rapport: { label: 'Rapport', tone: 'neutral' },
  etab: { label: 'Établissement', tone: 'green' },
  facture: { label: 'Facture', tone: 'yellow' },
};

/** Ordre d'affichage des groupes : les actions d'abord, c'est un lanceur avant d'être une liste. */
export const HS_GROUPS: SearchGroupId[] = ['action', 'clients', 'tache', 'priorite', 'motcle', 'rapport', 'etab', 'facture'];

export const HS_GROUP_LABEL: Record<SearchGroupId, string> = {
  action: 'Actions rapides',
  clients: 'Clients et prospects',
  tache: 'Tâches',
  priorite: 'Priorités',
  motcle: 'Mots-clés suivis',
  rapport: 'Rapports',
  etab: 'Établissements',
  facture: 'Factures',
};

export const HS_GROUP_OF = (t: SearchType): SearchGroupId => (t === 'client' || t === 'prospect' ? 'clients' : t);

export type SearchItem = {
  id: string;
  type: SearchType;
  label: string;
  sub?: string;
  href: string;
  /** Mots-clés additionnels pour le filtrage, non affichés. */
  kw?: string;
};

export const HS_ACTIONS: SearchItem[] = [
  { id: 'A1', type: 'action', label: 'Nouveau client', sub: "Ouvre l'intégration en 4 étapes", href: '/onboarding', kw: 'nouveau client ajouter creer compte onboarding' },
  { id: 'A2', type: 'action', label: 'Aller aux priorités critiques', sub: 'Tout le portefeuille, triées par sévérité', href: routes.prioritesTransversales(), kw: 'priorites critiques transversales urgent severite' },
  { id: 'A3', type: 'action', label: 'Ouvrir mon plan de travail', sub: 'Mes tâches groupées par échéance', href: routes.travail(), kw: 'plan travail taches mes echeances' },
  { id: 'A4', type: 'action', label: 'Voir les rapports à produire', sub: 'État du cycle mensuel', href: routes.rapportsAProduire(), kw: 'rapports produire cycle mensuel livrables' },
  { id: 'A5', type: 'action', label: "Ouvrir l'agenda de la semaine", sub: 'Échéances, envois, rendez-vous', href: routes.agenda(), kw: 'agenda calendrier semaine rendez-vous' },
  { id: 'A6', type: 'action', label: 'Ouvrir le pipeline', sub: 'Deals en cours, par étape', href: routes.pipeline(), kw: 'pipeline deals prospects vente' },
];

/** Groupe « Clients et prospects » — construit depuis le vrai répertoire, pas une copie figée. */
const CLIENT_ITEMS: SearchItem[] = CLIENTS.map((c) => ({
  id: c.id,
  type: c.type,
  label: c.name,
  sub:
    c.type === 'client'
      ? `${c.sector} · score ${c.score} · MRR ${c.mrr}`
      : `Prospect · ${c.budget} · ${c.nextAction}`,
  href: routes.client(c.id),
}));

/** Cinq comptes clients réels, réutilisés en rotation pour le contenu illustratif ci-dessous. */
const CLIENT_IDS = CLIENTS.filter((c) => c.type === 'client').map((c) => c.id);
const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;
const [C1, C2, C3, C4, C5] = CLIENT_IDS;

const TACHE_ITEMS: SearchItem[] = [
  { id: 'T142', type: 'tache', label: 'Corriger les 23 liens brisés', sub: `${clientName(C1)} · tâche #142 · terminée le 7 sept.`, href: routes.tache(C1, '142') },
  { id: 'T143', type: 'tache', label: 'Rendre les 23 pages orphelines accessibles', sub: `${clientName(C1)} · tâche #143 · échéance 10 sept.`, href: routes.tache(C1, '143') },
  { id: 'T158', type: 'tache', label: 'Publier le troisième guide longue traîne', sub: `${clientName(C5)} · tâche #158 · échéance 11 sept.`, href: routes.tache(C5, '158') },
  { id: 'T171', type: 'tache', label: 'Renouveler le certificat SSL expiré', sub: `${clientName(C3)} · tâche #171 · en retard`, href: routes.tache(C3, '171') },
  { id: 'T174', type: 'tache', label: "Relire les 2 libellés du rapport d'août", sub: `${clientName(C2)} · tâche #174 · échéance 9 sept.`, href: routes.tache(C2, '174') },
  { id: 'T181', type: 'tache', label: 'Corriger le formulaire de contact mobile', sub: `${clientName(C5)} · tâche #181 · échéance 18 sept.`, href: routes.tache(C5, '181') },
];

const PRIORITE_ITEMS: SearchItem[] = [
  { id: 'P-0611', type: 'priorite', label: 'Certificat SSL expiré depuis 4 jours', sub: `${clientName(C3)} · critique · présence en ligne`, href: routes.priorite(C3, 'p-0611') },
  { id: 'P-0655', type: 'priorite', label: 'Site désindexé par Google depuis la migration', sub: `${clientName(C5)} · critique · SEO`, href: routes.priorite(C5, 'p-0655') },
  { id: 'P-0588', type: 'priorite', label: "robots.txt bloque 80 % du site à l'indexation", sub: `${clientName(C4)} · critique · SEO`, href: routes.priorite(C4, 'p-0588') },
  { id: 'P-0418', type: 'priorite', label: 'LCP mobile à 4,2 s sur 6 pages stratégiques', sub: `${clientName(C1)} · critique · SEO · en traitement`, href: routes.priorite(C1, 'p-0418') },
  { id: 'P-0503', type: 'priorite', label: 'Note Google en baisse : 4,1 vs 4,6', sub: `${clientName(C2)} · important · présence en ligne`, href: routes.priorite(C2, 'p-0503') },
];

const MOTCLE_ITEMS: SearchItem[] = [
  { id: 'K1', type: 'motcle', label: 'toiture montréal', sub: `${clientName(C3)} · position 7 · 1 300 rech./mois`, href: routes.outil('position-tracking') },
  { id: 'K2', type: 'motcle', label: 'réparation toiture urgence', sub: `${clientName(C3)} · position 14 · 480 rech./mois`, href: routes.outil('position-tracking') },
  { id: 'K3', type: 'motcle', label: 'dentiste laval urgence', sub: `${clientName(C4)} · position 3 · 2 100 rech./mois`, href: routes.outil('position-tracking') },
  { id: 'K4', type: 'motcle', label: 'restaurant fondue québec', sub: `${clientName(C2)} · position 5 · 890 rech./mois`, href: routes.outil('position-tracking') },
  { id: 'K5', type: 'motcle', label: 'condo neuf rive-sud', sub: `${clientName(C5)} · position 11 · 1 600 rech./mois`, href: routes.outil('position-tracking') },
];

const RAPPORT_ITEMS: SearchItem[] = [
  { id: 'R1', type: 'rapport', label: `Rapport de septembre 2026 — ${clientName(C1)}`, sub: 'Brouillon · 4 preuves retenues', href: routes.rapport(C1, '2026-09') },
  { id: 'R2', type: 'rapport', label: `Rapport d'août 2026 — ${clientName(C2)}`, sub: 'Bloqué par une relecture · 2 libellés', href: routes.rapport(C2, '2026-08') },
  { id: 'R3', type: 'rapport', label: `Rapport d'août 2026 — ${clientName(C1)}`, sub: 'Publié le 2 septembre · v1 en ligne', href: routes.rapport(C1, '2026-08') },
];

const ETAB_ITEMS: SearchItem[] = [
  { id: 'E1', type: 'etab', label: `${clientName(C3)} — Laval`, sub: 'Fiche Google · 4,3 ★ · 128 avis', href: routes.local() },
  { id: 'E2', type: 'etab', label: `${clientName(C2)} — Québec`, sub: 'Fiche Google · 4,1 ★ · 342 avis', href: routes.local() },
  { id: 'E3', type: 'etab', label: `${clientName(C4)} — Laval`, sub: 'Fiche Google · 4,8 ★ · 96 avis', href: routes.local() },
];

const FACTURE_ITEMS: SearchItem[] = [
  { id: 'F1', type: 'facture', label: `Facture 2026-0431 — ${clientName(C3)}`, sub: '1 850 $ · en retard de 12 jours', href: routes.client(C3) },
  { id: 'F2', type: 'facture', label: `Facture 2026-0428 — ${clientName(C2)}`, sub: '2 400 $ · payée le 3 septembre', href: routes.client(C2) },
  { id: 'F3', type: 'facture', label: `Facture 2026-0440 — ${clientName(C1)}`, sub: '4 200 $ · envoyée, échéance 20 sept.', href: routes.client(C1) },
];

export const HS_INDEX: SearchItem[] = [
  ...CLIENT_ITEMS,
  ...TACHE_ITEMS,
  ...PRIORITE_ITEMS,
  ...MOTCLE_ITEMS,
  ...RAPPORT_ITEMS,
  ...ETAB_ITEMS,
  ...FACTURE_ITEMS,
];

const HS_RECENT_IDS = [C1, 'P-0611', 'T174', 'R2', 'K3'];

export const hsNorm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function hsSearch(q: string): SearchItem[] {
  const n = hsNorm(q.trim());
  if (!n) return [];
  const terms = n.split(/\s+/);
  const score = (it: SearchItem) => {
    const hay = hsNorm(`${it.label} ${it.sub ?? ''} ${it.kw ?? ''} ${it.id}`);
    if (!terms.every((t) => hay.includes(t))) return 0;
    const lab = hsNorm(it.label);
    return lab.startsWith(n) ? 3 : lab.includes(n) ? 2 : 1;
  };
  return [...HS_ACTIONS, ...HS_INDEX]
    .map((it): [SearchItem, number] => [it, score(it)])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([it]) => it);
}

export function hsRecents(): SearchItem[] {
  return HS_RECENT_IDS.map((id) => HS_INDEX.find((x) => x.id === id)).filter((x): x is SearchItem => !!x);
}
