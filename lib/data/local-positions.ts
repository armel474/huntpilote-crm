/**
 * SEO local · Positions locales — données de démonstration (session 3.3).
 *
 * La position varie selon l'endroit d'où l'on cherche : la carte porte une
 * mesure par point ou par secteur, jamais un chiffre moyen unique.
 */

export const POS_THRESHOLD = 'Seuil : ≤ 3 (visible dans le pack local)';

export type KeywordPos = {
  q: string;
  posMoy: number;
  posMin: number;
  posMax: number;
  prevMoy: number;
};

export type ZoneRead = { forts: string[]; faibles: string[] };

export type PositionsData =
  | {
      mode: 'grille';
      rows: number;
      cols: number;
      spacingKm: number;
      grid: (number | null)[][];
      keywords: KeywordPos[];
      zoneRead: ZoneRead;
    }
  | {
      mode: 'secteurs';
      secteurs: { nom: string; pos: number | null }[];
      keywords: KeywordPos[];
      zoneRead: ZoneRead;
    };

export const POSITIONS_BY_ETAB: Record<string, PositionsData> = {
  marchebio: {
    mode: 'grille',
    rows: 5,
    cols: 5,
    spacingKm: 1.2,
    grid: [
      [null, 9, 6, 11, null],
      [8, 4, 2, 5, 9],
      [5, 2, 1, 3, 7],
      [7, 3, 2, 4, 8],
      [null, 8, 5, 9, null],
    ],
    keywords: [
      { q: 'épicerie bio repentigny', posMoy: 5.4, posMin: 1, posMax: 14, prevMoy: 2.1 },
      { q: 'produits bio repentigny', posMoy: 6.1, posMin: 2, posMax: 15, prevMoy: 5.8 },
      { q: 'marché bio près de moi', posMoy: 4.2, posMin: 1, posMax: 10, prevMoy: 4.5 },
      { q: 'épicerie fine repentigny', posMoy: 8.9, posMin: 3, posMax: 20, prevMoy: 6.2 },
    ],
    zoneRead: { forts: ['Centre-ville de Repentigny', 'Le Gardeur'], faibles: ['L’Assomption (limite nord)', 'Charlemagne (limite est)'] },
  },
  'boreal-qc': {
    mode: 'secteurs',
    secteurs: [
      { nom: 'Québec (centre)', pos: 1 },
      { nom: 'Sainte-Foy', pos: 2 },
      { nom: 'Lévis', pos: 3 },
      { nom: 'Beauport', pos: 2 },
      { nom: 'Charlesbourg', pos: 4 },
    ],
    keywords: [
      { q: 'agence immobilière québec', posMoy: 1.8, posMin: 1, posMax: 3, prevMoy: 2.0 },
      { q: 'vendre maison québec', posMoy: 2.4, posMin: 1, posMax: 4, prevMoy: 2.6 },
      { q: 'courtier immobilier sainte-foy', posMoy: 2.0, posMin: 1, posMax: 3, prevMoy: 2.2 },
    ],
    zoneRead: { forts: ['Québec (centre)', 'Sainte-Foy'], faibles: ['Charlesbourg'] },
  },
};
