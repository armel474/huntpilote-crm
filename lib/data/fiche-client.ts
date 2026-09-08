/**
 * Fiche client — données de démonstration.
 * Fusion des maquettes v2 (rapport IA, prochaines actions, santé technique,
 * rapports, facturation) et v3 (KPIs, priorités, preuves de valeur, contrat).
 */

import type { FeedItem } from '@/components/ui/Atoms';

export const CLIENT = {
  id: 'acme-corp',
  name: 'Acme Corp.',
  initials: 'AC',
  sector: 'E-commerce',
  email: 'contact@acmecorp.fr',
  phone: '(514) 555-0182',
  website: 'acmecorp.fr',
  address: 'Montréal, QC',
  services: ['SEO Tech.', 'Contenu', 'Audit', 'Backlinks'],
  score: 92,
  mrr: '1 200 $ CA',
  since: 'Janvier 2024',
  pm: 'Marie Chen',
  pmInitials: 'MC',
  lastAudit: '15 avr. 2026',
  objective: '+30 % trafic organique — T3 2026',
  objectiveProgress: 62,
  plan: 'Croissance SEO',
  engagement: "12 mois · jusqu'au 31 déc. 2026",
  /** Contexte projet affiché dans la colonne de gauche. */
  context:
    "Doubler le trafic organique d'ici Q4 2026. Priorité au positionnement top 3 sur les requêtes transactionnelles.",
  contextTags: ['Trafic ×2', 'Top 3 KW', 'CTR +50%'],
} as const;

/* ── États UX de la fiche ── */

export const UX_STATES = [
  { id: 'active', label: 'Client actif complet' },
  { id: 'onboarding', label: 'Onboarding en cours' },
  { id: 'nodata', label: 'Sans intégrations SEO' },
  { id: 'audit', label: 'Audit en cours' },
  { id: 'stale', label: 'Données obsolètes' },
  { id: 'nocritical', label: 'Aucune priorité critique' },
  { id: 'error', label: 'Erreur partielle' },
] as const;

export type UxState = (typeof UX_STATES)[number]['id'];

/* ── KPIs SEO ── */

export const KPIS = [
  { label: 'Sessions org.', value: '34,8k', sub: '+18 % vs mars' },
  { label: 'Positions top 10', value: '27', sub: '+12 ce mois' },
  { label: 'CTR moyen', value: '3,4 %', sub: '+0,3 pt' },
  { label: 'Pages indexées', value: '1 240', sub: '+34 pages' },
  { label: 'Backlinks réf.', value: '3 280', sub: '+12 nouveaux' },
] as const;

/* ── Rapport IA ── */

export const AI_POSITIVE = [
  'Croissance de 12 nouvelles positions top 10 ce mois-ci',
  'CTR en hausse (+0,3 pt) grâce aux optimisations récentes',
  'Profil backlink sain — 3 280 liens actifs (DR moyen 58)',
] as const;

export const AI_NEGATIVE = [
  'Vitesse mobile insuffisante — LCP à 4,2 s (objectif : < 2,5 s)',
  '23 liens brisés détectés impactant le budget de crawl',
  '4 pages avec duplication de contenu (risque de cannibalisation)',
] as const;

export const AI_SUMMARY =
  'Le site affiche une croissance soutenue sur les mots-clés transactionnels. La refonte du maillage interne a porté ses fruits avec +12 nouvelles positions top 10. Attention aux Core Web Vitals — la vitesse mobile reste sous les seuils recommandés (LCP 4,2 s).';

export const AI_SUMMARY_CLEAN =
  "Le site est en excellente santé SEO. Aucune priorité critique détectée. Les gains récents sont solides : +12 positions top 10, CTR en hausse. C'est le moment idéal pour exploiter les opportunités de longue traîne identifiées.";

/* ── Prochaines actions (3 niveaux) ── */

export type ActionLevel = {
  id: 'critique' | 'important' | 'opportunite';
  label: string;
  count: number;
  color: string;
  bg: string;
  border: string;
  items: string[];
};

