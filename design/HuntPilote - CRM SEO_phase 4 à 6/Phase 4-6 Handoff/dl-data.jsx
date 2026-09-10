/* HuntPilote — Détail d'un deal : historique, documents, instantané SEO. Panneau latéral du Kanban. */
const DL_DORMANT = 12; // seuil : au-delà de 12 jours dans la même étape, le deal est signalé dormant
const DL_SNAPSHOT_DAYS = 90; // politique de conservation : l'instantané d'un prospect est purgé 90 jours après la perte

const DL_LOST_REASONS = ['Budget insuffisant', 'Parti chez un concurrent', 'Projet reporté', 'Reprend en interne', 'Pas de réponse après 3 relances', 'Mauvais moment dans l’année'];
const DL_CHANNELS = { appel: ['Appel', 'blue'], courriel: ['Courriel', 'neutral'], reunion: ['Réunion', 'green'], note: ['Note interne', 'yellow'] };

/* Détail attaché aux cartes du Kanban. Les deals sans entrée reçoivent le détail générique ci-dessous. */
const DL_DETAIL = {
  10: { /* Clinique Santé Plus — négociation */
    contact: 'Dre Sophie Nadeau', role: 'Directrice de clinique', email: 'sophie.nadeau@cliniquesanteplus.ca', phone: '514 555 0182',
    site: 'cliniquesanteplus.ca', createdAt: '18 juillet 2026', nextAt: '11 septembre 2026',
    history: [
      { ch: 'reunion', at: '8 sept., 14 h 00', who: 'Marie Chen', text: 'Présentation de l’audit de prospection. Le blocage est l’engagement de 12 mois — ils veulent 6 mois renouvelables.' },
      { ch: 'courriel', at: '4 sept., 09 h 12', who: 'Marie Chen', text: 'Envoi de la proposition révisée à 1 900 $/mois, avec le détail des livrables du premier trimestre.' },
      { ch: 'appel', at: '28 août, 11 h 30', who: 'Marie Chen', text: 'Appel de qualification. Deux cliniques, une seule fiche Google — c’est leur premier irritant.' },
      { ch: 'note', at: '18 juillet', who: 'Automatisation', text: 'Deal créé depuis un audit de prospection lancé sur cliniquesanteplus.ca.' },
    ],
    docs: [
      { name: 'Proposition v2 — Clinique Santé Plus', kind: 'Proposition', at: '4 sept. 2026', href: 'Rapport Client.html' },
      { name: 'Devis 12 mois — 1 900 $/mois', kind: 'Devis', at: '4 sept. 2026', href: 'Client Hub.html' },
      { name: 'Audit de prospection — présence, SEO, design', kind: 'Audit de prospect', at: '18 juillet 2026', href: 'Audit Prospect.html', auto: true },
    ],
    seo: { done: true, at: '18 juillet 2026', domain: 'cliniquesanteplus.ca', authority: 24, keywords: 61, traffic: '1 400', top10: 4, href: 'Domain Overview.html' },
  },
  1: { /* Boutique Lumière — deal neuf */
    contact: 'Élise Gauthier', role: 'Propriétaire', email: 'elise@boutiquelumiere.ca', phone: '438 555 0294',
    site: 'boutiquelumiere.ca', createdAt: '5 septembre 2026', nextAt: '12 septembre 2026',
    history: [{ ch: 'note', at: '5 sept.', who: 'Automatisation', text: 'Deal créé depuis le formulaire du site. Aucun échange encore consigné.' }],
    docs: [],
    seo: { done: false },
  },
  11: { /* Studio Pixel — dormant */
    contact: 'Karim Belhadj', role: 'Directeur artistique', email: 'karim@studiopixel.ca', phone: '514 555 0771',
    site: 'studiopixel.ca', createdAt: '2 août 2026', nextAt: '20 août 2026',
    history: [
      { ch: 'courriel', at: '26 août, 08 h 40', who: 'Marc Tremblay', text: 'Troisième relance sur la signature. Sans réponse depuis.' },
      { ch: 'appel', at: '14 août, 16 h 20', who: 'Marc Tremblay', text: 'Il annonce la signature « pour la semaine prochaine ». Rien depuis.' },
      { ch: 'reunion', at: '2 août, 10 h 00', who: 'Marc Tremblay', text: 'Négociation du périmètre : backlinks retirés de la première phase.' },
    ],
    docs: [{ name: 'Proposition v1 — Studio Pixel', kind: 'Proposition', at: '2 août 2026', href: 'Rapport Client.html' }],
    seo: { done: true, at: '2 août 2026', domain: 'studiopixel.ca', authority: 31, keywords: 128, traffic: '3 100', top10: 9, href: 'Domain Overview.html' },
  },
  12: { /* Immobilier Vista — gagné, onboarding lancé */
    contact: 'Patrick Rousseau', role: 'Directeur des ventes', email: 'p.rousseau@immobiliervista.ca', phone: '450 555 0311',
    site: 'immobiliervista.ca', createdAt: '20 juin 2026', nextAt: '10 septembre 2026', wonAt: '8 septembre 2026',
    history: [
      { ch: 'note', at: '8 sept., 15 h 02', who: 'Automatisation', text: 'Deal gagné. Client créé, onboarding en 4 étapes lancé, premier audit planifié.' },
      { ch: 'reunion', at: '8 sept., 14 h 00', who: 'Aïcha Lemaire', text: 'Signature du contrat 12 mois à 1 600 $/mois.' },
      { ch: 'courriel', at: '1 sept., 10 h 15', who: 'Aïcha Lemaire', text: 'Envoi du contrat pour signature électronique.' },
    ],
    docs: [
      { name: 'Contrat signé — 12 mois', kind: 'Contrat', at: '8 sept. 2026', href: 'Client Hub.html' },
      { name: 'Proposition v3 — Immobilier Vista', kind: 'Proposition', at: '28 août 2026', href: 'Rapport Client.html' },
    ],
    seo: { done: true, at: '20 juin 2026', domain: 'immobiliervista.ca', authority: 28, keywords: 94, traffic: '2 250', top10: 6, href: 'Domain Overview.html' },
  },
};

const dlSlug = name => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
const DL_GENERIC = deal => ({
  contact: 'Contact à renseigner', role: null, email: null, phone: null,
  site: `${dlSlug(deal.company)}.ca`, createdAt: null, age: deal.days + 14, nextAt: 'à planifier',
  history: [{ ch: 'note', at: 'à la création', who: 'Automatisation', text: 'Aucun échange consigné pour l’instant.' }],
  docs: [], seo: { done: false },
});

const dlDetail = deal => DL_DETAIL[deal.id] || DL_GENERIC(deal);

/* Ce que « Marquer gagné » enclenche réellement — annoncé avant déclenchement. */
const DL_WON_EFFECTS = [
  ['Un client', 'créé dans le Client hub avec le forfait et le MRR du deal'],
  ['Un onboarding', 'lancé en 4 étapes, assigné au responsable du deal'],
  ['Un premier audit', 'planifié sur les trois dimensions dans les 48 h'],
  ['L’instantané du prospect', 'converti en premier audit historisé, et non plus purgeable'],
];

Object.assign(window, { dlSlug, DL_DORMANT, DL_SNAPSHOT_DAYS, DL_LOST_REASONS, DL_CHANNELS, DL_DETAIL, dlDetail, DL_WON_EFFECTS });
