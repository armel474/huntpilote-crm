/** Workflow & automatisations — règles « Quand → Alors » de démonstration. */

import { CLIENTS } from '@/lib/data/clients';
import { TEAM } from '@/lib/data/settings';

export type CatId = 'surveillance' | 'rapports' | 'client' | 'facturation' | 'ia';

export const CATEGORIES: Record<
  CatId,
  { label: string; color: string; bg: string; border: string }
> = {
  surveillance: {
    label: 'Surveillance SEO',
    color: 'var(--blue-fg)',
    bg: 'var(--blue-m)',
    border: 'var(--blue-b)',
  },
  rapports: {
    label: 'Rapports',
    color: 'var(--green-fg)',
    bg: 'var(--green-m)',
    border: 'var(--green-b)',
  },
  client: {
    label: 'Cycle client',
    color: 'var(--violet-fg)',
    bg: 'var(--violet-m)',
    border: 'var(--violet-b)',
  },
  facturation: {
    label: 'Facturation',
    color: 'var(--yellow-fg)',
    bg: 'var(--yellow-m)',
    border: 'var(--yellow-b)',
  },
  ia: { label: 'IA', color: 'var(--violet-fg)', bg: 'var(--violet-m)', border: 'var(--violet-b)' },
};

export type GlyphName =
  | 'warn'
  | 'cal'
  | 'clock'
  | 'trophy'
  | 'link'
  | 'bolt'
  | 'task'
  | 'doc'
  | 'mail'
  | 'chart'
  | 'star'
  | 'bill'
  | 'pin'
  | 'bell'
  | 'send'
  | 'search';

export type Automation = {
  id: number;
  name: string;
  desc: string;
  cat: CatId;
  icon: GlyphName;
  trigger: string;
  action: string;
  actionIcon: GlyphName;
  active: boolean;
  runs: number;
  last: string;
  /** Taux de succès en %. */
  success: number;
  /** Automatisation portée par un agent IA (accent violet). */
  ai: boolean;
};

export const AUTOMATIONS: Automation[] = [
  {
    id: 1,
    name: 'Alerte chute de position',
    desc: 'Surveille les mots-clés stratégiques en temps réel',
    cat: 'surveillance',
    icon: 'warn',
    trigger: 'Un mot-clé top 10 perd ≥ 5 positions',
    action: 'Créer une tâche critique + notifier le responsable',
    actionIcon: 'task',
    active: true,
    runs: 24,
    last: 'il y a 2 j',
    success: 100,
    ai: false,
  },
  {
    id: 2,
    name: 'Rapport mensuel automatique',
    desc: 'Génère et envoie le bilan SEO à chaque client',
    cat: 'rapports',
    icon: 'cal',
    trigger: 'Le 2 de chaque mois à 8 h 00',
    action: "Générer le rapport et l'envoyer au client",
    actionIcon: 'doc',
    active: true,
    runs: 6,
    last: '2 juin',
    success: 100,
    ai: true,
  },
  {
    id: 3,
    name: 'Audit technique trimestriel',
    desc: 'Vérification complète de la santé du site',
    cat: 'surveillance',
    icon: 'clock',
    trigger: 'Tous les 3 mois',
    action: 'Lancer un audit complet du site',
    actionIcon: 'bolt',
    active: true,
    runs: 4,
    last: '15 avr.',
    success: 100,
    ai: false,
  },
  {
    id: 4,
    name: 'Score santé sous le seuil',
    desc: 'Détecte les comptes qui décrochent',
    cat: 'surveillance',
    icon: 'warn',
    trigger: "Le score SEO d'un client passe sous 70",
    action: 'Créer une tâche + alerter le chef de projet',
    actionIcon: 'task',
    active: true,
    runs: 11,
    last: 'il y a 5 j',
    success: 95,
    ai: false,
  },
  {
    id: 5,
    name: 'Onboarding nouveau client',
    desc: 'Démarre le parcours dès la signature',
    cat: 'client',
    icon: 'trophy',
    trigger: "Un deal passe à l'étape « Gagné »",
    action: "Créer la fiche client + checklist d'onboarding",
    actionIcon: 'task',
    active: true,
    runs: 8,
    last: '1 juin',
    success: 100,
    ai: false,
  },
  {
    id: 6,
    name: 'Relance facture impayée',
    desc: 'Automatise le suivi des paiements en retard',
    cat: 'facturation',
    icon: 'clock',
    trigger: 'Une facture dépasse 3 jours de retard',
    action: 'Envoyer un rappel de paiement par courriel',
    actionIcon: 'mail',
    active: true,
    runs: 3,
    last: 'il y a 1 j',
    success: 100,
    ai: false,
  },
  {
    id: 7,
    name: 'Détection de liens brisés',
    desc: 'Repère les 404 qui gaspillent le budget crawl',
    cat: 'surveillance',
    icon: 'link',
    trigger: 'Le crawl détecte de nouvelles erreurs 404',
    action: "Créer une tâche technique pour l'équipe",
    actionIcon: 'task',
    active: false,
    runs: 17,
    last: 'il y a 8 j',
    success: 92,
    ai: false,
  },
  {
    id: 8,
    name: 'Synthèse IA hebdomadaire',
    desc: 'Un résumé intelligent de tous les comptes',
    cat: 'ia',
    icon: 'bolt',
    trigger: 'Chaque lundi à 7 h 00',
    action: 'Générer une synthèse IA de tous les comptes',
    actionIcon: 'doc',
    active: true,
    runs: 21,
    last: 'lundi',
    success: 100,
    ai: true,
  },
];

