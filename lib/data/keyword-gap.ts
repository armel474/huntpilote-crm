/**
 * Keyword Gap — données de démonstration (session 2.4).
 *
 * Compare le client à ses concurrents sur quatre catégories : requêtes
 * manquantes, faibles, fortes, uniques. Alimente la carte Concurrence de la
 * fiche. Résultat éphémère — cache 30 jours puis purge.
 */

import type { Tone } from '@/components/ui/Atoms';
import type { SaveEntry } from '@/lib/data/outils';

export type KgCompetitor = { domain: string; name: string; noData?: boolean };

/** Jusqu'à trois concurrents comparés, pré-remplis depuis la fiche si renseignés. */
export const DEFAULT_COMPETITORS: readonly KgCompetitor[] = [
  { domain: 'couvreur-rive-sud.ca', name: 'Couvreur Rive-Sud Inc.' },
  { domain: 'toitures-estrie.ca', name: 'Toitures Estrie' },
];

export type KgCategoryId = 'manquants' | 'faibles' | 'forts' | 'uniques';

export type KgCategory = {
  id: KgCategoryId;
  label: string;
  sub: string;
  tone: Tone;
};

export const KG_CATEGORIES: readonly KgCategory[] = [
  { id: 'manquants', label: 'Manquants', sub: 'Les concurrents s’y positionnent, pas vous', tone: 'red' },
  { id: 'faibles', label: 'Faibles', sub: 'Vous êtes présent mais derrière', tone: 'yellow' },
  { id: 'forts', label: 'Forts', sub: 'Vous devancez les concurrents suivis', tone: 'green' },
  { id: 'uniques', label: 'Uniques', sub: 'Vous seul y êtes positionné', tone: 'blue' },
];

/** `posClient` / `posComps[i]` : `null` = non classé. `posComps` est aligné sur l'ordre des concurrents actifs. */
export type KgRow = {
  c: string;
  vol: number;
  posClient: number | null;
  posComps: readonly (number | null)[];
};

export const KG_ROWS: Record<KgCategoryId, readonly KgRow[]> = {
  manquants: [
    { c: 'assurance toiture dommage', vol: 480, posClient: null, posComps: [3, 9] },
    { c: 'permis toiture municipal', vol: 320, posClient: null, posComps: [8, 14] },
    { c: 'toiture verte avantages', vol: 210, posClient: null, posComps: [5, null] },
  ],
  faibles: [
    { c: 'toiture montréal', vol: 1900, posClient: 7, posComps: [3, 15] },
    { c: 'bardeau asphalte prix', vol: 320, posClient: 19, posComps: [8, 22] },
  ],
  forts: [
    { c: 'couvreur rive-sud', vol: 520, posClient: 6, posComps: [11, 9] },
    { c: 'toiture urgence fuite', vol: 170, posClient: 3, posComps: [14, null] },
  ],
  uniques: [
    { c: 'inspection toiture drone', vol: 140, posClient: 8, posComps: [null, null] },
    { c: 'avis toiture acme', vol: 60, posClient: 2, posComps: [null, null] },
  ],
};

/** Volume à partir duquel un manquant est mis en avant — c'est ce qu'on vient chercher. */
export const KG_VOL_FORT = 400;

export const KG_SAVES: readonly SaveEntry[] = [
  { date: '15 août 2026', tool: 'Keyword Gap', what: '3 concurrents comparés · carte Concurrence mise à jour' },
];

/** Six états de démonstration, combinés côté écran avec le sélecteur de compte. */
export const KG_STATES = [
  ['ok', 'Résultats disponibles'],
  ['aucun', 'Aucun concurrent renseigné'],
  ['sansdonnees', 'Concurrent sans données'],
  ['recoupement', 'Recoupement nul'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type KgState = (typeof KG_STATES)[number][0];
