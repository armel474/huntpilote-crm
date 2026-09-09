/**
 * Domain Overview — données de démonstration (session 2.5).
 *
 * Qualifier vite : tout tient dans une vue sans défilement. Douze mois de
 * trafic, la répartition des mots-clés par tranche de position, l'autorité
 * du domaine, les top 5 pages/requêtes et la répartition géographique — utile
 * au Québec pour distinguer un site local d'un site pancanadien.
 */

export type DoBucketId = 'top3' | 'top10' | 'top30' | 'hors';

export type DoTopPage = { url: string; vol: number };
export type DoTopQuery = { q: string; vol: number; pos: number };
export type DoGeo = { region: string; pct: number };

export type DoOverview = {
  traffic: number;
  trafficPrev: number;
  /** 12 points mensuels. */
  trafficHistory: readonly number[];
  keywords: number;
  buckets: Record<DoBucketId, number>;
  authority: number;
  refDomains: number;
  topPages: readonly DoTopPage[];
  topQueries: readonly DoTopQuery[];
  geo: readonly DoGeo[];
};

export const OVERVIEW: DoOverview = {
  traffic: 3400,
  trafficPrev: 2650,
  trafficHistory: [2500, 2600, 2650, 2700, 2900, 3050, 3100, 3200, 3250, 3300, 3350, 3400],
  keywords: 187,
  buckets: { top3: 8, top10: 34, top30: 61, hors: 84 },
  authority: 34,
  refDomains: 214,
  topPages: [
    { url: '/services/toiture-plate', vol: 720 },
    { url: '/', vol: 610 },
    { url: '/blogue/entretien-hiver', vol: 340 },
    { url: '/services/reparation-toiture', vol: 290 },
    { url: '/realisations/', vol: 180 },
  ],
  topQueries: [
    { q: 'toiture montréal', vol: 1900, pos: 7 },
    { q: 'couvreur rive-sud', vol: 520, pos: 6 },
    { q: 'réparation toiture prix', vol: 880, pos: 12 },
    { q: 'toiture urgence fuite', vol: 170, pos: 3 },
    { q: 'combien coûte une toiture', vol: 1400, pos: 24 },
  ],
  geo: [
    { region: 'Québec', pct: 71 },
    { region: 'Ontario', pct: 14 },
    { region: 'Reste du Canada', pct: 9 },
    { region: 'Hors Canada', pct: 6 },
  ],
};

/** Décrochage daté du trafic, injecté à la place de `trafficHistory` pour l'état « chute ». */
export const CHUTE_HISTORY: readonly number[] = [3400, 3350, 3300, 3250, 3200, 1400, 1350, 1300, 1280, 1250, 1230, 1200];
export const CHUTE_DATE = '14 avril 2026';

export const DO_BUCKET_ROWS: readonly [DoBucketId, string, string][] = [
  ['top3', 'Top 3', 'var(--green)'],
  ['top10', 'Top 4–10', 'var(--green-b)'],
  ['top30', 'Top 11–30', 'var(--yellow-b)'],
  ['hors', 'Au-delà', 'var(--bd-strong)'],
];

/** Analyse ponctuelle, hors abonnement : un seul palier de coût. */
export const DO_COST = { credits: 6, dollars: '0,03 $', weight: 'Requête légère' };
export const DO_PERIODS = ['Analyse ponctuelle'] as const;

/** Six états de démonstration, combinés côté écran. */
export const DO_STATES = [
  ['ok', 'Résultats disponibles'],
  ['sansdonnees', 'Domaine sans données'],
  ['chute', 'Chute brutale détectée'],
  ['pipeline', 'Prospect déjà au pipeline'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type DoState = (typeof DO_STATES)[number][0];