export const TEMPLATES: {
  name: string;
  desc: string;
  cat: CatId;
  icon: GlyphName;
  ai?: boolean;
}[] = [
  {
    name: 'Alerte Core Web Vitals',
    desc: 'Notifie quand le LCP mobile dépasse 2,5 s',
    cat: 'surveillance',
    icon: 'warn',
  },
  {
    name: 'Anniversaire de contrat',
    desc: "Prépare le renouvellement 30 j avant l'échéance",
    cat: 'client',
    icon: 'cal',
  },
  {
    name: 'Veille concurrentielle',
    desc: 'Compare le trafic des concurrents chaque semaine',
    cat: 'ia',
    icon: 'bolt',
    ai: true,
  },
  {
    name: 'Détection de cannibalisation',
    desc: 'Repère les pages qui se concurrencent sur un mot-clé',
    cat: 'surveillance',
    icon: 'link',
  },
];

export const CATEGORY_FILTERS: { id: 'tous' | CatId; label: string }[] = [
  { id: 'tous', label: 'Toutes' },
  { id: 'surveillance', label: 'Surveillance' },
  { id: 'rapports', label: 'Rapports' },
  { id: 'client', label: 'Cycle client' },
  { id: 'facturation', label: 'Facturation' },
  { id: 'ia', label: 'IA' },
];

/* ────────────────────────────────────────────────────────────────────────
   Éditeur d'automatisation — session 4.4.

   Vocabulaire du constructeur de règle (Quand → Si → Alors), indexé sur les
   mêmes automatisations que AUTOMATIONS ci-dessus : RULE_SEEDS complète
   chaque règle existante (même id) avec ce que « Modifier » ouvre. Les
   listes de clients et d'équipe reprennent les comptes et les membres
   réels de l'agence plutôt qu'un jeu de noms inventés pour la démo.
   ──────────────────────────────────────────────────────────────────────── */

export type TriggerId = 'position' | 'score' | 'crawl' | 'avis' | 'date' | 'pipeline' | 'facture' | 'citation';

export type TriggerParam = {
  key: string;
  label: string;
  unit?: string;
  def: number | string;
  min?: number;
  max?: number;
  options?: string[];
};

export type TriggerDef = {
  label: string;
  phrase: (v: number | string) => string;
  param: TriggerParam;
  icon: GlyphName;
};

