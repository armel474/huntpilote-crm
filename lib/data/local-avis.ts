/**
 * SEO local · Avis — données de démonstration (session 3.2).
 *
 * `acme-siege` porte le jeu de données le plus complet ; les autres
 * établissements restent allégés.
 */

import type { Tone } from '@/components/ui/Atoms';

export type AvisEtat = 'sans_reponse' | 'a_relire' | 'publiee' | 'signale';

export const AVIS_STATE: Record<AvisEtat, { label: string; tone: Tone }> = {
  sans_reponse: { label: 'Sans réponse', tone: 'red' },
  a_relire: { label: 'Réponse à relire', tone: 'yellow' },
  publiee: { label: 'Réponse publiée', tone: 'green' },
  signale: { label: 'Signalé à Google', tone: 'blue' },
};

export type Avis = {
  id: number;
  auteur: string;
  note: number;
  date: string;
  texte: string;
  etat: AvisEtat;
  reponse?: string;
  reponseDraft?: string;
  signaleMotif?: string;
  sentiments: string[];
};

export type SentimentTheme = { theme: string; count: number };

export type AvisData = {
  dist: Record<number, number>;
  trend: string;
  sentiment: { positifs: SentimentTheme[]; negatifs: SentimentTheme[]; insight: string };
  avis: Avis[];
};

