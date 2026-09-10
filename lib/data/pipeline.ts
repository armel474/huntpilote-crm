/** Pipeline commercial — étapes, responsables et opportunités de démonstration. */

import type { Tone } from '@/components/ui/Atoms';

export type StageId = 'prospect' | 'qualifie' | 'proposition' | 'negociation' | 'gagne';

export const STAGES: { id: StageId; label: string; accent: string }[] = [
  { id: 'prospect', label: 'Prospect', accent: '#A1A1AA' },
  { id: 'qualifie', label: 'Qualifié', accent: '#3B82F6' },
  { id: 'proposition', label: 'Proposition', accent: '#7C3AED' },
  { id: 'negociation', label: 'Négociation', accent: '#D4B24A' },
  { id: 'gagne', label: 'Gagné', accent: '#16A34A' },
];

/** Probabilité par défaut appliquée quand une carte change d'étape. */
export const STAGE_PROBABILITY: Record<StageId, number> = {
  prospect: 15,
  qualifie: 38,
  proposition: 55,
  negociation: 78,
  gagne: 100,
};

export type OwnerId = 'MC' | 'JD' | 'AL';

export const OWNERS: Record<OwnerId, { name: string; color: string }> = {
  MC: { name: 'Marie Chen', color: 'var(--green)' },
  JD: { name: 'Julien Dubois', color: 'var(--blue)' },
  AL: { name: 'Aïcha Lemaire', color: 'var(--violet)' },
};

export type Deal = {
  id: number;
  company: string;
  sector: string;
  /** MRR mensuel en dollars canadiens. */
  mrr: number;
  services: string[];
  owner: OwnerId;
  /** Jours passés dans l'étape courante. */
  days: number;
  prob: number;
  stage: StageId;
  next: string;
  /** Motif renseigné par « Marquer perdu » — purge l'instantané SEO du prospect. */
  lost?: { reason: string; note?: string };
  /** Échanges consignés depuis le panneau de détail, les plus récents en tête. */
  extraHistory?: Exchange[];
};

export const DEALS: Deal[] = [
  { id: 1, company: 'Boutique Lumière', sector: 'E-commerce', mrr: 900, services: ['SEO Tech.', 'Contenu'], owner: 'MC', days: 4, prob: 15, stage: 'prospect', next: 'Appel de découverte' },
  { id: 2, company: 'Garage Méca-Pro', sector: 'Automobile', mrr: 700, services: ['SEO Local'], owner: 'JD', days: 9, prob: 10, stage: 'prospect', next: 'Envoyer présentation' },
  { id: 3, company: 'Pharmacie Centrale', sector: 'Santé', mrr: 1100, services: ['SEO Local', 'Contenu'], owner: 'AL', days: 2, prob: 20, stage: 'prospect', next: 'Qualifier le besoin' },
  { id: 4, company: 'Resto Le Margaux', sector: 'Restauration', mrr: 850, services: ['SEO Local'], owner: 'MC', days: 6, prob: 35, stage: 'qualifie', next: 'Audit gratuit planifié' },
  { id: 5, company: 'Académie Vélo', sector: 'Éducation', mrr: 1200, services: ['SEO Tech.', 'Backlinks'], owner: 'JD', days: 12, prob: 40, stage: 'qualifie', next: "Présenter l'audit" },
  { id: 6, company: 'Maison Bois Franc', sector: 'Construction', mrr: 1500, services: ['SEO Tech.', 'Contenu'], owner: 'AL', days: 8, prob: 35, stage: 'qualifie', next: 'Relance audit' },
  { id: 7, company: 'TechNord Solutions', sector: 'SaaS B2B', mrr: 2200, services: ['SEO Tech.', 'Contenu', 'Backlinks'], owner: 'MC', days: 5, prob: 60, stage: 'proposition', next: 'Proposition envoyée' },
  { id: 8, company: 'Cabinet Lefebvre', sector: 'Juridique', mrr: 1800, services: ['SEO Local', 'Contenu'], owner: 'JD', days: 11, prob: 50, stage: 'proposition', next: 'Suivi de proposition' },
  { id: 9, company: 'Voyages Évasion', sector: 'Tourisme', mrr: 1300, services: ['Contenu', 'Backlinks'], owner: 'AL', days: 7, prob: 55, stage: 'proposition', next: 'Ajuster le devis' },
  { id: 10, company: 'Clinique Santé Plus', sector: 'Santé', mrr: 1900, services: ['SEO Tech.', 'SEO Local'], owner: 'MC', days: 3, prob: 75, stage: 'negociation', next: "Négocier l'engagement" },
  { id: 11, company: 'Studio Pixel', sector: 'Agence créative', mrr: 1400, services: ['SEO Tech.', 'Backlinks'], owner: 'JD', days: 14, prob: 80, stage: 'negociation', next: 'Signature imminente' },
  { id: 12, company: 'Immobilier Vista', sector: 'Immobilier', mrr: 1600, services: ['SEO Local', 'Contenu'], owner: 'AL', days: 1, prob: 100, stage: 'gagne', next: 'Onboarding lancé' },
  { id: 13, company: 'Brasserie Houblon', sector: 'Agroalimentaire', mrr: 1000, services: ['SEO Local'], owner: 'MC', days: 2, prob: 100, stage: 'gagne', next: 'Onboarding lancé' },
];

