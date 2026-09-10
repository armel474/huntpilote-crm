/* HuntPilote — Notifications : ce que les automatisations et l'agent produisent. Partagé par tous les écrans. */
const HN_KINDS = {
  integration: { label: 'Intégration', tone: 'red', crit: true, source: 'Automatisation' },
  position: { label: 'Position', tone: 'red', source: 'Relevé de positions' },
  sante: { label: 'Score de santé', tone: 'red', crit: true, source: 'Audit automatique' },
  facture: { label: 'Facturation', tone: 'red', source: 'Facturation' },
  liens: { label: 'Liens brisés', tone: 'yellow', source: 'Audit automatique' },
  avis: { label: 'Avis', tone: 'yellow', source: 'Veille des avis' },
  rapport: { label: 'Rapport', tone: 'green', source: 'Cycle mensuel' },
  deal: { label: 'Pipeline', tone: 'green', source: 'Pipeline' },
  agent: { label: 'Agent', tone: 'violet', source: 'Agent HuntPilote' },
};
const HN_DAYS = [[0, 'Aujourd’hui'], [1, 'Hier'], [2, 'Lundi 7 septembre'], [5, 'Plus tôt cette semaine']];
const HN_UNREAD_MAX = 20; // seuil : au-delà, la pastille affiche « 20+ »

const HN_ALL = [
  { id: 'N1', kind: 'integration', day: 0, at: '08 h 12', unread: true, title: 'Jeton Google Search Console expiré — Toiture Lavoie', body: 'Aucune donnée de position ni d’indexation ne remonte depuis 3 jours. Le relevé hebdomadaire de ce client est vide.', cta: 'Reconnecter l’intégration', href: 'Parametres.html' },
  { id: 'N2', kind: 'sante', day: 0, at: '08 h 05', unread: true, title: 'Score de santé de Toiture Lavoie passé à 61', body: 'Sous le seuil d’alerte de 70 fixé pour le forfait Croissance. Deux priorités critiques sont ouvertes sur ce compte.', cta: 'Ouvrir la fiche client', href: 'Fiche Client v4.html' },
  { id: 'N3', kind: 'position', day: 0, at: '07 h 58', unread: true, title: '« couvreur rive-nord prix » chute de la 12ᵉ à la 22ᵉ place', body: 'Perte de 10 places en une semaine sur un mot-clé à 260 recherches par mois. Un concurrent a publié une page dédiée.', cta: 'Ouvrir le suivi de positions', href: 'Position Tracking.html' },
  { id: 'N4', kind: 'avis', day: 0, at: '07 h 41', unread: true, title: 'Nouvel avis 1 ★ sur la fiche de Bistro Le Chalet', body: '« Service très lent, deux plats manquants. » La note moyenne passe de 4,2 à 4,1 — sous le seuil de 4,2 convenu au mandat.', cta: 'Répondre à l’avis', href: 'Avis.html' },
  { id: 'N5', kind: 'facture', day: 0, at: '06 h 30', unread: true, title: 'Facture 2026-0431 en retard de 12 jours', body: '1 850 $ dus par Toiture Lavoie. Deux relances automatiques déjà envoyées, sans réponse.', cta: 'Ouvrir le dossier de facturation', href: 'Client Hub.html' },
  { id: 'N6', kind: 'rapport', day: 0, at: '06 h 00', unread: false, title: 'Rapport de septembre généré pour Acme Corp.', body: 'La synthèse est rédigée et 4 preuves de valeur sont retenues. Rien n’est visible du client avant publication.', cta: 'Ouvrir l’éditeur', href: 'Editeur Rapport.html' },

  { id: 'N7', kind: 'liens', day: 1, at: '19 h 22', unread: true, title: '23 liens brisés découverts sur Acme Corp.', body: 'Détectés par l’audit automatique du soir. Une priorité a été créée et rattachée à la dimension SEO.', cta: 'Ouvrir la priorité', href: 'Priorite Detail.html' },
  { id: 'N8', kind: 'deal', day: 1, at: '16 h 04', unread: false, title: 'Deal gagné — Boulangerie Trois-Rivières', body: '14 400 $ par an, forfait Croissance. L’intégration en 4 étapes est prête à démarrer.', cta: 'Lancer l’intégration', href: 'Onboarding.html' },
  { id: 'N9', kind: 'agent', day: 1, at: '14 h 47', unread: false, title: 'L’agent propose 3 preuves de valeur pour Clinique DentAlex', body: 'Trois tâches clôturées ce mois-ci n’avaient pas de preuve rédigée. Les brouillons sont prêts à relire.', cta: 'Relire les preuves proposées', href: 'Editeur Rapport.html' },
  { id: 'N10', kind: 'rapport', day: 1, at: '09 h 15', unread: false, title: 'Rapport d’août envoyé à Garage Pelletier', body: 'Version 2 en ligne après correction du chiffre de vitesse. Le lien client affiche désormais la v2.', cta: 'Voir la page du client', href: 'Rapport Client.html' },

  { id: 'N11', kind: 'position', day: 2, at: '08 h 03', unread: false, title: '« dentiste laval urgence » gagne 2 places — 3ᵉ position', body: 'Clinique DentAlex entre dans le top 3 sur un mot-clé à 2 100 recherches par mois.', cta: 'Ouvrir le suivi de positions', href: 'Position Tracking.html' },
  { id: 'N12', kind: 'avis', day: 2, at: '11 h 28', unread: false, title: '4 nouveaux avis sur la fiche de Clinique DentAlex', body: 'Moyenne 4,8 ★ sur 96 avis. Aucun avis négatif à traiter.', cta: 'Voir les avis', href: 'Avis.html' },
  { id: 'N13', kind: 'liens', day: 5, at: '21 h 10', unread: false, title: '4 pages en 404 découvertes sur Groupe Rousseau', body: 'Rattachées à la priorité existante sur le maillage des pages quartiers.', cta: 'Ouvrir la priorité', href: 'Priorite Detail.html' },

  /* Objet supprimé : la notification survit à son objet, elle ne mène plus nulle part. */
  { id: 'N14', kind: 'rapport', day: 1, at: '10 h 02', unread: false, title: 'Rapport de juillet supprimé — Dépanneur Lachine', body: 'Le brouillon a été supprimé par Julie Bergeron avant publication.', gone: true, goneNote: 'L’objet de cette notification n’existe plus : le brouillon a été supprimé.' },
];

