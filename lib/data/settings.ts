/** Paramètres de l'agence — équipe, intégrations, notifications, abonnement, consommation. */

import type { Tone } from '@/components/ui/Atoms';
import { CLIENTS } from '@/lib/data/clients';

export type SectionId =
  | 'agence'
  | 'equipe'
  | 'integrations'
  | 'notifications'
  | 'facturation'
  | 'consommation';

export const TEAM = [
  {
    name: 'Marie Chen',
    email: 'marie@huntpilote.ca',
    role: 'Administratrice',
    clients: 8,
    initials: 'MC',
    color: 'var(--green)',
    you: true,
  },
  {
    name: 'Julien Dubois',
    email: 'julien@huntpilote.ca',
    role: 'Chef de projet',
    clients: 6,
    initials: 'JD',
    color: 'var(--blue)',
  },
  {
    name: 'Aïcha Lemaire',
    email: 'aicha@huntpilote.ca',
    role: 'Spécialiste SEO',
    clients: 5,
    initials: 'AL',
    color: 'var(--violet)',
  },
  {
    name: 'Tom Bélanger',
    email: 'tom@huntpilote.ca',
    role: 'Rédacteur',
    clients: 3,
    initials: 'TB',
    color: 'var(--yellow-fg)',
  },
] as const;

export const ROLE_TONES: Record<string, Tone> = {
  Administratrice: 'green',
  'Chef de projet': 'blue',
  'Spécialiste SEO': 'violet',
  Rédacteur: 'yellow',
};

export type Integration = {
  id: string;
  name: string;
  desc: string;
  color: string;
  letter: string;
  connected: boolean;
  /** Nombre de comptes clients rattachés, quand l'intégration est connectée. */
  accounts?: number;
};

export const AGENCY_INTEGRATIONS: Integration[] = [
  { id: 'ga4', name: 'Google Analytics 4', desc: 'Trafic, sessions & conversions', color: '#E8710A', letter: 'GA', connected: true, accounts: 8 },
  { id: 'gsc', name: 'Google Search Console', desc: 'Positions, impressions, CTR', color: '#4285F4', letter: 'SC', connected: true, accounts: 8 },
  { id: 'semrush', name: 'Semrush', desc: 'Suivi de positions & concurrence', color: '#FF642D', letter: 'SR', connected: true, accounts: 8 },
  { id: 'gbp', name: 'Google Business Profile', desc: 'Fiches locales & avis', color: '#34A853', letter: 'GB', connected: false },
  { id: 'pagespeed', name: 'PageSpeed Insights', desc: 'Core Web Vitals & performance', color: '#0F9D58', letter: 'PS', connected: true, accounts: 8 },
  { id: 'stripe', name: 'Stripe', desc: 'Facturation & paiements récurrents', color: '#635BFF', letter: 'St', connected: false },
  { id: 'slack', name: 'Slack', desc: 'Canal interne pour les échanges d’équipe', color: '#4A154B', letter: 'Sl', connected: false },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Messages visibles du client', color: '#25D366', letter: 'Wa', connected: false },
  { id: 'messenger', name: 'Messenger', desc: 'Messages visibles du client', color: '#0084FF', letter: 'Ms', connected: false },
];

export type Notification = { id: string; label: string; desc: string; on: boolean };

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', label: 'Chute de position détectée', desc: 'Quand un mot-clé stratégique recule', on: true },
  { id: 'n2', label: 'Rapport mensuel généré', desc: 'À chaque envoi automatique de rapport', on: true },
  { id: 'n3', label: 'Score santé sous le seuil', desc: 'Quand un compte passe sous 70', on: true },
  { id: 'n4', label: 'Nouveau deal gagné', desc: 'À chaque signature dans le pipeline', on: true },
  { id: 'n5', label: 'Facture en retard', desc: "Quand un paiement dépasse l'échéance", on: false },
  { id: 'n6', label: 'Synthèse IA hebdomadaire', desc: 'Résumé de tous les comptes chaque lundi', on: true },
];

