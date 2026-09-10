/* HuntPilote — SEO local · Positions locales : données de démonstration (pack local, variable selon la zone). */
const POS_THRESHOLD = 'Seuil : ≤ 3 (visible dans le pack local)';

const POSITIONS_BY_ETAB = {
  marchebio: {
    mode: 'grille', rows: 5, cols: 5, spacingKm: 1.2,
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
    mode: 'secteurs', secteurs: [{ nom: 'Québec (centre)', pos: 1 }, { nom: 'Sainte-Foy', pos: 2 }, { nom: 'Lévis', pos: 3 }, { nom: 'Beauport', pos: 2 }, { nom: 'Charlesbourg', pos: 4 }],
    keywords: [
      { q: 'agence immobilière québec', posMoy: 1.8, posMin: 1, posMax: 3, prevMoy: 2.0 },
      { q: 'vendre maison québec', posMoy: 2.4, posMin: 1, posMax: 4, prevMoy: 2.6 },
      { q: 'courtier immobilier sainte-foy', posMoy: 2.0, posMin: 1, posMax: 3, prevMoy: 2.2 },
    ],
    zoneRead: { forts: ['Québec (centre)', 'Sainte-Foy'], faibles: ['Charlesbourg'] },
  },
};

Object.assign(window, { POS_THRESHOLD, POSITIONS_BY_ETAB });
