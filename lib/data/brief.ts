/**
 * Brief d'article — données de démonstration (session 6.1).
 *
 * Comme le détail d'audit ou le détail de tâche, un seul brief complet existe
 * dans le jeu de démonstration : tous les identifiants de contenu y mènent
 * (voir `generateStaticParams` de la route). Le brief porté est celui de
 * « Structurer les URL d'une fiche produit pour le SEO » (`a-105` dans
 * `lib/data/contenu.ts`) — né de la même opportunité longue traîne que la
 * priorité P-0431 / `p-0426` (« 45 mots-clés longue traîne inexploités »,
 * volume cumulé ~8 400 recherches/mois pour Acme Corp.), pas d'un mot-clé
 * inventé sans rattache.
 *
 * Ce brief cadre l'article, il ne le contient pas : aucun champ ici n'est un
 * éditeur de texte, seulement des consignes et un suivi.
 */

import type { Tone } from '@/components/ui/Atoms';
import { CONTENU_CLIENT, CT_MEASURE_DAYS, CT_REVIEWER, CT_WRITERS, type ContenuState } from '@/lib/data/contenu';

/** Les six états remettables — « idée à cadrer » précède le brief, il n'en fait pas partie. */
export type BrStage = Exclude<ContenuState, 'idee'>;

export const BR_STAGES: readonly [BrStage, string, string][] = [
  ['brief', 'Brief en préparation', 'Le cadrage n’est pas terminé : le brief n’est pas remettable.'],
  ['assigne', 'Assigné', 'Remis au rédacteur, pas encore commencé.'],
  ['redaction', 'En rédaction', 'Le texte s’écrit hors de HuntPilote.'],
  ['relecture', 'En relecture', 'Le texte est arrivé, il attend une validation.'],
  ['publie', 'Publié', 'En ligne. La performance n’est pas encore interprétable.'],
  ['mesure', 'Publié et mesuré', `En ligne depuis plus de ${CT_MEASURE_DAYS} jours : les chiffres veulent dire quelque chose.`],
];

export type BrIntent = 'info' | 'compare' | 'transac';

export const BR_INTENTS: Record<BrIntent, { label: string; tone: Tone; hint: string }> = {
  info: { label: 'Informationnelle', tone: 'blue', hint: 'la personne veut comprendre' },
  compare: { label: 'Comparative', tone: 'yellow', hint: 'la personne hésite entre des options' },
  transac: { label: 'Transactionnelle', tone: 'green', hint: 'la personne est prête à agir' },
};

export type BrSecondary = { term: string; vol: number; intent: BrIntent };
export type BrOutlineRow = { h: 2 | 3; t: string };
export type BrCompetitor = { rank: number; domain: string; words: number; angle: string };

export type BriefRecord = {
  id: string;
  client: string;
  clientId: string;
  title: string;
  stage: BrStage;
  writer: string | null;
  assignedAt: string | null;
  due: string;
  kw: { term: string; vol: number; difficulty: number; intent: BrIntent; pos: number | null };
  fromKw: boolean;
  fromKwNote: string;
  /** Slug de la priorité source, pour `routes.priorite`. */
  prioSlug: string;
  secondary: readonly BrSecondary[];
  intentText: string;
  intentProof: string;
  outline: BrOutlineRow[];
  competitors: readonly BrCompetitor[];
  rules: {
    length: string;
    lengthWhy: string;
    tone: string;
    links: readonly (readonly [string, string])[];
    cta: string;
    images: string;
  };
  track: { url: string | null; pubAt: string | null; reviewer: string };
  proofDraft: string;
  perf: { visits: number; pos: number; top10: number; proof: string } | null;
};

