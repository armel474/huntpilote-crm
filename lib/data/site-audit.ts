/**
 * Site Audit — données de démonstration (session 2.2).
 *
 * L'outil délimite les problèmes sur le site exploré ; le score pondéré des
 * trois dimensions reste relevé une fois par mois par l'audit. Cinq familles
 * de constats, chacune groupant des critères qui portent leur mesure et leur
 * seuil comme partout ailleurs dans l'application.
 */

import type { Tone } from '@/components/ui/Atoms';
import type { Severity } from '@/lib/data/priorite';
import type { CritStatus } from '@/lib/data/audit';

/** Portées d'exploration : ce que coûte la requête chez le fournisseur. */
export const SA_SCOPES = [
  'Site complet',
  '5 niveaux de profondeur',
  '3 niveaux de profondeur',
] as const;

export const SA_COSTS: Record<(typeof SA_SCOPES)[number], { credits: number; dollars: string; weight: string }> = {
  'Site complet': { credits: 412, dollars: '0,82 $', weight: 'Requête lourde' },
  '5 niveaux de profondeur': { credits: 268, dollars: '0,54 $', weight: 'Requête moyenne' },
  '3 niveaux de profondeur': { credits: 96, dollars: '0,19 $', weight: 'Requête légère' },
};

/** Résumé du dernier passage, et le passage précédent comme référence. */
export const CRAWL = {
  date: '4 sept. 2026',
  hour: '14 h 12',
  ago: 'il y a 4 jours',
  pages: 412,
  err: 17,
  depth: '3,4',
  quotaPages: 500,
  prev: { date: '28 août 2026', pages: 404, err: 14, depth: '3,6' },
  apparues: [
    '/blogue/toiture-metal-vs-bardeau',
    '/services/inspection-drone',
    '+10 autres URL',
  ],
  disparues: ['/promo-printemps-2026', '/blogue/hiver-2025', '+2 autres URL'],
} as const;

export type SaPage = readonly [url: string, meta: string];

export type SaCriterion = {
  c: string;
  st: CritStatus;
  measure: string;
  threshold: string;
  /** Nombre total de pages concernées — souvent plus que `pgs`, qui n'en liste qu'un échantillon. */
  n: number;
  note?: string;
  prio?: string;
  pgs: readonly SaPage[];
};

export type SaFamilyId = 'indexation' | 'erreurs' | 'onpage' | 'perf' | 'structure';

export type SaFamily = {
  id: SaFamilyId;
  name: string;
  sev: Severity;
  sub: string;
  rows: readonly SaCriterion[];
};

