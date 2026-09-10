/* HuntPilote — Recherche globale : index cherchable, récents et actions rapides. Partagé par tous les écrans. */
const HS_TYPES = {
  action: { label: 'Action rapide', tone: 'violet', plural: 'Actions rapides' },
  client: { label: 'Client', tone: 'green', plural: 'Clients et prospects' },
  prospect: { label: 'Prospect', tone: 'blue', plural: 'Clients et prospects' },
  tache: { label: 'Tâche', tone: 'blue', plural: 'Tâches' },
  priorite: { label: 'Priorité', tone: 'red', plural: 'Priorités' },
  motcle: { label: 'Mot-clé suivi', tone: 'yellow', plural: 'Mots-clés suivis' },
  rapport: { label: 'Rapport', tone: 'neutral', plural: 'Rapports' },
  etab: { label: 'Établissement', tone: 'green', plural: 'Établissements' },
  facture: { label: 'Facture', tone: 'yellow', plural: 'Factures' },
};
/* Ordre d'affichage des groupes : les actions d'abord, c'est un lanceur avant d'être une liste. */
const HS_GROUPS = ['action', 'clients', 'tache', 'priorite', 'motcle', 'rapport', 'etab', 'facture'];
const HS_GROUP_LABEL = { action: 'Actions rapides', clients: 'Clients et prospects', tache: 'Tâches', priorite: 'Priorités', motcle: 'Mots-clés suivis', rapport: 'Rapports', etab: 'Établissements', facture: 'Factures' };
const HS_GROUP_OF = t => (t === 'client' || t === 'prospect') ? 'clients' : t;

const HS_ACTIONS = [
  { id: 'A1', type: 'action', label: 'Nouveau client', sub: 'Ouvre l’intégration en 4 étapes', href: 'Onboarding.html', kw: 'nouveau client ajouter creer compte onboarding' },
  { id: 'A2', type: 'action', label: 'Lancer un audit', sub: 'Présence en ligne, SEO, design', href: 'Audit Detail.html', kw: 'lancer audit auditer analyser scan' },
  { id: 'A3', type: 'action', label: 'Aller aux priorités critiques', sub: 'Tout le portefeuille, triées par sévérité', href: 'Priorites Transversales.html', kw: 'priorites critiques transversales urgent severite' },
  { id: 'A4', type: 'action', label: 'Ouvrir mon plan de travail', sub: 'Mes tâches groupées par échéance', href: 'Mon Plan de Travail.html', kw: 'plan travail taches mes echeances' },
  { id: 'A5', type: 'action', label: 'Voir les rapports à produire', sub: 'État du cycle mensuel', href: 'Rapports a Produire.html', kw: 'rapports produire cycle mensuel livrables' },
  { id: 'A6', type: 'action', label: 'Ouvrir l’agenda de la semaine', sub: 'Échéances, envois, rendez-vous', href: 'Agenda.html', kw: 'agenda calendrier semaine rendez-vous' },
  { id: 'A7', type: 'action', label: 'Nouvelle tâche', sub: 'Rattachée à une priorité existante', href: 'Tache Detail.html', kw: 'nouvelle tache creer ajouter todo' },
];