export const TRIGGERS: Record<TriggerId, TriggerDef> = {
  position: {
    label: 'Chute de position',
    phrase: (n) => `un mot-clé suivi perd ${n} places ou plus`,
    param: { key: 'places', label: 'Places perdues', unit: 'places', def: 5, min: 1, max: 30 },
    icon: 'chart',
  },
  score: {
    label: 'Score de santé sous un seuil',
    phrase: (n) => `le score de santé d’un client passe sous ${n}`,
    param: { key: 'seuil', label: 'Seuil de score', unit: '/100', def: 70, min: 30, max: 95 },
    icon: 'warn',
  },
  crawl: {
    label: 'Nouvelle erreur de crawl',
    phrase: (n) => `le crawl découvre ${n} nouvelles erreurs ou plus`,
    param: { key: 'erreurs', label: 'Erreurs découvertes', unit: 'erreurs', def: 10, min: 1, max: 200 },
    icon: 'link',
  },
  avis: {
    label: 'Nouvel avis',
    phrase: (n) => `un nouvel avis de ${n} étoiles ou moins est publié`,
    param: { key: 'etoiles', label: 'Note maximale', unit: '★', def: 3, min: 1, max: 5 },
    icon: 'star',
  },
  date: {
    label: 'Date récurrente',
    phrase: (n) => `on atteint le ${n} de chaque mois`,
    param: { key: 'jour', label: 'Jour du mois', unit: 'du mois', def: 2, min: 1, max: 28 },
    icon: 'cal',
  },
  pipeline: {
    label: 'Changement d’étape au pipeline',
    phrase: (n) => `un deal passe à l’étape « ${n} »`,
    param: {
      key: 'etape',
      label: 'Étape visée',
      options: ['Qualifié', 'Proposition', 'Négociation', 'Gagné', 'Perdu'],
      def: 'Gagné',
    },
    icon: 'trophy',
  },
  facture: {
    label: 'Facture en retard',
    phrase: (n) => `une facture dépasse ${n} jours de retard`,
    param: { key: 'jours', label: 'Jours de retard', unit: 'jours', def: 3, min: 1, max: 90 },
    icon: 'bill',
  },
  citation: {
    label: 'Incohérence de citation',
    phrase: (n) =>
      `${n} annuaire${Number(n) > 1 ? 's' : ''} ou plus affiche${Number(n) > 1 ? 'nt' : ''} des coordonnées différentes de la fiche`,
    param: { key: 'annuaires', label: 'Annuaires en écart', unit: 'annuaires', def: 1, min: 1, max: 20 },
    icon: 'pin',
  },
};

export type CondKind = 'clients' | 'forfait' | 'dim' | 'volume' | 'semaine' | 'nonassignee';
export type CondValue = string[] | string | number | boolean;
export type Cond = { kind: CondKind; value: CondValue };

export type CondDef = {
  label: string;
  phrase: (v: CondValue) => string;
  kind: 'clients' | 'forfait' | 'dim' | 'nombre' | 'bool';
  only?: TriggerId[];
  def?: number;
};

export const DIMS = ['Présence en ligne', 'SEO', 'Design'];
export const FORFAITS = ['Essentiel', 'Croissance', 'Sur mesure'];
/** Comptes réels de l'agence (les prospects ne sont pas des cibles d'automatisation client). */
export const RULE_CLIENTS = CLIENTS.filter((c) => c.type === 'client').map((c) => c.name);
/** Équipe réelle de l'agence — mêmes membres que Paramètres › Équipe. */
export const TEAM_NAMES = TEAM.map((t) => t.name);

export const COND_KINDS: Record<CondKind, CondDef> = {
  clients: {
    label: 'Seulement certains clients',
    phrase: (v) => `le client fait partie de ${(v as string[]).length ? (v as string[]).join(', ') : '— aucun client choisi'}`,
    kind: 'clients',
  },
  forfait: {
    label: 'Seulement certains forfaits',
    phrase: (v) => `le client est au forfait ${(v as string[]).length ? (v as string[]).join(' ou ') : '— aucun forfait choisi'}`,
    kind: 'forfait',
  },
  dim: {
    label: 'Seulement une dimension d’audit',
    phrase: (v) => `la priorité concerne la dimension ${v}`,
    kind: 'dim',
    only: ['crawl', 'score', 'citation'],
  },
  volume: {
    label: 'Seulement au-delà d’un volume de recherche',
    phrase: (v) => `le mot-clé dépasse ${v} recherches par mois`,
    kind: 'nombre',
    def: 500,
    only: ['position'],
  },
  semaine: {
    label: 'Seulement en semaine',
    phrase: () => 'on est du lundi au vendredi, entre 8 h et 18 h',
    kind: 'bool',
  },
  nonassignee: {
    label: 'Seulement si rien n’est déjà assigné',
    phrase: () => 'aucune tâche ouverte ne couvre déjà le sujet',
    kind: 'bool',
  },
};

