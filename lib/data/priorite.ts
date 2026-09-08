/**
 * Détail d'une priorité SEO — données de démonstration.
 *
 * Une priorité est un constat produit par un audit : elle porte un libellé
 * interne (technique, pour l'équipe) et un libellé client (rédigé par l'agent,
 * relu par un humain avant publication) — voir la règle 1 de `docs/decisions.md`.
 */

import type { Tone } from '@/components/ui/Atoms';

/* ── Sévérité ── */

export type Severity = 'critique' | 'important' | 'opportunite';

/** Couleur d'accent et ton de pastille associés à chaque sévérité. */
export const SEV: Record<Severity, { label: string; color: string; tone: Tone }> = {
  critique: { label: 'Critique', color: 'var(--red)', tone: 'red' },
  important: { label: 'Important', color: 'var(--yellow)', tone: 'yellow' },
  opportunite: { label: 'Opportunité', color: 'var(--green)', tone: 'green' },
};

/* ── Cycle de vie d'une priorité ── */

export type PrioriteState =
  | 'neuve'
  | 'arelire'
  | 'assignee'
  | 'resolue'
  | 'recurrente'
  | 'ignoree'
  | 'fauxpositif';

/** Libellé et ton du statut affiché dans l'en-tête du constat. */
export const STATUS: Record<PrioriteState, { label: string; tone: Tone }> = {
  neuve: { label: 'Neuve · non traitée', tone: 'neutral' },
  arelire: { label: 'Neuve · annoncée au client', tone: 'blue' },
  assignee: { label: 'Assignée · en traitement', tone: 'blue' },
  resolue: { label: 'Résolue', tone: 'green' },
  recurrente: { label: 'Récurrente · revenue après correction', tone: 'red' },
  ignoree: { label: 'Ignorée', tone: 'neutral' },
  fauxpositif: { label: 'Faux positif', tone: 'neutral' },
};

/** États proposés par le sélecteur de démonstration de la sous-barre. */
export const UX_STATES: readonly (readonly [PrioriteState, string])[] = [
  ['neuve', 'Neuve, non traitée'],
  ['arelire', 'Annoncée · libellé à relire'],
  ['assignee', 'Déjà assignée'],
  ['resolue', 'Résolue · preuve de valeur'],
  ['recurrente', 'Récurrente'],
  ['ignoree', 'Ignorée'],
  ['fauxpositif', 'Faux positif'],
];

/* ── Visibilité client (règle 1) ── */

export type Visibility = 'interne' | 'annonce' | 'traitement';

export const VIS: readonly {
  id: Visibility;
  label: string;
  /** Ce qui déclenche cet état. */
  trigger: string;
  /** Ce que le client voit alors. */
  sees: string;
}[] = [
  {
    id: 'interne',
    label: 'Interne',
    trigger: 'Par défaut, à la détection',
    sees: 'Rien. Reste dans le cockpit de l’agence.',
  },
  {
    id: 'annonce',
    label: 'Annoncé',
    trigger: 'Interrupteur manuel',
    sees: 'Le constat, sans échéance. Prépare une vente ou documente.',
  },
  {
    id: 'traitement',
    label: 'En traitement',
    trigger: 'Automatique à l’entrée au plan d’action',
    sees: 'Le constat, ce qui est fait, l’avancement.',
  },
];

/** Visibilité et validation du libellé impliquées par chaque état. */
export const STATE_DEFAULTS: Record<PrioriteState, { vis: Visibility; labelOk: boolean }> = {
  neuve: { vis: 'interne', labelOk: false },
  arelire: { vis: 'annonce', labelOk: false },
  assignee: { vis: 'traitement', labelOk: true },
  resolue: { vis: 'traitement', labelOk: true },
  recurrente: { vis: 'interne', labelOk: true },
  ignoree: { vis: 'interne', labelOk: false },
  fauxpositif: { vis: 'interne', labelOk: false },
};

/* ── Motifs de clôture ── */

export const MOTIFS = {
  ignorer: [
    'Refonte du site prévue au T4',
    'Hors périmètre du contrat',
    'Priorité jugée non rentable',
    'Décision du client',
  ],
  faux: [
    'Mesure lab non confirmée sur le terrain',
    'Pages exclues volontairement (noindex)',
    'Données de crawl obsolètes',
    'Seuil mal calibré pour ce secteur',
  ],
  reporter: ['Prochain rapport (octobre)', 'Prochain audit trimestriel', 'Dans 3 mois'],
} as const;

/* ── Le constat ── */

export const PD_CLIENT = {
  id: 'acme-corp',
  name: 'Acme Corp.',
  sector: 'Services B2B · Montréal',
  pm: 'Marie Chen',
  pmInit: 'MC',
} as const;

export type HistoryEntry = { date: string; lcp: number; ev: string; tone: Tone };

