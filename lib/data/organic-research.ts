/**
 * Organic Research — données de démonstration (session 2.5).
 *
 * Creuser avant de proposer : évolution du trafic et des positions sur 12 à
 * 24 mois avec les décrochages datés, les requêtes positionnées filtrables,
 * les pages qui performent ou reculent, et le potentiel chiffré — le nombre
 * qui va dans la proposition commerciale.
 */

import type { SaveEntry } from '@/lib/data/outils';

export type OrQuery = { c: string; vol: number; pos: number; page: string };
export type OrPageMove = { url: string; delta: number };
export type OrDrop = { month: number; date: string; label: string };

/** 24 points mensuels de trafic et de position moyenne — état « chute ». */
export const OR_TRAFFIC: readonly number[] = [
  1800, 1850, 1900, 2100, 2200, 2300, 2450, 2500, 2600, 2700, 2750, 2800, 2900, 950, 1000, 1050, 1080, 1100, 1150,
  1180, 1200, 1220, 1250, 1280,
];
export const OR_POS: readonly number[] = [
  22, 21, 20, 18, 17, 16, 15, 14, 13, 12, 12, 11, 11, 38, 36, 34, 33, 32, 31, 30, 29, 28, 27, 26,
];
export const OR_DROP: OrDrop = { month: 13, date: '2 juin 2025', label: 'Migration de plateforme sans redirections 301' };

/** Même fenêtre de 24 mois, sans décrochage — état « ok ». */
export const OR_TRAFFIC_OK: readonly number[] = [
  1800, 1850, 1900, 2100, 2200, 2300, 2450, 2500, 2600, 2700, 2750, 2800, 2900, 2950, 3050, 3100, 3180, 3220, 3300,
  3350, 3400, 3450, 3500, 3560,
];
export const OR_POS_OK: readonly number[] = [
  22, 21, 20, 18, 17, 16, 15, 14, 13, 12, 12, 11, 11, 10, 10, 9, 9, 9, 8, 8, 8, 7, 7, 7,
];

export const QUERIES: readonly OrQuery[] = [
  { c: 'toiture montréal', vol: 1900, pos: 7, page: '/services/toiture-plate' },
  { c: 'réparation toiture prix', vol: 880, pos: 12, page: '/services/reparation-toiture' },
  { c: 'combien coûte une toiture', vol: 1400, pos: 24, page: '/blogue/prix-toiture' },
  { c: 'couvreur rive-sud', vol: 520, pos: 6, page: '/services/' },
  { c: 'toiture urgence fuite', vol: 170, pos: 3, page: '/services/urgence' },
  { c: 'entretien toiture hiver', vol: 210, pos: 14, page: '/blogue/entretien-hiver' },
  { c: 'bardeau asphalte prix', vol: 320, pos: 19, page: '/services/bardeau-asphalte' },
  { c: 'toiture verte avantages', vol: 150, pos: 44, page: '/blogue/toiture-verte' },
];

/** Pages qui progressent vs qui reculent, sur la période affichée. */
export const PAGES_UP: readonly OrPageMove[] = [
  { url: '/services/toiture-plate', delta: 34 },
  { url: '/blogue/entretien-hiver', delta: 21 },
  { url: '/services/urgence', delta: 12 },
];
export const PAGES_DOWN: readonly OrPageMove[] = [
  { url: '/blogue/prix-toiture', delta: -46 },
  { url: '/realisations/', delta: -28 },
  { url: '/a-propos/', delta: -9 },
];

/** Potentiel : requêtes en position 4-10, valeur estimée si elles passaient en top 3 (CTR ×2,4 approximatif). */
export const POTENTIAL_ROWS: readonly OrQuery[] = QUERIES.filter((q) => q.pos >= 4 && q.pos <= 10);
export const CTR_MULT = 2.4;

export const OR_SAVES: readonly SaveEntry[] = [
  { date: '20 juil. 2026', tool: 'Organic Research', what: 'Audit de prospect généré et partagé' },
];

/** Analyse approfondie, hors abonnement : un seul palier de coût. */
export const OR_COST = { credits: 62, dollars: '0,31 $', weight: 'Requête lourde' };
export const OR_PERIODS = ['12–24 mois'] as const;

/** Six états de démonstration, combinés côté écran. */
export const OR_STATES = [
  ['ok', 'Résultats disponibles'],
  ['chute', 'Chute brutale détectée'],
  ['quota', 'Quota insuffisant pour l’analyse profonde'],
  ['pipeline', 'Prospect déjà au pipeline'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type OrState = (typeof OR_STATES)[number][0];