/** Une condition qui ne parle pas du déclencheur choisi est retirée : la phrase doit rester vraie. */
export const condAllowed = (kind: CondKind, trigger: TriggerId | null) => {
  const k = COND_KINDS[kind];
  return !k.only || (!!trigger && k.only.includes(trigger));
};
export const pruneConds = (conds: Cond[], trigger: TriggerId | null) =>
  conds.filter((c) => condAllowed(c.kind, trigger));

export type ActionId = 'tache' | 'priorite' | 'notifier' | 'courriel' | 'rapport' | 'audit';
export type ActionParams = { sev: string; dim: string; assignee: string; effort: number; dest: string };
export type ActionDef = { label: string; phrase: (v: ActionParams) => string; icon: GlyphName; creates: string };

export const SEVS = ['Critique', 'Important', 'Opportunité'];

export const ACTIONS: Record<ActionId, ActionDef> = {
  tache: {
    label: 'Créer une tâche',
    phrase: (v) => `créer une tâche assignée à ${v.assignee} avec ${v.effort} h estimées`,
    icon: 'task',
    creates: 'une tâche dans le plan d’action',
  },
  priorite: {
    label: 'Créer une priorité',
    phrase: (v) => `créer une priorité de sévérité « ${v.sev} » sur la dimension ${v.dim}`,
    icon: 'warn',
    creates: 'une priorité rattachée à l’audit',
  },
  notifier: {
    label: 'Notifier l’équipe',
    phrase: (v) => `notifier ${v.assignee} dans HuntPilote`,
    icon: 'bell',
    creates: 'une notification interne',
  },
  courriel: {
    label: 'Envoyer un courriel',
    phrase: (v) => `envoyer un courriel au ${v.dest}`,
    icon: 'send',
    creates: 'un courriel sortant',
  },
  rapport: {
    label: 'Générer un rapport',
    phrase: () => 'générer le rapport de la période en brouillon',
    icon: 'doc',
    creates: 'un brouillon de rapport',
  },
  audit: {
    label: 'Lancer un audit',
    phrase: (v) => `lancer un audit ${v.dim === 'Toutes' ? 'complet' : `de ${v.dim}`}`,
    icon: 'search',
    creates: 'une exécution d’audit',
  },
};

/** Seuil : au-delà de ce nombre d'échecs consécutifs, la règle est mise en pause automatiquement. */
export const FAIL_MAX = 3;
/** Seuil de vigilance du test à blanc : au-delà, la règle est probablement trop large. */
export const DRY_MAX = 20;

export type RuleStatus = 'active' | 'pause' | 'echec' | 'brouillon';

export type Rule = {
  name: string;
  desc: string;
  status: RuleStatus;
  trigger: TriggerId | null;
  params: Record<string, number | string>;
  conds: Cond[];
  action: ActionId | null;
  actionParams: ActionParams;
};

const DEFAULT_ACTION_PARAMS: ActionParams = {
  sev: 'Important',
  dim: 'SEO',
  assignee: TEAM_NAMES[0],
  effort: 2,
  dest: 'client',
};

/** Rien qu'un squelette Quand/Alors par automatisation existante — nom, description et
    statut viennent toujours de la ligne cliquée, jamais d'une règle constante. */
type RuleSeed = Pick<Rule, 'trigger' | 'params' | 'conds' | 'action' | 'actionParams'>;

