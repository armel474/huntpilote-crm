/**
 * Détail d'une tâche du plan d'action — données de démonstration.
 *
 * Une tâche naît d'une priorité et meurt en preuve de valeur : c'est ce
 * couple qui permet au rapport client de dire ce qui n'allait pas, puis ce
 * qui a été fait. Deux jeux couvrent les deux natures de livrable de
 * l'agence — un correctif technique mesurable, et du contenu publié.
 */

import type { Tone } from '@/components/ui/Atoms';
import type { Severity } from '@/lib/data/priorite';

/* ── Cycle de vie ── */

export type TacheState =
  | 'afaire'
  | 'encours'
  | 'retard'
  | 'bloquee'
  | 'terminee'
  | 'publiee'
  | 'sansprio';

export const T_STATUS: Record<TacheState, { label: string; tone: Tone }> = {
  afaire: { label: 'À faire', tone: 'neutral' },
  encours: { label: 'En cours', tone: 'blue' },
  retard: { label: 'En retard', tone: 'red' },
  bloquee: { label: 'Bloquée', tone: 'yellow' },
  terminee: { label: 'Terminée · preuve non produite', tone: 'yellow' },
  publiee: { label: 'Terminée · dans le rapport publié', tone: 'green' },
  // Une tâche créée à la main garde un état ordinaire ; c'est son absence de
  // priorité source qui la distingue, pas son avancement.
  sansprio: { label: 'En cours', tone: 'blue' },
};

/** États proposés par le sélecteur de démonstration. */
export const T_STATES: readonly (readonly [TacheState, string])[] = [
  ['afaire', 'À faire'],
  ['encours', 'En cours'],
  ['retard', 'En retard'],
  ['bloquee', 'Bloquée, avec motif'],
  ['terminee', 'Terminée · preuve non produite'],
  ['publiee', 'Terminée · dans le rapport publié'],
  ['sansprio', 'Sans priorité source'],
];

export const T_SEV: Record<Severity, { label: string; tone: Tone; color: string }> = {
  critique: { label: 'Critique', tone: 'red', color: 'var(--red)' },
  important: { label: 'Important', tone: 'yellow', color: 'var(--yellow)' },
  opportunite: { label: 'Opportunité', tone: 'green', color: 'var(--green)' },
};

/* ── Modèle ── */

export type Step = { t: string; done: boolean; who: string; gain?: string };

export type Comment = {
  who: string;
  init: string;
  date: string;
  txt: string;
  /** Un commentaire de l'agent se distingue visuellement d'un humain. */
  ai?: boolean;
};

export type Measure = {
  label: string;
  before: string;
  after: string;
  target: string;
  source: string;
};

export type Tache = {
  id: string;
  slug: string;
  type: 'technique' | 'contenu';
  typeLabel: string;
  title: string;
  desc: string;
  prio: { id: string; slug: string; label: string; sev: Severity; dim: string; audit: string };
  who: string;
  whoInit: string;
  due: string;
  created: string;
  effort: string;
  /** Heures consommées / estimées. */
  spent: number;
  estimate: number;
  timeLog: readonly (readonly [string, string, string, string])[];
  steps: readonly Step[];
  /** `null` pour un livrable qui ne se mesure pas (du contenu, par exemple). */
  measure: Measure | null;
  delivered?: readonly (readonly [string, string])[];
  secondary: string;
  proofLabel: string;
  comments: readonly Comment[];
  files: readonly (readonly [string, string, string])[];
};

export const T_CLIENT = { id: 'acme-corp', name: 'Acme Corp.', pm: 'Marie Chen', pmInit: 'MC' } as const;