/** Consommation du forfait : [libellé, valeur, plafond, unité]. */
export const PLAN_USAGE: [string, number, number, string][] = [
  ['Clients actifs', 12, 15, ''],
  ["Sièges d'équipe", 4, 5, ''],
  ['Stockage rapports', 2.4, 10, ' Go'],
];

/* ── Suivi de consommation — appels facturés aux outils SEO ── */

export const fmt$ = (n: number) => `${n.toLocaleString('fr-CA')} $`;

/** Budget mensuel de l'agence pour les appels aux outils SEO. */
export const CONSO_BUDGET = 380;
/** Consommation d'un mois « normal », référence pour la mise à l'échelle des états de démo. */
export const CONSO_BASE_USED = 296;

/** Coût de base (mois « normal ») par compte suivi — rattaché à un vrai compte de `CLIENTS`. */
export const CONSO_CLIENT_COSTS: { clientId: string; base: number }[] = [
  { clientId: 'acme-corp', base: 74 },
  { clientId: 'boreal-immobilier', base: 96 },
  { clientId: 'clinique-lavoie', base: 88 },
  { clientId: 'spa-nordik-estrie', base: 22 },
  { clientId: 'quincaillerie-fortin', base: 16 },
];

/** Résout un coût de compte vers le vrai enregistrement client, avec son MRR numérique. */
export function resolveConsoClient(clientId: string) {
  const entry = CLIENTS.find((c) => c.id === clientId);
  if (!entry) throw new Error(`Compte inconnu pour la consommation : ${clientId}`);
  const mrr = entry.type === 'client' ? Number(entry.mrr.replace(/[^\d]/g, '')) : 0;
  return { name: entry.name, type: entry.type, mrr };
}

export type ConsoCallType = { id: string; label: string; base: number };

export const CONSO_TYPES: ConsoCallType[] = [
  { id: 'crawl', label: 'Crawl de sites', base: 118 },
  { id: 'positions', label: 'Suivi de positions', base: 92 },
  { id: 'backlinks', label: 'Backlink Analyse', base: 52 },
  { id: 'serp', label: 'SERP locales', base: 34 },
];

export type ConsoMonth = { m: string; used: number };

export const CONSO_HISTORY: ConsoMonth[] = [
  { m: 'oct. 25', used: 268 },
  { m: 'nov. 25', used: 302 },
  { m: 'déc. 25', used: 341 },
  { m: 'janv. 26', used: 289 },
  { m: 'févr. 26', used: 274 },
  { m: 'mars 26', used: 296 },
  { m: 'avr. 26', used: 310 },
  { m: 'mai 26', used: 288 },
  { m: 'juin 26', used: 322 },
  { m: 'juil. 26', used: 265 },
  { m: 'août 26', used: 301 },
  { m: 'sept. 26', used: CONSO_BASE_USED },
];

/** Réglages qui pilotent le coût — modifiables dans l'écran, effet visible en direct. */
export const CONSO_SETTINGS = {
  freq: { options: ['Mensuel', 'Bihebdomadaire', 'Hebdomadaire'] as const, mult: [0.6, 1, 1.6] },
  kw: { min: 10, max: 100, step: 5 },
  zones: { options: ['1 zone', '3 zones', '5 zones'] as const, mult: [0.5, 1, 1.8] },
};

export type ConsoStateId = 'ok' | 'approche' | 'depasse' | 'premier' | 'clientover';

/** États de démonstration, dans l'ordre du sélecteur. */
export const CONSO_STATES: [ConsoStateId, string][] = [
  ['ok', 'Consommation normale'],
  ['approche', 'Approche du budget'],
  ['depasse', 'Budget dépassé'],
  ['premier', 'Premier mois'],
  ['clientover', 'Client au-dessus du MRR'],
];

export type ConsoScenario = { used: number; day: number; history: ConsoMonth[] };

export const CONSO_SCENARIOS: Record<ConsoStateId, ConsoScenario> = {
  ok: { used: 210, day: 20, history: CONSO_HISTORY },
  approche: { used: 350, day: 28, history: CONSO_HISTORY },
  depasse: { used: 395, day: 26, history: CONSO_HISTORY },
  premier: { used: 42, day: 6, history: [] },
  clientover: { used: 210, day: 20, history: CONSO_HISTORY },
};