export const AVIS_BY_ETAB: Record<string, AvisData> = {
  'acme-siege': {
    dist: { 5: 65, 4: 15, 3: 4, 2: 2, 1: 1 },
    trend: '+0,1 sur 90 jours',
    sentiment: {
      positifs: [
        { theme: 'Qualité du travail', count: 34 },
        { theme: 'Rapidité d’intervention', count: 21 },
        { theme: 'Prix compétitif', count: 15 },
      ],
      negatifs: [
        { theme: 'Communication pendant le chantier', count: 9 },
        { theme: 'Respect des rendez-vous', count: 6 },
        { theme: 'Propreté du chantier', count: 4 },
      ],
      insight:
        'Neuf avis récents mentionnent un manque de communication pendant les travaux — c’est un problème d’exploitation, pas de SEO, et ça vaut la peine de le dire au client.',
    },
    avis: [
      {
        id: 1,
        auteur: 'Martine L.',
        note: 5,
        date: '28 août 2026',
        texte: 'Équipe professionnelle, travail impeccable sur notre toiture. Je recommande.',
        etat: 'publiee',
        reponse: 'Merci beaucoup Martine, ça nous fait très plaisir de lire ça ! Au plaisir de vous revoir.',
        sentiments: ['Qualité du travail'],
      },
      {
        id: 2,
        auteur: 'Jean-François R.',
        note: 1,
        date: '22 juillet 2026',
        texte: 'Rendez-vous reporté trois fois sans nous avertir. On a attendu toute la journée à chaque fois, c’est très frustrant.',
        etat: 'sans_reponse',
        sentiments: ['Communication pendant le chantier', 'Respect des rendez-vous'],
      },
      {
        id: 3,
        auteur: 'Sophie T.',
        note: 4,
        date: '18 août 2026',
        texte: 'Bon travail, mais le devis initial n’était pas très clair sur les extras.',
        etat: 'a_relire',
        reponseDraft:
          'Merci pour votre commentaire Sophie. Nous prenons note de votre remarque sur la clarté du devis et allons revoir notre façon de présenter les extras. N’hésitez pas à nous contacter si vous avez des questions.',
        sentiments: ['Clarté du devis'],
      },
      {
        id: 4,
        auteur: 'Marc-André D.',
        note: 5,
        date: '10 août 2026',
        texte: 'Excellent service, prix compétitif.',
        etat: 'publiee',
        reponse: 'Merci Marc-André, on apprécie votre confiance !',
        sentiments: ['Prix compétitif'],
      },
      {
        id: 5,
        auteur: 'Anonyme',
        note: 1,
        date: '2 août 2026',
        texte: 'Pire entreprise jamais vue, j’ai payé pour rien.',
        etat: 'signale',
        signaleMotif:
          'Avis manifestement faux — aucun dossier client ne correspond à ce nom, déposé depuis un compte créé le jour même.',
        sentiments: [],
      },
      {
        id: 6,
        auteur: 'Chantal B.',
        note: 2,
        date: '29 juillet 2026',
        texte: 'On a dû rappeler cinq fois pour avoir des nouvelles du chantier.',
        etat: 'publiee',
        reponse:
          'Bonjour Chantal, toutes nos excuses pour ce délai de communication — nous avons revu notre processus de suivi de chantier depuis. Merci de nous en avoir informés.',
        sentiments: ['Communication pendant le chantier'],
      },
      {
        id: 7,
        auteur: 'Denis P.',
        note: 3,
        date: '15 juillet 2026',
        texte: 'Travail correct, sans plus. La propreté du chantier laissait à désirer.',
        etat: 'publiee',
        reponse: 'Merci pour ce retour Denis, nous transmettons la remarque à l’équipe sur le terrain.',
        sentiments: ['Propreté du chantier'],
      },
      {
        id: 8,
        auteur: 'Isabelle G.',
        note: 5,
        date: '5 juillet 2026',
        texte: '',
        etat: 'publiee',
        reponse: 'Merci pour votre 5 étoiles Isabelle !',
        sentiments: [],
      },
      {
        id: 9,
        auteur: 'Robert K.',
        note: 2,
        date: '30 juin 2026',
        texte: 'Attente très longue avant le premier contact avec un conseiller.',
        etat: 'publiee',
        reponse: 'Merci Robert, nous avons ajouté une ressource à l’accueil téléphonique depuis votre passage.',
        sentiments: ['Respect des rendez-vous'],
      },
    ],
  },
  'boreal-qc': {
    dist: { 5: 118, 4: 20, 3: 3, 2: 1, 1: 0 },
    trend: '+0,2 sur 90 jours',
    sentiment: {
      positifs: [
        { theme: 'Accompagnement de l’agent', count: 44 },
        { theme: 'Réactivité', count: 19 },
      ],
      negatifs: [{ theme: 'Délai de signature', count: 3 }],
      insight: 'Peu de récurrence négative : les points relevés restent isolés, sans thème dominant.',
    },
    avis: [
      {
        id: 1,
        auteur: 'Nadia F.',
        note: 5,
        date: '3 sept. 2026',
        texte: 'Vente rapide et bien accompagnée du début à la fin.',
        etat: 'publiee',
        reponse: 'Merci Nadia, ravis d’avoir pu vous accompagner !',
        sentiments: ['Accompagnement de l’agent'],
      },
      {
        id: 2,
        auteur: 'Yves M.',
        note: 4,
        date: '20 août 2026',
        texte: 'Bon suivi, un peu long pour la signature finale.',
        etat: 'publiee',
        reponse: 'Merci Yves, nous travaillons à réduire ces délais avec le notaire.',
        sentiments: ['Délai de signature'],
      },
    ],
  },
  'lavoie-laval': {
    dist: { 5: 21, 4: 6, 3: 1, 2: 1, 1: 0 },
    trend: 'stable sur 90 jours',
    sentiment: {
      positifs: [{ theme: 'Accueil', count: 12 }],
      negatifs: [{ theme: 'Accessibilité du bâtiment', count: 2 }],
      insight: 'Deux avis mentionnent l’accès en fauteuil roulant — à corroborer avec la question sans réponse ci-contre.',
    },
    avis: [
      {
        id: 1,
        auteur: 'Line P.',
        note: 5,
        date: '1 sept. 2026',
        texte: 'Physiothérapeute très à l’écoute.',
        etat: 'publiee',
        reponse: 'Merci Line, au plaisir de vous revoir !',
        sentiments: ['Accueil'],
      },
    ],
  },
  marchebio: {
    dist: { 5: 41, 4: 15, 3: 4, 2: 2, 1: 1 },
    trend: '−0,1 sur 90 jours',
    sentiment: {
      positifs: [{ theme: 'Fraîcheur des produits', count: 26 }],
      negatifs: [{ theme: 'Files d’attente', count: 7 }],
      insight: 'Les files d’attente reviennent depuis l’ajout du comptoir traiteur — un enjeu d’aménagement du magasin, pas de visibilité.',
    },
    avis: [
      {
        id: 1,
        auteur: 'Geneviève R.',
        note: 4,
        date: '29 août 2026',
        texte: 'Beau choix de produits locaux, mais la file au comptoir traiteur est longue le samedi.',
        etat: 'sans_reponse',
        sentiments: ['Files d’attente'],
      },
      {
        id: 2,
        auteur: 'Simon L.',
        note: 5,
        date: '12 août 2026',
        texte: 'Toujours frais, personnel sympathique.',
        etat: 'publiee',
        reponse: 'Merci Simon !',
        sentiments: ['Fraîcheur des produits'],
      },
    ],
  },
};

/** Brouillon proposé par l'agent — relu avant publication, jamais publié seul. */
export function genDraft(r: Avis): string {
  const prenom = r.auteur !== 'Anonyme' ? ` ${r.auteur.split(' ')[0]}` : '';
  const corps =
    r.note <= 2
      ? 'Nous sommes désolés pour cette expérience et prenons vos remarques au sérieux — un membre de l’équipe vous contactera pour en discuter.'
      : 'Nous en tenons compte pour la suite.';
  return `Merci pour votre commentaire${prenom}. ${corps} N’hésitez pas à nous joindre pour toute question.`;
}
