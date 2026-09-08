# Session 3.1 — SEO local : vue d'ensemble et fiche d'établissement

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français.

L'application repose sur une boucle : **Audit → Priorité → Tâche → Preuve de
valeur → Rapport client**. L'audit couvre trois dimensions — présence en ligne,
SEO, design. Une priorité appartient toujours à l'une des trois.

> **Le SEO local est une section complète**, au même niveau que les outils SEO.
> Elle a sa propre entrée dans la barre latérale, ses propres déclencheurs
> d'automatisation et ses propres indicateurs dans le rapport client.

---

## Deux écrans

1. **Vue d'ensemble locale**, route `/local`
2. **Fiche d'établissement**, route `/local/[etab]`

Un client peut avoir plusieurs établissements. La vue d'ensemble couvre tout le
portefeuille.

---

## Vue d'ensemble

*Quel établissement demande mon attention aujourd'hui ?*

- La **liste des établissements suivis**, avec pour chacun : client rattaché, score
  local, note moyenne, nombre d'avis sans réponse, incohérences de citations,
  position moyenne dans le pack local.
- Ce qui **demande une action** en tête : avis négatif sans réponse, fiche
  suspendue, chute de position, incohérence détectée.
- Tri et filtres par client, par score, par urgence.

---

## Fiche d'établissement

### L'état de la fiche Google Business

Complétude — chaque champ manquant est une action possible : catégories, horaires
(dont horaires spéciaux), photos, description, services, zone desservie, attributs.
Affiche un pourcentage de complétude **et** la liste de ce qui manque.

### L'éditeur de zone desservie

**C'est l'élément le plus important de cet écran.** La zone se règle par
établissement — elle dépend de ce que le commerce dessert et d'où il se trouve. Un
réglage global ne tiendrait pas.

Trois modes à prévoir :

- **Point et rayon** — le plus simple, pour un commerce de quartier
- **Liste de secteurs** — villes, arrondissements, codes postaux
- **Grille de points** — pour mesurer finement la variation du pack local

La densité de la grille détermine le coût des relevés : affiche l'estimation en
même temps que le réglage.

### Le reste de la fiche

Publications Google récentes, questions-réponses sans réponse, statistiques
(appels, itinéraires, visites du site), et l'accès aux trois écrans liés — avis,
citations, positions.

## États à prévoir

- Établissement sans fiche Google Business revendiquée
- Fiche suspendue ou en attente de validation
- Fiche revendiquée par un tiers — cas fréquent et bloquant
- Zone jamais configurée : l'écran doit y conduire
- Client sans aucun établissement

## Ce qu'il ne faut pas faire

- Ne pas traiter la zone comme un réglage secondaire enfoui dans un panneau.
- Ne pas afficher un score de complétude sans dire ce qui manque.