/** Format monétaire québécois (espace insécable comme séparateur de milliers). */
export const fmt = (n: number) => n.toLocaleString('fr-CA');

/** Initiales affichées sur la vignette d'une entreprise. */
export const initials = (company: string) =>
  company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export const probColor = (p: number) =>
  p >= 75 ? 'var(--green)' : p >= 45 ? 'var(--yellow-fg)' : p >= 25 ? 'var(--blue-fg)' : 'var(--fg4)';

/* ────────────────────────────────────────────────────────────────────────
   Panneau de détail d'un deal — session 4.4.

   DEAL_DETAILS complète chaque carte du Kanban ci-dessus (même id) avec ce
   que le panneau latéral affiche : contact, historique des échanges,
   documents, instantané SEO. Un deal sans entrée reçoit le détail générique
   `genericDetail`. Ce n'est pas un second jeu de données déconnecté — c'est
   un complément indexé sur les mêmes id que DEALS.
   ──────────────────────────────────────────────────────────────────────── */

/** Seuil : au-delà de ce nombre de jours dans la même étape, le deal est signalé dormant. */
export const DORMANT_DAYS = 12;
/** Politique de conservation : l'instantané SEO d'un prospect est purgé ce nombre de jours après la perte. */
export const SNAPSHOT_PURGE_DAYS = 90;

export const LOST_REASONS = [
  'Budget insuffisant',
  'Parti chez un concurrent',
  'Projet reporté',
  'Reprend en interne',
  'Pas de réponse après 3 relances',
  'Mauvais moment dans l’année',
];

export type ExchangeChannel = 'appel' | 'courriel' | 'reunion' | 'note';

export const CHANNELS: Record<ExchangeChannel, { label: string; tone: Tone }> = {
  appel: { label: 'Appel', tone: 'blue' },
  courriel: { label: 'Courriel', tone: 'neutral' },
  reunion: { label: 'Réunion', tone: 'green' },
  note: { label: 'Note interne', tone: 'yellow' },
};

export type Exchange = { ch: ExchangeChannel; at: string; who: string; text: string };

export type DealDoc = { name: string; kind: string; at: string; auto?: boolean };

export type DealSeo =
  | { done: false }
  | {
      done: true;
      at: string;
      domain: string;
      authority: number;
      keywords: number;
      traffic: string;
      top10: number;
    };

export type DealDetail = {
  contact: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  site: string;
  /** Date de création du deal — sinon `age` sert de repère relatif. */
  createdAt: string | null;
  age?: number;
  /** Date de la prochaine action (le libellé, lui, vit sur `Deal.next`). */
  nextAt: string;
  history: Exchange[];
  docs: DealDoc[];
  seo: DealSeo;
  /** Date à laquelle le deal a été gagné — seulement pour les deals déjà gagnés à la démo. */
  wonAt?: string;
};

