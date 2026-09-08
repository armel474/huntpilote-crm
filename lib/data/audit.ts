/**
 * Audit d'un client — données de démonstration.
 *
 * L'audit note trois dimensions pondérées : présence en ligne, SEO et
 * design. Le design est le cas délicat : ce qui est vérifiable entre dans
 * le score (cibles tactiles, contraste, longueur de ligne, nombre de champs),
 * ce qui relève du goût est décrit sans jamais être noté — style dominant et
 * âge apparent. C'est la règle 2 de `docs/decisions.md`.
 */

import type { Tone } from '@/components/ui/Atoms';

/** Statut d'un critère — jamais la couleur seule : un mot et une icône. */
export type CritStatus = 'ok' | 'warn' | 'fail' | 'na';

export const A_STATUS: Record<CritStatus, { label: string; tone: Tone }> = {
  ok: { label: 'Au seuil', tone: 'green' },
  warn: { label: 'Sous le seuil', tone: 'yellow' },
  fail: { label: 'Hors seuil', tone: 'red' },
  na: { label: 'Non mesuré', tone: 'neutral' },
};

export type Criterion = {
  /** Nom du critère — sert aussi de clé. */
  c: string;
  measure: string;
  threshold: string;
  st: CritStatus;
  note: string | null;
  /** Priorité déjà ouverte pour ce constat, le cas échéant. */
  prio: string | null;
};

export type DimensionId = 'presence' | 'seo' | 'design';

export type Dimension = {
  id: DimensionId;
  name: string;
  weight: number;
  score: number;
  prev: number | null;
  sub: string;
  items: readonly Criterion[];
};

