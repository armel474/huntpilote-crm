/* HuntPilote — Mon plan de travail : données (tâches tous clients, capacité de la semaine). */
const MP_ME = { name: 'Marie Chen', init: 'MC' };
const MP_TEAM = [{ name: 'Marie Chen', init: 'MC' }, { name: 'Jules Rivard', init: 'JR' }, { name: 'Sofia Nadeau', init: 'SN' }, { name: 'Léa Bouchard', init: 'LB' }];
const MP_CAPACITY = 32;
const MP_CLIENTS = { AC: 'Acme Corp.', BC: 'Bistro Le Chalet', TL: 'Toiture Lavoie', CD: 'Clinique DentAlex', GR: 'Groupe Immobilier Rousseau' };

const MP_TASKS = [
  { id: '#142', title: 'Différer le script de chat + convertir les images héros', client: 'AC', prio: { id: 'P-0418', sev: 'critique', label: 'LCP mobile à 4,2 s (p75) sur 6 pages' }, due: 'Aujourd’hui', bucket: 'aujourdhui', effort: 4, assignee: 'MC', status: 'encours' },
  { id: '#163', title: 'Répondre à 3 avis Google négatifs', client: 'BC', prio: { id: 'P-0552', sev: 'important', label: 'Note moyenne en baisse sur Google' }, due: 'Aujourd’hui', bucket: 'aujourdhui', effort: 1, assignee: 'MC', status: 'afaire' },
  { id: '#171', title: 'Publier le guide Core Web Vitals', client: 'AC', prio: null, due: 'Aujourd’hui', bucket: 'aujourdhui', effort: 2, assignee: 'MC', status: 'bloquee', blockedReason: 'En attente de relecture juridique du client' },
  { id: '#164', title: 'Publier la page Services — toiture commerciale', client: 'TL', prio: { id: 'P-0601', sev: 'opportunite', label: 'Aucune page pour la toiture commerciale' }, due: 'Vendredi 11 sept.', bucket: 'semaine', effort: 3, assignee: 'MC', status: 'afaire' },
  { id: '#165', title: 'Corriger 12 balises title dupliquées', client: 'CD', prio: { id: 'P-0577', sev: 'important', label: '12 balises title dupliquées' }, due: 'Vendredi 11 sept.', bucket: 'semaine', effort: 2, assignee: 'MC', status: 'afaire' },
  { id: '#166', title: 'Optimiser les images héros restantes (WebP)', client: 'AC', prio: { id: 'P-0418', sev: 'critique', label: 'LCP mobile à 4,2 s (p75) sur 6 pages' }, due: 'Vendredi 11 sept.', bucket: 'semaine', effort: 3, assignee: 'MC', status: 'bloquee', blockedReason: 'En attente d’accès FTP du client' },
  { id: '#167', title: 'Ajouter le maillage interne vers les pages quartiers', client: 'GR', prio: null, due: 'Dimanche 13 sept.', bucket: 'semaine', effort: 2, assignee: 'MC', status: 'afaire' },
  { id: '#168', title: 'Refaire les métadonnées OG pour le partage social', client: 'AC', prio: { id: 'P-0439', sev: 'opportunite', label: 'Métadonnées OG absentes' }, due: '22 sept.', bucket: 'plustard', effort: 1.5, assignee: 'MC', status: 'afaire' },
  { id: '#169', title: 'Migrer les redirections 301 après la refonte', client: 'BC', prio: { id: 'P-0560', sev: 'critique', label: '48 pages en 404 depuis la refonte' }, due: '30 sept.', bucket: 'plustard', effort: 5, assignee: 'MC', status: 'afaire' },
  { id: '#170', title: 'Corriger le certificat SSL expiré', client: 'TL', prio: { id: 'P-0611', sev: 'critique', label: 'Certificat SSL expiré depuis 4 jours' }, due: 'En retard depuis 4 jours', bucket: 'retard', overdueDays: 4, effort: 1, assignee: 'MC', status: 'retard' },
  { id: '#172', title: 'Restaurer l’indexation après blocage robots.txt', client: 'CD', prio: { id: 'P-0588', sev: 'critique', label: 'robots.txt bloque 80 % du site' }, due: 'En retard depuis 6 jours', bucket: 'retard', overdueDays: 6, effort: 2, assignee: 'MC', status: 'retard' },
  { id: '#173', title: 'Relancer le crawl après échec (429)', client: 'AC', prio: { id: 'P-0421', sev: 'important', label: 'Crawl interrompu après 128 pages' }, due: 'En retard depuis 2 jours', bucket: 'retard', overdueDays: 2, effort: 1, assignee: 'MC', status: 'retard' },
];
const MP_EXTRA_SURCHARGE = [
  { id: '#174', title: 'Refonte du maillage interne — 40 pages', client: 'GR', prio: { id: 'P-0630', sev: 'important', label: 'Maillage interne absent sur 40 pages' }, due: 'Vendredi 11 sept.', bucket: 'semaine', effort: 8, assignee: 'MC', status: 'afaire' },
  { id: '#175', title: 'Audit de contenu concurrentiel — 3 concurrents', client: 'BC', prio: null, due: 'Dimanche 13 sept.', bucket: 'semaine', effort: 6, assignee: 'MC', status: 'afaire' },
];

function mpScenario(key) {
  if (key === 'vide') return [];
  if (key === 'surcharge') return [...MP_TASKS, ...MP_EXTRA_SURCHARGE];
  if (key === 'retard') return MP_TASKS.filter(t => t.bucket === 'retard');
  if (key === 'bloquees') return MP_TASKS.filter(t => t.status === 'bloquee');
  return MP_TASKS;
}

Object.assign(window, { MP_ME, MP_TEAM, MP_CAPACITY, MP_CLIENTS, MP_TASKS, mpScenario });
