/** Workflow & automatisations — règles « Quand → Alors » de démonstration. */

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

export type GlyphName = 'warn' | 'cal' | 'clock' | 'trophy' | 'link' | 'bolt' | 'task' | 'doc' | 'mail';

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