export const FAMILIES: readonly SaFamily[] = [
  {
    id: 'indexation',
    name: 'Indexation',
    sev: 'important',
    sub: 'Ce que Google a le droit de lire, et vers quelle URL vous le renvoyez.',
    rows: [
      {
        c: 'Pages utiles bloquées par robots.txt',
        st: 'fail',
        measure: '12 pages bloquées',
        threshold: 'seuil 0 page utile',
        n: 12,
        note: 'Le répertoire /services/ est exclu depuis la refonte de mars. Ces pages ne peuvent pas être indexées.',
        pgs: [
          ['/services/toiture-plate', 'Disallow: /services/'],
          ['/services/bardeau-asphalte', 'Disallow: /services/'],
          ['/services/inspection-drone', 'Disallow: /services/'],
          ['/services/gouttieres', 'Disallow: /services/'],
        ],
      },
      {
        c: 'Canoniques incohérentes',
        st: 'warn',
        measure: '9 pages',
        threshold: 'seuil 0 page',
        n: 9,
        pgs: [
          ['/blogue/entretien-hiver', 'canonique → /blogue/'],
          ['/blogue/fuite-toiture', 'canonique → /blogue/'],
          ['/soumission?src=fb', 'canonique absente'],
        ],
      },
      {
        c: 'Pagination sans rel=next / rel=prev',
        st: 'warn',
        measure: '13 pages de listage',
        threshold: 'seuil 0 page',
        n: 13,
        pgs: [
          ['/blogue/page/2', 'aucun lien de série'],
          ['/blogue/page/3', 'aucun lien de série'],
          ['/realisations/page/2', 'aucun lien de série'],
        ],
      },
    ],
  },
  {
    id: 'erreurs',
    name: 'Erreurs',
    sev: 'critique',
    sub: 'Ce qui casse la visite : pages introuvables, sauts inutiles, liens morts.',
    rows: [
      {
        c: 'Pages répondant 404',
        st: 'fail',
        measure: '17 pages',
        threshold: 'seuil 0 page',
        n: 17,
        note: '3 de ces 404 sont apparues depuis le crawl du 28 août — probablement liées au ménage du blogue.',
        pgs: [
          ['/promo-printemps-2026', 'HTTP 404 · 41 visites/mois'],
          ['/blogue/hiver-2025', 'HTTP 404 · 22 visites/mois'],
          ['/services/deneigement-toit', 'HTTP 404 · 18 visites/mois'],
          ['/contact-urgence', 'HTTP 404 · 9 visites/mois'],
        ],
      },
      {
        c: 'Redirections en chaîne',
        st: 'warn',
        measure: '6 chaînes de 3 sauts et plus',
        threshold: 'seuil ≤ 1 saut',
        n: 6,
        pgs: [
          ['/toiture → /services → /services/toiture', '3 sauts'],
          ['/devis → /soumission → /soumission-en-ligne', '3 sauts'],
          ['/blog → /blogue → /blogue/', '3 sauts'],
        ],
      },
      {
        c: 'Liens internes brisés',
        st: 'fail',
        measure: '23 liens',
        threshold: 'seuil 0 lien',
        n: 23,
        prio: 'P-0421',
        pgs: [
          ['/accueil (4 liens brisés)', 'vers /promo-printemps-2026'],
          ['/blogue/ (9 liens brisés)', 'vers /blogue/hiver-2025'],
          ['/services/ (6 liens brisés)', 'vers /services/deneigement-toit'],
          ['/pied-de-page global (4 liens)', 'vers /contact-urgence'],
        ],
      },
    ],
  },
  {
    id: 'onpage',
    name: 'On-page',
    sev: 'important',
    sub: 'Ce que la page annonce d’elle-même dans les résultats de recherche.',
    rows: [
      {
        c: 'Titres manquants ou dupliqués',
        st: 'fail',
        measure: '21 pages',
        threshold: 'seuil 0 page',
        n: 21,
        pgs: [
          ['/services/toiture-plate', 'titre identique à /services/'],
          ['/services/bardeau-asphalte', 'titre identique à /services/'],
          ['/realisations/projet-12', 'titre absent'],
        ],
      },
      {
        c: 'Méta-descriptions absentes',
        st: 'warn',
        measure: '34 pages · 8 % du site',
        threshold: 'seuil ≤ 5 % des pages',
        n: 34,
        prio: 'P-0402',
        pgs: [
          ['/blogue/toiture-metal-vs-bardeau', 'aucune méta'],
          ['/realisations/projet-11', 'aucune méta'],
          ['/a-propos/equipe', 'aucune méta'],
        ],
      },
      {
        c: 'H1 absent',
        st: 'fail',
        measure: '8 pages',
        threshold: 'seuil 0 page',
        n: 8,
        pgs: [
          ['/soumission-en-ligne', 'aucun H1 · 3 H2'],
          ['/a-propos/equipe', 'aucun H1'],
          ['/realisations/', 'aucun H1'],
        ],
      },
      {
        c: 'Images sans attribut alt',
        st: 'warn',
        measure: '96 images sur 34 pages',
        threshold: 'seuil ≤ 5 % des images',
        n: 34,
        note: 'Compte aussi pour la dimension design de l’audit : accessibilité des contenus visuels.',
        pgs: [
          ['/realisations/', '41 images sans alt'],
          ['/services/toiture-plate', '18 images sans alt'],
          ['/blogue/entretien-hiver', '9 images sans alt'],
        ],
      },
    ],
  },
  {
    id: 'perf',
    name: 'Performance',
    sev: 'critique',
    sub: 'Core Web Vitals relevés par gabarit de page, pas seulement sur l’accueil.',
    rows: [
      {
        c: 'LCP — gabarit Service',
        st: 'fail',
        measure: '4,1 s',
        threshold: 'seuil ≤ 2,5 s',
        n: 14,
        note: 'Le gabarit le plus lent porte 14 pages, dont les quatre pages de service qui reçoivent les campagnes.',
        pgs: [
          ['/services/toiture-plate', 'LCP 4,3 s · image d’en-tête 1,8 Mo'],
          ['/services/bardeau-asphalte', 'LCP 4,1 s'],
          ['/services/gouttieres', 'LCP 3,9 s'],
        ],
      },
      {
        c: 'LCP — gabarit Blogue',
        st: 'warn',
        measure: '2,9 s',
        threshold: 'seuil ≤ 2,5 s',
        n: 46,
        pgs: [
          ['/blogue/entretien-hiver', 'LCP 3,0 s'],
          ['/blogue/fuite-toiture', 'LCP 2,9 s'],
          ['/blogue/toiture-metal-vs-bardeau', 'LCP 2,8 s'],
        ],
      },
      {
        c: 'INP — gabarit Contact',
        st: 'fail',
        measure: '310 ms',
        threshold: 'seuil ≤ 200 ms',
        n: 3,
        prio: 'P-0433',
        pgs: [
          ['/soumission-en-ligne', 'INP 340 ms · script de formulaire'],
          ['/contact', 'INP 295 ms'],
          ['/rappel-immediat', 'INP 288 ms'],
        ],
      },
      {
        c: 'CLS — gabarit Accueil',
        st: 'ok',
        measure: '0,04',
        threshold: 'seuil ≤ 0,10',
        n: 1,
        pgs: [['/', 'CLS 0,04 · stable depuis juin']],
      },
    ],
  },
  {
    id: 'structure',
    name: 'Structure',
    sev: 'opportunite',
    sub: 'Comment les pages se tiennent entre elles, et lesquelles sont laissées seules.',
    rows: [
      {
        c: 'Pages orphelines',
        st: 'warn',
        measure: '14 pages sans lien entrant',
        threshold: 'seuil 0 page',
        n: 14,
        note: 'Atteignables seulement par le plan de site : aucun lien du site ne les désigne.',
        prio: 'P-0428',
        pgs: [
          ['/realisations/projet-08', '0 lien entrant'],
          ['/realisations/projet-09', '0 lien entrant'],
          ['/blogue/2024/mousse-toiture', '0 lien entrant'],
        ],
      },
      {
        c: 'Profondeur excessive',
        st: 'warn',
        measure: '9 pages à 6 clics de l’accueil',
        threshold: 'seuil ≤ 4 clics',
        n: 9,
        pgs: [
          ['/blogue/2024/03/mousse-toiture', '6 clics'],
          ['/realisations/2023/projet-04', '6 clics'],
          ['/services/toiture-plate/membrane-tpo', '5 clics'],
        ],
      },
      {
        c: 'Maillage interne faible',
        st: 'ok',
        measure: '22 pages à 3 liens entrants',
        threshold: 'seuil ≥ 3 liens',
        n: 22,
        pgs: [
          ['/services/toiture-plate', '4 liens entrants'],
          ['/blogue/entretien-hiver', '3 liens entrants'],
        ],
      },
    ],
  },
];

export const SA_SEV: Record<Severity, { label: string; tone: Tone }> = {
  critique: { label: 'Critique', tone: 'red' },
  important: { label: 'Important', tone: 'yellow' },
  opportunite: { label: 'Opportunité', tone: 'blue' },
};

export const SA_SAVES = [
  { date: '28 août 2026', tool: 'Site Audit', what: '404 pages · 15 constats · dimension SEO alimentée' },
  { date: '31 juil. 2026', tool: 'Site Audit', what: '391 pages · 19 constats' },
  { date: '30 juin 2026', tool: 'Site Audit', what: '388 pages · 24 constats' },
] as const;

/** Sept états de démonstration + « aucun compte sélectionné », combinés côté écran. */
export const SA_STATES = [
  ['ok', 'Crawl terminé · problèmes détectés'],
  ['jamais', 'Jamais exploré sur ce domaine'],
  ['encours', 'Exploration en cours'],
  ['sain', 'Terminé sans problème détecté'],
  ['partiel', 'Exploration partielle · site bloquant'],
  ['volumineux', 'Site trop volumineux pour le quota'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type SaState = (typeof SA_STATES)[number][0];
