/**
 * Données de démonstration du Dashboard.
 * Reprises telles quelles des maquettes ; à remplacer par les appels
 * DataForSEO / Google (GA4, GSC) au branchement des intégrations.
 */
import { ALL_TASKS } from '@/lib/data/plan-travail';
import { CLIENTS } from '@/lib/data/clients';

export const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
] as const;

/** Revenu mensuel : `r` = réalisé (null au-delà du mois courant), `p` = prévision. */
export const REVENUE: readonly { r: number | null; p: number }[] = [
  { r: 38, p: 36 },
  { r: 42, p: 41 },
  { r: 45, p: 44 },
  { r: 43, p: 47 },
  { r: 51, p: 50 },
  { r: 58, p: 54 },
  { r: 54, p: 57 },
  { r: 48, p: 60 },
  { r: 62, p: 63 },
  { r: null, p: 68 },
  { r: null, p: 72 },
  { r: null, p: 76 },
];

/** Index du dernier mois réalisé — sépare l'historique de la prévision. */
export const LAST_ACTUAL_INDEX = REVENUE.findLastIndex((d) => d.r !== null);

export const CLIENT_PERF = [
  { id: 'acme-corp', name: 'Acme Corp.', score: 92, delta: 5, sessions: '12 400' },
  { id: 'dupont-sas', name: 'Dupont SAS', score: 78, delta: -2, sessions: '8 150' },
  { id: 'novatech', name: 'Novatech', score: 85, delta: 8, sessions: '9 620' },
  { id: 'le-marche-bio', name: 'Le Marché Bio', score: 71, delta: 3, sessions: '4 730' },
] as const;

export type Task = { id: string; text: string; done: boolean };

/**
 * Même source que /travail (ALL_TASKS, lib/data/plan-travail.ts) — cocher une
 * tâche ici et là-bas doivent partir du même portefeuille, pas de deux jeux de
 * données parallèles qui peuvent se désynchroniser.
 */
const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;

const toTask = (t: (typeof ALL_TASKS)[number]): Task => ({
  id: t.id,
  text: `${t.title} — ${clientName(t.clientId)}`,
  done: t.status === 'termine',
});

export const TODAY_TASKS: readonly Task[] = ALL_TASKS.filter(
  (t) => t.bucket === 'aujourdhui' || t.bucket === 'retard',
).map(toTask);

export const WEEK_TASKS: readonly Task[] = ALL_TASKS.filter((t) => t.bucket === 'semaine').map(toTask);

export const TRAFFIC_SPARKLINE = [
  22900, 25400, 24100, 27800, 29300, 28100, 31400, 30200, 33100, 34820,
] as const;

export const TRAFFIC_STATS = [
  { label: 'Positions top 10', value: '142' },
  { label: 'Clics organiques', value: '5 284' },
  { label: 'CTR moyen', value: '3.4%' },
] as const;

/**
 * Résumé agrégé portefeuille — devis en attente et messages non lus (session 8.1).
 *
 * `lib/data/devis.ts` et `lib/data/communications.ts` ne modélisent en détail
 * que le compte Acme Corp. — aucune fiche aussi riche n'existe pour les autres
 * clients aujourd'hui (voir `docs/briefs/README.md`, phase 8). Ces deux listes
 * sont donc volontairement légères : juste assez pour peupler deux compteurs
 * portefeuille sur de vrais comptes de `CLIENTS`, sans construire un second
 * jeu de devis/communications détaillé par client. Chaque ligne mène vers la
 * fiche générale du client (`routes.client`), seule adressable aujourd'hui —
 * il n'existe pas encore de route séparée par onglet (Contrat & facturation /
 * Communications).
 */
export type DashQuote = { clientId: string; label: string; amount: number };

export const DASH_QUOTES_PENDING: readonly DashQuote[] = [
  { clientId: 'dupont-sas', label: 'Ajout d’une page services régionale', amount: 850 },
  { clientId: 'boreal-immobilier', label: 'Campagne de contenu par quartier', amount: 1200 },
  { clientId: 'clinique-lavoie', label: 'Refonte de la page tarifs', amount: 600 },
];

export type DashThread = { clientId: string; unread: number };

export const DASH_THREADS_UNREAD: readonly DashThread[] = [
  { clientId: 'le-marche-bio', unread: 2 },
  { clientId: 'boreal-immobilier', unread: 1 },
  { clientId: 'dupont-sas', unread: 1 },
];
