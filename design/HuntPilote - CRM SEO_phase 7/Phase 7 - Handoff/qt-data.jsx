/* HuntPilote — Devis à un client déjà signé (7.3). Ne touche pas au devis de vente initiale du pipeline (dl-data.jsx). */
const QT_TPS = 0.05, QT_TVQ = 0.09975;

const QT_STATUTS = {
  brouillon: { label:'Brouillon', tone:'neutral' },
  envoye:    { label:'Envoyé',    tone:'blue' },
  accepte:   { label:'Accepté',   tone:'green' },
  refuse:    { label:'Refusé',    tone:'red' },
  expire:    { label:'Expiré',    tone:'yellow' },
};

const qtSubtotal = q => q.lignes.reduce((s, l) => s + l.qte * l.prix, 0);
const qtTaxes = sub => ({ tps: sub * QT_TPS, tvq: sub * QT_TVQ, total: sub * (1 + QT_TPS + QT_TVQ) });

const QT_QUOTES = [
  { id:'DV-2026-017', objet:'Refonte de la structure de catégories (SEO)', contact:'c1', statut:'brouillon', emis:null, expire:null,
    lignes:[{ desc:'Audit de l’arborescence actuelle', qte:1, prix:400 }, { desc:'Nouvelle structure de catégories et redirections', qte:1, prix:1400 }, { desc:'Mise à jour du maillage interne', qte:1, prix:300 }],
    conditions:'50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.', versions:[] },
  { id:'DV-2026-014', objet:'Ajout d’une seconde langue au site (anglais)', contact:'c1', statut:'envoye', emis:'28 avril 2026', expire:'28 mai 2026',
    lignes:[{ desc:'Traduction et intégration — 24 pages', qte:1, prix:950 }, { desc:'Configuration hreflang et sitemap bilingue', qte:1, prix:350 }, { desc:'Test de bascule de langue', qte:1, prix:150 }],
    conditions:'50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.', versions:[{ v:1, at:'28 avril 2026', who:'Marie Chen', note:'Version envoyée au client par courriel.' }] },
  { id:'DV-2026-009', objet:'Avenant — passage à 2 articles de blogue par mois', contact:'c1', statut:'accepte', emis:'3 mars 2026', expire:'2 avril 2026',
    lignes:[{ desc:'Article de blogue additionnel · par mois', qte:1, prix:600 }],
    conditions:'Facturé mensuellement avec le forfait en cours. Prend effet le mois suivant l’acceptation.', versions:[{ v:1, at:'3 mars 2026', who:'Marie Chen', note:'Version envoyée au client par courriel.' }],
    contratRef:'Avenant #A-04 ajouté au contrat le 5 mars 2026' },
  { id:'DV-2026-002', objet:'Audit technique complémentaire — sous-domaine boutique.acmecorp.fr', contact:'c2', statut:'refuse', emis:'14 janvier 2026', expire:'13 février 2026',
    lignes:[{ desc:'Audit technique complet du sous-domaine', qte:1, prix:800 }],
    conditions:'Paiement à la livraison du rapport d’audit. Offre valide 30 jours à partir de l’envoi.', versions:[{ v:1, at:'14 janvier 2026', who:'Marie Chen', note:'Version envoyée au client par courriel.' }],
    motifRefus:'Reporté — le sous-domaine change de plateforme au T3 2026.' },
  { id:'DV-2025-031', objet:'Renouvellement annuel — forfait Croissance SEO', contact:'c1', statut:'expire', emis:'20 novembre 2025', expire:'20 décembre 2025',
    lignes:[{ desc:'Forfait Croissance SEO · 12 mois', qte:12, prix:1200 }],
    conditions:'Paiement mensuel par prélèvement. Offre valide 30 jours à partir de l’envoi.', versions:[{ v:1, at:'20 novembre 2025', who:'Marie Chen', note:'Version envoyée au client par courriel.' }] },
];

/* Historique de factures — lecture seule, existant. */
const QT_INVOICES = [
  { id:'FA-2026-05', objet:'Forfait Croissance SEO · Mai 2026', montant:1200, date:'1 mai 2026', statut:'payee' },
  { id:'FA-2026-04', objet:'Forfait Croissance SEO · Avril 2026', montant:1200, date:'1 avr. 2026', statut:'payee' },
  { id:'FA-2026-03', objet:'Forfait Croissance SEO · Mars 2026 + avenant contenu', montant:1800, date:'1 mars 2026', statut:'payee' },
];

Object.assign(window, { QT_TPS, QT_TVQ, QT_STATUTS, qtSubtotal, qtTaxes, QT_QUOTES, QT_INVOICES });
