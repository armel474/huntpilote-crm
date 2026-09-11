/**
 * Devis à un client déjà signé — session 7.3.
 *
 * Ne touche pas au devis de vente initiale du panneau de deal (pipeline,
 * session 4.4, `lib/data/pipeline.ts`) : celui-là précède la signature, ceux-ci
 * couvrent un service additionnel, un avenant ou un renouvellement pour un
 * client déjà signé (Acme Corp.).
 */

import type { Tone } from '@/components/ui/Atoms';

export const TPS = 0.05;
export const TVQ = 0.09975;

export type QuoteStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';

export const QUOTE_STATUSES: Record<QuoteStatus, { label: string; tone: Tone }> = {
  brouillon: { label: 'Brouillon', tone: 'neutral' },
  envoye: { label: 'Envoyé', tone: 'blue' },
  accepte: { label: 'Accepté', tone: 'green' },
  refuse: { label: 'Refusé', tone: 'red' },
  expire: { label: 'Expiré', tone: 'yellow' },
};

export type QuoteLine = { desc: string; qte: number; prix: number };

export type QuoteVersion = { v: number; at: string; who: string; note: string };

export type Quote = {
  id: string;
  objet: string;
  contactId: string;
  statut: QuoteStatus;
  emis: string | null;
  expire: string | null;
  lignes: QuoteLine[];
  conditions: string;
  versions: QuoteVersion[];
  /** Présent seulement pour un devis accepté — le lie visiblement au contrat actif. */
  contratRef?: string;
  motifRefus?: string;
};

export const QUOTES: Quote[] = [
  {
    id: 'DV-2026-017',
    objet: 'Refonte de la structure de catégories (SEO)',
    contactId: 'c1',
    statut: 'brouillon',
    emis: null,
    expire: null,
    lignes: [
      { desc: 'Audit de l’arborescence actuelle', qte: 1, prix: 400 },
      { desc: 'Nouvelle structure de catégories et redirections', qte: 1, prix: 1400 },
      { desc: 'Mise à jour du maillage interne', qte: 1, prix: 300 },
    ],
    conditions: '50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.',
    versions: [],
  },
  {
    id: 'DV-2026-014',
    objet: 'Ajout d’une seconde langue au site (anglais)',
    contactId: 'c1',
    statut: 'envoye',
    emis: '28 avril 2026',
    expire: '28 mai 2026',
    lignes: [
      { desc: 'Traduction et intégration — 24 pages', qte: 1, prix: 950 },
      { desc: 'Configuration hreflang et sitemap bilingue', qte: 1, prix: 350 },
      { desc: 'Test de bascule de langue', qte: 1, prix: 150 },
    ],
    conditions: '50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.',
    versions: [{ v: 1, at: '28 avril 2026', who: 'Marie Chen', note: 'Version envoyée au client par courriel.' }],
  },
  {
    id: 'DV-2026-009',
    objet: 'Avenant — passage à 2 articles de blogue par mois',
    contactId: 'c1',
    statut: 'accepte',
    emis: '3 mars 2026',
    expire: '2 avril 2026',
    lignes: [{ desc: 'Article de blogue additionnel · par mois', qte: 1, prix: 600 }],
    conditions: 'Facturé mensuellement avec le forfait en cours. Prend effet le mois suivant l’acceptation.',
    versions: [{ v: 1, at: '3 mars 2026', who: 'Marie Chen', note: 'Version envoyée au client par courriel.' }],
    contratRef: 'Avenant #A-04 ajouté au contrat le 5 mars 2026',
  },
  {
    id: 'DV-2026-002',
    objet: 'Audit technique complémentaire — sous-domaine boutique.acmecorp.fr',
    contactId: 'c2',
    statut: 'refuse',
    emis: '14 janvier 2026',
    expire: '13 février 2026',
    lignes: [{ desc: 'Audit technique complet du sous-domaine', qte: 1, prix: 800 }],
    conditions: 'Paiement à la livraison du rapport d’audit. Offre valide 30 jours à partir de l’envoi.',
    versions: [{ v: 1, at: '14 janvier 2026', who: 'Marie Chen', note: 'Version envoyée au client par courriel.' }],
    motifRefus: 'Reporté — le sous-domaine change de plateforme au T3 2026.',
  },
  {
    id: 'DV-2025-031',
    objet: 'Renouvellement annuel — forfait Croissance SEO',
    contactId: 'c1',
    statut: 'expire',
    emis: '20 novembre 2025',
    expire: '20 décembre 2025',
    lignes: [{ desc: 'Forfait Croissance SEO · 12 mois', qte: 12, prix: 1200 }],
    conditions: 'Paiement mensuel par prélèvement. Offre valide 30 jours à partir de l’envoi.',
    versions: [{ v: 1, at: '20 novembre 2025', who: 'Marie Chen', note: 'Version envoyée au client par courriel.' }],
  },
];

export const quoteSubtotal = (q: Pick<Quote, 'lignes'>): number =>
  q.lignes.reduce((s, l) => s + l.qte * l.prix, 0);

export const quoteTaxes = (sub: number): { tps: number; tvq: number; total: number } => ({
  tps: sub * TPS,
  tvq: sub * TVQ,
  total: sub * (1 + TPS + TVQ),
});

export const fmtMoney = (n: number): string =>
  `${n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
