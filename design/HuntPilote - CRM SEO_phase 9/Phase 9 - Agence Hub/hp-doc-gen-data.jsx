/* HuntPilote — Générateur de documents (9.4) : statuts, jeu de documents chaînés, calculs. */
const GEN_STATUTS = {
  brouillon: { label: 'Brouillon', tone: 'neutral' },
  envoye: { label: 'Envoyé', tone: 'blue' },
  accepte: { label: 'Accepté', tone: 'green' },
  refuse: { label: 'Refusé', tone: 'red' },
  expire: { label: 'Expiré', tone: 'yellow' },
  signe: { label: 'Signé', tone: 'green' },
  payee: { label: 'Payée', tone: 'green' },
  retard: { label: 'En retard', tone: 'red' },
  remplace: { label: 'Remplacé', tone: 'neutral' },
};

const genFmt = (n) => n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
const genTaxes = (sub) => ({ tps: sub * 0.05, tvq: sub * 0.09975, ttc: sub * (1 + 0.05 + 0.09975) });
const genSubtotal = (doc) => (doc.lignes || []).reduce((s, l) => s + l.qte * l.prix, 0);
const genMontantTTC = (doc) => genTaxes(genSubtotal(doc)).ttc;

const GEN_DOCUMENTS = [
  { id: 'PR-2026-004', kind: 'proposition', templateId: 'tpl-prop', clientName: 'SHGM', clientRaison: 'Société d\u2019histoire de la Grande Montée', contactName: 'Hélène Bouchard', contactTitre: 'Directrice générale', objet: 'Refonte du site web et mise en valeur numérique du patrimoine de la SHGM',
    lignes: [{ desc: 'Audit et stratégie initiale', qte: 1, prix: 900 }, { desc: 'Conception et développement du site (8 gabarits)', qte: 1, prix: 6400 }, { desc: 'Rédaction de contenu (8 pages)', qte: 8, prix: 120 }, { desc: 'Suivi SEO local, 3 mois inclus', qte: 3, prix: 160 }],
    statut: 'accepte', emis: '2 août 2026', expire: '1 septembre 2026', from: null, produced: ['CT-2026-007'],
    versions: [{ v: 1, at: '2 août 2026', who: 'Marie Chen', note: 'Version envoyée au client par courriel.' }],
    journal: [{ at: '2 août 2026', event: 'Brouillon créé', who: 'Marie Chen' }, { at: '2 août 2026', event: 'Envoyée au client', who: 'Marie Chen' }, { at: '19 août 2026', event: 'Ouverte par le client', who: 'Hélène Bouchard' }, { at: '25 août 2026', event: 'Acceptée', who: 'Hélène Bouchard' }] },

  { id: 'CT-2026-007', kind: 'contrat', templateId: 'tpl-ct', clientName: 'SHGM', clientRaison: 'Société d\u2019histoire de la Grande Montée', contactName: 'Hélène Bouchard', contactTitre: 'Directrice générale', objet: 'Refonte du site web et mise en valeur numérique du patrimoine de la SHGM',
    lignes: [{ desc: 'Contrat de services — voir Annexe A', qte: 1, prix: 8740 }],
    livrables: window.DOC_LIVRABLES, jalons: window.DOC_JALONS, exclusions: window.DOC_EXCLUSIONS, paiements: window.DOC_PAIEMENTS, attendus_client: window.DOC_ATTENDUS,
    statut: 'signe', emis: '28 août 2026', dateSignature: '1 septembre 2026', from: 'PR-2026-004', produced: ['FA-2026-0031', 'AN-2026-007'],
    versions: [{ v: 1, at: '28 août 2026', who: 'Marie Chen', note: 'Version envoyée pour signature.' }],
    journal: [{ at: '25 août 2026', event: 'Créé depuis la proposition PR-2026-004', who: 'Marie Chen' }, { at: '28 août 2026', event: 'Envoyé pour signature', who: 'Marie Chen' }, { at: '1 septembre 2026', event: 'Signé', who: 'Hélène Bouchard' }] },

  { id: 'AN-2026-007', kind: 'annexe', templateId: 'tpl-an', clientName: 'SHGM', clientRaison: 'Société d\u2019histoire de la Grande Montée', contactName: 'Hélène Bouchard', contactTitre: 'Directrice générale', objet: 'Livrables et échéancier — Refonte SHGM',
    lignes: [], livrables: window.DOC_LIVRABLES, jalons: window.DOC_JALONS,
    statut: 'signe', emis: '28 août 2026', dateSignature: '1 septembre 2026', from: 'CT-2026-007', produced: [],
    versions: [{ v: 1, at: '28 août 2026', who: 'Marie Chen', note: 'Jointe au contrat CT-2026-007.' }],
    journal: [{ at: '28 août 2026', event: 'Créée avec le contrat CT-2026-007', who: 'Marie Chen' }, { at: '1 septembre 2026', event: 'Signée avec le contrat', who: 'Hélène Bouchard' }] },

  { id: 'FA-2026-0031', kind: 'facture', templateId: 'tpl-fa', clientName: 'SHGM', clientRaison: 'Société d\u2019histoire de la Grande Montée', contactName: 'Hélène Bouchard', contactTitre: 'Directrice générale', objet: 'Facture d\u2019acompte — 50 % à la signature',
    lignes: [{ desc: 'Acompte 50 % — contrat CT-2026-007', qte: 1, prix: 4370 }],
    statut: 'payee', emis: '1 septembre 2026', echeance: '16 septembre 2026', delaiPaiementJours: 15, from: 'CT-2026-007', produced: [],
    versions: [{ v: 1, at: '1 septembre 2026', who: 'Marie Chen', note: 'Envoyée au client par courriel.' }],
    journal: [{ at: '1 septembre 2026', event: 'Créée depuis le contrat CT-2026-007', who: 'Marie Chen' }, { at: '1 septembre 2026', event: 'Envoyée au client', who: 'Marie Chen' }, { at: '4 septembre 2026', event: 'Payée', who: 'Hélène Bouchard' }] },

  { id: 'DV-2026-018', kind: 'devis', templateId: 'tpl-dv-std', clientName: 'Acme Corp.', contactName: 'Jonathan Roy', contactTitre: '', objet: 'Ajout d\u2019une section carrières',
    lignes: [{ desc: 'Conception et intégration de la section', qte: 1, prix: 1450 }, { desc: 'Rédaction de 3 fiches de poste type', qte: 3, prix: 90 }],
    statut: 'brouillon', emis: null, expire: null, from: null, produced: [], versions: [], journal: [{ at: '10 septembre 2026', event: 'Brouillon créé', who: 'Marie Chen' }] },

  { id: 'DV-2026-015', kind: 'devis', templateId: 'tpl-dv-simple', clientName: 'Boréal Immobilier', contactName: 'Simon Bélisle', contactTitre: 'Directeur marketing', objet: 'Refonte des fiches de propriétés',
    lignes: [{ desc: 'Gabarit de fiche propriété enrichi', qte: 1, prix: 1200 }, { desc: 'Migration de 40 fiches existantes', qte: 40, prix: 15 }],
    statut: 'envoye', emis: '28 août 2026', expire: '15 septembre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '28 août 2026', who: 'Marie Chen', note: 'Envoyé par courriel.' }],
    journal: [{ at: '28 août 2026', event: 'Envoyé au client', who: 'Marie Chen' }] },

  { id: 'DV-2026-013', kind: 'devis', templateId: 'tpl-dv-simple', clientName: 'Clinique Lavoie', contactName: 'Dre Anne Lavoie', contactTitre: 'Propriétaire', objet: 'Prise de rendez-vous en ligne',
    lignes: [{ desc: 'Intégration d\u2019un module de prise de rendez-vous', qte: 1, prix: 980 }],
    statut: 'envoye', emis: '30 août 2026', expire: '17 septembre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '22 août 2026', who: 'Marie Chen', note: 'Version initiale envoyée.' }, { v: 2, at: '30 août 2026', who: 'Marie Chen', note: 'Correction du nombre de rendez-vous simultanés pris en charge.' }],
    journal: [{ at: '22 août 2026', event: 'Envoyé au client (v1)', who: 'Marie Chen' }, { at: '30 août 2026', event: 'Corrigé — nouvelle version (v2)', who: 'Marie Chen' }] },

  { id: 'PR-2026-002', kind: 'proposition', templateId: 'tpl-prop', clientName: 'Quincaillerie Fortin', contactName: 'Denis Fortin', contactTitre: 'Propriétaire', objet: 'Présence Digitale — site vitrine et fiche locale',
    lignes: [{ desc: 'Forfait Présence Digitale', qte: 1, prix: 4500 }],
    statut: 'refuse', emis: '14 juillet 2026', expire: '13 août 2026', from: null, produced: [], motifRefus: 'Budget reporté au prochain exercice.',
    versions: [{ v: 1, at: '14 juillet 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '14 juillet 2026', event: 'Envoyée au client', who: 'Marie Chen' }, { at: '2 août 2026', event: 'Refusée', who: 'Denis Fortin' }] },

  { id: 'PR-2026-006', kind: 'proposition', templateId: 'tpl-prop', clientName: 'Spa Nordik Estrie', contactName: 'Camille Girard', contactTitre: 'Directrice générale', objet: 'Croissance Digitale — boutique en ligne et SEO local',
    lignes: [{ desc: 'Forfait Croissance Digitale', qte: 1, prix: 9000 }],
    statut: 'envoye', emis: '29 août 2026', expire: '28 septembre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '29 août 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '29 août 2026', event: 'Envoyée au client', who: 'Marie Chen' }] },

  { id: 'PR-2026-005', kind: 'proposition', templateId: 'tpl-prop', clientName: 'Toitures ABC', contactName: 'Marc-Olivier Tanguay', contactTitre: 'Propriétaire', objet: 'Présence Digitale — site vitrine',
    lignes: [{ desc: 'Forfait Présence Digitale', qte: 1, prix: 4500 }],
    statut: 'envoye', emis: '31 août 2026', expire: '30 septembre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '31 août 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '31 août 2026', event: 'Envoyée au client', who: 'Marie Chen' }] },

  { id: 'PR-2026-003', kind: 'proposition', templateId: 'tpl-prop', clientName: 'Coopérative BSL', contactName: 'Jean-Sébastien Ouellet-Tremblay', contactTitre: 'Directeur général adjoint aux partenariats et au développement', objet: 'Refonte du site web et stratégie de visibilité numérique',
    lignes: [{ desc: 'Forfait Croissance Digitale', qte: 1, prix: 9000 }],
    statut: 'envoye', emis: '1 septembre 2026', expire: '1 octobre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '1 septembre 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '1 septembre 2026', event: 'Envoyée au client', who: 'Marie Chen' }] },

  { id: 'PR-2026-008', kind: 'proposition', templateId: 'tpl-prop', clientName: 'Acme Corp.', contactName: 'Marie Tremblay', contactTitre: 'Directrice marketing', objet: 'Extension e-commerce et programme de fidélité',
    lignes: [{ desc: 'Module boutique en ligne additionnel', qte: 1, prix: 3200 }, { desc: 'Programme de fidélité et points de récompense', qte: 1, prix: 1600 }, { desc: 'Intégration à l’infolettre existante', qte: 1, prix: 450 }],
    statut: 'envoye', emis: '12 septembre 2026', expire: '12 octobre 2026', from: null, produced: [],
    versions: [{ v: 1, at: '12 septembre 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '12 septembre 2026', event: 'Envoyée au client', who: 'Marie Chen' }] },

  { id: 'FA-2026-0028', kind: 'facture', templateId: 'tpl-fa', clientName: 'Clinique Lavoie', contactName: 'Dre Anne Lavoie', contactTitre: 'Propriétaire', objet: 'Forfait Croissance SEO · Août 2026',
    lignes: [{ desc: 'Forfait Croissance SEO', qte: 1, prix: 700 }],
    statut: 'retard', emis: '1 août 2026', echeance: '31 août 2026', delaiPaiementJours: 30, from: null, produced: [],
    versions: [{ v: 1, at: '1 août 2026', who: 'Marie Chen', note: 'Envoyée par courriel.' }],
    journal: [{ at: '1 août 2026', event: 'Envoyée au client', who: 'Marie Chen' }] },
];

const genById = (id) => GEN_DOCUMENTS.find((d) => d.id === id);
const genBuildData = (doc, template) => {
  const sub = genSubtotal(doc); const { tps, tvq, ttc } = genTaxes(sub);
  return {
    agence: window.AG_PROFILE ? { nom: AG_PROFILE.nom, raison_sociale: AG_PROFILE.raisonSociale, adresse: `${AG_PROFILE.adresse}, ${AG_PROFILE.ville}, ${AG_PROFILE.province} ${AG_PROFILE.codePostal}`, telephone: AG_PROFILE.telephone, courriel: AG_PROFILE.courriel, site: AG_PROFILE.siteWeb, tps: AG_PROFILE.tps || '(non défini)', tvq: AG_PROFILE.tvq || '(non défini)', neq: AG_PROFILE.neq } : window.DOC_AGENCE,
    client: { nom: doc.clientName, raison_sociale: doc.clientRaison || doc.clientName, adresse: doc.clientAdresse || '', contact: { nom: doc.contactName, courriel: doc.contactCourriel || '', titre: doc.contactTitre || '' } },
    document: { reference: doc.id, date: doc.emis || 'Non émis', echeance: doc.expire || doc.echeance || '', objet: doc.objet, introduction: template ? template.introduction : '', mentions: template ? template.mentions : '', pied: template ? template.pied : '', paiement: template ? template.paiement : '' },
    lignes: (doc.lignes || []).map((l) => ({ description: l.desc, quantite: l.qte, prix: genFmt(l.prix), montant: genFmt(l.qte * l.prix) })),
    total: { ht: genFmt(sub), tps: genFmt(tps), tvq: genFmt(tvq), ttc: genFmt(ttc) },
    livrables: doc.livrables || [], jalons: doc.jalons || [], exclusions: doc.exclusions || [], paiements: doc.paiements || [], attendus_client: doc.attendus_client || [],
    signature: { agence: 'Marie Chen, Fondatrice & directrice', client: doc.contactName ? `${doc.contactName}${doc.contactTitre ? ', ' + doc.contactTitre : ''}` : '', date: doc.dateSignature || '___________________' },
  };
};

const genSummaries = (docs) => {
  const devisExpireBientot = docs.filter((d) => (d.kind === 'devis' || d.kind === 'proposition') && d.statut === 'envoye').length; // simplifié pour la démo : tout devis/proposition envoyé compte comme échéance surveillée
  const factureRetard = docs.find((d) => d.statut === 'retard');
  const sansReponse = docs.filter((d) => d.kind === 'proposition' && d.statut === 'envoye');
  return [
    { text: `2 devis expirent cette semaine`, tone: 'yellow', ids: ['DV-2026-015', 'DV-2026-013'] },
    factureRetard ? { text: `1 facture en retard de 12 jours`, tone: 'red', ids: [factureRetard.id] } : null,
    sansReponse.length ? { text: `${sansReponse.length} propositions sans réponse depuis plus de 10 jours`, tone: 'yellow', ids: sansReponse.map((d) => d.id) } : null,
  ].filter(Boolean);
};

Object.assign(window, { GEN_STATUTS, GEN_DOCUMENTS, genFmt, genTaxes, genSubtotal, genMontantTTC, genById, genBuildData, genSummaries });
