/**
 * Backlink Analyse — données de démonstration (session 2.3).
 *
 * Le corpus complet des backlinks n'est jamais conservé — trop volumineux,
 * change en continu. Seuls les gains et les pertes de chaque relevé
 * rejoignent l'historique du client ; c'est le cœur de l'écran.
 */

import type { SaveEntry } from '@/lib/data/outils';

export const BL_SCOPES = ['Analyse standard', 'Analyse approfondie + toxicité', 'Analyse + concurrents'] as const;

export const BL_COSTS: Record<(typeof BL_SCOPES)[number], { credits: number; dollars: string; weight: string }> = {
  'Analyse standard': { credits: 34, dollars: '0,17 $', weight: 'Requête légère' },
  'Analyse approfondie + toxicité': { credits: 88, dollars: '0,44 $', weight: 'Requête moyenne' },
  'Analyse + concurrents': { credits: 156, dollars: '0,78 $', weight: 'Requête lourde' },
};

export type BlProfile = {
  domains: number;
  domainsPrev: number;
  authority: number;
  authorityPrev: number;
  /** % de liens suivis (dofollow). */
  followed: number;
  date: string;
};

export const PROFILE: BlProfile = {
  domains: 214,
  domainsPrev: 198,
  authority: 34,
  authorityPrev: 31,
  followed: 71,
  date: '4 sept. 2026',
};

export type BlAnchor = { t: string; n: number };

export const ANCHORS: readonly BlAnchor[] = [
  { t: 'acmecorp.ca', n: 44 },
  { t: 'toiture montréal', n: 18 },
  { t: 'cliquez ici', n: 9 },
  { t: 'couvreur rive-sud', n: 6 },
];

export type BlGain = { domain: string; authority: number; anchor: string; url: string; date: string };

export const GAINS: readonly BlGain[] = [
  { domain: 'batirenoquebec.ca', authority: 58, anchor: 'toiture montréal', url: '/services/toiture-plate', date: '3 sept. 2026' },
  { domain: 'lapresse-partenaires.ca', authority: 71, anchor: 'Acme Corp.', url: '/', date: '1 sept. 2026' },
  { domain: 'quincaillerie-fortin.ca', authority: 22, anchor: 'couvreur rive-sud', url: '/services/', date: '30 août 2026' },
  { domain: 'blogue-habitation.ca', authority: 40, anchor: 'inspection toiture drone', url: '/services/inspection-drone', date: '28 août 2026' },
];

export type BlLoss = { domain: string; authority: number; anchor: string; reason: string; date: string; prio?: string };

export const LOSSES: readonly BlLoss[] = [
  { domain: 'annuaire-construction.ca', authority: 33, anchor: 'toiture rive-sud', reason: 'page supprimée', date: '2 sept. 2026' },
  { domain: 'partenaire-immo-estrie.ca', authority: 52, anchor: 'Acme Corp.', reason: 'lien retiré', date: '31 août 2026' },
  { domain: 'forum-renovation.ca', authority: 19, anchor: 'réparation toiture', reason: 'page 404', date: '29 août 2026' },
];

export type BlToxicStatus = 'a-desavouer' | 'desavoue';

export type BlToxic = { domain: string; authority: number; spam: number; reason: string; status: BlToxicStatus };

export const TOXIC: readonly BlToxic[] = [
  { domain: 'liens-gratuits-fr.ru', authority: 4, spam: 91, reason: 'réseau PBN suspecté', status: 'a-desavouer' },
  { domain: 'annuaire-2009-seo.com', authority: 2, spam: 84, reason: 'ferme à liens automatisée', status: 'a-desavouer' },
  { domain: 'casino-promo-xyz.net', authority: 1, spam: 97, reason: 'thématique sans rapport, ancre exacte', status: 'a-desavouer' },
];

export type BlCompetitor = { name: string; domains: number; self?: boolean };

export const COMPETITORS: readonly BlCompetitor[] = [
  { name: 'Acme Corp. (client)', domains: 214, self: true },
  { name: 'Couvreur Rive-Sud Inc.', domains: 340 },
  { name: 'Toitures Estrie', domains: 190 },
  { name: 'Réno-Toit Longueuil', domains: 128 },
];

export const BL_SAVES: readonly SaveEntry[] = [
  { date: '28 août 2026', tool: 'Backlink Analyse', what: '+18 domaines référents (delta) · 3 versés au rapport' },
  { date: '31 juil. 2026', tool: 'Backlink Analyse', what: '+9 domaines référents (delta)' },
];

export const BL_STATES = [
  ['ok', 'Résultats disponibles'],
  ['aucun', 'Aucun backlink détecté'],
  ['encours', 'Analyse en cours'],
  ['perte', 'Perte importante détectée'],
  ['incomplet', 'Données du fournisseur incomplètes'],
  ['nosel', 'Aucun compte sélectionné'],
  ['prospect', 'Prospect · instantané'],
] as const;

export type BlState = (typeof BL_STATES)[number][0];