export const TASK_TECH: Tache = {
  id: '#142',
  slug: '142',
  type: 'technique',
  typeLabel: 'Correctif technique',
  title: 'Optimiser le LCP mobile — 6 pages stratégiques',
  desc: 'Ramener le LCP sous 2,5 s sur les 6 pages identifiées par l’audit Q2, sans refonte : différer le script de chat tiers, convertir les images héros en WebP avec dimensions explicites, précharger la police et fusionner les CSS bloquants.',
  prio: {
    id: 'P-0418',
    slug: 'p-0418',
    label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques',
    sev: 'critique',
    dim: 'SEO',
    audit: 'Audit technique Q2 · 27 mai 2026',
  },
  who: 'Jules Rivard',
  whoInit: 'JR',
  due: '20 sept. 2026',
  created: '3 sept. 2026',
  effort: '2 jours · dév front',
  spent: 6.75,
  estimate: 16,
  timeLog: [['7 sept.', '2 h 15', 'Jules Rivard', 'Différé le script de chat + mesures lab']],
  steps: [
    { t: 'Différer le script de chat tiers (après interaction)', done: true, who: 'JR', gain: '−1,1 s' },
    { t: 'Convertir 14 images héros en WebP + dimensions explicites', done: true, who: 'JR', gain: '−0,8 s' },
    { t: 'Précharger la police et fusionner les 3 CSS bloquants', done: false, who: 'JR', gain: '−0,4 s' },
    { t: 'Vérifier le LCP sur les 6 pages (lab + terrain)', done: false, who: 'JR' },
    { t: 'Consigner la mesure après correction', done: false, who: 'MC' },
  ],
  measure: {
    label: 'LCP mobile (p75)',
    before: '4,2 s',
    after: '2,1 s',
    target: '< 2,5 s',
    source: 'CrUX · fenêtre 28 j',
  },
  secondary: '+14 % de sessions mobiles sur 28 jours',
  proofLabel:
    'Vos pages s’affichent maintenant en 2,1 secondes sur mobile, contre 4,2 secondes avant. Les visiteurs voient le contenu deux fois plus vite, et Google considère désormais ces pages comme rapides.',
  comments: [
    {
      who: 'Marie Chen',
      init: 'MC',
      date: '3 sept., 09 h 14',
      txt: 'Créée depuis la priorité P-0418. Jules, commence par le script de chat — c’est le plus gros gain pour le moins d’effort.',
    },
    {
      who: 'Jules Rivard',
      init: 'JR',
      date: '5 sept., 16 h 02',
      txt: 'Script différé sur les 6 pages. Mesure lab : LCP 3,3 s (−0,9 s). Les images héros sont plus lourdes que prévu, je fais la conversion demain.',
    },
    {
      who: 'Agent HuntPilote',
      init: '✦',
      ai: true,
      date: '7 sept., 06 h 12',
      txt: 'Le LCP terrain n’a pas encore bougé (4,2 s) : la fenêtre CrUX est de 28 jours, l’effet des corrections apparaîtra progressivement. Prévoir la mesure de clôture après le 20 septembre.',
    },
  ],
  files: [
    ['mesures-lcp-avant.pdf', 'PageSpeed · 3 sept.', '412 Ko'],
    ['capture-waterfall-accueil.png', 'Chrome DevTools · 5 sept.', '1,1 Mo'],
  ],
};

export const TASK_CONTENT: Tache = {
  id: '#151',
  slug: '151',
  type: 'contenu',
  typeLabel: 'Contenu publié',
  title: 'Publier 3 articles longue traîne — guides d’audit',
  desc: 'Rédiger et publier trois guides ciblant les requêtes longue traîne identifiées par l’agent, avec maillage interne vers les pages de service.',
  prio: {
    id: 'P-0431',
    slug: 'p-0426',
    label: '45 mots-clés longue traîne inexploités',
    sev: 'opportunite',
    dim: 'SEO',
    audit: 'Analyse IA · 25 mai 2026',
  },
  who: 'Sofia Nadeau',
  whoInit: 'SN',
  due: '30 sept. 2026',
  created: '1 sept. 2026',
  effort: '3 jours · rédaction',
  spent: 11.5,
  estimate: 24,
  timeLog: [['6 sept.', '4 h 00', 'Sofia Nadeau', 'Rédaction du guide « audit SEO complet »']],
  steps: [
    { t: 'Guide « Comment faire un audit SEO complet » — publié', done: true, who: 'SN' },
    { t: 'Guide « Corriger les liens brisés » — publié', done: true, who: 'SN' },
    { t: 'Guide « Comprendre les Core Web Vitals » — en relecture', done: false, who: 'SN' },
    { t: 'Ajouter le maillage interne vers les pages de service', done: false, who: 'SN' },
  ],
  measure: null,
  delivered: [
    ['/blogue/guide-audit-seo-complet', '1 840 mots · publié le 5 sept.'],
    ['/blogue/corriger-liens-brises', '1 320 mots · publié le 7 sept.'],
  ],
  secondary: '2 articles publiés · 3 200 mots · 12 liens internes ajoutés',
  proofLabel:
    'Deux nouveaux guides sont en ligne sur votre blogue. Ils répondent à des questions que vos clients tapent dans Google et n’étaient couvertes par aucune page de votre site.',
  comments: [
    {
      who: 'Marie Chen',
      init: 'MC',
      date: '1 sept., 11 h 40',
      txt: 'Priorité opportunité — pas urgent, mais les 3 guides doivent sortir avant le rapport de septembre pour compter comme preuve.',
    },
    {
      who: 'Sofia Nadeau',
      init: 'SN',
      date: '7 sept., 14 h 25',
      txt: 'Deux guides en ligne. Le troisième est écrit, il me manque la relecture de Marie.',
    },
  ],
  files: [['plan-editorial-septembre.docx', 'Sofia Nadeau · 1 sept.', '86 Ko']],
};

/** Formate un nombre d'heures décimal en « 6 h 45 ». */
export function formatHours(h: number): string {
  return `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
}
