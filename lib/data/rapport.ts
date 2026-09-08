/**
 * Rapport client mensuel — données partagées entre l'éditeur (écran 1.3)
 * et la page que lit le client.
 *
 * Tout ce qui atteint le client est écrit dans sa langue, pas dans celle de
 * l'audit : un libellé non relu par un humain bloque la publication
 * (règle 1 de `docs/decisions.md`).
 */

export type Proof = {
  id: string;
  title: string;
  text: string;
  /** Mesure avant/après quand le livrable se chiffre ; `null` sinon. */
  before: string | null;
  after: string | null;
  task: string;
  prio: string | null;
  /** Libellé relu par un humain. */
  ok: boolean;
  /** Retenue dans le rapport. */
  on: boolean;
};

export type VisiblePriority = {
  id: string;
  /** « annonce » : constat partagé sans échéance. « traitement » : en cours. */
  state: 'annonce' | 'traitement';
  title: string;
  text: string;
  pct: number;
  doing: string | null;
  ok: boolean;
};

export const REPORT = {
  period: 'Septembre 2026',
  slug: '2026-09',
  client: 'Acme Corp.',
  clientId: 'acme-corp',
  pm: 'Marie Chen',
  pmInit: 'MC',
  pmEmail: 'marie@huntpilote.ca',
  email: 'contact@acmecorp.fr',
  publish: '2 octobre 2026',
  token: 'r/9f3a-acme-sept26',
  score: { now: 92, prev: 87 },
  objective: {
    label: 'Doubler le trafic organique d’ici le T4 2026',
    pct: 68,
    prevPct: 62,
    sentence:
      'Vous êtes à 68 % de l’objectif : le trafic a progressé de 72 % depuis le début du mandat, il en reste 28 % à couvrir en trois mois.',
  },
  summary:
    'Septembre a été un mois de consolidation technique. La vitesse d’affichage sur mobile — le point le plus pénalisant depuis le printemps — est réglée : vos pages passent de 4,2 à 2,1 secondes. Le trafic organique suit avec 38 400 visites, en hausse de 10 % sur un mois. Deux nouveaux guides sont en ligne et commencent à capter des recherches que votre site ne couvrait pas. Le mois prochain, nous nous attaquons aux liens brisés et au maillage interne.',
  kpis: [
    {
      label: 'Visites depuis Google',
      value: '38 400',
      prev: '34 800',
      delta: '+10,3 %',
      up: true,
      sentence: '3 600 visites de plus qu’en août, sans publicité.',
    },
    {
      label: 'Mots-clés en première page',
      value: '31',
      prev: '27',
      delta: '+4',
      up: true,
      sentence: 'Quatre requêtes de plus vous placent parmi les dix premiers résultats.',
    },
    {
      label: 'Vitesse d’affichage mobile',
      value: '2,1 s',
      prev: '4,2 s',
      delta: '−50 %',
      up: true,
      sentence:
        'Sous le seuil de 2,5 s recommandé par Google : vos pages sont désormais considérées comme rapides.',
    },
    {
      label: 'Sites qui vous recommandent',
      value: '3 292',
      prev: '3 280',
      delta: '+12',
      up: true,
      sentence: 'Douze nouveaux liens externes pointent vers votre site ce mois-ci.',
    },
  ],
  proofs: [
    {
      id: 'PV-081',
      title: 'Vos pages s’affichent deux fois plus vite sur mobile',
      text: 'Vos pages s’affichent maintenant en 2,1 secondes sur mobile, contre 4,2 secondes avant. Les visiteurs voient le contenu deux fois plus vite, et Google considère désormais ces pages comme rapides.',
      before: '4,2 s',
      after: '2,1 s',
      task: '#142',
      prio: 'P-0418',
      ok: true,
      on: true,
    },
    {
      id: 'PV-082',
      title: 'Deux nouveaux guides en ligne sur votre blogue',
      text: 'Deux nouveaux guides sont en ligne sur votre blogue. Ils répondent à des questions que vos clients tapent dans Google et n’étaient couvertes par aucune page de votre site.',
      before: null,
      after: null,
      task: '#151',
      prio: 'P-0431',
      ok: false,
      on: true,
    },
    {
      id: 'PV-083',
      title: '18 pages mieux décrites dans les résultats Google',
      text: 'Nous avons réécrit le texte qui apparaît sous le titre de vos pages dans Google, sur 18 pages. Un texte plus clair donne envie de cliquer.',
      before: '2,9 %',
      after: '3,4 %',
      task: '#138',
      prio: 'P-0402',
      ok: true,
      on: true,
    },
    {
      id: 'PV-084',
      title: '12 nouveaux sites pointent vers vous',
      text: 'Douze sites externes de bonne réputation ont ajouté un lien vers vos pages. C’est un signal de confiance pour Google.',
      before: null,
      after: null,
      task: '#133',
      prio: null,
      ok: true,
      on: false,
    },
  ] as readonly Proof[],
  priorities: [
    {
      id: 'P-0421',
      state: 'traitement',
      title: 'Liens qui ne mènent nulle part',
      text: 'Vingt-trois liens de votre site mènent vers des pages qui n’existent plus. Cela gaspille le temps que Google consacre à explorer votre site, et frustre les visiteurs qui tombent dessus.',
      pct: 25,
      doing: 'Inventaire terminé, redirections en cours d’écriture.',
      ok: true,
    },
    {
      id: 'P-0428',
      state: 'annonce',
      title: 'Des pages difficiles à trouver depuis votre menu',
      text: 'Vingt-trois pages de votre site ne sont accessibles par aucun lien depuis votre navigation. Google les visite rarement, et vos visiteurs ne les trouvent pas.',
      pct: 0,
      doing: null,
      ok: false,
    },
    {
      id: 'P-0430',
      state: 'traitement',
      title: 'Quatre pages qui se font concurrence',
      text: 'Quatre de vos pages traitent du même sujet. Google ne sait pas laquelle proposer, et les deux perdent en visibilité.',
      pct: 60,
      doing: 'Deux pages fusionnées, deux restantes à traiter.',
      ok: true,
    },
  ] as readonly VisiblePriority[],
  next: [
    [
      'Corriger les 23 liens brisés',
      'Terminé avant le 15 octobre — les redirections sont écrites, il reste la mise en ligne.',
    ],
    [
      'Rendre les 23 pages orphelines accessibles',
      'Ajout de liens depuis votre menu et vos pages de service.',
    ],
    ['Publier le troisième guide longue traîne', 'Il est écrit, il passe en relecture cette semaine.'],
  ] as readonly (readonly [string, string])[],
  versions: [
    {
      v: 'v2',
      date: '3 oct. 2026, 09 h 41',
      who: 'Marie Chen',
      note: 'Correction du chiffre de vitesse (2,1 s au lieu de 2,2 s)',
    },
    { v: 'v1', date: '2 oct. 2026, 08 h 00', who: 'Automatisation', note: 'Première publication' },
  ],
} as const;

