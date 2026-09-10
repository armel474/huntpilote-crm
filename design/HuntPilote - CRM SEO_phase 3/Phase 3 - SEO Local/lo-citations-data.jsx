/* HuntPilote — SEO local · Citations et annuaires : données de démonstration. */
const CITATION_STATE = { conforme: 'conforme', incoherent: 'incoherent', absent: 'absent', doublon: 'doublon', inaccessible: 'inaccessible' };
const CITATION_STATE_DEFS = {
  conforme: { label: 'Conforme', tone: 'green' }, incoherent: { label: 'Incohérent', tone: 'yellow' },
  absent: { label: 'Absent', tone: 'neutral' }, doublon: { label: 'Doublon', tone: 'red' }, inaccessible: { label: 'Annuaire inaccessible', tone: 'neutral' },
};
const AUTORITE_TIER = { haute: 3, moyenne: 2, faible: 1 };

const REFERENCE_BY_ETAB = {
  'acme-siege': { nom: 'Acme Corp.', adresse: '1450 rue Sherbrooke Ouest, Montréal (Québec) H3G 1K4', telephone: '514-555-0142', siteweb: 'acmecorp.ca' },
  'boreal-qc': { nom: 'Boréal Immobilier', adresse: '2255 boul. Laurier, Québec (Québec) G1V 2L1', telephone: '418-555-0177', siteweb: 'borealimmo.ca' },
  'lavoie-laval': { nom: 'Clinique Lavoie — Laval', adresse: '1600 boul. Le Corbusier, Laval (Québec) H7S 1Z9', telephone: '450-555-0133', siteweb: 'cliniquelavoie.com' },
  marchebio: { nom: 'Le Marché Bio', adresse: '80 rue Notre-Dame, Repentigny (Québec) J6A 2T3', telephone: '450-555-0161', siteweb: 'lemarchebio.ca' },
};

const CITATIONS_BY_ETAB = {
  'acme-siege': [
    { annuaire: 'Pages Jaunes', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Bing Places', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Apple Maps', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Facebook', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Yelp', autorite: 'haute', etat: 'incoherent', champs: [{ champ: 'Téléphone', publie: '514-555-0099', attendu: '514-555-0142' }] },
    { annuaire: 'BBB (Better Business Bureau)', autorite: 'haute', etat: 'absent' },
    { annuaire: 'HomeStars', autorite: 'moyenne', etat: 'conforme' },
    { annuaire: '411.ca', autorite: 'moyenne', etat: 'conforme' },
    { annuaire: 'Cylex Canada', autorite: 'moyenne', etat: 'conforme' },
    { annuaire: 'Canada411', autorite: 'moyenne', etat: 'incoherent', champs: [{ champ: 'Adresse', publie: '1200 rue Sherbrooke O, Montréal', attendu: '1450 rue Sherbrooke O, Montréal' }] },
    { annuaire: 'Yellowpages.ca', autorite: 'moyenne', etat: 'doublon', doublonNote: 'Deux fiches actives : l’ancienne (adresse précédente) reste indexée en plus de la fiche courante.' },
    { annuaire: 'Foursquare', autorite: 'moyenne', etat: 'absent' },
    { annuaire: 'RenoAssistance', autorite: 'moyenne', etat: 'absent' },
    { annuaire: 'Manta', autorite: 'moyenne', etat: 'absent' },
    { annuaire: 'Brownbook', autorite: 'faible', etat: 'conforme' },
    { annuaire: 'Hotfrog', autorite: 'faible', etat: 'incoherent', champs: [{ champ: 'Nom', publie: 'Acme Corp Toiture', attendu: 'Acme Corp.' }] },
    { annuaire: 'AnnuaireQuebec.ca', autorite: 'faible', etat: 'absent' },
    { annuaire: 'Kompass', autorite: 'faible', etat: 'absent' },
    { annuaire: 'EZlocal', autorite: 'faible', etat: 'absent' },
    { annuaire: 'LocalStack', autorite: 'faible', etat: 'inaccessible', inaccessibleNote: 'Délai d’attente dépassé lors du dernier relevé (7 sept. 2026). Nouvelle tentative au prochain audit.' },
  ],
  'boreal-qc': [
    { annuaire: 'Pages Jaunes', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Bing Places', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Apple Maps', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Facebook', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Centris', autorite: 'moyenne', etat: 'conforme' },
    { annuaire: '411.ca', autorite: 'moyenne', etat: 'conforme' },
    { annuaire: 'Cylex Canada', autorite: 'faible', etat: 'conforme' },
  ],
  'lavoie-laval': [
    { annuaire: 'Pages Jaunes', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'RAMQ — Répertoire des professionnels', autorite: 'haute', etat: 'conforme' },
  ],
  marchebio: [
    { annuaire: 'Pages Jaunes', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Bing Places', autorite: 'haute', etat: 'conforme' },
    { annuaire: 'Facebook', autorite: 'haute', etat: 'incoherent', champs: [{ champ: 'Horaires', publie: 'Fermé le dimanche', attendu: 'Ouvert 9 h – 17 h le dimanche' }] },
    { annuaire: '411.ca', autorite: 'moyenne', etat: 'absent' },
    { annuaire: 'Cylex Canada', autorite: 'faible', etat: 'conforme' },
  ],
};

Object.assign(window, { CITATION_STATE_DEFS, AUTORITE_TIER, REFERENCE_BY_ETAB, CITATIONS_BY_ETAB });
