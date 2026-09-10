/**
 * Notifications — ce que les automatisations et l'agent produisent
 * (session 4.3). Partagé par tout écran du cockpit.
 *
 * Reste piloté par un sélecteur de scénario de démo, comme le
 * sélecteur « Démo · état » des 7 outils déjà livrés. Les comptes
 * cités sont de vrais enregistrements `CLIENTS`, jamais des noms
 * inventés.
 */

import { CLIENTS } from '@/lib/data/clients';
import { routes } from '@/lib/routes';

export type NotifKindId = 'integration' | 'position' | 'sante' | 'facture' | 'liens' | 'avis' | 'rapport' | 'deal' | 'agent';

export const HN_KINDS: Record<NotifKindId, { label: string; tone: 'red' | 'yellow' | 'green' | 'violet'; crit?: boolean; source: string }> = {
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

export const HN_DAYS: [number, string][] = [
  [0, "Aujourd'hui"],
  [1, 'Hier'],
  [2, 'Lundi 7 septembre'],
  [5, 'Plus tôt cette semaine'],
];

/** Seuil : au-delà, la pastille affiche « 20+ ». */
export const HN_UNREAD_MAX = 20;

export type Notif = {
  id: string;
  kind: NotifKindId;
  day: number;
  at: string;
  unread: boolean;
  title: string;
  body: string;
  cta?: string;
  href?: string;
  /** Objet supprimé : la notification survit à son objet, elle ne mène plus nulle part. */
  gone?: boolean;
  goneNote?: string;
};

const CLIENT_IDS = CLIENTS.filter((c) => c.type === 'client').map((c) => c.id);
const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;
const [C1, C2, C3, C4, C5] = CLIENT_IDS;
const PROSPECT_IDS = CLIENTS.filter((c) => c.type === 'prospect').map((c) => c.id);
const [P1] = PROSPECT_IDS;

export const HN_ALL: Notif[] = [
  { id: 'N1', kind: 'integration', day: 0, at: '08 h 12', unread: true, title: `Jeton Google Search Console expiré — ${clientName(C3)}`, body: 'Aucune donnée de position ni d’indexation ne remonte depuis 3 jours. Le relevé hebdomadaire de ce client est vide.', cta: "Reconnecter l'intégration", href: routes.parametres('integrations') },
  { id: 'N2', kind: 'sante', day: 0, at: '08 h 05', unread: true, title: `Score de santé de ${clientName(C3)} passé à 61`, body: "Sous le seuil d'alerte de 70 fixé pour le forfait Croissance. Deux priorités critiques sont ouvertes sur ce compte.", cta: 'Ouvrir la fiche client', href: routes.client(C3) },
  { id: 'N3', kind: 'position', day: 0, at: '07 h 58', unread: true, title: '« couvreur rive-nord prix » chute de la 12ᵉ à la 22ᵉ place', body: 'Perte de 10 places en une semaine sur un mot-clé à 260 recherches par mois. Un concurrent a publié une page dédiée.', cta: 'Ouvrir le suivi de positions', href: routes.outil('position-tracking') },
  { id: 'N4', kind: 'avis', day: 0, at: '07 h 41', unread: true, title: `Nouvel avis 1 ★ sur la fiche de ${clientName(C2)}`, body: '« Service très lent, deux plats manquants. » La note moyenne passe de 4,2 à 4,1 — sous le seuil de 4,2 convenu au mandat.', cta: "Répondre à l'avis", href: routes.local() },
  { id: 'N5', kind: 'facture', day: 0, at: '06 h 30', unread: true, title: 'Facture 2026-0431 en retard de 12 jours', body: `1 850 $ dus par ${clientName(C3)}. Deux relances automatiques déjà envoyées, sans réponse.`, cta: 'Ouvrir le dossier de facturation', href: routes.client(C3) },
  { id: 'N6', kind: 'rapport', day: 0, at: '06 h 00', unread: false, title: `Rapport de septembre généré pour ${clientName(C1)}`, body: "La synthèse est rédigée et 4 preuves de valeur sont retenues. Rien n'est visible du client avant publication.", cta: "Ouvrir l'éditeur", href: routes.rapport(C1, '2026-09') },

  { id: 'N7', kind: 'liens', day: 1, at: '19 h 22', unread: true, title: `23 liens brisés découverts sur ${clientName(C1)}`, body: "Détectés par l'audit automatique du soir. Une priorité a été créée et rattachée à la dimension SEO.", cta: 'Ouvrir la priorité', href: routes.priorite(C1, 'p-0418') },
  { id: 'N8', kind: 'deal', day: 1, at: '16 h 04', unread: false, title: `Deal gagné — ${clientName(P1)}`, body: "14 400 $ par an, forfait Croissance. L'intégration en 4 étapes est prête à démarrer.", cta: "Lancer l'intégration", href: '/onboarding' },
  { id: 'N9', kind: 'agent', day: 1, at: '14 h 47', unread: false, title: `L'agent propose 3 preuves de valeur pour ${clientName(C4)}`, body: "Trois tâches clôturées ce mois-ci n'avaient pas de preuve rédigée. Les brouillons sont prêts à relire.", cta: 'Relire les preuves proposées', href: routes.rapport(C4, '2026-09') },
  { id: 'N10', kind: 'rapport', day: 1, at: '09 h 15', unread: false, title: `Rapport d'août envoyé à ${clientName(C5)}`, body: 'Version 2 en ligne après correction du chiffre de vitesse. Le lien client affiche désormais la v2.', cta: 'Voir la page du client', href: routes.client(C5) },

  { id: 'N11', kind: 'position', day: 2, at: '08 h 03', unread: false, title: `« dentiste laval urgence » gagne 2 places — 3ᵉ position`, body: `${clientName(C4)} entre dans le top 3 sur un mot-clé à 2 100 recherches par mois.`, cta: 'Ouvrir le suivi de positions', href: routes.outil('position-tracking') },
  { id: 'N12', kind: 'avis', day: 2, at: '11 h 28', unread: false, title: `4 nouveaux avis sur la fiche de ${clientName(C4)}`, body: 'Moyenne 4,8 ★ sur 96 avis. Aucun avis négatif à traiter.', cta: 'Voir les avis', href: routes.local() },
  { id: 'N13', kind: 'liens', day: 5, at: '21 h 10', unread: false, title: `4 pages en 404 découvertes sur ${clientName(C5)}`, body: 'Rattachées à la priorité existante sur le maillage des pages quartiers.', cta: 'Ouvrir la priorité', href: routes.priorite(C5, 'p-0655') },

  { id: 'N14', kind: 'rapport', day: 1, at: '10 h 02', unread: false, title: `Rapport de juillet supprimé — ${clientName(C2)}`, body: 'Le brouillon a été supprimé avant publication.', gone: true, goneNote: "L'objet de cette notification n'existe plus : le brouillon a été supprimé." },
];

/** Afflux : un audit de portefeuille produit une salve de notifications d'un coup. */
export const HN_AFFLUX: Notif[] = [
  { id: 'X1', kind: 'liens', day: 0, at: '05 h 12', unread: true, title: `48 pages en 404 découvertes sur ${clientName(C2)}`, body: 'Audit de portefeuille terminé à 5 h 12. Une priorité critique a été créée.', cta: 'Ouvrir la priorité', href: routes.priorite(C2, 'p-0503') },
  { id: 'X2', kind: 'sante', day: 0, at: '05 h 12', unread: true, title: `Score de santé de ${clientName(C5)} passé à 58`, body: "Sous le seuil d'alerte de 70. Aucune priorité n'est encore assignée sur ce compte.", cta: 'Ouvrir la fiche client', href: routes.client(C5) },
  { id: 'X3', kind: 'liens', day: 0, at: '05 h 11', unread: true, title: `12 balises title dupliquées sur ${clientName(C4)}`, body: 'Priorité importante créée sur la dimension SEO.', cta: 'Ouvrir la priorité', href: routes.priorite(C4, 'p-0588') },
  { id: 'X4', kind: 'position', day: 0, at: '05 h 10', unread: true, title: `9 mots-clés perdent plus de 5 places — ${clientName(C5)}`, body: 'Chute simultanée après la migration du site. À rapprocher de la priorité de désindexation.', cta: 'Ouvrir le suivi de positions', href: routes.outil('position-tracking') },
  { id: 'X5', kind: 'integration', day: 0, at: '05 h 09', unread: true, title: `Jeton Google Analytics expiré — ${clientName(C5)}`, body: 'Le rapport du mois ne pourra pas remonter le trafic organique sans reconnexion.', cta: "Reconnecter l'intégration", href: routes.parametres('integrations') },
  { id: 'X6', kind: 'avis', day: 0, at: '05 h 08', unread: true, title: `2 nouveaux avis 2 ★ sur la fiche de ${clientName(C3)}`, body: 'La note moyenne passe de 4,4 à 4,3 — au-dessus du seuil de 4,2, mais la tendance est à surveiller.', cta: 'Répondre aux avis', href: routes.local() },
];

export type NotifScenario = 'normal' | 'afflux' | 'lues' | 'supprime' | 'vide';

export const N_SCENARIOS: [NotifScenario, string][] = [
  ['normal', 'Vue normale'],
  ['afflux', 'Afflux après un audit'],
  ['lues', 'Tout est lu'],
  ['supprime', 'Objet supprimé'],
  ['vide', 'Aucune notification'],
];

export function hnScenario(key: NotifScenario): Notif[] {
  if (key === 'vide') return [];
  if (key === 'lues') return HN_ALL.map((n) => ({ ...n, unread: false }));
  if (key === 'afflux') return [...HN_AFFLUX.map((n) => ({ ...n })), ...HN_ALL.map((n) => ({ ...n }))];
  if (key === 'supprime') return HN_ALL.filter((n) => n.gone || n.day <= 1).map((n) => ({ ...n }));
  return HN_ALL.map((n) => ({ ...n }));
}
