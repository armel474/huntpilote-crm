/**
 * Position Tracking — données de démonstration (session 2.3).
 *
 * Relevé hebdomadaire des mots-clés suivis pour un client. `pos` est la
 * position actuelle (`null` = hors top 100), `prev` la position au relevé
 * précédent (`null` = premier relevé), `history` les huit derniers relevés
 * hebdomadaires. Plus d'une URL dans `urls` signale une cannibalisation.
 *
 * Le coût de cet outil n'est pas facturé à la requête comme les autres :
 * il dépend du nombre de mots-clés suivis pour le compte (`PLAN_TIERS`),
 * d'où l'usage de `costText`/`costTitle` plutôt que `SA_COSTS`-like sur
 * `ContextBar`.
 */

import type { SaveEntry } from '@/lib/data/outils';

export const PT_PERIODS = [
  '4 dernières semaines',
  '12 dernières semaines',
  '26 dernières semaines',
] as const;

/** Objectif « première page » — le seuil qu'affiche chaque mesure de position. */
export const PT_THRESHOLD = 10;

export const PLAN_TIERS: readonly { max: number; price: string }[] = [
  { max: 50, price: 'Inclus au forfait' },
  { max: 150, price: '19,00 $ / mois' },
  { max: 400, price: '49,00 $ / mois' },
];

export const PT_GROUPS = ['Toiture résidentielle', 'Urgence & réparation', 'Marque'] as const;

export type PtIntent = 'Transactionnelle' | 'Informationnelle' | 'Navigationnelle';

export type PtKeyword = {
  c: string;
  group: string;
  intent: PtIntent;
  /** Position actuelle, 1..100+. `null` = hors top 100. */
  pos: number | null;
  /** Position au relevé précédent. `null` = premier relevé pour ce mot-clé. */
  prev: number | null;
  vol: number;
  /** Plus d'une URL = cannibalisation. */
  urls: readonly string[];
  /** Huit relevés hebdomadaires ; `null` = hors classement ce jour-là. */
  history: readonly (number | null)[];
  cannib?: boolean;
  dropped?: boolean;
  isNew?: boolean;
  prio?: string;
};

export const KEYWORDS: readonly PtKeyword[] = [
  {
    c: 'toiture montréal',
    group: 'Toiture résidentielle',
    intent: 'Transactionnelle',
    pos: 7,
    prev: 9,
    vol: 1900,
    urls: ['/services/toiture-plate'],
    history: [14, 13, 13, 12, 11, 10, 9, 7],
  },
  {
    c: 'réparation toiture prix',
    group: 'Toiture résidentielle',
    intent: 'Transactionnelle',
    pos: 12,
    prev: 12,
    vol: 880,
    urls: ['/services/reparation-toiture'],
    history: [12, 13, 12, 11, 13, 12, 12, 12],
    prio: 'P-0431',
  },
  {
    c: 'soumission toiture rive-sud',
    group: 'Toiture résidentielle',
    intent: 'Transactionnelle',
    pos: null,
    prev: 34,
    vol: 640,
    urls: [],
    history: [28, 30, 32, 40, 70, null, null, null],
    dropped: true,
  },
  {
    c: 'couvreur rive-sud',
    group: 'Urgence & réparation',
    intent: 'Transactionnelle',
    pos: 6,
    prev: 6,
    vol: 520,
    urls: ['/services/'],
    history: [7, 6, 7, 6, 6, 6, 6, 6],
  },
  {
    c: 'toiture urgence fuite',
    group: 'Urgence & réparation',
    intent: 'Transactionnelle',
    pos: 3,
    prev: 5,
    vol: 170,
    urls: ['/services/urgence'],
    history: [8, 7, 6, 6, 5, 5, 4, 3],
  },
  {
    c: 'entretien toiture hiver',
    group: 'Urgence & réparation',
    intent: 'Informationnelle',
    pos: 14,
    prev: 11,
    vol: 210,
    urls: ['/blogue/entretien-hiver'],
    history: [10, 10, 11, 10, 11, 11, 12, 14],
  },
  {
    c: 'fuite toiture que faire',
    group: 'Urgence & réparation',
    intent: 'Informationnelle',
    pos: 9,
    prev: 9,
    vol: 260,
    urls: ['/blogue/fuite-toiture', '/services/urgence'],
    history: [11, 10, 10, 9, 9, 10, 9, 9],
    cannib: true,
  },
  {
    c: 'bardeau asphalte prix',
    group: 'Toiture résidentielle',
    intent: 'Transactionnelle',
    pos: 19,
    prev: 15,
    vol: 320,
    urls: ['/services/bardeau-asphalte'],
    history: [13, 14, 13, 14, 15, 16, 17, 19],
  },
  {
    c: 'toiture acme corp',
    group: 'Marque',
    intent: 'Navigationnelle',
    pos: 1,
    prev: 1,
    vol: 90,
    urls: ['/'],
    history: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    c: 'avis toiture acme',
    group: 'Marque',
    intent: 'Navigationnelle',
    pos: 2,
    prev: 4,
    vol: 60,
    urls: ['/avis'],
    history: [6, 5, 5, 4, 4, 3, 3, 2],
  },
  {
    c: 'inspection toiture drone',
    group: 'Toiture résidentielle',
    intent: 'Informationnelle',
    pos: 8,
    prev: null,
    vol: 140,
    urls: ['/services/inspection-drone'],
    history: [8],
    isNew: true,
  },
];

export const PT_SAVES: readonly SaveEntry[] = [
  { date: '4 sept. 2026', tool: 'Position Tracking', what: '11 mots-clés · relevé hebdomadaire' },
  { date: '28 août 2026', tool: 'Position Tracking', what: '11 mots-clés · +2 en top 10' },
];

/** Huit états de démonstration, combinés côté écran comme pour Site Audit. */
export const PT_STATES = [
  ['ok', 'Résultats disponibles'],
  ['vide', 'Aucun mot-clé suivi'],
  ['premier', 'Premier relevé · rien à comparer'],
  ['encours', 'Relevé hebdomadaire en cours'],
  ['sorti', 'Mot-clé sorti du classement'],
  ['cannib', 'Cannibalisation détectée'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type PtState = (typeof PT_STATES)[number][0];
