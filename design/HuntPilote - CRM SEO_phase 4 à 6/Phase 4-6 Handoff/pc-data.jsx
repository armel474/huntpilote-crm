/* HuntPilote — portail client : périodes publiées, établissements, échanges.
   Le corps du rapport vient de rp-data.jsx / rp-body.jsx : il n'est pas redessiné ici. */
const PC_ACCOUNT = { client: 'Acme Corp.', person: 'Marie Tremblay', role: 'Directrice marketing', initials: 'MT', pm: 'Marie Chen', pmEmail: 'marie@huntpilote.ca', since: 'avril 2026' };

/* Une période n'apparaît que si son rapport est publié. Le portail est figé à cette publication. */
const PC_MONTHS = [
  { id: 'sept', label: 'Septembre', period: 'Septembre 2026', publish: '2 octobre 2026', dataAt: '30 septembre 2026', prev: 'août', next: 'octobre', after: 'novembre', score: 92, prevScore: 87 },
  { id: 'aout', label: 'Août', period: 'Août 2026', publish: '2 septembre 2026', dataAt: '31 août 2026', prev: 'juillet', next: 'septembre', after: 'octobre', score: 87, prevScore: 81 },
  { id: 'juillet', label: 'Juillet', period: 'Juillet 2026', publish: '2 août 2026', dataAt: '31 juillet 2026', prev: 'juin', next: 'août', after: 'septembre', score: 81, prevScore: 74 },
  { id: 'juin', label: 'Juin', period: 'Juin 2026', publish: '2 juillet 2026', dataAt: '30 juin 2026', prev: null, next: 'juillet', after: 'août', score: 74, prevScore: null, first: true },
];

const PC_PLACES = [
  { id: 'all', label: 'Les deux établissements' },
  { id: 'mtl', label: 'Montréal — Plateau' },
  { id: 'lav', label: 'Laval — Centropolis' },
];

const PC_THREAD = [
  { from: 'pm', at: '3 octobre, 09 h 12', text: 'Bonjour Marie, le rapport de septembre est en ligne. La vitesse mobile est réglée — c’était le point qui vous coûtait le plus cher depuis le printemps. On attaque les liens brisés en octobre.' },
  { from: 'client', at: '3 octobre, 14 h 40', text: 'Merci ! Question : les deux nouveaux guides, on les relaie sur notre infolettre ?' },
  { from: 'pm', at: '3 octobre, 15 h 05', text: 'Oui, bonne idée — je vous prépare deux accroches d’ici vendredi.' },
];

/* Ce que le client verra quand il se connecte avant la première publication. */
const PC_ONBOARD_STEPS = [
  ['done', 'Contrat signé', 'Le 12 septembre. Bienvenue chez HuntPilote.'],
  ['done', 'Accès techniques connectés', 'Google Search Console et Analytics sont branchés depuis le 15 septembre.'],
  ['now', 'Premier audit en cours', 'Marie Chen analyse votre présence en ligne, votre référencement et votre design. Terminé d’ici le 28 septembre.'],
  ['todo', 'Votre premier rapport', 'Publié ici le 2 octobre. Vous recevrez un courriel — rien à surveiller d’ici là.'],
];

function pcScenario(key) {
  const base = { month: 'sept', months: PC_MONTHS, places: null, published: true, proofs: true };
  if (key === 'premier') return { ...base, month: 'juin', months: PC_MONTHS.filter(m => m.id === 'juin') };
  if (key === 'aucun') return { ...base, published: false, months: [] };
  if (key === 'sanspreuve') return { ...base, month: 'aout', proofs: false };
  if (key === 'multi') return { ...base, places: PC_PLACES };
  return base;
}

const pcMonth = id => PC_MONTHS.find(m => m.id === id) || PC_MONTHS[0];

Object.assign(window, { PC_ACCOUNT, PC_MONTHS, PC_PLACES, PC_THREAD, PC_ONBOARD_STEPS, pcScenario, pcMonth });
