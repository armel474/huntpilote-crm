/**
 * Keyword Hunter — données de démonstration (session 2.4).
 *
 * Trouve des requêtes à cibler à partir d'un mot-clé racine, d'une URL ou
 * d'un thème. Résultat éphémère — cache 30 jours puis purge — regroupé par
 * thème pour rester exploitable : une liste de 400 requêtes ne l'est pas,
 * trois sujets d'articles le sont.
 */

import type { Tone } from '@/components/ui/Atoms';
import type { SaveEntry } from '@/lib/data/outils';

export const KH_INTENTS = ['Informationnelle', 'Commerciale', 'Transactionnelle'] as const;
export type KhIntent = (typeof KH_INTENTS)[number];

export type KhTrendId = 'hiver' | 'ete' | 'stable';

export const KH_TREND: Record<KhTrendId, { label: string }> = {
  hiver: { label: 'Pic en hiver' },
  ete: { label: 'Pic en été' },
  stable: { label: 'Stable à l’année' },
};

/** `diff` = difficulté estimée 0–100. `words` = longueur de la requête en mots. */
export type KhSuggestion = {
  c: string;
  theme: string;
  vol: number;
  diff: number;
  intent: KhIntent;
  trend: KhTrendId;
  words: number;
  question: boolean;
};

export const SUGGESTIONS: readonly KhSuggestion[] = [
  { c: 'toiture résidentielle prix moyen', theme: 'Toiture résidentielle — prix et matériaux', vol: 720, diff: 38, intent: 'Commerciale', trend: 'stable', words: 4, question: false },
  { c: 'bardeau asphalte vs métal', theme: 'Toiture résidentielle — prix et matériaux', vol: 390, diff: 44, intent: 'Commerciale', trend: 'ete', words: 4, question: false },
  { c: 'combien coûte une toiture', theme: 'Toiture résidentielle — prix et matériaux', vol: 1400, diff: 52, intent: 'Commerciale', trend: 'stable', words: 4, question: true },
  { c: 'toiture plate ou pente', theme: 'Toiture résidentielle — prix et matériaux', vol: 260, diff: 41, intent: 'Informationnelle', trend: 'stable', words: 4, question: false },
  { c: 'durée de vie toiture bardeau', theme: 'Toiture résidentielle — prix et matériaux', vol: 310, diff: 33, intent: 'Informationnelle', trend: 'stable', words: 5, question: false },
  { c: 'toiture urgence 24h rive-sud', theme: 'Urgence et réparation', vol: 480, diff: 29, intent: 'Transactionnelle', trend: 'hiver', words: 5, question: false },
  { c: 'que faire fuite toiture', theme: 'Urgence et réparation', vol: 890, diff: 24, intent: 'Informationnelle', trend: 'hiver', words: 4, question: true },
  { c: 'réparation toiture urgente prix', theme: 'Urgence et réparation', vol: 340, diff: 36, intent: 'Transactionnelle', trend: 'hiver', words: 4, question: false },
  { c: 'toiture endommagée grêle assurance', theme: 'Urgence et réparation', vol: 210, diff: 47, intent: 'Commerciale', trend: 'ete', words: 4, question: false },
  { c: 'signes toiture à refaire', theme: 'Questions fréquentes sur la toiture', vol: 590, diff: 27, intent: 'Informationnelle', trend: 'stable', words: 4, question: false },
  { c: 'combien de temps pour refaire une toiture', theme: 'Questions fréquentes sur la toiture', vol: 320, diff: 22, intent: 'Informationnelle', trend: 'stable', words: 7, question: true },
  { c: 'faut-il un permis pour changer sa toiture', theme: 'Questions fréquentes sur la toiture', vol: 410, diff: 31, intent: 'Informationnelle', trend: 'stable', words: 7, question: true },
  { c: 'qui appeler pour une fuite de toit', theme: 'Questions fréquentes sur la toiture', vol: 260, diff: 19, intent: 'Informationnelle', trend: 'hiver', words: 7, question: true },
  { c: 'toiture verte avantages', theme: 'Questions fréquentes sur la toiture', vol: 150, diff: 45, intent: 'Informationnelle', trend: 'ete', words: 3, question: false },
];

export const KH_SAVES: readonly SaveEntry[] = [
  { date: '2 sept. 2026', tool: 'Keyword Hunter', what: '8 requêtes sélectionnées · brief « Urgence et réparation »' },
];

export type KhFilters = {
  volMin: number;
  diffMax: number;
  intent: 'toutes' | KhIntent;
  length: 'toutes' | 'courte' | 'longue';
  question: boolean;
};

export const KH_FILTERS_DEFAULT: KhFilters = {
  volMin: 0,
  diffMax: 100,
  intent: 'toutes',
  length: 'toutes',
  question: false,
};

/** Cinq états de démonstration, combinés côté écran avec le sélecteur de compte. */
export const KH_STATES = [
  ['ok', 'Résultats disponibles'],
  ['recherche', 'Exploration en cours'],
  ['vide', 'Aucun résultat pour ce départ'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type KhState = (typeof KH_STATES)[number][0];

/** Couleur de la difficulté : facile, moyenne, difficile. */
export function diffTone(d: number): Tone {
  return d <= 40 ? 'green' : d <= 60 ? 'yellow' : 'red';
}
