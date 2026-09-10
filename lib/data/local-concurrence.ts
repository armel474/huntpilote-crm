/**
 * SEO local · Concurrence locale — données de démonstration (session 3.3).
 */

export type CompetitorGap = { levier: string; vous: string; concurrent: string; action: string };

export type Competitor = {
  name: string;
  freq: number;
  freqTotal: number;
  note: number;
  nbAvis: number;
  completude: number;
  categories: string[];
  recoupement: { requetes: string[]; secteurs: string[] };
  ecarts: CompetitorGap[];
};

export type ConcurrenceData = { competitors: Competitor[] };

export const CONCURRENCE_BY_ETAB: Record<string, ConcurrenceData> = {
  marchebio: {
    competitors: [
      {
        name: 'Épicerie Verte du Coin',
        freq: 18,
        freqTotal: 25,
        note: 4.7,
        nbAvis: 210,
        completude: 100,
        categories: ['Épicerie biologique', 'Magasin d’alimentation naturelle'],
        recoupement: { requetes: ['épicerie bio repentigny', 'produits bio repentigny'], secteurs: ['Centre-ville de Repentigny', 'Le Gardeur'] },
        ecarts: [
          {
            levier: 'Avis clients',
            vous: '63 avis · 4,5/5',
            concurrent: '210 avis · 4,7/5',
            action: 'Écart de 147 avis. Créer une priorité « obtenir des avis supplémentaires » (présence en ligne).',
          },
          {
            levier: 'Horaires déclarés',
            vous: 'Fermé le dimanche (incohérence Facebook détectée)',
            concurrent: 'Ouvert 7 jours sur 7',
            action: 'Corriger l’incohérence d’horaires avant d’envisager un élargissement des heures d’ouverture.',
          },
        ],
      },
      {
        name: 'Marché Public Repentigny',
        freq: 9,
        freqTotal: 25,
        note: 4.3,
        nbAvis: 88,
        completude: 85,
        categories: ['Marché public', 'Épicerie fine'],
        recoupement: { requetes: ['épicerie fine repentigny'], secteurs: ['Centre-ville de Repentigny'] },
        ecarts: [
          {
            levier: 'Complétude de fiche',
            vous: '9 champs sur 9',
            concurrent: '~8 champs sur 9 (zone desservie absente)',
            action: 'Aucune action requise — votre fiche est déjà plus complète.',
          },
        ],
      },
    ],
  },
  'boreal-qc': {
    competitors: [
      {
        name: 'Groupe Immobilier Capitale',
        freq: 14,
        freqTotal: 20,
        note: 4.5,
        nbAvis: 320,
        completude: 100,
        categories: ['Agence immobilière', 'Courtier immobilier commercial'],
        recoupement: { requetes: ['agence immobilière québec', 'vendre maison québec'], secteurs: ['Québec (centre)', 'Charlesbourg'] },
        ecarts: [
          {
            levier: 'Avis clients',
            vous: '142 avis · 4,8/5',
            concurrent: '320 avis · 4,5/5',
            action: 'Votre note est meilleure ; l’écart de volume reste à combler à Charlesbourg où le concurrent domine.',
          },
        ],
      },
      {
        name: 'RE/MAX Québec Centre',
        freq: 8,
        freqTotal: 20,
        note: 4.6,
        nbAvis: 190,
        completude: 95,
        categories: ['Agence immobilière'],
        recoupement: { requetes: ['courtier immobilier sainte-foy'], secteurs: ['Sainte-Foy'] },
        ecarts: [
          {
            levier: 'Avis clients',
            vous: '142 avis · 4,8/5',
            concurrent: '190 avis · 4,6/5',
            action: 'Écart de 48 avis à Sainte-Foy, secteur déjà fort — surveiller plutôt que corriger en urgence.',
          },
        ],
      },
    ],
  },
};
