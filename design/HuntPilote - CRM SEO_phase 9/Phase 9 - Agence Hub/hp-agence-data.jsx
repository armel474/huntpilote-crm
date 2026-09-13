/* HuntPilote — Agence hub : données partagées (profil, équipe, droits, cartes d'accueil). */
const AG_RIGHTS = [
  { id: 'gerer_agence', label: 'Gérer l\u2019agence' },
  { id: 'gerer_equipe', label: 'Gérer l\u2019équipe' },
  { id: 'gerer_clients', label: 'Créer et supprimer des clients' },
  { id: 'gerer_pipeline', label: 'Gérer le pipeline commercial' },
  { id: 'gerer_facturation_client', label: 'Créer et envoyer devis et factures' },
  { id: 'envoyer_documents', label: 'Envoyer des documents (propositions, devis, contrats)' },
  { id: 'facturer', label: 'Créer et envoyer des factures' },
  { id: 'gerer_catalogue', label: 'Gérer le catalogue et les offres' },
  { id: 'publier_rapports', label: 'Publier les rapports clients' },
  { id: 'gerer_integrations', label: 'Gérer les intégrations' },
  { id: 'gerer_automatisation', label: 'Créer et modifier les automatisations' },
  { id: 'voir_finances', label: 'Voir la consommation et l\u2019abonnement' },
  { id: 'exporter_donnees', label: 'Exporter les données clients' },
];

const AG_ROLE_DEFAULTS = {
  'Administratrice': AG_RIGHTS.reduce((a, r) => { a[r.id] = true; return a; }, {}),
  'Chef de projet': { gerer_clients: true, gerer_pipeline: true, gerer_facturation_client: true, envoyer_documents: true, facturer: true, publier_rapports: true, gerer_automatisation: true, voir_finances: true },
  'Spécialiste SEO': { publier_rapports: true, gerer_automatisation: true },
  'Rédactrice': { publier_rapports: true },
  'Rédacteur': { publier_rapports: true },
};
const agRoleDefault = (role, rightId) => !!(AG_ROLE_DEFAULTS[role] && AG_ROLE_DEFAULTS[role][rightId]);
const agEffectiveRight = (member, rightId) => (member.overrides && rightId in member.overrides) ? member.overrides[rightId] : agRoleDefault(member.role, rightId);

const AG_TEAM = [
  { id: 'm1', name: 'Marie Chen', email: 'marie@huntpilote.ca', phone: '(514) 555-0111', role: 'Administratrice', poste: 'Fondatrice & directrice', dateArrivee: '2019-03-01', taux: 145, actif: true, you: true, photo: null, initials: 'MC', color: 'var(--green)', overrides: {} },
  { id: 'm2', name: 'Julien Dubois', email: 'julien@huntpilote.ca', phone: '(514) 555-0122', role: 'Chef de projet', poste: 'Chef de projet senior', dateArrivee: '2021-06-14', taux: 95, actif: true, photo: null, initials: 'JD', color: 'var(--blue)', overrides: { gerer_integrations: true } },
  { id: 'm3', name: 'Aïcha Lemaire', email: 'aicha@huntpilote.ca', phone: '(514) 555-0133', role: 'Spécialiste SEO', poste: 'Spécialiste SEO senior', dateArrivee: '2022-01-10', taux: 78, actif: true, photo: null, initials: 'AL', color: 'var(--violet)', overrides: { gerer_catalogue: true } },
  { id: 'm4', name: 'Tom Bélanger', email: 'tom@huntpilote.ca', phone: '(514) 555-0144', role: 'Rédacteur', poste: 'Rédacteur web', dateArrivee: '2023-09-05', taux: 48, actif: true, photo: null, initials: 'TB', color: 'var(--yellow-fg)', overrides: { publier_rapports: false } },
  { id: 'm5', name: 'Nadia Rousseau', email: 'nadia@huntpilote.ca', phone: '', role: 'Rédactrice', poste: 'Rédactrice', dateArrivee: '2026-09-10', taux: 50, actif: true, photo: null, initials: 'NR', color: 'var(--yellow-fg)', overrides: {}, firstLogin: true },
  { id: 'm6', name: 'Sophie Marceau', email: 'sophie@huntpilote.ca', phone: '(514) 555-0166', role: 'Spécialiste SEO', poste: 'Spécialiste SEO', dateArrivee: '2020-11-02', taux: 80, actif: false, photo: null, initials: 'SM', color: 'var(--fg4)', overrides: {} },
  { id: 'm7', name: 'Marc-André Roy', email: 'marcandre@huntpilote.ca', phone: '', role: 'Chef de projet', poste: 'Chef de projet', dateArrivee: '2026-09-11', taux: 90, actif: true, photo: null, initials: 'MR', color: 'var(--blue)', overrides: {}, invited: true },
];

const AG_PROFILE = { nom: 'HuntPilote', raisonSociale: 'HuntPilote inc.', siteWeb: 'huntpilote.ca', courriel: 'bonjour@huntpilote.ca', telephone: '(514) 555-0100', adresse: '1200 av. McGill College', ville: 'Montréal', province: 'QC', codePostal: 'H3B 4G7', tps: '', tvq: '', neq: '1148236704', paiement: 'Virement Interac à paiements@huntpilote.ca, ou carte via le lien Stripe joint à la facture.', logo: null };
const agProfileMissing = (p) => { const m = []; if (!p.tps) m.push('TPS'); if (!p.tvq) m.push('TVQ'); return m; };

const AG_HUB_CARDS = [
  { id: 'profil', label: 'Profil' },
  { id: 'equipe', label: 'Équipe' },
  { id: 'catalogue', label: 'Catalogue', text: '39 articles · 12 sans prix unitaire', state: 'warn' },
  { id: 'offres', label: 'Offres', text: '6 offres · 1 pack avec tarif d\u2019entrée dégressif', state: 'neutral' },
  { id: 'modeles', label: 'Modèles de documents', text: '5 sortes couvertes · aucun modèle d\u2019avenant', state: 'warn' },
  { id: 'documents', label: 'Documents', text: '2 devis en attente · 1 facture en retard', state: 'critical' },
];

Object.assign(window, { AG_RIGHTS, AG_ROLE_DEFAULTS, agRoleDefault, agEffectiveRight, AG_TEAM, AG_PROFILE, agProfileMissing, AG_HUB_CARDS });
