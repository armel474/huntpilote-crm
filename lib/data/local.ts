/**
 * SEO local — socle partagé des cinq écrans établissement (session 3.1).
 *
 * Le SEO local est une section complète, au même niveau que les outils SEO —
 * pas un outil de plus. Les critères de présence en ligne repris ici
 * (complétude Google Business, cohérence nom·adresse·téléphone, citations,
 * avis sans réponse) reprennent mot pour mot les libellés et les seuils de la
 * dimension `presence` de `lib/data/audit.ts` — l'établissement `acme-siege`
 * sert de fil conducteur pour le vérifier d'un écran à l'autre.
 *
 * Les identifiants de client sont ceux de `lib/data/clients.ts` — jamais une
 * liste de noms inventée pour la démo.
 */

import type { Tone } from '@/components/ui/Atoms';
import type { CritStatus } from '@/lib/data/audit';

/* ── États et alertes ── */

export type GbpStateId = 'revendiquee' | 'non_revendiquee' | 'suspendue' | 'tiers';

export const GBP_STATE: Record<GbpStateId, { label: string; tone: Tone }> = {
  revendiquee: { label: 'Revendiquée et vérifiée', tone: 'green' },
  non_revendiquee: { label: 'Non revendiquée', tone: 'yellow' },
  suspendue: { label: 'Suspendue · en attente de validation', tone: 'red' },
  tiers: { label: 'Revendiquée par un tiers', tone: 'red' },
};

export type AlertId =
  | 'avis_negatif'
  | 'fiche_suspendue'
  | 'chute_position'
  | 'incoherence'
  | 'fiche_tiers'
  | 'fiche_non_revendiquee'
  | 'zone_non_configuree';

export const ALERT_DEFS: Record<AlertId, { label: string; tone: Tone }> = {
  avis_negatif: { label: 'Avis négatif sans réponse', tone: 'red' },
  fiche_suspendue: { label: 'Fiche suspendue', tone: 'red' },
  chute_position: { label: 'Chute de position · pack local', tone: 'yellow' },
  incoherence: { label: 'Incohérence de citation détectée', tone: 'yellow' },
  fiche_tiers: { label: 'Fiche revendiquée par un tiers', tone: 'red' },
  fiche_non_revendiquee: { label: 'Fiche Google Business non revendiquée', tone: 'yellow' },
  zone_non_configuree: { label: 'Zone desservie jamais configurée', tone: 'yellow' },
};

/** Neuf champs de la fiche Google Business — seuil : les neuf remplis. */
export const ALL_GBP_FIELDS = [
  'Nom et coordonnées',
  'Catégories',
  'Horaires (dont horaires spéciaux)',
  'Photos',
  'Description',
  'Services',
  'Zone desservie',
  'Attributs',
  'Site web',
] as const;

/* ── Zone desservie ── */

export type Zone =
  | { mode: 'rayon'; km: number }
  | { mode: 'secteurs'; secteurs: string[] }
  | { mode: 'grille'; rows: number; cols: number; spacingKm: number };

/* ── Critère de présence en ligne — même forme que l'audit ── */

export type LocalCriterion = {
  c: string;
  measure: string;
  threshold: string;
  st: CritStatus;
  note?: string;
};

export type EstabStats = {
  appels: number;
  appelsD: number;
  itin: number;
  itinD: number;
  visites: number;
  visitesD: number;
};

export type Publication = {
  date: string;
  text: string;
  type: string;
  vues: number;
  expiree?: boolean;
};

export type QaItem = { q: string; date: string };

export type Establishment = {
  id: string;
  name: string;
  client: string;
  clientId: string;
  ville: string;
  gbp: GbpStateId;
  scoreLocal: number | null;
  scorePrev?: number;
  note?: number;
  nbAvis?: number;
  avisSansReponse: number;
  citTotal?: number;
  citRef?: number;
  incoh?: number;
  incohSources?: number;
  packPos: number | null;
  packPosPrev?: number;
  alerts: AlertId[];
  auditRef: { id: string; date: string } | null;
  gbpFilled: number | null;
  gbpMissing: string[];
  criteres: LocalCriterion[];
  zone: Zone | null;
  stats: EstabStats | null;
  publications: Publication[];
  qa: QaItem[];
};

/**
 * Portefeuille d'établissements. `clientId` pointe vers un identifiant réel
 * de `CLIENTS` (lib/data/clients.ts) — jamais un identifiant de démo isolé.
 */
