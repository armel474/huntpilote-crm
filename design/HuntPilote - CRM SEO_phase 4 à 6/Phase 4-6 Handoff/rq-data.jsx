/* HuntPilote — Rapports à produire : état du cycle mensuel sur tout le portefeuille.
   Vocabulaire d'état strictement identique à l'éditeur de rapport (session 1.3). */

const RQ_STATES = {
  apreparer: { label: 'À préparer', tone: 'neutral', hint: 'La période est close, rien n’est commencé' },
  brouillon: { label: 'Brouillon', tone: 'blue', hint: 'Un brouillon est ouvert' },
  bloque: { label: 'Bloqué par une relecture', tone: 'yellow', hint: 'Des libellés client attendent une relecture' },
  pret: { label: 'Prêt à publier', tone: 'green', hint: 'Tous les libellés client sont relus' },
  publie: { label: 'Publié', tone: 'green', hint: 'Envoyé au client' },
  corrige: { label: 'Publié puis corrigé (v2)', tone: 'blue', hint: 'Une correction a été publiée après l’envoi' },
  sanspreuve: { label: 'Période sans aucune preuve', tone: 'yellow', hint: 'Aucune tâche clôturée sur la période' },
};
const RQ_SENT = ['publie', 'corrige'];
const RQ_PROOF_MIN = 1; // seuil : un rapport sans preuve de valeur ne montre que des chiffres

const RQ_BASE = [
  { id: 'AC', client: 'Acme Corp.', pm: 'MC', plan: 'Croissance', state: 'publie', due: 2, sentOn: '2 septembre', version: 'v1', proofs: 4 },
  { id: 'BC', client: 'Bistro Le Chalet', pm: 'MC', plan: 'Croissance', state: 'bloque', due: 2, proofs: 3, blockers: [{ label: 'Note Google en baisse : 4,1 vs 4,6 il y a 6 mois', who: 'Julie Bergeron' }, { label: 'Fiche Google Maps incomplète (horaires, photos)', who: 'Julie Bergeron' }] },
  { id: 'CM', client: 'Clinique vétérinaire Mercier', pm: 'JB', plan: 'Essentiel', state: 'brouillon', due: 2, proofs: 1 },
  { id: 'TL', client: 'Toiture Lavoie', pm: 'MT', plan: 'Croissance', state: 'bloque', due: 10, proofs: 1, blockers: [{ label: '48 pages en 404 depuis la refonte de mai', who: 'Marc Tremblay' }] },
  { id: 'CD', client: 'Clinique DentAlex', pm: 'MC', plan: 'Croissance', state: 'brouillon', due: 10, proofs: 2 },
  { id: 'GR', client: 'Groupe Immobilier Rousseau', pm: 'MT', plan: 'Sur mesure', state: 'pret', due: 10, proofs: 5 },
  { id: 'PS', client: 'Physio Saint-Roch', pm: 'JB', plan: 'Essentiel', state: 'sanspreuve', due: 10, proofs: 0 },
  { id: 'EL', client: 'École de langues Verdun', pm: 'MT', plan: 'Essentiel', state: 'apreparer', due: 12, proofs: 2 },
  { id: 'DL', client: 'Dépanneur Lachine', pm: 'JB', plan: 'Essentiel', state: 'publie', due: 2, sentOn: '2 septembre', version: 'v1', proofs: 2 },
  { id: 'GP', client: 'Garage Pelletier', pm: 'MT', plan: 'Croissance', state: 'corrige', due: 2, sentOn: '2 septembre', version: 'v2', proofs: 3 },
  { id: 'NF', client: 'Notaire Fontaine', pm: 'MC', plan: 'Essentiel', state: 'publie', due: 2, sentOn: '2 septembre', version: 'v1', proofs: 1 },
];

const RQ_CYCLE_AOUT = { period: 'Août 2026', closedOn: '31 août', defaultDue: 'le 2 de chaque mois', today: 9, todayLabel: '9 septembre 2026', targetDay: 5, targetLabel: '5 septembre' };
const RQ_CYCLE_SEPT = { period: 'Septembre 2026', closedOn: '30 septembre', defaultDue: 'le 2 de chaque mois', today: 1, todayLabel: '1er octobre 2026', targetDay: 5, targetLabel: '5 octobre' };

/* En retard = la date d'envoi promise est passée et le rapport n'est pas parti.
   Ce n'est pas un état de l'éditeur : c'est un dépassement de la date promise, signalé par-dessus l'état. */
const rqLate = (r, cycle) => !RQ_SENT.includes(r.state) && r.due < cycle.today;

function rqScenario(key) {
  let cycle = { ...RQ_CYCLE_AOUT }, rows = RQ_BASE.map(r => ({ ...r }));
  if (key === 'debut') {
    cycle = { ...RQ_CYCLE_SEPT };
    rows = rows.map(r => ({ ...r, state: 'apreparer', due: r.due < 5 ? 2 : r.due, sentOn: null, version: null, blockers: null, proofs: Math.max(r.proofs, 1) }));
  }
  if (key === 'pic') {
    cycle = { ...RQ_CYCLE_SEPT };
    const plan = { AC: 'pret', BC: 'bloque', CM: 'brouillon', TL: 'bloque', CD: 'brouillon', GR: 'pret', PS: 'bloque', EL: 'brouillon', DL: 'apreparer', GP: 'brouillon', NF: 'apreparer' };
    rows = rows.map(r => ({ ...r, state: plan[r.id], due: 2, sentOn: null, version: null,
      blockers: plan[r.id] === 'bloque' ? (r.blockers || [{ label: 'Synthèse du mois non relue', who: 'Marc Tremblay' }]) : null }));
  }
  if (key === 'sanspreuve') {
    const zero = ['PS', 'CM', 'NF', 'EL'];
    rows = rows.map(r => zero.includes(r.id) ? { ...r, proofs: 0, state: RQ_SENT.includes(r.state) ? r.state : 'sanspreuve', blockers: null } : r);
  }
  if (key === 'retard') {
    rows = rows.map(r => RQ_SENT.includes(r.state) ? r : { ...r, due: 2 });
  }
  return { cycle, rows };
}

function rqGroup(r, cycle) {
  if (rqLate(r, cycle) || r.state === 'bloque') return 'debloquer';
  if (RQ_SENT.includes(r.state)) return 'partis';
  return 'preparation';
}

const RQ_GROUPS = [
  ['debloquer', 'À débloquer', 'Les rapports en retard et bloqués par une relecture passent devant : c’est là que le cycle se grippe.'],
  ['preparation', 'En préparation', 'Dans les délais promis.'],
  ['partis', 'Partis', 'Publiés et lisibles par le client.'],
];

Object.assign(window, { RQ_STATES, RQ_SENT, RQ_PROOF_MIN, RQ_BASE, RQ_GROUPS, rqLate, rqScenario, rqGroup });
