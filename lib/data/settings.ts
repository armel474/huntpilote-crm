/** Paramètres de l'agence — équipe, intégrations, notifications, abonnement. */

import type { Tone } from '@/components/ui/Atoms';

export type SectionId = 'agence' | 'equipe' | 'integrations' | 'notifications' | 'facturation';

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
