/**
 * Mon plan de travail — données de démonstration (session 4.1).
 *
 * Premier écran « transversal » du cockpit : toutes mes tâches, tous clients
 * confondus, triées par échéance plutôt que par compte. Jusqu'ici l'app ne
 * portait aucun jeu de tâches agrégé — seulement les deux tâches complètes de
 * `tache.ts` (détail 1.2) et la liste `PRIORITIES` d'un seul client dans
 * `fiche-client.ts`. Ce fichier construit l'inventaire qui manquait, en
 * réutilisant l'équipe déjà déclarée dans `settings.ts` et de vrais comptes de
 * `clients.ts` — jamais de client inventé.
 *
 * Deux tâches ci-dessous (#142, #151) sont les tâches réellement détaillées
 * en 1.2 (`TASK_TECH`, `TASK_CONTENT`) : leurs lignes ouvrent un vrai écran
 * de détail. Les autres pointent vers `routes.tache`/`routes.priorite` avec
 * des identifiants plausibles qui n'ont pas encore de détail livré — un écart
 * pré-existant du jeu de données, pas quelque chose que cet écran corrige.
 */

import type { Severity } from '@/lib/data/priorite';
import { TEAM } from '@/lib/data/settings';

/* ── Équipe — reprise telle quelle, pas de second roster ── */

export const PT_TEAM = TEAM;
export const PT_ME = TEAM.find((m) => 'you' in m && m.you) ?? TEAM[0];

/** Heures disponibles pour un membre sur une semaine normale — seuil de charge. */
export const PT_CAPACITY = 32;

/* ── Format ── */

/** Formate un nombre d'heures décimal en « 4 h » ou « 1,5 h ». */
export function fmtEffort(h: number): string {
  return h % 1 === 0 ? `${h} h` : `${String(h).replace('.', ',')} h`;
}

/* ── Cycle de vie ── */

export type TacheBucket = 'retard' | 'aujourdhui' | 'semaine' | 'plustard';

export const BUCKET_META: Record<TacheBucket, { label: string; tone: 'red' | 'blue' | 'neutral' }> = {
  retard: { label: 'En retard', tone: 'red' },
  aujourdhui: { label: 'Aujourd’hui', tone: 'blue' },
  semaine: { label: 'Cette semaine', tone: 'neutral' },
  plustard: { label: 'Plus tard', tone: 'neutral' },
};

export type TaskRowStatus = 'afaire' | 'encours' | 'retard' | 'bloquee' | 'termine';

export type TaskPrioRef = { id: string; slug: string; label: string; sev: Severity };

export type TaskSummary = {
  /** Identifiant affiché, format `#142`. */
  id: string;
  /** Segment d'URL vers `routes.tache(clientId, slug)`. */
  slug: string;
  title: string;
  /** Vrai compte de `lib/data/clients.ts`. */
  clientId: string;
  /** `null` pour une tâche créée à la main, sans priorité source. */
  prio: TaskPrioRef | null;
  due: string;
  bucket: TacheBucket;
  /** Jours de retard, uniquement pour `bucket === 'retard'`. */
  overdueDays?: number;
  /** Effort estimé restant cette semaine, en heures. */
  effort: number;
  /** Initiales — doit correspondre à un membre de `PT_TEAM`. */
  assignee: string;
  status: TaskRowStatus;
  blockedReason?: string;
};

/**
 * Tâches ouvertes, tous clients confondus. #142 et #151 sont les tâches
 * complètes de la session 1.2 (mêmes id/slug que `TASK_TECH`/`TASK_CONTENT`) :
 * elles seules mènent à un vrai détail de tâche.
 */