export const AUDIT = {
  id: 'A-0142',
  slug: 'a-0142',
  client: 'Acme Corp.',
  clientId: 'acme-corp',
  pmInit: 'MC',
  date: '1 octobre 2026',
  hour: '04 h 12',
  score: 72,
  prevScore: 67,
  pages: 412,
  duration: '6 min 41 s',
  dims: [
    {
      id: 'presence',
      name: 'Présence en ligne',
      weight: 25,
      score: 64,
      prev: 58,
      sub: 'Fiche Google Business, annuaires, réseaux, cohérence des informations',
      items: [
        {
          c: 'Fiche Google Business',
          measure: '6 champs remplis sur 9',
          threshold: 'Seuil : 9 sur 9',
          st: 'warn',
          note: 'Horaires, services et zone desservie manquants.',
          prio: 'P-0431',
        },
        {
          c: 'Cohérence nom · adresse · téléphone',
          measure: '3 incohérences sur 14 sources',
          threshold: 'Seuil : 0 incohérence',
          st: 'fail',
          note: 'Deux annuaires affichent l’ancien numéro, un affiche l’ancienne adresse.',
          prio: null,
        },
        {
          c: 'Citations en annuaires',
          measure: '12 annuaires sur 20 de référence',
          threshold: 'Seuil : 16 sur 20',
          st: 'warn',
          note: 'Absent de 8 annuaires sectoriels québécois.',
          prio: null,
        },
        {
          c: 'Avis clients',
          measure: '4,6 / 5 · 87 avis · 1 sans réponse',
          threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse',
          st: 'warn',
          note: 'Un avis négatif de juillet reste sans réponse publique.',
          prio: null,
        },
        {
          c: 'Réseaux sociaux liés au site',
          measure: '3 profils actifs sur 4 déclarés',
          threshold: 'Seuil : tous les profils déclarés actifs',
          st: 'ok',
          note: null,
          prio: null,
        },
      ],
    },
    {
      id: 'seo',
      name: 'SEO',
      weight: 45,
      score: 76,
      prev: 71,
      sub: 'Technique, on-page, contenu, backlinks',
      items: [
        {
          c: 'Vitesse d’affichage mobile (LCP)',
          measure: '2,1 s',
          threshold: 'Seuil : ≤ 2,5 s',
          st: 'ok',
          note: null,
          prio: 'P-0418',
        },
        {
          c: 'Liens internes brisés',
          measure: '23 liens en erreur 404',
          threshold: 'Seuil : 0 lien brisé',
          st: 'fail',
          note: 'Concentrés sur les anciennes pages de service.',
          prio: 'P-0421',
        },
        {
          c: 'Pages orphelines',
          measure: '23 pages sans lien entrant',
          threshold: 'Seuil : 0 page orpheline',
          st: 'fail',
          note: 'Inaccessibles depuis la navigation, donc rarement explorées.',
          prio: 'P-0428',
        },
        {
          c: 'Descriptions dans les résultats Google',
          measure: '18 pages sans description',
          threshold: 'Seuil : 100 % des pages indexables',
          st: 'warn',
          note: null,
          prio: 'P-0402',
        },
        {
          c: 'Contenus qui se font concurrence',
          measure: '4 pages sur le même sujet',
          threshold: 'Seuil : 1 page par intention',
          st: 'warn',
          note: 'Deux paires de pages traitent des mêmes recherches.',
          prio: 'P-0430',
        },
        {
          c: 'Domaines référents',
          measure: '3 292 domaines · 12 nouveaux',
          threshold: 'Seuil : croissance mensuelle > 0',
          st: 'ok',
          note: null,
          prio: null,
        },
        {
          c: 'Indexation',
          measure: '389 pages indexées sur 412',
          threshold: 'Seuil : ≥ 95 % des pages utiles',
          st: 'ok',
          note: null,
          prio: null,
        },
      ],
    },
  ] as readonly Dimension[],

  /** Dimension design — la part vérifiable, qui entre dans le score. */
  design: {
    weight: 30,
    score: 71,
    prev: 68,
    items: [
      {
        c: 'Mobile',
        measure: '9 cibles tactiles sous 44 px · viewport déclaré · aucun débordement',
        threshold: 'Seuil : 0 cible sous 44 px',
        st: 'warn',
        note: 'Menu de pied de page et filtres du catalogue.',
        prio: null,
      },
      {
        c: 'Lisibilité',
        measure: 'Contraste 3,1:1 sur les intertitres · corps 15 px · 96 caractères par ligne',
        threshold: 'Seuil : 4,5:1 · corps ≥ 16 px · ≤ 80 caractères',
        st: 'fail',
        note: 'Deux niveaux de titres partagent la même taille : la hiérarchie ne se lit pas.',
        prio: 'P-0433',
      },
      {
        c: 'Parcours',
        measure: '4 niveaux de navigation · appel à l’action sous la ligne de flottaison sur 6 pages',
        threshold: 'Seuil : ≤ 3 niveaux · appel à l’action visible sans défilement',
        st: 'warn',
        note: null,
        prio: null,
      },
      {
        c: 'Conversion',
        measure: '11 champs au formulaire de devis · erreurs affichées à l’envoi seulement',
        threshold: 'Seuil : ≤ 7 champs · validation au champ',
        st: 'fail',
        note: 'Aucune preuve sociale sur la page de devis.',
        prio: 'P-0435',
      },
      {
        c: 'Cohérence de marque',
        measure: '3 familles typographiques · 14 teintes · 2 styles de bouton',
        threshold: 'Seuil : ≤ 2 familles · palette ≤ 10 teintes',
        st: 'warn',
        note: null,
        prio: null,
      },
    ] as readonly Criterion[],

    /** Caractérisation — décrite, jamais notée. */
    style: {
      dominant: 'corporate',
      all: ['éditorial', 'minimaliste', 'tech', 'corporate', 'artisanal'],
      note: 'Mise en page en blocs pleine largeur, photographies d’équipe, vocabulaire institutionnel. Le registre correspond au secteur : ce n’est ni un défaut ni une qualité.',
    },
    modern: {
      /** Position sur l'axe daté → actuel, en pourcentage. */
      pos: 38,
      label: 'Plutôt daté',
      signals: [
        ['Densité', 'Grandes zones vides entre les blocs, densité faible', 'daté'],
        ['Ombres', 'Ombres portées marquées sur les cartes et les boutons', 'daté'],
        ['Dégradés', 'Deux dégradés bleu-violet en arrière-plan de section', 'daté'],
        ['Largeur des conteneurs', 'Contenu limité à 1 100 px, aligné aux usages actuels', 'actuel'],
        ['Typographie', 'Titres en Arial gras, corps en Georgia', 'daté'],
        ['Images', 'Photographies de banque d’images, format 4:3, sans traitement', 'daté'],
      ] as readonly (readonly [string, string, 'daté' | 'actuel'])[],
    },
  },

  /** Progression par dimension pendant l'exécution. */
  running: { presence: 100, seo: 62, design: 0 } as Record<DimensionId, number>,

  /**
   * État « audit ancien » : c'est un audit antérieur qui est affiché, pas
   * A-0142 réhabillé — d'où son propre identifiant et ses propres scores.
   */
  staleShown: {
    id: 'A-0119',
    date: '1 août 2026',
    duration: '7 min 02 s',
    dims: { presence: [54, 50], seo: [66, 63], design: [60, 56] } as Record<
      DimensionId,
      readonly [number, number]
    >,
  },

  history: [
    { id: 'A-0142', date: '1 oct. 2026', score: 72 },
    { id: 'A-0131', date: '1 sept. 2026', score: 67 },
    { id: 'A-0119', date: '1 août 2026', score: 61 },
    { id: 'A-0104', date: '1 juill. 2026', score: 58 },
  ],
} as const;

/**
 * Score global pondéré. La pondération est affichée à l'écran : sans elle le
 * chiffre est incompréhensible.
 */
export function weightedScore(dims: readonly { score: number; weight: number }[]): number {
  const total = dims.reduce((s, d) => s + d.weight, 0);
  return Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0) / total);
}

/* ── États de démonstration ── */

export type AuditState = 'termine' | 'encours' | 'partiel' | 'premier' | 'ancien';