export const PD = {
  id: 'P-0418',
  internal: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques',
  sev: 'critique' as Severity,
  dim: 'SEO',
  sub: 'Audit technique · Core Web Vitals',
  detected: '27 mai 2026',
  firstSeen: '25 mars 2026',
  ageDays: 166,
  clientTitle: 'Vitesse d’affichage sur mobile',
  clientLabel:
    'Vos pages mettent trop de temps à s’afficher sur mobile : un visiteur attend plus de 4 secondes avant de voir le contenu principal, alors que Google recommande moins de 2,5 secondes. Cela fait fuir une partie des visiteurs et pèse sur votre classement.',
  pages: [
    { url: '/', lcp: 4.8, sessions: 6240, d: 0.4 },
    { url: '/services/seo-local', lcp: 4.6, sessions: 3110, d: 0.3 },
    { url: '/services/refonte-web', lcp: 4.2, sessions: 2870, d: 0.2 },
    { url: '/tarifs', lcp: 4.1, sessions: 2420, d: 0 },
    { url: '/blogue/guide-audit-seo', lcp: 3.9, sessions: 1980, d: 0.5 },
    { url: '/contact', lcp: 3.4, sessions: 1650, d: -0.1 },
  ],
  reco: 'Réduire le LCP sous 2,5 s sur les 6 pages en traitant d’abord ce qui bloque le rendu : le script de chat tiers chargé en tête, les images héros non optimisées et les 3 feuilles CSS bloquantes. Aucune refonte nécessaire — ce sont des corrections de livraison.',
  steps: [
    ['Différer le script de chat tiers (chargement après interaction)', '≈ 1,1 s'],
    ['Convertir 14 images héros en WebP avec dimensions explicites', '≈ 0,8 s'],
    ['Précharger la police et fusionner les 3 CSS bloquants', '≈ 0,4 s'],
  ] as const,
  effort: '2 jours · dév front',
  effortLevel: 'Moyen',
  impactTech: 'LCP 4,2 s → ≈ 2,2 s',
  impactBiz: '+12 à 18 % de sessions mobiles',
  impactCad: '≈ 2 400 $ CA/mois en trafic payant équivalent',
  confidence: 'Élevée',
  prov: {
    audit: 'Audit technique Q2',
    date: '27 mai 2026',
    agent: 'Agent HuntPilote v2.3',
    crawl: 'Crawl #58 · 6 URL touchées sur 142 explorées',
    sources: [
      ['CrUX', 'Données terrain · p75 · fenêtre 28 j · Chrome mobile'],
      ['PageSpeed Insights', 'Mesure lab · mobile émulé · 4G lente'],
    ] as const,
  },
  history: [
    { date: '25 mars 2026', lcp: 3.6, ev: 'Détectée — Audit technique Q1', tone: 'yellow' },
    {
      date: '16 avr. 2026',
      lcp: 4.0,
      ev: 'Aggravation +0,4 s — nouveau script de chat repéré',
      tone: 'red',
    },
    { date: '27 mai 2026', lcp: 4.2, ev: 'Confirmée — Audit technique Q2', tone: 'red' },
    { date: '7 sept. 2026', lcp: 4.2, ev: 'Dernière vérification — stable', tone: 'neutral' },
  ] as readonly HistoryEntry[],
  historyRecurrent: [
    { date: '18 nov. 2025', lcp: 3.9, ev: 'Détectée — Audit technique Q4 2025', tone: 'yellow' },
    {
      date: '12 févr. 2026',
      lcp: 2.3,
      ev: 'Résolue — tâche #97 (images WebP, cache CDN)',
      tone: 'green',
    },
    { date: '25 mars 2026', lcp: 3.6, ev: 'Revenue — 41 jours après correction', tone: 'red' },
    { date: '27 mai 2026', lcp: 4.2, ev: 'Aggravation — Audit technique Q2', tone: 'red' },
  ] as readonly HistoryEntry[],
  task: {
    id: '#142',
    slug: '142',
    title: 'Optimiser le LCP mobile — 6 pages',
    who: 'Jules Rivard',
    status: 'En cours',
    pct: 40,
    due: '20 sept. 2026',
    done: 'Script de chat différé sur 6 pages (LCP −0,9 s mesuré en lab)',
  },
  proof: {
    before: '4,2 s',
    after: '2,1 s',
    sessions: '+14 % de sessions mobiles (28 j)',
    date: '2 sept. 2026',
    report: 'Rapport de septembre',
  },
} as const;

/** Ton d'une mesure LCP : au-delà de 4 s c'est mauvais, sous 2,5 s c'est bon. */
export function lcpTone(v: number): Tone {
  return v >= 4 ? 'red' : v >= 2.5 ? 'yellow' : 'green';
}

/** Formate un nombre décimal à la québécoise (virgule décimale). */
export function fr1(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

/**
 * Formate un entier avec l'espace fine insécable comme séparateur de milliers.
 * Écrit à la main plutôt que via `toLocaleString` : le rendu serveur et le
 * navigateur n'ont pas toujours les mêmes données ICU, ce qui provoquerait
 * une divergence d'hydratation.
 */
export function frInt(v: number): string {
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}
