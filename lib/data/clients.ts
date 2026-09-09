/**
 * Répertoire clients & prospects — données de démonstration reprises des maquettes.
 * Montants en dollars canadiens (convention québécoise de l'agence).
 */

export type BadgeType = 'accent' | 'warm' | 'info';

type Base = {
  id: string;
  name: string;
  initials: string;
  sector: string;
  badge: string;
  badgeType: BadgeType;
  servicesCount: number;
  /** Domaine analysé par les outils SEO — préremplit le sélecteur de compte. */
  domain: string;
};

export type ClientRecord = Base & {
  type: 'client';
  services: string[];
  score: number;
  scoreDelta: number;
  mrr: string;
  progress: number;
  sparkData: number[];
  /** KPIs SEO affichés dans la grille « Performance du site ». */
  kw: string;
  sessions: string;
  ctr: string;
  visibility: string;
  pages: string;
  bounce: string;
};

export type ProspectRecord = Base & {
  type: 'prospect';
  devis: string;
  resume: string;
  budget: string;
  /** Probabilité de conversion en %. */
  convProb: number;
  nextAction: string;
  trafficPotential: string;
};

export type Entry = ClientRecord | ProspectRecord;

export const CLIENTS: Entry[] = [
  {
    id: 'acme-corp',
    domain: 'acmecorp.ca',
    type: 'client',
    name: 'Acme Corp.',
    initials: 'AC',
    sector: 'E-commerce',
    badge: 'Croissance',
    badgeType: 'accent',
    services: ['SEO Tech.', 'Contenu', 'Audit'],
    score: 92,
    scoreDelta: 5,
    mrr: '1 200 $ CA',
    servicesCount: 3,
    progress: 87,
    sparkData: [40, 44, 42, 49, 53, 51, 58, 62],
    kw: '142',
    sessions: '34,8k',
    ctr: '3,4 %',
    visibility: '67 %',
    pages: '1 240',
    bounce: '42 %',
  },
  {
    id: 'novatech',
    domain: 'novatech.io',
    type: 'prospect',
    name: 'Novatech',
    initials: 'NT',
    sector: 'SaaS B2B',
    badge: 'En cours',
    badgeType: 'warm',
    devis: 'Devis envoyé · 8 mai',
    resume:
      'Refonte SEO complète + stratégie contenu éditoriale pour lancement produit Q3.',
    budget: '4 500 $ CA',
    servicesCount: 3,
    convProb: 72,
    nextAction: 'Appel de suivi · 28 mai',
    trafficPotential: '~18k sessions',
  },
  {
    id: 'dupont-sas',
    domain: 'dupont-sas.fr',
    type: 'client',
    name: 'Dupont SAS',
    initials: 'DS',
    sector: 'Services B2B',
    badge: 'Stable',
    badgeType: 'info',
    services: ['SEO Local', 'Backlinks'],
    score: 78,
    scoreDelta: -2,
    mrr: '750 $ CA',
    servicesCount: 2,
    progress: 61,
    sparkData: [55, 52, 54, 51, 53, 50, 49, 51],
    kw: '89',
    sessions: '8,2k',
    ctr: '2,1 %',
    visibility: '41 %',
    pages: '380',
    bounce: '58 %',
  },
  {
    id: 'paris-medias',
    domain: 'parismedias.fr',
    type: 'prospect',
    name: 'Paris Médias',
    initials: 'PM',
    sector: 'Média',
    badge: 'Nouveau',
    badgeType: 'info',
    devis: 'Devis en préparation',
    resume: 'Audit SEO + optimisation on-page pour 3 sites médias régionaux.',
    budget: '2 800 $ CA',
    servicesCount: 2,
    convProb: 45,
    nextAction: 'Envoi devis · 30 mai',
    trafficPotential: '~9k sessions',
  },
  {
    id: 'le-marche-bio',
    domain: 'lemarchebio.ca',
    type: 'client',
    name: 'Le Marché Bio',
    initials: 'MB',
    sector: 'Retail',
    badge: 'Croissance',
    badgeType: 'accent',
    services: ['SEO Tech.', 'Contenu'],
    score: 85,
    scoreDelta: 8,
    mrr: '950 $ CA',
    servicesCount: 2,
    progress: 73,
    sparkData: [30, 35, 33, 40, 44, 48, 52, 57],
    kw: '97',
    sessions: '12,1k',
    ctr: '4,2 %',
    visibility: '54 %',
    pages: '620',
    bounce: '37 %',
  },
  {
    id: 'velo-urbain',
    domain: 'velourbain.ca',
    type: 'prospect',
    name: 'Vélo Urbain',
    initials: 'VU',
    sector: 'Mobilité',
    badge: 'En cours',
    badgeType: 'warm',
    devis: 'Devis envoyé · 15 mai',
    resume: 'Stratégie SEO locale + création de contenu pour réseau de boutiques.',
    budget: '1 900 $ CA',
    servicesCount: 2,
    convProb: 58,
    nextAction: 'Présentation audit · 2 juin',
    trafficPotential: '~6k sessions',
  },
  {
    id: 'boreal-immobilier',
    domain: 'borealimmo.ca',
    type: 'client',
    name: 'Boréal Immobilier',
    initials: 'BI',
    sector: 'Immobilier',
    badge: 'Stable',
    badgeType: 'info',
    services: ['SEO Local', 'Contenu'],
    score: 74,
    scoreDelta: 1,
    mrr: '180 $ CA',
    servicesCount: 2,
    progress: 58,
    sparkData: [48, 46, 50, 47, 49, 51, 48, 50],
    kw: '61',
    sessions: '5,4k',
    ctr: '2,8 %',
    visibility: '38 %',
    pages: '210',
    bounce: '49 %',
  },
  {
    id: 'clinique-lavoie',
    domain: 'cliniquelavoie.com',
    type: 'client',
    name: 'Clinique Lavoie',
    initials: 'CL',
    sector: 'Santé',
    badge: 'Croissance',
    badgeType: 'accent',
    services: ['SEO Local', 'SEO Tech.', 'Contenu'],
    score: 88,
    scoreDelta: 4,
    mrr: '900 $ CA',
    servicesCount: 3,
    progress: 81,
    sparkData: [60, 63, 61, 66, 70, 68, 72, 75],
    kw: '118',
    sessions: '19,3k',
    ctr: '3,9 %',
    visibility: '59 %',
    pages: '340',
    bounce: '33 %',
  },
  {
    id: 'spa-nordik-estrie',
    domain: 'spanordik-estrie.ca',
    type: 'prospect',
    name: 'Spa Nordik Estrie',
    initials: 'SN',
    sector: 'Bien-être',
    badge: 'En cours',
    badgeType: 'warm',
    devis: 'Devis envoyé · 20 août',
    resume: 'SEO local + contenu pour un établissement thermal en Estrie.',
    budget: '1 400 $ CA',
    servicesCount: 2,
    convProb: 52,
    nextAction: 'Audit de prospect envoyé · 8 sept.',
    trafficPotential: '~4k sessions',
  },
  {
    id: 'quincaillerie-fortin',
    domain: 'fortin-quincaillerie.ca',
    type: 'prospect',
    name: 'Quincaillerie Fortin',
    initials: 'QF',
    sector: 'Retail',
    badge: 'Nouveau',
    badgeType: 'info',
    devis: 'Premier contact',
    resume: 'Visibilité locale pour un réseau de quincailleries régionales.',
    budget: '1 100 $ CA',
    servicesCount: 1,
    convProb: 30,
    nextAction: 'Appel de qualification · à planifier',
    trafficPotential: '~3k sessions',
  },
];

export const HUB_KPIS = [
  { label: 'Clients actifs', value: '12', sub: '+2 ce mois', up: true },
  { label: 'Prospects en cours', value: '8', sub: '3 devis envoyés', up: null },
  { label: 'MRR total', value: '18 400 $ CA', sub: '+12 % vs avril', up: true },
] as const;
