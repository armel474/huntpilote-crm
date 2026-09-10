/* HuntPilote — portail client : historique des rapports publiés et trajectoire du score. */
const PR_TARGET = 85; // objectif de score inscrit au mandat : la courbe se lit contre ce seuil

/* Douze mois de score. Un rapport publié fige la période : rien ne se réécrit après coup. */
const PR_HISTORY = [
  { id: 'oct25', label: 'Octobre 2025', short: 'oct.', score: 54, published: false },
  { id: 'nov25', label: 'Novembre 2025', short: 'nov.', score: 58, published: true, publish: '2 décembre 2025', dataAt: '30 novembre 2025', v: 1, proofs: 2, first: true },
  { id: 'dec25', label: 'Décembre 2025', short: 'déc.', score: 61, published: true, publish: '2 janvier 2026', dataAt: '31 décembre 2025', v: 1, proofs: 3 },
  { id: 'jan26', label: 'Janvier 2026', short: 'janv.', score: 63, published: true, publish: '2 février 2026', dataAt: '31 janvier 2026', v: 1, proofs: 2 },
  { id: 'fev26', label: 'Février 2026', short: 'févr.', score: 66, published: true, publish: '2 mars 2026', dataAt: '28 février 2026', v: 1, proofs: 4 },
  { id: 'mar26', label: 'Mars 2026', short: 'mars', score: 64, published: true, publish: '2 avril 2026', dataAt: '31 mars 2026', v: 1, proofs: 1, down: true },
  { id: 'avr26', label: 'Avril 2026', short: 'avr.', score: 69, published: true, publish: '2 mai 2026', dataAt: '30 avril 2026', v: 1, proofs: 3 },
  { id: 'mai26', label: 'Mai 2026', short: 'mai', score: 72, published: true, publish: '2 juin 2026', dataAt: '31 mai 2026', v: 1, proofs: 3 },
  { id: 'juin26', label: 'Juin 2026', short: 'juin', score: 74, published: true, publish: '2 juillet 2026', dataAt: '30 juin 2026', v: 1, proofs: 2 },
  { id: 'juil26', label: 'Juillet 2026', short: 'juil.', score: 81, published: true, publish: '2 août 2026', dataAt: '31 juillet 2026', v: 1, proofs: 4 },
  { id: 'aout26', label: 'Août 2026', short: 'août', score: 87, published: true, publish: '2 septembre 2026', dataAt: '31 août 2026', v: 1, proofs: 0 },
  { id: 'sept26', label: 'Septembre 2026', short: 'sept.', score: 92, published: true, publish: '2 octobre 2026', dataAt: '30 septembre 2026', v: 2, proofs: 4,
    versions: [
      { v: 2, at: '3 octobre 2026, 09 h 41', note: 'Correction du chiffre de vitesse d’affichage (2,1 s au lieu de 2,2 s).', current: true },
      { v: 1, at: '2 octobre 2026, 08 h 00', note: 'Première publication.', current: false },
    ] },
];

function prScenario(key) {
  const pub = PR_HISTORY.filter(m => m.published);
  if (key === 'aucun') return { months: [], curve: [] };
  if (key === 'unseul') { const one = pub.slice(0, 1).map(m => ({ ...m, first: true })); return { months: one, curve: one }; }
  if (key === 'corrige') return { months: pub.slice(-4), curve: pub.slice(-4) };
  return { months: pub, curve: pub };
}

Object.assign(window, { PR_TARGET, PR_HISTORY, prScenario });