const RULE_SEEDS: Record<number, RuleSeed> = {
  1: {
    // Alerte chute de position
    trigger: 'position',
    params: { places: 5 },
    conds: [
      { kind: 'volume', value: 500 },
      { kind: 'clients', value: RULE_CLIENTS.slice(0, 3) },
    ],
    action: 'priorite',
    actionParams: { ...DEFAULT_ACTION_PARAMS, sev: 'Critique', dim: 'SEO' },
  },
  2: {
    // Rapport mensuel automatique
    trigger: 'date',
    params: { jour: 2 },
    conds: [],
    action: 'rapport',
    actionParams: { ...DEFAULT_ACTION_PARAMS },
  },
  3: {
    // Audit technique trimestriel
    trigger: 'date',
    params: { jour: 1 },
    conds: [],
    action: 'audit',
    actionParams: { ...DEFAULT_ACTION_PARAMS, dim: 'Toutes' },
  },
  4: {
    // Score santé sous le seuil
    trigger: 'score',
    params: { seuil: 70 },
    conds: [],
    action: 'tache',
    actionParams: { ...DEFAULT_ACTION_PARAMS, assignee: TEAM_NAMES[1] ?? TEAM_NAMES[0], effort: 2 },
  },
  5: {
    // Onboarding nouveau client
    trigger: 'pipeline',
    params: { etape: 'Gagné' },
    conds: [],
    action: 'tache',
    actionParams: { ...DEFAULT_ACTION_PARAMS, assignee: TEAM_NAMES[0], effort: 4 },
  },
  6: {
    // Relance facture impayée
    trigger: 'facture',
    params: { jours: 3 },
    conds: [],
    action: 'courriel',
    actionParams: { ...DEFAULT_ACTION_PARAMS, dest: 'client' },
  },
  7: {
    // Détection de liens brisés
    trigger: 'crawl',
    params: { erreurs: 10 },
    conds: [],
    action: 'tache',
    actionParams: { ...DEFAULT_ACTION_PARAMS, assignee: TEAM_NAMES[2] ?? TEAM_NAMES[0], effort: 2 },
  },
  8: {
    // Synthèse IA hebdomadaire
    trigger: 'date',
    params: { jour: 1 },
    conds: [],
    action: 'rapport',
    actionParams: { ...DEFAULT_ACTION_PARAMS },
  },
};

const blankSeed: RuleSeed = {
  trigger: null,
  params: {},
  conds: [],
  action: null,
  actionParams: { ...DEFAULT_ACTION_PARAMS },
};

/** Règle chargée par « Modifier » sur une ligne existante — jamais la même pour deux lignes. */
export function ruleFromAutomation(a: Automation): Rule {
  const seed = RULE_SEEDS[a.id] ?? blankSeed;
  return { name: a.name, desc: a.desc, status: a.active ? 'active' : 'pause', ...seed };
}

/** Règle vierge — « Créer une automatisation » ou un modèle. */
export function blankRule(name = '', desc = ''): Rule {
  return { name, desc, status: 'brouillon', ...blankSeed, actionParams: { ...DEFAULT_ACTION_PARAMS } };
}

/* ── Journal d'exécution ── */
export type LogEntry = {
  id: string;
  at: string;
  ok: boolean;
  matched: number;
  produced: string;
  err?: boolean;
  /** Corriger la cause de l'échec renvoie vers Paramètres › Intégrations — seule cible réelle. */
  toParametres?: boolean;
};

export const LOG_ACTIVE: LogEntry[] = [
  { id: 'X-0912', at: '9 sept. 2026, 07 h 58', ok: true, matched: 1, produced: 'Priorité créée — un mot-clé suivi perd 10 places' },
  { id: 'X-0905', at: '2 sept. 2026, 07 h 55', ok: true, matched: 2, produced: '2 objets créés sur des comptes distincts' },
  {
    id: 'X-0898',
    at: '26 août 2026, 07 h 56',
    ok: false,
    matched: 0,
    produced: 'Échec : jeton Google Search Console expiré pour un compte suivi',
    err: true,
    toParametres: true,
  },
  { id: 'X-0891', at: '19 août 2026, 07 h 54', ok: true, matched: 0, produced: 'Aucun mot-clé au-delà du seuil — rien créé' },
  { id: 'X-0884', at: '12 août 2026, 07 h 57', ok: true, matched: 3, produced: '3 objets créés sur 2 comptes' },
];

export const LOG_FAIL: LogEntry[] = [
  {
    id: 'X-0912',
    at: '9 sept. 2026, 07 h 58',
    ok: false,
    matched: 0,
    produced: 'Échec : jeton Google Search Console expiré',
    err: true,
    toParametres: true,
  },
  {
    id: 'X-0905',
    at: '2 sept. 2026, 07 h 55',
    ok: false,
    matched: 0,
    produced: 'Échec : jeton Google Search Console expiré',
    err: true,
    toParametres: true,
  },
  {
    id: 'X-0898',
    at: '26 août 2026, 07 h 56',
    ok: false,
    matched: 0,
    produced: 'Échec : quota d’API dépassé pour le relevé',
    err: true,
    toParametres: true,
  },
  { id: 'X-0891', at: '19 août 2026, 07 h 54', ok: true, matched: 1, produced: 'Objet créé avec succès' },
];

