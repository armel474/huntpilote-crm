/* HuntPilote — Agenda : les quatre natures d'événements que l'application produit. Aucun événement générique. */
const AG_CLIENTS = { AC: 'Acme Corp.', BC: 'Bistro Le Chalet', TL: 'Toiture Lavoie', CD: 'Clinique DentAlex', GR: 'Groupe Immobilier Rousseau' };
const AG_TODAY = '2026-09-09';
const AG_DAY_MAX = 4; // seuil : au-delà de 4 échéances sur une même journée, la journée est signalée chargée

const AG_TYPES = {
  echeance: { label: 'Échéance de tâche', short: 'Échéance', tone: 'blue', link: 'Tache Detail.html', linkLabel: 'Ouvrir la tâche', movable: true },
  rapport: { label: 'Envoi de rapport programmé', short: 'Envoi de rapport', tone: 'yellow', link: 'Editeur Rapport.html', linkLabel: 'Ouvrir le rapport' },
  rdv: { label: 'Rendez-vous client', short: 'Rendez-vous', tone: 'green', link: 'Fiche Client v4.html', linkLabel: 'Ouvrir la fiche client' },
  exec: { label: 'Exécution planifiée', short: 'Exécution', tone: 'neutral', link: 'Site Audit.html', linkLabel: 'Ouvrir l’exécution' },
};

const AG_EVENTS = [
  /* semaine du 7 au 13 septembre — la semaine de travail */
  { id: 'E1', type: 'exec', date: '2026-09-07', title: 'Relevé de positions hebdomadaire', ref: '5 clients', link: 'Position Tracking.html' },
  { id: 'E2', type: 'echeance', date: '2026-09-07', title: 'Corriger les 23 liens brisés', client: 'AC', ref: 'tâche #142', done: true },
  { id: 'E3', type: 'echeance', date: '2026-09-08', title: 'Renouveler le certificat SSL expiré', client: 'TL', ref: 'tâche #171' },
  { id: 'E4', type: 'echeance', date: '2026-09-08', title: 'Débloquer robots.txt à l’indexation', client: 'CD', ref: 'tâche #169', done: true },
  { id: 'E5', type: 'rdv', date: '2026-09-09', time: '10:00', dur: 60, title: 'Point mensuel — Acme Corp.', client: 'AC' },
  { id: 'E6', type: 'rdv', date: '2026-09-09', time: '14:00', dur: 45, title: 'Présentation d’audit — Toiture Lavoie', client: 'TL' },
  { id: 'E7', type: 'echeance', date: '2026-09-09', title: 'Relire les 2 libellés du rapport d’août', client: 'BC', ref: 'tâche #174', link: 'Editeur Rapport.html' },
  { id: 'E8', type: 'echeance', date: '2026-09-10', title: 'Rendre les 23 pages orphelines accessibles', client: 'AC', ref: 'tâche #143' },
  { id: 'E9', type: 'exec', date: '2026-09-10', title: 'Audit trimestriel — Clinique DentAlex', client: 'CD', link: 'Audit Detail.html' },
  { id: 'E10', type: 'rapport', date: '2026-09-10', title: 'Rapport d’août — Bistro Le Chalet', client: 'BC' },
  { id: 'E11', type: 'echeance', date: '2026-09-11', title: 'Publier le troisième guide longue traîne', client: 'GR', ref: 'tâche #158' },
  { id: 'E12', type: 'rapport', date: '2026-09-11', title: 'Rapport d’août — Groupe Rousseau', client: 'GR' },
  { id: 'E13', type: 'rdv', date: '2026-09-11', time: '09:30', dur: 30, title: 'Appel de cadrage — Clinique DentAlex', client: 'CD' },
  /* reste du mois */
  { id: 'E20', type: 'rapport', date: '2026-09-02', title: 'Rapports d’août — 9 clients', ref: 'envoi groupé' },
  { id: 'E21', type: 'echeance', date: '2026-09-03', title: 'Corriger les 12 balises title dupliquées', client: 'CD', ref: 'tâche #165', done: true },
  { id: 'E22', type: 'rdv', date: '2026-09-04', time: '11:00', dur: 60, title: 'Point mensuel — Bistro Le Chalet', client: 'BC' },
  { id: 'E23', type: 'echeance', date: '2026-09-15', title: 'Mettre en ligne les redirections', client: 'AC', ref: 'tâche #142' },
  { id: 'E24', type: 'exec', date: '2026-09-15', title: 'Relevé de positions hebdomadaire', ref: '5 clients', link: 'Position Tracking.html' },
  { id: 'E25', type: 'rdv', date: '2026-09-16', time: '14:00', dur: 60, title: 'Point mensuel — Groupe Rousseau', client: 'GR' },
  { id: 'E26', type: 'echeance', date: '2026-09-17', title: 'Réécrire les métadonnées de 18 pages', client: 'BC', ref: 'tâche #177' },
  { id: 'E27', type: 'echeance', date: '2026-09-18', title: 'Corriger le formulaire de contact mobile', client: 'GR', ref: 'tâche #181' },
  { id: 'E28', type: 'exec', date: '2026-09-22', title: 'Relevé de positions hebdomadaire', ref: '5 clients', link: 'Position Tracking.html' },
  { id: 'E29', type: 'rdv', date: '2026-09-23', time: '10:00', dur: 45, title: 'Présentation d’audit — Clinique DentAlex', client: 'CD' },
  { id: 'E30', type: 'echeance', date: '2026-09-24', title: 'Livrer la refonte des pages quartiers', client: 'GR', ref: 'tâche #186' },
  { id: 'E31', type: 'echeance', date: '2026-09-29', title: 'Clôturer les preuves de valeur de septembre', ref: 'tâche #190' },
  { id: 'E32', type: 'exec', date: '2026-09-29', title: 'Relevé de positions hebdomadaire', ref: '5 clients', link: 'Position Tracking.html' },
  { id: 'E33', type: 'rapport', date: '2026-10-02', title: 'Rapports de septembre — 11 clients', ref: 'envoi groupé' },
  { id: 'E34', type: 'echeance', date: '2026-08-31', title: 'Clôturer les preuves de valeur d’août', ref: 'tâche #140', done: true },
];