const HS_INDEX = [
  { id: 'C1', type: 'client', label: 'Acme Corp.', sub: 'Forfait Croissance · score 92 · Marie Chen', href: 'Fiche Client v4.html' },
  { id: 'C2', type: 'client', label: 'Bistro Le Chalet', sub: 'Forfait Croissance · score 74 · Marie Chen', href: 'Fiche Client v4.html' },
  { id: 'C3', type: 'client', label: 'Toiture Lavoie', sub: 'Forfait Croissance · score 61 · Marc Tremblay', href: 'Fiche Client v4.html' },
  { id: 'C4', type: 'client', label: 'Clinique DentAlex', sub: 'Forfait Croissance · score 88 · Marie Chen', href: 'Fiche Client v4.html' },
  { id: 'C5', type: 'client', label: 'Groupe Immobilier Rousseau', sub: 'Forfait Sur mesure · score 79 · Marc Tremblay', href: 'Fiche Client v4.html' },
  { id: 'C6', type: 'client', label: 'Garage Pelletier', sub: 'Forfait Croissance · score 70 · Marc Tremblay', href: 'Fiche Client v4.html' },
  { id: 'C7', type: 'client', label: 'Physio Saint-Roch', sub: 'Forfait Essentiel · score 66 · Julie Bergeron', href: 'Fiche Client v4.html' },
  { id: 'C8', type: 'client', label: 'Dépanneur Lachine', sub: 'Forfait Essentiel · score 58 · Julie Bergeron', href: 'Fiche Client v4.html' },
  { id: 'P1', type: 'prospect', label: 'Boulangerie Trois-Rivières', sub: 'Pipeline · proposition envoyée · 14 400 $', href: 'Pipeline.html' },
  { id: 'P2', type: 'prospect', label: 'Clinique podiatrique Laval', sub: 'Pipeline · audit de prospection fait', href: 'Audit Prospect.html' },
  { id: 'P3', type: 'prospect', label: 'Traiteur Beauport', sub: 'Pipeline · premier contact · 8 900 $', href: 'Pipeline.html' },

  { id: 'T142', type: 'tache', label: 'Corriger les 23 liens brisés', sub: 'Acme Corp. · tâche #142 · terminée le 7 sept.', href: 'Tache Detail.html' },
  { id: 'T143', type: 'tache', label: 'Rendre les 23 pages orphelines accessibles', sub: 'Acme Corp. · tâche #143 · échéance 10 sept.', href: 'Tache Detail.html' },
  { id: 'T158', type: 'tache', label: 'Publier le troisième guide longue traîne', sub: 'Groupe Rousseau · tâche #158 · échéance 11 sept.', href: 'Tache Detail.html' },
  { id: 'T171', type: 'tache', label: 'Renouveler le certificat SSL expiré', sub: 'Toiture Lavoie · tâche #171 · en retard', href: 'Tache Detail.html' },
  { id: 'T174', type: 'tache', label: 'Relire les 2 libellés du rapport d’août', sub: 'Bistro Le Chalet · tâche #174 · échéance 9 sept.', href: 'Editeur Rapport.html' },
  { id: 'T177', type: 'tache', label: 'Réécrire les métadonnées de 18 pages', sub: 'Bistro Le Chalet · tâche #177 · échéance 17 sept.', href: 'Tache Detail.html' },
  { id: 'T181', type: 'tache', label: 'Corriger le formulaire de contact mobile', sub: 'Groupe Rousseau · tâche #181 · échéance 18 sept.', href: 'Tache Detail.html' },
  { id: 'T186', type: 'tache', label: 'Livrer la refonte des pages quartiers', sub: 'Groupe Rousseau · tâche #186 · échéance 24 sept.', href: 'Tache Detail.html' },

  { id: 'P-0611', type: 'priorite', label: 'Certificat SSL expiré depuis 4 jours', sub: 'Toiture Lavoie · critique · présence en ligne', href: 'Priorite Detail.html' },
  { id: 'P-0655', type: 'priorite', label: 'Site désindexé par Google depuis la migration', sub: 'Groupe Rousseau · critique · SEO', href: 'Priorite Detail.html' },
  { id: 'P-0588', type: 'priorite', label: 'robots.txt bloque 80 % du site à l’indexation', sub: 'Clinique DentAlex · critique · SEO', href: 'Priorite Detail.html' },
  { id: 'P-0418', type: 'priorite', label: 'LCP mobile à 4,2 s sur 6 pages stratégiques', sub: 'Acme Corp. · critique · SEO · en traitement', href: 'Priorite Detail.html' },
  { id: 'P-0503', type: 'priorite', label: 'Note Google en baisse : 4,1 vs 4,6', sub: 'Bistro Le Chalet · important · présence en ligne', href: 'Priorite Detail.html' },
  { id: 'P-0344', type: 'priorite', label: 'Site non responsive sur tablette', sub: 'Toiture Lavoie · important · design', href: 'Priorite Detail.html' },

  { id: 'K1', type: 'motcle', label: 'toiture montréal', sub: 'Toiture Lavoie · position 7 · 1 300 rech./mois', href: 'Position Tracking.html' },
  { id: 'K2', type: 'motcle', label: 'réparation toiture urgence', sub: 'Toiture Lavoie · position 14 · 480 rech./mois', href: 'Position Tracking.html' },
  { id: 'K3', type: 'motcle', label: 'dentiste laval urgence', sub: 'Clinique DentAlex · position 3 · 2 100 rech./mois', href: 'Position Tracking.html' },
  { id: 'K4', type: 'motcle', label: 'restaurant fondue québec', sub: 'Bistro Le Chalet · position 5 · 890 rech./mois', href: 'Position Tracking.html' },
  { id: 'K5', type: 'motcle', label: 'condo neuf rive-sud', sub: 'Groupe Rousseau · position 11 · 1 600 rech./mois', href: 'Position Tracking.html' },
  { id: 'K6', type: 'motcle', label: 'physiothérapeute saint-roch', sub: 'Physio Saint-Roch · position 2 · 320 rech./mois', href: 'Position Tracking.html' },
  { id: 'K7', type: 'motcle', label: 'couvreur rive-nord prix', sub: 'Toiture Lavoie · position 22 · 260 rech./mois', href: 'Position Tracking.html' },

  { id: 'R1', type: 'rapport', label: 'Rapport de septembre 2026 — Acme Corp.', sub: 'Brouillon · 4 preuves retenues', href: 'Editeur Rapport.html' },
  { id: 'R2', type: 'rapport', label: 'Rapport d’août 2026 — Bistro Le Chalet', sub: 'Bloqué par une relecture · 2 libellés', href: 'Editeur Rapport.html' },
  { id: 'R3', type: 'rapport', label: 'Rapport d’août 2026 — Acme Corp.', sub: 'Publié le 2 septembre · v1 en ligne', href: 'Editeur Rapport.html' },
  { id: 'R4', type: 'rapport', label: 'Rapport d’août 2026 — Garage Pelletier', sub: 'Publié puis corrigé (v2)', href: 'Editeur Rapport.html' },

  { id: 'E1', type: 'etab', label: 'Toiture Lavoie — Laval', sub: 'Fiche Google · 4,3 ★ · 128 avis', href: 'Fiche Etablissement.html' },
  { id: 'E2', type: 'etab', label: 'Bistro Le Chalet — Québec', sub: 'Fiche Google · 4,1 ★ · 342 avis', href: 'Fiche Etablissement.html' },
  { id: 'E3', type: 'etab', label: 'Clinique DentAlex — Laval', sub: 'Fiche Google · 4,8 ★ · 96 avis', href: 'Fiche Etablissement.html' },
  { id: 'E4', type: 'etab', label: 'Physio Saint-Roch — Québec', sub: 'Fiche Google · 4,6 ★ · 74 avis', href: 'Fiche Etablissement.html' },

  { id: 'F1', type: 'facture', label: 'Facture 2026-0431 — Toiture Lavoie', sub: '1 850 $ · en retard de 12 jours', href: 'Client Hub.html' },
  { id: 'F2', type: 'facture', label: 'Facture 2026-0428 — Bistro Le Chalet', sub: '2 400 $ · payée le 3 septembre', href: 'Client Hub.html' },
  { id: 'F3', type: 'facture', label: 'Facture 2026-0440 — Acme Corp.', sub: '4 200 $ · envoyée, échéance 20 sept.', href: 'Client Hub.html' },
];

const HS_RECENT_IDS = ['C1', 'P-0611', 'T174', 'R2', 'K3'];

const hsNorm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function hsSearch(q) {
  const n = hsNorm(q.trim());
  if (!n) return [];
  const terms = n.split(/\s+/);
  const score = it => {
    const hay = hsNorm(`${it.label} ${it.sub || ''} ${it.kw || ''} ${it.id}`);
    if (!terms.every(t => hay.includes(t))) return 0;
    const lab = hsNorm(it.label);
    return lab.startsWith(n) ? 3 : lab.includes(n) ? 2 : 1;
  };
  return [...HS_ACTIONS, ...HS_INDEX].map(it => [it, score(it)]).filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]).map(([it]) => it);
}
const hsRecents = () => HS_RECENT_IDS.map(id => HS_INDEX.find(x => x.id === id)).filter(Boolean);

Object.assign(window, { HS_TYPES, HS_GROUPS, HS_GROUP_LABEL, HS_GROUP_OF, HS_ACTIONS, HS_INDEX, hsSearch, hsRecents, hsNorm });