/* ── Test à blanc : ce que la règle aurait fait le mois dernier ── */
export type DryRow = { date: string; client: string; v: number | string; detail: string; vol?: number };

export const DRY_BY_TRIGGER: Record<TriggerId, DryRow[]> = {
  position: [
    { date: '2 sept.', client: 'Acme Corp.', v: 6, detail: '« métadonnées og » perd 6 places (1 200 rech./mois)', vol: 1200 },
    { date: '2 sept.', client: 'Clinique Lavoie', v: 8, detail: '« clinique laval prix » perd 8 places (940 rech./mois)', vol: 940 },
    { date: '26 août', client: 'Boréal Immobilier', v: 5, detail: '« courtier laval » perd 5 places (610 rech./mois)', vol: 610 },
    { date: '19 août', client: 'Acme Corp.', v: 11, detail: '« audit seo montréal » perd 11 places (780 rech./mois)', vol: 780 },
    { date: '12 août', client: 'Le Marché Bio', v: 7, detail: '« épicerie bio rive-nord » perd 7 places (520 rech./mois)', vol: 520 },
    { date: '12 août', client: 'Dupont SAS', v: 4, detail: '« services b2b lyon » perd 4 places (310 rech./mois)', vol: 310 },
  ],
  score: [
    { date: '5 sept.', client: 'Boréal Immobilier', v: 61, detail: 'score de santé descendu à 61' },
    { date: '28 août', client: 'Dupont SAS', v: 66, detail: 'score de santé descendu à 66' },
    { date: '21 août', client: 'Le Marché Bio', v: 58, detail: 'score de santé descendu à 58' },
    { date: '14 août', client: 'Clinique Lavoie', v: 74, detail: 'score de santé descendu à 74' },
  ],
  crawl: [
    { date: '8 sept.', client: 'Acme Corp.', v: 23, detail: '23 nouveaux liens brisés découverts' },
    { date: '3 sept.', client: 'Le Marché Bio', v: 48, detail: '48 pages en 404 après la refonte' },
    { date: '27 août', client: 'Boréal Immobilier', v: 4, detail: '4 pages en 404 sur les pages quartiers' },
    { date: '20 août', client: 'Clinique Lavoie', v: 12, detail: '12 balises title dupliquées' },
  ],
  avis: [
    { date: '9 sept.', client: 'Clinique Lavoie', v: 1, detail: 'avis 1 ★ — « délai de rendez-vous »' },
    { date: '30 août', client: 'Boréal Immobilier', v: 2, detail: 'deux avis 2 ★ le même jour' },
    { date: '24 août', client: 'Le Marché Bio', v: 3, detail: 'avis 3 ★ — rupture de stock' },
    { date: '16 août', client: 'Dupont SAS', v: 5, detail: 'avis 5 ★ — aucune action attendue' },
  ],
  facture: [
    { date: '9 sept.', client: 'Dupont SAS', v: 12, detail: 'facture 2026-0431 · 750 $ · 12 jours de retard' },
    { date: '2 sept.', client: 'Boréal Immobilier', v: 5, detail: 'facture 2026-0425 · 180 $ · 5 jours de retard' },
    { date: '25 août', client: 'Le Marché Bio', v: 2, detail: 'facture 2026-0419 · 950 $ · 2 jours de retard' },
  ],
  citation: [
    { date: '6 sept.', client: 'Boréal Immobilier', v: 4, detail: '4 annuaires affichent l’ancien numéro' },
    { date: '29 août', client: 'Clinique Lavoie', v: 2, detail: '2 annuaires affichent d’anciennes heures' },
    { date: '18 août', client: 'Le Marché Bio', v: 1, detail: '1 annuaire affiche une adresse périmée' },
  ],
  date: [{ date: '2 sept.', client: 'Tout le portefeuille', v: 2, detail: 'la date récurrente est passée une fois sur la période' }],
  pipeline: [
    { date: '8 sept.', client: 'Immobilier Vista', v: 'Gagné', detail: 'deal passé à l’étape « Gagné »' },
    { date: '4 sept.', client: 'Clinique Santé Plus', v: 'Négociation', detail: 'deal passé à l’étape « Négociation »' },
    { date: '27 août', client: 'Brasserie Houblon', v: 'Gagné', detail: 'deal passé à l’étape « Gagné »' },
  ],
};

