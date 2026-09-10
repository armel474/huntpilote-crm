/* HuntPilote — Calendrier éditorial : planning de publication, quota du forfait, performances des articles. */
const ED_CLIENT = { name: 'Acme Corp.', plan: 'Croissance', quota: 4, quotaLabel: '4 articles par mois' };
const ED_MEASURE_DAYS = 30; // seuil : un article publié depuis moins de 30 jours n'a pas de performance interprétable
const ED_TODAY = '2026-09-09';

const ED_STATES = {
  idee: { label: 'Idée à cadrer', tone: 'neutral', short: 'Idée' },
  brief: { label: 'Brief en préparation', tone: 'neutral', short: 'Brief' },
  assigne: { label: 'Assigné', tone: 'blue', short: 'Assigné' },
  redaction: { label: 'En rédaction', tone: 'blue', short: 'Rédaction' },
  relecture: { label: 'En relecture', tone: 'yellow', short: 'Relecture' },
  publie: { label: 'Publié', tone: 'green', short: 'Publié' },
  mesure: { label: 'Publié et mesuré', tone: 'green', short: 'Mesuré' },
};
const ED_DONE = ['publie', 'mesure'];
const ED_WRITERS = { SL: 'Sophie Lanctôt', PB: 'Pierre Bélanger', MC: 'Marie Chen' };

const ED_CONTENT = [
  { id: 'A-118', title: 'Comment choisir un prestataire SEO au Québec', kw: 'agence seo québec', vol: 720, due: '2026-08-12', state: 'mesure', writer: 'SL',
    url: 'acmecorp.fr/blogue/choisir-prestataire-seo', pubAt: '12 août 2026', perf: { visits: 410, pos: 6, prevPos: null }, proof: 'PV-079' },
  { id: 'A-121', title: 'Audit technique : les 8 vérifications qui comptent', kw: 'audit technique site web', vol: 480, due: '2026-08-26', state: 'mesure', writer: 'PB',
    url: 'acmecorp.fr/blogue/audit-technique-verifications', pubAt: '26 août 2026', perf: { visits: 240, pos: 11, prevPos: 18 }, proof: 'PV-081' },
  { id: 'A-124', title: 'Longue traîne : trouver les requêtes que personne ne vise', kw: 'mots-clés longue traîne', vol: 1300, due: '2026-09-04', state: 'publie', writer: 'SL',
    url: 'acmecorp.fr/blogue/longue-traine-requetes', pubAt: '4 septembre 2026', perf: null, fromKw: true },
  { id: 'A-126', title: 'Core Web Vitals : ce que Google mesure vraiment', kw: 'core web vitals', vol: 890, due: '2026-09-11', state: 'relecture', writer: 'PB', fromKw: true },
  { id: 'A-127', title: 'Fiche Google : les champs qui changent tout en local', kw: 'fiche google entreprise', vol: 2100, due: '2026-09-18', state: 'redaction', writer: 'SL', fromKw: true },
  { id: 'A-129', title: 'Maillage interne : relier ses pages sans y passer la semaine', kw: 'maillage interne seo', vol: 560, due: '2026-09-25', state: 'assigne', writer: 'PB' },
  { id: 'A-131', title: 'Rédiger un titre qui se démarque dans Google', kw: 'balise title seo', vol: 1100, due: '2026-10-02', state: 'brief', writer: null, fromKw: true },
  { id: 'A-132', title: 'Migrer un site sans perdre son référencement', kw: 'migration site seo', vol: 640, due: '2026-10-09', state: 'idee', writer: null },
];

/* Article en retard : l'échéance est passée et le contenu n'est pas publié. */
const edLate = c => !ED_DONE.includes(c.state) && c.due < ED_TODAY;
const edMonth = c => c.due.slice(0, 7);

function edScenario(key) {
  const all = ED_CONTENT.map(c => ({ ...c }));
  if (key === 'vide') return { content: [], month: '2026-09' };
  if (key === 'complet') return {
    content: all.map(c => edMonth(c) === '2026-09' ? { ...c, state: 'publie', pubAt: c.pubAt || `${c.due.slice(8, 10)} ${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][Number(c.due.slice(5, 7)) - 1]} 2026`, url: c.url || `acmecorp.fr/blogue/${c.id.toLowerCase()}` } : c),
    month: '2026-09',
  };
  if (key === 'retard') return {
    content: all.map(c => c.id === 'A-126' ? { ...c, due: '2026-09-04' } : c.id === 'A-127' ? { ...c, due: '2026-09-08' } : c),
    month: '2026-09',
  };
  if (key === 'souscota') return { content: all.filter(c => edMonth(c) !== '2026-09' || ['A-124', 'A-126'].includes(c.id)), month: '2026-09' };
  if (key === 'nonmesure') return { content: all.map(c => ED_DONE.includes(c.state) ? { ...c, state: 'publie', perf: null } : c), month: '2026-09' };
  return { content: all, month: '2026-09' };
}

Object.assign(window, { ED_CLIENT, ED_MEASURE_DAYS, ED_TODAY, ED_STATES, ED_DONE, ED_WRITERS, ED_CONTENT, edLate, edMonth, edScenario });
