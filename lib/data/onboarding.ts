/** Assistant de création d'un client — étapes, services, objectifs, intégrations. */

export const SECTORS = [
  'E-commerce',
  'SaaS B2B',
  'Santé',
  'Restauration',
  'Immobilier',
  'Juridique',
  'Tourisme',
  'Construction',
  'Automobile',
  'Éducation',
  'Autre',
] as const;

export const SERVICES = [
  { id: 'seotech', name: 'SEO Technique', desc: 'Performance, crawl, indexation', price: 400 },
  { id: 'contenu', name: 'Contenu', desc: 'Rédaction & optimisation on-page', price: 350 },
  { id: 'seolocal', name: 'SEO Local', desc: 'Google Business, citations locales', price: 250 },
  { id: 'audit', name: 'Audits', desc: 'Audits techniques trimestriels', price: 200 },
  { id: 'backlinks', name: 'Backlinks', desc: 'Netlinking & autorité de domaine', price: 450 },
] as const;

export const GOALS = [
  'Doubler le trafic organique',
  'Top 3 sur requêtes transactionnelles',
  'Augmenter le CTR',
  'Améliorer la vitesse mobile',
  'Développer la notoriété de marque',
  'Générer plus de leads',
] as const;

export const INTEGRATIONS = [
  { id: 'ga4', name: 'Google Analytics 4', desc: 'Trafic, sessions, conversions', color: '#E8710A', letter: 'GA' },
  { id: 'gsc', name: 'Google Search Console', desc: 'Positions, impressions, CTR', color: '#4285F4', letter: 'SC' },
  { id: 'gbp', name: 'Google Business Profile', desc: 'Fiche locale & avis', color: '#34A853', letter: 'GB' },
  { id: 'semrush', name: 'Semrush', desc: 'Suivi de positions & concurrence', color: '#FF642D', letter: 'SR' },
] as const;

export const DEADLINES = ['T3 2026', 'T4 2026', 'T1 2027', 'T2 2027'] as const;

export const STEP_TITLES = [
  'Informations de l’entreprise',
  'Services & forfait',
  'Objectifs & contexte',
  'Accès & intégrations',
  'Récapitulatif',
] as const;

export const STEP_SUBS = [
  'Les coordonnées de base du nouveau client.',
  'Ce que votre agence prendra en charge.',
  'Ce que le client veut atteindre.',
  'Connectez les sources de données.',
  'Vérifiez avant de créer le compte.',
] as const;

export type OnboardingData = {
  company: string;
  sector: string;
  website: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  services: string[];
  goals: string[];
  kpiTraffic: string;
  kpiKeywords: string;
  deadline: string;
  context: string;
  integrations: string[];
};

export const INITIAL_DATA: OnboardingData = {
  company: '',
  sector: '',
  website: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  services: ['seotech', 'contenu'],
  goals: [],
  kpiTraffic: '',
  kpiKeywords: '',
  deadline: '',
  context: '',
  integrations: [],
};