export const ACTION_LEVELS: ActionLevel[] = [
  {
    id: 'critique',
    label: 'Critique',
    count: 3,
    color: 'var(--red)',
    bg: 'var(--red-m)',
    border: 'var(--red-b)',
    items: [
      'Corriger les 23 liens brisés et rediriger les 404',
      'Améliorer la vitesse mobile — LCP 4,2 s → objectif < 2,5 s',
      'Résoudre les erreurs 404 sur 8 pages stratégiques',
    ],
  },
  {
    id: 'important',
    label: 'Important',
    count: 5,
    color: 'var(--yellow-fg)',
    bg: 'var(--yellow-m)',
    border: 'var(--yellow-b)',
    items: [
      'Optimiser les balises title sur 12 pages clés',
      'Corriger les 5 pages sans balise H1',
      'Ajouter les attributs alt sur 34 images',
      'Résoudre la duplication de contenu (4 pages)',
      'Améliorer le maillage interne (23 pages orphelines)',
    ],
  },
  {
    id: 'opportunite',
    label: 'Opportunité',
    count: 8,
    color: 'var(--green)',
    bg: 'var(--green-m)',
    border: 'var(--green-b)',
    items: [
      'Cibler 45 mots-clés de longue traîne identifiés',
      'Optimiser 12 requêtes pour les featured snippets',
      'Créer 3 pages de service manquantes',
      'Améliorer la structure FAQ sur 6 pages',
      'Lancer une campagne de link building ciblée',
      'Optimiser les images pour la recherche visuelle',
      'Créer des études de cas clients (3 prévues)',
      'Améliorer le balisage Schema.org sur le catalogue',
    ],
  },
];

/* ── Santé technique (PageSpeed Insights) ── */

export const TECH_HEALTH = [
  { label: 'Vitesse', score: 56 },
  { label: 'On-page', score: 85 },
  { label: 'Backlinks', score: 71 },
  { label: 'SEO Tech.', score: 100 },
] as const;

/* ── Priorités SEO ── */

export type Severity = 'critique' | 'important' | 'opportunite';

export type Priority = {
  /** Identifiant de la priorité — sert de segment d'URL vers son détail. */
  id: string;
  sev: Severity;
  title: string;
  source: string;
  impact: string;
  desc: string;
  status: 'Nouveau' | 'En cours';
};

export const PRIORITIES: Priority[] = [
  {
    id: 'p-0418',
    sev: 'critique',
    title: 'Vitesse mobile insuffisante (LCP 4,2 s)',
    source: 'Audit tech. · 27 mai',
    impact: 'Crawl + Expérience',
    desc: 'Score PageSpeed Mobile : 56/100 · Objectif : > 90',
    status: 'Nouveau',
  },
  {
    id: 'p-0419',
    sev: 'critique',
    title: '23 liens brisés détectés',
    source: 'Surveillance · 27 mai',
    impact: 'Budget crawl',
    desc: 'Découverts le 27 mai 2026 · Impact fort sur le budget crawl',
    status: 'Nouveau',
  },
  {
    id: 'p-0420',
    sev: 'critique',
    title: 'Erreurs 404 non redirigées (8 pages)',
    source: 'Audit tech. · 27 mai',
    impact: 'Jus de lien',
    desc: 'Pages perdant du jus de lien entrant — correctif urgent',
    status: 'En cours',
  },
  {
    id: 'p-0421',
    sev: 'important',
    title: '12 balises title non optimisées',
    source: 'Analyse · 22 mai',
    impact: 'Visibilité + CTR',
    desc: 'Manque de mots-clés cibles dans le title tag',
    status: 'Nouveau',
  },
  {
    id: 'p-0422',
    sev: 'important',
    title: '5 pages sans balise H1',
    source: 'Audit tech. · 27 mai',
    impact: 'On-page SEO',
    desc: 'Structure de titre absente — impact SEO on-page direct',
    status: 'Nouveau',
  },
  {
    id: 'p-0423',
    sev: 'important',
    title: '34 images sans attribut alt',
    source: 'Audit tech. · 27 mai',
    impact: 'Indexation image',
    desc: 'Accessibilité et indexation image Google compromises',
    status: 'En cours',
  },
  {
    id: 'p-0424',
    sev: 'important',
    title: '4 pages avec contenu dupliqué',
    source: 'Analyse · 22 mai',
    impact: 'Cannibalisation',
    desc: 'Signaux confus pour Googlebot — risque de cannibalisation',
    status: 'Nouveau',
  },
  {
    id: 'p-0425',
    sev: 'important',
    title: '23 pages orphelines (maillage faible)',
    source: 'Audit tech. · 27 mai',
    impact: 'Maillage interne',
    desc: 'Pages peu accessibles depuis la navigation interne',
    status: 'Nouveau',
  },
  {
    id: 'p-0426',
    sev: 'opportunite',
    title: '45 mots-clés longue traîne inexploités',
    source: 'Analyse IA · 25 mai',
    impact: 'Trafic +8 400/m',
    desc: 'Volume cumulé estimé : ~8 400 req/mois · Difficulté faible',
    status: 'Nouveau',
  },
  {
    id: 'p-0427',
    sev: 'opportunite',
    title: '12 opportunités de featured snippets',
    source: 'Analyse IA · 25 mai',
    impact: 'Visibilité',
    desc: 'Requêtes en position 2–5 avec format question',
    status: 'Nouveau',
  },
  {
    id: 'p-0428',
    sev: 'opportunite',
    title: '3 pages de service manquantes',
    source: 'Analyse IA · 25 mai',
    impact: 'Couverture',
    desc: 'Demande détectée sans page dédiée sur le site actuel',
    status: 'Nouveau',
  },
];