const DEAL_DETAILS: Record<number, DealDetail> = {
  10: {
    // Clinique Santé Plus — négociation
    contact: 'Dre Sophie Nadeau',
    role: 'Directrice de clinique',
    email: 'sophie.nadeau@cliniquesanteplus.ca',
    phone: '514 555 0182',
    site: 'cliniquesanteplus.ca',
    createdAt: '18 juillet 2026',
    nextAt: '11 septembre 2026',
    history: [
      {
        ch: 'reunion',
        at: '8 sept., 14 h 00',
        who: 'Marie Chen',
        text: 'Présentation de l’audit de prospection. Le blocage est l’engagement de 12 mois — ils veulent 6 mois renouvelables.',
      },
      {
        ch: 'courriel',
        at: '4 sept., 09 h 12',
        who: 'Marie Chen',
        text: 'Envoi de la proposition révisée à 1 900 $/mois, avec le détail des livrables du premier trimestre.',
      },
      {
        ch: 'appel',
        at: '28 août, 11 h 30',
        who: 'Marie Chen',
        text: 'Appel de qualification. Deux cliniques, une seule fiche Google — c’est leur premier irritant.',
      },
      {
        ch: 'note',
        at: '18 juillet',
        who: 'Automatisation',
        text: 'Deal créé depuis un audit de prospection lancé sur cliniquesanteplus.ca.',
      },
    ],
    docs: [
      { name: 'Proposition v2 — Clinique Santé Plus', kind: 'Proposition', at: '4 sept. 2026' },
      { name: 'Devis 12 mois — 1 900 $/mois', kind: 'Devis', at: '4 sept. 2026' },
      {
        name: 'Audit de prospection — présence, SEO, design',
        kind: 'Audit de prospect',
        at: '18 juillet 2026',
        auto: true,
      },
    ],
    seo: {
      done: true,
      at: '18 juillet 2026',
      domain: 'cliniquesanteplus.ca',
      authority: 24,
      keywords: 61,
      traffic: '1 400',
      top10: 4,
    },
  },
  1: {
    // Boutique Lumière — deal neuf
    contact: 'Élise Gauthier',
    role: 'Propriétaire',
    email: 'elise@boutiquelumiere.ca',
    phone: '438 555 0294',
    site: 'boutiquelumiere.ca',
    createdAt: '5 septembre 2026',
    nextAt: '12 septembre 2026',
    history: [
      {
        ch: 'note',
        at: '5 sept.',
        who: 'Automatisation',
        text: 'Deal créé depuis le formulaire du site. Aucun échange encore consigné.',
      },
    ],
    docs: [],
    seo: { done: false },
  },
  11: {
    // Studio Pixel — dormant
    contact: 'Karim Belhadj',
    role: 'Directeur artistique',
    email: 'karim@studiopixel.ca',
    phone: '514 555 0771',
    site: 'studiopixel.ca',
    createdAt: '2 août 2026',
    nextAt: '20 août 2026',
    history: [
      {
        ch: 'courriel',
        at: '26 août, 08 h 40',
        who: 'Marc Tremblay',
        text: 'Troisième relance sur la signature. Sans réponse depuis.',
      },
      {
        ch: 'appel',
        at: '14 août, 16 h 20',
        who: 'Marc Tremblay',
        text: 'Il annonce la signature « pour la semaine prochaine ». Rien depuis.',
      },
      {
        ch: 'reunion',
        at: '2 août, 10 h 00',
        who: 'Marc Tremblay',
        text: 'Négociation du périmètre : backlinks retirés de la première phase.',
      },
    ],
    docs: [{ name: 'Proposition v1 — Studio Pixel', kind: 'Proposition', at: '2 août 2026' }],
    seo: {
      done: true,
      at: '2 août 2026',
      domain: 'studiopixel.ca',
      authority: 31,
      keywords: 128,
      traffic: '3 100',
      top10: 9,
    },
  },
  12: {
    // Immobilier Vista — gagné, onboarding lancé
    contact: 'Patrick Rousseau',
    role: 'Directeur des ventes',
    email: 'p.rousseau@immobiliervista.ca',
    phone: '450 555 0311',
    site: 'immobiliervista.ca',
    createdAt: '20 juin 2026',
    nextAt: '10 septembre 2026',
    wonAt: '8 septembre 2026',
    history: [
      {
        ch: 'note',
        at: '8 sept., 15 h 02',
        who: 'Automatisation',
        text: 'Deal gagné. Client créé, onboarding en 4 étapes lancé, premier audit planifié.',
      },
      {
        ch: 'reunion',
        at: '8 sept., 14 h 00',
        who: 'Aïcha Lemaire',
        text: 'Signature du contrat 12 mois à 1 600 $/mois.',
      },
      {
        ch: 'courriel',
        at: '1 sept., 10 h 15',
        who: 'Aïcha Lemaire',
        text: 'Envoi du contrat pour signature électronique.',
      },
    ],
    docs: [
      { name: 'Contrat signé — 12 mois', kind: 'Contrat', at: '8 sept. 2026' },
      { name: 'Proposition v3 — Immobilier Vista', kind: 'Proposition', at: '28 août 2026' },
    ],
    seo: {
      done: true,
      at: '20 juin 2026',
      domain: 'immobiliervista.ca',
      authority: 28,
      keywords: 94,
      traffic: '2 250',
      top10: 6,
    },
  },
};

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');

const genericDetail = (deal: Deal): DealDetail => ({
  contact: 'Contact à renseigner',
  role: null,
  email: null,
  phone: null,
  site: `${slug(deal.company)}.ca`,
  createdAt: null,
  age: deal.days + 14,
  nextAt: 'à planifier',
  history: [
    {
      ch: 'note',
      at: 'à la création',
      who: 'Automatisation',
      text: 'Aucun échange consigné pour l’instant.',
    },
  ],
  docs: [],
  seo: { done: false },
});

export const dealDetail = (deal: Deal): DealDetail => DEAL_DETAILS[deal.id] ?? genericDetail(deal);

/** Ce que « Marquer gagné » enclenche réellement — annoncé avant déclenchement. */
export const WON_EFFECTS: [string, string][] = [
  ['Un client', 'créé dans le Client hub avec le forfait et le MRR du deal'],
  ['Un onboarding', 'lancé en 4 étapes, assigné au responsable du deal'],
  ['Un premier audit', 'planifié sur les trois dimensions dans les 48 h'],
  ['L’instantané du prospect', 'converti en premier audit historisé, et non plus purgeable'],
];