export const BRIEF: BriefRecord = {
  id: 'a-105',
  client: CONTENU_CLIENT.name,
  clientId: CONTENU_CLIENT.id,
  title: 'Structurer les URL d’une fiche produit pour le SEO',
  stage: 'assigne',
  writer: CT_WRITERS.TB.name,
  assignedAt: '10 septembre 2026',
  due: '25 septembre 2026',
  kw: { term: 'structure url fiche produit seo', vol: 610, difficulty: 37, intent: 'info', pos: null },
  fromKw: true,
  fromKwNote:
    'Repéré dans l’opportunité « 45 mots-clés longue traîne inexploités » (P-0431) : volume cumulé estimé à 8 400 recherches par mois, difficulté faible, aucune page du site ne couvre ces requêtes actuellement.',
  prioSlug: 'p-0426',
  secondary: [
    { term: 'url propre e-commerce exemple', vol: 320, intent: 'info' },
    { term: 'slug produit seo bonnes pratiques', vol: 210, intent: 'info' },
    { term: 'url dynamique vs statique boutique en ligne', vol: 140, intent: 'compare' },
    { term: 'renommer url produit sans perdre ses positions', vol: 260, intent: 'transac' },
  ],
  intentText:
    'La personne qui tape « structure url fiche produit seo » gère déjà un catalogue en ligne et a lu quelque part qu’une mauvaise structure d’URL nuit au référencement. Elle ne cherche pas une définition de ce qu’est une URL — elle cherche un modèle concret à appliquer à ses fiches produits, avec des exemples de bonnes et de mauvaises URL. Un article qui commence par « qu’est-ce qu’une URL » perd ce lecteur au deuxième paragraphe.',
  intentProof:
    'Les 5 premiers résultats sont tous des guides avec des exemples d’URL réelles, avant/après. Aucun n’est une définition.',
  outline: [
    { h: 2, t: 'Ce qui fait qu’une URL de fiche produit est bonne ou mauvaise' },
    { h: 3, t: 'La profondeur : combien de dossiers avant le produit' },
    { h: 3, t: 'Le slug : ce qu’il faut y mettre, ce qu’il faut éviter' },
    { h: 3, t: 'Les identifiants techniques (SKU, ID) : les sortir de l’URL' },
    { h: 2, t: 'URL statique ou dynamique : ce qui compte vraiment pour Google' },
    { h: 2, t: 'Renommer une URL sans perdre ses positions' },
    { h: 3, t: 'La redirection 301 : la seule façon de ne rien perdre' },
    { h: 2, t: 'Exemples avant / après sur un vrai catalogue' },
    { h: 2, t: 'Vérifier ses URL en 10 minutes — la liste à cocher' },
  ],
  competitors: [
    {
      rank: 2,
      domain: 'guide-seo-boutique.com',
      words: 2100,
      angle: 'Guide très complet avec exemples avant/après, mais aucune section sur le renommage sans perte de position.',
    },
    {
      rank: 3,
      domain: 'blog-commerce-numerique.ca',
      words: 1400,
      angle: 'Liste de bonnes pratiques génériques, pas spécifique au e-commerce. Peu d’exemples concrets.',
    },
    {
      rank: 4,
      domain: 'conseils-ecommerce-pro.fr',
      words: 980,
      angle: 'Article court et daté (2022) : les captures d’écran montrent une interface disparue.',
    },
    {
      rank: 6,
      domain: 'forum-developpeurs-web.com',
      words: 420,
      angle: 'Fil de discussion technique, peu accessible à un non-développeur. La place la plus facile à prendre.',
    },
  ],
  rules: {
    length: '1 400 à 1 800 mots',
    lengthWhy:
      'Le premier résultat pertinent en fait 2 100 ; en dessous de 1 400, on ne couvre pas le renommage sans perte de position avec des exemples.',
    tone: 'Direct, à la deuxième personne. Zéro jargon de développeur — le lecteur gère un catalogue, il ne code pas.',
    links: [
      ['Comment faire un audit SEO complet', 'acmecorp.fr/blogue/guide-audit-seo-complet'],
      ['Corriger les liens brisés', 'acmecorp.fr/blogue/corriger-liens-brises'],
    ],
    cta: 'Vérification gratuite de la structure de vos URL — formulaire en fin d’article, pas de bandeau flottant.',
    images: '3 exemples d’URL réelles (avant/après), captures prises en septembre 2026.',
  },
  track: { url: null, pubAt: null, reviewer: CT_REVIEWER },
  proofDraft:
    'Un guide sur la structure des URL de fiches produits est en ligne sur votre blogue. Il répond à une question que 610 personnes par mois tapent dans Google, et qu’aucune page de votre site ne couvrait.',
  perf: null,
};

/**
 * Vue du brief pour un état de démonstration donné — le stage change les
 * champs de suivi (rédacteur assigné, adresse en ligne, performance), pas
 * le fond du brief.
 */
export function brScenario(stage: BrStage): BriefRecord {
  const b: BriefRecord = { ...BRIEF, kw: { ...BRIEF.kw }, track: { ...BRIEF.track } };
  if (stage === 'brief') return { ...b, stage, writer: null, assignedAt: null };
  if (stage === 'assigne') return { ...b, stage };
  if (stage === 'redaction') return { ...b, stage };
  if (stage === 'relecture') return { ...b, stage };
  if (stage === 'publie') {
    return {
      ...b,
      stage,
      track: { ...b.track, url: 'acmecorp.fr/blogue/structure-url-fiche-produit', pubAt: '26 septembre 2026' },
    };
  }
  return {
    ...b,
    stage,
    kw: { ...b.kw, pos: 7 },
    track: { ...b.track, url: 'acmecorp.fr/blogue/structure-url-fiche-produit', pubAt: '26 septembre 2026' },
    perf: { visits: 340, pos: 7, top10: 2, proof: 'PV-091' },
  };
}