/* ── Sections du rapport ── */

export type SectionId = 'synthese' | 'situation' | 'kpis' | 'preuves' | 'travail' | 'suite';

export const SECTIONS: readonly { id: SectionId; name: string; desc: string; ai?: boolean }[] = [
  { id: 'synthese', name: 'Synthèse du mois', desc: 'Rédigée par l’agent, modifiable', ai: true },
  { id: 'situation', name: 'Où on en est', desc: 'Score de santé et objectif' },
  { id: 'kpis', name: 'Ce qui a bougé', desc: 'Chiffres de la période' },
  { id: 'preuves', name: 'Ce qu’on a fait', desc: 'Preuves de valeur retenues' },
  { id: 'travail', name: 'Ce sur quoi on travaille', desc: 'Priorités visibles au client' },
  { id: 'suite', name: 'La suite', desc: 'Prévu le mois prochain' },
];

/* ── États de démonstration de l'éditeur ── */

export type EditorState = 'brouillon' | 'bloque' | 'pret' | 'publie' | 'corrige' | 'sanspreuve';

export const ED_STATES: readonly (readonly [EditorState, string])[] = [
  ['brouillon', 'Brouillon'],
  ['bloque', 'Bloqué par une relecture'],
  ['pret', 'Prêt à publier'],
  ['publie', 'Publié'],
  ['corrige', 'Publié puis corrigé (v2)'],
  ['sanspreuve', 'Période sans aucune preuve'],
];

export const BANNER: Record<
  EditorState,
  { tone: 'neutral' | 'green' | 'yellow' | 'blue'; title: string; desc: string }
> = {
  brouillon: {
    tone: 'neutral',
    title: 'Brouillon — rien n’est encore visible du client',
    desc: 'Le rapport se construit. Le client ne voit rien tant que vous n’avez pas publié.',
  },
  pret: {
    tone: 'green',
    title: 'Prêt à publier',
    desc: 'Tous les libellés client sont relus. La publication figera cette version.',
  },
  bloque: {
    tone: 'yellow',
    title: 'Publication bloquée — des libellés client sont encore à relire',
    desc: 'Un texte non relu peut contenir du jargon d’audit. Relisez-les avant de publier.',
  },
  publie: {
    tone: 'green',
    title: 'Publié',
    desc: 'Le client lit une version figée. Vos modifications ici ne l’atteindront qu’à la prochaine publication.',
  },
  corrige: {
    tone: 'blue',
    title: 'Corrigé après publication — version 2 en ligne',
    desc: 'La correction est publiée. Le lien du client affiche désormais la v2.',
  },
  sanspreuve: {
    tone: 'yellow',
    title: 'Aucune preuve de valeur pour cette période',
    desc: 'Aucune tâche clôturée en septembre. Le rapport ne montrera que des chiffres et des chantiers en cours.',
  },
};