export const ALL_TASKS: TaskSummary[] = [
  {
    id: '#142',
    slug: '142',
    title: 'Optimiser le LCP mobile — 6 pages stratégiques',
    clientId: 'acme-corp',
    prio: { id: 'P-0418', slug: 'p-0418', label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques', sev: 'critique' },
    due: '20 sept. 2026',
    bucket: 'plustard',
    effort: 4,
    assignee: 'MC',
    status: 'encours',
  },
  {
    id: '#163',
    slug: '163',
    title: 'Répondre à 3 avis Google négatifs',
    clientId: 'le-marche-bio',
    prio: { id: 'P-0552', slug: 'p-0552', label: 'Note moyenne en baisse sur Google', sev: 'important' },
    due: 'Aujourd’hui',
    bucket: 'aujourdhui',
    effort: 1,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#171',
    slug: '171',
    title: 'Publier le guide Core Web Vitals',
    clientId: 'acme-corp',
    prio: null,
    due: 'Aujourd’hui',
    bucket: 'aujourdhui',
    effort: 2,
    assignee: 'MC',
    status: 'bloquee',
    blockedReason: 'En attente de relecture juridique du client',
  },
  {
    id: '#164',
    slug: '164',
    title: 'Publier la page Services — toiture commerciale',
    clientId: 'dupont-sas',
    prio: { id: 'P-0601', slug: 'p-0601', label: 'Aucune page pour la toiture commerciale', sev: 'opportunite' },
    due: 'Vendredi 11 sept.',
    bucket: 'semaine',
    effort: 3,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#165',
    slug: '165',
    title: 'Corriger 12 balises title dupliquées',
    clientId: 'clinique-lavoie',
    prio: { id: 'P-0577', slug: 'p-0577', label: '12 balises title dupliquées', sev: 'important' },
    due: 'Vendredi 11 sept.',
    bucket: 'semaine',
    effort: 2,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#166',
    slug: '166',
    title: 'Optimiser les images héros restantes (WebP)',
    clientId: 'acme-corp',
    prio: { id: 'P-0418', slug: 'p-0418', label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques', sev: 'critique' },
    due: 'Vendredi 11 sept.',
    bucket: 'semaine',
    effort: 3,
    assignee: 'MC',
    status: 'bloquee',
    blockedReason: 'En attente d’accès FTP du client',
  },
  {
    id: '#167',
    slug: '167',
    title: 'Ajouter le maillage interne vers les pages quartiers',
    clientId: 'boreal-immobilier',
    prio: null,
    due: 'Dimanche 13 sept.',
    bucket: 'semaine',
    effort: 2,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#168',
    slug: '168',
    title: 'Refaire les métadonnées OG pour le partage social',
    clientId: 'acme-corp',
    prio: { id: 'P-0439', slug: 'p-0439', label: 'Métadonnées OG absentes pour le partage social', sev: 'opportunite' },
    due: '22 sept.',
    bucket: 'plustard',
    effort: 1.5,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#169',
    slug: '169',
    title: 'Migrer les redirections 301 après la refonte',
    clientId: 'le-marche-bio',
    prio: { id: 'P-0560', slug: 'p-0560', label: '48 pages en 404 depuis la refonte de mai', sev: 'critique' },
    due: '30 sept.',
    bucket: 'plustard',
    effort: 5,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#170',
    slug: '170',
    title: 'Corriger le certificat SSL expiré',
    clientId: 'dupont-sas',
    prio: { id: 'P-0611', slug: 'p-0611', label: 'Certificat SSL expiré depuis 4 jours', sev: 'critique' },
    due: 'En retard depuis 4 jours',
    bucket: 'retard',
    overdueDays: 4,
    effort: 1,
    assignee: 'MC',
    status: 'retard',
  },
  {
    id: '#172',
    slug: '172',
    title: 'Restaurer l’indexation après blocage robots.txt',
    clientId: 'clinique-lavoie',
    prio: { id: 'P-0588', slug: 'p-0588', label: 'robots.txt bloque 80 % du site à l’indexation', sev: 'critique' },
    due: 'En retard depuis 6 jours',
    bucket: 'retard',
    overdueDays: 6,
    effort: 2,
    assignee: 'MC',
    status: 'retard',
  },
  {
    id: '#173',
    slug: '173',
    title: 'Relancer le crawl après échec (429)',
    clientId: 'acme-corp',
    prio: { id: 'P-0421', slug: 'p-0421', label: 'Crawl interrompu après 128 pages (HTTP 429)', sev: 'important' },
    due: 'En retard depuis 2 jours',
    bucket: 'retard',
    overdueDays: 2,
    effort: 1,
    assignee: 'MC',
    status: 'retard',
  },
  {
    id: '#151',
    slug: '151',
    title: 'Publier 3 articles longue traîne — guides d’audit',
    clientId: 'acme-corp',
    prio: { id: 'P-0431', slug: 'p-0426', label: '45 mots-clés longue traîne inexploités', sev: 'opportunite' },
    due: '30 sept. 2026',
    bucket: 'plustard',
    effort: 3,
    assignee: 'MC',
    status: 'encours',
  },
];

/** Tâches en plus pour illustrer une semaine surchargée. */
export const EXTRA_SURCHARGE: TaskSummary[] = [
  {
    id: '#174',
    slug: '174',
    title: 'Refonte du maillage interne — 40 pages',
    clientId: 'boreal-immobilier',
    prio: { id: 'P-0630', slug: 'p-0630', label: 'Maillage interne absent sur 40 pages quartiers', sev: 'important' },
    due: 'Vendredi 11 sept.',
    bucket: 'semaine',
    effort: 8,
    assignee: 'MC',
    status: 'afaire',
  },
  {
    id: '#175',
    slug: '175',
    title: 'Audit de contenu concurrentiel — 3 concurrents',
    clientId: 'le-marche-bio',
    prio: null,
    due: 'Dimanche 13 sept.',
    bucket: 'semaine',
    effort: 6,
    assignee: 'MC',
    status: 'afaire',
  },
];

export type PtScenarioId = 'normal' | 'vide' | 'surcharge' | 'retard' | 'bloquees';

export const PT_SCENARIOS: [PtScenarioId, string][] = [
  ['normal', 'Semaine normale'],
  ['vide', 'Aucune tâche'],
  ['surcharge', 'Semaine surchargée'],
  ['retard', 'Tâches en retard'],
  ['bloquees', 'Tâches bloquées'],
];

export function ptScenario(id: PtScenarioId): TaskSummary[] {
  if (id === 'vide') return [];
  if (id === 'surcharge') return [...ALL_TASKS, ...EXTRA_SURCHARGE];
  if (id === 'retard') return ALL_TASKS.filter((t) => t.bucket === 'retard');
  if (id === 'bloquees') return ALL_TASKS.filter((t) => t.status === 'bloquee');
  return ALL_TASKS;
}