/* Semaine chargée : le jeudi 10 passe à 5 échéances, au-delà du seuil. */
const AG_EXTRA = [
  { id: 'X1', type: 'echeance', date: '2026-09-10', title: 'Fusionner les 4 pages qui se font concurrence', client: 'AC', ref: 'tâche #145' },
  { id: 'X2', type: 'echeance', date: '2026-09-10', title: 'Corriger la note Google de la fiche', client: 'BC', ref: 'tâche #172' },
  { id: 'X3', type: 'echeance', date: '2026-09-10', title: 'Reprendre le maillage des pages quartiers', client: 'GR', ref: 'tâche #180' },
  { id: 'X4', type: 'echeance', date: '2026-09-10', title: 'Rétablir le responsive tablette', client: 'TL', ref: 'tâche #176' },
  { id: 'X5', type: 'echeance', date: '2026-09-09', title: 'Inscrire Toiture Lavoie aux répertoires locaux', client: 'TL', ref: 'tâche #183' },
  { id: 'X6', type: 'echeance', date: '2026-09-09', title: 'Corriger le contraste des boutons d’action', client: 'AC', ref: 'tâche #148' },
  { id: 'X7', type: 'rdv', date: '2026-09-09', time: '16:00', dur: 45, title: 'Appel de suivi — Groupe Rousseau', client: 'GR' },
];

const AG_CREUSE_OUT = ['E5', 'E6', 'E7', 'E8', 'E9', 'E10'];

function agScenario(key) {
  let evs = AG_EVENTS.map(e => ({ ...e }));
  if (key === 'conflit') evs = evs.map(e => e.id === 'E6' ? { ...e, time: '10:30' } : e);
  if (key === 'depassee') evs = evs.map(e => (e.id === 'E2' || e.id === 'E4') ? { ...e, done: false } : e);
  if (key === 'chargee') evs = evs.concat(AG_EXTRA.map(e => ({ ...e })));
  if (key === 'creuse') evs = evs.filter(e => !AG_CREUSE_OUT.includes(e.id));
  return evs;
}

Object.assign(window, { AG_CLIENTS, AG_TODAY, AG_DAY_MAX, AG_TYPES, AG_EVENTS, agScenario });