/** Le test compare la valeur mesurée au paramètre : « au moins » pour les volumes, « au plus » pour les notes. */
const DRY_CMP: Record<TriggerId, (v: number | string, n: number | string) => boolean> = {
  position: (v, n) => Number(v) >= Number(n),
  crawl: (v, n) => Number(v) >= Number(n),
  citation: (v, n) => Number(v) >= Number(n),
  facture: (v, n) => Number(v) >= Number(n),
  score: (v, n) => Number(v) < Number(n),
  avis: (v, n) => Number(v) <= Number(n),
  date: () => true,
  pipeline: (v, n) => v === n,
};

export type DryResult = DryRow & { would: string };

export function dryRun(rule: Rule): DryResult[] {
  if (!rule.trigger) return [];
  const t = TRIGGERS[rule.trigger];
  const p = t.param;
  const n = rule.params[p.key] !== undefined ? rule.params[p.key] : p.def;
  const cmp = DRY_CMP[rule.trigger] ?? (() => true);
  const volCond = rule.conds.find((c) => c.kind === 'volume');
  const cliCond = rule.conds.find((c) => c.kind === 'clients');
  const label = rule.action
    ? rule.action === 'priorite'
      ? `Priorité ${rule.actionParams.sev.toLowerCase()} · ${rule.actionParams.dim}`
      : rule.action === 'tache'
        ? `Tâche · ${rule.actionParams.assignee} · ${rule.actionParams.effort} h`
        : ACTIONS[rule.action].label
    : '—';
  return (DRY_BY_TRIGGER[rule.trigger] ?? [])
    .filter((r) => cmp(r.v, n))
    .filter((r) => !volCond || r.vol === undefined || r.vol >= (volCond.value as number))
    .filter(
      (r) =>
        !cliCond ||
        (cliCond.value as string[]).length === 0 ||
        (cliCond.value as string[]).includes(r.client) ||
        r.client === 'Tout le portefeuille',
    )
    .map((r) => ({ ...r, would: label }));
}

/* ── Aperçu en langage naturel ── */
export type Sentence = { when: string | null; ifs: string[]; then: string | null };

export function ruleSentence(rule: Rule): Sentence {
  const t = rule.trigger ? TRIGGERS[rule.trigger] : null;
  const p = t?.param;
  const tv = p ? (rule.params[p.key] !== undefined ? rule.params[p.key] : p.def) : null;
  const a = rule.action ? ACTIONS[rule.action] : null;
  return {
    when: t && tv !== null ? t.phrase(tv) : null,
    ifs: rule.conds.map((c) => COND_KINDS[c.kind].phrase(c.value)),
    then: a ? a.phrase(rule.actionParams) : null,
  };
}

/* ── États de démonstration ── */
export type DemoStateId = 'active' | 'nouvelle' | 'pause' | 'echec' | 'jamais';

export const DEMO_STATES: [DemoStateId, string][] = [
  ['active', 'Règle active'],
  ['nouvelle', 'Nouvelle règle'],
  ['pause', 'Règle en pause'],
  ['echec', 'Règle en échec répété'],
  ['jamais', 'Jamais déclenchée'],
];

/** Règle illustrative pour l'état « jamais déclenchée » — indépendante de la ligne ouverte,
    au même titre que les autres états de démo déjà utilisés ailleurs dans le cockpit. */
const NEVER_RULE: Rule = {
  name: 'Incohérence de citation détectée',
  desc: 'Ouvre une tâche dès qu’un annuaire affiche des coordonnées divergentes.',
  status: 'active',
  trigger: 'citation',
  params: { annuaires: 3 },
  conds: [],
  action: 'tache',
  actionParams: { ...DEFAULT_ACTION_PARAMS },
};

/** Applique un état de démonstration à une règle de base (celle de la ligne ouverte). */
export function applyDemoState(base: Rule, state: DemoStateId): { rule: Rule; log: LogEntry[] } {
  if (state === 'nouvelle') return { rule: blankRule(base.name, base.desc), log: [] };
  if (state === 'pause') return { rule: { ...base, status: 'pause' }, log: LOG_ACTIVE };
  if (state === 'echec') return { rule: { ...base, status: 'echec' }, log: LOG_FAIL };
  if (state === 'jamais') return { rule: NEVER_RULE, log: [] };
  return { rule: { ...base, status: 'active' }, log: LOG_ACTIVE };
}