export const ESTABS: Establishment[] = [
  {
    id: 'acme-siege',
    name: 'Acme Corp. — siège',
    client: 'Acme Corp.',
    clientId: 'acme-corp',
    ville: 'Montréal (Ville-Marie)',
    gbp: 'revendiquee',
    scoreLocal: 64,
    scorePrev: 58,
    note: 4.6,
    nbAvis: 87,
    avisSansReponse: 1,
    citTotal: 12,
    citRef: 20,
    incoh: 3,
    incohSources: 14,
    packPos: 3.2,
    packPosPrev: 3.0,
    alerts: ['avis_negatif'],
    auditRef: { id: 'A-0142', date: '1 octobre 2026' },
    gbpFilled: 6,
    gbpMissing: ['Horaires (dont horaires spéciaux)', 'Services', 'Zone desservie'],
    criteres: [
      {
        c: 'Cohérence nom · adresse · téléphone',
        measure: '3 incohérences sur 14 sources',
        threshold: 'Seuil : 0 incohérence',
        st: 'fail',
      },
      {
        c: 'Citations en annuaires',
        measure: '12 annuaires sur 20 de référence',
        threshold: 'Seuil : 16 sur 20',
        st: 'warn',
      },
      {
        c: 'Avis clients',
        measure: '4,6 / 5 · 87 avis · 1 sans réponse',
        threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse',
        st: 'warn',
        note: 'Un avis négatif de juillet reste sans réponse publique.',
      },
    ],
    zone: null,
    stats: { appels: 34, appelsD: 6, itin: 58, itinD: 3, visites: 212, visitesD: -4 },
    publications: [
      { date: '2 sept. 2026', text: 'Offre : inspection de toiture gratuite en septembre', type: 'Offre', vues: 412 },
      { date: '18 août 2026', text: 'Nouvel horaire pour la période des fêtes', type: 'Mise à jour', vues: 156, expiree: true },
    ],
    qa: [
      { q: 'Faites-vous les soumissions le week-end ?', date: '29 août 2026' },
      { q: 'Acceptez-vous les paiements par Interac ?', date: '14 août 2026' },
    ],
  },
  {
    id: 'boreal-qc',
    name: 'Boréal Immobilier — Québec',
    client: 'Boréal Immobilier',
    clientId: 'boreal-immobilier',
    ville: 'Québec (Sainte-Foy)',
    gbp: 'revendiquee',
    scoreLocal: 88,
    scorePrev: 85,
    note: 4.8,
    nbAvis: 142,
    avisSansReponse: 0,
    citTotal: 19,
    citRef: 20,
    incoh: 0,
    incohSources: 16,
    packPos: 1.8,
    packPosPrev: 2.0,
    alerts: [],
    auditRef: { id: 'A-0138', date: '1 septembre 2026' },
    gbpFilled: 9,
    gbpMissing: [],
    criteres: [
      {
        c: 'Cohérence nom · adresse · téléphone',
        measure: '0 incohérence sur 16 sources',
        threshold: 'Seuil : 0 incohérence',
        st: 'ok',
      },
      {
        c: 'Citations en annuaires',
        measure: '19 annuaires sur 20 de référence',
        threshold: 'Seuil : 16 sur 20',
        st: 'ok',
      },
      {
        c: 'Avis clients',
        measure: '4,8 / 5 · 142 avis · 0 sans réponse',
        threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse',
        st: 'ok',
      },
    ],
    zone: { mode: 'secteurs', secteurs: ['Québec', 'Lévis', 'Beauport', 'Charlesbourg', 'Sainte-Foy'] },
    stats: { appels: 61, appelsD: 4, itin: 88, itinD: 5, visites: 340, visitesD: 12 },
    publications: [],
    qa: [],
  },
  {
    id: 'lavoie-rs',
    name: 'Clinique Lavoie — Rive-Sud',
    client: 'Clinique Lavoie',
    clientId: 'clinique-lavoie',
    ville: 'Brossard',
    gbp: 'suspendue',
    scoreLocal: null,
    avisSansReponse: 0,
    packPos: null,
    alerts: ['fiche_suspendue'],
    auditRef: { id: 'A-0140', date: '1 septembre 2026' },
    gbpFilled: null,
    gbpMissing: [],
    criteres: [],
    zone: null,
    stats: null,
    publications: [],
    qa: [],
  },
  {
    id: 'lavoie-laval',
    name: 'Clinique Lavoie — Laval',
    client: 'Clinique Lavoie',
    clientId: 'clinique-lavoie',
    ville: 'Laval',
    gbp: 'revendiquee',
    scoreLocal: 52,
    scorePrev: 55,
    note: 4.3,
    nbAvis: 29,
    avisSansReponse: 0,
    citTotal: 14,
    citRef: 20,
    incoh: 1,
    incohSources: 12,
    packPos: 4.6,
    packPosPrev: 4.2,
    alerts: ['zone_non_configuree'],
    auditRef: { id: 'A-0140', date: '1 septembre 2026' },
    gbpFilled: 7,
    gbpMissing: ['Zone desservie', 'Attributs'],
    criteres: [
      {
        c: 'Cohérence nom · adresse · téléphone',
        measure: '1 incohérence sur 12 sources',
        threshold: 'Seuil : 0 incohérence',
        st: 'warn',
      },
      {
        c: 'Citations en annuaires',
        measure: '14 annuaires sur 20 de référence',
        threshold: 'Seuil : 16 sur 20',
        st: 'warn',
      },
      {
        c: 'Avis clients',
        measure: '4,3 / 5 · 29 avis · 0 sans réponse',
        threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse',
        st: 'ok',
      },
    ],
    zone: null,
    stats: { appels: 12, appelsD: 1, itin: 19, itinD: 0, visites: 55, visitesD: 3 },
    publications: [{ date: '10 août 2026', text: 'Bienvenue à notre nouvelle physiothérapeute', type: 'Événement', vues: 74 }],
    qa: [{ q: 'Avez-vous une entrée accessible en fauteuil roulant ?', date: '2 sept. 2026' }],
  },
  {
    id: 'nordik',
    name: 'Spa Nordik Estrie',
    client: 'Spa Nordik Estrie',
    clientId: 'spa-nordik-estrie',
    ville: 'Sherbrooke',
    gbp: 'non_revendiquee',
    scoreLocal: null,
    avisSansReponse: 0,
    packPos: null,
    alerts: ['fiche_non_revendiquee'],
    auditRef: null,
    gbpFilled: null,
    gbpMissing: [],
    criteres: [],
    zone: null,
    stats: null,
    publications: [],
    qa: [],
  },
  {
    id: 'fortin',
    name: 'Quincaillerie Fortin',
    client: 'Quincaillerie Fortin',
    clientId: 'quincaillerie-fortin',
    ville: 'Trois-Rivières',
    gbp: 'tiers',
    scoreLocal: null,
    avisSansReponse: 0,
    packPos: null,
    alerts: ['fiche_tiers'],
    auditRef: null,
    gbpFilled: null,
    gbpMissing: [],
    criteres: [],
    zone: null,
    stats: null,
    publications: [],
    qa: [],
  },
  {
    id: 'marchebio',
    name: 'Le Marché Bio',
    client: 'Le Marché Bio',
    clientId: 'le-marche-bio',
    ville: 'Repentigny',
    gbp: 'revendiquee',
    scoreLocal: 74,
    scorePrev: 79,
    note: 4.5,
    nbAvis: 63,
    avisSansReponse: 0,
    citTotal: 17,
    citRef: 20,
    incoh: 1,
    incohSources: 11,
    packPos: 5.4,
    packPosPrev: 2.1,
    alerts: ['chute_position'],
    auditRef: { id: 'A-0141', date: '1 septembre 2026' },
    gbpFilled: 9,
    gbpMissing: [],
    criteres: [
      {
        c: 'Cohérence nom · adresse · téléphone',
        measure: '1 incohérence sur 11 sources',
        threshold: 'Seuil : 0 incohérence',
        st: 'warn',
      },
      {
        c: 'Citations en annuaires',
        measure: '17 annuaires sur 20 de référence',
        threshold: 'Seuil : 16 sur 20',
        st: 'ok',
      },
      {
        c: 'Avis clients',
        measure: '4,5 / 5 · 63 avis · 0 sans réponse',
        threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse',
        st: 'ok',
      },
    ],
    zone: { mode: 'grille', rows: 5, cols: 5, spacingKm: 1.2 },
    stats: { appels: 21, appelsD: 2, itin: 40, itinD: -9, visites: 98, visitesD: -11 },
    publications: [{ date: '30 août 2026', text: 'Nouveaux produits en épicerie fine locale', type: 'Offre', vues: 289 }],
    qa: [],
  },
];

/** Prix indicatif d'un point de mesure sur la grille — affiché avec le réglage, jamais après coup. */
export const GRID_POINT_PRICE = 0.35;

/**
 * Clients suivis sans établissement local rattaché — les mêmes identifiants
 * que `CLIENTS` (lib/data/clients.ts), jamais des noms inventés.
 */
export const CLIENTS_SANS_ETAB = [
  { id: 'novatech', name: 'Novatech' },
  { id: 'dupont-sas', name: 'Dupont SAS' },
  { id: 'paris-medias', name: 'Paris Médias' },
  { id: 'velo-urbain', name: 'Vélo Urbain' },
] as const;

/** Une fiche non revendiquée, suspendue ou tenue par un tiers bloque le reste de l'écran. */
export const isBlocked = (est: Establishment) => est.gbp !== 'revendiquee';

export function findEstab(id: string): Establishment {
  return ESTABS.find((e) => e.id === id) ?? ESTABS[0];
}