/* ── Plan d'action ── */

export type PlanTask = {
  /** Identifiant de la tâche — sert de segment d'URL vers son détail. */
  id: string;
  title: string;
  due: string;
  status: 'En cours' | 'À faire' | 'Terminé';
  prio: string;
  source: string;
};

export const TASKS: PlanTask[] = [
  {
    id: '142',
    title: 'Réviser les meta descriptions (18 pages)',
    due: '30 mai 2026',
    status: 'En cours',
    prio: 'haute',
    source: 'Priorité SEO',
  },
  {
    id: '151',
    title: 'Créer 5 articles blog longue traîne',
    due: '15 juin 2026',
    status: 'À faire',
    prio: 'normale',
    source: 'Plan éditorial',
  },
  {
    id: '160',
    title: 'Audit backlinks concurrents',
    due: '10 juin 2026',
    status: 'En cours',
    prio: 'haute',
    source: 'Priorité SEO',
  },
];

/* ── Preuves de valeur ── */

export const PROOFS: FeedItem[] = [
  { label: 'Meta descriptions optimisées (18 pages)', date: '23 mai', icon: 'check' },
  { label: '12 nouveaux backlinks acquis (DR 40+)', date: '14 mai', icon: 'link' },
  { label: 'Rapport mensuel envoyé (8 sections)', date: '2 mai', icon: 'doc' },
  { label: 'Maillage interne restructuré (32 pages)', date: '28 avr.', icon: 'check' },
];

/* ── Activité récente ── */

export const ACTIVITY: FeedItem[] = [
  { label: 'Audit complet Q2 lancé', date: '27 mai', icon: 'zap' },
  { label: '12 nouveaux backlinks détectés', date: '14 mai', icon: 'link' },
  { label: 'Rapport avril envoyé', date: '2 mai', icon: 'doc' },
  { label: 'MRR renouvelé — 1 200 $ CA', date: '1 mai', icon: 'check' },
];

/* ── Concurrence ── */

export const COMPETITORS = [
  { name: 'TechShop.ca', sessions: 52300, label: '52,3k/mois' },
  { name: 'DigiMarket.ca', sessions: 41100, label: '41,1k/mois' },
  { name: 'ShopNova.ca', sessions: 28700, label: '28,7k/mois' },
] as const;

export const CLIENT_SESSIONS = 34800;

/* ── Trafic ── */

export const TRAFFIC_SPARK = [
  28, 32, 30, 35, 38, 34, 40, 43, 41, 48, 52, 49, 55, 58, 62, 64, 68, 66, 72, 75,
];

/* ── Mots-clés ── */

export const KEYWORDS = [
  { kw: 'agence seo montréal', pos: 2, vol: '2 400', delta: 3 },
  { kw: 'audit seo complet', pos: 5, vol: '1 800', delta: 2 },
  { kw: 'référencement naturel', pos: 8, vol: '4 200', delta: 0 },
  { kw: 'stratégie contenu', pos: 11, vol: '900', delta: -1 },
  { kw: 'backlink checker', pos: 14, vol: '1 200', delta: 4 },
] as const;

/* ── Diagnostics ── */