export const AU_STATES: readonly (readonly [AuditState, string])[] = [
  ['termine', 'Audit terminé'],
  ['encours', 'Audit en cours d’exécution'],
  ['partiel', 'Partiellement échoué (présence)'],
  ['premier', 'Premier audit du client'],
  ['ancien', 'Audit ancien · données périmées'],
];

/* ── Comparaison de deux audits ── */

export type ChangeKind = 'regress' | 'improve' | 'new';

export type CmpRowData = {
  dim: string;
  c: string;
  /** Valeur au premier audit ; `null` si le constat n'existait pas. */
  a: string | null;
  b: string;
  kind: ChangeKind;
  note: string | null;
  prio: string | null;
};

export const KIND: Record<
  ChangeKind,
  { label: string; tone: Tone; title: string; desc: string }
> = {
  regress: {
    label: 'Dégradé',
    tone: 'red',
    title: 'Ce qui a régressé',
    desc: 'À traiter en premier : ces critères étaient meilleurs au dernier audit.',
  },
  improve: {
    label: 'Amélioré',
    tone: 'green',
    title: 'Ce qui s’est amélioré',
    desc: 'Ces critères ont progressé depuis le 1 septembre.',
  },
  new: {
    label: 'Nouveau',
    tone: 'yellow',
    title: 'Nouvellement détecté',
    desc: 'Absent du premier audit : rien à comparer, tout à traiter.',
  },
};

export const CMP = {
  a: { id: 'A-0131', date: '1 septembre 2026', score: 67 },
  b: { id: 'A-0142', date: '1 octobre 2026', score: 72 },
  dims: [
    { id: 'presence' as DimensionId, name: 'Présence en ligne', weight: 25, a: 58, b: 64 },
    { id: 'seo' as DimensionId, name: 'SEO', weight: 45, a: 71, b: 76 },
    { id: 'design' as DimensionId, name: 'Design', weight: 30, a: 68, b: 71 },
  ],
  rows: [
    {
      dim: 'SEO',
      c: 'Liens internes brisés',
      a: '9 liens',
      b: '23 liens',
      kind: 'regress',
      note: 'La refonte des pages de service a laissé d’anciennes adresses en place.',
      prio: 'P-0421',
    },
    {
      dim: 'Présence en ligne',
      c: 'Cohérence nom · adresse · téléphone',
      a: '1 incohérence',
      b: '3 incohérences',
      kind: 'regress',
      note: 'Le changement de numéro de septembre n’a pas été propagé aux annuaires.',
      prio: null,
    },
    {
      dim: 'Design',
      c: 'Cohérence de marque',
      a: '2 familles typographiques',
      b: '3 familles typographiques',
      kind: 'regress',
      note: 'Une police a été ajoutée sur la nouvelle page de devis.',
      prio: null,
    },
    {
      dim: 'Design',
      c: 'Conversion',
      a: '8 champs au formulaire',
      b: '11 champs au formulaire',
      kind: 'regress',
      note: 'Trois champs ajoutés au devis : le taux de complétion a baissé de 12 %.',
      prio: 'P-0435',
    },
    {
      dim: 'SEO',
      c: 'Vitesse d’affichage mobile (LCP)',
      a: '4,2 s',
      b: '2,1 s',
      kind: 'improve',
      note: 'Passe sous le seuil de 2,5 s : le critère est désormais au seuil.',
      prio: null,
    },
    {
      dim: 'SEO',
      c: 'Descriptions dans les résultats Google',
      a: '36 pages sans description',
      b: '18 pages sans description',
      kind: 'improve',
      note: 'Moitié du retard comblé.',
      prio: 'P-0402',
    },
    {
      dim: 'Présence en ligne',
      c: 'Fiche Google Business',
      a: '4 champs sur 9',
      b: '6 champs sur 9',
      kind: 'improve',
      note: null,
      prio: 'P-0431',
    },
    {
      dim: 'SEO',
      c: 'Domaines référents',
      a: '3 280 domaines',
      b: '3 292 domaines',
      kind: 'improve',
      note: null,
      prio: null,
    },
    {
      dim: 'Design',
      c: 'Mobile',
      a: '14 cibles sous 44 px',
      b: '9 cibles sous 44 px',
      kind: 'improve',
      note: null,
      prio: null,
    },
    {
      dim: 'SEO',
      c: 'Pages orphelines',
      a: null,
      b: '23 pages sans lien entrant',
      kind: 'new',
      note: 'Détecté pour la première fois : la nouvelle navigation a coupé les liens vers ces pages.',
      prio: 'P-0428',
    },
    {
      dim: 'SEO',
      c: 'Contenus qui se font concurrence',
      a: null,
      b: '4 pages sur le même sujet',
      kind: 'new',
      note: 'Deux paires de pages publiées en septembre visent les mêmes recherches.',
      prio: 'P-0430',
    },
    {
      dim: 'Présence en ligne',
      c: 'Avis clients',
      a: null,
      b: '1 avis sans réponse',
      kind: 'new',
      note: null,
      prio: null,
    },
  ] as readonly CmpRowData[],
};
