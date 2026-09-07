/**
 * Données de démonstration du Dashboard.
 * Reprises telles quelles des maquettes ; à remplacer par les appels
 * DataForSEO / Google (GA4, GSC) au branchement des intégrations.
 */

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
  { name: 'Acme Corp.', score: 92, delta: 5, sessions: '12 400' },
  { name: 'Dupont SAS', score: 78, delta: -2, sessions: '8 150' },
  { name: 'Novatech', score: 85, delta: 8, sessions: '9 620' },
  { name: 'Le Marché Bio', score: 71, delta: 3, sessions: '4 730' },
] as const;

export type Task = { id: number; text: string; done: boolean };

export const TODAY_TASKS: readonly Task[] = [
  { id: 1, text: 'Optimiser meta tags — Acme Corp.', done: false },
  { id: 2, text: 'Publier 3 articles de blog — Novatech', done: true },
  { id: 3, text: 'Corriger erreurs 404 — Le Marché Bio', done: false },
  { id: 4, text: 'Envoyer rapport mensuel — Dupont SAS', done: false },
];

export const WEEK_TASKS: readonly Task[] = [
  { id: 5, text: 'Réviser stratégie de mots-clés', done: false },
  { id: 6, text: 'Configurer Google Search Console', done: false },
  { id: 7, text: 'Analyse concurrents top 5', done: false },
  { id: 8, text: 'Présentation résultats — Paris Médias', done: false },
];

export const TRAFFIC_SPARKLINE = [
  22900, 25400, 24100, 27800, 29300, 28100, 31400, 30200, 33100, 34820,
] as const;

export const TRAFFIC_STATS = [
  { label: 'Positions top 10', value: '142' },
  { label: 'Clics organiques', value: '5 284' },
  { label: 'CTR moyen', value: '3.4%' },
] as const;