export const AUDITS = [
  { name: 'Audit Complet Q2', date: '15 avr. 2026', score: 87, type: 'Complet' },
  { name: 'Audit Technique', date: '12 jan. 2026', score: 74, type: 'Technique' },
  { name: 'Audit Contenu', date: '3 oct. 2025', score: 81, type: 'Contenu' },
] as const;

/* ── Rapports ── */

export const REPORT_SECTIONS = [
  { name: 'Synthèse exécutive', desc: 'Résumé IA du mois', on: true },
  { name: 'Trafic organique', desc: 'Sessions & évolution', on: true },
  { name: 'Positions clés', desc: 'Top mots-clés & mouvements', on: true },
  { name: 'Santé technique', desc: 'Core Web Vitals, audits', on: true },
  { name: 'Backlinks', desc: 'Nouveaux liens & profil', on: true },
  { name: 'Prochaines actions', desc: 'Recommandations priorisées', on: false },
] as const;

export const REPORTS = [
  { period: 'Avril 2026', date: '2 mai 2026', status: 'Envoyé', score: 87, pages: 8 },
  { period: 'Mars 2026', date: '3 avr. 2026', status: 'Envoyé', score: 82, pages: 8 },
  { period: 'Février 2026', date: '2 mars 2026', status: 'Envoyé', score: 79, pages: 7 },
  { period: 'Janvier 2026', date: '4 fév. 2026', status: 'Envoyé', score: 74, pages: 7 },
] as const;

/** Historique des échanges avec le client, à côté des rapports envoyés. */
export const COMMUNICATIONS = [
  {
    kind: 'Réunion',
    label: 'Point mensuel — revue des résultats d’avril',
    date: '5 mai 2026',
    who: 'Marie Chen',
    icon: 'cal' as const,
  },
  {
    kind: 'Courriel',
    label: 'Envoi du rapport SEO d’avril (8 sections)',
    date: '2 mai 2026',
    who: 'Automatisation',
    icon: 'mail' as const,
  },
  {
    kind: 'Appel',
    label: 'Validation du plan éditorial du T2',
    date: '22 avr. 2026',
    who: 'Marie Chen',
    icon: 'phone' as const,
  },
  {
    kind: 'Courriel',
    label: 'Alerte — 23 liens brisés détectés',
    date: '14 avr. 2026',
    who: 'Automatisation',
    icon: 'mail' as const,
  },
];

/* ── Contrat & facturation ── */

export const BILLING_STATS = [
  { label: 'MRR actuel', value: '1 200 $', sub: 'CA / mois', tone: 'green' as const },
  { label: 'Facturé en 2026', value: '6 950 $', sub: '6 factures', tone: 'neutral' as const },
  { label: 'Prochain paiement', value: '1 juil.', sub: '1 200 $ · dans 27 j', tone: 'blue' as const },
  { label: 'Statut du compte', value: 'À jour', sub: 'Aucun retard', tone: 'green' as const },
];

export type InvoiceStatus = 'Payée' | 'En attente' | 'En retard';

export const INVOICES: {
  num: string;
  date: string;
  period: string;
  amount: string;
  status: InvoiceStatus;
}[] = [
  {
    num: 'INV-2026-006',
    date: '1 juin 2026',
    period: 'Juin 2026',
    amount: '1 200 $',
    status: 'En attente',
  },
  { num: 'INV-2026-005', date: '1 mai 2026', period: 'Mai 2026', amount: '1 200 $', status: 'Payée' },
  {
    num: 'INV-2026-004',
    date: '1 avr. 2026',
    period: 'Avril 2026',
    amount: '1 200 $',
    status: 'Payée',
  },
  {
    num: 'INV-2026-003',
    date: '1 mars 2026',
    period: 'Mars 2026',
    amount: '1 200 $',
    status: 'Payée',
  },
  {
    num: 'INV-2026-002',
    date: '1 fév. 2026',
    period: 'Février 2026',
    amount: '1 200 $',
    status: 'Payée',
  },
  {
    num: 'INV-2026-001',
    date: '1 jan. 2026',
    period: 'Janvier 2026',
    amount: '950 $',
    status: 'Payée',
  },
];

export const CONTRACT_FIELDS = [
  ['Montant mensuel', '1 200 $ CA'],
  ['Engagement', '12 mois'],
  ['Début du contrat', '1 jan. 2024'],
  ['Renouvellement', '1 jan. 2027'],
] as const;
