/* HuntPilote — portail client : fil d'échanges. Même conversation que l'historique des communications du cockpit. */
const PE_SLA = 1; // délai de réponse inscrit au mandat : 1 jour ouvrable

/* Un message peut porter le contexte d'où il a été posé : une preuve, une priorité, un indicateur. */
const PE_CTX = {
  preuve: { label: 'Preuve de valeur', tone: 'green' },
  priorite: { label: 'Chantier en cours', tone: 'blue' },
  kpi: { label: 'Indicateur', tone: 'neutral' },
  rapport: { label: 'Rapport', tone: 'neutral' },
};

const PE_ANCHORS = [
  { id: 'a0', kind: null, label: 'Une question générale' },
  { id: 'a1', kind: 'rapport', label: 'Rapport de septembre 2026', from: 'Publié le 2 octobre 2026' },
  { id: 'a2', kind: 'preuve', label: 'Vos pages s’affichent deux fois plus vite sur mobile', from: 'Rapport de septembre 2026 · Ce qu’on a fait' },
  { id: 'a3', kind: 'preuve', label: 'Deux nouveaux guides en ligne sur votre blogue', from: 'Rapport de septembre 2026 · Ce qu’on a fait' },
  { id: 'a4', kind: 'priorite', label: 'Liens qui ne mènent nulle part', from: 'Rapport de septembre 2026 · Ce sur quoi on travaille' },
  { id: 'a5', kind: 'kpi', label: 'Visites depuis Google — 38 400', from: 'Rapport de septembre 2026 · Ce qui a bougé' },
  { id: 'a6', kind: 'kpi', label: 'Vitesse d’affichage mobile — 2,1 s', from: 'Rapport de septembre 2026 · Ce qui a bougé' },
];

const A = id => PE_ANCHORS.find(x => x.id === id);

const PE_THREAD = [
  { id: 'm1', from: 'pm', day: '2 octobre 2026', at: '08 h 04', read: true,
    text: 'Bonjour Marie, le rapport de septembre est en ligne. Le point le plus important : la vitesse d’affichage sur mobile est réglée, vos pages passent de 4,2 à 2,1 secondes. C’était ce qui vous coûtait le plus cher depuis le printemps. En octobre, on attaque les liens brisés.',
    ctx: 'a1', files: [{ name: 'Rapport-septembre-2026.pdf', size: '1,2 Mo' }] },
  { id: 'm2', from: 'client', day: '3 octobre 2026', at: '14 h 40', read: true,
    text: 'Merci ! Les deux nouveaux guides, on les relaie sur notre infolettre ? Et est-ce qu’il faut attendre quelque chose de votre côté avant de le faire ?',
    ctx: 'a3' },
  { id: 'm3', from: 'pm', day: '3 octobre 2026', at: '15 h 05', read: true,
    text: 'Oui, très bonne idée — un relais par infolettre amène des lectures tout de suite, et Google le remarque. Rien à attendre de notre côté : les deux pages sont en ligne et indexées. Je vous prépare deux accroches courtes d’ici vendredi.',
    ctx: 'a3' },
  { id: 'm4', from: 'client', day: '6 octobre 2026', at: '09 h 22', read: true,
    text: 'Une question sur un chiffre : les 38 400 visites, c’est uniquement Google ou tout le trafic du site ? Mon directeur me demande la comparaison avec nos campagnes payantes.',
    ctx: 'a5', files: [{ name: 'Chiffres-campagnes-Q3.xlsx', size: '84 Ko' }] },
  { id: 'm5', from: 'pm', day: '6 octobre 2026', at: '11 h 48', read: false,
    text: 'C’est uniquement ce qui vient des résultats de recherche Google, sans un sou de publicité. Vos campagnes payantes sont comptées à part — j’ai regardé votre fichier, je vous mets les deux côte à côte dans un tableau d’une page. Vous l’aurez demain matin.',
    ctx: 'a5', files: [{ name: 'Organique-vs-payant-septembre.pdf', size: '640 Ko' }] },
];

const PE_PENDING = [
  ...PE_THREAD.slice(0, 4).map(m => ({ ...m, read: true })),
  { id: 'm6', from: 'client', day: '9 octobre 2026', at: '08 h 15', read: true, sent: true,
    text: 'Autre point : est-ce qu’on peut prévoir un appel avant la fin du mois pour parler du budget de l’an prochain ?', ctx: 'a0' },
];

function peScenario(key) {
  if (key === 'aucun') return { thread: [], unread: 0 };
  if (key === 'attente') return { thread: PE_PENDING, unread: 0, waiting: true };
  if (key === 'nonlue') return { thread: PE_THREAD, unread: 1 };
  if (key === 'longue') return { thread: [...PE_THREAD, ...PE_PENDING.slice(4)].map(m => ({ ...m, read: true })), unread: 0, long: true };
  return { thread: PE_THREAD, unread: 1 };
}

Object.assign(window, { PE_SLA, PE_CTX, PE_ANCHORS, PE_THREAD, peScenario, peAnchor: A });