/* Afflux : un audit de portefeuille produit une salve de notifications d'un coup. */
const HN_AFFLUX = [
  { id: 'X1', kind: 'liens', day: 0, at: '05 h 12', unread: true, title: '48 pages en 404 découvertes sur Bistro Le Chalet', body: 'Audit de portefeuille terminé à 5 h 12. Une priorité critique a été créée.', cta: 'Ouvrir la priorité', href: 'Priorite Detail.html' },
  { id: 'X2', kind: 'sante', day: 0, at: '05 h 12', unread: true, title: 'Score de santé de Dépanneur Lachine passé à 58', body: 'Sous le seuil d’alerte de 70. Aucune priorité n’est encore assignée sur ce compte.', cta: 'Ouvrir la fiche client', href: 'Fiche Client v4.html' },
  { id: 'X3', kind: 'liens', day: 0, at: '05 h 11', unread: true, title: '12 balises title dupliquées sur Physio Saint-Roch', body: 'Priorité importante créée sur la dimension SEO.', cta: 'Ouvrir la priorité', href: 'Priorite Detail.html' },
  { id: 'X4', kind: 'position', day: 0, at: '05 h 10', unread: true, title: '9 mots-clés perdent plus de 5 places — Groupe Rousseau', body: 'Chute simultanée après la migration du site. À rapprocher de la priorité de désindexation.', cta: 'Ouvrir le suivi de positions', href: 'Position Tracking.html' },
  { id: 'X5', kind: 'integration', day: 0, at: '05 h 09', unread: true, title: 'Jeton Google Analytics expiré — Garage Pelletier', body: 'Le rapport du mois ne pourra pas remonter le trafic organique sans reconnexion.', cta: 'Reconnecter l’intégration', href: 'Parametres.html' },
  { id: 'X6', kind: 'avis', day: 0, at: '05 h 08', unread: true, title: '2 nouveaux avis 2 ★ sur la fiche de Toiture Lavoie', body: 'La note moyenne passe de 4,4 à 4,3 — au-dessus du seuil de 4,2, mais la tendance est à surveiller.', cta: 'Répondre aux avis', href: 'Avis.html' },
];

function hnScenario(key) {
  if (key === 'vide') return [];
  if (key === 'lues') return HN_ALL.map(n => ({ ...n, unread: false }));
  if (key === 'afflux') return [...HN_AFFLUX.map(n => ({ ...n })), ...HN_ALL.map(n => ({ ...n }))];
  if (key === 'supprime') return HN_ALL.filter(n => n.gone || n.day <= 1).map(n => ({ ...n }));
  return HN_ALL.map(n => ({ ...n }));
}

Object.assign(window, { HN_KINDS, HN_DAYS, HN_UNREAD_MAX, HN_ALL, HN_AFFLUX, hnScenario });
